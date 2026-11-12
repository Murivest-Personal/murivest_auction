-- ============================================================
-- 0012 — DATABASE FUNCTIONS (ADMIN WORKFLOWS)
-- Target: YOUR Supabase project
--
-- Operational functions for the Murivest team. All are
-- SECURITY DEFINER with a pinned search_path and are granted to
-- the service role only — they are called from server-side API
-- routes and admin tooling, never from the browser.
-- ============================================================

-- 1) Update inquiry status (new → contacted → qualified → … )
create or replace function public.update_auction_inquiry_status(
  p_inquiry_id  uuid,
  p_status      public.inquiry_status,
  p_assigned_to text default null,
  p_notes       text default null
) returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.auction_inquiries
  set status        = p_status,
      assigned_to   = coalesce(nullif(trim(p_assigned_to),''), assigned_to),
      internal_notes = coalesce(nullif(trim(p_notes),''), internal_notes),
      updated_at    = now()
  where id = p_inquiry_id;

  if not found then raise exception 'INQUIRY_NOT_FOUND'; end if;
end $$;

revoke all on function public.update_auction_inquiry_status(uuid, public.inquiry_status, text, text)
  from public, anon, authenticated;
grant execute on function public.update_auction_inquiry_status(uuid, public.inquiry_status, text, text)
  to service_role;

-- 2) Moderate a property comment (approve / reject)
create or replace function public.moderate_property_comment(
  p_comment_id  uuid,
  p_status      public.comment_status,
  p_moderated_by text
) returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if coalesce(length(trim(p_moderated_by)),0) = 0 then
    raise exception 'INVALID_MODERATOR';
  end if;

  update public.property_comments
  set status       = p_status,
      moderated_at = now(),
      moderated_by = trim(p_moderated_by)
  where id = p_comment_id;

  if not found then raise exception 'COMMENT_NOT_FOUND'; end if;

  perform public.log_admin_action(
    null, trim(p_moderated_by),
    'comment_moderated', 'property_comments', p_comment_id::text,
    null, jsonb_build_object('status', p_status)
  );
end $$;

revoke all on function public.moderate_property_comment(uuid, public.comment_status, text)
  from public, anon, authenticated;
grant execute on function public.moderate_property_comment(uuid, public.comment_status, text)
  to service_role;

-- 3) Verify / route an auction bid registration
create or replace function public.verify_auction_bid(
  p_bid_id     uuid,
  p_status     public.auction_bid_status,
  p_notes      text default null,
  p_routed_to  text default null
) returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.auction_bids
  set status         = p_status,
      verification_notes = coalesce(nullif(trim(p_notes),''), verification_notes),
      routed_to      = coalesce(nullif(trim(p_routed_to),''), routed_to),
      routed_at      = case when p_routed_to is not null then now() else routed_at end,
      verified_at    = case when p_status in ('verified','routed') then now() else verified_at end,
      updated_at     = now()
  where id = p_bid_id;

  if not found then raise exception 'BID_NOT_FOUND'; end if;
end $$;

revoke all on function public.verify_auction_bid(uuid, public.auction_bid_status, text, text)
  from public, anon, authenticated;
grant execute on function public.verify_auction_bid(uuid, public.auction_bid_status, text, text)
  to service_role;

-- 4) Issue a buyer engagement (the 2% agreement) to a buyer
create or replace function public.create_buyer_engagement(
  p_buyer_email          text,
  p_sanity_property_id   text default null,
  p_property_reference   text default null,
  p_brokerage_percentage numeric default 2.00,
  p_currency             text default 'KES',
  p_agreement_reference  text default null
) returns table (engagement_id uuid, agreement_reference text)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_ref text := coalesce(
    nullif(trim(p_agreement_reference),''),
    'MVE-' || to_char(now(),'YYYYMM') || '-' || upper(substr(encode(gen_random_bytes(4),'hex'), 1, 6))
  );
  v_id  uuid;
begin
  if position('@' in p_buyer_email) = 0 then raise exception 'INVALID_EMAIL'; end if;
  if p_brokerage_percentage is null or p_brokerage_percentage <= 0 or p_brokerage_percentage > 10 then
    raise exception 'INVALID_PERCENTAGE';
  end if;

  -- Reconcile the buyer profile (no-op if already known)
  perform public.upsert_buyer_profile(p_buyer_email, p_buyer_email);

  insert into public.buyer_engagements (
    buyer_profile_id, buyer_email, sanity_property_id, property_reference,
    agreement_reference, brokerage_percentage, currency
  ) values (
    (select id from public.buyer_profiles where email = lower(trim(p_buyer_email))),
    lower(trim(p_buyer_email)), p_sanity_property_id, p_property_reference,
    v_ref, p_brokerage_percentage, p_currency
  ) returning id into v_id;

  return query select v_id, v_ref;
end $$;

revoke all on function public.create_buyer_engagement(text, text, text, numeric, text, text)
  from public, anon, authenticated;
grant execute on function public.create_buyer_engagement(text, text, text, numeric, text, text)
  to service_role;

-- 5) Update a brokerage payment record (invoice / settle)
create or replace function public.update_brokerage_payment(
  p_transaction_id   uuid,
  p_payment_status   public.brokerage_payment_status,
  p_payment_reference text default null,
  p_tax_amount       numeric default null,
  p_payment_date     timestamptz default null
) returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.brokerage_transactions
  set payment_status    = p_payment_status,
      payment_reference = coalesce(nullif(trim(p_payment_reference),''), payment_reference),
      tax_amount        = coalesce(p_tax_amount, tax_amount),
      payment_date      = coalesce(p_payment_date, payment_date),
      updated_at        = now()
  where id = p_transaction_id;

  if not found then raise exception 'TRANSACTION_NOT_FOUND'; end if;
end $$;

revoke all on function public.update_brokerage_payment(uuid, public.brokerage_payment_status, text, numeric, timestamptz)
  from public, anon, authenticated;
grant execute on function public.update_brokerage_payment(uuid, public.brokerage_payment_status, text, numeric, timestamptz)
  to service_role;
