import { type NextRequest, NextResponse } from "next/server"

const GHL_WEBHOOK_URL =
  "https://services.leadconnectorhq.com/hooks/NgUphdsMGXpRO3h98XyG/webhook-trigger/54508394-0b3b-425e-a840-b68c159933fe"

async function sendResendEmail(to: string, subject: string, text: string, html?: string) {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    console.log("[v0] No RESEND_API_KEY")
    return { success: false }
  }

  try {
    console.log("[v0] Sending email via Resend to:", to)
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "CookinCap <onboarding@resend.dev>", // Sandbox email - no DNS needed
        to: [to],
        subject: subject,
        text: text,
        html: html,
      }),
    })

    const data = await response.json()
    console.log("[v0] Resend response:", response.status, JSON.stringify(data))
    return { success: response.ok, data }
  } catch (error) {
    console.error("[v0] Resend error:", error)
    return { success: false, error }
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const { formData, worksheetData } = data

    const timestamp = new Date().toLocaleString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      timeZoneName: "short",
    })

    const applicationId = `APP-${Date.now().toString(36).toUpperCase()}`

    // Format application in typewriter style
    const applicationContent = `
================================================================================
                    COOKINCAP WORKING CAPITAL APPLICATION
                        Powered by SaintSal + HACP
================================================================================

Submitted: ${timestamp}
Application ID: ${applicationId}

--------------------------------------------------------------------------------
                           CONTACT INFORMATION
--------------------------------------------------------------------------------

Business Legal Name:    ${formData.businessLegalName || "Not provided"}
Business DBA:           ${formData.businessDBA || "N/A"}
Business Phone:         ${formData.businessPhone || "Not provided"}
Mobile Phone:           ${formData.mobilePhone || "Not provided"}
Email:                  ${formData.email || "Not provided"}

Physical Address:       ${formData.physicalAddress || "Not provided"}
City/State/Zip:         ${formData.physicalCity || ""}, ${formData.physicalState || ""} ${formData.physicalZip || ""}

--------------------------------------------------------------------------------
                          BUSINESS INFORMATION
--------------------------------------------------------------------------------

Legal Entity:           ${formData.legalEntity || "Not specified"}
Business Start Date:    ${formData.businessStartDate || "Not provided"}
Federal Tax ID:         ${formData.federalTaxId || "Not provided"}
State of Inc/LLC:       ${formData.stateOfInc || "Not provided"}

Business Description:
${formData.businessDescription || "Not provided"}

--------------------------------------------------------------------------------
                          FUNDING INFORMATION
--------------------------------------------------------------------------------

Amount Requested:       $${Number(formData.amountRequested || 0).toLocaleString()}
When Funds Needed:      ${formData.fundsNeeded || "Not specified"}
Use of Funding:         ${formData.useOfFunds || "Not provided"}

Gross Annual Sales:     $${Number(formData.grossAnnualSales || 0).toLocaleString()}
Gross Monthly Sales:    $${Number(formData.grossMonthlySales || 0).toLocaleString()}

--------------------------------------------------------------------------------
                       OWNER/PRINCIPAL INFORMATION
--------------------------------------------------------------------------------

Name:                   ${formData.ownerFirstName || ""} ${formData.ownerMI || ""} ${formData.ownerLastName || ""}
Title:                  ${formData.ownerTitle || "Not provided"}
Ownership:              ${formData.ownershipPercent || "Not provided"}%
Mobile:                 ${formData.ownerMobile || "Not provided"}
DOB:                    ${formData.ownerDOB || "Not provided"}
SSN:                    ${formData.ownerSSN ? "XXX-XX-" + formData.ownerSSN.slice(-4) : "Not provided"}

Home Address:           ${formData.ownerAddress || "Not provided"}
City/State/Zip:         ${formData.ownerCity || ""}, ${formData.ownerState || ""} ${formData.ownerZip || ""}

${
  formData.hasCoOwner
    ? `
--------------------------------------------------------------------------------
                        CO-OWNER INFORMATION
--------------------------------------------------------------------------------

Name:                   ${formData.coOwnerFirstName || ""} ${formData.coOwnerMI || ""} ${formData.coOwnerLastName || ""}
Title:                  ${formData.coOwnerTitle || "Not provided"}
Ownership:              ${formData.coOwnerOwnershipPercent || "Not provided"}%
Mobile:                 ${formData.coOwnerMobile || "Not provided"}
DOB:                    ${formData.coOwnerDOB || "Not provided"}
SSN:                    ${formData.coOwnerSSN ? "XXX-XX-" + formData.coOwnerSSN.slice(-4) : "Not provided"}

Home Address:           ${formData.coOwnerAddress || "Not provided"}
City/State/Zip:         ${formData.coOwnerCity || ""}, ${formData.coOwnerState || ""} ${formData.coOwnerZip || ""}
`
    : ""
}

${
  worksheetData
    ? `
--------------------------------------------------------------------------------
                       ATTACHED DEAL WORKSHEET
--------------------------------------------------------------------------------

Property Address:       ${worksheetData.data?.address || "N/A"}
City/State/Zip:         ${worksheetData.data?.city || ""}, ${worksheetData.data?.state || ""} ${worksheetData.data?.zip || ""}
Property Type:          ${worksheetData.data?.propertyType || "N/A"}
Bed/Bath:               ${worksheetData.data?.bedrooms || 0} bed / ${worksheetData.data?.bathrooms || 0} bath
Square Footage:         ${worksheetData.data?.squareFootage?.toLocaleString() || "0"} sqft

ACQUISITION
  Purchase Price:       $${worksheetData.data?.purchasePrice?.toLocaleString() || "0"}
  After Repair Value:   $${worksheetData.data?.arv?.toLocaleString() || "0"}
  Total Rehab Budget:   $${worksheetData.calculations?.totalRehabCost?.toLocaleString() || "0"}

DEAL METRICS
  Projected Profit:     $${worksheetData.calculations?.totalProfit?.toLocaleString() || "0"}
  ROI:                  ${worksheetData.calculations?.roi?.toFixed(2) || "0"}%
  Percent of ARV:       ${worksheetData.calculations?.percentOfARV?.toFixed(1) || "0"}%

SAINTSAL SIGNAL:        ${worksheetData.signal || "N/A"}
`
    : ""
}

================================================================================
                         ELECTRONIC SIGNATURE
================================================================================

OWNER CERTIFICATION & SIGNATURE
--------------------------------------------------------------------------------

I certify that the information provided in this application is true and correct.
I authorize CookinCap to verify credit and business information as needed.

Owner Name:             ${formData.ownerFirstName || ""} ${formData.ownerLastName || ""}
Signature Status:       ${formData.ownerSignatureData ? "SIGNED ELECTRONICALLY" : "NOT SIGNED"}
Signed At:              ${formData.ownerSignatureTimestamp || "N/A"}
Terms Agreed:           ${formData.agreeToTerms ? "YES" : "NO"}
Credit Pull Authorized: ${formData.agreeToCreditPull ? "YES" : "NO"}

${
  formData.hasCoOwner && formData.coOwnerSignatureData
    ? `
CO-OWNER SIGNATURE
--------------------------------------------------------------------------------

Co-Owner Name:          ${formData.coOwnerFirstName || ""} ${formData.coOwnerLastName || ""}
Signature Status:       ${formData.coOwnerSignatureData ? "SIGNED ELECTRONICALLY" : "NOT SIGNED"}
Signed At:              ${formData.coOwnerSignatureTimestamp || "N/A"}
`
    : ""
}

================================================================================
                           END OF APPLICATION
================================================================================
        CookinCap | Saint Vision Group | Powered by SaintSal + HACP
             438 Main St, Huntington Beach, CA 92648 | 949-997-2097
================================================================================
`

    // 1. Send to GHL webhook
    console.log("[v0] Sending to GHL webhook...")
    try {
      const ghlResponse = await fetch(GHL_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email || "",
          form_type: "Funding Application",
          note_content: applicationContent,
          application_id: applicationId,
          business_name: formData.businessLegalName,
          amount_requested: formData.amountRequested,
          phone: formData.mobilePhone || formData.businessPhone,
          first_name: formData.ownerFirstName,
          last_name: formData.ownerLastName,
          owner_signed: formData.ownerSignatureData ? "YES" : "NO",
          signature_timestamp: formData.ownerSignatureTimestamp,
        }),
      })
      console.log("[v0] GHL response:", ghlResponse.status)
    } catch (ghlError) {
      console.error("[v0] GHL error:", ghlError)
    }

    // 2. Send email to team via Resend
    console.log("[v0] Sending team email via Resend...")
    const teamEmailResult = await sendResendEmail(
      "support@cookin.io",
      `New Application: ${formData.ownerFirstName} ${formData.ownerLastName} - ${formData.businessLegalName} - $${Number(formData.amountRequested || 0).toLocaleString()}`,
      applicationContent,
    )
    console.log("[v0] Team email result:", teamEmailResult)

    // 3. Send confirmation to client via Resend
    if (formData.email) {
      console.log("[v0] Sending client confirmation via Resend...")
      const clientConfirmation = `
Thank you for your application!

================================================================================
                    APPLICATION CONFIRMATION
================================================================================

Application ID: ${applicationId}
Submitted: ${timestamp}

Business: ${formData.businessLegalName}
Amount Requested: $${Number(formData.amountRequested || 0).toLocaleString()}

================================================================================

Your application has been received and is being reviewed by our team.
We will contact you within 24-48 hours.

Next Steps:
1. Complete soft credit pull: https://member.myscoreiq.com/get-fico-max.aspx?offercode=4321396P
2. Upload documents: https://www.cookincap.com/documents
3. Questions? Call us: 949-997-2097

================================================================================
        CookinCap | Saint Vision Group | Powered by SaintSal + HACP
             438 Main St, Huntington Beach, CA 92648 | 949-997-2097
================================================================================
`
      const clientEmailResult = await sendResendEmail(
        formData.email,
        `Application Received - ${applicationId} - CookinCap`,
        clientConfirmation,
      )
      console.log("[v0] Client email result:", clientEmailResult)
    }

    return NextResponse.json({
      success: true,
      applicationId,
      message: "Application submitted successfully",
    })
  } catch (error) {
    console.error("Error submitting application:", error)
    return NextResponse.json({ success: false, error: "Failed to submit application" }, { status: 500 })
  }
}
