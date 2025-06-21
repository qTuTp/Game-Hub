import { NextResponse } from "next/server"
import { cheapSharkClient } from "@/lib/api-clients"

// Get pricing data for a specific game by its RAWG ID
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = await params;
    console.log(`Fetching pricing data for game ID: ${id}`)

    // First, try to find the game in CheapShark by searching for it
    // Since we have RAWG ID, we need to search by title first
    const baseUrl = new URL(request.url).origin
    const gameResponse = await fetch(`${baseUrl}/api/games/${id}`)
    if (!gameResponse.ok) {
      throw new Error("Failed to fetch game details")
    }

    const gameData = await gameResponse.json()
    const gameTitle = gameData.title

    console.log(`Searching for deals for: ${gameTitle}`)

    // Search for deals using the game title
    const deals = await cheapSharkClient.getDeals({
      title: gameTitle,
      sortBy: "Price",
      pageSize: 10,
    })

    const stores = await cheapSharkClient.getStores()

    // Create a map of stores for quick lookup
    const storeMap = stores.reduce((acc: any, store: any) => {
      acc[store.storeID] = store
      return acc
    }, {})

    // Transform deals into a more structured format
    // Filter deals to find those that match the game title
    const pricingData = deals
      .filter((deal: any) => deal.title.toLowerCase().includes(gameTitle.toLowerCase()))
      .slice(0, 5) // Limit to top 5 deals
      .map((deal: any) => {
        const store = storeMap[deal.storeID]
        const originalPrice = Number.parseFloat(deal.normalPrice)
        const salePrice = Number.parseFloat(deal.salePrice)
        const discount = originalPrice > salePrice ? Math.round(((originalPrice - salePrice) / originalPrice) * 100) : 0

        return {
          name: store?.storeName || "Unknown Store",
          url: `https://www.cheapshark.com/redirect?dealID=${deal.dealID}`,
          price: `$${salePrice.toFixed(2)}`,
          originalPrice: discount > 0 ? `$${originalPrice.toFixed(2)}` : undefined,
          discount: discount > 0 ? discount : undefined,
          icon: getStoreIcon(store?.storeName),
          color: getStoreColor(store?.storeName),
        }
      })

    console.log(`Found ${pricingData.length} pricing options`)

    return NextResponse.json(pricingData)
  } catch (error) {
    console.error("Error fetching pricing data:", error)
    return NextResponse.json([], { status: 200 }) // Return empty array on error
  }
}

function getStoreIcon(storeName: string) {
  // Return appropriate icon component based on store name
  // For now, return a generic icon string that will be handled in the component
  return "store"
}

// Function to get the color class for a store based on its name
function getStoreColor(storeName: string) {
  const storeColors: { [key: string]: string } = {
    Steam: "bg-blue-600",
    "Epic Games Store": "bg-gray-800",
    GOG: "bg-purple-600",
    Origin: "bg-orange-600",
    Uplay: "bg-blue-800",
    GamesPlanet: "bg-green-600",
    "Humble Store": "bg-red-600",
    Fanatical: "bg-yellow-600",
  }

  return storeColors[storeName] || "bg-gray-600" // Default color for unknown stores
}
