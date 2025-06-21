"use client"

import { useState } from "react"
import { Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useWishlist } from "@/contexts/wishlist-context"
import { useAuth } from "@/contexts/auth-context"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface NewsFavoriteButtonProps {
  article: {
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
  }
  variant?: "default" | "outline" | "ghost"
  size?: "default" | "sm" | "lg" | "icon"
  className?: string
}

export function NewsFavoriteButton({
  article,
  variant = "outline",
  size = "default",
  className,
}: NewsFavoriteButtonProps) {
  const { addToFavoriteNews, removeFromFavoriteNews, isInFavoriteNews } = useWishlist()
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(false)

  const inFavorites = isInFavoriteNews(article.id)

  const handleToggleFavorite = async () => {
    if (!user) {
      toast.error("Please log in to add news to your favourites")
      return
    }

    setIsLoading(true)

    try {
      if (inFavorites) {
        await removeFromFavoriteNews(article.id)
        toast.success("Removed from favourites")
      } else {
        await addToFavoriteNews(article)
        toast.success("Added to favourites")
      }
    } catch (error) {
      console.error("Favorite news error:", error)
      toast.error("Failed to update favourites. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleToggleFavorite}
      disabled={isLoading}
      className={cn("transition-colors", inFavorites && "text-red-500 hover:text-red-600", className)}
    >
      <Heart
        className={cn("h-4 w-4", size === "sm" && "h-3 w-3", size === "lg" && "h-5 w-5", inFavorites && "fill-current")}
      />
      {size !== "icon" && (
        <span className="ml-2">{isLoading ? "..." : inFavorites ? "In Favourites" : "Add to Favourite"}</span>
      )}
    </Button>
  )
}
