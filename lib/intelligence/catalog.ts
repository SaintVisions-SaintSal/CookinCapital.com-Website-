/**
 * Presentation catalog: groups the 18 verified screens into investor-facing
 * categories, and exposes the subset of the verified PropertyRadar criteria
 * catalog that the Screener's criteria builder is allowed to construct.
 *
 * Every criterion named here is present in VALID_CRITERIA in
 * ./propertyradar.ts (live-verified, 192-criterion catalog). Nothing here is
 * speculative.
 */

import { FIPS } from "./propertyradar";
import { SCREENS } from "./screens";

export type ScreenCategory =
  | "Foreclosure"
  | "Life Event"
  | "Equity"
  | "Listing"
  | "Investment";

export const SCREEN_CATEGORY: Readonly<Record<string, ScreenCategory>> = {
  fresh_nod_high_equity: "Foreclosure",
  trustee_sale_window: "Foreclosure",
  bank_owned_reo: "Foreclosure",
  auction_deep_discount: "Foreclosure",
  deceased_probate: "Life Event",
  probate_inherited: "Life Event",
  divorce_driven_sale: "Life Event",
  bankruptcy_distress: "Life Event",
  eviction_stressed_landlord: "Life Event",
  absentee_high_equity_sfr: "Equity",
  vacant_high_equity: "Equity",
  free_and_clear_long_hold: "Equity",
  tax_lien_distress: "Equity",
  expired_withdrawn_listing: "Listing",
  predictive_pre_listing: "Listing",
  tired_landlord_small_multi: "Investment",
  fix_and_flip_candidate: "Investment",
  commercial_industrial_equity: "Investment",
};

export const CATEGORY_ORDER: ScreenCategory[] = [
  "Foreclosure",
  "Life Event",
  "Equity",
  "Listing",
  "Investment",
];

export function screenCategory(key: string): ScreenCategory {
  return SCREEN_CATEGORY[key] ?? "Investment";
}

export function screenMetaList() {
  return SCREENS.map((s) => ({
    key: s.key,
    title: s.title,
    category: screenCategory(s.key),
    thesis: s.thesis,
    loanProduct: s.loanProduct,
    county: FIPS["CA:Orange"]!,
  }));
}

// ───────────────────────────────────────────────────────────────────
// County picker — CA / AZ / TX / NV / FL, grouped by state
// ───────────────────────────────────────────────────────────────────

export interface CountyOption {
  key: string;
  state: string;
  county: string;
  fips: number;
}

export const COUNTY_OPTIONS: CountyOption[] = Object.entries(FIPS).map(
  ([key, fips]) => {
    const [state, county] = key.split(":");
    return {
      key,
      state: state!,
      county: (county ?? "").replace(/-(CA|AZ|TX|NV|FL)$/, ""),
      fips: fips as number,
    };
  }
);

export const STATE_ORDER = ["CA", "AZ", "TX", "NV", "FL"];

// ───────────────────────────────────────────────────────────────────
// Foreclosure stages — verbatim enum values accepted by the live API
// ───────────────────────────────────────────────────────────────────

export const FORECLOSURE_STAGES: Array<{ value: string; label: string; severity: number }> = [
  { value: "Preforeclosure", label: "Preforeclosure (NOD)", severity: 4 },
  { value: "Preforeclosure-NTS", label: "Preforeclosure — Notice of Trustee Sale", severity: 6 },
  { value: "Preforeclosure-Old", label: "Preforeclosure — aged", severity: 2 },
  { value: "Preforeclosure-Released", label: "Preforeclosure — released", severity: 1 },
  { value: "Preforeclosure-Sold", label: "Preforeclosure — sold", severity: 3 },
  { value: "Auction", label: "Auction — scheduled", severity: 9 },
  { value: "Auction-UNK", label: "Auction — date unknown", severity: 6 },
  { value: "Auction-Old", label: "Auction — aged", severity: 7 },
  { value: "Sale Pending", label: "Sale pending", severity: 5 },
  { value: "Bank Owned", label: "Bank owned (REO)", severity: 8 },
  { value: "Bank Owned-Held", label: "Bank owned — held", severity: 8 },
  { value: "Bank Owned-Rescinded", label: "Bank owned — rescinded", severity: 5 },
  { value: "3rd Owned", label: "3rd-party owned", severity: 6 },
  { value: "3rd Owned-Held", label: "3rd-party owned — held", severity: 6 },
  { value: "Released", label: "Released", severity: 1 },
  { value: "Cancelled", label: "Cancelled", severity: 1 },
];

export const PROPERTY_TYPES: Array<{ value: string; label: string }> = [
  { value: "SFR", label: "Single family" },
  { value: "CND", label: "Condo" },
  { value: "MFR", label: "Multi-family" },
  { value: "MBL", label: "Mobile / manufactured" },
  { value: "LND", label: "Land" },
  { value: "COM", label: "Commercial" },
  { value: "IND", label: "Industrial" },
  { value: "APT", label: "Apartment" },
  { value: "OTH", label: "Other" },
];

/** Boolean distress criteria the builder may toggle. All live-verified. */
export const DISTRESS_TOGGLES: Array<{ name: string; label: string; hint: string }> = [
  { name: "isSiteVacant", label: "Site vacant", hint: "USPS-confirmed vacancy at the property" },
  { name: "isMailVacant", label: "Mail vacant", hint: "USPS-confirmed vacancy at owner's mailing address" },
  { name: "isDeceased", label: "Owner deceased", hint: "Owner of record flagged deceased" },
  { name: "inProbateProperty", label: "In probate", hint: "Confirmed probate filing on the property" },
  { name: "inTaxDelinquency", label: "Tax delinquent", hint: "Delinquent property-tax balance on record" },
  { name: "inBankruptcy", label: "In bankruptcy", hint: "Active bankruptcy filing" },
  { name: "inDivorce", label: "In divorce", hint: "Active divorce filing" },
  { name: "PropertyHasOpenLiens", label: "Open liens", hint: "Open involuntary lien against the property" },
];

/** Contactability criteria. */
export const CONTACT_TOGGLES: Array<{ name: string; label: string; hint: string }> = [
  { name: "hasOwnerPhone", label: "Phone on file", hint: "PropertyRadar can append an owner phone number" },
  { name: "hasOwnerMobilePhone", label: "Mobile on file", hint: "Mobile number specifically — required for SMS" },
  { name: "hasOwnerEmail", label: "Email on file", hint: "PropertyRadar can append an owner email" },
];

/** Ownership / occupancy criteria. */
export const OCCUPANCY_OPTIONS: Array<{ value: string; label: string }> = [
  { value: "any", label: "Any occupancy" },
  { value: "absentee", label: "Absentee (non-owner-occupied)" },
  { value: "owner", label: "Owner-occupied" },
];
