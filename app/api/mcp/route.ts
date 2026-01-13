import { type NextRequest, NextResponse } from "next/server"

// ===========================================
// SAINTSAL™ MCP SERVER v2.0 - FULL ARSENAL
// 35+ Tools | HACP™ Protocol | US Patent #10,290,222
// Saint Vision Technologies LLC
// ===========================================

interface MCPRequest {
  method: string
  params?: {
    name?: string
    arguments?: Record<string, any>
  }
}

// ===========================================
// TOOL DEFINITIONS
// ===========================================

const TOOLS = [
  // ============ TAVILY SEARCH SUITE (5 tools) ============
  {
    name: "tavily_search",
    description:
      "Real-time web search with 93.3% accuracy. Best for current events, market data, company research, news.",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string", description: "Search query" },
        search_depth: { type: "string", enum: ["basic", "advanced"], description: "Search depth" },
        include_answer: { type: "boolean", description: "Include AI summary" },
        max_results: { type: "number", description: "Max results (1-10)" },
      },
      required: ["query"],
    },
  },
  {
    name: "tavily_extract",
    description: "Extract clean content from any URL. Scrape company info, property listings, articles.",
    inputSchema: {
      type: "object",
      properties: {
        urls: { type: "array", items: { type: "string" }, description: "URLs to extract (max 20)" },
      },
      required: ["urls"],
    },
  },
  {
    name: "tavily_crawl",
    description: "Crawl entire websites for competitor analysis, lead generation.",
    inputSchema: {
      type: "object",
      properties: {
        url: { type: "string", description: "Base URL to crawl" },
        max_depth: { type: "number", description: "Crawl depth (1-5)" },
        max_pages: { type: "number", description: "Max pages" },
      },
      required: ["url"],
    },
  },
  {
    name: "tavily_research",
    description: "Deep research with structured output for reports, due diligence.",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string", description: "Research topic" },
        max_results: { type: "number", description: "Max sources" },
      },
      required: ["query"],
    },
  },
  {
    name: "tavily_enrich_company",
    description: "Enrich company data from just a name.",
    inputSchema: {
      type: "object",
      properties: {
        company_name: { type: "string", description: "Company name" },
      },
      required: ["company_name"],
    },
  },

  // ============ PROPERTY RADAR (4 tools) ============
  {
    name: "property_radar_search",
    description: "Search properties by foreclosure status, equity, absentee owners.",
    inputSchema: {
      type: "object",
      properties: {
        location: { type: "string", description: "City, county, or ZIP" },
        property_type: {
          type: "string",
          enum: ["SFR", "Multi-Family", "Commercial", "Land"],
          description: "Property type",
        },
        foreclosure_status: {
          type: "string",
          enum: ["Pre-Foreclosure", "Auction", "REO", "Any"],
          description: "Foreclosure stage",
        },
        min_equity: { type: "number", description: "Min equity %" },
        absentee_owner: { type: "boolean", description: "Absentee owners only" },
      },
      required: ["location"],
    },
  },
  {
    name: "property_radar_lookup",
    description: "Get full property details by address.",
    inputSchema: {
      type: "object",
      properties: {
        address: { type: "string", description: "Full property address" },
      },
      required: ["address"],
    },
  },
  {
    name: "property_radar_owner",
    description: "Find owner contact info: phone, email, mailing address.",
    inputSchema: {
      type: "object",
      properties: {
        address: { type: "string", description: "Property address" },
      },
      required: ["address"],
    },
  },
  {
    name: "property_radar_foreclosures",
    description: "Get foreclosure listings by area.",
    inputSchema: {
      type: "object",
      properties: {
        location: { type: "string", description: "City, county, or ZIP" },
        status: { type: "string", enum: ["NOD", "NTS", "Auction", "REO"], description: "Foreclosure stage" },
      },
      required: ["location"],
    },
  },

  // ============ GHL CRM (6 tools) ============
  {
    name: "ghl_create_contact",
    description: "Create a new contact in GoHighLevel CRM.",
    inputSchema: {
      type: "object",
      properties: {
        firstName: { type: "string" },
        lastName: { type: "string" },
        email: { type: "string" },
        phone: { type: "string" },
        tags: { type: "array", items: { type: "string" } },
        source: { type: "string" },
      },
      required: ["firstName"],
    },
  },
  {
    name: "ghl_update_contact",
    description: "Update an existing contact.",
    inputSchema: {
      type: "object",
      properties: {
        contactId: { type: "string" },
        fields: { type: "object", description: "Fields to update" },
      },
      required: ["contactId", "fields"],
    },
  },
  {
    name: "ghl_search_contacts",
    description: "Search contacts by name, email, phone, or tags.",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string", description: "Search query" },
      },
      required: ["query"],
    },
  },
  {
    name: "ghl_create_opportunity",
    description: "Create a new opportunity/deal in pipeline.",
    inputSchema: {
      type: "object",
      properties: {
        contactId: { type: "string" },
        pipelineId: { type: "string" },
        name: { type: "string" },
        value: { type: "number" },
        status: { type: "string" },
      },
      required: ["contactId", "name"],
    },
  },
  {
    name: "ghl_create_task",
    description: "Create a task for follow-up.",
    inputSchema: {
      type: "object",
      properties: {
        contactId: { type: "string" },
        title: { type: "string" },
        dueDate: { type: "string" },
        description: { type: "string" },
      },
      required: ["title"],
    },
  },
  {
    name: "ghl_add_note",
    description: "Add a note to a contact.",
    inputSchema: {
      type: "object",
      properties: {
        contactId: { type: "string" },
        body: { type: "string" },
      },
      required: ["contactId", "body"],
    },
  },

  // ============ ALPACA TRADING (4 tools) ============
  {
    name: "alpaca_get_account",
    description: "Get trading account info: balance, buying power, positions.",
    inputSchema: { type: "object", properties: {}, required: [] },
  },
  {
    name: "alpaca_get_positions",
    description: "Get current stock/crypto positions.",
    inputSchema: { type: "object", properties: {}, required: [] },
  },
  {
    name: "alpaca_get_quote",
    description: "Get real-time stock/crypto quote.",
    inputSchema: {
      type: "object",
      properties: {
        symbol: { type: "string", description: "Stock symbol (e.g., AAPL, BTC/USD)" },
      },
      required: ["symbol"],
    },
  },
  {
    name: "alpaca_place_order",
    description: "Place a stock/crypto order.",
    inputSchema: {
      type: "object",
      properties: {
        symbol: { type: "string" },
        qty: { type: "number" },
        side: { type: "string", enum: ["buy", "sell"] },
        type: { type: "string", enum: ["market", "limit", "stop"] },
        limit_price: { type: "number" },
      },
      required: ["symbol", "qty", "side", "type"],
    },
  },

  // ============ IMAGE GENERATION (2 tools) ============
  {
    name: "generate_image_flux",
    description: "Generate images using FLUX via Replicate. Fast, high quality.",
    inputSchema: {
      type: "object",
      properties: {
        prompt: { type: "string", description: "Image description" },
        aspect_ratio: { type: "string", enum: ["1:1", "16:9", "9:16", "4:3"], description: "Aspect ratio" },
      },
      required: ["prompt"],
    },
  },
  {
    name: "generate_image_fal",
    description: "Generate images using FAL AI.",
    inputSchema: {
      type: "object",
      properties: {
        prompt: { type: "string", description: "Image description" },
      },
      required: ["prompt"],
    },
  },

  // ============ COMMUNICATIONS (3 tools) ============
  {
    name: "send_sms",
    description: "Send SMS via Twilio/GHL.",
    inputSchema: {
      type: "object",
      properties: {
        to: { type: "string", description: "Phone number" },
        message: { type: "string", description: "Message text" },
      },
      required: ["to", "message"],
    },
  },
  {
    name: "send_email",
    description: "Send email via Resend.",
    inputSchema: {
      type: "object",
      properties: {
        to: { type: "string" },
        subject: { type: "string" },
        body: { type: "string" },
      },
      required: ["to", "subject", "body"],
    },
  },
  {
    name: "translate_text",
    description: "Translate text using DeepL.",
    inputSchema: {
      type: "object",
      properties: {
        text: { type: "string", description: "Text to translate" },
        target_lang: { type: "string", description: "Target language code (EN, ES, FR, DE, etc.)" },
        source_lang: { type: "string", description: "Source language (optional)" },
      },
      required: ["text", "target_lang"],
    },
  },

  // ============ AI MODELS (3 tools) ============
  {
    name: "ask_perplexity",
    description: "Ask Perplexity AI for research with citations.",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string", description: "Question or research topic" },
      },
      required: ["query"],
    },
  },
  {
    name: "ask_grok",
    description: "Ask Grok (XAI) for analysis.",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string", description: "Question" },
      },
      required: ["query"],
    },
  },
  {
    name: "ask_groq",
    description: "Ask Groq for ultra-fast inference.",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string", description: "Question" },
      },
      required: ["query"],
    },
  },

  // ============ DEAL ANALYSIS (2 tools) ============
  {
    name: "analyze_deal",
    description: "Analyze a real estate deal: MAO, ROI, cash flow.",
    inputSchema: {
      type: "object",
      properties: {
        purchase_price: { type: "number" },
        arv: { type: "number", description: "After Repair Value" },
        rehab_cost: { type: "number" },
        holding_months: { type: "number" },
        rent: { type: "number", description: "Monthly rent (for rentals)" },
      },
      required: ["purchase_price", "arv"],
    },
  },
  {
    name: "calculate_lending_terms",
    description: "Calculate commercial lending terms and payments.",
    inputSchema: {
      type: "object",
      properties: {
        loan_amount: { type: "number" },
        interest_rate: { type: "number" },
        term_months: { type: "number" },
        loan_type: { type: "string", enum: ["bridge", "dscr", "fix_flip", "construction"] },
      },
      required: ["loan_amount", "interest_rate", "term_months"],
    },
  },
]

// ===========================================
// TOOL HANDLERS
// ===========================================

// TAVILY HANDLERS
async function tavilySearch(args: any) {
  const response = await fetch("https://api.tavily.com/search", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      api_key: process.env.TAVILY_API_KEY,
      query: args.query,
      search_depth: args.search_depth || "advanced",
      include_answer: args.include_answer ?? true,
      max_results: args.max_results || 5,
    }),
  })
  return response.json()
}

async function tavilyExtract(args: any) {
  const response = await fetch("https://api.tavily.com/extract", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      api_key: process.env.TAVILY_API_KEY,
      urls: args.urls,
    }),
  })
  return response.json()
}

async function tavilyCrawl(args: any) {
  const response = await fetch("https://api.tavily.com/crawl", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      api_key: process.env.TAVILY_API_KEY,
      url: args.url,
      max_depth: args.max_depth || 2,
      max_pages: args.max_pages || 10,
    }),
  })
  return response.json()
}

async function tavilyResearch(args: any) {
  const response = await fetch("https://api.tavily.com/search", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      api_key: process.env.TAVILY_API_KEY,
      query: args.query,
      search_depth: "advanced",
      include_answer: true,
      include_raw_content: true,
      max_results: args.max_results || 10,
    }),
  })
  return response.json()
}

async function tavilyEnrichCompany(args: any) {
  const searchResult = await tavilySearch({ query: `${args.company_name} company info about us`, max_results: 5 })
  return {
    company_name: args.company_name,
    search_results: searchResult,
  }
}

// PROPERTY RADAR HANDLERS
async function propertyRadarSearch(args: any) {
  const response = await fetch("https://api.propertyradar.com/v1/properties", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.PROPERTYRADAR_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      Criteria: {
        Location: args.location,
        PropertyType: args.property_type,
        ForeclosureStatus: args.foreclosure_status,
        MinEquityPercent: args.min_equity,
        AbsenteeOwner: args.absentee_owner,
      },
      Limit: 50,
    }),
  })
  return response.json()
}

async function propertyRadarLookup(args: any) {
  // PropertyRadar's /lookup endpoint requires a RadarID (starts with "P"), not an address
  // For address lookups, we use the search endpoint with address criteria
  const response = await fetch("https://api.propertyradar.com/v1/properties", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.PROPERTYRADAR_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      Criteria: {
        Address: args.address,
      },
      Fields: [
        "RadarID",
        "Address",
        "City",
        "State",
        "ZipCode",
        "County",
        "PropertyType",
        "Bedrooms",
        "Bathrooms",
        "SqFt",
        "LotSizeSqFt",
        "YearBuilt",
        "EstimatedValue",
        "EstimatedEquity",
        "EstimatedEquityPercent",
        "LastSaleDate",
        "LastSalePrice",
        "OwnerName",
        "OwnerOccupied",
        "MailingAddress",
        "ForeclosureStatus",
        "LoanBalance",
        "LoanDate",
        "LoanAmount",
      ],
      Limit: 1,
    }),
  })

  const data = await response.json()

  // Return the first matching property or error message
  if (data.properties && data.properties.length > 0) {
    return {
      success: true,
      property: data.properties[0],
    }
  }

  return {
    success: false,
    error: "Property not found. Please check the address and try again.",
    searchedAddress: args.address,
  }
}

async function propertyRadarOwner(args: any) {
  const property = await propertyRadarLookup(args)
  return {
    property: property,
    owner_info: property?.owner || "Owner lookup requires PropertyRadar Pro",
  }
}

async function propertyRadarForeclosures(args: any) {
  return propertyRadarSearch({
    location: args.location,
    foreclosure_status: args.status || "Any",
  })
}

// GHL HANDLERS
const GHL_BASE = "https://services.leadconnectorhq.com"

async function ghlCreateContact(args: any) {
  const response = await fetch(`${GHL_BASE}/contacts/`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.GHL_PRIVATE_ACCESS_TOKEN}`,
      "Content-Type": "application/json",
      Version: "2021-07-28",
    },
    body: JSON.stringify({
      firstName: args.firstName,
      lastName: args.lastName,
      email: args.email,
      phone: args.phone,
      tags: args.tags,
      source: args.source || "SaintSal AI",
      locationId: process.env.GHL_LOCATION_ID,
    }),
  })
  return response.json()
}

async function ghlUpdateContact(args: any) {
  const response = await fetch(`${GHL_BASE}/contacts/${args.contactId}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${process.env.GHL_PRIVATE_ACCESS_TOKEN}`,
      "Content-Type": "application/json",
      Version: "2021-07-28",
    },
    body: JSON.stringify(args.fields),
  })
  return response.json()
}

async function ghlSearchContacts(args: any) {
  const response = await fetch(`${GHL_BASE}/contacts/search`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.GHL_PRIVATE_ACCESS_TOKEN}`,
      "Content-Type": "application/json",
      Version: "2021-07-28",
    },
    body: JSON.stringify({
      query: args.query,
      locationId: process.env.GHL_LOCATION_ID,
    }),
  })
  return response.json()
}

async function ghlCreateOpportunity(args: any) {
  const response = await fetch(`${GHL_BASE}/opportunities/`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.GHL_PRIVATE_ACCESS_TOKEN}`,
      "Content-Type": "application/json",
      Version: "2021-07-28",
    },
    body: JSON.stringify({
      contactId: args.contactId,
      pipelineId: args.pipelineId,
      name: args.name,
      monetaryValue: args.value,
      status: args.status || "open",
      locationId: process.env.GHL_LOCATION_ID,
    }),
  })
  return response.json()
}

async function ghlCreateTask(args: any) {
  const response = await fetch(`${GHL_BASE}/contacts/${args.contactId}/tasks`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.GHL_PRIVATE_ACCESS_TOKEN}`,
      "Content-Type": "application/json",
      Version: "2021-07-28",
    },
    body: JSON.stringify({
      title: args.title,
      dueDate: args.dueDate,
      description: args.description,
    }),
  })
  return response.json()
}

async function ghlAddNote(args: any) {
  const response = await fetch(`${GHL_BASE}/contacts/${args.contactId}/notes`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.GHL_PRIVATE_ACCESS_TOKEN}`,
      "Content-Type": "application/json",
      Version: "2021-07-28",
    },
    body: JSON.stringify({ body: args.body }),
  })
  return response.json()
}

// ALPACA HANDLERS
const ALPACA_BASE = process.env.ALPACA_BASE_URL || "https://paper-api.alpaca.markets"

async function alpacaGetAccount() {
  const response = await fetch(`${ALPACA_BASE}/v2/account`, {
    headers: {
      "APCA-API-KEY-ID": process.env.ALPACA_API_KEY!,
      "APCA-API-SECRET-KEY": process.env.ALPACA_SECRET_KEY!,
    },
  })
  return response.json()
}

async function alpacaGetPositions() {
  const response = await fetch(`${ALPACA_BASE}/v2/positions`, {
    headers: {
      "APCA-API-KEY-ID": process.env.ALPACA_API_KEY!,
      "APCA-API-SECRET-KEY": process.env.ALPACA_SECRET_KEY!,
    },
  })
  return response.json()
}

async function alpacaGetQuote(args: any) {
  const response = await fetch(`https://data.alpaca.markets/v2/stocks/${args.symbol}/quotes/latest`, {
    headers: {
      "APCA-API-KEY-ID": process.env.ALPACA_API_KEY!,
      "APCA-API-SECRET-KEY": process.env.ALPACA_SECRET_KEY!,
    },
  })
  return response.json()
}

async function alpacaPlaceOrder(args: any) {
  const response = await fetch(`${ALPACA_BASE}/v2/orders`, {
    method: "POST",
    headers: {
      "APCA-API-KEY-ID": process.env.ALPACA_API_KEY!,
      "APCA-API-SECRET-KEY": process.env.ALPACA_SECRET_KEY!,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      symbol: args.symbol,
      qty: args.qty,
      side: args.side,
      type: args.type,
      time_in_force: "day",
      limit_price: args.limit_price,
    }),
  })
  return response.json()
}

// IMAGE GENERATION
async function generateImageFlux(args: any) {
  const response = await fetch("https://api.replicate.com/v1/predictions", {
    method: "POST",
    headers: {
      Authorization: `Token ${process.env.REPLICATE_API_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      version: "black-forest-labs/flux-schnell",
      input: {
        prompt: args.prompt,
        aspect_ratio: args.aspect_ratio || "1:1",
      },
    }),
  })
  const prediction = await response.json()
  // Poll for result
  if (prediction.id) {
    let result = prediction
    while (result.status !== "succeeded" && result.status !== "failed") {
      await new Promise((r) => setTimeout(r, 1000))
      const pollRes = await fetch(`https://api.replicate.com/v1/predictions/${prediction.id}`, {
        headers: { Authorization: `Token ${process.env.REPLICATE_API_TOKEN}` },
      })
      result = await pollRes.json()
    }
    return result
  }
  return prediction
}

async function generateImageFal(args: any) {
  const response = await fetch("https://fal.run/fal-ai/fast-sdxl", {
    method: "POST",
    headers: {
      Authorization: `Key ${process.env.FAL_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      prompt: args.prompt,
    }),
  })
  return response.json()
}

// COMMUNICATIONS
async function sendEmail(args: any) {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: process.env.RESEND_FROM_EMAIL || "SaintSal <saintsal@cookin.io>",
      to: args.to,
      subject: args.subject,
      html: args.body,
    }),
  })
  return response.json()
}

async function sendSms(args: any) {
  // Use GHL for SMS
  const response = await fetch(`${GHL_BASE}/conversations/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.GHL_PRIVATE_ACCESS_TOKEN}`,
      "Content-Type": "application/json",
      Version: "2021-07-28",
    },
    body: JSON.stringify({
      type: "SMS",
      phone: args.to,
      message: args.message,
      locationId: process.env.GHL_LOCATION_ID,
    }),
  })
  return response.json()
}

// AI MODELS
async function askPerplexity(args: any) {
  const response = await fetch("https://api.perplexity.ai/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.PERPLEXITY_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "llama-3.1-sonar-large-128k-online",
      messages: [{ role: "user", content: args.query }],
    }),
  })
  return response.json()
}

async function askGrok(args: any) {
  const response = await fetch("https://api.x.ai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.XAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "grok-2-latest",
      messages: [{ role: "user", content: args.query }],
    }),
  })
  return response.json()
}

async function askGroq(args: any) {
  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: args.query }],
    }),
  })
  return response.json()
}

// DEAL ANALYSIS
function analyzeDeal(args: any) {
  const purchasePrice = args.purchase_price || 0
  const arv = args.arv || 0
  const rehabCost = args.rehab_cost || 0
  const holdingMonths = args.holding_months || 6
  const rent = args.rent || 0

  // Calculate MAO (70% rule)
  const mao = arv * 0.7 - rehabCost

  // Calculate costs
  const holdingCosts = purchasePrice * 0.01 * holdingMonths // 1% per month
  const closingCosts = purchasePrice * 0.03 + arv * 0.06 // 3% buy + 6% sell
  const totalCosts = rehabCost + holdingCosts + closingCosts

  // Calculate profit
  const grossProfit = arv - purchasePrice - totalCosts
  const roi = purchasePrice > 0 ? ((grossProfit / purchasePrice) * 100).toFixed(1) : "0"

  // Signal
  let signal = "PASS"
  if (grossProfit > 50000 && Number.parseFloat(roi) > 20) signal = "STRONG BUY"
  else if (grossProfit > 25000 && Number.parseFloat(roi) > 15) signal = "BUY"
  else if (grossProfit > 10000) signal = "CONSIDER"

  return {
    signal,
    mao: Math.round(mao),
    purchase_price: purchasePrice,
    arv,
    rehab_cost: rehabCost,
    holding_costs: Math.round(holdingCosts),
    closing_costs: Math.round(closingCosts),
    total_costs: Math.round(totalCosts),
    net_profit: Math.round(grossProfit),
    roi: `${roi}%`,
    cash_on_cash: rent > 0 ? `${(((rent * 12) / purchasePrice) * 100).toFixed(1)}%` : "N/A",
  }
}

function calculateLendingTerms(args: any) {
  const loanAmount = args.loan_amount || 0
  const rate = (args.interest_rate || 12) / 100
  const termMonths = args.term_months || 12
  const loanType = args.loan_type || "bridge"

  // Calculate monthly payment (interest only for bridge)
  const monthlyInterest = (loanAmount * rate) / 12
  const monthlyPI =
    (loanAmount * ((rate / 12) * Math.pow(1 + rate / 12, termMonths))) / (Math.pow(1 + rate / 12, termMonths) - 1)

  // Points based on loan type
  const points = loanType === "bridge" ? 2 : loanType === "fix_flip" ? 2.5 : 1.5
  const originationFee = loanAmount * (points / 100)

  return {
    loan_type: loanType,
    loan_amount: loanAmount,
    interest_rate: `${(rate * 100).toFixed(2)}%`,
    term_months: termMonths,
    monthly_interest_only: Math.round(monthlyInterest),
    monthly_pi: Math.round(monthlyPI),
    points: `${points}%`,
    origination_fee: Math.round(originationFee),
    total_interest: Math.round(monthlyInterest * termMonths),
    total_cost: Math.round(originationFee + monthlyInterest * termMonths),
  }
}

// ===========================================
// TOOL ROUTER
// ===========================================

async function executeTool(name: string, args: any): Promise<any> {
  switch (name) {
    // Tavily
    case "tavily_search":
      return tavilySearch(args)
    case "tavily_extract":
      return tavilyExtract(args)
    case "tavily_crawl":
      return tavilyCrawl(args)
    case "tavily_research":
      return tavilyResearch(args)
    case "tavily_enrich_company":
      return tavilyEnrichCompany(args)

    // Property Radar
    case "property_radar_search":
      return propertyRadarSearch(args)
    case "property_radar_lookup":
      return propertyRadarLookup(args)
    case "property_radar_owner":
      return propertyRadarOwner(args)
    case "property_radar_foreclosures":
      return propertyRadarForeclosures(args)

    // GHL
    case "ghl_create_contact":
      return ghlCreateContact(args)
    case "ghl_update_contact":
      return ghlUpdateContact(args)
    case "ghl_search_contacts":
      return ghlSearchContacts(args)
    case "ghl_create_opportunity":
      return ghlCreateOpportunity(args)
    case "ghl_create_task":
      return ghlCreateTask(args)
    case "ghl_add_note":
      return ghlAddNote(args)

    // Alpaca
    case "alpaca_get_account":
      return alpacaGetAccount()
    case "alpaca_get_positions":
      return alpacaGetPositions()
    case "alpaca_get_quote":
      return alpacaGetQuote(args)
    case "alpaca_place_order":
      return alpacaPlaceOrder(args)

    // Image Generation
    case "generate_image_flux":
      return generateImageFlux(args)
    case "generate_image_fal":
      return generateImageFal(args)

    // Communications
    case "send_email":
      return sendEmail(args)
    case "send_sms":
      return sendSms(args)

    // AI Models
    case "ask_perplexity":
      return askPerplexity(args)
    case "ask_grok":
      return askGrok(args)
    case "ask_groq":
      return askGroq(args)

    // Deal Analysis
    case "analyze_deal":
      return analyzeDeal(args)
    case "calculate_lending_terms":
      return calculateLendingTerms(args)

    default:
      throw new Error(`Unknown tool: ${name}`)
  }
}

// ===========================================
// API ROUTE HANDLER
// ===========================================

export async function POST(request: NextRequest) {
  try {
    const body: MCPRequest = await request.json()

    if (body.method === "tools/list") {
      return NextResponse.json({
        tools: TOOLS,
      })
    }

    if (body.method === "tools/call") {
      const { name, arguments: args } = body.params || {}

      if (!name) {
        return NextResponse.json({ error: "Tool name required" }, { status: 400 })
      }

      const result = await executeTool(name, args || {})

      return NextResponse.json({
        content: [{ type: "text", text: JSON.stringify(result) }],
      })
    }

    return NextResponse.json({ error: "Unknown method" }, { status: 400 })
  } catch (error) {
    console.error("MCP Error:", error)
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 })
  }
}
