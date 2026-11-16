export const COMMERCIAL_ASSET_TYPES = [
  "Office",
  "Industrial",
  "Retail",
  "Hospitality",
  "Mixed-Use",
  "Alternative",
] as const;

export const SELLING_CRITERIA = [
  {
    key: "commercial_income",
    label: "Commercial property with income",
    description: "Office, industrial, retail, hospitality, mixed-use or alternative commercial asset; tenanted and producing income, not vacant land.",
  },
  {
    key: "gross_yield",
    label: "Gross yield above 12%",
    description: "Gross annual rent divided by the guide price.",
  },
  {
    key: "payback",
    label: "Payback in 6–7 years",
    description: "Guide price divided by gross annual rent.",
  },
  {
    key: "flexible_guide",
    label: "Flexible guide price",
    description: "Seller accepts Murivest's recommended guide range.",
  },
  {
    key: "no_commission",
    label: "No commission payable to Murivest",
    description: "Seller confirms no commission is payable to Murivest.",
  },
] as const;

export type SellingMetrics = {
  grossYield: number | null;
  paybackYears: number | null;
};

export type SellingEligibilityInput = {
  assetType: string;
  tenancy: string;
  guidePrice: number;
  grossAnnualRent: number;
  noi: number;
  flexibleGuidePrice: boolean;
  noCommission: boolean;
};

export type SellingRejection = {
  code:
    | "NOT_COMMERCIAL"
    | "NO_INCOME"
    | "GROSS_YIELD"
    | "PAYBACK"
    | "COMMISSION"
    | "FLEXIBLE_GUIDE"
    | "MISSING_METRICS";
  message: string;
};

export function evaluateSellingEligibility(input: SellingEligibilityInput): {
  eligible: boolean;
  metrics: SellingMetrics;
  reasons: SellingRejection[];
} {
  const reasons: SellingRejection[] = [];

  const hasValidMetrics =
    Number.isFinite(input.guidePrice) &&
    input.guidePrice > 0 &&
    Number.isFinite(input.grossAnnualRent) &&
    input.grossAnnualRent > 0 &&
    Number.isFinite(input.noi) &&
    input.noi > 0;

  if (!hasValidMetrics) {
    reasons.push({
      code: "MISSING_METRICS",
      message:
        "Guide price, gross annual rent and NOI must be positive numbers.",
    });
  }

  if (
    input.assetType === "Land" ||
    !COMMERCIAL_ASSET_TYPES.includes(input.assetType as typeof COMMERCIAL_ASSET_TYPES[number])
  ) {
    reasons.push({
      code: "NOT_COMMERCIAL",
      message:
        "The asset type must be a commercial property (Office, Industrial, Retail, Hospitality, Mixed-Use or Alternative). Land is not accepted.",
    });
  }

  if (
    input.tenancy === "Vacant" ||
    !Number.isFinite(input.grossAnnualRent) ||
    input.grossAnnualRent <= 0 ||
    !Number.isFinite(input.noi) ||
    input.noi <= 0
  ) {
    reasons.push({
      code: "NO_INCOME",
      message:
        "The property must be tenanted and producing income. Vacant properties or those with no rental income are not accepted.",
    });
  }

  if (hasValidMetrics) {
    const grossYield = (input.grossAnnualRent / input.guidePrice) * 100;
    const paybackYears = input.guidePrice / input.grossAnnualRent;

    if (grossYield <= 12) {
      reasons.push({
        code: "GROSS_YIELD",
        message: `Gross yield is ${grossYield.toFixed(2)}%. Murivest requires above 12%.`,
      });
    }

    if (paybackYears < 6 || paybackYears > 7) {
      reasons.push({
        code: "PAYBACK",
        message: `Payback is ${paybackYears.toFixed(2)} years. Murivest requires 6–7 years.`,
      });
    }
  }

  if (!input.flexibleGuidePrice) {
    reasons.push({
      code: "FLEXIBLE_GUIDE",
      message: "Seller must accept a flexible guide price recommended by Murivest.",
    });
  }

  if (!input.noCommission) {
    reasons.push({
      code: "COMMISSION",
      message: "Seller must confirm no commission is payable to Murivest.",
    });
  }

  const metrics: SellingMetrics = hasValidMetrics
    ? {
        grossYield: Math.round((input.grossAnnualRent / input.guidePrice) * 100 * 100) / 100,
        paybackYears: Math.round((input.guidePrice / input.grossAnnualRent) * 100) / 100,
      }
    : {
        grossYield: null,
        paybackYears: null,
      };

  return {
    eligible: reasons.length === 0,
    metrics,
    reasons,
  };
}