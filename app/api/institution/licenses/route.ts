import { NextResponse } from 'next/server';

const MAX_SEATS = 5;
let currentSeats: { email: string; role: string }[] = [];

export async function GET(request: Request) {
  const cookieHeader = request.headers.get('cookie') || '';
  if (!cookieHeader.includes('tb_supporter=true') || !cookieHeader.includes('tb_plan_type=institutional')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  return NextResponse.json({ seats: currentSeats, admin: 'admin@institution.com' });
}

export async function POST(request: Request) {
  const cookieHeader = request.headers.get('cookie') || '';
  if (!cookieHeader.includes('tb_supporter=true') || !cookieHeader.includes('tb_plan_type=institutional')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { email, role } = body;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
    }

    if (!role) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
    }

    if (currentSeats.length >= MAX_SEATS) {
      return NextResponse.json({ error: 'Total seat limit (5) reached' }, { status: 400 });
    }

    currentSeats.push({ email, role });

    return NextResponse.json({ success: true, email });
  } catch (err) {
    return NextResponse.json({ error: 'Bad Request' }, { status: 400 });
  }
}
