import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// For testing, use the credentials from the environment variables or hardcoded values
// Since we're hardcoding these, make sure they match your .env.local values
const USERNAME = '71';  
const PASSWORD = 'ilove71'; 

export function middleware(request: NextRequest) {
  // Only apply to /settings routes
  if (request.nextUrl.pathname.startsWith('/settings')) {
    // Get the Authorization header
    const authHeader = request.headers.get('authorization');
    
    if (authHeader) {
      // The Authorization header is in the format "Basic base64(username:password)"
      const auth = authHeader.split(' ')[1];
      const [user, pwd] = Buffer.from(auth, 'base64').toString().split(':');
      
      // Check credentials
      if (user === USERNAME && pwd === PASSWORD) {
        return NextResponse.next();
      }
    }
    
    // If no auth header or invalid credentials, request authentication
    const response = new NextResponse('Authentication required', {
      status: 401,
      headers: {
        'WWW-Authenticate': 'Basic realm="Settings Access"',
      },
    });
    
    return response;
  }
  
  // For other routes, continue as normal
  return NextResponse.next();
}

// Only run middleware on routes that start with /settings
export const config = {
  matcher: '/settings/:path*',
};
