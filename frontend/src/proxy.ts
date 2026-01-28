import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const TOKEN_KEY = 'admin_token';
const TOKEN_EXPIRY_KEY = 'admin_token_expiry';

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public routes
  if (!pathname.startsWith('/admin')) {
    return NextResponse.next();
  }

  // Allow login page
  if (pathname === '/admin/login') {
    return NextResponse.next();
  }

  // Check for token in cookies
  const token = request.cookies.get(TOKEN_KEY)?.value;
  const expiry = request.cookies.get(TOKEN_EXPIRY_KEY)?.value;

  // If no token or expired, redirect to login
  if (!token || !expiry) {
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }

  const expiryTime = parseInt(expiry, 10);
  if (Date.now() >= expiryTime) {
    // Token expired, redirect to login
    const response = NextResponse.redirect(new URL('/admin/login', request.url));
    response.cookies.delete(TOKEN_KEY);
    response.cookies.delete(TOKEN_EXPIRY_KEY);
    return response;
  }

  // Token is valid, allow access
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
  ],
};
