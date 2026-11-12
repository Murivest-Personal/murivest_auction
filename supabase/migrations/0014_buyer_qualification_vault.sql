-- ============================================================
-- 0014 — BUYER QUALIFICATION & CONFIDENTIAL DOCUMENT VAULT
-- Target: YOUR Supabase project
--
-- System: buyer registration (10-point capture), the 8-stage
-- classification ladder, and the per-property confidential data
-- room (NDA, grants, versioned documents, notifications, logs).
--
-- Mirrors the Prisma models in prisma/schema.prisma used by the
-- local demo store. In production the API routes use the service
-- role against these tables; files (proof of funds, data room
-- PDFs) live in the PRIVATE storage bucket created at the end —
-- never in public/ and never in a public bucket.
--
-- Classification ladder (buyer_registrations.classification):
--   unqualified-lead, registration-pending, kyc-pending,
--   kyc-verified, funding-verification-pending, qualified-buyer,
--   mandated-buyer, transaction-in-progress
-- ============================================================

create table if not exists public.buyer_registrations (
  id                          uuid primary key default gen_random_uuid(),
  access_code_hash            text not null,
  buyer_type                  text not null check (buyer_type in ('individual','company','family_office','institutional')),
  full_name                   text not null check (char_length(trim(full_name)) between 2 and 120),
  email                       text not null,
  phone                       text not null,
  country_of_residence        text not null,
  tax_jurisdiction            text not null,
  id_type                     text not null check (id_type in ('passport','national_id','company_registration','tax_pin')),
  id_number                   text not null,
  purchasing_entity_name      text,
  purchasing_entity_jurisdiction text,
  beneficial_owners           jsonb,   -- [{ "name": text, "share": numeric }]
  budget_min                  numeric check (budget_min is null or budget_min > 0),
  budget_max                  numeric check (budget_max is null or budget_max > 0),
  budget_currency             text not null default 'USD',
  preferred_country           text not null check (preferred_country in ('kenya','uk','both')),
  preferred_locations         text,
  asset_classes               jsonb not null default '[]',  -- ["Office", ...]
  funding_preference          text not null check (funding_preference in ('cash','financing','mixed')),
  pof_type                    text check (pof_type is null or pof_type in ('bank_statement','lender_letter','other')),
  pof_file_name               text,
  pof_storage_path            text,    -- PRIVATE bucket path — never a public URL
  pof_file_size               integer,
  pof_mime_type               text,
  pof_sha256                  text,
  pof_uploaded_at             timestamptz,
  lender_name                 text,
  acquisition_timeline        text not null check (acquisition_timeline in
                                ('immediate','within-3-months','3-6-months','6-12-months','exploring')),
  classification              text not null default 'registration-pending'
                                check (classification in ('unqualified-lead','registration-pending','kyc-pending',
                                      'kyc-verified','funding-verification-pending','qualified-buyer',
                                      'mandated-buyer','transaction-in-progress')),
  classification_note         text,
  consent_terms               boolean not null default false,
  consent_at                  timestamptz,
  terms_version               text,
  ip_hash                     text,
  user_agent                  text,
  created_at                  timestamptz not null default now(),
  updated_at                  timestamptz not null default now(),
  constraint buyer_registrations_budget_check
    check (budget_min is null or budget_max is null or budget_max >= budget_min)
);

create index if not exists buyer_registrations_classification_idx
  on public.buyer_registrations (classification, updated_at desc);
create index if not exists buyer_registrations_email_idx
  on public.buyer_registrations (lower(email));

drop trigger if exists buyer_registrations_set_updated_at on public.buyer_registrations;
create trigger buyer_registrations_set_updated_at
before update on public.buyer_registrations
for each row execute function public.tg_set_updated_at();

alter table public.buyer_registrations enable row level security;
-- No policies: service role only. Buyer-facing reads go through
-- the API routes (service role), never the anon key.

-- ------------------------------------------------------------
-- NDA acceptances — one per buyer per property, timestamped.
-- ------------------------------------------------------------
create table if not exists public.nda_acceptances (
  id             uuid primary key default gen_random_uuid(),
  buyer_id       uuid not null references public.buyer_registrations(id) on delete cascade,
  property_slug  text not null,
  terms_version  text not null,
  accepted_at    timestamptz not null default now(),
  ip_hash        text,
  user_agent     text,
  constraint nda_acceptances_buyer_property_key unique (buyer_id, property_slug)
);

create index if not exists nda_acceptances_property_idx
  on public.nda_acceptances (property_slug, accepted_at desc);

alter table public.nda_acceptances enable row level security;

-- ------------------------------------------------------------
-- Data room documents (metadata) + immutable versions.
-- File bytes live in the PRIVATE storage bucket at
-- vault/<property_slug>/<document_id>/v<n>-<uuid>-<name>.pdf
-- ------------------------------------------------------------
create table if not exists public.vault_documents (
  id            uuid primary key default gen_random_uuid(),
  property_slug text not null,
  title         text not null check (char_length(trim(title)) between 2 and 160),
  category      text not null check (category in
                  ('legal_pack','title','tenancy','searches','valuation',
                   'addendum','report','other')),
  allow_download boolean not null default true,
  notes         text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists vault_documents_property_idx
  on public.vault_documents (property_slug);

drop trigger if exists vault_documents_set_updated_at on public.vault_documents;
create trigger vault_documents_set_updated_at
before update on public.vault_documents
for each row execute function public.tg_set_updated_at();

alter table public.vault_documents enable row level security;

create table if not exists public.vault_document_versions (
  id            uuid primary key default gen_random_uuid(),
  document_id   uuid not null references public.vault_documents(id) on delete cascade,
  version       integer not null check (version > 0),
  file_name     text not null,
  storage_path  text not null,   -- PRIVATE bucket path
  file_size     integer not null,
  mime_type     text not null default 'application/pdf',
  sha256        text,
  uploaded_by   text not null,
  uploaded_at   timestamptz not null default now(),
  notes         text,
  expires_at    timestamptz,
  superseded_at timestamptz,
  constraint vault_document_versions_doc_version_key unique (document_id, version)
);

create index if not exists vault_document_versions_document_idx
  on public.vault_document_versions (document_id, version desc);

alter table public.vault_document_versions enable row level security;

-- ------------------------------------------------------------
-- Per-property access grants + buyer notifications + audit log.
-- ------------------------------------------------------------
create table if not exists public.vault_access_grants (
  id            uuid primary key default gen_random_uuid(),
  buyer_id      uuid not null references public.buyer_registrations(id) on delete cascade,
  property_slug text not null,
  granted_at    timestamptz not null default now(),
  granted_by    text not null,
  expires_at    timestamptz,
  revoked_at    timestamptz,
  revoked_reason text
);

create index if not exists vault_access_grants_property_idx
  on public.vault_access_grants (property_slug, granted_at desc);
create index if not exists vault_access_grants_buyer_idx
  on public.vault_access_grants (buyer_id, granted_at desc);

alter table public.vault_access_grants enable row level security;

create table if not exists public.vault_notifications (
  id            uuid primary key default gen_random_uuid(),
  buyer_id      uuid not null references public.buyer_registrations(id) on delete cascade,
  property_slug text not null,
  document_id   uuid references public.vault_documents(id) on delete set null,
  title         text not null,
  message       text not null,
  created_at    timestamptz not null default now(),
  read_at       timestamptz
);

create index if not exists vault_notifications_buyer_idx
  on public.vault_notifications (buyer_id, created_at desc);

alter table public.vault_notifications enable row level security;

create table if not exists public.vault_access_logs (
  id            uuid primary key default gen_random_uuid(),
  buyer_id      uuid references public.buyer_registrations(id) on delete set null,
  property_slug text,
  document_id   uuid,
  version_id    uuid,
  action        text not null check (action in
                  ('nda_accepted','access_requested','view','download','download_denied',
                   'view_denied','grant','revoke','version_published','document_created',
                   'pof_viewed','classification_changed')),
  details       text,
  ip_hash       text,
  created_at    timestamptz not null default now()
);

create index if not exists vault_access_logs_property_idx
  on public.vault_access_logs (property_slug, created_at desc);
create index if not exists vault_access_logs_buyer_idx
  on public.vault_access_logs (buyer_id, created_at desc);

alter table public.vault_access_logs enable row level security;

grant select, insert, update, delete on
  public.buyer_registrations, public.nda_acceptances, public.vault_documents,
  public.vault_document_versions, public.vault_access_grants,
  public.vault_notifications, public.vault_access_logs
to service_role;

-- ------------------------------------------------------------
-- PRIVATE storage bucket for confidential files. No public access,
-- no public URL is ever generated. The API routes (service role)
-- upload and sign short-lived URLs — or stream the bytes after
-- checking classification + grant + NDA, as this codebase does.
-- ------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'murivest-confidential',
  'murivest-confidential',
  false,
  26214400, -- 25 MB
  array['application/pdf','image/png','image/jpeg','image/webp']
)
on conflict (id) do update
  set public = false,
      file_size_limit = 26214400,
      allowed_mime_types = array['application/pdf','image/png','image/jpeg','image/webp'];

-- Service role bypasses storage RLS by default; keep it that way.
-- Explicitly deny anon/authenticated any path on this bucket.
drop policy if exists "confidential denies anon" on storage.objects;
create policy "confidential denies anon"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'murivest-confidential' and false);
