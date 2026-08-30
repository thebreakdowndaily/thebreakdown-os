import { NextResponse } from 'next/server';
import { getNewsletterProvider, NewsletterSubscribeResult } from '@/lib/newsletter/provider';

// In-memory rate limiting map
// Key: sha256(ip + email), Value: timestamp
// The raw email and IP are never retained as keys — only a digest.
const rateLimitMap = new Map<string, number>();
const RATE_LIMIT_COOLDOWN_MS = 60 * 1000; // 1 minute
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

    // Rate limiting on a digest of ip+email — no raw PII retained.
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    const rateLimitKey = await hashKey(`${ip}:${normalized}`);
    const now = Date.now();
    const lastRequest = rateLimitMap.get(rateLimitKey);

    if (lastRequest && now - lastRequest < RATE_LIMIT_COOLDOWN_MS) {
      return NextResponse.json(
        { status: 'error', message: 'Too many requests. Please try again shortly.' },
        { status: 429 }
      );
    }

    rateLimitMap.set(rateLimitKey, now);

    // Cleanup old rate limit entries to prevent memory leaks.
    if (rateLimitMap.size > 1000) {
      for (const [key, timestamp] of rateLimitMap.entries()) {
        if (now - timestamp > RATE_LIMIT_COOLDOWN_MS) {
          rateLimitMap.delete(key);
        }
      }
    }

    const provider = getNewsletterProvider();
    const result: NewsletterSubscribeResult = await provider.subscribe(normalized);

    if (result.status === 'submitted' || result.status === 'confirmed') {
      return NextResponse.json(result, { status: 200 });
    }

    // `unavailable` (503) and `error` (500) are distinct: unavailable means
    // no delivery provider is configured — nothing was attempted.
    const httpStatus = result.status === 'unavailable' ? 503 : 500;
    return NextResponse.json(result, { status: httpStatus });
  } catch (error) {
    console.error('Newsletter API Error:', error);
    return NextResponse.json(
      { status: 'error', message: 'Internal server error.' },
      { status: 500 }
    );
  }
}