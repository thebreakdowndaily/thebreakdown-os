import { createServerClient } from '@supabase/ssr';
import { createBrowserClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import type { GetAllCookies, SetAllCookies } from '@supabase/ssr';
import type { Database } from './schema';

function getConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) throw new Error('NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY must be set');
  return { url, anonKey };
}

let browserClient: ReturnType<typeof createBrowserClient<Database>> | null = null;

export function getBrowserClient() {
  if (browserClient) return browserClient;
  const { url, anonKey } = getConfig();
  browserClient = createBrowserClient<Database>(url, anonKey);
  return browserClient;
}

export function getServerClient(getAll: GetAllCookies, setAll?: SetAllCookies) {
  const { url, anonKey } = getConfig();
  return createServerClient<Database>(url, anonKey, {
    cookies: { getAll, setAll: setAll || (async () => {}) },
  });
}

let adminClient: ReturnType<typeof createClient<Database>> | null = null;

export function getServiceClient() {
  if (adminClient) return adminClient;
  const { url } = getConfig();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) throw new Error('SUPABASE_SERVICE_ROLE_KEY must be set');
  adminClient = createClient<Database>(url, key);
  return adminClient;
}

export function getSupabaseClient() {
  // Use service_role key for API routes (bypasses RLS)
  if (typeof window === 'undefined') {
    return getServiceClient();
  }
  return getBrowserClient();
}
