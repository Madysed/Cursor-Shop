'use client'

import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { useCart } from '@/hooks/useCart'
import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import SignOutButton from './SignOutButton'

export function Header() {
  const { data: session } = useSession()
  const { items, fetchCart } = useCart()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    if (session?.user) {
      fetchCart()
    }
  }, [session, fetchCart])

  const cartItemsCount = items.reduce((acc, item) => acc + item.quantity, 0)

  const isActive = (path: string) => {
    if (path === '/') {
      return pathname === path
    }
    return pathname?.startsWith(path)
  }

  const getLinkClasses = (path: string) => {
    const baseClasses = "relative py-2"
    const textClasses = isActive(path) 
      ? "text-indigo-600 font-medium"
      : "text-gray-600 hover:text-gray-900"
    return `${baseClasses} ${textClasses}`
  }

  const getIndicatorClasses = (path: string) => {
    return isActive(path)
      ? "absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600 transform scale-x-100 transition-transform duration-300"
      : "absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600 transform scale-x-0 transition-transform duration-300 group-hover:scale-x-100"
  }

  return (
    <header className="bg-white shadow">
      <nav className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className={getLinkClasses('/')}>
            <span className="text-xl font-bold">Cursor Shop</span>
            <div className={getIndicatorClasses('/')} />
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            <Link
              href="/products"
              className={`group ${getLinkClasses('/products')}`}
            >
              <span>Products</span>
              <div className={getIndicatorClasses('/products')} />
            </Link>
            <Link
              href="/categories"
              className={`group ${getLinkClasses('/categories')}`}
            >
              <span>Categories</span>
              <div className={getIndicatorClasses('/categories')} />
            </Link>
            {session?.user && (
              <>
                <Link
                  href="/cart"
                  className={`group ${getLinkClasses('/cart')} relative`}
                >
                  <span>Cart</span>
                  <div className={getIndicatorClasses('/cart')} />
                  {cartItemsCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-indigo-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {cartItemsCount}
                    </span>
                  )}
                </Link>
                <Link
                  href="/orders"
                  className={`group ${getLinkClasses('/orders')}`}
                >
                  <span>Orders</span>
                  <div className={getIndicatorClasses('/orders')} />
                </Link>
              </>
            )}
          </div>

          <div className="hidden md:flex items-center space-x-4">
            {session?.user ? (
              <div className="relative">
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
                >
                  <span>{session.user.name || session.user.email}</span>
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {isMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1">
                    <SignOutButton />
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link
                  href="/login"
                  className={`group ${getLinkClasses('/login')}`}
                >
                  <span>Sign in</span>
                  <div className={getIndicatorClasses('/login')} />
                </Link>
                <Link
                  href="/register"
                  className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
                >
                  Sign up
                </Link>
              </>
            )}
          </div>

          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <Link
                href="/products"
                className={`block px-3 py-2 ${isActive('/products') ? 'text-indigo-600 font-medium' : 'text-gray-600 hover:text-gray-900'}`}
              >
                Products
              </Link>
              <Link
                href="/categories"
                className={`block px-3 py-2 ${isActive('/categories') ? 'text-indigo-600 font-medium' : 'text-gray-600 hover:text-gray-900'}`}
              >
                Categories
              </Link>
              {session?.user && (
                <>
                  <Link
                    href="/cart"
                    className={`block px-3 py-2 ${isActive('/cart') ? 'text-indigo-600 font-medium' : 'text-gray-600 hover:text-gray-900'}`}
                  >
                    Cart
                  </Link>
                  <Link
                    href="/orders"
                    className={`block px-3 py-2 ${isActive('/orders') ? 'text-indigo-600 font-medium' : 'text-gray-600 hover:text-gray-900'}`}
                  >
                    Orders
                  </Link>
                </>
              )}
              {session?.user ? (
                <SignOutButton />
              ) : (
                <>
                  <Link
                    href="/login"
                    className={`block px-3 py-2 ${isActive('/login') ? 'text-indigo-600 font-medium' : 'text-gray-600 hover:text-gray-900'}`}
                  >
                    Sign in
                  </Link>
                  <Link
                    href="/register"
                    className={`block px-3 py-2 ${isActive('/register') ? 'text-indigo-600 font-medium' : 'text-gray-600 hover:text-gray-900'}`}
                  >
                    Sign up
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  )
} 