"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Star, ThumbsUp, ThumbsDown, User, Calendar, ArrowLeft, Loader2, AlertCircle, ExternalLink } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { ReviewFavoriteButton } from "@/components/review-favorite-button"

export default function ReviewDetailPage({ params }: { params: { id: string } }) {
  const [review, setReview] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchReview()
  }, [params.id])

  const fetchReview = async () => {
    try {
      setLoading(true)
      setError("")

      // Fetch all reviews and find the one with matching ID
      const response = await fetch("/api/reviews")
      if (!response.ok) throw new Error("Failed to fetch reviews")

      const data = await response.json()

      // Handle both old and new API response formats
      const reviewsList = data.reviews || data || []
      const foundReview = reviewsList.find((r: any) => r.id.toString() === params.id)

      if (!foundReview) {
        setError("Review not found")
        return
      }

      setReview(foundReview)
    } catch (err) {
      setError("Failed to load review. Please try again.")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-5 w-5 ${
          i < Math.floor(rating)
            ? "text-yellow-400 fill-current"
            : i < rating
              ? "text-yellow-400 fill-current opacity-50"
              : "text-gray-600"
        }`}
      />
    ))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="flex items-center space-x-3">
          <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
          <span className="text-white text-lg">Loading review...</span>
        </div>
      </div>
    )
  }

  if (error || !review) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-8 text-center">
              <div className="flex justify-center mb-4">
                <AlertCircle className="h-16 w-16 text-red-400" />
              </div>
              <h1 className="text-3xl font-bold text-white mb-4">Review Not Found</h1>
              <p className="text-gray-300 mb-6">The review you're looking for doesn't exist or has been removed.</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild className="bg-purple-600 hover:bg-purple-700">
                  <Link href="/reviews">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Reviews
                  </Link>
                </Button>
                <Button
                  onClick={fetchReview}
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

  // Check if we have enough content for a full review page
  const hasFullContent = review.content && review.content.length > review.excerpt?.length
  const hasDetailedInfo = review.pros?.length > 0 || review.cons?.length > 0

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
            <Link href="/reviews" className="hover:text-purple-400">
              Reviews
            </Link>
            <span>/</span>
            <span className="text-white">{review.gameTitle}</span>
          </div>
        </nav>

        {/* Back Button */}
        <div className="mb-6">
          <Button asChild variant="ghost" className="text-purple-400 hover:text-white">
            <Link href="/reviews">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Reviews
            </Link>
          </Button>
        </div>

        {/* Review Header */}
        <Card className="bg-slate-800/50 border-slate-700 mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Game Image */}
              <div className="md:w-1/3">
                <Image
                  src={review.gameImage || "/placeholder.svg"}
                  alt={review.gameTitle}
                  width={400}
                  height={300}
                  className="w-full h-64 object-cover rounded-lg"
                  style={{
                    maxWidth: "100%",
                    height: "auto",
                    aspectRatio: "4/3",
                  }}
                />
              </div>
              <div className="md:w-2/3">
                <h1 className="text-3xl font-bold text-white mb-2">{review.reviewTitle}</h1>
                <h2 className="text-xl text-purple-400 mb-4">{review.gameTitle}</h2>

                <div className="flex items-center space-x-4 mb-4">
                  <div className="flex items-center space-x-1">
                    {renderStars(review.rating)}
                    <span className="text-white ml-2 font-semibold text-lg">{review.rating}/5</span>
                    {review.originalScore && (
                      <span className="text-gray-400 text-sm ml-2">
                        (Original: {review.originalScore}
                        {review.originalScore <= 5 ? "/5" : "/100"})
                      </span>
                    )}
                  </div>
                  <Badge className="bg-purple-600">{review.genre}</Badge>
                  <Badge variant="secondary" className="bg-slate-700 text-gray-300">
                    {review.platform}
                  </Badge>
                </div>

                <div className="flex items-center space-x-6 text-sm text-gray-400 mb-4">
                  <div className="flex items-center">
                    <User className="h-4 w-4 mr-1" />
                    {review.author}
                  </div>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    {new Date(review.publishDate).toLocaleDateString()}
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <Button variant="ghost" size="sm" className="text-green-400 hover:text-green-300">
                    <ThumbsUp className="h-4 w-4 mr-1" />
                    {review.likes}
                  </Button>
                  <Button variant="ghost" size="sm" className="text-red-400 hover:text-red-300">
                    <ThumbsDown className="h-4 w-4 mr-1" />
                    {review.dislikes}
                  </Button>
                  {/* Show link to original review if available */}
                  {review.sourceUrl && (
                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                      className="border-purple-400 text-purple-400 hover:bg-purple-400 hover:text-white"
                    >
                      <Link href={review.sourceUrl} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4 mr-1" />
                        Original Review
                      </Link>
                    </Button>
                  )}
                  <ReviewFavoriteButton
                    review={{
                      id: review.id,
                      reviewTitle: review.reviewTitle,
                      gameTitle: review.gameTitle,
                      gameImage: review.gameImage,
                      author: review.author,
                      rating: review.rating,
                      originalScore: review.originalScore,
                      publishDate: review.publishDate,
                      excerpt: review.excerpt,
                      verdict: review.verdict,
                      genre: review.genre,
                      platform: review.platform,
                      sourceUrl: review.sourceUrl,
                      likes: review.likes,
                      dislikes: review.dislikes,
                    }}
                    variant="outline"
                    size="sm"
                    className="border-red-400 text-red-400 hover:bg-red-400 hover:text-white"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Review Content */}
        {hasFullContent || hasDetailedInfo ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              {/* Review Text */}
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Review</CardTitle>
                </CardHeader>
                <CardContent>
                  {hasFullContent ? (
                    <div
                      className="text-gray-300 leading-relaxed prose prose-invert max-w-none 
               [&_img]:max-w-full [&_img]:w-full [&_img]:h-auto [&_img]:rounded-lg 
               [&_img]:my-4 [&_img]:object-contain [&_img]:bg-slate-700/20 
               [&_img]:p-2 [&_img]:border [&_img]:border-slate-600
               [&_figure]:max-w-full [&_figure]:w-full [&_figure]:my-4
               [&_figure_img]:max-w-full [&_figure_img]:w-full [&_figure_img]:h-auto"
                      dangerouslySetInnerHTML={{ __html: review.content }}
                    />
                  ) : (
                    <div className="text-gray-300 leading-relaxed">
                      <p className="mb-4">{review.excerpt}</p>
                      {review.verdict && (
                        <div className="bg-slate-700/50 rounded-lg p-4 mt-4">
                          <h4 className="text-purple-400 font-semibold mb-2">Verdict</h4>
                          <p className="italic">"{review.verdict}"</p>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              {/* Pros & Cons - Only show if we have the data */}
              {hasDetailedInfo && (
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white">Pros & Cons</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {review.pros && review.pros.length > 0 && (
                      <div>
                        <h4 className="text-green-400 font-semibold mb-3">Pros</h4>
                        <ul className="space-y-2">
                          {review.pros.map((pro: string, index: number) => (
                            <li key={index} className="text-sm text-gray-300 flex items-start">
                              <div className="w-2 h-2 bg-green-400 rounded-full mr-3 mt-2 flex-shrink-0" />
                              {pro}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {review.pros && review.cons && review.pros.length > 0 && review.cons.length > 0 && (
                      <Separator className="bg-slate-700" />
                    )}

                    {review.cons && review.cons.length > 0 && (
                      <div>
                        <h4 className="text-red-400 font-semibold mb-3">Cons</h4>
                        <ul className="space-y-2">
                          {review.cons.map((con: string, index: number) => (
                            <li key={index} className="text-sm text-gray-300 flex items-start">
                              <div className="w-2 h-2 bg-red-400 rounded-full mr-3 mt-2 flex-shrink-0" />
                              {con}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Rating Summary */}
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Rating</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="flex items-center justify-center space-x-1 mb-2">{renderStars(review.rating)}</div>
                    <span className="text-3xl font-bold text-white">{review.rating}/5</span>
                    {review.originalScore && (
                      <div className="text-sm text-gray-400 mt-1">
                        Original Score: {review.originalScore}
                        {review.originalScore <= 5 ? "/5" : "/100"}
                      </div>
                    )}
                    {review.verdict && (
                      <div className="mt-4 bg-slate-700/50 rounded-lg p-3">
                        <p className="text-gray-300 text-sm italic">"{review.verdict}"</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Related Actions */}
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <ReviewFavoriteButton
                    review={{
                      id: review.id,
                      reviewTitle: review.reviewTitle,
                      gameTitle: review.gameTitle,
                      gameImage: review.gameImage,
                      author: review.author,
                      rating: review.rating,
                      originalScore: review.originalScore,
                      publishDate: review.publishDate,
                      excerpt: review.excerpt,
                      verdict: review.verdict,
                      genre: review.genre,
                      platform: review.platform,
                      sourceUrl: review.sourceUrl,
                      likes: review.likes,
                      dislikes: review.dislikes,
                    }}
                    className="w-full bg-red-600 hover:bg-red-700 text-white"
                  />
                  <Button asChild className="w-full bg-purple-600 hover:bg-purple-700">
                    <Link href={`/games?search=${encodeURIComponent(review.gameTitle)}`}>Find This Game</Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    className="w-full border-purple-400 text-purple-400 hover:bg-purple-400 hover:text-white"
                  >
                    <Link href={`/reviews?search=${encodeURIComponent(review.genre)}`}>
                      More {review.genre} Reviews
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          /* Limited Content - Show summary and external link */
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-8 text-center">
              <h3 className="text-2xl font-bold text-white mb-4">Review Summary</h3>
              <p className="text-gray-300 mb-6 leading-relaxed max-w-2xl mx-auto">{review.excerpt}</p>

              {review.verdict && (
                <div className="bg-slate-700/50 rounded-lg p-4 mb-6 max-w-2xl mx-auto">
                  <h4 className="text-purple-400 font-semibold mb-2">Verdict</h4>
                  <p className="text-gray-300 italic">"{review.verdict}"</p>
                </div>
              )}

              <div className="flex items-center justify-center space-x-1 mb-4">
                {renderStars(review.rating)}
                <span className="text-white ml-2 font-semibold text-xl">{review.rating}/5</span>
                {review.originalScore && (
                  <span className="text-gray-400 text-sm ml-2">
                    (Original: {review.originalScore}
                    {review.originalScore <= 5 ? "/5" : "/100"})
                  </span>
                )}
              </div>

              <div className="bg-blue-600/20 border border-blue-600/30 rounded-lg p-4 mb-6">
                <p className="text-blue-200 text-sm mb-3">
                  This review summary is based on available data. For the complete review with detailed analysis,
                  screenshots, and in-depth commentary, visit the original source.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild className="bg-purple-600 hover:bg-purple-700">
                  <Link
                    href={review.sourceUrl || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={
                      !review.sourceUrl
                        ? (e) => {
                            e.preventDefault()
                            alert("Original review source not available")
                          }
                        : undefined
                    }
                  >
                    <ExternalLink className="mr-2 h-4 w-4" />
                    {review.sourceUrl ? "Read Full Review" : "Review Source Unavailable"}
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="border-purple-400 text-purple-400 hover:bg-purple-400 hover:text-white"
                >
                  <Link href={`/games?search=${encodeURIComponent(review.gameTitle)}`}>Find This Game</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
