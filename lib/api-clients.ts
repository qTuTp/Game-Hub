// API client configurations and helper functions

export const API_KEYS = {
  RAWG: "a34537b06d064e15aa94b3b864aab84b", //For Game Info
  OPENCRITICS: "2b9eb833e4msh97ab3659db850b6p167bd5jsnc51f345f5a90", //Abandon
  GIANTBOMB: "25f6e39909625e33b686c703f4658c91a27810cd", //Abandon
  GAMESPOT: "78f054f2863ccd08254d9a6f6c62377eb8ad997c", //For Reviews
  // CheapShark, no API key required. For pricing info
  // ISteamNews, no API key required. For gaming news info
}


export const API_ENDPOINTS = {
  RAWG: "https://api.rawg.io/api",
  OPENCRITICS: "https://opencritic-api.p.rapidapi.com",
  CHEAPSHARK: "https://www.cheapshark.com/api/1.0",
  GIANTBOMB: "https://www.giantbomb.com/api",
  GAMESPOT: "https://www.gamespot.com/api",
}

// RAWG API Class that handle RAWG API Call
export class RAWGClient {
  private baseUrl = API_ENDPOINTS.RAWG
  private apiKey = API_KEYS.RAWG

  // Get Multiple Game from RAWG
  async getGames(
    params: {
      search?: string
      genres?: string
      platforms?: string
      page?: number
      page_size?: number
    } = {},
  ) {
    const searchParams = new URLSearchParams({
      key: this.apiKey,
      page_size: "20",
      ...params,
      page: params.page?.toString() || "1",
    })

    const response = await fetch(`${this.baseUrl}/games?${searchParams}`)
    if (!response.ok) throw new Error("Failed to fetch games")
    return response.json()
  }

  // Get Specific Game Details from RAWG
  async getGame(id: string) {
    console.log(`Making RAWG API request for game ID: ${id}`)

    const response = await fetch(`${this.baseUrl}/games/${id}?key=${this.apiKey}`)

    console.log(`RAWG API response status: ${response.status}`)

    if (response.status === 404) {
      throw new Error("Game not found (404)")
    }

    if (!response.ok) {
      console.error(`RAWG API error: ${response.status} ${response.statusText}`)
      throw new Error(`Failed to fetch game: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    console.log(`RAWG API response data:`, { id: data.id, name: data.name, exists: !!data.id })

    // Check if the response contains valid game data
    if (!data || !data.id) {
      console.error("Invalid game data received:", data)
      throw new Error("Game not found (404)")
    }

    return data
  }

  // Get Image for the Specific GAme
  async getGameScreenshots(id: string) {
    const response = await fetch(`${this.baseUrl}/games/${id}/screenshots?key=${this.apiKey}`)
    if (!response.ok) {
      console.warn(`Failed to fetch screenshots for game ${id}: ${response.status}`)
      return { results: [] }
    }
    return response.json()
  }

}

// OpenCritics API client |Abandon
// export class OpenCriticsClient {
//   private baseUrl = API_ENDPOINTS.OPENCRITICS
//   private headers = {
//     "X-RapidAPI-Key": API_KEYS.OPENCRITICS,
//     "X-RapidAPI-Host": "opencritic-api.p.rapidapi.com",
//   }

//   async getGameReviews(gameId: string) {
//     const response = await fetch(`${this.baseUrl}/game/${gameId}`, {
//       headers: this.headers,
//     })
//     if (!response.ok) throw new Error("Failed to fetch reviews")
//     return response.json()
//   }

//   async searchGame(name: string) {
//     const response = await fetch(`${this.baseUrl}/game/search?criteria=${encodeURIComponent(name)}`, {
//       headers: this.headers,
//     })
//     if (!response.ok) throw new Error("Failed to search game")
//     return response.json()
//   }
// }

// GameSpot API Class for Retreiving Game Reviews
export class GameSpotClient {
  private baseUrl = API_ENDPOINTS.GAMESPOT
  private apiKey = API_KEYS.GAMESPOT
  private lastRequestTime = 0
  private minRequestInterval = 2000 // 2 seconds between requests
  private cache = new Map<string, { data: any; timestamp: number }>()
  private cacheTimeout = 10 * 60 * 1000 // 10 minutes

  // Functions to reduce API request
  private async delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  private async rateLimit() {
    const now = Date.now()
    const timeSinceLastRequest = now - this.lastRequestTime

    if (timeSinceLastRequest < this.minRequestInterval) {
      const waitTime = this.minRequestInterval - timeSinceLastRequest
      console.log(`GameSpot rate limiting: waiting ${waitTime}ms`)
      await this.delay(waitTime)
    }

    this.lastRequestTime = Date.now()
  }

  // Get data from cache 
  private getCachedData(key: string) {
    const cached = this.cache.get(key)
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      console.log(`Using cached GameSpot data for ${key}`)
      return cached.data
    }
    return null
  }

  // Save data to cache so no need to make API frequent
  private setCachedData(key: string, data: any) {
    this.cache.set(key, { data, timestamp: Date.now() })
  }

  // Get GameSpot Reviews with filter
  async getReviews(params: { limit?: number; offset?: number; filter?: string } = {}) {
    const cacheKey = `reviews_${params.limit || 20}_${params.offset || 0}_${params.filter || "none"}`
    const cached = this.getCachedData(cacheKey)
    if (cached) return cached

    console.log("Making GameSpot API request for reviews...")

    await this.rateLimit()

    const searchParams = new URLSearchParams({
      api_key: this.apiKey,
      format: "json",
      limit: (params.limit || 20).toString(),
      offset: (params.offset || 0).toString(),
      sort: "publish_date:desc",
    })

    if (params.filter) {
      searchParams.append("filter", `title:${params.filter}`)
    }

    const url = `${this.baseUrl}/reviews/?${searchParams}`
    console.log("GameSpot API URL:", url)

    try {
      const response = await fetch(url, {
        headers: {
          "User-Agent": "GameHub/1.0",
          Accept: "application/json",
        },
      })

      console.log(`GameSpot API response status: ${response.status}`)

      const data = await response.json()
      console.log("GameSpot API response:", {
        error: data.error,
        results_count: data.results?.length || 0,
        status_code: data.status_code,
        total_results: data.number_of_total_results,
      })

      if (data.error && data.error !== "OK") {
        console.warn(`GameSpot API error: ${data.error}, using mock data`)


      }
      console.log(JSON.stringify(data, null, 2))

      this.setCachedData(cacheKey, data)
      return data
    } catch (error) {
      console.error("GameSpot API request failed:", error)
      console.warn("Using mock data due to API failure")

    }
  }

  async getGameDetails(gameId: string) {
    console.log(`Fetching GameSpot game details for ID: ${gameId}`)

    await this.rateLimit()

    const searchParams = new URLSearchParams({
      api_key: this.apiKey,
      format: "json",
      field_list: "id,name,image,deck,genres,platforms",
    })

    const url = `${this.baseUrl}/games/${gameId}/?${searchParams}`

    try {
      const response = await fetch(url, {
        headers: {
          "User-Agent": "GameHub/1.0",
          Accept: "application/json",
        },
      })

      if (!response.ok) {
        console.warn(`Failed to fetch game details for ${gameId}: ${response.status}`)
        return null
      }

      const contentType = response.headers.get("content-type")
      if (!contentType || !contentType.includes("application/json")) {
        console.warn(`Non-JSON response for game details ${gameId}`)
        return null
      }

      const data = await response.json()

      if (data.error && data.error !== "OK") {
        console.warn(`GameSpot Game API error: ${data.error}`)
        return null
      }

      return data.results
    } catch (error) {
      console.warn("GameSpot Game Details API request failed:", error)
      return null
    }
  }

  async searchGames(query: string) {
    console.log(`Searching GameSpot for: ${query}`)

    await this.rateLimit()

    const searchParams = new URLSearchParams({
      api_key: this.apiKey,
      format: "json",
      query: encodeURIComponent(query),
      resources: "game",
      limit: "10",
      field_list: "id,name,image,deck",
    })

    const url = `${this.baseUrl}/search/?${searchParams}`

    try {
      const response = await fetch(url, {
        headers: {
          "User-Agent": "GameHub/1.0",
          Accept: "application/json",
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to search games: ${response.status} ${response.statusText}`)
      }

      const contentType = response.headers.get("content-type")
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Non-JSON response from search")
      }

      const data = await response.json()

      if (data.error && data.error !== "OK") {
        throw new Error(`GameSpot Search API error: ${data.error}`)
      }

      return data
    } catch (error) {
      console.error("GameSpot Search API request failed:", error)
      throw error
    }
  }

  async getGame(gameId: string) {
    console.log(`Fetching GameSpot game details for ID: ${gameId}`)

    await this.rateLimit()

    const searchParams = new URLSearchParams({
      api_key: this.apiKey,
      format: "json",
    })

    const url = `${this.baseUrl}/games/${gameId}/?${searchParams}`

    try {
      const response = await fetch(url, {
        headers: {
          "User-Agent": "GameHub/1.0",
          Accept: "application/json",
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch game: ${response.status} ${response.statusText}`)
      }

      const contentType = response.headers.get("content-type")
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Non-JSON response from game API")
      }

      const data = await response.json()

      if (data.error && data.error !== "OK") {
        throw new Error(`GameSpot Game API error: ${data.error}`)
      }

      return data
    } catch (error) {
      console.error("GameSpot Game API request failed:", error)
      throw error
    }
  }
}

// Steam News API Class with function for fetching news
export class SteamNewsClient {
  private baseUrl = "https://api.steampowered.com/ISteamNews/GetNewsForApp/v2"
  private lastRequestTime = 0
  private minRequestInterval = 1000 // 1 second between requests
  private cache = new Map<string, { data: any; timestamp: number }>()
  private cacheTimeout = 5 * 60 * 1000 // 5 minutes

  private async delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  private async rateLimit() {
    const now = Date.now()
    const timeSinceLastRequest = now - this.lastRequestTime

    if (timeSinceLastRequest < this.minRequestInterval) {
      const waitTime = this.minRequestInterval - timeSinceLastRequest
      console.log(`Rate limiting: waiting ${waitTime}ms`)
      await this.delay(waitTime)
    }

    this.lastRequestTime = Date.now()
  }

  private getCachedData(key: string) {
    const cached = this.cache.get(key)
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      console.log(`Using cached data for ${key}`)
      return cached.data
    }
    return null
  }

  private setCachedData(key: string, data: any) {
    this.cache.set(key, { data, timestamp: Date.now() })
  }

  async getNewsForApp(appId: string, count = 10) {
    const cacheKey = `news_${appId}_${count}`
    const cached = this.getCachedData(cacheKey)
    if (cached) return cached

    console.log(`Fetching Steam news for app ID: ${appId}`)

    await this.rateLimit()

    const params = new URLSearchParams({
      appid: appId,
      count: count.toString(),
      maxlength: 300,
      format: "json",
    })

    const url = `${this.baseUrl}/?${params}`

    try {
      const response = await fetch(url, {
        headers: {
          "User-Agent": "GameHub/1.0",
          Accept: "application/json",
        },
      })

      console.log(`Steam News API response status for app ${appId}: ${response.status}`)

      if (response.status === 429) {
        console.warn(`Rate limited for app ${appId}, waiting longer...`)
        await this.delay(5000) // Wait 5 seconds for rate limit
        throw new Error(`Rate limited for app ${appId}`)
      }

      if (!response.ok) {
        console.error(`Steam News API error for app ${appId}: ${response.status} ${response.statusText}`)
        throw new Error(`Failed to fetch news for app ${appId}: ${response.status}`)
      }

      // Check if response is actually JSON
      const contentType = response.headers.get("content-type")
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text()
        console.error(`Non-JSON response for app ${appId}:`, text.substring(0, 100))
        throw new Error(`Non-JSON response for app ${appId}`)
      }

      const data = await response.json()
      console.log(`Steam News API response for app ${appId}:`, {
        newsitems_count: data.appnews?.newsitems?.length || 0,
        appid: data.appnews?.appid,
      })

      this.setCachedData(cacheKey, data)
      return data
    } catch (error) {
      console.error(`Steam News API request failed for app ${appId}:`, error)
      throw error
    }
  }

  async getAggregatedNews() {
    const cacheKey = "aggregated_news"
    const cached = this.getCachedData(cacheKey)
    if (cached) return cached

    // Reduced list of popular game app IDs to minimize API calls
    const popularGameIds = [
      "730", // Counter-Strike 2
      "570", // Dota 2
      "440", // Team Fortress 2
      "271590", // Grand Theft Auto V
      "1245620", // ELDEN RING
    ]

    console.log("Fetching aggregated Steam news from selected games...")

    const allNews: any[] = []

    // Process games sequentially to avoid overwhelming the API
    for (const appId of popularGameIds) {
      try {
        await this.delay(500) // Additional delay between requests
        const newsData = await this.getNewsForApp(appId, 2) // Reduced count per game
        const newsItems = newsData.appnews?.newsitems || []
        allNews.push(...newsItems)
        console.log(`Added ${newsItems.length} news items from app ${appId}`)
      } catch (error) {
        console.warn(`Failed to fetch news for app ${appId}:`, error)
        // Continue with other apps instead of failing completely
        continue
      }
    }

    // Sort by date (newest first) and limit to 15 items
    const sortedNews = allNews.sort((a, b) => b.date - a.date).slice(0, 15)

    console.log(`Aggregated ${sortedNews.length} news items from Steam`)

    this.setCachedData(cacheKey, sortedNews)
    return sortedNews
  }
}

// CheapShark API client
export class CheapSharkClient {
  private baseUrl = API_ENDPOINTS.CHEAPSHARK

  async getDeals(
    params: {
      storeID?: string
      pageNumber?: number
      pageSize?: number
      sortBy?: string
      desc?: boolean
      title?: string
    } = {},
  ) {
    const searchParams = new URLSearchParams({
      pageSize: "60",
      ...Object.fromEntries(Object.entries(params).map(([key, value]) => [key, value?.toString() || ""])),
    })

    // If searching by title, use a different approach
    if (params.title) {
      searchParams.set("title", params.title)
      searchParams.set("exact", "0") // Allow partial matches
    }

    const response = await fetch(`${this.baseUrl}/deals?${searchParams}`)
    if (!response.ok) throw new Error("Failed to fetch deals")
    return response.json()
  }

  async getStores() {
    const response = await fetch(`${this.baseUrl}/stores`)
    if (!response.ok) throw new Error("Failed to fetch stores")
    return response.json()
  }

  async getGameDeals(gameID: string) {
    const response = await fetch(`${this.baseUrl}/games?id=${gameID}`)
    if (!response.ok) throw new Error("Failed to fetch game deals")
    return response.json()
  }
}

// Giant Bomb API client | Abandon
// export class GiantBombClient {
//   private baseUrl = API_ENDPOINTS.GIANTBOMB
//   private apiKey = API_KEYS.GIANTBOMB



//   async getReviews() {
//     console.log("Making Giant Bomb API request for reviews...")

//     const url = `${this.baseUrl}/reviews/?api_key=${this.apiKey}&format=json&limit=10&sort=publish_date:desc`

//     try {
//       const response = await fetch(url, {
//         headers: {
//           "User-Agent": "GameHub/1.0",
//           Accept: "application/json",
//         },
//       })

//       console.log(`Giant Bomb Reviews API response status: ${response.status}`)

//       if (!response.ok) {
//         console.error(`Giant Bomb Reviews API error: ${response.status} ${response.statusText}`)
//         throw new Error(`Failed to fetch reviews: ${response.status} ${response.statusText}`)
//       }

//       const data = await response.json()
//       console.log("Giant Bomb Reviews API response:", {
//         error: data.error,
//         results_count: data.results?.length || 0,
//         status_code: data.status_code,
//       })

//       if (data.error !== "OK") {
//         throw new Error(`Giant Bomb Reviews API error: ${data.error}`)
//       }

//       return data
//     } catch (error) {
//       console.error("Giant Bomb API request failed:", error)
//       throw error
//     }
//   }
// }

// Initialize clients
export const rawgClient = new RAWGClient()
// export const openCriticsClient = new OpenCriticsClient()
export const cheapSharkClient = new CheapSharkClient()
// export const giantBombClient = new GiantBombClient()
export const gameSpotClient = new GameSpotClient()
export const steamNewsClient = new SteamNewsClient()
