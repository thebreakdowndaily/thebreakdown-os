import { auth } from '@/features/auth/auth-server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as { name: string; email: string; password: string };
    const headers = new Headers(request.headers);
    const response = await auth.api.signUpEmail({ body, headers });
    return NextResponse.json(response, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Could not create account';
    return NextResponse.json(
      { error: 'Registration failed', message },
      { status: 400 }
    );
  }
}
