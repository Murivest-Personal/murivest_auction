-- ============================================================
-- Murivest Auctions — Public Property Comments
-- ============================================================

create type public.comment_status as enum ('pending', 'approved', 'rejected');

create table public.property_comments (
  id                 uuid primary key default gen_random_uuid(),
  property_sanity_id text        not null,
  property_slug      text        not null,
  author_name        text        not null check (char_length(author_name) between 2 and 80),
  author_email       text        not null,
  author_email_hash  text        not null,
  body               text        not null check (char_length(body) between 10 and 2000),
  status             public.comment_status not null default 'pending',
  ip_hash            text,
  created_at         timestamptz not null default now(),
  moderated_at       timestamptz,
  moderated_by       text
);

create index property_comments_property_idx
  on public.property_comments (property_sanity_id, status, created_at desc);
create index property_comments_email_hash_idx
  on public.property_comments (author_email_hash, created_at desc);

alter table public.property_comments enable row level security;

-- Public may read approved comments only.
create policy "public_read_approved_comments"
  on public.property_comments
  for select
  to anon, authenticated
  using (status = 'approved');

-- No public insert, update, or delete. All writes go through the
-- service-role RPC below via /api/comments.

-- Rate-limited submission RPC
create or replace function public.submit_property_comment(
  p_property_sanity_id text,
  p_property_slug      text,
  p_author_name        text,
  p_author_email       text,
  p_body               text,
  p_ip_hash            text default null
) returns table (comment_id uuid)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_email_hash text;
  v_count      int;
  v_id         uuid;
begin
  if coalesce(length(trim(p_author_name)),0) < 2 then raise exception 'INVALID_NAME'; end if;
  if position('@' in p_author_email) = 0 then raise exception 'INVALID_EMAIL'; end if;
  if coalesce(length(trim(p_body)),0) < 10 then raise exception 'INVALID_BODY'; end if;

  v_email_hash := encode(digest(lower(p_author_email), 'sha256'), 'hex');

  select count(*) into v_count
  from public.property_comments
  where author_email_hash = v_email_hash
    and created_at > now() - interval '24 hours';
  if v_count >= 5 then raise exception 'RATE_LIMIT_EMAIL'; end if;

  insert into public.property_comments (
    property_sanity_id, property_slug, author_name,
    author_email, author_email_hash, body, ip_hash, status
  ) values (
    p_property_sanity_id, p_property_slug, trim(p_author_name),
    lower(trim(p_author_email)), v_email_hash, trim(p_body), p_ip_hash, 'pending'
  ) returning id into v_id;

  return query select v_id;
end $$;

revoke all on function public.submit_property_comment(text, text, text, text, text, text)
  from public, anon, authenticated;
grant execute on function public.submit_property_comment(text, text, text, text, text, text)
  to service_role;

grant select, insert, update, delete on public.property_comments to service_role;
