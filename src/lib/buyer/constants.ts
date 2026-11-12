/* Shared option lists for the buyer registration form and the
   back office. Server-side validation mirrors these lists. */

export const BUYER_TYPES = [
  { value: "individual", label: "Individual buyer" },
  { value: "company", label: "Company / corporate buyer" },
  { value: "family_office", label: "Family office" },
  { value: "institutional", label: "Institutional investor" },
] as const;

export const CORPORATE_BUYER_TYPES = ["company", "family_office", "institutional"];

export const ID_TYPES = [
  { value: "passport", label: "Passport" },
  { value: "national_id", label: "National ID" },
  { value: "company_registration", label: "Company registration number" },
  { value: "tax_pin", label: "Tax PIN / registration" },
] as const;

export const BUDGET_CURRENCIES = ["USD", "GBP", "KES", "EUR"] as const;

export const PREFERRED_COUNTRIES = [
  { value: "kenya", label: "Kenya" },
  { value: "uk", label: "United Kingdom" },
  { value: "both", label: "Both markets" },
] as const;

export const ASSET_CLASSES = [
  "Office",
  "Industrial",
  "Retail",
  "Hospitality",
  "Mixed-Use",
  "Land",
  "Alternative",
] as const;

export const FUNDING_PREFERENCES = [
  { value: "cash", label: "Cash purchase" },
  { value: "financing", label: "Financed purchase" },
  { value: "mixed", label: "Cash + financing" },
] as const;

export const POF_TYPES = [
  { value: "bank_statement", label: "Bank statement / balance letter" },
  { value: "lender_letter", label: "Lender agreement in principle" },
  { value: "other", label: "Other evidence (describe in notes)" },
] as const;

export const ACQUISITION_TIMELINES = [
  { value: "immediate", label: "Immediate — actively bidding now" },
  { value: "within-3-months", label: "Within 3 months" },
  { value: "3-6-months", label: "3–6 months" },
  { value: "6-12-months", label: "6–12 months" },
  { value: "exploring", label: "Exploring / building market knowledge" },
] as const;

/** Country of residence / tax jurisdiction options (KE/UK focus). */
export const COUNTRIES = [
  "Kenya",
  "United Kingdom",
  "South Africa",
  "Nigeria",
  "Tanzania",
  "Uganda",
  "Rwanda",
  "Ethiopia",
  "Ghana",
  "Zambia",
  "Zimbabwe",
  "Botswana",
  "Mozambique",
  "Egypt",
  "Morocco",
  "United Arab Emirates",
  "Saudi Arabia",
  "Qatar",
  "Bahrain",
  "Kuwait",
  "Oman",
  "Turkey",
  "Israel",
  "India",
  "Pakistan",
  "Bangladesh",
  "Sri Lanka",
  "Singapore",
  "Malaysia",
  "Indonesia",
  "Thailand",
  "China",
  "Hong Kong",
  "Japan",
  "South Korea",
  "Australia",
  "New Zealand",
  "United States",
  "Canada",
  "Ireland",
  "France",
  "Germany",
  "Netherlands",
  "Belgium",
  "Luxembourg",
  "Switzerland",
  "Austria",
  "Spain",
  "Portugal",
  "Italy",
  "Greece",
  "Cyprus",
  "Malta",
  "Sweden",
  "Norway",
  "Denmark",
  "Finland",
  "Poland",
  "Czech Republic",
  "Romania",
  "Other",
] as const;

export const BUYER_TERMS_VERSION = "buyer-registration-v1";

export const BUYER_TERMS_TEXT =
  "I confirm the information provided is accurate, I accept the Terms of Service and Privacy Policy, and I consent to Murivest verifying my identity, beneficial ownership and funding evidence as part of buyer qualification. I understand that data room access requires qualification, per-property authorisation and a confidentiality agreement.";
