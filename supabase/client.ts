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

export function getServiceClient() {
  if (adminClient) return adminClient;
  const { url } = getConfig();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || 'dummy-admin-key';
  
  if (process.env.NODE_ENV !== 'production' && !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.warn('SUPABASE_SERVICE_ROLE_KEY is missing. Using mock values.');
  }
  
  adminClient = createClient<TypedDatabase>(url, key);
  return adminClient;
}

export function getSupabaseClient(): SupabaseClient<TypedDatabase> {
  // Use service_role key for API routes (bypasses RLS)
  if (typeof window === 'undefined') {
    return getServiceClient() as unknown as SupabaseClient<TypedDatabase>;
  }
  return getBrowserClient() as unknown as SupabaseClient<TypedDatabase>;
}
