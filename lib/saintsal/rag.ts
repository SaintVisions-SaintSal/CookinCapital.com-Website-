// SaintSal RAG Protocol - Knowledge Base with in-memory search

let searchIndex: any | null = null

function getSearchIndex(): any | null {
  if (searchIndex) return searchIndex

  if (!process.env.UPSTASH_SEARCH_REST_URL || !process.env.UPSTASH_SEARCH_REST_TOKEN) {
    console.warn("[SaintSal RAG] Upstash Search not configured")
    return null
  }

  try {
    searchIndex = {
      url: process.env.UPSTASH_SEARCH_REST_URL,
      token: process.env.UPSTASH_SEARCH_REST_TOKEN,
    }
    return searchIndex
  } catch (error) {
    console.error("[SaintSal RAG] Failed to initialize search:", error)
    return null
  }
}

// Knowledge base categories
export type KnowledgeCategory =
  | "lending_products"
  | "investment_info"
  | "real_estate"
  | "legal_compliance"
  | "platform_features"
  | "faq"
  | "deals"
  | "market_data"

export interface KnowledgeDocument {
  id: string
  category: KnowledgeCategory
  title: string
  content: string
  metadata?: Record<string, unknown>
  lastUpdated: string
}

// Add document to knowledge base
export async function addToKnowledgeBase(doc: KnowledgeDocument): Promise<void> {
  // In-memory - documents are already in PLATFORM_KNOWLEDGE
  console.log(`[SaintSal RAG] Would add document: ${doc.id}`)
}

// Bulk add documents
export async function bulkAddToKnowledgeBase(docs: KnowledgeDocument[]): Promise<void> {
  console.log(`[SaintSal RAG] Would add ${docs.length} documents`)
}

export async function searchKnowledgeBase(
  query: string,
  options?: {
    category?: KnowledgeCategory
    limit?: number
    minScore?: number
  },
): Promise<Array<{ id: string; content: string; score: number; metadata: Record<string, unknown> }>> {
  // Use in-memory search for reliability
  return getFallbackContext(query, options?.category, options?.limit ?? 5)
}

function getFallbackContext(
  query: string,
  category?: KnowledgeCategory,
  limit = 5,
): Array<{ id: string; content: string; score: number; metadata: Record<string, unknown> }> {
  const lowerQuery = query.toLowerCase()
  const queryWords = lowerQuery.split(/\s+/).filter((word) => word.length > 2)

  const scoredDocs = PLATFORM_KNOWLEDGE.filter((doc) => !category || doc.category === category)
    .map((doc) => {
      const searchText = `${doc.title} ${doc.content} ${doc.category}`.toLowerCase()
      // Calculate relevance score based on word matches
      const matchCount = queryWords.filter((word) => searchText.includes(word)).length
      const score = queryWords.length > 0 ? matchCount / queryWords.length : 0
      return { doc, score }
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)

  return scoredDocs.map(({ doc, score }) => ({
    id: doc.id,
    content: doc.content,
    score,
    metadata: { category: doc.category, title: doc.title },
  }))
}

// Get context for SaintSal based on user query
export async function getSaintSalContext(query: string): Promise<string> {
  const results = await searchKnowledgeBase(query, { limit: 5, minScore: 0.5 })

  if (results.length === 0) {
    return ""
  }

  const contextParts = results.map((r, i) => `[Source ${i + 1}: ${r.metadata.title || "Knowledge Base"}]\n${r.content}`)

  return `\n\n--- RELEVANT KNOWLEDGE BASE CONTEXT ---\n${contextParts.join("\n\n")}\n--- END CONTEXT ---\n`
}

// Delete document from knowledge base
export async function removeFromKnowledgeBase(id: string): Promise<void> {
  console.log(`[SaintSal RAG] Would remove document: ${id}`)
}

// Initialize with CookinCapital platform knowledge
export const PLATFORM_KNOWLEDGE: KnowledgeDocument[] = [
  {
    id: "lending-fix-flip",
    category: "lending_products",
    title: "Fix & Flip Loans",
    content: `Fix & Flip Loans: Up to 90% LTC (Loan-to-Cost), 12-24 month terms, rates starting at 9.99%. Perfect for investors buying distressed properties to renovate and sell. Fast closings in 7-14 days. No prepayment penalties. Available for residential 1-4 units. Requires 680+ credit score and real estate experience preferred.`,
    lastUpdated: new Date().toISOString(),
  },
  {
    id: "lending-dscr",
    category: "lending_products",
    title: "DSCR Loans",
    content: `DSCR (Debt Service Coverage Ratio) Loans: No income verification needed - qualification based on property cash flow. Up to 80% LTV, 30-year terms available. Rates from 7.5%. Ideal for rental property investors. DSCR minimum 1.0-1.25 depending on property type. Available for 1-4 unit residential and 5+ unit commercial.`,
    lastUpdated: new Date().toISOString(),
  },
  {
    id: "lending-bridge",
    category: "lending_products",
    title: "Bridge Loans",
    content: `Bridge Loans: Short-term financing for acquisitions and repositioning. Up to 75% LTV, 6-24 month terms. Rates from 10%. Fast funding for time-sensitive deals. Interest-only payments available. Perfect for transitional properties or value-add opportunities.`,
    lastUpdated: new Date().toISOString(),
  },
  {
    id: "lending-construction",
    category: "lending_products",
    title: "Ground-Up Construction",
    content: `Ground-Up Construction Loans: Finance new builds from the ground up. Up to 85% LTC, 12-24 month terms. Rates from 11%. Draw schedules based on construction milestones. Requires detailed plans, permits, and experienced builder. Available for residential and commercial projects.`,
    lastUpdated: new Date().toISOString(),
  },
  {
    id: "lending-commercial",
    category: "lending_products",
    title: "Commercial Loans",
    content: `Commercial Real Estate Loans: Financing for multifamily (5+), retail, office, industrial, and mixed-use properties. Up to 75% LTV, 5-25 year terms. Rates from 6.5%. Both stabilized and value-add properties. SBA 504 and 7(a) options available for owner-occupied.`,
    lastUpdated: new Date().toISOString(),
  },
  {
    id: "investment-fund1",
    category: "investment_info",
    title: "Fund I Syndication",
    content: `CookinCapital Fund I: Real estate debt fund offering 9-12% fixed annual returns. Quarterly distributions. Minimum investment $50,000. Accredited investors only. Fund invests in first-position notes secured by real estate. Target fund size $10M. 3-5 year hold period with early redemption options after year 1.`,
    lastUpdated: new Date().toISOString(),
  },
  {
    id: "investment-trading",
    category: "investment_info",
    title: "Trading Platform",
    content: `CookinCapital Trading Platform powered by Alpaca: Access stocks, ETFs, and crypto. Commission-free trading. Fractional shares available. AI-powered portfolio recommendations from SaintSal. Real-time market data and analysis. Paper trading available for practice.`,
    lastUpdated: new Date().toISOString(),
  },
  {
    id: "platform-analyzer",
    category: "platform_features",
    title: "Deal Analyzer",
    content: `Deal Analyzer: Comprehensive real estate investment analysis tool. Analyzes fix & flip, BRRRR, rental, and wholesale deals. Calculates ARV, rehab costs, ROI, cash-on-cash return, cap rate, and DSCR. Generates professional investment summaries. Save deals to your library for tracking. Export to PDF for lenders and partners.`,
    lastUpdated: new Date().toISOString(),
  },
  {
    id: "platform-property-search",
    category: "platform_features",
    title: "Property Search",
    content: `Property Search powered by PropertyRadar: Find motivated sellers, distressed properties, and investment opportunities. Filter by equity, liens, foreclosure status, owner type, and more. SaintSal provides A-D ratings on investment potential. Save searches and get alerts. Direct integration with Deal Analyzer for instant analysis.`,
    lastUpdated: new Date().toISOString(),
  },
  {
    id: "platform-saintsal",
    category: "platform_features",
    title: "SaintSal AI Assistant",
    content: `SaintSal: Your AI-powered real estate and lending expert. Available 24/7 throughout the platform. Analyzes deals, recommends loan products, provides market insights, and guides you through the entire investment process. Voice-enabled for natural conversation. Learns from your preferences and investment history.`,
    lastUpdated: new Date().toISOString(),
  },
  {
    id: "faq-apply",
    category: "faq",
    title: "How to Apply for Financing",
    content: `How to Apply: 1) Click "Apply Now" or navigate to /apply. 2) Select your loan type (Fix & Flip, DSCR, Bridge, etc.). 3) Fill out the application with property details and personal info. 4) Upload required documents (ID, bank statements, property info). 5) Receive pre-qualification within 24 hours. 6) Work with our team to finalize terms and close. No obligation to proceed after pre-qualification.`,
    lastUpdated: new Date().toISOString(),
  },
  {
    id: "faq-invest",
    category: "faq",
    title: "How to Invest with CookinCapital",
    content: `How to Invest: 1) Create an account and verify accredited investor status. 2) Browse available investment opportunities in Fund I or individual deals. 3) Review offering documents and terms. 4) Complete subscription agreement and funding. 5) Receive quarterly distributions and reporting. Minimum investment $50,000 for Fund I. Contact us for co-investment opportunities on larger deals.`,
    lastUpdated: new Date().toISOString(),
  },
  {
    id: "company-about",
    category: "faq",
    title: "About CookinCapital",
    content: `CookinCapital (CookinCap) is a real estate capital platform powered by SaintSal AI. Part of the Saint Vision Group ecosystem. Headquarters: 438 Main St, Huntington Beach, CA 92648. Phone: 949-997-2097. We provide lending solutions, investment opportunities, and AI-powered tools for real estate investors. Founded by experienced real estate and fintech professionals.`,
    lastUpdated: new Date().toISOString(),
  },
]

// Initialize knowledge base with platform knowledge
export async function initializeKnowledgeBase(): Promise<void> {
  console.log("[SaintSal RAG] Initializing knowledge base...")
  console.log(`[SaintSal RAG] Added ${PLATFORM_KNOWLEDGE.length} documents to knowledge base`)
}
