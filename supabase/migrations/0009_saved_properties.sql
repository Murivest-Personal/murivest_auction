-- ============================================================
-- 0009 — SAVED PROPERTIES (PORTAL USERS)
-- Target: YOUR Supabase project
--
-- Saved/watched lots for buyers registered on portal.murivest.com.
-- This is the one table with user-scoped RLS policies: an
-- authenticated user may read, add and remove only their own rows.
-- ============================================================

create table if not exists public.saved_properties (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null references auth.users(id) on delete cascade,
  sanity_property_id text not null,
  created_at        timestamptz not null default now(),
  constraint saved_properties_user_property_key unique (user_id, sanity_property_id)
);

create index if not exists saved_properties_user_idx
  on public.saved_properties (user_id, created_at desc);

alter table public.saved_properties enable row level security;

drop policy if exists "users_read_own_saved" on public.saved_properties;
create policy "users_read_own_saved"
  on public.saved_properties
  for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "users_insert_own_saved" on public.saved_properties;
create policy "users_insert_own_saved"
  on public.saved_properties
  for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "users_delete_own_saved" on public.saved_properties;
create policy "users_delete_own_saved"
  on public.saved_properties
  for delete
  to authenticated
  using (auth.uid() = user_id);

-- Toggle helper used by the portal (service role or authenticated
-- for one's own user id).
create or replace function public.toggle_saved_property(
  p_user_id            uuid,
  p_sanity_property_id text
) returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_exists boolean;
begin
  if auth.uid() is not null and auth.uid() <> p_user_id then
    raise exception 'FORBIDDEN';
  end if;

  select exists (
    select 1 from public.saved_properties
    where user_id = p_user_id and sanity_property_id = p_sanity_property_id
  ) into v_exists;

  if v_exists then
    delete from public.saved_properties
    where user_id = p_user_id and sanity_property_id = p_sanity_property_id;
    return false;
  else
    insert into public.saved_properties (user_id, sanity_property_id)
    values (p_user_id, p_sanity_property_id);
    return true;
  end if;
end $$;

revoke all on function public.toggle_saved_property(uuid, text)
  from public, anon;
grant execute on function public.toggle_saved_property(uuid, text)
  to service_role, authenticated;

grant select, insert, update, delete on public.saved_properties to service_role;
