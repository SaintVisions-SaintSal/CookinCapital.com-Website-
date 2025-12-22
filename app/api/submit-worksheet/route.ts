import { type NextRequest, NextResponse } from "next/server"

const GHL_WEBHOOK_URL =
  "https://services.leadconnectorhq.com/hooks/NgUphdsMGXpRO3h98XyG/webhook-trigger/54508394-0b3b-425e-a840-b68c159933fe"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { dealData, calculations } = body

    const propertyAddress =
      `${dealData.address || ""}, ${dealData.city || ""}, ${dealData.state || ""} ${dealData.zip || ""}`
        .trim()
        .replace(/^,\s*/, "")

    console.log("[v0] Worksheet submission received for:", propertyAddress)

    // Format timestamp
    const timestamp = new Date().toLocaleString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZoneName: "short",
    })

    // Determine signal based on ROI
    const roi = calculations?.roi || 0
    let signal = "HOLD"
    if (roi >= 30) signal = "STRONG BUY"
    else if (roi >= 20) signal = "BUY"
    else if (roi >= 10) signal = "CONSIDER"
    else if (roi < 0) signal = "AVOID"

    // Format currency helper
    const formatCurrency = (val: number) =>
      new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0 }).format(val || 0)

    // Build worksheet content
    const worksheetContent = `
================================================================================
                    COOKINCAPITAL DEAL WORKSHEET
================================================================================
Generated: ${timestamp}

================================================================================
                         PROPERTY INFORMATION
================================================================================

Address:        ${propertyAddress || "Not specified"}
Property Type:  ${dealData.propertyType || "N/A"}
Bedrooms:       ${dealData.bedrooms || 0}
Bathrooms:      ${dealData.bathrooms || 0}
Square Feet:    ${dealData.sqft?.toLocaleString() || 0}
Year Built:     ${dealData.yearBuilt || "N/A"}
Lot Size:       ${dealData.lotSize || 0} acres

================================================================================
                         PRICING & VALUES
================================================================================

Asking Price:       ${formatCurrency(dealData.askingPrice)}
Purchase Price:     ${formatCurrency(dealData.purchasePrice)}
After Repair Value: ${formatCurrency(dealData.arv)}
ARV per Sq Ft:      ${formatCurrency(calculations?.arvPerSqft || 0)}

================================================================================
                         REHAB BUDGET
================================================================================

Total Rehab Cost:   ${formatCurrency(calculations?.totalRehabCost || 0)}
Cost per Sq Ft:     ${formatCurrency(calculations?.costPerSqft || 0)}

================================================================================
                         FINANCING
================================================================================

Financing Type:     ${dealData.financingType || "N/A"}
Loan Amount:        ${formatCurrency(dealData.loanAmount)}
Interest Rate:      ${dealData.interestRate || 0}%
Loan Term:          ${dealData.loanTermMonths || 0} months
Points:             ${dealData.loanPoints || 0}%
Points Cost:        ${formatCurrency(calculations?.pointsCost || 0)}
Total Interest:     ${formatCurrency(calculations?.totalInterest || 0)}

================================================================================
                         HOLDING COSTS
================================================================================

Holding Period:     ${dealData.holdingPeriodMonths || 0} months
Monthly Taxes:      ${formatCurrency(dealData.monthlyTaxes)}
Monthly Insurance:  ${formatCurrency(dealData.monthlyInsurance)}
Monthly Utilities:  ${formatCurrency(dealData.monthlyUtilities)}
Monthly HOA:        ${formatCurrency(dealData.monthlyHOA)}
Monthly Total:      ${formatCurrency(calculations?.monthlyHolding || 0)}
Total Holding:      ${formatCurrency(calculations?.totalHoldingCosts || 0)}

================================================================================
                         TRANSACTION COSTS
================================================================================

Buying Costs:       ${formatCurrency(calculations?.totalBuyingCosts || 0)}
Selling Costs:      ${formatCurrency(calculations?.totalSellingCosts || 0)}
Agent Commission:   ${dealData.agentCommissionPercent || 0}%

================================================================================
                         PROFIT ANALYSIS
================================================================================

Total Investment:   ${formatCurrency(calculations?.totalInvestment || 0)}
Cash Needed:        ${formatCurrency(calculations?.cashNeeded || 0)}
Net Proceeds:       ${formatCurrency((dealData.arv || 0) - (calculations?.totalSellingCosts || 0))}
Total Profit:       ${formatCurrency(calculations?.totalProfit || 0)}
ROI:                ${(calculations?.roi || 0).toFixed(1)}%
Equity at Purchase: ${formatCurrency(calculations?.equityAtPurchase || 0)}

================================================================================
                         SAINTSAL™ ANALYSIS
================================================================================

SIGNAL:             ${signal}
Max Allowable Offer: ${formatCurrency(calculations?.maxAllowableOffer || 0)}
% of ARV:           ${(calculations?.percentOfArv || 0).toFixed(1)}%
Profit per Sq Ft:   ${formatCurrency(calculations?.profitPerSqft || 0)}

================================================================================
Generated by CookinCapital Command Center
Powered by SaintSal™ + HACP™
================================================================================
    `.trim()

    // Send to GHL webhook
    const ghlPayload = {
      email: "worksheet@cookincap.com",
      first_name: "Deal",
      last_name: "Worksheet",
      form_type: "Deal Analyzer Worksheet",
      property_address: propertyAddress,
      signal: signal,
      roi: roi.toFixed(1),
      projected_profit: calculations?.totalProfit || 0,
      note_content: worksheetContent,
      submitted_at: timestamp,
    }

    const ghlResponse = await fetch(GHL_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(ghlPayload),
    })

    console.log("[v0] GHL webhook response:", ghlResponse.status)

    // Send email via Resend
    const resendApiKey = process.env.RESEND_API_KEY
    if (resendApiKey) {
      const profit = calculations?.totalProfit || 0
      const emailHtml = `
        <div style="font-family: 'Courier New', monospace; background: #0a0a0a; color: #fafafa; padding: 40px; max-width: 800px; margin: 0 auto;">
          <div style="border: 2px solid #22c55e; border-radius: 12px; padding: 24px; margin-bottom: 24px; background: rgba(34, 197, 94, 0.1);">
            <h1 style="margin: 0 0 8px 0; font-size: 24px; color: #22c55e;">New Deal Worksheet Submitted</h1>
            <p style="margin: 0; color: #a1a1aa;">Property: ${propertyAddress || "Not specified"}</p>
          </div>
          
          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 24px;">
            <div style="background: #1a1a1a; border-radius: 8px; padding: 16px; text-align: center;">
              <p style="margin: 0 0 4px 0; font-size: 12px; color: #a1a1aa; text-transform: uppercase;">Signal</p>
              <p style="margin: 0; font-size: 20px; font-weight: bold; color: ${signal === "STRONG BUY" || signal === "BUY" ? "#22c55e" : signal === "CONSIDER" ? "#eab308" : "#ef4444"};">${signal}</p>
            </div>
            <div style="background: #1a1a1a; border-radius: 8px; padding: 16px; text-align: center;">
              <p style="margin: 0 0 4px 0; font-size: 12px; color: #a1a1aa; text-transform: uppercase;">ROI</p>
              <p style="margin: 0; font-size: 20px; font-weight: bold; color: #fafafa;">${roi.toFixed(1)}%</p>
            </div>
            <div style="background: #1a1a1a; border-radius: 8px; padding: 16px; text-align: center;">
              <p style="margin: 0 0 4px 0; font-size: 12px; color: #a1a1aa; text-transform: uppercase;">Profit</p>
              <p style="margin: 0; font-size: 20px; font-weight: bold; color: ${profit >= 0 ? "#22c55e" : "#ef4444"};">${formatCurrency(profit)}</p>
            </div>
          </div>

          <div style="background: #1a1a1a; border-radius: 8px; padding: 24px; margin-bottom: 24px;">
            <h2 style="margin: 0 0 16px 0; font-size: 16px; color: #fafafa;">Full Worksheet</h2>
            <pre style="margin: 0; font-size: 11px; line-height: 1.5; color: #d4d4d4; white-space: pre-wrap; overflow-x: auto;">${worksheetContent}</pre>
          </div>

          <div style="text-align: center; padding-top: 24px; border-top: 1px solid #333;">
            <p style="margin: 0; font-size: 12px; color: #666;">
              CookinCap | Saint Vision Group | Powered by SaintSal™ + HACP™
            </p>
          </div>
        </div>
      `

      const resendResponse = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "CookinCap Applications <noreply@applications.cookincap.com>",
          to: ["support@cookin.io"],
          subject: `Deal Worksheet: ${propertyAddress || "New Analysis"} - ${signal}`,
          html: emailHtml,
        }),
      })

      const resendResult = await resendResponse.json()
      console.log("[v0] Resend response:", resendResult)
    }

    return NextResponse.json({
      success: true,
      message: "Worksheet submitted successfully",
    })
  } catch (error) {
    console.error("[v0] Worksheet submission error:", error)
    return NextResponse.json({ success: false, error: "Failed to submit worksheet" }, { status: 500 })
  }
}
