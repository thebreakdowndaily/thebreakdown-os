import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { safeRedirectPath } from '@/features/auth/redirect';

export const dynamic = 'force-dynamic';

const NO_STORE_HEADERS = {
  'Cache-Control': 'private, no-store, max-age=0',
  'X-Robots-Tag': 'noindex, nofollow',
};

function redirect(path: string, origin: string) {
  const response = NextResponse.redirect(new URL(safeRedirectPath(path), origin));
  Object.entries(NO_STORE_HEADERS).forEach(([name, value]) => response.headers.set(name, value));
  return response;
}

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const next = safeRedirectPath(requestUrl.searchParams.get('next'));
  const type = requestUrl.searchParams.get('type');

  if (code) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey =
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return new NextResponse('Authentication service unavailable', {
        status: 503,
        headers: NO_STORE_HEADERS,
      });
    }

    try {
      const cookieStore = await cookies();
      const supabase = createServerClient(supabaseUrl, supabaseKey, {
        cookies: {
          getAll: () => cookieStore.getAll(),
          setAll: (cookiesToSet) => {
            try {
              cookiesToSet.forEach(({ name, value, options }) => {
                cookieStore.set(name, value, options);
              });
            } catch {
              // Route Handlers normally allow cookie writes; fail closed below if exchange fails.
            }
          },
        },
      });

      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (error) {
        const loginUrl = new URL('/login', requestUrl.origin);
        loginUrl.searchParams.set('error', 'auth_callback_failed');
        return redirect(loginUrl.pathname + loginUrl.search, requestUrl.origin);
      }
    } catch {
      const loginUrl = new URL('/login', requestUrl.origin);
      loginUrl.searchParams.set('error', 'auth_callback_failed');
      return redirect(loginUrl.pathname + loginUrl.search, requestUrl.origin);
    }
  } else {
    // Do not silently treat an invalid/missing auth code as a successful callback.
    const loginUrl = new URL('/login', requestUrl.origin);
    loginUrl.searchParams.set('error', 'auth_callback_failed');
    return redirect(loginUrl.pathname + loginUrl.search, requestUrl.origin);
  }

  if (type === 'recovery') {
    return redirect('/reset-password', requestUrl.origin);
  }

  return redirect(next, requestUrl.origin);
}

export async function POST() {
  return NextResponse.json(
    { error: 'Not supported' },
    { status: 405, headers: NO_STORE_HEADERS }
  );
}
