'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Lock } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function ChangePasswordPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login?callbackUrl=/account/settings/password');
    } else if (status === 'authenticated') {
      setLoading(false);
    }
  }, [status, router]);

  const validatePassword = () => {
    if (newPassword.length < 8) {
      setError('New password must be at least 8 characters');
      return false;
    }
    
    if (newPassword !== confirmPassword) {
      setError('Password confirmation doesn\'t match the new password');
      return false;
    }
    
    setError('');
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate password
    if (!validatePassword()) {
      return;
    }
    
    setUpdating(true);
    
    try {
      // Call API to change password
      const response = await fetch('/api/user/password', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        setError(data.message || 'Error changing password');
        return;
      }
      
      // Clear form
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      
      toast.success('Password changed successfully');
      
      // Return to settings page after a few seconds
      setTimeout(() => {
        router.push('/account/settings');
      }, 2000);
    } catch (error) {
      console.error('Error changing password:', error);
      setError('Server connection error. Please try again.');
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
            <h1 className="text-2xl font-bold text-gray-900">Change Password</h1>
            <div className="mt-1 flex items-center text-sm text-gray-500">
              <Link href="/account/settings" className="text-blue-600 hover:text-blue-800 flex items-center">
                <ArrowLeft size={16} className="ml-1" />
                Back to Settings
              </Link>
            </div>
          </div>
        </div>
        
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <div className="px-4 py-5 sm:p-6">
            {error && (
              <div className="mb-4 bg-red-50 text-red-700 p-4 rounded-md text-sm">
                {error}
              </div>
            )}
            
            <form onSubmit={handleSubmit}>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium leading-6 text-gray-900">New Password</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Password must be at least 8 characters and include letters, numbers, and symbols.
                  </p>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label htmlFor="current-password" className="block text-sm font-medium text-gray-700">
                      Current Password
                    </label>
                    <div className="mt-1 relative">
                      <input
                        id="current-password"
                        name="current-password"
                        type="password"
                        autoComplete="current-password"
                        required
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="block w-full pr-10 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm border-gray-300 rounded-md"
                      />
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-gray-400" aria-hidden="true" />
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="new-password" className="block text-sm font-medium text-gray-700">
                      New Password
                    </label>
                    <div className="mt-1 relative">
                      <input
                        id="new-password"
                        name="new-password"
                        type="password"
                        autoComplete="new-password"
                        required
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="block w-full pr-10 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm border-gray-300 rounded-md"
                      />
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-gray-400" aria-hidden="true" />
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700">
                      Confirm Password
                    </label>
                    <div className="mt-1 relative">
                      <input
                        id="confirm-password"
                        name="confirm-password"
                        type="password"
                        autoComplete="new-password"
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="block w-full pr-10 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm border-gray-300 rounded-md"
                      />
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-gray-400" aria-hidden="true" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="pt-6 flex justify-end">
                <button
                  type="button"
                  onClick={() => router.push('/account/settings')}
                  className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none ml-3"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  {updating ? 'Changing Password...' : 'Change Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
} 