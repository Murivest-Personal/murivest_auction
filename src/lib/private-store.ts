/* ============================================================
   Private file store — proof of funds and confidential data room
   documents. Files live OUTSIDE public/ and .next/, are never
   served statically, and can only be read through authenticated
   API routes that check permissions and write access logs.

   Base directory: PRIVATE_STORE_DIR (default .private-store/).
   Layout:
     buyers/<buyerId>/pof/<uuid>-<name>.pdf
     vault/<propertySlug>/<documentId>/v<n>-<uuid>-<name>.pdf
   ============================================================ */

import { createHash } from "crypto";
import { randomUUID } from "crypto";
import { mkdir, readFile, writeFile } from "fs/promises";
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

export function privateFileKeyForVaultDocument(
  propertySlug: string,
  documentId: string,
  version: number,
  fileName: string
): string {
  return `vault/${sanitizeComponent(propertySlug)}/${sanitizeComponent(documentId)}/v${version}-${randomUUID()}-${sanitizeComponent(fileName)}`;
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

export function isAllowedVaultMime(mime: string): boolean {
  return mime === "application/pdf";
}
