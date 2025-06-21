import { type NextRequest, NextResponse } from "next/server"
import { rawgClient } from "@/lib/api-clients"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search")
    const genres = searchParams.get("genres")
    const platforms = searchParams.get("platforms")
    const page = Number.parseInt(searchParams.get("page") || "1")

    console.log("Games API called with params:", { search, genres, platforms, page })

    const params: any = {
      page,
      page_size: 20,
    }

    if (search) {
      params.search = search
    }

    if (genres && genres !== "all") {
      params.genres = genres
    }

    if (platforms && platforms !== "all") {
      // Map platform names to RAWG platform IDs
      const platformMap: { [key: string]: string } = {
        pc: "4",
        playstation: "187,18,16,15",
        xbox: "1,186,14",
        nintendo: "7,8,9,13,83",
      }
      params.platforms = platformMap[platforms] || platforms
    }

    const data = await rawgClient.getGames(params)

    if (!data || !data.results) {
      console.error("Invalid response from RAWG API:", data)
      return NextResponse.json([])
    }

    // Transform the data to match our expected format
    const transformedGames = data.results.map((game: any) => ({
      id: game.id,
      title: game.name,
      image: game.background_image || "/placeholder.svg?height=300&width=400",
      genre: game.genres?.[0]?.name || "Unknown",
      platform: game.platforms?.map((p: any) => p.platform.name).join(", ") || "Multiple Platforms",
      releaseDate: game.released || new Date().toISOString().split("T")[0],
      rating: game.rating || 0,
      players: game.playtime ? `${game.playtime}h average` : "Unknown",
    }))

    console.log(`Returning ${transformedGames.length} games`)
    return NextResponse.json(transformedGames)
  } catch (error) {
    console.error("Error fetching games:", error)
    return NextResponse.json({ error: "Failed to fetch games" }, { status: 500 })
  }
}
