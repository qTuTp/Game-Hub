import { NextResponse } from "next/server"
import { cheapSharkClient } from "@/lib/api-clients"

// Handles fetching game deals from CheapShark API
// and transforming them into a more structured format for the frontend.
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const storeID = searchParams.get("storeID")
    const pageNumber = searchParams.get("pageNumber") || "0"
    const sortBy = searchParams.get("sortBy") || "DealRating"

    console.log(`Fetching deals - Store: ${storeID || "all"}, Sort: ${sortBy}, Page: ${pageNumber}`)

    // Prepare parameters for CheapShark API
    const params: any = {
      sortBy,
      desc: true,
      pageSize: 60, // limit to 60 deals per page
      pageNumber: Number.parseInt(pageNumber),
    }

    // Apply store filter if provided
    // If storeID is "all" or not provided, we fetch deals from all stores
    if (storeID && storeID !== "all") {
      params.storeID = storeID
      console.log(`Filtering by store ID: ${storeID}`)
    } else {
      console.log("Fetching deals from all stores")
    }

    // Fetch deals and stores from CheapShark API
    const [deals, stores] = await Promise.all([cheapSharkClient.getDeals(params), cheapSharkClient.getStores()])

    console.log(`Received ${deals.length} deals from API for page ${pageNumber}`)

    // Create a map of stores for quick lookup
    // This will help us associate deals with their respective stores
    const storeMap = stores.reduce((acc: any, store: any) => {
      acc[store.storeID] = store
      return acc
    }, {})

    // Transform deals into a more structured format
    // Group deals by game using a Map for better performance
    const gameDealsMap = new Map()

    deals.forEach((deal: any) => {
      const store = storeMap[deal.storeID]
      const originalPrice = Number.parseFloat(deal.normalPrice)
      const salePrice = Number.parseFloat(deal.salePrice)
      const discount = Math.round(((originalPrice - salePrice) / originalPrice) * 100)

      // Create a more unique identifier for grouping
      // Use gameID if available, otherwise use normalized title
      const gameIdentifier =
        deal.gameID ||
        deal.title
          .toLowerCase()
          .replace(/[^\w\s]/g, "") // Remove special characters
          .replace(/\s+/g, " ") // Replace multiple spaces with a single space
          .trim()

      const dealData = {
        dealID: deal.dealID,
        gameID: deal.gameID,
        title: deal.title,
        originalPrice,
        salePrice,
        discount,
        platform: store?.storeName || "Unknown Store",
        storeUrl: `https://www.cheapshark.com/redirect?dealID=${deal.dealID}`,
        image: deal.thumb || "/placeholder.svg?height=300&width=400",
        rating: Number.parseFloat(deal.steamRatingPercent || "0") / 20, // Convert to 5-star scale
        genre: "Game",
        drm: store?.storeName || "Unknown",
        storeID: deal.storeID,
      }

      // Check if the game already exists in the map
      if (gameDealsMap.has(gameIdentifier)) {
        // Add to existing game's deals
        gameDealsMap.get(gameIdentifier).deals.push(dealData)
      } else {
        // Create new game entry
        gameDealsMap.set(gameIdentifier, {
          id: deal.gameID || deal.dealID,
          title: deal.title, // Use original title for display
          deals: [dealData],
          bestDeal: dealData,
        })
      }
    })

    console.log(`Grouped into ${gameDealsMap.size} unique games`)

    // Process the grouped deals to find the best deal for each game
    // and prepare the final response format
    const transformedDeals = Array.from(gameDealsMap.values()).map((gameGroup: any) => {
      // Sort deals by sale price to find the best deal
      gameGroup.deals.sort((a: any, b: any) => a.salePrice - b.salePrice)

      // Best deal is the first one after sorting
      const bestDeal = gameGroup.deals[0]

      // Alternative stores are the next best deals
      // Limit to 4 alternative stores
      const alternativeStores = gameGroup.deals
        .slice(1)
        .map((deal: any) => ({
          name: deal.platform,
          price: `$${deal.salePrice.toFixed(2)}`,
          originalPrice: `$${deal.originalPrice.toFixed(2)}`,
          discount: deal.discount,
          url: deal.storeUrl,
          storeID: deal.storeID,
        }))
        .slice(0, 4) // Show only up to 4 alternative stores

      return {
        id: bestDeal.gameID || bestDeal.dealID,
        title: bestDeal.title,
        originalPrice: bestDeal.originalPrice,
        salePrice: bestDeal.salePrice,
        discount: bestDeal.discount,
        platform: bestDeal.platform,
        storeUrl: bestDeal.storeUrl,
        image: bestDeal.image,
        rating: bestDeal.rating,
        genre: bestDeal.genre,
        drm: bestDeal.drm,
        alternativeStores,
        totalDeals: gameGroup.deals.length,
      }
    })

    // Sort by discount or sale price based on the sortBy parameter
    transformedDeals.sort((a, b) => {
      if (sortBy === "DealRating" || sortBy === "Savings") {
        return b.discount - a.discount
      } else if (sortBy === "Price") {
        return a.salePrice - b.salePrice
      }
      return 0
    })

    console.log(`Returning ${transformedDeals.length} transformed deals`)

    // Return the transformed deals as JSON response
    // This will be consumed by the frontend to display deals
    return NextResponse.json(transformedDeals)
  } catch (error) {
    console.error("Error fetching deals:", error)
    return NextResponse.json({ error: "Failed to fetch deals" }, { status: 500 })
  }
}
