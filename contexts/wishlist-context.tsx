"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { useAuth } from "./auth-context"
import {
  getUserWishlist,
  addToWishlist as addToFirestoreWishlist,
  removeFromWishlist as removeFromFirestoreWishlist,
  clearUserWishlist as clearFirestoreWishlist,
  getUserFavoriteNews,
  addToFavoriteNews as addToFirestoreFavoriteNews,
  removeFromFavoriteNews as removeFromFirestoreFavoriteNews,
  clearUserFavoriteNews as clearFirestoreFavoriteNews,
  getUserFavoriteDeals,
  addToFavoriteDeals as addToFirestoreFavoriteDeals,
  removeFromFavoriteDeals as removeFromFirestoreFavoriteDeals,
  clearUserFavoriteDeals as clearFirestoreFavoriteDeals,
  getUserFavoriteReviews,
  addToFavoriteReviews as addToFirestoreFavoriteReviews,
  removeFromFavoriteReviews as removeFromFirestoreFavoriteReviews,
  clearUserFavoriteReviews as clearFirestoreFavoriteReviews,
  type WishlistGame,
  type FavoriteNewsArticle,
  type FavoriteDeal,
  type FavoriteReview,
} from "@/lib/firestore"

interface WishlistContextType {
  wishlist: WishlistGame[]
  favoriteNews: FavoriteNewsArticle[]
  favoriteDeals: FavoriteDeal[]
  favoriteReviews: FavoriteReview[]
  addToWishlist: (game: Omit<WishlistGame, "addedAt">) => Promise<void>
  removeFromWishlist: (gameId: string) => Promise<void>
  isInWishlist: (gameId: string) => boolean
  clearWishlist: () => Promise<void>
  addToFavoriteNews: (article: Omit<FavoriteNewsArticle, "addedAt">) => Promise<void>
  removeFromFavoriteNews: (articleId: string) => Promise<void>
  isInFavoriteNews: (articleId: string) => boolean
  clearFavoriteNews: () => Promise<void>
  addToFavoriteDeals: (deal: Omit<FavoriteDeal, "addedAt">) => Promise<void>
  removeFromFavoriteDeals: (dealId: string) => Promise<void>
  isInFavoriteDeals: (dealId: string) => boolean
  clearFavoriteDeals: () => Promise<void>
  addToFavoriteReviews: (review: Omit<FavoriteReview, "addedAt">) => Promise<void>
  removeFromFavoriteReviews: (reviewId: string) => Promise<void>
  isInFavoriteReviews: (reviewId: string) => boolean
  clearFavoriteReviews: () => Promise<void>
  isLoading: boolean
  refreshWishlist: () => Promise<void>
  refreshFavoriteNews: () => Promise<void>
  refreshFavoriteDeals: () => Promise<void>
  refreshFavoriteReviews: () => Promise<void>
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined)

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [wishlist, setWishlist] = useState<WishlistGame[]>([])
  const [favoriteNews, setFavoriteNews] = useState<FavoriteNewsArticle[]>([])
  const [favoriteDeals, setFavoriteDeals] = useState<FavoriteDeal[]>([])
  const [favoriteReviews, setFavoriteReviews] = useState<FavoriteReview[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const { firebaseUser } = useAuth()

  // Load all favorites when user changes
  useEffect(() => {
    if (firebaseUser) {
      loadWishlist()
      loadFavoriteNews()
      loadFavoriteDeals()
      loadFavoriteReviews()
    } else {
      setWishlist([])
      setFavoriteNews([])
      setFavoriteDeals([])
      setFavoriteReviews([])
    }
  }, [firebaseUser])

  const loadWishlist = async () => {
    if (!firebaseUser) return

    try {
      setIsLoading(true)
      const userWishlist = await getUserWishlist(firebaseUser.uid)
      setWishlist(userWishlist)
    } catch (error) {
      console.error("Failed to load wishlist:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadFavoriteNews = async () => {
    if (!firebaseUser) return

    try {
      const userFavoriteNews = await getUserFavoriteNews(firebaseUser.uid)
      setFavoriteNews(userFavoriteNews)
    } catch (error) {
      console.error("Failed to load favorite news:", error)
    }
  }

  const loadFavoriteDeals = async () => {
    if (!firebaseUser) return

    try {
      const userFavoriteDeals = await getUserFavoriteDeals(firebaseUser.uid)
      setFavoriteDeals(userFavoriteDeals)
    } catch (error) {
      console.error("Failed to load favorite deals:", error)
    }
  }

  const loadFavoriteReviews = async () => {
    if (!firebaseUser) return

    try {
      const userFavoriteReviews = await getUserFavoriteReviews(firebaseUser.uid)
      setFavoriteReviews(userFavoriteReviews)
    } catch (error) {
      console.error("Failed to load favorite reviews:", error)
    }
  }

  const addToWishlist = async (game: Omit<WishlistGame, "addedAt">) => {
    if (!firebaseUser) {
      throw new Error("Must be logged in to add to wishlist")
    }

    try {
      // Normalize the game ID to string for consistent comparison
      const normalizedGameId = String(game.id)

      // Check if already in wishlist using normalized ID
      if (isInWishlist(normalizedGameId)) {
        return
      }

      // Clean the game data before adding to Firestore
      const cleanedGame = {
        id: normalizedGameId, // Use normalized string ID
        title: game.title || "",
        image: game.image || "",
        price: game.price || "Free",
        originalPrice: game.originalPrice || undefined,
        discount: game.discount || undefined,
        rating: game.rating || 0,
        genre: game.genre || "",
        releaseDate: game.releaseDate || "",
        platform: game.platform || "",
      }

      // Add to Firestore
      await addToFirestoreWishlist(firebaseUser.uid, cleanedGame)

      // Update local state
      const gameWithTimestamp = {
        ...cleanedGame,
        addedAt: new Date(),
      }
      setWishlist((prev) => [gameWithTimestamp, ...prev])
    } catch (error) {
      console.error("Failed to add to wishlist:", error)
      throw error
    }
  }

  const removeFromWishlist = async (gameId: string) => {
    if (!firebaseUser) {
      throw new Error("Must be logged in to remove from wishlist")
    }

    try {
      // Normalize the game ID to string
      const normalizedGameId = String(gameId)

      // Remove from Firestore
      await removeFromFirestoreWishlist(firebaseUser.uid, normalizedGameId)

      // Update local state using normalized ID
      setWishlist((prev) => prev.filter((game) => String(game.id) !== normalizedGameId))
    } catch (error) {
      console.error("Failed to remove from wishlist:", error)
      throw error
    }
  }

  const clearWishlist = async () => {
    if (!firebaseUser) {
      throw new Error("Must be logged in to clear wishlist")
    }

    try {
      setIsLoading(true)

      // Clear from Firestore
      await clearFirestoreWishlist(firebaseUser.uid)

      // Clear local state
      setWishlist([])

      console.log("Wishlist cleared successfully")
    } catch (error) {
      console.error("Failed to clear wishlist:", error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const addToFavoriteNews = async (article: Omit<FavoriteNewsArticle, "addedAt">) => {
    if (!firebaseUser) {
      throw new Error("Must be logged in to add to favorite news")
    }

    try {
      // Normalize the article ID to string for consistent comparison
      const normalizedArticleId = String(article.id)

      // Check if already in favorite news using normalized ID
      if (isInFavoriteNews(normalizedArticleId)) {
        return
      }

      // Clean the article data before adding to Firestore
      const cleanedArticle = {
        id: normalizedArticleId,
        title: article.title || "",
        excerpt: article.excerpt || "",
        author: article.author || "",
        publishDate: article.publishDate || "",
        readTime: article.readTime || "",
        category: article.category || "",
        tags: article.tags || [],
        url: article.sourceUrl || undefined,
        feedname: article.feedname || undefined,
        feedlabel: article.feedlabel || undefined,
      }

      // Add to Firestore
      await addToFirestoreFavoriteNews(firebaseUser.uid, cleanedArticle)

      // Update local state
      const articleWithTimestamp = {
        ...cleanedArticle,
        addedAt: new Date(),
      }
      setFavoriteNews((prev) => [articleWithTimestamp, ...prev])
    } catch (error) {
      console.error("Failed to add to favorite news:", error)
      throw error
    }
  }

  const removeFromFavoriteNews = async (articleId: string) => {
    if (!firebaseUser) {
      throw new Error("Must be logged in to remove from favorite news")
    }

    try {
      // Normalize the article ID to string
      const normalizedArticleId = String(articleId)

      // Remove from Firestore
      await removeFromFirestoreFavoriteNews(firebaseUser.uid, normalizedArticleId)

      // Update local state using normalized ID
      setFavoriteNews((prev) => prev.filter((article) => String(article.id) !== normalizedArticleId))
    } catch (error) {
      console.error("Failed to remove from favorite news:", error)
      throw error
    }
  }

  const clearFavoriteNews = async () => {
    if (!firebaseUser) {
      throw new Error("Must be logged in to clear favorite news")
    }

    try {
      setIsLoading(true)

      // Clear from Firestore
      await clearFirestoreFavoriteNews(firebaseUser.uid)

      // Clear local state
      setFavoriteNews([])

      console.log("Favorite news cleared successfully")
    } catch (error) {
      console.error("Failed to clear favorite news:", error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const addToFavoriteDeals = async (deal: Omit<FavoriteDeal, "addedAt">) => {
    if (!firebaseUser) {
      throw new Error("Must be logged in to add to favorite deals")
    }

    try {
      // Normalize the deal ID to string for consistent comparison
      const normalizedDealId = String(deal.id)

      // Check if already in favorite deals using normalized ID
      if (isInFavoriteDeals(normalizedDealId)) {
        return
      }

      // Clean the deal data before adding to Firestore
      const cleanedDeal = {
        id: normalizedDealId,
        title: deal.title || "",
        originalPrice: deal.originalPrice || 0,
        salePrice: deal.salePrice || 0,
        discount: deal.discount || 0,
        platform: deal.platform || "",
        storeUrl: deal.storeUrl || "",
        image: deal.image || "",
        rating: deal.rating || 0,
        endDate: deal.endDate || "",
        genre: deal.genre || "",
        drm: deal.drm || "",
        totalDeals: deal.totalDeals || 1,
      }

      // Add to Firestore
      await addToFirestoreFavoriteDeals(firebaseUser.uid, cleanedDeal)

      // Update local state
      const dealWithTimestamp = {
        ...cleanedDeal,
        addedAt: new Date(),
      }
      setFavoriteDeals((prev) => [dealWithTimestamp, ...prev])
    } catch (error) {
      console.error("Failed to add to favorite deals:", error)
      throw error
    }
  }

  const removeFromFavoriteDeals = async (dealId: string) => {
    if (!firebaseUser) {
      throw new Error("Must be logged in to remove from favorite deals")
    }

    try {
      // Normalize the deal ID to string
      const normalizedDealId = String(dealId)

      // Remove from Firestore
      await removeFromFirestoreFavoriteDeals(firebaseUser.uid, normalizedDealId)

      // Update local state using normalized ID
      setFavoriteDeals((prev) => prev.filter((deal) => String(deal.id) !== normalizedDealId))
    } catch (error) {
      console.error("Failed to remove from favorite deals:", error)
      throw error
    }
  }

  const clearFavoriteDeals = async () => {
    if (!firebaseUser) {
      throw new Error("Must be logged in to clear favorite deals")
    }

    try {
      setIsLoading(true)

      // Clear from Firestore
      await clearFirestoreFavoriteDeals(firebaseUser.uid)

      // Clear local state
      setFavoriteDeals([])

      console.log("Favorite deals cleared successfully")
    } catch (error) {
      console.error("Failed to clear favorite deals:", error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const addToFavoriteReviews = async (review: Omit<FavoriteReview, "addedAt">) => {
    if (!firebaseUser) {
      throw new Error("Must be logged in to add to favorite reviews")
    }

    try {
      // Normalize the review ID to string for consistent comparison
      const normalizedReviewId = String(review.id)

      // Check if already in favorite reviews using normalized ID
      if (isInFavoriteReviews(normalizedReviewId)) {
        return
      }

      // Clean the review data before adding to Firestore
      const cleanedReview = {
        id: normalizedReviewId,
        reviewTitle: review.reviewTitle || "",
        gameTitle: review.gameTitle || "",
        gameImage: review.gameImage || "",
        author: review.author || "",
        rating: review.rating || 0,
        originalScore: review.originalScore || undefined,
        publishDate: review.publishDate || "",
        excerpt: review.excerpt || "",
        verdict: review.verdict || undefined,
        genre: review.genre || "",
        platform: review.platform || "",
        sourceUrl: review.sourceUrl || undefined,
        likes: review.likes || 0,
        dislikes: review.dislikes || 0,
      }

      // Add to Firestore
      await addToFirestoreFavoriteReviews(firebaseUser.uid, cleanedReview)

      // Update local state
      const reviewWithTimestamp = {
        ...cleanedReview,
        addedAt: new Date(),
      }
      setFavoriteReviews((prev) => [reviewWithTimestamp, ...prev])
    } catch (error) {
      console.error("Failed to add to favorite reviews:", error)
      throw error
    }
  }

  const removeFromFavoriteReviews = async (reviewId: string) => {
    if (!firebaseUser) {
      throw new Error("Must be logged in to remove from favorite reviews")
    }

    try {
      // Normalize the review ID to string
      const normalizedReviewId = String(reviewId)

      // Remove from Firestore
      await removeFromFirestoreFavoriteReviews(firebaseUser.uid, normalizedReviewId)

      // Update local state using normalized ID
      setFavoriteReviews((prev) => prev.filter((review) => String(review.id) !== normalizedReviewId))
    } catch (error) {
      console.error("Failed to remove from favorite reviews:", error)
      throw error
    }
  }

  const clearFavoriteReviews = async () => {
    if (!firebaseUser) {
      throw new Error("Must be logged in to clear favorite reviews")
    }

    try {
      setIsLoading(true)

      // Clear from Firestore
      await clearFirestoreFavoriteReviews(firebaseUser.uid)

      // Clear local state
      setFavoriteReviews([])

      console.log("Favorite reviews cleared successfully")
    } catch (error) {
      console.error("Failed to clear favorite reviews:", error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const isInWishlist = (gameId: string) => {
    // Normalize both IDs to strings for comparison
    const normalizedGameId = String(gameId)
    return wishlist.some((game) => String(game.id) === normalizedGameId)
  }

  const isInFavoriteNews = (articleId: string) => {
    // Normalize both IDs to strings for comparison
    const normalizedArticleId = String(articleId)
    return favoriteNews.some((article) => String(article.id) === normalizedArticleId)
  }

  const isInFavoriteDeals = (dealId: string) => {
    // Normalize both IDs to strings for comparison
    const normalizedDealId = String(dealId)
    return favoriteDeals.some((deal) => String(deal.id) === normalizedDealId)
  }

  const isInFavoriteReviews = (reviewId: string) => {
    // Normalize both IDs to strings for comparison
    const normalizedReviewId = String(reviewId)
    return favoriteReviews.some((review) => String(review.id) === normalizedReviewId)
  }

  const refreshWishlist = async () => {
    await loadWishlist()
  }

  const refreshFavoriteNews = async () => {
    await loadFavoriteNews()
  }

  const refreshFavoriteDeals = async () => {
    await loadFavoriteDeals()
  }

  const refreshFavoriteReviews = async () => {
    await loadFavoriteReviews()
  }

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        favoriteNews,
        favoriteDeals,
        favoriteReviews,
        addToWishlist,
        removeFromWishlist,
        isInWishlist,
        clearWishlist,
        addToFavoriteNews,
        removeFromFavoriteNews,
        isInFavoriteNews,
        clearFavoriteNews,
        addToFavoriteDeals,
        removeFromFavoriteDeals,
        isInFavoriteDeals,
        clearFavoriteDeals,
        addToFavoriteReviews,
        removeFromFavoriteReviews,
        isInFavoriteReviews,
        clearFavoriteReviews,
        isLoading,
        refreshWishlist,
        refreshFavoriteNews,
        refreshFavoriteDeals,
        refreshFavoriteReviews,
      }}
    >
      {children}
    </WishlistContext.Provider>
  )
}

export function useWishlist() {
  const context = useContext(WishlistContext)
  if (context === undefined) {
    throw new Error("useWishlist must be used within a WishlistProvider")
  }
  return context
}
