'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Save, ArrowLeft } from 'lucide-react';
import { toast } from 'react-hot-toast';
import React from 'react';

export default function AccountSettingsPage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  
  const [name, setName] = useState('');
  const [image, setImage] = useState('');
  
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login?callbackUrl=/account/settings');
    } else if (status === 'authenticated' && session?.user) {
      setName(session.user.name || '');
      setImage(session.user.image || '');
      setLoading(false);
    }
  }, [status, router, session]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setUpdating(true);
    
    try {
      // استفاده از API برای به‌روزرسانی اطلاعات کاربر
      const response = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update profile');
      }
      
      // به‌روزرسانی session با اطلاعات جدید
      await update({ name });
      
      toast.success('اطلاعات پروفایل با موفقیت به‌روزرسانی شد');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('خطا در به‌روزرسانی پروفایل');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Account Settings</h1>
            <div className="mt-1 flex items-center text-sm text-gray-500">
              <Link href="/account" className="text-blue-600 hover:text-blue-800 flex items-center">
                <ArrowLeft size={16} className="ml-1" />
                Back to Profile
              </Link>
            </div>
          </div>
        </div>
        
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <div className="px-4 py-5 sm:p-6">
            <form onSubmit={handleSubmit}>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium leading-6 text-gray-900">Personal Information</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    This information will be displayed on your profile.
                  </p>
                </div>
                
                <div className="grid grid-cols-6 gap-6">
                  <div className="col-span-6 sm:col-span-4">
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                      Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>
                  
                  <div className="col-span-6 sm:col-span-4">
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                      Email
                    </label>
                    <input
                      type="text"
                      name="email"
                      id="email"
                      value={session?.user?.email || ''}
                      disabled
                      className="mt-1 bg-gray-100 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Your email cannot be changed.
                    </p>
                  </div>
                </div>
                
                <div className="pt-5 border-t border-gray-200">
                  <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">Change Password</h3>
                  <div className="grid grid-cols-6 gap-6">
                    <div className="col-span-6 sm:col-span-4">
                      <Link
                        href="/account/settings/password"
                        className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
                      >
                        Change Password
                      </Link>
                    </div>
                  </div>
                </div>
                
                <div className="pt-5 border-t border-gray-200">
                  <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">Notification Preferences</h3>
                  <div className="mt-4 space-y-4">
                    <div className="flex items-start">
                      <div className="flex items-center h-5">
                        <input
                          id="notification_email"
                          name="notification_email"
                          type="checkbox"
                          defaultChecked
                          className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                        />
                      </div>
                      <div className="mr-3 text-sm">
                        <label htmlFor="notification_email" className="font-medium text-gray-700">
                          Receive Email Notifications
                        </label>
                        <p className="text-gray-500">
                          Receive emails about your orders, discounts, and important updates.
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="flex items-center h-5">
                        <input
                          id="marketing_email"
                          name="marketing_email"
                          type="checkbox"
                          className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                        />
                      </div>
                      <div className="mr-3 text-sm">
                        <label htmlFor="marketing_email" className="font-medium text-gray-700">
                          Receive Newsletter and Offers
                        </label>
                        <p className="text-gray-500">
                          Stay informed about the latest products, discounts, and special offers.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="pt-6 flex justify-end">
                <button
                  type="button"
                  onClick={() => router.push('/account')}
                  className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none ml-3"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center"
                >
                  {updating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent ml-2"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save size={16} className="ml-2" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
} 