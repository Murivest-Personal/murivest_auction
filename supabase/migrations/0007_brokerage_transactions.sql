-- ============================================================
-- 0007 — BROKERAGE TRANSACTIONS (2% FEE RECORDS)
-- Target: YOUR Supabase project
--
-- One row per completed acquisition that carries a Murivest buyer
-- engagement. The fee is calculated as
--   final_purchase_price * brokerage_percentage / 100
-- (default 2%), computed by trigger so it can never drift from the
-- formula. RLS: service role only.
-- ============================================================

do $$ begin
  create type public.brokerage_payment_status as enum (
    'pending', 'invoiced', 'part_paid', 'paid', 'waived'
  );
exception when duplicate_object then null; end $$;

create table if not exists public.brokerage_transactions (
  id                    uuid primary key default gen_random_uuid(),
  buyer_engagement_id   uuid not null references public.buyer_engagements(id) on delete restrict,
  sanity_property_id    text,
  final_purchase_price  numeric(18,2) not null check (final_purchase_price > 0),
  brokerage_percentage  numeric(5,2)  not null default 2.00
                          check (brokerage_percentage > 0 and brokerage_percentage <= 10),
  brokerage_fee         numeric(18,2) not null,
  currency              text not null default 'KES',
  tax_amount            numeric(18,2),
  payment_status        public.brokerage_payment_status not null default 'pending',
  payment_reference     text,
  payment_date          timestamptz,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now(),
  constraint brokerage_fee_matches_formula
    check (brokerage_fee = round(final_purchase_price * brokerage_percentage / 100, 2))
);

create index if not exists brokerage_transactions_engagement_idx
  on public.brokerage_transactions (buyer_engagement_id);
create index if not exists brokerage_transactions_status_idx
  on public.brokerage_transactions (payment_status, created_at desc);

drop trigger if exists brokerage_transactions_set_updated_at on public.brokerage_transactions;
create trigger brokerage_transactions_set_updated_at
before update on public.brokerage_transactions
for each row execute function public.tg_set_updated_at();

-- Fee auto-calculation on insert/update — the formula is enforced
-- in the database, not merely in application code.
create or replace function public.tg_calculate_brokerage_fee()
returns trigger language plpgsql as $$
begin
  new.brokerage_fee := round(new.final_purchase_price * new.brokerage_percentage / 100, 2);
  return new;
end $$;

drop trigger if exists brokerage_transactions_calc_fee on public.brokerage_transactions;
create trigger brokerage_transactions_calc_fee
before insert or update of final_purchase_price, brokerage_percentage
on public.brokerage_transactions
for each row execute function public.tg_calculate_brokerage_fee();

alter table public.brokerage_transactions enable row level security;

-- Pure calculation helper (no table access) — safe for any caller
-- in server-side code, granted to service role.
create or replace function public.calculate_brokerage_fee(
  p_final_purchase_price numeric,
  p_brokerage_percentage numeric default 2.00
) returns numeric
language sql
immutable
as $$
  select round(p_final_purchase_price * p_brokerage_percentage / 100, 2);
$$;

revoke all on function public.calculate_brokerage_fee(numeric, numeric)
  from public, anon, authenticated;
grant execute on function public.calculate_brokerage_fee(numeric, numeric)
  to service_role;

-- Records a successful acquisition. Only authorised administrators
-- (service role) may confirm a transaction or the final price.
create or replace function public.record_successful_transaction(
  p_buyer_engagement_id  uuid,
  p_final_purchase_price numeric,
  p_currency             text default 'KES',
  p_sanity_property_id   text default null
) returns table (transaction_id uuid, brokerage_fee numeric)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_eng  public.buyer_engagements;
  v_id   uuid;
  v_fee  numeric(18,2);
begin
  if p_final_purchase_price is null or p_final_purchase_price <= 0 then
    raise exception 'INVALID_AMOUNT';
  end if;

  select * into v_eng from public.buyer_engagements
  where id = p_buyer_engagement_id
  for update;

  if v_eng.id is null then raise exception 'ENGAGEMENT_NOT_FOUND'; end if;
  if v_eng.agreement_status not in ('accepted','active','completed') then
    raise exception 'ENGAGEMENT_NOT_ACCEPTED';
  end if;

  insert into public.brokerage_transactions (
    buyer_engagement_id, sanity_property_id,
    final_purchase_price, brokerage_percentage, currency
  ) values (
    v_eng.id, coalesce(p_sanity_property_id, v_eng.sanity_property_id),
    p_final_purchase_price, v_eng.brokerage_percentage, coalesce(p_currency, v_eng.currency)
  ) returning id, brokerage_fee into v_id, v_fee;

  update public.buyer_engagements
  set agreement_status = 'completed',
      agreed_purchase_price = p_final_purchase_price,
      updated_at = now()
  where id = v_eng.id;

  return query select v_id, v_fee;
end $$;

revoke all on function public.record_successful_transaction(uuid, numeric, text, text)
  from public, anon, authenticated;
grant execute on function public.record_successful_transaction(uuid, numeric, text, text)
  to service_role;

grant select, insert, update, delete on public.brokerage_transactions to service_role;
