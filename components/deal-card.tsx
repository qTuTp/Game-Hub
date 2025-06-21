"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Star, Clock, ExternalLink, Percent, ChevronDown, Store } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useState } from "react"
import { DealFavoriteButton } from "@/components/deal-favorite-button"

interface AlternativeStore {
  name: string
  price: string
  originalPrice: string
  discount: number
  url: string
  storeID: string
}

interface Deal {
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
  alternativeStores: AlternativeStore[]
  totalDeals: number
}

interface DealCardProps {
  deal: Deal
}

export function DealCard({ deal }: DealCardProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  const getDaysRemaining = (endDate: string) => {
    const end = new Date(endDate)
    const now = new Date()
    const diffTime = end.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

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

  const daysRemaining = getDaysRemaining(deal.endDate)

  // Mock alternative stores data for testing
  const mockAlternativeStores = [
    {
      name: "Steam",
      price: "$24.99",
      originalPrice: "$39.99",
      discount: 38,
      url: "https://store.steampowered.com",
      storeID: "1",
    },
    {
      name: "Epic Games Store",
      price: "$26.49",
      originalPrice: "$39.99",
      discount: 34,
      url: "https://store.epicgames.com",
      storeID: "25",
    },
  ]

  const alternativeStores = deal.alternativeStores?.length > 0 ? deal.alternativeStores : mockAlternativeStores

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen)
  }

  return (
    <Card className="bg-slate-800/50 border-slate-700 hover:bg-slate-800/70 transition-all duration-300 hover:scale-105">
      <CardHeader className="p-0">
        <div className="relative">
          <Image
            src={deal.image || "/placeholder.svg"}
            alt={deal.title}
            width={400}
            height={300}
            className="w-full h-48 object-cover rounded-t-lg"
          />
          <Badge className={`absolute top-2 left-2 ${getPlatformColor(deal.platform)}`}>{deal.platform}</Badge>
          <Badge className="absolute top-2 right-2 bg-red-600">-{deal.discount || 0}%</Badge>
          <DealFavoriteButton deal={deal} className="absolute top-12 right-2" />
          {deal.totalDeals > 1 && (
            <Badge className="absolute bottom-2 right-2 bg-green-600">
              <Store className="h-3 w-3 mr-1" />
              {deal.totalDeals} stores
            </Badge>
          )}
          {daysRemaining <= 3 && (
            <Badge className="absolute bottom-2 left-2 bg-orange-600 animate-pulse">
              <Clock className="h-3 w-3 mr-1" />
              {daysRemaining}d left
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <CardTitle className="text-white mb-2 line-clamp-1">{deal.title}</CardTitle>
        <CardDescription className="text-gray-400 mb-3">
          {deal.genre} • Best price on {deal.platform}
        </CardDescription>

        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <span className="text-lg font-bold text-green-400">${(deal.salePrice || 0).toFixed(2)}</span>
            <span className="text-sm text-gray-500 line-through">${(deal.originalPrice || 0).toFixed(2)}</span>
          </div>
          <div className="flex items-center">
            <Star className="h-4 w-4 text-yellow-400 fill-current" />
            <span className="text-white ml-1">{(deal.rating || 0).toFixed(1)}</span>
          </div>
        </div>

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center text-sm text-gray-400">
            <Percent className="h-4 w-4 mr-1 text-red-400" />
            Save ${((deal.originalPrice || 0) - (deal.salePrice || 0)).toFixed(2)}
          </div>
          <div className="text-sm text-gray-400">
            Ends {deal.endDate ? new Date(deal.endDate).toLocaleDateString() : "N/A"}
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex gap-2">
            <Link
              href={deal.storeUrl || "#"}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 relative overflow-hidden bg-slate-800 border-2 border-transparent bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-border p-[2px] rounded-md transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-purple-500/25 group"
            >
              <div className="flex items-center justify-center w-full h-full bg-slate-800 rounded-sm px-4 py-2 text-white transition-all duration-300 group-hover:bg-gradient-to-r group-hover:from-purple-600 group-hover:to-pink-600 group-hover:text-purple-200">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-pink-600/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                <span className="relative z-10 mr-2">Get Best Deal</span>
                <ExternalLink className="h-4 w-4 relative z-10" />
              </div>
            </Link>
          </div>

          {/* Custom Dropdown for Alternative Stores */}
          <div className="mt-2 border-t border-slate-700 pt-2">
            <button
              onClick={toggleDropdown}
              className="w-full flex items-center justify-between p-3 text-sm text-gray-400 hover:text-white hover:bg-slate-700/50 rounded-lg border border-slate-600 hover:border-slate-500 transition-all duration-200"
            >
              <span>Compare {alternativeStores.length} other stores</span>
              <ChevronDown
                className={`h-4 w-4 transition-transform duration-200 ${isDropdownOpen ? "rotate-180" : ""}`}
              />
            </button>

            {/* Dropdown Content */}
            {isDropdownOpen && (
              <div className="mt-2 space-y-2 animate-in slide-in-from-top-2 duration-200">
                {alternativeStores.map((store, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-slate-700/40 rounded-lg border border-slate-600/50 hover:bg-slate-700/60 transition-colors duration-200"
                  >
                    <div className="flex flex-col space-y-1">
                      <div className="flex items-center space-x-2">
                        <Badge className={`text-xs px-2 py-1 ${getPlatformColor(store.name)}`}>{store.name}</Badge>
                        <Badge className="bg-red-600 text-xs px-2 py-1">-{store.discount}%</Badge>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-green-400 font-bold text-sm">{store.price}</span>
                        <span className="text-gray-500 line-through text-xs">{store.originalPrice}</span>
                      </div>
                    </div>
                    <Button asChild size="sm" className="bg-green-600 hover:bg-green-700 text-white px-4 py-1 text-xs">
                      <Link href={store.url} target="_blank" rel="noopener noreferrer">
                        Buy Now
                      </Link>
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
