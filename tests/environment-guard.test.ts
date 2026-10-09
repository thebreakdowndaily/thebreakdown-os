import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { assertStagingEnvironment } from '@/lib/testing/environment-guard';

describe('assertStagingEnvironment', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('fails if STAGING_DATABASE_URL is missing', () => {
    delete process.env.STAGING_DATABASE_URL;
    process.env.STAGING_SUPABASE_URL = 'http://localhost:8000';
    expect(() => assertStagingEnvironment()).toThrow('STAGING_DATABASE_URL is explicitly required but missing.');
  });

  it('fails if STAGING_SUPABASE_URL is missing', () => {
    process.env.STAGING_DATABASE_URL = 'postgresql://localhost:5432/db';
    delete process.env.STAGING_SUPABASE_URL;
    expect(() => assertStagingEnvironment()).toThrow('STAGING_SUPABASE_URL is explicitly required but missing.');
  });

  it('fails if STAGING_DATABASE_URL points to production', () => {
    process.env.STAGING_DATABASE_URL = 'postgresql://postgres:pass@db.mskyhaunnlwtwvsqcmav.supabase.co:5432/postgres';
    process.env.STAGING_SUPABASE_URL = 'http://localhost:8000';
    expect(() => assertStagingEnvironment()).toThrow('STAGING_DATABASE_URL points to a known production host.');
  });

  it('fails if STAGING_SUPABASE_URL points to production', () => {
    process.env.STAGING_DATABASE_URL = 'postgresql://localhost:5432/db';
    process.env.STAGING_SUPABASE_URL = 'https://mskyhaunnlwtwvsqcmav.supabase.co';
    expect(() => assertStagingEnvironment()).toThrow('STAGING_SUPABASE_URL points to a known production host.');
  });

  it('passes if valid staging URLs are provided', () => {
    process.env.STAGING_DATABASE_URL = 'postgresql://staging-db:5432';
    process.env.STAGING_SUPABASE_URL = 'https://staging-supabase.co';
    expect(() => assertStagingEnvironment()).not.toThrow();
  });
});
