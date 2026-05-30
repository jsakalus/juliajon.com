import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

// Duplicated from lib/session.ts — cannot import that module here (next/headers is not edge-compatible)
const SESSION_COOKIE = 'admin_session';

function secret() {
  const s = process.env.ADMIN_SESSION_SECRET;
  if (!s) return null;
  return new TextEncoder().encode(s);
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Expose pathname to server components via header
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-pathname', pathname);
  const passthrough = () =>
    NextResponse.next({ request: { headers: requestHeaders } });

  // Non-admin routes: just pass through with the header set
  if (!pathname.startsWith('/admin') && !pathname.startsWith('/api/admin')) {
    return passthrough();
  }

  // Login page and login API are public
  if (pathname === '/admin/login' || pathname.startsWith('/api/admin/login')) {
    return passthrough();
  }

  const key = secret();
  const token = request.cookies.get(SESSION_COOKIE)?.value;

  if (token && key) {
    try {
      await jwtVerify(token, key);
      return passthrough();
    } catch {
      // invalid / expired token — fall through
    }
  }

  if (pathname.startsWith('/api/')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const loginUrl = new URL('/admin/login', request.url);
  loginUrl.searchParams.set('from', pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: [
    // All paths except Next.js internals and common static files
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|svg|webp|ico|woff|woff2)).*)',
  ],
};
