'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Product, Category } from '@prisma/client';

interface ProductWithCategory {
  id: string
  name: string
  description: string
  price: number
  categoryId: string
  category: Category | null
  images: string[]
}

export default function CategoryPage() {
  const params = useParams();
  const router = useRouter();
  const [category, setCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<ProductWithCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategoryAndProducts = async () => {
      try {
        const [categoryRes, productsRes] = await Promise.all([
          fetch(`/api/categories/${params.id}`),
          fetch(`/api/categories/${params.id}/products`)
        ]);

        if (!categoryRes.ok || !productsRes.ok) {
          if (categoryRes.status === 404) {
            throw new Error('Category not found');
          }
          throw new Error('Failed to fetch data');
        }

        const [categoryData, productsData] = await Promise.all([
          categoryRes.json(),
          productsRes.json()
        ]);

        setCategory(categoryData);
        setProducts(productsData);
      } catch (err) {
        console.error('Error:', err);
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchCategoryAndProducts();
    }
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen gap-4">
        <div className="text-red-600">{error}</div>
        <button
          onClick={() => router.back()}
          className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
        >
          Go Back
        </button>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen gap-4">
        <div className="text-gray-600">Category not found</div>
        <button
          onClick={() => router.back()}
          className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <button
        onClick={() => router.back()}
        className="mb-6 text-indigo-600 hover:text-indigo-700 font-medium"
      >
        ← Back
      </button>
      <h1 className="text-3xl font-bold mb-8">{category.name}</h1>
      {products.length === 0 ? (
        <p className="text-gray-500">No products available in this category</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product) => (
            <Link
              key={product.id}
              href={`/products/${product.id}`}
              className="group relative bg-white rounded-xl shadow-lg overflow-hidden transform transition duration-300 hover:scale-105 hover:shadow-xl"
            >
              <div className="relative w-full pt-[75%]">
                {product.images && product.images[0] ? (
                  <Image
                    src={product.images[0]}
                    alt={product.name}
                    fill
                    className="absolute top-0 left-0 w-full h-full object-cover object-center transition duration-300 group-hover:opacity-90"
                  />
                ) : (
                  <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
                    <span className="text-gray-400">No image</span>
                  </div>
                )}
                {/* Price Badge */}
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full shadow-md">
                  <p className="text-sm font-semibold text-indigo-600">
                    ${product.price.toFixed(2)}
                  </p>
                </div>
              </div>
              
              <div className="p-6">
                <div className="flex flex-col h-full">
                  {product.category?.name && (
                    <span className="text-xs font-medium text-indigo-500 uppercase tracking-wider mb-2">
                      {product.category.name}
                    </span>
                  )}
                  <h3 className="text-lg font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
                    {product.name}
                  </h3>
                  <p className="mt-2 text-sm text-gray-500 line-clamp-2">
                    {product.description}
                  </p>
                  
                  <div className="mt-4 flex items-center justify-between">
                    <span className="inline-flex items-center px-3 py-1 text-xs font-medium bg-indigo-100 text-indigo-800 rounded-full">
                      View Details
                    </span>
                    <button 
                      className="text-sm font-medium text-white bg-indigo-600 px-4 py-2 rounded-full hover:bg-indigo-700 transition-colors"
                      onClick={(e) => {
                        e.preventDefault()
                        // TODO: Implement add to cart functionality
                      }}
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
} 