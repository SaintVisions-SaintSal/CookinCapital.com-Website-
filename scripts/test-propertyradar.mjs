/**
 * Test PropertyRadar API - validates field names and criteria
 * Run: node scripts/test-propertyradar.mjs
 */

const API_KEY = process.env.PROPERTYRADAR_API_KEY
if (!API_KEY) {
  console.error("PROPERTYRADAR_API_KEY not set")
  process.exit(1)
}

const BASE_URL = "https://api.propertyradar.com"
const headers = {
  Authorization: `Bearer ${API_KEY}`,
  Accept: "application/json",
  "Content-Type": "application/json",
}

// Test 1: Minimal search with just RadarID to confirm auth works
async function testAuth() {
  console.log("\n=== TEST 1: Auth + Minimal Search (RadarID only, Purchase=0) ===")
  const url = `${BASE_URL}/v1/properties?Purchase=0&Fields=RadarID&Limit=1`
  const criteria = [{ name: "State", value: ["CA"] }, { name: "City", value: ["Los Angeles"] }]
  
  try {
    const res = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify({ Criteria: criteria }),
    })
    const text = await res.text()
    console.log(`Status: ${res.status}`)
    console.log(`Response: ${text.substring(0, 500)}`)
    
    if (res.ok) {
      const data = JSON.parse(text)
      console.log(`Result count: ${data.resultCount || 'N/A'}`)
      console.log(`Total: ${data.totalResultCount || 'N/A'}`)
      console.log(`Results array length: ${data.results?.length || 'N/A'}`)
      return true
    }
    return false
  } catch (e) {
    console.error("Error:", e.message)
    return false
  }
}

// Test 2: Test each field group individually to find which ones fail
async function testFieldGroup(name, fields) {
  console.log(`\n--- Testing field group: ${name} ---`)
  console.log(`Fields: ${fields}`)
  const url = `${BASE_URL}/v1/properties?Purchase=0&Fields=${fields}&Limit=1`
  const criteria = [{ name: "State", value: ["CA"] }, { name: "City", value: ["Los Angeles"] }]
  
  try {
    const res = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify({ Criteria: criteria }),
    })
    
    if (res.ok) {
      const data = await res.json()
      const firstResult = data.results?.[0] || {}
      const returnedFields = Object.keys(firstResult)
      console.log(`OK - Returned fields: ${returnedFields.join(", ")}`)
      return { ok: true, fields: returnedFields }
    } else {
      const text = await res.text()
      console.log(`FAILED (${res.status}): ${text.substring(0, 300)}`)
      return { ok: false, error: text }
    }
  } catch (e) {
    console.error(`ERROR: ${e.message}`)
    return { ok: false, error: e.message }
  }
}

// Test 3: Test individual fields one by one to find the exact bad one
async function testSingleField(field) {
  const url = `${BASE_URL}/v1/properties?Purchase=0&Fields=RadarID,${field}&Limit=1`
  const criteria = [{ name: "State", value: ["CA"] }, { name: "City", value: ["Los Angeles"] }]
  
  try {
    const res = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify({ Criteria: criteria }),
    })
    
    if (res.ok) {
      return { field, ok: true }
    } else {
      const text = await res.text()
      return { field, ok: false, error: text.substring(0, 200) }
    }
  } catch (e) {
    return { field, ok: false, error: e.message }
  }
}

// Test 4: Test foreclosure criteria
async function testForeclosureCriteria() {
  console.log("\n=== TEST 4: Foreclosure Criteria ===")
  const url = `${BASE_URL}/v1/properties?Purchase=0&Fields=RadarID,Address,City,State,inForeclosure,ForeclosureStage&Limit=5`
  const criteria = [
    { name: "State", value: ["CA"] },
    { name: "inForeclosure", value: [1] },
  ]
  
  try {
    const res = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify({ Criteria: criteria }),
    })
    const text = await res.text()
    console.log(`Status: ${res.status}`)
    console.log(`Response: ${text.substring(0, 1000)}`)
    
    if (res.ok) {
      const data = JSON.parse(text)
      console.log(`Found ${data.totalResultCount || 0} total foreclosures in CA`)
      if (data.results?.length > 0) {
        console.log("First result:", JSON.stringify(data.results[0], null, 2))
      }
    }
  } catch (e) {
    console.error("Error:", e.message)
  }
}

// Run all tests
async function main() {
  console.log("PropertyRadar API Test Suite")
  console.log("API Key:", API_KEY ? `${API_KEY.substring(0, 8)}...` : "NOT SET")
  
  // Test auth
  const authOk = await testAuth()
  if (!authOk) {
    console.error("\nAuth failed - stopping tests")
    return
  }
  
  // Test field groups
  const fieldGroups = {
    CORE: "RadarID,Address,City,State,ZipFive,County,APN,Latitude,Longitude",
    PROPERTY: "PType,Beds,Baths,SqFt,LotSize,LotSizeAcres,YearBuilt,Units,Pool,isSameMailingOrExempt,isNotSameMailingOrExempt",
    VALUE: "AVM,AVMPerSqFt,EquityPercent,AvailableEquity,CLTV,TotalLoanBalance,HUDRent",
    OWNER: "Owner,Owner2,Taxpayer,YearsOwned,NumberOfPropertiesOwned,isDeceasedProperty,isCashBuyer",
    DISTRESS: "inForeclosure,ForeclosureStage,ForeclosureRecDate,SaleDate,OpeningBid,PublishedBid,DefaultAmount,DefaultAsOf,inTaxDelinquency,inBankruptcyProperty,inDivorce,isSiteVacant,isDeceasedProperty,isPreforeclosure,isAuction,isBankOwned",
    TRANSFER: "LastTransferRecDate,LastTransferValue,LastTransferType,LastTransferSeller,LastTransferDownPaymentPercent,isRecentSale,isRecentFlip",
    LOAN: "FirstAmount,FirstRate,FirstLoanType,FirstPurpose,FirstDate,FirstTermInYears,NumberLoans",
    LISTING: "isListedForSale,ListingPrice,ListingDate,DaysOnMarket,ListingStatus,ListingType",
    TAX: "AssessedValue,AnnualTaxes,EstimatedTaxRate",
  }
  
  console.log("\n=== TEST 2: Field Groups ===")
  const failedGroups = []
  
  for (const [name, fields] of Object.entries(fieldGroups)) {
    const result = await testFieldGroup(name, fields)
    if (!result.ok) {
      failedGroups.push(name)
    }
  }
  
  // For failed groups, test each field individually
  if (failedGroups.length > 0) {
    console.log("\n=== TEST 3: Individual Field Testing for Failed Groups ===")
    for (const groupName of failedGroups) {
      const fields = fieldGroups[groupName].split(",")
      console.log(`\nTesting individual fields in ${groupName}:`)
      for (const field of fields) {
        const result = await testSingleField(field)
        console.log(`  ${field}: ${result.ok ? 'OK' : 'FAILED - ' + result.error}`)
      }
    }
  }
  
  // Test foreclosure criteria
  await testForeclosureCriteria()
  
  console.log("\n=== DONE ===")
}

main().catch(console.error)
