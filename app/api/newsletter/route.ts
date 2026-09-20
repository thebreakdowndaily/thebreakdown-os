import { NextResponse } from 'next/server';
import { getNewsletterProvider, NewsletterSubscribeResult } from '@/lib/newsletter/provider';
import { rateLimiter } from '@/features/rate-limiting/limiter';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

async function hashKey(value: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export async function POST(request: Request) {
  try {
    const payload: unknown = await request.json();
    const email = (payload as { email?: string }).email;

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { status: 'error', message: 'A valid email address is required.' },
        { status: 400 }
      );
    }

    const normalized = email.trim().toLowerCase();
    if (!EMAIL_REGEX.test(normalized)) {
      return NextResponse.json(
        { status: 'error', message: 'That email address does not look valid.' },
        { status: 400 }
      );
    }

    // Rate limiting on a digest of ip+email via distributed rate limiter
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    const rateLimitKey = await hashKey(`${ip}:${normalized}`);
    
    const rate = await rateLimiter.checkLimit({
      key: `newsletter:${rateLimitKey}`,
      tier: 'mutation',
      endpoint: '/api/newsletter',
      ip,
    });

    if (!rate.allowed) {
      return rateLimiter.create429Response(rate, 'Too many requests. Please try again shortly.');
    }

    const provider = getNewsletterProvider();
    const result: NewsletterSubscribeResult = await provider.subscribe(normalized);

    if (result.status === 'submitted' || result.status === 'confirmed') {
      const resp = NextResponse.json(result, { status: 200 });
      rateLimiter.applyHeaders(resp.headers, rate);
      return resp;
    }

    // `unavailable` (503) and `error` (500) are distinct: unavailable means
    // no delivery provider is configured — nothing was attempted.
    const httpStatus = result.status === 'unavailable' ? 503 : 500;
    const resp = NextResponse.json(result, { status: httpStatus });
    rateLimiter.applyHeaders(resp.headers, rate);
    return resp;
  } catch (error) {
    console.error('Newsletter API Error:', error);
    return NextResponse.json(
      { status: 'error', message: 'Internal server error.' },
      { status: 500 }
    );
  }
}