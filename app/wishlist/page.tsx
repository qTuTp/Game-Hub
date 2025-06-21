"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Heart,
  Star,
  Trash2,
  Filter,
  SortAsc,
  Loader2,
  Calendar,
  Clock,
  User,
  ExternalLink,
  Percent,
  Store,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useWishlist } from "@/contexts/wishlist-context"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"

export default function WishlistPage() {
  // Get current user info from auth context
  const { user } = useAuth()
  // Destructure all wishlist-related state and methods
  const {
    wishlist,
    favoriteNews,
    favoriteDeals,
    favoriteReviews,
    removeFromWishlist,
    removeFromFavoriteNews,
    removeFromFavoriteDeals,
    removeFromFavoriteReviews,
    clearWishlist,
    clearFavoriteNews,
    clearFavoriteDeals,
    clearFavoriteReviews,
    isLoading,
  } = useWishlist()
  // State to manage sorting and filtering
  const [sortBy, setSortBy] = useState("dateAdded")
  const [filterBy, setFilterBy] = useState("all")
  const [isClearing, setIsClearing] = useState(false)
  // Toast utility for showing user messages
  const { toast } = useToast()

  // Show sign-in prompt if user is not authenticated
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <Heart className="h-16 w-16 text-gray-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Sign in to view your favourites</h2>
            <p className="text-gray-400 mb-6">
              Create an account or sign in to save games, news, deals, and reviews to your favourites
            </p>
            <div className="flex gap-4 justify-center">
              <Button asChild className="bg-purple-600 hover:bg-purple-700">
                <Link href="/login">Sign In</Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="border-purple-400 text-purple-400 hover:bg-purple-400 hover:text-white"
              >
                <Link href="/signup">Sign Up</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Extract unique category/platforms/genre for filter dropdowns
  const genres = Array.from(new Set(wishlist.map((game) => game.genre))).sort()
  const newsCategories = Array.from(new Set(favoriteNews.map((article) => article.category))).sort()
  const dealPlatforms = Array.from(new Set(favoriteDeals.map((deal) => deal.platform))).sort()
  const reviewGenres = Array.from(new Set(favoriteReviews.map((review) => review.genre))).sort()

  // Filter and sort games in wishlist
  const filteredAndSortedWishlist = wishlist
    .filter((game) => {
      if (filterBy === "all") return true
      return game.genre.toLowerCase() === filterBy.toLowerCase()
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "title":
          return a.title.localeCompare(b.title)
        case "rating":
          return b.rating - a.rating
        case "price":
          const priceA = Number.parseFloat(a.price.replace("$", "")) || 0
          const priceB = Number.parseFloat(b.price.replace("$", "")) || 0
          return priceA - priceB
        case "releaseDate":
          return new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime()
        default:
          return 0 // Keep original order for dateAdded
      }
    })

  // Filter and sort favorite news
  const filteredAndSortedNews = favoriteNews
    .filter((article) => {
      if (filterBy === "all") return true
      return article.category.toLowerCase() === filterBy.toLowerCase()
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "title":
          return a.title.localeCompare(b.title)
        case "author":
          return a.author.localeCompare(b.author)
        case "publishDate":
          return new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime()
        default:
          return 0 // Keep original order for dateAdded
      }
    })

  // Filter and sort favorite deals
  const filteredAndSortedDeals = favoriteDeals
    .filter((deal) => {
      if (filterBy === "all") return true
      return deal.platform.toLowerCase() === filterBy.toLowerCase()
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "title":
          return a.title.localeCompare(b.title)
        case "discount":
          return b.discount - a.discount
        case "price":
          return a.salePrice - b.salePrice
        case "endDate":
          return new Date(a.endDate).getTime() - new Date(b.endDate).getTime()
        default:
          return 0 // Keep original order for dateAdded
      }
    })

  // Filter and sort favorite reviews
  const filteredAndSortedReviews = favoriteReviews
    .filter((review) => {
      if (filterBy === "all") return true
      return review.genre.toLowerCase() === filterBy.toLowerCase()
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "title":
          return a.reviewTitle.localeCompare(b.reviewTitle)
        case "rating":
          return b.rating - a.rating
        case "author":
          return a.author.localeCompare(b.author)
        case "publishDate":
          return new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime()
        default:
          return 0 // Keep original order for dateAdded
      }
    })

  // The function is used to remove an individual game from the user's wishlist
  const handleRemoveFromWishlist = async (gameId: string) => {
    try {
      await removeFromWishlist(gameId)
      toast({
        title: "Game removed",
        description: "Game has been removed from your favourites",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove game from favourites",
        variant: "destructive",
      })
    }
  }

  // The function is used to remove an individual article from the user's favorite news
  const handleRemoveFromFavoriteNews = async (articleId: string) => {
    try {
      await removeFromFavoriteNews(articleId)
      toast({
        title: "Article removed",
        description: "Article has been removed from your favourites",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove article from favourites",
        variant: "destructive",
      })
    }
  }

  // The function is used to remove an individual deal from the user's favorite deals
  const handleRemoveFromFavoriteDeals = async (dealId: string) => {
    try {
      await removeFromFavoriteDeals(dealId)
      toast({
        title: "Deal removed",
        description: "Deal has been removed from your favourites",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove deal from favourites",
        variant: "destructive",
      })
    }
  }

  // The function is used to remove an individual review from the user's favorite reviews
  const handleRemoveFromFavoriteReviews = async (reviewId: string) => {
    try {
      await removeFromFavoriteReviews(reviewId)
      toast({
        title: "Review removed",
        description: "Review has been removed from your favourites",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove review from favourites",
        variant: "destructive",
      })
    }
  }

  // The function is used to clear all games from the user's wishlist
  const handleClearWishlist = async () => {
    if (wishlist.length === 0) return

    try {
      setIsClearing(true)
      await clearWishlist()
      toast({
        title: "Games cleared",
        description: `Removed ${wishlist.length} games from your favourites`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to clear game favourites",
        variant: "destructive",
      })
    } finally {
      setIsClearing(false)
    }
  }

  // The function is used to clear all favorite news articles
  const handleClearFavoriteNews = async () => {
    if (favoriteNews.length === 0) return

    try {
      setIsClearing(true)
      await clearFavoriteNews()
      toast({
        title: "News cleared",
        description: `Removed ${favoriteNews.length} articles from your favourites`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to clear news favourites",
        variant: "destructive",
      })
    } finally {
      setIsClearing(false)
    }
  }

  // The function is used to clear all favorite deals
  const handleClearFavoriteDeals = async () => {
    if (favoriteDeals.length === 0) return

    try {
      setIsClearing(true)
      await clearFavoriteDeals()
      toast({
        title: "Deals cleared",
        description: `Removed ${favoriteDeals.length} deals from your favourites`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to clear deal favourites",
        variant: "destructive",
      })
    } finally {
      setIsClearing(false)
    }
  }

  // The function is used to clear all favorite reviews
  const handleClearFavoriteReviews = async () => {
    if (favoriteReviews.length === 0) return

    try {
      setIsClearing(true)
      await clearFavoriteReviews()
      toast({
        title: "Reviews cleared",
        description: `Removed ${favoriteReviews.length} reviews from your favourites`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to clear review favourites",
        variant: "destructive",
      })
    } finally {
      setIsClearing(false)
    }
  }

  // The function returns the Tailwind background color class for a specific platform
  const getPlatformColor = (platform: string) => {
    switch (platform.toLowerCase()) {
      case "steam":
        return "bg-blue-600"
      case "epic games store":
        return "bg-gray-800"
      case "gog":
        return "bg-purple-600"
      case "origin":
        return "bg-orange-600"
      case "uplay":
        return "bg-blue-800"
      default:
        return "bg-gray-600"
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <Heart className="h-8 w-8 text-red-400 fill-current" />
            <h1 className="text-4xl font-bold text-white">My Favourites</h1>
          </div>
          <p className="text-gray-300">Keep track of your favourite games, news, and deals</p>
        </div>

        {/* Favourites Stats */}
        {(wishlist.length > 0 || favoriteNews.length > 0 || favoriteDeals.length > 0 || favoriteReviews.length > 0) && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Games</p>
                    <p className="text-2xl font-bold text-white">{wishlist.length}</p>
                  </div>
                  <Heart className="h-8 w-8 text-red-400" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">News</p>
                    <p className="text-2xl font-bold text-white">{favoriteNews.length}</p>
                  </div>
                  <Heart className="h-8 w-8 text-red-400" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Deals</p>
                    <p className="text-2xl font-bold text-white">{favoriteDeals.length}</p>
                  </div>
                  <Heart className="h-8 w-8 text-red-400" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Reviews</p>
                    <p className="text-2xl font-bold text-white">{favoriteReviews.length}</p>
                  </div>
                  <Heart className="h-8 w-8 text-red-400" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-12">
            <Loader2 className="h-16 w-16 text-purple-400 mx-auto mb-4 animate-spin" />
            <h2 className="text-2xl font-bold text-white mb-2">Loading your favourites...</h2>
          </div>
        )}

        {/* Tabs for Games, News, and Deals */}
        {!isLoading && (
          <Tabs defaultValue="games" className="w-full">
            <TabsList className="grid w-full grid-cols-4 bg-slate-800/50">
              <TabsTrigger value="games" className="data-[state=active]:bg-purple-600">
                Games ({wishlist.length})
              </TabsTrigger>
              <TabsTrigger value="news" className="data-[state=active]:bg-purple-600">
                News ({favoriteNews.length})
              </TabsTrigger>
              <TabsTrigger value="deals" className="data-[state=active]:bg-purple-600">
                Deals ({favoriteDeals.length})
              </TabsTrigger>
              <TabsTrigger value="reviews" className="data-[state=active]:bg-purple-600">
                Reviews ({favoriteReviews.length})
              </TabsTrigger>
            </TabsList>

            {/* Games Tab */}
            <TabsContent value="games" className="space-y-6">
              {/* Games Controls */}
              {wishlist.length > 0 && (
                <div className="bg-slate-800/50 rounded-lg p-6">
                  <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                    <div className="flex flex-col sm:flex-row gap-4">
                      <div className="flex items-center space-x-2">
                        <Filter className="h-4 w-4 text-gray-400" />
                        <Select value={filterBy} onValueChange={setFilterBy}>
                          <SelectTrigger className="w-48 bg-slate-700 border-slate-600 text-white">
                            <SelectValue placeholder="Filter by genre" />
                          </SelectTrigger>
                          <SelectContent className="bg-slate-700 border-slate-600">
                            <SelectItem value="all">All Genres</SelectItem>
                            {genres.map((genre) => (
                              <SelectItem key={genre} value={genre.toLowerCase()}>
                                {genre}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-center space-x-2">
                        <SortAsc className="h-4 w-4 text-gray-400" />
                        <Select value={sortBy} onValueChange={setSortBy}>
                          <SelectTrigger className="w-48 bg-slate-700 border-slate-600 text-white">
                            <SelectValue placeholder="Sort by" />
                          </SelectTrigger>
                          <SelectContent className="bg-slate-700 border-slate-600">
                            <SelectItem value="dateAdded">Date Added</SelectItem>
                            <SelectItem value="title">Title (A-Z)</SelectItem>
                            <SelectItem value="rating">Rating (High to Low)</SelectItem>
                            <SelectItem value="price">Price (Low to High)</SelectItem>
                            <SelectItem value="releaseDate">Release Date (Newest)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <Button
                      onClick={handleClearWishlist}
                      variant="destructive"
                      className="bg-red-600 hover:bg-red-700"
                      disabled={isClearing || wishlist.length === 0}
                    >
                      {isClearing ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Clearing...
                        </>
                      ) : (
                        <>
                          <Trash2 className="h-4 w-4 mr-2" />
                          Clear All Games
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}

              {/* Games Grid */}
              {filteredAndSortedWishlist.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredAndSortedWishlist.map((game) => (
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
                          <Button
                            onClick={() => handleRemoveFromWishlist(game.id)}
                            size="icon"
                            variant="destructive"
                            className="absolute bottom-2 right-2 h-8 w-8 bg-red-600/80 hover:bg-red-600"
                          >
                            <Heart className="h-4 w-4 fill-current" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="p-4">
                        <CardTitle className="text-white mb-2 line-clamp-1">{game.title}</CardTitle>
                        <CardDescription className="text-gray-400 mb-3">
                          {game.platform} • Released {new Date(game.releaseDate).toLocaleDateString()}
                        </CardDescription>

                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-2">
                            <span className="text-lg font-bold text-green-400">{game.price}</span>
                            {game.originalPrice && game.originalPrice !== game.price && (
                              <span className="text-sm text-gray-500 line-through">{game.originalPrice}</span>
                            )}
                          </div>
                          <div className="flex items-center">
                            <Star className="h-4 w-4 text-yellow-400 fill-current" />
                            <span className="text-white ml-1">{game.rating}</span>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button asChild className="flex-1 bg-purple-600 hover:bg-purple-700">
                            <Link href={`/games/${game.id}`}>View Details</Link>
                          </Button>
                          <Button
                            onClick={() => handleRemoveFromWishlist(game.id)}
                            variant="outline"
                            size="icon"
                            className="border-red-400 text-red-400 hover:bg-red-400 hover:text-white"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : wishlist.length > 0 ? (
                <div className="text-center py-12">
                  <Heart className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-white mb-2">No games match your filters</h2>
                  <p className="text-gray-400 mb-6">Try adjusting your filter or sort options</p>
                  <Button
                    onClick={() => {
                      setFilterBy("all")
                      setSortBy("dateAdded")
                    }}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    Clear Filters
                  </Button>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Heart className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-white mb-2">No favourite games yet</h2>
                  <p className="text-gray-400 mb-6">Start adding games you love to keep track of them</p>
                  <Button asChild className="bg-purple-600 hover:bg-purple-700">
                    <Link href="/games">Browse Games</Link>
                  </Button>
                </div>
              )}
            </TabsContent>

            {/* News Tab */}
            <TabsContent value="news" className="space-y-6">
              {/* News Controls */}
              {favoriteNews.length > 0 && (
                <div className="bg-slate-800/50 rounded-lg p-6">
                  <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                    <div className="flex flex-col sm:flex-row gap-4">
                      <div className="flex items-center space-x-2">
                        <Filter className="h-4 w-4 text-gray-400" />
                        <Select value={filterBy} onValueChange={setFilterBy}>
                          <SelectTrigger className="w-48 bg-slate-700 border-slate-600 text-white">
                            <SelectValue placeholder="Filter by category" />
                          </SelectTrigger>
                          <SelectContent className="bg-slate-700 border-slate-600">
                            <SelectItem value="all">All Categories</SelectItem>
                            {newsCategories.map((category) => (
                              <SelectItem key={category} value={category.toLowerCase()}>
                                {category}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-center space-x-2">
                        <SortAsc className="h-4 w-4 text-gray-400" />
                        <Select value={sortBy} onValueChange={setSortBy}>
                          <SelectTrigger className="w-48 bg-slate-700 border-slate-600 text-white">
                            <SelectValue placeholder="Sort by" />
                          </SelectTrigger>
                          <SelectContent className="bg-slate-700 border-slate-600">
                            <SelectItem value="dateAdded">Date Added</SelectItem>
                            <SelectItem value="title">Title (A-Z)</SelectItem>
                            <SelectItem value="author">Author (A-Z)</SelectItem>
                            <SelectItem value="publishDate">Publish Date (Newest)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <Button
                      onClick={handleClearFavoriteNews}
                      variant="destructive"
                      className="bg-red-600 hover:bg-red-700"
                      disabled={isClearing || favoriteNews.length === 0}
                    >
                      {isClearing ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Clearing...
                        </>
                      ) : (
                        <>
                          <Trash2 className="h-4 w-4 mr-2" />
                          Clear All News
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}

              {/* News Grid */}
              {filteredAndSortedNews.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredAndSortedNews.map((article) => (
                    <Card
                      key={article.id}
                      className="bg-slate-800/50 border-slate-700 hover:bg-slate-800/70 transition-all duration-300 hover:scale-105"
                    >
                      <CardHeader>
                        <div className="flex items-start justify-between mb-2">
                          <Badge className="bg-purple-600">{article.category}</Badge>
                          <Button
                            onClick={() => handleRemoveFromFavoriteNews(article.id)}
                            size="icon"
                            variant="destructive"
                            className="h-8 w-8 bg-red-600/80 hover:bg-red-600"
                          >
                            <Heart className="h-4 w-4 fill-current" />
                          </Button>
                        </div>
                        <CardTitle className="text-white line-clamp-2 hover:text-purple-300 transition-colors">
                          <Link href={`/news/${article.id}`}>{article.title}</Link>
                        </CardTitle>
                        <CardDescription className="text-gray-400 line-clamp-3">{article.excerpt}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between text-sm text-gray-400 mb-4">
                          <div className="flex items-center">
                            <User className="h-4 w-4 mr-1" />
                            {article.author}
                          </div>
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-1" />
                            {article.readTime}
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-sm text-gray-400 mb-4">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            {new Date(article.publishDate).toLocaleDateString()}
                          </div>
                          {article.feedname && <div className="text-xs text-gray-500">{article.feedname}</div>}
                        </div>

                        {/* Tags */}
                        {article.tags && article.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-4">
                            {article.tags.slice(0, 3).map((tag) => (
                              <Badge key={tag} variant="secondary" className="text-xs bg-slate-700 text-gray-300">
                                {tag}
                              </Badge>
                            ))}
                            {article.tags.length > 3 && (
                              <Badge variant="secondary" className="text-xs bg-slate-700 text-gray-300">
                                +{article.tags.length - 3}
                              </Badge>
                            )}
                          </div>
                        )}

                        <div className="flex gap-2">
                          <Button asChild className="flex-1 bg-purple-600 hover:bg-purple-700">
                            <Link href={`/news/${article.id}`}>Read More</Link>
                          </Button>
                          {article.url && (
                            <Button
                              asChild
                              variant="outline"
                              size="icon"
                              className="border-purple-400 text-purple-400 hover:bg-purple-400 hover:text-white"
                            >
                              <a href={article.url} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="h-4 w-4" />
                              </a>
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : favoriteNews.length > 0 ? (
                <div className="text-center py-12">
                  <Heart className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-white mb-2">No news match your filters</h2>
                  <p className="text-gray-400 mb-6">Try adjusting your filter or sort options</p>
                  <Button
                    onClick={() => {
                      setFilterBy("all")
                      setSortBy("dateAdded")
                    }}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    Clear Filters
                  </Button>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Heart className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-white mb-2">No favourite news yet</h2>
                  <p className="text-gray-400 mb-6">Start adding news articles you find interesting</p>
                  <Button asChild className="bg-purple-600 hover:bg-purple-700">
                    <Link href="/news">Browse News</Link>
                  </Button>
                </div>
              )}
            </TabsContent>

            {/* Deals Tab */}
            <TabsContent value="deals" className="space-y-6">
              {/* Deals Controls */}
              {favoriteDeals.length > 0 && (
                <div className="bg-slate-800/50 rounded-lg p-6">
                  <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                    <div className="flex flex-col sm:flex-row gap-4">
                      <div className="flex items-center space-x-2">
                        <Filter className="h-4 w-4 text-gray-400" />
                        <Select value={filterBy} onValueChange={setFilterBy}>
                          <SelectTrigger className="w-48 bg-slate-700 border-slate-600 text-white">
                            <SelectValue placeholder="Filter by platform" />
                          </SelectTrigger>
                          <SelectContent className="bg-slate-700 border-slate-600">
                            <SelectItem value="all">All Platforms</SelectItem>
                            {dealPlatforms.map((platform) => (
                              <SelectItem key={platform} value={platform.toLowerCase()}>
                                {platform}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-center space-x-2">
                        <SortAsc className="h-4 w-4 text-gray-400" />
                        <Select value={sortBy} onValueChange={setSortBy}>
                          <SelectTrigger className="w-48 bg-slate-700 border-slate-600 text-white">
                            <SelectValue placeholder="Sort by" />
                          </SelectTrigger>
                          <SelectContent className="bg-slate-700 border-slate-600">
                            <SelectItem value="dateAdded">Date Added</SelectItem>
                            <SelectItem value="title">Title (A-Z)</SelectItem>
                            <SelectItem value="discount">Discount (High to Low)</SelectItem>
                            <SelectItem value="price">Price (Low to High)</SelectItem>
                            <SelectItem value="endDate">Ending Soon</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <Button
                      onClick={handleClearFavoriteDeals}
                      variant="destructive"
                      className="bg-red-600 hover:bg-red-700"
                      disabled={isClearing || favoriteDeals.length === 0}
                    >
                      {isClearing ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Clearing...
                        </>
                      ) : (
                        <>
                          <Trash2 className="h-4 w-4 mr-2" />
                          Clear All Deals
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}

              {/* Deals Grid */}
              {filteredAndSortedDeals.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredAndSortedDeals.map((deal) => (
                    <Card
                      key={deal.id}
                      className="bg-slate-800/50 border-slate-700 hover:bg-slate-800/70 transition-all duration-300 hover:scale-105"
                    >
                      <CardHeader className="p-0">
                        <div className="relative">
                          <Image
                            src={deal.image || "/placeholder.svg"}
                            alt={deal.title}
                            width={400}
                            height={300}
                            className="w-full h-48 object-cover rounded-t-lg"
                          />
                          <Badge className={`absolute top-2 left-2 ${getPlatformColor(deal.platform)}`}>
                            {deal.platform}
                          </Badge>
                          <Badge className="absolute top-2 right-2 bg-red-600">-{deal.discount}%</Badge>
                          {deal.totalDeals > 1 && (
                            <Badge className="absolute bottom-2 right-2 bg-green-600">
                              <Store className="h-3 w-3 mr-1" />
                              {deal.totalDeals} stores
                            </Badge>
                          )}
                          <Button
                            onClick={() => handleRemoveFromFavoriteDeals(deal.id)}
                            size="icon"
                            variant="destructive"
                            className="absolute bottom-2 left-2 h-8 w-8 bg-red-600/80 hover:bg-red-600"
                          >
                            <Heart className="h-4 w-4 fill-current" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="p-4">
                        <CardTitle className="text-white mb-2 line-clamp-1">{deal.title}</CardTitle>
                        <CardDescription className="text-gray-400 mb-3">
                          {deal.genre} • Ends {new Date(deal.endDate).toLocaleDateString()}
                        </CardDescription>

                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-2">
                            <span className="text-lg font-bold text-green-400">${deal.salePrice.toFixed(2)}</span>
                            <span className="text-sm text-gray-500 line-through">${deal.originalPrice.toFixed(2)}</span>
                          </div>
                          <div className="flex items-center">
                            <Star className="h-4 w-4 text-yellow-400 fill-current" />
                            <span className="text-white ml-1">{deal.rating.toFixed(1)}</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center text-sm text-gray-400">
                            <Percent className="h-4 w-4 mr-1 text-red-400" />
                            Save ${(deal.originalPrice - deal.salePrice).toFixed(2)}
                          </div>
                          <div className="text-sm text-gray-400">
                            {Math.ceil(
                              (new Date(deal.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24),
                            )}
                            d left
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button asChild className="flex-1 bg-purple-600 hover:bg-purple-700">
                            <a href={deal.storeUrl} target="_blank" rel="noopener noreferrer">
                              Get Deal
                            </a>
                          </Button>
                          <Button
                            onClick={() => handleRemoveFromFavoriteDeals(deal.id)}
                            variant="outline"
                            size="icon"
                            className="border-red-400 text-red-400 hover:bg-red-400 hover:text-white"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : favoriteDeals.length > 0 ? (
                <div className="text-center py-12">
                  <Heart className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-white mb-2">No deals match your filters</h2>
                  <p className="text-gray-400 mb-6">Try adjusting your filter or sort options</p>
                  <Button
                    onClick={() => {
                      setFilterBy("all")
                      setSortBy("dateAdded")
                    }}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    Clear Filters
                  </Button>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Heart className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-white mb-2">No favourite deals yet</h2>
                  <p className="text-gray-400 mb-6">Start adding deals you find interesting</p>
                  <Button asChild className="bg-purple-600 hover:bg-purple-700">
                    <Link href="/deals">Browse Deals</Link>
                  </Button>
                </div>
              )}
            </TabsContent>

            {/* Reviews Tab */}
            <TabsContent value="reviews" className="space-y-6">
              {/* Reviews Controls */}
              {favoriteReviews.length > 0 && (
                <div className="bg-slate-800/50 rounded-lg p-6">
                  <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                    <div className="flex flex-col sm:flex-row gap-4">
                      <div className="flex items-center space-x-2">
                        <Filter className="h-4 w-4 text-gray-400" />
                        <Select value={filterBy} onValueChange={setFilterBy}>
                          <SelectTrigger className="w-48 bg-slate-700 border-slate-600 text-white">
                            <SelectValue placeholder="Filter by genre" />
                          </SelectTrigger>
                          <SelectContent className="bg-slate-700 border-slate-600">
                            <SelectItem value="all">All Genres</SelectItem>
                            {reviewGenres.map((genre) => (
                              <SelectItem key={genre} value={genre.toLowerCase()}>
                                {genre}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-center space-x-2">
                        <SortAsc className="h-4 w-4 text-gray-400" />
                        <Select value={sortBy} onValueChange={setSortBy}>
                          <SelectTrigger className="w-48 bg-slate-700 border-slate-600 text-white">
                            <SelectValue placeholder="Sort by" />
                          </SelectTrigger>
                          <SelectContent className="bg-slate-700 border-slate-600">
                            <SelectItem value="dateAdded">Date Added</SelectItem>
                            <SelectItem value="title">Title (A-Z)</SelectItem>
                            <SelectItem value="rating">Rating (High to Low)</SelectItem>
                            <SelectItem value="author">Author (A-Z)</SelectItem>
                            <SelectItem value="publishDate">Publish Date (Newest)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <Button
                      onClick={handleClearFavoriteReviews}
                      variant="destructive"
                      className="bg-red-600 hover:bg-red-700"
                      disabled={isClearing || favoriteReviews.length === 0}
                    >
                      {isClearing ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Clearing...
                        </>
                      ) : (
                        <>
                          <Trash2 className="h-4 w-4 mr-2" />
                          Clear All Reviews
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}

              {/* Reviews Grid */}
              {filteredAndSortedReviews.length > 0 ? (
                <div className="space-y-6">
                  {filteredAndSortedReviews.map((review) => (
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
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                              <h2 className="text-2xl font-bold text-white mb-2">{review.reviewTitle}</h2>
                              <div className="flex items-center space-x-4 mb-3">
                                <div className="flex items-center space-x-1">
                                  {Array.from({ length: 5 }, (_, i) => (
                                    <Star
                                      key={i}
                                      className={`h-4 w-4 ${
                                        i < Math.floor(review.rating)
                                          ? "text-yellow-400 fill-current"
                                          : i < review.rating
                                            ? "text-yellow-400 fill-current opacity-50"
                                            : "text-gray-600"
                                      }`}
                                    />
                                  ))}
                                  <span className="text-white ml-2 font-semibold">{review.rating}/5</span>
                                  {review.originalScore && (
                                    <span className="text-gray-400 text-sm ml-2">
                                      (GameSpot: {review.originalScore}/10)
                                    </span>
                                  )}
                                </div>
                                <Badge className="bg-purple-600">{review.genre}</Badge>
                              </div>
                            </div>
                            <Button
                              onClick={() => handleRemoveFromFavoriteReviews(review.id)}
                              size="icon"
                              variant="destructive"
                              className="h-8 w-8 bg-red-600/80 hover:bg-red-600"
                            >
                              <Heart className="h-4 w-4 fill-current" />
                            </Button>
                          </div>

                          <p className="text-gray-300 mb-4 line-clamp-3">{review.excerpt}</p>

                          {review.verdict && (
                            <div className="bg-slate-700/50 rounded-lg p-3 mb-4">
                              <h4 className="text-purple-400 font-semibold mb-1">Review Summary</h4>
                              <p className="text-gray-300 text-sm italic">"{review.verdict}"</p>
                            </div>
                          )}

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
                              <div className="flex items-center space-x-2">
                                <Button variant="ghost" size="sm" className="text-green-400 hover:text-green-300">
                                  <ThumbsUp className="h-4 w-4 mr-1" />
                                  {review.likes}
                                </Button>
                                <Button variant="ghost" size="sm" className="text-red-400 hover:text-red-300">
                                  <ThumbsDown className="h-4 w-4 mr-1" />
                                  {review.dislikes}
                                </Button>
                              </div>
                              <div className="flex gap-2">
                                <Button asChild className="bg-purple-600 hover:bg-purple-700">
                                  <Link href={`/reviews/${review.id}`}>Read More</Link>
                                </Button>
                                {review.sourceUrl && (
                                  <Button
                                    asChild
                                    variant="outline"
                                    size="icon"
                                    className="border-purple-400 text-purple-400 hover:bg-purple-400 hover:text-white"
                                  >
                                    <a href={review.sourceUrl} target="_blank" rel="noopener noreferrer">
                                      <ExternalLink className="h-4 w-4" />
                                    </a>
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : favoriteReviews.length > 0 ? (
                <div className="text-center py-12">
                  <Heart className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-white mb-2">No reviews match your filters</h2>
                  <p className="text-gray-400 mb-6">Try adjusting your filter or sort options</p>
                  <Button
                    onClick={() => {
                      setFilterBy("all")
                      setSortBy("dateAdded")
                    }}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    Clear Filters
                  </Button>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Heart className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-white mb-2">No favourite reviews yet</h2>
                  <p className="text-gray-400 mb-6">Start adding reviews you find interesting</p>
                  <Button asChild className="bg-purple-600 hover:bg-purple-700">
                    <Link href="/reviews">Browse Reviews</Link>
                  </Button>
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  )
}
