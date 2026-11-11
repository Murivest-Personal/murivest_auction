# auctions.murivest.com

The commercial property auction portal of **Murivest Group Ltd** — verified
auction intelligence across Kenya and the United Kingdom, buyer tools, and
market research. Murivest Group Ltd provides commercial real estate services
and publishes auction intelligence. Murivest is not the auctioneer, does not
receive bids, does not hold deposits, and does not act as principal in any
auction transaction.

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

# Sanity — set the project id to serve live content and mount /studio.
# Without it the site serves the bundled sample dataset.
NEXT_PUBLIC_SANITY_PROJECT_ID=<sanity-project-id>
NEXT_PUBLIC_SANITY_DATASET=production
SANITY_API_READ_TOKEN=<read-token>                    # server only

# Mapbox (public token — restrict in the Mapbox dashboard to
# auctions.murivest.com/*, murivest.com/*, localhost:3000/*)
NEXT_PUBLIC_MAPBOX_TOKEN=pk....

# Site
NEXT_PUBLIC_SITE_URL=https://auctions.murivest.com
```

## Database (your Supabase project)

Run the two migrations in order in the Supabase SQL editor, or via
`supabase db push`:

1. `supabase/migrations/0001_auction_bids.sql` — enums, `auction_bids`,
   rate limits (3/email/24h, 10/IP/24h, duplicates/1h), audit trail, the
   `submit_auction_bid` RPC (service-role only).
2. `supabase/migrations/0002_property_comments.sql` — `property_comments`
   (RLS: public reads approved rows only), the `submit_property_comment`
   RPC (5 comments/email/24h, service-role only).

`pgcrypto` must be enabled (`create extension if not exists pgcrypto;`).

Bid triage and comment moderation happen in the Supabase Table Editor:
`auction_bids.status` (pending → verified → routed/rejected/archived) and
`property_comments.status` (pending → approved/rejected), filling
`moderated_by` / `moderated_at` on every action. There is deliberately no
admin UI on the public site.

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
   summary points, deposit, balance days, buyer's premium, PDF upload).
   Derived metrics (net yield, payback, ROI, GRM) are computed at render
   time in `src/lib/calculations.ts` — never hand-entered.
3. Set `NEXT_PUBLIC_SANITY_PROJECT_ID` / `NEXT_PUBLIC_SANITY_DATASET` on
   the site so the portal fetches live content through
   `src/lib/sanity/queries.ts`.
4. `auctionArticle` documents power `/intelligence` (body, FAQs and
   sources for co-citation).
5. Until a project is configured, the site serves the bundled sample
   dataset (`src/data/properties.ts`, 6 Kenya + 6 UK lots, marked as sample
   on the pages) so the portal is never empty.

## Architecture notes

- **All listing data flows through `src/lib/content.ts`** — Sanity first,
  sample dataset as fallback. Pages never hardcode listings.
- **Bids and comments** post to `/api/bids` and `/api/comments`
  (Node runtime). Each route enforces the honeypot + `form_started_at`
  timing check, hashes the IP with `BID_IP_SALT`, calls the service-role
  RPC, and maps every Postgres error to a friendly string. Raw database
  errors never reach the browser. Without Supabase configured the routes
  return a friendly 503.
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
`#C4B49A`, Ink `#3D3328`, Charcoal `#5A5A5A`, Hairline `#E8E3DA`; Cormorant
Garamond display, Libre Baskerville body; no rounded corners, no shadows,
no gradients except the hero image overlay, amber `#F59E0B` reserved for
the “New listing” badge only.
