'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { FiSearch } from 'react-icons/fi';

interface SearchBarProps {
  autoFocus?: boolean;
  onSearch?: () => void;
}

export default function SearchBar({ autoFocus = false, onSearch }: SearchBarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      if (onSearch) onSearch();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          placeholder="Search for products..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-3 pl-12 rounded-lg bg-white dark:bg-[#1e293b] border-2 border-[#e2e8f0] focus:border-[#f59e0b] focus:outline-none focus:ring-2 focus:ring-[#f59e0b]/50"
        />
        <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
        <button
          type="submit"
          className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-[#f59e0b] hover:bg-[#f59e0b]/90 text-[#0f172a] font-medium rounded-md px-3 py-1.5 text-sm transition-colors"
        >
          Search
        </button>
      </div>
    </form>
  );
} 