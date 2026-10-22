import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { RepositoryFactory } from '@/services/factory/repository';

describe('RepositoryFactory Production Fail-Closed Safety', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it('permits Memory repository in development / test environments', () => {
    process.env.NODE_ENV = 'test';
    delete process.env.DATA_PROVIDER;
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;

    const repo = RepositoryFactory.getStoryRepository();
    expect(repo).toBeDefined();
  });

  it('fails closed when DATA_PROVIDER=memory in production environment', () => {
    process.env.NODE_ENV = 'production';
    process.env.DATA_PROVIDER = 'memory';
    delete process.env.NEXT_PUBLIC_BREAKDOWN_CI_STATIC_BUILD;

    expect(() => RepositoryFactory.getStoryRepository()).toThrow(
      /CRITICAL PRODUCTION SAFETY ERROR.*DATA_PROVIDER=memory is prohibited in production runtime/
    );
  });

  it('fails closed when Supabase credentials are missing in production environment', () => {
    process.env.NODE_ENV = 'production';
    delete process.env.DATA_PROVIDER;
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    delete process.env.NEXT_PUBLIC_BREAKDOWN_CI_STATIC_BUILD;

    expect(() => RepositoryFactory.getStoryRepository()).toThrow(
      /CRITICAL PRODUCTION SAFETY ERROR.*Missing required Supabase credentials/
    );
  });

  it('permits explicit static build marker (NEXT_PUBLIC_BREAKDOWN_CI_STATIC_BUILD=true) for CI prerendering', () => {
    process.env.NODE_ENV = 'production';
    process.env.DATA_PROVIDER = 'memory';
    process.env.NEXT_PUBLIC_BREAKDOWN_CI_STATIC_BUILD = 'true';

    const repo = RepositoryFactory.getStoryRepository();
    expect(repo).toBeDefined();
  });
});
