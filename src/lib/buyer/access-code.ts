import { createCipheriv, createDecipheriv, randomBytes, createHash } from "crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12; // 96-bit IV for GCM
const AUTH_TAG_LENGTH = 16; // 128-bit auth tag

function getKey(): Buffer {
  const raw =
    process.env.BUYER_ACCESS_CODE_SECRET ??
    process.env.BUYER_SESSION_SECRET ??
    "dev-only-secret-change-me";
  // Derive a 32-byte key from the provided secret using SHA-256
  return createHash("sha256").update(raw).digest();
}

/**
 * Encrypts a plaintext access code using AES-256-GCM.
 * Returns a base64-encoded string containing: IV + ciphertext + authTag
 */
export function encryptAccessCode(plaintext: string): string {
  const key = getKey();
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, key, iv);

  const ciphertext = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();

  // Combine: IV (12) + ciphertext + authTag (16)
  const combined = Buffer.concat([iv, ciphertext, authTag]);
  return combined.toString("base64");
}

/**
 * Decrypts an encrypted access code using AES-256-GCM.
 * Expects base64-encoded string containing: IV + ciphertext + authTag
 * Returns null if decryption fails (invalid/tampered input).
 */
export function decryptAccessCode(encryptedBase64: string): string | null {
  try {
    const key = getKey();
    const combined = Buffer.from(encryptedBase64, "base64");

    if (combined.length < IV_LENGTH + AUTH_TAG_LENGTH) {
      return null;
    }

    const iv = combined.subarray(0, IV_LENGTH);
    const authTag = combined.subarray(combined.length - AUTH_TAG_LENGTH);
    const ciphertext = combined.subarray(IV_LENGTH, combined.length - AUTH_TAG_LENGTH);

    const decipher = createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);

    const plaintext = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
    return plaintext.toString("utf8");
  } catch {
    return null;
  }
}

/**
 * Creates a SHA-256 hash of the access code for sign-in verification.
 * This is stored in access_code_hash column.
 * Matches hashCode in session.ts: trims and uppercases before hashing.
 */
export function hashAccessCode(plaintext: string): string {
  return createHash("sha256").update(plaintext.trim().toUpperCase()).digest("hex");
}