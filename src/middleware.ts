// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import admin from './lib/adminProfile';
 

export async function middleware(request: NextRequest) {
    const token = request.cookies.get('token')?.value;

    // No token → redirect to login
    if (!token) {
        return NextResponse.redirect(new URL('/auth', request.url));
    }

    // Verify token with your admin function
    const myProfile = await admin(token);

    if (myProfile?.data) {
        return NextResponse.next(); // authenticated, proceed
    } else {
        // Invalid or expired token → clear cookie and redirect
        const response = NextResponse.redirect(new URL('/auth', request.url));
        response.cookies.delete('token');
        return response;
    }
}

export const config = {
    matcher: [
        // Exclude: API routes, Next.js internal files, favicon, and auth page
        '/((?!api|_next/static|_next/image|favicon.ico|auth).*)',
    ],
};