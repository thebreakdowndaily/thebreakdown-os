import { afterEach, describe, expect, it } from 'vitest';
import { EvidenceVaultService } from '../services/intelligence/evidence-vault.service';

const originalStagingDatabaseUrl = process.env.STAGING_DATABASE_URL;
const originalDatabaseUrl = process.env.DATABASE_URL;

afterEach(() => {
  if (originalStagingDatabaseUrl === undefined) delete process.env.STAGING_DATABASE_URL;
  else process.env.STAGING_DATABASE_URL = originalStagingDatabaseUrl;

  if (originalDatabaseUrl === undefined) delete process.env.DATABASE_URL;
  else process.env.DATABASE_URL = originalDatabaseUrl;
});

describe('Evidence Vault database configuration', () => {
  it('fails closed without an explicitly configured database URL', async () => {
    delete process.env.STAGING_DATABASE_URL;
    delete process.env.DATABASE_URL;

    const vault = new EvidenceVaultService();

    await expect(vault.findByRawSha256('0'.repeat(64))).rejects.toThrow(
      /Evidence vault database is not configured/
    );
  });
});
