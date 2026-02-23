import React from 'react';

export default function Loading() {
  return (
    <div className="max-w-3xl mx-auto py-20 px-4 text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
      <p className="mt-4 text-lg">Loading your order confirmation...</p>
    </div>
  );
} 