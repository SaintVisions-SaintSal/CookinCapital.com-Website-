"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DealRoomHeader } from "./deal-room-header"
import { DealRoomOverview } from "./deal-room-overview"
import { DealRoomDocuments } from "./deal-room-documents"
import { DealRoomSources } from "./deal-room-sources"
import { DealRoomMemos } from "./deal-room-memos"
import { DealRoomFunding } from "./deal-room-funding"
import { DealRoomTimeline } from "./deal-room-timeline"

export interface Deal {
  id: string
  address: string
  city: string
  state: string
  zip: string
  status: string
  signal: "BUY" | "PASS" | "RENEGOTIATE" | null
  purchasePrice: number
  arv: number
  rehabBudget: number
  projectedProfit: number
  roi: number
  cashNeeded: number
  createdAt: string
  updatedAt: string
}

interface DealRoomProps {
  deal: Deal
}

export function DealRoom({ deal }: DealRoomProps) {
  const [activeTab, setActiveTab] = useState("overview")

  return (
    <div className="space-y-6">
      <DealRoomHeader deal={deal} />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-secondary h-12">
          <TabsTrigger value="overview" className="px-6">
            Overview
          </TabsTrigger>
          <TabsTrigger value="documents" className="px-6">
            Documents
          </TabsTrigger>
          <TabsTrigger value="sources" className="px-6">
            Sources
          </TabsTrigger>
          <TabsTrigger value="memos" className="px-6">
            Memos
          </TabsTrigger>
          <TabsTrigger value="funding" className="px-6">
            Funding Path
          </TabsTrigger>
          <TabsTrigger value="timeline" className="px-6">
            Timeline
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <DealRoomOverview deal={deal} />
        </TabsContent>

        <TabsContent value="documents" className="mt-6">
          <DealRoomDocuments />
        </TabsContent>

        <TabsContent value="sources" className="mt-6">
          <DealRoomSources deal={deal} />
        </TabsContent>

        <TabsContent value="memos" className="mt-6">
          <DealRoomMemos deal={deal} />
        </TabsContent>

        <TabsContent value="funding" className="mt-6">
          <DealRoomFunding deal={deal} />
        </TabsContent>

        <TabsContent value="timeline" className="mt-6">
          <DealRoomTimeline />
        </TabsContent>
      </Tabs>
    </div>
  )
}
