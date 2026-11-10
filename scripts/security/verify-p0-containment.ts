/**
 * P0 staging security containment — live, read-only verifier (Issue #90).
 *
 * Proves the post-migration privilege matrix on a real Supabase project. This
 * script never writes: it only reads pg_catalog and calls
 * has_function_privilege / has_table_privilege / has_schema_privilege.
 *
 * Usage:
 *   npx tsx scripts/security/verify-p0-containment.ts --env staging
 *   npx tsx scripts/security/verify-p0-containment.ts --env production --allow-production
 *   npx tsx scripts/security/verify-p0-containment.ts --database-url "$STAGING_DATABASE_URL"
 *
 * Exit codes: 0 = all required checks pass, 1 = a required check failed or the
 * target was refused, 2 = connection/configuration error.
 *
 * Run it against staging first. Do not point it at production until the staging
 * matrix and the application smoke tests in
 * docs/security/2026-11-10-p0-staging-containment.md pass.
 */

import { Client } from 'pg';

type Outcome = 'PASS' | 'FAIL' | 'SKIP' | 'WARN';

interface Check {
  name: string;
  outcome: Outcome;
  detail?: string;
}

const checks: Check[] = [];

function record(outcome: Outcome, name: string, detail?: string) {
  checks.push({ name, outcome, detail });
  const icon = outcome === 'PASS' ? '✓' : outcome === 'FAIL' ? '✗' : outcome === 'WARN' ? '!' : '-';
  console.log(`  ${icon} ${outcome.padEnd(4)} ${name}${detail ? ` — ${detail}` : ''}`);
}

function requireEnv(name: string): string | undefined {
  const value = process.env[name];
  return value && value.trim() ? value.trim() : undefined;
}

function projectRefOf(connectionString: string): string {
  try {
    return new URL(connectionString).hostname.split('.')[0];
  } catch {
    return '(unparseable)';
  }
}

function argValue(flag: string): string | undefined {
  const idx = process.argv.indexOf(flag);
  return idx >= 0 ? process.argv[idx + 1] : undefined;
}

const SENSITIVE_FUNCTIONS: Array<{
  signature: string;
  required: Record<string, boolean>;
}> = [
  // Destructive delete: owner-only.
  {
    signature: 'public.delete_story_cascading(uuid)',
    required: { anon: false, authenticated: false, service_role: false, publisher_worker: false },
  },
  // Claim verification: trusted server only.
  {
    signature: 'editorial.record_claim_verification_atomic(uuid, uuid, uuid, text, text, uuid[])',
    required: { anon: false, authenticated: false, publisher_worker: false, service_role: true },
  },
  // Legacy direct publication: retired for every application role.
  {
    signature: 'public.publish_story_atomic(uuid, uuid, integer)',
    required: { anon: false, authenticated: false, service_role: false, publisher_worker: false },
  },
  // Scheduled publisher: publisher_worker only.
  {
    signature: 'public.fn_publish_story_with_audit(uuid)',
    required: { anon: false, authenticated: false, service_role: false, publisher_worker: true },
  },
  {
    signature: 'public.fn_claim_due_schedule_entry()',
    required: { anon: false, authenticated: false, service_role: false, publisher_worker: true },
  },
];

const INTERNAL_TABLES: Array<[string, string]> = [
  ['editorial', 'sources'],
  ['editorial', 'claims'],
  ['editorial', 'claim_citations'],
  ['editorial', 'claim_verifications'],
  ['editorial', 'claim_verification_evidence'],
  ['editorial', 'story_claims'],
  ['editorial', 'evidence_items'],
  ['audit', 'published_story_snapshots'],
  ['audit', 'story_versions'],
  ['audit', 'activity_log'],
];

const DENY_POLICY = 'p0_deny_client_access';

async function main() {
  const env = argValue('--env') ?? 'staging';
  const explicitUrl = argValue('--database-url');
  const allowProduction = process.argv.includes('--allow-production');

  const connectionString =
    explicitUrl ??
    (env === 'production'
      ? requireEnv('DATABASE_URL')
      : requireEnv('STAGING_DATABASE_URL') ?? requireEnv('DATABASE_URL'));

  if (!connectionString) {
    console.error(
      `No database URL configured for "${env}". Set STAGING_DATABASE_URL or DATABASE_URL, or pass --database-url.`
    );
    process.exit(2);
  }

  const ref = projectRefOf(connectionString);
  const expectedProductionRef = requireEnv('EXPECTED_PROJECT_REF');

  if (env !== 'staging' && !allowProduction) {
    console.error(
      `Refusing to verify "${ref}" as "${env}" without --allow-production. This script is read-only, but production verification is a reviewed step.`
    );
    process.exit(2);
  }

  console.log('───────────────────────────────────────────────────────');
  console.log('P0 containment verification (read-only)');
  console.log(`Target: ${ref}  env=${env}`);
  if (expectedProductionRef) console.log(`EXPECTED_PROJECT_REF: ${expectedProductionRef}`);
  console.log('───────────────────────────────────────────────────────\n');

  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 15_000,
    statement_timeout: 15_000,
    application_name: 'p0-containment-verifier',
  });

  try {
    await client.connect();
  } catch (error) {
    console.error(`Connection failed: ${(error as Error).message}`);
    process.exit(2);
  }

  try {
    // 1. Migration ledger
    console.log('1. Migration ledger');
    try {
      const ledger = await client.query(
        "SELECT version, name FROM supabase_migrations.schema_migrations WHERE version = '037'"
      );
      if (ledger.rowCount === 1) {
        record('PASS', 'migration 037 recorded', ledger.rows[0].name ?? '(unnamed)');
      } else {
        record('FAIL', 'migration 037 not recorded');
      }
    } catch (error) {
      record('WARN', 'migration ledger unavailable', (error as Error).message);
    }

    // 2. Function ACLs
    console.log('\n2. Function ACLs');
    const functions = await client.query(`
      SELECT n.nspname AS schema,
             p.proname AS name,
             pg_get_function_identity_arguments(p.oid) AS args,
             p.oid AS oid,
             has_function_privilege('anon', p.oid, 'EXECUTE') AS anon,
             has_function_privilege('authenticated', p.oid, 'EXECUTE') AS authenticated,
             has_function_privilege('service_role', p.oid, 'EXECUTE') AS service_role,
             has_function_privilege('publisher_worker', p.oid, 'EXECUTE') AS publisher_worker
      FROM pg_proc p
      JOIN pg_namespace n ON n.oid = p.pronamespace
      WHERE (n.nspname = 'public' AND p.proname IN (
               'delete_story_cascading', 'publish_story_atomic',
               'fn_publish_story_with_audit', 'fn_claim_due_schedule_entry'))
         OR (n.nspname = 'editorial' AND p.proname = 'record_claim_verification_atomic')
    `);

    const bySignature = new Map<string, Record<string, boolean>>();
    for (const row of functions.rows) {
      const key = `${row.schema}.${row.name}(${row.args})`;
      bySignature.set(key, {
        anon: row.anon,
        authenticated: row.authenticated,
        service_role: row.service_role,
        publisher_worker: row.publisher_worker,
      });
    }

    for (const target of SENSITIVE_FUNCTIONS) {
      const actual = bySignature.get(target.signature);
      if (!actual) {
        record('SKIP', `${target.signature} absent on this project`);
        continue;
      }
      for (const [role, expected] of Object.entries(target.required)) {
        const granted = actual[role];
        if (granted === expected) {
          record('PASS', `${role} ${expected ? 'keeps' : 'lacks'} EXECUTE on ${target.signature}`);
        } else {
          record(
            'FAIL',
            `${role} ${expected ? 'lacks' : 'still has'} EXECUTE on ${target.signature}`,
            `got ${granted}`
          );
        }
      }
    }

    // 3. Schema usage
    console.log('\n3. Schema USAGE');
    for (const schema of ['editorial', 'audit']) {
      const exists = await client.query('SELECT to_regnamespace($1) AS oid', [schema]);
      if (!exists.rows[0].oid) {
        record('SKIP', `schema ${schema} absent`);
        continue;
      }
      const usage = await client.query(
        `SELECT
           has_schema_privilege('anon', $1, 'USAGE') AS anon,
           has_schema_privilege('authenticated', $1, 'USAGE') AS authenticated,
           has_schema_privilege('service_role', $1, 'USAGE') AS service_role`,
        [schema]
      );
      const row = usage.rows[0];
      record(row.anon === false ? 'PASS' : 'FAIL', `anon lacks ${schema} USAGE`);
      record(row.authenticated === false ? 'PASS' : 'FAIL', `authenticated lacks ${schema} USAGE`);
      record(row.service_role === true ? 'PASS' : 'FAIL', `service_role has ${schema} USAGE`);
    }

    // 4. Tables, RLS and deny policies
    console.log('\n4. Internal tables');
    for (const [schema, table] of INTERNAL_TABLES) {
      const exists = await client.query('SELECT to_regclass($1) AS oid', [`${schema}.${table}`]);
      if (!exists.rows[0].oid) {
        record('SKIP', `${schema}.${table} absent on this project`);
        continue;
      }

      const result = await client.query(
        `SELECT
           has_table_privilege('anon', $1, 'SELECT') AS anon_select,
           has_table_privilege('anon', $1, 'INSERT') AS anon_insert,
           has_table_privilege('anon', $1, 'UPDATE') AS anon_update,
           has_table_privilege('anon', $1, 'DELETE') AS anon_delete,
           has_table_privilege('authenticated', $1, 'SELECT') AS auth_select,
           has_table_privilege('authenticated', $1, 'INSERT') AS auth_insert,
           has_table_privilege('authenticated', $1, 'UPDATE') AS auth_update,
           has_table_privilege('authenticated', $1, 'DELETE') AS auth_delete,
           (SELECT relrowsecurity FROM pg_class WHERE oid = $1::regclass) AS rls,
           (SELECT count(*) FROM pg_policies
             WHERE schemaname = $2 AND tablename = $3
               AND policyname = $4 AND permissive = 'RESTRICTIVE') AS deny_policy`,
        [`${schema}.${table}`, schema, table, DENY_POLICY]
      );
      const row = result.rows[0];

      const anonClosed =
        row.anon_select === false && row.anon_insert === false && row.anon_update === false && row.anon_delete === false;
      const authClosed =
        row.auth_select === false && row.auth_insert === false && row.auth_update === false && row.auth_delete === false;

      record(anonClosed ? 'PASS' : 'FAIL', `anon has no table privileges on ${schema}.${table}`);
      record(authClosed ? 'PASS' : 'FAIL', `authenticated has no table privileges on ${schema}.${table}`);
      record(row.rls === true ? 'PASS' : 'FAIL', `RLS enabled on ${schema}.${table}`);
      record(Number(row.deny_policy) === 1 ? 'PASS' : 'FAIL', `restrictive deny policy on ${schema}.${table}`);
    }
  } finally {
    await client.end().catch(() => {});
  }

  const failures = checks.filter((c) => c.outcome === 'FAIL');
  const warnings = checks.filter((c) => c.outcome === 'WARN');
  const skips = checks.filter((c) => c.outcome === 'SKIP');
  const passes = checks.filter((c) => c.outcome === 'PASS');

  console.log('\n───────────────────────────────────────────────────────');
  console.log(`Result: ${passes.length} passed, ${failures.length} failed, ${skips.length} skipped, ${warnings.length} warnings`);
  if (failures.length > 0) {
    console.log('\nRequired checks failed:');
    for (const f of failures) console.log(`  - ${f.name}${f.detail ? ` (${f.detail})` : ''}`);
    process.exit(1);
  }
  console.log('P0 containment matrix: PASSED');
  console.log('───────────────────────────────────────────────────────');
}

main().catch((error) => {
  console.error('Verifier crashed:', error);
  process.exit(2);
});
