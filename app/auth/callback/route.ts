import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { safeRedirectPath } from '@/features/auth/redirect';

export const dynamic = 'force-dynamic';

const NO_STORE_HEADERS = {
  'Cache-Control': 'private, no-store, max-age=0',
  'X-Robots-Tag': 'noindex, nofollow',
};

function redirect(url: URL) {
  const response = NextResponse.redirect(url);
  Object.entries(NO_STORE_HEADERS).forEach(([name, value]) => response.headers.set(name, value));
  return response;
}

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const type = requestUrl.searchParams.get('type');
  const next = safeRedirectPath(requestUrl.searchParams.get('next'));

  const loginUrl = new URL('/login', requestUrl.origin);
  loginUrl.searchParams.set('error', 'auth_callback_failed');

  // The SSR callback must exchange a PKCE code server-side so the session is
  // persisted into cookies shared with Server Components and middleware.
  if (!code) return redirect(loginUrl);

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
            // Cookie writes can be unavailable in read-only render contexts.
            // This callback is a Route Handler, so normal requests should allow writes.
          }
        },
      },
    });

    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) return redirect(loginUrl);

    // Supabase's recovery link creates a valid session first; the reset screen
    // then asks the user to choose a new password.
    if (type === 'recovery') {
      return redirect(new URL('/reset-password', requestUrl.origin));
    }

    return redirect(new URL(next, requestUrl.origin));
  } catch {
    return redirect(loginUrl);
  }
}
