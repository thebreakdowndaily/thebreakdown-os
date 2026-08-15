import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { isDemoMode, DEMO_USER } from './demo';

export async function getSupabaseAuth() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll() } }
  );
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
    const { data: { session: s } } = await supabase.auth.getSession();
    if (!s) return null;
    return {
      user: {
        id: s.user.id,
        email: s.user.email ?? '',
        name: s.user.user_metadata?.name || s.user.email?.split('@')[0] || '',
        image: s.user.user_metadata?.avatar_url || null,
        role: s.user.user_metadata?.role || 'reader',
      },
      session: {
        id: s.user.id,
        expiresAt: s.expires_at ? s.expires_at * 1000 : 0,
      },
    };
  } catch {
    return null;
  }
}
