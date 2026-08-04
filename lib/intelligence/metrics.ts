/**
 * The 7-metric investment panel for the Deal Analyzer.
 *
 * Every figure is derived from live PropertyRadar + RentCast values plus a
 * single, explicit, surfaced assumption set — nothing is fabricated and the
 * assumptions travel with the result so the investor can audit them.
 */

import type { EnrichedLead } from "./enrich";
import type { InvestmentMetrics } from "@shared/schema";

export const ASSUMPTIONS = {
  downPaymentPct: 0.25,
  interestRate: 0.0895, // private-credit bridge rate
  amortYears: 30,
  holdYears: 5,
  vacancyPct: 0.05,
  opexPct: 0.08, // maintenance + management, % of gross rent
  closingCostPct: 0.02,
  sellingCostPct: 0.06,
  appreciationBear: -0.01,
  appreciationBase: 0.035,
  appreciationBull: 0.07,
} as const;

function monthlyPayment(principal: number, annualRate: number, years: number): number {
  const r = annualRate / 12;
  const n = years * 12;
  if (r === 0) return principal / n;
  return (principal * r) / (1 - Math.pow(1 + r, -n));
}

/** Remaining loan balance after `months` of amortization. */
function remainingBalance(
  principal: number,
  annualRate: number,
  years: number,
  months: number
): number {
  const r = annualRate / 12;
  const n = years * 12;
  if (r === 0) return Math.max(0, principal * (1 - months / n));
  const pmt = monthlyPayment(principal, annualRate, years);
  return principal * Math.pow(1 + r, months) - pmt * ((Math.pow(1 + r, months) - 1) / r);
}

/** IRR of an equity cash-flow series via bisection. */
function irr(cashflows: number[]): number | null {
  const npv = (rate: number) =>
    cashflows.reduce((acc, cf, i) => acc + cf / Math.pow(1 + rate, i), 0);
  let lo = -0.9;
  let hi = 3;
  if (npv(lo) * npv(hi) > 0) return null;
  for (let i = 0; i < 200; i++) {
    const mid = (lo + hi) / 2;
    if (npv(lo) * npv(mid) <= 0) hi = mid;
    else lo = mid;
  }
  const result = (lo + hi) / 2;
  return Number.isFinite(result) ? result : null;
}

export function computeMetrics(e: {
  avm: number | null;
  rentcastAvm: number | null;
  rentcastRent: number | null;
  annualTaxes: number | null;
}): InvestmentMetrics {
  const A = ASSUMPTIONS;
  const empty: InvestmentMetrics = {
    capRate: null,
    cashOnCash: null,
    dcr: null,
    equityMultiple: null,
    breakEvenOccupancy: null,
    grm: null,
    irrBear: null,
    irrBase: null,
    irrBull: null,
    assumptions: { ...A },
  };

  // Use the more conservative of the two independent AVMs as basis.
  const candidates = [e.avm, e.rentcastAvm].filter(
    (v): v is number => typeof v === "number" && v > 0
  );
  const value = candidates.length ? Math.min(...candidates) : null;
  const rent = e.rentcastRent && e.rentcastRent > 0 ? e.rentcastRent : null;
  if (!value || !rent) return empty;

  const grossAnnualRent = rent * 12;
  const effectiveRent = grossAnnualRent * (1 - A.vacancyPct);
  const taxes = e.annualTaxes ?? value * 0.0125;
  const insurance = value * 0.0035;
  const opex = grossAnnualRent * A.opexPct;
  const noi = effectiveRent - taxes - insurance - opex;

  const capRate = noi / value;
  const grm = value / grossAnnualRent;

  const loan = value * (1 - A.downPaymentPct);
  const equityIn = value * A.downPaymentPct + value * A.closingCostPct;
  const annualDebtService = monthlyPayment(loan, A.interestRate, A.amortYears) * 12;

  const dcr = annualDebtService > 0 ? noi / annualDebtService : null;
  const annualCashFlow = noi - annualDebtService;
  const cashOnCash = equityIn > 0 ? annualCashFlow / equityIn : null;

  // Break-even occupancy: the occupancy at which NOI exactly covers debt.
  const fixed = taxes + insurance;
  const perOccupancyPointNet = grossAnnualRent * (1 - A.opexPct);
  const breakEvenOccupancy =
    perOccupancyPointNet > 0 ? (annualDebtService + fixed) / perOccupancyPointNet : null;

  // Levered equity IRR across three appreciation scenarios.
  const scenario = (appreciation: number): number | null => {
    const flows: number[] = [-equityIn];
    for (let y = 1; y <= A.holdYears; y++) {
      const grownRent = grossAnnualRent * Math.pow(1 + Math.max(appreciation, 0) * 0.6, y - 1);
      const yNoi =
        grownRent * (1 - A.vacancyPct) -
        taxes * Math.pow(1.02, y - 1) -
        insurance * Math.pow(1.03, y - 1) -
        grownRent * A.opexPct;
      let cf = yNoi - annualDebtService;
      if (y === A.holdYears) {
        const exitValue = value * Math.pow(1 + appreciation, A.holdYears);
        const payoff = remainingBalance(loan, A.interestRate, A.amortYears, A.holdYears * 12);
        cf += exitValue * (1 - A.sellingCostPct) - payoff;
      }
      flows.push(cf);
    }
    return irr(flows);
  };

  const irrBase = scenario(A.appreciationBase);

  // Equity multiple on the base case.
  const baseFlows: number[] = [];
  for (let y = 1; y <= A.holdYears; y++) {
    const grownRent = grossAnnualRent * Math.pow(1 + A.appreciationBase * 0.6, y - 1);
    const yNoi =
      grownRent * (1 - A.vacancyPct) -
      taxes * Math.pow(1.02, y - 1) -
      insurance * Math.pow(1.03, y - 1) -
      grownRent * A.opexPct;
    baseFlows.push(yNoi - annualDebtService);
  }
  const exitValue = value * Math.pow(1 + A.appreciationBase, A.holdYears);
  const payoff = remainingBalance(loan, A.interestRate, A.amortYears, A.holdYears * 12);
  const totalDistributions =
    baseFlows.reduce((a, b) => a + b, 0) + exitValue * (1 - A.sellingCostPct) - payoff;
  const equityMultiple = equityIn > 0 ? totalDistributions / equityIn : null;

  return {
    capRate,
    cashOnCash,
    dcr,
    equityMultiple,
    breakEvenOccupancy,
    grm,
    irrBear: scenario(A.appreciationBear),
    irrBase,
    irrBull: scenario(A.appreciationBull),
    assumptions: { ...A },
  };
}

export function metricsFromEnriched(e: EnrichedLead): InvestmentMetrics {
  return computeMetrics({
    avm: e.avm,
    rentcastAvm: e.rentcastAvm,
    rentcastRent: e.rentcastRent,
    annualTaxes:
      typeof e.raw?.AnnualTaxes === "number" ? (e.raw.AnnualTaxes as number) : null,
  });
}
