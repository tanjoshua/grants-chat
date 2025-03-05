import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const USERNAME = '71';
const PASSWORD = 'ilove71';

export function middleware(request: NextRequest) {
  // Add logging to help debug middleware triggering
  console.log('Middleware triggered for path:', request.nextUrl.pathname);
  console.log('Request headers:', Object.fromEntries(request.headers.entries()));
  
  // Safety check - double verify we're only on the settings page
  const pathname = request.nextUrl.pathname;
  
  // This should be redundant with the matcher, but just to be safe
  if (pathname !== '/settings') {
    // If we somehow got here on a different path, just continue without auth
    console.log('Not settings page, skipping auth check');
    return NextResponse.next();
  }
  
  // Extra safety for Vercel - Check if this is an API route or asset
  // This ensures we're only intercepting the actual settings page
  if (pathname.includes('/api/') || pathname.includes('/_next/')) {
    console.log('API or asset request, skipping auth check');
    return NextResponse.next();
  }
  
  // Check for auth header only on the settings page
  const authHeader = request.headers.get('authorization');

  // If we have valid credentials, allow access
  if (authHeader) {
    try {
      const encoded = authHeader.split(' ')[1];
      const decoded = Buffer.from(encoded, 'base64').toString();
      const [user, pwd] = decoded.split(':');
      
      if (user === USERNAME && pwd === PASSWORD) {
        return NextResponse.next();
      }
    } catch (error) {
      console.error('Error parsing auth header:', error);
    }
  }
  
  // Only return the auth challenge for the settings page
  return new NextResponse('Authentication Required', {
    status: 401,
    headers: {
      // Only prompt for auth on the settings page
      'WWW-Authenticate': 'Basic realm="Settings Page Access"',
    },
  });
}

// More specific matcher configuration to prevent triggering on non-settings pages
export const config = {
  matcher: [
    // More specific settings path matcher with exclusions for prefetching
    {
      source: '/settings',
      missing: [
        { type: 'header', key: 'next-router-prefetch' },
        { type: 'header', key: 'purpose', value: 'prefetch' }
      ]
    }
  ],
};
