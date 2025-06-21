"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Search, Star, Calendar, Users, Loader2 } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { WishlistButton } from "@/components/wishlist-button"

// Custom debounce hook
function useDebounce(value: string, delay: number) {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

export default function GamesPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedGenre, setSelectedGenre] = useState("all")
  const [selectedPlatform, setSelectedPlatform] = useState("all")
  const [games, setGames] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMoreGames, setHasMoreGames] = useState(true)
  const [isSearching, setIsSearching] = useState(false)

  // Debounce search term with 1.5 second delay
  const debouncedSearchTerm = useDebounce(searchTerm, 1500)

  useEffect(() => {
    // Get search term from URL params on initial load
    const urlParams = new URLSearchParams(window.location.search)
    const searchParam = urlParams.get("search")
    if (searchParam) {
      setSearchTerm(searchParam)
    }
  }, [])

  useEffect(() => {
    // Show searching indicator when user is typing
    if (searchTerm !== debouncedSearchTerm && searchTerm.length > 0) {
      setIsSearching(true)
    } else {
      setIsSearching(false)
    }
  }, [searchTerm, debouncedSearchTerm])

  useEffect(() => {
    // Reset pagination when filters change (including debounced search)
    setCurrentPage(1)
    setGames([])
    setHasMoreGames(true)
    fetchGames(1, true)
  }, [debouncedSearchTerm, selectedGenre, selectedPlatform])

  const fetchGames = async (page = 1, reset = false) => {
    try {
      if (reset) {
        setLoading(true)
      } else {
        setLoadingMore(true)
      }
      setError("")

      const params = new URLSearchParams()
      if (debouncedSearchTerm) params.append("search", debouncedSearchTerm)
      if (selectedGenre !== "all") params.append("genres", selectedGenre)
      if (selectedPlatform !== "all") params.append("platforms", selectedPlatform)
      params.append("page", page.toString())

      console.log("Fetching games with params:", params.toString())

      const response = await fetch(`/api/games?${params}`)

      if (!response.ok) {
        const errorText = await response.text()
        console.error("API response error:", response.status, errorText)
        throw new Error(`Failed to fetch games: ${response.status}`)
      }

      const data = await response.json()
      console.log("Received games data:", data)

      // Ensure data is an array
      const gamesArray = Array.isArray(data) ? data : []

      if (reset) {
        setGames(gamesArray)
      } else {
        // Append new games to existing ones
        setGames((prevGames) => [...prevGames, ...gamesArray])
      }

      // Check if we have more games to load (RAWG returns 20 games per page)
      setHasMoreGames(gamesArray.length >= 20)
    } catch (err) {
      console.error("Error in fetchGames:", err)
      setError("Failed to load games. Please try again.")
    } finally {
      setLoading(false)
      setLoadingMore(false)
      setIsSearching(false)
    }
  }

  const handleLoadMore = () => {
    const nextPage = currentPage + 1
    setCurrentPage(nextPage)
    fetchGames(nextPage, false)
  }

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Immediately trigger search on form submit (Enter key)
    setCurrentPage(1)
    setGames([])
    setHasMoreGames(true)
    fetchGames(1, true)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">Browse Games</h1>
          <p className="text-gray-300">Discover your next favorite game from our extensive collection</p>
        </div>

        {/* Filters */}
        <div className="bg-slate-800/50 rounded-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <form onSubmit={handleSearchSubmit}>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search games... "
                    value={searchTerm}
                    onChange={handleSearchInputChange}
                    className="pl-10 bg-slate-700 border-slate-600 text-white placeholder-gray-400"
                  />
                  {isSearching && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <Loader2 className="h-4 w-4 animate-spin text-purple-400" />
                    </div>
                  )}
                </div>
              </form>
              {searchTerm && searchTerm !== debouncedSearchTerm && (
                <p className="text-xs text-gray-400 mt-1">
                  Searching in {Math.ceil((1500 - (Date.now() % 1500)) / 1000)} seconds...
                </p>
              )}
            </div>
            <Select value={selectedGenre} onValueChange={setSelectedGenre}>
              <SelectTrigger className="w-full md:w-48 bg-slate-700 border-slate-600 text-white">
                <SelectValue placeholder="Genre" />
              </SelectTrigger>
              <SelectContent className="bg-slate-700 border-slate-600">
                <SelectItem value="all">All Genres</SelectItem>
                <SelectItem value="action">Action</SelectItem>
                <SelectItem value="adventure">Adventure</SelectItem>
                <SelectItem value="strategy">Strategy</SelectItem>
                <SelectItem value="indie">Indie</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
              <SelectTrigger className="w-full md:w-48 bg-slate-700 border-slate-600 text-white">
                <SelectValue placeholder="Platform" />
              </SelectTrigger>
              <SelectContent className="bg-slate-700 border-slate-600">
                <SelectItem value="all">All Platforms</SelectItem>
                <SelectItem value="pc">PC</SelectItem>
                <SelectItem value="playstation">PlayStation</SelectItem>
                <SelectItem value="xbox">Xbox</SelectItem>
                <SelectItem value="nintendo">Nintendo</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
            <span className="ml-2 text-white">Loading games...</span>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-12">
            <p className="text-red-400 text-lg mb-4">{error}</p>
            <Button onClick={() => fetchGames(1, true)} className="bg-purple-600 hover:bg-purple-700">
              Try Again
            </Button>
          </div>
        )}

        {/* Results Count */}
        {!loading && !error && (
          <div className="mb-6">
            <p className="text-gray-300">
              Showing {games.length} games
              {currentPage > 1 && <span className="text-gray-400"> (Page {currentPage})</span>}
              {debouncedSearchTerm && <span className="text-purple-400"> for "{debouncedSearchTerm}"</span>}
            </p>
          </div>
        )}

        {/* Games Grid */}
        {!loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {games.map((game: any) => (
              <Card
                key={game.id}
                className="bg-slate-800/50 border-slate-700 hover:bg-slate-800/70 transition-all duration-300 hover:scale-105"
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
                    {game.discount && game.discount > 0 && (
                      <Badge className="absolute top-2 right-2 bg-red-600">-{game.discount}%</Badge>
                    )}
                    <div className="absolute bottom-2 right-2">
                      <WishlistButton
                        game={{
                          id: String(game.id), 
                          title: game.title,
                          image: game.image || "/placeholder.svg",
                          price: game.price || "Free",
                          originalPrice: game.originalPrice,
                          discount: game.discount,
                          rating: game.rating || 0,
                          genre: game.genre || "Unknown",
                          releaseDate: game.releaseDate || new Date().toISOString(),
                          platform: game.platform || "PC",
                        }}
                        variant="icon"
                      />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-4">
                  <CardTitle className="text-white mb-2">{game.title}</CardTitle>
                  <CardDescription className="text-gray-400 mb-3 line-clamp-2">{game.description}</CardDescription>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-400">
                      <Calendar className="h-4 w-4 mr-2" />
                      {new Date(game.releaseDate).toLocaleDateString()}
                    </div>
                    <div className="flex items-center text-sm text-gray-400">
                      <Users className="h-4 w-4 mr-2" />
                      {game.players}
                    </div>
                    <div className="text-sm text-gray-400">{game.platform}</div>
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      <span className="text-white ml-1">{game.rating}</span>
                    </div>
                  </div>

                  <div className="relative">
                    <Link href={`/games/${game.id}`} className="group block w-full">
                      <div className="relative bg-gradient-to-r from-purple-600 to-pink-600 p-[2px] rounded-xl hover:from-purple-500 hover:to-pink-500 transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-purple-500/25">
                        <div className="bg-slate-800 rounded-[10px] px-6 py-3 text-center relative overflow-hidden">
                          <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-pink-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                          <span className="relative z-10 text-white font-semibold group-hover:text-purple-200 transition-colors duration-300">
                            View Details & Buy Options
                          </span>
                        </div>
                      </div>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Load More Button */}
        {!loading && !error && games.length > 0 && hasMoreGames && (
          <div className="text-center mt-8">
            <Button
              onClick={handleLoadMore}
              disabled={loadingMore}
              className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50"
            >
              {loadingMore ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Loading More Games...
                </>
              ) : (
                "Load More Games"
              )}
            </Button>
          </div>
        )}

        {/* End of Results Message */}
        {!loading && !error && games.length > 0 && !hasMoreGames && (
          <div className="text-center mt-8">
            <p className="text-gray-400">You've reached the end of available games!</p>
            <Button
              onClick={() => {
                setSearchTerm("")
                setSelectedGenre("all")
                setSelectedPlatform("all")
              }}
              variant="outline"
              className="mt-4 border-purple-400 text-purple-400 hover:bg-purple-400 hover:text-white"
            >
              Clear All Filters
            </Button>
          </div>
        )}

        {!loading && !error && games.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">No games found matching your criteria.</p>
            <Button
              onClick={() => {
                setSearchTerm("")
                setSelectedGenre("all")
                setSelectedPlatform("all")
              }}
              className="mt-4 bg-purple-600 hover:bg-purple-700"
            >
              Clear Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
