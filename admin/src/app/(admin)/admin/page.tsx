'use client';

import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { FiBox, FiTag, FiShoppingBag } from 'react-icons/fi';

export default function AdminDashboard() {
  const { data: session } = useSession();

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Products Card */}
        <Link href="/admin/products" className="group">
          <div className="bg-gray-800 rounded-xl p-6 shadow-xl hover:shadow-2xl hover:shadow-blue-500/20 transition-all duration-300 transform hover:-translate-y-1 border border-gray-700">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-blue-400 group-hover:text-blue-300">Products</h2>
              <div className="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center group-hover:bg-blue-500/20 transition-all duration-300">
                <FiBox className="text-2xl text-blue-400 group-hover:text-blue-300 group-hover:scale-110 transition-all duration-300" />
              </div>
            </div>
            <p className="mt-2 text-gray-400">Manage your products</p>
            <div className="mt-4 flex items-center text-blue-400 group-hover:text-blue-300">
              <span>View all products</span>
              <svg 
                className="w-5 h-5 ml-2 transform group-hover:translate-x-2 transition-all duration-300" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </Link>

        {/* Categories Card */}
        <Link href="/admin/categories" className="group">
          <div className="bg-gray-800 rounded-xl p-6 shadow-xl hover:shadow-2xl hover:shadow-blue-500/20 transition-all duration-300 transform hover:-translate-y-1 border border-gray-700">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-blue-400 group-hover:text-blue-300">Categories</h2>
              <div className="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center group-hover:bg-blue-500/20 transition-all duration-300">
                <FiTag className="text-2xl text-blue-400 group-hover:text-blue-300 group-hover:scale-110 transition-all duration-300" />
              </div>
            </div>
            <p className="mt-2 text-gray-400">Manage your categories</p>
            <div className="mt-4 flex items-center text-blue-400 group-hover:text-blue-300">
              <span>View all categories</span>
              <svg 
                className="w-5 h-5 ml-2 transform group-hover:translate-x-2 transition-all duration-300" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </Link>

        {/* Orders Card */}
        <Link href="/admin/orders" className="group">
          <div className="bg-gray-800 rounded-xl p-6 shadow-xl hover:shadow-2xl hover:shadow-blue-500/20 transition-all duration-300 transform hover:-translate-y-1 border border-gray-700">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-blue-400 group-hover:text-blue-300">Orders</h2>
              <div className="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center group-hover:bg-blue-500/20 transition-all duration-300">
                <FiShoppingBag className="text-2xl text-blue-400 group-hover:text-blue-300 group-hover:scale-110 transition-all duration-300" />
              </div>
            </div>
            <p className="mt-2 text-gray-400">Manage your orders</p>
            <div className="mt-4 flex items-center text-blue-400 group-hover:text-blue-300">
              <span>View all orders</span>
              <svg 
                className="w-5 h-5 ml-2 transform group-hover:translate-x-2 transition-all duration-300" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
} 