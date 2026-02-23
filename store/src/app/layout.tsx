import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { Toaster } from 'react-hot-toast'
import { Providers } from './providers'

// Optimize font loading
const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  preload: true,
  fallback: ['system-ui', 'sans-serif'],
  variable: '--font-inter'
})

// Enhanced metadata for SEO
export const metadata: Metadata = {
  title: {
    template: '%s | CursorShop',
    default: 'CursorShop - Your Online Shopping Destination',
  },
  description: 'Find the best products at great prices with secure checkout and fast delivery',
  keywords: ['ecommerce', 'online shop', 'retail', 'shopping', 'cursor shop'],
  authors: [{ name: 'CursorShop Team' }],
  creator: 'CursorShop',
  publisher: 'CursorShop',
  formatDetection: {
    email: false,
    telephone: false,
    address: false,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-video-preview': -1,
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://cursor-shop.com',
    title: 'CursorShop - Your Online Shopping Destination',
    description: 'Find the best products at great prices with secure checkout and fast delivery',
    siteName: 'CursorShop',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CursorShop - Your Online Shopping Destination',
    description: 'Find the best products at great prices with secure checkout and fast delivery',
  },
  // PWA Metadata
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'CursorShop',
  },
  applicationName: 'CursorShop',
  other: {
    'apple-mobile-web-app-capable': 'yes',
    'mobile-web-app-capable': 'yes',
  },
}

// Viewport configuration
export const viewport: Viewport = {
  themeColor: '#0f172a',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  colorScheme: 'normal'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html 
      lang="en" 
      className={`h-full ${inter.variable}`}
      suppressHydrationWarning // Prevent hydration warnings for date/time differences
    >
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body className="min-h-full flex flex-col bg-gray-50 antialiased">
        <Providers>
          <Navbar />
          <main className="flex-grow pt-16">
            {children}
          </main>
          <Footer />
          <Toaster 
            position="bottom-right" 
            toastOptions={{
              duration: 3000,
              style: {
                background: '#0f172a',
                color: '#fff',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                borderRadius: '8px',
              },
              success: {
                iconTheme: {
                  primary: '#10b981',
                  secondary: '#fff',
                },
              },
              error: {
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fff',
                },
              },
            }}
          />
        </Providers>
      </body>
    </html>
  )
}
