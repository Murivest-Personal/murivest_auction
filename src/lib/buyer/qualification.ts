/* ============================================================
   Buyer classification ladder — the 8 stages of buyer
   qualification. Order matters: index increases with progress.
   Data room (vault) access requires "qualified-buyer" or above,
   plus a per-property access grant and an accepted NDA.
   ============================================================ */

export interface ClassificationDef {
  value: string;
  label: string;
  /** One-line explanation shown to the buyer in the portal. */
  description: string;
  /** What Murivest is doing at this stage. */
  action: string;
}

export const BUYER_CLASSIFICATIONS: ClassificationDef[] = [
  {
    value: "unqualified-lead",
    label: "Unqualified lead",
    description:
      "An enquiry captured before registration, or a registration that does not meet Murivest's baseline requirements. No data room access.",
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
      "KYC and funding are verified. You can be authorised to access property data rooms under a confidentiality agreement.",
    action: "Ready for per-property authorisation and NDA release.",
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

/** Minimum classification required for data room access. */
export const VAULT_MIN_CLASSIFICATION = "qualified-buyer";

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

/** True when the classification permits data room access (subject
    to a per-property grant and NDA). */
export function canAccessVault(value: string): boolean {
  return (
    classificationIndex(value) >=
    classificationIndex(VAULT_MIN_CLASSIFICATION)
  );
}
