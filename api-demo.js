// API en MODO DEMO: misma interfaz que api-supabase.js; todo vive en el navegador.
(function () {
  const C = window.YUNTA_CONFIG;
  const KEY = 'yunta.demo.v5';
  const wait = (ms = 200) => new Promise(r => setTimeout(r, ms));
  const uid = () => 'u' + Math.random().toString(36).slice(2, 10);
  const today = () => new Date().toISOString().slice(0, 10);
  const daysAgo = n => new Date(Date.now() - n * 864e5).toISOString().slice(0, 10);

  // [id, cat, sub, nombre, g, edad, título, descripción, precio, unidad, distrito, n reseñas, nota, whatsapp, extras, límites, días, horario, minutos de respuesta, colegiatura]
  const SEED = [
    ['p1','compania','Amigo para salir','Diego Ramírez','m',27,'Pata para ir al cine, un partido o a comer cebiche','Si llegaste a Lima hace poco o tus amigos andan ocupados, salgamos. Hincha de la U, cinéfilo y conozco buenas huariques en Surquillo.',35,'hora','Miraflores',62,4.9,'987 112 334',[['Entradas al estadio (las saco yo)',20]],'No voy a fiestas privadas en casas. No tomo más de dos cervezas.',[3,4,5,6],'6 pm – 11 pm',12],
    ['p2','compania','Pareja para reunión familiar','Valeria Chávez','f',29,'Te acompaño al almuerzo familiar o al matrimonio de tu prima','Llego puntual, conversadora y con la historia ensayada. Coordinamos antes la versión que vamos a contar y me aprendo los nombres de tu familia.',60,'hora','San Isidro',41,4.8,'956 221 908',[['Vestido de gala',40],['Ensayo previo por videollamada',20]],'Solo compañía social. Nada de contacto íntimo ni besos. No me quedo a dormir.',[5,6,0],'12 pm – 10 pm',25],
    ['p3','compania','Familiar para ceremonia','Don Alberto Quispe','m',63,'Tío o padrino para graduaciones, bodas y bautizos','Jubilado, profesor de historia. Hago de tío, padrino o "papá" en ceremonias donde falta alguien. Llevo terno propio.',80,'evento','Jesús María',23,5.0,'944 870 115',[['Discurso de 3 minutos',30],['Baile con la quinceañera',25]],'No firmo documentos ni actas como familiar.',[5,6,0],'Todo el día',40],
    ['p4','compania','Adulto mayor','Rosa Huamán','f',45,'Compañía para tus papás: paseos, citas médicas, conversa','Técnica en enfermería. Acompaño a adultos mayores al médico, al banco o a pasear al parque. Te mando fotos y un reporte al terminar.',28,'hora','San Borja',88,4.9,'912 450 763',[['Reporte con fotos',0],['Toma de presión',10]],'No administro medicamentos sin receta.',[1,2,3,4,5],'8 am – 6 pm',8],
    ['p5','compania','Caminatas y deporte','Andrea Salazar','f',31,'Compañera para correr el malecón o hacer trekking','Corredora amateur. Salgo a correr de Miraflores a Barranco o a caminatas de fin de semana (Lomas de Lúcumo, Marcahuasi).',30,'hora','Barranco',19,4.7,'987 300 442',[['Plan de entrenamiento',35]],'',[0,6,2,4],'6 am – 9 am',30],
    ['p6','compania','Acompañante a evento','Joaquín Torres','m',34,'Plus one para cenas de trabajo, fiestas de promo y eventos','Ingeniero, buena conversa y sé bailar salsa y huayno. Para que no llegues solo al tono.',55,'hora','Santiago de Surco',14,4.6,'933 118 650',[['Terno',30]],'No manejo después de beber.',[4,5,6],'7 pm – 2 am',45],
    ['p7','tutoria','Pre-U','Lucía Mendoza','f',24,'Preparación para San Marcos y UNI: matemática y razonamiento','Ingresé a la UNI en primer puesto de mi especialidad. Clases con simulacros semanales y banco de preguntas de exámenes pasados.',40,'hora','Los Olivos',120,4.9,'965 772 018',[['Simulacro corregido',15]],'',[1,2,3,4,5,6],'3 pm – 9 pm',10],
    ['p8','tutoria','Inglés','Mark Benavides','m',38,'Inglés conversacional y preparación para el TOEFL','Bilingüe, 10 años enseñando en institutos. Clases online o en tu casa.',50,'hora','Online',76,4.8,'981 400 227',[['Material TOEFL',25]],'',[1,3,5],'7 am – 1 pm',20],
    ['p9','tutoria','Quechua','Yanet Condori','f',33,'Quechua sureño para principiantes','Docente de EIB del Cusco. Aprende saludos, conversación básica y cultura andina.',30,'hora','Cusco · Wanchaq',31,5.0,'974 551 302',[],'',[2,4,6],'4 pm – 8 pm',35],
    ['p10','tutoria','Matemática','Carlos Paredes','m',29,'Refuerzo escolar de matemática, física y química','Secundaria y primeros ciclos de universidad. Te ayudo con tareas y exámenes bimestrales.',35,'hora','Arequipa · Cercado',54,4.7,'959 113 884',[],'',[1,2,3,4,5],'4 pm – 9 pm',18],
    ['p11','salud','Psicología','Ps. Mariana Vega','f',36,'Terapia para ansiedad, duelo y estrés laboral','Psicóloga clínica con enfoque cognitivo-conductual. Sesiones de 50 minutos, online o presencial. Emito boleta.',120,'sesión','San Isidro',67,4.9,'990 245 671',[['Informe psicológico',80]],'No atiendo emergencias: llama a la Línea 113.',[1,2,3,4],'9 am – 7 pm',60,'C.Ps.P. 34521'],
    ['p12','salud','Psicología','Ps. Renzo Alarcón','m',41,'Terapia de pareja y familia','Especialista en terapia sistémica. Primera consulta de orientación a precio reducido.',140,'sesión','Online',39,4.8,'977 310 509',[],'',[2,4,6],'10 am – 8 pm',90,'C.Ps.P. 18877'],
    ['p13','salud','Nutrición','Lic. Fiorella Ríos','f',30,'Plan de alimentación con comida peruana de casa','Nutricionista colegiada. Planes que incluyen lo que comes de verdad: arroz, menestras y tu lomo saltado del domingo.',90,'sesión','Pueblo Libre',45,4.8,'948 632 170',[['Lista de compras semanal',15]],'',[1,3,5],'8 am – 2 pm',30,'C.N.P. 7731'],
    ['p14','hogar','Electricista','Javier Ccahuana','m',44,'Instalaciones, tableros, cortocircuitos y pozo a tierra','Técnico con 18 años de experiencia. Atiendo emergencias el mismo día en Lima Este y Centro. Garantía de 30 días.',70,'visita','San Miguel',132,4.9,'936 507 811',[['Emergencia nocturna',50]],'',[1,2,3,4,5,6],'7 am – 10 pm',6],
    ['p15','hogar','Gasfitero','Pedro Inga','m',50,'Gasfitería: fugas, terma, caños y desatoros','Arreglo fugas, instalo termas y destapo desagües. Presupuesto sin costo al llegar.',60,'visita','Chorrillos',97,4.6,'921 774 039',[],'',[1,2,3,4,5,6],'8 am – 6 pm',22],
    ['p16','hogar','Técnico de PC','Kevin Lozano','m',26,'Formateo, limpieza y armado de PC y laptops','Voy a tu casa u oficina o lo hacemos remoto. Recupero archivos y armo PCs gamer.',50,'visita','Callao',58,4.7,'952 018 776',[['Recuperar archivos',40]],'',[1,2,3,4,5,6,0],'10 am – 10 pm',15],
    ['p17','hogar','Limpieza','Marleny Torres','f',38,'Limpieza profunda de departamentos y post-mudanza','Trabajo con mis propios productos. Por horas o por departamento completo.',25,'hora','La Molina',110,4.9,'968 224 590',[['Lavado de muebles',60]],'',[1,2,3,4,5],'7 am – 5 pm',14],
    ['p19','hogar','Cocinera','Gladys Mamani','f',47,'Menú semanal casero y cocina para eventos familiares','Cocinera con 20 años en casas de familia y un restaurante en Lince. Preparo el menú de la semana en tu casa (ají de gallina, seco, causa) y cocino para cumpleaños de hasta 40 personas.',30,'hora','Lince',84,4.9,'951 870 336',[['Compras del mercado',20],['Postres (picarones, mazamorra)',35]],'Los insumos los paga el cliente.',[1,2,3,4,5,6],'8 am – 4 pm',16],
    ['p20','hogar','Niñera','Milagros Rojas','f',34,'Cuido a tus hijos de 1 a 10 años: tareas, juegos y comidas','Educadora inicial con curso de primeros auxilios (Cruz Roja). Ayudo con las tareas y te mando reporte y fotos durante el turno. Tengo referencias de 3 familias.',22,'hora','Surquillo',57,5.0,'923 604 118',[['Turno noche',10],['Recojo del colegio',12]],'No me quedo sola con bebés menores de 1 año. No doy medicamentos sin indicación escrita de los padres.',[1,2,3,4,5,6],'7 am – 11 pm',12],
    ['p18','tutoria','Música','Gonzalo Pinto','m',35,'Guitarra y cajón peruano desde cero','Músico de criollo y afroperuano. Aprende valses, landós y festejos.',45,'hora','Barranco',27,5.0,'983 661 245',[['Cajón prestado',0]],'',[2,4,6],'5 pm – 9 pm',28]
  ];
  const COMMENTS = {
    compania: ['Puntual y súper buena conversa. Repetiría.', 'Me ayudó muchísimo, la pasé tranquilo.', 'Tal cual el perfil, muy respetuosa.', 'Mi familia quedó encantada.'],
    tutoria: ['Explica clarísimo, mi hijo subió sus notas.', 'Muy paciente y ordenada.', 'Las clases se pasan volando.'],
    salud: ['Muy empática, me sentí escuchada.', 'Profesional y puntual.', 'Me ayudó a ordenar mis ideas.'],
    hogar: ['Llegó rápido y dejó todo limpio.', 'Trabajo prolijo, buen precio.', 'Me explicó todo antes de cobrar.']
  };
  const NAMES = ['Sebastián R.', 'Ana P.', 'Karla M.', 'Luis F.', 'Rocío T.', 'Martín C.', 'Gabriela S.', 'Jorge V.'];

  function fresh() {
    const users = {
      cliente: { id: 'demo-cliente', email: 'cliente@demo.pe', password: 'yunta123', name: 'Camila Rojas', role: 'cliente', g: 'f', age: 28, seed: 4411 },
      proveedor: { id: 'demo-proveedor', email: 'proveedor@demo.pe', password: 'yunta123', name: 'Luis Vargas', role: 'proveedor', g: 'm', age: 32, seed: 9087, whatsapp: '940 333 210' },
      admin: { id: 'demo-admin', email: 'admin@demo.pe', password: 'yunta123', name: 'Equipo Yunta', role: 'admin', g: 'x', age: 30, seed: 77 }
    };
    const services = SEED.map((r, i) => {
      const n = r[11];
      const pct = (a, b) => Math.round(n * (a + ((i * 7) % 10) / 100 * b));
      return {
        id: 's' + (i + 1), providerId: r[0], cat: r[1], sub: r[2], name: r[3], g: r[4], age: r[5], title: r[6], desc: r[7], price: r[8], unit: r[9], dist: r[10],
        n, rating: r[12], whatsapp: r[13], extras: r[14].map(([name, price]) => ({ name, price })), limits: r[15], days: r[16], hours: r[17], respMin: r[18], colegiatura: r[19] || null,
        tags: { rapido: r[18] <= 20 ? pct(.82, 1) : pct(.45, 2), puntual: pct(.7, 2), amable: pct(.8, 1), igual: pct(.75, 2) },
        reportes: 0, culVence: daysAgo(-(20 + (i * 13) % 70)), oro: [3, 6, 13].includes(i),
        seed: 1000 + i * 37, verified: true, active: true, featured: i === 3 || i === 13, boosted: i === 1,
        online: [0, 1, 3, 6, 10, 13, 16].includes(i), views: 120 + i * 53, langs: r[3].startsWith('Mark') ? 'Español, inglés' : r[3].startsWith('Yanet') ? 'Quechua, español' : 'Español',
        created: daysAgo(30 + i * 9)
      };
    });
    // El proveedor demo ya está verificado y tiene un anuncio, para ver su panel completo
    services.push({ id: 'sLuis', providerId: 'demo-proveedor', cat: 'hogar', sub: 'Carpintería', name: 'Luis Vargas', g: 'm', age: 32, seed: 9087,
      title: 'Muebles a medida, reparaciones y armado de melamina', desc: 'Carpintero con taller en Surquillo. Armo muebles de melamina, reparo puertas y closets.',
      price: 60, unit: 'visita', dist: 'Surquillo', n: 9, rating: 4.7, extras: [{ name: 'Diseño 3D del mueble', price: 30 }], limits: '', days: [1,2,3,4,5,6], hours: '8 am – 6 pm',
      respMin: 25, tags: { rapido: 6, puntual: 8, amable: 9, igual: 8 }, reportes: 0, culVence: daysAgo(-12), oro: false,
      verified: true, active: true, featured: false, boosted: false, online: true, views: 214, langs: 'Español', created: daysAgo(40) });
    const reviews = {};
    services.forEach((s, i) => {
      reviews[s.providerId] = COMMENTS[s.cat].map((c, k) => ({ author: NAMES[(i + k) % NAMES.length], rating: k === 2 && s.rating < 4.8 ? 4 : 5, tags: k % 2 ? ['puntual', 'igual'] : ['rapido', 'amable'], comment: c, date: daysAgo(3 + k * 11 + i) }));
    });
    const today0 = new Date();
    const d = n => new Date(today0 - n * 864e5).toISOString().slice(0, 10);
    const verifs = [
      { id: 'vLuis', userId: 'demo-proveedor', name: 'Luis Vargas', g: 'm', age: 32, seed: 9087, dni: '45123987', status: 'aprobado', score: 0.94, liveness: true, cul: { numero: 'CUL-2026-0655210', fecha: d(78), policiales: 'Sin registros', penales: 'Sin registros', judiciales: 'Sin registros' }, created: d(78) },
      { id: 'v1', userId: 'x1', name: 'Milagros Paucar', g: 'f', age: 26, seed: 5150, dni: '47281930', sub: 'Acompañante a evento', status: 'pendiente', score: 0.82, liveness: true,
        auto: { decision: 'aprobado', motivos: [], parecido: 0.82, real: 0.97, live: 0.91, desafios: true, ocrDni: '47281930', checkedBy: 'navegador' }, cul: { numero: 'CUL-2026-0881452', fecha: d(12), policiales: 'Sin registros', penales: 'Sin registros', judiciales: 'Sin registros' }, created: d(0) },
      { id: 'v2', userId: 'x2', name: 'Ricardo Salas', g: 'm', age: 39, seed: 6262, dni: '40915527', sub: 'Electricista', status: 'pendiente', score: 0.44, liveness: true,
        auto: { decision: 'revision', motivos: ['Tu selfie no se parece lo suficiente a la foto del DNI'], parecido: 0.44, real: 0.88, live: 0.79, desafios: true, ocrDni: '40915527', checkedBy: 'navegador' }, cul: { numero: 'CUL-2026-0712009', fecha: d(130), policiales: 'Sin registros', penales: 'Sin registros', judiciales: 'Sin registros' }, created: d(1) }
    ];
    // Clientes que desbloquearon al proveedor demo (para su panel)
    const fans = [
      { id: 'c1', name: 'Andrés Soto', g: 'm', age: 35, seed: 3101, rep: { n: 6, rating: 4.9, puntual: 5, respetuoso: 6 } },
      { id: 'c2', name: 'Lucía Prado', g: 'f', age: 24, seed: 3202, rep: { n: 0, rating: 0, puntual: 0, respetuoso: 0 } },
      { id: 'c3', name: 'Mario Huerta', g: 'm', age: 41, seed: 3303, rep: { n: 3, rating: 2.7, puntual: 1, respetuoso: 0 } }
    ];
    return { users, services, reviews, verifs, fans, unlocks: [], favs: {}, wallets: { 'demo-cliente': { credits: C.CONTACTOS_BIENVENIDA, plan: null } }, purchases: [], notices: [
      { id: 'n1', source: 'com.bcp.innovacxion.yapeapp', payer: 'Andrés S.', amount: 39.78, status: 'cruzado', received: new Date(Date.now() - 3 * 36e5).toISOString(), purchaseUser: 'Andrés Soto', plan: 'Plus' },
      { id: 'n2', source: 'pe.com.interbank.mobilebanking', payer: 'Rosa M.', amount: 12.5, status: 'sin_cruce', received: new Date(Date.now() - 26 * 36e5).toISOString() }
    ], myReviews: {}, clientReviews: {}, safety: null, session: null };
  }

  let DB;
  try { DB = JSON.parse(localStorage.getItem(KEY)) } catch (e) {}
  if (!DB || !DB.users) DB = fresh();
  const files = {};
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(DB)) } catch (e) {} };
  const me = () => DB.session && Object.values(DB.users).find(u => u.id === DB.session);
  const pub = u => u && ({ id: u.id, email: u.email, name: u.name, role: u.role, g: u.g, age: u.age, seed: u.seed });
  const need = () => { const u = me(); if (!u) throw new Error('Inicia sesión para continuar'); return u; };
  const wallet = id => (DB.wallets[id] ||= { credits: C.CONTACTOS_BIENVENIDA, plan: null });
  const plan = id => C.PLANES.find(p => p.id === id) || C.IMPULSOS.find(p => p.id === id);

  window.API = {
    mode: 'demo',
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
      DB.users[u.id] = u; DB.session = u.id; wallet(u.id); save(); return pub(u);
    },
    async signInGoogle() { DB.session = DB.users.cliente.id; save(); return pub(DB.users.cliente) },
    async quickLogin(role) { DB.session = DB.users[role].id; save(); return pub(DB.users[role]) },
    async signOut() { DB.session = null; save() },
    async reset() { DB = fresh(); save() },

    async listServices() {
      const u = me();
      return DB.services.filter(s => s.active || (u && s.providerId === u.id)).map(s => ({ ...s, whatsapp: undefined, video: files[s.id + 'video'] || null }));
    },
    async addView(id) { const s = DB.services.find(x => x.id === id); if (s) { s.views++; save(); } },
    async reviews(providerId) { return [...(DB.myReviews[providerId] ? [DB.myReviews[providerId]] : []), ...(DB.reviews[providerId] || [])] },

    // ---------- Contactos y planes ----------
    async wallet() { const u = me(); return u ? { ...wallet(u.id), plan: wallet(u.id).plan && plan(wallet(u.id).plan) } : { credits: 0 } },
    async getContact(providerId) {
      const u = me(); const s = DB.services.find(x => x.providerId === providerId);
      const owner = Object.values(DB.users).find(x => x.id === providerId);
      const unlocked = !!u && (u.id === providerId || u.role === 'admin' || DB.unlocks.some(x => x.clientId === u.id && x.providerId === providerId));
      const wa = (s && s.whatsapp) || (owner && owner.whatsapp) || '900 000 000';
      const mail = (s ? s.name : owner.name).toLowerCase().replace(/^(ps\.|lic\.|don)\s/, '').split(' ').slice(0, 2).join('.').normalize('NFD').replace(/[̀-ͯ]/g, '') + '@gmail.com';
      return { unlocked, whatsapp: unlocked ? wa : wa[0] + '•• ••• •••', email: unlocked ? mail : '••••••@••••' };
    },
    async unlock(providerId) {
      const u = me(); if (!u) return 'login'; await wait(300);
      if (DB.unlocks.some(x => x.clientId === u.id && x.providerId === providerId)) return 'ok';
      const w = wallet(u.id); if (w.credits < 1) return 'sin_creditos';
      w.credits--; DB.unlocks.push({ id: uid(), clientId: u.id, providerId, date: today() }); save(); return 'ok';
    },
    async myUnlocks() {
      const u = me(); if (!u) return [];
      return DB.unlocks.filter(x => x.clientId === u.id).reverse().map(x => ({ ...x, service: DB.services.find(s => s.providerId === x.providerId), reviewed: !!DB.myReviews[x.providerId] }));
    },
    async buyPlan(planId, { method, op, serviceId }) {
      const u = need(); await wait(400); const p = plan(planId);
      const r = { id: uid(), userId: u.id, user: u.name, planId, plan: p.nombre, amount: p.precio, method, op, serviceId, status: 'pendiente', created: today() };
      DB.purchases.unshift(r); save();
      // En el demo el pago se confirma solo después de unos segundos
      setTimeout(() => { API.confirmPurchase(r.id, true); window.dispatchEvent(new Event('yunta:wallet')); }, 1800);
      return r;
    },

    // ---------- Favoritos ----------
    async favorites() { const u = me(); return u ? (DB.favs[u.id] || []) : [] },
    async toggleFavorite(id) { const u = need(); const f = (DB.favs[u.id] ||= []); const i = f.indexOf(id); i < 0 ? f.push(id) : f.splice(i, 1); save(); return i < 0 },

    // ---------- Reseñas y reputación ----------
    async reviewProvider(providerId, { rating, tags, comment }) {
      const u = need(); if (!DB.unlocks.some(x => x.clientId === u.id && x.providerId === providerId)) throw new Error('Solo puedes reseñar a quien contactaste');
      DB.myReviews[providerId] = { author: u.name.split(' ')[0] + ' ' + ((u.name.split(' ')[1] || '')[0] || '') + '.', rating, tags, comment, date: today(), mine: true };
      const s = DB.services.find(x => x.providerId === providerId);
      if (s) { s.rating = +((s.rating * s.n + rating) / (s.n + 1)).toFixed(2); s.n++; tags.forEach(t => s.tags[t] = (s.tags[t] || 0) + 1); }
      save();
    },
    async clientReputation() { const u = me(); const rs = Object.values(DB.clientReviews).filter(r => r.clientId === (u && u.id)); return { n: rs.length, rating: rs.length ? rs.reduce((a, r) => a + r.rating, 0) / rs.length : 0 } },
    async whoUnlockedMe() {
      const u = me(); if (!u) return [];
      return DB.fans.map((f, i) => ({ ...f, date: daysAgo(i * 2 + 1), rated: DB.clientReviews[u.id + f.id] }));
    },
    async rateClient(clientId, { rating, tags }) { const u = need(); DB.clientReviews[u.id + clientId] = { clientId, rating, tags }; save() },
    async report(targetId, reason) { await wait(); return true },

    // ---------- Proveedor ----------
    async myVerification() { const u = me(); return u && DB.verifs.find(v => v.userId === u.id) },
    async submitVerification(data) {
      const u = need(); await wait(500);
      DB.verifs = DB.verifs.filter(v => v.userId !== u.id);
      const id = uid();
      ['dniFront', 'selfie'].forEach(k => { if (data[k + 'Url']) files[id + k] = data[k + 'Url'] });
      DB.verifs.unshift({ id, userId: u.id, name: data.name, g: u.g, age: u.age, seed: u.seed, dni: data.dni, status: 'pendiente',
        score: data.auto && data.auto.parecido != null ? +data.auto.parecido.toFixed(2) : null, liveness: !!data.liveness, auto: data.auto || null, colegiatura: data.colegiatura || null,
        cul: { numero: data.culNumero, fecha: data.culFecha, policiales: 'Por revisar', penales: 'Por revisar', judiciales: 'Por revisar' }, created: today() });
      const usr = Object.values(DB.users).find(x => x.id === u.id); if (usr) usr.whatsapp = data.whatsapp;
      save();
    },
    file: (vid, k) => files[vid + k],
    async createService(s) {
      const u = need(); await wait();
      const v = DB.verifs.find(x => x.userId === u.id); const ok = !!v && v.status === 'aprobado';
      const row = { ...s, id: uid(), providerId: u.id, name: u.name, g: u.g, age: u.age, seed: u.seed, n: 0, rating: 0, tags: {}, reportes: 0,
        culVence: v && v.cul.fecha ? new Date(new Date(v.cul.fecha).getTime() + C.CUL_VIGENCIA_DIAS * 864e5).toISOString().slice(0, 10) : null,
        verified: ok, active: ok, featured: false, boosted: false, online: true, views: 0, respMin: null, langs: 'Español', created: today() };
      if (s.videoUrl) { files[row.id + 'video'] = s.videoUrl; delete row.videoUrl; }
      DB.services.unshift(row); save(); return row;
    },
    async myServices() { const u = me(); return u ? DB.services.filter(s => s.providerId === u.id).map(s => ({ ...s, video: files[s.id + 'video'] || null })) : [] },

    // ---------- Admin ----------
    async pendingVerifications() { return DB.verifs.filter(v => v.status === 'pendiente') },
    async reviewVerification(id, status, notes) {
      const v = DB.verifs.find(x => x.id === id); v.status = status; v.notes = notes;
      if (status === 'aprobado') DB.services.forEach(s => { if (s.providerId === v.userId) { s.active = true; s.verified = true; s.culVence = new Date(new Date(v.cul.fecha).getTime() + C.CUL_VIGENCIA_DIAS * 864e5).toISOString().slice(0, 10) } });
      save();
    },
    async pendingPurchases() { return DB.purchases.filter(p => p.status === 'pendiente') },
    async paymentNotices() {
      const SRC = { 'com.bcp.innovacxion.yapeapp': 'Yape', 'pe.com.interbank.mobilebanking': 'Plin (Interbank)' };
      return (DB.notices || []).slice(0, 20).map(n => ({ ...n, sourceName: SRC[n.source] || n.source, when: new Date(n.received).toLocaleString('es-PE', { dateStyle: 'short', timeStyle: 'short' }) }));
    },

    // ---------- Pagos automáticos ----------
    // Yape con código de aprobación (en producción lo cobra la pasarela desde el servidor)
    async payYapeCode(planId, { phone, code, serviceId }) {
      const u = need(); await wait(1400); const p = plan(planId);
      if (code === '000000') throw new Error('Yape no aprobó el código. Genera uno nuevo e intenta otra vez.');
      const r = { id: uid(), userId: u.id, user: u.name, planId, plan: p.nombre, amount: p.precio, method: 'yape', channel: 'yape_codigo', op: 'Yape ' + phone.slice(-3), serviceId, status: 'pendiente', created: today() };
      DB.purchases.unshift(r); save(); await API.confirmPurchase(r.id, true); return r;
    },
    // QR con monto único: en producción lo confirma el aviso que lee la app Yunta Cobros
    async createQR(planId, { serviceId } = {}) {
      const u = need(); await wait(300); const p = plan(planId);
      let cents; do { cents = Math.floor(Math.random() * 99) - 49; } while (cents === 0 || DB.purchases.some(x => x.status === 'pendiente' && x.expected === +(p.precio + cents / 100).toFixed(2)));
      const amount = +(p.precio + cents / 100).toFixed(2);
      const r = { id: uid(), userId: u.id, user: u.name, planId, plan: p.nombre, amount, expected: amount, method: 'yape', channel: 'qr', serviceId, status: 'pendiente', created: today() };
      DB.purchases.unshift(r); save();
      // Demo: simulamos que el cliente paga y llega el aviso de Yape a los 7 segundos
      setTimeout(() => API._aviso('com.bcp.innovacxion.yapeapp', u.name.split(' ')[0] + ' ' + ((u.name.split(' ')[1] || ' ')[0]) + '.', amount), 7000);
      return { id: r.id, amount };
    },
    async purchaseStatus(id) { const r = DB.purchases.find(x => x.id === id); return r ? r.status : null },
    async _aviso(source, payer, amount) {
      const matches = DB.purchases.filter(x => x.status === 'pendiente' && x.channel === 'qr' && x.expected === amount);
      const n = { id: uid(), source, payer, amount, received: new Date().toISOString(), status: matches.length === 1 ? 'cruzado' : 'sin_cruce' };
      if (matches.length === 1) { n.purchaseUser = matches[0].user; n.plan = matches[0].plan; matches[0].op = payer + ' · Yape'; await API.confirmPurchase(matches[0].id, true); }
      (DB.notices ||= []).unshift(n); save();
    },
    async confirmPurchase(id, ok = true) {
      const r = DB.purchases.find(x => x.id === id); if (!r || r.status !== 'pendiente') return;
      r.status = ok ? 'pagado' : 'rechazado';
      if (ok) {
        const p = plan(r.planId);
        if (p.contactos) { const w = wallet(r.userId); w.credits += p.contactos; if (p.periodo) { w.plan = p.id; w.renews = new Date(Date.now() + 30 * 864e5).toISOString().slice(0, 10); } }
        const s = r.serviceId && DB.services.find(x => x.id === r.serviceId);
        if (s && r.planId === 'boost') s.boosted = true;
        if (s && r.planId === 'destacado') s.featured = true;
      }
      save();
    },
    async stats() {
      const paid = DB.purchases.filter(p => p.status === 'pagado');
      return { ingresos: paid.reduce((a, p) => a + p.amount, 0), ventas: paid.length, contactos: DB.unlocks.length, pendientes: DB.verifs.filter(v => v.status === 'pendiente').length };
    },

    // ---------- Cita segura ----------
    async startSafety(s) { DB.safety = { ...s, started: Date.now() }; save(); return DB.safety },
    async getSafety() { return DB.safety },
    async endSafety() { DB.safety = null; save() }
  };
})();
