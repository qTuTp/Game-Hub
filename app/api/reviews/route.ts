import { NextResponse } from "next/server"
import { gameSpotClient } from "@/lib/api-clients"

// This route handles fetching reviews from GameSpot API with enhanced image handling
// and search functionality. It supports pagination with offset and limit parameters.
export async function GET(request: Request) {
  try {
    // Parse query parameters for pagination and search
    // Default values: offset=0, limit=20, search=null
    const { searchParams } = new URL(request.url)
    const offset = searchParams.get("offset") || "0"
    const limit = searchParams.get("limit") || "20"
    const search = searchParams.get("search")

    console.log(`Fetching reviews - Offset: ${offset}, Limit: ${limit}, Search: ${search || "none"}`)

    // Fetch reviews from GameSpot API with search filter if provided
    const params: any = {
      limit: Number.parseInt(limit),
      offset: Number.parseInt(offset),
    }

    if (search && search.trim()) {
      params.filter = search.trim()
    }

    const gameSpotReviews = await gameSpotClient.getReviews(params)
    console.log("Successfully fetched reviews from GameSpot API")

    if (!gameSpotReviews.results || gameSpotReviews.results.length === 0) {
      return NextResponse.json({
        reviews: [],
        hasMore: false,
        total: 0,
      })
    }

    console.log(`Found ${gameSpotReviews.results.length} reviews from GameSpot`)

    // Transform GameSpot reviews data with enhanced image handling
    const transformedReviews = await Promise.all(
      gameSpotReviews.results.map(async (review: any, index: number) => {
        // Calculate star rating from GameSpot score
        let starRating = 3.0 // Default rating
        let originalScore = null

        if (review.score) {
          originalScore = review.score
          // GameSpot uses 1-10 scale, convert to 5-star
          starRating = (review.score / 10) * 5
          console.log(`Review ${review.id}: Original score ${originalScore}/10, Star rating: ${starRating.toFixed(1)}`)
        }

        // Enhanced image handling strategy
        let gameImage = "/placeholder.svg?height=200&width=300"

        // Strategy 1: Use review's own image if available
        if (review.image) {
          console.log('Review Image: ',review.image.original)
          gameImage = review.image.square_small || review.image.square_tiny || review.image.original || gameImage
          console.log(`Using review image for ${review.game?.name || "Unknown Game"}:`, gameImage)
        }
        // Strategy 2: Use game image from review data
        else if (review.game && review.game.image) {
          gameImage =
            review.game.image.medium_url || review.game.image.small_url || review.game.image.original_url || gameImage
          console.log(`Using game image from review data for ${review.game.name}:`, gameImage)
        }
        // Strategy 3: Fetch additional game details if we have a game ID
        else if (review.game && review.game.id) {
          try {
            console.log(`Fetching additional game details for game ID: ${review.game.id}`)
            const gameDetails = await gameSpotClient.getGameDetails(review.game.id)
            if (gameDetails && gameDetails.image) {
              gameImage =
                gameDetails.image.medium_url ||
                gameDetails.image.small_url ||
                gameDetails.image.original_url ||
                gameImage
              console.log(`Found image from game details for ${review.game.name}:`, gameImage)
            }
          } catch (gameError) {
            console.warn(`Failed to fetch game details for ${review.game.name}:`, gameError)
          }
        }
        // Strategy 4: Search for game if we have a name but no ID
        else if (review.game && review.game.name) {
          try {
            console.log(`Searching for game image: ${review.game.name}`)
            const searchResults = await gameSpotClient.searchGames(review.game.name)
            if (searchResults.results && searchResults.results.length > 0) {
              const foundGame = searchResults.results[0]
              if (foundGame.image) {
                gameImage =
                  foundGame.image.medium_url || foundGame.image.small_url || foundGame.image.original_url || gameImage
                console.log(`Found image from search for ${review.game.name}:`, gameImage)
              }
            }
          } catch (searchError) {
            console.warn(`Failed to search for game image ${review.game.name}:`, searchError)
          }
        }
        console.log(`Final game image for ${review.game?.name}:`, gameImage)
        
        // Return transformed review object
        return {
          id: review.id || `gamespot-${index}`,
          gameTitle: review.game?.name,
          gameImage: gameImage,
          rating: Number.parseFloat(starRating.toFixed(1)),
          reviewTitle: review.title || `${review.game?.name} Review`,
          excerpt: review.deck || review.lede || "Professional game review from GameSpot.",
          content: review.body || null,
          author: review.author || "GameSpot Staff",
          publishDate: review.publish_date
            ? new Date(review.publish_date).toISOString().split("T")[0]
            : new Date().toISOString().split("T")[0],
          genre: review.game?.genres?.[0]?.name || "Game",
          platform: review.game?.platforms?.[0]?.name || "PC",
          verdict: review.deck || review.lede || "A comprehensive review from GameSpot's expert reviewers.",
          sourceUrl: review.site_detail_url || `https://www.gamespot.com/reviews/${review.id}/`,
          originalScore: originalScore,
          gameId: review.game?.id,
          gameName: review.game?.name,
        }
      }),
    )

    const hasMore = gameSpotReviews.number_of_total_results > Number.parseInt(offset) + transformedReviews.length

    console.log(`Returning ${transformedReviews.length} reviews from GameSpot with enhanced image handling`)
    return NextResponse.json({
      reviews: transformedReviews,
      hasMore,
      total: gameSpotReviews.number_of_total_results || 0,
    })
  } catch (error) {
    console.error("Error fetching reviews:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch reviews",
        message: "Unable to load reviews from GameSpot API. Please try again later.",
      },
      { status: 500 },
    )
  }
}
