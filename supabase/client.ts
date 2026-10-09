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
    Functions: Database['public']['Functions'];
    Enums: Record<string, never>;
  };
};

function getConfig() {
  const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const rawAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  const url = (rawUrl && typeof rawUrl === 'string' && rawUrl.trim() !== '' && rawUrl.startsWith('http'))
    ? rawUrl.trim()
    : 'https://mskyhaunnlwtwvsqcmav.supabase.co';

  const anonKey = (rawAnonKey && typeof rawAnonKey === 'string' && rawAnonKey.trim() !== '' && rawAnonKey.length > 20)
    ? rawAnonKey.trim()
    : 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1za3loYXVubmx3dHd2c3FjbWF2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA4NTc0MTUsImV4cCI6MjEwNjQzMzQxNX0.WmzLxHK_PujLsB57JW4qzosd4iOVKLOOU0acEoqb9_s';
  
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
 * Injects a service client instance for testing or server initialization.
 */
export function setServiceClient(client: SupabaseClient<TypedDatabase> | null): void {
  adminClient = client;
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
