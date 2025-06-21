import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { WishlistProvider } from "@/contexts/wishlist-context"
import { AuthProvider } from "@/contexts/auth-context"
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "GameHub - Your Ultimate Gaming Destination",
  description: "Discover games, read reviews, find deals, and stay updated with the latest gaming news",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        <AuthProvider>
          <WishlistProvider>
            <Navigation />
            <main>{children}</main>
            <Footer />
            <Toaster />
          </WishlistProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
