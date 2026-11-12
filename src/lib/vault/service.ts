/* ============================================================
   Confidential document vault — shared service layer.
   Documents, versions, per-property grants, NDA acceptances,
   notifications and the audit log. File bytes never appear here:
   they live in the private store and are streamed only by the
   permission-checked API route.
   ============================================================ */

import { db } from "@/lib/db";
import { canAccessVault } from "@/lib/buyer/qualification";

export const VAULT_CATEGORIES: { value: string; label: string }[] = [
  { value: "legal_pack", label: "Legal pack" },
  { value: "title", label: "Title & encumbrances" },
  { value: "tenancy", label: "Tenancy schedule" },
  { value: "searches", label: "Searches" },
  { value: "valuation", label: "Valuation" },
  { value: "addendum", label: "Addendum" },
  { value: "report", label: "Survey & condition" },
  { value: "other", label: "Other" },
];

export function categoryLabel(value: string): string {
  return VAULT_CATEGORIES.find((c) => c.value === value)?.label ?? "Document";
}

/* ---------- Views ---------- */

export interface VaultVersionView {
  id: string;
  version: number;
  fileName: string;
  fileSize: number;
  uploadedAt: string;
  uploadedBy: string;
  notes: string | null;
  expiresAt: string | null;
  supersededAt: string | null;
  isExpired: boolean;
}

export interface VaultDocumentView {
  id: string;
  propertySlug: string;
  title: string;
  category: string;
  categoryLabel: string;
  allowDownload: boolean;
  /** Newest version — null before the first upload. */
  currentVersion: VaultVersionView | null;
  versions: VaultVersionView[];
  createdAt: string;
  updatedAt: string;
}

type VersionRow = {
  id: string;
  version: number;
  fileName: string;
  fileSize: number;
  uploadedAt: Date;
  uploadedBy: string;
  notes: string | null;
  expiresAt: Date | null;
  supersededAt: Date | null;
};

export function isExpired(expiresAt: Date | string | null): boolean {
  if (!expiresAt) return false;
  return new Date(expiresAt).getTime() < Date.now();
}

function toVersionView(row: VersionRow): VaultVersionView {
  return {
    id: row.id,
    version: row.version,
    fileName: row.fileName,
    fileSize: row.fileSize,
    uploadedAt: row.uploadedAt.toISOString(),
    uploadedBy: row.uploadedBy,
    notes: row.notes,
    expiresAt: row.expiresAt ? row.expiresAt.toISOString() : null,
    supersededAt: row.supersededAt ? row.supersededAt.toISOString() : null,
    isExpired: isExpired(row.expiresAt),
  };
}

/** Documents for a property with their version history. Public
    metadata only — safe to expose titles and dates before NDA. */
export async function getDocumentsForProperty(
  propertySlug: string
): Promise<VaultDocumentView[]> {
  const documents = await db.vaultDocument.findMany({
    where: { propertySlug },
    orderBy: { createdAt: "asc" },
  });
  if (documents.length === 0) return [];
  const versions = await db.vaultDocumentVersion.findMany({
    where: { documentId: { in: documents.map((d) => d.id) } },
    orderBy: { version: "desc" },
  });
  return documents.map((doc) => {
    const docVersions = versions
      .filter((v) => v.documentId === doc.id)
      .map(toVersionView);
    return {
      id: doc.id,
      propertySlug: doc.propertySlug,
      title: doc.title,
      category: doc.category,
      categoryLabel: categoryLabel(doc.category),
      allowDownload: doc.allowDownload,
      currentVersion: docVersions[0] ?? null,
      versions: docVersions,
      createdAt: doc.createdAt.toISOString(),
      updatedAt: doc.updatedAt.toISOString(),
    };
  });
}

/* ---------- Grants & NDA ---------- */

export type GrantState = "granted" | "revoked" | "none";

export async function getActiveGrant(buyerId: string, propertySlug: string) {
  const grants = await db.vaultAccessGrant.findMany({
    where: { buyerId, propertySlug },
    orderBy: { grantedAt: "desc" },
  });
  return (
    grants.find(
      (g) =>
        g.revokedAt === null &&
        (!g.expiresAt || g.expiresAt.getTime() > Date.now())
    ) ?? null
  );
}

export async function getGrantState(
  buyerId: string,
  propertySlug: string
): Promise<GrantState> {
  const grants = await db.vaultAccessGrant.findMany({
    where: { buyerId, propertySlug },
    orderBy: { grantedAt: "desc" },
  });
  if (grants.length === 0) return "none";
  const active = grants.find(
    (g) =>
      g.revokedAt === null &&
      (!g.expiresAt || g.expiresAt.getTime() > Date.now())
  );
  return active ? "granted" : "revoked";
}

/** Has the buyer requested access without an active grant since? */
export async function hasPendingAccessRequest(
  buyerId: string,
  propertySlug: string
): Promise<boolean> {
  const lastRequest = await db.vaultAccessLog.findFirst({
    where: { buyerId, propertySlug, action: "access_requested" },
    orderBy: { createdAt: "desc" },
  });
  if (!lastRequest) return false;
  const grant = await getActiveGrant(buyerId, propertySlug);
  if (grant) return grant.grantedAt > lastRequest.createdAt;
  return true;
}

export async function getNda(
  buyerId: string,
  propertySlug: string
) {
  return db.ndaAcceptance.findUnique({
    where: { buyerId_propertySlug: { buyerId, propertySlug } },
  });
}

/* ---------- Audit log ---------- */

export type VaultAction =
  | "nda_accepted"
  | "access_requested"
  | "view"
  | "download"
  | "grant"
  | "revoke"
  | "version_published"
  | "document_created"
  | "download_denied"
  | "view_denied"
  | "pof_viewed"
  | "classification_changed";

export async function logVaultAction(entry: {
  buyerId?: string | null;
  propertySlug?: string | null;
  documentId?: string | null;
  versionId?: string | null;
  action: VaultAction;
  details?: string | null;
  ipHash?: string | null;
}): Promise<void> {
  await db.vaultAccessLog.create({
    data: {
      buyerId: entry.buyerId ?? null,
      propertySlug: entry.propertySlug ?? null,
      documentId: entry.documentId ?? null,
      versionId: entry.versionId ?? null,
      action: entry.action,
      details: entry.details ?? null,
      ipHash: entry.ipHash ?? null,
    },
  });
}

/* ---------- Notifications ---------- */

/** Create a notification for every buyer with active access to the
    property — used for new versions and addenda. */
export async function notifyGrantees(
  propertySlug: string,
  document: { id: string; title: string; category: string },
  version: { version: number; notes: string | null }
): Promise<number> {
  const activeGrants = await db.vaultAccessGrant.findMany({
    where: {
      propertySlug,
      revokedAt: null,
      OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
    },
    select: { buyerId: true },
  });
  if (activeGrants.length === 0) return 0;
  const isAddendum = document.category === "addendum";
  await db.vaultNotification.createMany({
    data: activeGrants.map((g) => ({
      buyerId: g.buyerId,
      propertySlug,
      documentId: document.id,
      title: isAddendum
        ? `Addendum published — ${document.title}`
        : `Document updated — ${document.title}`,
      message: isAddendum
        ? `A new addendum (version ${version.version}) has been published for this data room. Review it before bidding — addenda form part of the contract.`
        : `Version ${version.version} of "${document.title}" has been published to this data room.${
            version.notes ? ` Notes: ${version.notes}` : ""
          }`,
    })),
  });
  return activeGrants.length;
}

/* ---------- Mutations (back office) ---------- */

export async function grantVaultAccess(
  buyerId: string,
  propertySlug: string,
  grantedBy: string,
  ipHash?: string | null
) {
  const existing = await getActiveGrant(buyerId, propertySlug);
  if (existing) return existing;
  const grant = await db.vaultAccessGrant.create({
    data: { buyerId, propertySlug, grantedBy },
  });
  await logVaultAction({
    buyerId,
    propertySlug,
    action: "grant",
    details: `Granted by ${grantedBy}`,
    ipHash,
  });
  return grant;
}

export async function revokeVaultAccess(
  grantId: string,
  revokedBy: string,
  reason: string | null,
  ipHash?: string | null
) {
  const grant = await db.vaultAccessGrant.findUnique({ where: { id: grantId } });
  if (!grant || grant.revokedAt) return grant;
  const updated = await db.vaultAccessGrant.update({
    where: { id: grantId },
    data: { revokedAt: new Date(), revokedReason: reason },
  });
  await logVaultAction({
    buyerId: grant.buyerId,
    propertySlug: grant.propertySlug,
    action: "revoke",
    details: `Revoked by ${revokedBy}${reason ? ` — ${reason}` : ""}`,
    ipHash,
  });
  return updated;
}

/* ---------- Access check for file streaming ---------- */

export type DocumentAccess =
  | { allowed: true; document: VaultDocumentView; version: VaultVersionView; buyerId: string }
  | { allowed: false; reason: string; status: number };

export async function checkDocumentAccess(
  buyerId: string,
  propertySlug: string,
  documentId: string
): Promise<DocumentAccess> {
  const buyer = await db.buyerRegistration.findUnique({
    where: { id: buyerId },
    select: { classification: true, fullName: true },
  });
  if (!buyer)
    return { allowed: false, reason: "Session not found.", status: 401 };
  if (!canAccessVault(buyer.classification))
    return {
      allowed: false,
      reason: "Your buyer classification does not permit data room access.",
      status: 403,
    };
  const grant = await getActiveGrant(buyerId, propertySlug);
  if (!grant)
    return {
      allowed: false,
      reason: "You are not currently authorised for this property's data room.",
      status: 403,
    };
  const nda = await getNda(buyerId, propertySlug);
  if (!nda)
    return {
      allowed: false,
      reason: "You must accept the confidentiality agreement first.",
      status: 403,
    };
  const documents = await getDocumentsForProperty(propertySlug);
  const document = documents.find((d) => d.id === documentId);
  if (!document || !document.currentVersion)
    return { allowed: false, reason: "Document not found.", status: 404 };
  if (document.currentVersion.isExpired)
    return {
      allowed: false,
      reason: "This document version has expired and is awaiting replacement.",
      status: 410,
    };
  return {
    allowed: true,
    document,
    version: document.currentVersion,
    buyerId,
  };
}
