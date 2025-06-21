import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  addDoc,
  serverTimestamp,
  writeBatch,
} from "firebase/firestore"
import { db } from "./firebase"

// User Profile Types
export interface UserProfile {
  uid: string
  name: string
  email: string
  createdAt: any
  updatedAt: any
  preferences?: {
    favoriteGenres?: string[]
    favoritePlatforms?: string[]
    notifications?: boolean
  }
}

// Wishlist Types
export interface WishlistGame {
  id: string
  title: string
  image: string
  price: string
  originalPrice?: string
  discount?: number
  rating: number
  genre: string
  releaseDate: string
  platform: string
  addedAt: any
}

// Favorite News Article Types
export interface FavoriteNewsArticle {
  id: string
  title: string
  excerpt: string
  author: string
  publishDate: string
  readTime: string
  category: string
  tags: string[]
  url?: string
  feedname?: string
  feedlabel?: string
  addedAt: any
}

// Favorite Deal Types
export interface FavoriteDeal {
  id: string
  title: string
  originalPrice: number
  salePrice: number
  discount: number
  platform: string
  storeUrl: string
  image: string
  rating: number
  endDate: string
  genre: string
  drm: string
  totalDeals: number
  addedAt: any
}

// Favorite Review Types
export interface FavoriteReview {
  id: string
  reviewTitle: string
  gameTitle: string
  gameImage: string
  author: string
  rating: number
  originalScore?: number
  publishDate: string
  excerpt: string
  verdict?: string
  genre: string
  platform: string
  sourceUrl?: string
  likes: number
  dislikes: number
  addedAt: any
}

// User Review Types
export interface UserReview {
  id?: string
  userId: string
  gameId: string
  gameTitle: string
  gameImage: string
  rating: number
  title: string
  content: string
  createdAt: any
  updatedAt: any
  likes: number
  dislikes: number
  helpful: string[] // Array of user IDs who found it helpful
}

// User Profile Functions
export const createUserProfile = async (uid: string, userData: Partial<UserProfile>) => {
  try {
    const userRef = doc(db, "users", uid)
    const profileData = {
      uid,
      ...userData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }
    await setDoc(userRef, profileData)
    return profileData
  } catch (error) {
    console.error("Error creating user profile:", error)
    throw error
  }
}

export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  try {
    const userRef = doc(db, "users", uid)
    const userSnap = await getDoc(userRef)

    if (userSnap.exists()) {
      return userSnap.data() as UserProfile
    }
    return null
  } catch (error) {
    console.error("Error getting user profile:", error)
    throw error
  }
}

export const updateUserProfile = async (uid: string, updates: Partial<UserProfile>) => {
  try {
    const userRef = doc(db, "users", uid)
    await updateDoc(userRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    })
  } catch (error) {
    console.error("Error updating user profile:", error)
    throw error
  }
}

// Wishlist Functions
export const getUserWishlist = async (uid: string): Promise<WishlistGame[]> => {
  try {
    const wishlistRef = collection(db, "users", uid, "wishlist")
    const q = query(wishlistRef, orderBy("addedAt", "desc"))
    const querySnapshot = await getDocs(q)

    return querySnapshot.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
    })) as WishlistGame[]
  } catch (error) {
    console.error("Error getting wishlist:", error)
    throw error
  }
}

export const addToWishlist = async (uid: string, game: Omit<WishlistGame, "addedAt">) => {
  try {
    const wishlistRef = collection(db, "users", uid, "wishlist")

    // Clean the game data to remove undefined values
    const cleanedGame = {
      id: game.id || "",
      title: game.title || "",
      image: game.image || "",
      price: game.price || "Free",
      originalPrice: game.originalPrice || null,
      discount: game.discount || null,
      rating: game.rating || 0,
      genre: game.genre || "",
      releaseDate: game.releaseDate || "",
      platform: game.platform || "",
      addedAt: serverTimestamp(),
    }

    await addDoc(wishlistRef, cleanedGame)
  } catch (error) {
    console.error("Error adding to wishlist:", error)
    throw error
  }
}

export const removeFromWishlist = async (uid: string, gameId: string) => {
  try {
    // Find the document with the matching game ID
    const wishlistRef = collection(db, "users", uid, "wishlist")
    const q = query(wishlistRef, where("id", "==", gameId))
    const querySnapshot = await getDocs(q)

    // Delete all matching documents (should be only one)
    const deletePromises = querySnapshot.docs.map((doc) => deleteDoc(doc.ref))
    await Promise.all(deletePromises)
  } catch (error) {
    console.error("Error removing from wishlist:", error)
    throw error
  }
}

export const clearUserWishlist = async (uid: string) => {
  try {
    const wishlistRef = collection(db, "users", uid, "wishlist")
    const querySnapshot = await getDocs(wishlistRef)

    // Use batch write for better performance when deleting multiple documents
    const batch = writeBatch(db)

    querySnapshot.docs.forEach((doc) => {
      batch.delete(doc.ref)
    })

    await batch.commit()
    console.log(`Cleared ${querySnapshot.docs.length} games from wishlist`)
  } catch (error) {
    console.error("Error clearing wishlist:", error)
    throw error
  }
}

export const isInWishlist = async (uid: string, gameId: string): Promise<boolean> => {
  try {
    const wishlistRef = collection(db, "users", uid, "wishlist")
    const q = query(wishlistRef, where("id", "==", gameId), limit(1))
    const querySnapshot = await getDocs(q)

    return !querySnapshot.empty
  } catch (error) {
    console.error("Error checking wishlist:", error)
    return false
  }
}

// Favorite News Functions
export const getUserFavoriteNews = async (uid: string): Promise<FavoriteNewsArticle[]> => {
  try {
    const favoriteNewsRef = collection(db, "users", uid, "favoriteNews")
    const q = query(favoriteNewsRef, orderBy("addedAt", "desc"))
    const querySnapshot = await getDocs(q)

    return querySnapshot.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
    })) as FavoriteNewsArticle[]
  } catch (error) {
    console.error("Error getting favorite news:", error)
    throw error
  }
}

export const addToFavoriteNews = async (uid: string, article: Omit<FavoriteNewsArticle, "addedAt">) => {
  try {
    const favoriteNewsRef = collection(db, "users", uid, "favoriteNews")

    // Clean the article data to remove undefined values
    const cleanedArticle = {
      id: article.id || "",
      title: article.title || "",
      excerpt: article.excerpt || "",
      author: article.author || "",
      publishDate: article.publishDate || "",
      readTime: article.readTime || "",
      category: article.category || "",
      tags: article.tags || [],
      url: article.url || null,
      feedname: article.feedname || null,
      feedlabel: article.feedlabel || null,
      addedAt: serverTimestamp(),
    }

    await addDoc(favoriteNewsRef, cleanedArticle)
  } catch (error) {
    console.error("Error adding to favorite news:", error)
    throw error
  }
}

export const removeFromFavoriteNews = async (uid: string, articleId: string) => {
  try {
    // Find the document with the matching article ID
    const favoriteNewsRef = collection(db, "users", uid, "favoriteNews")
    const q = query(favoriteNewsRef, where("id", "==", articleId))
    const querySnapshot = await getDocs(q)

    // Delete all matching documents (should be only one)
    const deletePromises = querySnapshot.docs.map((doc) => deleteDoc(doc.ref))
    await Promise.all(deletePromises)
  } catch (error) {
    console.error("Error removing from favorite news:", error)
    throw error
  }
}

export const clearUserFavoriteNews = async (uid: string) => {
  try {
    const favoriteNewsRef = collection(db, "users", uid, "favoriteNews")
    const querySnapshot = await getDocs(favoriteNewsRef)

    // Use batch write for better performance when deleting multiple documents
    const batch = writeBatch(db)

    querySnapshot.docs.forEach((doc) => {
      batch.delete(doc.ref)
    })

    await batch.commit()
    console.log(`Cleared ${querySnapshot.docs.length} news articles from favorites`)
  } catch (error) {
    console.error("Error clearing favorite news:", error)
    throw error
  }
}

export const isInFavoriteNews = async (uid: string, articleId: string): Promise<boolean> => {
  try {
    const favoriteNewsRef = collection(db, "users", uid, "favoriteNews")
    const q = query(favoriteNewsRef, where("id", "==", articleId), limit(1))
    const querySnapshot = await getDocs(q)

    return !querySnapshot.empty
  } catch (error) {
    console.error("Error checking favorite news:", error)
    return false
  }
}

// Favorite Deals Functions
export const getUserFavoriteDeals = async (uid: string): Promise<FavoriteDeal[]> => {
  try {
    const favoriteDealsRef = collection(db, "users", uid, "favoriteDeals")
    const q = query(favoriteDealsRef, orderBy("addedAt", "desc"))
    const querySnapshot = await getDocs(q)

    return querySnapshot.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
    })) as FavoriteDeal[]
  } catch (error) {
    console.error("Error getting favorite deals:", error)
    throw error
  }
}

export const addToFavoriteDeals = async (uid: string, deal: Omit<FavoriteDeal, "addedAt">) => {
  try {
    const favoriteDealsRef = collection(db, "users", uid, "favoriteDeals")

    // Clean the deal data to remove undefined values
    const cleanedDeal = {
      id: deal.id || "",
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
      addedAt: serverTimestamp(),
    }

    await addDoc(favoriteDealsRef, cleanedDeal)
  } catch (error) {
    console.error("Error adding to favorite deals:", error)
    throw error
  }
}

export const removeFromFavoriteDeals = async (uid: string, dealId: string) => {
  try {
    // Find the document with the matching deal ID
    const favoriteDealsRef = collection(db, "users", uid, "favoriteDeals")
    const q = query(favoriteDealsRef, where("id", "==", dealId))
    const querySnapshot = await getDocs(q)

    // Delete all matching documents (should be only one)
    const deletePromises = querySnapshot.docs.map((doc) => deleteDoc(doc.ref))
    await Promise.all(deletePromises)
  } catch (error) {
    console.error("Error removing from favorite deals:", error)
    throw error
  }
}

export const clearUserFavoriteDeals = async (uid: string) => {
  try {
    const favoriteDealsRef = collection(db, "users", uid, "favoriteDeals")
    const querySnapshot = await getDocs(favoriteDealsRef)

    // Use batch write for better performance when deleting multiple documents
    const batch = writeBatch(db)

    querySnapshot.docs.forEach((doc) => {
      batch.delete(doc.ref)
    })

    await batch.commit()
    console.log(`Cleared ${querySnapshot.docs.length} deals from favorites`)
  } catch (error) {
    console.error("Error clearing favorite deals:", error)
    throw error
  }
}

export const isInFavoriteDeals = async (uid: string, dealId: string): Promise<boolean> => {
  try {
    const favoriteDealsRef = collection(db, "users", uid, "favoriteDeals")
    const q = query(favoriteDealsRef, where("id", "==", dealId), limit(1))
    const querySnapshot = await getDocs(q)

    return !querySnapshot.empty
  } catch (error) {
    console.error("Error checking favorite deals:", error)
    return false
  }
}

// Favorite Reviews Functions
export const getUserFavoriteReviews = async (uid: string): Promise<FavoriteReview[]> => {
  try {
    const favoriteReviewsRef = collection(db, "users", uid, "favoriteReviews")
    const q = query(favoriteReviewsRef, orderBy("addedAt", "desc"))
    const querySnapshot = await getDocs(q)

    return querySnapshot.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
    })) as FavoriteReview[]
  } catch (error) {
    console.error("Error getting favorite reviews:", error)
    throw error
  }
}

export const addToFavoriteReviews = async (uid: string, review: Omit<FavoriteReview, "addedAt">) => {
  try {
    const favoriteReviewsRef = collection(db, "users", uid, "favoriteReviews")

    // Clean the review data to remove undefined values
    const cleanedReview = {
      id: review.id || "",
      reviewTitle: review.reviewTitle || "",
      gameTitle: review.gameTitle || "",
      gameImage: review.gameImage || "",
      author: review.author || "",
      rating: review.rating || 0,
      originalScore: review.originalScore || null,
      publishDate: review.publishDate || "",
      excerpt: review.excerpt || "",
      verdict: review.verdict || null,
      genre: review.genre || "",
      platform: review.platform || "",
      sourceUrl: review.sourceUrl || null,
      likes: review.likes || 0,
      dislikes: review.dislikes || 0,
      addedAt: serverTimestamp(),
    }

    await addDoc(favoriteReviewsRef, cleanedReview)
  } catch (error) {
    console.error("Error adding to favorite reviews:", error)
    throw error
  }
}

export const removeFromFavoriteReviews = async (uid: string, reviewId: string) => {
  try {
    // Find the document with the matching review ID
    const favoriteReviewsRef = collection(db, "users", uid, "favoriteReviews")
    const q = query(favoriteReviewsRef, where("id", "==", reviewId))
    const querySnapshot = await getDocs(q)

    // Delete all matching documents (should be only one)
    const deletePromises = querySnapshot.docs.map((doc) => deleteDoc(doc.ref))
    await Promise.all(deletePromises)
  } catch (error) {
    console.error("Error removing from favorite reviews:", error)
    throw error
  }
}

export const clearUserFavoriteReviews = async (uid: string) => {
  try {
    const favoriteReviewsRef = collection(db, "users", uid, "favoriteReviews")
    const querySnapshot = await getDocs(favoriteReviewsRef)

    // Use batch write for better performance when deleting multiple documents
    const batch = writeBatch(db)

    querySnapshot.docs.forEach((doc) => {
      batch.delete(doc.ref)
    })

    await batch.commit()
    console.log(`Cleared ${querySnapshot.docs.length} reviews from favorites`)
  } catch (error) {
    console.error("Error clearing favorite reviews:", error)
    throw error
  }
}

export const isInFavoriteReviews = async (uid: string, reviewId: string): Promise<boolean> => {
  try {
    const favoriteReviewsRef = collection(db, "users", uid, "favoriteReviews")
    const q = query(favoriteReviewsRef, where("id", "==", reviewId), limit(1))
    const querySnapshot = await getDocs(q)

    return !querySnapshot.empty
  } catch (error) {
    console.error("Error checking favorite reviews:", error)
    return false
  }
}

// User Reviews Functions
export const createUserReview = async (
  review: Omit<UserReview, "id" | "createdAt" | "updatedAt" | "likes" | "dislikes" | "helpful">,
) => {
  try {
    const reviewsRef = collection(db, "userReviews")
    const reviewData = {
      ...review,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      likes: 0,
      dislikes: 0,
      helpful: [],
    }
    const docRef = await addDoc(reviewsRef, reviewData)
    return docRef.id
  } catch (error) {
    console.error("Error creating review:", error)
    throw error
  }
}

export const getUserReviews = async (uid: string): Promise<UserReview[]> => {
  try {
    const reviewsRef = collection(db, "userReviews")
    const q = query(reviewsRef, where("userId", "==", uid), orderBy("createdAt", "desc"))
    const querySnapshot = await getDocs(q)

    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as UserReview[]
  } catch (error) {
    console.error("Error getting user reviews:", error)
    throw error
  }
}

export const getGameReviews = async (gameId: string): Promise<UserReview[]> => {
  try {
    const reviewsRef = collection(db, "userReviews")
    const q = query(reviewsRef, where("gameId", "==", gameId), orderBy("createdAt", "desc"))
    const querySnapshot = await getDocs(q)

    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as UserReview[]
  } catch (error) {
    console.error("Error getting game reviews:", error)
    throw error
  }
}

export const updateUserReview = async (reviewId: string, updates: Partial<UserReview>) => {
  try {
    const reviewRef = doc(db, "userReviews", reviewId)
    await updateDoc(reviewRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    })
  } catch (error) {
    console.error("Error updating review:", error)
    throw error
  }
}

export const deleteUserReview = async (reviewId: string) => {
  try {
    const reviewRef = doc(db, "userReviews", reviewId)
    await deleteDoc(reviewRef)
  } catch (error) {
    console.error("Error deleting review:", error)
    throw error
  }
}

// Game Activity Tracking
export const trackGameView = async (uid: string, gameId: string, gameTitle: string) => {
  try {
    const activityRef = collection(db, "users", uid, "activity")
    await addDoc(activityRef, {
      type: "game_view",
      gameId,
      gameTitle,
      timestamp: serverTimestamp(),
    })
  } catch (error) {
    console.error("Error tracking game view:", error)
    // Don't throw error for analytics tracking
  }
}

export const getUserActivity = async (uid: string, limitCount = 20) => {
  try {
    const activityRef = collection(db, "users", uid, "activity")
    const q = query(activityRef, orderBy("timestamp", "desc"), limit(limitCount))
    const querySnapshot = await getDocs(q)

    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))
  } catch (error) {
    console.error("Error getting user activity:", error)
    return []
  }
}
