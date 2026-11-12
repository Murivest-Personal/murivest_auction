-- ============================================================
-- 0006 — BUYER ENGAGEMENTS (2% BROKERAGE AGREEMENTS)
-- Target: YOUR Supabase project
--
-- One row per accepted buyer engagement. Records the 2% brokerage
-- percentage, the version of the fee terms the buyer accepted, and
-- the acceptance timestamp. RLS: service role only.
-- ============================================================

do $$ begin
  create type public.engagement_status as enum (
    'offered', 'accepted', 'active', 'completed', 'terminated'
  );
exception when duplicate_object then null; end $$;

create table if not exists public.buyer_engagements (
  id                    uuid primary key default gen_random_uuid(),
  buyer_profile_id      uuid references public.buyer_profiles(id) on delete set null,
  buyer_email           text not null,
  sanity_property_id    text,
  property_reference    text,
  agreement_reference   text not null,
  brokerage_percentage  numeric(5,2) not null default 2.00
                          check (brokerage_percentage > 0 and brokerage_percentage <= 10),
  agreed_purchase_price numeric(18,2) check (agreed_purchase_price is null or agreed_purchase_price > 0),
  currency              text not null default 'KES',
  agreement_status      public.engagement_status not null default 'offered',
  fee_terms_version     text not null default 'buyer-fee-2pct-v1',
  deposit_acknowledged  boolean not null default true,
  accepted_at           timestamptz,
  agreement_document_path text,
  internal_notes        text,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now(),
  constraint buyer_engagements_reference_key unique (agreement_reference)
);

create index if not exists buyer_engagements_buyer_idx
  on public.buyer_engagements (buyer_email, created_at desc);
create index if not exists buyer_engagements_property_idx
  on public.buyer_engagements (sanity_property_id);
create index if not exists buyer_engagements_status_idx
  on public.buyer_engagements (agreement_status, created_at desc);

drop trigger if exists buyer_engagements_set_updated_at on public.buyer_engagements;
create trigger buyer_engagements_set_updated_at
before update on public.buyer_engagements
for each row execute function public.tg_set_updated_at();

alter table public.buyer_engagements enable row level security;

-- Acceptance: stamps accepted_at and moves the engagement to
-- 'accepted'. Called with the service role when the buyer signs.
create or replace function public.accept_buyer_engagement(
  p_agreement_reference text,
  p_buyer_email         text,
  p_fee_terms_version   text default 'buyer-fee-2pct-v1'
) returns table (engagement_id uuid)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
begin
  if position('@' in p_buyer_email) = 0 then raise exception 'INVALID_EMAIL'; end if;

  update public.buyer_engagements
  set agreement_status  = 'accepted',
      accepted_at       = now(),
      fee_terms_version = coalesce(p_fee_terms_version, fee_terms_version),
      updated_at        = now()
  where agreement_reference = p_agreement_reference
    and lower(buyer_email) = lower(trim(p_buyer_email))
    and agreement_status in ('offered','accepted')
  returning id into v_id;

  if v_id is null then raise exception 'ENGAGEMENT_NOT_FOUND'; end if;

  return query select v_id;
end $$;

revoke all on function public.accept_buyer_engagement(text, text, text)
  from public, anon, authenticated;
grant execute on function public.accept_buyer_engagement(text, text, text)
  to service_role;

grant select, insert, update, delete on public.buyer_engagements to service_role;
