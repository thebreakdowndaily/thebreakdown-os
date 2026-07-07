import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const next = url.searchParams.get('next') || '/dashboard';
  const type = url.searchParams.get('type');

  if (code) {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { getAll: () => cookieStore.getAll() } }
    );
    await supabase.auth.exchangeCodeForSession(code);
  }

  if (type === 'recovery') {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.redirect(new URL(next, request.url));
}

export async function POST() {
  return NextResponse.json({ error: 'Not supported' }, { status: 405 });
}
