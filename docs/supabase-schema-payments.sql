-- =====================================================================
-- VENDE YA — Schema de Pagos, Logística y Compliance (Supabase)
-- =====================================================================
-- Ejecutar este script en el editor SQL de Supabase.
-- Requiere que auth.users exista (Supabase Auth habilitado).
-- Todas las tablas con datos sensibles tienen RLS habilitado.
-- =====================================================================

create extension if not exists "uuid-ossp";

-- ---------------------------------------------------------------------
-- 1. BILLETERAS DE VENDEDORES (gateways de cobro)
-- ---------------------------------------------------------------------
create table if not exists public.seller_wallets (
    id uuid references auth.users not null primary key,
    gateway_seller_id text not null,
    is_verified boolean default false not null,
    status text check (status in ('active', 'suspended', 'banned')) default 'active' not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ---------------------------------------------------------------------
-- 2. ÓRDENES + SPLIT DE PAGOS (Modo A — vendedor absorbe costos)
-- ---------------------------------------------------------------------
create table if not exists public.orders (
    id uuid default gen_random_uuid() primary key,
    buyer_id uuid references auth.users not null,
    seller_id uuid references auth.users not null,
    source text check (source in ('live_stream', 'marketplace')) not null,
    total_amount numeric(10, 2) not null,
    platform_commission_rate numeric(4, 2) not null,
    platform_commission_amount numeric(10, 2) not null,
    gateway_fee_amount numeric(10, 2) not null,
    seller_net_amount numeric(10, 2) not null,
    payment_status text check (payment_status in ('pending', 'paid', 'escrow_hold', 'released', 'refunded')) default 'pending' not null,
    payment_method text check (payment_method in ('yape', 'plin', 'credit_card', 'pago_efectivo')) not null,
    gateway_transaction_id text unique,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index if not exists idx_orders_seller on public.orders(seller_id);
create index if not exists idx_orders_payment_status on public.orders(payment_status);
create index if not exists idx_orders_buyer on public.orders(buyer_id);
create index if not exists idx_orders_created_at on public.orders(created_at desc);

-- ---------------------------------------------------------------------
-- 3. ENVÍOS SHALOM (agencia-a-agencia)
-- ---------------------------------------------------------------------
create table if not exists public.shalom_shipments (
    id uuid default gen_random_uuid() primary key,
    order_id uuid references public.orders(id) on delete cascade not null,
    tracking_code text unique,
    origin_agency_id text not null,
    destination_agency_id text not null,
    sender_dni text not null,
    receiver_dni text not null,
    shipping_cost numeric(10, 2) not null,
    shipment_status text check (shipment_status in ('pending_dropoff', 'in_transit', 'ready_for_pickup', 'delivered')) default 'pending_dropoff' not null,
    pdf_label_url text,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index if not exists idx_shalom_shipments_order on public.shalom_shipments(order_id);
create index if not exists idx_shalom_shipments_status on public.shalom_shipments(shipment_status);
create index if not exists idx_shalom_shipments_tracking on public.shalom_shipments(tracking_code);

-- ---------------------------------------------------------------------
-- 4. REPORTES DE PROPIEDAD INTELECTUAL (DMCA / Indecopi)
-- ---------------------------------------------------------------------
create table if not exists public.copyright_reports (
    id uuid default gen_random_uuid() primary key,
    reporter_email text not null,
    target_seller_id uuid references public.seller_wallets(id) on delete cascade not null,
    target_order_or_stream_id text not null,
    infringed_brand text not null,
    evidence_url text,
    status text check (status in ('pending', 'investigating', 'resolved_ban', 'rejected')) default 'pending' not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index if not exists idx_copyright_status on public.copyright_reports(status);
create index if not exists idx_copyright_target on public.copyright_reports(target_seller_id);

-- ---------------------------------------------------------------------
-- 5. ROW LEVEL SECURITY
-- ---------------------------------------------------------------------
alter table public.seller_wallets enable row level security;
alter table public.orders enable row level security;
alter table public.shalom_shipments enable row level security;
alter table public.copyright_reports enable row level security;

-- seller_wallets: cada vendedor solo ve SU wallet; admins ven todo
create policy "owner_reads_own_wallet" on public.seller_wallets
    for select using (auth.uid() = id);
create policy "owner_updates_own_wallet" on public.seller_wallets
    for update using (auth.uid() = id);

-- orders: comprador y vendedor ven sus órdenes; admin via service_role (RLS bypassed)
create policy "buyer_or_seller_reads_order" on public.orders
    for select using (auth.uid() = buyer_id or auth.uid() = seller_id);

-- shalom_shipments: solo comprador y vendedor de la orden padre
create policy "buyer_or_seller_reads_shipment" on public.shalom_shipments
    for select using (
        exists (
            select 1 from public.orders o
            where o.id = shalom_shipments.order_id
              and (o.buyer_id = auth.uid() or o.seller_id = auth.uid())
        )
    );

-- copyright_reports: el reportante solo ve los suyos; admin ve todo (via service_role)
create policy "reporter_reads_own_reports" on public.copyright_reports
    for select using (
        reporter_email = (
            select email from auth.users where id = auth.uid()
        )
    );
create policy "anyone_creates_copyright_report" on public.copyright_reports
    for insert with check (true);

-- ---------------------------------------------------------------------
-- 6. FUNCIÓN DE BANEO AUTOMÁTICO (invocada por admin o trigger)
-- ---------------------------------------------------------------------
create or replace function public.ban_infringing_seller(seller_uuid uuid)
returns void as $$
begin
    -- Suspender wallet (congela splits de pago)
    update public.seller_wallets
    set is_verified = false, status = 'banned', updated_at = now()
    where id = seller_uuid;

    -- Marcar todos los streams live del vendedor como offline
    -- (esto requiere que la tabla live_streams exista — ver docs/supabase-schema.sql)
    -- update public.live_streams set is_live = false, status = 'ended'
    -- where seller_id = seller_uuid;
end;
$$ language plpgsql security definer;

-- Permisos
revoke all on public.seller_wallets from anon, authenticated;
grant select, update on public.seller_wallets to authenticated;

revoke all on public.orders from anon;
grant select, insert on public.orders to authenticated;

revoke all on public.shalom_shipments from anon;
grant select on public.shalom_shipments to authenticated;

revoke all on public.copyright_reports from anon, authenticated;
grant select, insert on public.copyright_reports to authenticated;
grant execute on function public.ban_infringing_seller(uuid) to authenticated;
