import { Header } from "@/components/landing/header"
import { Footer } from "@/components/landing/footer"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { MapPin, Phone, Mail, Building2, ArrowRight } from "lucide-react"

export const metadata = {
  title: "About Us | CookinCap",
  description: "Meet the team behind CookinCapital - institutional real estate finance powered by SaintSal AI.",
}

const team = [
  {
    name: "Ryan Capatosto",
    title: "Founder & CEO",
    company: "Saint Vision Group LLC",
    email: "ryan@cookin.io",
    image: "/ryan-headshot.png",
    bio: [
      "Ryan Capatosto is the visionary founder of Saint Vision Group LLC and the architect behind CookinCapital and SaintSal™ AI technology. With deep expertise spanning institutional finance, real estate investment, and technology innovation, Ryan has built a comprehensive ecosystem that transforms how deals get analyzed, funded, and protected.",
      "Under Ryan's leadership, Saint Vision Group has pioneered the integration of artificial intelligence with real estate finance, creating proprietary systems like SaintSal™ and HACP™ that bring institutional-grade analysis to operators at every level. His approach combines Wall Street rigor with Main Street accessibility.",
      "Ryan's background includes extensive experience in commercial lending, distressed asset resolution, and fund management. He has structured and facilitated transactions totaling billions in value, always with a focus on protecting capital while maximizing returns for all stakeholders.",
    ],
    linkedIn: "https://linkedin.com/in/ryancapatosto",
  },
  {
    name: "JR",
    title: "Co-CEO & Managing Director",
    company: "Saint Vision Group LLC",
    email: "jr@cookin.io",
    image: "/male-executive-headshot.png",
    bio: [
      "JR serves as Co-CEO and Managing Director at Saint Vision Group LLC, bringing operational excellence and strategic leadership to CookinCapital's growth. His expertise in distressed asset resolution and legal compliance ensures every transaction meets the highest standards of due diligence.",
      "With deep roots in real estate operations and investor relations, JR has been instrumental in building the systems and processes that power CookinCapital's lending platform. His hands-on approach to deal structuring has protected millions in investor capital while delivering consistent returns.",
      "JR's commitment to operator success drives the company's service-first culture, ensuring every borrower receives institutional-grade support throughout their lending journey.",
    ],
    linkedIn: "#",
  },
  {
    name: "AJ",
    title: "Managing Director",
    company: "CookinSaints",
    email: "aj@cookinsaints.com",
    image: "/ryan-headshot-2.png",
    bio: [
      "AJ serves as Managing Director at CookinSaints, leading business development and client relations across the Saint Vision ecosystem. His expertise in deal sourcing and investor partnerships drives growth across all divisions.",
      "With a background in real estate acquisitions and sales, AJ brings a hands-on approach to every client relationship. He ensures operators receive personalized attention and strategic guidance throughout their funding journey.",
      "AJ's dedication to building long-term partnerships has been instrumental in CookinCapital's reputation for exceptional service and deal execution.",
    ],
    linkedIn: "#",
  },
]

const values = [
  {
    title: "Institutional Rigor",
    description:
      "Every analysis, every recommendation, every decision backed by the same standards used by top-tier investment banks and private equity firms.",
  },
  {
    title: "Operator-First Design",
    description:
      "Built by operators, for operators. We understand the real challenges because we've lived them—from deal sourcing to exit.",
  },
  {
    title: "Technology + Expertise",
    description:
      "SaintSal™ AI isn't just automation—it's the distillation of decades of institutional knowledge into decision-ready intelligence.",
  },
  {
    title: "Capital Protection",
    description: "Before returns, there's preservation. Our systems are built to identify risk before it becomes loss.",
  },
]

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-32 pb-20">
        {/* Hero Section */}
        <section className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              The Team Behind <span className="text-primary">CookinCap</span>
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-muted-foreground lg:text-xl">
              Institutional expertise meets innovative technology. We're building the operating system for modern real
              estate capital.
            </p>
          </div>
        </section>

        {/* Team Section */}
        <section className="mt-24 mx-auto max-w-7xl px-6 lg:px-8">
          <div className="space-y-24">
            {team.map((member, index) => (
              <div
                key={member.name}
                className={`flex flex-col gap-12 lg:flex-row lg:gap-16 ${index % 2 === 1 ? "lg:flex-row-reverse" : ""}`}
              >
                {/* Image */}
                <div className="lg:w-1/3">
                  <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-secondary">
                    <img
                      src={member.image || "/placeholder.svg"}
                      alt={member.name}
                      className="h-full w-full object-cover object-top"
                    />
                  </div>
                </div>

                {/* Content */}
                <div className="lg:w-2/3 flex flex-col justify-center">
                  <div>
                    <h2 className="text-3xl font-semibold text-foreground">{member.name}</h2>
                    <p className="mt-2 text-lg text-primary font-medium">{member.title}</p>
                    <p className="text-muted-foreground">{member.company}</p>
                  </div>

                  <div className="mt-6 space-y-4">
                    {member.bio.map((paragraph, i) => (
                      <p key={i} className="text-muted-foreground leading-relaxed">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Values Section */}
        <section className="mt-32 mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-semibold text-foreground sm:text-4xl">Our Operating Principles</h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              The standards that guide every decision, every deal, every interaction.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            {values.map((value) => (
              <div key={value.title} className="rounded-2xl border border-border bg-card p-8">
                <h3 className="text-xl font-semibold text-foreground">{value.title}</h3>
                <p className="mt-3 text-muted-foreground leading-relaxed">{value.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Contact Section */}
        <section className="mt-32 mx-auto max-w-7xl px-6 lg:px-8">
          <div className="rounded-3xl border border-border bg-card p-12 lg:p-16">
            <div className="grid gap-12 lg:grid-cols-2">
              <div>
                <h2 className="text-3xl font-semibold text-foreground sm:text-4xl">Get in Touch</h2>
                <p className="mt-4 text-lg text-muted-foreground">
                  Whether you're looking to analyze a deal, secure capital, or explore partnership opportunities, we're
                  here.
                </p>

                <div className="mt-10 space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                      <Building2 className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Headquarters</p>
                      <p className="text-muted-foreground">Saint Vision Group LLC</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                      <MapPin className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Address</p>
                      <p className="text-muted-foreground">
                        438 Main St
                        <br />
                        Huntington Beach, CA 92648
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                      <Phone className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Phone</p>
                      <a href="tel:+19499972097" className="text-muted-foreground hover:text-primary transition-colors">
                        (949) 997-2097
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                      <Mail className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Email</p>
                      <a
                        href="mailto:support@cookin.io"
                        className="text-muted-foreground hover:text-primary transition-colors"
                      >
                        support@cookin.io
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col justify-center items-start lg:items-center lg:pl-8">
                <div className="text-center lg:text-left">
                  <p className="text-2xl font-semibold text-foreground mb-6">Ready to move?</p>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Link href="/apply">
                      <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
                        Apply for Capital
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </Button>
                    </Link>
                    <Link href="/app/analyzer">
                      <Button size="lg" variant="outline" className="border-border hover:bg-secondary bg-transparent">
                        Analyze a Deal
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
