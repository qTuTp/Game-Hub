"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, User, ArrowLeft, Loader2, ExternalLink } from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { NewsFavoriteButton } from "@/components/news-favorite-button"

interface NewsArticle {
  id: string
  title: string
  content: string
  excerpt: string
  author: string
  publishDate: string
  readTime: string
  category: string
  tags: string[]
  url?: string
  feedlabel?: string
  feedname?: string
}

export default function NewsArticlePage() {
  const params = useParams()
  const [article, setArticle] = useState<NewsArticle | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo(0, 0)

    if (params.id) {
      fetchArticle(params.id as string)
    }
  }, [params.id])

  const fetchArticle = async (id: string) => {
    try {
      setLoading(true)
      setError("")

      console.log(`Attempting to fetch article with ID: ${id}`)

      const response = await fetch(`/api/news/${id}`)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error(`API Error: ${response.status}`, errorData)

        if (response.status === 404) {
          throw new Error("Article not found")
        }
        throw new Error(errorData.error || "Failed to fetch article")
      }

      const data = await response.json()
      console.log("Successfully fetched article:", data.title)
      setArticle(data)
    } catch (err: any) {
      console.error("Fetch error:", err)
      setError(err.message || "Failed to load article. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
            <span className="ml-2 text-white">Loading article...</span>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <p className="text-red-400 text-lg mb-4">{error}</p>
            <div className="space-x-4">
              <Button
                asChild
                variant="outline"
                className="border-purple-400 text-purple-400 hover:bg-purple-400 hover:text-white"
              >
                <Link href="/news">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to News
                </Link>
              </Button>
              <Button onClick={() => fetchArticle(params.id as string)} className="bg-purple-600 hover:bg-purple-700">
                Try Again
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg mb-4">Article not found</p>
            <Button
              asChild
              variant="outline"
              className="border-purple-400 text-purple-400 hover:bg-purple-400 hover:text-white"
            >
              <Link href="/news">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to News
              </Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <div className="mb-6">
          <Button
            asChild
            variant="outline"
            className="border-purple-400 text-purple-400 hover:bg-purple-400 hover:text-white"
          >
            <Link href="/news">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to News
            </Link>
          </Button>
        </div>

        {/* Article */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-8">
            {/* Article Header */}
            <div className="mb-6">
              <div className="flex items-center space-x-2 mb-4">
                <Badge className="bg-purple-600">{article.category}</Badge>
                {article.tags?.map((tag: string) => (
                  <Badge key={tag} variant="secondary" className="bg-slate-700 text-gray-300">
                    {tag}
                  </Badge>
                ))}
              </div>

              <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">{article.title}</h1>

              <div className="flex items-center space-x-4 text-sm text-gray-400 mb-4">
                <div className="flex items-center">
                  <User className="h-4 w-4 mr-1" />
                  {article.author}
                </div>
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  {new Date(article.publishDate).toLocaleDateString()}
                </div>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  {article.readTime}
                </div>
              </div>

              {article.feedname && (
                <div className="text-sm text-gray-400 mb-4">
                  Source: {article.feedname}
                  {article.feedlabel && ` • ${article.feedlabel}`}
                </div>
              )}
            </div>

            {/* Article Content */}
            <div className="prose prose-invert max-w-none">
              <div className="text-gray-300 leading-relaxed whitespace-pre-wrap">{article.content}</div>
            </div>

            {/* Original Article Link */}
            {article.url && (
              <div className="mt-8 pt-6 border-t border-slate-700">
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                  <Button asChild className="bg-purple-600 hover:bg-purple-700">
                    <a href={article.url} target="_blank" rel="noopener noreferrer">
                      Read Original Article
                      <ExternalLink className="ml-2 h-4 w-4" />
                    </a>
                  </Button>
                  <NewsFavoriteButton article={article} />
                </div>
              </div>
            )}

            {/* If no original URL, still show favorite button */}
            {!article.url && (
              <div className="mt-8 pt-6 border-t border-slate-700">
                <NewsFavoriteButton article={article} />
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
