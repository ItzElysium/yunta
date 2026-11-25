// Yunta · biometría en el navegador.
// - Lee el DNI con tesseract.js (OCR).
// - Detecta el rostro, hace la prueba de vida (parpadeo y giro) y compara la selfie con la foto del DNI
//   usando Human (github.com/vladmandic/human, licencia MIT).
// Esto da una decisión preliminar y guía al usuario. La decisión confiable la toma el servidor
// (verificador.py con DeepFace), porque lo que corre en el celular se puede manipular.
(function () {
  const C = window.YUNTA_CONFIG.BIOMETRIA;
  let human = null, humanLoading = null, tessLoading = null;

  function loadScript(src) {
    return new Promise((res, rej) => {
      if ([...document.scripts].some(s => s.src === src)) return res();
      const s = document.createElement('script'); s.src = src; s.async = true;
      s.onload = res; s.onerror = () => rej(new Error('No se pudo cargar ' + src)); document.head.appendChild(s);
    });
  }

  async function getHuman() {
    if (human) return human;
    if (!humanLoading) humanLoading = (async () => {
      await loadScript(C.HUMAN_URL);
      const h = new window.Human.Human({
        modelBasePath: C.HUMAN_MODELS,
        debug: false,
        cacheSensitivity: 0,
        face: {
          enabled: true,
          detector: { rotation: true, maxDetected: 1, minConfidence: 0.3 },
          mesh: { enabled: true }, iris: { enabled: true },
          description: { enabled: true }, emotion: { enabled: false },
          antispoof: { enabled: true }, liveness: { enabled: true }
        },
        body: { enabled: false }, hand: { enabled: false }, object: { enabled: false },
        segmentation: { enabled: false }, gesture: { enabled: true }
      });
      await h.load(); await h.warmup();
      human = h; return h;
    })();
    return humanLoading;
  }

  const imgFrom = src => new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = src; });

  function similarity(a, b) {
    if (!a || !b) return 0;
    if (human && human.match && human.match.similarity) return human.match.similarity(a, b);
    if (human && human.similarity) return human.similarity(a, b);
    let dot = 0, na = 0, nb = 0;
    for (let i = 0; i < a.length; i++) { dot += a[i] * b[i]; na += a[i] * a[i]; nb += b[i] * b[i]; }
    return Math.max(0, dot / Math.sqrt(na * nb));
  }

  // ---------- OCR del DNI ----------
  async function ocrDNI(dataUrl, dniEsperado, nombreEsperado) {
    if (!tessLoading) tessLoading = loadScript(C.TESSERACT_URL);
    await tessLoading;
    const { data } = await window.Tesseract.recognize(dataUrl, 'spa');
    const text = (data && data.text) || '';
    const nums = [...text.replace(/[Oo]/g, '0').matchAll(/(?<!\d)(\d{8})(?!\d)/g)].map(m => m[1]);
    const norm = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toUpperCase();
    const T = norm(text);
    const palabras = norm(nombreEsperado || '').split(/\s+/).filter(w => w.length > 2);
    const nombreOk = palabras.length ? palabras.filter(w => T.includes(w)).length / palabras.length : 0;
    return { dniLeido: nums[0] || null, dniOk: !!dniEsperado && nums.includes(dniEsperado), nombreOk: nombreOk >= 0.5, texto: text.slice(0, 400) };
  }

  // ---------- Rostro en una foto (DNI o selfie subida) ----------
  async function rostroDeFoto(dataUrl) {
    const h = await getHuman();
    const img = await imgFrom(dataUrl);
    const r = await h.detect(img);
    const f = r.face && r.face[0];
    if (!f || !f.embedding || !f.embedding.length) return null;
    return { embedding: Array.from(f.embedding), real: f.real ?? null, live: f.live ?? null, score: f.score ?? f.boxScore ?? null };
  }

  // ---------- Escaneo en vivo con desafíos ----------
  // onStep({paso, texto, hecho}) actualiza la interfaz. Devuelve la selfie y las medidas.
  async function escaneoEnVivo(video, onStep, signal) {
    const h = await getHuman();
    const pasos = [
      { id: 'frente', texto: 'Mira al frente, con la cara dentro del óvalo' },
      { id: 'parpadeo', texto: 'Parpadea' },
      { id: 'izquierda', texto: 'Gira la cabeza a la izquierda' },
      { id: 'derecha', texto: 'Ahora a la derecha' },
      { id: 'final', texto: 'Mira al frente otra vez' }
    ];
    let i = 0; const reales = [], vivos = []; let selfie = null, embedding = null, frenteOk = 0;
    const t0 = Date.now();
    onStep({ paso: pasos[0].id, texto: pasos[0].texto, i: 0, total: pasos.length });
    while (i < pasos.length) {
      if (signal && signal.aborted) throw new Error('Escaneo cancelado');
      if (Date.now() - t0 > C.TIEMPO_MAX_MS) throw new Error('Se acabó el tiempo. Busca más luz e intenta otra vez.');
      const r = await h.detect(video);
      const f = r.face && r.face[0];
      if (!f) { onStep({ paso: pasos[i].id, texto: 'No vemos tu rostro. ' + pasos[i].texto, i, total: pasos.length }); await new Promise(z => setTimeout(z, 120)); continue; }
      if (typeof f.real === 'number') reales.push(f.real);
      if (typeof f.live === 'number') vivos.push(f.live);
      const yaw = (f.rotation && f.rotation.angle && f.rotation.angle.yaw) || 0;
      const gestos = (r.gesture || []).map(g => g.gesture || '');
      const p = pasos[i].id;
      let cumple = false;
      if (p === 'frente' || p === 'final') { cumple = Math.abs(yaw) < 0.18 && (++frenteOk > 4); }
      if (p === 'parpadeo') cumple = gestos.some(g => /blink/.test(g));
      if (p === 'izquierda') cumple = yaw > 0.35 || gestos.some(g => /facing left/.test(g));
      if (p === 'derecha') cumple = yaw < -0.35 || gestos.some(g => /facing right/.test(g));
      if (cumple) {
        if (p === 'final') {
          const c = document.createElement('canvas'); c.width = video.videoWidth; c.height = video.videoHeight;
          c.getContext('2d').drawImage(video, 0, 0); selfie = c.toDataURL('image/jpeg', 0.9);
          embedding = Array.from(f.embedding || []);
        }
        onStep({ paso: p, texto: pasos[i].texto, i, total: pasos.length, hecho: true });
        i++; frenteOk = 0;
        if (i < pasos.length) onStep({ paso: pasos[i].id, texto: pasos[i].texto, i, total: pasos.length });
      }
      await new Promise(z => setTimeout(z, 60));
    }
    const prom = a => a.length ? a.reduce((x, y) => x + y, 0) / a.length : null;
    return { selfie, embedding, real: prom(reales), live: prom(vivos), desafios: true };
  }

  // Decisión preliminar en el navegador
  function decidir({ ocr, parecido, vivo }) {
    const motivos = [];
    if (!ocr || !ocr.dniOk) motivos.push('No pudimos leer tu número de DNI en la foto');
    if (!vivo || !vivo.desafios) motivos.push('Falta la prueba de vida con cámara');
    else {
      if (vivo.real != null && vivo.real < C.ANTISPOOF_MIN) motivos.push('La imagen podría ser una foto o una pantalla');
      if (vivo.live != null && vivo.live < C.VIVO_MIN) motivos.push('La prueba de vida no fue clara');
    }
    if (parecido == null) motivos.push('No encontramos tu rostro en la foto del DNI');
    else if (parecido < C.PARECIDO_MIN) motivos.push('Tu selfie no se parece lo suficiente a la foto del DNI');
    const decision = motivos.length ? (parecido != null && parecido < C.PARECIDO_RECHAZO ? 'rechazado' : 'revision') : 'aprobado';
    return { decision, motivos };
  }

  async function camaraDisponible() {
    try { return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia) && window.isSecureContext; } catch (e) { return false; }
  }

  window.BIO = { getHuman, ocrDNI, rostroDeFoto, escaneoEnVivo, similarity, decidir, camaraDisponible };
})();
