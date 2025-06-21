"use client"

import { useState } from "react"
import { Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useWishlist } from "@/contexts/wishlist-context"
import { useAuth } from "@/contexts/auth-context"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface WishlistButtonProps {
  game: {
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
  }
  variant?: "default" | "outline" | "ghost"
  size?: "default" | "sm" | "lg" | "icon"
  className?: string
}

export function WishlistButton({ game, variant = "outline", size = "default", className }: WishlistButtonProps) {
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist()
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(false)

  const inWishlist = isInWishlist(game.id)

  const handleToggleWishlist = async () => {
    if (!user) {
      toast.error("Please log in to add games to your favourites")
      return
    }

    setIsLoading(true)

    try {
      if (inWishlist) {
        await removeFromWishlist(game.id)
        toast.success("Removed from favourites")
      } else {
        await addToWishlist(game)
        toast.success("Added to favourites")
      }
    } catch (error) {
      console.error("Wishlist error:", error)
      toast.error("Failed to update favourites. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleToggleWishlist}
      disabled={isLoading}
      className={cn("transition-colors", inWishlist && "text-red-500 hover:text-red-600", className)}
    >
      <Heart
        className={cn("h-4 w-4", size === "sm" && "h-3 w-3", size === "lg" && "h-5 w-5", inWishlist && "fill-current")}
      />
      {size !== "icon" && (
        <span className="ml-2">{isLoading ? "..." : inWishlist ? "In Favourites" : "Add to Favourite"}</span>
      )}
    </Button>
  )
}
