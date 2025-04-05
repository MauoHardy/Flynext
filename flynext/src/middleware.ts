import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  // Log cookies for debugging
  const cookiesList = request.cookies.getAll();
  console.log('Middleware - Request path:', request.nextUrl.pathname);
  console.log('Middleware - Cookies present:', cookiesList.map(c => c.name));
  
  // Get the access token
  const accessToken = request.cookies.get('accessToken')?.value;
  const refreshToken = request.cookies.get('refreshToken')?.value;
  
  // Prevent redirect loops - don't try to refresh on login/signup pages
  const isAuthPage = request.nextUrl.pathname === '/login' || request.nextUrl.pathname === '/signup';
  
  // Don't attempt refresh on API routes to prevent circular API calls
  const isApiRoute = request.nextUrl.pathname.startsWith('/api/');
  
  // Only attempt refresh if:
  // 1. We have a refresh token but no access token
  // 2. We're not already on an auth page (prevents loops)
  // 3. We're not on an API route (prevents circular API calls)
  if (!accessToken && refreshToken && !isAuthPage && !isApiRoute) {
    try {
      console.log('Middleware - Attempting token refresh with refreshToken');
      
      // Make a request to the refresh endpoint
      const response = await fetch(`${request.nextUrl.origin}/api/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Middleware - Token refreshed successfully, user:', data.user?.id);
        
        // Get cookies from the response
        const setCookieHeader = response.headers.get('Set-Cookie');
        
        if (setCookieHeader) {
          // Clone the response and pass along all cookies
          const newResponse = NextResponse.next();
          // Split multiple cookies if they exist
          const cookies = setCookieHeader.split(',').map(cookie => cookie.trim());
          cookies.forEach(cookie => {
            newResponse.headers.append('Set-Cookie', cookie);
          });
          console.log('Middleware - New access token set:', data.accessToken);
          return newResponse;
        }
      } else {
        console.log('Middleware - Token refresh failed:', await response.text());
        
        // Only redirect to login if we're on a protected page
        if (request.nextUrl.pathname.startsWith('/profile') || 
            request.nextUrl.pathname.startsWith('/bookings')) {
          return NextResponse.redirect(new URL('/login', request.url));
        }
      }
    } catch (error) {
      console.error('Middleware - Error refreshing token:', error);
    }
  }
  
  // Allow the request to continue
  return NextResponse.next();
}

// Configure the matcher to exclude API routes from middleware processing
export const config = {
  matcher: [
    // Protected paths
    '/profile',
    '/profile/edit',
    '/bookings',
    // Auth pages
    '/login',
    '/signup',
  ],
};
