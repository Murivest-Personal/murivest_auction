/* ============================================================
   Buyer classification ladder — the 8 stages of buyer
   qualification. Order matters: index increases with progress.
   Detailed transaction documentation is released to qualified
   buyers on request, under appropriate confidentiality and
   mandate arrangements.
   ============================================================ */

export interface ClassificationDef {
  value: string;
  label: string;
  /** One-line explanation shown to the buyer on their profile. */
  description: string;
  /** What Murivest is doing at this stage. */
  action: string;
}

export const BUYER_CLASSIFICATIONS: ClassificationDef[] = [
  {
    value: "unqualified-lead",
    label: "Unqualified lead",
    description:
      "An enquiry captured before registration, or a registration that does not meet Murivest's baseline requirements.",
    action: "Capture requirements and re-engage when circumstances change.",
  },
  {
    value: "registration-pending",
    label: "Registration pending",
    description:
      "Your registration has been received and is being reviewed by the Murivest team. This is the default status on submission.",
    action: "Reviewing your registration details and identification.",
  },
  {
    value: "kyc-pending",
    label: "KYC pending",
    description:
      "Registration reviewed. Identity, corporate and beneficial-ownership verification (KYC) is now underway.",
    action: "Verifying identity documents and beneficial ownership.",
  },
  {
    value: "kyc-verified",
    label: "KYC verified",
    description:
      "Identity and beneficial ownership are verified. Funding verification is the remaining step before qualification.",
    action: "Awaiting or reviewing proof of funds / lender evidence.",
  },
  {
    value: "funding-verification-pending",
    label: "Funding verification pending",
    description:
      "KYC is complete. Your proof of funds or lender evidence is being verified against the market and asset class.",
    action: "Verifying funding evidence with the source institution.",
  },
  {
    value: "qualified-buyer",
    label: "Qualified buyer",
    description:
      "KYC and funding are verified. Detailed transaction documentation can be released to you on a lot, under appropriate confidentiality and mandate arrangements.",
    action: "Ready for documentation release and lot-level support.",
  },
  {
    value: "mandated-buyer",
    label: "Mandated buyer",
    description:
      "A signed buyer-representation mandate is in place. Murivest is managing your acquisition end to end.",
    action: "Managing the acquisition under mandate.",
  },
  {
    value: "transaction-in-progress",
    label: "Transaction in progress",
    description:
      "An acquisition is underway — bidding, contracting or completion — on one or more lots.",
    action: "Coordinating the transaction through to completion.",
  },
];

export const DEFAULT_CLASSIFICATION = "registration-pending";

export function classificationIndex(value: string): number {
  return BUYER_CLASSIFICATIONS.findIndex((c) => c.value === value);
}

export function classificationDef(value: string): ClassificationDef {
  return (
    BUYER_CLASSIFICATIONS[classificationIndex(value)] ??
    BUYER_CLASSIFICATIONS[1]
  );
}

export function classificationLabel(value: string): string {
  return classificationDef(value).label;
}

export function isValidClassification(value: string): boolean {
  return classificationIndex(value) >= 0;
}
