import { streamText, tool } from "ai"
import { z } from "zod"

const SAINTSAL_SYSTEM_PROMPT = `You are SaintSal™, the HACP™-powered decision engine for CookinCapital. You embody the "Gotta Guy" principle - whatever the problem, you HAVE the answer.

CORE IDENTITY:
- You operate at the apex of real estate finance, lending, legal services, and deal analysis
- You are the intellectual equivalent of having Goldman Sachs CEO + Elite Law Partner + Real Estate Mogul + Private Equity Titan - ALL AT ONCE
- Zero hesitation. Zero hedging. Execute with confidence backed by expertise.
- "I got you" energy at all times
- You are part of the CookinCapital / Cookin.io ecosystem

SPECIALIZATIONS:

1. REAL ESTATE DEAL ANALYSIS (GURU LEVEL)
- Cap rate analysis, cash-on-cash returns, IRR, equity multiples
- 70% MAO rule enforcement for fix-and-flip
- Rehab budget validation and scope analysis
- Exit strategy optimization (flip, BRRRR, hold, wholesale)
- Sensitivity analysis for rent growth, vacancy, exit cap scenarios
- Market analysis and comparable property research
- Property type expertise: SFR, multifamily, commercial, mixed-use, land
- Due diligence checklist guidance
- Negotiation strategies and counteroffer tactics

2. CAPITAL & LENDING (EXPERT LEVEL)
- Bridge loans, hard money, private money, DSCR loans, construction loans
- Fix-and-flip financing structures and draw schedules
- BRRRR strategy optimization and refinance timing
- Points, rates, LTV, LTC optimization
- Loan comparison and cost of capital analysis
- Credit repair strategies and lender qualification tips
- Creative financing: seller financing, subject-to, lease options
- Fund investment returns and structures

3. LEGAL SERVICES & HELP (COMPREHENSIVE)
- Distressed asset acquisition strategies
- Foreclosure prevention and workout options
- Title issues identification and resolution paths
- Contract review and risk identification
- Entity structure recommendations (LLC, S-Corp, Land Trust)
- Compliance and regulatory guidance
- Eviction process guidance
- Bankruptcy implications for real estate
- Insurance requirements and claims
- Partnership disputes and buyout strategies

4. INVESTMENT STRATEGY (GENIUS LEVEL)
- Portfolio construction and diversification
- Market timing and cycle analysis
- Risk assessment and mitigation strategies
- Tax optimization (1031 exchanges, depreciation, QOZ)
- Passive vs active investment analysis
- Syndication structures and evaluation
- Note investing fundamentals
- REO and auction purchasing strategies

5. CLIENT SUPPORT & CRM
- Help clients understand their application status
- Guide through the funding process step by step
- Answer questions about CookinCapital loan products
- Provide clear next steps and action items
- Explain documents and requirements
- Track deal progress and milestones

RESPONSE STYLE:
- Start with the direct answer (no throat-clearing or disclaimers)
- Provide the strategic WHY
- Give tactical HOW (specific, actionable steps)
- Use exact terminology, numbers, and calculations
- Be concise but thorough
- Always give a clear BUY / PASS / RENEGOTIATE signal when analyzing deals
- Use formatting (bullets, numbers) for complex responses
- End with a clear call-to-action or next step

DEAL ANALYSIS PROTOCOL:
When users share deal numbers, ALWAYS calculate:
- Maximum Allowable Offer (MAO) using 70% rule
- Total investment needed (all-in costs)
- Expected profit and ROI
- Cash-on-cash return if leveraged
- Risk flags and concerns
- Your recommendation with confidence level

LEGAL DISCLAIMER HANDLING:
- For legal questions, provide educational information and strategic guidance
- Note when professional legal counsel is recommended for specific actions
- Never provide specific legal advice for their jurisdiction
- Focus on general principles and common strategies

You ARE the answer. Not "an" answer - THE answer. You are the guy who knows a guy for everything - except you ARE that guy.`

export async function POST(req: Request) {
  try {
    const { messages } = await req.json()

    if (!process.env.XAI_API_KEY && !process.env.ANTHROPIC_API_KEY) {
      return new Response(
        JSON.stringify({
          error:
            "AI service not configured. Please add XAI_API_KEY or ANTHROPIC_API_KEY to your environment variables, or add credits to your Vercel AI Gateway account.",
        }),
        {
          status: 503,
          headers: { "Content-Type": "application/json" },
        },
      )
    }

    const result = streamText({
      model: process.env.XAI_API_KEY ? "xai/grok-beta" : "anthropic/claude-sonnet-4-20250514",
      system: SAINTSAL_SYSTEM_PROMPT,
      messages,
      tools: {
        analyzeDeal: tool({
          description: "Analyze a real estate deal with comprehensive financial metrics and risk assessment",
          parameters: z.object({
            purchasePrice: z.number().describe("Purchase price in dollars"),
            arv: z.number().describe("After Repair Value in dollars"),
            rehabCost: z.number().describe("Total rehab/renovation cost in dollars"),
            holdingCosts: z.number().optional().describe("Monthly holding costs (taxes, insurance, utilities)"),
            holdingPeriod: z.number().optional().describe("Expected holding period in months"),
            closingCosts: z.number().optional().describe("Total closing costs as percentage (default 3%)"),
            sellingCosts: z.number().optional().describe("Selling costs as percentage (default 6%)"),
            propertyType: z.string().optional().describe("Property type (SFR, multifamily, commercial)"),
            strategy: z.enum(["flip", "brrrr", "hold", "wholesale"]).optional().describe("Investment strategy"),
          }),
          execute: async ({
            purchasePrice,
            arv,
            rehabCost,
            holdingCosts = 0,
            holdingPeriod = 6,
            closingCosts = 3,
            sellingCosts = 6,
            propertyType = "SFR",
            strategy = "flip",
          }) => {
            // 70% Rule MAO calculation
            const mao = arv * 0.7 - rehabCost
            const meetsMAO = purchasePrice <= mao

            // Total investment
            const buyClosing = purchasePrice * (closingCosts / 100)
            const sellClosing = arv * (sellingCosts / 100)
            const totalHolding = holdingCosts * holdingPeriod
            const totalInvestment = purchasePrice + rehabCost + buyClosing + totalHolding

            // Profit calculation
            const grossProfit = arv - totalInvestment - sellClosing
            const roi = (grossProfit / totalInvestment) * 100

            // Risk assessment
            const spreadPercent = ((arv - purchasePrice) / arv) * 100
            const rehabToARV = (rehabCost / arv) * 100
            const profitMargin = (grossProfit / arv) * 100

            let riskLevel = "LOW"
            const riskFlags: string[] = []

            if (!meetsMAO) {
              riskFlags.push("Does NOT meet 70% MAO rule - overpaying")
              riskLevel = "HIGH"
            }
            if (rehabToARV > 30) {
              riskFlags.push("Heavy rehab (>30% of ARV) - execution risk")
              riskLevel = riskLevel === "HIGH" ? "HIGH" : "MEDIUM"
            }
            if (spreadPercent < 25) {
              riskFlags.push("Thin spread (<25%) - limited margin for error")
              riskLevel = riskLevel === "HIGH" ? "HIGH" : "MEDIUM"
            }
            if (roi < 15) {
              riskFlags.push("ROI below 15% - may not justify risk")
            }
            if (holdingPeriod > 9) {
              riskFlags.push("Long hold period (>9mo) - increased carrying costs")
            }

            // Signal determination
            let signal = "BUY"
            let confidence = 85
            if (riskLevel === "HIGH" || roi < 10) {
              signal = "PASS"
              confidence = 90
            } else if (riskLevel === "MEDIUM" || roi < 20) {
              signal = "RENEGOTIATE"
              confidence = 75
            }

            return {
              signal,
              confidence: confidence + "%",
              riskLevel,
              propertyType,
              strategy,
              metrics: {
                purchasePrice: "$" + purchasePrice.toLocaleString(),
                arv: "$" + arv.toLocaleString(),
                rehabCost: "$" + rehabCost.toLocaleString(),
                mao: "$" + Math.round(mao).toLocaleString(),
                meetsMAO,
                totalInvestment: "$" + Math.round(totalInvestment).toLocaleString(),
                grossProfit: "$" + Math.round(grossProfit).toLocaleString(),
                roi: roi.toFixed(1) + "%",
                profitMargin: profitMargin.toFixed(1) + "%",
                spreadPercent: spreadPercent.toFixed(1) + "%",
              },
              riskFlags: riskFlags.length > 0 ? riskFlags : ["No major red flags identified"],
              recommendation:
                signal === "BUY"
                  ? `EXECUTE. Strong ${strategy} opportunity with ${roi.toFixed(1)}% ROI. Meets criteria.`
                  : signal === "PASS"
                    ? `PASS. Risk/return profile unfavorable. Look for better opportunities.`
                    : `RENEGOTIATE to $${Math.round(mao).toLocaleString()} or below to meet MAO and improve returns.`,
              nextSteps:
                signal === "BUY"
                  ? ["Lock up the contract", "Order inspections", "Finalize financing", "Build contractor scope"]
                  : signal === "RENEGOTIATE"
                    ? ["Counter at MAO price", "Identify value-add negotiation points", "Prepare walkaway position"]
                    : ["Move on to next deal", "Add seller to follow-up list", "Analyze comparable opportunities"],
            }
          },
        }),

        calculateLoanPayment: tool({
          description:
            "Calculate loan payment details for various financing scenarios including hard money, bridge, and conventional",
          parameters: z.object({
            loanAmount: z.number().describe("Loan principal amount"),
            interestRate: z.number().describe("Annual interest rate as percentage"),
            termMonths: z.number().describe("Loan term in months"),
            points: z.number().optional().describe("Origination points as percentage"),
            loanType: z.enum(["interest_only", "amortizing"]).optional().describe("Type of loan"),
            loanProduct: z.string().optional().describe("Product type (hard money, bridge, DSCR, conventional)"),
          }),
          execute: async ({
            loanAmount,
            interestRate,
            termMonths,
            points = 2,
            loanType = "interest_only",
            loanProduct = "bridge",
          }) => {
            const monthlyRate = interestRate / 100 / 12
            const originationFee = loanAmount * (points / 100)

            let monthlyPayment: number
            let totalInterest: number

            if (loanType === "interest_only") {
              monthlyPayment = loanAmount * monthlyRate
              totalInterest = monthlyPayment * termMonths
            } else {
              monthlyPayment =
                (loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, termMonths))) /
                (Math.pow(1 + monthlyRate, termMonths) - 1)
              totalInterest = monthlyPayment * termMonths - loanAmount
            }

            const totalCostOfCapital = originationFee + totalInterest
            const effectiveAnnualRate = (totalCostOfCapital / loanAmount) * (12 / termMonths) * 100

            return {
              loanProduct,
              loanAmount: "$" + loanAmount.toLocaleString(),
              interestRate: interestRate + "%",
              termMonths,
              loanType,
              points: points + " points",
              breakdown: {
                monthlyPayment: "$" + Math.round(monthlyPayment).toLocaleString(),
                originationFee: "$" + Math.round(originationFee).toLocaleString(),
                totalInterest: "$" + Math.round(totalInterest).toLocaleString(),
                totalCostOfCapital: "$" + Math.round(totalCostOfCapital).toLocaleString(),
                effectiveRate: effectiveAnnualRate.toFixed(2) + "% annualized",
              },
              comparison: {
                dailyCost: "$" + Math.round((monthlyPayment * 12) / 365).toLocaleString() + "/day",
                weeklyBurn: "$" + Math.round((monthlyPayment * 12) / 52).toLocaleString() + "/week",
              },
            }
          },
        }),

        getInvestmentReturns: tool({
          description: "Calculate expected returns for CookinCapital Fund investment",
          parameters: z.object({
            investmentAmount: z.number().describe("Investment amount in dollars"),
            investmentPeriod: z.number().optional().describe("Investment period in years"),
          }),
          execute: async ({ investmentAmount, investmentPeriod = 1 }) => {
            let tier: string
            let rate: number

            if (investmentAmount >= 250001) {
              tier = "Platinum"
              rate = 12
            } else if (investmentAmount >= 50001) {
              tier = "Gold"
              rate = 10
            } else {
              tier = "Silver"
              rate = 9
            }

            const annualReturn = investmentAmount * (rate / 100)
            const monthlyReturn = annualReturn / 12
            const quarterlyReturn = annualReturn / 4
            const totalReturn = annualReturn * investmentPeriod

            return {
              tier,
              investmentAmount: "$" + investmentAmount.toLocaleString(),
              annualRate: rate + "%",
              investmentPeriod: investmentPeriod + (investmentPeriod === 1 ? " year" : " years"),
              expectedReturns: {
                monthly: "$" + Math.round(monthlyReturn).toLocaleString(),
                quarterly: "$" + Math.round(quarterlyReturn).toLocaleString(),
                annual: "$" + Math.round(annualReturn).toLocaleString(),
                total: "$" + Math.round(totalReturn).toLocaleString() + " over " + investmentPeriod + " year(s)",
              },
              fundInfo: {
                name: "CookinCapital Fund I",
                focus: "Short-term real estate bridge loans",
                securityType: "First-lien position secured notes",
                minimumInvestment: "$25,000",
                distributions: "Monthly or quarterly",
              },
              nextSteps: [
                "Review Private Placement Memorandum (PPM)",
                "Complete accreditation verification",
                "Sign subscription documents",
                "Wire funds to fund account",
              ],
            }
          },
        }),

        legalGuidance: tool({
          description: "Provide legal guidance and strategies for real estate matters",
          parameters: z.object({
            issue: z.string().describe("The legal issue or question"),
            category: z
              .enum([
                "foreclosure",
                "eviction",
                "title",
                "contract",
                "entity",
                "dispute",
                "compliance",
                "bankruptcy",
                "insurance",
                "other",
              ])
              .describe("Category of legal issue"),
            urgency: z.enum(["immediate", "soon", "planning"]).optional().describe("Urgency level"),
          }),
          execute: async ({ issue, category, urgency = "soon" }) => {
            const guidance: Record<
              string,
              { overview: string; strategies: string[]; warnings: string[]; nextSteps: string[] }
            > = {
              foreclosure: {
                overview: "Foreclosure situations require immediate action to protect equity and explore alternatives.",
                strategies: [
                  "Loan modification or forbearance negotiation",
                  "Short sale if underwater",
                  "Deed in lieu of foreclosure",
                  "Bankruptcy filing to trigger automatic stay",
                  "Sell property quickly before auction",
                  "Negotiate with lender for reinstatement",
                ],
                warnings: [
                  "Timeline varies by state (judicial vs non-judicial)",
                  "Deficiency judgments possible in some states",
                  "Credit impact significant for 7 years",
                ],
                nextSteps: [
                  "Get payoff statement from lender",
                  "Consult foreclosure attorney in your state",
                  "Explore all workout options with lender",
                  "Consider professional foreclosure rescue services",
                ],
              },
              eviction: {
                overview: "Eviction must follow state and local laws precisely to be enforceable.",
                strategies: [
                  "Cash for keys negotiation (fastest resolution)",
                  "Formal notice per state requirements",
                  "Court filing after notice period expires",
                  "Proper service of process",
                  "Sheriff lockout after judgment",
                ],
                warnings: [
                  "Self-help evictions are illegal",
                  "COVID/local moratoriums may apply",
                  "Document everything in writing",
                  "Retaliatory eviction claims possible",
                ],
                nextSteps: [
                  "Review lease terms and violation",
                  "Serve proper notice (3-day, 30-day, etc.)",
                  "Document all communications",
                  "Consult local eviction attorney if contested",
                ],
              },
              title: {
                overview: "Title issues can delay or kill deals - early identification is critical.",
                strategies: [
                  "Order preliminary title report early",
                  "Quiet title action for ownership disputes",
                  "Affidavit of heirship for probate issues",
                  "Release of lien for paid-off debts",
                  "Title insurance endorsements for coverage",
                ],
                warnings: [
                  "Some title issues cannot be insured around",
                  "Quiet title actions take 3-6+ months",
                  "Clouds on title affect marketability",
                ],
                nextSteps: [
                  "Order full title search",
                  "Review exceptions with title company",
                  "Get title insurance quote",
                  "Consult real estate attorney for complex issues",
                ],
              },
              contract: {
                overview: "Contract terms define rights, obligations, and remedies. Review carefully.",
                strategies: [
                  "Include proper contingencies (inspection, financing, appraisal)",
                  "Negotiate earnest money terms",
                  "Add assignment clause if wholesaling",
                  "Include extension provisions",
                  "Define default and remedy provisions",
                ],
                warnings: [
                  "Verbal agreements rarely enforceable for real estate",
                  "Time is of the essence clauses are strict",
                  "Specific performance available to buyers",
                ],
                nextSteps: [
                  "Have attorney review before signing",
                  "Understand all contingency deadlines",
                  "Document all addendums in writing",
                  "Keep copies of all signed documents",
                ],
              },
              entity: {
                overview: "Proper entity structure protects personal assets and optimizes taxes.",
                strategies: [
                  "LLC for liability protection on rentals",
                  "Series LLC for multiple properties (where available)",
                  "Land trust for privacy and probate avoidance",
                  "S-Corp for active income tax savings",
                  "Self-directed IRA for tax-advantaged investing",
                ],
                warnings: [
                  "Piercing corporate veil if not properly maintained",
                  "Transfer may trigger due-on-sale clause",
                  "Annual filing and fee requirements",
                ],
                nextSteps: [
                  "Consult CPA for tax implications",
                  "Work with attorney for proper formation",
                  "Establish separate bank accounts",
                  "Maintain corporate formalities",
                ],
              },
              dispute: {
                overview: "Real estate disputes are costly - negotiation and mediation preferred over litigation.",
                strategies: [
                  "Document everything in writing",
                  "Attempt direct negotiation first",
                  "Mediation before litigation",
                  "Arbitration if contract requires",
                  "Small claims court for smaller amounts",
                ],
                warnings: [
                  "Litigation is expensive and slow",
                  "Winning doesn't guarantee collection",
                  "Attorney fees may exceed recovery",
                ],
                nextSteps: [
                  "Gather all documentation",
                  "Send formal demand letter",
                  "Consult attorney for case evaluation",
                  "Consider cost-benefit of pursuing",
                ],
              },
              compliance: {
                overview: "Regulatory compliance is non-negotiable - violations are expensive.",
                strategies: [
                  "Fair housing training for all staff",
                  "Proper disclosures for all transactions",
                  "Lead paint compliance for pre-1978 properties",
                  "ADA compliance for commercial properties",
                  "Local rental licensing and inspections",
                ],
                warnings: [
                  "Fair housing violations have severe penalties",
                  "Disclosure failures = rescission rights",
                  "Unlicensed activity is illegal",
                ],
                nextSteps: [
                  "Audit current compliance status",
                  "Implement checklists and procedures",
                  "Train team on requirements",
                  "Consult compliance attorney",
                ],
              },
              bankruptcy: {
                overview: "Bankruptcy affects real estate transactions significantly - know the implications.",
                strategies: [
                  "Chapter 7 may require property sale",
                  "Chapter 13 can help save property",
                  "Automatic stay stops foreclosure temporarily",
                  "Reaffirmation agreements for secured debt",
                  "Buying from bankruptcy estate opportunities",
                ],
                warnings: [
                  "Fraudulent transfer lookback periods",
                  "Homestead exemptions vary by state",
                  "Bankruptcy stays on record 7-10 years",
                ],
                nextSteps: [
                  "Consult bankruptcy attorney immediately",
                  "Gather all financial documentation",
                  "Understand exemptions in your state",
                  "Consider alternatives to bankruptcy",
                ],
              },
              insurance: {
                overview: "Proper insurance is essential protection for real estate investments.",
                strategies: [
                  "Landlord policy for rentals (not homeowner's)",
                  "Builder's risk during renovation",
                  "Umbrella policy for additional liability",
                  "Flood insurance if in flood zone",
                  "Loss of rent coverage",
                ],
                warnings: [
                  "Vacancy can void coverage",
                  "Renovation may require special coverage",
                  "Underinsurance leads to coinsurance penalties",
                ],
                nextSteps: [
                  "Review current coverage limits",
                  "Get quotes from investment property specialists",
                  "Ensure proper named insureds",
                  "Document property condition with photos",
                ],
              },
              other: {
                overview: "General real estate legal matters require case-by-case analysis.",
                strategies: [
                  "Document everything in writing",
                  "Consult appropriate professionals",
                  "Understand your rights and obligations",
                  "Act within deadlines",
                ],
                warnings: [
                  "Legal issues can escalate quickly",
                  "Self-help remedies often backfire",
                  "Statutes of limitation apply",
                ],
                nextSteps: [
                  "Clearly define the issue",
                  "Gather all relevant documents",
                  "Consult qualified attorney",
                  "Consider cost-benefit of action",
                ],
              },
            }

            const categoryGuidance = guidance[category] || guidance.other

            return {
              category: category.charAt(0).toUpperCase() + category.slice(1),
              urgency: urgency.toUpperCase(),
              issue,
              ...categoryGuidance,
              disclaimer:
                "This is educational information, not legal advice. Consult a licensed attorney in your jurisdiction for specific legal matters.",
              professionalReferral:
                "CookinCapital can connect you with vetted real estate attorneys through our Legal Help program.",
            }
          },
        }),

        compareLoanProducts: tool({
          description: "Compare different loan products for a specific deal",
          parameters: z.object({
            propertyValue: z.number().describe("Property value or purchase price"),
            loanAmount: z.number().describe("Desired loan amount"),
            purpose: z.enum(["purchase", "refinance", "cash_out", "construction"]).describe("Loan purpose"),
            creditScore: z.number().optional().describe("Borrower credit score"),
            experience: z.number().optional().describe("Number of deals completed"),
          }),
          execute: async ({ propertyValue, loanAmount, purpose, creditScore = 680, experience = 0 }) => {
            const ltv = (loanAmount / propertyValue) * 100

            const products = [
              {
                name: "Hard Money",
                rate: "10-14%",
                points: "2-4",
                ltv: "up to 70%",
                term: "6-18 months",
                speed: "7-14 days",
                bestFor: "Fix-and-flip, fast close needed",
                qualified: ltv <= 70,
              },
              {
                name: "Bridge Loan",
                rate: "8-12%",
                points: "1-3",
                ltv: "up to 80%",
                term: "12-24 months",
                speed: "14-21 days",
                bestFor: "Value-add, BRRRR strategy",
                qualified: ltv <= 80 && creditScore >= 650,
              },
              {
                name: "DSCR Loan",
                rate: "7-9%",
                points: "1-2",
                ltv: "up to 80%",
                term: "30 years",
                speed: "21-30 days",
                bestFor: "Rental properties, long-term hold",
                qualified: creditScore >= 660,
              },
              {
                name: "Conventional",
                rate: "6-8%",
                points: "0-1",
                ltv: "up to 80%",
                term: "15-30 years",
                speed: "30-45 days",
                bestFor: "Primary residence, strong credit",
                qualified: creditScore >= 700,
              },
            ]

            const qualifiedProducts = products.filter((p) => p.qualified)

            return {
              dealInfo: {
                propertyValue: "$" + propertyValue.toLocaleString(),
                loanAmount: "$" + loanAmount.toLocaleString(),
                ltv: ltv.toFixed(1) + "%",
                purpose,
                creditScore,
                experience: experience + " deals",
              },
              products: qualifiedProducts.map((p) => ({
                name: p.name,
                rate: p.rate,
                points: p.points,
                maxLTV: p.ltv,
                term: p.term,
                closingSpeed: p.speed,
                bestFor: p.bestFor,
              })),
              recommendation:
                qualifiedProducts.length > 0
                  ? `Based on your profile, ${qualifiedProducts[0].name} appears to be the best fit. ${qualifiedProducts[0].bestFor}.`
                  : "Your profile may require specialized lending solutions. Contact CookinCapital for options.",
              nextSteps: [
                "Gather documentation (ID, bank statements, tax returns)",
                "Get pre-approval to strengthen offers",
                "Compare total cost of capital, not just rate",
                "Consider speed requirements for your deal",
              ],
            }
          },
        }),
      },
      maxSteps: 5,
    })

    return result.toUIMessageStreamResponse()
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: "An error occurred while processing your request. Please try again later.",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    )
  }
}
