import { afterEach, describe, expect, it, vi } from 'vitest';

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});

describe('RepositoryFactory production fail-closed contract', () => {
  async function repositoryFactory() {
    const module = await import('@/services/factory/repository');
    return module.RepositoryFactory;
  }

  it('rejects a memory provider in the production runtime even when CI=true', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('CI', 'true');
    vi.stubEnv('VERCEL_ENV', 'production');
    vi.stubEnv('APP_ENV', '');
    vi.stubEnv('NEXT_PHASE', '');
    vi.stubEnv('DATA_PROVIDER', 'memory');

    const factory = await repositoryFactory();
    expect(() => factory.getStoryRepository()).toThrow(/not durable/);
  });

  it('rejects an implicit provider in production', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('CI', 'false');
    vi.stubEnv('VERCEL_ENV', 'production');
    vi.stubEnv('APP_ENV', '');
    vi.stubEnv('NEXT_PHASE', '');
    vi.stubEnv('DATA_PROVIDER', '');

    const factory = await repositoryFactory();
    expect(() => factory.getStoryRepository()).toThrow(/requires explicit DATA_PROVIDER/);
  });

  it('rejects a Supabase provider without a service-role key in production', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('VERCEL_ENV', 'production');
    vi.stubEnv('APP_ENV', '');
    vi.stubEnv('NEXT_PHASE', '');
    vi.stubEnv('DATA_PROVIDER', 'supabase');
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://example-project.supabase.co');
    vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', '');

    const factory = await repositoryFactory();
    expect(() => factory.getStoryRepository()).toThrow(/SUPABASE_SERVICE_ROLE_KEY/);
  });

  it('allows memory selection during the explicit Next.js production build phase', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('VERCEL_ENV', '');
    vi.stubEnv('APP_ENV', '');
    vi.stubEnv('NEXT_PHASE', 'phase-production-build');
    vi.stubEnv('DATA_PROVIDER', 'memory');

    const factory = await repositoryFactory();
    expect(() => factory.getStoryRepository()).not.toThrow();
  });
});
