# auctions.murivest.com

The public property auction marketplace of **Murivest Group Ltd** —
verified auction intelligence across Kenya and the United Kingdom, buyer
representation, buyer tools, and market research. Murivest Group Ltd
provides commercial real estate services, acts as buyer-side auction
brokerage, and publishes auction intelligence. Murivest is not the
auctioneer, does not receive binding bids, does not hold deposits, and does
not act as principal in any auction transaction. **This is a public website,
not a portal** — no accounts or sign-ins here; auction and off-market alerts
live on the separate client portal at <https://portal.murivest.com>.

## The buyer-brokerage model (2% fee)

The commercial model is buyer-paid brokerage:

- Murivest charges the **successful buyer a brokerage fee of 2% of the final
  purchase price** (KES 10m → 200k; 50m → 1m; 100m → 2m).
- The fee becomes **payable after the buyer pays the 10% deposit** of the
  purchase price required under the auction conditions.
- Every bid registration form carries the fee consent **in bold**, alongside
  the Terms & Privacy consent. Both consents are validated server-side and
  stored in the database with timestamps and consent-text versions
  (`terms-v2`, `buyer-fee-2pct-v1`).
- Full disclosure on `/buyer-fees`; the deposit, auctioneer charges and
  brokerage are kept as three separate money flows throughout the site.

## Stack

- **Next.js 16** (App Router, TypeScript, `src/` layout)
- **Tailwind CSS 4** with the Murivest brand tokens (`src/app/globals.css`)
- **Sanity** for content (`auctionProperty`, `auctionArticle`,
  `auctionMarket`, `siteSettings`) — Studio embedded at `/studio`
- **Supabase (your own project)** for guest bid registrations and public
  comments only, written exclusively through security-definer RPCs
- **Mapbox GL JS** for lot maps, plus key-free Google Maps links
- No Lovable Cloud, Lovable DB or `@lovable/*` anywhere

## Environment

Copy `.env.local.example` values into `.env.local` (a local copy is already
scaffolded):

```bash
# Supabase — YOUR project (required for bid registrations and comments)
SUPABASE_URL=https://<your-ref>.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>          # server only — never expose
NEXT_PUBLIC_SUPABASE_URL=https://<your-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>

# Anti-abuse salt for IP hashing (rotate for production)
BID_IP_SALT=<long-random-string>

# Sanity — REQUIRED. All auction lots publish through Sanity; there
# is no bundled sample dataset. Without these the portal shows no
# lots and bid registration is disabled (fail closed).
NEXT_PUBLIC_SANITY_PROJECT_ID=<sanity-project-id>
NEXT_PUBLIC_SANITY_DATASET=production
SANITY_API_READ_TOKEN=<read-token>                    # server only

# Mapbox (public token — restrict in the Mapbox dashboard to
# auctions.murivest.com/*, murivest.com/*, localhost:3000/*)
NEXT_PUBLIC_MAPBOX_TOKEN=pk....

# Buyer qualification & confidential vault (System 2 + System 3)
BUYER_SESSION_SECRET=<long-random-string>   # signs buyer portal cookies
ADMIN_SESSION_SECRET=<long-random-string>    # signs back-office cookies
ADMIN_PASSCODE=<back-office-passcode>        # /back-office login
# PRIVATE_STORE_DIR defaults to ./.private-store (gitignored) —
# proof-of-funds and data room PDFs live here, NEVER in public/

# Site
NEXT_PUBLIC_SITE_URL=https://auctions.murivest.com
```

## Database (your Supabase project)

Run the migrations in order in the Supabase SQL editor, or via
`supabase db push`. Full details, verification checks and test flows in
`supabase/README.md`:

1. `0001_auction_bids.sql` — enums, `auction_bids`, rate limits
   (3/email/24h, 10/IP/24h, duplicates/1h), audit trail, the
   `submit_auction_bid` RPC (service-role only).
2. `0002_property_comments.sql` — `property_comments` (RLS: public reads
   approved rows only), the `submit_property_comment` RPC.
3. `0003_auction_bids_consent.sql` — **2% buyer-fee consent columns** on
   bids (consent timestamps, deposit acknowledgement, consent-text
   versions) + the extended `submit_auction_bid` RPC.
4. `0004_auction_inquiries.sql` — `auction_inquiries` + the
   `submit_auction_inquiry` RPC (powers the register-your-interest forms).
5. `0005_buyer_profiles.sql` — buyer records + `upsert_buyer_profile`.
6. `0006_buyer_engagements.sql` — 2% brokerage agreements +
   `accept_buyer_engagement`.
7. `0007_brokerage_transactions.sql` — fee records; the formula
   `price × % ÷ 100` is computed by trigger and enforced by CHECK.
8. `0008_property_viewing_requests.sql` — viewing scheduling.
9. `0009_saved_properties.sql` — portal users' saved lots (user-scoped RLS).
10. `0010_notifications.sql` — auction alerts + `notify_property_watchers`.
11. `0011_audit_logs.sql` — immutable audit trail.
12. `0012_database_functions.sql` — admin workflows (inquiry status,
    comment moderation, bid verification, engagement issuance, payments).
13. `0013_database_indexes.sql` — reporting indexes.
14. `0014_buyer_qualification_vault.sql` — **buyer qualification +
    confidential document vault** (`buyer_registrations`, `nda_acceptances`,
    `vault_documents`, `vault_document_versions`, `vault_access_grants`,
    `vault_notifications`, `vault_access_logs`) plus the private
    `murivest-confidential` storage bucket (no public access).

`pgcrypto` must be enabled (`create extension if not exists pgcrypto;`).

Bid triage, inquiry management and comment moderation happen through the
admin functions in `0012_database_functions.sql` (or the Supabase Table
Editor): `auction_bids.status`, `auction_inquiries.status`
(new → contacted → qualified → … → engaged → successful), and
`property_comments.status` (pending → approved/rejected).

## Buyer qualification (System 2) — `/buyers`

Ten-point registration → 8-stage classification → per-property data room
authorisation.

1. **Registration** (`/buyers/register`, 4 steps): individual/corporate
   status, residence + tax jurisdiction, contact + identification,
   purchasing entity + beneficial ownership, budget, preferred market +
   locations, asset classes, cash/financing, proof of funds or lender
   evidence, acquisition timeline. The buyer receives a one-time access
   code (email + code = portal sign-in) and starts at
   `Registration pending`.
2. **Classification ladder** (assigned in the back office, every change
   audit-logged): Unqualified lead → Registration pending → KYC pending →
   KYC verified → Funding verification pending → **Qualified buyer** →
   Mandated buyer → Transaction in progress.
3. **Proof of funds privacy**: uploads go to the private store
   (`PRIVATE_STORE_DIR`, default `./.private-store`, gitignored) — never
   `public/`. The only reader is `/api/admin/buyers/[id]/pof` (admin
   session required, every view logged).
4. **Portal** (`/buyers/portal`): status banner + ladder, registration
   file, notifications, authorised data rooms.

## Confidential document vault (System 3) — the data rooms

Accessible to Qualified buyers and above, per property, after a
timestamped NDA and a per-property authorisation (the “datasite” model).

- **NDA** — 8 clauses (`nda-v1`), acceptance recorded per buyer/property
  with timestamp, IP hash and terms version; revocable.
- **Documents** — metadata in the DB, PDF bytes in the private store;
  uploaded and versioned only through the back office. Categories include
  legal pack, title, tenancy, searches, valuation, survey and **addendum**.
- **Version history** — every upload appends an immutable version; the
  previous one is superseded; buyers see the full history with dates.
- **Expiry & replacement** — versions can carry an `expires_at`; expired
  versions are blocked for buyers (HTTP 410) until replaced.
- **Download permissions** — per document (view-only vs downloadable);
  enforced server-side and surfaced with a “View only” badge.
- **PDF viewing** — inline viewer in the portal (iframe over the secure
  route); lot pages link out to the same route.
- **Addenda notifications** — publishing a new version notifies every
  buyer with active access; addenda get a dedicated notice.
- **Access logs** — every NDA acceptance, view, download (and denial),
  grant, revoke, version and classification change is recorded and shown
  in the back office.
- **Access revocation** — immediate, per property, with reason; the file
  API fails closed.

Public teaser vs qualified access (source protection): lot pages show a
“Documentation & data room” section with document titles and categories
only; the files themselves are gated behind qualification + grant + NDA.
Selling-party disclosure follows the auction notice and conditions of
sale.

## Back office — `/back-office`

Passcode-gated (`ADMIN_PASSCODE`; a warning shows while the default is in
use). Three sections: **Buyers & qualification** (classification + notes,
proof-of-funds view), **Data rooms** (documents, versions, download
permissions, expiry, per-property grants/revocations, access-request
queue) and **Access logs**. Unlisted and `noindex`; also disallowed in
`robots.txt`.

## Content workflow (Sanity)

1. Run the standalone studio once:
   ```bash
   bun run studio:dev     # or: cd studio && npm install && npm run dev
   ```
   It serves at `http://localhost:3333` (set `SANITY_STUDIO_PROJECT_ID`
   and `SANITY_STUDIO_DATASET` in the environment first). For a hosted
   studio, run `bun run studio:build` and deploy the output under
   `/studio`, setting `basePath: "/studio"` in `studio/sanity.config.ts`.
2. Publish `auctionProperty` documents. The schema carries the full field
   set, including the **Property facts** object (price, NOI, gross rent,
   building area, occupancy, …) and **Conditions of sale** (jurisdiction,
   summary points, deposit — percentage, deadline, payment method and
   recipient, all per lot and never hardcoded by market — balance days,
   buyer's premium, PDF upload).
   Derived metrics (net yield, payback, ROI, GRM) are computed at render
   time in `src/lib/calculations.ts` — never hand-entered.
3. Set `NEXT_PUBLIC_SANITY_PROJECT_ID` / `NEXT_PUBLIC_SANITY_DATASET` on
   the site so the portal fetches live content through
   `src/lib/sanity/queries.ts`.
4. `auctionArticle` documents power `/intelligence` (body, FAQs, sources,
   SEO fields, topic cluster, search-intent classification and related
   links).
5. There is no bundled sample dataset. Until documents are published
   in Sanity, listing surfaces render their empty states and the
   homepage falls back to “No lots are currently published”.

## Architecture notes

- **All listing data flows through `src/lib/content.ts`** — fetched
  exclusively from Sanity (`auctionProperty`). Pages never hardcode
  listings and there is no sample/mock fallback.
- **Featured auctions** — homepage showcase lots are `auctionProperty`
  documents with `featured == true`; with none flagged, the latest
  published lots fill the slot.
- **Bid gating** — `/api/bids` verifies the lot's published status in
  Sanity with a non-CDN client at submission time. Lots marked Sold or
  Under Offer reject every bid server-side (409), and the form is
  disabled client-side. Without Sanity configured the API fails
  closed (503).
- **Source confidentiality** — listings do not name the selling bank or the
  appointed auctioneer publicly. Selling-party blocks describe the sale
  mechanism ("Kenyan commercial bank — chargee sale") and disclose the
  institution and auctioneer in the formal auction notice issued to
  registered bidders.
- **Bids, inquiries and comments** post to `/api/bids`, `/api/inquiries`
  and `/api/comments` (Node runtime). Each route enforces the honeypot +
  `form_started_at` timing check, validates both consents, hashes the IP
  with `BID_IP_SALT`, calls the service-role RPC, and maps every Postgres
  error to a friendly string. Raw database errors never reach the browser.
  Without Supabase configured the routes fall back to the local
  Prisma/SQLite store (`prisma/schema.prisma`) so the full flow is testable
  in development.
- **The research desk** — `/intelligence` publishes 46 articles across nine
  clusters (auction defence & borrowers, how auctions actually work, trusts
  & asset structuring, buying at auction, finance & due diligence, buyer
  representation & fees, Kenya market, UK market, fundamentals), written to
  the Murivest Research voice manual. Each article carries SEO metadata,
  intent classification, FAQ schema, sources and related links.
- **Auction alerts** — the header, footer, listing pages and research hub
  link to the client portal at `https://portal.murivest.com`; this site
  hosts no accounts.
- **Approved comments are server-rendered** on property pages so they are
  present in the HTML source (indexable, citable). Email addresses are
  never displayed.
- **Calculators** (`/tools/*`) are pure client components — no data is
  stored, nothing is sent anywhere. The return, underwriting and loan
  calculators also render as pre-populated widgets on every property page.
- **JSON-LD** on every page: `Organization` (layout), `WebSite` +
  `SearchAction` (home), `CollectionPage` (hubs), `RealEstateListing` +
  `BreadcrumbList` + `FAQPage` (listings), `Event` (calendar), `Article`
  (intelligence), `WebApplication` (tools).
- **`llms.txt`** and `robots.txt` live in `public/`; `sitemap.xml` is
  generated from the content adapter at `/sitemap.xml`.

## Local development

```bash
bun install
bun run dev        # http://localhost:3000
bun run lint       # eslint
```

## Deployment (Vercel)

1. Push the repository and import it into Vercel.
2. Add every variable from `.env.local` in the project settings (plus
   `SANITY_STUDIO_PROJECT_ID` if you prefer it for the studio).
3. Deploy. The canonical host is `https://auctions.murivest.com`.
4. Restrict the Mapbox token to the production domains in the Mapbox
   dashboard (styles/fonts/geocode read scopes only).

## Brand system (locked)

Colours, typography, component signatures, motion and the verbatim auction
disclosure are specified in the Murivest brand system and enforced across
the codebase: Cream `#F5F2ED`, Deep Green `#1C2B1E`, Gold `#8B6C2A`, Sand
`#C4B49A`, Ink `#3D3328`, Charcoal `#5A5A5A`, Hairline `#E8E3DA`.

Typography — the **luxury gallery trio**: **Cinzel** (Roman capitals) for
the wordmark, navigation, eyebrows and museum-label reference numbers;
**Times New Roman** for body copy; **Cormorant Garamond** for oversized
editorial headlines. No rounded corners, no shadows, no gradients except
the hero image overlay, amber `#F59E0B` reserved for the “New listing”
badge only.
