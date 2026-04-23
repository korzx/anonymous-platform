// middleware.ts - Security middleware and headers

import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Security headers (duplicated from next.config.js for middleware level)
  
  // Prevent clickjacking
  response.headers.set('X-Frame-Options', 'DENY');
  
  // Prevent MIME type sniffing
  response.headers.set('X-Content-Type-Options', 'nosniff');
  
  // Enable XSS protection
  response.headers.set('X-XSS-Protection', '1; mode=block');
  
  // Prevent referrer leakage
  response.headers.set('Referrer-Policy', 'no-referrer');
  
  // Enforce HTTPS
  response.headers.set(
    'Strict-Transport-Security',
    'max-age=31536000; includeSubDomains; preload'
  );
  
  // Content Security Policy
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'"
  );
  
  // Permissions Policy (disable sensitive APIs)
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), accelerometer=(), magnetometer=(), gyroscope=(), location=()'
  );

  // Cache control for sensitive responses
  if (request.nextUrl.pathname.startsWith('/api/')) {
    response.headers.set(
      'Cache-Control',
      'no-cache, no-store, must-revalidate, max-age=0'
    );
    response.headers.set('Pragma', 'no-cache');
  }

  return response;
}

// Only apply middleware to API routes and main pages
export const config = {
  matcher: ['/(api|.*\\.tsx|.*\\.ts)'],
};
