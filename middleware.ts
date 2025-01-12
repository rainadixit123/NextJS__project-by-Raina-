import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(req) {
  // Check for authentication token
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  // If the user is not authenticated and is trying to access a protected route
  if (!token && req.nextUrl.pathname.startsWith('/dashboard')) {
    // Redirect the user to the sign-in page
    return NextResponse.redirect(new URL('/', req.url));
  }

  // Allow the request to proceed if the user is authenticated or not accessing protected pages
  return NextResponse.next();
}

// Define paths for which the middleware should run
export const config = {
  matcher: [ '/dashboard'], // Specify the protected paths
};
