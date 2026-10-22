import { afterEach, describe, expect, it } from 'vitest';
import { EvidenceVaultService } from '../services/intelligence/evidence-vault.service';

const originalStagingDatabaseUrl = process.env.STAGING_DATABASE_URL;
const originalDatabaseUrl = process.env.DATABASE_URL;
const originalNodeEnv = process.env.NODE_ENV;

afterEach(() => {
  if (originalStagingDatabaseUrl === undefined) delete process.env.STAGING_DATABASE_URL;
  else process.env.STAGING_DATABASE_URL = originalStagingDatabaseUrl;

  if (originalDatabaseUrl === undefined) delete process.env.DATABASE_URL;
  else process.env.DATABASE_URL = originalDatabaseUrl;

  if (originalNodeEnv === undefined) delete process.env.NODE_ENV;
  else process.env.NODE_ENV = originalNodeEnv;
});

describe('Evidence Vault database configuration', () => {
  it('fails closed without an explicitly configured database URL', () => {
    delete process.env.STAGING_DATABASE_URL;
    delete process.env.DATABASE_URL;

    expect(() => new EvidenceVaultService()).toThrow(/requires an explicit database URL/);
  });

  it('rejects the production database host even when supplied as a staging URL', () => {
    process.env.NODE_ENV = 'test';
    delete process.env.DATABASE_URL;
    process.env.STAGING_DATABASE_URL =
      'postgresql://postgres:test-password@db.lvfovvidtowadmnggzzf.supabase.co:5432/postgres';

    expect(() => new EvidenceVaultService()).toThrow(/Production database targeted/);
  });
});
