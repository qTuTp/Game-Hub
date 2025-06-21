import Link from "next/link"
import { Gamepad2, Github, Twitter, DiscIcon as Discord } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-slate-900 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="flex items-center space-x-2 mb-4">
              <Gamepad2 className="h-8 w-8 text-purple-400" />
              <span className="text-xl font-bold text-white">GameHub</span>
            </Link>
            <p className="text-gray-400 mb-4 max-w-md">
              Your ultimate destination for game news, reviews, deals, and comprehensive game information. Stay updated
              with the latest in gaming.
            </p>
            <div className="flex space-x-4">
              <Link href="#" className="text-gray-400 hover:text-purple-400 transition-colors">
                <Twitter className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-gray-400 hover:text-purple-400 transition-colors">
                <Discord className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-gray-400 hover:text-purple-400 transition-colors">
                <Github className="h-5 w-5" />
              </Link>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/games" className="text-gray-400 hover:text-purple-400 transition-colors">
                  Browse Games
                </Link>
              </li>
              <li>
                <Link href="/deals" className="text-gray-400 hover:text-purple-400 transition-colors">
                  Latest Deals
                </Link>
              </li>
              <li>
                <Link href="/reviews" className="text-gray-400 hover:text-purple-400 transition-colors">
                  Game Reviews
                </Link>
              </li>
              <li>
                <Link href="/news" className="text-gray-400 hover:text-purple-400 transition-colors">
                  Gaming News
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-white font-semibold mb-4">Support</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="text-gray-400 hover:text-purple-400 transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-400 hover:text-purple-400 transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-gray-400 hover:text-purple-400 transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-gray-400 hover:text-purple-400 transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-8 pt-8 text-center">
          <div className="bg-slate-800/50 rounded-lg p-4 mb-4">
            <p className="text-sm text-gray-400">
              <strong className="text-purple-400">Disclaimer:</strong> GameHub is an information platform that helps you
              discover games and find the best deals. We redirect you to official stores for purchases. We are not
              responsible for transactions made on external platforms.
            </p>
          </div>
          <p className="text-gray-400">© {new Date().getFullYear()} GameHub. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
