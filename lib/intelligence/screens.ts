/**
 * CookinCapital lead-sourcing screens — 18 named, ready-to-run
 * PropertyRadar Criteria factories.
 *
 * Every screen uses ONLY criteria confirmed live against production
 * (see /home/user/workspace/research/VERIFIED_API_FINDINGS.md, the
 * "192 criteria re-validated" section). Each screen documents the investor
 * thesis and the CookinCapital loan product it feeds.
 *
 * All screens accept an optional `ScreenOptions.county` (FIPS int, defaults
 * to Orange County 6059) and an optional `contactable` flag. When
 * `contactable` is true, the screen ANDs in `hasOwnerPhone=1` (or
 * `hasOwnerMobilePhone=1` if `mobileOnly` is set) so results are
 * pre-filtered to leads PropertyRadar can actually append a phone number
 * for — useful once you're ready to move from counting to calling.
 */

import { CriteriaBuilder, criteria, type CriteriaEntry, FIPS } from "./propertyradar";

export const DEFAULT_COUNTY_FIPS = FIPS["CA:Orange"]!;

export interface ScreenOptions {
  /** FIPS county code. Defaults to Orange County, CA (6059). */
  county?: number;
  /** AND in a contactability filter (owner phone on file). */
  contactable?: boolean;
  /** When contactable=true, require mobile phone specifically. */
  mobileOnly?: boolean;
}

/** Applies the shared County + optional contactability filter to a builder. */
function withCommonFilters(b: CriteriaBuilder, opts: ScreenOptions): CriteriaBuilder {
  b.eq("County", [opts.county ?? DEFAULT_COUNTY_FIPS]);
  if (opts.contactable) {
    b.bool(opts.mobileOnly ? "hasOwnerMobilePhone" : "hasOwnerPhone", 1);
  }
  return b;
}

export interface Screen {
  key: string;
  title: string;
  thesis: string;
  loanProduct: string;
  build: (opts?: ScreenOptions) => CriteriaEntry[];
}

// ---------------------------------------------------------------------------
// 1. Fresh NOD last 30 days, high equity
// ---------------------------------------------------------------------------
export const freshNodHighEquity: Screen = {
  key: "fresh_nod_high_equity",
  title: "Fresh NOD (last 30 days) + high equity",
  thesis:
    "Owners who just received a Notice of Default are under acute time pressure but still sit on substantial equity — the highest-intent, highest-margin distress segment. They need to sell or refinance fast, and a private bridge loan can stop the foreclosure clock while a sale or refi is arranged.",
  loanProduct: "CookinCapital Bridge / Fix-and-Flip Rescue Loan — fast close to cure default before a Notice of Trustee Sale is recorded.",
  build: (opts = {}) => {
    // NOTE (live-verified fix, 2026-08-03): the original version of this
    // screen combined ForeclosureStage=[Preforeclosure,Preforeclosure-NTS] +
    // a bare relativeDays("ForeclosureRecDate", 30) integer form + a 40-100
    // equity band, which returned only 1 match in Orange County. Root cause:
    // `ForeclosureRecDate` hits the SAME silent-empty-response quirk as
    // `LastTransferRecDate` — the bare -N integer form for THIS field
    // silently drops rows even at N=30/45 (confirmed by direct probing:
    // `-30` and `-45` both returned `{results:[]}` with no totalResultCount,
    // while the preset string `"Last 45 Days"` correctly returned a count).
    // It was NOT an over-constraint of ForeclosureStage + equity —
    // `inForeclosure=1` alone is 884 and adding `"Last 45 Days"` narrows to
    // 192, which is exactly the plausible range. Fixed by switching to
    // `inForeclosure=1` (broader than the two Preforeclosure sub-stages,
    // matching the correction brief) + `relativePreset(..., "Last 45 Days")`
    // + a wider 25-100 equity band per the correction brief.
    return withCommonFilters(criteria(), opts)
      .bool("inForeclosure", 1)
      .relativePreset("ForeclosureRecDate", "Last 45 Days")
      .range("EquityPercent", 25, 100)
      .build();
  },
};

// ---------------------------------------------------------------------------
// 2. Trustee sale within window / Auction stage
// ---------------------------------------------------------------------------
export const trusteeSaleWindow: Screen = {
  key: "trustee_sale_window",
  title: "Auction / trustee sale stage",
  thesis:
    "Properties already scheduled for a trustee sale represent the last-call segment — owners have days, not months, to act. Auction-stage deals with a discounted opening bid relative to AVM are also prime targets for CookinCapital's own auction-purchase financing.",
  loanProduct: "CookinCapital Hard Money Auction Purchase Loan — funds close within days to bid at or buy out of trustee sale.",
  build: (opts = {}) =>
    withCommonFilters(criteria(), opts)
      .eq("ForeclosureStage", ["Auction", "Auction-Old", "Auction-UNK"])
      .build(),
};

// ---------------------------------------------------------------------------
// 3. Bank Owned / REO
// ---------------------------------------------------------------------------
export const bankOwnedReo: Screen = {
  key: "bank_owned_reo",
  title: "Bank Owned / REO inventory",
  thesis:
    "Lender-owned REO properties are motivated institutional sellers looking to offload non-performing assets quickly, often below market, and are excellent fix-and-flip acquisition targets once relisted or sold via broker.",
  loanProduct: "CookinCapital Fix-and-Flip Acquisition + Rehab Loan — fund REO purchase plus renovation budget.",
  build: (opts = {}) =>
    withCommonFilters(criteria(), opts)
      .eq("ForeclosureStage", ["Bank Owned", "Bank Owned-Held", "Bank Owned-Rescinded"])
      .build(),
};

// ---------------------------------------------------------------------------
// 4. Absentee owner high equity SFR
// ---------------------------------------------------------------------------
export const absenteeHighEquitySfr: Screen = {
  key: "absentee_high_equity_sfr",
  title: "Absentee owner, high equity, SFR",
  thesis:
    "Non-owner-occupied single-family owners with large equity cushions are classic cash-out refinance or portfolio-sale candidates — landlords who may want to 1031 exchange, retire from the rental business, or tap equity for another acquisition.",
  loanProduct: "CookinCapital Cash-Out DSCR Refinance — equity-based refi for absentee rental owners.",
  // NOTE (tightened, 2026-08-03): the original 50-100 equity band alone
  // returned 117,058 matches in Orange County — far too broad to act as a
  // lead list. Added a value floor (AVM >= $1.5M), a mobile-phone
  // contactability requirement, a near-max equity band (99-100), and a
  // portfolio-size signal (NumberPropertiesOwned >= 3) to isolate genuinely
  // actionable, well-capitalized absentee-investor equity, landing at 2,567
  // live matches — squarely in the 200-5,000 workable range.
  build: (opts = {}) =>
    withCommonFilters(criteria(), opts)
      .bool("isSameMailingOrExempt", 0)
      .range("EquityPercent", 99, 100)
      .propertyType("SFR")
      .bool("hasOwnerMobilePhone", 1)
      .range("AVM", 1_500_000, null)
      .range("NumberPropertiesOwned", 3, null)
      .build(),
};

// ---------------------------------------------------------------------------
// 5. Vacant + high equity (site or mail vacant)
// ---------------------------------------------------------------------------
export const vacantHighEquity: Screen = {
  key: "vacant_high_equity",
  title: "Vacant property + high equity",
  thesis:
    "USPS-confirmed vacancy (at the site or the owner's mailing address) combined with high equity flags a property that is likely a burden to its owner — no tenant income, no one checking in — and a strong off-market acquisition or bridge-refi candidate before it becomes a code-enforcement or neglect problem.",
  loanProduct: "CookinCapital Bridge Acquisition Loan — fast off-market purchase of vacant distressed equity.",
  build: (opts = {}) => {
    const b = withCommonFilters(criteria(), opts).range("EquityPercent", 40, 100);
    // isSiteVacant OR isMailVacant is expressed as two screens ORed at the
    // pipeline layer; here we default to isSiteVacant (the stronger vacancy
    // signal) and expose isMailVacant via `.raw` for callers who want it.
    b.bool("isSiteVacant", 1);
    return b.build();
  },
};

/** Variant of vacantHighEquity using the mailing-address vacancy signal instead of site vacancy. */
export function vacantMailHighEquity(opts: ScreenOptions = {}): CriteriaEntry[] {
  return withCommonFilters(criteria(), opts)
    .range("EquityPercent", 40, 100)
    .bool("isMailVacant", 1)
    .build();
}

// ---------------------------------------------------------------------------
// 6. Deceased owner / probate-proxy
// ---------------------------------------------------------------------------
// NOTE (split + tightened, 2026-08-03): this screen previously conflated
// the broad `isDeceased` owner-of-record proxy with the much narrower,
// confirmed `inProbateProperty` filing signal under one "deceased_probate"
// key, and used isDeceased alone (61,685 matches — unusably broad). Per the
// correction brief these must NOT be conflated: `deceased_probate` below is
// now the isDeceased PROXY screen ONLY (tightened with equity/value/contact
// filters down to a workable population), while `probateInherited` (#13,
// unchanged, 327 matches) remains the dedicated CONFIRMED-filing screen.
export const deceasedProbate: Screen = {
  key: "deceased_probate",
  title: "Deceased owner (proxy, unconfirmed probate)",
  thesis:
    "Properties with a deceased owner of record (isDeceased) are likely headed for probate or an heir sale even before a court filing is public — an earlier, higher-volume signal than confirmed probate. This is a PROXY: not every isDeceased record is in active probate. Tightened with equity, value, and contactability filters so the list stays workable; use `probateInherited` (#13) instead when you need only confirmed, court-filed probate cases.",
  loanProduct: "CookinCapital Probate Bridge Loan — advances against inherited equity while estate settles, or funds heir buyout.",
  build: (opts = {}) =>
    withCommonFilters(criteria(), opts)
      .bool("isDeceased", 1)
      .bool("hasOwnerMobilePhone", 1)
      .range("EquityPercent", 97, 100)
      .range("AVM", 1_300_000, null)
      .build(),
};

/** Tighter probate-confirmed variant (inProbateProperty=1) rather than the broader isDeceased proxy. */
export function probateConfirmed(opts: ScreenOptions = {}): CriteriaEntry[] {
  return withCommonFilters(criteria(), opts).bool("inProbateProperty", 1).build();
}

// ---------------------------------------------------------------------------
// 7. Tired landlord small multifamily 2-4 units
// ---------------------------------------------------------------------------
export const tiredLandlordSmallMulti: Screen = {
  key: "tired_landlord_small_multi",
  title: "Tired landlord — small multifamily (2-4 units)",
  thesis:
    "Small multifamily owners who bought long ago (old LastTransferRecDate), don't live on-site, and are not actively refinancing often become 'tired landlords' worn down by tenant management — ripe for a portfolio cash-out refi or a sale to a new investor buyer that CookinCapital can finance.",
  loanProduct: "CookinCapital DSCR Rental Loan — refinance or acquisition financing for 2-4 unit rental property.",
  build: (opts = {}) =>
    withCommonFilters(criteria(), opts)
      .range("Units", 2, 4)
      .bool("isSameMailingOrExempt", 0)
      // Long-hold proxy: owned since before 2016 (10+ years). The bare -N
      // relativeDays() integer form is only verified reliable up to ~150
      // days on this account (beyond that it silently returns zero results
      // with no totalResultCount) — so a 10-year lookback must use the
      // explicit "from/to" range string form instead, which is confirmed to
      // work correctly for multi-year windows.
      .relativeRange("LastTransferRecDate", "1/1/1900", "1/1/2016")
      .build(),
};

// ---------------------------------------------------------------------------
// 8. Free & clear long-hold (TotalLoanBalance 0-1000 + high equity)
// ---------------------------------------------------------------------------
export const freeAndClearLongHold: Screen = {
  key: "free_and_clear_long_hold",
  title: "Free & clear, long-hold",
  thesis:
    "Properties with essentially no recorded loan balance are owned outright — these owners have maximum refinance flexibility and are the best-qualified segment for a cash-out loan since there's no existing lien to pay off or subordinate to.",
  loanProduct: "CookinCapital First-Position Cash-Out Loan — max leverage available since no existing lien.",
  // NOTE (tightened, 2026-08-03): the original TotalLoanBalance 0-1000 +
  // EquityPercent 70-100 combo returned 374,522 matches — essentially every
  // long-paid-off SFR in the county. Added a near-max equity floor
  // (99-100), a $1.5M value floor, a pre-1985 hold-length proxy (via
  // relativeRange on LastTransferRecDate, confirmed safe for multi-decade
  // windows per the relative-date-ceiling fix above), SFR-only, and a
  // mobile-phone contactability requirement, landing at 1,852 live matches.
  build: (opts = {}) =>
    withCommonFilters(criteria(), opts)
      .range("TotalLoanBalance", 0, 1000)
      .range("EquityPercent", 99, 100)
      .bool("hasOwnerMobilePhone", 1)
      .range("AVM", 1_500_000, null)
      .relativeRange("LastTransferRecDate", "1/1/1900", "1/1/1985")
      .propertyType("SFR")
      .build(),
};

// ---------------------------------------------------------------------------
// 9. Expired / withdrawn listing
// ---------------------------------------------------------------------------
export const expiredWithdrawnListing: Screen = {
  key: "expired_withdrawn_listing",
  title: "Expired or withdrawn MLS listing",
  thesis:
    "An owner who tried to sell and failed (expired or withdrawn listing) is pre-qualified as a motivated seller who may now be open to an off-market cash offer or a bridge loan to reposition/renovate the property before relisting.",
  loanProduct: "CookinCapital Fix-and-Flip Reposition Loan — fund renovation to relist at a higher price point after a failed listing.",
  build: (opts = {}) =>
    withCommonFilters(criteria(), opts)
      .eq("ListingStatus", ["Expired", "Withdrawn"])
      .build(),
};

// ---------------------------------------------------------------------------
// 10. Tax / lien distress
// ---------------------------------------------------------------------------
export const taxLienDistress: Screen = {
  key: "tax_lien_distress",
  title: "Tax delinquency / lien distress",
  thesis:
    "Owners carrying meaningful delinquent property tax balances or open involuntary liens are under mounting financial pressure that compounds over time (penalties, interest, eventual tax sale) — an urgent-but-not-yet-foreclosure segment where a rescue loan can pay off liens and stop the clock.",
  loanProduct: "CookinCapital Lien Payoff / Tax Rescue Bridge Loan — clears delinquent taxes and liens at closing.",
  build: (opts = {}) =>
    withCommonFilters(criteria(), opts)
      .range("DelinquentAmount", 5000, null)
      .build(),
};

/** Variant keyed on open involuntary property liens rather than tax delinquency. */
export function openLienDistress(opts: ScreenOptions = {}): CriteriaEntry[] {
  return withCommonFilters(criteria(), opts)
    .bool("PropertyHasOpenLiens", 1)
    .range("LienAmount", 5000, null)
    .build();
}

// ---------------------------------------------------------------------------
// 11. Fix-and-flip candidate (pre-1980, below-median AVM/sqft proxy)
// ---------------------------------------------------------------------------
export const fixAndFlipCandidate: Screen = {
  key: "fix_and_flip_candidate",
  title: "Fix-and-flip candidate (pre-1980 SFR, low value/SqFt)",
  thesis:
    "Older housing stock (built before 1980) with a below-market AVM-per-square-foot signal is likely to be dated or deferred-maintenance inventory — the bread-and-butter acquisition profile for a fix-and-flip investor, independent of any distress signal.",
  loanProduct: "CookinCapital Fix-and-Flip Acquisition + Rehab Loan.",
  build: (opts = {}) =>
    withCommonFilters(criteria(), opts)
      .range("YearBuilt", null, 1980)
      .propertyType("SFR")
      .range("ValuePerSF", null, 350) // below-median $/SqFt proxy for OC; tune per market
      .build(),
};

// ---------------------------------------------------------------------------
// 12. Commercial / industrial equity
// ---------------------------------------------------------------------------
export const commercialIndustrialEquity: Screen = {
  key: "commercial_industrial_equity",
  title: "Commercial / industrial, high equity",
  thesis:
    "Commercial and industrial parcels with substantial equity are candidates for owner-occupant bridge refinancing or acquisition financing for value-add investors moving up from residential — a distinct, higher-loan-size product line.",
  loanProduct: "CookinCapital Commercial Bridge Loan — non-owner-occupied commercial/industrial acquisition or refinance.",
  // NOTE (tightened, 2026-08-03): the original 40-100 equity band alone
  // returned 33,648 matches. Added a contactability filter and a $1.5M
  // value floor with a tighter 70-100 equity band, landing at 1,508 live
  // matches — a workable, high-loan-size shortlist.
  build: (opts = {}) =>
    withCommonFilters(criteria(), opts)
      .propertyType("COM", "IND")
      .range("EquityPercent", 70, 100)
      .bool("hasOwnerPhone", 1)
      .range("AVM", 1_500_000, null)
      .build(),
};

// ---------------------------------------------------------------------------
// 13. Probate / inherited property (dedicated screen, distinct from #6 proxy)
// ---------------------------------------------------------------------------
export const probateInherited: Screen = {
  key: "probate_inherited",
  title: "Probate / inherited property (confirmed filing)",
  thesis:
    "A confirmed probate filing (inProbateProperty=1) — as opposed to the broader isDeceased proxy — pinpoints estates actively moving through court-supervised administration right now. Heirs in this window are the most receptive to a fast cash close or a bridge loan to buy out co-heirs.",
  loanProduct: "CookinCapital Probate Bridge / Heir Buyout Loan — funds one heir to buy out co-heirs before court-ordered sale.",
  build: (opts = {}) =>
    withCommonFilters(criteria(), opts)
      .bool("inProbateProperty", 1)
      .build(),
};

// ---------------------------------------------------------------------------
// 14. Divorce-driven sale
// ---------------------------------------------------------------------------
export const divorceDrivenSale: Screen = {
  key: "divorce_driven_sale",
  title: "Divorce-driven sale",
  thesis:
    "Divorce filings (inDivorce=1) frequently force a fast, equitable liquidation of the marital home regardless of market timing. These sellers value speed and certainty of close over maximizing price — ideal for a cash offer backed by CookinCapital bridge capital.",
  loanProduct: "CookinCapital Bridge Acquisition Loan — fast, certain close for court-driven marital-home sales.",
  build: (opts = {}) =>
    withCommonFilters(criteria(), opts).bool("inDivorce", 1).build(),
};

// ---------------------------------------------------------------------------
// 15. Bankruptcy Ch. 7/13
// ---------------------------------------------------------------------------
export const bankruptcyDistress: Screen = {
  key: "bankruptcy_distress",
  title: "Bankruptcy (Chapter 7 / 13)",
  thesis:
    "Owners in active Chapter 7 (liquidation) or Chapter 13 (reorganization) bankruptcy often need trustee-approved short sales or refinances to satisfy creditors. This is a compliance-sensitive but high-motivation segment requiring careful coordination with the bankruptcy trustee.",
  loanProduct: "CookinCapital Bankruptcy-Compliant Bridge Loan — structured to satisfy trustee/court sale requirements.",
  build: (opts = {}) =>
    withCommonFilters(criteria(), opts)
      .bool("inBankruptcy", 1)
      .eq("BankruptcyChapter", ["7", "13"])
      .build(),
};

// ---------------------------------------------------------------------------
// 16. Eviction-stressed landlord
// ---------------------------------------------------------------------------
export const evictionStressedLandlord: Screen = {
  key: "eviction_stressed_landlord",
  title: "Eviction-stressed landlord",
  thesis:
    "A landlord who has filed a recent eviction is dealing with the direct cost and hassle of a non-paying tenant. Combined with absentee ownership, this often signals a landlord who would rather sell or refinance out of an underperforming rental than continue managing it.",
  loanProduct: "CookinCapital DSCR Refinance or Bridge Sale-Assist Loan — exit or refinance an underperforming rental mid-eviction.",
  build: (opts = {}) => {
    // NOTE (live-verified quirk, 2026-08-03): on this account,
    // `hasRecentEviction=[1]` silently returns `{results: []}` with NO
    // `totalResultCount` (not an error — just an empty/uncounted response),
    // even though `hasRecentEviction` is a confirmed-valid criterion name.
    // `EvictionFilingDate` (Relative Date type) DOES return a proper count
    // for the same underlying signal, so this screen uses that instead.
    return withCommonFilters(criteria(), opts)
      .relativePreset("EvictionFilingDate", "Last 365 Days")
      .bool("isSameMailingOrExempt", 0)
      .build();
  },
};

// ---------------------------------------------------------------------------
// 17. Auction with opening bid well below AVM
// ---------------------------------------------------------------------------
// NOTE: OpeningBidDividedByAVM / OpeningBid / WinningBid / PublishedBidDividedByAVM
// are documented "Multiple Range" criteria, but live-probing this account
// returned 400 "The feature [Trustee Sale Tracking] is not included in your
// current subscription plan" for OpeningBidDividedByAVM specifically (see
// PLAN_GATED_CRITERIA in clients/propertyradar.ts). This screen therefore
// targets the Auction ForeclosureStage alone as the best available proxy on
// this account, and documents the ideal filter for accounts with Trustee
// Sale Tracking enabled.
export const auctionDeepDiscount: Screen = {
  key: "auction_deep_discount",
  title: "Auction — deep-discount trustee sale (Trustee Sale Tracking add-on ready)",
  thesis:
    "Trustee-sale properties where the published opening bid is priced well below the automated valuation represent the deepest embedded-equity spread available at auction — the highest-margin acquisition targets for an investor willing to bid, financed by same-day hard money. This account does not currently have the Trustee Sale Tracking add-on, so `OpeningBidDividedByAVM` AND `PublishedBidDividedByAVM` are both plan-gated (confirmed via live 400 'Upgrade Required' for the OpeningBid family). This screen instead uses an AVM-vs-loan-balance spread proxy — ForeclosureStage=Auction PLUS EquityPercent>=50 — reasoning that a large embedded-equity cushion at auction correlates with a wide gap between the likely opening bid (tied to the defaulted loan balance) and current market value, which is directionally the same signal OpeningBidDividedByAVM would capture directly. This is ready to swap for `.range(\"OpeningBidDividedByAVM\", null, 0.7)` (or `PublishedBidDividedByAVM`) the moment the add-on is purchased — do not remove the EquityPercent filter when that happens, stack both for the tightest targeting.",
  loanProduct: "CookinCapital Hard Money Auction Purchase Loan — same-day funds to bid on deep-discount trustee sales.",
  // NOTE (tightened + made distinct from trustee_sale_window, 2026-08-03):
  // previously identical to trustee_sale_window (846 = 846), which defeats
  // the point of having two screens. Adding EquityPercent>=50 as the
  // AVM-vs-loan-balance proxy narrows this to 632 live matches — a proper
  // subset of trustee_sale_window's 846, representing the auction
  // properties with the deepest apparent equity spread.
  build: (opts = {}) =>
    withCommonFilters(criteria(), opts)
      .eq("ForeclosureStage", ["Auction", "Auction-Old", "Auction-UNK"])
      .range("EquityPercent", 50, 100)
      .build(),
};

// ---------------------------------------------------------------------------
// 18. Predictive pre-listing (high LikelyListingScore + high equity)
// ---------------------------------------------------------------------------
export const predictivePreListing: Screen = {
  key: "predictive_pre_listing",
  title: "Predictive pre-listing (high LikelyListingScore + high equity)",
  thesis:
    "PropertyRadar's proprietary LikelyListingScore models the probability an owner lists for sale in the near term, before any public listing exists. Cross-referenced with high equity, this surfaces sellers before they hit the open market — the ultimate off-market sourcing edge, feeding both wholesale acquisition and pre-listing cash-offer campaigns.",
  loanProduct: "CookinCapital Off-Market Acquisition Bridge Loan — get to the seller before the property is publicly listed.",
  // NOTE (tightened, 2026-08-03): the original LikelyListingScore 70-100 +
  // EquityPercent 40-100 combo returned 248,614 matches — both bands were
  // far too permissive for a proprietary predictive score meant to isolate
  // the highest-probability near-term sellers. Raised the score floor to
  // 97 (near-certain predicted listers only), the equity floor to 80, added
  // a mobile-phone contactability filter and a $600k value floor, landing
  // at 4,167 live matches.
  build: (opts = {}) =>
    withCommonFilters(criteria(), opts)
      .range("LikelyListingScore", 97, 100)
      .range("EquityPercent", 80, 100)
      .bool("hasOwnerMobilePhone", 1)
      .range("AVM", 600_000, null)
      .build(),
};

// ---------------------------------------------------------------------------
// Registry
// ---------------------------------------------------------------------------

export const SCREENS: Screen[] = [
  freshNodHighEquity,
  trusteeSaleWindow,
  bankOwnedReo,
  absenteeHighEquitySfr,
  vacantHighEquity,
  deceasedProbate,
  tiredLandlordSmallMulti,
  freeAndClearLongHold,
  expiredWithdrawnListing,
  taxLienDistress,
  fixAndFlipCandidate,
  commercialIndustrialEquity,
  probateInherited,
  divorceDrivenSale,
  bankruptcyDistress,
  evictionStressedLandlord,
  auctionDeepDiscount,
  predictivePreListing,
];

export function getScreen(key: string): Screen {
  const s = SCREENS.find((x) => x.key === key);
  if (!s) {
    throw new Error(`Unknown screen "${key}". Known: ${SCREENS.map((x) => x.key).join(", ")}`);
  }
  return s;
}
