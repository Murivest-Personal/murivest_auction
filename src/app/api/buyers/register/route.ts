import { NextRequest, NextResponse } from "next/server";
import { createHash, randomUUID } from "crypto";
import { db } from "@/lib/db";
import {
  ACQUISITION_TIMELINES,
  ASSET_CLASSES,
  BUDGET_CURRENCIES,
  BUYER_TERMS_TEXT,
  BUYER_TERMS_VERSION,
  BUYER_TYPES,
  CORPORATE_BUYER_TYPES,
  FUNDING_PREFERENCES,
  ID_TYPES,
  POF_TYPES,
  PREFERRED_COUNTRIES,
} from "@/lib/buyer/constants";
import { DEFAULT_CLASSIFICATION } from "@/lib/buyer/qualification";
import {
  generateAccessCode,
  hashCode,
  setBuyerSession,
} from "@/lib/buyer/session";
import {
  isAllowedPofMime,
  privateFileKeyForPof,
  savePrivateFile,
  sha256Hex,
} from "@/lib/private-store";

export const runtime = "nodejs";

const MAX_POF_BYTES = 10 * 1024 * 1024; // 10 MB

function inList<T extends readonly string[]>(
  value: string,
  list: T
): boolean {
  return (list as readonly string[]).includes(value);
}

function inOptionList(
  value: string,
  list: readonly { value: string }[]
): boolean {
  return list.some((o) => o.value === value);
}

/**
 * Best-effort delete of an orphaned POF file. Tries the common helper
 * names a private-store module typically exports; logs a warning if
 * neither is found (so ops can clean up manually).
 */
async function cleanupPofFile(storedPath: string) {
  try {
    const store = (await import("@/lib/private-store")) as unknown as {
      deletePrivateFile?: (key: string) => Promise<void> | void;
      removePrivateFile?: (key: string) => Promise<void> | void;
    };
    const fn = store.deletePrivateFile ?? store.removePrivateFile;
    if (typeof fn === "function") {
      await fn(storedPath);
    } else {
      console.warn(
        "[buyers/register] No delete helper in @/lib/private-store; orphaned POF file:",
        storedPath
      );
    }
  } catch (cleanupErr) {
    console.error(
      "[buyers/register] Failed to clean up orphaned POF file:",
      storedPath,
      cleanupErr
    );
  }
}

interface BeneficialOwner {
  name: string;
  share: number;
}

function parseBeneficialOwners(raw: string | null): {
  owners: BeneficialOwner[] | null;
  error: string | null;
} {
  if (!raw || !raw.trim()) return { owners: null, error: null };
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return { owners: null, error: "Invalid beneficial ownership data." };
  }
  if (!Array.isArray(parsed) || parsed.length > 20)
    return { owners: null, error: "Invalid beneficial ownership data." };
  const owners: BeneficialOwner[] = [];
  let total = 0;
  for (const o of parsed) {
    const name = String((o as BeneficialOwner)?.name ?? "").trim();
    const share = Number((o as BeneficialOwner)?.share);
    if (name.length < 2 || name.length > 120)
      return { owners: null, error: "Beneficial owner names must be 2–120 characters." };
    if (!Number.isFinite(share) || share < 0 || share > 100)
      return { owners: null, error: "Ownership percentages must be between 0 and 100." };
    total += share;
    owners.push({ name, share });
  }
  if (total > 100.5)
    return { owners: null, error: "Total beneficial ownership cannot exceed 100%." };
  return { owners, error: null };
}

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();

    /* Honeypot + timing — same pattern as the bid API. */
    if (String(form.get("hp_field") ?? "") !== "") {
      return NextResponse.json({ error: "Rejected." }, { status: 400 });
    }
    const elapsed = Date.now() - Number(form.get("form_started_at") ?? 0);
    if (!Number.isFinite(elapsed) || elapsed < 1500) {
      return NextResponse.json({ error: "Rejected." }, { status: 400 });
    }

    const get = (key: string) => String(form.get(key) ?? "").trim();

    /* ---------- The 10-point qualification capture ---------- */
    const buyerType = get("buyer_type");
    const fullName = get("full_name");
    const email = get("email").toLowerCase();
    const phone = get("phone");
    const countryOfResidence = get("country_of_residence");
    const taxJurisdiction = get("tax_jurisdiction");
    const idType = get("id_type");
    const idNumber = get("id_number");
    const purchasingEntityName = get("purchasing_entity_name");
    const purchasingEntityJurisdiction = get("purchasing_entity_jurisdiction");
    const budgetMin = Number(form.get("budget_min"));
    const budgetMax = Number(form.get("budget_max"));
    const budgetCurrency = get("budget_currency") || "USD";
    const preferredCountry = get("preferred_country");
    const preferredLocations = get("preferred_locations");
    const assetClassesRaw = form.getAll("asset_classes").map(String);
    const fundingPreference = get("funding_preference");
    const pofType = get("pof_type");
    const lenderName = get("lender_name");
    const acquisitionTimeline = get("acquisition_timeline");
    const consentTerms = form.get("consent_terms") === "true";

    /* ---------- Validation ---------- */
    if (!inOptionList(buyerType, BUYER_TYPES))
      return NextResponse.json(
        { error: "Select whether you are an individual or corporate buyer." },
        { status: 400 }
      );
    if (fullName.length < 2 || fullName.length > 120)
      return NextResponse.json({ error: "Please provide your full name." }, { status: 400 });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return NextResponse.json({ error: "Please provide a valid email address." }, { status: 400 });
    if (!/^[+0-9\-() ]{7,20}$/.test(phone))
      return NextResponse.json({ error: "Please provide a valid phone number." }, { status: 400 });
    if (countryOfResidence.length < 2 || countryOfResidence.length > 80)
      return NextResponse.json({ error: "Select your country of residence." }, { status: 400 });
    if (taxJurisdiction.length < 2 || taxJurisdiction.length > 80)
      return NextResponse.json({ error: "Select your tax jurisdiction." }, { status: 400 });
    if (!inOptionList(idType, ID_TYPES))
      return NextResponse.json({ error: "Select an identification document type." }, { status: 400 });
    if (idNumber.length < 3 || idNumber.length > 60)
      return NextResponse.json({ error: "Provide the identification number." }, { status: 400 });
    if (CORPORATE_BUYER_TYPES.includes(buyerType) && purchasingEntityName.length < 2)
      return NextResponse.json(
        { error: "Corporate buyers must provide the purchasing entity name." },
        { status: 400 }
      );
    const { owners, error: ownersError } = parseBeneficialOwners(
      form.get("beneficial_owners") as string | null
    );
    if (ownersError)
      return NextResponse.json({ error: ownersError }, { status: 400 });
    if (!Number.isFinite(budgetMin) || budgetMin <= 0 || budgetMin > 1e12)
      return NextResponse.json({ error: "Provide a minimum investment budget." }, { status: 400 });
    if (!Number.isFinite(budgetMax) || budgetMax <= 0 || budgetMax > 1e12)
      return NextResponse.json({ error: "Provide a maximum investment budget." }, { status: 400 });
    if (budgetMax < budgetMin)
      return NextResponse.json({ error: "The maximum budget cannot be below the minimum." }, { status: 400 });
    if (!inList(budgetCurrency, BUDGET_CURRENCIES))
      return NextResponse.json({ error: "Select a budget currency." }, { status: 400 });
    if (!inOptionList(preferredCountry, PREFERRED_COUNTRIES))
      return NextResponse.json({ error: "Select a preferred market." }, { status: 400 });
    if (assetClassesRaw.length === 0 || !assetClassesRaw.every((a) => inList(a, ASSET_CLASSES)))
      return NextResponse.json({ error: "Select at least one asset class of interest." }, { status: 400 });
    if (!inOptionList(fundingPreference, FUNDING_PREFERENCES))
      return NextResponse.json({ error: "Select a funding preference." }, { status: 400 });
    if (pofType && !inOptionList(pofType, POF_TYPES))
      return NextResponse.json({ error: "Invalid proof of funds type." }, { status: 400 });
    if (!inOptionList(acquisitionTimeline, ACQUISITION_TIMELINES))
      return NextResponse.json({ error: "Select your expected acquisition timeline." }, { status: 400 });
    if (!consentTerms)
      return NextResponse.json({ error: "You must accept the registration terms." }, { status: 400 });

    /* ---------- Proof of funds / lender evidence (private) ---------- */
    const pof = form.get("proof_of_funds");
    let pofMeta: {
      fileName: string;
      storedPath: string;
      fileSize: number;
      mimeType: string;
      sha256: string;
    } | null = null;
    if (pof instanceof File && pof.size > 0) {
      if (pof.size > MAX_POF_BYTES)
        return NextResponse.json(
          { error: "The proof of funds file exceeds the 10 MB limit." },
          { status: 400 }
        );
      if (!isAllowedPofMime(pof.type))
        return NextResponse.json(
          { error: "Proof of funds must be a PDF, PNG, JPG or WEBP file." },
          { status: 400 }
        );
    }

    /* ---------- Duplicate registration (fast path) ----------
       The authoritative check is the unique constraint + P2002
       handling below; this pre-check just avoids a wasted file
       write for the common case. */
    const existing = await db.buyerRegistration.findFirst({
      where: { email },
      select: { id: true },
    });
    if (existing)
      return NextResponse.json(
        {
          error:
            "This email address is already registered. Sign in with your access code, or contact office@murivest.com if you have lost it.",
        },
        { status: 409 }
      );

    /* ---------- Persist ---------- */
    const accessCode = generateAccessCode();
    const id = randomUUID();

    if (pof instanceof File && pof.size > 0) {
      const bytes = Buffer.from(await pof.arrayBuffer());
      const key = privateFileKeyForPof(id, pof.name);
      await savePrivateFile(bytes, key);
      pofMeta = {
        fileName: pof.name,
        storedPath: key,
        fileSize: pof.size,
        mimeType: pof.type,
        sha256: sha256Hex(bytes),
      };
    }

    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      req.headers.get("x-real-ip") ??
      null;
    const ipHash = ip ? createHash("sha256").update(ip).digest("hex") : null;

    /* Wrap create so we can (a) delete the orphaned POF file if
       the insert fails, and (b) surface a clean 409 on a duplicate
       email race (P2002 — requires @unique on email). */
    const buyer = await (async () => {
      try {
        return await db.buyerRegistration.create({
          data: {
            id,
            accessCodeHash: hashCode(accessCode),
            buyerType,
            fullName,
            email,
            phone,
            countryOfResidence,
            taxJurisdiction,
            idType,
            idNumber,
            purchasingEntityName: purchasingEntityName || null,
            purchasingEntityJurisdiction: purchasingEntityJurisdiction || null,
            beneficialOwners: owners ? JSON.stringify(owners) : null,
            budgetMin,
            budgetMax,
            budgetCurrency,
            preferredCountry,
            preferredLocations: preferredLocations || null,
            assetClasses: JSON.stringify(assetClassesRaw),
            fundingPreference,
            pofType: pofType || null,
            pofFileName: pofMeta?.fileName ?? null,
            pofStoredPath: pofMeta?.storedPath ?? null,
            pofFileSize: pofMeta?.fileSize ?? null,
            pofMimeType: pofMeta?.mimeType ?? null,
            pofSha256: pofMeta?.sha256 ?? null,
            pofUploadedAt: pofMeta ? new Date() : null,
            lenderName: lenderName || null,
            acquisitionTimeline,
            classification: DEFAULT_CLASSIFICATION,
            consentTerms: true,
            consentAt: new Date(),
            termsVersion: BUYER_TERMS_VERSION,
            ipHash,
            userAgent: req.headers.get("user-agent") ?? null,
          },
          select: { id: true, classification: true },
        });
      } catch (createErr) {
        if (pofMeta?.storedPath) {
          await cleanupPofFile(pofMeta.storedPath);
        }
        if ((createErr as { code?: string })?.code === "P2002") {
          return null;
        }
        throw createErr;
      }
    })();

    if (buyer === null) {
      return NextResponse.json(
        {
          error:
            "This email address is already registered. Sign in with your access code, or contact office@murivest.com if you have lost it.",
        },
        { status: 409 }
      );
    }

    await setBuyerSession(buyer.id);

    return NextResponse.json({
      ok: true,
      buyerId: buyer.id,
      accessCode,
      classification: buyer.classification,
      termsText: BUYER_TERMS_TEXT,
      termsVersion: BUYER_TERMS_VERSION,
    });
  } catch (err) {
    console.error("[buyers/register] Failed:", err);
    return NextResponse.json(
      { error: "Registration failed. Please try again." },
      { status: 500 }
    );
  }
}