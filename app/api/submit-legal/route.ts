import { type NextRequest, NextResponse } from "next/server"
import { sendEmail } from "@/lib/email"

const GHL_WEBHOOK_URL =
  "https://services.leadconnectorhq.com/hooks/NgUphdsMGXpRO3h98XyG/webhook-trigger/54508394-0b3b-425e-a840-b68c159933fe"

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()

    const caseId = `LEGAL-${Date.now().toString(36).toUpperCase()}`
    const timestamp = new Date().toLocaleString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      timeZoneName: "short",
    })

    const ltv = data.propertyValue && data.mortgageBalance ? (data.mortgageBalance / data.propertyValue) * 100 : 0
    const equity = data.propertyValue && data.mortgageBalance ? data.propertyValue - data.mortgageBalance : 0

    const emailContent = `
================================================================================
           COOKINCAP LEGAL SERVICES - NEW CASE INTAKE
                   Powered by SaintSal™ + HACP™
================================================================================

CASE ID: ${caseId}
SUBMITTED: ${timestamp}
${data.urgencyLevel === "Urgent" || data.urgencyLevel === "Critical" ? `\n⚠️  URGENCY: ${data.urgencyLevel?.toUpperCase()}\n` : ""}

--------------------------------------------------------------------------------
                        PROPERTY INFORMATION
--------------------------------------------------------------------------------

Property Address:       ${data.propertyAddress || "Not provided"}
City, State, ZIP:       ${data.cityStateZip || "Not provided"}
Case Type:              ${data.caseType || "Not provided"}

Current Situation:
${data.currentSituation || "Not provided"}

--------------------------------------------------------------------------------
                        FINANCIAL DETAILS
--------------------------------------------------------------------------------

Mortgage Balance:       $${data.mortgageBalance?.toLocaleString() || "0"}
Monthly Payment:        $${data.monthlyPayment?.toLocaleString() || "0"}
Arrears Amount:         $${data.arrearsAmount?.toLocaleString() || "0"}
Months Behind:          ${data.monthsBehind || "0"}
Property Value:         $${data.propertyValue?.toLocaleString() || "0"}
Household Income:       $${data.householdIncome?.toLocaleString() || "0"}/mo

--------------------------------------------------------------------------------
                        CONTACT INFORMATION
--------------------------------------------------------------------------------

Full Name:              ${data.fullName || "Not provided"}
Email:                  ${data.email || "Not provided"}
Phone:                  ${data.phone || "Not provided"}

--------------------------------------------------------------------------------
                        URGENCY ASSESSMENT
--------------------------------------------------------------------------------

Foreclosure Sale Date:  ${data.saleDate || "Not provided"}
Urgency Level:          ${data.urgencyLevel || "Standard"}

--------------------------------------------------------------------------------
                      SAINTSAL™ ANALYSIS
--------------------------------------------------------------------------------

Loan-to-Value (LTV):    ${ltv ? ltv.toFixed(1) + "%" : "N/A"}
Equity Position:        $${equity ? equity.toLocaleString() : "0"}

================================================================================
                           END OF INTAKE
================================================================================
         Submitted via CookinCap Legal Services Portal
            FlipEffective Legal - darren@flipeffective.com
        CookinCap | Saint Vision Group | Powered by SaintSal™ + HACP™
             438 Main St, Huntington Beach, CA 92648 | 949-997-2097
================================================================================
`

    // Send to GHL webhook
    try {
      const ghlResponse = await fetch(GHL_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: data.email || "",
          form_type: "Legal Case",
          note_content: emailContent,
          case_id: caseId,
          first_name: data.fullName?.split(" ")[0] || "",
          last_name: data.fullName?.split(" ").slice(1).join(" ") || "",
          phone: data.phone,
          case_type: data.caseType,
          property_address: data.propertyAddress,
          urgency_level: data.urgencyLevel,
        }),
      })
      console.log("[v0] GHL webhook response:", ghlResponse.status)
    } catch (ghlError) {
      console.error("[v0] GHL webhook error:", ghlError)
    }

    // Send to Darren via Resend
    try {
      await sendEmail({
        to: "darren@flipeffective.com",
        cc: "support@cookin.io",
        subject: `${data.urgencyLevel === "Urgent" || data.urgencyLevel === "Critical" ? "🚨 URGENT: " : ""}New Legal Case: ${data.caseType || "General"} - ${data.fullName || "Unknown"} - ${caseId}`,
        text: emailContent,
      })
    } catch (emailError) {
      console.error("[v0] Team email error:", emailError)
    }

    // Send confirmation to client
    if (data.email) {
      try {
        const clientConfirmation = `
================================================================================
                    YOUR LEGAL CASE HAS BEEN RECEIVED
                      CookinCapital Legal Services
                   Powered by SaintSal™ + HACP™
================================================================================

Dear ${data.fullName?.split(" ")[0] || "Valued Client"},

We have received your legal services request and Darren from FlipEffective
Legal is personally reviewing your case.

--------------------------------------------------------------------------------
                           CASE DETAILS
--------------------------------------------------------------------------------

Case ID:                ${caseId}
Case Type:              ${data.caseType || "General Consultation"}
Property:               ${data.propertyAddress || "N/A"}
Submitted:              ${timestamp}

--------------------------------------------------------------------------------
                       YOUR LEGAL SPECIALIST
--------------------------------------------------------------------------------

Darren - FlipEffective Legal
Email: darren@flipeffective.com
Phone: (833) 524-2464

Darren specializes in foreclosure defense, loan modifications, bankruptcy
workouts, and real estate legal protection. He will be reaching out to you
as soon as he reviews your case.

--------------------------------------------------------------------------------
                         WHAT HAPPENS NEXT
--------------------------------------------------------------------------------

1. Darren will review your case details within 24 hours
2. He will contact you directly to discuss your options
3. Together, you'll create a strategy to protect your interests

${
  data.urgencyLevel === "Urgent" || data.urgencyLevel === "Critical"
    ? `
================================================================================
                      *** URGENT CASE NOTICE ***
================================================================================

Your case has been flagged as ${data.urgencyLevel?.toUpperCase()}. 
Darren will contact you within the next few hours.
`
    : ""
}

We understand you may be going through a difficult time. Darren and the
CookinCapital team are here to help you navigate your options and protect
your property and your family's future.

================================================================================
                      CookinCapital Legal Services
                     Powered by FlipEffective Legal
        CookinCap | Saint Vision Group | Powered by SaintSal™ + HACP™
             438 Main St, Huntington Beach, CA 92648 | 949-997-2097
================================================================================
`
        await sendEmail({
          to: data.email,
          subject: `Legal Case Received - Darren Will Contact You Soon - ${caseId}`,
          text: clientConfirmation,
        })
        console.log("[v0] Client confirmation sent to:", data.email)
      } catch (clientError) {
        console.error("[v0] Client email error:", clientError)
      }
    }

    return NextResponse.json({
      success: true,
      caseId,
      message: "Case submitted successfully to FlipEffective Legal Services",
    })
  } catch (error) {
    console.error("Legal submission error:", error)
    return NextResponse.json({ success: false, error: "Failed to submit case" }, { status: 500 })
  }
}
