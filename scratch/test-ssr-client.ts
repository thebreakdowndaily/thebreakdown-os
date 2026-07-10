import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export function getTestClient() {
  return createServerClient('https://example.supabase.co', 'key', {
    cookies: {
      async getAll() {
        const cookieStore = await cookies();
        return cookieStore.getAll();
      },
      async setAll(cookiesToSet) {
        try {
          const cookieStore = await cookies();
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // Safe to ignore on server components
        }
      }
    }
  });
}
