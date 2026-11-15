-- ============================================================
-- 0011 — AUDIT LOGS
-- Target: YOUR Supabase project
--
-- Immutable administrative audit trail. Service role only — no
-- anon or authenticated access, no updates or deletes.
-- ============================================================

create table if not exists public.audit_logs (
  id            bigserial primary key,
  actor_user_id uuid,
  actor_email   text,
  action        text not null,
  entity_type   text not null,
  entity_id     text,
  old_data      jsonb,
  new_data      jsonb,
  created_at    timestamptz not null default now()
);

create index if not exists audit_logs_entity_idx
  on public.audit_logs (entity_type, entity_id, created_at desc);
create index if not exists audit_logs_action_idx
  on public.audit_logs (action, created_at desc);

alter table public.audit_logs enable row level security;
-- No policies: service_role bypasses RLS; everyone else sees nothing.

-- Append-only enforcement: block UPDATE and DELETE even for table
-- owners running with RLS bypassed.
create or replace function public.tg_audit_logs_immutable()
returns trigger language plpgsql as $$
begin
  raise exception 'AUDIT_LOGS_IMMUTABLE';
end $$;

drop trigger if exists audit_logs_block_update on public.audit_logs;
create trigger audit_logs_block_update
before update on public.audit_logs
for each row execute function public.tg_audit_logs_immutable();

drop trigger if exists audit_logs_block_delete on public.audit_logs;
create trigger audit_logs_block_delete
before delete on public.audit_logs
for each row execute function public.tg_audit_logs_immutable();

-- Structured logging helper for admin actions.
create or replace function public.log_admin_action(
  p_action        text,
  p_entity_type   text,
  p_actor_user_id uuid default null,
  p_actor_email   text default null,
  p_entity_id     text default null,
  p_old_data      jsonb default null,
  p_new_data      jsonb default null
) returns bigint
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id bigint;
begin
  if coalesce(length(trim(p_action)),0) = 0     then raise exception 'INVALID_ACTION'; end if;
  if coalesce(length(trim(p_entity_type)),0) = 0 then raise exception 'INVALID_ENTITY_TYPE'; end if;

  insert into public.audit_logs (
    actor_user_id, actor_email, action, entity_type, entity_id, old_data, new_data
  ) values (
    p_actor_user_id, p_actor_email, trim(p_action), trim(p_entity_type), p_entity_id,
    p_old_data, p_new_data
  ) returning id into v_id;

  return v_id;
end $$;

revoke all on function public.log_admin_action(text, text, uuid, text, text, jsonb, jsonb)
  from public, anon, authenticated;
grant execute on function public.log_admin_action(text, text, uuid, text, text, jsonb, jsonb)
  to service_role;

-- Auto-audit status changes on inquiries and bids.
create or replace function public.tg_audit_inquiry_change()
returns trigger language plpgsql as $$
begin
  if tg_op = 'UPDATE' and old.status is distinct from new.status then
    perform public.log_admin_action(
      null, 'system', 'inquiry_status_change', 'auction_inquiries', new.id::text,
      jsonb_build_object('status', old.status),
      jsonb_build_object('status', new.status)
    );
  end if;
  return new;
end $$;

drop trigger if exists auction_inquiries_audit on public.auction_inquiries;
create trigger auction_inquiries_audit
after update on public.auction_inquiries
for each row execute function public.tg_audit_inquiry_change();

grant select, insert on public.audit_logs to service_role;
grant usage, select on sequence public.audit_logs_id_seq to service_role;
