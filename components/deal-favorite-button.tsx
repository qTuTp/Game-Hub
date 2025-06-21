"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Heart, Loader2 } from "lucide-react"
import { useWishlist } from "@/contexts/wishlist-context"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import type { FavoriteDeal } from "@/lib/firestore"

interface DealFavoriteButtonProps {
  deal: {
    id: number | string
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
  }
  className?: string
}

export function DealFavoriteButton({ deal, className = "" }: DealFavoriteButtonProps) {
  const { user } = useAuth()
  const { addToFavoriteDeals, removeFromFavoriteDeals, isInFavoriteDeals } = useWishlist()
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const isFavorited = isInFavoriteDeals(String(deal.id))

  const handleToggleFavorite = async () => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to add deals to your favourites",
        variant: "destructive",
      })
      return
    }

    try {
      setIsLoading(true)

      if (isFavorited) {
        await removeFromFavoriteDeals(String(deal.id))
        toast({
          title: "Deal removed",
          description: "Deal has been removed from your favourites",
        })
      } else {
        const favoriteData: Omit<FavoriteDeal, "addedAt"> = {
          id: String(deal.id),
          title: deal.title,
          originalPrice: deal.originalPrice,
          salePrice: deal.salePrice,
          discount: deal.discount,
          platform: deal.platform,
          storeUrl: deal.storeUrl,
          image: deal.image,
          rating: deal.rating,
          endDate: deal.endDate,
          genre: deal.genre,
          drm: deal.drm,
          totalDeals: deal.totalDeals,
        }

        await addToFavoriteDeals(favoriteData)
        toast({
          title: "Deal added",
          description: "Deal has been added to your favourites",
        })
      }
    } catch (error) {
      console.error("Error toggling favorite:", error)
      toast({
        title: "Error",
        description: "Failed to update favourites. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      onClick={handleToggleFavorite}
      disabled={isLoading}
      size="icon"
      variant={isFavorited ? "default" : "outline"}
      className={`h-8 w-8 ${
        isFavorited
          ? "bg-red-600 hover:bg-red-700 text-white"
          : "border-red-400 text-red-400 hover:bg-red-400 hover:text-white"
      } ${className}`}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Heart className={`h-4 w-4 ${isFavorited ? "fill-current" : ""}`} />
      )}
    </Button>
  )
}
