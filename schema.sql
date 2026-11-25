-- =====================================================================
-- Yunta v2 · Esquema de base de datos (Supabase / PostgreSQL)
-- Ejecutar en: Supabase → SQL Editor → New query → pegar y Run.
-- Modelo de negocio: el cliente compra un PLAN (cantidad de contactos);
-- cada contacto desbloqueado muestra el WhatsApp y correo de una persona.
-- El pago del servicio se arregla directamente entre ambos (fuera de la app).
-- =====================================================================

create extension if not exists pgcrypto;

do $$ begin
  create type user_role    as enum ('cliente','proveedor','admin');
  create type verif_kind   as enum ('dni','selfie','cul','colegiatura');
  create type verif_status as enum ('pendiente','aprobado','rechazado');
  create type pay_status   as enum ('pendiente','pagado','rechazado','reembolsado');
  create type pay_method   as enum ('yape','plin','tarjeta');
exception when duplicate_object then null; end $$;

-- ---------- Perfiles públicos (nunca datos de contacto aquí) ----------
create table if not exists public.profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  full_name     text not null default '',
  role          user_role not null default 'cliente',
  gender        text check (gender in ('f','m','x')) default 'x',
  birth_year    int,
  district      text,
  bio           text,
  avatar_seed   int not null default (floor(random()*100000))::int,
  is_verified   boolean not null default false,  -- lo calcula el trigger de verificaciones
  oro_aprobado  boolean not null default false,  -- revisión manual para nivel Oro
  last_seen     timestamptz not null default now(),
  created_at    timestamptz not null default now()
);

-- ---------- Datos privados / contacto (BLOQUEADO) ----------
create table if not exists public.provider_private (
  user_id    uuid primary key references public.profiles(id) on delete cascade,
  dni        text check (dni ~ '^\d{8}$'),
  phone      text,
  whatsapp   text,
  email      text,
  updated_at timestamptz not null default now()
);

-- ---------- Verificaciones ----------
create table if not exists public.verifications (
  id                 uuid primary key default gen_random_uuid(),
  user_id            uuid not null references public.profiles(id) on delete cascade,
  kind               verif_kind not null,
  status             verif_status not null default 'pendiente',
  file_path          text,
  cul_numero         text,
  cul_fecha_emision  date,
  colegiatura        text,
  face_match_score   numeric(4,3),
  liveness_passed    boolean,
  reviewer_id        uuid references public.profiles(id),
  reviewed_at        timestamptz,
  notes              text,
  created_at         timestamptz not null default now(),
  constraint cul_reciente check (kind <> 'cul' or cul_fecha_emision is null or cul_fecha_emision >= (created_at::date - 90))
);
create index if not exists verifications_user_idx on public.verifications(user_id);

-- ---------- Servicios ----------
create table if not exists public.services (
  id             uuid primary key default gen_random_uuid(),
  provider_id    uuid not null references public.profiles(id) on delete cascade,
  category       text not null check (category in ('compania','tutoria','salud','hogar')),
  subcategory    text not null,
  title          text not null check (char_length(title) between 10 and 90),
  description    text not null,
  price          numeric(8,2) not null check (price >= 10),
  unit           text not null check (unit in ('hora','sesión','visita','evento')),
  district       text not null,
  languages      text default 'Español',
  extras         jsonb not null default '[]',      -- [{"name":"Discurso","price":30}]
  limits         text,                              -- "Lo que no hago"
  days           int[] not null default '{}',       -- 0=dom … 6=sáb
  hours          text,                              -- "6 pm – 11 pm"
  video_path     text,
  views          int not null default 0,
  is_active      boolean not null default false,    -- solo admin
  featured_until timestamptz,                       -- pagado
  boosted_until  timestamptz,                       -- pagado
  created_at     timestamptz not null default now()
);
create index if not exists services_search_idx on public.services(category, district) where is_active;

-- ---------- Planes de contactos ----------
create table if not exists public.plans (
  id          text primary key,
  name        text not null,
  audience    text not null check (audience in ('cliente','proveedor')),
  contacts    int not null default 0,     -- créditos de contacto que da
  boost_hours int not null default 0,     -- horas de Boost (proveedor)
  price       numeric(8,2) not null,
  period_days int                           -- null = pago único
);
insert into public.plans (id,name,audience,contacts,boost_hours,price,period_days) values
  ('uno','1 contacto','cliente',1,0,5,null),
  ('basico','Básico','cliente',5,0,19.90,30),
  ('plus','Plus','cliente',15,0,39.90,30),
  ('pro','Pro','cliente',40,0,79.90,30),
  ('boost','Boost 24 h','proveedor',0,24,9.90,null),
  ('destacado','Destacado 7 días','proveedor',0,168,15,null)
on conflict (id) do nothing;

create table if not exists public.credit_wallets (
  user_id   uuid primary key references public.profiles(id) on delete cascade,
  credits   int not null default 1 check (credits >= 0),   -- 1 contacto de bienvenida
  plan_id   text references public.plans(id),
  renews_at timestamptz
);

create table if not exists public.plan_purchases (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references public.profiles(id) on delete cascade,
  plan_id        text not null references public.plans(id),
  service_id     uuid references public.services(id),   -- para Boost/Destacado
  amount         numeric(8,2) not null,
  method         pay_method not null,
  operation_code text,
  status         pay_status not null default 'pendiente',
  paid_at        timestamptz,
  created_at     timestamptz not null default now()
);

-- ---------- Contactos desbloqueados ----------
create table if not exists public.contact_unlocks (
  id          uuid primary key default gen_random_uuid(),
  client_id   uuid not null references public.profiles(id) on delete cascade,
  provider_id uuid not null references public.profiles(id) on delete cascade,
  created_at  timestamptz not null default now(),
  unique (client_id, provider_id)
);

-- ---------- Favoritos ----------
create table if not exists public.favorites (
  user_id    uuid not null references public.profiles(id) on delete cascade,
  service_id uuid not null references public.services(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, service_id)
);

-- ---------- Reseñas al proveedor (las da el cliente) ----------
create table if not exists public.reviews (
  id          uuid primary key default gen_random_uuid(),
  author_id   uuid not null references public.profiles(id) on delete cascade,
  provider_id uuid not null references public.profiles(id) on delete cascade,
  rating      int not null check (rating between 1 and 5),
  tags        text[] not null default '{}',   -- rapido, puntual, amable, igual
  comment     text,
  created_at  timestamptz not null default now(),
  unique (author_id, provider_id)
);

-- ---------- Reputación del cliente (la da el proveedor) ----------
create table if not exists public.client_reviews (
  id          uuid primary key default gen_random_uuid(),
  provider_id uuid not null references public.profiles(id) on delete cascade,
  client_id   uuid not null references public.profiles(id) on delete cascade,
  rating      int not null check (rating between 1 and 5),
  tags        text[] not null default '{}',   -- puntual, respetuoso, pago
  comment     text,
  created_at  timestamptz not null default now(),
  unique (provider_id, client_id)
);

-- ---------- Reportes ----------
create table if not exists public.reports (
  id          uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references public.profiles(id),
  target_id   uuid not null references public.profiles(id),
  reason      text not null,
  status      text not null default 'pendiente' check (status in ('pendiente','confirmado','descartado')),
  created_at  timestamptz not null default now()
);

-- ---------- Cita segura ----------
create table if not exists public.safety_sessions (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references public.profiles(id) on delete cascade,
  provider_id   uuid references public.profiles(id),
  trusted_name  text,
  trusted_phone text,
  place         text,
  started_at    timestamptz not null default now(),
  expected_end  timestamptz not null,
  ended_at      timestamptz,
  alert_sent    boolean not null default false
);

-- =====================================================================
-- Funciones
-- =====================================================================
create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from profiles where id = auth.uid() and role = 'admin');
$$;

create or replace function public.has_unlocked(p_provider uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from contact_unlocks where client_id = auth.uid() and provider_id = p_provider);
$$;

create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into profiles (id, full_name, role)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name',''),
          coalesce((new.raw_user_meta_data->>'role')::user_role, 'cliente'));
  insert into credit_wallets (user_id) values (new.id);
  return new;
end $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.refresh_verified() returns trigger
language plpgsql security definer set search_path = public as $$
declare uid uuid := coalesce(new.user_id, old.user_id); ok boolean;
begin
  select count(distinct kind) filter (where kind in ('dni','selfie','cul') and status='aprobado') = 3
     and (not exists (select 1 from services where provider_id = uid and category = 'salud')
          or bool_or(kind = 'colegiatura' and status = 'aprobado'))
    into ok from verifications where user_id = uid;
  perform set_config('yunta.sys','1',true);
  update profiles set is_verified = coalesce(ok,false) where id = uid;
  perform set_config('yunta.sys','0',true);
  return null;
end $$;
drop trigger if exists verifications_refresh on public.verifications;
create trigger verifications_refresh after insert or update or delete on public.verifications
  for each row execute function public.refresh_verified();

create or replace function public.guard_profile() returns trigger
language plpgsql as $$
begin
  if current_setting('yunta.sys', true) = '1' or auth.uid() is null
     or auth.role() = 'service_role' or public.is_admin() then return new; end if;
  if new.role = 'admin' and old.role <> 'admin' then new.role := old.role; end if;
  new.is_verified := old.is_verified; new.oro_aprobado := old.oro_aprobado;
  return new;
end $$;
drop trigger if exists profiles_guard on public.profiles;
create trigger profiles_guard before update on public.profiles
  for each row execute function public.guard_profile();

create or replace function public.guard_service() returns trigger
language plpgsql as $$
begin
  if current_setting('yunta.sys', true) = '1' then return new; end if;
  if auth.uid() is not null and not public.is_admin() and coalesce(auth.role(),'') <> 'service_role' then
    if tg_op = 'INSERT' then new.is_active := false; new.featured_until := null; new.boosted_until := null; new.views := 0;
    else new.is_active := old.is_active; new.featured_until := old.featured_until;
         new.boosted_until := old.boosted_until; new.views := old.views; end if;
  end if;
  return new;
end $$;
drop trigger if exists services_guard on public.services;
create trigger services_guard before insert or update on public.services
  for each row execute function public.guard_service();

-- Al confirmar un pago de plan: suma créditos o activa Boost/Destacado
create or replace function public.apply_purchase() returns trigger
language plpgsql security definer set search_path = public as $$
declare p plans%rowtype;
begin
  if new.status = 'pagado' and old.status is distinct from 'pagado' then
    select * into p from plans where id = new.plan_id;
    perform set_config('yunta.sys','1',true);
    if p.contacts > 0 then
      update credit_wallets set credits = credits + p.contacts,
        plan_id = case when p.period_days is not null then p.id else plan_id end,
        renews_at = case when p.period_days is not null then now() + make_interval(days => p.period_days) else renews_at end
      where user_id = new.user_id;
    end if;
    if p.id = 'boost' and new.service_id is not null then
      update services set boosted_until = greatest(coalesce(boosted_until, now()), now()) + make_interval(hours => p.boost_hours)
      where id = new.service_id and provider_id = new.user_id;
    elsif p.id = 'destacado' and new.service_id is not null then
      update services set featured_until = greatest(coalesce(featured_until, now()), now()) + make_interval(hours => p.boost_hours)
      where id = new.service_id and provider_id = new.user_id;
    end if;
    perform set_config('yunta.sys','0',true);
    new.paid_at := coalesce(new.paid_at, now());
  end if;
  return new;
end $$;
drop trigger if exists purchases_apply on public.plan_purchases;
create trigger purchases_apply before update on public.plan_purchases
  for each row execute function public.apply_purchase();

-- Estadísticas públicas (para niveles e insignias)
create or replace view public.provider_stats as
select p.id as provider_id,
  count(r.id)::int as n,
  coalesce(round(avg(r.rating)::numeric, 2), 0) as rating,
  count(*) filter (where 'rapido'  = any(r.tags))::int as rapido,
  count(*) filter (where 'puntual' = any(r.tags))::int as puntual,
  count(*) filter (where 'amable'  = any(r.tags))::int as amable,
  count(*) filter (where 'igual'   = any(r.tags))::int as igual,
  (select count(*) from reports x where x.target_id = p.id and x.status = 'confirmado'
     and x.created_at > now() - interval '90 days')::int as reportes,
  (select max(v.cul_fecha_emision) + 90 from verifications v
     where v.user_id = p.id and v.kind = 'cul' and v.status = 'aprobado') as cul_vence,
  p.oro_aprobado,
  (select count(*) from contact_unlocks u where u.provider_id = p.id
     and u.created_at > date_trunc('month', now()))::int as contactos_mes
from profiles p left join reviews r on r.provider_id = p.id
group by p.id;

create or replace view public.client_stats as
select p.id as client_id,
  count(c.id)::int as n,
  coalesce(round(avg(c.rating)::numeric, 2), 0) as rating,
  count(*) filter (where 'puntual'    = any(c.tags))::int as puntual,
  count(*) filter (where 'respetuoso' = any(c.tags))::int as respetuoso
from profiles p left join client_reviews c on c.client_id = p.id
group by p.id;

-- Desbloquear un contacto usando 1 crédito (única forma de crear un desbloqueo)
create or replace function public.unlock_contact(p_provider uuid) returns text
language plpgsql security definer set search_path = public as $$
declare cs record;
begin
  if auth.uid() is null then return 'login'; end if;
  if exists (select 1 from contact_unlocks where client_id = auth.uid() and provider_id = p_provider) then return 'ok'; end if;
  -- Clientes con mala reputación no pueden contactar servicios de Compañía
  select * into cs from client_stats where client_id = auth.uid();
  if cs.n >= 2 and cs.rating < 3.5 and exists (select 1 from services where provider_id = p_provider and category = 'compania') then
    return 'reputacion';
  end if;
  update credit_wallets set credits = credits - 1 where user_id = auth.uid() and credits > 0;
  if not found then return 'sin_creditos'; end if;
  insert into contact_unlocks (client_id, provider_id) values (auth.uid(), p_provider);
  return 'ok';
end $$;

create or replace function public.add_view(p_service uuid) returns void
language plpgsql security definer set search_path = public as $$
begin
  perform set_config('yunta.sys','1',true);
  update services set views = views + 1 where id = p_service and is_active;
  perform set_config('yunta.sys','0',true);
end $$;

create or replace view public.provider_contact as
select p.id as provider_id,
  case when auth.uid() = p.id or public.is_admin() or public.has_unlocked(p.id)
       then pp.whatsapp else left(coalesce(pp.whatsapp,'9'),1) || '•• ••• •••' end as whatsapp,
  case when auth.uid() = p.id or public.is_admin() or public.has_unlocked(p.id)
       then pp.email else '••••••@••••' end as email,
  (auth.uid() = p.id or public.is_admin() or public.has_unlocked(p.id)) as unlocked
from profiles p left join provider_private pp on pp.user_id = p.id;

-- =====================================================================
-- RLS
-- =====================================================================
alter table public.profiles         enable row level security;
alter table public.provider_private enable row level security;
alter table public.verifications    enable row level security;
alter table public.services         enable row level security;
alter table public.plans            enable row level security;
alter table public.credit_wallets   enable row level security;
alter table public.plan_purchases   enable row level security;
alter table public.contact_unlocks  enable row level security;
alter table public.favorites        enable row level security;
alter table public.reviews          enable row level security;
alter table public.client_reviews   enable row level security;
alter table public.reports          enable row level security;
alter table public.safety_sessions  enable row level security;

create policy "perfiles públicos" on public.profiles for select using (true);
create policy "editar mi perfil"  on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);

create policy "ver contacto" on public.provider_private for select
  using (auth.uid() = user_id or public.is_admin() or public.has_unlocked(user_id));
create policy "guardar mi contacto" on public.provider_private for insert with check (auth.uid() = user_id);
create policy "editar mi contacto"  on public.provider_private for update using (auth.uid() = user_id);

create policy "ver mis verificaciones" on public.verifications for select using (auth.uid() = user_id or public.is_admin());
create policy "enviar verificación" on public.verifications for insert
  with check (auth.uid() = user_id and status = 'pendiente' and reviewer_id is null);
create policy "admin revisa" on public.verifications for update using (public.is_admin());

create policy "ver servicios" on public.services for select using (is_active or provider_id = auth.uid() or public.is_admin());
create policy "publicar servicio" on public.services for insert with check (provider_id = auth.uid());
create policy "editar mi servicio" on public.services for update using (provider_id = auth.uid() or public.is_admin());
create policy "borrar mi servicio" on public.services for delete using (provider_id = auth.uid() or public.is_admin());

create policy "planes públicos" on public.plans for select using (true);

create policy "ver mi billetera" on public.credit_wallets for select using (user_id = auth.uid() or public.is_admin());

create policy "ver mis compras" on public.plan_purchases for select using (user_id = auth.uid() or public.is_admin());
create policy "comprar plan" on public.plan_purchases for insert
  with check (user_id = auth.uid() and status = 'pendiente' and paid_at is null
              and amount = (select price from plans where id = plan_id));
create policy "admin confirma compra" on public.plan_purchases for update using (public.is_admin());

-- Sin política de INSERT: solo se crea con unlock_contact()
create policy "ver mis desbloqueos" on public.contact_unlocks for select
  using (client_id = auth.uid() or provider_id = auth.uid() or public.is_admin());

create policy "mis favoritos" on public.favorites for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "reseñas públicas" on public.reviews for select using (true);
create policy "reseñar si desbloqueé" on public.reviews for insert
  with check (author_id = auth.uid() and public.has_unlocked(provider_id));

create policy "ver reputación de clientes" on public.client_reviews for select using (auth.uid() is not null);
create policy "calificar a mi cliente" on public.client_reviews for insert
  with check (provider_id = auth.uid() and exists (select 1 from contact_unlocks u
              where u.provider_id = auth.uid() and u.client_id = client_reviews.client_id));

create policy "reportar" on public.reports for insert with check (reporter_id = auth.uid() and status = 'pendiente');
create policy "admin reportes" on public.reports for select using (public.is_admin());
create policy "admin resuelve" on public.reports for update using (public.is_admin());

create policy "mis citas seguras" on public.safety_sessions for all using (user_id = auth.uid() or public.is_admin())
  with check (user_id = auth.uid());

-- =====================================================================
-- Storage: documentos de verificación (privado) y videos de presentación (público)
-- =====================================================================
insert into storage.buckets (id, name, public) values ('verificaciones','verificaciones', false) on conflict (id) do nothing;
insert into storage.buckets (id, name, public) values ('videos','videos', true) on conflict (id) do nothing;

create policy "subir mis documentos" on storage.objects for insert
  with check (bucket_id in ('verificaciones','videos') and (storage.foldername(name))[1] = auth.uid()::text);
create policy "ver documentos" on storage.objects for select
  using (bucket_id = 'videos' or (bucket_id = 'verificaciones'
         and ((storage.foldername(name))[1] = auth.uid()::text or public.is_admin())));

-- Hacerte admin:
--   update public.profiles set role = 'admin' where id = (select id from auth.users where email = 'TU_CORREO');

-- =====================================================================
-- v3 · Pagos automáticos y verificación automática
-- =====================================================================

-- Compras: canal, monto exacto a pagar (con céntimos únicos) y vencimiento
alter table public.plan_purchases add column if not exists channel text not null default 'manual'
  check (channel in ('manual','yape_codigo','qr'));
alter table public.plan_purchases add column if not exists expected_amount numeric(8,2);
alter table public.plan_purchases add column if not exists expires_at timestamptz;
alter table public.plan_purchases add column if not exists notice_id uuid;
create index if not exists purchases_match_idx on public.plan_purchases(expected_amount) where status = 'pendiente';

-- La política de inserción v2 exige amount = precio; las compras por QR se crean con crear_compra_qr()
-- Avisos de pago leídos del celular de la empresa (app Yunta Cobros)
create table if not exists public.payment_notices (
  id           uuid primary key default gen_random_uuid(),
  source       text not null,               -- paquete de la app (Yape, banco con Plin)
  payer_name   text,
  amount       numeric(8,2) not null,
  raw_text     text,
  received_at  timestamptz not null default now(),
  purchase_id  uuid references public.plan_purchases(id),
  status       text not null default 'sin_cruce' check (status in ('cruzado','sin_cruce','duplicado'))
);
alter table public.payment_notices enable row level security;
create policy "admin ve avisos" on public.payment_notices for select using (public.is_admin());
-- Sin políticas de escritura: solo el servidor (service_role) inserta, desde la función aviso-pago

-- Crea una compra por QR con un monto único (precio + céntimos libres) válido 20 minutos
create or replace function public.crear_compra_qr(p_plan text, p_service uuid default null, p_method pay_method default 'yape')
returns public.plan_purchases
language plpgsql security definer set search_path = public as $$
declare pr plans%rowtype; cents int; amt numeric(8,2); r plan_purchases%rowtype; tries int := 0;
begin
  if auth.uid() is null then raise exception 'Inicia sesión'; end if;
  select * into pr from plans where id = p_plan;
  if not found then raise exception 'Plan no existe'; end if;
  loop
    tries := tries + 1;
    cents := floor(random() * 99)::int - 49;           -- de -0.49 a +0.49 sobre el precio
    continue when cents = 0;
    amt := pr.price + cents / 100.0;
    exit when not exists (select 1 from plan_purchases where status = 'pendiente'
                          and expected_amount = amt and expires_at > now());
    if tries > 200 then raise exception 'Demasiados pagos pendientes, intenta en unos minutos'; end if;
  end loop;
  insert into plan_purchases (user_id, plan_id, service_id, amount, method, channel, expected_amount, expires_at)
  values (auth.uid(), p_plan, p_service, amt, p_method, 'qr', amt, now() + interval '20 minutes')
  returning * into r;
  return r;
end $$;

-- Registra un aviso de pago y lo cruza con una compra pendiente del mismo monto exacto (solo servidor)
create or replace function public.registrar_aviso(p_source text, p_name text, p_amount numeric, p_raw text)
returns public.payment_notices
language plpgsql security definer set search_path = public as $$
declare n payment_notices%rowtype; pid uuid; cnt int;
begin
  if coalesce(auth.role(),'') <> 'service_role' and not public.is_admin() then
    raise exception 'No autorizado';
  end if;
  -- mismo aviso repetido en 2 minutos = duplicado
  if exists (select 1 from payment_notices where amount = p_amount and coalesce(raw_text,'') = coalesce(p_raw,'')
             and received_at > now() - interval '2 minutes') then
    insert into payment_notices (source, payer_name, amount, raw_text, status)
    values (p_source, p_name, p_amount, p_raw, 'duplicado') returning * into n;
    return n;
  end if;
  select count(*), min(id::text)::uuid into cnt, pid from plan_purchases
   where status = 'pendiente' and channel = 'qr' and expected_amount = p_amount and expires_at > now() - interval '5 minutes';
  insert into payment_notices (source, payer_name, amount, raw_text, purchase_id, status)
  values (p_source, p_name, p_amount, p_raw, case when cnt = 1 then pid end, case when cnt = 1 then 'cruzado' else 'sin_cruce' end)
  returning * into n;
  if cnt = 1 then
    update plan_purchases set status = 'pagado', notice_id = n.id,
      operation_code = left(coalesce(p_name,'') || ' · ' || p_source, 120) where id = pid;
  end if;
  return n;
end $$;
revoke execute on function public.registrar_aviso(text,text,numeric,text) from public, anon, authenticated;

-- Estado de una compra (para que la app sepa cuándo se confirmó)
create or replace function public.estado_compra(p_id uuid) returns text
language sql stable security definer set search_path = public as $$
  select status::text from plan_purchases where id = p_id and user_id = auth.uid();
$$;

-- Verificación automática: lo que decidió el sistema
alter table public.verifications add column if not exists auto_decision text
  check (auto_decision in ('aprobado','revision','rechazado'));
alter table public.verifications add column if not exists ocr_dni text;
alter table public.verifications add column if not exists antispoof_score numeric(4,3);
alter table public.verifications add column if not exists checked_by text;  -- 'deepface', 'navegador', 'humano'
