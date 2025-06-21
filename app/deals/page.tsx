"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2 } from "lucide-react"
import { DealCard } from "@/components/deal-card"

export default function DealsPage() {
  const [deals, setDeals] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState("")
  const [selectedStore, setSelectedStore] = useState("all")
  const [sortBy, setSortBy] = useState("DealRating")
  const [currentPage, setCurrentPage] = useState(0)
  const [hasMoreDeals, setHasMoreDeals] = useState(true)

  // Fetch deals when filters change or on initial load
  useEffect(() => {
    setCurrentPage(0)
    setDeals([])
    setHasMoreDeals(true)
    fetchDeals(0, true)
  }, [selectedStore, sortBy])

  // Fetch deals from the API
  const fetchDeals = async (page = 0, reset = false) => {
    try {
      if (reset) {
        setLoading(true)
      } else {
        setLoadingMore(true)
      }
      setError("")

      const params = new URLSearchParams()

      // Only add storeID if it's not "all"
      if (selectedStore !== "all") {
        params.append("storeID", selectedStore)
      }
      params.append("sortBy", sortBy)
      params.append("pageNumber", page.toString())

      const response = await fetch(`/api/deals?${params}`)
      if (!response.ok) throw new Error("Failed to fetch deals")

      const data = await response.json()

      if (reset) {
        setDeals(data)
      } else {
        // Append new deals to existing ones while avoiding duplicates
        // Use a Set to track existing deal IDs for efficient duplicate checking
        setDeals((prevDeals) => {
          const existingIds = new Set(prevDeals.map((deal: any) => deal.id))
          const newDeals = data.filter((deal: any) => !existingIds.has(deal.id))
          return [...prevDeals, ...newDeals]
        })
      }

      // Check if we have more deals to load
      // If the number of deals returned is less than 60, we assume there are no more deals
      setHasMoreDeals(data.length >= 60) // CheapShark returns 60 deals per page by default
    } catch (err) {
      setError("Failed to load deals. Please try again.")
      console.error(err)
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }

  // Handle load more button click
  // Increment the current page and fetch more deals
  const handleLoadMore = () => {
    const nextPage = currentPage + 1
    setCurrentPage(nextPage)
    fetchDeals(nextPage, false)
  }

  // Handle retry button click in case of an error
  // Reset the state and fetch deals again
  const handleRetry = () => {
    setCurrentPage(0)
    setDeals([])
    setHasMoreDeals(true)
    fetchDeals(0, true)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">Game Deals</h1>
          <p className="text-gray-300">Find the best deals across all gaming platforms - duplicates removed!</p>
        </div>

        {/* Filters */}
        <div className="bg-slate-800/50 rounded-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <Select value={selectedStore} onValueChange={setSelectedStore}>
              <SelectTrigger className="w-full md:w-48 bg-slate-700 border-slate-600 text-white">
                <SelectValue placeholder="Store" />
              </SelectTrigger>
              <SelectContent className="bg-slate-700 border-slate-600">
                <SelectItem value="all">All Stores</SelectItem>
                <SelectItem value="1">Steam</SelectItem>
                <SelectItem value="25">Epic Games Store</SelectItem>
                <SelectItem value="7">GOG</SelectItem>
                <SelectItem value="8">Origin</SelectItem>
                <SelectItem value="11">GamesPlanet</SelectItem>
                <SelectItem value="13">Uplay</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full md:w-48 bg-slate-700 border-slate-600 text-white">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent className="bg-slate-700 border-slate-600">
                <SelectItem value="DealRating">Best Deals</SelectItem>
                <SelectItem value="Price">Lowest Price</SelectItem>
                <SelectItem value="Savings">Highest Savings</SelectItem>
                <SelectItem value="Recent">Most Recent</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
            <span className="ml-2 text-white">Loading deals...</span>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-12">
            <p className="text-red-400 text-lg mb-4">{error}</p>
            <Button onClick={handleRetry} className="bg-purple-600 hover:bg-purple-700">
              Try Again
            </Button>
          </div>
        )}

        {/* Results Count */}
        {!loading && !error && deals.length > 0 && (
          <div className="mb-6">
            <p className="text-gray-300">
              Showing {deals.length} unique games with deals
              {selectedStore !== "all" && <span className="text-purple-400"> from {getStoreName(selectedStore)}</span>}
              {currentPage > 0 && <span className="text-gray-400"> (Page {currentPage + 1})</span>}
            </p>
          </div>
        )}

        {/* Deals Grid */}
        {!loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {deals.map((deal: any, index: number) => (
              <DealCard key={`${deal.id}-${deal.platform}-${index}`} deal={deal} />
            ))}
          </div>
        )}

        {!loading && !error && deals.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">No deals found. Please try different filters.</p>
            <Button
              onClick={() => {
                setSelectedStore("all")
                setSortBy("DealRating")
              }}
              className="mt-4 bg-purple-600 hover:bg-purple-700"
            >
              Reset Filters
            </Button>
          </div>
        )}

        {/* Load More Button */}
        {!loading && !error && deals.length > 0 && hasMoreDeals && (
          <div className="text-center mt-8">
            <Button
              onClick={handleLoadMore}
              disabled={loadingMore}
              className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50"
            >
              {loadingMore ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Loading More...
                </>
              ) : (
                "Load More Deals"
              )}
            </Button>
          </div>
        )}

        {/* End of Results Message */}
        {!loading && !error && deals.length > 0 && !hasMoreDeals && (
          <div className="text-center mt-8">
            <p className="text-gray-400">You've reached the end of available deals!</p>
            <Button
              onClick={() => {
                setSelectedStore("all")
                setSortBy("DealRating")
              }}
              variant="outline"
              className="mt-4 border-purple-400 text-purple-400 hover:bg-purple-400 hover:text-white"
            >
              Try Different Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

// Helper function to get store name
function getStoreName(storeId: string): string {
  const storeNames: { [key: string]: string } = {
    "1": "Steam",
    "25": "Epic Games Store",
    "7": "GOG",
    "8": "Origin",
    "11": "GamesPlanet",
    "13": "Uplay",
  }
  return storeNames[storeId] || "Unknown Store"
}
