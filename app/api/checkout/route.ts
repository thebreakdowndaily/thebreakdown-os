import { NextResponse } from 'next/server';

const rateLimitMap = new Map<string, number>();
const RATE_LIMIT_WINDOW_MS = 60000; // 1 minute

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

    // Rate limiting
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    const rateKey = `${email}-${ip}`;
    const now = Date.now();
    const lastRequestTime = rateLimitMap.get(rateKey);

    if (lastRequestTime && now - lastRequestTime < RATE_LIMIT_WINDOW_MS) {
      return NextResponse.json({ success: false, error: 'Rate limit exceeded' }, { status: 429 });
    }

    rateLimitMap.set(rateKey, now);

    // Simulate checkout success
    const checkoutUrl = `/membership/success?planId=${planId}&email=${encodeURIComponent(email)}`;
    
    return NextResponse.json({ success: true, checkoutUrl }, { status: 200 });

  } catch (error) {
    return NextResponse.json({ success: false, error: 'Bad Request' }, { status: 400 });
  }
}
