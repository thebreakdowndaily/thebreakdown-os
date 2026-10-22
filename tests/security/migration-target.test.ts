import { afterEach, describe, expect, it, vi } from 'vitest';
import { resolveMigrationDatabaseUrl } from '../../scripts/migration-target';

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('manual migration target guard', () => {
  it('does not fall back to the generic DATABASE_URL', () => {
    vi.stubEnv('MIGRATION_DATABASE_URL', '');
    vi.stubEnv('TEST_DATABASE_URL', '');
    vi.stubEnv('DATABASE_URL', 'postgresql://user:pass@localhost:5432/production');
    vi.stubEnv('MIGRATION_TARGET', 'test');
    vi.stubEnv('CONFIRM_MIGRATION_TARGET', 'I_UNDERSTAND_TEST_MIGRATION');

    expect(() => resolveMigrationDatabaseUrl()).toThrow(/DATABASE_URL is deliberately not accepted/);
  });

  it('accepts a dedicated test URL only with explicit target acknowledgement', () => {
    vi.stubEnv('MIGRATION_DATABASE_URL', 'postgresql://tester:tester@localhost:5432/testdb');
    vi.stubEnv('TEST_DATABASE_URL', '');
    vi.stubEnv('MIGRATION_TARGET', 'test');
    vi.stubEnv('CONFIRM_MIGRATION_TARGET', 'I_UNDERSTAND_TEST_MIGRATION');

    expect(resolveMigrationDatabaseUrl()).toBe('postgresql://tester:tester@localhost:5432/testdb');
  });

  it('rejects a missing acknowledgement', () => {
    vi.stubEnv('MIGRATION_DATABASE_URL', 'postgresql://tester:tester@localhost:5432/testdb');
    vi.stubEnv('MIGRATION_TARGET', 'test');
    vi.stubEnv('CONFIRM_MIGRATION_TARGET', '');

    expect(() => resolveMigrationDatabaseUrl()).toThrow(/explicitly acknowledge this target/);
  });

  it('rejects production as a target', () => {
    vi.stubEnv('MIGRATION_DATABASE_URL', 'postgresql://tester:tester@localhost:5432/testdb');
    vi.stubEnv('MIGRATION_TARGET', 'production');
    vi.stubEnv('CONFIRM_MIGRATION_TARGET', 'I_UNDERSTAND_PRODUCTION_MIGRATION');

    expect(() => resolveMigrationDatabaseUrl()).toThrow(/Production is not supported/);
  });

  it('rejects the known production Supabase project even if a staging target is declared', () => {
    vi.stubEnv('MIGRATION_DATABASE_URL', 'postgresql://tester:tester@db.lvfovvidtowadmnggzzf.supabase.co:5432/postgres');
    vi.stubEnv('MIGRATION_TARGET', 'staging');
    vi.stubEnv('CONFIRM_MIGRATION_TARGET', 'I_UNDERSTAND_STAGING_MIGRATION');

    expect(() => resolveMigrationDatabaseUrl()).toThrow(/production database URL cannot be used/);
  });
});
