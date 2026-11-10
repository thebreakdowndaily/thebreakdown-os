/**
 * P0 staging security containment — migration 037 regression harness.
 *
 * Applies the real migration file to an isolated PostgreSQL cluster with
 * Supabase-compatible roles and stubs for the staging-only objects, simulating
 * the recorded grant drift first. Then proves, at the storage layer:
 *
 * 1. anon/authenticated cannot execute the destructive delete RPC;
 * 2. anon/authenticated cannot forge claim verification (service_role can);
 * 3. anon/authenticated cannot read internal editorial/audit tables, and RLS
 *    denies them even if a stray permissive policy is added later;
 * 4. legacy publication RPCs are retired for clients while publisher_worker
 *    keeps the scheduled-publish RPCs;
 * 5. unrelated function grants are untouched;
 * 6. the migration is idempotent and contains no destructive DDL/DML.
 *
 * Issue #90. Run with: npx tsx tests/security/p0-containment-migration.test.ts
 */

import EmbeddedPostgres from 'embedded-postgres';
import * as fs from 'fs';
import * as net from 'net';
import * as os from 'os';
import * as path from 'path';
import type { Client } from 'pg';

let passed = 0;
let failed = 0;

function assert(condition: boolean, message: string) {
  if (condition) {
    console.log(`  ✓ PASS: ${message}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${message}`);
    failed++;
  }
}

function freePort(): Promise<number> {
  return new Promise((resolve, reject) => {
    const srv = net.createServer();
    srv.listen(0, () => {
      const port = (srv.address() as net.AddressInfo).port;
      srv.close(() => resolve(port));
    });
    srv.on('error', reject);
  });
}

const TABLES: Array<[string, string]> = [
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

const STUB_SQL = `
  DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN
      CREATE ROLE anon NOLOGIN NOINHERIT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN
      CREATE ROLE authenticated NOLOGIN NOINHERIT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'service_role') THEN
      CREATE ROLE service_role NOLOGIN NOINHERIT BYPASSRLS;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'publisher_worker') THEN
      CREATE ROLE publisher_worker NOLOGIN NOINHERIT;
    END IF;
  END $$;

  CREATE SCHEMA IF NOT EXISTS editorial;
  CREATE SCHEMA IF NOT EXISTS audit;

  -- Internal research tables (sub-set of columns is enough for ACL tests).
  CREATE TABLE editorial.sources (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), title text);
  CREATE TABLE editorial.claims (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), status text);
  CREATE TABLE editorial.claim_citations (id uuid PRIMARY KEY DEFAULT gen_random_uuid());
  CREATE TABLE editorial.claim_verifications (id uuid PRIMARY KEY DEFAULT gen_random_uuid());
  CREATE TABLE editorial.claim_verification_evidence (claim_id uuid);
  CREATE TABLE editorial.story_claims (story_id uuid, claim_id uuid);
  CREATE TABLE editorial.evidence_items (id uuid PRIMARY KEY DEFAULT gen_random_uuid());

  -- Audit tables. Simulate the drift: snapshot table with RLS disabled.
  CREATE TABLE audit.published_story_snapshots (id uuid PRIMARY KEY DEFAULT gen_random_uuid());
  CREATE TABLE audit.story_versions (id uuid PRIMARY KEY DEFAULT gen_random_uuid());
  CREATE TABLE audit.activity_log (id uuid PRIMARY KEY DEFAULT gen_random_uuid());

  -- Stubs for the staging-only functions, with the exact signatures.
  CREATE FUNCTION public.delete_story_cascading(uuid) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER AS $$ BEGIN END $$;

  CREATE FUNCTION editorial.record_claim_verification_atomic(uuid, uuid, uuid, text, text, uuid[]) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER AS $$ BEGIN END $$;

  CREATE FUNCTION public.publish_story_atomic(uuid, uuid, integer) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER AS $$ BEGIN END $$;

  CREATE FUNCTION public.fn_publish_story_with_audit(uuid) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER AS $$ BEGIN END $$;

  CREATE FUNCTION public.fn_claim_due_schedule_entry(OUT schedule_id uuid, OUT claimed_story_id uuid) RETURNS record
    LANGUAGE plpgsql SECURITY DEFINER AS $$ BEGIN END $$;

  -- Control: an unrelated SECURITY DEFINER helper that must keep its grant.
  CREATE FUNCTION public.current_app_role() RETURNS text
    LANGUAGE sql STABLE SECURITY DEFINER AS $$ SELECT 'guest'::text $$;

  INSERT INTO editorial.claims (status) VALUES ('verified'), ('unverified');

  -- ── Simulate the recorded staging drift ──────────────────────────────────
  GRANT USAGE ON SCHEMA editorial, audit TO anon, authenticated, service_role;

  GRANT ALL ON FUNCTION public.delete_story_cascading(uuid) TO PUBLIC, anon, authenticated, service_role;
  GRANT ALL ON FUNCTION editorial.record_claim_verification_atomic(uuid, uuid, uuid, text, text, uuid[]) TO PUBLIC, anon, authenticated, service_role, publisher_worker;
  GRANT ALL ON FUNCTION public.publish_story_atomic(uuid, uuid, integer) TO PUBLIC, anon, authenticated, service_role;
  GRANT ALL ON FUNCTION public.fn_publish_story_with_audit(uuid) TO PUBLIC, anon, authenticated, service_role, publisher_worker;
  GRANT ALL ON FUNCTION public.fn_claim_due_schedule_entry() TO PUBLIC, anon, authenticated, service_role, publisher_worker;
  GRANT EXECUTE ON FUNCTION public.current_app_role() TO PUBLIC, anon, authenticated;

  GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA editorial TO anon, authenticated;
  GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA audit TO anon, authenticated;
  GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA editorial, audit TO service_role;

  ALTER TABLE editorial.claims ENABLE ROW LEVEL SECURITY;
  CREATE POLICY public_read_claims ON editorial.claims FOR SELECT TO anon, authenticated USING (true);
`;

async function actAs(client: Client, role: 'anon' | 'authenticated' | 'service_role') {
  await client.query('RESET ROLE');
  await client.query(`SET LOCAL role ${role}`);
}

async function run() {
  const port = await freePort();
  const dbDir = path.join(os.tmpdir(), 'breakdown-p0-containment-' + Date.now());
  const pg = new EmbeddedPostgres({
    databaseDir: dbDir,
    port,
    user: 'postgres',
    password: 'p0-test-pw',
    persistent: false,
    initdbFlags: ['--locale=C', '--encoding=UTF8'],
    onLog: () => {},
    onError: () => {},
  });

  let client: Client | null = null;

  try {
    console.log('───────────────────────────────────────────────────────');
    console.log('P0 Containment Migration 037 — direct PostgreSQL test');
    console.log('───────────────────────────────────────────────────────\n');

    await pg.initialise();
    await pg.start();
    client = pg.getPgClient();
    await client.connect();
    await client.query(STUB_SQL);

    const migrationPath = path.resolve(
      process.cwd(),
      'supabase/migrations/037_p0_staging_security_containment.sql'
    );
    const sql = fs.readFileSync(migrationPath, 'utf8');

    // ── Static guarantees ────────────────────────────────────────────────
    console.log('0. Migration file static checks');
    const executableSql = sql
      .replace(/--[^\n]*/g, '')
      .replace(/\/\*[\s\S]*?\*\//g, '');
    assert(!/\bDROP\s+TABLE\b/i.test(executableSql), 'Migration contains no DROP TABLE');
    assert(!/\bDROP\s+FUNCTION\b/i.test(executableSql), 'Migration contains no DROP FUNCTION');
    assert(!/\bTRUNCATE\b/i.test(executableSql), 'Migration contains no TRUNCATE');
    assert(!/\bDELETE\s+FROM\b/i.test(executableSql), 'Migration contains no DELETE FROM');
    assert(!/\bDROP\s+POLICY\b/i.test(executableSql.replace(/DROP POLICY IF EXISTS/gi, '')), 'Only idempotent DROP POLICY IF EXISTS is used');
    assert(!/GRANT\s+ALL\s+ON\s+TABLE/i.test(executableSql), 'Migration never grants table privileges');
    assert(/to_regprocedure\('public\.delete_story_cascading\(uuid\)'\)/.test(sql), 'Delete RPC change is existence-guarded');
    assert(/AS RESTRICTIVE/.test(sql), 'RLS deny policies are restrictive');

    // ── Apply twice for idempotency ──────────────────────────────────────
    console.log('\n1. Applying migration 037 twice (idempotency)');
    await client.query(sql);
    assert(true, 'First application succeeded');
    await client.query(sql);
    assert(true, 'Second application succeeded');

    // ── Function ACLs ───────────────────────────────────────────────────
    console.log('\n2. Destructive delete RPC is owner-only');
    for (const role of ['anon', 'authenticated', 'service_role'] as const) {
      const r = await client.query(
        `SELECT has_function_privilege($1, 'public.delete_story_cascading(uuid)', 'EXECUTE') AS ok`,
        [role]
      );
      assert(r.rows[0].ok === false, `${role} cannot execute delete_story_cascading`);
    }

    console.log('\n3. Claim verification is service_role only');
    const cv = await client.query(`
      SELECT
        has_function_privilege('anon', 'editorial.record_claim_verification_atomic(uuid,uuid,uuid,text,text,uuid[])', 'EXECUTE') AS anon_ok,
        has_function_privilege('authenticated', 'editorial.record_claim_verification_atomic(uuid,uuid,uuid,text,text,uuid[])', 'EXECUTE') AS auth_ok,
        has_function_privilege('publisher_worker', 'editorial.record_claim_verification_atomic(uuid,uuid,uuid,text,text,uuid[])', 'EXECUTE') AS worker_ok,
        has_function_privilege('service_role', 'editorial.record_claim_verification_atomic(uuid,uuid,uuid,text,text,uuid[])', 'EXECUTE') AS service_ok
    `);
    const cvr = cv.rows[0];
    assert(cvr.anon_ok === false, 'anon cannot forge claim verification');
    assert(cvr.auth_ok === false, 'authenticated cannot forge claim verification');
    assert(cvr.worker_ok === false, 'publisher_worker cannot forge claim verification');
    assert(cvr.service_ok === true, 'service_role retains claim verification');

    console.log('\n4. Legacy publication RPCs are retired for clients');
    const pa = await client.query(`
      SELECT
        has_function_privilege('anon', 'public.publish_story_atomic(uuid,uuid,integer)', 'EXECUTE') AS anon_ok,
        has_function_privilege('authenticated', 'public.publish_story_atomic(uuid,uuid,integer)', 'EXECUTE') AS auth_ok,
        has_function_privilege('service_role', 'public.publish_story_atomic(uuid,uuid,integer)', 'EXECUTE') AS service_ok
    `);
    assert(pa.rows[0].anon_ok === false, 'anon cannot call publish_story_atomic');
    assert(pa.rows[0].auth_ok === false, 'authenticated cannot call publish_story_atomic');
    assert(pa.rows[0].service_ok === false, 'service_role cannot call publish_story_atomic');

    console.log('\n5. Scheduled publisher keeps publisher_worker-only access');
    for (const fn of ['public.fn_publish_story_with_audit(uuid)', 'public.fn_claim_due_schedule_entry()']) {
      const r = await client.query(
        `SELECT
           has_function_privilege('anon', $1, 'EXECUTE') AS anon_ok,
           has_function_privilege('authenticated', $1, 'EXECUTE') AS auth_ok,
           has_function_privilege('service_role', $1, 'EXECUTE') AS service_ok,
           has_function_privilege('publisher_worker', $1, 'EXECUTE') AS worker_ok`,
        [fn]
      );
      const row = r.rows[0];
      assert(row.anon_ok === false, `anon cannot execute ${fn}`);
      assert(row.auth_ok === false, `authenticated cannot execute ${fn}`);
      assert(row.service_ok === false, `service_role cannot execute ${fn}`);
      assert(row.worker_ok === true, `publisher_worker retains ${fn}`);
    }

    console.log('\n6. Unrelated helper grants are untouched');
    const control = await client.query(
      `SELECT has_function_privilege('anon', 'public.current_app_role()', 'EXECUTE') AS ok`
    );
    assert(control.rows[0].ok === true, 'current_app_role() keeps its existing anon grant');

    // ── Table + schema ACLs ─────────────────────────────────────────────
    console.log('\n7. Internal tables are closed to clients');
    for (const [schema, table] of TABLES) {
      const next = await client.query(
        `SELECT
           has_table_privilege('anon', $1, 'SELECT') AS anon_select,
           has_table_privilege('authenticated', $1, 'SELECT') AS auth_select,
           has_table_privilege('service_role', $1, 'SELECT') AS service_select,
           (SELECT relrowsecurity FROM pg_class WHERE oid = $1::regclass) AS rls,
           (SELECT count(*) FROM pg_policies
             WHERE schemaname = $2 AND tablename = $3
               AND policyname = 'p0_deny_client_access' AND permissive = 'RESTRICTIVE') AS deny_policy`,
        [`${schema}.${table}`, schema, table]
      );
      const row = next.rows[0];
      assert(row.anon_select === false, `anon cannot SELECT ${schema}.${table}`);
      assert(row.auth_select === false, `authenticated cannot SELECT ${schema}.${table}`);
      assert(row.service_select === true, `service_role can still SELECT ${schema}.${table}`);
      assert(row.rls === true, `RLS is enabled on ${schema}.${table}`);
      assert(Number(row.deny_policy) === 1, `restrictive deny policy exists on ${schema}.${table}`);
    }

    console.log('\n8. Schema USAGE boundary');
    const usage = await client.query(`
      SELECT
        has_schema_privilege('anon', 'editorial', 'USAGE') AS anon_editorial,
        has_schema_privilege('authenticated', 'editorial', 'USAGE') AS auth_editorial,
        has_schema_privilege('service_role', 'editorial', 'USAGE') AS service_editorial,
        has_schema_privilege('anon', 'audit', 'USAGE') AS anon_audit,
        has_schema_privilege('authenticated', 'audit', 'USAGE') AS auth_audit,
        has_schema_privilege('service_role', 'audit', 'USAGE') AS service_audit
    `);
    const u = usage.rows[0];
    assert(u.anon_editorial === false, 'anon lacks editorial schema USAGE');
    assert(u.auth_editorial === false, 'authenticated lacks editorial schema USAGE');
    assert(u.service_editorial === true, 'service_role has editorial schema USAGE');
    assert(u.anon_audit === false, 'anon lacks audit schema USAGE');
    assert(u.auth_audit === false, 'authenticated lacks audit schema USAGE');
    assert(u.service_audit === true, 'service_role has audit schema USAGE');

    // ── Effective behavior under each role ──────────────────────────────
    console.log('\n9. Effective reads: anon denied, service_role allowed');
    await client.query('BEGIN');
    await actAs(client, 'anon');
    let anonBlocked = false;
    try {
      await client.query('SELECT id FROM editorial.claims');
    } catch {
      anonBlocked = true;
    }
    assert(anonBlocked, 'anon SELECT on editorial.claims fails at the storage layer');
    await client.query('ROLLBACK');

    await client.query('BEGIN');
    await actAs(client, 'service_role');
    const serviceRead = await client.query('SELECT count(*)::int AS n FROM editorial.claims');
    assert(serviceRead.rows[0].n === 2, 'service_role reads editorial.claims (server path intact)');
    const serviceSnapshot = await client.query('SELECT count(*)::int AS n FROM audit.published_story_snapshots');
    assert(serviceSnapshot.rows[0].n === 0, 'service_role resolves audit.published_story_snapshots');
    await client.query('ROLLBACK');

    console.log('\n───────────────────────────────────────────────────────');
    console.log(`P0 containment tests: ${passed} passed, ${failed} failed`);
    console.log('───────────────────────────────────────────────────────');

    if (failed > 0) process.exit(1);
  } finally {
    if (client) await client.end().catch(() => {});
    await pg.stop().catch(() => {});
    console.log('\nCleaned up isolated PostgreSQL cluster.');
  }
}

run().catch((err) => {
  console.error('Fatal error during P0 containment tests:', err);
  process.exit(1);
});
