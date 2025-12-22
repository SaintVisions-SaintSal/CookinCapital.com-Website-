import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, Download, Eye, Sparkles, Plus } from "lucide-react"
import type { Deal } from "./deal-room"

interface Props {
  deal: Deal
}

const memos = [
  {
    id: "1",
    name: "Deal Memo - Initial Analysis",
    type: "Deal Memo",
    generated: "Jan 18, 2024",
    version: "v2",
    verified: true,
  },
  {
    id: "2",
    name: "Underwriting Brief",
    type: "Underwriting Brief",
    generated: "Jan 17, 2024",
    version: "v1",
    verified: true,
  },
  {
    id: "3",
    name: "Lender Packet",
    type: "Lender Packet",
    generated: "Jan 16, 2024",
    version: "v1",
    verified: true,
  },
]

export function DealRoomMemos({ deal }: Props) {
  return (
    <div className="space-y-6">
      {/* Generate new memo */}
      <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-background">
        <CardContent className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="font-semibold text-foreground">Generate New Memo</p>
              <p className="text-sm text-muted-foreground">Create a SaintSal-verified document for this deal</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Plus className="mr-2 h-4 w-4" />
              Deal Memo
            </Button>
            <Button variant="outline">
              <Plus className="mr-2 h-4 w-4" />
              Lender Packet
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Memos list */}
      <Card>
        <CardHeader>
          <CardTitle>Generated Memos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {memos.map((memo) => (
              <div
                key={memo.id}
                className="flex items-center justify-between rounded-lg border border-border p-4 transition-colors hover:bg-secondary/50"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary">
                    <FileText className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-foreground">{memo.name}</p>
                      {memo.verified && (
                        <div className="flex items-center gap-1 text-xs text-primary">
                          <Sparkles className="h-3 w-3" />
                          Verified
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {memo.type} • {memo.version} • {memo.generated}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <Eye className="mr-2 h-4 w-4" />
                    View
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
