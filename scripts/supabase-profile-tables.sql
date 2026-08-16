-- =====================================================================
-- VENDE YA — Profile & Security Tables (idempotent, safe to re-run)
-- =====================================================================
-- Creates all tables needed for the /perfil page to show REAL user data:
--   - profiles              : public profile data (1:1 with auth.users)
--   - user_addresses        : shipping addresses
--   - user_payment_methods  : Yape, Plin, Mercado Pago, cards
--   - user_security_log     : login events, device, IP, location
--   - user_kyc              : identity verification status (DNI, selfie)
--   - user_notification_prefs : notification channel opt-ins
--   - user_sessions         : active sessions (devices, last seen)
--
-- All tables use RLS: users can only read/write their own rows.
-- =====================================================================

create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- Types (idempotent via DO blocks)
do $$ begin
  create type user_role as enum ('buyer', 'seller', 'admin', 'moderator');
exception when duplicate_object then null; end $$;

do $$ begin
  create type payment_method_type_ex as enum ('yape', 'plin', 'pagoefectivo', 'card', 'mercado_pago', 'transfer');
exception when duplicate_object then null; end $$;

do $$ begin
  create type kyc_status as enum ('unverified', 'pending', 'in_review', 'approved', 'rejected', 'expired');
exception when duplicate_object then null; end $$;

do $$ begin
  create type security_event_type as enum (
    'login', 'logout', 'signup', 'password_change', 'password_reset_request',
    'password_reset_success', 'email_verified', 'phone_verified',
    'oauth_login', '2fa_enabled', '2fa_disabled', '2fa_challenge',
    'suspicious_activity', 'account_recovery', 'api_token_issued'
  );
exception when duplicate_object then null; end $$;

-- Drop conflicting trigger/function first (idempotent)
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists handle_new_user() cascade;

-- =====================================================================
-- PROFILES TABLE
-- =====================================================================
create table if not exists profiles (
  id            uuid primary key default uuid_generate_v4(),
  auth_id       uuid unique references auth.users(id) on delete cascade,
  username      text unique not null,
  display_name  text not null,
  email         text,
  avatar_url    text,
  bio           text,
  phone         text,
  whatsapp      text,
  role          user_role not null default 'buyer',
  rating        numeric(2,1) not null default 0,
  ratings_count int not null default 0,
  sales_count   int not null default 0,
  is_verified   boolean not null default false,
  is_live_seller boolean not null default false,
  total_revenue numeric(12,2) not null default 0,
  follower_count int not null default 0,
  is_banned     boolean not null default false,
  banned_reason text,
  locale        text not null default 'es-PE',
  department    text,
  province      text,
  district      text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  last_seen_at  timestamptz not null default now()
);

alter table profiles enable row level security;
drop policy if exists "profiles_self_select" on profiles;
create policy "profiles_self_select" on profiles for select using (auth.uid() = auth_id);
drop policy if exists "profiles_self_insert" on profiles;
create policy "profiles_self_insert" on profiles for insert with check (auth.uid() = auth_id);
drop policy if exists "profiles_self_update" on profiles;
create policy "profiles_self_update" on profiles for update using (auth.uid() = auth_id);

-- Trigger: auto-create profile on signup
create or replace function handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into profiles (auth_id, username, display_name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)),
    new.email
  )
  on conflict (auth_id) do update set email = excluded.email, updated_at = now();
  return new;
end; $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- Backfill profiles for existing auth users
insert into profiles (auth_id, username, display_name, email)
select
  u.id,
  coalesce(u.raw_user_meta_data->>'username', split_part(u.email, '@', 1)),
  coalesce(u.raw_user_meta_data->>'display_name', split_part(u.email, '@', 1)),
  u.email
from auth.users u
where not exists (select 1 from profiles p where p.auth_id = u.id);

-- =====================================================================
-- USER ADDRESSES
-- =====================================================================
create table if not exists user_addresses (
  id           uuid primary key default uuid_generate_v4(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  label        text not null,
  recipient    text not null,
  phone        text,
  address_line text not null,
  reference    text,
  district     text not null,
  province     text not null,
  department   text not null,
  postal_code  text,
  is_default   boolean not null default false,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create index if not exists idx_user_addresses_user on user_addresses(user_id);
alter table user_addresses enable row level security;
drop policy if exists "user_addresses_self_read" on user_addresses;
create policy "user_addresses_self_read" on user_addresses for select using (auth.uid() = user_id);
drop policy if exists "user_addresses_self_write" on user_addresses;
create policy "user_addresses_self_write" on user_addresses for insert with check (auth.uid() = user_id);
drop policy if exists "user_addresses_self_update" on user_addresses;
create policy "user_addresses_self_update" on user_addresses for update using (auth.uid() = user_id);
drop policy if exists "user_addresses_self_delete" on user_addresses;
create policy "user_addresses_self_delete" on user_addresses for delete using (auth.uid() = user_id);

-- =====================================================================
-- USER PAYMENT METHODS
-- =====================================================================
create table if not exists user_payment_methods (
  id              uuid primary key default uuid_generate_v4(),
  user_id         uuid not null references auth.users(id) on delete cascade,
  type            payment_method_type_ex not null,
  label           text,
  phone           text,
  card_last4      text,
  card_brand      text,
  card_exp_month  int,
  card_exp_year   int,
  mp_user_id      text,
  mp_linked_at    timestamptz,
  wallet_balance  numeric(12,2) default 0,
  is_default      boolean not null default false,
  is_verified     boolean not null default false,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
create index if not exists idx_user_payment_methods_user on user_payment_methods(user_id);
alter table user_payment_methods enable row level security;
drop policy if exists "user_payment_methods_self_read" on user_payment_methods;
create policy "user_payment_methods_self_read" on user_payment_methods for select using (auth.uid() = user_id);
drop policy if exists "user_payment_methods_self_write" on user_payment_methods;
create policy "user_payment_methods_self_write" on user_payment_methods for insert with check (auth.uid() = user_id);
drop policy if exists "user_payment_methods_self_update" on user_payment_methods;
create policy "user_payment_methods_self_update" on user_payment_methods for update using (auth.uid() = user_id);
drop policy if exists "user_payment_methods_self_delete" on user_payment_methods;
create policy "user_payment_methods_self_delete" on user_payment_methods for delete using (auth.uid() = user_id);

-- =====================================================================
-- USER SECURITY LOG
-- =====================================================================
create table if not exists user_security_log (
  id            uuid primary key default uuid_generate_v4(),
  user_id       uuid references auth.users(id) on delete cascade,
  event_type    security_event_type not null,
  ip_address    inet,
  user_agent    text,
  device_type   text,
  os            text,
  browser       text,
  country       text,
  region        text,
  city          text,
  success       boolean not null default true,
  failure_reason text,
  metadata      jsonb,
  created_at    timestamptz not null default now()
);
create index if not exists idx_user_security_log_user on user_security_log(user_id, created_at desc);
create index if not exists idx_user_security_log_event on user_security_log(event_type, created_at desc);
alter table user_security_log enable row level security;
drop policy if exists "user_security_log_self_read" on user_security_log;
create policy "user_security_log_self_read" on user_security_log for select using (auth.uid() = user_id);
drop policy if exists "user_security_log_self_write" on user_security_log;
create policy "user_security_log_self_write" on user_security_log for insert with check (auth.uid() = user_id);

-- =====================================================================
-- USER KYC
-- =====================================================================
create table if not exists user_kyc (
  id              uuid primary key default uuid_generate_v4(),
  user_id         uuid not null references auth.users(id) on delete cascade,
  dni_number      text,
  dni_first_name  text,
  dni_last_name   text,
  dni_verified_at timestamptz,
  selfie_url      text,
  selfie_uploaded_at timestamptz,
  doc_front_url   text,
  doc_back_url    text,
  status          kyc_status not null default 'unverified',
  rejection_reason text,
  reviewed_by     uuid references auth.users(id),
  reviewed_at     timestamptz,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  unique (user_id)
);
create index if not exists idx_user_kyc_status on user_kyc(status);
alter table user_kyc enable row level security;
drop policy if exists "user_kyc_self_read" on user_kyc;
create policy "user_kyc_self_read" on user_kyc for select using (auth.uid() = user_id);
drop policy if exists "user_kyc_self_write" on user_kyc;
create policy "user_kyc_self_write" on user_kyc for insert with check (auth.uid() = user_id);
drop policy if exists "user_kyc_self_update" on user_kyc;
create policy "user_kyc_self_update" on user_kyc for update using (auth.uid() = user_id);

-- =====================================================================
-- USER NOTIFICATION PREFERENCES
-- =====================================================================
create table if not exists user_notification_prefs (
  user_id            uuid primary key references auth.users(id) on delete cascade,
  push_bids          boolean not null default true,
  push_outbid        boolean not null default true,
  push_won           boolean not null default true,
  push_followers     boolean not null default true,
  push_live_starts   boolean not null default true,
  push_messages      boolean not null default true,
  push_marketing     boolean not null default false,
  email_bids         boolean not null default true,
  email_won          boolean not null default true,
  email_receipts     boolean not null default true,
  email_marketing    boolean not null default false,
  sms_critical       boolean not null default true,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);
alter table user_notification_prefs enable row level security;
drop policy if exists "user_notification_prefs_self_read" on user_notification_prefs;
create policy "user_notification_prefs_self_read" on user_notification_prefs for select using (auth.uid() = user_id);
drop policy if exists "user_notification_prefs_self_write" on user_notification_prefs;
create policy "user_notification_prefs_self_write" on user_notification_prefs for insert with check (auth.uid() = user_id);
drop policy if exists "user_notification_prefs_self_update" on user_notification_prefs;
create policy "user_notification_prefs_self_update" on user_notification_prefs for update using (auth.uid() = user_id);

-- =====================================================================
-- USER SESSIONS
-- =====================================================================
create table if not exists user_sessions (
  id              uuid primary key default uuid_generate_v4(),
  user_id         uuid not null references auth.users(id) on delete cascade,
  session_token   text,
  user_agent      text,
  device_type     text,
  os              text,
  browser         text,
  ip_address      inet,
  country         text,
  city            text,
  is_current      boolean not null default false,
  last_seen_at    timestamptz not null default now(),
  created_at      timestamptz not null default now(),
  expires_at      timestamptz
);
create index if not exists idx_user_sessions_user on user_sessions(user_id, last_seen_at desc);
alter table user_sessions enable row level security;
drop policy if exists "user_sessions_self_read" on user_sessions;
create policy "user_sessions_self_read" on user_sessions for select using (auth.uid() = user_id);
drop policy if exists "user_sessions_self_write" on user_sessions;
create policy "user_sessions_self_write" on user_sessions for insert with check (auth.uid() = user_id);
drop policy if exists "user_sessions_self_delete" on user_sessions;
create policy "user_sessions_self_delete" on user_sessions for delete using (auth.uid() = user_id);

-- =====================================================================
-- TRIGGERS — auto-create prefs + KYC on signup
-- =====================================================================
create or replace function handle_new_user_profile_extras()
returns trigger language plpgsql security definer as $$
begin
  insert into user_notification_prefs (user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  insert into user_kyc (user_id, status)
  values (new.id, 'unverified')
  on conflict (user_id) do nothing;

  return new;
end; $$;

drop trigger if exists on_auth_user_created_extras on auth.users;
create trigger on_auth_user_created_extras
  after insert on auth.users
  for each row execute function handle_new_user_profile_extras();

-- Backfill prefs + KYC for existing auth users
insert into user_notification_prefs (user_id)
select u.id from auth.users u
where not exists (select 1 from user_notification_prefs p where p.user_id = u.id);

insert into user_kyc (user_id, status)
select u.id, 'unverified' from auth.users u
where not exists (select 1 from user_kyc k where k.user_id = u.id);

-- updated_at helper
create or replace function update_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end; $$;

drop trigger if exists trg_user_addresses_updated on user_addresses;
create trigger trg_user_addresses_updated before update on user_addresses for each row execute function update_updated_at();

drop trigger if exists trg_user_payment_methods_updated on user_payment_methods;
create trigger trg_user_payment_methods_updated before update on user_payment_methods for each row execute function update_updated_at();

drop trigger if exists trg_user_kyc_updated on user_kyc;
create trigger trg_user_kyc_updated before update on user_kyc for each row execute function update_updated_at();

drop trigger if exists trg_user_notification_prefs_updated on user_notification_prefs;
create trigger trg_user_notification_prefs_updated before update on user_notification_prefs for each row execute function update_updated_at();

drop trigger if exists trg_profiles_updated on profiles;
create trigger trg_profiles_updated before update on profiles for each row execute function update_updated_at();

-- =====================================================================
-- DONE — all tables ready, RLS enabled, triggers active
-- =====================================================================
