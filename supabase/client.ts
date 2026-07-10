import { createServerClient } from '@supabase/ssr';
import { createBrowserClient } from '@supabase/ssr';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { GetAllCookies, SetAllCookies } from '@supabase/ssr';
import type { Database } from './schema';

type AddRelationships<T> = {
  [K in keyof T]: T[K] & { Relationships: [] }
}

export type TypedDatabase = {
  public: {
    Tables: AddRelationships<Database['public']['Tables']>;
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
};

function getConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) throw new Error('NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY must be set');
  return { url, anonKey };
}

let browserClient: ReturnType<typeof createBrowserClient<TypedDatabase>> | null = null;

export function getBrowserClient() {
  if (browserClient) return browserClient;
  const { url, anonKey } = getConfig();
  browserClient = createBrowserClient<TypedDatabase>(url, anonKey);
  return browserClient;
}

export function getServerClient(getAll: GetAllCookies, setAll?: SetAllCookies) {
  const { url, anonKey } = getConfig();
  return createServerClient<TypedDatabase>(url, anonKey, {
    cookies: { getAll, setAll: setAll || (async () => {}) },
  });
}

let adminClient: ReturnType<typeof createClient<TypedDatabase>> | null = null;

export function getServiceClient() {
  if (adminClient) return adminClient;
  const { url } = getConfig();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) throw new Error('SUPABASE_SERVICE_ROLE_KEY must be set');
  adminClient = createClient<TypedDatabase>(url, key);
  return adminClient;
}

import { cookies } from 'next/headers';

export function getSupabaseClient(): SupabaseClient<TypedDatabase> {
  // Safe request-bound server client mapping user cookies dynamically (respects RLS)
  if (typeof window === 'undefined') {
    try {
      return createServerClient<TypedDatabase>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            async getAll() {
              try {
                const cookieStore = await cookies();
                return cookieStore.getAll();
              } catch {
                return [];
              }
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
        }
      ) as unknown as SupabaseClient<TypedDatabase>;
    } catch {
      // Fallback client using anon key when outside a request context (e.g. static generation)
      return createClient<TypedDatabase>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      ) as unknown as SupabaseClient<TypedDatabase>;
    }
  }
  return getBrowserClient() as unknown as SupabaseClient<TypedDatabase>;
}
