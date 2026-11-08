import { afterEach, describe, expect, it, vi } from 'vitest';
import { getServiceClient, setServiceClient } from '@/supabase/client';

afterEach(() => {
  setServiceClient(null);
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

describe('Supabase service-role client configuration', () => {
  it('fails closed when the service-role key is absent in production', () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('VERCEL_ENV', 'production');
    vi.stubEnv('APP_ENV', '');
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://example-project.supabase.co');
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'public-anon-key-for-tests-long-enough');
    vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', '');

    expect(() => getServiceClient()).toThrow(
      'SUPABASE_SERVICE_ROLE_KEY is required for privileged server-side database access in production.'
    );
  });

  it('does not silently use a dummy privileged key in a production-labelled app environment', () => {
    vi.stubEnv('NODE_ENV', 'test');
    vi.stubEnv('VERCEL_ENV', '');
    vi.stubEnv('APP_ENV', 'production');
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://example-project.supabase.co');
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'public-anon-key-for-tests-long-enough');
    vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', '');

    expect(() => getServiceClient()).toThrow(/SUPABASE_SERVICE_ROLE_KEY is required/);
  });

  it('retains the placeholder only outside production so tests can import isolated modules', () => {
    vi.stubEnv('NODE_ENV', 'test');
    vi.stubEnv('VERCEL_ENV', 'preview');
    vi.stubEnv('APP_ENV', '');
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://example-project.supabase.co');
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'public-anon-key-for-tests-long-enough');
    vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', '');
    vi.spyOn(console, 'warn').mockImplementation(() => {});

    expect(getServiceClient()).toBeTruthy();
  });
});
