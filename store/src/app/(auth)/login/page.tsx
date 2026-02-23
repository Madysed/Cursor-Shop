'use client'

import { signIn, useSession } from 'next-auth/react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState, Suspense, useEffect } from 'react'
import { FiMail, FiLock, FiEye, FiEyeOff, FiAlertCircle, FiLogIn, FiArrowLeft } from 'react-icons/fi'
import { FcGoogle } from 'react-icons/fc'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || '/'
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const { data: session, status } = useSession()

  // Redirect to home if already logged in
  useEffect(() => {
    if (status === 'authenticated' && session) {
      router.push(callbackUrl)
    }
  }, [status, session, router, callbackUrl])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const formData = new FormData(e.currentTarget)
      const email = formData.get('email') as string
      const password = formData.get('password') as string
      
      if (!email || !password) {
        setError('Email and password are required')
        setLoading(false)
        return
      }
      
      const response = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (response?.error) {
        console.error('Login error response:', response)
        setError(response.error === 'Invalid credentials' ? 'Invalid email or password' : response.error)
        setLoading(false)
        return
      }

      if (!response?.ok) {
        setError('Failed to log in. Please try again.')
        setLoading(false)
        return
      }
      
      // Successfully logged in
      router.push(callbackUrl)
      router.refresh()
    } catch (error) {
      console.error('Login error:', error)
      setError('Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  async function handleGoogleSignIn() {
    setLoading(true)
    try {
      await signIn('google', { callbackUrl })
    } catch (error) {
      console.error('Google sign in error:', error)
      setError('Failed to sign in with Google')
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6 w-full">
      {error && (
        <div className="rounded-lg bg-red-50 p-4 border border-red-100">
          <div className="flex items-center">
            <FiAlertCircle className="h-5 w-5 text-red-500 mr-2" />
            <div className="text-sm font-medium text-red-800">{error}</div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiMail className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#f59e0b] focus:border-transparent"
                placeholder="you@example.com"
              />
            </div>
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiLock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                required
                className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#f59e0b] focus:border-transparent"
                placeholder="••••••••"
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-gray-400 hover:text-gray-500 focus:outline-none"
                >
                  {showPassword ? (
                    <FiEyeOff className="h-5 w-5" />
                  ) : (
                    <FiEye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <input
              id="remember_me"
              name="remember_me"
              type="checkbox"
              className="h-4 w-4 text-[#f59e0b] focus:ring-[#f59e0b] border-gray-300 rounded"
            />
            <label htmlFor="remember_me" className="ml-2 block text-sm text-gray-700">
              Remember me
            </label>
          </div>

          <div className="text-sm">
            <Link href="/forgot-password" className="font-medium text-[#f59e0b] hover:text-[#d68b0c]">
              Forgot password?
            </Link>
          </div>
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center items-center px-4 py-3 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-[#0f172a] hover:bg-[#1e293b] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#f59e0b] transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Signing in...
              </>
            ) : (
              <>
                <FiLogIn className="w-5 h-5 mr-2" />
                Sign in
              </>
            )}
          </button>
        </div>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">Or continue with</span>
        </div>
      </div>

      <div>
        <button
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full flex justify-center items-center px-4 py-3 border border-gray-300 rounded-lg shadow-sm text-base font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#f59e0b] transition-colors disabled:opacity-70"
        >
          {loading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Signing in...
            </>
          ) : (
            <>
              <FcGoogle className="w-5 h-5 mr-2" />
              Google
            </>
          )}
        </button>
      </div>

      <div className="text-center mt-6">
        <p className="text-sm text-gray-600">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="font-medium text-[#f59e0b] hover:text-[#d68b0c]">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  )
}

export default function LoginPage() {
  const router = useRouter()
  
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <div className="relative bg-[#0f172a] h-48 w-full">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#f59e0b_1px,transparent_1px)] [background-size:20px_20px]"></div>
      </div>
      
      <div className="flex-1 flex items-start justify-center px-4 sm:px-6 lg:px-8 -mt-24 z-10">
        <div className="max-w-md w-full bg-white rounded-xl shadow-xl overflow-hidden p-6 sm:p-8 relative">
          <div className="absolute top-4 left-4">
            <button
              onClick={() => router.back()}
              className="text-gray-500 hover:text-gray-700 focus:outline-none"
            >
              <FiArrowLeft className="h-5 w-5" />
            </button>
          </div>
          
          <div className="flex flex-col items-center mb-6">
            <Link href="/" className="text-2xl font-bold text-[#0f172a] flex items-center">
              <span className="text-[#f59e0b]">Cursor</span>
              <span>Shop</span>
            </Link>
            <h2 className="mt-6 text-center text-2xl font-bold text-gray-900">
              Sign in to your account
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Access your orders, wishlist, and more
            </p>
          </div>

          <Suspense fallback={<div className="text-center py-8">Loading...</div>}>
            <LoginForm />
          </Suspense>
        </div>
      </div>
    </div>
  )
} 