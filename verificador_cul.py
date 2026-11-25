"""
Yunta · verificación automática del Certificado Único Laboral (CUL).

El CUL que descarga cada persona en Empleos Perú es un PDF con FIRMA DIGITAL del Ministerio de Trabajo
(certificado emitido por RENIEC). Si alguien cambia una sola letra del PDF, la firma deja de ser válida.
Por eso podemos verificarlo sin intervención humana:

  1. Firma digital válida, que cubre TODO el documento, del Ministerio de Trabajo (RUC 20131023414).
  2. Texto del certificado: número, DNI, nombres, fechas de emisión y caducidad, y los tres antecedentes.
  3. QR: debe apuntar a empleosperu.gob.pe con el mismo número de CUL y DNI.
  4. Cruces: DNI y nombre iguales a los del DNI del proveedor; menos de 90 días; sin antecedentes.

Uso suelto (para probar):  python verificador_cul.py certificado.pdf 12345678
Requisitos: pyhanko, pyhanko-certvalidator, pypdf, pypdfium2, opencv-python-headless (ver verificador-requirements.txt).
"""
import io
import re
import sys
import unicodedata
from datetime import datetime, timedelta, timezone
from urllib.parse import urlparse, parse_qs

MTPE_RUC = "20131023414"
VIGENCIA_DIAS = 90
MESES = {m: i + 1 for i, m in enumerate(["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio",
                                          "agosto", "septiembre", "octubre", "noviembre", "diciembre"])}
MESES["setiembre"] = 9


def _norm(s: str) -> str:
    return unicodedata.normalize("NFD", s or "").encode("ascii", "ignore").decode().upper().strip()


# ---------------------------------------------------------------- 1. Firma digital
def revisar_firma(pdf_bytes: bytes) -> dict:
    """Devuelve si la firma es válida, cubre todo el documento y es del Ministerio de Trabajo."""
    from pyhanko.pdf_utils.reader import PdfFileReader
    from pyhanko.sign.validation import validate_pdf_signature
    from pyhanko_certvalidator import ValidationContext

    r = PdfFileReader(io.BytesIO(pdf_bytes))
    firmas = r.embedded_signatures
    if not firmas:
        return {"ok": False, "motivo": "El PDF no tiene firma digital"}
    sig = firmas[-1]
    # Sin la raíz de RENIEC instalada la cadena queda "desconocida"; la integridad igual se verifica.
    # Para validar la cadena completa, agrega los certificados raíz e intermedio de RENIEC en trust_roots.
    estado = validate_pdf_signature(sig, ValidationContext(allow_fetching=False))
    sujeto = sig.signer_cert.subject.human_friendly
    del_mtpe = MTPE_RUC in sujeto and "TRABAJO" in _norm(sujeto)
    return {
        "ok": bool(estado.intact and estado.valid and del_mtpe and estado.coverage.name in ("ENTIRE_FILE", "ENTIRE_REVISION")),
        "intacta": bool(estado.intact and estado.valid),
        "cubre_todo": estado.coverage.name,
        "firmante": sujeto,
        "del_mtpe": del_mtpe,
        "fecha_firma": estado.signer_reported_dt.isoformat() if estado.signer_reported_dt else None,
    }


# ---------------------------------------------------------------- 2. Texto
def texto_pdf(pdf_bytes: bytes) -> str:
    from pypdf import PdfReader
    return "\n".join((p.extract_text() or "") for p in PdfReader(io.BytesIO(pdf_bytes)).pages)


def _fecha(txt: str):
    m = re.search(r"([A-Za-zÁÉÍÓÚáéíóú]+)\s+(\d{1,2}),\s*(\d{4})", txt or "")
    if not m or _norm(m.group(1)).lower() not in MESES:
        return None
    return datetime(int(m.group(3)), MESES[_norm(m.group(1)).lower()], int(m.group(2)))


def leer_datos(texto: str) -> dict:
    t = re.sub(r"[ \t]+", " ", texto)
    campo = lambda etiqueta: (re.search(etiqueta + r"\s*:\s*(.+)", t) or [None, None])[1]
    numero = re.search(r"\b(20\d{9})\b", t)
    emision = re.search(r"Fecha de emisi[oó]n:\s*\n?\s*([^\n]+)", t)
    caduca = re.search(r"Fecha de caducidad:\s*\n?\s*([^\n]+)", t)

    def antecedente(fuente):
        m = re.search(r"ANTECEDENTES " + fuente + r"[^\n]*\n\s*([^\n]+)", t, re.I)
        return m.group(1).strip() if m else None

    return {
        "numero": numero.group(1) if numero else None,
        "nombres": (campo("Nombres") or "").strip(),
        "apellidos": (campo("Apellidos") or "").strip(),
        "dni": (re.search(r"N° de documento\s*:\s*(\d{8})", t) or [None, None])[1],
        "emision": _fecha(emision.group(1)) if emision else None,
        "caducidad": _fecha(caduca.group(1)) if caduca else None,
        "policiales": antecedente("POLICIALES"),
        "judiciales": antecedente("JUDICIALES"),
        "penales": antecedente("PENALES"),
    }


# ---------------------------------------------------------------- 3. QR
def leer_qr(pdf_bytes: bytes):
    import cv2
    import numpy as np
    import pypdfium2 as pdfium
    pagina = pdfium.PdfDocument(pdf_bytes)[0]
    img = pagina.render(scale=2.5).to_pil().convert("RGB")
    val, _, _ = cv2.QRCodeDetector().detectAndDecode(cv2.cvtColor(np.array(img), cv2.COLOR_RGB2BGR))
    return val or None


def revisar_qr(url: str, numero: str, dni: str) -> dict:
    if not url:
        return {"ok": False, "motivo": "No se pudo leer el QR"}
    u = urlparse(url)
    q = parse_qs(u.query)
    ok = (u.scheme == "https" and u.hostname == "www.empleosperu.gob.pe"
          and q.get("cul", [None])[0] == numero and q.get("numdoc", [None])[0] == dni)
    return {"ok": ok, "url": url}


# ---------------------------------------------------------------- 4. Decisión
def verificar_cul(pdf_bytes: bytes, dni_esperado: str, nombre_esperado: str = "", hoy=None) -> dict:
    hoy = hoy or datetime.now(timezone.utc).replace(tzinfo=None)
    motivos = []
    try:
        firma = revisar_firma(pdf_bytes)
    except Exception as e:  # sin pyhanko o PDF dañado
        firma = {"ok": False, "motivo": f"No se pudo revisar la firma: {e}"}
    if not firma.get("ok"):
        motivos.append(firma.get("motivo") or "La firma digital del Ministerio no es válida o el PDF fue modificado")

    d = leer_datos(texto_pdf(pdf_bytes))
    if d["dni"] != dni_esperado:
        motivos.append("El DNI del CUL no coincide con el del proveedor")
    if nombre_esperado:
        palabras = [w for w in _norm(nombre_esperado).split() if len(w) > 2]
        cul_nombre = _norm(d["nombres"] + " " + d["apellidos"])
        if palabras and sum(w in cul_nombre for w in palabras) / len(palabras) < 0.5:
            motivos.append("El nombre del CUL no coincide")
    if not d["emision"] or hoy - d["emision"] > timedelta(days=VIGENCIA_DIAS):
        motivos.append(f"El CUL tiene más de {VIGENCIA_DIAS} días o no se leyó la fecha de emisión")
    for k in ("policiales", "judiciales", "penales"):
        if not d[k] or "NO REGISTRA ANTECEDENTES" not in _norm(d[k]):
            motivos.append(f"Revisar antecedentes {k}: {d[k] or 'no leído'}")

    try:
        qr = revisar_qr(leer_qr(pdf_bytes), d["numero"], d["dni"])
    except Exception as e:
        qr = {"ok": False, "motivo": f"No se pudo leer el QR: {e}"}
    if not qr.get("ok"):
        motivos.append("El QR no corresponde a este certificado")

    return {
        "decision": "aprobado" if not motivos else "revision",
        "motivos": motivos,
        "numero": d["numero"],
        "emision": d["emision"].date().isoformat() if d["emision"] else None,
        "antecedentes": {k: d[k] for k in ("policiales", "judiciales", "penales")},
        "firma": firma,
        "qr": qr,
    }


if __name__ == "__main__":
    import json
    archivo, dni = sys.argv[1], sys.argv[2]
    print(json.dumps(verificar_cul(open(archivo, "rb").read(), dni), indent=2, ensure_ascii=False, default=str))
