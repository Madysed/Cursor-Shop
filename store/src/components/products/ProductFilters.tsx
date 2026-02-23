'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { SafeCategory } from '@/types'
import { useState, useEffect, Suspense } from 'react'

interface ProductFiltersProps {
  categories: SafeCategory[]
}

function ProductFiltersComponent({ categories }: ProductFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [priceRange, setPriceRange] = useState({
    min: searchParams.get('minPrice') || '',
    max: searchParams.get('maxPrice') || '',
  })
  const [selectedCategory, setSelectedCategory] = useState(
    searchParams.get('category') || ''
  )

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString())
    
    if (selectedCategory) {
      params.set('category', selectedCategory)
    } else {
      params.delete('category')
    }

    if (priceRange.min) {
      params.set('minPrice', priceRange.min)
    } else {
      params.delete('minPrice')
    }

    if (priceRange.max) {
      params.set('maxPrice', priceRange.max)
    } else {
      params.delete('maxPrice')
    }

    router.push(`/products?${params.toString()}`)
  }, [selectedCategory, priceRange, router, searchParams])

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-lg font-medium text-gray-900 mb-4">Filters</h2>
      
      {/* Categories */}
      <div className="mb-6">
        <h3 className="text-sm font-medium text-gray-900 mb-2">Categories</h3>
        <div className="space-y-2">
          <label className="flex items-center">
            <input
              type="radio"
              name="category"
              value=""
              checked={selectedCategory === ''}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
            />
            <span className="ml-2 text-sm text-gray-700">All Categories</span>
          </label>
          {categories.map((category) => (
            <label key={category.id} className="flex items-center">
              <input
                type="radio"
                name="category"
                value={category.id}
                checked={selectedCategory === category.id}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
              />
              <span className="ml-2 text-sm text-gray-700">{category.name}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <h3 className="text-sm font-medium text-gray-900 mb-2">Price Range</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="min-price"
              className="block text-sm font-medium text-gray-700"
            >
              Min
            </label>
            <input
              type="number"
              name="min-price"
              id="min-price"
              value={priceRange.min}
              onChange={(e) =>
                setPriceRange({ ...priceRange, min: e.target.value })
              }
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              placeholder="0"
            />
          </div>
          <div>
            <label
              htmlFor="max-price"
              className="block text-sm font-medium text-gray-700"
            >
              Max
            </label>
            <input
              type="number"
              name="max-price"
              id="max-price"
              value={priceRange.max}
              onChange={(e) =>
                setPriceRange({ ...priceRange, max: e.target.value })
              }
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              placeholder="1000"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

function ProductFiltersFallback() {
  return (
    <div className="bg-white p-6 rounded-lg shadow animate-pulse">
      <div className="h-5 bg-gray-200 rounded w-1/3 mb-4"></div>
      
      {/* Categories placeholder */}
      <div className="mb-6">
        <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center">
              <div className="h-4 w-4 bg-gray-200 rounded-full"></div>
              <div className="ml-2 h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      </div>

      {/* Price Range placeholder */}
      <div>
        <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-1"></div>
            <div className="h-8 bg-gray-200 rounded w-full"></div>
          </div>
          <div>
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-1"></div>
            <div className="h-8 bg-gray-200 rounded w-full"></div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ProductFilters(props: ProductFiltersProps) {
  return (
    <Suspense fallback={<ProductFiltersFallback />}>
      <ProductFiltersComponent {...props} />
    </Suspense>
  )
} 