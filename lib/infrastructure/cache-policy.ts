/**
 * ─── The Breakdown OS — Infrastructure Cache & Security Header Policy ────────
 * Pure header generator for Public, Editorial, and Admin response projections.
 * Fully compatible with Vercel Edge and Cloudflare CDN.
 */

export interface HeaderMap {
  [key: string]: string;
}

export const SECURITY_HEADERS: HeaderMap = {
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'X-XSS-Protection': '1; mode=block',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
};

/** Cache policy for public reader pages (1 min browser cache, 5 min edge cache, 10 min stale-while-revalidate) */
export const PUBLIC_CACHE_POLICY: HeaderMap = {
  'Cache-Control': 'public, max-age=60, s-maxage=300, stale-while-revalidate=600',
  ...SECURITY_HEADERS,
};

/** Cache policy for public unindexed utility pages (no browser cache, no CDN index) */
export const PUBLIC_UNINDEXED_HEADER: HeaderMap = {
  'Cache-Control': 'private, no-cache, no-store, must-revalidate',
  'X-Robots-Tag': 'noindex, nofollow',
  ...SECURITY_HEADERS,
};

/** Header policy for authenticated editorial & research surfaces */
export const AUTHENTICATED_HEADER_POLICY: HeaderMap = {
  'Cache-Control': 'private, no-cache, no-store, must-revalidate',
  'X-Robots-Tag': 'noindex, nofollow',
  ...SECURITY_HEADERS,
};

/** Apply header dictionary to a Next.js / Web Response */
export function applyHeaders(headers: Headers, policy: HeaderMap): Headers {
  Object.entries(policy).forEach(([key, value]) => {
    headers.set(key, value);
  });
  return headers;
}
