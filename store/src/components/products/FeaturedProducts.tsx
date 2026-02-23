'use client';

import { useState } from 'react';
import { Product, Category } from '@prisma/client';
import ProductCard from './ProductCard';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

interface FeaturedProductsProps {
  products: (Product & {
    category?: Category | null;
    images: any[];
  })[];
}

export default function FeaturedProducts({ products }: FeaturedProductsProps) {
  const [startIndex, setStartIndex] = useState(0);
  const productsPerPage = 4; // Number of products to show at a time
  
  // Determine the number of slides based on total products and products per page
  const numSlides = Math.ceil(products.length / productsPerPage);
  
  // Get the current set of products to display
  const currentProducts = products.slice(startIndex, startIndex + productsPerPage);
  
  const nextSlide = () => {
    const nextIndex = startIndex + productsPerPage;
    setStartIndex(nextIndex >= products.length ? 0 : nextIndex);
  };
  
  const prevSlide = () => {
    const prevIndex = startIndex - productsPerPage;
    setStartIndex(prevIndex < 0 ? Math.max(0, products.length - productsPerPage) : prevIndex);
  };

  if (products.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-500">No products available at the moment.</p>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Navigation Buttons */}
      {numSlides > 1 && (
        <>
          <button 
            onClick={prevSlide}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 bg-white rounded-full p-2 shadow-md hover:bg-gray-50 transition-colors border border-gray-200"
            aria-label="Previous products"
          >
            <FiChevronLeft className="h-6 w-6 text-indigo-600" />
          </button>
          
          <button 
            onClick={nextSlide}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 bg-white rounded-full p-2 shadow-md hover:bg-gray-50 transition-colors border border-gray-200"
            aria-label="Next products"
          >
            <FiChevronRight className="h-6 w-6 text-indigo-600" />
          </button>
        </>
      )}
      
      {/* Products Grid */}
      <div className="overflow-hidden">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 transition-all duration-500 ease-in-out">
          {currentProducts.map((product) => (
            <div key={product.id} className="animate-fadeIn">
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </div>
      
      {/* Pagination Dots */}
      {numSlides > 1 && (
        <div className="flex justify-center space-x-2 mt-8">
          {Array.from({ length: numSlides }).map((_, i) => {
            const isActive = i * productsPerPage === startIndex;
            return (
              <button
                key={i}
                onClick={() => setStartIndex(i * productsPerPage)}
                className={`h-2.5 w-2.5 rounded-full transition-all duration-300 ${
                  isActive ? 'bg-indigo-600 w-6' : 'bg-gray-300 hover:bg-gray-400'
                }`}
                aria-label={`Go to slide ${i + 1}`}
              />
            );
          })}
        </div>
      )}
    </div>
  );
} 