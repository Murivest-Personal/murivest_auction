-- ============================================================
-- 0010 — NOTIFICATIONS
-- Target: YOUR Supabase project
--
-- Operational notifications for portal users (auction alerts, new
-- lots, off-market opportunities, engagement updates). Recipients
-- see only their own notifications.
-- ============================================================

create table if not exists public.notifications (
  id                 uuid primary key default gen_random_uuid(),
  recipient_user_id  uuid not null references auth.users(id) on delete cascade,
  notification_type  text not null,
  title              text not null,
  message            text,
  related_record_id  uuid,
  is_read            boolean not null default false,
  created_at         timestamptz not null default now()
);

create index if not exists notifications_recipient_idx
  on public.notifications (recipient_user_id, is_read, created_at desc);

alter table public.notifications enable row level security;

drop policy if exists "users_read_own_notifications" on public.notifications;
create policy "users_read_own_notifications"
  on public.notifications
  for select
  to authenticated
  using (auth.uid() = recipient_user_id);

-- Mark-as-read RPC (own notifications only).
create or replace function public.mark_notification_read(
  p_notification_id uuid,
  p_user_id         uuid
) returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is not null and auth.uid() <> p_user_id then
    raise exception 'FORBIDDEN';
  end if;

  update public.notifications
  set is_read = true
  where id = p_notification_id
    and recipient_user_id = p_user_id;
end $$;

revoke all on function public.mark_notification_read(uuid, uuid)
  from public, anon;
grant execute on function public.mark_notification_read(uuid, uuid)
  to service_role, authenticated;

-- Fan-out helper for the ops team: notify every user watching a
-- property. Service role only.
create or replace function public.notify_property_watchers(
  p_sanity_property_id text,
  p_notification_type  text,
  p_title              text,
  p_message            text,
  p_related_record_id  uuid default null
) returns setof uuid
language sql
security definer
set search_path = public
as $$
  with inserted as (
    insert into public.notifications (recipient_user_id, notification_type, title, message, related_record_id)
    select sp.user_id, p_notification_type, p_title, p_message, p_related_record_id
    from public.saved_properties sp
    where sp.sanity_property_id = p_sanity_property_id
    returning recipient_user_id
  )
  select recipient_user_id from inserted;
$$;

revoke all on function public.notify_property_watchers(text, text, text, text, uuid)
  from public, anon, authenticated;
grant execute on function public.notify_property_watchers(text, text, text, text, uuid)
  to service_role;

grant select, insert, update, delete on public.notifications to service_role;
