import { type NextRequest, NextResponse } from "next/server"
import { steamNewsClient } from "@/lib/api-clients"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = await params;
    console.log(`Fetching individual news article with ID: ${id}`)

    // Get all news articles to find the specific one
    let allNews: any[] = []

    try {
      allNews = await steamNewsClient.getAggregatedNews()
      console.log(`Total articles available: ${allNews.length}`)
    } catch (steamError) {
      console.error("Steam API error, falling back to mock data:", steamError)

      // Fallback to mock data if Steam API fails
      allNews = [
        {
          gid: id,
          title: "Gaming News Article",
          contents:
            "This is a sample gaming news article. The original content could not be loaded due to API limitations.",
          author: "GameHub News",
          date: Math.floor(Date.now() / 1000),
          url: null,
          feedname: "GameHub",
          feedlabel: "News",
        },
      ]
    }

    // Try multiple ways to find the article
    let article = null

    // First try: exact gid match
    article = allNews.find((item: any) => item.gid === id)

    // Second try: string comparison of gid
    if (!article) {
      article = allNews.find((item: any) => String(item.gid) === String(id))
    }

    // Third try: check if the ID might be in a different format
    if (!article) {
      article = allNews.find(
        (item: any) => item.gid?.toString().includes(id) || id.includes(item.gid?.toString()),
      )
    }

    // Fourth try: use array index if ID is numeric and within range
    if (!article && /^\d+$/.test(id)) {
      const index = Number.parseInt(id)
      if (index >= 0 && index < allNews.length) {
        article = allNews[index]
        console.log(`Using article at index ${index}`)
      }
    }

    // Fifth try: create a mock article if nothing is found
    if (!article) {
      console.log(`Article with ID ${id} not found, creating mock article`)
      article = {
        gid: id,
        title: "Gaming News Article",
        contents:
          "This gaming news article could not be loaded. This might be due to API rate limits or the article no longer being available. Please try again later or browse other news articles.",
        author: "GameHub News",
        date: Math.floor(Date.now() / 1000),
        url: null,
        feedname: "GameHub",
        feedlabel: "News",
      }
    }

    console.log(`Found/Created article: ${article.title} (ID: ${article.gid})`)

    // Transform the Steam news item to our format
    const transformedArticle = {
      id: article.gid || id,
      title: article.title || "Untitled",
      content: cleanHtmlContent(article.contents || ""),
      excerpt: cleanHtmlContent(article.contents || "").substring(0, 300) + (cleanHtmlContent(article.contents || "").length > 300 ? "..." : ""),
      author: article.author || "Steam News",
      publishDate: article.date ? new Date(article.date * 1000).toISOString() : new Date().toISOString(),
      readTime: `${Math.max(1, Math.ceil((article.contents || article.title || "").length / 200))} min read`,
      category: article.feedlabel || "Gaming News",
      tags:
        article.tags && typeof article.tags === "string"
          ? article.tags
              .split(",")
              .map((tag: string) => tag.trim())
              .filter(Boolean)
          : Array.isArray(article.tags)
            ? article.tags.filter(Boolean)
            : [],
      url: article.url || null,
      feedname: article.feedname || "Steam",
      feedlabel: article.feedlabel || "News",
    }

    console.log(`Successfully transformed article: ${transformedArticle.content}`)
    console.log(`Successfully transformed article: ${transformedArticle.excerpt}`)
    return NextResponse.json(transformedArticle)
  } catch (error) {
    console.error("Error fetching individual news article:", error)

    // Return a fallback article instead of an error
    const fallbackArticle = {
      id: 0,
      title: "Gaming News Article",
      content:
        "This gaming news article is temporarily unavailable due to API limitations. Please try again later or browse other news articles.",
      excerpt: "This gaming news article is temporarily unavailable...",
      author: "GameHub News",
      publishDate: new Date().toISOString(),
      readTime: "1 min read",
      category: "Gaming News",
      tags: [],
      url: null,
      feedname: "GameHub",
      feedlabel: "News",
    }

    return NextResponse.json(fallbackArticle)
  }
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