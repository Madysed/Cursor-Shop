'use client'

import Link from 'next/link'
import Image from 'next/image'
import { SafeProduct } from '@/types'
import AddToCartButton from './AddToCartButton'
import { Product, Category } from '@prisma/client'
import ProductCard from './ProductCard'

interface ProductGridProps {
  products: (Product & {
    category?: Category | null;
    images: any[];
  })[]
}

export default function ProductGrid({ products }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900">No products found</h3>
        <p className="mt-2 text-sm text-gray-500">
          Try adjusting your search or filter criteria
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
} 