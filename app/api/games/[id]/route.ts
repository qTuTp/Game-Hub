import { NextResponse } from "next/server"
import { rawgClient } from "@/lib/api-clients"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = await params;
    console.log(`Fetching game with ID: ${id}`)

    let gameData
    try {
      gameData = await rawgClient.getGame(id)
    } catch (error) {
      console.error(`RAWG API error for game ${id}:`, error)

      // If it's a 404, return a proper 404 response
      if (error instanceof Error && error.message.includes("404")) {
        return NextResponse.json(
          {
            error: "Game not found",
            message: `Game with ID ${id} was not found in our database.`,
          },
          { status: 404 },
        )
      }

      // For other errors, try to return a generic error
      return NextResponse.json(
        {
          error: "Failed to fetch game",
          message: "There was an error retrieving the game data. Please try again later.",
        },
        { status: 500 },
      )
    }

    // Double-check that we have valid game data
    if (!gameData || !gameData.id) {
      console.log(`Invalid game data received for ID ${id}:`, gameData)
      return NextResponse.json(
        {
          error: "Game not found",
          message: `Game with ID ${id} was not found or has invalid data.`,
        },
        { status: 404 },
      )
    }

    console.log(`Successfully fetched game: ${gameData.name}`)

    // Fetch screenshots with error handling
    let screenshots = { results: [] }
    try {
      screenshots = await rawgClient.getGameScreenshots(id)
    } catch (error) {
      console.warn(`Failed to fetch screenshots for game ${id}:`, error)
      // Continue without screenshots
    }

    // Transform RAWG data to match our component structure with safe fallbacks
    const transformedGame = {
      id: gameData.id,
      title: gameData.name || "Unknown Game",
      genre: gameData.genres?.[0]?.name || "Unknown",
      platforms: gameData.platforms?.map((p: any) => p.platform.name) || ["PC"],
      rating: gameData.rating || 0,
      releaseDate: gameData.released || new Date().toISOString().split("T")[0],
      price: "$29.99", // Default price - we'll get this from CheapShark later
      originalPrice: "$59.99",
      developer: gameData.developers?.[0]?.name || "Unknown Developer",
      publisher: gameData.publishers?.[0]?.name || "Unknown Publisher",
      image: gameData.background_image || "/placeholder.svg?height=400&width=600",
      screenshots: screenshots.results?.slice(0, 3).map((s: any) => s.image) || [],
      description: gameData.description_raw || gameData.description || "No description available for this game.",
      players: gameData.tags?.find((tag: any) => tag.name.toLowerCase().includes("player"))?.name || "Single-player",
      esrbRating: gameData.esrb_rating?.name || "Rating Pending",
      metacriticScore: gameData.metacritic || null,
      tags: gameData.tags?.slice(0, 5).map((tag: any) => tag.name) || [],
    }

    return NextResponse.json(transformedGame)
  } catch (error) {
    console.error(`Unexpected error fetching game ${params.id}:`, error)
    return NextResponse.json(
      {
        error: "Internal server error",
        message: "An unexpected error occurred while fetching the game data.",
      },
      { status: 500 },
    )
  }
}
