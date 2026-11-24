// API real sobre Supabase. Se activa cuando config.js tiene SUPABASE_URL y SUPABASE_ANON_KEY.
(function () {
  const C = window.YUNTA_CONFIG;
  if (!C.SUPABASE_URL || !window.supabase) return;
  const sb = window.supabase.createClient(C.SUPABASE_URL, C.SUPABASE_ANON_KEY);
  const ok = ({ data, error }) => { if (error) throw new Error(traducir(error.message)); return data; };
  const age = y => y ? new Date().getFullYear() - y : 30;
  const plan = id => C.PLANES.find(p => p.id === id) || C.IMPULSOS.find(p => p.id === id);
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
    sb.from('profiles').update({ last_seen: new Date().toISOString() }).eq('id', user.id).then(() => {});
    return (cached = { id: user.id, email: user.email, name: p.full_name, role: p.role, g: p.gender, age: age(p.birth_year), seed: p.avatar_seed });
  }
  sb.auth.onAuthStateChange(() => { cached = null; window.dispatchEvent(new Event('yunta:auth')) });

  async function upload(bucket, uid, name, dataUrl) {
    if (!dataUrl) return null;
    const blob = await (await fetch(dataUrl)).blob();
    const path = `${uid}/${Date.now()}-${name}`;
    ok(await sb.storage.from(bucket).upload(path, blob));
    return path;
  }

  window.API = {
    mode: 'supabase',
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
      const [rows, stats] = await Promise.all([
        sb.from('services').select('*, p:profiles!services_provider_id_fkey(full_name,gender,birth_year,avatar_seed,is_verified,last_seen)').then(ok),
        sb.from('provider_stats').select('*').then(ok)
      ]);
      const st = Object.fromEntries(stats.map(s => [s.provider_id, s]));
      const now = Date.now();
      return rows.map(s => {
        const x = st[s.provider_id] || {};
        return {
          id: s.id, providerId: s.provider_id, cat: s.category, sub: s.subcategory, title: s.title, desc: s.description,
          price: +s.price, unit: s.unit, dist: s.district, langs: s.languages, extras: s.extras || [], limits: s.limits, days: s.days || [], hours: s.hours,
          video: s.video_path ? sb.storage.from('videos').getPublicUrl(s.video_path).data.publicUrl : null,
          views: s.views, active: s.is_active, featured: s.featured_until && new Date(s.featured_until) > now, boosted: s.boosted_until && new Date(s.boosted_until) > now,
          name: s.p.full_name, g: s.p.gender, age: age(s.p.birth_year), seed: s.p.avatar_seed, verified: s.p.is_verified,
          online: now - new Date(s.p.last_seen) < 10 * 60e3, respMin: null,
          n: x.n || 0, rating: +x.rating || 0, tags: { rapido: x.rapido || 0, puntual: x.puntual || 0, amable: x.amable || 0, igual: x.igual || 0 },
          reportes: x.reportes || 0, culVence: x.cul_vence, oro: x.oro_aprobado, created: s.created_at.slice(0, 10)
        };
      });
    },
    async addView(id) { await sb.rpc('add_view', { p_service: id }) },
    async reviews(providerId) {
      const rows = ok(await sb.from('reviews').select('*, a:profiles!reviews_author_id_fkey(full_name)').eq('provider_id', providerId).order('created_at', { ascending: false }).limit(20));
      const u = await me();
      return rows.map(r => ({ author: r.a.full_name.split(' ').map((w, i) => i ? w[0] + '.' : w).join(' '), rating: r.rating, tags: r.tags, comment: r.comment, date: r.created_at.slice(0, 10), mine: u && r.author_id === u.id }));
    },

    async wallet() {
      const u = await me(); if (!u) return { credits: 0 };
      const w = ok(await sb.from('credit_wallets').select('*').eq('user_id', u.id).maybeSingle()) || { credits: 0 };
      return { credits: w.credits, plan: w.plan_id && plan(w.plan_id), renews: w.renews_at && w.renews_at.slice(0, 10) };
    },
    async getContact(providerId) {
      const c = ok(await sb.from('provider_contact').select('*').eq('provider_id', providerId).maybeSingle()) || {};
      return { unlocked: !!c.unlocked, whatsapp: c.whatsapp || '9•• ••• •••', email: c.email || '••••••@••••' };
    },
    async unlock(providerId) { return ok(await sb.rpc('unlock_contact', { p_provider: providerId })) },
    async myUnlocks() {
      const u = await me(); if (!u) return [];
      const rows = ok(await sb.from('contact_unlocks').select('*').eq('client_id', u.id).order('created_at', { ascending: false }));
      const all = await this.listServices();
      const mine = ok(await sb.from('reviews').select('provider_id').eq('author_id', u.id)).map(r => r.provider_id);
      return rows.map(r => ({ id: r.id, providerId: r.provider_id, date: r.created_at.slice(0, 10), service: all.find(s => s.providerId === r.provider_id), reviewed: mine.includes(r.provider_id) }));
    },
    async buyPlan(planId, { method, op, serviceId }) {
      const u = await me();
      return ok(await sb.from('plan_purchases').insert({ user_id: u.id, plan_id: planId, amount: plan(planId).precio, method, operation_code: op, service_id: serviceId || null }).select().single());
    },

    async favorites() { const u = await me(); if (!u) return []; return ok(await sb.from('favorites').select('service_id').eq('user_id', u.id)).map(r => r.service_id) },
    async toggleFavorite(id) {
      const u = await me(); if (!u) throw new Error('Inicia sesión para guardar');
      const ex = ok(await sb.from('favorites').select('service_id').eq('user_id', u.id).eq('service_id', id).maybeSingle());
      if (ex) { ok(await sb.from('favorites').delete().eq('user_id', u.id).eq('service_id', id)); return false; }
      ok(await sb.from('favorites').insert({ user_id: u.id, service_id: id })); return true;
    },

    async reviewProvider(providerId, { rating, tags, comment }) { const u = await me(); ok(await sb.from('reviews').upsert({ author_id: u.id, provider_id: providerId, rating, tags, comment }, { onConflict: 'author_id,provider_id' })) },
    async clientReputation() { const u = await me(); if (!u) return { n: 0, rating: 0 }; const s = ok(await sb.from('client_stats').select('*').eq('client_id', u.id).maybeSingle()) || {}; return { n: s.n || 0, rating: +s.rating || 0 } },
    async whoUnlockedMe() {
      const u = await me(); if (!u) return [];
      const rows = ok(await sb.from('contact_unlocks').select('*, c:profiles!contact_unlocks_client_id_fkey(full_name,gender,birth_year,avatar_seed)').eq('provider_id', u.id).order('created_at', { ascending: false }));
      const ids = rows.map(r => r.client_id);
      const [stats, rated] = await Promise.all([
        ids.length ? sb.from('client_stats').select('*').in('client_id', ids).then(ok) : [],
        sb.from('client_reviews').select('client_id,rating').eq('provider_id', u.id).then(ok)
      ]);
      return rows.map(r => { const s = stats.find(x => x.client_id === r.client_id) || {};
        return { id: r.client_id, name: r.c.full_name, g: r.c.gender, age: age(r.c.birth_year), seed: r.c.avatar_seed, date: r.created_at.slice(0, 10),
          rep: { n: s.n || 0, rating: +s.rating || 0, puntual: s.puntual || 0, respetuoso: s.respetuoso || 0 }, rated: rated.find(x => x.client_id === r.client_id) }; });
    },
    async rateClient(clientId, { rating, tags }) { const u = await me(); ok(await sb.from('client_reviews').upsert({ provider_id: u.id, client_id: clientId, rating, tags }, { onConflict: 'provider_id,client_id' })) },
    async report(targetId, reason) { const u = await me(); ok(await sb.from('reports').insert({ reporter_id: u.id, target_id: targetId, reason })); return true },

    async myVerification() {
      const u = await me(); if (!u) return null;
      const rows = ok(await sb.from('verifications').select('*').eq('user_id', u.id));
      if (!rows.length) return null;
      return { status: rows.some(r => r.status === 'rechazado') ? 'rechazado' : rows.every(r => r.status === 'aprobado') ? 'aprobado' : 'pendiente', notes: rows.map(r => r.notes).filter(Boolean).join(' · ') };
    },
    async submitVerification(d) {
      const u = await me();
      const [dni, selfie, cul] = await Promise.all([upload('verificaciones', u.id, 'dni.jpg', d.dniFrontUrl), upload('verificaciones', u.id, 'selfie.jpg', d.selfieUrl), upload('verificaciones', u.id, 'cul.pdf', d.culFileUrl)]);
      ok(await sb.from('provider_private').upsert({ user_id: u.id, dni: d.dni, whatsapp: d.whatsapp, email: u.email }));
      const rows = [{ user_id: u.id, kind: 'dni', file_path: dni }, { user_id: u.id, kind: 'selfie', file_path: selfie, liveness_passed: !!d.liveness },
        { user_id: u.id, kind: 'cul', file_path: cul, cul_numero: d.culNumero, cul_fecha_emision: d.culFecha }];
      if (d.colegiatura) rows.push({ user_id: u.id, kind: 'colegiatura', colegiatura: d.colegiatura });
      ok(await sb.from('verifications').insert(rows));
    },
    file: () => null,
    async createService(s) {
      const u = await me();
      const video = s.videoUrl ? await upload('videos', u.id, 'presentacion.mp4', s.videoUrl) : null;
      return ok(await sb.from('services').insert({ provider_id: u.id, category: s.cat, subcategory: s.sub, title: s.title, description: s.desc, price: s.price, unit: s.unit,
        district: s.dist, extras: s.extras, limits: s.limits, days: s.days, hours: s.hours, video_path: video }).select().single());
    },
    async myServices() { const u = await me(); return u ? (await this.listServices()).filter(s => s.providerId === u.id) : [] },

    async pendingVerifications() {
      const rows = ok(await sb.from('verifications').select('*, profile:profiles!verifications_user_id_fkey(full_name,gender,birth_year,avatar_seed)').eq('status', 'pendiente').order('created_at'));
      const by = {};
      for (const r of rows) {
        const v = by[r.user_id] ||= { id: r.user_id, userId: r.user_id, name: r.profile.full_name, g: r.profile.gender, age: age(r.profile.birth_year), seed: r.profile.avatar_seed, cul: {}, created: r.created_at.slice(0, 10) };
        if (r.kind === 'selfie') { v.score = r.face_match_score; v.liveness = r.liveness_passed; }
        if (r.kind === 'cul') v.cul = { numero: r.cul_numero, fecha: r.cul_fecha_emision, policiales: 'Ver PDF', penales: 'Ver PDF', judiciales: 'Ver PDF' };
        if (r.kind === 'colegiatura') v.colegiatura = r.colegiatura;
      }
      return Object.values(by);
    },
    async reviewVerification(userId, status, notes) {
      const u = await me();
      ok(await sb.from('verifications').update({ status, notes, reviewer_id: u.id, reviewed_at: new Date().toISOString() }).eq('user_id', userId).eq('status', 'pendiente'));
      if (status === 'aprobado') ok(await sb.from('services').update({ is_active: true }).eq('provider_id', userId));
    },
    async pendingPurchases() {
      const rows = ok(await sb.from('plan_purchases').select('*, u:profiles!plan_purchases_user_id_fkey(full_name)').eq('status', 'pendiente').order('created_at'));
      return rows.map(r => ({ id: r.id, user: r.u.full_name, planId: r.plan_id, plan: plan(r.plan_id).nombre, amount: +r.amount, method: r.method, op: r.operation_code, created: r.created_at.slice(0, 10) }));
    },
    async confirmPurchase(id, yes = true) { ok(await sb.from('plan_purchases').update({ status: yes ? 'pagado' : 'rechazado' }).eq('id', id)) },
    async stats() {
      const [paid, unl, pend] = await Promise.all([sb.from('plan_purchases').select('amount').eq('status', 'pagado').then(ok), sb.from('contact_unlocks').select('id').then(ok), sb.from('verifications').select('user_id').eq('status', 'pendiente').then(ok)]);
      return { ingresos: paid.reduce((a, x) => a + +x.amount, 0), ventas: paid.length, contactos: unl.length, pendientes: new Set(pend.map(x => x.user_id)).size };
    },

    async startSafety(s) {
      const u = await me();
      const r = ok(await sb.from('safety_sessions').insert({ user_id: u.id, provider_id: s.providerId, trusted_name: s.trustedName, trusted_phone: s.trustedPhone, place: s.place, expected_end: new Date(Date.now() + s.minutes * 60e3).toISOString() }).select().single());
      const st = { ...s, id: r.id, started: Date.now() }; try { localStorage.setItem('yunta.safety', JSON.stringify(st)) } catch (e) {} return st;
    },
    async getSafety() { try { return JSON.parse(localStorage.getItem('yunta.safety')) } catch (e) { return null } },
    async endSafety() { const s = await this.getSafety(); if (s && s.id) await sb.from('safety_sessions').update({ ended_at: new Date().toISOString() }).eq('id', s.id); try { localStorage.removeItem('yunta.safety') } catch (e) {} }
  };
})();
