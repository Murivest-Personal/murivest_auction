# Supabase Database — auctions.murivest.com

Complete, executable PostgreSQL migrations for the Murivest Auctions
platform. Sanity holds property content; Supabase holds buyer
interactions: bids, inquiries, comments, engagements, brokerage fee
records, viewing requests, saved lots, notifications and audit logs.

## Where to run

1. Open your Supabase project → **SQL Editor**.
2. Run the migrations below **in order** (each is self-contained and
   safe to re-run unless noted).
3. Verify after each step with the checks in this file.

Migration files (`/supabase/migrations`):

| # | File | Creates |
|---|------|---------|
| 1 | `0001_auction_bids.sql` | Guest bid registrations + `submit_auction_bid` RPC + audit events |
| 2 | `0002_property_comments.sql` | Moderated property comments + `submit_property_comment` RPC |
| 3 | `0003_auction_bids_consent.sql` | **2% buyer-fee consent columns** on bids + updated `submit_auction_bid` (fee consent, timestamps, consent-text versions) |
| 4 | `0004_auction_inquiries.sql` | `auction_inquiries` + `submit_auction_inquiry` RPC |
| 5 | `0005_buyer_profiles.sql` | `buyer_profiles` + `upsert_buyer_profile` |
| 6 | `0006_buyer_engagements.sql` | 2% brokerage agreements + `accept_buyer_engagement` |
| 7 | `0007_brokerage_transactions.sql` | Fee records + `calculate_brokerage_fee` + `record_successful_transaction` (fee = price × % ÷ 100, enforced by trigger) |
| 8 | `0008_property_viewing_requests.sql` | Viewing scheduling |
| 9 | `0009_saved_properties.sql` | Portal users' saved lots (user-scoped RLS) |
| 10 | `0010_notifications.sql` | Auction alerts + `mark_notification_read` + `notify_property_watchers` |
| 11 | `0011_audit_logs.sql` | Immutable audit trail + `log_admin_action` |
| 12 | `0012_database_functions.sql` | Admin workflows: inquiry status, comment moderation, bid verification, engagement issuance, payment updates |
| 13 | `0013_database_indexes.sql` | Reporting indexes |

## Environment variables (Next.js)

Local development and production deployment (never commit real values):

```
SUPABASE_URL=https://<project-ref>.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>   # SERVER ONLY — never expose to the browser
BID_IP_SALT=<random-string>                    # salt for SHA-256 IP hashing
```

Without these variables the site runs in **demo mode**: bids,
inquiries and comments persist to the local Prisma/SQLite store so
the flow is fully testable. With the variables set, the API routes
call the Supabase RPCs above with the service-role key server-side.

## Verification checklist

After running all migrations, verify:

```sql
-- Tables exist
select table_name from information_schema.tables
where table_schema = 'public' and table_type = 'BASE TABLE'
order by table_name;
-- Expect: audit_logs, auction_bid_events, auction_bids,
-- auction_inquiries, brokerage_transactions, buyer_engagements,
-- buyer_profiles, notifications, property_comments,
-- property_viewing_requests, saved_properties

-- RLS is enabled everywhere
select tablename, rowsecurity from pg_tables
where schemaname = 'public' and rowsecurity = false;
-- Expect: zero rows

-- Consent columns are present on bids
select column_name from information_schema.columns
where table_schema = 'public' and table_name = 'auction_bids'
and column_name in ('consent_fee','fee_consent_at','terms_consent_at',
                    'deposit_acknowledged','terms_version','fee_terms_version');
-- Expect: 6 rows
```

## Testing the flows

Anonymous clients must receive **nothing** from these tables. Test
with the anon key:

```sql
-- With the anon role (SQL Editor: run as `postgres`, use SET ROLE):
set role anon;
select count(*) from public.auction_bids;        -- error or 0 rows — must NOT return data
select count(*) from public.auction_inquiries;   -- must NOT return data
select count(*) from public.property_comments
  where status = 'approved';                     -- this one MAY return approved rows (public comments)
reset role;
```

End-to-end (with the site running):

1. Submit a bid registration **without** ticking the 2% fee box →
   the API rejects it with 400 and `FEE_CONSENT_REQUIRED` never
   reaches the client as a raw error.
2. Submit with both boxes ticked → row appears in `auction_bids`
   with `consent_fee = true`, `fee_consent_at` stamped, and
   `fee_terms_version = 'buyer-fee-2pct-v1'`.
3. Submit 4 bids from one email in 24h → the 4th returns 429
   (`RATE_LIMIT_EMAIL`).
4. Submit an inquiry from a lot page → row appears in
   `auction_inquiries` with `consent_privacy = true`, `consent_at`
   stamped.
5. Post a comment → appears as `pending` in `property_comments`;
   approve it with
   `select public.moderate_property_comment('<id>','approved','<you>');`
   → it becomes visible to anon reads.

## Fee integrity

The 2% formula is enforced in the database, not just in code:

```sql
select public.calculate_brokerage_fee(50000000, 2.00);  -- 1000000.00
select public.calculate_brokerage_fee(10000000, 2.00);  -- 200000.00
```

`brokerage_transactions.brokerage_fee` is computed by a BEFORE
trigger and constrained by CHECK, so a fee record can never drift
from `final_purchase_price * brokerage_percentage / 100`.

## Operational notes

- **Never** expose `SUPABASE_SERVICE_ROLE_KEY` to the browser. All
  writes flow through Next.js API routes (`/api/bids`,
  `/api/inquiries`, `/api/comments`) which call the RPCs
  server-side.
- IPs are stored only as salted SHA-256 hashes; raw IPs are never
  persisted.
- `audit_logs` is append-only: UPDATE and DELETE raise exceptions.
- Auction and off-market **alerts** for registered buyers are
  delivered through the client portal at
  <https://portal.murivest.com> — this public site links to it but
  hosts no accounts itself.
