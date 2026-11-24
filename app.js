// Yunta · interfaz. Usa window.API (demo o Supabase) y window.avatarSVG.
(function () {
const C = window.YUNTA_CONFIG;
const ICON = {
  compania:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="8" cy="8" r="3.2"/><circle cx="16.5" cy="9" r="2.6"/><path d="M2.5 20c.6-3.4 2.9-5.4 5.5-5.4s4.9 2 5.5 5.4M14 15.2c.8-.4 1.6-.6 2.5-.6 2.2 0 4 1.7 4.5 5.4"/></svg>',
  tutoria:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 8.5 12 4l10 4.5L12 13 2 8.5Z"/><path d="M6 10.5V16c2 2 10 2 12 0v-5.5M22 8.5V14"/></svg>',
  salud:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20s-7.5-4.4-7.5-10A4.3 4.3 0 0 1 12 7.4 4.3 4.3 0 0 1 19.5 10c0 5.6-7.5 10-7.5 10Z"/><path d="M8 12h2.2l1.2-2.4 1.6 4.4 1.2-2H16"/></svg>',
  hogar:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a4 4 0 0 0-5.4 5.2L3.5 17.3a1.8 1.8 0 0 0 2.5 2.5l5.8-5.8a4 4 0 0 0 5.2-5.4l-2.5 2.5-2.3-.4-.4-2.3 2.9-2.1Z"/></svg>'
};
const CATS = [
  {id:'compania',name:'Compañía',desc:'Amigos, eventos, reuniones familiares',subs:['Amigo para salir','Acompañante a evento','Pareja para reunión familiar','Familiar para ceremonia','Adulto mayor','Caminatas y deporte']},
  {id:'tutoria',name:'Tutorías',desc:'Colegio, pre, idiomas, música',subs:['Matemática','Pre-U','Inglés','Quechua','Música','Programación']},
  {id:'salud',name:'Salud y bienestar',desc:'Psicología, nutrición, coaching',subs:['Psicología','Nutrición','Coaching']},
  {id:'hogar',name:'Hogar y oficios',desc:'Electricista, gasfitero, técnico',subs:['Electricista','Gasfitero','Técnico de PC','Carpintería','Limpieza']}
];
const DISTRITOS = ['Miraflores','San Isidro','Barranco','Santiago de Surco','San Borja','Jesús María','Pueblo Libre','San Miguel','Los Olivos','La Molina','Chorrillos','Callao','Arequipa · Cercado','Cusco · Wanchaq','Trujillo · Centro','Online'];

const S = { view:'explorar', cat:null, sub:null, q:'', dist:'', user:null, services:[], after:null };
const $ = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const soles = n => 'S/ ' + Number(n).toFixed(2);
const catOf = id => CATS.find(c => c.id === id);
const av = (p, cls='') => `<span class="av ${cls}">${avatarSVG({seed:p.seed, g:p.g, age:p.age})}</span>`;
const daysAgo = d => Math.floor((Date.now() - new Date(d + 'T12:00')) / 864e5);
function toast(t){ const el=$('#toast'); el.textContent=t; el.hidden=false; clearTimeout(toast.t); toast.t=setTimeout(()=>el.hidden=true, 3000); }
const run = fn => async (...a) => { try { return await fn(...a) } catch (e) { toast(e.message || 'Algo salió mal. Intenta otra vez.') } };
const readFile = f => new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(r.result); r.onerror = rej; r.readAsDataURL(f); });

// ---------------- Navegación ----------------
async function refreshUser(){ S.user = await API.getUser(); renderNav(); }
function renderNav(){
  const u = S.user;
  $('#tabs').innerHTML = [
    ['explorar','Explorar'],['publicar','Publicar'],['reservas','Reservas'],
    ...(u && u.role === 'admin' ? [['admin','Revisión']] : [['seguridad','Seguridad']]),
    ['cuenta', u ? `<span class="me">${avatarSVG({seed:u.seed,g:u.g,age:u.age})}</span>${esc(u.name.split(' ')[0])}` : 'Ingresar']
  ].map(([v,l]) => `<button data-view="${v}" aria-current="${S.view===v}">${l}</button>`).join('');
  $$('#tabs button').forEach(b => b.onclick = () => go(b.dataset.view));
  $('#modeTag').textContent = API.mode === 'demo' ? 'Demo' : 'Beta';
}
function go(v){ S.view = v; renderNav(); render(); window.scrollTo(0,0); }
function requireLogin(next, msg){ if (S.user) return true; S.after = next; go('cuenta'); toast(msg || 'Inicia sesión para continuar'); return false; }
const VIEWS = {};
async function render(){ close(); await VIEWS[S.view](); }

// ---------------- Explorar ----------------
function card(s){
  const badge = s.colegiatura ? s.colegiatura + ' verificado' : s.verified ? 'Identidad y CUL verificados' : 'Verificación pendiente';
  return `<button class="card" data-id="${s.id}">
    ${s.featured ? '<span class="star">Destacado</span>' : ''}
    <div class="who">${av(s)}<div><b>${esc(s.name)}</b><small>${esc(s.dist)} · ${s.age} años</small></div></div>
    <h3>${esc(s.title)}</h3>
    <div class="meta"><span class="pill m">${esc(s.sub)}</span><span class="pill ${s.verified?'ok':'warn'}">${s.verified?'✓':'⏳'} ${esc(badge)}</span></div>
    <div class="foot"><span class="price">S/ ${s.price}<small> /${esc(s.unit)}</small></span>
      <span class="stars">${s.n ? `★ <b>${s.rating.toFixed(1)}</b> (${s.n})` : 'Nuevo'}</span></div>
  </button>`;
}
VIEWS.explorar = async function(){
  S.services = await API.listServices();
  drawExplorar();
};
function drawExplorar(){
  const list = S.services.filter(s => (!S.cat||s.cat===S.cat) && (!S.sub||s.sub===S.sub) && (!S.dist||s.dist===S.dist) &&
    (!S.q || (s.title+' '+s.desc+' '+s.sub+' '+s.name).toLowerCase().includes(S.q.toLowerCase())));
  const c = S.cat && catOf(S.cat);
  $('#app').innerHTML = `
  <section class="hero">
    <div><h1>Tu <em>yunta</em> para lo que se necesite.</h1>
    <p>Un pata para salir, una tía para la graduación, la profe para el pre o el electricista que llega hoy. Todos verificados con DNI, reconocimiento facial y Certificado Único Laboral.</p></div>
    <div class="search">
      <label class="lbl" for="q">Buscar</label>
      <input id="q" placeholder="Ej. padrino, inglés, terma, psicóloga" value="${esc(S.q)}">
      <select id="dist" aria-label="Distrito"><option value="">Todo el Perú</option>${DISTRITOS.map(d=>`<option ${d===S.dist?'selected':''}>${d}</option>`).join('')}</select>
    </div>
  </section>
  <div class="cats">${CATS.map(k=>`<button class="cat" data-cat="${k.id}" aria-pressed="${S.cat===k.id}">${ICON[k.id]}<b>${k.name}</b><span>${k.desc}</span></button>`).join('')}</div>
  ${c ? `<div class="chips"><button class="chip" data-sub="" aria-pressed="${!S.sub}">Todo ${c.name.toLowerCase()}</button>${c.subs.map(x=>`<button class="chip" data-sub="${esc(x)}" aria-pressed="${S.sub===x}">${esc(x)}</button>`).join('')}</div>` : ''}
  <p class="count">${list.length} ${list.length===1?'persona disponible':'personas disponibles'}${S.dist?' en '+esc(S.dist):''}</p>
  ${list.length ? `<div class="grid">${list.map(card).join('')}</div>` : `<div class="empty">No hay resultados con esos filtros. Prueba otro distrito o quita la búsqueda.</div>`}
  ${legal()}`;
  const q = $('#q'); q.oninput = e => { S.q = e.target.value; const p = q.selectionStart; drawExplorar(); const n = $('#q'); n.focus(); n.setSelectionRange(p,p); };
  $('#dist').onchange = e => { S.dist = e.target.value; drawExplorar(); };
  $$('.cat').forEach(b => b.onclick = () => { S.cat = S.cat===b.dataset.cat ? null : b.dataset.cat; S.sub = null; drawExplorar(); });
  $$('.chip').forEach(b => b.onclick = () => { S.sub = b.dataset.sub || null; drawExplorar(); });
  $$('.card').forEach(b => b.onclick = () => perfil(S.services.find(s => s.id === b.dataset.id)));
}
function legal(){ return `<footer class="legal"><span>Yunta · Lima, Perú</span><button class="link" data-act="reclamo">Libro de Reclamaciones</button><span>Datos protegidos según Ley N.º 29733</span><button class="link" data-act="seguridad">Seguridad</button></footer>`; }
document.addEventListener('click', e => { const a = e.target.closest('[data-act]'); if (!a) return;
  if (a.dataset.act === 'reclamo') reclamo(); if (a.dataset.act === 'seguridad') go('seguridad'); });

// ---------------- Modal ----------------
function openModal(html){ $('#modal').innerHTML = `<div class="scrim"><div class="sheet" role="dialog" aria-modal="true">${html}</div></div>`;
  const sc = $('.scrim'); sc.onclick = e => { if (e.target === sc) close(); }; $$('.x').forEach(x => x.onclick = close); }
function close(){ $('#modal').innerHTML = ''; }
document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });

// ---------------- Perfil + contacto bloqueado ----------------
async function perfil(s){
  const c = catOf(s.cat); const social = s.cat === 'compania';
  openModal(`<header><div class="who">${av(s,'lg')}
    <div><h2 style="font-size:22px">${esc(s.name)}</h2><small style="color:var(--muted)">${esc(c.name)} · ${esc(s.sub)} · ${esc(s.dist)}</small></div></div><button class="x" aria-label="Cerrar">×</button></header>
    <h3 style="font-size:18px">${esc(s.title)}</h3>
    <p style="margin:8px 0">${esc(s.desc)}</p>
    <div class="meta">${s.verified ? `<span class="pill ok">✓ DNI y rostro</span><span class="pill ok">✓ CUL sin antecedentes</span>` : `<span class="pill warn">⏳ Verificación en revisión</span>`}
      ${s.colegiatura ? `<span class="pill ok">✓ ${esc(s.colegiatura)}</span>` : ''}<span class="pill">${esc(s.langs)}</span></div>
    ${social ? `<div class="alert" style="margin-top:12px">Compañía social. El primer encuentro es en un lugar público y no incluye contacto íntimo.</div>` : ''}
    ${s.cat === 'salud' ? `<div class="note" style="margin-top:12px">Si estás en crisis, llama a la Línea 113, opción 5.</div>` : ''}
    <div class="section"><h4>Contacto</h4><div id="contact"><div class="lock"><span class="note">Cargando…</span></div></div></div>
    <div class="section"><h4>Reseñas</h4><div class="reviews">${API.reviews(s.providerId).map(r=>`<div class="rev">"${esc(r[1])}"<br><small>${esc(r[0])}</small></div>`).join('') || '<span class="note">Aún sin reseñas.</span>'}</div></div>
    <div class="section" style="flex-direction:row;align-items:center;justify-content:space-between;flex-wrap:wrap">
      <span class="price">S/ ${s.price}<small> /${esc(s.unit)}</small></span>
      <button class="btn" id="res">Reservar con pago protegido</button></div>`);
  $('#res').onclick = () => { if (requireLogin(() => reservar(s))) reservar(s); };
  drawContact(s);
}
async function drawContact(s){
  const box = $('#contact'); if (!box) return;
  const ct = await API.getContact(s.providerId);
  const cr = await API.credits();
  if (!$('#contact')) return;
  if (ct.unlocked) {
    box.innerHTML = `<div class="lock open"><div class="kv">
      <span>WhatsApp</span><b>${esc(ct.whatsapp)}</b><button class="btn sm ghost" data-copy="${esc(ct.whatsapp)}">Copiar</button>
      <span>Correo</span><b style="font-size:14px;overflow-wrap:anywhere">${esc(ct.email)}</b><button class="btn sm ghost" data-copy="${esc(ct.email)}">Copiar</button></div>
      <span class="note">Contacto desbloqueado. Si pagas por fuera de Yunta, el pago no queda protegido.</span></div>`;
    box.querySelectorAll('[data-copy]').forEach(b => b.onclick = async () => { try { await navigator.clipboard.writeText(b.dataset.copy); toast('Copiado'); } catch (e) { toast('Selecciona el texto para copiarlo'); } });
    return;
  }
  box.innerHTML = `<div class="lock"><div class="kv">
      <span>WhatsApp</span><b class="blur">${esc(ct.whatsapp)}</b><span></span>
      <span>Correo</span><b class="blur" style="font-size:14px">${esc(ct.email)}</b><span></span></div>
    ${ct.pending ? `<div class="alert">Recibimos tu pago. Lo estamos verificando y te mostramos el contacto en unos minutos.</div>` :
    `<div class="row">
      <button class="btn aji" id="unl">Ver contacto · S/ ${C.PRECIO_DESBLOQUEO}</button>
      ${cr > 0 ? `<button class="btn line" id="cred">Usar 1 crédito (tienes ${cr})</button>` : `<button class="btn line" id="pack">${C.PAQUETE.creditos} contactos · S/ ${C.PAQUETE.precio}</button>`}</div>
    <span class="note">Pago único por persona. Así sabemos que quien escribe va en serio y protegemos a quien publica.</span>`}</div>`;
  const u = $('#unl'); if (u) u.onclick = () => { if (requireLogin(() => perfil(s), 'Inicia sesión para ver el contacto')) pagar({ concepto: `Ver contacto de ${s.name}`, monto: C.PRECIO_DESBLOQUEO, onPaid: run(async (m) => { await API.requestUnlock(s.providerId, m); if (API.mode === 'demo') { toast('Pago recibido. Verificando…'); await perfil(s); setTimeout(run(async () => { const ul = (await API.pendingUnlocks()).find(x => x.providerId === s.providerId); if (ul) await API.confirmUnlock(ul.id); toast('Pago verificado. Contacto desbloqueado.'); drawContact(s); }), 1600); } else perfil(s); }) }); };
  const k = $('#cred'); if (k) k.onclick = run(async () => { if (await API.unlockWithCredit(s.providerId)) { toast('Usaste 1 crédito'); drawContact(s); } });
  const p = $('#pack'); if (p) p.onclick = () => { if (requireLogin(() => perfil(s))) pagar({ concepto: `Paquete de ${C.PAQUETE.creditos} contactos`, monto: C.PAQUETE.precio, onPaid: run(async (m) => { await API.buyPack(m); toast(`Tienes ${C.PAQUETE.creditos} créditos`); perfil(s); }) }); };
}

// ---------------- Pago Yape/Plin (reutilizable) ----------------
function pagar({ concepto, monto, onPaid }){
  let method = 'yape';
  openModal(`<header><div><h2 style="font-size:20px">Pagar ${soles(monto)}</h2><span class="note">${esc(concepto)}</span></div><button class="x" aria-label="Cerrar">×</button></header>
    <div class="pay"><button data-p="yape" aria-pressed="true">Yape</button><button data-p="plin" aria-pressed="false">Plin</button></div>
    <div class="qr" style="margin-top:10px"><canvas id="qr" width="84" height="84"></canvas><div><b id="pnum">Yape a ${esc(C.YAPE_TITULAR)}</b><br><span class="note">Número: ${esc(C.YAPE_NUMERO)}${API.mode==='demo'?' (demo)':''}. Escanea o yapea al número y copia el código de operación.</span></div></div>
    <div class="field" style="margin-top:10px"><label for="op">Código de operación</label><input id="op" inputmode="numeric" placeholder="Ej. 04821937" autocomplete="off"></div>
    <button class="btn" id="paid" style="width:100%;margin-top:12px">Ya pagué</button>`);
  drawQR();
  $$('.pay button').forEach(b => b.onclick = () => { method = b.dataset.p; $$('.pay button').forEach(x => x.setAttribute('aria-pressed', x === b)); $('#pnum').textContent = (method==='yape'?'Yape':'Plin') + ' a ' + C.YAPE_TITULAR; drawQR(); });
  $('#paid').onclick = () => { const op = $('#op').value.trim(); if (!/^\d{6,12}$/.test(op)) { toast('El código de operación tiene entre 6 y 12 dígitos'); $('#op').focus(); return; } onPaid({ method, op }); };
}
function drawQR(){ const c = $('#qr'); if (!c) return; const x = c.getContext('2d'); x.fillStyle = '#fff'; x.fillRect(0,0,84,84); x.fillStyle = '#231A2B';
  let seed = Math.random()*1e6; const r = () => (seed = (seed*9301+49297) % 233280) / 233280;
  for (let i=0;i<21;i++) for (let j=0;j<21;j++){ const f=(i<7&&j<7)||(i<7&&j>13)||(i>13&&j<7);
    if (f){ const a=i%14,b=j%14; if(a===0||a===6||b===0||b===6||(a>1&&a<5&&b>1&&b<5)) x.fillRect(j*4,i*4,4,4); } else if (r()>.52) x.fillRect(j*4,i*4,4,4); } }

// ---------------- Reservar ----------------
function reservar(s){
  const t = new Date(); t.setDate(t.getDate()+2); const d = t.toISOString().slice(0,10);
  const porHora = s.unit === 'hora'; const social = s.cat === 'compania';
  openModal(`<header><h2 style="font-size:20px">Reservar con ${esc(s.name)}</h2><button class="x" aria-label="Cerrar">×</button></header>
  <div class="row"><div class="field"><label for="f">Fecha</label><input type="date" id="f" value="${d}"></div>
    <div class="field"><label for="h">Hora</label><input type="time" id="h" value="16:00"></div>
    ${porHora ? `<div class="field"><label for="dur">Horas</label><select id="dur">${[1,2,3,4,5,6].map(n=>`<option ${n===2?'selected':''}>${n}</option>`).join('')}</select></div>` : ''}</div>
  <div class="field" style="margin-top:10px"><label for="lug">${social?'Punto de encuentro (lugar público)':s.dist==='Online'?'Enlace o plataforma':'Dirección'}</label>
    <input id="lug" placeholder="${social?'Ej. Larcomar, entrada principal':s.dist==='Online'?'Google Meet / Zoom':'Av., calle, número, referencia'}"></div>
  <div class="field" style="margin-top:10px"><label for="det">Detalles</label><textarea id="det" placeholder="Cuéntale qué necesitas"></textarea></div>
  ${social ? `<label class="check" style="margin-top:10px"><input type="checkbox" id="ok1"> Acepto que es compañía social, sin contacto íntimo, y que el primer encuentro será en un lugar público.</label>` : ''}
  <div class="section"><h4>Resumen</h4><div class="sum" id="sum"></div></div>
  <button class="btn" id="go" style="width:100%;margin-top:12px">Continuar al pago</button>`);
  const calc = () => { const h = porHora ? +$('#dur').value : 1; const sub = s.price*h; const fee = Math.round(sub*C.COMISION_RESERVA*100)/100;
    $('#sum').innerHTML = `<span>S/ ${s.price} × ${h} ${esc(s.unit)}${h>1?'s':''}</span><span>${soles(sub)}</span><span>Tarifa de servicio (${C.COMISION_RESERVA*100}%)</span><span>${soles(fee)}</span><span class="t">Total</span><span class="t">${soles(sub+fee)}</span>`; return { h, sub, fee }; };
  calc(); if (porHora) $('#dur').onchange = calc;
  $('#go').onclick = () => {
    if (social && !$('#ok1').checked) { toast('Marca la casilla de compañía social para continuar'); return; }
    if (!$('#lug').value.trim()) { toast('Indica el lugar o enlace del servicio'); $('#lug').focus(); return; }
    const { h, sub, fee } = calc(); const b = { serviceId: s.id, providerId: s.providerId, name: s.name, seed: s.seed, g: s.g, age: s.age, title: s.sub, date: $('#f').value, time: $('#h').value, h, lug: $('#lug').value.trim(), det: $('#det').value.trim(), subtotal: sub, fee, total: sub+fee };
    pagar({ concepto: `Reserva con ${s.name}`, monto: sub+fee, onPaid: run(async (m) => { await API.createBooking({ ...b, pay: m.method, op: m.op }); toast('Reserva enviada. Verificamos tu pago en unos minutos.'); go('reservas'); }) });
  };
}

VIEWS.reservas = async function(){
  if (!S.user) { $('#app').innerHTML = `<div class="page"><h1>Mis reservas</h1><div class="empty">Inicia sesión para ver tus reservas.<br><br><button class="btn" id="li">Ingresar</button></div></div>`; $('#li').onclick = () => go('cuenta'); return; }
  const list = await API.myBookings();
  const fmt = d => new Date(d+'T12:00').toLocaleDateString('es-PE',{weekday:'short',day:'numeric',month:'short'});
  $('#app').innerHTML = `<div class="page"><h1>Mis reservas</h1><p class="lead">El pago queda retenido por Yunta y se libera 24 horas después del servicio si no reportas ningún problema.</p>
  ${list.length ? `<div class="list">${list.map(b=>`<div class="bk">${av(b)}
    <div class="info"><b>${esc(b.name)}</b> · ${esc(b.title)}<br><span class="note">${fmt(b.date)} · ${esc(b.time)} · ${esc(b.lug)}</span><br>
    <span class="pill ${b.status==='Confirmada'?'ok':b.status==='Cancelada'?'':'warn'}">${esc(b.status)}</span> <span class="note">${b.pay==='yape'?'Yape':'Plin'} · op. ${esc(b.op)} · ${soles(b.total)}</span></div>
    <div class="row" style="flex:0 1 auto">${b.status==='Pago por verificar'&&API.mode==='demo'?`<button class="btn sm ghost" data-ok="${b.id}">Simular verificación</button>`:''}${b.status!=='Cancelada'?`<button class="btn sm ghost" data-cancel="${b.id}">Cancelar</button>`:''}</div></div>`).join('')}</div>`
  : `<div class="empty">Aún no tienes reservas. Cuando reserves, aquí verás el estado de tu pago.<br><br><button class="btn" id="ex">Explorar servicios</button></div>`}
  ${legal()}</div>`;
  const ex = $('#ex'); if (ex) ex.onclick = () => go('explorar');
  $$('[data-ok]').forEach(b => b.onclick = run(async () => { await API.updateBooking(b.dataset.ok, 'Confirmada'); toast('Pago verificado. Reserva confirmada.'); render(); }));
  $$('[data-cancel]').forEach(b => b.onclick = run(async () => { await API.updateBooking(b.dataset.cancel, 'Cancelada'); toast('Reserva cancelada. Devolvemos tu pago en 48 h.'); render(); }));
};

// ---------------- Cuenta / Login ----------------
VIEWS.cuenta = async function(){
  if (S.user) return cuentaPerfil();
  let mode = 'in';
  const draw = () => {
    $('#app').innerHTML = `<div class="auth"><h1 style="font-size:30px;margin-bottom:6px">${mode==='in'?'Ingresa a Yunta':'Crea tu cuenta'}</h1>
    <p class="lead">${mode==='in'?'Para ver contactos, reservar y publicar.':'Gratis. Para ofrecer servicios te pediremos verificar tu identidad.'}</p>
    <form class="form" id="af">
      <div class="seg"><button type="button" data-m="in" aria-pressed="${mode==='in'}">Ingresar</button><button type="button" data-m="up" aria-pressed="${mode==='up'}">Registrarme</button></div>
      ${mode==='up' ? `<div class="field"><label for="an">Nombre completo</label><input id="an" required autocomplete="name"></div>
        <div class="field"><label>Quiero</label><div class="seg" id="rolSeg"><button type="button" data-r="cliente" aria-pressed="true">Contratar</button><button type="button" data-r="proveedor" aria-pressed="false">Ofrecer servicios</button></div></div>` : ''}
      <div class="field"><label for="ae">Correo</label><input id="ae" type="email" required autocomplete="email"></div>
      <div class="field"><label for="ap">Contraseña</label><input id="ap" type="password" required minlength="${mode==='up'?8:1}" autocomplete="${mode==='up'?'new-password':'current-password'}"></div>
      <button class="btn" type="submit">${mode==='in'?'Ingresar':'Crear cuenta'}</button>
      <div class="or">o</div>
      <button class="btn line" type="button" id="gg">Continuar con Google</button>
      ${API.mode==='demo' ? `<div class="section"><h4>Probar con cuentas demo</h4>
        <div class="quick"><button type="button" data-q="cliente">${av({seed:4411,g:'f',age:28})}Cliente</button><button type="button" data-q="proveedor">${av({seed:9087,g:'m',age:32})}Proveedor</button><button type="button" data-q="admin">${av({seed:77,g:'x',age:30})}Admin</button></div>
        <span class="note">Contraseña de todas: yunta123 (cliente@demo.pe, proveedor@demo.pe, admin@demo.pe)</span></div>` : ''}
    </form></div>`;
    let role = 'cliente';
    $$('[data-m]').forEach(b => b.onclick = () => { mode = b.dataset.m; draw(); });
    $$('[data-r]').forEach(b => b.onclick = () => { role = b.dataset.r; $$('[data-r]').forEach(x => x.setAttribute('aria-pressed', x === b)); });
    $('#gg').onclick = run(async () => { await API.signInGoogle(); await loggedIn(); });
    $$('[data-q]').forEach(b => b.onclick = run(async () => { await API.quickLogin(b.dataset.q); await loggedIn(); }));
    $('#af').onsubmit = run(async e => { e.preventDefault();
      if (mode === 'in') await API.signIn({ email: $('#ae').value, password: $('#ap').value });
      else await API.signUp({ name: $('#an').value.trim(), email: $('#ae').value, password: $('#ap').value, role });
      await loggedIn(); });
  };
  draw();
};
async function loggedIn(){ await refreshUser(); toast('Hola, ' + S.user.name.split(' ')[0]); const n = S.after; S.after = null;
  if (n) { S.view = 'explorar'; renderNav(); await VIEWS.explorar(); n(); } else go(S.user.role === 'admin' ? 'admin' : S.user.role === 'proveedor' ? 'publicar' : 'explorar'); }
async function cuentaPerfil(){
  const u = S.user; const cr = await API.credits();
  $('#app').innerHTML = `<div class="page"><div class="who" style="margin-bottom:18px">${av(u,'lg')}<div><h1 style="font-size:28px;margin:0">${esc(u.name)}</h1><small style="color:var(--muted)">${esc(u.email)} · ${({cliente:'Cliente',proveedor:'Proveedor',admin:'Administrador'})[u.role]}</small></div></div>
    <div class="rules">
      <div class="rule"><h3>Créditos de contacto</h3><p>Tienes <b>${cr}</b> ${cr===1?'crédito':'créditos'}. Cada uno desbloquea el WhatsApp y correo de una persona.</p>
        <button class="btn sm aji" id="buy" style="margin-top:10px">Comprar ${C.PAQUETE.creditos} por S/ ${C.PAQUETE.precio}</button></div>
      <div class="rule"><h3>Ofrecer servicios</h3><p>Publica tu anuncio y verifica tu identidad para aparecer en Explorar.</p><button class="btn sm ghost" id="pub" style="margin-top:10px">Ir a Publicar</button></div>
    </div>
    <div class="row" style="margin-top:18px">${u.role==='admin'?'<button class="btn ghost" id="adm">Panel de revisión</button>':''}<button class="btn line" id="out">Cerrar sesión</button>${API.mode==='demo'?'<button class="btn line" id="rst">Reiniciar datos demo</button>':''}</div>
    ${legal()}</div>`;
  $('#buy').onclick = () => pagar({ concepto: `Paquete de ${C.PAQUETE.creditos} contactos`, monto: C.PAQUETE.precio, onPaid: run(async m => { await API.buyPack(m); toast('Créditos añadidos'); render(); }) });
  $('#pub').onclick = () => go('publicar');
  const a = $('#adm'); if (a) a.onclick = () => go('admin');
  $('#out').onclick = run(async () => { await API.signOut(); await refreshUser(); go('explorar'); toast('Sesión cerrada'); });
  const r = $('#rst'); if (r) r.onclick = run(async () => { await API.reset(); await refreshUser(); go('explorar'); toast('Datos demo reiniciados'); });
}

// ---------------- Publicar + verificación ----------------
VIEWS.publicar = async function(){
  if (!S.user) { $('#app').innerHTML = `<div class="page"><h1>Publica tu servicio</h1><p class="lead">Gana ofreciendo compañía, clases o tu oficio. Publicar es gratis.</p><div class="empty">Crea tu cuenta o ingresa para publicar.<br><br><button class="btn" id="li">Ingresar o registrarme</button></div></div>`; $('#li').onclick = () => { S.after = null; go('cuenta'); }; return; }
  const v = await API.myVerification();
  const mine = await API.myServices();
  $('#app').innerHTML = `<div class="page"><h1>Publica tu servicio</h1>
    <p class="lead">Publicar es gratis. Ganas cuando un cliente paga S/ ${C.PRECIO_DESBLOQUEO} por ver tu contacto o reserva con pago protegido. Tu WhatsApp y correo nunca se muestran sin ese pago.</p>
    <div id="vbox"></div>
    ${mine.length ? `<div class="section" style="border:0;margin:0 0 18px;padding:0"><h4>Mis anuncios</h4><div class="list">${mine.map(s=>`<div class="bk">${av(s)}<div class="info"><b>${esc(s.title)}</b><br><span class="note">${esc(s.sub)} · S/ ${s.price}/${esc(s.unit)}</span><br>
      <span class="pill ${s.active?'ok':'warn'}">${s.active?'Publicado':'Esperando verificación'}</span>${s.featured?' <span class="pill m">Destacado</span>':''}</div>
      ${s.active && !s.featured ? `<button class="btn sm aji" data-feat="${s.id}">Destacar 7 días · S/ ${C.PRECIO_DESTACADO}</button>` : ''}</div>`).join('')}</div></div>` : ''}
    <div id="sf"></div>${legal()}</div>`;
  $$('[data-feat]').forEach(b => b.onclick = () => pagar({ concepto: 'Anuncio destacado por 7 días', monto: C.PRECIO_DESTACADO, onPaid: run(async () => { await API.featureService(b.dataset.feat); toast('Tu anuncio aparece primero por 7 días'); render(); }) }));
  if (!v) verifWizard(); else verifStatus(v);
  serviceForm(!!v);
};
function verifStatus(v){
  const st = { pendiente: ['warn','En revisión','Revisamos tus documentos en menos de 24 horas. Te avisamos por correo.'], aprobado: ['ok','Verificado','Tu identidad y tu CUL están verificados. Tus anuncios ya aparecen en Explorar.'], rechazado: ['bad','Rechazado', 'No pudimos validar tus documentos. ' + (v.notes || '') + ' Vuelve a enviarlos.'] }[v.status];
  $('#vbox').innerHTML = `<div class="alert ${st[0]==='warn'?'':st[0]}" style="margin-bottom:18px"><b>Verificación: ${st[1]}.</b> ${esc(st[2])}${v.status==='rechazado'?' <button class="link" id="again">Enviar de nuevo</button>':''}</div>`;
  const a = $('#again'); if (a) a.onclick = verifWizard;
}
function verifWizard(){
  const data = { liveness: false };
  const maxDate = new Date().toISOString().slice(0,10);
  $('#vbox').innerHTML = `<div class="form" style="margin-bottom:18px"><div><h2 style="font-size:20px">1 · Verifica tu identidad</h2><p class="note" style="margin:4px 0 0">Obligatorio para aparecer en Explorar. Tus documentos se guardan cifrados y solo los ve el equipo de revisión.</p></div>
    <div class="steps">
      <div class="step" id="st1"><span class="n">1</span><div class="body"><h3>DNI</h3>
        <div class="row"><div class="field"><label for="vn">Nombre como figura en tu DNI</label><input id="vn" value="${esc(S.user.name)}"></div>
        <div class="field"><label for="vd">N.º de DNI</label><input id="vd" inputmode="numeric" maxlength="8" placeholder="8 dígitos"></div></div>
        <div class="upl"><span class="thumb" id="t-dni">Foto del DNI</span><input type="file" id="f-dni" accept="image/*" capture="environment" aria-label="Foto del anverso del DNI"></div></div></div>
      <div class="step" id="st2"><span class="n">2</span><div class="body"><h3>Escaneo de rostro</h3>
        <p class="note" style="margin:0">Tómate una selfie con buena luz, sin lentes ni gorra. Compararemos tu rostro con la foto del DNI y haremos una prueba de vida para confirmar que eres tú y no una foto.</p>
        <div class="face" id="face"><span class="hint">Centra tu rostro en el óvalo</span></div>
        <div class="live" id="live"><span>Mira al frente</span><span>Parpadea</span><span>Gira a la izquierda</span><span>Sonríe</span></div>
        <div class="upl"><span class="thumb">Selfie</span><input type="file" id="f-selfie" accept="image/*" capture="user" aria-label="Selfie"></div></div></div>
      <div class="step" id="st3"><span class="n">3</span><div class="body"><h3>Certificado Único Laboral (CUL)</h3>
        <p class="note" style="margin:0">Descárgalo gratis en Empleos Perú (empleosperu.gob.pe) del Ministerio de Trabajo. Reúne tus antecedentes policiales, penales y judiciales en un solo documento. Debe tener menos de ${C.CUL_VIGENCIA_DIAS} días.</p>
        <div class="row"><div class="field"><label for="vcn">N.º del certificado</label><input id="vcn" placeholder="Figura en el PDF"></div>
          <div class="field"><label for="vcf">Fecha de emisión</label><input id="vcf" type="date" max="${maxDate}"></div></div>
        <div class="upl"><span class="thumb" id="t-cul">PDF</span><input type="file" id="f-cul" accept="application/pdf,image/*" aria-label="Archivo del CUL"></div></div></div>
      <div class="step" id="st4"><span class="n">4</span><div class="body"><h3>Contacto y colegiatura</h3>
        <div class="row"><div class="field"><label for="vw">WhatsApp (se mantiene bloqueado)</label><input id="vw" inputmode="tel" placeholder="9XX XXX XXX"></div>
          <div class="field"><label for="vcol">Colegiatura (solo salud)</label><input id="vcol" placeholder="Ej. C.Ps.P. 34521"></div></div>
        <label class="check"><input type="checkbox" id="vok"> Autorizo a Yunta a tratar mis datos personales y biométricos para verificar mi identidad (Ley N.º 29733).</label></div></div>
    </div>
    <button class="btn" id="vsend">Enviar a revisión</button></div>`;
  const mark = (id, on) => $('#'+id).classList.toggle('done', on);
  $('#f-dni').onchange = run(async e => { const f = e.target.files[0]; if (!f) return; data.dniFrontUrl = await readFile(f); $('#t-dni').innerHTML = `<img alt="DNI" src="${data.dniFrontUrl}">`; mark('st1', /^\d{8}$/.test($('#vd').value)); });
  $('#vd').oninput = () => mark('st1', /^\d{8}$/.test($('#vd').value) && !!data.dniFrontUrl);
  $('#f-selfie').onchange = run(async e => { const f = e.target.files[0]; if (!f) return; data.selfieUrl = await readFile(f);
    $('#face').innerHTML = `<img alt="Tu selfie" src="${data.selfieUrl}">`;
    const chips = $$('#live span'); chips.forEach((c,i) => setTimeout(() => c.classList.add('on'), 350*(i+1)));
    setTimeout(() => { data.liveness = true; mark('st2', true); toast('Prueba de vida completada'); }, 350*chips.length + 100); });
  $('#f-cul').onchange = run(async e => { const f = e.target.files[0]; if (!f) return; if (f.size > 8e6) { toast('El archivo pesa más de 8 MB'); return; } data.culFileUrl = await readFile(f); $('#t-cul').textContent = f.name.slice(0,14); });
  $('#vsend').onclick = run(async () => {
    const dni = $('#vd').value.trim(), fecha = $('#vcf').value;
    if (!/^\d{8}$/.test(dni)) return toast('El DNI debe tener 8 dígitos');
    if (!data.dniFrontUrl) return toast('Sube la foto de tu DNI');
    if (!data.selfieUrl) return toast('Falta el escaneo de rostro');
    if (!$('#vcn').value.trim() || !fecha) return toast('Ingresa el número y la fecha de emisión del CUL');
    if (daysAgo(fecha) > C.CUL_VIGENCIA_DIAS) return toast(`Tu CUL tiene ${daysAgo(fecha)} días. Descarga uno nuevo en Empleos Perú.`);
    if (!data.culFileUrl) return toast('Sube el PDF del CUL');
    if (!/^9\d{8}$/.test($('#vw').value.replace(/\s/g,''))) return toast('Ingresa un celular peruano de 9 dígitos que empiece en 9');
    if (!$('#vok').checked) return toast('Debes autorizar el tratamiento de tus datos');
    await API.submitVerification({ ...data, name: $('#vn').value.trim(), dni, culNumero: $('#vcn').value.trim(), culFecha: fecha, whatsapp: $('#vw').value.trim(), colegiatura: $('#vcol').value.trim() });
    toast('Documentos enviados. Los revisamos en menos de 24 h.'); render();
  });
}
function serviceForm(hasVerif){
  $('#sf').innerHTML = `<form class="form" id="pf"><div><h2 style="font-size:20px">${hasVerif?'Nuevo anuncio':'2 · Tu anuncio'}</h2></div>
    <div class="row"><div class="field"><label for="pc">Categoría</label><select id="pc">${CATS.map(c=>`<option value="${c.id}">${c.name}</option>`).join('')}</select></div>
      <div class="field"><label for="ps">Tipo de servicio</label><select id="ps"></select></div></div>
    <div class="field"><label for="pt">Título del anuncio</label><input id="pt" required minlength="10" maxlength="90" placeholder="Ej. Clases de guitarra criolla para principiantes"></div>
    <div class="field"><label for="pde">Descripción</label><textarea id="pde" required placeholder="Tu experiencia, qué incluye y cómo trabajas. No pongas tu número: se comparte al desbloquear."></textarea></div>
    <div class="row"><div class="field"><label for="pp">Precio (S/)</label><input id="pp" type="number" min="10" required value="40"></div>
      <div class="field"><label for="pu">Por</label><select id="pu"><option>hora</option><option>sesión</option><option>visita</option><option>evento</option></select></div>
      <div class="field"><label for="pdi">Distrito</label><select id="pdi">${DISTRITOS.map(d=>`<option>${d}</option>`).join('')}</select></div></div>
    <div class="alert" id="rules" hidden>En Compañía está prohibido ofrecer servicios sexuales o íntimos. Revisamos cada anuncio antes de publicarlo.</div>
    <button class="btn aji" type="submit">Guardar anuncio</button></form>`;
  const sync = () => { const c = catOf($('#pc').value); $('#ps').innerHTML = c.subs.map(s=>`<option>${s}</option>`).join(''); $('#rules').hidden = c.id !== 'compania'; };
  sync(); $('#pc').onchange = sync;
  $('#pf').onsubmit = run(async e => { e.preventDefault();
    const desc = $('#pde').value.trim();
    if (/\b9\d{2}\s?\d{3}\s?\d{3}\b|@\w+\./.test(desc)) return toast('Quita tu número o correo de la descripción: se comparte al desbloquear');
    await API.createService({ cat: $('#pc').value, sub: $('#ps').value, title: $('#pt').value.trim(), desc, price: +$('#pp').value, unit: $('#pu').value, dist: $('#pdi').value });
    toast(hasVerif ? 'Anuncio guardado' : 'Anuncio guardado. Se publica cuando aprobemos tu verificación.'); render(); });
}

// ---------------- Admin: revisión ----------------
VIEWS.admin = async function(){
  if (!S.user || S.user.role !== 'admin') return go('explorar');
  const [vs, us, st] = await Promise.all([API.pendingVerifications(), API.pendingUnlocks(), API.stats()]);
  const pend = vs.filter(v => v.status === 'pendiente');
  $('#app').innerHTML = `<div class="page" style="max-width:900px"><h1>Revisión</h1><p class="lead">Aprueba identidades y confirma pagos de Yape/Plin.</p>
    <div class="stats"><div class="stat"><b>${st.pendientes}</b><span>Verificaciones pendientes</span></div><div class="stat"><b>${us.length}</b><span>Pagos por confirmar</span></div>
      <div class="stat"><b>${soles(st.ingresosDesbloqueo)}</b><span>Ingresos por contactos</span></div><div class="stat"><b>${soles(st.comisiones)}</b><span>Comisiones de reservas</span></div></div>
    <div class="section" style="border:0;margin:0;padding:0"><h4>Pagos de desbloqueo por confirmar</h4>
      ${us.length ? `<div class="list">${us.map(x=>`<div class="bk"><div class="info"><b>${esc(x.client||'Cliente')}</b> → ${esc(x.provider||'Proveedor')}<br><span class="note">${x.method==='yape'?'Yape':'Plin'} · op. ${esc(x.op)} · ${soles(x.amount)}</span></div>
        <div class="row" style="flex:0 1 auto"><button class="btn sm" data-pay="${x.id}">Confirmar</button><button class="btn sm ghost" data-nopay="${x.id}">Rechazar</button></div></div>`).join('')}</div>`
      : `<div class="empty" style="padding:16px">No hay pagos pendientes. Compara cada código de operación con tu app de Yape antes de confirmar.</div>`}</div>
    <div class="section"><h4>Verificaciones de identidad</h4>
      ${pend.length ? pend.map(reviewCard).join('') : '<div class="empty" style="padding:16px">Todo revisado.</div>'}</div>
    ${legal()}</div>`;
  $$('[data-pay]').forEach(b => b.onclick = run(async () => { await API.confirmUnlock(b.dataset.pay, true); toast('Pago confirmado. El cliente ya ve el contacto.'); render(); }));
  $$('[data-nopay]').forEach(b => b.onclick = run(async () => { await API.confirmUnlock(b.dataset.nopay, false); toast('Pago rechazado'); render(); }));
  $$('.rv').forEach(card => {
    const id = card.dataset.v; const boxes = card.querySelectorAll('input[type=checkbox]'); const ap = card.querySelector('[data-ap]');
    const upd = () => ap.disabled = ![...boxes].every(b => b.checked); boxes.forEach(b => b.onchange = upd); upd();
    ap.onclick = run(async () => { await API.reviewVerification(id, 'aprobado', ''); toast('Identidad aprobada. Sus anuncios ya están publicados.'); render(); });
    card.querySelector('[data-rj]').onclick = run(async () => { const n = card.querySelector('textarea').value.trim(); if (!n) return toast('Escribe el motivo del rechazo para el usuario'); await API.reviewVerification(id, 'rechazado', n); toast('Verificación rechazada'); render(); });
  });
};
function reviewCard(v){
  const dniImg = API.file(v.id,'dniFront'), selfie = API.file(v.id,'selfie');
  const draw = (img, label) => img ? `<img alt="${label}" src="${img}">` : avatarSVG({ seed: v.seed, g: v.g, age: v.age });
  const age = v.cul && v.cul.fecha ? daysAgo(v.cul.fecha) : null;
  const culOk = age !== null && age <= C.CUL_VIGENCIA_DIAS;
  const sc = v.score; const scOk = sc != null && sc >= C.PUNTAJE_ROSTRO_MIN;
  return `<div class="rv" data-v="${esc(v.id)}">
    <div class="who">${av(v)}<div><b>${esc(v.name)}</b><small>DNI ${esc(v.dni || '—')}${v.sub ? ' · ' + esc(v.sub) : ''} · enviado ${esc(v.created)}</small></div></div>
    <div class="cmp"><figure><span class="ph">${draw(dniImg,'DNI')}</span>Foto del DNI</figure><figure><span class="ph">${draw(selfie,'Selfie')}</span>Selfie</figure>
      <figure><span class="ph" style="aspect-ratio:3/4;font-size:11px;padding:6px;text-align:center">CUL<br>${esc(v.cul?.numero || '')}</span>Certificado</figure></div>
    <div class="field"><span class="lbl">Coincidencia de rostro ${sc!=null?`· ${(sc*100).toFixed(0)}%`:''} ${v.liveness?'· prueba de vida OK':''}</span>
      <div class="meter"><i style="width:${(sc||0)*100}%;background:${scOk?'var(--ok)':'var(--bad)'}"></i></div>
      ${!scOk ? `<span class="pill bad" style="align-self:flex-start">Bajo el mínimo de ${C.PUNTAJE_ROSTRO_MIN*100}%: pedir nueva selfie</span>` : ''}</div>
    <div class="cul"><span>N.º CUL</span><span>${esc(v.cul?.numero)}</span><span>Emitido</span><span>${esc(v.cul?.fecha)} ${age!==null?`(hace ${age} días)`:''} ${culOk?'':'<b style="color:var(--bad)">· vencido</b>'}</span>
      <span>Ant. policiales</span><span>${esc(v.cul?.policiales)}</span><span>Ant. penales</span><span>${esc(v.cul?.penales)}</span><span>Ant. judiciales</span><span>${esc(v.cul?.judiciales)}</span>
      ${v.colegiatura?`<span>Colegiatura</span><span>${esc(v.colegiatura)}</span>`:''}</div>
    <div class="field"><span class="lbl">Antes de aprobar</span>
      <label class="check"><input type="checkbox"> El nombre y el DNI del CUL coinciden con la foto del DNI.</label>
      <label class="check"><input type="checkbox"> Validé el CUL en empleosperu.gob.pe con su número y el DNI, y el resultado coincide con el PDF.</label>
      <label class="check"><input type="checkbox"> El CUL no muestra antecedentes policiales, penales ni judiciales.</label>
      ${v.colegiatura?'<label class="check"><input type="checkbox"> Encontré la colegiatura activa en el registro del colegio profesional.</label>':''}
      <label class="check"><input type="checkbox"> La selfie y la foto del DNI son la misma persona.</label></div>
    <textarea placeholder="Motivo si rechazas (lo verá el usuario)"></textarea>
    <div class="row"><button class="btn" data-ap>Aprobar</button><button class="btn ghost" data-rj>Rechazar</button></div></div>`;
}

// ---------------- Seguridad ----------------
VIEWS.seguridad = async function(){
  $('#app').innerHTML = `<div class="page"><h1>Seguridad en Yunta</h1><p class="lead">Así verificamos a cada persona antes de que aparezca en la app.</p>
  <div class="rules">
    <div class="rule"><h3>DNI + escaneo de rostro</h3><p>Foto del DNI y selfie con prueba de vida (parpadear, girar). Un sistema biométrico compara ambas caras; si la coincidencia es menor a ${C.PUNTAJE_ROSTRO_MIN*100}%, se rechaza.</p></div>
    <div class="rule"><h3>Certificado Único Laboral</h3><p>Todos suben su CUL del Ministerio de Trabajo, que reúne antecedentes policiales, penales y judiciales. Lo validamos en Empleos Perú con su número y DNI, y no aceptamos certificados de más de ${C.CUL_VIGENCIA_DIAS} días.</p></div>
    <div class="rule"><h3>Colegiatura real</h3><p>Psicólogos y nutricionistas se validan en el registro del C.Ps.P. y del C.N.P.</p></div>
    <div class="rule"><h3>Contacto protegido</h3><p>El WhatsApp y el correo solo se muestran a clientes registrados que pagan el desbloqueo. Así evitamos curiosos y acoso.</p></div>
    <div class="rule"><h3>Primer encuentro en público</h3><p>Las citas de Compañía empiezan en un centro comercial, café o parque. Está prohibido ofrecer o pedir servicios sexuales.</p></div>
    <div class="rule"><h3>Pago protegido</h3><p>Si reservas por la app, retenemos el pago y lo liberamos 24 horas después del servicio.</p></div>
  </div>
  <div class="sos"><p><b>¿Te sientes en riesgo?</b> Llama a la PNP al 105. Violencia: Línea 100. Salud mental: Línea 113, opción 5.</p><button class="btn aji" id="sosb">Probar botón de emergencia</button></div>
  ${legal()}</div>`;
  $('#sosb').onclick = () => toast('En la app real esto avisa a tu contacto de confianza y a soporte con tu ubicación.');
};

function reclamo(){
  openModal(`<header><h2 style="font-size:20px">Libro de Reclamaciones</h2><button class="x" aria-label="Cerrar">×</button></header>
  <p class="note">Conforme al Código de Protección y Defensa del Consumidor (Indecopi). Respondemos en un plazo máximo de 15 días hábiles.</p>
  <form class="form" id="rf" style="border:0;padding:0">
    <div class="row"><div class="field"><label for="rn">Nombre</label><input id="rn" required></div><div class="field"><label for="rd">DNI</label><input id="rd" required maxlength="8"></div></div>
    <div class="field"><label for="rt">Tipo</label><select id="rt"><option>Reclamo (sobre el servicio)</option><option>Queja (sobre la atención)</option></select></div>
    <div class="field"><label for="rx">Detalle</label><textarea id="rx" required></textarea></div>
    <button class="btn" type="submit">Registrar</button></form>`);
  $('#rf').onsubmit = e => { e.preventDefault(); close(); toast('Reclamo registrado. Código R-' + String(Date.now()).slice(-6)); };
}

// ---------------- Inicio ----------------
$('#home').onclick = () => { S.cat = null; S.sub = null; go('explorar'); };
window.addEventListener('yunta:auth', () => refreshUser());
refreshUser().then(render);
})();
