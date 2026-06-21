export interface PropertyResult {
  radarId?: string
  address: string
  city: string
  state: string
  zip: string
  county?: string
  apn?: string
  latitude?: number
  longitude?: number
  propertyType?: string
  beds?: number
  baths?: number
  sqft?: number
  lotSize?: number
  yearBuilt?: number
  units?: number
  value?: number
  equity?: number
  equityPercent?: number
  availableEquity?: number
  loanBalance?: number
  ownerName?: string
  ownerAddress?: string
  ownerCity?: string
  ownerState?: string
  ownerZip?: string
  yearsOwned?: number
  foreclosureStatus?: string
  foreclosureAuctionDate?: string
  foreclosureOpeningBid?: number
  taxDefaultYears?: number
  taxDefaultAmount?: number
  inBankruptcy?: boolean
  bankruptcyChapter?: string
  inDivorce?: boolean
  isVacant?: boolean
  isDeceased?: boolean
  transferType?: string
  transferDate?: string
  transferAmount?: number
  lastSaleDate?: string
  lastSalePrice?: number
  loanRate?: number
  loanType?: string
  listedForSale?: boolean
  listPrice?: number
  listingDate?: string
  daysOnMarket?: number
  assessedValue?: number
  annualTaxes?: number
  inTaxDelinquency?: boolean
  imageUrl?: string
  source?: string
}

export interface AutocompletePrediction {
  placeId: string
  description: string
  searchQuery: string
  mainText: string
  secondaryText?: string
  locationType?: string
}

export interface PropertySearchFilters {
  propertyType: string
  foreclosure: boolean
  taxDelinquent: boolean
  divorce: boolean
  vacant: boolean
  absenteeOwner: boolean
  listedForSale: boolean
  bedsMin: string
  bedsMax: string
  bathsMin: string
  bathsMax: string
  valueMin: string
  valueMax: string
  equityMin: string
  equityMax: string
  yearBuiltMin: string
  yearBuiltMax: string
}

export interface RecentSearchItem {
  id: string
  label: string
  searchQuery: string
  searchedAt: string
}

export interface SavedPropertyItem {
  id: string
  radarId: string
  address: string
  city: string
  state: string
  zip: string
  value?: number
  imageUrl?: string
  savedAt: string
}
