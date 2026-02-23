import Link from 'next/link'
import { FiGithub, FiTwitter, FiInstagram, FiLinkedin, FiMail, FiPhone, FiHeart } from 'react-icons/fi'

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* First Column - About */}
          <div>
            <h3 className="text-lg font-bold mb-4">CursorShop</h3>
            <p className="text-gray-400 mb-4">
              Your favorite online shop for finding the best products with an incredible shopping experience.
            </p>
            <div className="flex space-x-4">
              <a 
                href="https://github.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="GitHub"
              >
                <FiGithub className="h-5 w-5" />
              </a>
              <a 
                href="https://twitter.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="Twitter"
              >
                <FiTwitter className="h-5 w-5" />
              </a>
              <a 
                href="https://instagram.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="Instagram"
              >
                <FiInstagram className="h-5 w-5" />
              </a>
              <a 
                href="https://linkedin.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="LinkedIn"
              >
                <FiLinkedin className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Second Column - Shop */}
          <div>
            <h3 className="text-lg font-bold mb-4">Shop</h3>
            <ul className="space-y-2">
              <li>
                <Link 
                  href="/products" 
                  className="text-gray-400 hover:text-white transition-colors hover:underline"
                >
                  All Products
                </Link>
              </li>
              <li>
                <Link 
                  href="/categories" 
                  className="text-gray-400 hover:text-white transition-colors hover:underline"
                >
                  Categories
                </Link>
              </li>
              <li>
                <Link 
                  href="/products?sort=newest" 
                  className="text-gray-400 hover:text-white transition-colors hover:underline"
                >
                  New Arrivals
                </Link>
              </li>
              <li>
                <Link 
                  href="/products?sort=featured" 
                  className="text-gray-400 hover:text-white transition-colors hover:underline"
                >
                  Featured Products
                </Link>
              </li>
              <li>
                <Link 
                  href="/products?sort=bestselling" 
                  className="text-gray-400 hover:text-white transition-colors hover:underline"
                >
                  Best Sellers
                </Link>
              </li>
            </ul>
          </div>

          {/* Third Column - Account */}
          <div>
            <h3 className="text-lg font-bold mb-4">Your Account</h3>
            <ul className="space-y-2">
              <li>
                <Link 
                  href="/profile" 
                  className="text-gray-400 hover:text-white transition-colors hover:underline"
                >
                  Profile
                </Link>
              </li>
              <li>
                <Link 
                  href="/orders" 
                  className="text-gray-400 hover:text-white transition-colors hover:underline"
                >
                  Orders
                </Link>
              </li>
              <li>
                <Link 
                  href="/cart" 
                  className="text-gray-400 hover:text-white transition-colors hover:underline"
                >
                  Shopping Cart
                </Link>
              </li>
              <li>
                <Link 
                  href="/wishlist" 
                  className="text-gray-400 hover:text-white transition-colors hover:underline"
                >
                  Wishlist
                </Link>
              </li>
            </ul>
          </div>

          {/* Fourth Column - Contact */}
          <div>
            <h3 className="text-lg font-bold mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <FiMail className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                <span className="text-gray-400">support@cursorshop.com</span>
              </li>
              <li className="flex items-start">
                <FiPhone className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                <span className="text-gray-400">+1 (234) 567-8901</span>
              </li>
            </ul>
            <div className="mt-4">
              <h4 className="text-sm font-semibold mb-2 text-gray-300">Subscribe to our newsletter</h4>
              <form className="flex">
                <input 
                  type="email" 
                  placeholder="Your email" 
                  aria-label="Email address"
                  className="px-4 py-2 rounded-l-md bg-gray-800 text-white border-gray-700 border focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 w-full text-sm"
                />
                <button 
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-r-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition-colors"
                >
                  Subscribe
                </button>
              </form>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-800 flex flex-col items-center">
          <p className="text-gray-400 text-sm text-center">
            &copy; {year} CursorShop. All rights reserved.
          </p>
          <div className="mt-4">
            <ul className="flex space-x-6 text-sm text-gray-400">
              <li>
                <Link href="/terms" className="hover:text-white transition-colors hover:underline">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-white transition-colors hover:underline">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-white transition-colors hover:underline">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>
          <div className="mt-4 text-gray-500 text-xs flex items-center">
            <span>Made with</span>
            <FiHeart className="mx-1 text-red-500" />
            <span>using Next.js and Tailwind CSS</span>
          </div>
        </div>
      </div>
    </footer>
  )
} 