/* ============================================================
   Lightweight signed-cookie sessions for client accounts and the
   back office. No NextAuth dependency: tokens are
   `<id>.<expiry>.<hmac-sha256>` and verified server-side.

   Client sessions: set at registration / sign-in (email + access
   code). Admin sessions: set after the back-office passcode.
   ============================================================ */

import { cookies } from "next/headers";
import {
  createHash,
  createHmac,
  randomInt,
  randomUUID,
  timingSafeEqual,
} from "crypto";

const DEFAULT_SECRET = "dev-only-secret-change-me";
export const BUYER_COOKIE = "mv_buyer_session";
export const ADMIN_COOKIE = "mv_admin_session";
const THIRTY_DAYS_S = 60 * 60 * 24 * 30;
const ADMIN_TTL_S = 60 * 60 * 8; // 8 hours

function buyerSecret(): string {
  return process.env.BUYER_SESSION_SECRET ?? DEFAULT_SECRET;
}

function adminSecret(): string {
  return process.env.ADMIN_SESSION_SECRET ?? DEFAULT_SECRET;
}

/* ---------- Token sign / verify ---------- */

function signToken(id: string, secret: string, ttlS: number): string {
  const exp = Math.floor(Date.now() / 1000) + ttlS;
  const payload = `${id}.${exp}`;
  const mac = createHmac("sha256", secret).update(payload).digest("hex");
  return `${payload}.${mac}`;
}

function verifyToken(
  token: string | undefined,
  secret: string
): string | null {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [id, expStr, mac] = parts;
  const exp = Number(expStr);
  if (!id || !Number.isFinite(exp) || exp * 1000 < Date.now()) return null;
  const expected = createHmac("sha256", secret)
    .update(`${id}.${expStr}`)
    .digest("hex");
  const a = Buffer.from(mac, "utf8");
  const b = Buffer.from(expected, "utf8");
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  return id;
}

/* ---------- Buyer session ---------- */

export async function getBuyerSessionId(): Promise<string | null> {
  const jar = await cookies();
  return verifyToken(jar.get(BUYER_COOKIE)?.value, buyerSecret());
}

export async function setBuyerSession(id: string): Promise<void> {
  const jar = await cookies();
  jar.set(BUYER_COOKIE, signToken(id, buyerSecret(), THIRTY_DAYS_S), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: THIRTY_DAYS_S,
    secure: process.env.NODE_ENV === "production",
  });
}

export async function clearBuyerSession(): Promise<void> {
  const jar = await cookies();
  jar.delete(BUYER_COOKIE);
}

/* ---------- Admin session (back office) ---------- */

export function adminPasscode(): string {
  return process.env.ADMIN_PASSCODE ?? "murivest-admin";
}

export function usingDefaultAdminPasscode(): boolean {
  return !process.env.ADMIN_PASSCODE;
}

export async function isAdminAuthenticated(): Promise<boolean> {
  const jar = await cookies();
  return verifyToken(jar.get(ADMIN_COOKIE)?.value, adminSecret()) !== null;
}

export async function setAdminSession(): Promise<void> {
  const jar = await cookies();
  jar.set(ADMIN_COOKIE, signToken("admin", adminSecret(), ADMIN_TTL_S), {
    httpOnly: true,
    sameSite: "strict",
    path: "/",
    maxAge: ADMIN_TTL_S,
    secure: process.env.NODE_ENV === "production",
  });
}

export async function clearAdminSession(): Promise<void> {
  const jar = await cookies();
  jar.delete(ADMIN_COOKIE);
}

/* ---------- Access codes & hashes ---------- */

const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

/** Human-safe access code, e.g. "K7QM-4XZD-9PRT". */
export function generateAccessCode(): string {
  const group = () =>
    Array.from(
      { length: 4 },
      () => CODE_ALPHABET[randomInt(CODE_ALPHABET.length)]
    ).join("");
  return `${group()}-${group()}-${group()}`;
}

export function hashCode(code: string): string {
  return createHash("sha256")
    .update(code.trim().toUpperCase())
    .digest("hex");
}

export function newId(): string {
  return randomUUID();
}
