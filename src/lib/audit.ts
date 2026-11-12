/* ============================================================
   Audit trail — generic back-office event log: classification
   changes, proof-of-funds views, bid submissions, bid status
   changes, account setting changes.
   ============================================================ */

import { db } from "@/lib/db";

export interface AuditEntry {
  buyerId?: string | null;
  propertySlug?: string | null;
  bidId?: string | null;
  action: string;
  details?: string | null;
  ipHash?: string | null;
}

export async function logAuditAction(entry: AuditEntry): Promise<void> {
  try {
    await db.auditLog.create({
      data: {
        buyerId: entry.buyerId ?? null,
        propertySlug: entry.propertySlug ?? null,
        bidId: entry.bidId ?? null,
        action: entry.action,
        details: entry.details ?? null,
        ipHash: entry.ipHash ?? null,
      },
    });
  } catch (err) {
    /* The audit log must never break the request it records. */
    console.error("[audit] Failed to write entry:", err);
  }
}
