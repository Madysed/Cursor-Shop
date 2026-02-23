'use client';

import Link from 'next/link';
import { WifiOffIcon } from 'lucide-react';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function OfflinePage() {
  const router = useRouter();
  
  useEffect(() => {
    // Check if we are actually online when this page loads
    // If we are online, redirect to the homepage
    if (typeof window !== 'undefined' && navigator.onLine) {
      router.push('/');
    }
  }, [router]);
  
  // Function to handle retry button click
  const handleRetry = () => {
    window.location.reload();
  };
  
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center">
      <div className="p-8 max-w-md mx-auto rounded-lg bg-white shadow-lg">
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mb-4">
            <WifiOffIcon className="h-8 w-8" />
          </div>
        </div>
        
        <h1 className="text-2xl font-bold text-gray-800 mb-3">You&apos;re Offline</h1>
        
        <p className="text-gray-600 mb-6">
          It seems that you lost your internet connection. Please check your connection and try again.
        </p>
        
        <div className="space-y-3">
          <button
            onClick={handleRetry}
            className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors"
          >
            Retry
          </button>
          
          <Link 
            href="/"
            className="block w-full px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-md hover:bg-gray-50 transition-colors"
          >
            Back to Homepage
          </Link>
        </div>
        
        <div className="mt-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-3">Available Offline</h2>
          <div className="space-y-2">
            <Link 
              href="/products"
              className="block p-3 bg-gray-50 hover:bg-gray-100 rounded-md text-gray-800 transition-colors"
            >
              Browse Cached Products
            </Link>
            <Link 
              href="/cart"
              className="block p-3 bg-gray-50 hover:bg-gray-100 rounded-md text-gray-800 transition-colors"
            >
              View Your Cart
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 