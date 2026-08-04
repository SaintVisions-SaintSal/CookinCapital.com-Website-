/**
 * Surface barrel — the four Deal Intelligence surfaces, portable into the
 * production Next.js app. Audience is part of each component's contract:
 *
 *   PUBLIC   (investor-facing)  → MarketScreener, DealAnalyzer (showInternal={false})
 *   INTERNAL (operator-only)    → DistressScreener, LeadBrief, ComplianceGate,
 *                                 DealAnalyzer (showInternal)
 */
export { MarketScreener, INITIAL_MARKET_FILTERS, type MarketFilterState } from "./market-screener";
export { DistressScreener } from "./distress-screener";
export { DealAnalyzer, InternalUnderwriting } from "./deal-analyzer";
export { LeadBrief } from "./lead-brief";
export { ComplianceGate } from "./compliance-gate";
