// API real sobre Supabase. Se activa cuando config.js tiene SUPABASE_URL y SUPABASE_ANON_KEY.
(function () {
  const C = window.YUNTA_CONFIG;
  if (!C.SUPABASE_URL || !window.supabase) return;
  const sb = window.supabase.createClient(C.SUPABASE_URL, C.SUPABASE_ANON_KEY);
  const ok = ({ data, error }) => { if (error) throw new Error(traducir(error.message)); return data; };
  const age = y => y ? new Date().getFullYear() - y : 30;
  function traducir(m) {
    if (/Invalid login/i.test(m)) return 'Correo o contraseña incorrectos';
    if (/already registered/i.test(m)) return 'Ya existe una cuenta con ese correo';
    if (/Email not confirmed/i.test(m)) return 'Confirma tu correo: te enviamos un enlace';
    if (/row-level security/i.test(m)) return 'No tienes permiso para esta acción';
    return m;
  }
  let cached = null;
  async function me() {
    const { data: { user } } = await sb.auth.getUser();
    if (!user) return (cached = null);
    if (cached && cached.id === user.id) return cached;
    const p = ok(await sb.from('profiles').select('*').eq('id', user.id).single());
    return (cached = { id: user.id, email: user.email, name: p.full_name, role: p.role, g: p.gender, age: age(p.birth_year), seed: p.avatar_seed, verified: p.is_verified });
  }
  sb.auth.onAuthStateChange(() => { cached = null; window.dispatchEvent(new Event('yunta:auth')) });

  const mapService = s => ({
    id: s.id, providerId: s.provider_id, cat: s.category, sub: s.subcategory, title: s.title, desc: s.description,
    price: +s.price, unit: s.unit, dist: s.district, langs: s.languages, active: s.is_active,
    featured: s.featured_until && new Date(s.featured_until) > new Date(),
    name: s.provider.full_name, g: s.provider.gender, age: age(s.provider.birth_year), seed: s.provider.avatar_seed,
    verified: s.provider.is_verified, rating: s.rating || 0, n: s.n || 0
  });

  async function upload(uid, name, dataUrl) {
    if (!dataUrl) return null;
    const blob = await (await fetch(dataUrl)).blob();
    const path = `${uid}/${Date.now()}-${name}`;
    ok(await sb.storage.from('verificaciones').upload(path, blob, { upsert: false }));
    return path;
  }

  window.API = {
    mode: 'supabase',
    reviews: () => [],
    getUser: me,
    async signIn({ email, password }) { ok(await sb.auth.signInWithPassword({ email, password })); cached = null; return me() },
    async signUp({ name, email, password, role }) {
      const d = ok(await sb.auth.signUp({ email, password, options: { data: { full_name: name, role } } }));
      if (!d.session) throw new Error('Te enviamos un correo para confirmar tu cuenta. Ábrelo y luego inicia sesión.');
      cached = null; return me();
    },
    async signInGoogle() { ok(await sb.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: location.href } })) },
    async signOut() { await sb.auth.signOut(); cached = null },

    async listServices() {
      const rows = ok(await sb.from('services').select('*, provider:profiles!services_provider_id_fkey(full_name,gender,birth_year,avatar_seed,is_verified)').order('created_at', { ascending: false }));
      return rows.map(mapService).sort((a, b) => b.featured - a.featured);
    },

    async getContact(providerId) {
      const c = ok(await sb.from('provider_contact').select('*').eq('provider_id', providerId).maybeSingle()) || {};
      const u = await me();
      let pending = false;
      if (u && !c.unlocked) {
        const r = ok(await sb.from('contact_unlocks').select('status').eq('client_id', u.id).eq('provider_id', providerId).maybeSingle());
        pending = r && r.status === 'pendiente';
      }
      return { unlocked: !!c.unlocked, pending, whatsapp: c.whatsapp || '9•• ••• •••', email: c.email || '••••••@••••' };
    },
    async credits() { const u = await me(); if (!u) return 0; const w = ok(await sb.from('credit_wallets').select('credits').eq('user_id', u.id).maybeSingle()); return w ? w.credits : 0 },
    async requestUnlock(providerId, { method, op }) {
      const u = await me();
      return ok(await sb.from('contact_unlocks').upsert({ client_id: u.id, provider_id: providerId, amount: C.PRECIO_DESBLOQUEO, method, operation_code: op }, { onConflict: 'client_id,provider_id', ignoreDuplicates: true }).select().maybeSingle());
    },
    async unlockWithCredit(providerId) { return ok(await sb.rpc('unlock_with_credit', { p_provider: providerId })) },
    async buyPack() { throw new Error('La compra de paquetes se confirma por la pasarela de pago (ver README).') },

    async myVerification() {
      const u = await me(); if (!u) return null;
      const rows = ok(await sb.from('verifications').select('*').eq('user_id', u.id));
      if (!rows.length) return null;
      const st = rows.some(r => r.status === 'rechazado') ? 'rechazado' : rows.every(r => r.status === 'aprobado') ? 'aprobado' : 'pendiente';
      return { status: st, notes: rows.map(r => r.notes).filter(Boolean).join(' · ') };
    },
    async submitVerification(d) {
      const u = await me();
      const [dniPath, selfiePath, culPath] = await Promise.all([upload(u.id, 'dni.jpg', d.dniFrontUrl), upload(u.id, 'selfie.jpg', d.selfieUrl), upload(u.id, 'cul.pdf', d.culFileUrl)]);
      ok(await sb.from('provider_private').upsert({ user_id: u.id, dni: d.dni, whatsapp: d.whatsapp, email: u.email }));
      const rows = [
        { user_id: u.id, kind: 'dni', file_path: dniPath },
        { user_id: u.id, kind: 'selfie', file_path: selfiePath, liveness_passed: !!d.liveness },
        { user_id: u.id, kind: 'cul', file_path: culPath, cul_numero: d.culNumero, cul_fecha_emision: d.culFecha }
      ];
      if (d.colegiatura) rows.push({ user_id: u.id, kind: 'colegiatura', colegiatura: d.colegiatura });
      ok(await sb.from('verifications').insert(rows));
      return { status: 'pendiente' };
    },
    file: () => null,
    async createService(s) {
      const u = await me();
      return ok(await sb.from('services').insert({ provider_id: u.id, category: s.cat, subcategory: s.sub, title: s.title, description: s.desc, price: s.price, unit: s.unit, district: s.dist }).select().single());
    },
    async myServices() { const u = await me(); return u ? (await this.listServices()).filter(s => s.providerId === u.id) : [] },
    async featureService() { throw new Error('El destacado se activa al confirmarse el pago.') },

    async pendingVerifications() {
      const rows = ok(await sb.from('verifications').select('*, profile:profiles!verifications_user_id_fkey(full_name,gender,birth_year,avatar_seed)').eq('status', 'pendiente').order('created_at'));
      const by = {};
      for (const r of rows) {
        const v = by[r.user_id] ||= { id: r.user_id, userId: r.user_id, ids: [], name: r.profile.full_name, g: r.profile.gender, age: age(r.profile.birth_year), seed: r.profile.avatar_seed, status: 'pendiente', cul: {}, created: r.created_at.slice(0, 10) };
        v.ids.push(r.id);
        if (r.kind === 'selfie') { v.score = r.face_match_score; v.liveness = r.liveness_passed; }
        if (r.kind === 'cul') v.cul = { numero: r.cul_numero, fecha: r.cul_fecha_emision, policiales: 'Ver PDF', penales: 'Ver PDF', judiciales: 'Ver PDF', path: r.file_path };
        if (r.kind === 'colegiatura') v.colegiatura = r.colegiatura;
      }
      return Object.values(by);
    },
    async reviewVerification(userId, status, notes) {
      const u = await me();
      ok(await sb.from('verifications').update({ status, notes, reviewer_id: u.id, reviewed_at: new Date().toISOString() }).eq('user_id', userId).eq('status', 'pendiente'));
      if (status === 'aprobado') ok(await sb.from('services').update({ is_active: true }).eq('provider_id', userId));
    },
    async pendingUnlocks() {
      const rows = ok(await sb.from('contact_unlocks').select('*, c:profiles!contact_unlocks_client_id_fkey(full_name), p:profiles!contact_unlocks_provider_id_fkey(full_name)').eq('status', 'pendiente'));
      return rows.map(r => ({ id: r.id, amount: +r.amount, method: r.method, op: r.operation_code, client: r.c.full_name, provider: r.p.full_name, created: r.created_at }));
    },
    async confirmUnlock(id, yes = true) { ok(await sb.from('contact_unlocks').update({ status: yes ? 'pagado' : 'rechazado', paid_at: yes ? new Date().toISOString() : null }).eq('id', id)) },
    async stats() {
      const paid = ok(await sb.from('contact_unlocks').select('amount').eq('status', 'pagado'));
      const bk = ok(await sb.from('bookings').select('fee').neq('status', 'cancelada'));
      const pend = ok(await sb.from('verifications').select('user_id').eq('status', 'pendiente'));
      return { unlocks: paid.length, ingresosDesbloqueo: paid.reduce((a, x) => a + +x.amount, 0), comisiones: bk.reduce((a, x) => a + +x.fee, 0), pendientes: new Set(pend.map(x => x.user_id)).size };
    },

    async myBookings() {
      const u = await me(); if (!u) return [];
      const rows = ok(await sb.from('bookings').select('*, p:profiles!bookings_provider_id_fkey(full_name,avatar_seed,gender,birth_year), s:services(subcategory,unit)').eq('client_id', u.id).order('created_at', { ascending: false }));
      return rows.map(r => ({ id: r.id, providerId: r.provider_id, name: r.p.full_name, seed: r.p.avatar_seed, g: r.p.gender, age: age(r.p.birth_year), title: r.s.subcategory, date: r.starts_at.slice(0, 10), time: r.starts_at.slice(11, 16), lug: r.meeting_place, total: +r.total, fee: +r.fee, pay: r.method, op: r.operation_code, status: { solicitada: 'Pago por verificar', confirmada: 'Confirmada', cancelada: 'Cancelada', completada: 'Completada', en_disputa: 'En disputa' }[r.status] }));
    },
    async createBooking(b) {
      const u = await me();
      return ok(await sb.from('bookings').insert({ service_id: b.serviceId, client_id: u.id, provider_id: b.providerId, starts_at: new Date(b.date + 'T' + b.time + ':00-05:00').toISOString(), quantity: b.h, meeting_place: b.lug, details: b.det, subtotal: b.subtotal, fee: b.fee, method: b.pay, operation_code: b.op }).select().single());
    },
    async updateBooking(id, status) { ok(await sb.from('bookings').update({ status: { Confirmada: 'confirmada', Cancelada: 'cancelada' }[status] }).eq('id', id)) }
  };
})();
