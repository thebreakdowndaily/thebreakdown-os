import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { validateApiKeyAsync } from './utils/api-auth';
import { rateLimiter } from './features/rate-limiting/limiter';
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
  '/api/search',
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
  '/settings',
  '/editor',
  '/intel',
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Legacy canonical route redirects (Phase 0/3 cleanup -> 308 permanent redirect)
  if (pathname === '/tracking' || pathname.startsWith('/tracking/')) {
    return NextResponse.redirect(new URL('/trackers', request.url), 308);
  }
  if (pathname === '/problems' || pathname.startsWith('/problems/')) {
    return NextResponse.redirect(new URL('/fix', request.url), 308);
  }
  if (pathname === '/evolution' || pathname.startsWith('/evolution/')) {
    return NextResponse.redirect(new URL('/data', request.url), 308);
  }
  if (pathname === '/precedents' || pathname.startsWith('/precedents/')) {
    return NextResponse.redirect(new URL('/fix', request.url), 308);
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

    const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';

    if (PUBLIC_API_PATHS.some((p) => pathname === p || pathname.startsWith(p + '/'))) {
      const publicRate = await rateLimiter.checkLimit({
        key: `public:${clientIp}`,
        tier: 'public_api',
        endpoint: pathname,
        ip: clientIp,
      });
      if (!publicRate.allowed) {
        const resp = rateLimiter.create429Response(publicRate);
        Object.entries(SECURITY_HEADERS).forEach(([k, v]) => resp.headers.set(k, v));
        return resp;
      }
      const pubResp = NextResponse.next();
      rateLimiter.applyHeaders(pubResp.headers, publicRate);
      return pubResp;
    }

    const apiKey = request.headers.get('x-api-key');
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Missing x-api-key header', docs: '/api/docs' },
        { status: 401, headers: SECURITY_HEADERS as HeadersInit }
      );
    }

    const key = await validateApiKeyAsync(apiKey);
    if (!key) {
      return NextResponse.json(
        { error: 'Forbidden', message: 'Invalid, expired, or revoked API key' },
        { status: 403, headers: SECURITY_HEADERS as HeadersInit }
      );
    }

    const rate = await rateLimiter.checkLimit({
      key: `apikey:${key.key}`,
      tier: 'standard_api',
      endpoint: pathname,
      ip: clientIp,
    });

    if (!rate.allowed) {
      const resp = rateLimiter.create429Response(rate);
      Object.entries(SECURITY_HEADERS).forEach(([k, v]) => resp.headers.set(k, v));
      return resp;
    }

    const response = NextResponse.next();
    rateLimiter.applyHeaders(response.headers, rate);
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

      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError || !user) {
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('redirect', pathname);
        return NextResponse.redirect(loginUrl);
      }

      // Intelligence boundary — module-level authorization at the edge.
      // Runs before any page is served, so unauthorized requests never reach
      // a Server Component and no payload is computed or streamed.
      const intelModule = intelModuleFromPath(pathname);
      if (intelModule) {
        // Authoritative role: derived strictly from server-controlled app_metadata.
        // Note: user_metadata.role is client-writable in Supabase and strictly ignored for authorization.
        const authoritativeRole = (user.app_metadata.role as string | undefined) ?? null;
        const role = normalizeIntelRole(authoritativeRole);
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
