import { NextRequest, NextResponse } from "next/server";
import { createHash, randomUUID } from "crypto";
import { getSupabaseService } from "@/lib/supabase/server";
import { sendNewSellingSubmissionNotification } from "@/lib/buyer/notifications";
import {
  evaluateSellingEligibility,
  type SellingEligibilityInput,
  type SellingRejection,
} from "@/lib/selling/criteria";
import {
  privateFileKeyForSelling,
  isAllowedSellingImageMime,
  isAllowedSellingDocumentMime,
  savePrivateFile,
  sha256Hex,
  deletePrivateFile,
} from "@/lib/private-store";

export const runtime = "nodejs";

const MAX_IMAGE_BYTES = 10 * 1024 * 1024; // 10 MB
const MAX_DOCUMENT_BYTES = 20 * 1024 * 1024; // 20 MB
const MAX_GALLERY_FILES = 8;

interface FileMeta {
  fileName: string;
  storedPath: string;
  fileSize: number;
  mimeType: string;
  sha256: string;
}

async function cleanupFiles(paths: string[]) {
  for (const storedPath of paths) {
    try {
      await deletePrivateFile(storedPath);
    } catch (cleanupErr) {
      console.error("[api/selling] Failed to clean up orphaned file:", storedPath, cleanupErr);
    }
  }
}

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();

    /* ---------- Honeypot + timing ---------- */
    if (String(form.get("hp_field") ?? "") !== "") {
      return NextResponse.json({ error: "Rejected." }, { status: 400 });
    }
    const elapsed = Date.now() - Number(form.get("form_started_at") ?? 0);
    if (!Number.isFinite(elapsed) || elapsed < 1500) {
      return NextResponse.json({ error: "Rejected." }, { status: 400 });
    }

    /* ---------- Parse JSON payload ---------- */
    const dataStr = form.get("data");
    if (typeof dataStr !== "string") {
      return NextResponse.json({ error: "Missing form data." }, { status: 400 });
    }
    let payload: Record<string, unknown>;
    try {
      payload = JSON.parse(dataStr);
    } catch {
      return NextResponse.json({ error: "Invalid form data." }, { status: 400 });
    }

    /* ---------- Validate required fields ---------- */
    const requiredFields = [
      "title",
      "market",
      "region",
      "location",
      "assetType",
      "tenure",
      "size",
      "guidePrice",
      "sellingParty",
      "facts.saleType",
      "facts.tenure",
      "facts.buildingClass",
      "facts.yearBuilt",
      "facts.price",
      "facts.currency",
      "facts.noi",
      "facts.grossAnnualRent",
      "facts.tenancy",
      "description",
      "conditionsOfSale.jurisdiction",
      "conditionsOfSale.summaryPoints",
      "conditionsOfSale.depositPercent",
      "conditionsOfSale.depositDue",
      "conditionsOfSale.depositPaymentMethod",
      "conditionsOfSale.depositPayee",
      "conditionsOfSale.balanceDays",
      "sellerName",
      "sellerEmail",
      "sellerPhone",
      "sellerRole",
      "noCommission",
      "flexibleGuidePrice",
      "accuracy",
      "consentPrivacy",
    ];

    for (const field of requiredFields) {
      const keys = field.split(".");
      let value: unknown = payload;
      for (const key of keys) {
        value = (value as Record<string, unknown>)[key];
      }
      if (value === undefined || value === null || value === "") {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    if (payload.accuracy !== true) {
      return NextResponse.json(
        { error: "You must confirm that the information is accurate." },
        { status: 400 }
      );
    }
    if (payload.consentPrivacy !== true) {
      return NextResponse.json(
        { error: "You must accept the Privacy Policy." },
        { status: 400 }
      );
    }

    if (typeof payload.sellerEmail === "string" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.sellerEmail)) {
      return NextResponse.json({ error: "Invalid email address." }, { status: 400 });
    }

    if (typeof payload.sellerPhone === "string" && !/^[+0-9\-() ]{7,20}$/.test(payload.sellerPhone)) {
      return NextResponse.json({ error: "Invalid phone number." }, { status: 400 });
    }

    /* ---------- Server-side value validation ---------- */
    const validationErrors: string[] = [];

    const market = String(payload.market);
    if (!["Kenya", "UK"].includes(market)) validationErrors.push("market must be Kenya or UK");

    const assetType = String(payload.assetType);
    if (!["Office", "Industrial", "Retail", "Hospitality", "Mixed-Use", "Land", "Alternative"].includes(assetType)) {
      validationErrors.push("assetType must be one of: Office, Industrial, Retail, Hospitality, Mixed-Use, Land, Alternative");
    }

    const tenure = String(payload.tenure);
    if (!["Freehold", "Leasehold", "Unknown"].includes(tenure)) validationErrors.push("tenure must be Freehold, Leasehold, or Unknown");

    const factsData = payload.facts as Record<string, unknown>;
    const saleType = String(factsData.saleType);
    if (!["Investment", "Owner-Occupier", "Development", "Mixed"].includes(saleType)) validationErrors.push("facts.saleType must be Investment, Owner-Occupier, Development, or Mixed");

    const buildingClass = String(factsData.buildingClass);
    if (!["A", "B", "C", "Not applicable"].includes(buildingClass)) validationErrors.push("facts.buildingClass must be A, B, C, or Not applicable");

    const currency = String(factsData.currency);
    if (!["USD", "GBP", "KES"].includes(currency)) validationErrors.push("facts.currency must be USD, GBP, or KES");

    const tenancy = String(factsData.tenancy);
    if (!["Single", "Multi", "Vacant"].includes(tenancy)) validationErrors.push("facts.tenancy must be Single, Multi, or Vacant");

    const conditionsOfSale = payload.conditionsOfSale as Record<string, unknown> | undefined;
    const jurisdiction = String(conditionsOfSale?.jurisdiction);
    if (!["Kenya", "UK", "Other"].includes(jurisdiction)) validationErrors.push("conditionsOfSale.jurisdiction must be Kenya, UK, or Other");

    const sellerRole = String(payload.sellerRole);
    if (!["owner", "director", "adviser", "receiver", "other"].includes(sellerRole)) validationErrors.push("sellerRole must be owner, director, adviser, receiver, or other");

    const legalPackAvailable = String(payload.legalPackAvailable);
    if (!["Yes", "No"].includes(legalPackAvailable)) validationErrors.push("legalPackAvailable must be Yes or No");

    const guidePrice = Number(payload.guidePrice);
    if (!Number.isFinite(guidePrice) || guidePrice <= 0) validationErrors.push("guidePrice must be a positive number");

    const price = Number(factsData.price);
    if (!Number.isFinite(price) || price <= 0) validationErrors.push("facts.price must be a positive number");

    const noi = Number(factsData.noi);
    if (!Number.isFinite(noi) || noi <= 0) validationErrors.push("facts.noi must be a positive number");

    const grossAnnualRent = Number(factsData.grossAnnualRent);
    if (!Number.isFinite(grossAnnualRent) || grossAnnualRent <= 0) validationErrors.push("facts.grossAnnualRent must be a positive number");

    const yearBuilt = Number(factsData.yearBuilt);
    if (!Number.isFinite(yearBuilt) || yearBuilt <= 0) validationErrors.push("facts.yearBuilt must be a positive number");

    const pricePerSf = factsData.pricePerSf !== undefined && factsData.pricePerSf !== "" ? Number(factsData.pricePerSf) : null;
    if (pricePerSf !== null && (!Number.isFinite(pricePerSf) || pricePerSf < 0)) validationErrors.push("facts.pricePerSf must be >= 0");

    const buildingHeight = factsData.buildingHeight !== undefined && factsData.buildingHeight !== "" ? Number(factsData.buildingHeight) : null;
    if (buildingHeight !== null && (!Number.isFinite(buildingHeight) || buildingHeight < 0)) validationErrors.push("facts.buildingHeight must be >= 0");

    const far = factsData.far !== undefined && factsData.far !== "" ? Number(factsData.far) : null;
    if (far !== null && (!Number.isFinite(far) || far < 0)) validationErrors.push("facts.far must be >= 0");

    const lotSizeAc = factsData.lotSizeAc !== undefined && factsData.lotSizeAc !== "" ? Number(factsData.lotSizeAc) : null;
    if (lotSizeAc !== null && (!Number.isFinite(lotSizeAc) || lotSizeAc < 0)) validationErrors.push("facts.lotSizeAc must be >= 0");

    const buildingSf = factsData.buildingSf !== undefined && factsData.buildingSf !== "" ? Number(factsData.buildingSf) : null;
    if (buildingSf !== null && (!Number.isFinite(buildingSf) || buildingSf < 0)) validationErrors.push("facts.buildingSf must be >= 0");

    const occupancy = factsData.occupancy !== undefined && factsData.occupancy !== "" ? Number(factsData.occupancy) : null;
    if (occupancy !== null && (!Number.isFinite(occupancy) || occupancy < 0 || occupancy > 100)) validationErrors.push("facts.occupancy must be between 0 and 100");

    const depositPercent = Number(conditionsOfSale?.depositPercent);
    if (!Number.isFinite(depositPercent) || depositPercent < 0 || depositPercent > 100) validationErrors.push("conditionsOfSale.depositPercent must be between 0 and 100");

    const balanceDays = Number(conditionsOfSale?.balanceDays);
    if (!Number.isFinite(balanceDays) || balanceDays <= 0) validationErrors.push("conditionsOfSale.balanceDays must be a positive number");

    const coordinates = payload.coordinates as Record<string, unknown> | undefined;
    const lat = Number(coordinates?.lat);
    if (!Number.isFinite(lat) || lat < -90 || lat > 90) validationErrors.push("coordinates.lat must be between -90 and 90");

    const lng = Number(coordinates?.lng);
    if (!Number.isFinite(lng) || lng < -180 || lng > 180) validationErrors.push("coordinates.lng must be between -180 and 180");

    const zoom = Number(coordinates?.zoom);
    if (!Number.isFinite(zoom) || zoom < 3 || zoom > 20) validationErrors.push("coordinates.zoom must be between 3 and 20");

    const summaryPoints = conditionsOfSale?.summaryPoints;
    if (!Array.isArray(summaryPoints) || summaryPoints.length < 4 || summaryPoints.length > 12 || summaryPoints.some((p: unknown) => typeof p !== "string" || !p.trim())) {
      validationErrors.push("conditionsOfSale.summaryPoints must be an array of 4–12 non-empty strings");
    }

    const keyHighlights = payload.keyHighlights;
    if (Array.isArray(keyHighlights) && (keyHighlights.length > 5 || keyHighlights.some((h: unknown) => typeof h !== "string" || !h.trim()))) {
      validationErrors.push("keyHighlights must be an array of at most 5 non-empty strings");
    }

    const reservePrice = payload.reservePrice !== undefined && payload.reservePrice !== "" ? Number(payload.reservePrice) : null;
    if (reservePrice !== null && (!Number.isFinite(reservePrice) || reservePrice <= 0 || reservePrice > guidePrice)) {
      validationErrors.push("reservePrice must be a positive number <= guidePrice");
    }

    if (validationErrors.length > 0) {
      return NextResponse.json({ error: validationErrors.join("; ") }, { status: 400 });
    }

    /* ---------- File uploads ---------- */
    const mainImage = form.get("main_image");
    const galleryFiles = form.getAll("gallery");
    const legalPack = form.get("legal_pack");

    const uploadedImages: FileMeta[] = [];
    const uploadedDocuments: FileMeta[] = [];
    const storedPaths: string[] = [];

    if (!(mainImage instanceof File) || mainImage.size === 0) {
      return NextResponse.json({ error: "Main image is required." }, { status: 400 });
    }
    if (mainImage.size > MAX_IMAGE_BYTES) {
      return NextResponse.json({ error: "Main image exceeds 10 MB limit." }, { status: 400 });
    }
    if (!isAllowedSellingImageMime(mainImage.type)) {
      return NextResponse.json({ error: "Main image must be PNG, JPEG or WebP." }, { status: 400 });
    }

    const mainBytes = Buffer.from(await mainImage.arrayBuffer());
    const submissionId = randomUUID();
    const mainKey = privateFileKeyForSelling(submissionId, "images", mainImage.name);
    await savePrivateFile(mainBytes, mainKey);
    storedPaths.push(mainKey);
    uploadedImages.push({
      fileName: mainImage.name,
      storedPath: mainKey,
      fileSize: mainImage.size,
      mimeType: mainImage.type,
      sha256: sha256Hex(mainBytes),
    });

    if (galleryFiles.length > MAX_GALLERY_FILES) {
      await cleanupFiles(storedPaths);
      return NextResponse.json({ error: `Maximum ${MAX_GALLERY_FILES} gallery images allowed.` }, { status: 400 });
    }

    for (const file of galleryFiles) {
      if (!(file instanceof File) || file.size === 0) continue;
      if (file.size > MAX_IMAGE_BYTES) {
        await cleanupFiles(storedPaths);
        return NextResponse.json({ error: "Gallery image exceeds 10 MB limit." }, { status: 400 });
      }
      if (!isAllowedSellingImageMime(file.type)) {
        await cleanupFiles(storedPaths);
        return NextResponse.json({ error: "Gallery images must be PNG, JPEG or WebP." }, { status: 400 });
      }
      const bytes = Buffer.from(await file.arrayBuffer());
      const key = privateFileKeyForSelling(submissionId, "images", file.name);
      await savePrivateFile(bytes, key);
      storedPaths.push(key);
      uploadedImages.push({
        fileName: file.name,
        storedPath: key,
        fileSize: file.size,
        mimeType: file.type,
        sha256: sha256Hex(bytes),
      });
    }

    if (legalPack instanceof File && legalPack.size > 0) {
      if (legalPack.size > MAX_DOCUMENT_BYTES) {
        await cleanupFiles(storedPaths);
        return NextResponse.json({ error: "Legal pack exceeds 20 MB limit." }, { status: 400 });
      }
      if (!isAllowedSellingDocumentMime(legalPack.type)) {
        await cleanupFiles(storedPaths);
        return NextResponse.json({ error: "Legal pack must be a PDF." }, { status: 400 });
      }
      const bytes = Buffer.from(await legalPack.arrayBuffer());
      const key = privateFileKeyForSelling(submissionId, "documents", legalPack.name);
      await savePrivateFile(bytes, key);
      storedPaths.push(key);
      uploadedDocuments.push({
        fileName: legalPack.name,
        storedPath: key,
        fileSize: legalPack.size,
        mimeType: legalPack.type,
        sha256: sha256Hex(bytes),
      });
    }

    /* ---------- Evaluate eligibility ---------- */
    const facts = payload.facts as Record<string, unknown>;
    const eligibilityInput: SellingEligibilityInput = {
      assetType: String(payload.assetType),
      tenancy: String(facts.tenancy),
      guidePrice: Number(payload.guidePrice),
      grossAnnualRent: Number(facts.grossAnnualRent),
      noi: Number(facts.noi),
      flexibleGuidePrice: Boolean(payload.flexibleGuidePrice),
      noCommission: Boolean(payload.noCommission),
    };

    const eligibility = evaluateSellingEligibility(eligibilityInput);

    if (!eligibility.eligible) {
      await cleanupFiles(storedPaths);
      const reasons: SellingRejection[] = eligibility.reasons.map((r) => ({
        code: r.code,
        message: r.message,
      }));
      return NextResponse.json(
        {
          ok: false,
          rejected: true,
          code: "INELIGIBLE",
          message: "This property does not meet the Murivest selling test.",
          metrics: {
            grossYield: eligibility.metrics.grossYield,
            paybackYears: eligibility.metrics.paybackYears,
          },
          reasons,
        },
        { status: 422 }
      );
    }

    /* ---------- Insert into database ---------- */
    const supabase = getSupabaseService();

    const year = new Date().getFullYear();
    const reference = `SELL-${year}-${randomUUID().slice(0, 8).toUpperCase()}`;

    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      req.headers.get("x-real-ip") ??
      null;
    const IP_SALT = process.env.BID_IP_SALT ?? "change-me";
    const ipHash = ip ? createHash("sha256").update(ip + IP_SALT).digest("hex") : null;
    const userAgent = req.headers.get("user-agent") ?? null;

    const { error: insertError } = await supabase.from("selling_submissions").insert({
      reference,
      status: "new",
      qualification_status: "eligible",
      qualification_reasons: [],
      gross_yield: eligibility.metrics.grossYield,
      payback_years: eligibility.metrics.paybackYears,
      seller_name: String(payload.sellerName),
      seller_email: String(payload.sellerEmail),
      seller_phone: String(payload.sellerPhone),
      data: {
        ...payload,
        status: "for-sale-by-auction",
        publishedAt: new Date().toISOString(),
      },
      documents: uploadedDocuments,
      images: uploadedImages,
      ip_hash: ipHash,
      user_agent: userAgent,
    });

    if (insertError) {
      await cleanupFiles(storedPaths);
      console.error("[api/selling] Database insert failed:", insertError);
      return NextResponse.json(
        { error: "Unable to submit the property. Please contact office@murivest.com." },
        { status: 500 }
      );
    }

    await sendNewSellingSubmissionNotification(
      String(payload.sellerEmail),
      String(payload.sellerName),
      reference
    ).catch((err) => {
      console.error("[api/selling] New submission notification failed:", err);
    });

    return NextResponse.json({
      ok: true,
      reference,
      metrics: {
        grossYield: eligibility.metrics.grossYield,
        paybackYears: eligibility.metrics.paybackYears,
      },
    });
  } catch (err) {
    console.error("[api/selling] Unexpected error:", err);
    return NextResponse.json(
      { error: "Unable to submit the property. Please contact office@murivest.com." },
      { status: 500 }
    );
  }
}