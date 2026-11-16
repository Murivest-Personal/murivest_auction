/* ============================================================
   Audit trail — generic back-office event log: classification
   changes, proof-of-funds views, bid submissions, bid status
   changes, account setting changes.

   Writes go through the server-side Supabase client into the
   `buyer_audit_logs` table.
   ============================================================ */

import { insertBuyerAuditLog } from "@/lib/supabase/records";

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
    await insertBuyerAuditLog(entry);
  } catch (err) {
    /* The audit log must never break the request it records. */
    console.error("[audit] Failed to write entry:", err);
  }
}