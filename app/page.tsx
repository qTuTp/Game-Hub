"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Gamepad2, TrendingUp, DollarSign, Star, ArrowRight, Loader2 } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

// HomePage component that shows featured games and latest news
export default function HomePage() {
  // State to hold featured games data
  const [featuredGames, setFeaturedGames] = useState([])

  // State to hold latest news articles
  const [latestNews, setLatestNews] = useState([])

  // Loading state to indicate when data is being fetched
  const [loading, setLoading] = useState(true)

  // Fetch content when the component is mounted
  useEffect(() => {
    fetchFeaturedContent()
  }, [])

  // Fetch featured games and latest news
  const fetchFeaturedContent = async () => {
    try {
      setLoading(true)

      // Fetch featured games from the games API
      const gamesResponse = await fetch("/api/games?page=1")
      if (gamesResponse.ok) {
        const gamesData = await gamesResponse.json()
        // Only use the first 3 games for homepage display
        setFeaturedGames(gamesData.slice(0, 3))
      }

      // Fetch latest news articles from the news API
      const newsResponse = await fetch("/api/news")
      if (newsResponse.ok) {
        const newsData = await newsResponse.json()
        // Handle the new API response format that returns an object with articles array
        const articles = newsData.articles || newsData
        // Take first 2 articles for homepage
        setLatestNews(Array.isArray(articles) ? articles.slice(0, 2) : [])
      }
    } catch (error) {
      // Log any fetch errors to the console
      console.error("Error fetching featured content:", error)
    } finally {
      // Turn off loading state whether successful or failed
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Hero Section */}
      <section className="relative py-20 px-4 text-center">
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative max-w-6xl mx-auto">
          <div className="flex justify-center mb-6">
            <Gamepad2 className="h-16 w-16 text-purple-400" />
          </div>
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
            Game<span className="text-purple-400">Hub</span>
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Your ultimate destination for game news, reviews, deals, and comprehensive game information
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/games" className="block">
              <div className="relative group cursor-pointer">
                {/* Custom pill shape for Browse Games */}
                <div className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 transform hover:scale-105 transition-all duration-300 px-8 py-4 rounded-full relative overflow-hidden">
                  <div className="flex items-center justify-center text-white font-medium text-lg">
                    <Gamepad2 className="mr-2 h-5 w-5" />
                    Browse Games
                  </div>
                  {/* Animated background effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                </div>
                {/* Glow effect */}
                <div className="absolute inset-0 bg-purple-500/30 blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full -z-10"></div>
              </div>
            </Link>
            <Link href="/deals" className="block">
              <div className="relative group cursor-pointer">
                {/* Custom pill shape for View Deals */}
                <div className="border-2 border-purple-400 hover:border-purple-300 bg-transparent hover:bg-purple-400 text-purple-400 hover:text-white transform hover:scale-105 transition-all duration-300 px-8 py-4 rounded-full relative overflow-hidden">
                  <div className="flex items-center justify-center font-medium text-lg">
                    <DollarSign className="mr-2 h-5 w-5" />
                    View Deals
                  </div>
                  {/* Ripple effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-300/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-500"></div>
                </div>
                {/* Shadow effect */}
                <div className="absolute inset-0 bg-purple-400/20 blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full -z-10"></div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Games */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-white flex items-center">
              <TrendingUp className="mr-3 h-8 w-8 text-purple-400" />
              Featured Games
            </h2>
            <Button asChild variant="ghost" className="text-purple-400 hover:text-white flex items-center">
              <Link href="/games" className="flex items-center">
                View All <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
              <span className="ml-2 text-white">Loading featured games...</span>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredGames.map((game: any) => (
                <Card
                  key={game.id}
                  className="bg-slate-800/50 border-slate-700 hover:bg-slate-800/70 transition-colors"
                >
                  <CardHeader className="p-0">
                    <div className="relative">
                      <Image
                        src={game.image || "/placeholder.svg"}
                        alt={game.title}
                        width={400}
                        height={300}
                        className="w-full h-48 object-cover rounded-t-lg"
                      />
                      <Badge className="absolute top-2 left-2 bg-purple-600">{game.genre}</Badge>
                      {game.originalPrice !== game.price && (
                        <Badge className="absolute top-2 right-2 bg-red-600">Sale</Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="p-4">
                    <CardTitle className="text-white mb-2">{game.title}</CardTitle>
                    <CardDescription className="text-gray-400 mb-3">{game.platform}</CardDescription>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                        <span className="text-white ml-1">{game.rating}</span>
                      </div>
                    </div>
                    <div className="relative">
                      <Link href={`/games/${game.id}`} className="block">
                        <div className="relative group cursor-pointer">
                          {/* Custom pill shape */}
                          <div className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 transform hover:scale-105 transition-all duration-300 px-6 py-3 rounded-full relative overflow-hidden">
                            <div className="flex items-center justify-center text-white font-medium">
                              <Gamepad2 className="mr-2 h-4 w-4" />
                              View Details & Where to Buy
                            </div>
                            {/* Animated background effect */}
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                          </div>
                          {/* Glow effect */}
                          <div className="absolute inset-0 bg-purple-500/30 blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full -z-10"></div>
                        </div>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {!loading && featuredGames.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-400 text-lg mb-4">Unable to load featured games at the moment.</p>
              <Button onClick={fetchFeaturedContent} className="bg-purple-600 hover:bg-purple-700">
                Try Again
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Latest News */}
      <section className="py-16 px-4 bg-slate-800/30">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-white">Latest News</h2>
            <Button asChild variant="ghost" className="text-purple-400 hover:text-white flex items-center">
              <Link href="/news" className="flex items-center">
                View All <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
              <span className="ml-2 text-white">Loading latest news...</span>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6 items-stretch">
              {latestNews.map((article: any) => (
                <Card
                  key={article.id}
                  className="bg-slate-800/50 border-slate-700 hover:bg-slate-800/70 transition-colors flex flex-col h-full"
                >
                  <CardContent className="p-4 flex flex-col flex-grow">
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="secondary">{article.category}</Badge>
                      <span className="text-sm text-gray-400">
                        {new Date(article.publishDate).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex-grow">
                      <CardTitle className="text-white mb-2">{article.title}</CardTitle>
                      <CardDescription className="text-gray-400 mb-4">{article.excerpt}</CardDescription>
                    </div>
                    <div className="relative mt-auto">
                      <a href={article.sourceUrl} target="_blank" rel="noopener noreferrer" className="block">
                        <div className="relative group cursor-pointer">
                          {/* Custom pill shape with consistent height */}
                          <div className="border-2 border-purple-400 hover:border-purple-300 bg-transparent hover:bg-purple-400 text-purple-400 hover:text-white transform hover:scale-105 transition-all duration-300 px-6 py-3 rounded-full relative overflow-hidden h-12 flex items-center justify-center">
                            <div className="font-medium">Read More</div>
                            {/* Ripple effect */}
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-300/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-500"></div>
                          </div>
                          {/* Shadow effect */}
                          <div className="absolute inset-0 bg-purple-400/20 blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full -z-10"></div>
                        </div>
                      </a>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {!loading && latestNews.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-400 text-lg mb-4">Unable to load latest news at the moment.</p>
              <Button onClick={fetchFeaturedContent} className="bg-purple-600 hover:bg-purple-700">
                Try Again
              </Button>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
