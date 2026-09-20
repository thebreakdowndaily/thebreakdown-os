import { NextResponse } from 'next/server';
import { rateLimiter } from '@/features/rate-limiting/limiter';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { planId, email } = body;

    // Validate inputs
    const validPlans = ['free', 'supporter', 'institutional'];
    if (!validPlans.includes(planId)) {
      return NextResponse.json({ success: false, error: 'Invalid planId' }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      return NextResponse.json({ success: false, error: 'Invalid email' }, { status: 400 });
    }

    // Rate limiting via centralized distributed limiter
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    const rateKey = `checkout:${email.toLowerCase()}:${ip}`;
    const rate = await rateLimiter.checkLimit({
      key: rateKey,
      tier: 'checkout',
      endpoint: '/api/checkout',
      ip,
    });

    if (!rate.allowed) {
      return rateLimiter.create429Response(rate);
    }

    // Simulate checkout success
    const checkoutUrl = `/membership/success?planId=${planId}&email=${encodeURIComponent(email)}`;
    
    const response = NextResponse.json({ success: true, checkoutUrl }, { status: 200 });
    rateLimiter.applyHeaders(response.headers, rate);
    return response;

  } catch {
    return NextResponse.json({ success: false, error: 'Bad Request' }, { status: 400 });
  }
}
