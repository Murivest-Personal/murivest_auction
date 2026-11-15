-- ============================================================
-- 0004 — AUCTION INQUIRIES
-- Target: YOUR Supabase project
--
-- Buyer inquiries (register interest, viewing requests, property
-- briefs, acquisition consultations). Guests submit through the
-- /api/inquiries route → service-role RPC. RLS: anon gets nothing.
-- ============================================================

-- 1) Enums
do $$ begin
  create type public.inquiry_status as enum (
    'new', 'contacted', 'qualified', 'viewing_requested',
    'due_diligence', 'engaged', 'successful', 'unsuccessful', 'closed'
  );
exception when duplicate_object then null; end $$;

-- 2) Table
create table if not exists public.auction_inquiries (
  id                  uuid primary key default gen_random_uuid(),
  property_sanity_id  text,
  property_slug       text,
  property_title      text,
  full_name           text        not null check (char_length(trim(full_name)) between 2 and 120),
  email               text        not null,
  email_hash          text        not null,
  phone               text        check (phone is null or char_length(trim(phone)) between 7 and 20),
  country             text,
  buyer_type          text        check (buyer_type in ('individual','company','family_office','institutional')),
  budget_min          numeric(18,2) check (budget_min is null or budget_min >= 0),
  budget_max          numeric(18,2) check (budget_max is null or budget_max >= 0),
  currency            text        not null default 'KES',
  financing_method    text        check (financing_method in ('cash','financing','undecided')),
  inquiry_type        text        not null default 'general'
                        check (inquiry_type in ('general','viewing_request','documentation','acquisition_consultation','representation')),
  message             text        check (message is null or char_length(message) <= 2000),
  status              public.inquiry_status not null default 'new',
  assigned_to         text,
  internal_notes      text,
  consent_privacy     boolean     not null default false,
  consent_at          timestamptz,
  ip_hash             text,
  user_agent          text,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

-- 3) Indexes
create index if not exists auction_inquiries_property_idx
  on public.auction_inquiries (property_sanity_id, created_at desc);
create index if not exists auction_inquiries_email_hash_idx
  on public.auction_inquiries (email_hash, created_at desc);
create index if not exists auction_inquiries_ip_hash_idx
  on public.auction_inquiries (ip_hash, created_at desc) where ip_hash is not null;
create index if not exists auction_inquiries_status_idx
  on public.auction_inquiries (status, created_at desc);

-- 4) updated_at trigger (reuse the shared trigger function)
create or replace function public.tg_set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end $$;

drop trigger if exists auction_inquiries_set_updated_at on public.auction_inquiries;
create trigger auction_inquiries_set_updated_at
before update on public.auction_inquiries
for each row execute function public.tg_set_updated_at();

-- 5) RLS — anon gets nothing; service role bypasses
alter table public.auction_inquiries enable row level security;

-- 6) Public submit RPC (called with the service role from /api/inquiries)
create or replace function public.submit_auction_inquiry(
  p_full_name          text,
  p_email              text,
  p_property_sanity_id text default null,
  p_property_slug      text default null,
  p_property_title     text default null,
  p_phone              text default null,
  p_country            text default null,
  p_buyer_type         text default null,
  p_budget_min         numeric default null,
  p_budget_max         numeric default null,
  p_currency           text default 'KES',
  p_financing_method   text default null,
  p_inquiry_type       text default 'general',
  p_message            text default null,
  p_ip_hash            text default null,
  p_user_agent         text default null
) returns table (inquiry_id uuid)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_email_hash      text;
  v_count_24h_email int;
  v_count_24h_ip    int;
  v_id              uuid;
begin
  -- Validate
  if coalesce(length(trim(p_full_name)),0) < 2 then raise exception 'INVALID_NAME'; end if;
  if coalesce(length(trim(p_email)),0)   < 5 then raise exception 'INVALID_EMAIL'; end if;
  if position('@' in p_email) = 0            then raise exception 'INVALID_EMAIL'; end if;
  if p_phone is not null and coalesce(length(trim(p_phone)),0) < 7 then
    raise exception 'INVALID_PHONE';
  end if;
  if p_budget_min is not null and p_budget_max is not null and p_budget_min > p_budget_max then
    raise exception 'INVALID_BUDGET';
  end if;

  v_email_hash := encode(digest(lower(p_email), 'sha256'), 'hex');

  -- Rate limit per email (24h)
  select count(*) into v_count_24h_email
  from public.auction_inquiries
  where email_hash = v_email_hash
    and created_at > now() - interval '24 hours';
  if v_count_24h_email >= 3 then raise exception 'RATE_LIMIT_EMAIL'; end if;

  -- Rate limit per IP (24h)
  if p_ip_hash is not null then
    select count(*) into v_count_24h_ip
    from public.auction_inquiries
    where ip_hash = p_ip_hash
      and created_at > now() - interval '24 hours';
    if v_count_24h_ip >= 10 then raise exception 'RATE_LIMIT_IP'; end if;
  end if;

  insert into public.auction_inquiries (
    property_sanity_id, property_slug, property_title,
    full_name, email, email_hash, phone, country,
    buyer_type, budget_min, budget_max, currency,
    financing_method, inquiry_type, message,
    consent_privacy, consent_at, ip_hash, user_agent
  ) values (
    p_property_sanity_id, p_property_slug, p_property_title,
    trim(p_full_name), lower(trim(p_email)), v_email_hash,
    nullif(trim(coalesce(p_phone,'')), ''), p_country,
    p_buyer_type, p_budget_min, p_budget_max, coalesce(p_currency,'KES'),
    p_financing_method, coalesce(p_inquiry_type,'general'),
    left(p_message, 2000),
    true, now(), p_ip_hash, p_user_agent
  ) returning id into v_id;

  return query select v_id;
end $$;

-- 7) Lock RPC to service role
revoke all on function public.submit_auction_inquiry(
  text, text, text, text, text, text, text, text,
  numeric, numeric, text, text, text, text, text, text
) from public, anon, authenticated;

grant execute on function public.submit_auction_inquiry(
  text, text, text, text, text, text, text, text,
  numeric, numeric, text, text, text, text, text, text
) to service_role;

-- 8) Service role table grants
grant select, insert, update, delete on public.auction_inquiries to service_role;
