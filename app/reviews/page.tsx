"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Star, ThumbsUp, ThumbsDown, User, Calendar, Loader2, Search, AlertCircle } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { ReviewFavoriteButton } from "@/components/review-favorite-button"

// Custom debounce hook to delay search input processing
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

export default function ReviewsPage() {
  const [reviews, setReviews] = useState([])
  const [filteredReviews, setFilteredReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState("newest")
  const [hasMore, setHasMore] = useState(true)
  const [totalReviews, setTotalReviews] = useState(0)
  const [currentOffset, setCurrentOffset] = useState(0)
  const [isSearching, setIsSearching] = useState(false)

  // Debounce search term for API calls
  const debouncedSearchTerm = useDebounce(searchTerm, 1500)

  useEffect(() => {
    // Reset and fetch new results when search term changes
    setCurrentOffset(0)
    setReviews([])
    setHasMore(true)
    fetchReviews(0, true, debouncedSearchTerm)
  }, [debouncedSearchTerm])

  useEffect(() => {
    // Show searching indicator when user is typing
    if (searchTerm !== debouncedSearchTerm && searchTerm.length > 0) {
      setIsSearching(true)
    } else {
      setIsSearching(false)
    }
  }, [searchTerm, debouncedSearchTerm])

  useEffect(() => {
    // Filter and sort existing reviews when filters change
    filterAndSortReviews()
  }, [reviews, sortBy])

  // Fetch reviews from the API
  const fetchReviews = async (offset = 0, reset = false, search = "") => {
    try {
      if (reset) {
        setLoading(true)
      } else {
        setLoadingMore(true)
      }
      setError("")

      const params = new URLSearchParams({
        offset: offset.toString(),
        limit: "20",
      })

      if (search && search.trim()) {
        params.append("search", search.trim())
      }

      const response = await fetch(`/api/reviews?${params}`)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || "Failed to fetch reviews")
      }

      const data = await response.json()

      // Check if we got an error response
      if (data.error) {
        throw new Error(data.message || "Failed to load reviews")
      }

      // Handle the new API response format
      const reviewsData = data.reviews || []

      if (reset) {
        setReviews(reviewsData)
      } else {
        setReviews((prevReviews) => [...prevReviews, ...reviewsData])
      }

      setHasMore(data.hasMore || false)
      setTotalReviews(data.total || 0)
      setCurrentOffset(offset + reviewsData.length)
    } catch (err: any) {
      setError(err.message || "Failed to load reviews. Please try again.")
      console.error(err)
      // Set empty array on error to prevent iteration issues
      if (reset) {
        setReviews([])
      }
    } finally {
      setLoading(false)
      setLoadingMore(false)
      setIsSearching(false)
    }
  }

  // Load more reviews when the button is clicked
  const handleLoadMore = () => {
    fetchReviews(currentOffset, false, debouncedSearchTerm)
  }

  // Filter and sort reviews based on the selected criteria
  const filterAndSortReviews = () => {
    // Ensure reviews is always an array
    if (!Array.isArray(reviews)) {
      console.warn("Reviews is not an array:", reviews)
      setFilteredReviews([])
      return
    }

    const filtered = [...reviews]

    // Sort reviews
    filtered.sort((a: any, b: any) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime()
        case "rating":
          return b.rating - a.rating
        case "popular":
          return b.likes - a.likes
        default:
          return 0
      }
    })

    setFilteredReviews(filtered)
  }

  // Handle search form submission
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Immediately trigger search on form submit
    setCurrentOffset(0)
    setReviews([])
    setHasMore(true)
    fetchReviews(0, true, searchTerm)
  }

  // Render stars based on the rating
  // Uses a simple star rating system with 5 stars
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < Math.floor(rating)
            ? "text-yellow-400 fill-current"
            : i < rating
              ? "text-yellow-400 fill-current opacity-50"
              : "text-gray-600"
        }`}
      />
    ))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">Game Reviews</h1>
          <p className="text-gray-300">Professional reviews from GameSpot - trusted gaming journalism since 1996</p>
        </div>

        {/* Filters */}
        <div className="bg-slate-800/50 rounded-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <form onSubmit={handleSearchSubmit}>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search GameSpot reviews... "
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
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
                  Searching GameSpot in {Math.ceil((1500 - (Date.now() % 1500)) / 1000)} seconds...
                </p>
              )}
            </div>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full md:w-48 bg-slate-700 border-slate-600 text-white">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent className="bg-slate-700 border-slate-600">
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="rating">Highest Rated</SelectItem>
                <SelectItem value="popular">Most Popular</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
            <span className="ml-2 text-white">
              {debouncedSearchTerm
                ? `Searching GameSpot for "${debouncedSearchTerm}"...`
                : "Loading reviews from GameSpot..."}
            </span>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-12">
            <div className="flex justify-center mb-4">
              <AlertCircle className="h-16 w-16 text-red-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-4">Unable to Load Reviews</h2>
            <p className="text-red-400 text-lg mb-6 max-w-2xl mx-auto">{error}</p>
            <div className="bg-red-600/20 border border-red-600/30 rounded-lg p-4 mb-6 max-w-2xl mx-auto">
              <p className="text-red-200 text-sm">
                We're having trouble connecting to the GameSpot API. This could be due to:
              </p>
              <ul className="text-red-200 text-sm mt-2 list-disc list-inside">
                <li>API rate limiting or temporary unavailability</li>
                <li>Network connectivity issues</li>
                <li>API key configuration problems</li>
              </ul>
            </div>
            <Button
              onClick={() => fetchReviews(0, true, debouncedSearchTerm)}
              className="bg-purple-600 hover:bg-purple-700"
            >
              Try Again
            </Button>
          </div>
        )}

        {/* Results Count */}
        {!loading && !error && reviews.length > 0 && (
          <div className="mb-6">
            <p className="text-gray-300">
              Showing {filteredReviews.length} of {totalReviews} reviews from GameSpot
              {debouncedSearchTerm && <span className="text-purple-400"> for "{debouncedSearchTerm}"</span>}
              {currentOffset > 0 && <span className="text-gray-400"> (Loaded {reviews.length} so far)</span>}
            </p>
          </div>
        )}

        {/* Reviews Grid */}
        {!loading && !error && reviews.length > 0 && (
          <div className="space-y-6">
            {filteredReviews.map((review: any) => (
              <Card
                key={review.id}
                className="bg-slate-800/50 border-slate-700 hover:bg-slate-800/70 transition-colors"
              >
                <div className="md:flex">
                  <div className="md:w-1/4 p-4">
                    <Image
                      src={review.gameImage || "/placeholder.svg"}
                      alt={review.gameTitle}
                      width={300}
                      height={200}
                      className="w-full h-48 md:h-full object-cover rounded-lg"
                    />
                  </div>
                  <div className="md:w-3/4 p-6">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-4">
                      <div>
                        <h2 className="text-2xl font-bold text-white mb-2">{review.reviewTitle}</h2>
                        <div className="flex items-center space-x-4 mb-3">
                          <div className="flex items-center space-x-1">
                            {renderStars(review.rating)}
                            <span className="text-white ml-2 font-semibold">{review.rating}/5</span>
                            {review.originalScore && (
                              <span className="text-gray-400 text-sm ml-2">(GameSpot: {review.originalScore}/10)</span>
                            )}
                          </div>
                          <Badge className="bg-purple-600">{review.genre}</Badge>
                        </div>
                      </div>
                    </div>

                    <p className="text-gray-300 mb-4 line-clamp-3">{review.excerpt}</p>

                    <div className="bg-slate-700/50 rounded-lg p-3 mb-4">
                      <h4 className="text-purple-400 font-semibold mb-1">Review Summary</h4>
                      <p className="text-gray-300 text-sm italic">"{review.verdict}"</p>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 text-sm text-gray-400">
                        <div className="flex items-center">
                          <User className="h-4 w-4 mr-1" />
                          {review.author}
                        </div>
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          {new Date(review.publishDate).toLocaleDateString()}
                        </div>
                        <Badge variant="outline" className="border-red-400 text-red-400">
                          GameSpot
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-4">
                      
                        <div className="flex gap-2">
                          <ReviewFavoriteButton
                            review={review}
                            variant="ghost"
                            size="sm"
                            className="text-gray-400 hover:text-red-400"
                          />
                          <Link
                            href={`/reviews/${review.id}`}
                            className="relative inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white transition-all duration-300 rounded-lg bg-slate-800/50 border-2 border-transparent bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-border hover:scale-105 hover:shadow-lg hover:shadow-purple-500/25"
                          >
                            <div className="absolute inset-0 rounded-lg bg-slate-800 m-[2px]"></div>
                            <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-purple-600/20 to-pink-600/20 opacity-0 hover:opacity-100 transition-opacity duration-300 m-[2px]"></div>
                            <span className="relative z-10 hover:text-purple-200 transition-colors duration-300">
                              Read More
                            </span>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Load More Button */}
        {!loading && !error && reviews.length > 0 && hasMore && (
          <div className="text-center mt-8">
            <Button
              onClick={handleLoadMore}
              disabled={loadingMore}
              className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50"
            >
              {loadingMore ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Loading More Reviews...
                </>
              ) : (
                `Load More Reviews (${totalReviews - reviews.length} remaining)`
              )}
            </Button>
          </div>
        )}

        {/* End of Results */}
        {!loading && !error && reviews.length > 0 && !hasMore && (
          <div className="text-center mt-8">
            <p className="text-gray-400">You've reached the end of available reviews!</p>
            <Button
              onClick={() => {
                setSearchTerm("")
                setSortBy("newest")
              }}
              variant="outline"
              className="mt-4 border-purple-400 text-purple-400 hover:bg-purple-400 hover:text-white"
            >
              Clear All Filters
            </Button>
          </div>
        )}

        {!loading && !error && reviews.length > 0 && filteredReviews.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">No reviews found matching your criteria.</p>
            <Button
              onClick={() => {
                setSortBy("newest")
              }}
              className="mt-4 bg-purple-600 hover:bg-purple-700"
            >
              Clear Filters
            </Button>
          </div>
        )}

        {!loading && !error && reviews.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">
              {debouncedSearchTerm
                ? `No reviews found for "${debouncedSearchTerm}"`
                : "No reviews available at the moment."}
            </p>
            <Button
              onClick={() => {
                setSearchTerm("")
                fetchReviews(0, true, "")
              }}
              className="mt-4 bg-purple-600 hover:bg-purple-700"
            >
              {debouncedSearchTerm ? "Clear Search" : "Refresh"}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
