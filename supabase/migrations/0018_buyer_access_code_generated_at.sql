-- ============================================================
-- 0018 — BUYER ACCESS CODE GENERATED AT
-- Target: YOUR Supabase project
--
-- Adds the missing generated-at timestamp used by the back-office
-- access-code issue/resend flow. The access_code_hash remains the
-- sign-in verification value.
-- ============================================================

alter table public.buyer_registrations
  add column if not exists access_code_generated_at timestamptz;

create index if not exists buyer_registrations_access_code_generated_at_idx
  on public.buyer_registrations (access_code_generated_at desc)
  where access_code_generated_at is not null;