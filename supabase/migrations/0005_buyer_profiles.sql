-- ============================================================
-- 0005 — BUYER PROFILES
-- Target: YOUR Supabase project
--
-- Lightweight buyer records built from guest bid registrations
-- and inquiries (no auth account required). Portal accounts link
-- later via user_id. RLS: service role only.
-- ============================================================

create table if not exists public.buyer_profiles (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid,                 -- links to auth.users when the buyer registers on portal.murivest.com
  full_name   text not null check (char_length(trim(full_name)) between 2 and 120),
  email       text not null,
  email_hash  text not null,
  phone       text,
  country     text,
  buyer_type  text check (buyer_type in ('individual','company','family_office','institutional')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  constraint buyer_profiles_email_hash_key unique (email_hash),
  constraint buyer_profiles_user_id_fkey foreign key (user_id)
    references auth.users(id) on delete set null
);

create index if not exists buyer_profiles_user_id_idx on public.buyer_profiles (user_id);
create unique index if not exists buyer_profiles_email_idx on public.buyer_profiles (lower(email));

drop trigger if exists buyer_profiles_set_updated_at on public.buyer_profiles;
create trigger buyer_profiles_set_updated_at
before update on public.buyer_profiles
for each row execute function public.tg_set_updated_at();

alter table public.buyer_profiles enable row level security;

-- Upsert helper: called by admin tooling / integrations with the
-- service role to reconcile buyers from bids and inquiries.
create or replace function public.upsert_buyer_profile(
  p_full_name text,
  p_email     text,
  p_phone     text default null,
  p_country   text default null,
  p_buyer_type text default null
) returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_hash text := encode(digest(lower(trim(p_email)), 'sha256'), 'hex');
  v_id   uuid;
begin
  if coalesce(length(trim(p_full_name)),0) < 2 then raise exception 'INVALID_NAME'; end if;
  if position('@' in p_email) = 0              then raise exception 'INVALID_EMAIL'; end if;

  insert into public.buyer_profiles (full_name, email, email_hash, phone, country, buyer_type)
  values (trim(p_full_name), lower(trim(p_email)), v_hash,
          nullif(trim(coalesce(p_phone,'')), ''), p_country, p_buyer_type)
  on conflict (email_hash) do update
    set full_name  = excluded.full_name,
        phone      = coalesce(excluded.phone, public.buyer_profiles.phone),
        country    = coalesce(excluded.country, public.buyer_profiles.country),
        buyer_type = coalesce(excluded.buyer_type, public.buyer_profiles.buyer_type),
        updated_at = now()
  returning id into v_id;

  return v_id;
end $$;

revoke all on function public.upsert_buyer_profile(text, text, text, text, text)
  from public, anon, authenticated;
grant execute on function public.upsert_buyer_profile(text, text, text, text, text)
  to service_role;

grant select, insert, update, delete on public.buyer_profiles to service_role;
