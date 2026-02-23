'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { User, Package, ShoppingBag, Heart, LogOut, Settings, Bell } from 'lucide-react';
import TestNotification from '@/components/ui/TestNotification';
import { signOut } from 'next-auth/react';

export default function AccountPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login?callbackUrl=/account');
    } else if (status === 'authenticated') {
      setLoading(false);
    }
  }, [status, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/' });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar */}
          <div className="w-full md:w-64 bg-white rounded-lg shadow p-6">
            <div className="flex items-center space-x-4 mb-6">
              <div className="h-12 w-12 rounded-full bg-blue-600 flex items-center justify-center">
                <span className="text-white text-lg font-bold">
                  {session?.user?.name?.[0] || 'U'}
                </span>
              </div>
              <div>
                <h2 className="text-lg font-medium">{session?.user?.name || 'User'}</h2>
                <p className="text-sm text-gray-500">{session?.user?.email}</p>
              </div>
            </div>
            
            <nav className="space-y-2">
              <Link 
                href="/account" 
                className="flex items-center space-x-2 px-3 py-2 rounded-md bg-blue-50 text-blue-700"
              >
                <User className="h-5 w-5" />
                <span>Profile</span>
              </Link>
              <Link 
                href="/account/orders" 
                className="flex items-center space-x-2 px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100"
              >
                <Package className="h-5 w-5" />
                <span>Orders</span>
              </Link>
              <Link 
                href="/account/purchases" 
                className="flex items-center space-x-2 px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100"
              >
                <ShoppingBag className="h-5 w-5" />
                <span>Purchases</span>
              </Link>
              <Link 
                href="/account/notifications" 
                className="flex items-center space-x-2 px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100"
              >
                <Bell className="h-5 w-5" />
                <span>Notifications</span>
              </Link>
              <Link 
                href="/account/settings" 
                className="flex items-center space-x-2 px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100"
              >
                <Settings className="h-5 w-5" />
                <span>Settings</span>
              </Link>
              <button
                onClick={handleSignOut}
                className="w-full flex items-center space-x-2 px-3 py-2 rounded-md text-red-600 hover:bg-red-50"
              >
                <LogOut className="h-5 w-5" />
                <span>Sign Out</span>
              </button>
            </nav>
          </div>
          
          {/* Main Content */}
          <div className="flex-1 bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold">My Account</h1>
              <TestNotification />
            </div>
            
            <div className="border-b border-gray-200 pb-6 mb-6">
              <h2 className="text-lg font-medium mb-4">Personal Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <p className="p-2 bg-gray-50 rounded border border-gray-200">{session?.user?.name || 'Not provided'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <p className="p-2 bg-gray-50 rounded border border-gray-200">{session?.user?.email}</p>
                </div>
              </div>
            </div>
            
            <div>
              <h2 className="text-lg font-medium mb-4">Recent Orders</h2>
              <div className="text-center py-8 border border-dashed border-gray-300 rounded-md">
                <Package className="h-10 w-10 mx-auto text-gray-400 mb-2" />
                <p className="text-gray-500">You have no recent orders</p>
                <Link href="/products" className="mt-2 inline-block text-blue-600 hover:text-blue-800">
                  Start shopping
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 