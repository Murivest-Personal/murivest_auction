/* ============================================================
   Data access for selling submissions (back office).
   ============================================================ */

import { getSupabaseService } from "@/lib/supabase/server";

export interface SellingSubmissionImage {
  fileName: string;
  storedPath: string;
  fileSize: number;
  mimeType: string;
  sha256: string;
}

export interface SellingSubmissionDocument {
  fileName: string;
  storedPath: string;
  fileSize: number;
  mimeType: string;
  sha256: string;
}

export interface SellingSubmissionData {
  title: string;
  market: string;
  region: string;
  location: string;
  assetType: string;
  tenure: string;
  size: string;
  guidePrice: number;
  sellingParty: string;
  facts: Record<string, unknown>;
  description: string;
  conditionsOfSale: Record<string, unknown>;
  sellerName: string;
  sellerEmail: string;
  sellerPhone: string;
  sellerRole: string;
  noCommission: boolean;
  flexibleGuidePrice: boolean;
  accuracy: boolean;
  consentPrivacy: boolean;
  legalPackAvailable: string;
  keyHighlights?: string[];
  reservePrice?: number | null;
  coordinates?: { lat: number; lng: number; zoom: number } | null;
  status?: string;
  publishedAt?: string;
}

export interface SellingSubmission {
  id: string;
  reference: string;
  status: string;
  qualificationStatus: string;
  qualificationReasons: string[];
  grossYield: number | null;
  paybackYears: number | null;
  sellerName: string;
  sellerEmail: string;
  sellerPhone: string;
  data: SellingSubmissionData;
  documents: SellingSubmissionDocument[];
  images: SellingSubmissionImage[];
  ipHash: string | null;
  userAgent: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface SellingSubmissionBasic {
  id: string;
  reference: string;
  status: string;
  qualificationStatus: string;
  sellerName: string;
  sellerEmail: string;
  guidePrice: number;
  currency: string;
  createdAt: Date;
}

function str(v: unknown): string {
  return v == null ? "" : String(v);
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

function mapImages(v: unknown): SellingSubmissionImage[] {
  if (Array.isArray(v)) {
    return v.map((img) => ({
      fileName: str((img as Record<string, unknown>).fileName),
      storedPath: str((img as Record<string, unknown>).storedPath),
      fileSize: num((img as Record<string, unknown>).fileSize) ?? 0,
      mimeType: str((img as Record<string, unknown>).mimeType),
      sha256: str((img as Record<string, unknown>).sha256),
    }));
  }
  return [];
}

function mapDocuments(v: unknown): SellingSubmissionDocument[] {
  if (Array.isArray(v)) {
    return v.map((doc) => ({
      fileName: str((doc as Record<string, unknown>).fileName),
      storedPath: str((doc as Record<string, unknown>).storedPath),
      fileSize: num((doc as Record<string, unknown>).fileSize) ?? 0,
      mimeType: str((doc as Record<string, unknown>).mimeType),
      sha256: str((doc as Record<string, unknown>).sha256),
    }));
  }
  return [];
}

export function mapSellingSubmission(row: Record<string, unknown>): SellingSubmission {
  return {
    id: str(row.id),
    reference: str(row.reference),
    status: str(row.status),
    qualificationStatus: str(row.qualification_status),
    qualificationReasons: stringArray(row.qualification_reasons),
    grossYield: num(row.gross_yield),
    paybackYears: num(row.payback_years),
    sellerName: str(row.seller_name),
    sellerEmail: str(row.seller_email),
    sellerPhone: str(row.seller_phone),
    data: (row.data as SellingSubmissionData) ?? {},
    documents: mapDocuments(row.documents),
    images: mapImages(row.images),
    ipHash: row.ip_hash ? str(row.ip_hash) : null,
    userAgent: row.user_agent ? str(row.user_agent) : null,
    createdAt: dateOrNow(row.created_at),
    updatedAt: dateOrNow(row.updated_at),
  };
}

export function mapSellingSubmissionBasic(row: Record<string, unknown>): SellingSubmissionBasic {
  const data = (row.data as SellingSubmissionData) ?? {};
  return {
    id: str(row.id),
    reference: str(row.reference),
    status: str(row.status),
    qualificationStatus: str(row.qualification_status),
    sellerName: str(row.seller_name),
    sellerEmail: str(row.seller_email),
    guidePrice: num(data.guidePrice) ?? 0,
    currency: str(data.facts?.currency) || "KES",
    createdAt: dateOrNow(row.created_at),
  };
}

/* ---------------- queries ---------------- */

export async function listSellingSubmissions(take = 50): Promise<SellingSubmissionBasic[]> {
  const { data, error } = await getSupabaseService()
    .from("selling_submissions")
    .select("id, reference, status, qualification_status, seller_name, seller_email, data, created_at")
    .order("created_at", { ascending: false })
    .limit(take);
  if (error) throw error;
  return (data ?? []).map(mapSellingSubmissionBasic);
}

export async function getSellingSubmissionById(id: string): Promise<SellingSubmission | null> {
  const { data, error } = await getSupabaseService()
    .from("selling_submissions")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data ? mapSellingSubmission(data) : null;
}

export async function getSellingSubmissionByReference(reference: string): Promise<SellingSubmission | null> {
  const { data, error } = await getSupabaseService()
    .from("selling_submissions")
    .select("*")
    .eq("reference", reference)
    .maybeSingle();
  if (error) throw error;
  return data ? mapSellingSubmission(data) : null;
}

export async function countSellingSubmissionsByStatus(): Promise<Record<string, number>> {
  const { data, error } = await getSupabaseService()
    .from("selling_submissions")
    .select("status");
  if (error) throw error;
  const counts: Record<string, number> = {};
  for (const row of data ?? []) {
    const status = str(row.status);
    counts[status] = (counts[status] ?? 0) + 1;
  }
  return counts;
}