import { GHLFormEmbed } from "@/components/ghl-form-embed"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Apply for Capital | CookinCapital",
  description: "Complete your residential loan application with e-signature capabilities.",
}

export default function ApplyPage() {
  return (
    <GHLFormEmbed
      formId="jWatiQFQY8Fyut2UlDch"
      formName="Residential Loan App"
      formHeight="5267px"
      title="Apply for Capital"
      description="Complete your residential loan application. Takes about 10 minutes and includes e-signature capabilities."
      showCreditLink={true}
    />
  )
}
