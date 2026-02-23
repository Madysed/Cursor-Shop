'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image'
import { notFound } from 'next/navigation'
import prisma from '@/lib/prisma'
import AddToCartButton from '@/components/products/AddToCartButton'

interface ProductPageProps {
  params: {
    id: string
  }
}

// تابع کمکی برای استخراج URL تصویر
const getImageUrl = (image: any): string => {
  if (typeof image === 'string') {
    return image;
  } else if (image && typeof image === 'object') {
    return image.url || image.imageUrl || '';
  }
  return '';
};

export default function ProductPage({ params }: ProductPageProps) {
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const fetchProduct = useCallback(async () => {
    try {
      const response = await fetch(`/api/products/${params.id}`);
      if (!response.ok) {
        throw new Error('Product not found');
      }
      const data = await response.json();
      setProduct(data);
    } catch (error) {
      console.error('Error fetching product:', error);
      notFound();
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  if (loading || !product) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white">
      <div className="max-w-2xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:max-w-7xl lg:px-8">
        <div className="lg:grid lg:grid-cols-2 lg:gap-x-8 lg:items-start">
          {/* Image gallery */}
          <div className="flex flex-col space-y-4">
            {/* Main image */}
            <div className="relative aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-lg bg-gray-100">
              <Image
                src={product.images && product.images.length > 0 
                  ? getImageUrl(product.images[selectedImageIndex]) 
                  : '/placeholder.jpg'}
                alt={`${product.name} - Image ${selectedImageIndex + 1}`}
                width={500}
                height={500}
                className="w-full h-full object-center object-cover rounded-lg transition-all duration-300"
              />
              
              {/* Navigation arrows */}
              {product.images.length > 1 && (
                <>
                  <button
                    onClick={() => setSelectedImageIndex((prev) => (prev === 0 ? product.images.length - 1 : prev - 1))}
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 transition-all duration-200 shadow-lg"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setSelectedImageIndex((prev) => (prev === product.images.length - 1 ? 0 : prev + 1))}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 transition-all duration-200 shadow-lg"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                    </svg>
                  </button>
                </>
              )}

              {/* Image counter */}
              {product.images.length > 1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                  {selectedImageIndex + 1} / {product.images.length}
                </div>
              )}
            </div>

            {/* Thumbnail strip */}
            {product.images.length > 1 && (
              <div className="flex space-x-2 overflow-x-auto pb-2 px-1">
                {product.images.map((image: any, index: number) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`relative flex-shrink-0 w-20 h-20 rounded-md overflow-hidden transition-all duration-200 ${
                      selectedImageIndex === index
                        ? 'ring-2 ring-indigo-500 ring-offset-2'
                        : 'opacity-70 hover:opacity-100'
                    }`}
                  >
                    <Image
                      src={getImageUrl(image)}
                      alt={`${product.name} thumbnail ${index + 1}`}
                      fill
                      className="object-cover object-center"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product info */}
          <div className="mt-10 px-4 sm:px-0 sm:mt-16 lg:mt-0">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              {product.name}
            </h1>

            <div className="mt-3">
              <h2 className="sr-only">Product information</h2>
              <p className="text-3xl tracking-tight text-gray-900">
                ${product.price.toFixed(2)}
              </p>
            </div>

            <div className="mt-6">
              <h3 className="sr-only">Description</h3>
              <div
                className="space-y-6 text-base text-gray-700"
                dangerouslySetInnerHTML={{ __html: product.description }}
              />
            </div>

            <div className="mt-8">
              {product.stock <= 0 ? (
                <div>
                  <p className="text-red-600 font-medium mb-2">Out of Stock</p>
                  <button
                    type="button"
                    className="flex w-full items-center justify-center rounded-md border border-transparent bg-gray-300 px-8 py-3 text-base font-medium text-gray-500 cursor-not-allowed"
                    disabled
                  >
                    Sold Out
                  </button>
                </div>
              ) : (
                <AddToCartButton 
                  product={{
                    id: product.id,
                    name: product.name,
                    price: product.price,
                    images: product.images.map((img: any) => getImageUrl(img)).filter(Boolean)
                  }} 
                />
              )}
            </div>

            {/* Additional details */}
            <div className="mt-8 border-t border-gray-200 pt-8">
              <h2 className="text-sm font-medium text-gray-900">
                Additional Details
              </h2>
              <div className="mt-4 space-y-6">
                <p className="text-sm text-gray-600">
                  Category: {product.category?.name || 'Uncategorized'}
                </p>
                <p className="text-sm text-gray-600">
                  Stock: {product.stock} units available
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 