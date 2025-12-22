import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Landmark, ArrowRight, CheckCircle2 } from "lucide-react"
import Link from "next/link"

const products = [
  {
    id: "1",
    name: "Hard Money Bridge",
    description: "Short-term financing for quick acquisitions and flips",
    terms: ["75-80% LTV", "11-14% interest", "1-2 points", "6-24 months"],
    bestFor: "Fix & flip investors needing fast capital",
  },
  {
    id: "2",
    name: "DSCR Rental Loan",
    description: "Long-term financing based on rental income, not personal income",
    terms: ["Up to 80% LTV", "7-9% interest", "30-year amortization", "No tax returns"],
    bestFor: "Buy & hold investors building rental portfolios",
  },
  {
    id: "3",
    name: "Commercial Bridge",
    description: "Flexible financing for commercial properties and developments",
    terms: ["Up to 70% LTV", "10-15% interest", "Interest-only options", "12-36 months"],
    bestFor: "Commercial acquisitions and repositioning",
  },
  {
    id: "4",
    name: "Legal Resolution / Arrears Roll-in",
    description: "Refinance existing debt and roll arrears into new loan",
    terms: ["Up to 65% LTV", "Flexible terms", "Arrears capitalized", "Case-by-case"],
    bestFor: "Homeowners facing foreclosure or behind on payments",
  },
]

export function LendingProducts() {
  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">
        {products.map((product) => (
          <Card key={product.id} className="flex flex-col">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                  <Landmark className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg">{product.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">{product.description}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              <div className="flex-1">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2">Key Terms</p>
                <ul className="space-y-2">
                  {product.terms.map((term) => (
                    <li key={term} className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                      <span className="text-muted-foreground">{term}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-4 rounded-lg bg-secondary p-3">
                  <p className="text-xs text-muted-foreground">
                    <span className="font-medium text-foreground">Best for:</span> {product.bestFor}
                  </p>
                </div>
              </div>

              <Link href="/apply">
                <Button className="mt-4 w-full bg-transparent" variant="outline">
                  Apply Now
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Custom request */}
      <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-background">
        <CardContent className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <p className="font-semibold text-foreground">Need a custom solution?</p>
            <p className="text-sm text-muted-foreground">Our team can structure deals that don't fit standard boxes</p>
          </div>
          <a href="mailto:support@cookin.io">
            <Button className="bg-primary text-primary-foreground">Contact Us</Button>
          </a>
        </CardContent>
      </Card>
    </div>
  )
}
