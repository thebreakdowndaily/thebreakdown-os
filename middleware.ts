import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { validateApiKey, checkRateLimit } from './utils/api-auth';
import { auth } from '@/features/auth/auth-server';

const PUBLIC_PATHS = ['/api/docs', '/api/feed', '/api/auth', '/api/v1/auth/login', '/api/v1/auth/register'];

const PROTECTED_PAGES = ['/workspace', '/cms', '/dashboard', '/settings', '/admin', '/reader'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // API auth: validate API key for non-auth API routes
  if (pathname.startsWith('/api/')) {
    if (PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + '/'))) {
      return NextResponse.next();
    }

    const apiKey = request.headers.get('x-api-key');

    if (!apiKey) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Missing x-api-key header', docs: '/api/docs' },
        { status: 401 }
      );
    }

    const key = validateApiKey(apiKey);
    if (!key) {
      return NextResponse.json(
        { error: 'Forbidden', message: 'Invalid or revoked API key' },
        { status: 403 }
      );
    }

    const rate = checkRateLimit(apiKey);
    const response = NextResponse.next();
    response.headers.set('X-RateLimit-Limit', '100');
    response.headers.set('X-RateLimit-Remaining', String(rate.remaining));
    response.headers.set('X-RateLimit-Reset', String(Math.ceil(rate.resetMs / 1000)));

    if (!rate.allowed) {
      return NextResponse.json(
        { error: 'Too Many Requests', message: 'Rate limit exceeded', retryAfter: Math.ceil(rate.resetMs / 1000) },
        { status: 429, headers: { 'Retry-After': String(Math.ceil(rate.resetMs / 1000)) } }
      );
    }

    return response;
  }

  // Page auth: protect /workspace, /cms, /dashboard, /settings, /admin
  if (PROTECTED_PAGES.some((p) => pathname === p || pathname.startsWith(p + '/'))) {
    try {
      const headers = new Headers(request.headers);
      const session = await auth.api.getSession({ headers });
      if (!session) {
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('redirect', pathname);
        return NextResponse.redirect(loginUrl);
      }
    } catch {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/api/:path*',
    '/workspace/:path*',
    '/cms/:path*',
    '/dashboard/:path*',
    '/settings/:path*',
    '/admin/:path*',
    '/reader/:path*',
  ],
};
