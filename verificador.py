"""
Yunta · verificador de identidad en el servidor (DeepFace).

Qué hace: cuando un proveedor envía su verificación, la app llama a POST /verificar con su sesión.
Este servicio descarga la foto del DNI y la selfie del almacenamiento privado de Supabase,
compara los rostros con DeepFace (licencia MIT), revisa que la selfie no sea una foto de una foto
(anti-spoofing) y guarda el resultado. Si todo pasa, aprueba DNI y rostro; el CUL sigue a revisión humana.

Por qué en el servidor: lo que corre en el celular se puede manipular; aquí no.

Instalar y correr (necesita Python 3.10+):
    pip install -r verificador-requirements.txt
    export SUPABASE_URL=https://xxxx.supabase.co
    export SUPABASE_SERVICE_ROLE_KEY=...      # solo en el servidor, nunca en la app
    export PARECIDO_MIN=0.55                   # mismo umbral que config.js
    uvicorn verificador:app --host 0.0.0.0 --port 8080

Desplegar: con Dockerfile.verificador en cualquier servicio de contenedores (Cloud Run, Fly.io, Render, Railway).
Luego pon la URL pública en config.js → BIOMETRIA.VERIFICADOR_URL.
"""
import os
import tempfile
from datetime import datetime, timezone

import requests
from deepface import DeepFace
from fastapi import FastAPI, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from verificador_cul import verificar_cul

SUPABASE_URL = os.environ["SUPABASE_URL"].rstrip("/")
SERVICE_KEY = os.environ["SUPABASE_SERVICE_ROLE_KEY"]
PARECIDO_MIN = float(os.environ.get("PARECIDO_MIN", "0.55"))
MODELO = os.environ.get("MODELO", "Facenet512")       # MIT/Apache; no usar modelos de InsightFace sin licencia
DETECTOR = os.environ.get("DETECTOR", "retinaface")

app = FastAPI(title="Yunta verificador")
app.add_middleware(CORSMiddleware, allow_origins=[o for o in os.environ.get("ORIGENES", "https://itzelysium.github.io").split(",")],
                   allow_methods=["POST"], allow_headers=["Authorization", "Content-Type"])

ADMIN = {"apikey": SERVICE_KEY, "Authorization": f"Bearer {SERVICE_KEY}"}


def usuario_de(token: str) -> str:
    r = requests.get(f"{SUPABASE_URL}/auth/v1/user", headers={"apikey": SERVICE_KEY, "Authorization": token}, timeout=10)
    if r.status_code != 200:
        raise HTTPException(401, "Sesión inválida")
    return r.json()["id"]


def filas(user_id: str):
    r = requests.get(f"{SUPABASE_URL}/rest/v1/verifications",
                     params={"user_id": f"eq.{user_id}", "status": "eq.pendiente", "select": "*"}, headers=ADMIN, timeout=10)
    r.raise_for_status()
    return {f["kind"]: f for f in r.json()}


def descargar(path: str) -> str:
    r = requests.get(f"{SUPABASE_URL}/storage/v1/object/verificaciones/{path}", headers=ADMIN, timeout=30)
    r.raise_for_status()
    f = tempfile.NamedTemporaryFile(delete=False, suffix=".jpg")
    f.write(r.content)
    f.close()
    return f.name


def actualizar(fila_id: str, datos: dict):
    r = requests.patch(f"{SUPABASE_URL}/rest/v1/verifications", params={"id": f"eq.{fila_id}"},
                       headers={**ADMIN, "Content-Type": "application/json", "Prefer": "return=minimal"}, json=datos, timeout=10)
    r.raise_for_status()


@app.post("/verificar")
def verificar(authorization: str = Header(...)):
    user_id = usuario_de(authorization)
    f = filas(user_id)
    if "dni" not in f or "selfie" not in f or not f["dni"].get("file_path") or not f["selfie"].get("file_path"):
        raise HTTPException(400, "Faltan la foto del DNI o la selfie")

    dni_img = descargar(f["dni"]["file_path"])
    selfie_img = descargar(f["selfie"]["file_path"])
    motivos = []

    # 1) ¿La selfie es una persona real? (anti-spoofing)
    real = None
    try:
        caras = DeepFace.extract_faces(img_path=selfie_img, detector_backend=DETECTOR, anti_spoofing=True)
        real = float(caras[0].get("antispoof_score", 0)) if caras and caras[0].get("is_real") else 0.0
        if not caras or not caras[0].get("is_real"):
            motivos.append("La selfie parece una foto o una pantalla")
    except ValueError:
        motivos.append("No encontramos un rostro en la selfie")

    # 2) ¿Es la misma persona que el DNI?
    parecido = None
    try:
        r = DeepFace.verify(img1_path=dni_img, img2_path=selfie_img, model_name=MODELO, detector_backend=DETECTOR)
        # distancia → parecido 0..1 relativo al umbral del modelo
        parecido = max(0.0, 1 - r["distance"] / (2 * r["threshold"]))
        if not r["verified"] or parecido < PARECIDO_MIN:
            motivos.append("La selfie no coincide con la foto del DNI")
    except ValueError:
        motivos.append("No encontramos el rostro en la foto del DNI")

    # 3) Prueba de vida con desafíos hecha en la app
    if not f["selfie"].get("liveness_passed"):
        motivos.append("Falta la prueba de vida con cámara")

    decision = "aprobado" if not motivos else "revision"

    # 4) CUL: firma digital del Ministerio, datos, QR y antecedentes (sin intervención humana)
    cul_res = None
    if "cul" in f and f["cul"].get("file_path"):
        priv = requests.get(f"{SUPABASE_URL}/rest/v1/provider_private", params={"user_id": f"eq.{user_id}", "select": "dni"}, headers=ADMIN, timeout=10).json()
        perfil = requests.get(f"{SUPABASE_URL}/rest/v1/profiles", params={"id": f"eq.{user_id}", "select": "full_name"}, headers=ADMIN, timeout=10).json()
        cul_pdf = descargar(f["cul"]["file_path"])
        cul_res = verificar_cul(open(cul_pdf, "rb").read(), (priv[0]["dni"] if priv else ""), (perfil[0]["full_name"] if perfil else ""))
        os.unlink(cul_pdf)
        actualizar(f["cul"]["id"], {"checked_by": "firma_digital", "auto_decision": cul_res["decision"],
                                    "notes": ". ".join(cul_res["motivos"]) or None, "reviewed_at": datetime.now(timezone.utc).isoformat(),
                                    **({"status": "aprobado"} if cul_res["decision"] == "aprobado" else {})})
    comun = {"checked_by": "deepface", "auto_decision": decision, "reviewed_at": datetime.now(timezone.utc).isoformat()}
    actualizar(f["selfie"]["id"], {**comun, "face_match_score": round(parecido, 3) if parecido is not None else None,
                                   "antispoof_score": round(real, 3) if real is not None else None,
                                   "notes": ". ".join(motivos) or None,
                                   **({"status": "aprobado"} if decision == "aprobado" else {})})
    actualizar(f["dni"]["id"], {**comun, **({"status": "aprobado"} if decision == "aprobado" else {})})
    for p in (dni_img, selfie_img):
        os.unlink(p)
    # Si DNI, rostro y CUL quedaron aprobados, se publican sus anuncios
    if decision == "aprobado" and cul_res and cul_res["decision"] == "aprobado" and "colegiatura" not in f:
        requests.patch(f"{SUPABASE_URL}/rest/v1/services", params={"provider_id": f"eq.{user_id}"},
                       headers={**ADMIN, "Content-Type": "application/json", "Prefer": "return=minimal"}, json={"is_active": True}, timeout=10)
    return {"decision": decision, "parecido": parecido, "real": real, "motivos": motivos,
            "cul": {k: cul_res[k] for k in ("decision", "motivos", "numero", "emision")} if cul_res else None}


@app.get("/salud")
def salud():
    return {"ok": True, "modelo": MODELO}
