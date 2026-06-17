-- =====================================================================
-- VENDE YA — Supabase PostgreSQL Schema (Production)
-- =====================================================================
-- Mirrors the Prisma schema used in dev. Targets Supabase Postgres 15
-- with Realtime + Row Level Security enabled.
-- Run in Supabase SQL editor. After running, enable Realtime on:
--   bids, live_chat_messages, auctions (current_price), live_streams (viewer_count)
-- =====================================================================

-- Extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- =====================================================================
-- PROFILES (1:1 with auth.users)
-- =====================================================================
create type user_role as enum ('buyer', 'seller', 'admin', 'moderator');
create type product_status as enum ('draft', 'active', 'sold', 'archived', 'flagged');
create type auction_status as enum ('scheduled', 'live', 'sold', 'canceled', 'expired');
create type stream_status as enum ('scheduled', 'live', 'ended', 'error');
create type payment_method as enum ('yape', 'plin', 'pagoefectivo', 'card', 'transfer');
create type payment_status as enum ('pending', 'verified', 'disputed', 'refunded', 'failed');
create type moderation_status as enum ('pending', 'approved', 'rejected', 'review');
create type chat_message_type as enum ('user', 'system', 'ai', 'pinned', 'bid-event');
create type notification_type as enum ('bid-outbid', 'auction-won', 'auction-sold', 'new-follower', 'live-started', 'payment-verified', 'chat-mention');

create table profiles (
  id            uuid primary key default uuid_generate_v4(),
  auth_id       uuid unique references auth.users(id) on delete cascade,
  username      text unique not null,
  display_name  text not null,
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

-- Auto-create profile on signup
create or replace function handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into profiles (auth_id, username, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
          coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)))
  on conflict (auth_id) do nothing;
  return new;
end; $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- =====================================================================
-- FOLLOWS
-- =====================================================================
create table follows (
  id          uuid primary key default uuid_generate_v4(),
  follower_id uuid not null references profiles(id) on delete cascade,
  followee_id uuid not null references profiles(id) on delete cascade,
  created_at  timestamptz not null default now(),
  unique (follower_id, followee_id)
);
create index idx_follows_followee on follows(followee_id);

-- =====================================================================
-- CATEGORIES
-- =====================================================================
create table categories (
  id         uuid primary key default uuid_generate_v4(),
  slug       text unique not null,
  name_es    text not null,
  name_en    text,
  icon       text,
  color      text,
  parent_id  uuid references categories(id) on delete set null,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

-- =====================================================================
-- PRODUCTS
-- =====================================================================
create table products (
  id              uuid primary key default uuid_generate_v4(),
  seller_id       uuid not null references profiles(id) on delete cascade,
  category_id     uuid references categories(id) on delete set null,
  title           text not null,
  description     text not null,
  base_price      numeric(12,2) not null,
  currency        text not null default 'PEN',
  condition       text not null default 'nuevo',
  stock           int not null default 1,
  images          jsonb not null default '[]',
  video_key       text,
  shipping_from   text,
  ships_nationwide boolean not null default true,
  shipping_cost   numeric(12,2) not null default 0,
  payment_methods jsonb not null default '["yape","plin"]',
  status          product_status not null default 'draft',
  ai_moderation_status moderation_status not null default 'pending',
  ai_moderation_reason text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
create index idx_products_seller on products(seller_id);
create index idx_products_category on products(category_id);
create index idx_products_status on products(status);

-- =====================================================================
-- LIVE STREAMS (Cloudflare Stream)
-- =====================================================================
create table live_streams (
  id                uuid primary key default uuid_generate_v4(),
  seller_id         uuid not null references profiles(id) on delete cascade,
  stream_key        text unique not null,
  playback_id       text,
  title             text not null,
  description       text,
  thumbnail_url     text,
  status            stream_status not null default 'scheduled',
  is_live           boolean not null default false,
  viewer_count      int not null default 0,
  peak_viewer_count int not null default 0,
  like_count        int not null default 0,
  share_count       int not null default 0,
  ai_moderation_enabled boolean not null default true,
  scheduled_at      timestamptz,
  started_at        timestamptz,
  ended_at          timestamptz,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);
create index idx_streams_seller on live_streams(seller_id);
create index idx_streams_status on live_streams(status);
create index idx_streams_live on live_streams(is_live);

-- =====================================================================
-- AUCTIONS
-- =====================================================================
create table auctions (
  id             uuid primary key default uuid_generate_v4(),
  stream_id      uuid references live_streams(id) on delete set null,
  seller_id      uuid not null references profiles(id) on delete cascade,
  product_id     uuid not null references products(id) on delete cascade,
  starting_price numeric(12,2) not null,
  current_price  numeric(12,2) not null,
  reserve_price  numeric(12,2),
  buy_now_price  numeric(12,2),
  bid_increment  numeric(12,2) not null default 1,
  status         auction_status not null default 'scheduled',
  winner_id      uuid references profiles(id) on delete set null,
  starts_at      timestamptz not null,
  ends_at        timestamptz,
  duration_sec   int not null default 180,
  bid_count      int not null default 0,
  watcher_count  int not null default 0,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);
create index idx_auctions_stream on auctions(stream_id);
create index idx_auctions_seller on auctions(seller_id);
create index idx_auctions_status on auctions(status);
create index idx_auctions_starts on auctions(starts_at);

-- =====================================================================
-- BIDS (REALTIME)
-- =====================================================================
create table bids (
  id         uuid primary key default uuid_generate_v4(),
  auction_id uuid not null references auctions(id) on delete cascade,
  bidder_id  uuid not null references profiles(id) on delete cascade,
  amount     numeric(12,2) not null,
  is_winning boolean not null default false,
  is_auto_bid boolean not null default false,
  ip_hash    text,
  device_fp  text,
  created_at timestamptz not null default now(),
  unique (auction_id, bidder_id, created_at)
);
create index idx_bids_auction_time on bids(auction_id, created_at);
create index idx_bids_bidder on bids(bidder_id);

-- Atomic place-bid function (prevents race conditions in concurrent bids)
create or replace function place_bid(
  p_auction_id uuid,
  p_bidder_id  uuid,
  p_amount     numeric
) returns uuid language plpgsql security definer as $$
declare
  v_auction   auctions%rowtype;
  v_bid_id    uuid;
begin
  select * into v_auction from auctions where id = p_auction_id for update;

  if v_auction is null then
    raise exception 'Auction not found';
  end if;
  if v_auction.status <> 'live' then
    raise exception 'Auction is not live';
  end if;
  if p_amount <= v_auction.current_price then
    raise exception 'Bid must be greater than current price (%)',
      v_auction.current_price;
  end if;
  if p_amount < v_auction.current_price + v_auction.bid_increment then
    raise exception 'Bid does not meet minimum increment (%)',
      v_auction.bid_increment;
  end if;

  -- Mark previous winning bid as not winning
  update bids set is_winning = false
    where auction_id = p_auction_id and is_winning = true;

  -- Insert new winning bid
  insert into bids (auction_id, bidder_id, amount, is_winning)
    values (p_auction_id, p_bidder_id, p_amount, true)
    returning id into v_bid_id;

  -- Update auction current price + bid count
  update auctions
    set current_price = p_amount,
        bid_count = bid_count + 1,
        updated_at = now()
    where id = p_auction_id;

  return v_bid_id;
end; $$;

-- =====================================================================
-- LIVE CHAT MESSAGES (REALTIME)
-- =====================================================================
create table live_chat_messages (
  id           uuid primary key default uuid_generate_v4(),
  stream_id    uuid not null references live_streams(id) on delete cascade,
  sender_id    uuid references profiles(id) on delete set null,
  guest_name   text,
  content      text not null,
  type         chat_message_type not null default 'user',
  ai_flagged   boolean not null default false,
  ai_category  text,
  ai_score     numeric(3,2),
  is_hidden    boolean not null default false,
  created_at   timestamptz not null default now()
);
create index idx_chat_stream_time on live_chat_messages(stream_id, created_at);
create index idx_chat_flagged on live_chat_messages(ai_flagged);

-- =====================================================================
-- USER RATINGS
-- =====================================================================
create table user_ratings (
  id          uuid primary key default uuid_generate_v4(),
  from_user_id uuid not null references profiles(id) on delete cascade,
  to_user_id   uuid not null references profiles(id) on delete cascade,
  product_id   uuid references products(id) on delete set null,
  auction_id   uuid references auctions(id) on delete set null,
  rating       int not null check (rating between 1 and 5),
  review       text,
  tags         jsonb,
  is_flagged   boolean not null default false,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  unique (from_user_id, to_user_id, product_id, auction_id)
);
create index idx_ratings_to on user_ratings(to_user_id);

-- Recompute rating on insert/update/delete
create or replace function recompute_rating()
returns trigger language plpgsql security definer as $$
declare
  v_to uuid;
begin
  v_to := coalesce(new.to_user_id, old.to_user_id);
  if v_to is not null then
    update profiles set
      rating = coalesce((select avg(rating) from user_ratings where to_user_id = v_to), 0),
      ratings_count = (select count(*) from user_ratings where to_user_id = v_to)
    where id = v_to;
  end if;
  return coalesce(new, old);
end; $$;

create trigger trg_rating_recompute
  after insert or update or delete on user_ratings
  for each row execute function recompute_rating();

-- =====================================================================
-- PAYMENTS
-- =====================================================================
create table payments (
  id            uuid primary key default uuid_generate_v4(),
  auction_id    uuid references auctions(id) on delete set null,
  buyer_id      uuid not null references profiles(id),
  seller_id     uuid not null references profiles(id),
  amount        numeric(12,2) not null,
  currency      text not null default 'PEN',
  method        payment_method not null,
  method_ref    text,
  status        payment_status not null default 'pending',
  shipping_addr text,
  shipping_cost numeric(12,2) not null default 0,
  created_at    timestamptz not null default now(),
  verified_at   timestamptz
);
create index idx_payments_buyer on payments(buyer_id);
create index idx_payments_seller on payments(seller_id);
create index idx_payments_status on payments(status);

-- =====================================================================
-- NOTIFICATIONS
-- =====================================================================
create table notifications (
  id         uuid primary key default uuid_generate_v4(),
  user_id    uuid not null references profiles(id) on delete cascade,
  type       notification_type not null,
  title      text not null,
  body       text,
  link_url   text,
  is_read    boolean not null default false,
  metadata   jsonb,
  created_at timestamptz not null default now()
);
create index idx_notifications_user_read on notifications(user_id, is_read);
create index idx_notifications_created on notifications(created_at);

-- =====================================================================
-- REALTIME PUBLICATION — expose to Supabase Realtime
-- =====================================================================
alter publication supabase_realtime add table bids;
alter publication supabase_realtime add table live_chat_messages;
alter publication supabase_realtime add table auctions;
alter publication supabase_realtime add table live_streams;

-- =====================================================================
-- ROW LEVEL SECURITY POLICIES
-- =====================================================================
alter table profiles           enable row level security;
alter table follows            enable row level security;
alter table categories         enable row level security;
alter table products           enable row level security;
alter table live_streams       enable row level security;
alter table auctions           enable row level security;
alter table bids               enable row level security;
alter table live_chat_messages enable row level security;
alter table user_ratings       enable row level security;
alter table payments           enable row level security;
alter table notifications      enable row level security;

-- Profiles: public read, self-update
create policy "profiles_read_all" on profiles for select using (true);
create policy "profiles_update_self" on profiles for update using (auth_id = auth.uid());
create policy "profiles_insert_self" on profiles for insert with check (auth_id = auth.uid());

-- Follows: read public, manage self
create policy "follows_read_all" on follows for select using (true);
create policy "follows_insert_self" on follows for insert with check (follower_id = (select id from profiles where auth_id = auth.uid()));
create policy "follows_delete_self" on follows for delete using (follower_id = (select id from profiles where auth_id = auth.uid()));

-- Categories: public read
create policy "categories_read_all" on categories for select using (true);

-- Products: public read (when active/draft visible to seller), seller manages
create policy "products_read_active" on products for select using (
  status in ('active', 'sold') or seller_id = (select id from profiles where auth_id = auth.uid())
);
create policy "products_insert_seller" on products for insert with check (
  seller_id = (select id from profiles where auth_id = auth.uid())
);
create policy "products_update_owner" on products for update using (
  seller_id = (select id from profiles where auth_id = auth.uid())
);
create policy "products_delete_owner" on products for delete using (
  seller_id = (select id from profiles where auth_id = auth.uid())
);

-- Live streams: public read, seller manages
create policy "streams_read_all" on live_streams for select using (true);
create policy "streams_insert_seller" on live_streams for insert with check (
  seller_id = (select id from profiles where auth_id = auth.uid())
);
create policy "streams_update_owner" on live_streams for update using (
  seller_id = (select id from profiles where auth_id = auth.uid())
);

-- Auctions: public read, seller manages
create policy "auctions_read_all" on auctions for select using (true);
create policy "auctions_insert_seller" on auctions for insert with check (
  seller_id = (select id from profiles where auth_id = auth.uid())
);
create policy "auctions_update_seller_or_winner" on auctions for update using (
  seller_id = (select id from profiles where auth_id = auth.uid())
  or winner_id = (select id from profiles where auth_id = auth.uid())
);

-- Bids: public read (anyone can see live auction bids), bidder inserts via RPC
create policy "bids_read_all" on bids for select using (true);
-- Bids are inserted only via the security_definer function place_bid(),
-- which bypasses RLS — but we still expose a policy as a safety net.
create policy "bids_insert_self" on bids for insert with check (
  bidder_id = (select id from profiles where auth_id = auth.uid())
);

-- Chat messages: public read non-hidden, sender inserts (AI moderation in app layer)
create policy "chat_read_public" on live_chat_messages for select using (
  is_hidden = false or sender_id = (select id from profiles where auth_id = auth.uid())
);
create policy "chat_insert_self" on live_chat_messages for insert with check (
  sender_id = (select id from profiles where auth_id = auth.uid()) or sender_id is null
);
create policy "chat_update_moderator" on live_chat_messages for update using (
  exists (select 1 from profiles p where p.auth_id = auth.uid() and p.role in ('admin', 'moderator'))
);

-- Ratings: public read, from_user inserts/updates own
create policy "ratings_read_all" on user_ratings for select using (true);
create policy "ratings_insert_self" on user_ratings for insert with check (
  from_user_id = (select id from profiles where auth_id = auth.uid())
);
create policy "ratings_update_self" on user_ratings for update using (
  from_user_id = (select id from profiles where auth_id = auth.uid())
);

-- Payments: buyer/seller only
create policy "payments_read_party" on payments for select using (
  buyer_id = (select id from profiles where auth_id = auth.uid())
  or seller_id = (select id from profiles where auth_id = auth.uid())
);
create policy "payments_insert_buyer" on payments for insert with check (
  buyer_id = (select id from profiles where auth_id = auth.uid())
);
create policy "payments_update_party" on payments for update using (
  buyer_id = (select id from profiles where auth_id = auth.uid())
  or seller_id = (select id from profiles where auth_id = auth.uid())
);

-- Notifications: owner only
create policy "notifs_read_self" on notifications for select using (
  user_id = (select id from profiles where auth_id = auth.uid())
);
create policy "notifs_update_self" on notifications for update using (
  user_id = (select id from profiles where auth_id = auth.uid())
);

-- =====================================================================
-- UPDATED_AT triggers
-- =====================================================================
create or replace function touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at := now(); return new; end; $$;

create trigger trg_profiles_touch before update on profiles
  for each row execute function touch_updated_at();
create trigger trg_products_touch before update on products
  for each row execute function touch_updated_at();
create trigger trg_streams_touch before update on live_streams
  for each row execute function touch_updated_at();
create trigger trg_auctions_touch before update on auctions
  for each row execute function touch_updated_at();
create trigger trg_ratings_touch before update on user_ratings
  for each row execute function touch_updated_at();

-- =====================================================================
-- DONE. After running:
-- 1. Enable Realtime on bids, live_chat_messages, auctions, live_streams.
-- 2. Add Cloudflare Stream webhook -> /api/webhooks/cloudflare-stream
-- 3. Add AI moderation edge function -> /api/ai/moderate-chat
-- =====================================================================
