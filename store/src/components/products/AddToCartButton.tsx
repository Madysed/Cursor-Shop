'use client'

import { useCart } from '@/hooks/useCart'
import { useState } from 'react'
import { toast } from 'react-hot-toast'
import { FiShoppingCart, FiCheck } from 'react-icons/fi'
import Image from 'next/image'

interface AddToCartButtonProps {
  product: {
    id: string
    name: string
    price: number
    images: any[] // Support both string[] and object[] with url property
    stock?: number // Add stock property
  }
  showProductInfo?: boolean
}

export default function AddToCartButton({ product, showProductInfo = false }: AddToCartButtonProps) {
  const { addToCart } = useCart()
  const [isLoading, setIsLoading] = useState(false)
  const [isAdded, setIsAdded] = useState(false)
  const isOutOfStock = product.stock !== undefined && product.stock <= 0

  const getImageUrl = () => {
    if (!product.images || product.images.length === 0) return null
    return typeof product.images[0] === 'string' 
      ? product.images[0] 
      : product.images[0].url
  }

  const handleAddToCart = async () => {
    if (isAdded) return
    
    try {
      setIsLoading(true)
      await addToCart(product.id)
      
      // Show success animation
      setIsAdded(true)
      setTimeout(() => setIsAdded(false), 2000)
      
      toast.success(`${product.name} added to cart`, {
        style: {
          borderRadius: '0.5rem',
          background: '#0f172a',
          color: '#fff',
        },
        iconTheme: {
          primary: '#3b82f6',
          secondary: '#fff',
        },
      })
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to add to cart')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={showProductInfo ? "flex flex-col space-y-3" : ""}>
      {showProductInfo && (
        <div className="flex space-x-3 items-center">
          {getImageUrl() && (
            <div className="relative w-12 h-12 rounded overflow-hidden bg-gray-100">
              <Image 
                src={getImageUrl() as string}
                alt={product.name}
                fill
                className="object-cover"
              />
            </div>
          )}
          <div>
            <h3 className="font-medium text-white">{product.name}</h3>
            <p className="font-bold text-blue-400">${product.price.toFixed(2)}</p>
            {isOutOfStock && <p className="text-xs text-red-500">Out of stock</p>}
          </div>
        </div>
      )}
      
      <button
        onClick={handleAddToCart}
        disabled={isLoading || isAdded || isOutOfStock}
        className={`w-full relative inline-flex items-center justify-center px-4 py-2 rounded-lg font-medium transition-all duration-200
        focus:outline-none focus:ring-2 focus:ring-offset-2 
        ${isAdded ? 'bg-blue-700 text-white focus:ring-blue-700' : 
          isOutOfStock ? 'bg-gray-300 text-gray-500 cursor-not-allowed' :
          'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500'} 
        overflow-hidden`}
      >
        <span className={`flex items-center justify-center space-x-2 ${isAdded ? 'opacity-0' : 'opacity-100'} transition-opacity duration-200`}>
          <FiShoppingCart className="w-4 h-4" />
          <span>{isLoading ? 'Adding...' : isOutOfStock ? 'Out of Stock' : 'Add to Cart'}</span>
        </span>
        
        {isAdded && (
          <span className="absolute inset-0 flex items-center justify-center space-x-2 animate-[fadeIn_0.5s_ease-in-out]">
            <FiCheck className="w-4 h-4" />
            <span>Added!</span>
          </span>
        )}
      </button>
    </div>
  )
} 