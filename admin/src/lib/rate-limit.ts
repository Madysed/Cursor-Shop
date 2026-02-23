import { NextResponse } from 'next/server';

interface RateLimitInfo {
  count: number;
  resetTime: number;
}

const rateLimit = new Map<string, RateLimitInfo>();
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const MAX_REQUESTS = 100; // 100 requests per window

export function rateLimitMiddleware(handler: Function) {
  return async (request: Request) => {
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    const now = Date.now();

    // Get or create rate limit info for this IP
    let rateLimitInfo = rateLimit.get(ip);
    if (!rateLimitInfo) {
      rateLimitInfo = { count: 0, resetTime: now + WINDOW_MS };
      rateLimit.set(ip, rateLimitInfo);
    }

    // Reset if window has passed
    if (now > rateLimitInfo.resetTime) {
      rateLimitInfo.count = 0;
      rateLimitInfo.resetTime = now + WINDOW_MS;
    }

    // Check if rate limit exceeded
    if (rateLimitInfo.count >= MAX_REQUESTS) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    // Increment counter
    rateLimitInfo.count++;

    // Call the handler
    return handler(request);
  };
} 