"use client"

import Link from "next/link"
import { Gamepad2, Search, Heart, User, LogOut } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useWishlist } from "@/contexts/wishlist-context"
import { useAuth } from "@/contexts/auth-context"
import { useState, useRef, useEffect } from "react"

export function Navigation() {
  const { wishlist } = useWishlist()
  const { user, logout, isLoading } = useAuth()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const navItems = [
    { href: "/", label: "Home" },
    { href: "/games", label: "Games" },
    { href: "/news", label: "News" },
    { href: "/deals", label: "Deals" },
    { href: "/reviews", label: "Reviews" },
  ]

  const handleLogout = () => {
    logout()
    setIsDropdownOpen(false)
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  return (
    <nav className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <Gamepad2 className="h-8 w-8 text-purple-400" />
            <span className="text-xl font-bold text-white">GameHub</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href} className="text-gray-300 hover:text-purple-400 transition-colors">
                {item.label}
              </Link>
            ))}
            <Link
              href="/wishlist"
              className="flex items-center space-x-1 text-gray-300 hover:text-red-400 transition-colors"
            >
              <Heart className="h-4 w-4" />
              <span>Favourites</span>
              {wishlist.length > 0 && (
                <span className="bg-red-600 text-white text-xs rounded-full px-2 py-1 ml-1">{wishlist.length}</span>
              )}
            </Link>
          </div>

          {/* Search and User Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search games..."
                className="pl-10 w-64 bg-slate-800 border-slate-700 text-white placeholder-gray-400"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    const searchTerm = e.currentTarget.value
                    if (searchTerm.trim()) {
                      window.location.href = `/games?search=${encodeURIComponent(searchTerm.trim())}`
                    }
                  }
                }}
              />
            </div>

            {/* User Authentication */}
            {!isLoading && (
              <>
                {user ? (
                  <div className="relative" ref={dropdownRef}>
                    <Button
                      variant="ghost"
                      className="flex items-center space-x-2 text-gray-300 hover:text-white"
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    >
                      <User className="h-4 w-4" />
                      <span>{user.name}</span>
                    </Button>

                    {/* Custom Dropdown Menu */}
                    {isDropdownOpen && (
                      <div className="absolute right-0 mt-2 w-48 bg-slate-800 border border-slate-700 rounded-md shadow-lg z-[9999]">
                        <div className="py-1">
                          <Link
                            href="/profile"
                            className="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-slate-700 hover:text-white"
                            onClick={() => setIsDropdownOpen(false)}
                          >
                            <User className="mr-2 h-4 w-4" />
                            Profile
                          </Link>
                          <hr className="border-slate-700" />
                          <button
                            onClick={handleLogout}
                            className="flex items-center w-full px-4 py-2 text-sm text-red-400 hover:bg-red-900/20 hover:text-red-300"
                          >
                            <LogOut className="mr-2 h-4 w-4" />
                            Sign Out
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Link href="/login">
                      <Button variant="ghost" className="text-gray-300 hover:text-white">
                        Sign In
                      </Button>
                    </Link>
                    <Link href="/signup">
                      <Button className="bg-purple-600 hover:bg-purple-700">Sign Up</Button>
                    </Link>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
