-- ============================================================
-- 0017 — BUYER ACCESS CODE ENCRYPTED
-- Target: YOUR Supabase project
--
-- Adds encrypted access code storage and last-sent timestamp
-- to the buyer_registrations table. The existing access_code_hash
-- continues to be used for sign-in verification.
-- ============================================================

alter table public.buyer_registrations
  add column if not exists access_code_encrypted text;

alter table public.buyer_registrations
  add column if not exists access_code_last_sent_at timestamptz;

create index if not exists buyer_registrations_access_code_encrypted_idx
  on public.buyer_registrations (access_code_encrypted)
  where access_code_encrypted is not null;