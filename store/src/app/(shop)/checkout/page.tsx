'use client'

import { useRouter } from 'next/navigation'
import { useCart } from '@/hooks/useCart'
import { useState, useEffect } from 'react'
import { formatPrice } from '@/lib/utils'
import Image from 'next/image'
import { toast } from 'react-hot-toast'

export const dynamic = 'force-dynamic'

interface CheckoutItem {
  id: string
  quantity: number
  product: {
    id: string
    name: string
    price: number
    images: string[]
  }
}

export default function CheckoutPage() {
  const router = useRouter()
  const { items, clearCart } = useCart()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const total = items.reduce(
    (acc, item) => acc + item.product.price * item.quantity,
    0
  )

  // Ensure the total is a valid number and not too large
  const validTotal = !isNaN(total) && isFinite(total) && total > 0 && total < 1000000 
    ? total 
    : 0;

  if (!mounted) {
    return null
  }

  if (items.length === 0) {
    router.push('/cart')
    return null
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Validate total amount
    if (validTotal <= 0) {
      setError('Invalid order total. Please try again or contact support.')
      setLoading(false)
      return
    }

    try {
      const formData = new FormData(e.currentTarget)
      const shippingAddress = [
        formData.get('name'),
        formData.get('email'),
        formData.get('address'),
        formData.get('city'),
        formData.get('country'),
        formData.get('postalCode'),
      ]
        .filter(Boolean)
        .join('\n')

      // Validate shipping address
      if (!shippingAddress || shippingAddress.trim().length < 10) {
        throw new Error('Please provide complete shipping information')
      }

      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: items.map((item) => ({
            productId: item.product.id,
            quantity: item.quantity,
            price: item.product.price,
          })),
          shippingAddress,
        }),
      })

      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || 'Something went wrong during checkout')
      }

      const { orderId } = data
      
      if (!orderId) {
        throw new Error('Order was created but no order ID was returned')
      }
      
      clearCart()
      toast.success('Order placed successfully!')
      router.push(`/account/orders/${orderId}`)
    } catch (error) {
      console.error('Checkout error:', error)
      setError(error instanceof Error ? error.message : 'Something went wrong during checkout. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-8">Checkout</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-lg font-medium mb-4">Shipping Information</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700"
                >
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700"
                >
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>

              <div>
                <label
                  htmlFor="address"
                  className="block text-sm font-medium text-gray-700"
                >
                  Address
                </label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="city"
                    className="block text-sm font-medium text-gray-700"
                  >
                    City
                  </label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label
                    htmlFor="country"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Country
                  </label>
                  <input
                    type="text"
                    id="country"
                    name="country"
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="postalCode"
                  className="block text-sm font-medium text-gray-700"
                >
                  Postal Code
                </label>
                <input
                  type="text"
                  id="postalCode"
                  name="postalCode"
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
                  <div className="flex">
                    <div className="text-red-600 text-sm">{error}</div>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading || validTotal <= 0}
                className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
              >
                {loading ? 'Processing...' : `Pay ${formatPrice(validTotal)}`}
              </button>
            </form>
          </div>

          <div>
            <h2 className="text-lg font-medium mb-4">Order Summary</h2>
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="flow-root">
                <ul className="-my-6 divide-y divide-gray-200">
                  {items.map((item) => (
                    <li key={item.id} className="py-6 flex">
                      <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                        <Image
                          src={typeof item.product.images[0] === 'string' ? item.product.images[0] : '/placeholder.jpg'}
                          alt={item.product.name}
                          width={96}
                          height={96}
                          className="h-full w-full object-cover object-center"
                        />
                      </div>

                      <div className="ml-4 flex flex-1 flex-col">
                        <div>
                          <div className="flex justify-between text-base font-medium text-gray-900">
                            <h3>{item.product.name}</h3>
                            <p className="ml-4">
                              {formatPrice(item.product.price * item.quantity)}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-1 items-end justify-between text-sm">
                          <p className="text-gray-500">Qty {item.quantity}</p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="border-t border-gray-200 pt-4 mt-6">
                <div className="flex justify-between text-base font-medium text-gray-900">
                  <p>Total</p>
                  <p>{formatPrice(total)}</p>
                </div>
                <p className="mt-0.5 text-sm text-gray-500">
                  Shipping will be calculated at the next step
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 