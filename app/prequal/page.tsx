import { GHLFormEmbed } from "@/components/ghl-form-embed"

export const metadata = {
  title: "Pre-Qualify for Capital | CookinCap",
  description: "Start your pre-qualification in 2 minutes. No hard credit pull required.",
}

export default function PreQual() {
  return (
    <GHLFormEmbed
      formId="t0RuqARBjSTCU6Nmonvq"
      formName="CookinCapital Pre-Qualification"
      formHeight="1403px"
      title="Pre-Qualify for Capital"
      description="Start your journey to funding. Takes about 2 minutes and does not affect your credit score."
      showCreditLink={true}
    />
  )
}
