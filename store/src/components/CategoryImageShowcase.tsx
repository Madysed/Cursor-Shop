'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Category } from '@prisma/client';

interface CategoryImageShowcaseProps {
  categories: Category[];
}

export default function CategoryImageShowcase({ categories }: CategoryImageShowcaseProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // Use effect to automatically change the image every 3 seconds if there are multiple categories
  useEffect(() => {
    if (categories.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentIndex(prevIndex => (prevIndex + 1) % categories.length);
    }, 3000);
    
    return () => clearInterval(interval);
  }, [categories.length]);

  // If no categories, show placeholder
  if (categories.length === 0) {
    return (
      <div className="relative">
        <Image
          src="/placeholder.jpg"
          alt="Featured Product"
          width={500}
          height={500}
          className="w-full h-[400px] object-cover"
          priority
        />
      </div>
    );
  }
  
  // If only one category, just show that image
  if (categories.length === 1) {
    return (
      <div className="relative">
        <Image
          src={categories[0].imageUrl || "/placeholder.jpg"}
          alt={categories[0].name}
          width={500}
          height={500}
          className="w-full h-[400px] object-cover"
          priority
        />
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
          <h3 className="text-xl font-bold text-white">{categories[0].name}</h3>
        </div>
      </div>
    );
  }
  
  // For multiple categories, show the current image with navigation
  return (
    <div className="relative h-[400px] w-full">
      {/* Current Image */}
      <div className="absolute inset-0 transition-opacity duration-500">
        <Image
          src={categories[currentIndex]?.imageUrl || "/placeholder.jpg"}
          alt={categories[currentIndex]?.name || "Category"}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
          <h3 className="text-xl font-bold text-white">{categories[currentIndex]?.name}</h3>
        </div>
      </div>
      
      {/* Navigation Dots */}
      <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-10">
        {categories.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-3 h-3 rounded-full transition-all ${
              currentIndex === index ? 'bg-[#f59e0b] scale-125' : 'bg-white/60 hover:bg-white'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
      
      {/* Previous/Next Buttons */}
      <button
        className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white rounded-full p-2 z-10"
        onClick={() => setCurrentIndex((currentIndex - 1 + categories.length) % categories.length)}
        aria-label="Previous image"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <button
        className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white rounded-full p-2 z-10"
        onClick={() => setCurrentIndex((currentIndex + 1) % categories.length)}
        aria-label="Next image"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  );
} 