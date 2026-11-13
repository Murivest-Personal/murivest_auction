-- ============================================================
-- Murivest Auctions — Guest Bid Registrations
-- Target: YOUR Supabase project
-- ============================================================

-- 1) Enums
create type public.auction_market   as enum ('kenya', 'uk');
create type public.auction_bid_status as enum ('pending', 'verified', 'routed', 'rejected', 'archived');
create type public.auction_currency as enum ('KES', 'GBP', 'USD');

-- 2) Bids table
create table public.auction_bids (
  id                   uuid primary key default gen_random_uuid(),
  property_sanity_id   text        not null,
  property_slug        text        not null,
  property_title       text        not null,
  property_market      public.auction_market not null,
  bidder_name          text        not null,
  bidder_email         text        not null,
  bidder_email_hash    text        not null,
  bidder_phone         text        not null,
  bid_amount           numeric(15,2) not null check (bid_amount > 0 and bid_amount < 1e11),
  bid_currency         public.auction_currency not null,
  consent_terms        boolean     not null default false,
  status               public.auction_bid_status not null default 'pending',
  ip_hash              text,
  user_agent           text,
  referrer             text,
  internal_notes       text,
  routed_to            text,
  routed_at            timestamptz,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);

-- 3) Indexes
create index auction_bids_property_idx    on public.auction_bids (property_sanity_id);
create index auction_bids_email_hash_idx  on public.auction_bids (bidder_email_hash, created_at desc);
create index auction_bids_ip_hash_idx     on public.auction_bids (ip_hash, created_at desc) where ip_hash is not null;
create index auction_bids_status_idx      on public.auction_bids (status, created_at desc);

-- 4) updated_at trigger
create or replace function public.tg_set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end $$;

create trigger auction_bids_set_updated_at
before update on public.auction_bids
for each row execute function public.tg_set_updated_at();

-- 5) Enable RLS. Anon gets NOTHING. Inserts flow through the service-role
--    in a Next.js API route and the RPC below.
alter table public.auction_bids enable row level security;

-- No policies for anon / authenticated. Only service_role bypasses RLS.

-- 6) Rate-limit + insert RPC (called with service role from /api/bids)
create or replace function public.submit_auction_bid(
  p_property_sanity_id text,
  p_property_slug      text,
  p_property_title     text,
  p_property_market    public.auction_market,
  p_bidder_name        text,
  p_bidder_email       text,
  p_bidder_phone       text,
  p_bid_amount         numeric,
  p_bid_currency       public.auction_currency,
  p_consent_terms      boolean,
  p_ip_hash            text default null,
  p_user_agent         text default null,
  p_referrer           text default null
) returns table (bid_id uuid, status public.auction_bid_status)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_email_hash text;
  v_count_24h_email int;
  v_count_24h_ip    int;
  v_dup_count       int;
  v_id              uuid;
  v_status          public.auction_bid_status := 'pending';
begin
  -- Validate
  if coalesce(length(trim(p_bidder_name)),0)    < 2  then raise exception 'INVALID_NAME';    end if;
  if coalesce(length(trim(p_bidder_email)),0)   < 5  then raise exception 'INVALID_EMAIL';   end if;
  if position('@' in p_bidder_email) = 0             then raise exception 'INVALID_EMAIL';   end if;
  if coalesce(length(trim(p_bidder_phone)),0)   < 7  then raise exception 'INVALID_PHONE';   end if;
  if p_bid_amount is null or p_bid_amount <= 0       then raise exception 'INVALID_AMOUNT';  end if;
  if p_consent_terms is not true                     then raise exception 'CONSENT_REQUIRED'; end if;

  v_email_hash := encode(digest(lower(p_bidder_email), 'sha256'), 'hex');

  -- Rate limit per email (24h)
  select count(*) into v_count_24h_email
  from public.auction_bids
  where bidder_email_hash = v_email_hash
    and created_at > now() - interval '24 hours';
  if v_count_24h_email >= 3 then raise exception 'RATE_LIMIT_EMAIL'; end if;

  -- Rate limit per IP (24h) — only if provided
  if p_ip_hash is not null then
    select count(*) into v_count_24h_ip
    from public.auction_bids
    where ip_hash = p_ip_hash
      and created_at > now() - interval '24 hours';
    if v_count_24h_ip >= 10 then raise exception 'RATE_LIMIT_IP'; end if;
  end if;

  -- Duplicate check (same email + property + amount in last hour)
  select count(*) into v_dup_count
  from public.auction_bids
  where bidder_email_hash = v_email_hash
    and property_sanity_id = p_property_sanity_id
    and bid_amount = p_bid_amount
    and created_at > now() - interval '1 hour';
  if v_dup_count > 0 then raise exception 'DUPLICATE_BID'; end if;

  insert into public.auction_bids (
    property_sanity_id, property_slug, property_title, property_market,
    bidder_name, bidder_email, bidder_email_hash, bidder_phone,
    bid_amount, bid_currency, consent_terms,
    ip_hash, user_agent, referrer, status
  ) values (
    p_property_sanity_id, p_property_slug, p_property_title, p_property_market,
    trim(p_bidder_name), lower(trim(p_bidder_email)), v_email_hash, trim(p_bidder_phone),
    p_bid_amount, p_bid_currency, true,
    p_ip_hash, p_user_agent, p_referrer, v_status
  ) returning id into v_id;

  return query select v_id, v_status;
end $$;

-- 7) Lock down RPC to service role only
revoke all on function public.submit_auction_bid(
  text, text, text, public.auction_market,
  text, text, text, numeric, public.auction_currency, boolean,
  text, text, text
) from public, anon, authenticated;

grant execute on function public.submit_auction_bid(
  text, text, text, public.auction_market,
  text, text, text, numeric, public.auction_currency, boolean,
  text, text, text
) to service_role;

-- 8) Audit trail for status changes
create table public.auction_bid_events (
  id         bigserial primary key,
  bid_id     uuid not null references public.auction_bids(id) on delete cascade,
  actor      text not null,          -- 'system' | admin email
  event_type text not null,          -- 'created' | 'status_change' | 'note_added' | 'routed'
  payload    jsonb,
  created_at timestamptz not null default now()
);

alter table public.auction_bid_events enable row level security;

create or replace function public.tg_log_bid_event()
returns trigger language plpgsql as $$
begin
  if tg_op = 'INSERT' then
    insert into public.auction_bid_events (bid_id, actor, event_type, payload)
    values (new.id, 'system', 'created', jsonb_build_object('status', new.status));
  elsif tg_op = 'UPDATE' and old.status is distinct from new.status then
    insert into public.auction_bid_events (bid_id, actor, event_type, payload)
    values (new.id, 'system', 'status_change', jsonb_build_object('from', old.status, 'to', new.status));
  end if;
  return new;
end $$;

create trigger auction_bids_log_events
after insert or update on public.auction_bids
for each row execute function public.tg_log_bid_event();

-- 9) Grant to service role only for admin reads
grant select, insert, update, delete on public.auction_bids        to service_role;
grant select, insert, update, delete on public.auction_bid_events  to service_role;
grant usage, select on sequence public.auction_bid_events_id_seq   to service_role;
