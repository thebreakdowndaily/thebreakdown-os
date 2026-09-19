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
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://dummy.supabase.co';
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'dummy-key';
  
  if (process.env.NODE_ENV !== 'production' && (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)) {
    console.warn('Supabase environment variables are missing. Using mock values.');
  }
  
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
let anonServerClient: ReturnType<typeof createClient<TypedDatabase>> | null = null;

export function getAnonClient(): SupabaseClient<TypedDatabase> {
  if (typeof window !== 'undefined') {
    return getBrowserClient();
  }
  if (!anonServerClient) {
    const { url, anonKey } = getConfig();
    anonServerClient = createClient<TypedDatabase>(url, anonKey, {
      auth: { persistSession: false },
    });
  }
  return anonServerClient;
}

/**
 * Returns an authoritative user-scoped Supabase client that preserves JWT context
 * and is constrained by PostgreSQL Row Level Security (RLS).
 */
export async function createUserScopedClient(): Promise<SupabaseClient<TypedDatabase>> {
  if (typeof window !== 'undefined') {
    return getBrowserClient();
  }

  try {
    const { cookies } = await import('next/headers');
    const cookieStore = await cookies();
    const { url, anonKey } = getConfig();
    return createServerClient<TypedDatabase>(url, anonKey, {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Read-only context (e.g. Server Component)
          }
        },
      },
    });
  } catch {
    // Outside request context (e.g. build-time or background execution)
    return getAnonClient();
  }
}

/**
 * Explicitly privileged Supabase client powered by SUPABASE_SERVICE_ROLE_KEY.
 * Bypasses RLS. Strictly forbidden in client/browser environments.
 */
export function createServiceClient(): SupabaseClient<TypedDatabase> {
  if (typeof window !== 'undefined') {
    throw new Error('createServiceClient() is strictly forbidden in client/browser environments.');
  }
  return getServiceClient();
}

export function getServiceClient(): SupabaseClient<TypedDatabase> {
  if (typeof window !== 'undefined') {
    throw new Error('getServiceClient() is strictly forbidden in client/browser environments.');
  }
  if (adminClient) return adminClient;
  const { url } = getConfig();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || 'dummy-admin-key';
  
  if (process.env.NODE_ENV !== 'production' && !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.warn('SUPABASE_SERVICE_ROLE_KEY is missing. Using mock values.');
  }
  
  adminClient = createClient<TypedDatabase>(url, key);
  return adminClient;
}

/**
 * Standard data-access client.
 * Enforces PostgreSQL Row-Level Security (RLS) by routing to user/anon scope.
 * Silent escalation to service_role is permanently eliminated.
 */
export function getSupabaseClient(): SupabaseClient<TypedDatabase> {
  if (typeof window === 'undefined') {
    return getAnonClient();
  }
  return getBrowserClient();
}
