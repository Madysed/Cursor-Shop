'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FiSearch } from 'react-icons/fi';

function SearchComponent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentQuery = searchParams.get('q') || '';
  
  const [searchTerm, setSearchTerm] = useState(currentQuery);
  const [isSearching, setIsSearching] = useState(false);
  
  // Reset isSearching state when the component mounts or when the URL changes
  useEffect(() => {
    setIsSearching(false);
    // Initialize search term from URL query parameter
    setSearchTerm(currentQuery);
  }, [currentQuery]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      setIsSearching(true);
      router.push(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  return (
    <form 
      onSubmit={handleSubmit}
      className="relative w-full max-w-md mx-auto"
    >
      <div className="relative flex items-center bg-white overflow-hidden rounded-full shadow-md border border-white/20">
        <input
          type="text"
          placeholder="Search for products..."
          className="w-full py-3 px-5 pl-12 bg-transparent outline-none text-gray-700"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          disabled={isSearching}
        />
        <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
          {isSearching ? (
            <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            <FiSearch className="h-5 w-5" />
          )}
        </div>
        <button
          type="submit"
          className="absolute right-1 top-1/2 transform -translate-y-1/2 bg-[#f59e0b] text-white p-2 rounded-full hover:bg-[#d97706] focus:outline-none focus:ring-2 focus:ring-[#f59e0b] disabled:opacity-70"
          disabled={!searchTerm.trim() || isSearching}
        >
          <FiSearch className="h-4 w-4" />
        </button>
      </div>
    </form>
  );
}

// Loading fallback for the Suspense boundary
function SearchFallback() {
  return (
    <div className="relative w-full max-w-md mx-auto">
      <div className="relative flex items-center bg-white overflow-hidden rounded-full shadow-md border border-white/20">
        <div className="w-full py-3 px-5 pl-12 bg-transparent outline-none text-gray-700">
          Loading...
        </div>
        <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
          <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      </div>
    </div>
  );
}

export default function HeroSearch() {
  return (
    <Suspense fallback={<SearchFallback />}>
      <SearchComponent />
    </Suspense>
  );
} 