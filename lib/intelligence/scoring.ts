/**
 * Deal Intelligence Score — 0-100 composite lead score with fully
 * transparent, auditable sub-scores and a human-readable `reasons[]`
 * explanation array. This is the demo money shot: every point awarded is
 * traceable to a specific field on the enriched lead.
 *
 * Components:
 *  - Equity            0-35  (EquityPercent / AvailableEquity)
 *  - Distress severity 0-30  (inForeclosure/ForeclosureStage rank,
 *                             ForeclosureRecDate, DefaultAmount, vacancy,
 *                             deceased/probate, bankruptcy, divorce,
 *                             eviction, tax delinquency/YearsDelinquent,
 *                             open liens/LienAmount, DistressScore)
 *  - Deal spread       0-20  (PropertyRadar AVM vs TotalLoanBalance vs
 *                             RentCast AVM, and rent yield)
 *  - Timing urgency    0-10  (ForeclosureRecDate recency + stage)
 *  - Contactability    0-5   (owner phone/email on file)
 *
 * Tiers: HOT >=80, WARM 60-79, NURTURE 40-59, COLD <40.
 *
 * IMPORTANT FIX (2026-08-03): a live NOD (fresh_nod_high_equity) lead was
 * observed scoring 31.4/COLD because its `ForeclosureStage` field came back
 * null on the detail response (a real, live-verified PropertyRadar data
 * quirk — see README "Known plan-tier limits" — `ForeclosureSelector:
 * {"message":"Not allowed"}` was present on that record even though the
 * search CRITERION matched). Because the old `scoreDistress()` read
 * `ForeclosureStage` almost exclusively, a null stage silently zeroed out
 * the entire 0-30 distress component for a lead that a distress screen had
 * just surfaced — actively misleading. `scoreDistress()` now reads every
 * available distress signal independently (no single field is load-bearing)
 * AND `scoreLead()` accepts an optional `screenKey` to apply a documented
 * per-screen distress floor, so a lead surfaced by a distress screen can
 * never silently score 0 on distress even if every underlying field is
 * missing on a given record.
 */

import type { PropertyRadarRecord } from "./propertyradar";
import type { EnrichedLead } from "./enrich";

export const SCORE_VERSION = "1.1.0";

export type Tier = "HOT" | "WARM" | "NURTURE" | "COLD";

export interface ScoreBreakdown {
  equity: number; // 0-35
  distress: number; // 0-30
  dealSpread: number; // 0-20
  timing: number; // 0-10
  contactability: number; // 0-5
  total: number; // 0-100
  tier: Tier;
  reasons: string[];
  scoreVersion: string;
}

/** Foreclosure stage severity rank, higher = more urgent/advanced. */
const FORECLOSURE_STAGE_RANK: Readonly<Record<string, number>> = {
  "Preforeclosure-Old": 2,
  "Preforeclosure-Released": 1,
  Preforeclosure: 4,
  "Preforeclosure-NTS": 6,
  "Preforeclosure-Sold": 3,
  Auction: 9,
  "Auction-Old": 7,
  "Auction-UNK": 6,
  "Sale Pending": 5,
  Cancelled: 1,
  "Cancelled-Sold": 1,
  Released: 1,
  "Bank Owned": 8,
  "Bank Owned-Sold": 3,
  "Bank Owned-Rescinded": 5,
  "Bank Owned-Held": 8,
  "3rd Owned": 6,
  "3rd Owned-Sold": 2,
  "3rd Owned-Rescinded": 4,
  "3rd Owned-Held": 6,
};

/**
 * Per-screen minimum guaranteed distress score (0-30 scale). A property
 * that was SURFACED by a distress-oriented screen must never report a
 * distress sub-score of 0, even if every underlying field the generic
 * scorer looks at happens to be null/missing on that particular record's
 * detail response (a real, observed PropertyRadar data-completeness quirk).
 * Screens not listed here (pure equity/property-type plays with no
 * distress thesis, e.g. `fix_and_flip_candidate`) get no floor — a 0
 * distress score is legitimate for those.
 */
export const SCREEN_DISTRESS_FLOOR: Readonly<Record<string, number>> = {
  fresh_nod_high_equity: 12,
  trustee_sale_window: 16,
  bank_owned_reo: 14,
  vacant_high_equity: 6,
  deceased_probate: 5,
  probate_inherited: 7,
  divorce_driven_sale: 4,
  bankruptcy_distress: 6,
  eviction_stressed_landlord: 4,
  auction_deep_discount: 16,
  tax_lien_distress: 5,
};

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

function daysAgo(dateStr: string | undefined): number | null {
  if (!dateStr) return null;
  const t = Date.parse(dateStr);
  if (Number.isNaN(t)) return null;
  return Math.floor((Date.now() - t) / (1000 * 60 * 60 * 24));
}

// ---------------------------------------------------------------------------
// Component scorers
// ---------------------------------------------------------------------------

function scoreEquity(rec: PropertyRadarRecord, reasons: string[]): number {
  const equityPct = typeof rec.EquityPercent === "number" ? rec.EquityPercent : null;
  const availEquity = typeof rec.AvailableEquity === "number" ? rec.AvailableEquity : null;

  let score = 0;
  if (equityPct !== null) {
    // Linear scale: 0% equity -> 0 pts, 100% equity -> 30 pts (leaves 5 pts for $ bonus)
    score += clamp((equityPct / 100) * 30, 0, 30);
    reasons.push(`Equity ${equityPct.toFixed(0)}% of AVM contributes ${(clamp((equityPct / 100) * 30, 0, 30)).toFixed(1)} pts`);
  }
  if (availEquity !== null && availEquity > 0) {
    // Dollar-equity bonus up to 5 pts, saturating at $500k+ available equity.
    const bonus = clamp((availEquity / 500_000) * 5, 0, 5);
    score += bonus;
    reasons.push(`Available equity $${Math.round(availEquity).toLocaleString()} adds ${bonus.toFixed(1)} pts`);
  }
  return clamp(score, 0, 35);
}

/**
 * Distress severity (0-30). Reads EVERY available distress signal
 * independently so that no single missing/null field (e.g. a
 * `ForeclosureStage` that came back null due to a plan/data quirk on an
 * otherwise-matching record) can zero out the whole component. Signals
 * considered: inForeclosure, ForeclosureStage (rank), ForeclosureRecDate
 * recency, DefaultAmount, inTaxDelinquency + YearsDelinquent +
 * DelinquentAmount, PropertyHasOpenLiens + LienAmount, isSiteVacant /
 * isMailVacant, isDeceased / inProbateProperty, inDivorce, inBankruptcy,
 * hasRecentEviction / EvictionFilingDate, and PropertyRadar's own
 * DistressScore as a final independent cross-check / floor.
 */
function scoreDistress(rec: PropertyRadarRecord, reasons: string[]): number {
  let score = 0;

  // Foreclosure signal (0-14): prefer the ForeclosureStage rank when present,
  // but fall back to the boolean inForeclosure flag (or a recent
  // ForeclosureRecDate) so a null/missing stage on a genuine foreclosure
  // record still contributes meaningfully instead of scoring 0.
  if (rec.ForeclosureStage) {
    const rank = FORECLOSURE_STAGE_RANK[rec.ForeclosureStage] ?? 0;
    const pts = clamp((rank / 9) * 14, 0, 14);
    score += pts;
    reasons.push(`ForeclosureStage "${rec.ForeclosureStage}" (severity ${rank}/9) adds ${pts.toFixed(1)} pts`);
  } else if (rec.inForeclosure === 1) {
    // Stage field missing/null despite an active foreclosure flag — use a
    // conservative mid-severity default (rank 5/9) rather than 0, and use
    // ForeclosureRecDate recency (if present) to refine it further.
    const age = daysAgo(rec.ForeclosureRecDate);
    const recencyBoost = age !== null ? clamp(((90 - age) / 90) * 3, 0, 3) : 0;
    const pts = clamp((5 / 9) * 14 + recencyBoost, 0, 14);
    score += pts;
    reasons.push(
      `inForeclosure=1 with no ForeclosureStage on this record (known data-completeness quirk) — conservative mid-severity default adds ${pts.toFixed(1)} pts`
    );
  } else if (daysAgo(rec.ForeclosureRecDate) !== null) {
    // No stage, no inForeclosure flag, but a ForeclosureRecDate exists —
    // still a real foreclosure-timeline signal.
    const age = daysAgo(rec.ForeclosureRecDate)!;
    const pts = clamp(((120 - age) / 120) * 8, 0, 8);
    score += pts;
    reasons.push(`ForeclosureRecDate present (${age} days ago) with no stage detail adds ${pts.toFixed(1)} pts`);
  }

  // Default dollar amount (0-6), saturating at $50k
  if (typeof rec.DefaultAmount === "number" && rec.DefaultAmount > 0) {
    const pts = clamp((rec.DefaultAmount / 50_000) * 6, 0, 6);
    score += pts;
    reasons.push(`DefaultAmount $${Math.round(rec.DefaultAmount).toLocaleString()} adds ${pts.toFixed(1)} pts`);
  }

  // Vacancy (0-4)
  if (rec.isSiteVacant === 1) {
    score += 4;
    reasons.push("Site confirmed vacant (isSiteVacant=1) adds 4.0 pts");
  } else if (rec.isMailVacant === 1) {
    score += 2.5;
    reasons.push("Mailing address confirmed vacant (isMailVacant=1) adds 2.5 pts");
  }

  // Deceased / probate (0-3)
  if (rec.inProbateProperty === 1) {
    score += 3;
    reasons.push("Confirmed probate filing (inProbateProperty=1) adds 3.0 pts");
  } else if (rec.isDeceased === 1) {
    score += 2;
    reasons.push("Owner may be deceased (isDeceased=1) adds 2.0 pts");
  }

  // Bankruptcy / divorce / eviction (0-2 each, up to 3 total to avoid overweighting)
  let lifeEventPts = 0;
  if (rec.inBankruptcy === 1) {
    lifeEventPts += 2;
    reasons.push("Active bankruptcy (inBankruptcy=1) adds to distress score");
  }
  if (rec.inDivorce === 1) {
    lifeEventPts += 1.5;
    reasons.push("Active divorce filing (inDivorce=1) adds to distress score");
  }
  if (rec.hasRecentEviction === 1) {
    lifeEventPts += 1;
    reasons.push("Recent eviction filed (hasRecentEviction=1) adds to distress score");
  } else if (daysAgo(rec.EvictionFilingDate) !== null && daysAgo(rec.EvictionFilingDate)! <= 365) {
    lifeEventPts += 1;
    reasons.push(`Eviction filed ${daysAgo(rec.EvictionFilingDate)} days ago (EvictionFilingDate) adds to distress score`);
  }
  const cappedLifeEvent = clamp(lifeEventPts, 0, 3);
  score += cappedLifeEvent;

  // Tax delinquency (0-3): DelinquentAmount, or YearsDelinquent as a
  // fallback severity signal, or a bare inTaxDelinquency flag as a floor.
  if (rec.inTaxDelinquency === 1 && typeof rec.DelinquentAmount === "number" && rec.DelinquentAmount > 0) {
    const pts = clamp((rec.DelinquentAmount / 20_000) * 3, 0, 3);
    score += pts;
    reasons.push(`Tax delinquency $${Math.round(rec.DelinquentAmount).toLocaleString()} adds ${pts.toFixed(1)} pts`);
  } else if (rec.inTaxDelinquency === 1 && typeof rec.YearsDelinquent === "number" && rec.YearsDelinquent > 0) {
    const pts = clamp((rec.YearsDelinquent / 5) * 3, 0, 3);
    score += pts;
    reasons.push(`Tax delinquency ${rec.YearsDelinquent} year(s) (YearsDelinquent) adds ${pts.toFixed(1)} pts`);
  } else if (rec.inTaxDelinquency === 1) {
    score += 1;
    reasons.push("Tax delinquency flagged (inTaxDelinquency=1) adds 1.0 pt");
  }

  // Open liens (0-3): PropertyHasOpenLiens + LienAmount severity.
  if (rec.PropertyHasOpenLiens === 1 && typeof rec.LienAmount === "number" && rec.LienAmount > 0) {
    const pts = clamp((rec.LienAmount / 30_000) * 3, 0, 3);
    score += pts;
    reasons.push(`Open property lien $${Math.round(rec.LienAmount).toLocaleString()} adds ${pts.toFixed(1)} pts`);
  } else if (rec.PropertyHasOpenLiens === 1) {
    score += 1;
    reasons.push("Open property lien flagged (PropertyHasOpenLiens=1) adds 1.0 pt");
  }

  // PropertyRadar's own composite DistressScore (0-100), used here as an
  // independent cross-check/floor rather than the primary signal — if
  // PropertyRadar's own model rates this record as highly distressed but
  // our field-by-field tally landed lower (e.g. due to missing detail
  // fields), nudge the score up to reflect it.
  if (typeof rec.DistressScore === "number" && rec.DistressScore > 0) {
    const impliedPts = clamp((rec.DistressScore / 100) * 30, 0, 30);
    if (impliedPts > score) {
      reasons.push(
        `PropertyRadar DistressScore ${rec.DistressScore}/100 implies ${impliedPts.toFixed(1)} pts, raising distress floor from ${score.toFixed(1)} pts`
      );
      score = impliedPts;
    }
  }

  return clamp(score, 0, 30);
}

function scoreDealSpread(
  rec: PropertyRadarRecord,
  enriched: Pick<EnrichedLead, "rentcastAvm" | "capRate" | "rentToValue"> | undefined,
  reasons: string[]
): number {
  let score = 0;
  const avm = typeof rec.AVM === "number" ? rec.AVM : null;
  const loanBalance = typeof rec.TotalLoanBalance === "number" ? rec.TotalLoanBalance : null;

  // AVM vs loan balance spread (0-10)
  if (avm !== null && avm > 0 && loanBalance !== null) {
    const spreadPct = (avm - loanBalance) / avm;
    const pts = clamp(spreadPct * 10, 0, 10);
    score += pts;
    reasons.push(`AVM-to-loan spread ${(spreadPct * 100).toFixed(0)}% adds ${pts.toFixed(1)} pts`);
  }

  // PropertyRadar AVM vs RentCast AVM cross-check (0-5): reward agreement,
  // since two independent AVMs agreeing de-risks the deal spread.
  if (enriched?.rentcastAvm && avm) {
    const diff = Math.abs(enriched.rentcastAvm - avm) / avm;
    const pts = clamp((1 - diff) * 5, 0, 5);
    score += pts;
    reasons.push(
      `RentCast AVM $${Math.round(enriched.rentcastAvm).toLocaleString()} vs PropertyRadar AVM $${Math.round(avm).toLocaleString()} (${(diff * 100).toFixed(0)}% delta) adds ${pts.toFixed(1)} pts`
    );
  }

  // Rent yield (0-5), saturating at 1.0% monthly rent-to-value (a strong cash-flow signal)
  if (enriched?.rentToValue) {
    const pts = clamp((enriched.rentToValue / 0.01) * 5, 0, 5);
    score += pts;
    reasons.push(`Rent-to-value ratio ${(enriched.rentToValue * 100).toFixed(2)}% adds ${pts.toFixed(1)} pts`);
  } else if (typeof rec.CapRate === "number" && rec.CapRate > 0) {
    const pts = clamp((rec.CapRate / 0.08) * 5, 0, 5);
    score += pts;
    reasons.push(`PropertyRadar CapRate ${(rec.CapRate * 100).toFixed(1)}% adds ${pts.toFixed(1)} pts`);
  }

  return clamp(score, 0, 20);
}

function scoreTiming(rec: PropertyRadarRecord, reasons: string[]): number {
  let score = 0;
  const age = daysAgo(rec.ForeclosureRecDate as string | undefined);
  if (age !== null) {
    // Fresher filings score higher; decays linearly to 0 by 180 days.
    const pts = clamp(((180 - age) / 180) * 7, 0, 7);
    score += pts;
    reasons.push(`ForeclosureRecDate ${age} days ago adds ${pts.toFixed(1)} pts (urgency decays over 180 days)`);
  }
  if (rec.ForeclosureStage === "Auction" || rec.ForeclosureStage === "Auction-UNK") {
    score += 3;
    reasons.push('Active auction stage adds 3.0 urgency pts');
  }
  return clamp(score, 0, 10);
}

function scoreContactability(rec: PropertyRadarRecord, reasons: string[]): number {
  let score = 0;
  if (rec.hasOwnerPhone === 1) {
    score += 3;
    reasons.push("Owner phone on file (hasOwnerPhone=1) adds 3.0 pts");
  }
  if (rec.hasOwnerMobilePhone === 1) {
    score += 1;
    reasons.push("Owner mobile phone on file (hasOwnerMobilePhone=1) adds 1.0 pt");
  }
  if (rec.hasOwnerEmail === 1) {
    score += 1;
    reasons.push("Owner email on file (hasOwnerEmail=1) adds 1.0 pt");
  }
  return clamp(score, 0, 5);
}

export function tierFor(total: number): Tier {
  if (total >= 80) return "HOT";
  if (total >= 60) return "WARM";
  if (total >= 40) return "NURTURE";
  return "COLD";
}

/**
 * Computes the full Deal Intelligence Score for a PropertyRadar record,
 * optionally boosted by RentCast enrichment data (rentcastAvm, capRate,
 * rentToValue) when available.
 *
 * @param screenKey - the key of the screen that surfaced this lead
 * (e.g. "fresh_nod_high_equity"). When provided and the screen has a
 * documented distress thesis (see `SCREEN_DISTRESS_FLOOR`), the distress
 * sub-score is floored at that screen's minimum guaranteed value — a
 * property matched by a distress screen must never report 0 distress
 * points purely because individual detail fields came back null on that
 * record. This assertion is enforced below (`assertDistressFloor`).
 */
export function scoreLead(
  rec: PropertyRadarRecord,
  enrichment?: Pick<EnrichedLead, "rentcastAvm" | "capRate" | "rentToValue">,
  screenKey?: string
): ScoreBreakdown {
  const reasons: string[] = [];

  const equity = scoreEquity(rec, reasons);
  let distress = scoreDistress(rec, reasons);
  const dealSpread = scoreDealSpread(rec, enrichment, reasons);
  const timing = scoreTiming(rec, reasons);
  const contactability = scoreContactability(rec, reasons);

  if (screenKey && screenKey in SCREEN_DISTRESS_FLOOR) {
    const floor = SCREEN_DISTRESS_FLOOR[screenKey]!;
    if (distress < floor) {
      reasons.push(
        `Screen "${screenKey}" carries a documented distress thesis — flooring distress sub-score from ${distress.toFixed(1)} to ${floor.toFixed(1)} pts (a property surfaced by a distress screen cannot score 0 on distress)`
      );
      distress = floor;
    }
  }
  distress = clamp(distress, 0, 30);

  assertDistressFloor(screenKey, distress);

  const total = clamp(
    Math.round((equity + distress + dealSpread + timing + contactability) * 10) / 10,
    0,
    100
  );
  const tier = tierFor(total);

  reasons.push(`Total score ${total.toFixed(1)}/100 -> tier ${tier}`);

  return {
    equity: round1(equity),
    distress: round1(distress),
    dealSpread: round1(dealSpread),
    timing: round1(timing),
    contactability: round1(contactability),
    total,
    tier,
    reasons,
    scoreVersion: SCORE_VERSION,
  };
}

/**
 * Hard runtime assertion: a lead surfaced by a screen with a documented
 * distress thesis must never carry a distress sub-score of 0. Throws
 * immediately if this invariant is violated, since a silent 0 here would
 * misrepresent a genuinely distressed lead as having no distress signal
 * at all (the exact bug this fix addresses).
 */
function assertDistressFloor(screenKey: string | undefined, distress: number): void {
  if (screenKey && screenKey in SCREEN_DISTRESS_FLOOR && distress <= 0) {
    throw new Error(
      `Invariant violated: screen "${screenKey}" has a documented distress thesis (floor ${SCREEN_DISTRESS_FLOOR[screenKey]}) but produced a distress score of ${distress}. This should be unreachable — investigate scoreDistress()/SCREEN_DISTRESS_FLOOR.`
    );
  }
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}
