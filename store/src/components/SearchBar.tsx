'use client';

import { useState, useRef, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FiSearch, FiX } from 'react-icons/fi';

function SearchBarFallback() {
  return (
    <div className="relative">
      <div className="hidden md:block">
        <div className="relative flex items-center">
          <input
            type="text"
            placeholder="Search..."
            disabled
            className="w-64 h-9 px-4 pl-9 text-sm rounded-full bg-white/10 border border-white/20 text-white placeholder-gray-300 focus:outline-none disabled:opacity-70"
            dir="ltr"
          />
          <div className="absolute left-3 flex items-center pointer-events-none">
            <svg className="animate-spin h-4 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        </div>
      </div>
      <div className="md:hidden">
        <button 
          className="text-white hover:text-[#f59e0b] transition-colors p-1"
          aria-label="Search"
          disabled
        >
          <FiSearch className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}

function SearchBarComponent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentQuery = searchParams.get('q') || '';
  
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  
  // Reset isSearching state when the component mounts or when the URL changes
  useEffect(() => {
    setIsSearching(false);
  }, [searchParams]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      setIsSearching(true);
      router.push(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
      setSearchTerm('');
      setIsOpen(false);
    }
  };

  // Desktop search
  return (
    <div className="relative" ref={searchRef}>
      <div className="hidden md:block">
        <form onSubmit={handleSubmit} className="relative">
          <div className="relative flex items-center">
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              disabled={isSearching}
              className="w-64 h-9 px-4 pl-9 text-sm rounded-full bg-white/10 border border-white/20 text-white placeholder-gray-300 focus:outline-none focus:ring-1 focus:ring-[#f59e0b] focus:border-[#f59e0b] disabled:opacity-70"
              dir="ltr"
            />
            <div className="absolute left-3 flex items-center pointer-events-none">
              {isSearching ? (
                <svg className="animate-spin h-4 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <FiSearch className="h-4 w-4 text-gray-300" />
              )}
            </div>
          </div>
        </form>
      </div>
      
      {/* Mobile search icon */}
      <div className="md:hidden">
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="text-white hover:text-[#f59e0b] transition-colors p-1"
          aria-label="Search"
        >
          <FiSearch className="h-5 w-5" />
        </button>
        
        {/* Mobile search dropdown */}
        {isOpen && (
          <div className="absolute top-full right-0 mt-2 w-screen px-4 z-50">
            <div className="bg-[#1e293b] rounded-lg shadow-xl p-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-white font-medium">Search</h3>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <FiX className="h-5 w-5" />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="relative">
                <div className="relative flex items-center">
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-white/10 border border-white/20 rounded-lg py-2 pl-9 pr-4 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#f59e0b] focus:border-[#f59e0b]"
                    autoFocus
                    dir="ltr"
                    disabled={isSearching}
                  />
                  <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                    {isSearching ? (
                      <svg className="animate-spin h-4 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    ) : (
                      <FiSearch className="h-4 w-4 text-gray-400" />
                    )}
                  </div>
                  {searchTerm && (
                    <button
                      type="button"
                      onClick={() => setSearchTerm('')}
                      className="absolute inset-y-0 right-2 flex items-center text-gray-400 hover:text-white"
                    >
                      <FiX className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function SearchBar() {
  return (
    <Suspense fallback={<SearchBarFallback />}>
      <SearchBarComponent />
    </Suspense>
  );
} 