import { Content } from "next/font/google"
import { NextResponse } from "next/server"

// Expanded list of popular Steam game app IDs for diverse news content
const POPULAR_GAME_IDS = [
  730, // Counter-Strike 2
  440, // Team Fortress 2
  570, // Dota 2
  1172470, // Apex Legends
  271590, // Grand Theft Auto V
  1085660, // Destiny 2
  252490, // Rust
  1938090, // Call of Duty
  1245620, // ELDEN RING
  1091500, // Cyberpunk 2077
  413150, // Stardew Valley
  892970, // Valheim
  1086940, // Baldur's Gate 3
  1203220, // NARAKA: BLADEPOINT
  1517290, // Battlefield 2042
  1174180, // Red Dead Redemption 2
  1237970, // Titanfall 2
  1599340, // Overwatch 2
  1222670, // Generation Zero
  1449850, // Yu-Gi-Oh! Master Duel
  1426210, // It Takes Two
  1240440, // Halo Infinite
  1328670, // Mass Effect Legendary Edition
  1313860, // EA SPORTS FIFA 23
  1517950, // Battlefield 1
  1174370, // Mortal Kombat 11
  1145360, // Hades
  1097150, // Fall Guys
  1203630, // Inscryption
  1449560, // Vampire Survivors
  1623730, // Palworld
  1966720, // Lethal Company
  1817070, // Marvel's Spider-Man Remastered
  1888930, // Marvel's Spider-Man: Miles Morales
  1811260, // Warhammer 40,000: Darktide
  1172620, // Sea of Thieves
]

// Steam News API client
const steamNewsClient = {
  async getNewsForApp(appId: number, count = 20) {
    try {
      const response = await fetch(
        `https://api.steampowered.com/ISteamNews/GetNewsForApp/v2/?appid=${appId}&count=${count}&format=json&l=english`,
        {
          next: { revalidate: 300 }, // Cache for 5 minutes
        },
      )
      if (!response.ok) {
        console.warn(`Failed to fetch news for app ${appId}: ${response.status}`)
        return null
      }
      return response.json()
    } catch (error) {
      console.warn(`Error fetching news for app ${appId}:`, error)
      return null
    }
  },

  async getAggregatedNews() {
    const allNews = []
    const batchSize = 5 // Process games in batches to avoid overwhelming the API

    console.log(`Fetching English news from ${POPULAR_GAME_IDS.length} games...`)

    // Process games in batches
    for (let i = 0; i < POPULAR_GAME_IDS.length; i += batchSize) {
      const batch = POPULAR_GAME_IDS.slice(i, i + batchSize)

      // Fetch news for current batch in parallel
      const batchPromises = batch.map((appId) => this.getNewsForApp(appId, 15)) // 15 articles per game
      const batchResults = await Promise.allSettled(batchPromises)

      // Process results
      batchResults.forEach((result, index) => {
        if (result.status === "fulfilled" && result.value) {
          const newsData = result.value
          const appId = batch[index]

          if (newsData.appnews && newsData.appnews.newsitems) {
            allNews.push(
              ...newsData.appnews.newsitems.map((item: any) => ({
                ...item,
                appid: appId,
              })),
            )
          }
        }
      })

      // Add small delay between batches to be respectful to Steam's API
      if (i + batchSize < POPULAR_GAME_IDS.length) {
        await new Promise((resolve) => setTimeout(resolve, 100))
      }
    }

    console.log(`Fetched ${allNews.length} total English news articles`)

    // Additional filtering to ensure English content
    const englishNews = allNews.filter((item) => {
      // Filter out articles that don't have English content
      if (!item.title || !item.contents) return false

      // Basic check for non-English characters (optional additional filter)
      const title = item.title.toLowerCase()
      const content = item.contents.toLowerCase()

      // Skip articles that are clearly non-English (contain mostly non-Latin characters)
      const nonLatinRegex = /[^\x00-\x7F]/g
      const titleNonLatin = (title.match(nonLatinRegex) || []).length
      const contentNonLatin = (content.substring(0, 500).match(nonLatinRegex) || []).length

      // If more than 30% of characters are non-Latin, likely not English
      const titleThreshold = title.length * 0.3
      const contentThreshold = Math.min(content.length, 500) * 0.3

      return titleNonLatin < titleThreshold && contentNonLatin < contentThreshold
    })

    console.log(`Filtered to ${englishNews.length} English articles`)

    // Sort by date (newest first) and return all articles (no limit)
    return englishNews.sort((a, b) => b.date - a.date)
  },
}

// Clean HTML content and extract meaningful text
function cleanHtmlContent(htmlContent: string): string {
  if (!htmlContent) return ""

  let cleanText = htmlContent
    // Remove image tags and their content completely
    .replace(/<img[^>]*>/gi, "")
    .replace(/<img[^>]*\/>/gi, "")
    // Remove image source references
    .replace(/src\s*=\s*["'][^"']*["']/gi, "")
    .replace(/\bimg\s+src[^>\s]*[>\s]/gi, "")
    // Remove all HTML tags completely
    .replace(/<[^>]*>/g, " ")
    // Remove HTML entities
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    // Remove common Steam formatting artifacts
    .replace(/\[\/?\w+\]/g, "") // Remove [b], [/b], [i], [/i], [url], etc.
    .replace(/\[\/?\w+=[^\]]*\]/g, "") // Remove [url=...], [img=...], etc.
    .replace(/\{STEAM_CLAN_IMAGE\}/g, "")
    .replace(/\{STEAM_CLAN_LOC_IMAGE\}/g, "")
    // Remove image-related Steam formatting
    .replace(/\[img\][^[]*\[\/img\]/gi, "")
    .replace(/\[previewyoutube=[^\]]*\][^[]*\[\/previewyoutube\]/gi, "")
    // Remove URLs that might be image links
    .replace(/https?:\/\/[^\s]*\.(jpg|jpeg|png|gif|webp|bmp)[^\s]*/gi, "")
    // Clean up whitespace
    .replace(/\s+/g, " ")
    .replace(/\n+/g, " ")
    .trim()

  // If the cleaned text is too short or empty, return empty string
  if (cleanText.length < 20) return ""

  // Truncate to reasonable length for excerpt
  if (cleanText.length > 300) {
    cleanText = cleanText.substring(0, 300)
    // Try to end at a sentence or word boundary
    const lastPeriod = cleanText.lastIndexOf(".")
    const lastSpace = cleanText.lastIndexOf(" ")

    if (lastPeriod > 200) {
      cleanText = cleanText.substring(0, lastPeriod + 1)
    } else if (lastSpace > 200) {
      cleanText = cleanText.substring(0, lastSpace) + "..."
    } else {
      cleanText = cleanText + "..."
    }
  }

  return cleanText
}

// Extract category from content - only use actual data, no assumptions
function extractCategory(title: string, content: string, feedLabel: string): string {
  if (!title && !content && !feedLabel) return "News"

  const titleLower = title?.toLowerCase() || ""
  const contentLower = content?.toLowerCase() || ""
  const feedLower = feedLabel?.toLowerCase() || ""

  // Only categorize if we have clear indicators
  if (titleLower.includes("update") || contentLower.includes("patch") || contentLower.includes("version")) {
    return "Update"
  } else if (
    titleLower.includes("tournament") ||
    contentLower.includes("esports") ||
    contentLower.includes("championship")
  ) {
    return "Esports"
  } else if (titleLower.includes("event") || contentLower.includes("event")) {
    return "Event"
  } else if (titleLower.includes("release") || contentLower.includes("launch")) {
    return "Release"
  } else if (feedLower.includes("community")) {
    return "Community"
  } else {
    return "News" // Generic fallback
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = Number.parseInt(searchParams.get("limit") || "50")
    const offset = Number.parseInt(searchParams.get("offset") || "0")

    console.log(`Fetching English news with limit: ${limit}, offset: ${offset}`)
    console.log("Attempting to fetch English news from Steam News API...")

    // Try to fetch from Steam News API
    const steamNews = await steamNewsClient.getAggregatedNews()

    if (steamNews.length === 0) {
      console.log("No English news articles found from Steam API")
      return NextResponse.json({
        articles: [],
        total: 0,
        hasMore: false,
        nextOffset: 0,
      })
    }

    console.log("Successfully fetched English news from Steam News API")

    // Transform Steam news data
    const transformedNews = steamNews
      .map((newsItem: any, index: number) => {
        // Clean up the content properly
        const cleanContent = cleanHtmlContent(newsItem.contents || "")

        // Skip articles with no meaningful content after cleaning
        if (!cleanContent && !newsItem.title) {
          return null
        }

        const category = extractCategory(newsItem.title, cleanContent, newsItem.feedlabel)

        return {
          id: newsItem.gid || `steam-${newsItem.appid}-${index}`,
          title: newsItem.title || "",
          excerpt: cleanContent,
          content: newsItem.contents || "",
          author: newsItem.author || "",
          publishDate: newsItem.date
            ? new Date(newsItem.date * 1000).toISOString().split("T")[0]
            : new Date().toISOString().split("T")[0],
          category: category,
          sourceUrl: newsItem.url || null,
          feedLabel: newsItem.feedlabel || null,
          appId: newsItem.appid || null,
        }
      })
      .filter(Boolean) // Remove null entries

    // Apply pagination
    const paginatedNews = transformedNews.slice(offset, offset + limit)

    console.log(
      `Returning ${paginatedNews.length} English news articles from Steam (${transformedNews.length} total available)`,
    )

    return NextResponse.json({
      articles: paginatedNews,
      total: transformedNews.length,
      hasMore: offset + limit < transformedNews.length,
      nextOffset: offset + limit,
    })
  } catch (error) {
    console.error("Error fetching English news from Steam News API:", error)

    // Return empty result when API fails - no fallback content
    return NextResponse.json({
      articles: [],
      total: 0,
      hasMore: false,
      nextOffset: 0,
      error: "Failed to fetch English news from Steam API",
    })
  }
}
