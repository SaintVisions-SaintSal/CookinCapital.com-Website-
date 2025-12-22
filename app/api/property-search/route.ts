import { type NextRequest, NextResponse } from "next/server"

const RENTCAST_API_KEY = "609f6955bf37429e8611da12430915ab"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const address = searchParams.get("address")
  const city = searchParams.get("city")
  const state = searchParams.get("state")
  const zip = searchParams.get("zip")
  const propertyType = searchParams.get("propertyType") || ""
  const bedrooms = searchParams.get("bedrooms") || ""
  const bathrooms = searchParams.get("bathrooms") || ""
  const squareFootage = searchParams.get("squareFootage") || ""

  if (!address || !city || !state) {
    return NextResponse.json({ error: "Address, city, and state are required" }, { status: 400 })
  }

  const fullAddress = `${address}, ${city}, ${state}${zip ? `, ${zip}` : ""}`

  let apiUrl = `https://api.rentcast.io/v1/avm/value?address=${encodeURIComponent(fullAddress)}&compCount=5`

  if (propertyType) apiUrl += `&propertyType=${encodeURIComponent(propertyType)}`
  if (bedrooms) apiUrl += `&bedrooms=${encodeURIComponent(bedrooms)}`
  if (bathrooms) apiUrl += `&bathrooms=${encodeURIComponent(bathrooms)}`
  if (squareFootage) apiUrl += `&squareFootage=${encodeURIComponent(squareFootage)}`

  try {
    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        "X-Api-Key": RENTCAST_API_KEY,
        Accept: "application/json",
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("RentCast API error:", response.status, errorText)
      return NextResponse.json({ error: `Property lookup failed: ${response.status}` }, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Property search error:", error)
    return NextResponse.json({ error: "Failed to fetch property data" }, { status: 500 })
  }
}
