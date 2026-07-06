import { auth } from '@/features/auth/auth-server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as { email: string; password: string };
    const headers = new Headers(request.headers);
    const response = await auth.api.signInEmail({ body, headers });
    return NextResponse.json(response);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Invalid credentials';
    return NextResponse.json(
      { error: 'Authentication failed', message },
      { status: 401 }
    );
  }
}
