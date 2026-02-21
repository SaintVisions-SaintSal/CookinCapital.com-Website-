const API_KEY = process.env.PROPERTYRADAR_API_KEY
if (!API_KEY) { console.error("PROPERTYRADAR_API_KEY not set"); process.exit(1) }

const BASE = "https://api.propertyradar.com"
const headers = { Authorization: `Bearer ${API_KEY}`, Accept: "application/json", "Content-Type": "application/json" }

async function testFields(name, fields) {
  const url = `${BASE}/v1/properties?Purchase=0&Fields=${fields}&Limit=1`
  const body = JSON.stringify({ Criteria: [{ name: "State", value: ["CA"] }, { name: "City", value: ["Los Angeles"] }] })
  try {
    const res = await fetch(url, { method: "POST", headers, body })
    if (res.ok) {
      const data = await res.json()
      const keys = data.results?.[0] ? Object.keys(data.results[0]) : []
      console.log(`[OK] ${name}: returned fields = ${keys.join(", ")}`)
      return true
    } else {
      const text = await res.text()
      console.log(`[FAIL] ${name}: ${res.status} - ${text.substring(0, 200)}`)
      return false
    }
  } catch (e) { console.log(`[ERR] ${name}: ${e.message}`); return false }
}

async function testSingleField(field) {
  const url = `${BASE}/v1/properties?Purchase=0&Fields=RadarID,${field}&Limit=1`
  const body = JSON.stringify({ Criteria: [{ name: "State", value: ["CA"] }, { name: "City", value: ["Los Angeles"] }] })
  const res = await fetch(url, { method: "POST", headers, body })
  if (res.ok) { console.log(`  [OK] ${field}`); return true }
  const text = await res.text()
  console.log(`  [FAIL] ${field}: ${text.substring(0, 150)}`)
  return false
}

async function testCriteria(name, criteria) {
  const url = `${BASE}/v1/properties?Purchase=0&Fields=RadarID,Address,City,State&Limit=3`
  const body = JSON.stringify({ Criteria: [{ name: "State", value: ["CA"] }, ...criteria] })
  try {
    const res = await fetch(url, { method: "POST", headers, body })
    if (res.ok) {
      const data = await res.json()
      console.log(`[OK] Criteria "${name}": ${data.totalResultCount} total results`)
      return true
    } else {
      const text = await res.text()
      console.log(`[FAIL] Criteria "${name}": ${res.status} - ${text.substring(0, 200)}`)
      return false
    }
  } catch (e) { console.log(`[ERR] Criteria "${name}": ${e.message}`); return false }
}

async function main() {
  console.log("=== PropertyRadar API Field & Criteria Validation ===\n")
  console.log("API Key:", API_KEY.substring(0, 8) + "...\n")

  // Test 1: Auth
  console.log("--- AUTH TEST ---")
  const authOk = await testFields("AUTH", "RadarID")
  if (!authOk) { console.log("Auth failed, stopping."); return }

  // Test 2: Field groups
  console.log("\n--- FIELD GROUP TESTS ---")
  const groups = {
    CORE: "RadarID,Address,City,State,ZipFive,County,APN,Latitude,Longitude",
    PROPERTY: "PType,Beds,Baths,SqFt,LotSize,LotSizeAcres,YearBuilt,Units",
    OWNER_OCCUPANCY: "isSameMailingOrExempt,isNotSameMailingOrExempt",
    VALUE: "AVM,AVMPerSqFt,EquityPercent,AvailableEquity,CLTV,TotalLoanBalance",
    OWNER: "Owner,Owner2,Taxpayer,YearsOwned,NumberOfPropertiesOwned",
    DISTRESS_BOOL: "inForeclosure,inTaxDelinquency,inBankruptcyProperty,inDivorce,isSiteVacant,isDeceasedProperty",
    DISTRESS_STAGE: "ForeclosureStage,isPreforeclosure,isAuction,isBankOwned",
    FORECLOSURE_DETAIL: "ForeclosureRecDate,SaleDate,OpeningBid,PublishedBid,DefaultAmount,DefaultAsOf",
    TRANSFER: "LastTransferRecDate,LastTransferValue,LastTransferType,LastTransferSeller,LastTransferDownPaymentPercent",
    TRANSFER_BOOL: "isRecentSale,isRecentFlip,isCashBuyer",
    LOAN: "FirstAmount,FirstRate,FirstLoanType,FirstPurpose,FirstDate,FirstTermInYears,NumberLoans",
    LISTING: "isListedForSale,ListingPrice,ListingDate,DaysOnMarket,ListingStatus,ListingType",
    TAX: "AssessedValue,AnnualTaxes,EstimatedTaxRate",
    MISC: "Pool,HUDRent",
  }

  const failedGroups = []
  for (const [name, fields] of Object.entries(groups)) {
    const ok = await testFields(name, fields)
    if (!ok) failedGroups.push({ name, fields })
  }

  // Test 3: Individual fields for failed groups
  if (failedGroups.length > 0) {
    console.log("\n--- INDIVIDUAL FIELD TESTS (for failed groups) ---")
    for (const { name, fields } of failedGroups) {
      console.log(`\nGroup ${name}:`)
      for (const f of fields.split(",")) {
        await testSingleField(f)
      }
    }
  }

  // Test 4: Criteria
  console.log("\n--- CRITERIA TESTS ---")
  await testCriteria("inForeclosure=1", [{ name: "inForeclosure", value: [1] }])
  await testCriteria("inTaxDelinquency=1", [{ name: "inTaxDelinquency", value: [1] }])
  await testCriteria("inBankruptcyProperty=1", [{ name: "inBankruptcyProperty", value: [1] }])
  await testCriteria("inDivorce=1", [{ name: "inDivorce", value: [1] }])
  await testCriteria("isSiteVacant=1", [{ name: "isSiteVacant", value: [1] }])
  await testCriteria("isDeceasedProperty=1", [{ name: "isDeceasedProperty", value: [1] }])
  await testCriteria("ForeclosureStage=Preforeclosure", [{ name: "ForeclosureStage", value: ["Preforeclosure"] }])
  await testCriteria("EquityPercent [[50,null]]", [{ name: "EquityPercent", value: [[50, null]] }])
  await testCriteria("isListedForSale=1", [{ name: "isListedForSale", value: [1] }])
  await testCriteria("isSameMailingOrExempt=1", [{ name: "isSameMailingOrExempt", value: [1] }])
  await testCriteria("isNotSameMailingOrExempt=1", [{ name: "isNotSameMailingOrExempt", value: [1] }])
  await testCriteria("PType=SFR", [{ name: "PType", value: ["SFR"] }])

  // Test 5: Full search like the app would do
  console.log("\n--- FULL SEARCH TEST (Foreclosures in LA) ---")
  const fullUrl = `${BASE}/v1/properties?Purchase=1&Fields=RadarID,Address,City,State,ZipFive,County,APN,Latitude,Longitude,PType,Beds,Baths,SqFt,LotSize,YearBuilt,AVM,EquityPercent,AvailableEquity,TotalLoanBalance,Owner,YearsOwned,inForeclosure,ForeclosureStage,inTaxDelinquency,inBankruptcyProperty,inDivorce,isSiteVacant,isDeceasedProperty,LastTransferRecDate,LastTransferValue,isListedForSale,AssessedValue&Limit=5`
  const fullBody = JSON.stringify({ Criteria: [{ name: "State", value: ["CA"] }, { name: "City", value: ["Los Angeles"] }, { name: "inForeclosure", value: [1] }] })
  try {
    const res = await fetch(fullUrl, { method: "POST", headers, body: fullBody })
    if (res.ok) {
      const data = await res.json()
      console.log(`[OK] Found ${data.totalResultCount} foreclosures in LA`)
      console.log(`Cost: ${data.totalCost}`)
      if (data.results?.[0]) {
        console.log("First result:", JSON.stringify(data.results[0], null, 2))
      }
    } else {
      const text = await res.text()
      console.log(`[FAIL] ${res.status}: ${text}`)
    }
  } catch (e) { console.log(`[ERR]: ${e.message}`) }

  console.log("\n=== DONE ===")
}

main().catch(console.error)
