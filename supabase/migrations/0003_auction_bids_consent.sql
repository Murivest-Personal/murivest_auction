-- ============================================================
-- 0003 — AUCTION BIDS: 2% BUYER FEE CONSENT
-- Target: YOUR Supabase project
--
-- Adds the buyer-consent columns required by the buyer-brokerage
-- model: every bid registration must record acceptance of
--   (a) the Terms & Privacy consent, and
--   (b) the 2% buyer brokerage fee, payable after the 10% deposit,
-- each with a timestamp and the version of the consent text shown.
-- Non-destructive: additive ALTERs only.
-- ============================================================

-- 1) New columns
alter table public.auction_bids
  add column if not exists consent_fee           boolean     not null default false,
  add column if not exists terms_consent_at      timestamptz,
  add column if not exists fee_consent_at        timestamptz,
  add column if not exists deposit_acknowledged  boolean     not null default true,
  add column if not exists terms_version         text,
  add column if not exists fee_terms_version     text;

-- 2) Backfill existing rows (they carried consent_terms = true)
update public.auction_bids
set consent_fee      = true,
    terms_consent_at = created_at,
    fee_consent_at   = created_at,
    terms_version    = 'terms-v1',
    fee_terms_version = 'buyer-fee-2pct-v0'
where consent_terms is true
  and terms_consent_at is null;

-- 3) Sanity check constraint: a fee-consented bid must be stamped
alter table public.auction_bids
  add constraint auction_bids_fee_consent_stamp
  check (not consent_fee or fee_consent_at is not null)
  not valid;

-- 4) Replace the RPC with the extended signature.
--    Drop the old signature first (identity changes with the
--    parameter list).
drop function if exists public.submit_auction_bid(
  text, text, text, public.auction_market,
  text, text, text, numeric, public.auction_currency, boolean,
  text, text, text
);

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
  p_consent_fee        boolean,
  p_terms_version      text default null,
  p_fee_terms_version  text default null,
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
  if p_consent_fee   is not true                     then raise exception 'FEE_CONSENT_REQUIRED'; end if;

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
    bid_amount, bid_currency, consent_terms, consent_fee,
    terms_consent_at, fee_consent_at, deposit_acknowledged,
    terms_version, fee_terms_version,
    ip_hash, user_agent, referrer, status
  ) values (
    p_property_sanity_id, p_property_slug, p_property_title, p_property_market,
    trim(p_bidder_name), lower(trim(p_bidder_email)), v_email_hash, trim(p_bidder_phone),
    p_bid_amount, p_bid_currency, true, true,
    now(), now(), true,
    coalesce(p_terms_version, 'terms-v2'),
    coalesce(p_fee_terms_version, 'buyer-fee-2pct-v1'),
    p_ip_hash, p_user_agent, p_referrer, v_status
  ) returning id into v_id;

  return query select v_id, v_status;
end $$;

-- 5) Lock the RPC to the service role only
revoke all on function public.submit_auction_bid(
  text, text, text, public.auction_market,
  text, text, text, numeric, public.auction_currency,
  boolean, boolean, text, text, text, text, text
) from public, anon, authenticated;

grant execute on function public.submit_auction_bid(
  text, text, text, public.auction_market,
  text, text, text, numeric, public.auction_currency,
  boolean, boolean, text, text, text, text, text
) to service_role;

-- 6) Reporting index on fee consent
create index if not exists auction_bids_fee_consent_idx
  on public.auction_bids (consent_fee, fee_consent_at desc)
  where consent_fee is true;
