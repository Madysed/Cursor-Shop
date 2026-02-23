import { Suspense } from 'react';
import { FiGrid, FiPackage, FiSearch } from 'react-icons/fi';
import prisma from '@/lib/prisma';
import { Product, Category } from '@prisma/client';
import ProductGrid from '@/components/products/ProductGrid';
import Link from 'next/link';
import Image from 'next/image';
import HeroSearch from '@/components/HeroSearch';

interface SearchParams {
  q?: string;
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const query = searchParams.q || '';
  
  if (!query.trim()) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-[#0f172a] rounded-xl shadow-xl py-16 px-6 text-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#f59e0b_1px,transparent_1px)] [background-size:20px_20px]"></div>
          <h1 className="text-4xl font-bold text-white mb-6">Search Our Store</h1>
          <p className="text-lg text-gray-300 max-w-xl mx-auto mb-8">
            Discover thousands of products in our store catalog
          </p>
          <div className="max-w-lg mx-auto">
            <HeroSearch />
          </div>
        </div>
      </div>
    );
  }

  // Fetch search results based on the query
  let products: Product[] = [];
  let categories: Category[] = [];

  try {
    products = await prisma.product.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } }
        ]
      },
      include: {
        category: true
      },
      take: 20,
    });

    categories = await prisma.category.findMany({
      where: {
        name: { contains: query, mode: 'insensitive' }
      },
      take: 10,
    });
  } catch (error) {
    console.error('Search error:', error);
  }

  const hasResults = products.length > 0 || categories.length > 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="bg-[#0f172a] rounded-xl shadow-lg py-8 px-6 mb-10 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#f59e0b_1px,transparent_1px)] [background-size:20px_20px]"></div>
        <div className="relative z-10">
          <h1 className="text-3xl font-bold text-white mb-4">
            Search Results for: <span className="text-[#f59e0b]">{query}</span>
          </h1>
          <div className="max-w-xl">
            <HeroSearch />
          </div>
        </div>
      </div>
      
      {!hasResults ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <FiSearch className="w-16 h-16 text-[#f59e0b] mb-6" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            No Results Found
          </h2>
          <p className="text-lg text-gray-600 max-w-lg">
            We couldn&apos;t find any products or categories matching your search. Please try different keywords.
          </p>
        </div>
      ) : (
        <div className="space-y-16">
          {/* Categories Section */}
          {categories.length > 0 && (
            <div>
              <div className="flex items-center mb-6">
                <FiGrid className="h-6 w-6 text-[#f59e0b] mr-2" />
                <h2 className="text-2xl font-bold text-gray-800">Categories</h2>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {categories.map((category) => (
                  <Link
                    key={category.id}
                    href={`/categories/${category.id}`}
                    className="group bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="aspect-w-16 aspect-h-9 bg-gray-100 relative h-40">
                      {category.imageUrl ? (
                        <Image
                          src={category.imageUrl}
                          alt={category.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                          <FiGrid className="h-10 w-10 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-medium text-lg text-gray-900">{category.name}</h3>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Products Section */}
          {products.length > 0 && (
            <div>
              <div className="flex items-center mb-6">
                <FiPackage className="h-6 w-6 text-[#f59e0b] mr-2" />
                <h2 className="text-2xl font-bold text-gray-800">Products</h2>
              </div>
              
              <Suspense fallback={<div className="py-20 text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#f59e0b]"></div>
                <p className="mt-3 text-gray-500">Loading products...</p>
              </div>}>
                <ProductGrid products={products} />
              </Suspense>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 