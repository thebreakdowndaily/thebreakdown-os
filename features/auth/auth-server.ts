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
  const { data: { user: u } } = await supabase.auth.getUser();
  if (!u) return null;
  return {
    user: {
      id: u.id,
      email: u.email ?? '',
      name: u.user_metadata?.name || u.email?.split('@')[0] || '',
      image: u.user_metadata?.avatar_url || null,
      role: u.user_metadata?.role || 'reader',
    },
    session: {
      id: u.id,
      expiresAt: 0,
    },
  };
}
