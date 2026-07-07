import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

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
}
