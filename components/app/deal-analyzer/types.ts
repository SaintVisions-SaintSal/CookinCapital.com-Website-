export interface RehabCategory {
  name: string
  items: RehabLineItem[]
  expanded: boolean
}

export interface RehabLineItem {
  id: string
  name: string
  cost: number
  notes?: string
}

export interface DealData {
  // Property info
  address: string
  city: string
  state: string
  zip: string
  propertyType: string
  bedrooms: number
  bathrooms: number
  sqft: number
  yearBuilt: number
  lotSize: number

  // Pricing
  askingPrice: number
  arv: number
  purchasePrice: number

  rehabBudget: number // Total calculated from categories
  rehabCategories: {
    demolition: number
    foundation: number
    roofing: number
    siding: number
    windows: number
    doors: number
    garage: number
    electrical: number
    plumbing: number
    hvac: number
    insulation: number
    drywall: number
    painting: number
    flooring: number
    kitchenCabinets: number
    kitchenCountertops: number
    kitchenAppliances: number
    kitchenFixtures: number
    bathroomVanities: number
    bathroomTileShower: number
    bathroomFixtures: number
    bathroomToilets: number
    interior: number
    landscaping: number
    concrete: number
    decksPatios: number
    fencing: number
    permits: number
    dumpsters: number
    cleaning: number
    staging: number
    generalContractor: number
    contingency: number
    miscellaneous: number
  }
  customRehabItems: RehabLineItem[]

  // Financing
  financingType: string
  loanAmount: number
  interestRate: number
  loanTermMonths: number
  loanPoints: number

  rehabFinanced: boolean
  rehabLoanAmount: number
  drawSchedule: string

  // Holding costs
  monthlyTaxes: number
  monthlyInsurance: number
  monthlyUtilities: number
  monthlyHOA: number
  holdingPeriodMonths: number

  lawnCare: number
  security: number
  propertyManagement: number

  // Buying transaction costs
  closingCostsBuying: number
  inspectionCosts: number
  appraisalCosts: number
  titleInsuranceBuying: number
  otherBuyingCosts: number

  surveyFee: number
  attorneyFees: number
  recordingFees: number
  escrowFees: number

  // Selling transaction costs
  agentCommissionPercent: number
  closingCostsSelling: number
  titleInsuranceSelling: number
  transferTaxes: number
  otherSellingCosts: number

  homeWarranty: number
  concessions: number
  stagingCost: number
  photographyMarketing: number
}

export interface Calculations {
  totalBuyingCosts: number
  pointsCost: number
  totalInterest: number
  totalHoldingCosts: number
  totalSellingCosts: number
  totalInvestment: number
  cashNeeded: number
  totalProfit: number
  roi: number
  equityAtPurchase: number
  monthlyHolding: number
  totalRehabCost: number
  arvPerSqft: number
  costPerSqft: number
  profitPerSqft: number
  maxAllowableOffer: number
  percentOfArv: number
}
