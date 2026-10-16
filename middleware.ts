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
import { isValidCronRequest } from './lib/security/cron-auth';

const PUBLIC_API_PATHS = [
  '/api/docs',
  '/api/feed',
  '/api/auth',
  '/api/search',
  '/api/up403',
  '/api/v1/auth/login',
  '/api/v1/auth/register',
  '/api/corrections/submit',
  '/api/health',
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
  '/newsroom',
  '/intel',
];

function hasSupabaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  return Boolean(url && /^https:\/\//.test(url) && key && key.trim().length > 20);
}

function loginRedirect(request: NextRequest, pathname: string) {
  const loginUrl = new URL('/login', request.url);
  // Preserve pathname only; do not accept a caller-supplied absolute redirect URL.
  loginUrl.searchParams.set('redirect', pathname);
  return NextResponse.redirect(loginUrl);
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Legacy canonical route redirects.
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

  // 2. API authentication & rate limiting (preserves existing API-key and cron gates).
  if (pathname.startsWith('/api/')) {
    if (pathname === '/api/v2/newsroom/observations/pull' || pathname === '/api/v2/radar/poll') {
      if (isValidCronRequest(request)) return NextResponse.next();

      if (pathname === '/api/v2/newsroom/observations/pull') {
        return NextResponse.json(
          { error: 'Unauthorized', message: 'Invalid or missing cron credentials' },
          { status: 401, headers: SECURITY_HEADERS as HeadersInit }
        );
      }

      const apiKey = request.headers.get('x-api-key');
      if (!apiKey) {
        return NextResponse.json(
          { error: 'Unauthorized', message: 'Invalid or missing credentials' },
          { status: 401, headers: SECURITY_HEADERS as HeadersInit }
        );
      }
    }

    // These endpoints perform their own HMAC signature verification at the route boundary.
    if (pathname === '/api/v2/newsroom/alerts/webhook' || pathname === '/api/editorial/publish-due') {
      return NextResponse.next();
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

  // 3. Protect internal app routes. Public story/topic/entity pages remain public.
  const isProtectedPage = AUTHENTICATED_PAGES.some((p) => pathname === p || pathname.startsWith(p + '/'));
  if (isProtectedPage) {
    // Fail closed on production misconfiguration; never silently construct a client with fake credentials.
    if (!hasSupabaseConfig()) {
      if (process.env.NODE_ENV === 'production') {
        return new NextResponse('Authentication service unavailable', {
          status: 503,
          headers: {
            ...SECURITY_HEADERS,
            'Cache-Control': 'private, no-store',
            'X-Robots-Tag': 'noindex, nofollow',
          } as HeadersInit,
        });
      }
      return loginRedirect(request, pathname);
    }

    try {
      let response = NextResponse.next({ request });
      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY)!,
        {
          cookies: {
            getAll: () => request.cookies.getAll(),
            setAll: (cookiesToSet, headers) => {
              // Keep request cookies in sync for downstream Server Components.
              cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
              response = NextResponse.next({ request });
              cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
              Object.entries(headers ?? {}).forEach(([name, value]) => response.headers.set(name, value));
            },
          },
        }
      );

      // Verify the JWT signature/claims server-side; never authorize based on getSession().
      const { data: claimsData, error: claimsError } = await supabase.auth.getClaims();
      const claims = claimsData?.claims;
      if (claimsError || !claims || typeof claims.sub !== 'string') {
        return loginRedirect(request, pathname);
      }

      const intelModule = intelModuleFromPath(pathname);
      if (intelModule) {
        // Mirror the principal resolver: database roles/status are authoritative when
        // present, app_metadata is only a server-controlled fallback, and user_metadata
        // is never trusted for privileges.
        const { data: roleRecord, error: roleLookupError } = await supabase
          .from('user_roles')
          .select('role, status')
          .eq('user_id', claims.sub)
          .maybeSingle();

        // A failed lookup cannot safely establish that a staff account is active.
        if (roleLookupError) {
          return new NextResponse('Authorization service unavailable', {
            status: 503,
            headers: {
              ...SECURITY_HEADERS,
              'Cache-Control': 'private, no-store',
              'X-Robots-Tag': 'noindex, nofollow',
            } as HeadersInit,
          });
        }

        if (roleRecord && roleRecord.status !== 'active') {
          return new NextResponse('Forbidden', {
            status: 403,
            headers: {
              ...SECURITY_HEADERS,
              'Cache-Control': 'private, no-cache, no-store, must-revalidate',
              'X-Robots-Tag': 'noindex, nofollow',
            } as HeadersInit,
          });
        }

        const appMetadata = claims.app_metadata as Record<string, unknown> | undefined;
        const authoritativeRole =
          typeof roleRecord?.role === 'string'
            ? roleRecord.role
            : typeof appMetadata?.role === 'string'
              ? appMetadata.role
              : null;
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

      Object.entries(AUTHENTICATED_HEADER_POLICY).forEach(([k, v]) => response.headers.set(k, v));
      response.headers.set('Cache-Control', 'private, no-store, max-age=0');
      response.headers.set('X-Robots-Tag', 'noindex, nofollow');
      return response;
    } catch {
      // Fail closed if Auth cannot be checked.
      return loginRedirect(request, pathname);
    }
  }

  // 4. Public reader surfaces and unindexed utility pages.
  const response = NextResponse.next();
  if (pathname.startsWith('/reader/') || pathname.startsWith('/rss')) {
    Object.entries(PUBLIC_UNINDEXED_HEADER).forEach(([k, v]) => response.headers.set(k, v));
  } else {
    Object.entries(PUBLIC_CACHE_POLICY).forEach(([k, v]) => response.headers.set(k, v));
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
    '/newsroom/:path*',
    '/intel/:path*',
    '/reader/:path*',
    '/problems/:path*',
    '/evolution/:path*',
    '/compare/:path*',
    '/precedents/:path*',
  ],
};
