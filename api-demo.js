// API en MODO DEMO: misma interfaz que api-supabase.js, pero todo vive en el navegador.
(function () {
  const C = window.YUNTA_CONFIG;
  const KEY = 'yunta.demo.v2';
  const wait = (ms = 250) => new Promise(r => setTimeout(r, ms));
  const uid = () => 'u' + Math.random().toString(36).slice(2, 10);

  const SEED_SERV = [
    ['p1', 'compania', 'Amigo para salir', 'Diego Ramírez', 'm', 27, 'Pata para ir al cine, un partido o a comer cebiche', 'Si llegaste a Lima hace poco o tus amigos andan ocupados, salgamos. Me gusta el fútbol (soy de la U), el cine y conozco buenas huariques en Surquillo.', 35, 'hora', 'Miraflores', 4.9, 62, '987 112 334'],
    ['p2', 'compania', 'Pareja para reunión familiar', 'Valeria Chávez', 'f', 29, 'Te acompaño al almuerzo familiar o al matrimonio de tu prima', 'Llego puntual, conversadora y con la historia ensayada. Solo compañía social en lugares con gente; nada de contacto íntimo. Coordinamos antes por chat la versión que contaremos.', 60, 'hora', 'San Isidro', 4.8, 41, '956 221 908'],
    ['p3', 'compania', 'Familiar para ceremonia', 'Don Alberto Quispe', 'm', 63, 'Tío o padrino para graduaciones, bodas y bautizos', 'Jubilado, profesor de historia. Hago de tío, padrino o "papá" en ceremonias donde falta alguien. Llevo terno propio y doy un discurso corto si lo necesitas.', 80, 'evento', 'Jesús María', 5.0, 23, '944 870 115'],
    ['p4', 'compania', 'Adulto mayor', 'Rosa Huamán', 'f', 45, 'Compañía para tus papás: paseos, citas médicas, conversa', 'Técnica en enfermería. Acompaño a adultos mayores al médico, al banco o a pasear al parque. Te mando fotos y reporte por WhatsApp al terminar.', 28, 'hora', 'San Borja', 4.9, 88, '912 450 763'],
    ['p5', 'compania', 'Caminatas y deporte', 'Andrea Salazar', 'f', 31, 'Compañera para correr el malecón o hacer trekking', 'Corredora amateur. Salgo a correr por el malecón de Miraflores a Barranco o a caminatas de fin de semana (Lomas de Lúcumo, Marcahuasi).', 30, 'hora', 'Barranco', 4.7, 19, '987 300 442'],
    ['p6', 'compania', 'Acompañante a evento', 'Joaquín Torres', 'm', 34, 'Plus one para cenas de trabajo, fiestas de promo y eventos', 'Ingeniero, buena conversa y sé bailar salsa y huayno. Ideal para que no llegues solo al tono.', 55, 'hora', 'Santiago de Surco', 4.6, 14, '933 118 650'],
    ['p7', 'tutoria', 'Pre-U', 'Lucía Mendoza', 'f', 24, 'Preparación para San Marcos y UNI: matemática y razonamiento', 'Ingresé a la UNI en primer puesto de mi especialidad. Clases con simulacros semanales y banco de preguntas de exámenes pasados.', 40, 'hora', 'Los Olivos', 4.9, 120, '965 772 018'],
    ['p8', 'tutoria', 'Inglés', 'Mark Benavides', 'm', 38, 'Inglés conversacional y preparación para el TOEFL', 'Bilingüe, 10 años enseñando en institutos. Clases online o en tu casa.', 50, 'hora', 'Online', 4.8, 76, '981 400 227'],
    ['p9', 'tutoria', 'Quechua', 'Yanet Condori', 'f', 33, 'Quechua sureño para principiantes', 'Docente de EIB del Cusco. Aprende saludos, conversación básica y cultura andina.', 30, 'hora', 'Cusco · Wanchaq', 5.0, 31, '974 551 302'],
    ['p10', 'tutoria', 'Matemática', 'Carlos Paredes', 'm', 29, 'Refuerzo escolar de matemática, física y química', 'Secundaria y primeros ciclos de universidad. Te ayudo con tareas y exámenes bimestrales.', 35, 'hora', 'Arequipa · Cercado', 4.7, 54, '959 113 884'],
    ['p11', 'salud', 'Psicología', 'Ps. Mariana Vega', 'f', 36, 'Terapia para ansiedad, duelo y estrés laboral', 'Psicóloga clínica con enfoque cognitivo-conductual. Sesiones de 50 minutos, online o presencial en consultorio. Emito boleta.', 120, 'sesión', 'San Isidro', 4.9, 67, '990 245 671', 'C.Ps.P. 34521'],
    ['p12', 'salud', 'Psicología', 'Ps. Renzo Alarcón', 'm', 41, 'Terapia de pareja y familia', 'Especialista en terapia sistémica. Primera consulta de orientación a precio reducido.', 140, 'sesión', 'Online', 4.8, 39, '977 310 509', 'C.Ps.P. 18877'],
    ['p13', 'salud', 'Nutrición', 'Lic. Fiorella Ríos', 'f', 30, 'Plan de alimentación con comida peruana de casa', 'Nutricionista colegiada. Planes que incluyen lo que comes de verdad: arroz, menestras y tu lomo saltado del domingo.', 90, 'sesión', 'Pueblo Libre', 4.8, 45, '948 632 170', 'C.N.P. 7731'],
    ['p14', 'hogar', 'Electricista', 'Javier Ccahuana', 'm', 44, 'Instalaciones, tableros, cortocircuitos y pozo a tierra', 'Técnico electricista con 18 años de experiencia. Atiendo emergencias el mismo día en Lima Este y Centro. Doy garantía de 30 días.', 70, 'visita', 'San Miguel', 4.9, 132, '936 507 811'],
    ['p15', 'hogar', 'Gasfitero', 'Pedro Inga', 'm', 50, 'Gasfitería: fugas, terma, caños y desatoros', 'Arreglo fugas, instalo termas y destapo desagües. Presupuesto sin costo al llegar.', 60, 'visita', 'Chorrillos', 4.6, 97, '921 774 039'],
    ['p16', 'hogar', 'Técnico de PC', 'Kevin Lozano', 'm', 26, 'Formateo, limpieza y armado de PC y laptops', 'Voy a tu casa u oficina o lo hacemos remoto. Instalo programas, recupero archivos y armo PCs gamer.', 50, 'visita', 'Callao', 4.7, 58, '952 018 776'],
    ['p17', 'hogar', 'Limpieza', 'Marleny Torres', 'f', 38, 'Limpieza profunda de departamentos y post-mudanza', 'Trabajo con mis propios productos. Por horas o por departamento completo.', 25, 'hora', 'La Molina', 4.9, 110, '968 224 590'],
    ['p18', 'tutoria', 'Música', 'Gonzalo Pinto', 'm', 35, 'Guitarra y cajón peruano desde cero', 'Músico de criollo y afroperuano. Aprende valses, landós y festejos.', 45, 'hora', 'Barranco', 5.0, 27, '983 661 245']
  ];
  const REVIEWS = {
    p1: [['Sebastián', 'Llegué de Piura y Diego me presentó a su grupo de fulbito. Bacán.'], ['Ana', 'Puntual y buena conversa, fuimos al Nacional.']],
    p2: [['M.', 'Mi familia nunca sospechó nada y la pasé tranquila en el almuerzo.']],
    p3: [['Karla', 'Fue el padrino de mi graduación. Hasta mi mamá lloró.']],
    p11: [['Usuario verificado', 'Muy empática, me ayudó a manejar la ansiedad del trabajo.']],
    p14: [['Rocío', 'Vino en dos horas y arregló el tablero. Dejó todo limpio.']]
  };

  function fresh() {
    const users = {
      cliente: { id: 'demo-cliente', email: 'cliente@demo.pe', password: 'yunta123', name: 'Camila Rojas', role: 'cliente', g: 'f', age: 28, seed: 4411 },
      proveedor: { id: 'demo-proveedor', email: 'proveedor@demo.pe', password: 'yunta123', name: 'Luis Vargas', role: 'proveedor', g: 'm', age: 32, seed: 9087, whatsapp: '940 333 210' },
      admin: { id: 'demo-admin', email: 'admin@demo.pe', password: 'yunta123', name: 'Equipo Yunta', role: 'admin', g: 'x', age: 30, seed: 77 }
    };
    const services = SEED_SERV.map((r, i) => ({
      id: 's' + (i + 1), providerId: r[0], cat: r[1], sub: r[2], name: r[3], g: r[4], age: r[5], title: r[6], desc: r[7],
      price: r[8], unit: r[9], dist: r[10], rating: r[11], n: r[12], whatsapp: r[13], colegiatura: r[14] || null,
      seed: 1000 + i * 37, verified: true, active: true, featured: i === 3 || i === 13, langs: r[1] === 'tutoria' && r[3].startsWith('Mark') ? 'Español, inglés' : 'Español'
    }));
    // Solicitudes de verificación de ejemplo para el panel de revisión
    const today = new Date();
    const d = n => new Date(today - n * 864e5).toISOString().slice(0, 10);
    const verifs = [
      { id: 'v1', userId: 'x1', name: 'Milagros Paucar', g: 'f', age: 26, seed: 5150, dni: '47281930', sub: 'Acompañante a evento', cat: 'compania', status: 'pendiente', score: 0.93, liveness: true, cul: { numero: 'CUL-2026-0881452', fecha: d(12), policiales: 'Sin registros', penales: 'Sin registros', judiciales: 'Sin registros' }, created: d(0) },
      { id: 'v2', userId: 'x2', name: 'Ricardo Salas', g: 'm', age: 39, seed: 6262, dni: '40915527', sub: 'Electricista', cat: 'hogar', status: 'pendiente', score: 0.71, liveness: true, cul: { numero: 'CUL-2026-0712009', fecha: d(130), policiales: 'Sin registros', penales: 'Sin registros', judiciales: 'Sin registros' }, created: d(1) },
      { id: 'v3', userId: 'x3', name: 'Ps. Daniela Ortiz', g: 'f', age: 33, seed: 7373, dni: '45520881', sub: 'Psicología', cat: 'salud', status: 'pendiente', score: 0.95, liveness: true, colegiatura: 'C.Ps.P. 40112', cul: { numero: 'CUL-2026-0934117', fecha: d(4), policiales: 'Sin registros', penales: 'Sin registros', judiciales: 'Sin registros' }, created: d(0) }
    ];
    return { users, services, verifs, unlocks: [], credits: {}, bookings: [], session: null };
  }

  let DB;
  try { DB = JSON.parse(localStorage.getItem(KEY)) } catch (e) {}
  if (!DB || !DB.users) DB = fresh();
  const files = {}; // imágenes subidas (solo en memoria)
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(DB)) } catch (e) {} };
  const me = () => DB.session && Object.values(DB.users).find(u => u.id === DB.session);
  const pub = u => u && ({ id: u.id, email: u.email, name: u.name, role: u.role, g: u.g, age: u.age, seed: u.seed });
  const need = () => { const u = me(); if (!u) throw new Error('Inicia sesión para continuar'); return u; };

  window.API = {
    mode: 'demo',
    reviews: id => REVIEWS[id] || [],

    async getUser() { return pub(me()) },
    async signIn({ email, password }) {
      await wait(); const u = Object.values(DB.users).find(x => x.email === email.trim().toLowerCase());
      if (!u || u.password !== password) throw new Error('Correo o contraseña incorrectos');
      DB.session = u.id; save(); return pub(u);
    },
    async signUp({ name, email, password, role }) {
      await wait(); email = email.trim().toLowerCase();
      if (Object.values(DB.users).some(x => x.email === email)) throw new Error('Ya existe una cuenta con ese correo');
      if (password.length < 8) throw new Error('La contraseña debe tener al menos 8 caracteres');
      const u = { id: uid(), email, password, name, role, g: 'x', age: 30, seed: Math.floor(Math.random() * 1e5) };
      DB.users[u.id] = u; DB.session = u.id; save(); return pub(u);
    },
    async signInGoogle() { await wait(); DB.session = DB.users.cliente.id; save(); return pub(DB.users.cliente) },
    async quickLogin(role) { DB.session = DB.users[role].id; save(); return pub(DB.users[role]) },
    async signOut() { DB.session = null; save() },
    async reset() { DB = fresh(); save() },

    async listServices() {
      const u = me();
      return DB.services.filter(s => s.active || (u && s.providerId === u.id))
        .map(s => ({ ...s, whatsapp: undefined }))
        .sort((a, b) => (b.featured - a.featured));
    },

    // ---------- Contacto bloqueado ----------
    async getContact(providerId) {
      const u = me(); const s = DB.services.find(x => x.providerId === providerId);
      const own = u && (u.id === providerId || u.role === 'admin');
      const unl = u && DB.unlocks.find(x => x.clientId === u.id && x.providerId === providerId);
      const unlocked = own || (unl && unl.status === 'pagado');
      const owner = Object.values(DB.users).find(x => x.id === providerId);
      const wa = s.whatsapp || (owner && owner.whatsapp) || '900 000 000';
      return { unlocked, pending: unl && unl.status === 'pendiente', whatsapp: unlocked ? wa : wa[0] + '•• ••• •••',
        email: unlocked ? s.name.toLowerCase().replace(/^(ps\.|lic\.|don)\s/, '').split(' ').slice(0, 2).join('.').normalize('NFD').replace(/[̀-ͯ]/g, '') + '@gmail.com' : '••••••@••••' };
    },
    async credits() { const u = me(); return u ? (DB.credits[u.id] || 0) : 0 },
    async requestUnlock(providerId, { method, op }) {
      const u = need(); await wait();
      let r = DB.unlocks.find(x => x.clientId === u.id && x.providerId === providerId);
      if (!r) { r = { id: uid(), clientId: u.id, providerId, amount: C.PRECIO_DESBLOQUEO, method, op, status: 'pendiente', created: new Date().toISOString() }; DB.unlocks.push(r); }
      save(); return r;
    },
    async unlockWithCredit(providerId) {
      const u = need(); if (!(DB.credits[u.id] > 0)) return false;
      DB.credits[u.id]--; DB.unlocks = DB.unlocks.filter(x => !(x.clientId === u.id && x.providerId === providerId));
      DB.unlocks.push({ id: uid(), clientId: u.id, providerId, amount: 0, method: 'credito', status: 'pagado', created: new Date().toISOString() }); save(); return true;
    },
    async buyPack({ method, op }) { const u = need(); await wait(); DB.credits[u.id] = (DB.credits[u.id] || 0) + C.PAQUETE.creditos; save(); return DB.credits[u.id] },

    // ---------- Proveedor: publicar y verificar ----------
    async myVerification() { const u = me(); return u && DB.verifs.find(v => v.userId === u.id) },
    async submitVerification(data) {
      const u = need(); await wait(500);
      DB.verifs = DB.verifs.filter(v => v.userId !== u.id);
      const id = uid();
      ['dniFront', 'selfie', 'culFile'].forEach(k => { if (data[k + 'Url']) files[id + k] = data[k + 'Url'] });
      const v = { id, userId: u.id, name: data.name, g: u.g, age: u.age, seed: u.seed, dni: data.dni, cat: data.cat, sub: data.sub, status: 'pendiente',
        score: data.selfieUrl ? +(0.86 + Math.random() * 0.12).toFixed(2) : null, liveness: !!data.liveness, colegiatura: data.colegiatura || null,
        cul: { numero: data.culNumero, fecha: data.culFecha, policiales: 'Por revisar', penales: 'Por revisar', judiciales: 'Por revisar' }, created: new Date().toISOString().slice(0, 10) };
      const usr = DB.users[Object.keys(DB.users).find(k => DB.users[k].id === u.id)]; if (usr) usr.whatsapp = data.whatsapp;
      DB.verifs.unshift(v); save(); return v;
    },
    file: (vid, k) => files[vid + k],
    async createService(s) {
      const u = need(); await wait();
      const v = DB.verifs.find(x => x.userId === u.id);
      const row = { ...s, id: uid(), providerId: u.id, name: u.name, g: u.g, age: u.age, seed: u.seed, rating: 0, n: 0, verified: v && v.status === 'aprobado', active: v && v.status === 'aprobado', featured: false, mine: true, langs: 'Español' };
      DB.services.unshift(row); save(); return row;
    },
    async myServices() { const u = me(); return u ? DB.services.filter(s => s.providerId === u.id) : [] },
    async featureService(id) { const s = DB.services.find(x => x.id === id); s.featured = true; save() },

    // ---------- Admin ----------
    async pendingVerifications() { return DB.verifs },
    async reviewVerification(id, status, notes) {
      const v = DB.verifs.find(x => x.id === id); v.status = status; v.notes = notes; v.reviewed = new Date().toISOString();
      if (status === 'aprobado') DB.services.forEach(s => { if (s.providerId === v.userId) { s.active = true; s.verified = true } });
      save();
    },
    async pendingUnlocks() { return DB.unlocks.filter(x => x.status === 'pendiente').map(x => ({ ...x, client: (Object.values(DB.users).find(u => u.id === x.clientId) || {}).name, provider: (DB.services.find(s => s.providerId === x.providerId) || {}).name })) },
    async confirmUnlock(id, ok = true) { const x = DB.unlocks.find(r => r.id === id); x.status = ok ? 'pagado' : 'rechazado'; save() },
    async stats() {
      const paid = DB.unlocks.filter(x => x.status === 'pagado' && x.amount > 0);
      return { unlocks: paid.length, ingresosDesbloqueo: paid.reduce((a, x) => a + x.amount, 0),
        comisiones: DB.bookings.filter(b => b.status !== 'Cancelada').reduce((a, b) => a + b.fee, 0),
        pendientes: DB.verifs.filter(v => v.status === 'pendiente').length };
    },

    // ---------- Reservas ----------
    async myBookings() { const u = me(); return u ? DB.bookings.filter(b => b.clientId === u.id) : [] },
    async createBooking(b) { const u = need(); await wait(); const r = { ...b, id: uid(), clientId: u.id, status: 'Pago por verificar' }; DB.bookings.unshift(r); save(); return r },
    async updateBooking(id, status) { const b = DB.bookings.find(x => x.id === id); b.status = status; save() }
  };
})();
