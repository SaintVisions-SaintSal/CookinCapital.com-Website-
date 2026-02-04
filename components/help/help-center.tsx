"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { 
  Shield, 
  FileText, 
  Scale, 
  Lock, 
  Users, 
  AlertTriangle, 
  BookOpen, 
  ChevronRight,
  Mail,
  Phone,
  MapPin
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

const legalDocuments = [
  {
    id: "privacy",
    title: "Privacy Policy",
    icon: Shield,
    description: "How we collect, use, and protect your personal information",
    lastUpdated: "February 1, 2026",
  },
  {
    id: "terms",
    title: "Terms of Service",
    icon: FileText,
    description: "The terms and conditions governing your use of our services",
    lastUpdated: "February 1, 2026",
  },
  {
    id: "code-of-conduct",
    title: "Code of Conduct",
    icon: Users,
    description: "Standards of behavior expected from all users and partners",
    lastUpdated: "February 1, 2026",
  },
  {
    id: "nda",
    title: "Non-Disclosure Agreement",
    icon: Lock,
    description: "Confidentiality terms for sensitive business information",
    lastUpdated: "February 1, 2026",
  },
  {
    id: "disclaimer",
    title: "Disclaimer & Disclosures",
    icon: AlertTriangle,
    description: "Important disclaimers regarding our services and advice",
    lastUpdated: "February 1, 2026",
  },
  {
    id: "acceptable-use",
    title: "Acceptable Use Policy",
    icon: Scale,
    description: "Guidelines for appropriate use of our platform and services",
    lastUpdated: "February 1, 2026",
  },
]

export function HelpCenter() {
  const searchParams = useSearchParams()
  const [activeDocument, setActiveDocument] = useState("privacy")

  useEffect(() => {
    const doc = searchParams.get("doc")
    if (doc && legalDocuments.some(d => d.id === doc)) {
      setActiveDocument(doc)
    }
  }, [searchParams])

  const renderDocumentContent = () => {
    switch (activeDocument) {
      case "privacy":
        return <PrivacyPolicy />
      case "terms":
        return <TermsOfService />
      case "code-of-conduct":
        return <CodeOfConduct />
      case "nda":
        return <NonDisclosureAgreement />
      case "disclaimer":
        return <Disclaimer />
      case "acceptable-use":
        return <AcceptableUsePolicy />
      default:
        return <PrivacyPolicy />
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-6 lg:px-8">
      {/* Header */}
      <div className="mx-auto max-w-3xl text-center mb-16">
        <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
          Help & <span className="text-primary">Legal Center</span>
        </h1>
        <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
          Your trust is paramount. Review our policies and legal documents that govern your relationship with CookinCapital and Saint Vision Group.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[320px_1fr]">
        {/* Sidebar Navigation */}
        <div className="space-y-3">
          {legalDocuments.map((doc) => {
            const Icon = doc.icon
            const isActive = activeDocument === doc.id
            return (
              <button
                key={doc.id}
                onClick={() => setActiveDocument(doc.id)}
                className={`w-full text-left rounded-xl p-4 transition-all ${
                  isActive
                    ? "bg-primary/10 border border-primary/30"
                    : "bg-card border border-border hover:border-primary/30"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
                    isActive ? "bg-primary/20" : "bg-secondary"
                  }`}>
                    <Icon className={`h-5 w-5 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className={`font-medium truncate ${isActive ? "text-primary" : "text-foreground"}`}>
                        {doc.title}
                      </h3>
                      <ChevronRight className={`h-4 w-4 shrink-0 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                      {doc.description}
                    </p>
                  </div>
                </div>
              </button>
            )
          })}

          {/* Contact Card */}
          <Card className="mt-6 p-6 bg-card border-border">
            <h3 className="font-semibold text-foreground mb-4">Need Help?</h3>
            <div className="space-y-3 text-sm">
              <a href="mailto:legal@cookin.io" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                <Mail className="h-4 w-4" />
                legal@cookin.io
              </a>
              <a href="tel:+19499972097" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                <Phone className="h-4 w-4" />
                (949) 997-2097
              </a>
              <div className="flex items-start gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4 mt-0.5" />
                <span>438 Main St<br />Huntington Beach, CA 92648</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Document Content */}
        <Card className="p-8 lg:p-12 bg-card border-border">
          {renderDocumentContent()}
        </Card>
      </div>
    </div>
  )
}

function PrivacyPolicy() {
  return (
    <article className="prose prose-invert max-w-none">
      <div className="flex items-center gap-3 mb-8 pb-6 border-b border-border">
        <Shield className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-2xl font-semibold text-foreground mb-1">Privacy Policy</h1>
          <p className="text-sm text-muted-foreground">Last Updated: February 1, 2026</p>
        </div>
      </div>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-foreground mb-4">1. Introduction</h2>
        <p className="text-muted-foreground leading-relaxed mb-4">
          Saint Vision Group LLC ("Company," "we," "us," or "our"), operating as CookinCapital, is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website cookincap.io, saintsal.ai, and related platforms, or use our services.
        </p>
        <p className="text-muted-foreground leading-relaxed">
          By accessing or using our Services, you acknowledge that you have read, understood, and agree to be bound by this Privacy Policy. If you do not agree, please discontinue use immediately.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-foreground mb-4">2. Information We Collect</h2>
        
        <h3 className="text-lg font-medium text-foreground mb-3">2.1 Personal Information</h3>
        <p className="text-muted-foreground leading-relaxed mb-4">We may collect the following categories of personal information:</p>
        <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-4">
          <li><strong className="text-foreground">Identity Data:</strong> Name, date of birth, government-issued identification numbers</li>
          <li><strong className="text-foreground">Contact Data:</strong> Email address, phone number, mailing address</li>
          <li><strong className="text-foreground">Financial Data:</strong> Bank account details, credit history, income verification, tax returns, property ownership records</li>
          <li><strong className="text-foreground">Transaction Data:</strong> Details about payments, loans, and investments</li>
          <li><strong className="text-foreground">Technical Data:</strong> IP address, browser type, device identifiers, cookies</li>
          <li><strong className="text-foreground">Usage Data:</strong> Information about how you use our website and services</li>
          <li><strong className="text-foreground">Investment Profile:</strong> Investment goals, risk tolerance, accreditation status</li>
        </ul>

        <h3 className="text-lg font-medium text-foreground mb-3">2.2 How We Collect Information</h3>
        <ul className="list-disc pl-6 text-muted-foreground space-y-2">
          <li>Directly from you when you register, apply for services, or communicate with us</li>
          <li>Automatically through cookies and similar tracking technologies</li>
          <li>From third parties including credit bureaus, identity verification services, and public records</li>
          <li>Through our AI assistant SaintSal when you interact with our conversational interfaces</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-foreground mb-4">3. How We Use Your Information</h2>
        <p className="text-muted-foreground leading-relaxed mb-4">We use your information to:</p>
        <ul className="list-disc pl-6 text-muted-foreground space-y-2">
          <li>Process loan applications and investment opportunities</li>
          <li>Verify your identity and prevent fraud</li>
          <li>Comply with legal and regulatory requirements (including KYC/AML)</li>
          <li>Communicate with you about your accounts and our services</li>
          <li>Improve our services and develop new features</li>
          <li>Provide personalized recommendations through SaintSal AI</li>
          <li>Conduct analytics and market research</li>
          <li>Enforce our terms and protect our legal rights</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-foreground mb-4">4. Information Sharing and Disclosure</h2>
        <p className="text-muted-foreground leading-relaxed mb-4">We may share your information with:</p>
        <ul className="list-disc pl-6 text-muted-foreground space-y-2">
          <li><strong className="text-foreground">Service Providers:</strong> Third parties who perform services on our behalf</li>
          <li><strong className="text-foreground">Financial Partners:</strong> Lenders, investors, and fund administrators</li>
          <li><strong className="text-foreground">Legal Authorities:</strong> When required by law or to protect our rights</li>
          <li><strong className="text-foreground">Business Transfers:</strong> In connection with any merger, acquisition, or sale of assets</li>
          <li><strong className="text-foreground">Affiliated Companies:</strong> Within the Saint Vision Group ecosystem</li>
        </ul>
        <p className="text-muted-foreground leading-relaxed mt-4">
          We do not sell your personal information to third parties for marketing purposes.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-foreground mb-4">5. Data Security</h2>
        <p className="text-muted-foreground leading-relaxed">
          We implement industry-standard security measures including encryption (TLS/SSL), secure data centers, access controls, and regular security audits. However, no method of transmission over the Internet is 100% secure, and we cannot guarantee absolute security.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-foreground mb-4">6. Your Rights and Choices</h2>
        <p className="text-muted-foreground leading-relaxed mb-4">Depending on your jurisdiction, you may have the right to:</p>
        <ul className="list-disc pl-6 text-muted-foreground space-y-2">
          <li>Access and receive a copy of your personal information</li>
          <li>Correct inaccurate personal information</li>
          <li>Request deletion of your personal information</li>
          <li>Opt out of certain data processing activities</li>
          <li>Withdraw consent where processing is based on consent</li>
          <li>Lodge a complaint with a supervisory authority</li>
        </ul>
        <p className="text-muted-foreground leading-relaxed mt-4">
          To exercise these rights, contact us at privacy@cookin.io.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-foreground mb-4">7. California Privacy Rights (CCPA)</h2>
        <p className="text-muted-foreground leading-relaxed">
          California residents have additional rights under the California Consumer Privacy Act, including the right to know what personal information is collected, the right to delete personal information, the right to opt-out of the sale of personal information, and the right to non-discrimination.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-foreground mb-4">8. Data Retention</h2>
        <p className="text-muted-foreground leading-relaxed">
          We retain your personal information for as long as necessary to fulfill the purposes for which it was collected, comply with legal obligations, resolve disputes, and enforce our agreements. Financial records may be retained for a minimum of seven years as required by law.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-foreground mb-4">9. Children's Privacy</h2>
        <p className="text-muted-foreground leading-relaxed">
          Our Services are not intended for individuals under 18 years of age. We do not knowingly collect personal information from children. If you believe we have collected information from a child, please contact us immediately.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-foreground mb-4">10. Changes to This Policy</h2>
        <p className="text-muted-foreground leading-relaxed">
          We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new Privacy Policy on this page and updating the "Last Updated" date. Your continued use of the Services after such modifications constitutes acceptance of the updated Privacy Policy.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-foreground mb-4">11. Contact Us</h2>
        <p className="text-muted-foreground leading-relaxed">
          For questions about this Privacy Policy or our data practices, contact:<br /><br />
          <strong className="text-foreground">Saint Vision Group LLC</strong><br />
          438 Main St, Huntington Beach, CA 92648<br />
          Email: privacy@cookin.io<br />
          Phone: (949) 997-2097
        </p>
      </section>
    </article>
  )
}

function TermsOfService() {
  return (
    <article className="prose prose-invert max-w-none">
      <div className="flex items-center gap-3 mb-8 pb-6 border-b border-border">
        <FileText className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-2xl font-semibold text-foreground mb-1">Terms of Service</h1>
          <p className="text-sm text-muted-foreground">Last Updated: February 1, 2026</p>
        </div>
      </div>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-foreground mb-4">1. Agreement to Terms</h2>
        <p className="text-muted-foreground leading-relaxed">
          These Terms of Service ("Terms") constitute a legally binding agreement between you and Saint Vision Group LLC ("Company," "we," "us," or "our"), operating as CookinCapital. By accessing or using our website, applications, and services (collectively, "Services"), you agree to be bound by these Terms. If you disagree with any part of these Terms, you may not access the Services.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-foreground mb-4">2. Eligibility</h2>
        <p className="text-muted-foreground leading-relaxed mb-4">To use our Services, you must:</p>
        <ul className="list-disc pl-6 text-muted-foreground space-y-2">
          <li>Be at least 18 years of age</li>
          <li>Have the legal capacity to enter into binding contracts</li>
          <li>Not be prohibited from using the Services under applicable law</li>
          <li>For investment services, meet applicable accreditation requirements</li>
          <li>Provide accurate and complete information during registration</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-foreground mb-4">3. Services Description</h2>
        <p className="text-muted-foreground leading-relaxed mb-4">CookinCapital provides:</p>
        <ul className="list-disc pl-6 text-muted-foreground space-y-2">
          <li><strong className="text-foreground">Deal Analysis:</strong> AI-powered real estate investment analysis tools</li>
          <li><strong className="text-foreground">Capital Services:</strong> Access to lending products including bridge loans, fix-and-flip financing, and commercial loans</li>
          <li><strong className="text-foreground">Investment Opportunities:</strong> Access to real estate investment opportunities (subject to accreditation)</li>
          <li><strong className="text-foreground">Legal Services:</strong> Distressed asset resolution and legal protection services</li>
          <li><strong className="text-foreground">SaintSal AI:</strong> Artificial intelligence assistant for real estate guidance</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-foreground mb-4">4. Account Registration</h2>
        <p className="text-muted-foreground leading-relaxed mb-4">
          When you create an account, you agree to:
        </p>
        <ul className="list-disc pl-6 text-muted-foreground space-y-2">
          <li>Provide accurate, current, and complete information</li>
          <li>Maintain and update your information as needed</li>
          <li>Maintain the security and confidentiality of your login credentials</li>
          <li>Accept responsibility for all activities under your account</li>
          <li>Notify us immediately of any unauthorized access</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-foreground mb-4">5. Financial Services Disclaimer</h2>
        <p className="text-muted-foreground leading-relaxed mb-4">
          <strong className="text-foreground">IMPORTANT:</strong> Our Services are not intended as financial, investment, legal, or tax advice. The information provided through our platform, including analysis from SaintSal AI, is for informational purposes only.
        </p>
        <ul className="list-disc pl-6 text-muted-foreground space-y-2">
          <li>We are not a registered broker-dealer, investment adviser, or financial planner</li>
          <li>Past performance does not guarantee future results</li>
          <li>All investments involve risk, including potential loss of principal</li>
          <li>You should consult qualified professionals before making financial decisions</li>
          <li>Loan approval is subject to underwriting and not guaranteed</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-foreground mb-4">6. User Conduct</h2>
        <p className="text-muted-foreground leading-relaxed mb-4">You agree not to:</p>
        <ul className="list-disc pl-6 text-muted-foreground space-y-2">
          <li>Violate any applicable laws or regulations</li>
          <li>Provide false, misleading, or fraudulent information</li>
          <li>Interfere with or disrupt the Services</li>
          <li>Attempt to gain unauthorized access to our systems</li>
          <li>Use the Services for money laundering or other illegal activities</li>
          <li>Reverse engineer, decompile, or disassemble any part of the Services</li>
          <li>Use automated systems to access the Services without permission</li>
          <li>Infringe upon the intellectual property rights of others</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-foreground mb-4">7. Intellectual Property</h2>
        <p className="text-muted-foreground leading-relaxed">
          All content, features, and functionality of the Services, including but not limited to text, graphics, logos, SaintSal AI technology, HACP methodology, and software, are owned by Saint Vision Group LLC and are protected by copyright, trademark, and other intellectual property laws. You may not reproduce, distribute, modify, or create derivative works without our express written permission.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-foreground mb-4">8. Fees and Payment</h2>
        <p className="text-muted-foreground leading-relaxed mb-4">
          Certain Services may require payment of fees. By using paid Services, you agree to:
        </p>
        <ul className="list-disc pl-6 text-muted-foreground space-y-2">
          <li>Pay all applicable fees as described at the time of purchase</li>
          <li>Provide accurate payment information</li>
          <li>Authorize us to charge your payment method</li>
          <li>Accept our refund policy as stated at the time of purchase</li>
        </ul>
        <p className="text-muted-foreground leading-relaxed mt-4">
          Loan origination fees, interest rates, and investment terms are disclosed separately in applicable agreements.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-foreground mb-4">9. Limitation of Liability</h2>
        <p className="text-muted-foreground leading-relaxed">
          TO THE MAXIMUM EXTENT PERMITTED BY LAW, SAINT VISION GROUP LLC AND ITS AFFILIATES, OFFICERS, DIRECTORS, EMPLOYEES, AND AGENTS SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING WITHOUT LIMITATION, LOSS OF PROFITS, DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES, RESULTING FROM YOUR ACCESS TO OR USE OF OR INABILITY TO ACCESS OR USE THE SERVICES.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-foreground mb-4">10. Indemnification</h2>
        <p className="text-muted-foreground leading-relaxed">
          You agree to indemnify, defend, and hold harmless Saint Vision Group LLC and its affiliates from and against any claims, liabilities, damages, judgments, awards, losses, costs, expenses, or fees arising out of or relating to your violation of these Terms or your use of the Services.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-foreground mb-4">11. Dispute Resolution</h2>
        <p className="text-muted-foreground leading-relaxed">
          Any disputes arising from these Terms or your use of the Services shall be resolved through binding arbitration in Orange County, California, in accordance with the rules of the American Arbitration Association. You waive any right to participate in a class action lawsuit or class-wide arbitration.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-foreground mb-4">12. Governing Law</h2>
        <p className="text-muted-foreground leading-relaxed">
          These Terms shall be governed by and construed in accordance with the laws of the State of California, without regard to its conflict of law provisions.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-foreground mb-4">13. Termination</h2>
        <p className="text-muted-foreground leading-relaxed">
          We may terminate or suspend your account and access to the Services immediately, without prior notice or liability, for any reason, including breach of these Terms. Upon termination, your right to use the Services will cease immediately.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-foreground mb-4">14. Changes to Terms</h2>
        <p className="text-muted-foreground leading-relaxed">
          We reserve the right to modify these Terms at any time. We will provide notice of material changes by posting the updated Terms and updating the "Last Updated" date. Your continued use of the Services following such changes constitutes acceptance of the modified Terms.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-foreground mb-4">15. Contact Information</h2>
        <p className="text-muted-foreground leading-relaxed">
          For questions about these Terms, contact:<br /><br />
          <strong className="text-foreground">Saint Vision Group LLC</strong><br />
          438 Main St, Huntington Beach, CA 92648<br />
          Email: legal@cookin.io<br />
          Phone: (949) 997-2097
        </p>
      </section>
    </article>
  )
}

function CodeOfConduct() {
  return (
    <article className="prose prose-invert max-w-none">
      <div className="flex items-center gap-3 mb-8 pb-6 border-b border-border">
        <Users className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-2xl font-semibold text-foreground mb-1">Code of Conduct</h1>
          <p className="text-sm text-muted-foreground">Last Updated: February 1, 2026</p>
        </div>
      </div>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-foreground mb-4">1. Our Commitment</h2>
        <p className="text-muted-foreground leading-relaxed">
          At Saint Vision Group LLC and CookinCapital, we are committed to maintaining the highest standards of integrity, professionalism, and ethical conduct in all our business dealings. This Code of Conduct outlines the principles and standards of behavior expected from all users, partners, borrowers, investors, and team members.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-foreground mb-4">2. Core Principles</h2>
        
        <h3 className="text-lg font-medium text-foreground mb-3">2.1 Integrity</h3>
        <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-4">
          <li>Act honestly and ethically in all business dealings</li>
          <li>Provide accurate and complete information</li>
          <li>Honor commitments and fulfill obligations</li>
          <li>Avoid conflicts of interest or disclose them promptly</li>
        </ul>

        <h3 className="text-lg font-medium text-foreground mb-3">2.2 Professionalism</h3>
        <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-4">
          <li>Treat all individuals with respect and dignity</li>
          <li>Communicate clearly, professionally, and in a timely manner</li>
          <li>Maintain confidentiality of sensitive information</li>
          <li>Represent yourself and your business accurately</li>
        </ul>

        <h3 className="text-lg font-medium text-foreground mb-3">2.3 Compliance</h3>
        <ul className="list-disc pl-6 text-muted-foreground space-y-2">
          <li>Comply with all applicable laws at federal, state, and local levels</li>
          <li>Follow anti-money laundering (AML) and know-your-customer (KYC) requirements</li>
          <li>Adhere to fair lending practices and anti-discrimination laws</li>
          <li>Respect intellectual property rights</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-foreground mb-4">3. Expected Behaviors</h2>
        
        <h3 className="text-lg font-medium text-foreground mb-3">For Borrowers</h3>
        <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-4">
          <li>Provide truthful and complete information on all applications</li>
          <li>Use loan proceeds only for stated purposes</li>
          <li>Make payments on time according to loan terms</li>
          <li>Communicate promptly about any issues affecting repayment</li>
          <li>Maintain required insurance and property conditions</li>
        </ul>

        <h3 className="text-lg font-medium text-foreground mb-3">For Investors</h3>
        <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-4">
          <li>Accurately represent your accreditation status and financial situation</li>
          <li>Conduct appropriate due diligence before investing</li>
          <li>Understand and accept the risks involved in real estate investments</li>
          <li>Comply with all investor documentation requirements</li>
        </ul>

        <h3 className="text-lg font-medium text-foreground mb-3">For Partners and Vendors</h3>
        <ul className="list-disc pl-6 text-muted-foreground space-y-2">
          <li>Deliver services as agreed upon</li>
          <li>Maintain appropriate licenses and insurance</li>
          <li>Protect confidential information shared in the course of business</li>
          <li>Report any concerns about unethical behavior</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-foreground mb-4">4. Prohibited Conduct</h2>
        <p className="text-muted-foreground leading-relaxed mb-4">The following behaviors are strictly prohibited:</p>
        <ul className="list-disc pl-6 text-muted-foreground space-y-2">
          <li>Fraud, misrepresentation, or deceptive practices</li>
          <li>Money laundering or financing of illegal activities</li>
          <li>Discrimination based on race, color, religion, sex, national origin, disability, age, or other protected characteristics</li>
          <li>Harassment, threats, or abusive behavior toward any party</li>
          <li>Unauthorized access to systems or data</li>
          <li>Sharing confidential information without authorization</li>
          <li>Bribery, kickbacks, or improper payments</li>
          <li>Market manipulation or insider trading</li>
          <li>Violations of securities laws or regulations</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-foreground mb-4">5. Reporting Violations</h2>
        <p className="text-muted-foreground leading-relaxed mb-4">
          If you witness or become aware of any violation of this Code of Conduct, you are encouraged to report it through one of the following channels:
        </p>
        <ul className="list-disc pl-6 text-muted-foreground space-y-2">
          <li>Email: compliance@cookin.io</li>
          <li>Phone: (949) 997-2097</li>
          <li>Mail: Compliance Department, 438 Main St, Huntington Beach, CA 92648</li>
        </ul>
        <p className="text-muted-foreground leading-relaxed mt-4">
          We prohibit retaliation against anyone who reports a concern in good faith. All reports will be investigated promptly and confidentially.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-foreground mb-4">6. Consequences of Violations</h2>
        <p className="text-muted-foreground leading-relaxed">
          Violations of this Code of Conduct may result in disciplinary action, including but not limited to: termination of services, account suspension, loan default declaration, removal from investment opportunities, legal action, and reporting to appropriate regulatory authorities.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-foreground mb-4">7. Acknowledgment</h2>
        <p className="text-muted-foreground leading-relaxed">
          By using CookinCapital's services, you acknowledge that you have read, understood, and agree to abide by this Code of Conduct. We reserve the right to update this Code at any time, and continued use of our services constitutes acceptance of any modifications.
        </p>
      </section>
    </article>
  )
}

function NonDisclosureAgreement() {
  return (
    <article className="prose prose-invert max-w-none">
      <div className="flex items-center gap-3 mb-8 pb-6 border-b border-border">
        <Lock className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-2xl font-semibold text-foreground mb-1">Non-Disclosure Agreement</h1>
          <p className="text-sm text-muted-foreground">Last Updated: February 1, 2026</p>
        </div>
      </div>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-foreground mb-4">1. Parties</h2>
        <p className="text-muted-foreground leading-relaxed">
          This Non-Disclosure Agreement ("Agreement") is entered into by and between Saint Vision Group LLC, a California limited liability company doing business as CookinCapital ("Disclosing Party"), and you, the user of our services ("Receiving Party"), collectively referred to as the "Parties."
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-foreground mb-4">2. Purpose</h2>
        <p className="text-muted-foreground leading-relaxed">
          The Parties wish to explore and/or engage in a business relationship involving real estate financing, investment opportunities, deal analysis, and related services ("Purpose"). In connection with this Purpose, the Disclosing Party may share certain confidential and proprietary information with the Receiving Party.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-foreground mb-4">3. Definition of Confidential Information</h2>
        <p className="text-muted-foreground leading-relaxed mb-4">
          "Confidential Information" means all non-public information disclosed by the Disclosing Party to the Receiving Party, whether orally, in writing, or by any other means, including but not limited to:
        </p>
        <ul className="list-disc pl-6 text-muted-foreground space-y-2">
          <li>Deal terms, loan structures, and investment opportunities</li>
          <li>Borrower and investor information and financial data</li>
          <li>Property addresses, valuations, and due diligence materials</li>
          <li>Business strategies, plans, and projections</li>
          <li>Proprietary methodologies including HACP and SaintSal AI technology</li>
          <li>Algorithms, software code, and technical specifications</li>
          <li>Customer lists, vendor relationships, and pricing information</li>
          <li>Financial statements, performance data, and fund information</li>
          <li>Any information marked or identified as "confidential"</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-foreground mb-4">4. Obligations of Receiving Party</h2>
        <p className="text-muted-foreground leading-relaxed mb-4">The Receiving Party agrees to:</p>
        <ul className="list-disc pl-6 text-muted-foreground space-y-2">
          <li>Hold all Confidential Information in strict confidence</li>
          <li>Not disclose Confidential Information to any third party without prior written consent</li>
          <li>Use Confidential Information solely for the Purpose</li>
          <li>Protect Confidential Information using at least the same degree of care used to protect their own confidential information, but no less than reasonable care</li>
          <li>Limit access to Confidential Information to those with a need to know</li>
          <li>Promptly notify the Disclosing Party of any unauthorized disclosure</li>
          <li>Return or destroy all Confidential Information upon request or termination</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-foreground mb-4">5. Exceptions</h2>
        <p className="text-muted-foreground leading-relaxed mb-4">
          Confidential Information does not include information that:
        </p>
        <ul className="list-disc pl-6 text-muted-foreground space-y-2">
          <li>Was publicly known at the time of disclosure</li>
          <li>Becomes publicly known through no fault of the Receiving Party</li>
          <li>Was rightfully in the Receiving Party's possession before disclosure</li>
          <li>Is independently developed by the Receiving Party without use of Confidential Information</li>
          <li>Is rightfully obtained from a third party without restriction</li>
          <li>Is required to be disclosed by law, court order, or regulatory authority (with prompt notice to Disclosing Party)</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-foreground mb-4">6. Term</h2>
        <p className="text-muted-foreground leading-relaxed">
          This Agreement shall remain in effect for a period of five (5) years from the date of acceptance or until terminated by either party with thirty (30) days written notice. The confidentiality obligations shall survive termination and continue for a period of three (3) years thereafter, or indefinitely for trade secrets.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-foreground mb-4">7. Remedies</h2>
        <p className="text-muted-foreground leading-relaxed">
          The Receiving Party acknowledges that any breach of this Agreement may cause irreparable harm to the Disclosing Party for which monetary damages may be inadequate. Accordingly, the Disclosing Party shall be entitled to seek injunctive relief, specific performance, and other equitable remedies in addition to any other remedies available at law.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-foreground mb-4">8. No License</h2>
        <p className="text-muted-foreground leading-relaxed">
          Nothing in this Agreement grants the Receiving Party any license, interest, or rights in or to the Confidential Information except as expressly set forth herein.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-foreground mb-4">9. Governing Law</h2>
        <p className="text-muted-foreground leading-relaxed">
          This Agreement shall be governed by and construed in accordance with the laws of the State of California, without regard to its conflict of law provisions. Any disputes arising under this Agreement shall be resolved in the courts of Orange County, California.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-foreground mb-4">10. Acceptance</h2>
        <p className="text-muted-foreground leading-relaxed">
          By accessing confidential deal information, investment opportunities, or proprietary systems through CookinCapital, you acknowledge that you have read, understood, and agree to be bound by this Non-Disclosure Agreement.
        </p>
      </section>
    </article>
  )
}

function Disclaimer() {
  return (
    <article className="prose prose-invert max-w-none">
      <div className="flex items-center gap-3 mb-8 pb-6 border-b border-border">
        <AlertTriangle className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-2xl font-semibold text-foreground mb-1">Disclaimer & Disclosures</h1>
          <p className="text-sm text-muted-foreground">Last Updated: February 1, 2026</p>
        </div>
      </div>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-foreground mb-4">1. General Disclaimer</h2>
        <p className="text-muted-foreground leading-relaxed">
          The information provided on CookinCapital (cookincap.io), SaintSal.ai, and related platforms operated by Saint Vision Group LLC is for general informational purposes only. All information is provided in good faith, however, we make no representation or warranty of any kind, express or implied, regarding the accuracy, adequacy, validity, reliability, availability, or completeness of any information.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-foreground mb-4">2. Not Financial Advice</h2>
        <p className="text-muted-foreground leading-relaxed font-semibold mb-4">
          THE INFORMATION ON THIS WEBSITE DOES NOT CONSTITUTE FINANCIAL, INVESTMENT, LEGAL, OR TAX ADVICE.
        </p>
        <ul className="list-disc pl-6 text-muted-foreground space-y-2">
          <li>We are not a registered broker-dealer, investment adviser, or financial planner</li>
          <li>Our deal analyzer tools provide estimates and projections only</li>
          <li>SaintSal AI responses are informational and should not be relied upon as professional advice</li>
          <li>You should consult with qualified professionals before making any financial decisions</li>
          <li>We do not guarantee the accuracy of any calculations, projections, or estimates</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-foreground mb-4">3. Investment Risk Disclosure</h2>
        <p className="text-muted-foreground leading-relaxed font-semibold mb-4">
          ALL INVESTMENTS INVOLVE RISK, INCLUDING THE POTENTIAL LOSS OF PRINCIPAL.
        </p>
        <ul className="list-disc pl-6 text-muted-foreground space-y-2">
          <li>Past performance is not indicative of future results</li>
          <li>Real estate investments are illiquid and may be difficult to sell</li>
          <li>Property values can decline and may not appreciate as projected</li>
          <li>Economic conditions, interest rates, and market factors can affect returns</li>
          <li>There is no guarantee that investment objectives will be achieved</li>
          <li>Investors may lose some or all of their invested capital</li>
          <li>Returns and projections shown are hypothetical and for illustration only</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-foreground mb-4">4. Lending Disclosure</h2>
        <p className="text-muted-foreground leading-relaxed mb-4">
          Regarding our lending services:
        </p>
        <ul className="list-disc pl-6 text-muted-foreground space-y-2">
          <li>Loan approval is not guaranteed and is subject to underwriting</li>
          <li>Interest rates, fees, and terms may vary based on creditworthiness and other factors</li>
          <li>Pre-qualification does not guarantee final loan approval</li>
          <li>We are not responsible for decisions made by third-party lenders</li>
          <li>Collateral may be required and could be subject to foreclosure</li>
          <li>Terms and availability may change without notice</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-foreground mb-4">5. AI and Technology Disclaimer</h2>
        <p className="text-muted-foreground leading-relaxed mb-4">
          Our SaintSal AI and related technologies:
        </p>
        <ul className="list-disc pl-6 text-muted-foreground space-y-2">
          <li>Are tools to assist decision-making, not replace human judgment</li>
          <li>May produce inaccurate, incomplete, or outdated information</li>
          <li>Should not be solely relied upon for investment or financial decisions</li>
          <li>Are continuously being improved and may change without notice</li>
          <li>Do not have access to real-time market data unless specifically stated</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-foreground mb-4">6. Third-Party Links and Content</h2>
        <p className="text-muted-foreground leading-relaxed">
          Our website may contain links to third-party websites or services that are not owned or controlled by Saint Vision Group LLC. We have no control over, and assume no responsibility for, the content, privacy policies, or practices of any third-party websites or services. We do not warrant the offerings of any third parties.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-foreground mb-4">7. Securities Disclosure</h2>
        <p className="text-muted-foreground leading-relaxed">
          Investment opportunities offered through CookinCapital may be securities offerings exempt from registration under Regulation D of the Securities Act of 1933. Such offerings are only available to accredited investors as defined under Rule 501 of Regulation D. These securities have not been registered with the SEC or any state securities commission and may not be offered or sold except pursuant to an exemption from registration.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-foreground mb-4">8. No Guarantees</h2>
        <p className="text-muted-foreground leading-relaxed">
          Saint Vision Group LLC makes no guarantees regarding: loan approval or funding, investment returns or performance, property valuations or market conditions, accuracy of any projections or estimates, availability of services, or any specific outcomes from using our platform.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-foreground mb-4">9. Limitation of Liability</h2>
        <p className="text-muted-foreground leading-relaxed">
          UNDER NO CIRCUMSTANCES SHALL SAINT VISION GROUP LLC, ITS OFFICERS, DIRECTORS, EMPLOYEES, OR AGENTS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, PUNITIVE, OR CONSEQUENTIAL DAMAGES THAT RESULT FROM THE USE OF, OR THE INABILITY TO USE, THE MATERIALS OR INFORMATION ON THIS SITE, EVEN IF WE HAVE BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-foreground mb-4">10. Contact for Questions</h2>
        <p className="text-muted-foreground leading-relaxed">
          If you have questions about these disclosures, please contact:<br /><br />
          <strong className="text-foreground">Saint Vision Group LLC</strong><br />
          438 Main St, Huntington Beach, CA 92648<br />
          Email: legal@cookin.io<br />
          Phone: (949) 997-2097
        </p>
      </section>
    </article>
  )
}

function AcceptableUsePolicy() {
  return (
    <article className="prose prose-invert max-w-none">
      <div className="flex items-center gap-3 mb-8 pb-6 border-b border-border">
        <Scale className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-2xl font-semibold text-foreground mb-1">Acceptable Use Policy</h1>
          <p className="text-sm text-muted-foreground">Last Updated: February 1, 2026</p>
        </div>
      </div>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-foreground mb-4">1. Introduction</h2>
        <p className="text-muted-foreground leading-relaxed">
          This Acceptable Use Policy ("AUP") governs your use of CookinCapital's websites, applications, and services operated by Saint Vision Group LLC. By using our services, you agree to comply with this AUP. Violation of this policy may result in suspension or termination of your access.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-foreground mb-4">2. Permitted Uses</h2>
        <p className="text-muted-foreground leading-relaxed mb-4">You may use our services to:</p>
        <ul className="list-disc pl-6 text-muted-foreground space-y-2">
          <li>Analyze real estate deals and investment opportunities</li>
          <li>Apply for and manage loans and financing</li>
          <li>Access investment opportunities (subject to eligibility)</li>
          <li>Communicate with our team and SaintSal AI assistant</li>
          <li>Access educational resources and market research</li>
          <li>Manage your account and portfolio</li>
          <li>Conduct legitimate business activities related to our services</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-foreground mb-4">3. Prohibited Activities</h2>
        <p className="text-muted-foreground leading-relaxed mb-4">You may NOT use our services to:</p>
        
        <h3 className="text-lg font-medium text-foreground mb-3">3.1 Illegal Activities</h3>
        <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-4">
          <li>Engage in any illegal activity or promote illegal conduct</li>
          <li>Commit fraud, identity theft, or financial crimes</li>
          <li>Launder money or finance terrorism</li>
          <li>Violate any applicable laws or regulations</li>
          <li>Evade taxes or engage in tax fraud</li>
        </ul>

        <h3 className="text-lg font-medium text-foreground mb-3">3.2 Harmful Content</h3>
        <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-4">
          <li>Upload, transmit, or distribute malicious code or viruses</li>
          <li>Post content that is defamatory, harassing, or threatening</li>
          <li>Share content that infringes on intellectual property rights</li>
          <li>Distribute spam, phishing, or unsolicited communications</li>
          <li>Post false, misleading, or deceptive information</li>
        </ul>

        <h3 className="text-lg font-medium text-foreground mb-3">3.3 System Abuse</h3>
        <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-4">
          <li>Attempt to gain unauthorized access to our systems</li>
          <li>Interfere with or disrupt our services or servers</li>
          <li>Use automated tools without written permission</li>
          <li>Scrape, crawl, or extract data without authorization</li>
          <li>Reverse engineer, decompile, or disassemble our software</li>
          <li>Overload or overwhelm our infrastructure</li>
        </ul>

        <h3 className="text-lg font-medium text-foreground mb-3">3.4 Misrepresentation</h3>
        <ul className="list-disc pl-6 text-muted-foreground space-y-2">
          <li>Impersonate any person or entity</li>
          <li>Falsely claim affiliation with CookinCapital</li>
          <li>Provide false identity or financial information</li>
          <li>Create multiple accounts to circumvent restrictions</li>
          <li>Misrepresent your accreditation or eligibility status</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-foreground mb-4">4. Security Requirements</h2>
        <p className="text-muted-foreground leading-relaxed mb-4">You agree to:</p>
        <ul className="list-disc pl-6 text-muted-foreground space-y-2">
          <li>Use strong, unique passwords for your account</li>
          <li>Enable two-factor authentication when available</li>
          <li>Keep your login credentials confidential</li>
          <li>Log out of shared or public devices</li>
          <li>Report any security vulnerabilities responsibly</li>
          <li>Notify us immediately of any unauthorized account access</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-foreground mb-4">5. Resource Limits</h2>
        <p className="text-muted-foreground leading-relaxed">
          We may impose reasonable limits on resource usage, including API calls, data storage, file uploads, and bandwidth. Excessive usage that impacts service quality for other users may result in temporary restrictions or additional charges.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-foreground mb-4">6. Monitoring and Enforcement</h2>
        <p className="text-muted-foreground leading-relaxed mb-4">
          We reserve the right to:
        </p>
        <ul className="list-disc pl-6 text-muted-foreground space-y-2">
          <li>Monitor usage for compliance with this AUP</li>
          <li>Investigate reported or suspected violations</li>
          <li>Remove or disable access to violating content</li>
          <li>Suspend or terminate accounts for violations</li>
          <li>Report illegal activities to law enforcement</li>
          <li>Cooperate with legal investigations</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-foreground mb-4">7. Consequences of Violations</h2>
        <p className="text-muted-foreground leading-relaxed mb-4">
          Violations of this AUP may result in:
        </p>
        <ul className="list-disc pl-6 text-muted-foreground space-y-2">
          <li>Warning or notice of violation</li>
          <li>Temporary suspension of access</li>
          <li>Permanent termination of account</li>
          <li>Default declaration on any outstanding loans</li>
          <li>Removal from investment opportunities</li>
          <li>Legal action and pursuit of damages</li>
          <li>Reporting to regulatory authorities</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-foreground mb-4">8. Reporting Violations</h2>
        <p className="text-muted-foreground leading-relaxed">
          If you become aware of any violation of this AUP, please report it to abuse@cookin.io. Include as much detail as possible, including screenshots if applicable. We take all reports seriously and will investigate promptly.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-foreground mb-4">9. Policy Updates</h2>
        <p className="text-muted-foreground leading-relaxed">
          We may update this Acceptable Use Policy from time to time. Continued use of our services after changes are posted constitutes acceptance of the updated policy. We encourage you to review this page periodically.
        </p>
      </section>
    </article>
  )
}
