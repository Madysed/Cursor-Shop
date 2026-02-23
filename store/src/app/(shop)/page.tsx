import Image from 'next/image'
import Link from 'next/link'
import { FiArrowRight, FiShoppingBag, FiTruck, FiRotateCcw, FiHeadphones, FiSearch } from 'react-icons/fi'
import prisma from '@/lib/prisma'
import ProductGrid from '@/components/products/ProductGrid'
import { Product, Category } from '@prisma/client'
import CategoryImageShowcase from '@/components/CategoryImageShowcase'
import HeroSearch from '@/components/HeroSearch'

// Define types with proper relationships
type ProductWithCategory = Product & {
  category: Category | null;
}

export default async function HomePage() {
  // Get latest products with error handling
  let latestProducts: ProductWithCategory[] = [];
  let categories: Category[] = [];
  
  try {
    // Get latest products
    latestProducts = await prisma.product.findMany({
      take: 8,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        category: true,
      },
    });

    // Get all categories for the category showcase
    categories = await prisma.category.findMany({
      orderBy: {
        name: 'asc',
      },
    });
  } catch (error) {
    console.error("Database connection error:", error);
    // Continue with empty arrays
  }

  return (
    <div className="pb-16">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-[#0f172a] to-[#1e3a8a] overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#f59e0b_1px,transparent_1px)] [background-size:20px_20px]"></div>
        {/* Gold accent line at top */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-[#f59e0b]"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32 relative z-10">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 text-center md:text-left">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
                Discover Amazing Products for Your Lifestyle
              </h1>
              <p className="mt-6 text-xl text-gray-300 max-w-xl">
                Shop the latest trends and find everything you need with our curated collection of high-quality products.
              </p>
              
              {/* Hero Search */}
              <div className="mt-8 max-w-md mx-auto md:mx-0">
                <HeroSearch />
              </div>
              
              <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                <Link
                  href="/products"
                  className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-[#0f172a] bg-[#f59e0b] hover:bg-[#f59e0b]/90 transition-colors"
                >
                  Shop Now
                  <FiArrowRight className="ml-2 h-5 w-5" />
                </Link>
                <Link
                  href="/categories"
                  className="inline-flex items-center justify-center px-6 py-3 border border-[#f59e0b] text-base font-medium rounded-md text-white hover:bg-white/10 transition-colors"
                >
                  Browse Categories
                </Link>
              </div>
            </div>
            <div className="mt-10 md:mt-0 md:w-1/2 flex justify-center">
              <div className="relative w-full max-w-md">
                <div className="absolute -inset-1 bg-[#f59e0b]/30 rounded-lg blur-xl"></div>
                <div className="relative bg-white/95 backdrop-blur-sm rounded-lg shadow-xl overflow-hidden border-2 border-[#f59e0b]">
                  {/* Category image showcase */}
                  <CategoryImageShowcase categories={categories} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 bg-gray-50 relative">
        {/* Gold accent lines */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#f59e0b] via-[#fcd34d] to-[#f59e0b]"></div>
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#f59e0b] via-[#fcd34d] to-[#f59e0b]"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="flex items-start p-6 bg-white rounded-xl shadow-sm border border-gray-100 hover:border-[#f59e0b] transition-colors">
              <div className="flex-shrink-0">
                <div className="p-3 bg-[#0f172a] rounded-lg">
                  <FiShoppingBag className="h-6 w-6 text-[#f59e0b]" />
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-[#0f172a]">Free Shipping</h3>
                <p className="mt-1 text-sm text-gray-500">On orders over $100</p>
              </div>
            </div>

            <div className="flex items-start p-6 bg-white rounded-xl shadow-sm border border-gray-100 hover:border-[#f59e0b] transition-colors">
              <div className="flex-shrink-0">
                <div className="p-3 bg-[#0f172a] rounded-lg">
                  <FiTruck className="h-6 w-6 text-[#f59e0b]" />
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-[#0f172a]">Fast Delivery</h3>
                <p className="mt-1 text-sm text-gray-500">Get your items quickly</p>
              </div>
            </div>

            <div className="flex items-start p-6 bg-white rounded-xl shadow-sm border border-gray-100 hover:border-[#f59e0b] transition-colors">
              <div className="flex-shrink-0">
                <div className="p-3 bg-[#0f172a] rounded-lg">
                  <FiRotateCcw className="h-6 w-6 text-[#f59e0b]" />
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-[#0f172a]">Easy Returns</h3>
                <p className="mt-1 text-sm text-gray-500">30 day return policy</p>
              </div>
            </div>

            <div className="flex items-start p-6 bg-white rounded-xl shadow-sm border border-gray-100 hover:border-[#f59e0b] transition-colors">
              <div className="flex-shrink-0">
                <div className="p-3 bg-[#0f172a] rounded-lg">
                  <FiHeadphones className="h-6 w-6 text-[#f59e0b]" />
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-[#0f172a]">24/7 Support</h3>
                <p className="mt-1 text-sm text-gray-500">Get help when you need it</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Latest Products Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-block">
              <h2 className="text-3xl font-bold text-[#0f172a]">Latest Products</h2>
              <div className="h-1 w-24 bg-[#f59e0b] mx-auto mt-2"></div>
            </div>
            <p className="mt-4 text-xl text-gray-600">Discover our newest arrivals</p>
          </div>
          
          {latestProducts.length > 0 ? (
            <ProductGrid products={latestProducts} />
          ) : (
            <div className="text-center py-10 bg-gray-50 rounded-lg">
              <p className="text-gray-600">Products will be available soon...</p>
            </div>
          )}
          
          <div className="mt-12 text-center">
            <Link
              href="/products"
              className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-[#0f172a] hover:bg-[#1e293b] transition-colors"
            >
              View All Products
              <FiArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>
      
      {/* Categories Showcase Section */}
      <section className="py-16 bg-gray-50 relative">
        {/* Gold accent lines */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#f59e0b] via-[#fcd34d] to-[#f59e0b]"></div>
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#f59e0b] via-[#fcd34d] to-[#f59e0b]"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-block">
              <h2 className="text-3xl font-bold text-[#0f172a]">Shop by Category</h2>
              <div className="h-1 w-24 bg-[#f59e0b] mx-auto mt-2"></div>
            </div>
            <p className="mt-4 text-xl text-gray-600">Find exactly what you&apos;re looking for</p>
          </div>

          {categories.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {categories.map((category) => (
                <Link 
                  key={category.id} 
                  href={`/categories/${category.id}`}
                  className="group relative overflow-hidden rounded-xl shadow-md transition-transform hover:scale-105 border-2 border-transparent hover:border-[#f59e0b]"
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a]/90 to-transparent z-10"></div>
                  {category.imageUrl ? (
                    <Image
                      src={category.imageUrl}
                      alt={category.name}
                      width={400}
                      height={300}
                      className="w-full h-64 object-cover transition-transform group-hover:scale-110"
                    />
                  ) : (
                    <div className="w-full h-64 bg-[#1e3a8a]/10 flex items-center justify-center">
                      <span className="text-[#1e3a8a] text-lg">No image</span>
                    </div>
                  )}
                  <div className="absolute bottom-0 left-0 right-0 p-6 z-20">
                    <h3 className="text-2xl font-bold text-white">{category.name}</h3>
                    <p className="mt-2 text-[#f59e0b] flex items-center font-medium">
                      Shop now <FiArrowRight className="ml-2 h-4 w-4" />
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 bg-white rounded-lg">
              <p className="text-gray-600">Categories will be available soon...</p>
            </div>
          )}

          <div className="mt-12 text-center">
            <Link
              href="/categories"
              className="inline-flex items-center justify-center px-6 py-3 border border-[#0f172a] text-base font-medium rounded-md text-[#0f172a] hover:bg-[#0f172a] hover:text-white transition-colors"
            >
              View All Categories
              <FiArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>
      
      {/* Call to Action */}
      <section className="bg-[#0f172a] py-16 relative">
        {/* Gold accent line at top */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-[#f59e0b]"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white">Ready to Transform Your Shopping Experience?</h2>
          <p className="mt-4 text-xl text-gray-300 max-w-2xl mx-auto">
            Join thousands of satisfied customers who have discovered their favorite products with us.
          </p>
          <div className="mt-8">
            <Link
              href="/products"
              className="inline-flex items-center justify-center px-8 py-4 border border-transparent text-base font-medium rounded-md text-[#0f172a] bg-[#f59e0b] hover:bg-[#f59e0b]/90 transition-colors shadow-lg"
            >
              Start Shopping Now
              <FiArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
} 