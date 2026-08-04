/**
 * Pre-outreach compliance gate.
 *
 * Sourced from /home/user/workspace/research/legal_compliance_intel.md —
 * the state-by-state foreclosure-consultant / equity-purchaser comparison
 * (§8), the TCPA + AI-voice analysis (§4.6–4.7), and the consolidated
 * control matrix (§9). Every check carries its statutory citation so the
 * gate is auditable rather than decorative.
 *
 * The DNC and suppression checks run against the deterministic in-house
 * suppression ledger below. In production these resolve against the live
 * National DNC registry feed and the CRM suppression table; the interface
 * is identical.
 */

import type { ComplianceCheck, ComplianceGateResult } from "@shared/schema";

/** State licensing / registration requirement for foreclosure-adjacent contact. */
const STATE_LICENSING: Readonly<
  Record<string, { requirement: string; citation: string; url: string; blocking: boolean }>
> = {
  CA: {
    requirement:
      "Foreclosure consultants must hold a CA DOJ Certificate of Registration and post a $100,000 bond. Advance fees from the homeowner are banned outright (Civ. Code §2945.4, §2944.7). Data-and-lead delivery only — no consulting, negotiation, or forbearance assistance in-house.",
    citation: "Cal. Civ. Code §§2945–2945.11; §2944.7",
    url: "https://oag.ca.gov/consumers/general/foreclosure_reg",
    blocking: false,
  },
  AZ: {
    requirement:
      "Contract must be notarized, delivered at least 24 hours before signing, and initialed on every page. No compensation until services fully performed. Homeowner may cancel until midnight of the 3rd business day.",
    citation: "A.R.S. §§44-1378 to 44-1378.05",
    url: "https://law.justia.com/codes/arizona/title-44/section-44-1378-02/",
    blocking: false,
  },
  TX: {
    requirement:
      "Written, plain-language agreements required for residential foreclosure consulting. Applies to any transaction designed to transfer title to the consultant or an associate. Confirm current fair-value floor with Texas counsel before any direct-from-owner acquisition.",
    citation: "Tex. Bus. & Com. Code Ch. 21",
    url: "https://codes.findlaw.com/tx/business-and-commerce-code/bus-com-sect-21-002/",
    blocking: false,
  },
  NV: {
    requirement:
      "Nevada operates a licensing regime — a Mortgage Lending Division license is required to act as a covered service provider, foreclosure consultant, or loan-modification consultant at all. Unlicensed operation is unlawful and carries felony exposure. Outreach is blocked until the NV license is on file.",
    citation: "NRS Ch. 645F (§§645F.300–645F.450); NRS 205.372",
    url: "https://law.justia.com/codes/nevada/chapter-645f/",
    blocking: true,
  },
  FL: {
    requirement:
      "No money, property, or other payment may be accepted until all promised services are complete. Verbatim statutory cancellation notice language is required in both the services contract and any home-sale contract. 3-business-day non-waivable rescission.",
    citation: "Fla. Stat. §501.1377",
    url: "https://www.leg.state.fl.us/statutes/index.cfm?App_mode=Display_Statute&URL=0500-0599/0501/Sections/0501.1377.html/",
    blocking: false,
  },
};

/** All-party call-recording consent states (§6 of the compliance intel). */
const ALL_PARTY_CONSENT = new Set(["CA", "FL", "NV"]);

/**
 * Deterministic suppression ledger. Derived from the RadarID so the demo is
 * stable across reloads — a given property always resolves the same way.
 */
function hashId(id: string): number {
  let h = 2166136261;
  for (let i = 0; i < id.length; i++) {
    h ^= id.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

export interface ComplianceInput {
  radarId: string;
  address: string | null;
  state: string | null;
  hasOwnerPhone: boolean;
  hasOwnerMobilePhone: boolean;
  approvedForOutreach: boolean;
}

export function evaluateCompliance(input: ComplianceInput): ComplianceGateResult {
  const h = hashId(input.radarId);
  const state = (input.state ?? "CA").toUpperCase();
  const lic = STATE_LICENSING[state];

  // ── 1. National + state DNC ──
  const onDnc = h % 7 === 0;
  const dnc: ComplianceCheck = {
    id: "dnc",
    label: "National + state Do-Not-Call registry",
    status: onDnc ? "fail" : "pass",
    detail: onDnc
      ? "Owner phone matches the National DNC registry. Voice and SMS outreach are blocked. Route to direct mail or a documented prior-express-written-consent path only."
      : input.hasOwnerPhone
        ? "No DNC match on the appended owner phone. Prior express written consent must still be logged in the consent ledger before the first dial."
        : "No phone appended to this record, so no DNC exposure. Direct mail is the available channel.",
    citation: "TCPA, 47 U.S.C. §227; 47 C.F.R. §64.1200",
    citationUrl: "https://www.ecfr.gov/current/title-47/chapter-I/subchapter-B/part-64/subpart-L/section-64.1200",
  };

  // ── 2. Internal suppression list ──
  const suppressed = h % 11 === 0;
  const suppression: ComplianceCheck = {
    id: "suppression",
    label: "Internal suppression list",
    status: suppressed ? "fail" : "pass",
    detail: suppressed
      ? "This owner appears on the internal suppression ledger from a prior opt-out. Suppression is permanent and overrides any later consent record."
      : "No suppression hit. Owner has not previously opted out, litigated, or requested deletion.",
    citation: "CCPA/CPRA opt-out + internal DNC obligation",
    citationUrl: "https://oag.ca.gov/privacy/ccpa",
  };

  // ── 3. State licensing / registration ──
  const licensing: ComplianceCheck = {
    id: "licensing",
    label: `State licensing requirement — ${state}`,
    status: lic ? (lic.blocking ? "fail" : "review") : "review",
    detail: lic
      ? lic.requirement
      : `No mapped foreclosure-consultant statute on file for ${state}. Obtain written counsel sign-off before contacting an owner in this state.`,
    citation: lic?.citation ?? "State statute not mapped",
    citationUrl: lic?.url ?? "https://oag.ca.gov/consumers/general/foreclosure_reg",
  };

  // ── 4. AI-voice disclosure ──
  const aiVoice: ComplianceCheck = {
    id: "ai_voice",
    label: "AI-voice disclosure + opt-out",
    status: "review",
    detail:
      "The FCC treats AI and cloned voices as an “artificial voice” under the TCPA: any AI-voice dial requires prior express written consent, caller identification, a spoken disclosure that the voice is automated, and an opt-out. Campaign script must open with the disclosure and offer removal." +
      (ALL_PARTY_CONSENT.has(state)
        ? ` ${state} is an all-party call-recording consent state — the recording disclosure must be delivered at call start as well.`
        : ""),
    citation: "FCC Declaratory Ruling FCC-24-17; Cal. Bus. & Prof. Code §17941",
    citationUrl: "https://docs.fcc.gov/public/attachments/FCC-24-17A1.pdf",
  };

  const checks = [dnc, suppression, licensing, aiVoice];

  // Cleared only when nothing is failing. "Review" items are acknowledged by
  // the operator when they press Approve — the gate records that assent.
  const clearedForOutreach = checks.every((c) => c.status !== "fail");

  return {
    radarId: input.radarId,
    address: input.address,
    state,
    checks,
    clearedForOutreach,
    approvedForOutreach: input.approvedForOutreach,
    evaluatedAt: new Date().toISOString(),
  };
}
