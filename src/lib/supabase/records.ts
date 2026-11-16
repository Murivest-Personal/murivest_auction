/* ============================================================
   Data access for the buyer account area and back office.

   Every query goes through the server-side Supabase client
   (service role). Rows are mapped from the snake_case columns
   used by the Supabase tables to the camelCase shapes the
   pages and API routes consume.
   ============================================================ */

import { getSupabaseService } from "@/lib/supabase/server";

export interface BeneficialOwner {
  name: string;
  share: number;
}

export type SavedLotKind = "save" | "like";

export interface Buyer {
  id: string;
  accessCodeHash: string;
  accessCodeEncrypted: string | null;
  accessCodeGeneratedAt: Date | null;
  accessCodeLastSentAt: Date | null;
  buyerType: string;
  fullName: string;
  email: string;
  phone: string;
  countryOfResidence: string;
  taxJurisdiction: string;
  idType: string;
  idNumber: string;
  purchasingEntityName: string | null;
  purchasingEntityJurisdiction: string | null;
  beneficialOwners: BeneficialOwner[] | null;
  budgetMin: number | null;
  budgetMax: number | null;
  budgetCurrency: string;
  preferredCountry: string;
  preferredLocations: string | null;
  assetClasses: string[];
  fundingPreference: string;
  pofType: string | null;
  pofFileName: string | null;
  pofStoredPath: string | null;
  pofFileSize: number | null;
  pofMimeType: string | null;
  pofSha256: string | null;
  pofUploadedAt: Date | null;
  lenderName: string | null;
  acquisitionTimeline: string;
  classification: string;
  classificationNote: string | null;
  consentTerms: boolean;
  consentAt: Date | null;
  termsVersion: string | null;
  ipHash: string | null;
  userAgent: string | null;
  notifyNewLots: boolean;
  notifyOffMarket: boolean;
  notifyBidUpdates: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface BuyerBasic {
  id: string;
  fullName: string;
  email: string;
}

export interface BuyerBid {
  id: string;
  reference: string;
  buyerId: string;
  propertySanityId: string | null;
  propertySlug: string;
  propertyTitle: string;
  propertyMarket: string;
  bidAmount: number;
  bidCurrency: string;
  consentTerms: boolean;
  consentFee: boolean;
  termsConsentAt: Date | null;
  feeConsentAt: Date | null;
  termsVersion: string | null;
  feeTermsVersion: string | null;
  status: string;
  statusNote: string | null;
  ipHash: string | null;
  userAgent: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface SavedLot {
  id: string;
  buyerId: string;
  propertySlug: string;
  kind: SavedLotKind;
  createdAt: Date;
}

export interface BuyerAuditLog {
  id: string;
  buyerId: string | null;
  propertySlug: string | null;
  bidId: string | null;
  action: string;
  details: string | null;
  ipHash: string | null;
  createdAt: Date;
}

/* ---------------- row mappers ---------------- */

function str(v: unknown): string {
  return v == null ? "" : String(v);
}

function nullableStr(v: unknown): string | null {
  return v == null ? null : String(v);
}

function bool(v: unknown, dflt = false): boolean {
  return typeof v === "boolean" ? v : dflt;
}

function num(v: unknown): number | null {
  if (v == null) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function date(v: unknown): Date | null {
  if (v == null) return null;
  const d = new Date(v as string);
  return Number.isNaN(d.getTime()) ? null : d;
}

function dateOrNow(v: unknown): Date {
  return date(v) ?? new Date();
}

function stringArray(v: unknown): string[] {
  if (Array.isArray(v)) return v.map((x) => String(x));
  if (typeof v === "string") {
    try {
      const parsed = JSON.parse(v);
      return Array.isArray(parsed) ? parsed.map((x) => String(x)) : [];
    } catch {
      return [];
    }
  }
  return [];
}

function owners(v: unknown): BeneficialOwner[] | null {
  if (Array.isArray(v)) return v as BeneficialOwner[];
  if (typeof v === "string") {
    try {
      const parsed = JSON.parse(v);
      return Array.isArray(parsed) ? (parsed as BeneficialOwner[]) : null;
    } catch {
      return null;
    }
  }
  return null;
}

export function mapBuyer(row: Record<string, unknown>): Buyer {
  return {
    id: str(row.id),
    accessCodeHash: str(row.access_code_hash),
    accessCodeEncrypted: nullableStr(row.access_code_encrypted),
    accessCodeGeneratedAt: date(row.access_code_generated_at),
    accessCodeLastSentAt: date(row.access_code_last_sent_at),
    buyerType: str(row.buyer_type),
    fullName: str(row.full_name),
    email: str(row.email),
    phone: str(row.phone),
    countryOfResidence: str(row.country_of_residence),
    taxJurisdiction: str(row.tax_jurisdiction),
    idType: str(row.id_type),
    idNumber: str(row.id_number),
    purchasingEntityName: nullableStr(row.purchasing_entity_name),
    purchasingEntityJurisdiction: nullableStr(
      row.purchasing_entity_jurisdiction
    ),
    beneficialOwners: owners(row.beneficial_owners),
    budgetMin: num(row.budget_min),
    budgetMax: num(row.budget_max),
    budgetCurrency: str(row.budget_currency) || "USD",
    preferredCountry: str(row.preferred_country),
    preferredLocations: nullableStr(row.preferred_locations),
    assetClasses: stringArray(row.asset_classes),
    fundingPreference: str(row.funding_preference),
    pofType: nullableStr(row.pof_type),
    pofFileName: nullableStr(row.pof_file_name),
    pofStoredPath: nullableStr(row.pof_storage_path),
    pofFileSize: num(row.pof_file_size),
    pofMimeType: nullableStr(row.pof_mime_type),
    pofSha256: nullableStr(row.pof_sha256),
    pofUploadedAt: date(row.pof_uploaded_at),
    lenderName: nullableStr(row.lender_name),
    acquisitionTimeline: str(row.acquisition_timeline),
    classification: str(row.classification),
    classificationNote: nullableStr(row.classification_note),
    consentTerms: bool(row.consent_terms),
    consentAt: date(row.consent_at),
    termsVersion: nullableStr(row.terms_version),
    ipHash: nullableStr(row.ip_hash),
    userAgent: nullableStr(row.user_agent),
    notifyNewLots: bool(row.notify_new_lots, true),
    notifyOffMarket: bool(row.notify_off_market, true),
    notifyBidUpdates: bool(row.notify_bid_updates, true),
    createdAt: dateOrNow(row.created_at),
    updatedAt: dateOrNow(row.updated_at),
  };
}

export function mapBuyerBid(row: Record<string, unknown>): BuyerBid {
  return {
    id: str(row.id),
    reference: str(row.reference),
    buyerId: str(row.buyer_id),
    propertySanityId: nullableStr(row.property_sanity_id),
    propertySlug: str(row.property_slug),
    propertyTitle: str(row.property_title),
    propertyMarket: str(row.property_market),
    bidAmount: num(row.bid_amount) ?? 0,
    bidCurrency: str(row.bid_currency) || "KES",
    consentTerms: bool(row.consent_terms),
    consentFee: bool(row.consent_fee),
    termsConsentAt: date(row.terms_consent_at),
    feeConsentAt: date(row.fee_consent_at),
    termsVersion: nullableStr(row.terms_version),
    feeTermsVersion: nullableStr(row.fee_terms_version),
    status: str(row.status),
    statusNote: nullableStr(row.status_note),
    ipHash: nullableStr(row.ip_hash),
    userAgent: nullableStr(row.user_agent),
    createdAt: dateOrNow(row.created_at),
    updatedAt: dateOrNow(row.updated_at),
  };
}

export function mapSavedLot(row: Record<string, unknown>): SavedLot {
  return {
    id: str(row.id),
    buyerId: str(row.buyer_id),
    propertySlug: str(row.property_slug),
    kind: row.kind === "like" ? "like" : "save",
    createdAt: dateOrNow(row.created_at),
  };
}

export function mapAuditLog(row: Record<string, unknown>): BuyerAuditLog {
  return {
    id: str(row.id),
    buyerId: nullableStr(row.buyer_id),
    propertySlug: nullableStr(row.property_slug),
    bidId: nullableStr(row.bid_id),
    action: str(row.action),
    details: nullableStr(row.details),
    ipHash: nullableStr(row.ip_hash),
    createdAt: dateOrNow(row.created_at),
  };
}

/* ---------------- buyers ---------------- */

export interface CreateBuyerInput {
  id: string;
  access_code_hash: string;
  access_code_encrypted: string | null;
  buyer_type: string;
  full_name: string;
  email: string;
  phone: string;
  country_of_residence: string;
  tax_jurisdiction: string;
  id_type: string;
  id_number: string;
  purchasing_entity_name: string | null;
  purchasing_entity_jurisdiction: string | null;
  beneficial_owners: BeneficialOwner[] | null;
  budget_min: number;
  budget_max: number;
  budget_currency: string;
  preferred_country: string;
  preferred_locations: string | null;
  asset_classes: string[];
  funding_preference: string;
  pof_type: string | null;
  pof_file_name: string | null;
  pof_storage_path: string | null;
  pof_file_size: number | null;
  pof_mime_type: string | null;
  pof_sha256: string | null;
  pof_uploaded_at: string | null;
  lender_name: string | null;
  acquisition_timeline: string;
  classification: string;
  consent_terms: boolean;
  consent_at: string;
  terms_version: string | null;
  ip_hash: string | null;
  user_agent: string | null;
}

export async function findBuyerIdByEmail(
  email: string
): Promise<string | null> {
  const { data, error } = await getSupabaseService()
    .from("buyer_registrations")
    .select("id")
    .eq("email", email)
    .limit(1);
  if (error) throw error;
  return data?.[0]?.id ?? null;
}

export async function getBuyerCredentials(
  email: string
): Promise<{ id: string; accessCodeHash: string } | null> {
  const { data, error } = await getSupabaseService()
    .from("buyer_registrations")
    .select("id, access_code_hash")
    .eq("email", email)
    .limit(1);
  if (error) throw error;
  const row = data?.[0];
  return row ? { id: row.id, accessCodeHash: row.access_code_hash } : null;
}

export async function createBuyer(
  input: CreateBuyerInput
): Promise<{ id: string; classification: string }> {
  const { data, error } = await getSupabaseService()
    .from("buyer_registrations")
    .insert(input)
    .select("id, classification")
    .single();
  if (error) throw error;
  return { id: data.id, classification: data.classification };
}

export async function getBuyerById(id: string): Promise<Buyer | null> {
  const { data, error } = await getSupabaseService()
    .from("buyer_registrations")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data ? mapBuyer(data) : null;
}

export async function getBuyerName(id: string): Promise<string | null> {
  const { data, error } = await getSupabaseService()
    .from("buyer_registrations")
    .select("full_name")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data?.full_name ?? null;
}

export async function listBuyers(): Promise<Buyer[]> {
  const { data, error } = await getSupabaseService()
    .from("buyer_registrations")
    .select("*")
    .order("updated_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(mapBuyer);
}

export async function listBuyerBasics(): Promise<BuyerBasic[]> {
  const { data, error } = await getSupabaseService()
    .from("buyer_registrations")
    .select("id, full_name, email");
  if (error) throw error;
  return (data ?? []).map((r) => ({
    id: str(r.id),
    fullName: str(r.full_name),
    email: str(r.email),
  }));
}

export async function updateBuyerClassification(
  id: string,
  classification: string,
  note: string | null
): Promise<void> {
  const { error } = await getSupabaseService()
    .from("buyer_registrations")
    .update({ classification, classification_note: note })
    .eq("id", id);
  if (error) throw error;
}

export interface BuyerSettings {
  notifyNewLots: boolean;
  notifyOffMarket: boolean;
  notifyBidUpdates: boolean;
}

export async function updateBuyerSettings(
  id: string,
  settings: Partial<BuyerSettings>
): Promise<BuyerSettings> {
  const patch: Record<string, boolean> = {};
  if (settings.notifyNewLots !== undefined)
    patch.notify_new_lots = settings.notifyNewLots;
  if (settings.notifyOffMarket !== undefined)
    patch.notify_off_market = settings.notifyOffMarket;
  if (settings.notifyBidUpdates !== undefined)
    patch.notify_bid_updates = settings.notifyBidUpdates;

  const { data, error } = await getSupabaseService()
    .from("buyer_registrations")
    .update(patch)
    .eq("id", id)
    .select("notify_new_lots, notify_off_market, notify_bid_updates")
    .single();
  if (error) throw error;
  return {
    notifyNewLots: bool(data.notify_new_lots, true),
    notifyOffMarket: bool(data.notify_off_market, true),
    notifyBidUpdates: bool(data.notify_bid_updates, true),
  };
}

export async function getBuyerPof(
  id: string
): Promise<{
  fullName: string;
  pofStoredPath: string | null;
  pofFileName: string | null;
  pofMimeType: string | null;
} | null> {
  const { data, error } = await getSupabaseService()
    .from("buyer_registrations")
    .select("full_name, pof_storage_path, pof_file_name, pof_mime_type")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return {
    fullName: str(data.full_name),
    pofStoredPath: nullableStr(data.pof_storage_path),
    pofFileName: nullableStr(data.pof_file_name),
    pofMimeType: nullableStr(data.pof_mime_type),
  };
}

export async function getBuyerAccessCodeEncrypted(
  id: string
): Promise<string | null> {
  const { data, error } = await getSupabaseService()
    .from("buyer_registrations")
    .select("access_code_encrypted")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data?.access_code_encrypted ?? null;
}

export async function getBuyerAccessCodeLastSent(
  id: string
): Promise<Date | null> {
  const { data, error } = await getSupabaseService()
    .from("buyer_registrations")
    .select("access_code_last_sent_at")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return date(data?.access_code_last_sent_at);
}

export async function updateBuyerAccessCodeSent(
  id: string
): Promise<void> {
  const { error } = await getSupabaseService()
    .from("buyer_registrations")
    .update({ access_code_last_sent_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw error;
}

export interface SetBuyerAccessCodeInput {
  hash?: string | null;
  encrypted?: string | null;
  generatedAt?: string | null;
  lastSentAt?: string | null;
}

export async function setBuyerAccessCode(
  id: string,
  input: SetBuyerAccessCodeInput
): Promise<void> {
  const patch: Record<string, string | null> = {};
  if (input.hash !== undefined) patch.access_code_hash = input.hash;
  if (input.encrypted !== undefined) patch.access_code_encrypted = input.encrypted;
  if (input.generatedAt !== undefined) patch.access_code_generated_at = input.generatedAt;
  if (input.lastSentAt !== undefined) patch.access_code_last_sent_at = input.lastSentAt;

  if (Object.keys(patch).length === 0) return;

  const { error } = await getSupabaseService()
    .from("buyer_registrations")
    .update(patch)
    .eq("id", id);
  if (error) throw error;
}

/* ---------------- bids ---------------- */

export interface CreateBuyerBidInput {
  id: string;
  reference: string;
  buyer_id: string;
  property_sanity_id: string | null;
  property_slug: string;
  property_title: string;
  property_market: string;
  bid_amount: number;
  bid_currency: string;
  consent_terms: boolean;
  consent_fee: boolean;
  terms_consent_at: string;
  fee_consent_at: string;
  terms_version: string | null;
  fee_terms_version: string | null;
  status: string;
  ip_hash: string | null;
  user_agent: string | null;
}

export async function createBuyerBid(
  input: CreateBuyerBidInput
): Promise<{ reference: string }> {
  const { data, error } = await getSupabaseService()
    .from("buyer_bids")
    .insert(input)
    .select("reference")
    .single();
  if (error) throw error;
  return { reference: data.reference };
}

export async function getBuyerBids(buyerId: string): Promise<BuyerBid[]> {
  const { data, error } = await getSupabaseService()
    .from("buyer_bids")
    .select("*")
    .eq("buyer_id", buyerId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(mapBuyerBid);
}

export async function listBuyerBids(take = 100): Promise<BuyerBid[]> {
  const { data, error } = await getSupabaseService()
    .from("buyer_bids")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(take);
  if (error) throw error;
  return (data ?? []).map(mapBuyerBid);
}

export async function getBuyerBidById(id: string): Promise<BuyerBid | null> {
  const { data, error } = await getSupabaseService()
    .from("buyer_bids")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data ? mapBuyerBid(data) : null;
}

export async function updateBuyerBidStatus(
  id: string,
  status: string,
  statusNote: string | null
): Promise<void> {
  const { error } = await getSupabaseService()
    .from("buyer_bids")
    .update({ status, status_note: statusNote })
    .eq("id", id);
  if (error) throw error;
}

export async function countBidsByBuyer(): Promise<Map<string, number>> {
  const { data, error } = await getSupabaseService()
    .from("buyer_bids")
    .select("buyer_id");
  if (error) throw error;
  const counts = new Map<string, number>();
  for (const row of data ?? []) {
    const id = str(row.buyer_id);
    counts.set(id, (counts.get(id) ?? 0) + 1);
  }
  return counts;
}

/* ---------------- saved lots ---------------- */

export async function getSavedLots(buyerId: string): Promise<SavedLot[]> {
  const { data, error } = await getSupabaseService()
    .from("saved_lots")
    .select("*")
    .eq("buyer_id", buyerId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(mapSavedLot);
}

export async function getSavedLotKinds(
  buyerId: string,
  propertySlug: string
): Promise<SavedLotKind[]> {
  const { data, error } = await getSupabaseService()
    .from("saved_lots")
    .select("kind")
    .eq("buyer_id", buyerId)
    .eq("property_slug", propertySlug);
  if (error) throw error;
  return (data ?? []).map((r) => (r.kind === "like" ? "like" : "save"));
}

/** Toggles a saved/liked lot. Returns the new active state. */
export async function toggleSavedLot(
  buyerId: string,
  propertySlug: string,
  kind: SavedLotKind
): Promise<boolean> {
  const supabase = getSupabaseService();
  const { data: existing, error: findError } = await supabase
    .from("saved_lots")
    .select("id")
    .eq("buyer_id", buyerId)
    .eq("property_slug", propertySlug)
    .eq("kind", kind)
    .maybeSingle();
  if (findError) throw findError;

  if (existing) {
    const { error } = await supabase
      .from("saved_lots")
      .delete()
      .eq("id", existing.id);
    if (error) throw error;
    return false;
  }

  const { error } = await supabase.from("saved_lots").insert({
    buyer_id: buyerId,
    property_slug: propertySlug,
    kind,
  });
  if (error) throw error;
  return true;
}

export async function countSavedLotsByBuyer(): Promise<Map<string, number>> {
  const { data, error } = await getSupabaseService()
    .from("saved_lots")
    .select("buyer_id");
  if (error) throw error;
  const counts = new Map<string, number>();
  for (const row of data ?? []) {
    const id = str(row.buyer_id);
    counts.set(id, (counts.get(id) ?? 0) + 1);
  }
  return counts;
}

/* ---------------- audit ---------------- */

export async function listBuyerAuditLogs(
  take = 80
): Promise<BuyerAuditLog[]> {
  const { data, error } = await getSupabaseService()
    .from("buyer_audit_logs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(take);
  if (error) throw error;
  return (data ?? []).map(mapAuditLog);
}

export async function insertBuyerAuditLog(entry: {
  buyerId?: string | null;
  propertySlug?: string | null;
  bidId?: string | null;
  action: string;
  details?: string | null;
  ipHash?: string | null;
}): Promise<void> {
  const { error } = await getSupabaseService()
    .from("buyer_audit_logs")
    .insert({
      buyer_id: entry.buyerId ?? null,
      property_slug: entry.propertySlug ?? null,
      bid_id: entry.bidId ?? null,
      action: entry.action,
      details: entry.details ?? null,
      ip_hash: entry.ipHash ?? null,
    });
  if (error) throw error;
}