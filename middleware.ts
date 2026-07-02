import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { validateApiKey, checkRateLimit } from './utils/api-auth';

const PUBLIC_PATHS = ['/api/docs', '/api/feed'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

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

export const config = {
  matcher: '/api/:path*',
};
