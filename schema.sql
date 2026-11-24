-- =====================================================================
-- Yunta · Esquema de base de datos (Supabase / PostgreSQL)
-- Ejecutar en: Supabase → SQL Editor → New query → pegar y Run.
-- =====================================================================

create extension if not exists pgcrypto;

-- ---------- Tipos ----------
do $$ begin
  create type user_role    as enum ('cliente','proveedor','admin');
  create type verif_kind   as enum ('dni','selfie','cul','colegiatura');
  create type verif_status as enum ('pendiente','aprobado','rechazado');
  create type pay_status   as enum ('pendiente','pagado','rechazado','reembolsado');
  create type pay_method   as enum ('yape','plin','tarjeta');
exception when duplicate_object then null; end $$;

-- ---------- Perfiles públicos ----------
-- Lo que cualquiera puede ver. NUNCA guardar aquí teléfono, correo ni DNI.
create table if not exists public.profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  full_name    text not null default '',
  role         user_role not null default 'cliente',
  gender       text check (gender in ('f','m','x')) default 'x',
  birth_year   int,
  district     text,
  bio          text,
  avatar_seed  int not null default (floor(random()*100000))::int,
  is_verified  boolean not null default false,   -- lo pone el trigger de verificaciones
  created_at   timestamptz not null default now()
);

-- ---------- Datos privados / de contacto (BLOQUEADOS) ----------
-- Solo los ve el dueño, un admin o un cliente que pagó el desbloqueo.
create table if not exists public.provider_private (
  user_id    uuid primary key references public.profiles(id) on delete cascade,
  dni        text check (dni ~ '^\d{8}$'),
  phone      text,
  whatsapp   text,
  email      text,
  updated_at timestamptz not null default now()
);

-- ---------- Verificaciones de identidad ----------
create table if not exists public.verifications (
  id                 uuid primary key default gen_random_uuid(),
  user_id            uuid not null references public.profiles(id) on delete cascade,
  kind               verif_kind not null,
  status             verif_status not null default 'pendiente',
  file_path          text,              -- ruta en el bucket privado "verificaciones"
  cul_numero         text,              -- número del Certificado Único Laboral
  cul_fecha_emision  date,              -- el CUL vale 90 días desde su emisión
  colegiatura        text,              -- C.Ps.P., C.N.P., etc.
  face_match_score   numeric(4,3),      -- 0–1, lo llena el proveedor biométrico
  liveness_passed    boolean,
  reviewer_id        uuid references public.profiles(id),
  reviewed_at        timestamptz,
  notes              text,
  created_at         timestamptz not null default now(),
  constraint cul_reciente check (
    kind <> 'cul' or cul_fecha_emision is null or cul_fecha_emision >= (created_at::date - 90)
  )
);
create index if not exists verifications_user_idx on public.verifications(user_id);
create index if not exists verifications_pending_idx on public.verifications(status) where status = 'pendiente';

-- ---------- Servicios publicados ----------
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
  is_active      boolean not null default false,  -- solo un admin lo activa
  featured_until timestamptz,                      -- anuncio destacado (pagado)
  created_at     timestamptz not null default now()
);
create index if not exists services_search_idx on public.services(category, district) where is_active;

-- ---------- Desbloqueo de contacto (monetización) ----------
create table if not exists public.contact_unlocks (
  id              uuid primary key default gen_random_uuid(),
  client_id       uuid not null references public.profiles(id) on delete cascade,
  provider_id     uuid not null references public.profiles(id) on delete cascade,
  amount          numeric(8,2) not null,
  method          pay_method not null,
  operation_code  text,                 -- código de operación Yape/Plin o id de cargo de la pasarela
  status          pay_status not null default 'pendiente',
  paid_at         timestamptz,
  created_at      timestamptz not null default now(),
  unique (client_id, provider_id)
);

-- ---------- Créditos (paquetes de desbloqueos) ----------
create table if not exists public.credit_wallets (
  user_id  uuid primary key references public.profiles(id) on delete cascade,
  credits  int not null default 0 check (credits >= 0)
);

-- ---------- Reservas con pago protegido ----------
create table if not exists public.bookings (
  id             uuid primary key default gen_random_uuid(),
  service_id     uuid not null references public.services(id),
  client_id      uuid not null references public.profiles(id),
  provider_id    uuid not null references public.profiles(id),
  starts_at      timestamptz not null,
  quantity       int not null default 1 check (quantity between 1 and 12),
  meeting_place  text not null,
  details        text,
  subtotal       numeric(8,2) not null,
  fee            numeric(8,2) not null,   -- comisión Yunta
  total          numeric(8,2) generated always as (subtotal + fee) stored,
  method         pay_method not null,
  operation_code text,
  pay            pay_status not null default 'pendiente',
  status         text not null default 'solicitada'
                 check (status in ('solicitada','confirmada','completada','cancelada','en_disputa')),
  created_at     timestamptz not null default now()
);

-- ---------- Reseñas ----------
create table if not exists public.reviews (
  id          uuid primary key default gen_random_uuid(),
  booking_id  uuid unique references public.bookings(id) on delete cascade,
  author_id   uuid not null references public.profiles(id),
  provider_id uuid not null references public.profiles(id),
  rating      int not null check (rating between 1 and 5),
  comment     text,
  created_at  timestamptz not null default now()
);

-- ---------- Reportes de seguridad ----------
create table if not exists public.reports (
  id          uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references public.profiles(id),
  target_id   uuid not null references public.profiles(id),
  reason      text not null,
  created_at  timestamptz not null default now()
);

-- =====================================================================
-- Funciones auxiliares
-- =====================================================================
create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from profiles where id = auth.uid() and role = 'admin');
$$;

create or replace function public.has_unlocked(p_provider uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from contact_unlocks
                 where client_id = auth.uid() and provider_id = p_provider and status = 'pagado');
$$;

-- Crea el perfil automáticamente al registrarse
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into profiles (id, full_name, role)
  values (new.id,
          coalesce(new.raw_user_meta_data->>'full_name',''),
          coalesce((new.raw_user_meta_data->>'role')::user_role, 'cliente'));
  insert into credit_wallets (user_id) values (new.id);
  return new;
end $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- Un perfil queda verificado cuando tiene DNI + selfie + CUL aprobados
-- (y colegiatura si ofrece servicios de salud).
create or replace function public.refresh_verified() returns trigger
language plpgsql security definer set search_path = public as $$
declare uid uuid := coalesce(new.user_id, old.user_id); ok boolean;
begin
  select count(distinct kind) filter (where kind in ('dni','selfie','cul') and status='aprobado') = 3
     and (not exists (select 1 from services where provider_id = uid and category = 'salud')
          or bool_or(kind = 'colegiatura' and status = 'aprobado'))
    into ok
  from verifications where user_id = uid;
  perform set_config('yunta.sys','1',true);
  update profiles set is_verified = coalesce(ok,false) where id = uid;
  perform set_config('yunta.sys','0',true);
  return null;
end $$;
drop trigger if exists verifications_refresh on public.verifications;
create trigger verifications_refresh after insert or update or delete on public.verifications
  for each row execute function public.refresh_verified();

-- Un usuario no puede volverse admin ni marcarse verificado por su cuenta
create or replace function public.guard_profile() returns trigger
language plpgsql as $$
begin
  if current_setting('yunta.sys', true) = '1' or auth.uid() is null or auth.role() = 'service_role' or public.is_admin() then
    return new;
  end if;
  if new.role = 'admin' and old.role <> 'admin' then new.role := old.role; end if;
  new.is_verified := old.is_verified;
  return new;
end $$;
drop trigger if exists profiles_guard on public.profiles;
create trigger profiles_guard before update on public.profiles
  for each row execute function public.guard_profile();

-- Evita que un proveedor se active solo o se marque destacado sin pagar
create or replace function public.guard_service() returns trigger
language plpgsql as $$
begin
  if auth.uid() is not null and not public.is_admin() and coalesce(auth.role(),'') <> 'service_role' then
    if tg_op = 'INSERT' then new.is_active := false; new.featured_until := null;
    else new.is_active := old.is_active; new.featured_until := old.featured_until; end if;
  end if;
  return new;
end $$;
drop trigger if exists services_guard on public.services;
create trigger services_guard before insert or update on public.services
  for each row execute function public.guard_service();

-- Desbloquear usando un crédito del paquete (atómico)
create or replace function public.unlock_with_credit(p_provider uuid) returns boolean
language plpgsql security definer set search_path = public as $$
begin
  update credit_wallets set credits = credits - 1 where user_id = auth.uid() and credits > 0;
  if not found then return false; end if;
  insert into contact_unlocks (client_id, provider_id, amount, method, status, paid_at)
  values (auth.uid(), p_provider, 0, 'tarjeta', 'pagado', now())
  on conflict (client_id, provider_id) do update set status = 'pagado', paid_at = now();
  return true;
end $$;

-- Vista pública con versión enmascarada del contacto
create or replace view public.provider_contact as
select p.id as provider_id,
       case when auth.uid() = p.id or public.is_admin() or public.has_unlocked(p.id)
            then pp.whatsapp else left(coalesce(pp.whatsapp,'9'),1) || '•• ••• •••' end as whatsapp,
       case when auth.uid() = p.id or public.is_admin() or public.has_unlocked(p.id)
            then pp.email else '••••••@••••' end as email,
       (auth.uid() = p.id or public.is_admin() or public.has_unlocked(p.id)) as unlocked
from profiles p left join provider_private pp on pp.user_id = p.id;

-- =====================================================================
-- Seguridad a nivel de fila (RLS)
-- =====================================================================
alter table public.profiles         enable row level security;
alter table public.provider_private enable row level security;
alter table public.verifications    enable row level security;
alter table public.services         enable row level security;
alter table public.contact_unlocks  enable row level security;
alter table public.credit_wallets   enable row level security;
alter table public.bookings         enable row level security;
alter table public.reviews          enable row level security;
alter table public.reports          enable row level security;

-- profiles
create policy "perfiles públicos" on public.profiles for select using (true);
create policy "editar mi perfil"  on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);

-- provider_private: el contacto solo se revela tras pagar
create policy "ver contacto si dueño, admin o desbloqueado" on public.provider_private for select
  using (auth.uid() = user_id or public.is_admin() or public.has_unlocked(user_id));
create policy "guardar mi contacto" on public.provider_private for insert with check (auth.uid() = user_id);
create policy "editar mi contacto"  on public.provider_private for update using (auth.uid() = user_id);

-- verifications: el usuario sube, solo admin aprueba
create policy "ver mis verificaciones" on public.verifications for select using (auth.uid() = user_id or public.is_admin());
create policy "enviar verificación"    on public.verifications for insert
  with check (auth.uid() = user_id and status = 'pendiente' and reviewer_id is null);
create policy "admin revisa"           on public.verifications for update using (public.is_admin());

-- services
create policy "ver servicios activos o míos" on public.services for select
  using (is_active or provider_id = auth.uid() or public.is_admin());
create policy "publicar servicio" on public.services for insert with check (provider_id = auth.uid());
create policy "editar mi servicio" on public.services for update using (provider_id = auth.uid() or public.is_admin());
create policy "borrar mi servicio" on public.services for delete using (provider_id = auth.uid() or public.is_admin());

-- contact_unlocks: el cliente solicita; el pago lo confirma un admin o el webhook (service_role)
create policy "ver mis desbloqueos" on public.contact_unlocks for select
  using (client_id = auth.uid() or provider_id = auth.uid() or public.is_admin());
create policy "solicitar desbloqueo" on public.contact_unlocks for insert
  with check (client_id = auth.uid() and status = 'pendiente' and paid_at is null);
create policy "admin confirma pago" on public.contact_unlocks for update using (public.is_admin());

-- credit_wallets
create policy "ver mis créditos" on public.credit_wallets for select using (user_id = auth.uid() or public.is_admin());

-- bookings
create policy "ver mis reservas" on public.bookings for select
  using (client_id = auth.uid() or provider_id = auth.uid() or public.is_admin());
create policy "crear reserva" on public.bookings for insert
  with check (client_id = auth.uid() and pay = 'pendiente');
create policy "actualizar reserva" on public.bookings for update
  using (client_id = auth.uid() or provider_id = auth.uid() or public.is_admin());

-- reviews
create policy "reseñas públicas" on public.reviews for select using (true);
create policy "reseñar reserva completada" on public.reviews for insert with check (
  author_id = auth.uid() and exists (select 1 from bookings b where b.id = booking_id
    and b.client_id = auth.uid() and b.status = 'completada'));

-- reports
create policy "reportar" on public.reports for insert with check (reporter_id = auth.uid());
create policy "admin ve reportes" on public.reports for select using (public.is_admin());

-- =====================================================================
-- Storage: bucket privado para DNI, selfie y CUL
-- =====================================================================
insert into storage.buckets (id, name, public) values ('verificaciones','verificaciones', false)
  on conflict (id) do nothing;

create policy "subir mis documentos" on storage.objects for insert
  with check (bucket_id = 'verificaciones' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "ver mis documentos o admin" on storage.objects for select
  using (bucket_id = 'verificaciones' and ((storage.foldername(name))[1] = auth.uid()::text or public.is_admin()));

-- =====================================================================
-- Para hacerte admin (después de registrarte en la app):
--   update public.profiles set role = 'admin' where id = (select id from auth.users where email = 'TU_CORREO');
-- =====================================================================
