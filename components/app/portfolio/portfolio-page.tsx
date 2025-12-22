import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Briefcase, TrendingUp, DollarSign, AlertTriangle, ArrowRight } from "lucide-react"

const portfolioStats = [
  { label: "Total Properties", value: "8", icon: Briefcase },
  { label: "Portfolio Value", value: "$2.4M", icon: DollarSign },
  { label: "Avg. Yield", value: "14.2%", icon: TrendingUp },
  { label: "Risk Alerts", value: "1", icon: AlertTriangle, alert: true },
]

const properties = [
  {
    id: "1",
    address: "123 Main St, Austin, TX",
    status: "Active",
    value: "$275,000",
    equity: "$95,000",
    yield: "12.5%",
    loanStatus: "Current",
  },
  {
    id: "2",
    address: "456 Oak Ave, Houston, TX",
    status: "Active",
    value: "$210,000",
    equity: "$65,000",
    yield: "8.2%",
    loanStatus: "Current",
  },
  {
    id: "3",
    address: "789 Pine Rd, Dallas, TX",
    status: "Under Contract",
    value: "$650,000",
    equity: "$180,000",
    yield: "15.0%",
    loanStatus: "Pending",
  },
]

export default function PortfolioPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-foreground lg:text-3xl">Portfolio Command</h1>
        <p className="mt-1 text-muted-foreground">Track and manage your real estate portfolio</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {portfolioStats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-xl ${
                    stat.alert ? "bg-yellow-500/10" : "bg-secondary"
                  }`}
                >
                  <stat.icon className={`h-6 w-6 ${stat.alert ? "text-yellow-500" : "text-primary"}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Properties table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Properties</CardTitle>
          <Button variant="ghost" className="text-primary">
            Export Report
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="pb-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Property
                  </th>
                  <th className="pb-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Status
                  </th>
                  <th className="pb-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Value
                  </th>
                  <th className="pb-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Equity
                  </th>
                  <th className="pb-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Yield
                  </th>
                  <th className="pb-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Loan Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {properties.map((property) => (
                  <tr
                    key={property.id}
                    className="border-b border-border last:border-0 hover:bg-secondary/50 cursor-pointer"
                  >
                    <td className="py-4 font-medium text-foreground">{property.address}</td>
                    <td className="py-4">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                          property.status === "Active"
                            ? "bg-green-500/10 text-green-500"
                            : "bg-yellow-500/10 text-yellow-500"
                        }`}
                      >
                        {property.status}
                      </span>
                    </td>
                    <td className="py-4 text-right text-foreground">{property.value}</td>
                    <td className="py-4 text-right text-foreground">{property.equity}</td>
                    <td className="py-4 text-right text-primary font-medium">{property.yield}</td>
                    <td className="py-4 text-right">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                          property.loanStatus === "Current"
                            ? "bg-green-500/10 text-green-500"
                            : "bg-yellow-500/10 text-yellow-500"
                        }`}
                      >
                        {property.loanStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Placeholder for charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Performance Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center h-64 text-muted-foreground">
              Portfolio performance chart will appear here
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Asset Allocation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center h-64 text-muted-foreground">
              Asset allocation chart will appear here
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
