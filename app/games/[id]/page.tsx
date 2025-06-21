"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Star, Calendar, Users, Monitor, Gamepad2, Loader2, AlertCircle, ArrowLeft } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { StoreLinks } from "@/components/store-links"
import { StarIcon } from "lucide-react"
import { WishlistButton } from "@/components/wishlist-button"

export default function GameDetailPage({ params }: { params: { id: string } }) {
  const [game, setGame] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [errorDetails, setErrorDetails] = useState("")

  useEffect(() => {
    fetchGame()
  }, [params.id])

  const fetchGame = async () => {
    try {
      setLoading(true)
      setError("")
      setErrorDetails("")

      console.log(`Fetching game with ID: ${params.id}`)
      const response = await fetch(`/api/games/${params.id}`)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))

        if (response.status === 404) {
          setError("Game Not Found")
          setErrorDetails(
            errorData.message ||
              `The game with ID ${params.id} could not be found in our database. It may have been removed or the ID might be incorrect.`,
          )
        } else {
          setError("Failed to Load Game")
          setErrorDetails(errorData.message || "There was an error loading the game details. Please try again later.")
        }
        return
      }

      const gameData = await response.json()
      console.log(`Successfully loaded game: ${gameData.title}`)

      // Fetch real pricing data from CheapShark API
      let pricingData = []
      try {
        const pricingResponse = await fetch(`/api/games/${params.id}/pricing`)
        if (pricingResponse.ok) {
          pricingData = await pricingResponse.json()
        }
      } catch (error) {
        console.warn("Failed to fetch pricing data:", error)
      }

      setGame({ ...gameData, pricingData })
    } catch (err) {
      console.error("Error fetching game:", err)
      setError("Connection Error")
      setErrorDetails("Unable to connect to the server. Please check your internet connection and try again.")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="flex items-center space-x-3">
          <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
          <span className="text-white text-lg">Loading game details...</span>
        </div>
      </div>
    )
  }

  if (error || !game) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <nav className="mb-6">
            <div className="flex items-center space-x-2 text-sm text-gray-400">
              <Link href="/" className="hover:text-purple-400">
                Home
              </Link>
              <span>/</span>
              <Link href="/games" className="hover:text-purple-400">
                Games
              </Link>
              <span>/</span>
              <span className="text-white">Error</span>
            </div>
          </nav>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-8 text-center">
              <div className="flex justify-center mb-4">
                <AlertCircle className="h-16 w-16 text-red-400" />
              </div>

              <h1 className="text-3xl font-bold text-white mb-4">{error}</h1>
              <p className="text-gray-300 mb-6 max-w-2xl mx-auto leading-relaxed">{errorDetails}</p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild className="bg-purple-600 hover:bg-purple-700">
                  <Link href="/games">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Games
                  </Link>
                </Button>
                <Button
                  onClick={fetchGame}
                  variant="outline"
                  className="border-purple-400 text-purple-400 hover:bg-purple-400 hover:text-white"
                >
                  Try Again
                </Button>
              </div>

            
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="mb-6">
          <div className="flex items-center space-x-2 text-sm text-gray-400">
            <Link href="/" className="hover:text-purple-400">
              Home
            </Link>
            <span>/</span>
            <Link href="/games" className="hover:text-purple-400">
              Games
            </Link>
            <span>/</span>
            <span className="text-white">{game.title}</span>
          </div>
        </nav>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Game Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Hero Image */}
            <div className="relative">
              <Image
                src={game.image || "/placeholder.svg"}
                alt={game.title}
                width={600}
                height={400}
                className="w-full h-64 md:h-96 object-cover rounded-lg"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent rounded-lg" />
              <div className="absolute bottom-4 left-4">
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{game.title}</h1>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center">
                    <Star className="h-5 w-5 text-yellow-400 fill-current" />
                    <span className="text-white ml-1 font-semibold">{game.rating}</span>
                  </div>
                  <Badge className="bg-purple-600">{game.genre}</Badge>
                  <Badge variant="outline" className="border-white text-white">
                    {game.esrbRating}
                  </Badge>
                  {game.metacriticScore && <Badge className="bg-green-600">Metacritic: {game.metacriticScore}</Badge>}
                </div>
              </div>
            </div>

            {/* Game Details */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Game Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center text-gray-300">
                    <Calendar className="h-5 w-5 mr-3 text-purple-400" />
                    <div>
                      <div className="text-sm text-gray-400">Release Date</div>
                      <div>{new Date(game.releaseDate).toLocaleDateString()}</div>
                    </div>
                  </div>
                  <div className="flex items-center text-gray-300">
                    <Users className="h-5 w-5 mr-3 text-purple-400" />
                    <div>
                      <div className="text-sm text-gray-400">Players</div>
                      <div>{game.players}</div>
                    </div>
                  </div>
                  <div className="flex items-center text-gray-300">
                    <Gamepad2 className="h-5 w-5 mr-3 text-purple-400" />
                    <div>
                      <div className="text-sm text-gray-400">Developer</div>
                      <div>{game.developer}</div>
                    </div>
                  </div>
                  <div className="flex items-center text-gray-300">
                    <Monitor className="h-5 w-5 mr-3 text-purple-400" />
                    <div>
                      <div className="text-sm text-gray-400">Publisher</div>
                      <div>{game.publisher}</div>
                    </div>
                  </div>
                </div>

                <Separator className="bg-slate-700" />

                <div>
                  <h3 className="text-white font-semibold mb-2">Platforms</h3>
                  <div className="flex flex-wrap gap-2">
                    {game.platforms?.map((platform: string) => (
                      <Badge key={platform} variant="secondary" className="bg-slate-700 text-gray-300">
                        {platform}
                      </Badge>
                    ))}
                  </div>
                </div>

                {game.tags && game.tags.length > 0 && (
                  <>
                    <Separator className="bg-slate-700" />
                    <div>
                      <h3 className="text-white font-semibold mb-2">Tags</h3>
                      <div className="flex flex-wrap gap-2">
                        {game.tags.map((tag: string) => (
                          <Badge key={tag} variant="outline" className="border-purple-400 text-purple-400">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Description */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">About This Game</CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  className="text-gray-300 leading-relaxed prose prose-invert max-w-none"
                  dangerouslySetInnerHTML={{ __html: game.description }}
                />
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Purchase & Actions */}
          <div className="space-y-6">
            {/* Where to Buy Card */}
            <StoreLinks
              gameTitle={game.title}
              stores={
                game.pricingData || [
                  {
                    name: "Steam",
                    url: `https://store.steampowered.com/search/?term=${encodeURIComponent(game.title)}`,
                    price: game.price,
                    icon: <Monitor className="h-4 w-4" />,
                    color: "bg-blue-600",
                  },
                  {
                    name: "Epic Games",
                    url: `https://store.epicgames.com/en-US/browse?q=${encodeURIComponent(game.title)}`,
                    price: "$34.99",
                    originalPrice: "$59.99",
                    discount: 42,
                    icon: <Gamepad2 className="h-4 w-4" />,
                    color: "bg-gray-800",
                  },
                  {
                    name: "GOG",
                    url: `https://www.gog.com/games?search=${encodeURIComponent(game.title)}`,
                    price: game.price,
                    icon: <StarIcon className="h-4 w-4" />,
                    color: "bg-purple-600",
                  },
                ]
              }
            />

            {/* Wishlist Button */}
            <WishlistButton
              game={{
                id: String(params.id), // Ensure consistent string ID format
                title: game.title,
                image: game.image || "/placeholder.svg",
                price: game.price || "Free",
                originalPrice: game.originalPrice,
                discount: game.discount,
                rating: game.rating || 0,
                genre: game.genre || "Unknown",
                releaseDate: game.releaseDate || new Date().toISOString(),
                platform: game.platforms?.[0] || "PC",
              }}
              className="w-full"
            />

            {/* Screenshots */}
            {game.screenshots && game.screenshots.length > 0 && (
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Screenshots</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {game.screenshots.map((screenshot: string, index: number) => (
                      <Image
                        key={index}
                        src={screenshot || "/placeholder.svg"}
                        alt={`${game.title} screenshot ${index + 1}`}
                        width={500}
                        height={300}
                        className="w-full h-32 object-cover rounded-lg hover:scale-105 transition-transform cursor-pointer"
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
