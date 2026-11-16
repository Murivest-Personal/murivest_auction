/* ============================================================
   Private file store — proof of funds and other confidential
   client documents. Files live OUTSIDE public/ and .next/, are
   never served statically, and can only be read through
   authenticated API routes that check permissions and write
   access logs.

   Base directory: PRIVATE_STORE_DIR (default .private-store/).
   Layout:
     buyers/<buyerId>/pof/<uuid>-<name>.pdf
   ============================================================ */

import { createHash } from "crypto";
import { randomUUID } from "crypto";
import { mkdir, readFile, writeFile, unlink } from "fs/promises";
import path from "path";

function baseDir(): string {
  return process.env.PRIVATE_STORE_DIR
    ? path.resolve(process.env.PRIVATE_STORE_DIR)
    : path.join(process.cwd(), ".private-store");
}

function sanitizeComponent(component: string): string {
  return component.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 120);
}

/** Resolve a store key to an absolute path, refusing traversal. */
function resolvePrivateKey(key: string): string {
  const base = baseDir();
  const normalized = path.normalize(key).replace(/^([.][.](\/|\\|$))+/, "");
  const full = path.join(base, normalized);
  if (full !== base && !full.startsWith(base + path.sep)) {
    throw new Error("Invalid private store key");
  }
  return full;
}

export function sha256Hex(data: Buffer): string {
  return createHash("sha256").update(data).digest("hex");
}

export async function savePrivateFile(
  data: Buffer,
  key: string
): Promise<string> {
  const full = resolvePrivateKey(key);
  await mkdir(path.dirname(full), { recursive: true });
  await writeFile(full, data, { mode: 0o600 });
  return key;
}

export async function readPrivateFile(key: string): Promise<Buffer | null> {
  try {
    return await readFile(resolvePrivateKey(key));
  } catch {
    return null;
  }
}

export function privateFileKeyForPof(
  buyerId: string,
  fileName: string
): string {
  return `buyers/${sanitizeComponent(buyerId)}/pof/${randomUUID()}-${sanitizeComponent(fileName)}`;
}

/** Accept only PDFs (and images for proof of funds). */
export function isAllowedPofMime(mime: string): boolean {
  return [
    "application/pdf",
    "image/png",
    "image/jpeg",
    "image/webp",
  ].includes(mime);
}

/* ============================================================
   Selling submission file helpers
   Layout:
     selling/<submissionId>/images/<uuid>-<name>.<ext>
     selling/<submissionId>/documents/<uuid>-<name>.pdf
   ============================================================ */

export function privateFileKeyForSelling(
  submissionId: string,
  category: "images" | "documents",
  fileName: string
): string {
  return `selling/${sanitizeComponent(submissionId)}/${category}/${randomUUID()}-${sanitizeComponent(fileName)}`;
}

export function isAllowedSellingImageMime(mime: string): boolean {
  return ["image/png", "image/jpeg", "image/webp"].includes(mime);
}

export function isAllowedSellingDocumentMime(mime: string): boolean {
  return mime === "application/pdf";
}

export async function deletePrivateFile(key: string): Promise<void> {
  try {
    const full = resolvePrivateKey(key);
    await unlink(full);
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code !== "ENOENT") {
      throw err;
    }
  }
}
