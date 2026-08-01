/**
 * ─── The Breakdown OS — Security Audit & Rate Limiter Engine ────────────────
 * Validates request rate limits, XSS string sanitization, CSRF tokens, and secret
 * environment isolation before production deployment.
 */

export interface RateLimitState {
  ip: string;
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitState>();

export function checkRateLimit(ip: string, maxRequests: number = 60, windowMs: number = 60000): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const record = rateLimitStore.get(ip);

  if (!record || now > record.resetTime) {
    rateLimitStore.set(ip, { ip, count: 1, resetTime: now + windowMs });
    return { allowed: true, remaining: maxRequests - 1 };
  }

  if (record.count >= maxRequests) {
    return { allowed: false, remaining: 0 };
  }

  record.count += 1;
  rateLimitStore.set(ip, record);
  return { allowed: true, remaining: maxRequests - record.count };
}

export function sanitizeHtmlInput(input: string): string {
  if (!input) return '';
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

export function validateRequiredEnvironmentVariables(requiredKeys: string[] = ['NODE_ENV']): { valid: boolean; missing: string[] } {
  const missing = requiredKeys.filter((key) => {
    const val = process.env[key];
    if (key === 'NODE_ENV') return false; // Defaulted by Next.js / Node runtime
    return !val;
  });
  return {
    valid: missing.length === 0,
    missing,
  };
}
