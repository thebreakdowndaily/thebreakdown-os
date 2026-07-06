import { auth } from '@/features/auth/auth-server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const headers = new Headers(request.headers);
    const response = await auth.api.signOut({ headers });
    return NextResponse.json(response);
  } catch {
    return NextResponse.json({ error: 'Sign out failed' }, { status: 500 });
  }
}
