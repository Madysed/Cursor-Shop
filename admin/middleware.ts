import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

/**
 * Add security headers including Content Security Policy
 * that allows eval for necessary functionality
 */
function addSecurityHeaders(response: NextResponse) {
  // Prevent clickjacking
  response.headers.set("X-Frame-Options", "DENY");
  
  // Enable XSS protection
  response.headers.set("X-XSS-Protection", "1; mode=block");
  
  // Prevent MIME type sniffing
  response.headers.set("X-Content-Type-Options", "nosniff");
  
  // Enable HSTS
  response.headers.set(
    "Strict-Transport-Security",
    "max-age=31536000; includeSubDomains"
  );
  
  // Referrer policy
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  
  // Permissions policy
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), interest-cohort=()"
  );

  // Always allow unsafe-eval for script execution
  // This is needed for some admin panel features
  response.headers.set(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' 'wasm-unsafe-eval' blob:; style-src 'self' 'unsafe-inline' blob: https://fonts.googleapis.com; font-src 'self' data: https://fonts.gstatic.com; img-src 'self' data: blob: https:; connect-src 'self' https:; worker-src 'self' blob:;"
  );
  
  return response;
}

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request });
  const { pathname } = request.nextUrl;

  // Apply security headers to all routes
  const secureResponse = addSecurityHeaders(NextResponse.next());

  // For non-admin routes, just return the secure response
  if (!pathname.startsWith('/admin')) {
    return secureResponse;
  }
  
  // If it's the login page and user is already authenticated, redirect to admin
  if (pathname === '/admin/login') {
    if (token?.role === 'ADMIN') {
      const redirectResponse = NextResponse.redirect(new URL('/admin', request.url));
      return addSecurityHeaders(redirectResponse);
    }
    return secureResponse;
  }

  // For all other admin routes, check authentication
  if (!token?.role || token.role !== 'ADMIN') {
    const redirectResponse = NextResponse.redirect(new URL('/admin/login', request.url));
    return addSecurityHeaders(redirectResponse);
  }

  return secureResponse;
}

export const config = {
  matcher: [
    // Match all routes
    '/:path*',
  ],
}; 