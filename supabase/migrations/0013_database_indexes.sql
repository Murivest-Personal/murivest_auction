-- ============================================================
-- 0013 — CONSOLIDATED DATABASE INDEXES
-- Target: YOUR Supabase project
--
-- Operational reporting indexes across the whole schema. All
-- statements are IF NOT EXISTS and safe to re-run.
-- ============================================================

-- IMMUTABLE wrapper for date_trunc('day', timestamptz) -> date
create or replace function public.date_trunc_day(p_ts timestamptz)
returns date
language sql
immutable
as $$ select date_trunc('day', p_ts)::date $$;

-- Bids: pipeline views
create index if not exists rpt_bids_pending_by_market
  on public.auction_bids (property_market, status, created_at desc);
create index if not exists rpt_bids_created_day
  on public.auction_bids (public.date_trunc_day(created_at), property_market);

-- Bids: consent reporting (fee consent audit)
create index if not exists rpt_bids_fee_consent_version
  on public.auction_bids (fee_terms_version, fee_consent_at desc)
  where consent_fee is true;

-- Inquiries: pipeline and conversion views
create index if not exists rpt_inquiries_by_status
  on public.auction_inquiries (status, created_at desc);
create index if not exists rpt_inquiries_by_type
  on public.auction_inquiries (inquiry_type, created_at desc);
create index if not exists rpt_inquiries_created_day
  on public.auction_inquiries (public.date_trunc_day(created_at));

-- Engagements & brokerage: revenue reporting
create index if not exists rpt_engagements_by_status
  on public.buyer_engagements (agreement_status, accepted_at desc nulls last);
create index if not exists rpt_brokerage_by_payment_status
  on public.brokerage_transactions (payment_status, payment_date desc nulls last);

-- Comments: moderation queue
create index if not exists rpt_comments_pending_queue
  on public.property_comments (status, created_at asc)
  where status = 'pending';

-- Notifications: unread counts
create index if not exists rpt_notifications_unread
  on public.notifications (recipient_user_id, created_at desc)
  where is_read = false;

-- Audit: chronological pull
create index if not exists rpt_audit_logs_recent
  on public.audit_logs (created_at desc);
