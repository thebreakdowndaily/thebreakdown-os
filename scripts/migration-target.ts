/**
 * Safe target selection for one-off migration application scripts.
 *
 * These scripts deliberately cannot target production. Production migrations
 * must use the reviewed release/deployment workflow, not a developer's local
 * DATABASE_URL. Requires a dedicated URL, explicit target, and acknowledgement.
 */
export function resolveMigrationDatabaseUrl(): string {
  const dbUrl = process.env.MIGRATION_DATABASE_URL || process.env.TEST_DATABASE_URL;
  if (!dbUrl) {
    throw new Error(
      'Migration blocked: configure MIGRATION_DATABASE_URL or TEST_DATABASE_URL. DATABASE_URL is deliberately not accepted.'
    );
  }

  const target = process.env.MIGRATION_TARGET;
  if (target !== 'test' && target !== 'staging') {
    throw new Error(
      "Migration blocked: set MIGRATION_TARGET='test' or 'staging'. Production is not supported by these one-off scripts."
    );
  }

  const expectedAcknowledgement =
    target === 'test' ? 'I_UNDERSTAND_TEST_MIGRATION' : 'I_UNDERSTAND_STAGING_MIGRATION';
  if (process.env.CONFIRM_MIGRATION_TARGET !== expectedAcknowledgement) {
    throw new Error(
      `Migration blocked: set CONFIRM_MIGRATION_TARGET=${expectedAcknowledgement} to explicitly acknowledge this target.`
    );
  }

  let parsed: URL;
  try {
    parsed = new URL(dbUrl);
  } catch {
    throw new Error('Migration blocked: migration database URL is invalid.');
  }

  if (parsed.protocol !== 'postgres:' && parsed.protocol !== 'postgresql:') {
    throw new Error('Migration blocked: only PostgreSQL URLs are supported.');
  }

  // The production Supabase project is always blocked from these manual scripts.
  if (
    parsed.hostname.includes('lvfovvidtowadmnggzzf') ||
    parsed.hostname === 'db.lvfovvidtowadmnggzzf.supabase.co'
  ) {
    throw new Error('Migration blocked: production database URL cannot be used by a one-off migration script.');
  }

  console.log(`Migration target confirmed: ${target} (${parsed.hostname})`);
  return dbUrl;
}
