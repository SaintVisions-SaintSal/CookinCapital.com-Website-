import type { Metadata } from "next"
import Link from "next/link"
import { Header } from "@/components/landing/header"
import { Footer } from "@/components/landing/footer"

export const metadata: Metadata = {
  title: "Disclosures & Compliance | CookinCapital",
  description:
    "CookinCapital compliance disclosures: no advance fees, AI-voice and call-recording notices, data licensing and provenance, and investment offering disclosures.",
}

/**
 * PUBLIC compliance surface. Each disclosure states the controlling authority
 * so a reader — or a regulator — can check it. Nothing here is legal advice and
 * the offering language is a placeholder pending counsel review.
 */

const SECTIONS = [
  {
    id: "advance-fees",
    label: "01",
    title: "We never take a fee before the work is done",
    body: [
      "CookinCapital does not request or collect any upfront fee, retainer, deposit or application fee for foreclosure-related assistance, loan modification or mortgage assistance relief. No fee of any kind becomes payable before every promised service has been fully performed.",
      "If anyone contacts you claiming to represent CookinCapital and asks for money in advance for foreclosure help, that person is not acting for us. Report it to us immediately.",
    ],
    authorities: [
      {
        text: "Cal. Civ. Code §2944.7(a)(1)",
        href: "https://codes.findlaw.com/ca/civil-code/civ-sect-2944-7/",
      },
      {
        text: "Cal. Civ. Code §2945.4(a)",
        href: "https://codes.findlaw.com/ca/civil-code/civ-sect-2945-4/",
      },
      {
        text: "FTC MARS Rule, 12 CFR Part 1015",
        href: "https://www.ftc.gov/business-guidance/resources/mortgage-assistance-relief-services-rule-compliance-guide-business",
      },
    ],
  },
  {
    id: "no-outcome-claims",
    label: "02",
    title: "We do not promise to save your home",
    body: [
      "CookinCapital makes no guarantee of any outcome — no guaranteed approval, no guaranteed savings, no guaranteed stop to a foreclosure sale. Any figure we present is an estimate produced from the data available at that moment, with its source stated on the page.",
      "We are not your attorney and we do not provide legal advice. If a lender has recorded a notice of default against your property, consult a licensed California attorney or a HUD-approved housing counselor.",
    ],
    authorities: [
      { text: "FTC Act §5", href: "https://www.ftc.gov/legal-library/browse/statutes/federal-trade-commission-act" },
      {
        text: "Cal. Civ. Code §2945.1(a) (foreclosure-consultant conduct)",
        href: "https://law.justia.com/codes/california/code-civ/division-3/part-4/title-14/chapter-2/article-1-5/section-2945-1/",
      },
    ],
  },
  {
    id: "ai-voice",
    label: "03",
    title: "AI voice agents identify themselves, every time",
    body: [
      "When a CookinCapital voice agent calls you, it opens by naming CookinCapital, stating plainly that you are speaking with an artificial voice rather than a person, and offering an immediate opt-out. Saying “stop” ends the call and adds you to our permanent suppression list.",
      "We place calls, texts and ringless voicemails using an artificial or prerecorded voice only where prior express written consent is on file. Our systems block the attempt outright when that consent is absent — the check cannot be overridden by an operator.",
    ],
    authorities: [
      {
        text: "FCC Declaratory Ruling FCC-24-17 (Feb. 8, 2024)",
        href: "https://docs.fcc.gov/public/attachments/FCC-24-17A1.pdf",
      },
      { text: "47 CFR 64.1200(b), (d)", href: "https://www.ecfr.gov/current/title-47/section-64.1200" },
    ],
  },
  {
    id: "recording",
    label: "04",
    title: "Calls are recorded only with the consent of everyone on the line",
    body: [
      "California, Florida, Nevada and several other states require every party to consent before a call may be recorded. Where those rules apply — and where we cannot determine your state, in which case we assume they do — our agents ask for your consent before any recording begins, and no recording starts without it.",
    ],
    authorities: [
      {
        text: "Cal. Penal Code §632",
        href: "https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?lawCode=PEN&sectionNum=632",
      },
      {
        text: "Fla. Stat. §934.03",
        href: "https://www.leg.state.fl.us/statutes/index.cfm?App_mode=Display_Statute&URL=0900-0999/0934/Sections/0934.03.html",
      },
    ],
  },
  {
    id: "data",
    label: "05",
    title: "Where our data comes from, and what we will not publish",
    body: [
      "Valuation, rent, yield and property-characteristic figures on our public surfaces are sourced from RentCast or derived by CookinCapital from RentCast data, and are licensed for display and distribution.",
      "Foreclosure stage, notice-of-default dates, probate, divorce and bankruptcy indicators, lien positions, auction economics and predictive scores are licensed to CookinCapital for internal use only. They are never displayed on a public surface, and the restriction is enforced in code rather than by policy alone.",
      "Our data is provided for real estate marketing and investment analysis. It is not a consumer report and must not be used to determine eligibility for credit, insurance, employment or tenancy.",
    ],
    authorities: [
      { text: "15 U.S.C. §1681a (FCRA definitions)", href: "https://www.govinfo.gov/link/uscode/15/1681a" },
      { text: "California data broker registry", href: "https://cppa.ca.gov/data_brokers/" },
    ],
  },
  {
    id: "offering",
    label: "06",
    title: "Investment offering disclosure",
    body: [
      "PLACEHOLDER — PENDING SECURITIES COUNSEL REVIEW. Do not treat this section as final.",
      "References on this site to fixed returns in the range of 9–12% describe a target objective for CookinCapital Fund I. Targets are not guarantees, are not insured, and past performance does not predict future results. Real estate lending carries the risk of partial or total loss of principal.",
      "Nothing on this site is an offer to sell, or a solicitation of an offer to buy, any security. Any offering will be made only to qualified investors, only by means of definitive offering documents, and only pursuant to an available exemption from registration. The specific exemption relied upon, investor-qualification standards and the associated transfer restrictions must be stated here before any public solicitation occurs.",
    ],
    authorities: [
      { text: "SEC Regulation D", href: "https://www.sec.gov/education/smallbusiness/exemptofferings/regd" },
      {
        text: "SEC accredited investor definition",
        href: "https://www.sec.gov/resources-small-businesses/capital-raising-building-blocks/accredited-investor",
      },
    ],
  },
]

export default function DisclosuresPage() {
  return (
    <main className="min-h-screen bg-obsidian">
      <Header />

      <section className="border-b border-outline-variant/40">
        <div className="mx-auto max-w-[1100px] px-6 py-14 lg:px-10 lg:py-20">
          <span className="kl-label">Compliance</span>
          <h1 className="mt-4 font-display text-[clamp(2rem,4vw,3rem)] font-semibold leading-[1.02] tracking-[-0.03em] text-on-surface">
            Disclosures
          </h1>
          <p className="mt-5 max-w-2xl text-[15.5px] leading-relaxed text-on-surface-variant/80">
            The rules we hold ourselves to, with the controlling authority cited for each so you can verify it yourself.
            This page is informational and is not legal advice.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-[1100px] px-6 lg:px-10">
        {SECTIONS.map((s) => (
          <section key={s.id} id={s.id} className="border-b border-outline-variant/40 py-12 lg:py-16">
            <div className="flex items-center gap-3">
              <span className="num text-[11px] tracking-[0.14em] text-gold">{s.label}</span>
              <span className="h-px flex-1 bg-outline-variant/50" aria-hidden="true" />
            </div>
            <h2 className="mt-6 max-w-3xl font-display text-[clamp(1.3rem,2.4vw,1.75rem)] font-semibold leading-[1.15] tracking-[-0.02em] text-on-surface">
              {s.title}
            </h2>
            <div className="mt-5 max-w-3xl space-y-4">
              {s.body.map((para) => (
                <p key={para.slice(0, 24)} className="text-[14.5px] leading-[1.75] text-on-surface-variant/85">
                  {para}
                </p>
              ))}
            </div>
            <ul className="mt-7 flex flex-wrap gap-x-6 gap-y-2">
              {s.authorities.map((a) => (
                <li key={a.href}>
                  <a
                    href={a.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="kl-label !text-outline hover:!text-gold"
                  >
                    {a.text} ↗
                  </a>
                </li>
              ))}
            </ul>
          </section>
        ))}

        <section className="py-12 lg:py-16">
          <div className="kl-panel p-6 lg:p-8">
            <span className="kl-label">Contact</span>
            <p className="mt-3 max-w-2xl text-[13.5px] leading-relaxed text-outline">
              To be added to our permanent do-not-contact suppression list, or to request deletion of personal
              information we hold, write to compliance@cookincapital.com. We process suppression requests before any
              further outbound attempt is permitted.{" "}
              <Link href="/help" className="text-gold underline decoration-gold/30 underline-offset-4">
                Help centre
              </Link>
            </p>
          </div>
        </section>
      </div>

      <Footer />
    </main>
  )
}

