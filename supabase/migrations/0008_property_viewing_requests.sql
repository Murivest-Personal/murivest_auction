-- ============================================================
-- 0008 — PROPERTY VIEWING REQUESTS
-- Target: YOUR Supabase project
--
-- Scheduled viewing requests raised by buyers. Guest submissions
-- flow through /api/inquiries with inquiry_type = 'viewing_request';
-- this table holds the scheduling detail for the operations team.
-- RLS: service role only.
-- ============================================================

do $$ begin
  create type public.viewing_status as enum (
    'new', 'scheduled', 'completed', 'cancelled'
  );
exception when duplicate_object then null; end $$;

create table if not exists public.property_viewing_requests (
  id                 uuid primary key default gen_random_uuid(),
  sanity_property_id text not null,
  property_slug      text,
  inquiry_id         uuid references public.auction_inquiries(id) on delete set null,
  full_name          text not null check (char_length(trim(full_name)) between 2 and 120),
  email              text not null,
  phone              text,
  preferred_date     date check (preferred_date is null or preferred_date >= current_date - interval '1 day'),
  preferred_time     text,
  message            text check (message is null or char_length(message) <= 1000),
  status             public.viewing_status not null default 'new',
  internal_notes     text,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

create index if not exists viewing_requests_property_idx
  on public.property_viewing_requests (sanity_property_id, created_at desc);
create index if not exists viewing_requests_status_idx
  on public.property_viewing_requests (status, created_at desc);

drop trigger if exists viewing_requests_set_updated_at on public.property_viewing_requests;
create trigger viewing_requests_set_updated_at
before update on public.property_viewing_requests
for each row execute function public.tg_set_updated_at();

alter table public.property_viewing_requests enable row level security;

grant select, insert, update, delete on public.property_viewing_requests to service_role;
