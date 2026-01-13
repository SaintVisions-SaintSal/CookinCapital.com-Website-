import { type NextRequest, NextResponse } from "next/server"

const GHL_WEBHOOK_URL =
  "https://services.leadconnectorhq.com/hooks/NgUphdsMGXpRO3h98XyG/webhook-trigger/54508394-0b3b-425e-a840-b68c159933fe"

const CREDIT_PULL_URL = "https://member.myscoreiq.com/get-fico-max.aspx?offercode=4321396P"

async function sendResendEmail(
  to: string,
  subject: string,
  text: string,
  html?: string,
  attachments?: Array<{ filename: string; content: string }>,
) {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    console.log("[v0] No RESEND_API_KEY")
    return { success: false }
  }

  try {
    console.log("[v0] Sending email via Resend to:", to)
    const emailPayload: Record<string, unknown> = {
      from: process.env.RESEND_FROM_EMAIL || "CookinCap <onboarding@resend.dev>",
      to: [to],
      subject: subject,
      text: text,
      html: html,
    }

    if (attachments && attachments.length > 0) {
      emailPayload.attachments = attachments.map((att) => ({
        filename: att.filename,
        content: att.content,
      }))
    }

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(emailPayload),
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
Signature Status:       ${formData.ownerSignatureData ? "✓ SIGNED ELECTRONICALLY (see attached image)" : "NOT SIGNED"}
Signed At:              ${formData.ownerSignatureTimestamp || "N/A"}
Terms Agreed:           ${formData.agreeToTerms ? "YES" : "NO"}
Credit Pull Authorized: ${formData.agreeToCreditPull ? "YES" : "NO"}

${
  formData.hasCoOwner && formData.coOwnerSignatureData
    ? `
CO-OWNER SIGNATURE
--------------------------------------------------------------------------------

Co-Owner Name:          ${formData.coOwnerFirstName || ""} ${formData.coOwnerLastName || ""}
Signature Status:       ${formData.coOwnerSignatureData ? "✓ SIGNED ELECTRONICALLY (see attached image)" : "NOT SIGNED"}
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

    const attachments: Array<{ filename: string; content: string }> = []

    if (formData.ownerSignatureData) {
      // Remove the data:image/png;base64, prefix
      const base64Data = formData.ownerSignatureData.replace(/^data:image\/png;base64,/, "")
      attachments.push({
        filename: `owner-signature-${applicationId}.png`,
        content: base64Data,
      })
    }

    if (formData.hasCoOwner && formData.coOwnerSignatureData) {
      const base64Data = formData.coOwnerSignatureData.replace(/^data:image\/png;base64,/, "")
      attachments.push({
        filename: `co-owner-signature-${applicationId}.png`,
        content: base64Data,
      })
    }

    const htmlEmail = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: 'Courier New', monospace; background: #0a0a0a; color: #e5e5e5; padding: 40px; }
    .container { max-width: 800px; margin: 0 auto; background: #141414; border: 1px solid #333; border-radius: 8px; padding: 40px; }
    .header { text-align: center; border-bottom: 2px solid #d4a542; padding-bottom: 20px; margin-bottom: 30px; }
    .header h1 { color: #d4a542; margin: 0; font-size: 24px; }
    .header p { color: #888; margin: 10px 0 0; }
    .section { margin-bottom: 30px; }
    .section-title { color: #d4a542; border-bottom: 1px solid #333; padding-bottom: 10px; margin-bottom: 15px; font-size: 14px; font-weight: bold; }
    .row { display: flex; margin-bottom: 8px; }
    .label { width: 200px; color: #888; }
    .value { color: #e5e5e5; }
    .signature-section { background: #1a1a1a; padding: 20px; border-radius: 8px; margin-top: 20px; }
    .signature-img { border: 1px solid #333; border-radius: 4px; margin-top: 10px; background: #fff; }
    .badge { display: inline-block; background: #22c55e; color: #000; padding: 4px 12px; border-radius: 4px; font-size: 12px; font-weight: bold; }
    .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #333; color: #666; font-size: 12px; }
    .credit-link { display: inline-block; background: #d4a542; color: #000; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold; margin-top: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>COOKINCAP WORKING CAPITAL APPLICATION</h1>
      <p>Powered by SaintSal + HACP</p>
    </div>
    
    <div class="section">
      <div class="row"><span class="label">Application ID:</span><span class="value">${applicationId}</span></div>
      <div class="row"><span class="label">Submitted:</span><span class="value">${timestamp}</span></div>
    </div>

    <div class="section">
      <div class="section-title">CONTACT INFORMATION</div>
      <div class="row"><span class="label">Business Name:</span><span class="value">${formData.businessLegalName || "N/A"}</span></div>
      <div class="row"><span class="label">DBA:</span><span class="value">${formData.businessDBA || "N/A"}</span></div>
      <div class="row"><span class="label">Email:</span><span class="value">${formData.email || "N/A"}</span></div>
      <div class="row"><span class="label">Phone:</span><span class="value">${formData.mobilePhone || formData.businessPhone || "N/A"}</span></div>
      <div class="row"><span class="label">Address:</span><span class="value">${formData.physicalAddress || ""}, ${formData.physicalCity || ""}, ${formData.physicalState || ""} ${formData.physicalZip || ""}</span></div>
    </div>

    <div class="section">
      <div class="section-title">FUNDING REQUEST</div>
      <div class="row"><span class="label">Amount Requested:</span><span class="value" style="color: #22c55e; font-weight: bold;">$${Number(formData.amountRequested || 0).toLocaleString()}</span></div>
      <div class="row"><span class="label">Timeline:</span><span class="value">${formData.fundsNeeded || "N/A"}</span></div>
      <div class="row"><span class="label">Use of Funds:</span><span class="value">${formData.useOfFunds || "N/A"}</span></div>
      <div class="row"><span class="label">Gross Annual Sales:</span><span class="value">$${Number(formData.grossAnnualSales || 0).toLocaleString()}</span></div>
      <div class="row"><span class="label">Gross Monthly Sales:</span><span class="value">$${Number(formData.grossMonthlySales || 0).toLocaleString()}</span></div>
    </div>

    <div class="section">
      <div class="section-title">OWNER INFORMATION</div>
      <div class="row"><span class="label">Name:</span><span class="value">${formData.ownerFirstName || ""} ${formData.ownerMI || ""} ${formData.ownerLastName || ""}</span></div>
      <div class="row"><span class="label">Title:</span><span class="value">${formData.ownerTitle || "N/A"}</span></div>
      <div class="row"><span class="label">Ownership:</span><span class="value">${formData.ownershipPercent || "N/A"}%</span></div>
      <div class="row"><span class="label">DOB:</span><span class="value">${formData.ownerDOB || "N/A"}</span></div>
      <div class="row"><span class="label">SSN:</span><span class="value">${formData.ownerSSN ? "XXX-XX-" + formData.ownerSSN.slice(-4) : "N/A"}</span></div>
      <div class="row"><span class="label">Home Address:</span><span class="value">${formData.ownerAddress || ""}, ${formData.ownerCity || ""}, ${formData.ownerState || ""} ${formData.ownerZip || ""}</span></div>
    </div>

    ${
      formData.hasCoOwner
        ? `
    <div class="section">
      <div class="section-title">CO-OWNER INFORMATION</div>
      <div class="row"><span class="label">Name:</span><span class="value">${formData.coOwnerFirstName || ""} ${formData.coOwnerMI || ""} ${formData.coOwnerLastName || ""}</span></div>
      <div class="row"><span class="label">Title:</span><span class="value">${formData.coOwnerTitle || "N/A"}</span></div>
      <div class="row"><span class="label">Ownership:</span><span class="value">${formData.coOwnerOwnershipPercent || "N/A"}%</span></div>
    </div>
    `
        : ""
    }

    ${
      worksheetData
        ? `
    <div class="section">
      <div class="section-title">ATTACHED DEAL WORKSHEET</div>
      <div class="row"><span class="label">Property:</span><span class="value">${worksheetData.data?.address || "N/A"}, ${worksheetData.data?.city || ""}, ${worksheetData.data?.state || ""}</span></div>
      <div class="row"><span class="label">Purchase Price:</span><span class="value">$${worksheetData.data?.purchasePrice?.toLocaleString() || "0"}</span></div>
      <div class="row"><span class="label">ARV:</span><span class="value">$${worksheetData.data?.arv?.toLocaleString() || "0"}</span></div>
      <div class="row"><span class="label">Projected Profit:</span><span class="value" style="color: #22c55e;">$${worksheetData.calculations?.totalProfit?.toLocaleString() || "0"}</span></div>
      <div class="row"><span class="label">ROI:</span><span class="value">${worksheetData.calculations?.roi?.toFixed(2) || "0"}%</span></div>
      <div class="row"><span class="label">SaintSal Signal:</span><span class="value"><span class="badge">${worksheetData.signal || "N/A"}</span></span></div>
    </div>
    `
        : ""
    }

    <div class="signature-section">
      <div class="section-title">ELECTRONIC SIGNATURES</div>
      <div class="row"><span class="label">Owner:</span><span class="value">${formData.ownerFirstName || ""} ${formData.ownerLastName || ""}</span></div>
      <div class="row"><span class="label">Status:</span><span class="value">${formData.ownerSignatureData ? '<span class="badge">✓ SIGNED</span>' : "Not Signed"}</span></div>
      <div class="row"><span class="label">Signed At:</span><span class="value">${formData.ownerSignatureTimestamp || "N/A"}</span></div>
      <div class="row"><span class="label">Terms Agreed:</span><span class="value">${formData.agreeToTerms ? "YES" : "NO"}</span></div>
      <div class="row"><span class="label">Credit Pull Auth:</span><span class="value">${formData.agreeToCreditPull ? "YES" : "NO"}</span></div>
      ${formData.ownerSignatureData ? `<p style="margin-top: 15px; color: #888;">Owner signature image attached: owner-signature-${applicationId}.png</p>` : ""}
      ${formData.hasCoOwner && formData.coOwnerSignatureData ? `<p style="color: #888;">Co-owner signature image attached: co-owner-signature-${applicationId}.png</p>` : ""}
    </div>

    <div class="footer">
      <p>CookinCap | Saint Vision Group | Powered by SaintSal + HACP</p>
      <p>438 Main St, Huntington Beach, CA 92648 | 949-997-2097</p>
      <a href="${CREDIT_PULL_URL}" class="credit-link">Pull Applicant Credit Score</a>
    </div>
  </div>
</body>
</html>
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
          owner_signature_base64: formData.ownerSignatureData || null,
          co_owner_signature_base64: formData.coOwnerSignatureData || null,
        }),
      })
      console.log("[v0] GHL response:", ghlResponse.status)
    } catch (ghlError) {
      console.error("[v0] GHL error:", ghlError)
    }

    // 2. Send email to team via Resend WITH HTML AND SIGNATURE ATTACHMENTS
    console.log("[v0] Sending team email via Resend with attachments...")
    const teamEmailResult = await sendResendEmail(
      "support@cookin.io",
      `🔔 New Application: ${formData.ownerFirstName} ${formData.ownerLastName} - ${formData.businessLegalName} - $${Number(formData.amountRequested || 0).toLocaleString()}`,
      applicationContent,
      htmlEmail,
      attachments,
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
1. Complete soft credit pull: ${CREDIT_PULL_URL}
2. Upload documents: https://www.cookincap.com/documents
3. Questions? Call us: 949-997-2097

================================================================================
        CookinCap | Saint Vision Group | Powered by SaintSal + HACP
             438 Main St, Huntington Beach, CA 92648 | 949-997-2097
================================================================================
`

      const clientHtml = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; background: #f5f5f5; padding: 40px; }
    .container { max-width: 600px; margin: 0 auto; background: #fff; border-radius: 8px; padding: 40px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
    .header { text-align: center; margin-bottom: 30px; }
    .header h1 { color: #d4a542; margin: 0; }
    .success { background: #22c55e; color: #fff; padding: 20px; border-radius: 8px; text-align: center; margin-bottom: 30px; }
    .info { background: #f8f8f8; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
    .cta { display: block; background: #d4a542; color: #000; padding: 15px 30px; border-radius: 8px; text-decoration: none; font-weight: bold; text-align: center; margin: 20px 0; }
    .footer { text-align: center; color: #888; font-size: 12px; margin-top: 30px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>CookinCap</h1>
      <p>Application Received</p>
    </div>
    <div class="success">
      <h2 style="margin: 0;">✓ Application Submitted Successfully</h2>
    </div>
    <div class="info">
      <p><strong>Application ID:</strong> ${applicationId}</p>
      <p><strong>Business:</strong> ${formData.businessLegalName}</p>
      <p><strong>Amount Requested:</strong> $${Number(formData.amountRequested || 0).toLocaleString()}</p>
    </div>
    <p>Thank you for your application. Our team will review and contact you within 24-48 hours.</p>
    <h3>Next Steps:</h3>
    <a href="${CREDIT_PULL_URL}" class="cta">📊 Pull Your Credit Score (Soft Pull)</a>
    <p>This is a soft pull and will NOT affect your credit score. Completing this step helps expedite your approval.</p>
    <div class="footer">
      <p>CookinCap | Saint Vision Group</p>
      <p>438 Main St, Huntington Beach, CA 92648 | 949-997-2097</p>
    </div>
  </div>
</body>
</html>
`
      const clientEmailResult = await sendResendEmail(
        formData.email,
        `✓ Application Received - ${applicationId} - CookinCap`,
        clientConfirmation,
        clientHtml,
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
