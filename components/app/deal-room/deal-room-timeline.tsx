import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle2, Circle, Clock, Plus } from "lucide-react"

const timeline = [
  {
    id: "1",
    title: "Deal Submitted",
    description: "Initial intake form completed",
    date: "Jan 15, 2024",
    status: "completed",
  },
  {
    id: "2",
    title: "SaintSal Analysis",
    description: "AI analysis completed with BUY signal",
    date: "Jan 16, 2024",
    status: "completed",
  },
  {
    id: "3",
    title: "Title Search",
    description: "Clear title confirmed, no liens",
    date: "Jan 17, 2024",
    status: "completed",
  },
  {
    id: "4",
    title: "Lender Matching",
    description: "3 lenders matched to deal",
    date: "Jan 18, 2024",
    status: "completed",
  },
  {
    id: "5",
    title: "Foundation Inspection",
    description: "Pending scheduling",
    date: null,
    status: "in-progress",
  },
  {
    id: "6",
    title: "Submit Offer",
    description: "Awaiting inspection results",
    date: null,
    status: "pending",
  },
  {
    id: "7",
    title: "Close Deal",
    description: "Estimated: Feb 15, 2024",
    date: null,
    status: "pending",
  },
]

export function DealRoomTimeline() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Deal Timeline</CardTitle>
          <Button variant="outline" size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Add Task
          </Button>
        </CardHeader>
        <CardContent>
          <div className="relative">
            {timeline.map((item, index) => (
              <div key={item.id} className="flex gap-4 pb-8 last:pb-0">
                {/* Timeline line */}
                <div className="flex flex-col items-center">
                  {item.status === "completed" ? (
                    <CheckCircle2 className="h-6 w-6 text-green-500 shrink-0" />
                  ) : item.status === "in-progress" ? (
                    <Clock className="h-6 w-6 text-primary shrink-0" />
                  ) : (
                    <Circle className="h-6 w-6 text-muted-foreground shrink-0" />
                  )}
                  {index < timeline.length - 1 && (
                    <div
                      className={`w-0.5 flex-1 mt-2 ${item.status === "completed" ? "bg-green-500" : "bg-border"}`}
                    />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 pb-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <p
                        className={`font-medium ${
                          item.status === "pending" ? "text-muted-foreground" : "text-foreground"
                        }`}
                      >
                        {item.title}
                      </p>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    </div>
                    {item.date && <span className="text-xs text-muted-foreground">{item.date}</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
