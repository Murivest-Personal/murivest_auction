-- ============================================================
-- 0016 — SELLING SUBMISSIONS
-- Target: YOUR Supabase project
--
-- Adds the table for seller property submissions via the
-- /selling page. Service-role only (RLS enabled, no public
-- policies).
-- ============================================================

create table if not exists public.selling_submissions (
  id uuid primary key default gen_random_uuid(),
  reference text not null unique,
  status text not null default 'new',
  qualification_status text not null default 'eligible',
  qualification_reasons jsonb not null default '[]'::jsonb,
  gross_yield numeric(6,2),
  payback_years numeric(6,2),
  seller_name text not null,
  seller_email text not null,
  seller_phone text,
  data jsonb not null,
  documents jsonb not null default '[]'::jsonb,
  images jsonb not null default '[]'::jsonb,
  ip_hash text,
  user_agent text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists selling_submissions_email_created_idx
  on public.selling_submissions (seller_email, created_at desc);
create index if not exists selling_submissions_status_created_idx
  on public.selling_submissions (status, created_at desc);

alter table public.selling_submissions enable row level security;

revoke all on public.selling_submissions from anon, authenticated;
grant select, insert, update, delete on public.selling_submissions to service_role;

-- Updated_at trigger (uses existing public.tg_set_updated_at function)
drop trigger if exists selling_submissions_set_updated_at on public.selling_submissions;
create trigger selling_submissions_set_updated_at
before update on public.selling_submissions
for each row execute function public.tg_set_updated_at();