"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RescueIntake } from "./rescue-intake"
import { RescueCases } from "./rescue-cases"
import { LendingProducts } from "./lending-products"
import { Scale, FileText, Landmark } from "lucide-react"

export function RescueLane() {
  const [activeTab, setActiveTab] = useState("intake")

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
          <Scale className="h-7 w-7 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-foreground lg:text-3xl">Legal Help & Lending</h1>
          <p className="text-muted-foreground">Foreclosure prevention, bankruptcy workout, and capital solutions</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-secondary h-12">
          <TabsTrigger value="intake" className="px-6 gap-2">
            <FileText className="h-4 w-4" />
            New Case
          </TabsTrigger>
          <TabsTrigger value="cases" className="px-6 gap-2">
            <Scale className="h-4 w-4" />
            Active Cases
          </TabsTrigger>
          <TabsTrigger value="lending" className="px-6 gap-2">
            <Landmark className="h-4 w-4" />
            Lending Products
          </TabsTrigger>
        </TabsList>

        <TabsContent value="intake" className="mt-6">
          <RescueIntake />
        </TabsContent>

        <TabsContent value="cases" className="mt-6">
          <RescueCases />
        </TabsContent>

        <TabsContent value="lending" className="mt-6">
          <LendingProducts />
        </TabsContent>
      </Tabs>
    </div>
  )
}
