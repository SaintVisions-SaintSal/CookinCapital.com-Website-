import { NextResponse } from "next/server"
import { sendEmail } from "@/lib/email"

const GHL_WEBHOOK_URL =
  "https://services.leadconnectorhq.com/hooks/NgUphdsMGXpRO3h98XyG/webhook-trigger/54508394-0b3b-425e-a840-b68c159933fe"

export async function POST(request: Request) {
  try {
    const formData = await request.json()

    const applicationId = `INV-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`
    const timestamp = new Date().toLocaleString("en-US", { dateStyle: "full", timeStyle: "long" })

    const tierLabels: Record<string, string> = {
      "25000-50000": "$25,000 - $50,000 (9%)",
      "50001-250000": "$50,001 - $250,000 (10%)",
      "250001+": "$250,001+ (12%)",
    }

    const accreditationLabels: Record<string, string> = {
      income: "Annual income exceeds $200,000 (or $300,000 joint)",
      net_worth: "Net worth exceeds $1,000,000 (excluding residence)",
      entity: "Entity with $5,000,000+ in assets",
      professional: "Licensed Series 7, 65, or 82 holder",
    }

    const emailContent = `
================================================================================
                    COOKINCAPITAL FUND I - INVESTOR APPLICATION
                        Powered by SaintSal™ + HACP™
================================================================================

Application ID: ${applicationId}
Submitted: ${timestamp}

--------------------------------------------------------------------------------
                              PERSONAL INFORMATION
--------------------------------------------------------------------------------

Full Name:              ${formData.firstName} ${formData.lastName}
Email:                  ${formData.email}
Phone:                  ${formData.phone}
Date of Birth:          ${formData.dateOfBirth || "Not provided"}

Address:                ${formData.address || "Not provided"}
City/State/Zip:         ${formData.city || ""}, ${formData.state || ""} ${formData.zip || ""}

--------------------------------------------------------------------------------
                             INVESTMENT DETAILS
--------------------------------------------------------------------------------

Investment Tier:        ${tierLabels[formData.investmentTier] || formData.investmentTier}
Investment Amount:      ${formData.investmentAmount}
Account Type:           ${formData.accountType || "Not specified"}
Source of Funds:        ${formData.investmentSource || "Not specified"}
Referral Source:        ${formData.referralSource || "Not specified"}

Investment Goals:
${formData.investmentGoals || "Not provided"}

--------------------------------------------------------------------------------
                          ACCREDITATION VERIFICATION
--------------------------------------------------------------------------------

Accreditation Basis:    ${accreditationLabels[formData.accreditationType] || formData.accreditationType}
Employer/Company:       ${formData.employerName || "Not provided"}
Occupation/Title:       ${formData.occupation || "Not provided"}
Annual Income:          ${formData.annualIncome || "Not specified"}
Total Net Worth:        ${formData.totalNetWorth || "Not specified"}
Investment Experience:  ${formData.investmentExperience || "Not specified"}
Risk Tolerance:         ${formData.riskTolerance || "Not specified"}

--------------------------------------------------------------------------------
                               ACKNOWLEDGMENTS
--------------------------------------------------------------------------------

[${formData.agreePPM ? "X" : " "}] Agrees to review Private Placement Memorandum
[${formData.agreeRisk ? "X" : " "}] Acknowledges investment risks
[${formData.agreeAccredited ? "X" : " "}] Certifies accredited investor status
[${formData.agreeElectronicSignature ? "X" : " "}] Agrees to electronic signatures

================================================================================
                         ELECTRONIC SIGNATURE
================================================================================

INVESTOR CERTIFICATION & SIGNATURE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Investor Name:          ${formData.firstName} ${formData.lastName}
Signature Status:       ${formData.investorSignature ? "✓ SIGNED ELECTRONICALLY" : "✗ NOT SIGNED"}
Signed At:              ${formData.investorSignatureTimestamp || "Not signed"}

================================================================================
                           END OF APPLICATION
================================================================================
                     COOKINCAPITAL FUND I, LP
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
          email: formData.email || "",
          form_type: "Investor Application",
          note_content: emailContent,
          application_id: applicationId,
          first_name: formData.firstName,
          last_name: formData.lastName,
          phone: formData.phone,
          investment_tier: formData.investmentTier,
          investment_amount: formData.investmentAmount,
          investor_signed: formData.investorSignature ? "YES" : "NO",
        }),
      })
      console.log("[v0] GHL webhook response:", ghlResponse.status)
    } catch (ghlError) {
      console.error("[v0] GHL webhook error:", ghlError)
    }

    // Send email to team via Resend
    try {
      await sendEmail({
        to: "support@cookin.io",
        subject: `New Investor: ${formData.firstName} ${formData.lastName} - ${tierLabels[formData.investmentTier] || formData.investmentTier} - ${applicationId}`,
        text: emailContent,
      })
    } catch (emailError) {
      console.error("[v0] Team email error:", emailError)
    }

    // Send confirmation to investor
    if (formData.email) {
      try {
        const investorConfirmation = `
================================================================================
           INVESTOR APPLICATION RECEIVED - COOKINCAPITAL FUND I
                        Powered by SaintSal™ + HACP™
================================================================================

Dear ${formData.firstName},

Thank you for your interest in CookinCapital Fund I!

--------------------------------------------------------------------------------
                         APPLICATION DETAILS
--------------------------------------------------------------------------------

Application ID:         ${applicationId}
Investment Tier:        ${tierLabels[formData.investmentTier] || formData.investmentTier}
Submitted:              ${timestamp}

--------------------------------------------------------------------------------
                          WHAT HAPPENS NEXT
--------------------------------------------------------------------------------

1. Our investment team will review your application
2. You'll receive the Private Placement Memorandum (PPM)
3. A fund manager will schedule a call to discuss details
4. Upon completion, you'll receive quarterly distributions

--------------------------------------------------------------------------------
                           FUND HIGHLIGHTS
--------------------------------------------------------------------------------

- Target returns: 9-12% annually based on investment tier
- Backed by real estate secured notes
- Quarterly distributions
- Transparent reporting

--------------------------------------------------------------------------------
                             QUESTIONS?
--------------------------------------------------------------------------------

Email: support@cookin.io
Phone: 949-997-2097

================================================================================
                     COOKINCAPITAL FUND I, LP
        CookinCap | Saint Vision Group | Powered by SaintSal™ + HACP™
             438 Main St, Huntington Beach, CA 92648 | 949-997-2097
================================================================================
`
        await sendEmail({
          to: formData.email,
          subject: `Application Received - ${applicationId} - CookinCapital Fund I`,
          text: investorConfirmation,
        })
        console.log("[v0] Investor confirmation sent to:", formData.email)
      } catch (clientError) {
        console.error("[v0] Investor email error:", clientError)
      }
    }

    return NextResponse.json({
      success: true,
      applicationId,
      message: "Investor application submitted successfully",
    })
  } catch (error) {
    console.error("Error processing investor application:", error)
    return NextResponse.json({ success: false, error: "Failed to process application" }, { status: 500 })
  }
}
