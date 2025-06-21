"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Heart, Loader2 } from "lucide-react"
import { useWishlist } from "@/contexts/wishlist-context"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import type { FavoriteReview } from "@/lib/firestore"

interface ReviewFavoriteButtonProps {
  review: {
    id: string
    reviewTitle: string
    gameTitle: string
    gameImage?: string
    author: string
    rating: number
    originalScore?: number
    publishDate: string
    excerpt: string
    verdict?: string
    genre: string
    platform?: string
    sourceUrl?: string
    likes: number
    dislikes: number
  }
  variant?: "default" | "outline" | "ghost"
  size?: "default" | "sm" | "lg" | "icon"
  className?: string
}

export function ReviewFavoriteButton({
  review,
  variant = "ghost",
  size = "sm",
  className = "",
}: ReviewFavoriteButtonProps) {
  const { user } = useAuth()
  const { addToFavoriteReviews, removeFromFavoriteReviews, isInFavoriteReviews } = useWishlist()
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const isFavorited = isInFavoriteReviews(review.id)

  const handleToggleFavorite = async () => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to add reviews to your favourites",
        variant: "destructive",
      })
      return
    }

    try {
      setIsLoading(true)

      if (isFavorited) {
        await removeFromFavoriteReviews(review.id)
        toast({
          title: "Review removed",
          description: "Review has been removed from your favourites",
        })
      } else {
        const favoriteReview: Omit<FavoriteReview, "addedAt"> = {
          id: review.id,
          reviewTitle: review.reviewTitle,
          gameTitle: review.gameTitle,
          gameImage: review.gameImage || "",
          author: review.author,
          rating: review.rating,
          originalScore: review.originalScore,
          publishDate: review.publishDate,
          excerpt: review.excerpt,
          verdict: review.verdict,
          genre: review.genre,
          platform: review.platform || "",
          sourceUrl: review.sourceUrl,
          likes: review.likes,
          dislikes: review.dislikes,
        }

        await addToFavoriteReviews(favoriteReview)
        toast({
          title: "Review added",
          description: "Review has been added to your favourites",
        })
      }
    } catch (error) {
      console.error("Error toggling review favorite:", error)
      toast({
        title: "Error",
        description: "Failed to update review favourites",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      onClick={handleToggleFavorite}
      variant={variant}
      size={size}
      disabled={isLoading}
      className={`${className} ${isFavorited ? "text-red-400 hover:text-red-300" : "text-gray-400 hover:text-red-400"}`}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Heart className={`h-4 w-4 ${isFavorited ? "fill-current" : ""}`} />
      )}
      {size !== "icon" && <span className="ml-1">{isFavorited ? "In Favourites" : "Add to Favourites"}</span>}
    </Button>
  )
}
