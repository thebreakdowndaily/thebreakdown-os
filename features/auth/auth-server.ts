import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { isDemoMode, DEMO_USER } from './demo';

export async function getSupabaseAuth() {
  const cookieStore = await cookies();
  const configuredUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const configuredKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Never silently connect a production deployment to placeholder credentials.
  // Local tests/demo mode retain an inert placeholder client when Auth is absent.
  if (!configuredUrl || !configuredKey) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Supabase Auth is not configured: set NEXT_PUBLIC_SUPABASE_URL and a publishable/anon key.');
    }
    return createServerClient(
      'https://placeholder.supabase.co',
      'placeholder-key-for-development-only',
      { cookies: { getAll: () => cookieStore.getAll() } }
    );
  }

  return createServerClient(configuredUrl, configuredKey, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (cookiesToSet) => {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Server Components can be read-only; middleware refreshes sessions.
        }
      },
    },
  });
}

export interface AuthSession {
  user: {
    id: string;
    email: string;
    name: string;
    image?: string | null;
    role?: string;
  };
  session: {
    id: string;
    expiresAt: number;
  };
}

export async function getSession(): Promise<AuthSession | null> {
  // Demo mode (no Supabase configured, non-production): the server presents
  // the same demo identity the client SessionProvider builds, so the whole
  // intel surface is navigable in local development. Never reachable in
  // production because isDemoMode() requires NODE_ENV !== 'production'.
  if (isDemoMode()) {
    return {
      user: {
        id: DEMO_USER.id,
        email: DEMO_USER.email,
        name: DEMO_USER.name,
        image: DEMO_USER.image,
        role: DEMO_USER.role,
      },
      session: {
        id: DEMO_USER.id,
        expiresAt: Date.now() + 86400000,
      },
    };
  }

  try {
    const supabase = await getSupabaseAuth();
    // Validate cryptographic JWT signature on the server via getUser()
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) return null;

    // Retrieve active session metadata for expiration timestamp
    const { data: { session: s } } = await supabase.auth.getSession();

    // Sourced strictly from database user_roles, falling back to server-controlled app_metadata
    let authoritativeRole = (user.app_metadata.role as string | undefined) ?? 'reader';
    try {
      const { data: dbRole } = (await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .maybeSingle()) as { data: { role?: string } | null };
      if (typeof dbRole?.role === 'string') {
        authoritativeRole = dbRole.role;
      }
    } catch {
      // Keep app_metadata fallback
    }

    return {
      user: {
        id: user.id,
        email: user.email ?? '',
        name: (user.user_metadata.name as string | undefined) || user.email?.split('@')[0] || '',
        image: (user.user_metadata.avatar_url as string | undefined) || null,
        role: authoritativeRole,
      },
      session: {
        id: user.id,
        expiresAt: s?.expires_at ? s.expires_at * 1000 : Date.now() + 3600000,
      },
    };
  } catch {
    return null;
  }
}
