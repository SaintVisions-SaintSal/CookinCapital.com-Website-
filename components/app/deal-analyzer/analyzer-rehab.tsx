"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import {
  ChevronDown,
  ChevronRight,
  Plus,
  Trash2,
  Hammer,
  Wrench,
  Paintbrush,
  Home,
  Leaf,
  FileText,
  AlertCircle,
} from "lucide-react"
import type { DealData, Calculations, RehabLineItem } from "./types"

interface Props {
  data: DealData
  onChange: (updates: Partial<DealData>) => void
  calculations: Calculations
}

interface CategorySection {
  id: string
  title: string
  icon: React.ReactNode
  items: { key: keyof DealData["rehabCategories"]; label: string; placeholder?: string }[]
}

const categories: CategorySection[] = [
  {
    id: "structure",
    title: "Structure & Exterior",
    icon: <Home className="h-4 w-4" />,
    items: [
      { key: "demolition", label: "Demolition & Haul-off", placeholder: "Demo, debris removal" },
      { key: "foundation", label: "Foundation Repair", placeholder: "Cracks, piers, leveling" },
      { key: "roofing", label: "Roofing", placeholder: "Shingles, repairs, full replacement" },
      { key: "siding", label: "Siding / Exterior", placeholder: "Siding, stucco, brick repair" },
      { key: "windows", label: "Windows", placeholder: "Replacement, repairs" },
      { key: "doors", label: "Exterior Doors", placeholder: "Entry, storm doors" },
      { key: "garage", label: "Garage / Carport", placeholder: "Door, opener, repairs" },
    ],
  },
  {
    id: "systems",
    title: "Major Systems",
    icon: <Wrench className="h-4 w-4" />,
    items: [
      { key: "electrical", label: "Electrical", placeholder: "Panel, wiring, fixtures" },
      { key: "plumbing", label: "Plumbing", placeholder: "Pipes, fixtures, water heater" },
      { key: "hvac", label: "HVAC", placeholder: "AC, furnace, ductwork" },
      { key: "insulation", label: "Insulation", placeholder: "Attic, walls, crawlspace" },
    ],
  },
  {
    id: "interior",
    title: "Interior Finishes",
    icon: <Paintbrush className="h-4 w-4" />,
    items: [
      { key: "drywall", label: "Drywall / Texture", placeholder: "Repairs, hanging, finishing" },
      { key: "painting", label: "Painting", placeholder: "Interior, exterior, trim" },
      { key: "flooring", label: "Flooring", placeholder: "Hardwood, tile, carpet, LVP" },
      { key: "doors", label: "Interior Doors", placeholder: "Doors, hardware, trim" },
      { key: "interior", label: "Interior Trim & Molding", placeholder: "Baseboards, crown, casing" },
    ],
  },
  {
    id: "kitchen",
    title: "Kitchen",
    icon: <Hammer className="h-4 w-4" />,
    items: [
      { key: "kitchenCabinets", label: "Cabinets", placeholder: "New, reface, paint" },
      { key: "kitchenCountertops", label: "Countertops", placeholder: "Granite, quartz, laminate" },
      { key: "kitchenAppliances", label: "Appliances", placeholder: "Stove, fridge, dishwasher, microwave" },
      { key: "kitchenFixtures", label: "Fixtures & Hardware", placeholder: "Sink, faucet, pulls" },
    ],
  },
  {
    id: "bathrooms",
    title: "Bathrooms",
    icon: <Hammer className="h-4 w-4" />,
    items: [
      { key: "bathroomVanities", label: "Vanities & Mirrors", placeholder: "Per bathroom" },
      { key: "bathroomTileShower", label: "Tile / Shower / Tub", placeholder: "Surround, retile, refinish" },
      { key: "bathroomFixtures", label: "Fixtures & Hardware", placeholder: "Faucets, showerheads" },
      { key: "bathroomToilets", label: "Toilets", placeholder: "Replace, repair" },
    ],
  },
  {
    id: "exterior",
    title: "Exterior & Landscaping",
    icon: <Leaf className="h-4 w-4" />,
    items: [
      { key: "landscaping", label: "Landscaping", placeholder: "Sod, plants, trees, mulch" },
      { key: "concrete", label: "Concrete / Driveway", placeholder: "Pour, repair, resurface" },
      { key: "decksPatios", label: "Decks / Patios", placeholder: "Build, repair, stain" },
      { key: "fencing", label: "Fencing", placeholder: "Wood, chain link, vinyl" },
    ],
  },
  {
    id: "soft",
    title: "Soft Costs & Contingency",
    icon: <FileText className="h-4 w-4" />,
    items: [
      { key: "permits", label: "Permits & Fees", placeholder: "Building, electrical, plumbing" },
      { key: "dumpsters", label: "Dumpsters / Waste", placeholder: "Haul-off, disposal" },
      { key: "cleaning", label: "Cleaning", placeholder: "Post-construction, deep clean" },
      { key: "staging", label: "Staging (if selling)", placeholder: "Furniture rental" },
      { key: "generalContractor", label: "GC Overhead / Fee", placeholder: "10-20% typical" },
      { key: "contingency", label: "Contingency", placeholder: "10-15% recommended" },
      { key: "miscellaneous", label: "Miscellaneous", placeholder: "Unexpected items" },
    ],
  },
]

export function AnalyzerRehab({ data, onChange, calculations }: Props) {
  const [expandedSections, setExpandedSections] = useState<string[]>(["structure", "kitchen", "bathrooms"])
  const [showCustom, setShowCustom] = useState(false)

  const safeCalculations = calculations || {
    totalRehabCost: 0,
    purchasePrice: 0,
    totalCashRequired: 0,
    totalInvestment: 0,
    totalProfit: 0,
    roi: 0,
    cashOnCashReturn: 0,
    arv: 0,
    loanAmount: 0,
    downPayment: 0,
    closingCosts: 0,
    lenderFees: 0,
    monthlyPayment: 0,
    totalFinancingCost: 0,
  }

  const formatCurrency = (value: number) => {
    return value ? value.toLocaleString() : ""
  }

  const parseCurrency = (value: string) => {
    return Number.parseInt(value.replace(/[^0-9]/g, "")) || 0
  }

  const toggleSection = (id: string) => {
    setExpandedSections((prev) => (prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]))
  }

  const updateCategory = (key: keyof DealData["rehabCategories"], value: number) => {
    onChange({
      rehabCategories: {
        ...data.rehabCategories,
        [key]: value,
      },
    })
  }

  const addCustomItem = () => {
    const newItem: RehabLineItem = {
      id: Date.now().toString(),
      name: "",
      cost: 0,
    }
    onChange({ customRehabItems: [...data.customRehabItems, newItem] })
    setShowCustom(true)
  }

  const updateCustomItem = (id: string, updates: Partial<RehabLineItem>) => {
    onChange({
      customRehabItems: data.customRehabItems.map((item) => (item.id === id ? { ...item, ...updates } : item)),
    })
  }

  const removeCustomItem = (id: string) => {
    onChange({
      customRehabItems: data.customRehabItems.filter((item) => item.id !== id),
    })
  }

  const getCategoryTotal = (category: CategorySection) => {
    return category.items.reduce((sum, item) => sum + (data.rehabCategories[item.key] || 0), 0)
  }

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-background">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Rehab Budget</p>
              <p className="text-3xl font-bold text-primary">${safeCalculations.totalRehabCost.toLocaleString()}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Cost per Sq Ft</p>
              <p className="text-xl font-semibold text-foreground">
                ${data.sqft > 0 ? (safeCalculations.totalRehabCost / data.sqft).toFixed(2) : "0.00"}
              </p>
            </div>
          </div>

          {safeCalculations.totalRehabCost > 0 && data.rehabCategories.contingency === 0 && (
            <div className="mt-4 flex items-start gap-2 rounded-lg bg-yellow-500/10 p-3">
              <AlertCircle className="h-4 w-4 shrink-0 text-yellow-500 mt-0.5" />
              <p className="text-xs text-yellow-600 dark:text-yellow-400">
                No contingency added. We recommend 10-15% for unexpected costs.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Category Sections */}
      {categories.map((category) => {
        const isExpanded = expandedSections.includes(category.id)
        const categoryTotal = getCategoryTotal(category)

        return (
          <Card key={category.id}>
            <CardHeader className="cursor-pointer select-none" onClick={() => toggleSection(category.id)}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  )}
                  <div className="flex items-center gap-2 text-primary">{category.icon}</div>
                  <CardTitle className="text-base">{category.title}</CardTitle>
                </div>
                <div className="text-sm font-medium text-foreground">${categoryTotal.toLocaleString()}</div>
              </div>
            </CardHeader>

            {isExpanded && (
              <CardContent className="pt-0">
                <div className="grid gap-4 sm:grid-cols-2">
                  {category.items.map((item) => (
                    <div key={item.key} className="space-y-1.5">
                      <Label htmlFor={item.key} className="text-sm">
                        {item.label}
                      </Label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                          $
                        </span>
                        <Input
                          id={item.key}
                          type="text"
                          value={formatCurrency(data.rehabCategories[item.key])}
                          onChange={(e) => updateCategory(item.key, parseCurrency(e.target.value))}
                          placeholder="0"
                          className="bg-secondary border-0 pl-7 h-9"
                        />
                      </div>
                      {item.placeholder && <p className="text-[10px] text-muted-foreground">{item.placeholder}</p>}
                    </div>
                  ))}
                </div>
              </CardContent>
            )}
          </Card>
        )
      })}

      {/* Custom Line Items */}
      <Card>
        <CardHeader className="cursor-pointer select-none" onClick={() => setShowCustom(!showCustom)}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {showCustom ? (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              )}
              <Plus className="h-4 w-4 text-primary" />
              <CardTitle className="text-base">Custom Line Items</CardTitle>
            </div>
            <div className="text-sm font-medium text-foreground">
              ${data.customRehabItems.reduce((sum, i) => sum + i.cost, 0).toLocaleString()}
            </div>
          </div>
        </CardHeader>

        {showCustom && (
          <CardContent className="pt-0 space-y-4">
            {data.customRehabItems.map((item) => (
              <div key={item.id} className="flex items-center gap-3">
                <Input
                  type="text"
                  value={item.name}
                  onChange={(e) => updateCustomItem(item.id, { name: e.target.value })}
                  placeholder="Item name"
                  className="bg-secondary border-0 flex-1"
                />
                <div className="relative w-32">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                  <Input
                    type="text"
                    value={formatCurrency(item.cost)}
                    onChange={(e) => updateCustomItem(item.id, { cost: parseCurrency(e.target.value) })}
                    placeholder="0"
                    className="bg-secondary border-0 pl-7"
                  />
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeCustomItem(item.id)}
                  className="shrink-0 text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}

            <Button variant="outline" size="sm" onClick={addCustomItem} className="w-full border-dashed bg-transparent">
              <Plus className="h-4 w-4 mr-2" />
              Add Custom Item
            </Button>
          </CardContent>
        )}
      </Card>

      {/* Quick Templates */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Quick Rehab Templates</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Light Cosmetic", sqft: 15, desc: "$15/sqft" },
              { label: "Moderate Rehab", sqft: 30, desc: "$30/sqft" },
              { label: "Heavy Rehab", sqft: 50, desc: "$50/sqft" },
              { label: "Full Gut", sqft: 80, desc: "$80/sqft" },
            ].map((template) => (
              <button
                key={template.label}
                onClick={() => {
                  const total = data.sqft * template.sqft
                  // Distribute across categories roughly
                  onChange({
                    rehabCategories: {
                      ...data.rehabCategories,
                      painting: Math.round(total * 0.1),
                      flooring: Math.round(total * 0.15),
                      kitchenCabinets: Math.round(total * 0.12),
                      kitchenCountertops: Math.round(total * 0.08),
                      kitchenAppliances: Math.round(total * 0.08),
                      bathroomVanities: Math.round(total * 0.06),
                      bathroomTileShower: Math.round(total * 0.08),
                      electrical: Math.round(total * 0.05),
                      plumbing: Math.round(total * 0.05),
                      hvac: template.sqft >= 50 ? Math.round(total * 0.08) : 0,
                      roofing: template.sqft >= 50 ? Math.round(total * 0.1) : 0,
                      contingency: Math.round(total * 0.1),
                      miscellaneous: Math.round(total * 0.05),
                    },
                  })
                }}
                className="rounded-lg border border-border bg-secondary/50 p-3 text-left transition-colors hover:bg-secondary hover:border-primary/50"
              >
                <p className="text-sm font-medium text-foreground">{template.label}</p>
                <p className="text-xs text-muted-foreground">{template.desc}</p>
                {data.sqft > 0 && (
                  <p className="mt-1 text-xs font-medium text-primary">
                    ≈ ${(data.sqft * template.sqft).toLocaleString()}
                  </p>
                )}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
