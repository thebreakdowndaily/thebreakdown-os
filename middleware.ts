import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { validateApiKey, checkRateLimit } from './utils/api-auth';
import {
  PUBLIC_CACHE_POLICY,
  PUBLIC_UNINDEXED_HEADER,
  AUTHENTICATED_HEADER_POLICY,
  SECURITY_HEADERS,
} from './lib/infrastructure/cache-policy';
import { intelModuleFromPath } from './features/auth/intel-auth';
import { normalizeIntelRole, canAccessIntelModule } from './features/auth/roles';

const PUBLIC_API_PATHS = [
  '/api/docs',
  '/api/feed',
  '/api/auth',
  '/api/up403',
  '/api/v1/auth/login',
  '/api/v1/auth/register',
];

const AUTHENTICATED_PAGES = [
  '/editorial',
  '/research',
  '/admin',
  '/workspace',
  '/cms',
  '/dashboard',
  '/graph',
  '/explorer',
  '/operations',
  '/performance',
  '/tracking',
  '/settings',
  '/editor',
  '/intel',
];

// Routes that exist in the codebase but are not ready for public traffic.
// Return 404 to prevent indexing and reader confusion.
const DEPRECATED_DEBUG_ROUTES = ['/problems', '/evolution', '/compare', '/precedents'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Deprecated debug route block (Phase 0/3 cleanup)
  if (DEPRECATED_DEBUG_ROUTES.some((p) => pathname === p || pathname.startsWith(p + '/'))) {
    return new NextResponse('Not Found', { status: 404, headers: SECURITY_HEADERS as HeadersInit });
  }

  // 2. API Authentication & Rate Limiting
  if (pathname.startsWith('/api/')) {
    // Vercel Cron Ingestion Security Gate (Operating Standard §21)
    if (pathname === '/api/v2/newsroom/observations/pull') {
      const isCron = request.headers.get('x-vercel-cron') === '1';
      const authHeader = request.headers.get('authorization');
      const cronSecret = process.env.CRON_SECRET;

      if (isCron && cronSecret && authHeader === `Bearer ${cronSecret}`) {
        return NextResponse.next();
      }

      return NextResponse.json(
        { error: 'Unauthorized', message: 'Invalid or missing cron credentials' },
        { status: 401, headers: SECURITY_HEADERS as HeadersInit }
      );
    }

    if (PUBLIC_API_PATHS.some((p) => pathname === p || pathname.startsWith(p + '/'))) {
      return NextResponse.next();
    }

    const apiKey = request.headers.get('x-api-key');
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Missing x-api-key header', docs: '/api/docs' },
        { status: 401, headers: SECURITY_HEADERS as HeadersInit }
      );
    }

    const key = validateApiKey(apiKey);
    if (!key) {
      return NextResponse.json(
        { error: 'Forbidden', message: 'Invalid or revoked API key' },
        { status: 403, headers: SECURITY_HEADERS as HeadersInit }
      );
    }

    const rate = checkRateLimit(apiKey);
    if (!rate.allowed) {
      return NextResponse.json(
        { error: 'Too Many Requests', message: 'Rate limit exceeded', retryAfter: Math.ceil(rate.resetMs / 1000) },
        { status: 429, headers: { 'Retry-After': String(Math.ceil(rate.resetMs / 1000)), ...SECURITY_HEADERS } }
      );
    }

    const response = NextResponse.next();
    response.headers.set('X-RateLimit-Limit', '100');
    response.headers.set('X-RateLimit-Remaining', String(rate.remaining));
    response.headers.set('X-RateLimit-Reset', String(Math.ceil(rate.resetMs / 1000)));
    return response;
  }

  // 3. Authenticated Route Guards (/editorial, /research, /admin, /cms, etc.)
  const isProtectedPage = AUTHENTICATED_PAGES.some((p) => pathname === p || pathname.startsWith(p + '/'));

  if (isProtectedPage) {
    try {
      const response = NextResponse.next();
      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder_key',
        {
          cookies: {
            getAll: () => request.cookies.getAll(),
            setAll: (cookiesToSet) => {
              cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
            },
          },
        }
      );

      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('redirect', pathname);
        return NextResponse.redirect(loginUrl);
      }

      // Intelligence boundary — module-level authorization at the edge.
      // Runs before any page is served, so unauthorized requests never reach
      // a Server Component and no payload is computed or streamed.
      const intelModule = intelModuleFromPath(pathname);
      if (intelModule) {
        const role = normalizeIntelRole((session.user.user_metadata.role as string | undefined) ?? null);
        if (!canAccessIntelModule(role, intelModule)) {
          return new NextResponse('Forbidden', {
            status: 403,
            headers: {
              ...SECURITY_HEADERS,
              'Cache-Control': 'private, no-cache, no-store, must-revalidate',
              'X-Robots-Tag': 'noindex, nofollow',
            } as HeadersInit,
          });
        }
      }

      // Apply authenticated security headers
      Object.entries(AUTHENTICATED_HEADER_POLICY).forEach(([k, v]) => {
        response.headers.set(k, v);
      });
      return response;
    } catch {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // 4. Public Reader Surfaces & Unindexed Utility Pages
  const response = NextResponse.next();

  if (pathname.startsWith('/reader/') || pathname.startsWith('/rss')) {
    Object.entries(PUBLIC_UNINDEXED_HEADER).forEach(([k, v]) => { response.headers.set(k, v); });
  } else {
    Object.entries(PUBLIC_CACHE_POLICY).forEach(([k, v]) => { response.headers.set(k, v); });
  }

  return response;
}

export const config = {
  matcher: [
    '/api/:path*',
    '/editorial/:path*',
    '/research/:path*',
    '/admin/:path*',
    '/workspace/:path*',
    '/cms/:path*',
    '/dashboard/:path*',
    '/graph/:path*',
    '/explorer/:path*',
    '/operations/:path*',
    '/performance/:path*',
    '/tracking/:path*',
    '/settings/:path*',
    '/editor/:path*',
    '/intel/:path*',
    '/reader/:path*',
    '/problems/:path*',
    '/evolution/:path*',
    '/compare/:path*',
    '/precedents/:path*',
  ],
};
