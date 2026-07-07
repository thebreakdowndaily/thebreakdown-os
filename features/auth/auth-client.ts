import { getBrowserClient } from '@/supabase/client';
import type { User, SupabaseClient } from '@supabase/supabase-js';

let _lazySupabase: ReturnType<typeof getBrowserClient> | null = null;
export const supabase = new Proxy<SupabaseClient>({} as SupabaseClient, {
  get(_, prop) {
    if (!_lazySupabase) _lazySupabase = getBrowserClient();
    return (_lazySupabase as any)[prop];
  },
});

export { User };
export type Session = {
  user: {
    id: string;
    email: string;
    name: string;
    image?: string | null;
    emailVerified?: boolean;
    role?: string;
  };
  session: {
    id: string;
    expiresAt: number;
  };
};

export function mapUser(user: User) {
  return {
    id: user.id,
    email: user.email ?? '',
    name: user.user_metadata?.name || user.email?.split('@')[0] || '',
    image: user.user_metadata?.avatar_url || null,
    emailVerified: !!user.email_confirmed_at,
    role: user.user_metadata?.role || 'reader',
  };
}
