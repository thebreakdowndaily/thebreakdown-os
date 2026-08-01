/**
 * ─── The Breakdown OS — Edge Infrastructure & Cache Configuration (P1) ───────
 * Configures CDN caching, compression, HTTPS security headers, and uncached
 * isolation policies for authenticated routes (/editorial/*, /research/*, /admin/*).
 */

export interface EdgeHeaderPolicy {
  pathname: string;
  cacheControl: string;
  securityHeaders: Record<string, string>;
  robots: string;
}

export const PRODUCTION_SECURITY_HEADERS: Record<string, string> = {
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
};

export function getEdgeHeaderPolicy(pathname: string): EdgeHeaderPolicy {
  const isAuthenticatedRoute =
    pathname.startsWith('/editorial') ||
    pathname.startsWith('/research') ||
    pathname.startsWith('/admin');

  if (isAuthenticatedRoute) {
    return {
      pathname,
      cacheControl: 'no-store, max-age=0, must-revalidate',
      securityHeaders: PRODUCTION_SECURITY_HEADERS,
      robots: 'noindex, nofollow',
    };
  }

  return {
    pathname,
    cacheControl: 'public, max-age=0, s-maxage=300, stale-while-revalidate=60',
    securityHeaders: PRODUCTION_SECURITY_HEADERS,
    robots: 'index, follow',
  };
}
