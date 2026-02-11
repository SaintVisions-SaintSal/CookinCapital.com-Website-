import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ExternalLink, Database, Scale, Gavel, MapPin, Building } from "lucide-react"
import type { Deal } from "./deal-room"

interface Props {
  deal: Deal
}

const dataSources = [
  {
    id: "1",
    name: "PropertyAPI",
    description: "Tax, county, legal description, ownership, liens",
    icon: Database,
    status: "connected",
    lastSync: "2 hours ago",
  },
  {
    id: "2",
    name: "County Records",
    description: "Travis County tax and deed records",
    icon: Building,
    status: "connected",
    lastSync: "1 day ago",
  },
  {
    id: "3",
    name: "Title Search",
    description: "Lien and encumbrance search results",
    icon: Scale,
    status: "completed",
    lastSync: "Jan 16, 2024",
  },
  {
    id: "4",
    name: "Auction Access",
    description: "Foreclosure and auction listings",
    icon: Gavel,
    status: "available",
    lastSync: null,
  },
  {
    id: "5",
    name: "MLS Data",
    description: "Comparable sales and market data",
    icon: MapPin,
    status: "connected",
    lastSync: "3 hours ago",
  },
]

export function DealRoomSources({ deal }: Props) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Data Sources</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {dataSources.map((source) => (
              <div key={source.id} className="flex items-center justify-between rounded-lg border border-border p-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary">
                    <source.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{source.name}</p>
                    <p className="text-sm text-muted-foreground">{source.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                        source.status === "connected"
                          ? "bg-green-500/10 text-green-500"
                          : source.status === "completed"
                            ? "bg-primary/10 text-primary"
                            : "bg-secondary text-muted-foreground"
                      }`}
                    >
                      {source.status}
                    </span>
                    {source.lastSync && (
                      <p className="mt-1 text-xs text-muted-foreground">Last sync: {source.lastSync}</p>
                    )}
                  </div>
                  <Button variant="outline" size="sm">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    View
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick links */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="cursor-pointer transition-colors hover:bg-secondary/50">
          <CardContent className="p-4 flex items-center gap-3">
            <Database className="h-5 w-5 text-primary" />
            <span className="text-sm font-medium text-foreground">Pull Property Data</span>
          </CardContent>
        </Card>
        <Card className="cursor-pointer transition-colors hover:bg-secondary/50">
          <CardContent className="p-4 flex items-center gap-3">
            <Scale className="h-5 w-5 text-primary" />
            <span className="text-sm font-medium text-foreground">Order Title Search</span>
          </CardContent>
        </Card>
        <Card className="cursor-pointer transition-colors hover:bg-secondary/50">
          <CardContent className="p-4 flex items-center gap-3">
            <MapPin className="h-5 w-5 text-primary" />
            <span className="text-sm font-medium text-foreground">Get Comps</span>
          </CardContent>
        </Card>
        <Card className="cursor-pointer transition-colors hover:bg-secondary/50">
          <CardContent className="p-4 flex items-center gap-3">
            <Gavel className="h-5 w-5 text-primary" />
            <span className="text-sm font-medium text-foreground">Check Auctions</span>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
