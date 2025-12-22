import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Sparkles, Download, Share2, MoreHorizontal } from "lucide-react"
import Link from "next/link"
import type { Deal } from "./deal-room"

interface Props {
  deal: Deal
}

export function DealRoomHeader({ deal }: Props) {
  const signalStyles = {
    BUY: "bg-green-500/10 text-green-500 border-green-500/30",
    PASS: "bg-red-500/10 text-red-500 border-red-500/30",
    RENEGOTIATE: "bg-yellow-500/10 text-yellow-500 border-yellow-500/30",
  }

  return (
    <div className="space-y-4">
      {/* Back link */}
      <Link
        href="/app"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Dashboard
      </Link>

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold text-foreground lg:text-3xl">{deal.address}</h1>
            {deal.signal && (
              <Badge variant="outline" className={signalStyles[deal.signal]}>
                {deal.signal}
              </Badge>
            )}
          </div>
          <p className="mt-1 text-muted-foreground">
            {deal.city}, {deal.state} {deal.zip}
          </p>
          <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
            <span>Deal #{deal.id}</span>
            <span>•</span>
            <div className="flex items-center gap-1 text-primary">
              <Sparkles className="h-3 w-3" />
              SaintSal Verified
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Share2 className="mr-2 h-4 w-4" />
            Share
          </Button>
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90" size="sm">
            <Sparkles className="mr-2 h-4 w-4" />
            Run SaintSal
          </Button>
          <Button variant="ghost" size="icon">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
