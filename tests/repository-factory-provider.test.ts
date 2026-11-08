import { afterEach, describe, expect, it, vi } from 'vitest';
import { RepositoryFactory } from '@/services/factory/repository';

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('RepositoryFactory production data-provider guard', () => {
  it('defaults to memory only outside production when provider is absent', () => {
    vi.stubEnv('DATA_PROVIDER', '');
    vi.stubEnv('VERCEL_ENV', 'preview');
    vi.stubEnv('APP_ENV', '');

    expect(RepositoryFactory.getDataProvider()).toBe('memory');
  });

  it('accepts an explicit Supabase provider in production', () => {
    vi.stubEnv('DATA_PROVIDER', 'supabase');
    vi.stubEnv('VERCEL_ENV', 'production');
    vi.stubEnv('APP_ENV', '');

    expect(RepositoryFactory.getDataProvider()).toBe('supabase');
  });

  it('rejects a missing provider in production', () => {
    vi.stubEnv('DATA_PROVIDER', '');
    vi.stubEnv('VERCEL_ENV', 'production');
    vi.stubEnv('APP_ENV', '');

    expect(() => RepositoryFactory.getDataProvider()).toThrow(
      'DATA_PROVIDER must be explicitly set to "supabase" in production'
    );
  });

  it('rejects memory storage in production', () => {
    vi.stubEnv('DATA_PROVIDER', 'memory');
    vi.stubEnv('VERCEL_ENV', '');
    vi.stubEnv('APP_ENV', 'production');

    expect(() => RepositoryFactory.getDataProvider()).toThrow(
      'DATA_PROVIDER="memory" is not allowed in production'
    );
  });

  it('rejects invalid provider values instead of silently selecting memory', () => {
    vi.stubEnv('DATA_PROVIDER', 'supabse');
    vi.stubEnv('VERCEL_ENV', 'preview');
    vi.stubEnv('APP_ENV', '');

    expect(() => RepositoryFactory.getDataProvider()).toThrow(
      'Invalid DATA_PROVIDER value; expected "memory" or "supabase".'
    );
  });
});
