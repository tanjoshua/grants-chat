import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Hard-coded credentials for testing
const USERNAME = '71';
const PASSWORD = 'ilove71';

// This function runs for all requests matching the matcher pattern
export function middleware(request: NextRequest) {
  console.log('Middleware running for:', request.nextUrl.pathname);

  // Get the Authorization header
  const authHeader = request.headers.get('authorization');
  
  if (authHeader) {
    // The Authorization header is in the format "Basic base64(username:password)"
    const auth = authHeader.split(' ')[1];
    const [user, pwd] = Buffer.from(auth, 'base64').toString().split(':');
    
    // Check credentials
    if (user === USERNAME && pwd === PASSWORD) {
      console.log('Auth successful for', request.nextUrl.pathname);
      return NextResponse.next();
    }
    console.log('Invalid credentials for', request.nextUrl.pathname);
  } else {
    console.log('No auth header for', request.nextUrl.pathname);
  }
  
  // If no auth header or invalid credentials, request authentication
  return new NextResponse('Authentication required', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="Settings Access"',
    },
  });
}

// Configure middleware to only run on specific paths
export const config = {
  // This is the important part - it tells Next.js to ONLY run this middleware
  // on requests that match these patterns
  matcher: [
    // Only protect the settings page and its subpaths
    '/settings',
  ],
};
