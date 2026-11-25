// Yunta · interfaz v2. Usa window.API (demo o Supabase), window.avatarSVG y window.YUNTA_CONFIG.
(function () {
const C = window.YUNTA_CONFIG;

// ---------------- Íconos ----------------
const P = {
  home:'<path d="M3 11 12 4l9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
  compass:'<circle cx="12" cy="12" r="9"/><path d="m15.5 8.5-2 5-5 2 2-5z"/>',
  heart:'<path d="M12 20s-7.5-4.4-7.5-10A4.3 4.3 0 0 1 12 7.4 4.3 4.3 0 0 1 19.5 10c0 5.6-7.5 10-7.5 10Z"/>',
  key:'<circle cx="8" cy="15" r="4"/><path d="m11 12 8-8M16 7l2 2M14 9l2 2"/>',
  user:'<circle cx="12" cy="8" r="4"/><path d="M4 21c1-4 4.5-6 8-6s7 2 8 6"/>',
  search:'<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
  verified:'<path d="M12 2.5 14.4 4l2.8-.2 1 2.6 2.4 1.5-.7 2.7.7 2.8-2.4 1.4-1 2.7-2.8-.2L12 19l-2.4-1.5-2.8.2-1-2.7-2.4-1.4.7-2.8-.7-2.7 2.4-1.5 1-2.6 2.8.2z" fill="currentColor" stroke="none"/><path d="m8.5 11.5 2.3 2.3 4.7-4.7" stroke="#fff" stroke-width="2.2"/>',
  star:'<path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z" fill="currentColor"/>',
  shield:'<path d="M12 3 5 6v5c0 4.5 3 8 7 10 4-2 7-5.5 7-10V6z"/><path d="m9 12 2 2 4-4"/>',
  crown:'<path d="m3 8 4.5 4L12 5l4.5 7L21 8l-2 10H5z" fill="currentColor"/>',
  sparkle:'<path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6"/>',
  bolt:'<path d="M13 2 4 14h7l-1 8 9-12h-7z" fill="currentColor"/>',
  clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  smile:'<circle cx="12" cy="12" r="9"/><path d="M8.5 14.5a4.5 4.5 0 0 0 7 0M9 9.5h.01M15 9.5h.01"/>',
  eye:'<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
  doc:'<path d="M14 3H6a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8z"/><path d="M14 3v5h5M8 13h8M8 17h5"/>',
  idcard:'<rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="9" cy="11" r="2"/><path d="M6 16c.6-1.6 1.7-2.4 3-2.4s2.4.8 3 2.4M14 10h4M14 13h3"/>',
  face:'<path d="M4 8V5a1 1 0 0 1 1-1h3M16 4h3a1 1 0 0 1 1 1v3M20 16v3a1 1 0 0 1-1 1h-3M8 20H5a1 1 0 0 1-1-1v-3"/><path d="M9 10h.01M15 10h.01M9.5 15a3.5 3.5 0 0 0 5 0"/>',
  wa:'<path d="M3.5 20.5 5 16a8.5 8.5 0 1 1 3.2 3.1z"/><path d="M9 8.5c0 3.5 3 6.5 6.5 6.5l1-1.5-2-1-1 .8a4.6 4.6 0 0 1-2.8-2.8l.8-1-1-2z" fill="currentColor" stroke="none"/>',
  copy:'<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3"/>',
  x:'<path d="M6 6l12 12M18 6 6 18"/>',
  phone:'<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a1 1 0 0 1-1 1A16 16 0 0 1 4 5a1 1 0 0 1 1-1z"/>',
  pin:'<path d="M12 21s-7-6.3-7-11.5A7 7 0 0 1 19 9.5C19 14.7 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>',
  flame:'<path d="M12 21c-4 0-6.5-2.6-6.5-6.2 0-3.6 2.8-5.6 3.8-9.3 2.2 1.4 3 3.4 3 5 1.1-.5 1.8-1.6 2-3 2.5 2 4.2 4.4 4.2 7.3 0 3.6-2.5 6.2-6.5 6.2z" fill="currentColor"/>',
  lock:'<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
  play:'<path d="M7 4.5v15l12-7.5z" fill="currentColor"/>',
  plus:'<path d="M12 5v14M5 12h14"/>',
  check:'<path d="m5 12.5 4.5 4.5L19 7.5"/>',
  sos:'<circle cx="12" cy="12" r="9"/><path d="M12 7v6M12 16.5h.01"/>',
  flag:'<path d="M5 21V4M5 4h11l-2 4 2 4H5"/>',
  chart:'<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
  users:'<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c.6-3.4 3.2-5.4 6.5-5.4s5.9 2 6.5 5.4M16 4.6a3.5 3.5 0 0 1 0 6.8M18.5 14.8c1.7.7 2.8 2.4 3 5.2"/>',
  cap:'<path d="M2 8.5 12 4l10 4.5L12 13 2 8.5Z"/><path d="M6 10.5V16c2 2 10 2 12 0v-5.5M22 8.5V14"/>',
  pulse:'<path d="M12 20s-7.5-4.4-7.5-10A4.3 4.3 0 0 1 12 7.4 4.3 4.3 0 0 1 19.5 10c0 5.6-7.5 10-7.5 10Z"/><path d="M8 12h2.2l1.2-2.4 1.6 4.4 1.2-2H16"/>',
  tool:'<path d="M14.7 6.3a4 4 0 0 0-5.4 5.2L3.5 17.3a1.8 1.8 0 0 0 2.5 2.5l5.8-5.8a4 4 0 0 0 5.2-5.4l-2.5 2.5-2.3-.4-.4-2.3 2.9-2.1Z"/>',
  logout:'<path d="M15 4h4a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-4M10 16l-4-4 4-4M6 12h10"/>'
};
const I = (n, cls = 'i') => `<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${P[n]}</svg>`;

const CATS = [
  {id:'compania',name:'Compañía',desc:'Amigos, eventos, familia',icon:'users',subs:['Amigo para salir','Acompañante a evento','Pareja para reunión familiar','Familiar para ceremonia','Adulto mayor','Caminatas y deporte']},
  {id:'tutoria',name:'Tutorías',desc:'Colegio, pre, idiomas',icon:'cap',subs:['Matemática','Pre-U','Inglés','Quechua','Música','Programación']},
  {id:'salud',name:'Salud',desc:'Psicología, nutrición',icon:'pulse',subs:['Psicología','Nutrición','Coaching']},
  {id:'hogar',name:'Hogar y oficios',desc:'Cocinera, niñera, electricista',icon:'tool',subs:['Cocinera','Niñera','Electricista','Gasfitero','Técnico de PC','Carpintería','Limpieza']}
];
const DISTRITOS = ['Miraflores','San Isidro','Barranco','Santiago de Surco','San Borja','Jesús María','Pueblo Libre','San Miguel','Los Olivos','La Molina','Chorrillos','Callao','Arequipa · Cercado','Cusco · Wanchaq','Trujillo · Centro','Online'];
const DIAS = ['D','L','M','M','J','V','S'];
const ROT = ['salir el viernes','la boda de tu prima','el examen de la UNI','la terma que gotea','acompañar a tu mamá','practicar inglés'];
const TAGS = { rapido:['bolt','Responde rápido'], puntual:['clock','Puntual'], amable:['smile','Amable'], igual:['eye','Igual que en el perfil'] };
const CTAGS = { puntual:'Puntual', respetuoso:'Respetuoso', pago:'Pagó lo acordado' };

const S = { view:'inicio', cat:null, sub:null, q:'', dist:'', filter:null, user:null, wallet:{credits:0}, services:[], favs:[], seen:new Set(), after:null, safety:null };
const $ = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const soles = n => 'S/ ' + Number(n).toFixed(2).replace(/\.00$/, '');
const catOf = id => CATS.find(c => c.id === id);
const avatar = p => avatarSVG({ seed: p.seed, g: p.g, age: p.age });
const av = (p, cls = '') => `<span class="av ${cls}">${avatar(p)}</span>`;
const daysTo = d => Math.ceil((new Date(d + 'T12:00') - Date.now()) / 864e5);
const daysAgo = d => Math.floor((Date.now() - new Date(d + 'T12:00')) / 864e5);
function toast(t){ const el=$('#toast'); el.textContent=t; el.hidden=false; clearTimeout(toast.t); toast.t=setTimeout(()=>el.hidden=true,3200); }
const run = fn => async (...a) => { try { return await fn(...a) } catch (e) { console.error(e); toast(e.message || 'Algo salió mal. Intenta otra vez.') } };
const readFile = f => new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(r.result); r.onerror = rej; r.readAsDataURL(f); });

// ---------------- Prestigio ----------------
function nivel(s){
  if (!s.verified) return 'pendiente';
  const rp = s.n ? (s.tags?.rapido || 0) / s.n : 0;
  const culOk = !s.culVence || daysTo(s.culVence) >= 0;
  const [, c, d, o] = C.NIVELES;
  if (s.oro && culOk && !s.reportes && s.n >= o.n && s.rating >= o.nota && rp >= o.rapido) return 'oro';
  if (!s.reportes && s.n >= d.n && s.rating >= d.nota && rp >= d.rapido) return 'destacado';
  if (s.n >= c.n && s.rating >= c.nota) return 'confiable';
  return 'nuevo';
}
const LV = { pendiente:['flag','En revisión'], nuevo:['sparkle','Nuevo'], confiable:['shield','Confiable'], destacado:['star','Destacado'], oro:['crown','Oro'] };
const lvlBadge = id => `<span class="lvl ${id}">${I(LV[id][0])}${LV[id][1]}</span>`;
const LORDER = { oro:4, destacado:3, confiable:2, nuevo:1, pendiente:0 };
function badgesOf(s){
  const b = [];
  const pct = k => s.n ? (s.tags?.[k] || 0) / s.n : 0;
  if (s.respMin != null && s.respMin <= 15) b.push(['bolt', `Responde en ~${s.respMin} min`]);
  else if (pct('rapido') >= .6) b.push(['bolt', 'Responde rápido']);
  if (pct('puntual') >= .6) b.push(['clock', 'Puntual']);
  if (pct('igual') >= .7) b.push(['eye', 'Igual que en el perfil']);
  if (s.colegiatura) b.push(['idcard', 'Colegiatura verificada']);
  if (s.culVence && daysTo(s.culVence) >= 0) b.push(['doc', 'CUL vigente']);
  if (s.n >= 100) b.push(['users', `+${Math.floor(s.n / 10) * 10} clientes`]);
  if (s.video) b.push(['play', 'Con video']);
  return b;
}
const bdg = ([i, t]) => `<span class="bdg">${I(i)}${esc(t)}</span>`;
const score = s => (s.boosted ? 1000 : 0) + (s.featured ? 500 : 0) + LORDER[nivel(s)] * 50 + s.rating * Math.log10(s.n + 1) * 10;

// ---------------- Navegación ----------------
async function refreshUser(){ S.user = await API.getUser(); S.wallet = await API.wallet(); S.favs = await API.favorites(); renderNav(); }
function renderNav(){
  const u = S.user;
  $('#tabs').innerHTML = [
    ['inicio', I('home'), 'Inicio'], ['descubrir', I('compass'), 'Descubrir'], ['guardados', I('heart'), 'Guardados'], ['planes', I('key'), 'Planes'],
    ['cuenta', u ? `<span class="me">${avatar(u)}</span>` : I('user'), u ? esc(u.name.split(' ')[0]) : 'Ingresar']
  ].map(([v, ic, l]) => `<button data-view="${v}" aria-current="${S.view===v}">${ic}<span>${l}</span>${v==='guardados'&&S.favs.length?`<span class="dot">${S.favs.length}</span>`:''}</button>`).join('');
  $$('#tabs button').forEach(b => b.onclick = () => go(b.dataset.view));
  $('#wallet').innerHTML = u ? `<span class="k">${I('key')}</span>${S.wallet.credits}<span class="lbl2">&nbsp;${S.wallet.credits===1?'contacto':'contactos'}</span>` : '';
  $('#wallet').hidden = !u;
  $('#modeTag').textContent = API.mode === 'demo' ? 'Demo' : 'Beta';
}
function go(v){ S.view = v; renderNav(); render(); window.scrollTo(0, 0); }
function requireLogin(next, msg){ if (S.user) return true; S.after = next; close(); go('cuenta'); toast(msg || 'Inicia sesión para continuar'); return false; }
const VIEWS = {};
let rotTimer;
async function render(){ clearInterval(rotTimer); await VIEWS[S.view](); }

// ---------------- Inicio ----------------
function card(s){
  const lv = nivel(s); const fav = S.favs.includes(s.id);
  return `<article class="card" data-cat="${s.cat}">
    <button class="heart" data-fav="${s.id}" aria-pressed="${fav}" aria-label="${fav?'Quitar de guardados':'Guardar'}">${I('heart')}</button>
    ${s.boosted ? `<span class="ribbon boost">${I('flame')} Boost</span>` : s.featured ? '<span class="ribbon">Destacado</span>' : ''}
    <button class="open" data-open="${s.id}" style="all:unset;cursor:pointer;display:flex;flex-direction:column;flex:1">
      <div class="cover"><div class="pattern"></div><span class="avw">${avatar(s)}</span></div>
      ${s.online ? '<span class="on-dot" title="En línea"></span>' : ''}
      <div class="body">
        <div style="display:flex;justify-content:space-between;align-items:center;gap:8px"><span class="nm">${esc(s.name)}${s.verified?I('verified'):''}</span>${lvlBadge(lv)}</div>
        <span class="sub">${esc(s.sub)} · ${esc(s.dist)}</span>
        <h3>${esc(s.title)}</h3>
        <div class="badges">${badgesOf(s).slice(0,2).map(bdg).join('')}</div>
        <div class="foot"><span class="price">S/ ${s.price}<small> /${esc(s.unit)}</small></span>
          <span class="stars">${s.n ? `${I('star')}<b>${s.rating.toFixed(1)}</b> (${s.n})` : 'Nuevo'}</span></div>
      </div>
    </button>
  </article>`;
}
function bindCards(root = document){
  root.querySelectorAll('[data-open]').forEach(b => b.onclick = () => perfil(S.services.find(s => s.id === b.dataset.open)));
  root.querySelectorAll('[data-fav]').forEach(b => b.onclick = run(async e => { e.stopPropagation(); if (!requireLogin(null, 'Inicia sesión para guardar')) return;
    const on = await API.toggleFavorite(b.dataset.fav); S.favs = await API.favorites(); b.setAttribute('aria-pressed', on); renderNav(); toast(on ? 'Guardado en tus favoritos' : 'Quitado de guardados'); }));
}
const FILTERS = [['online','En línea ahora','eye'],['oro','Nivel Oro','crown'],['rapido','Responde rápido','bolt'],['top','Mejor valorados','star'],['barato','Más económicos','key'],['video','Con video','play']];
VIEWS.inicio = async function(){
  S.services = await API.listServices();
  drawInicio();
};
function drawInicio(){
  const all = S.services.filter(s => s.active);
  let list = all.filter(s => (!S.cat||s.cat===S.cat) && (!S.sub||s.sub===S.sub) && (!S.dist||s.dist===S.dist) &&
    (!S.q || (s.title+' '+s.desc+' '+s.sub+' '+s.name).toLowerCase().includes(S.q.toLowerCase())));
  const f = S.filter;
  if (f === 'online') list = list.filter(s => s.online);
  if (f === 'oro') list = list.filter(s => nivel(s) === 'oro');
  if (f === 'rapido') list = list.filter(s => badgesOf(s).some(b => b[0] === 'bolt'));
  if (f === 'video') list = list.filter(s => s.video);
  list.sort(f === 'top' ? (a,b) => b.rating - a.rating || b.n - a.n : f === 'barato' ? (a,b) => a.price - b.price : (a,b) => score(b) - score(a));
  const filtering = S.cat || S.q || S.dist || f;
  const online = all.filter(s => s.online).sort((a,b) => score(b) - score(a));
  const top = [...all].sort((a,b) => b.rating * Math.log10(b.n+1) - a.rating * Math.log10(a.n+1)).slice(0, 8);
  const c = S.cat && catOf(S.cat);
  $('#app').innerHTML = `
  <section class="hero">
    <h1>Tu yunta para <span class="rot" id="rot"><span>${ROT[0]}</span></span></h1>
    <p>Personas reales y verificadas para acompañarte, enseñarte o ayudarte en casa. Elige, desbloquea su WhatsApp y coordinan directo.</p>
    <div class="search" role="search">
      <label class="q">${I('search')}<input id="q" placeholder="Padrino, inglés, terma, psicóloga…" value="${esc(S.q)}" aria-label="Buscar"></label>
      <select id="dist" aria-label="Distrito"><option value="">Todo el Perú</option>${DISTRITOS.map(d=>`<option ${d===S.dist?'selected':''}>${d}</option>`).join('')}</select>
    </div>
    <div class="trust"><span>${I('idcard')} DNI y rostro verificados</span><span>${I('doc')} Certificado Único Laboral</span><span>${I('shield')} Cita segura</span></div>
  </section>
  ${online.length ? `<div class="stories" aria-label="En línea ahora">${online.map(s=>`<button class="story" data-cat="${s.cat}" data-open="${s.id}"><span class="ring"><span>${avatar(s)}</span><i class="live">EN LÍNEA</i></span><b>${esc(s.name.replace(/^(Ps\.|Lic\.|Don)\s/,'').split(' ')[0])}</b></button>`).join('')}</div>` : ''}
  <div class="section-h"><h2>¿Qué necesitas?</h2></div>
  <div class="cats">${CATS.map(k=>`<button class="cat" data-cat="${k.id}" data-c="${k.id}" aria-pressed="${S.cat===k.id}"><span class="ic">${I(k.icon)}</span><b>${k.name}</b><span>${all.filter(s=>s.cat===k.id).length} personas · ${k.desc}</span></button>`).join('')}</div>
  ${c ? `<div class="chips">${['',...c.subs].map(x=>`<button class="chip" data-sub="${esc(x)}" aria-pressed="${(S.sub||'')===x}">${x?esc(x):'Todo '+c.name.toLowerCase()}</button>`).join('')}</div>` : ''}
  <div class="chips">${FILTERS.map(([id,l,ic])=>`<button class="chip" data-f="${id}" aria-pressed="${f===id}">${I(ic)}${l}</button>`).join('')}</div>
  ${!filtering ? `<div class="section-h"><h2>Top de la semana</h2><small>Por nota y número de reseñas</small></div>
    <div class="rank">${top.map((s,i)=>`<button class="rk" data-cat="${s.cat}" data-open="${s.id}"><span class="num">${i+1}</span>${av(s)}<span><b>${esc(s.name)}</b><small>${esc(s.sub)} · ${I('star')} ${s.rating.toFixed(1)}</small><br>${lvlBadge(nivel(s))}</span></button>`).join('')}</div>` : ''}
  <div class="section-h"><h2>${filtering ? `${list.length} ${list.length===1?'resultado':'resultados'}` : 'Todos'}</h2>${filtering?'<button class="link" id="clear">Quitar filtros</button>':''}</div>
  ${list.length ? `<div class="grid">${list.map(card).join('')}</div>` : `<div class="empty">No hay resultados con esos filtros. Prueba otro distrito o quita la búsqueda.</div>`}
  ${legal()}`;
  let k = 0; rotTimer = setInterval(() => { const r = $('#rot'); if (!r) return clearInterval(rotTimer); k = (k+1) % ROT.length; r.innerHTML = `<span>${ROT[k]}</span>`; }, 2400);
  const q = $('#q'); q.oninput = e => { S.q = e.target.value; const p = q.selectionStart; drawInicio(); const n = $('#q'); n.focus(); n.setSelectionRange(p,p); };
  $('#dist').onchange = e => { S.dist = e.target.value; drawInicio(); };
  $$('.cat').forEach(b => b.onclick = () => { S.cat = S.cat===b.dataset.c ? null : b.dataset.c; S.sub = null; drawInicio(); });
  $$('[data-sub]').forEach(b => b.onclick = () => { S.sub = b.dataset.sub || null; drawInicio(); });
  $$('[data-f]').forEach(b => b.onclick = () => { S.filter = S.filter===b.dataset.f ? null : b.dataset.f; drawInicio(); });
  const cl = $('#clear'); if (cl) cl.onclick = () => { S.cat=S.sub=S.filter=null; S.q=S.dist=''; drawInicio(); };
  bindCards();
}
function legal(){ return `<footer class="legal"><span>Yunta · Lima, Perú</span><button class="link" data-act="reclamo">Libro de Reclamaciones</button><span>Datos protegidos según Ley N.º 29733</span><button class="link" data-act="seguridad">Seguridad</button></footer>`; }
document.addEventListener('click', e => { const a = e.target.closest('[data-act]'); if (!a) return;
  if (a.dataset.act === 'reclamo') reclamo(); if (a.dataset.act === 'seguridad') go('seguridad'); });

// ---------------- Modal ----------------
function openModal(html, cat){ $('#modal').innerHTML = `<div class="scrim"><div class="sheet" role="dialog" aria-modal="true" ${cat?`data-cat="${cat}"`:''}><button class="x" aria-label="Cerrar">${I('x')}</button>${html}</div></div>`;
  const sc = $('.scrim'); sc.onclick = e => { if (e.target === sc) close(); }; $$('.x').forEach(x => x.onclick = close); }
function close(){ if (typeof stopCam === 'function') stopCam(); if (typeof payPoll !== 'undefined') clearInterval(payPoll); $('#modal').innerHTML = ''; }
document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });

// ---------------- Perfil ----------------
async function perfil(s){
  if (!s) return;
  API.addView(s.id);
  const c = catOf(s.cat); const lv = nivel(s);
  const [ct, revs] = await Promise.all([API.getContact(s.providerId), API.reviews(s.providerId)]);
  const pct = k => s.n ? Math.round((s.tags?.[k]||0) / s.n * 100) : 0;
  const fav = S.favs.includes(s.id);
  openModal(`
    <div class="pcover"><div class="pattern"></div></div>
    <div class="pad" style="padding-top:0">
      <div class="phead"><span class="avw">${avatar(s)}${s.online?'<span class="on-dot"></span>':''}</span>
        <div style="flex:1 1 220px;min-width:0;padding-bottom:6px">
          <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:6px">${lvlBadge(lv)}${s.online?'<span class="pill ok">En línea</span>':''}</div>
          <h2>${esc(s.name)}${s.verified?I('verified'):''}</h2>
          <span class="note">${esc(c.name)} · ${esc(s.sub)} · ${I('pin')} ${esc(s.dist)} · ${s.age} años</span></div>
      </div>
      <div class="stat-row">
        <div><b>${s.n?s.rating.toFixed(1):'—'}</b><span>Nota (${s.n} reseñas)</span></div>
        <div><b>${s.n?pct('rapido')+'%':'—'}</b><span>Dicen que responde rápido</span></div>
        <div><b>${s.n?pct('puntual')+'%':'—'}</b><span>Dicen que es puntual</span></div>
        <div><b>${s.views||0}</b><span>Visitas al perfil</span></div>
      </div>
      <h3 style="font-size:20px;margin-top:14px">${esc(s.title)}</h3>
      <p style="margin:8px 0 0">${esc(s.desc)}</p>
      ${s.video?`<div class="block"><h4>Video de presentación</h4><video class="video" src="${esc(s.video)}" controls playsinline></video></div>`:''}
      ${badgesOf(s).length?`<div class="badges" style="margin-top:12px">${badgesOf(s).map(bdg).join('')}</div>`:''}
      <div class="block"><h4>Precio y extras</h4><div class="extras">
        <div><b>${esc(s.sub)}</b><b>S/ ${s.price} /${esc(s.unit)}</b></div>
        ${(s.extras||[]).map(e=>`<div><span>+ ${esc(e.name)}</span><span>${e.price?soles(e.price):'Incluido'}</span></div>`).join('')}</div>
        <span class="note">Lo pagas directamente a ${esc(s.name.split(' ')[0])} cuando coordinen.</span></div>
      <div class="block"><h4>Disponibilidad</h4><div class="week">${DIAS.map((d,i)=>`<span class="${(s.days||[]).includes(i)?'on':''}">${d}</span>`).join('')}</div>${s.hours?`<span class="note">${I('clock')} ${esc(s.hours)}</span>`:''}</div>
      ${s.limits || s.cat==='compania' ? `<div class="block"><h4>Lo que no hago</h4><div class="limits">${s.cat==='compania'?'Solo compañía social, sin contacto íntimo. Primer encuentro en un lugar público. ':''}${esc(s.limits||'')}</div></div>` : ''}
      <div class="block"><h4>Verificado por Yunta</h4><div class="trustlist">
        <div>${I('idcard')} DNI validado</div><div>${I('face')} Rostro y prueba de vida</div>
        ${s.sub==='Niñera'?`<div class="alert" style="margin:6px 0"><b>Cuidado de niños:</b> exigimos CUL sin antecedentes renovado cada 90 días, verificación de rostro y referencias. Recomendamos una entrevista previa con tus hijos presentes.</div>`:''}
        <div>${I('doc')} CUL sin antecedentes${s.culVence?` · vence en ${Math.max(0,daysTo(s.culVence))} días`:''}</div>
        ${s.colegiatura?`<div>${I('verified')} ${esc(s.colegiatura)}</div>`:`<div>${I('shield')} Cita segura disponible</div>`}</div></div>
      <div class="block"><h4>Reseñas</h4>${revs.length?revs.slice(0,6).map(r=>`<div class="rev"><div class="h"><b style="color:var(--fg)">${esc(r.author)}</b><span>${'★'.repeat(r.rating)}${'☆'.repeat(5-r.rating)} · ${esc(r.date)}</span></div>${r.comment?esc(r.comment):''}<div class="badges">${(r.tags||[]).filter(t=>TAGS[t]).map(t=>bdg(TAGS[t])).join('')}</div></div>`).join(''):'<span class="note">Aún no tiene reseñas.</span>'}</div>
      <div class="row" style="margin-top:12px"><button class="btn line sm" id="pfav">${I('heart')} ${fav?'Guardado':'Guardar'}</button><button class="btn line sm" id="prep">${I('flag')} Reportar</button></div>
    </div>
    <div class="cta" id="cta"></div>`, s.cat);
  drawCta(s, ct);
  $('#pfav').onclick = run(async () => { if (!requireLogin(() => perfil(s))) return; await API.toggleFavorite(s.id); S.favs = await API.favorites(); renderNav(); perfil(s); });
  $('#prep').onclick = () => { if (requireLogin(() => perfil(s))) reportar(s); };
}
const waLink = (num, s) => `https://wa.me/51${String(num).replace(/\D/g,'').slice(-9)}?text=${encodeURIComponent(`Hola ${s.name.replace(/^(Ps\.|Lic\.|Don)\s/,'').split(' ')[0]}, te vi en Yunta (${s.sub}). ¿Tienes disponibilidad?`)}`;
function drawCta(s, ct){
  const box = $('#cta'); if (!box) return;
  if (ct.unlocked) {
    box.innerHTML = `<div class="contact-open grow"><span class="lbl">WhatsApp de ${esc(s.name.split(' ')[0])}</span><span class="num">${esc(ct.whatsapp)}</span><span class="note" style="overflow-wrap:anywhere">${esc(ct.email)}</span></div>
      <div style="display:flex;flex-direction:column;gap:8px;flex:1 1 200px">
        <a class="btn wa" href="${waLink(ct.whatsapp, s)}" target="_blank" rel="noopener">${I('wa')} Escribir por WhatsApp</a>
        <div class="row"><button class="btn ghost sm" id="cp">${I('copy')} Copiar</button><button class="btn ghost sm" id="safe">${I('shield')} Cita segura</button><button class="btn ghost sm" id="rv">${I('star')} Calificar</button></div></div>`;
    $('#cp').onclick = async () => { try { await navigator.clipboard.writeText(ct.whatsapp.replace(/\s/g,'')); toast('Número copiado'); } catch (e) { toast('Mantén presionado el número para copiarlo'); } };
    $('#safe').onclick = () => citaSegura(s);
    $('#rv').onclick = () => calificar(s);
    return;
  }
  const cr = S.wallet.credits || 0;
  box.innerHTML = `<div class="grow"><span class="price">S/ ${s.price}<small> /${esc(s.unit)}</small></span><br><span class="note">${I('lock')} WhatsApp ${esc(ct.whatsapp)}</span></div>
    ${!S.user ? `<button class="btn big" id="unl">${I('key')} Ingresa para ver su contacto</button>` :
      cr > 0 ? `<button class="btn big aji" id="unl">${I('key')} Ver WhatsApp · usa 1 de tus ${cr}</button>` :
      `<button class="btn big" id="unl">${I('key')} Elegir un plan para ver su contacto</button>`}`;
  $('#unl').onclick = run(async () => {
    if (!requireLogin(() => perfil(s), 'Inicia sesión para ver contactos')) return;
    if (!(S.wallet.credits > 0)) { close(); go('planes'); toast('Te quedaste sin contactos. Elige un plan.'); return; }
    const r = await API.unlock(s.providerId);
    if (r === 'ok') { S.wallet = await API.wallet(); renderNav(); confetti(); toast('¡Contacto desbloqueado!'); drawCta(s, await API.getContact(s.providerId)); }
    else if (r === 'sin_creditos') { close(); go('planes'); }
    else if (r === 'reputacion') toast(`Tu nota como cliente está bajo ${C.CLIENTE_NOTA_MIN}. No puedes contactar servicios de Compañía por ahora.`);
    else requireLogin(() => perfil(s));
  });
}

// ---------------- Calificar / reportar ----------------
function starPicker(id, init = 5){ return `<div class="starpick" id="${id}" data-v="${init}">${[1,2,3,4,5].map(n=>`<button type="button" data-n="${n}" class="${n<=init?'on':''}" aria-label="${n} estrellas">${I('star')}</button>`).join('')}</div>`; }
function bindStars(id){ const el = $('#'+id); el.querySelectorAll('button').forEach(b => b.onclick = () => { el.dataset.v = b.dataset.n; el.querySelectorAll('button').forEach(x => x.classList.toggle('on', +x.dataset.n <= +b.dataset.n)); }); }
function bindTags(id){ $('#'+id).querySelectorAll('button').forEach(b => b.onclick = () => b.setAttribute('aria-pressed', b.getAttribute('aria-pressed') !== 'true')); }
const pickedTags = id => [...$('#'+id).querySelectorAll('[aria-pressed="true"]')].map(b => b.dataset.t);
function calificar(s){
  openModal(`<div class="pad"><h2 style="font-size:22px;margin-right:40px">¿Cómo te fue con ${esc(s.name.split(' ')[0])}?</h2>
    <p class="note">Tu reseña ayuda a otros y suma a su nivel en Yunta.</p>
    ${starPicker('st')}
    <div class="field" style="margin-top:12px"><span class="lbl">¿Qué destacas?</span><div class="tagpick" id="tg">${Object.entries(TAGS).map(([k,[i,t]])=>`<button type="button" data-t="${k}" aria-pressed="false">${I(i)} ${t}</button>`).join('')}</div></div>
    <div class="field" style="margin-top:12px"><label for="cm">Comentario (opcional)</label><textarea id="cm" maxlength="300"></textarea></div>
    <button class="btn big" id="send" style="width:100%;margin-top:14px">Publicar reseña</button></div>`, s.cat);
  bindStars('st'); bindTags('tg');
  $('#send').onclick = run(async () => { await API.reviewProvider(s.providerId, { rating: +$('#st').dataset.v, tags: pickedTags('tg'), comment: $('#cm').value.trim() }); S.services = await API.listServices(); toast('¡Gracias! Tu reseña ya está publicada.'); close(); if (S.view !== 'inicio') render(); });
}
function reportar(s){
  openModal(`<div class="pad"><h2 style="font-size:22px;margin-right:40px">Reportar a ${esc(s.name)}</h2>
    <p class="note">El equipo revisa cada reporte en menos de 24 horas. Si hay un delito, lo derivamos a la PNP.</p>
    <div class="field"><label for="rr">Motivo</label><select id="rr"><option>Pidió o insinuó servicios íntimos</option><option>No es la persona de las fotos</option><option>Pidió pagos por adelantado sospechosos</option><option>Fue agresivo o irrespetuoso</option><option>Otro</option></select></div>
    <div class="field" style="margin-top:10px"><label for="rd">Detalle</label><textarea id="rd"></textarea></div>
    <button class="btn big" id="rs" style="width:100%;margin-top:14px">Enviar reporte</button></div>`);
  $('#rs').onclick = run(async () => { await API.report(s.providerId, $('#rr').value + ': ' + $('#rd').value.trim()); close(); toast('Reporte enviado. Gracias por cuidar la comunidad.'); });
}

// ---------------- Descubrir (swipe) ----------------
VIEWS.descubrir = async function(){
  S.services = await API.listServices();
  drawDeck();
};
function drawDeck(){
  const pool = S.services.filter(s => s.active && !S.seen.has(s.id) && (!S.cat || s.cat === S.cat)).sort((a,b) => score(b) - score(a));
  $('#app').innerHTML = `<div class="deck-wrap"><div style="text-align:center"><h1 style="font-size:30px">Descubrir</h1><p class="lead" style="margin:4px 0 0">Desliza a la derecha para guardar, a la izquierda para pasar.</p></div>
    <div class="chips" style="justify-content:center">${[{id:'',name:'Todo'},...CATS].map(k=>`<button class="chip" data-dc="${k.id}" aria-pressed="${(S.cat||'')===k.id}">${k.name}</button>`).join('')}</div>
    <div class="deck" id="deck">${pool.length ? pool.slice(0,3).reverse().map((s,i,arr)=>deckCard(s, i === arr.length-1)).join('') : `<div class="empty" style="position:absolute;inset:0;display:grid;place-items:center">Viste a todos por ahora.<br><br><button class="btn" id="again">Volver a empezar</button></div>`}</div>
    ${pool.length?`<div class="deck-actions"><button class="round pass" id="bp" aria-label="Pasar">${I('x')}</button><button class="round go" id="bg" aria-label="Ver perfil">${I('key')}</button><button class="round save" id="bs" aria-label="Guardar">${I('heart')}</button></div>
    <span class="deck-hint">Usa ← y → del teclado</span>`:''}</div>`;
  $$('[data-dc]').forEach(b => b.onclick = () => { S.cat = b.dataset.dc || null; drawDeck(); });
  const ag = $('#again'); if (ag) ag.onclick = () => { S.seen.clear(); drawDeck(); };
  if (!pool.length) return;
  const top = $('#deck .dcard:last-child'); const s = pool[0];
  const decide = run(async dir => {
    top.style.transform = `translateX(${dir*130}%) rotate(${dir*22}deg)`; top.style.opacity = 0;
    S.seen.add(s.id);
    if (dir > 0 && S.user && !S.favs.includes(s.id)) { await API.toggleFavorite(s.id); S.favs = await API.favorites(); renderNav(); toast(`${s.name.split(' ')[0]} guardado`); }
    else if (dir > 0 && !S.user) toast('Ingresa para guardar tus favoritos');
    setTimeout(drawDeck, 260);
  });
  $('#bp').onclick = () => decide(-1); $('#bs').onclick = () => decide(1); $('#bg').onclick = () => perfil(s);
  document.onkeydown = e => { if (S.view !== 'descubrir' || $('#modal').innerHTML) return; if (e.key === 'ArrowLeft') decide(-1); if (e.key === 'ArrowRight') decide(1); };
  let x0 = null, dx = 0;
  top.onpointerdown = e => { x0 = e.clientX; dx = 0; top.classList.add('drag'); top.setPointerCapture(e.pointerId); };
  top.onpointermove = e => { if (x0 === null) return; dx = e.clientX - x0; top.style.transform = `translateX(${dx}px) rotate(${dx/18}deg)`;
    top.querySelector('.stamp.save').style.opacity = Math.max(0, dx/120); top.querySelector('.stamp.pass').style.opacity = Math.max(0, -dx/120); };
  top.onpointerup = () => { top.classList.remove('drag'); if (Math.abs(dx) > 110) decide(Math.sign(dx)); else { top.style.transform = ''; top.querySelectorAll('.stamp').forEach(x => x.style.opacity = 0); if (Math.abs(dx) < 6) perfil(s); } x0 = null; };
}
function deckCard(s, isTop){
  const c = catOf(s.cat);
  return `<div class="dcard" data-cat="${s.cat}" style="${isTop?'':'transform:scale(.95) translateY(14px);filter:brightness(.97)'}">
    <span class="stamp save">GUARDAR</span><span class="stamp pass">PASAR</span>
    <div class="top"><div class="pattern"></div><span class="big">${avatar(s)}</span></div>
    <div class="info"><div style="display:flex;gap:6px;flex-wrap:wrap">${lvlBadge(nivel(s))}${s.online?'<span class="pill ok">En línea</span>':''}<span class="pill">${esc(c.name)}</span></div>
      <h2>${esc(s.name.split(' ').slice(0,2).join(' '))}, ${s.age}</h2>
      <span class="note">${esc(s.sub)} · ${esc(s.dist)} · S/ ${s.price}/${esc(s.unit)} · ${I('star')} ${s.rating.toFixed(1)}</span>
      <p>${esc(s.title)}. ${esc(s.desc)}</p></div></div>`;
}

// ---------------- Guardados ----------------
VIEWS.guardados = async function(){
  S.services = await API.listServices();
  const list = S.services.filter(s => S.favs.includes(s.id));
  $('#app').innerHTML = `<h1 style="font-size:32px">Guardados</h1><p class="lead">Las personas que te gustaron, para decidir con calma.</p>
    ${!S.user ? `<div class="empty">Ingresa para guardar a tus favoritos.<br><br><button class="btn" id="li">Ingresar</button></div>` :
      list.length ? `<div class="grid">${list.map(card).join('')}</div>` : `<div class="empty">Aún no guardas a nadie. Toca el corazón en un perfil o desliza a la derecha en Descubrir.<br><br><button class="btn" id="dc">${I('compass')} Ir a Descubrir</button></div>`}
    ${legal()}`;
  const li = $('#li'); if (li) li.onclick = () => go('cuenta');
  const dc = $('#dc'); if (dc) dc.onclick = () => go('descubrir');
  bindCards();
};

// ---------------- Planes ----------------
VIEWS.planes = async function(){
  const w = S.wallet; const maxC = Math.max(w.credits, w.plan ? w.plan.contactos : 5);
  $('#app').innerHTML = `<div style="max-width:1100px">
    <div class="panel" style="flex-direction:row;align-items:center;gap:20px;flex-wrap:wrap;margin-bottom:28px">
      <div class="meter-ring" style="--p:${S.user ? Math.min(100, w.credits / maxC * 100) : 0}"><div><b>${S.user ? w.credits : '—'}</b><span>contactos<br>disponibles</span></div></div>
      <div style="flex:1 1 260px"><h1 style="font-size:30px">Elige cuántas personas quieres contactar</h1>
        <p class="lead" style="margin:6px 0 0">Cada contacto te muestra el WhatsApp y el correo de una persona verificada, para siempre. El servicio lo coordinan y lo pagan directo entre ustedes.${S.user && w.plan ? ` Tu plan <b>${esc(w.plan.nombre)}</b> se renueva el ${esc(w.renews || '')}.` : S.user ? '' : ` Al registrarte te regalamos ${C.CONTACTOS_BIENVENIDA} contacto.`}</p></div>
    </div>
    <div class="plans">${C.PLANES.map(p=>`<div class="plan ${p.top?'top':''}">${p.top?`<span class="flag">${esc(p.nota)}</span>`:''}
      <b style="font-size:18px">${esc(p.nombre)}</b>
      <div class="big">${p.contactos}<small> ${p.contactos===1?'contacto':'contactos'}</small></div>
      <ul><li>${I('check')} WhatsApp y correo visibles</li><li>${I('check')} ${p.periodo?'Se renuevan cada mes':'Sin suscripción'}</li>${(p.extras||[]).map(x=>`<li>${I('check')} ${esc(x)}</li>`).join('')}</ul>
      <div class="pr">${soles(p.precio)}<small>${p.periodo?' / '+p.periodo:''}</small><br><small>${(p.precio/p.contactos).toFixed(2).replace('.',',')} soles por contacto</small></div>
      <button class="btn ${p.top?'':'ghost'}" data-buy="${p.id}">${p.periodo?'Suscribirme':'Comprar'}</button></div>`).join('')}</div>
    <div class="section-h"><h2>¿Ofreces servicios?</h2><small>Para quien publica</small></div>
    <div class="two">${C.IMPULSOS.map(p=>`<div class="panel"><b style="font-size:18px;display:flex;gap:8px;align-items:center">${I(p.id==='boost'?'flame':'star')} ${esc(p.nombre)} · ${soles(p.precio)}</b><span class="note">${esc(p.desc)}</span><button class="btn line sm" data-imp="${p.id}" style="align-self:flex-start">Activar desde mi panel</button></div>`).join('')}</div>
    <p class="note" style="margin-top:18px">Pagas con Yape o Plin y confirmamos en minutos. Publicar tu perfil siempre es gratis.</p>
    ${legal()}</div>`;
  $$('[data-buy]').forEach(b => b.onclick = () => { const p = C.PLANES.find(x => x.id === b.dataset.buy); if (requireLogin(() => go('planes'), 'Crea tu cuenta para comprar un plan')) comprar(p); });
  $$('[data-imp]').forEach(b => b.onclick = () => { if (requireLogin(() => go('cuenta'))) go('cuenta'); });
};
const METODO_TXT = { yape_codigo: 'Yape con código', qr: 'QR Yape o Plin', manual: 'Código de operación' };
let payPoll = null;
function comprar(p, serviceId){
  const metodos = (C.PAGOS && C.PAGOS.METODOS) || ['manual'];
  let actual = metodos[0];
  openModal(`<div class="pad"><h2 style="font-size:22px;margin-right:40px">${esc(p.nombre)} · ${soles(p.precio)}</h2>
    <p class="note">${p.contactos ? `${p.contactos} ${p.contactos===1?'contacto':'contactos'}${p.periodo?' cada mes':''}` : esc(p.desc)}</p>
    ${metodos.length > 1 ? `<div class="seg seg${metodos.length}" style="margin-top:10px">${metodos.map(m=>`<button type="button" data-m="${m}" aria-pressed="${m===actual}">${METODO_TXT[m]}</button>`).join('')}</div>` : ''}
    <div id="paybox" style="margin-top:14px"></div></div>`);
  const draw = () => { clearInterval(payPoll); ({ yape_codigo: pagoCodigo, qr: pagoQR, manual: pagoManual })[actual](p, serviceId); };
  $$('[data-m]').forEach(b => b.onclick = () => { actual = b.dataset.m; $$('[data-m]').forEach(x => x.setAttribute('aria-pressed', x === b)); draw(); });
  draw();
}
async function pagoExitoso(){ clearInterval(payPoll); close(); S.wallet = await API.wallet(); renderNav(); confetti(); toast('¡Pago confirmado!'); if (['planes','cuenta'].includes(S.view)) render(); }
function pagoCodigo(p, serviceId){
  $('#paybox').innerHTML = `<ol class="paysteps"><li>Abre Yape y entra al menú.</li><li>Toca <b>Código de aprobación</b> y copia los 6 dígitos.</li><li>Escríbelos aquí: vence en 2 minutos.</li></ol>
    <div class="row"><div class="field"><label for="yc">Celular con Yape</label><input id="yc" inputmode="tel" maxlength="9" placeholder="9XX XXX XXX" autocomplete="tel"></div>
      <div class="field"><label for="yo">Código de aprobación</label><input id="yo" inputmode="numeric" maxlength="6" placeholder="6 dígitos" autocomplete="one-time-code"></div></div>
    <button class="btn big" id="ypay" style="width:100%;margin-top:14px">Pagar ${soles(p.precio)} con Yape</button>
    <p class="note" style="margin-top:8px">El pago se confirma al instante. Máximo S/ 2,000 por pago.${API.mode==='demo'?' Demo: cualquier código funciona menos 000000.':''}</p>`;
  $('#ypay').onclick = run(async () => {
    const cel = $('#yc').value.replace(/\s/g,''), cod = $('#yo').value.trim();
    if (!/^9\d{8}$/.test(cel)) return toast('Escribe tu celular de 9 dígitos');
    if (!/^\d{6}$/.test(cod)) return toast('El código de aprobación tiene 6 dígitos');
    const b = $('#ypay'); b.disabled = true; b.textContent = 'Cobrando…';
    try { await API.payYapeCode(p.id, { phone: cel, code: cod, serviceId }); await pagoExitoso(); }
    catch (e) { b.disabled = false; b.textContent = `Pagar ${soles(p.precio)} con Yape`; toast(e.message); }
  });
}
function pagoQR(p, serviceId){
  $('#paybox').innerHTML = `<ol class="paysteps"><li>Generamos un QR con un monto exacto solo para ti.</li><li>Págalo con Yape, Plin o la app de tu banco.</li><li>Se confirma solo en segundos. No necesitas enviar captura.</li></ol>
    <button class="btn big" id="qgo" style="width:100%">Generar mi QR</button>`;
  $('#qgo').onclick = run(async () => {
    const r = await API.createQR(p.id, { serviceId });
    const fin = Date.now() + (C.PAGOS.QR_MINUTOS || 20) * 60e3;
    $('#paybox').innerHTML = `<div class="qrpay"><canvas id="qr" width="168" height="168"></canvas>
      <div style="display:flex;flex-direction:column;gap:6px;min-width:0"><span class="lbl">Paga exactamente</span><span class="amount">${soles(r.amount)}</span>
        <span class="note">A ${esc(C.YAPE_TITULAR)} · ${esc(C.YAPE_NUMERO)}${API.mode==='demo'?' (demo)':''}</span>
        <span class="note">Los céntimos identifican tu compra: si pagas otro monto no se confirmará solo.</span></div></div>
      <div class="waiting"><span class="spin"></span><span id="qwait">Esperando tu pago…</span><span class="note" id="qtime" style="margin-left:auto"></span></div>`;
    drawQR(168);
    payPoll = setInterval(run(async () => {
      const left = fin - Date.now(); const t = $('#qtime'); if (!t) return clearInterval(payPoll);
      t.textContent = left > 0 ? `${Math.floor(left/60e3)}:${String(Math.floor(left%60e3/1e3)).padStart(2,'0')}` : 'Vencido';
      if (left <= 0) { clearInterval(payPoll); $('#qwait').textContent = 'El QR venció. Genera uno nuevo.'; return; }
      const st = await API.purchaseStatus(r.id);
      if (st === 'pagado') { $('#qwait').textContent = '¡Pago recibido!'; setTimeout(pagoExitoso, 600); clearInterval(payPoll); }
    }), 3000);
  });
}
function pagoManual(p, serviceId){
  let method = 'yape';
  $('#paybox').innerHTML = `<div class="seg"><button type="button" data-p="yape" aria-pressed="true">Yape</button><button type="button" data-p="plin" aria-pressed="false">Plin</button></div>
    <div class="panel" style="flex-direction:row;align-items:center;margin-top:12px;background:var(--sunk);border:0"><canvas id="qr" width="84" height="84" style="width:84px;height:84px;border-radius:10px;background:#fff;flex:none"></canvas>
      <div><b id="pnum">Yape a ${esc(C.YAPE_TITULAR)}</b><br><span class="note">${esc(C.YAPE_NUMERO)}${API.mode==='demo'?' (demo)':''} · paga y copia el código de operación. Lo revisa una persona.</span></div></div>
    <div class="field" style="margin-top:12px"><label for="op">Código de operación</label><input id="op" inputmode="numeric" placeholder="Ej. 04821937" autocomplete="off"></div>
    <button class="btn big" id="paid" style="width:100%;margin-top:14px">Ya pagué</button>`;
  drawQR();
  $$('[data-p]').forEach(b => b.onclick = () => { method = b.dataset.p; $$('[data-p]').forEach(x => x.setAttribute('aria-pressed', x === b)); $('#pnum').textContent = (method==='yape'?'Yape':'Plin') + ' a ' + C.YAPE_TITULAR; drawQR(); });
  $('#paid').onclick = run(async () => { const op = $('#op').value.trim();
    if (!/^\d{6,12}$/.test(op)) { toast('El código de operación tiene entre 6 y 12 dígitos'); $('#op').focus(); return; }
    await API.buyPlan(p.id, { method, op, serviceId }); close(); toast('Recibimos tu pago. Lo confirmamos en unos minutos.'); });
}
function drawQR(size = 84){ const c = $('#qr'); if (!c) return; const x = c.getContext('2d'); const u = size / 21; x.fillStyle = '#fff'; x.fillRect(0,0,size,size); x.fillStyle = '#231A2B';
  let seed = Math.random()*1e6; const r = () => (seed = (seed*9301+49297) % 233280) / 233280;
  for (let i=0;i<21;i++) for (let j=0;j<21;j++){ const f=(i<7&&j<7)||(i<7&&j>13)||(i>13&&j<7);
    if (f){ const a=i%14,b=j%14; if(a===0||a===6||b===0||b===6||(a>1&&a<5&&b>1&&b<5)) x.fillRect(j*u,i*u,u,u); } else if (r()>.52) x.fillRect(j*u,i*u,u,u); } }
window.addEventListener('yunta:wallet', run(async () => { const before = S.wallet.credits; S.wallet = await API.wallet(); renderNav(); if (S.wallet.credits > before) { confetti(); toast(`Pago confirmado: ahora tienes ${S.wallet.credits} contactos`); } if (['planes','cuenta'].includes(S.view)) render(); }));

// ---------------- Cuenta ----------------
VIEWS.cuenta = async function(){
  if (!S.user) return login();
  if (S.user.role === 'admin') return panelAdmin();
  if (S.user.role === 'proveedor') return panelProveedor();
  return panelCliente();
};
function login(){
  let mode = 'in';
  const draw = () => {
    $('#app').innerHTML = `<div class="auth"><h1 style="font-size:32px;margin-bottom:6px">${mode==='in'?'Hola de nuevo':'Únete a Yunta'}</h1>
    <p class="lead">${mode==='in'?'Ingresa para ver contactos y guardar favoritos.':`Gratis, y con ${C.CONTACTOS_BIENVENIDA} contacto de regalo.`}</p>
    <form class="panel" id="af">
      <div class="seg"><button type="button" data-m="in" aria-pressed="${mode==='in'}">Ingresar</button><button type="button" data-m="up" aria-pressed="${mode==='up'}">Registrarme</button></div>
      ${mode==='up' ? `<div class="field"><label for="an">Nombre completo</label><input id="an" required autocomplete="name"></div>
        <div class="field"><span class="lbl">Quiero</span><div class="seg"><button type="button" data-r="cliente" aria-pressed="true">Contratar</button><button type="button" data-r="proveedor" aria-pressed="false">Ofrecer servicios</button></div></div>` : ''}
      <div class="field"><label for="ae">Correo</label><input id="ae" type="email" required autocomplete="email"></div>
      <div class="field"><label for="ap">Contraseña</label><input id="ap" type="password" required minlength="${mode==='up'?8:1}" autocomplete="${mode==='up'?'new-password':'current-password'}"></div>
      <button class="btn big" type="submit">${mode==='in'?'Ingresar':'Crear cuenta'}</button>
      <div class="or">o</div>
      <button class="btn line" type="button" id="gg">Continuar con Google</button>
      ${API.mode==='demo' ? `<div class="field" style="margin-top:6px"><span class="lbl">Probar con cuentas demo</span>
        <div class="quick"><button type="button" data-q="cliente">${av({seed:4411,g:'f',age:28})}Cliente</button><button type="button" data-q="proveedor">${av({seed:9087,g:'m',age:32})}Proveedor</button><button type="button" data-q="admin">${av({seed:77,g:'x',age:30})}Admin</button></div>
        <span class="note">Clave de todas: yunta123</span></div>` : ''}
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
}
async function loggedIn(){ await refreshUser(); toast('Hola, ' + S.user.name.split(' ')[0]); const n = S.after; S.after = null;
  if (n) { S.view = 'inicio'; renderNav(); await VIEWS.inicio(); n(); } else go(S.user.role === 'cliente' ? 'inicio' : 'cuenta'); }
const PALETAS = [['chicha','Chicha','#5A2A82','#F2B705'],['andina','Andina','#9C3D25','#3BB39C'],['pacifico','Pacífico','#1F4FA3','#FF9F1C'],['selva','Selva','#1E6B4F','#F28AB2']];
function paletaActual(){ try { return localStorage.getItem('yunta.paleta') || C.PALETA || 'chicha'; } catch (e) { return C.PALETA || 'chicha'; } }
function aplicarPaleta(id){ document.documentElement.dataset.palette = id; try { localStorage.setItem('yunta.paleta', id); } catch (e) {} }
function palPicker(){ const cur = paletaActual(); return `<div class="field" style="margin-top:18px"><span class="lbl">Probar paleta de colores</span><div class="palpick">${PALETAS.map(([id,n,a,b])=>`<button type="button" data-pal="${id}" aria-pressed="${id===cur}"><i><b style="background:${a}"></b><b style="background:${b}"></b></i>${n}</button>`).join('')}</div></div>`; }
function accountFoot(){ return palPicker() + `<div class="row" style="margin-top:22px"><button class="btn line" id="out">${I('logout')} Cerrar sesión</button>${API.mode==='demo'?'<button class="btn line" id="rst">Reiniciar datos demo</button>':''}</div>${legal()}`; }
function bindFoot(){
  $$('[data-pal]').forEach(b => b.onclick = () => { aplicarPaleta(b.dataset.pal); $$('[data-pal]').forEach(x => x.setAttribute('aria-pressed', x === b)); toast('Paleta ' + b.textContent.trim()); });
  $('#out').onclick = run(async () => { await API.signOut(); await refreshUser(); go('inicio'); toast('Sesión cerrada'); });
  const r = $('#rst'); if (r) r.onclick = run(async () => { await API.reset(); S.seen.clear(); await refreshUser(); go('inicio'); toast('Datos demo reiniciados'); });
}

async function panelCliente(){
  const u = S.user; const [rep, unl] = await Promise.all([API.clientReputation(), API.myUnlocks()]);
  const tc = trusted();
  $('#app').innerHTML = `<div class="page">
    <div class="phead" style="margin:0 0 18px;align-items:center"><span class="avw" style="width:84px;height:84px;border-width:3px">${avatar(u)}</span>
      <div><h1 style="font-size:28px;margin:0">${esc(u.name)}</h1><span class="note">${esc(u.email)}</span><br>
      <span class="pill ${rep.n && rep.rating < C.CLIENTE_NOTA_MIN ? 'bad' : 'ok'}" style="display:inline-flex;gap:4px;margin-top:6px">${I('star')} Tu nota como cliente: ${rep.n ? rep.rating.toFixed(1) + ` (${rep.n})` : 'aún sin calificaciones'}</span></div></div>
    <div class="two">
      <div class="panel" style="flex-direction:row;align-items:center;gap:16px"><div class="meter-ring" style="--p:${Math.min(100, S.wallet.credits/Math.max(5,S.wallet.credits)*100)};width:96px;height:96px"><div style="width:72px;height:72px"><b style="font-size:26px">${S.wallet.credits}</b><span>contactos</span></div></div>
        <div style="display:flex;flex-direction:column;gap:8px"><b>${S.wallet.plan ? 'Plan ' + esc(S.wallet.plan.nombre) : 'Sin plan'}</b><span class="note">${S.wallet.plan ? 'Se renueva el ' + esc(S.wallet.renews || '') : 'Compra un plan para contactar a más personas.'}</span><button class="btn sm aji" id="gp">Ver planes</button></div></div>
      <div class="panel"><b style="display:flex;gap:8px;align-items:center">${I('shield')} Contacto de confianza</b>
        <span class="note">A quien avisamos cuando usas Cita segura.</span>
        <div class="row"><input id="tn" placeholder="Nombre" value="${esc(tc.name||'')}" aria-label="Nombre del contacto"><input id="tp" placeholder="9XX XXX XXX" inputmode="tel" value="${esc(tc.phone||'')}" aria-label="Celular del contacto"></div>
        <button class="btn sm ghost" id="ts" style="align-self:flex-start">Guardar</button></div>
    </div>
    <div class="section-h"><h2>Mis contactos</h2><small>${unl.length} desbloqueados</small></div>
    ${unl.length ? `<div class="list">${unl.map(x=>{ const s=x.service; if(!s) return ''; return `<div class="row-item" data-cat="${s.cat}">${av(s)}<div class="info"><b>${esc(s.name)}</b> ${lvlBadge(nivel(s))}<br><span class="note">${esc(s.sub)} · desbloqueado ${esc(x.date)}</span></div>
      <div class="row" style="flex:0 1 auto"><button class="btn sm wa" data-ver="${s.id}">${I('wa')} Ver contacto</button>${x.reviewed?'<span class="pill ok">Reseñado</span>':`<button class="btn sm ghost" data-rv="${s.id}">${I('star')} Calificar</button>`}</div></div>`; }).join('')}</div>`
      : `<div class="empty">Todavía no desbloqueas a nadie. Tienes ${S.wallet.credits} ${S.wallet.credits===1?'contacto disponible':'contactos disponibles'}.<br><br><button class="btn" id="ex">Explorar personas</button></div>`}
    <div class="panel" style="margin-top:18px;flex-direction:row;align-items:center;flex-wrap:wrap"><div style="flex:1 1 240px"><b>¿Quieres ofrecer tus servicios?</b><br><span class="note">Publicar es gratis. Verificamos tu identidad y tu CUL.</span></div><button class="btn sm line" id="bp">Ofrecer servicios</button></div>
    ${accountFoot()}</div>`;
  S.services = S.services.length ? S.services : await API.listServices();
  $('#gp').onclick = () => go('planes');
  $('#ts').onclick = () => { trusted({ name: $('#tn').value.trim(), phone: $('#tp').value.trim() }); toast('Contacto de confianza guardado'); };
  const ex = $('#ex'); if (ex) ex.onclick = () => go('inicio');
  $$('[data-ver]').forEach(b => b.onclick = () => perfil(S.services.find(s => s.id === b.dataset.ver)));
  $$('[data-rv]').forEach(b => b.onclick = () => calificar(S.services.find(s => s.id === b.dataset.rv)));
  $('#bp').onclick = () => panelProveedor();
  bindFoot();
}
function trusted(v){ try { if (v) localStorage.setItem('yunta.trusted', JSON.stringify(v)); return JSON.parse(localStorage.getItem('yunta.trusted')) || {}; } catch (e) { return v || {}; } }

// ---------------- Panel del proveedor ----------------
async function panelProveedor(){
  const [v, mine, fans] = await Promise.all([API.myVerification(), API.myServices(), API.whoUnlockedMe()]);
  const s0 = mine[0] || { verified: false, n: 0, rating: 0, tags: {}, views: 0 };
  const lv = nivel(s0); const idx = C.NIVELES.findIndex(l => l.id === lv); const next = C.NIVELES[Math.max(1, idx + 1)];
  const rp = s0.n ? (s0.tags.rapido || 0) / s0.n : 0;
  const reqs = next ? [
    ['Reseñas', s0.n, next.n, `${s0.n}/${next.n}`],
    ['Nota promedio', s0.rating, next.nota, `${s0.n ? s0.rating.toFixed(2) : '—'} / ${next.nota}`],
    ...(next.rapido ? [['Dicen que respondes rápido', rp, next.rapido, `${Math.round(rp*100)}% / ${next.rapido*100}%`]] : [])
  ] : [];
  const culD = s0.culVence ? daysTo(s0.culVence) : null;
  $('#app').innerHTML = `<div class="page">
    <h1>Mi panel</h1><p class="lead">Tu perfil es gratis. Ganas cuando un cliente desbloquea tu WhatsApp y te escribe.</p>
    <div id="vbox"></div>
    ${mine.length ? `
    <div class="level-card ${lv==='oro'?'oro':''}"><div style="width:72px;height:72px;border-radius:50%;background:rgba(255,255,255,.15);display:grid;place-items:center">${I(LV[lv][0]).replace('class="i"','class="i" style="width:38px;height:38px"')}</div>
      <div style="flex:1 1 220px"><span class="lbl" style="color:inherit;opacity:.8">Tu nivel</span><h2>${lv==='pendiente'?'En revisión':C.NIVELES.find(l=>l.id===lv)?.nombre||'Nuevo'}</h2>
      <p>${lv==='oro'?'Estás en lo más alto. Mantén tu nota y tu CUL al día.':next?`Siguiente: <b>${esc(next.nombre)}</b> · ${esc(next.req)}.`:''} Los niveles se recalculan cada mes.</p></div></div>
    ${reqs.length && lv!=='oro' ? `<div class="panel prog" style="margin-top:12px">${reqs.map(([l,a,b,t])=>`<div class="row"><span>${l}</span><b>${t}</b><div class="bar"><i class="${a>=b?'done':''}" style="width:${Math.min(100,(b?a/b:0)*100)}%"></i></div></div>`).join('')}</div>` : ''}
    <div class="kpis" style="margin-top:12px">
      <div class="kpi"><b>${mine.reduce((a,s)=>a+(s.views||0),0)}</b><span>Visitas a tu perfil</span></div>
      <div class="kpi"><b>${fans.length}</b><span>Contactos desbloqueados</span></div>
      <div class="kpi"><b>${s0.n?s0.rating.toFixed(1):'—'}</b><span>Nota (${s0.n} reseñas)</span></div>
      <div class="kpi"><b style="color:${culD!==null&&culD<15?'var(--bad)':'inherit'}">${culD===null?'—':Math.max(0,culD)+' d'}</b><span>Para que venza tu CUL</span></div>
    </div>
    ${culD !== null && culD < 15 ? `<div class="alert bad" style="margin-top:10px">Tu CUL vence ${culD<=0?'hoy':'en '+culD+' días'}. Descarga uno nuevo en empleosperu.gob.pe y súbelo para no perder la insignia "CUL vigente".</div>` : ''}
    <div class="section-h"><h2>Mis anuncios</h2></div>
    <div class="list">${mine.map(s=>`<div class="row-item" data-cat="${s.cat}">${av(s)}<div class="info"><b>${esc(s.title)}</b><br><span class="note">${esc(s.sub)} · S/ ${s.price}/${esc(s.unit)} · ${s.views||0} visitas</span><br>
      <span class="pill ${s.active?'ok':'warn'}">${s.active?'Publicado':'Esperando verificación'}</span> ${s.boosted?'<span class="pill bad">Boost activo</span>':''} ${s.featured?'<span class="pill m">Destacado</span>':''}</div>
      ${s.active?`<div class="row" style="flex:0 1 auto">${C.IMPULSOS.map(p=>`<button class="btn sm ${p.id==='boost'?'aji':'ghost'}" data-imp="${p.id}" data-sid="${s.id}">${I(p.id==='boost'?'flame':'star')} ${esc(p.nombre)} · ${soles(p.precio)}</button>`).join('')}</div>`:''}</div>`).join('')}</div>
    <div class="section-h"><h2>Quién vio tu contacto</h2><small>Califica a tus clientes para cuidar a la comunidad</small></div>
    ${fans.length ? `<div class="list">${fans.map(f=>`<div class="row-item">${av(f)}<div class="info"><b>${esc(f.name)}</b><br><span class="note">Desbloqueó tu contacto el ${esc(f.date)}</span><br>
      ${f.rep.n ? `<span class="pill ${f.rep.rating<C.CLIENTE_NOTA_MIN?'bad':'ok'}">${I('star')} Cliente ${f.rep.rating.toFixed(1)} (${f.rep.n})</span>` : '<span class="pill">Cliente nuevo</span>'}
      ${f.rep.n && f.rep.rating<C.CLIENTE_NOTA_MIN?'<span class="pill bad">Ojo: otros reportaron problemas</span>':''}</div>
      ${f.rated?'<span class="pill ok">Calificado</span>':`<button class="btn sm ghost" data-rc="${f.id}">${I('star')} Calificar</button>`}</div>`).join('')}</div>` : '<div class="empty">Cuando alguien desbloquee tu WhatsApp, aparecerá aquí con su reputación.</div>'}
    ` : ''}
    <div class="section-h"><h2>${mine.length?'Nuevo anuncio':'Tu anuncio'}</h2></div><div id="sf"></div>
    ${accountFoot()}</div>`;
  if (!v) verifWizard(); else verifStatus(v);
  serviceForm(!!v);
  $$('[data-imp]').forEach(b => b.onclick = () => comprar(C.IMPULSOS.find(p => p.id === b.dataset.imp), b.dataset.sid));
  $$('[data-rc]').forEach(b => b.onclick = () => calificarCliente(fans.find(f => f.id === b.dataset.rc)));
  bindFoot();
}
function calificarCliente(f){
  openModal(`<div class="pad"><h2 style="font-size:22px;margin-right:40px">¿Cómo fue ${esc(f.name.split(' ')[0])} como cliente?</h2>
    <p class="note">Solo lo ven otras personas que ofrecen servicios. Con nota baja, no podrá contactar servicios de Compañía.</p>
    ${starPicker('st')}<div class="tagpick" id="tg" style="margin-top:12px">${Object.entries(CTAGS).map(([k,t])=>`<button type="button" data-t="${k}" aria-pressed="false">${t}</button>`).join('')}</div>
    <button class="btn big" id="send" style="width:100%;margin-top:14px">Guardar calificación</button></div>`);
  bindStars('st'); bindTags('tg');
  $('#send').onclick = run(async () => { await API.rateClient(f.id, { rating: +$('#st').dataset.v, tags: pickedTags('tg') }); close(); toast('Calificación guardada'); render(); });
}
function verifStatus(v){
  const st = { pendiente:['','En revisión','Revisamos tus documentos en menos de 24 horas.'], aprobado:['ok','Verificado','Tu identidad, tu rostro y tu CUL están verificados.'], rechazado:['bad','Rechazado','No pudimos validar tus documentos. ' + (v.notes || '')] }[v.status];
  $('#vbox').innerHTML = `<div class="alert ${st[0]}" style="margin-bottom:14px"><b>Verificación: ${st[1]}.</b> ${esc(st[2])}${v.status==='rechazado'?' <button class="link" id="again">Enviar de nuevo</button>':''}</div>`;
  const a = $('#again'); if (a) a.onclick = verifWizard;
}
function verifWizard(){
  const data = { liveness: false }; const maxDate = new Date().toISOString().slice(0,10);
  $('#vbox').innerHTML = `<div class="panel" style="margin-bottom:18px"><div><h2 style="font-size:22px">Verifica tu identidad</h2><p class="note" style="margin:4px 0 0">Automático en 2 minutos: leemos tu DNI, escaneamos tu rostro y los comparamos. Solo el equipo de revisión ve tus documentos.</p></div>
    <div class="steps">
      <div class="step" id="st1"><span class="n">1</span><div class="body"><h3>DNI</h3>
        <div class="row"><div class="field"><label for="vn">Nombre como figura en tu DNI</label><input id="vn" value="${esc(S.user.name)}"></div><div class="field"><label for="vd">N.º de DNI</label><input id="vd" inputmode="numeric" maxlength="8" placeholder="8 dígitos"></div></div>
        <div class="upl"><span class="thumb" id="t-dni">Foto del DNI</span><input type="file" id="f-dni" accept="image/*" capture="environment" aria-label="Foto del DNI"></div>
        <div class="bio-checks" id="ocr-st"></div></div></div>
      <div class="step" id="st2"><span class="n">2</span><div class="body"><h3>Escaneo de rostro con prueba de vida</h3>
        <p class="note" style="margin:0">Te pediremos mirar al frente, parpadear y girar la cabeza. Así sabemos que eres una persona real y no una foto.</p>
        <div class="row" style="align-items:center"><button type="button" class="btn" id="scan" style="flex:0 1 auto">${I('face')} Escanear mi rostro</button>
          <label class="note" style="flex:1 1 220px">¿Sin cámara? <span class="link" style="cursor:pointer" id="upsel">Sube una selfie</span> (pasará a revisión humana)<input type="file" id="f-selfie" accept="image/*" capture="user" hidden aria-label="Selfie"></label></div>
        <div id="bio-res"></div></div></div>
      <div class="step" id="st3"><span class="n">3</span><div class="body"><h3>Certificado Único Laboral (CUL)</h3>
        <p class="note" style="margin:0">Gratis en empleosperu.gob.pe. Reúne tus antecedentes policiales, penales y judiciales. Debe tener menos de ${C.CUL_VIGENCIA_DIAS} días. Sube el <b>PDF original</b>: verificamos solos su firma digital del Ministerio y su QR. Si lo editas o es una foto, lo revisa una persona.</p>
        <div class="row"><div class="field"><label for="vcn">N.º del certificado</label><input id="vcn"></div><div class="field"><label for="vcf">Fecha de emisión</label><input id="vcf" type="date" max="${maxDate}"></div></div>
        <div class="upl"><span class="thumb" id="t-cul">PDF</span><input type="file" id="f-cul" accept="application/pdf,image/*" aria-label="Archivo del CUL"></div></div></div>
      <div class="step" id="st4"><span class="n">4</span><div class="body"><h3>Contacto</h3>
        <div class="row"><div class="field"><label for="vw">WhatsApp (solo lo ven quienes lo desbloquean)</label><input id="vw" inputmode="tel" placeholder="9XX XXX XXX"></div><div class="field"><label for="vcol">Colegiatura (solo salud)</label><input id="vcol" placeholder="Ej. C.Ps.P. 34521"></div></div>
        <label class="check"><input type="checkbox" id="vok"> Autorizo a Yunta a tratar mis datos personales y biométricos (foto del DNI y de mi rostro) para verificar mi identidad de forma automática, con revisión humana si lo pido (Ley N.º 29733).</label></div></div>
    </div><button class="btn big" id="vsend">Enviar verificación</button></div>`;
  const mark = (id, on) => $('#'+id).classList.toggle('done', on);
  const chk = (ok, txt) => `<span class="bdg ${ok===null?'':ok?'okc':'badc'}">${I(ok===null?'clock':ok?'check':'x')}${esc(txt)}</span>`;
  async function leerDNI(){
    if (!data.dniFrontUrl) return;
    const st = $('#ocr-st'); st.innerHTML = chk(null, 'Leyendo tu DNI…');
    try {
      const [ocr, rostro] = await Promise.all([
        BIO.ocrDNI(data.dniFrontUrl, $('#vd').value.trim(), $('#vn').value.trim()).catch(() => null),
        BIO.rostroDeFoto(data.dniFrontUrl).catch(() => null)
      ]);
      data.ocr = ocr; data.dniFace = rostro && rostro.embedding;
      if (ocr && ocr.dniLeido && !/^\d{8}$/.test($('#vd').value)) { $('#vd').value = ocr.dniLeido; ocr.dniOk = true; }
      st.innerHTML = [
        ocr ? chk(ocr.dniOk, ocr.dniOk ? `Número ${ocr.dniLeido} leído` : ocr.dniLeido ? `Leímos ${ocr.dniLeido}, no coincide` : 'No pudimos leer el número') : chk(false, 'No pudimos leer el DNI'),
        ocr ? chk(ocr.nombreOk, ocr.nombreOk ? 'Nombre coincide' : 'Nombre no encontrado') : '',
        chk(!!rostro, rostro ? 'Rostro del DNI detectado' : 'No vemos el rostro en la foto')
      ].join('');
      mark('st1', /^\d{8}$/.test($('#vd').value)); evaluar();
    } catch (e) { st.innerHTML = chk(false, 'No pudimos analizar la foto. La revisará una persona.'); }
  }
  function evaluar(){
    const box = $('#bio-res'); if (!box || !data.vivo) return;
    data.parecido = data.dniFace && data.vivo.embedding && data.vivo.embedding.length ? BIO.similarity(data.dniFace, data.vivo.embedding) : null;
    const d = BIO.decidir({ ocr: data.ocr, parecido: data.parecido, vivo: data.vivo }); data.auto = d;
    const pct = data.parecido == null ? null : Math.round(data.parecido * 100);
    const tone = d.decision === 'aprobado' ? 'ok' : d.decision === 'rechazado' ? 'bad' : '';
    box.innerHTML = `<div class="bio-card"><div class="face-sm">${data.selfieUrl?`<img alt="Tu selfie" src="${data.selfieUrl}">`:''}</div>
      <div style="flex:1 1 240px;display:flex;flex-direction:column;gap:8px">
        <span class="lbl">Parecido con tu DNI ${pct!=null?`· ${pct}%`:''}</span>
        <div class="meter"><i style="width:${pct||0}%;background:${(data.parecido||0) >= C.BIOMETRIA.PARECIDO_MIN ? 'var(--ok)' : 'var(--warn)'}"></i></div>
        <div class="bio-checks">${chk(!!data.vivo.desafios, data.vivo.desafios ? 'Prueba de vida completa' : 'Sin prueba de vida')}${data.vivo.real!=null?chk(data.vivo.real >= C.BIOMETRIA.ANTISPOOF_MIN, 'Persona real ' + Math.round(data.vivo.real*100) + '%'):''}</div>
        <div class="alert ${tone}">${d.decision==='aprobado' ? '<b>Identidad verificada automáticamente.</b> Falta solo que revisemos tu CUL.' : d.decision==='rechazado' ? '<b>No coincide.</b> ' + esc(d.motivos.join('. ')) + '. Puedes intentar otra vez o pedir revisión humana.' : '<b>Pasará a revisión humana.</b> ' + esc(d.motivos.join('. ')) + '.'}</div>
      </div></div>`;
    mark('st2', true);
  }
  $('#f-dni').onchange = run(async e => { const f = e.target.files[0]; if (!f) return; data.dniFrontUrl = await readFile(f); $('#t-dni').innerHTML = `<img alt="DNI" src="${data.dniFrontUrl}">`; leerDNI(); });
  $('#vd').oninput = () => { mark('st1', /^\d{8}$/.test($('#vd').value) && !!data.dniFrontUrl); if (data.ocr && data.ocr.dniLeido) { data.ocr.dniOk = data.ocr.dniLeido === $('#vd').value.trim(); evaluar(); } };
  $('#upsel').onclick = () => $('#f-selfie').click();
  $('#f-selfie').onchange = run(async e => { const f = e.target.files[0]; if (!f) return; data.selfieUrl = await readFile(f);
    $('#bio-res').innerHTML = chk(null, 'Analizando tu selfie…');
    const r = await BIO.rostroDeFoto(data.selfieUrl).catch(() => null);
    data.vivo = { selfie: data.selfieUrl, embedding: r && r.embedding, real: r && r.real, live: null, desafios: false }; data.liveness = false; evaluar(); });
  $('#scan').onclick = () => escanear(res => { data.vivo = res; data.selfieUrl = res.selfie; data.liveness = true; evaluar(); });
  $('#f-cul').onchange = run(async e => { const f = e.target.files[0]; if (!f) return; if (f.size > 8e6) return toast('El archivo pesa más de 8 MB'); data.culFileUrl = await readFile(f); $('#t-cul').textContent = f.name.slice(0,14); mark('st3', true);
    if (f.type !== 'application/pdf') toast('Es una imagen: la revisará una persona. Con el PDF original es automático.'); });
  $('#vsend').onclick = run(async () => {
    const dni = $('#vd').value.trim(), fecha = $('#vcf').value;
    if (!/^\d{8}$/.test(dni)) return toast('El DNI debe tener 8 dígitos');
    if (!data.dniFrontUrl) return toast('Sube la foto de tu DNI');
    if (!data.selfieUrl) return toast('Falta el escaneo de rostro');
    if (!$('#vcn').value.trim() || !fecha) return toast('Ingresa el número y la fecha de emisión del CUL');
    if (daysAgo(fecha) > C.CUL_VIGENCIA_DIAS) return toast(`Tu CUL tiene ${daysAgo(fecha)} días. Descarga uno nuevo en Empleos Perú.`);
    if (!data.culFileUrl) return toast('Sube el PDF del CUL');
    if (!/^9\d{8}$/.test($('#vw').value.replace(/\s/g,''))) return toast('Ingresa un celular de 9 dígitos que empiece en 9');
    if (!$('#vok').checked) return toast('Debes autorizar el tratamiento de tus datos');
    const auto = data.auto || { decision: 'revision', motivos: ['Sin análisis automático'] };
    await API.submitVerification({ ...data, vivo: undefined, dniFace: undefined, name: $('#vn').value.trim(), dni, culNumero: $('#vcn').value.trim(), culFecha: fecha, whatsapp: $('#vw').value.trim(), colegiatura: $('#vcol').value.trim(),
      auto: { decision: auto.decision, motivos: auto.motivos, parecido: data.parecido ?? null, real: data.vivo ? data.vivo.real : null, live: data.vivo ? data.vivo.live : null, desafios: !!(data.vivo && data.vivo.desafios), ocrDni: data.ocr ? data.ocr.dniLeido : null, checkedBy: 'navegador' } });
    toast(auto.decision === 'aprobado' ? 'Identidad verificada. Solo falta revisar tu CUL.' : 'Enviado. Una persona lo revisará en menos de 24 h.'); panelProveedor();
  });
}
let camStream = null;
function stopCam(){ if (camStream) { camStream.getTracks().forEach(t => t.stop()); camStream = null; } }
function escanear(onDone){
  const ctl = new AbortController();
  openModal(`<div class="pad"><h2 style="font-size:22px;margin-right:40px">${I('face')} Escaneo de rostro</h2>
    <div class="cam"><video id="cam" playsinline muted autoplay></video><div class="oval"></div><div class="cam-msg" id="cam-msg">Cargando la cámara…</div></div>
    <div class="live" id="cam-steps"><span>Frente</span><span>Parpadea</span><span>Izquierda</span><span>Derecha</span><span>Frente</span></div>
    <p class="note" style="text-align:center">Buena luz, sin lentes de sol ni gorra. El video no se guarda: solo una foto final.</p>
    <button class="btn ghost" id="cam-x" style="width:100%">Cancelar</button></div>`);
  $('#cam-x').onclick = () => { ctl.abort(); close(); };
  (async () => {
    try {
      if (!(await BIO.camaraDisponible())) throw new Error('Este navegador no permite usar la cámara. Sube una selfie.');
      camStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } }, audio: false });
      const v = $('#cam'); v.srcObject = camStream; await v.play();
      $('#cam-msg').textContent = 'Preparando el reconocimiento…';
      await BIO.getHuman();
      const res = await BIO.escaneoEnVivo(v, st => { const m = $('#cam-msg'); if (!m) return; m.textContent = st.texto; $$('#cam-steps span').forEach((x, k) => x.classList.toggle('on', k < st.i + (st.hecho ? 1 : 0))); }, ctl.signal);
      close(); onDone(res); toast('Prueba de vida completada');
    } catch (e) { if (ctl.signal.aborted) return; const m = $('#cam-msg'); if (m) m.textContent = e.message || 'No se pudo usar la cámara'; else toast(e.message); stopCam(); }
  })();
}
function serviceForm(hasVerif){
  const days = new Set([1,2,3,4,5]); let video = null;
  $('#sf').innerHTML = `<form class="panel" id="pf">
    <div class="row"><div class="field"><label for="pc">Categoría</label><select id="pc">${CATS.map(c=>`<option value="${c.id}">${c.name}</option>`).join('')}</select></div><div class="field"><label for="ps">Tipo de servicio</label><select id="ps"></select></div></div>
    <div class="field"><label for="pt">Título</label><input id="pt" required minlength="10" maxlength="90" placeholder="Ej. Clases de guitarra criolla para principiantes"></div>
    <div class="field"><label for="pde">Descripción</label><textarea id="pde" required placeholder="Tu experiencia y cómo trabajas. No pongas tu número: se muestra al desbloquear."></textarea></div>
    <div class="row"><div class="field"><label for="pp">Precio (S/)</label><input id="pp" type="number" min="10" required value="40"></div><div class="field"><label for="pu">Por</label><select id="pu"><option>hora</option><option>sesión</option><option>visita</option><option>evento</option></select></div><div class="field"><label for="pdi">Distrito</label><select id="pdi">${DISTRITOS.map(d=>`<option>${d}</option>`).join('')}</select></div></div>
    <div class="field"><span class="lbl">Extras con precio (opcional)</span><div id="ex" class="list"></div><button type="button" class="btn sm ghost" id="addx" style="align-self:flex-start">${I('plus')} Agregar extra</button></div>
    <div class="field"><span class="lbl">Días disponibles</span><div class="daypick" id="dp">${DIAS.map((d,i)=>`<button type="button" data-d="${i}" aria-pressed="${days.has(i)}">${d}</button>`).join('')}</div></div>
    <div class="row"><div class="field"><label for="ph">Horario</label><input id="ph" placeholder="Ej. 6 pm – 11 pm"></div><div class="field"><label for="pl">Lo que no hago</label><input id="pl" placeholder="Ej. No voy a fiestas en casas"></div></div>
    <div class="field"><span class="lbl">Video de presentación (opcional, 15 s)</span><div class="upl"><span class="thumb">${I('play')}</span><input type="file" id="pv" accept="video/*" capture="user" aria-label="Video de presentación"></div></div>
    <div class="alert" id="rules" hidden>En Compañía está prohibido ofrecer servicios sexuales o íntimos. Revisamos cada anuncio.</div>
    <button class="btn big aji" type="submit">Guardar anuncio</button></form>`;
  const sync = () => { const c = catOf($('#pc').value); $('#ps').innerHTML = c.subs.map(s=>`<option>${s}</option>`).join(''); $('#rules').hidden = c.id !== 'compania'; };
  sync(); $('#pc').onchange = sync;
  const addX = () => { if ($('#ex').children.length >= 4) return toast('Máximo 4 extras'); $('#ex').insertAdjacentHTML('beforeend', `<div class="row"><input placeholder="Ej. Discurso de 3 minutos" class="xn" aria-label="Nombre del extra"><input type="number" min="0" placeholder="S/" class="xp" style="flex:0 1 100px" aria-label="Precio del extra"></div>`); };
  $('#addx').onclick = addX;
  $$('#dp button').forEach(b => b.onclick = () => { const d = +b.dataset.d; days.has(d) ? days.delete(d) : days.add(d); b.setAttribute('aria-pressed', days.has(d)); });
  $('#pv').onchange = run(async e => { const f = e.target.files[0]; if (!f) return; if (f.size > 25e6) return toast('El video pesa más de 25 MB'); video = await readFile(f); toast('Video listo'); });
  $('#pf').onsubmit = run(async e => { e.preventDefault();
    const desc = $('#pde').value.trim();
    if (/\b9\d{2}\s?\d{3}\s?\d{3}\b|@\w+\./.test(desc)) return toast('Quita tu número o correo de la descripción: se muestra al desbloquear');
    const extras = [...$$('#ex .row')].map(r => ({ name: r.querySelector('.xn').value.trim(), price: +r.querySelector('.xp').value || 0 })).filter(x => x.name);
    await API.createService({ cat: $('#pc').value, sub: $('#ps').value, title: $('#pt').value.trim(), desc, price: +$('#pp').value, unit: $('#pu').value, dist: $('#pdi').value,
      extras, days: [...days].sort(), hours: $('#ph').value.trim(), limits: $('#pl').value.trim(), videoUrl: video });
    toast(hasVerif ? 'Anuncio guardado' : 'Anuncio guardado. Se publica cuando aprobemos tu verificación.'); panelProveedor(); });
}

// ---------------- Admin ----------------
async function panelAdmin(){
  const [vs, ps0, st, nts] = await Promise.all([API.pendingVerifications(), API.pendingPurchases(), API.stats(), API.paymentNotices()]);
  const ps = ps0.filter(x => !x.channel || x.channel === 'manual');
  const NST = { cruzado: ['ok','Confirmó una compra'], sin_cruce: ['warn','Sin compra con ese monto'], duplicado: ['','Aviso repetido'] };
  $('#app').innerHTML = `<div class="page" style="max-width:960px"><h1>Revisión</h1><p class="lead">Los pagos con Yape y las identidades se confirman solos. Aquí revisas lo que quedó pendiente.</p>
    <div class="kpis"><div class="kpi"><b>${soles(st.ingresos)}</b><span>Ingresos por planes</span></div><div class="kpi"><b>${st.ventas}</b><span>Planes vendidos</span></div><div class="kpi"><b>${st.contactos}</b><span>Contactos desbloqueados</span></div><div class="kpi"><b>${st.pendientes}</b><span>Verificaciones pendientes</span></div></div>
    <div class="section-h"><h2>Avisos de pago automáticos</h2><small>Leídos por la app Yunta Cobros</small></div>
    ${nts.length ? `<div class="list">${nts.map(n=>`<div class="row-item"><div class="info"><b>${soles(n.amount)}</b> · ${esc(n.payer || 'Sin nombre')}<br><span class="note">${esc(n.sourceName)} · ${esc(n.when)}${n.purchaseUser?` · ${esc(n.purchaseUser)} (${esc(n.plan)})`:''}</span></div><span class="pill ${NST[n.status][0]}">${NST[n.status][1]}</span></div>`).join('')}</div>`
      : '<div class="empty" style="padding:18px">Aún no llegan avisos. Instala Yunta Cobros en el celular que recibe los Yape.</div>'}
    <div class="section-h"><h2>Pagos manuales por confirmar</h2></div>
    ${ps.length ? `<div class="list">${ps.map(x=>`<div class="row-item"><div class="info"><b>${esc(x.user)}</b> · ${esc(x.plan)}<br><span class="note">${x.method==='yape'?'Yape':'Plin'} · op. ${esc(x.op)} · ${soles(x.amount)}</span></div><div class="row" style="flex:0 1 auto"><button class="btn sm" data-pay="${x.id}">Confirmar</button><button class="btn sm ghost" data-nopay="${x.id}">Rechazar</button></div></div>`).join('')}</div>`
      : '<div class="empty" style="padding:18px">No hay pagos pendientes. Compara cada código con tu app de Yape antes de confirmar.</div>'}
    <div class="section-h"><h2>Verificaciones</h2></div>
    <div class="list">${vs.length ? vs.map(reviewCard).join('') : '<div class="empty" style="padding:18px">Todo revisado.</div>'}</div>
    ${accountFoot()}</div>`;
  $$('[data-pay]').forEach(b => b.onclick = run(async () => { await API.confirmPurchase(b.dataset.pay, true); toast('Pago confirmado'); render(); }));
  $$('[data-nopay]').forEach(b => b.onclick = run(async () => { await API.confirmPurchase(b.dataset.nopay, false); toast('Pago rechazado'); render(); }));
  $$('.rvw').forEach(card => {
    const id = card.dataset.v; const boxes = card.querySelectorAll('input[type=checkbox]'); const ap = card.querySelector('[data-ap]');
    const upd = () => ap.disabled = ![...boxes].every(b => b.checked); boxes.forEach(b => b.onchange = upd); upd();
    ap.onclick = run(async () => { await API.reviewVerification(id, 'aprobado', ''); toast('Identidad aprobada. Sus anuncios ya están publicados.'); render(); });
    card.querySelector('[data-rj]').onclick = run(async () => { const n = card.querySelector('textarea').value.trim(); if (!n) return toast('Escribe el motivo del rechazo'); await API.reviewVerification(id, 'rechazado', n); toast('Verificación rechazada'); render(); });
  });
  bindFoot();
}
function reviewCard(v){
  const dniImg = API.file(v.id,'dniFront'), selfie = API.file(v.id,'selfie');
  const draw = (img, label) => img ? `<img alt="${label}" src="${img}">` : avatar(v);
  const age = v.cul && v.cul.fecha ? daysAgo(v.cul.fecha) : null; const culOk = age !== null && age <= C.CUL_VIGENCIA_DIAS;
  const a = v.auto || {}; const autoOk = a.decision === 'aprobado';
  const sc = a.parecido ?? v.score; const pct = sc != null ? Math.round(sc * 100) : null;
  const tone = autoOk ? 'ok' : a.decision === 'rechazado' ? 'bad' : '';
  return `<div class="panel rvw" data-v="${esc(v.id)}">
    <div style="display:flex;gap:12px;align-items:center">${av(v)}<div><b>${esc(v.name)}</b><br><span class="note">DNI ${esc(v.dni || '—')}${v.sub?' · '+esc(v.sub):''} · ${esc(v.created)}</span></div></div>
    <div class="alert ${tone}"><b>${autoOk ? 'DNI y rostro aprobados automáticamente' : a.decision === 'rechazado' ? 'El sistema sugiere rechazar' : 'Revisión humana de DNI y rostro'}</b>${a.checkedBy ? ` · por ${a.checkedBy === 'deepface' ? 'el servidor (DeepFace)' : 'el navegador'}` : ''}${(a.motivos||[]).length ? '<br>' + esc(a.motivos.join('. ')) : ''}</div>
    <div class="cmp"><figure><span class="ph">${draw(dniImg,'DNI')}</span>Foto del DNI</figure><figure><span class="ph">${draw(selfie,'Selfie')}</span>Selfie</figure><figure><span class="ph" style="font-size:11px;padding:6px;text-align:center">CUL<br>${esc(v.cul?.numero || '')}</span>Certificado</figure></div>
    <div class="field"><span class="lbl">Parecido selfie–DNI ${pct!=null?`· ${pct}%`:''}</span><div class="meter"><i style="width:${pct||0}%;background:${(sc||0) >= C.BIOMETRIA.PARECIDO_MIN?'var(--ok)':'var(--bad)'}"></i></div>
      <div class="bio-checks"><span class="bdg ${a.desafios?'okc':'badc'}">${I(a.desafios?'check':'x')}${a.desafios?'Prueba de vida con cámara':'Sin prueba de vida'}</span>${a.real!=null?`<span class="bdg ${a.real>=C.BIOMETRIA.ANTISPOOF_MIN?'okc':'badc'}">${I('face')}Persona real ${Math.round(a.real*100)}%</span>`:''}${a.ocrDni?`<span class="bdg ${a.ocrDni===v.dni?'okc':'badc'}">${I('idcard')}OCR leyó ${esc(a.ocrDni)}</span>`:''}</div></div>
    <div class="cul"><span>N.º CUL</span><span>${esc(v.cul?.numero)}</span><span>Emitido</span><span>${esc(v.cul?.fecha)} ${age!==null?`(hace ${age} días)`:''} ${culOk?'':'<b style="color:var(--bad)">· vencido</b>'}</span><span>Ant. policiales</span><span>${esc(v.cul?.policiales)}</span><span>Ant. penales</span><span>${esc(v.cul?.penales)}</span><span>Ant. judiciales</span><span>${esc(v.cul?.judiciales)}</span>${v.colegiatura?`<span>Colegiatura</span><span>${esc(v.colegiatura)}</span>`:''}</div>
    <div class="field"><span class="lbl">Antes de aprobar</span>
      ${v.culAuto==='aprobado'?'<span class="bdg okc">'+I('check')+'Firma digital del Ministerio y QR verificados</span>':'<label class="check"><input type="checkbox"> Validé el CUL en empleosperu.gob.pe con su número y el DNI.</label>'}
      <label class="check"><input type="checkbox"> El CUL no muestra antecedentes policiales, penales ni judiciales.</label>
      ${v.colegiatura?'<label class="check"><input type="checkbox"> La colegiatura está activa en el registro del colegio profesional.</label>':''}
      ${autoOk?'':'<label class="check"><input type="checkbox"> Revisé a mano: el DNI es legible y la selfie es la misma persona.</label>'}</div>
    <textarea placeholder="Motivo si rechazas (lo verá el usuario)" aria-label="Motivo del rechazo"></textarea>
    <div class="row"><button class="btn" data-ap>Aprobar</button><button class="btn ghost" data-rj>Rechazar</button></div></div>`;
}

// ---------------- Cita segura ----------------
function citaSegura(s){
  const tc = trusted();
  openModal(`<div class="pad"><h2 style="font-size:22px;margin-right:40px">${I('shield')} Cita segura con ${esc(s.name.split(' ')[0])}</h2>
    <p class="note">Avisamos a tu contacto de confianza cuándo empieza y termina tu encuentro. Si no marcas "Terminé bien" a tiempo, le enviamos tu ubicación.</p>
    <div class="row"><div class="field"><label for="sn">Contacto de confianza</label><input id="sn" value="${esc(tc.name||'')}" placeholder="Ej. Mamá"></div><div class="field"><label for="sp">Celular</label><input id="sp" inputmode="tel" value="${esc(tc.phone||'')}" placeholder="9XX XXX XXX"></div></div>
    <div class="row" style="margin-top:10px"><div class="field"><label for="sl">Lugar</label><input id="sl" placeholder="${s.cat==='compania'?'Ej. Larcomar, patio de comidas':'Dirección'}"></div><div class="field" style="flex:0 1 140px"><label for="sd">Duración</label><select id="sd"><option value="60">1 hora</option><option value="120" selected>2 horas</option><option value="180">3 horas</option><option value="240">4 horas</option></select></div></div>
    <button class="btn big" id="go" style="width:100%;margin-top:14px">Empezar cita segura</button></div>`, s.cat);
  $('#go').onclick = run(async () => {
    if (!$('#sn').value.trim() || !/^9\d{8}$/.test($('#sp').value.replace(/\s/g,''))) return toast('Ingresa el nombre y celular de tu contacto de confianza');
    trusted({ name: $('#sn').value.trim(), phone: $('#sp').value.trim() });
    S.safety = await API.startSafety({ providerId: s.providerId, provider: s.name, trustedName: $('#sn').value.trim(), trustedPhone: $('#sp').value.trim(), place: $('#sl').value.trim(), minutes: +$('#sd').value });
    close(); drawSafety(); toast(`Avisamos a ${S.safety.trustedName} que empezó tu cita`);
  });
}
let safeTimer;
function drawSafety(){
  clearInterval(safeTimer);
  const s = S.safety; const el = $('#safebar');
  if (!s) { el.hidden = true; return; }
  el.hidden = false;
  const tick = () => {
    const left = s.started + s.minutes * 60e3 - Date.now();
    const t = Math.abs(left); const h = Math.floor(t/36e5), m = Math.floor(t%36e5/6e4), sec = Math.floor(t%6e4/1e3);
    el.innerHTML = `<span class="t">${left<0?'+':''}${h}:${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}</span>
      <span class="grow">Cita con <b>${esc(s.provider.split(' ')[0])}</b> · ${left<0?'¡Se pasó la hora! Marca que estás bien.':'Te cuidamos con '+esc(s.trustedName)}</span>
      <button class="btn sm" id="ok">Terminé bien</button><button class="btn sm" id="fc">${I('phone')} Llamada</button><button class="btn sm sos" id="sos">SOS</button>`;
    $('#ok').onclick = run(async () => { await API.endSafety(); S.safety = null; drawSafety(); toast(`Avisamos a ${s.trustedName} que terminaste bien`); });
    $('#fc').onclick = () => { toast('Te llamamos en 5 segundos…'); setTimeout(fakeCall, 5000); };
    $('#sos').onclick = sos;
  };
  tick(); safeTimer = setInterval(tick, 1000);
}
function fakeCall(){
  const who = (S.safety && S.safety.trustedName) || 'Mamá';
  const el = document.createElement('div'); el.className = 'call'; el.setAttribute('role','dialog');
  el.innerHTML = `<div class="who"><span class="note" style="color:rgba(255,255,255,.7)">Llamada entrante…</span><div class="pulse">${esc(who[0].toUpperCase())}</div><h2>${esc(who)}</h2><span style="color:rgba(255,255,255,.7)">celular</span></div>
    <div class="acts"><button class="no" aria-label="Rechazar">${I('phone')}</button><button class="yes" aria-label="Contestar">${I('phone')}</button></div>`;
  document.body.appendChild(el);
  el.querySelector('.no').onclick = () => el.remove();
  el.querySelector('.yes').onclick = () => { let t = 0; const w = el.querySelector('.who span:last-child'); const iv = setInterval(() => { t++; w.textContent = `00:${String(t).padStart(2,'0')}`; }, 1000);
    el.querySelector('.acts').innerHTML = `<button class="no" aria-label="Colgar">${I('phone')}</button>`; el.querySelector('.no').onclick = () => { clearInterval(iv); el.remove(); }; };
}
function sos(){
  const s = S.safety;
  openModal(`<div class="pad"><h2 style="font-size:24px;color:var(--bad)">${I('sos')} ¿Estás en peligro?</h2>
    <p>Llama ahora a la <b>Policía: 105</b>. Para violencia: <b>Línea 100</b>.</p>
    <div class="alert bad">En la app real, esto envía tu ubicación en vivo a ${esc(s?s.trustedName:'tu contacto de confianza')} y al equipo de Yunta, y queda registrado.</div>
    <div class="row" style="margin-top:12px"><button class="btn big" id="cp105">${I('copy')} Copiar 105</button><button class="btn big ghost" id="cl">Estoy a salvo</button></div></div>`);
  $('#cp105').onclick = async () => { try { await navigator.clipboard.writeText('105'); toast('105 copiado'); } catch (e) { toast('Marca 105 desde tu teléfono'); } };
  $('#cl').onclick = close;
}

// ---------------- Seguridad ----------------
VIEWS.seguridad = async function(){
  $('#app').innerHTML = `<div class="page"><h1>Seguridad en Yunta</h1><p class="lead">Así cuidamos a quienes contratan y a quienes ofrecen.</p>
  <div class="two">
    ${[['idcard','DNI y escaneo de rostro',`Foto del DNI y selfie con prueba de vida. Si la coincidencia es menor a ${C.PUNTAJE_ROSTRO_MIN*100}%, se rechaza.`],
      ['doc','Certificado Único Laboral',`Reúne antecedentes policiales, penales y judiciales. Lo validamos en Empleos Perú con su número y DNI. Vence a los ${C.CUL_VIGENCIA_DIAS} días.`],
      ['star','Niveles por desempeño','Nuevo, Confiable, Destacado y Oro según reseñas reales, puntualidad y reportes. Se recalculan cada mes.'],
      ['users','Reputación del cliente',`Quien ofrece servicios también te califica. Con nota menor a ${C.CLIENTE_NOTA_MIN} no puedes contactar en Compañía.`],
      ['shield','Cita segura','Avisamos a tu contacto de confianza, con temporizador, llamada falsa para salir de una situación incómoda y botón SOS.'],
      ['lock','Contacto protegido','El WhatsApp solo se muestra a personas registradas que usan un contacto de su plan. Así evitamos curiosos.']]
      .map(([i,h,p])=>`<div class="panel"><b style="display:flex;gap:8px;align-items:center;font-size:16px">${I(i)} ${h}</b><span class="note">${p}</span></div>`).join('')}
  </div>
  <div class="panel" style="margin-top:14px;background:var(--hero-bg);color:var(--hero-fg);border:0"><b>¿Te sientes en riesgo?</b><span>Policía: 105 · Violencia: Línea 100 · Salud mental: Línea 113, opción 5.</span></div>
  ${legal()}</div>`;
};
function reclamo(){
  openModal(`<div class="pad"><h2 style="font-size:22px;margin-right:40px">Libro de Reclamaciones</h2><p class="note">Conforme al Código de Protección y Defensa del Consumidor (Indecopi). Respondemos en máximo 15 días hábiles.</p>
  <form class="list" id="rf"><div class="row"><div class="field"><label for="rn">Nombre</label><input id="rn" required></div><div class="field"><label for="rdn">DNI</label><input id="rdn" required maxlength="8"></div></div>
    <div class="field"><label for="rt">Tipo</label><select id="rt"><option>Reclamo (sobre el servicio)</option><option>Queja (sobre la atención)</option></select></div>
    <div class="field"><label for="rx">Detalle</label><textarea id="rx" required></textarea></div><button class="btn" type="submit">Registrar</button></form></div>`);
  $('#rf').onsubmit = e => { e.preventDefault(); close(); toast('Reclamo registrado. Código R-' + String(Date.now()).slice(-6)); };
}

// ---------------- Confeti ----------------
function confetti(){
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const cv = document.createElement('canvas'); cv.className = 'confetti'; document.body.appendChild(cv);
  const ctx = cv.getContext('2d'); const W = cv.width = innerWidth, H = cv.height = innerHeight;
  const cs = getComputedStyle(document.documentElement); const cols = ['--aji','--morado','--c-compania','--c-tutoria','--c-salud'].map(v => cs.getPropertyValue(v).trim());
  const ps = Array.from({length: 140}, () => ({ x: W/2, y: H*0.55, vx: (Math.random()-.5)*14, vy: -Math.random()*15-5, r: Math.random()*6+3, c: cols[Math.floor(Math.random()*cols.length)], a: Math.random()*6 }));
  let f = 0; (function step(){ ctx.clearRect(0,0,W,H); ps.forEach(p => { p.vy += .45; p.x += p.vx; p.y += p.vy; p.a += .2; ctx.fillStyle = p.c; ctx.save(); ctx.translate(p.x,p.y); ctx.rotate(p.a); ctx.fillRect(-p.r/2,-p.r/2,p.r,p.r*.6); ctx.restore(); });
    if (++f < 90) requestAnimationFrame(step); else cv.remove(); })();
}

// ---------------- Inicio de la app ----------------
$('#home').onclick = () => { S.cat = S.sub = S.filter = null; S.q = S.dist = ''; go('inicio'); };
$('#wallet').onclick = () => go('planes');
window.addEventListener('yunta:auth', () => refreshUser());
(() => { const q = new URLSearchParams(location.search).get('paleta'); if (q && PALETAS.some(p => p[0] === q)) aplicarPaleta(q); else document.documentElement.dataset.palette = paletaActual(); })();
(async () => { await refreshUser(); S.safety = await API.getSafety(); drawSafety(); render(); })();
})();
