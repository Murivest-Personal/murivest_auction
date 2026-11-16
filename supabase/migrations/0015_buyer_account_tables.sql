-- ============================================================
-- 0015 — BUYER ACCOUNT TABLES
-- Target: YOUR Supabase project
--
-- Adds the tables used by the signed-in buyer area and the back
-- office, plus the notification settings on buyer_registrations:
--   - buyer_bids          bids submitted by a registered account
--   - saved_lots          lots saved / liked by an account
--   - buyer_audit_logs    account + back-office audit trail
--
-- All three are service-role only (RLS enabled, no public
-- policies). buyer_registrations must already exist (0014).
-- ============================================================

-- 1) Notification settings on the account profile.
alter table public.buyer_registrations
  add column if not exists notify_new_lots   boolean not null default true,
  add column if not exists notify_off_market boolean not null default true,
  add column if not exists notify_bid_updates boolean not null default true;

-- 2) Account bids — exclusive to registered (signed-in) buyers.
create table if not exists public.buyer_bids (
  id                 uuid primary key default gen_random_uuid(),
  reference          text not null unique,
  buyer_id           uuid not null references public.buyer_registrations(id) on delete cascade,
  property_sanity_id text,
  property_slug      text not null,
  property_title     text not null,
  property_market    text not null,
  bid_amount         numeric(15,2) not null check (bid_amount > 0),
  bid_currency       text not null default 'KES',
  consent_terms      boolean not null default false,
  consent_fee        boolean not null default false,
  terms_consent_at   timestamptz,
  fee_consent_at     timestamptz,
  terms_version      text,
  fee_terms_version  text,
  status             text not null default 'submitted',
  status_note        text,
  ip_hash            text,
  user_agent         text,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

create index if not exists buyer_bids_buyer_idx
  on public.buyer_bids (buyer_id, created_at desc);
create index if not exists buyer_bids_property_idx
  on public.buyer_bids (property_slug, created_at desc);
create index if not exists buyer_bids_status_idx
  on public.buyer_bids (status, created_at desc);

drop trigger if exists buyer_bids_set_updated_at on public.buyer_bids;
create trigger buyer_bids_set_updated_at
before update on public.buyer_bids
for each row execute function public.tg_set_updated_at();

alter table public.buyer_bids enable row level security;

-- 3) Saved / liked lots — one row per buyer/property/kind.
create table if not exists public.saved_lots (
  id           uuid primary key default gen_random_uuid(),
  buyer_id     uuid not null references public.buyer_registrations(id) on delete cascade,
  property_slug text not null,
  kind         text not null check (kind in ('save','like')),
  created_at   timestamptz not null default now(),
  constraint saved_lots_buyer_property_kind_key unique (buyer_id, property_slug, kind)
);

create index if not exists saved_lots_buyer_idx
  on public.saved_lots (buyer_id, kind, created_at desc);

alter table public.saved_lots enable row level security;

-- 4) Account / back-office audit trail.
create table if not exists public.buyer_audit_logs (
  id            uuid primary key default gen_random_uuid(),
  buyer_id      uuid,
  property_slug text,
  bid_id        text,
  action        text not null,
  details       text,
  ip_hash       text,
  created_at    timestamptz not null default now()
);

create index if not exists buyer_audit_logs_created_idx
  on public.buyer_audit_logs (created_at desc);
create index if not exists buyer_audit_logs_buyer_idx
  on public.buyer_audit_logs (buyer_id, created_at desc);

alter table public.buyer_audit_logs enable row level security;

-- 5) Service-role grants (RLS is bypassed by the service role, but
--    the table privileges are still granted explicitly).
grant select, insert, update, delete on
  public.buyer_bids, public.saved_lots, public.buyer_audit_logs
to service_role;