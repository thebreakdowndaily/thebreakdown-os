/**
 * THE BREAKDOWN — Direct PostgreSQL Database Enforcement Test Suite
 *
 * Exercises real PostgreSQL (via embedded-postgres) to prove:
 * 1. Migration 014 and 015 apply cleanly with zero errors.
 * 2. PostgreSQL RLS policies enforce security boundaries directly at the storage engine level.
 * 3. Strict User A vs User B bookmark isolation (User A cannot be accessed by User B).
 * 4. Anonymous visitors can read published content, but cannot read drafts or write.
 * 5. Editorial privilege hierarchy: reporter cannot delete stories; admin can.
 * 6. SECURITY DEFINER helper functions fail closed, resist JWT user_metadata spoofing, and block suspended accounts.
 */

import EmbeddedPostgres from 'embedded-postgres';
import * as fs from 'fs';
import * as path from 'path';
import * as net from 'net';
import * as os from 'os';
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

const BOOTSTRAP_SQL = `
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
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticator') THEN
      CREATE ROLE authenticator NOLOGIN NOINHERIT;
    END IF;
  END $$;

  CREATE SCHEMA IF NOT EXISTS auth;
  GRANT USAGE ON SCHEMA auth TO anon, authenticated, service_role;

  CREATE OR REPLACE FUNCTION auth.jwt() RETURNS jsonb
  LANGUAGE sql STABLE AS $fn$
    SELECT COALESCE(current_setting('request.jwt.claims', true)::jsonb, '{}'::jsonb);
  $fn$;

  CREATE OR REPLACE FUNCTION auth.uid() RETURNS uuid
  LANGUAGE sql STABLE AS $fn$
    SELECT NULLIF(current_setting('request.jwt.claims', true)::jsonb ->> 'sub', '')::uuid;
  $fn$;

  CREATE TABLE IF NOT EXISTS auth.users (
    id uuid PRIMARY KEY,
    email text,
    raw_app_meta_data jsonb DEFAULT '{}'::jsonb
  );
  GRANT SELECT ON auth.users TO anon, authenticated, service_role;
  GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;

  CREATE SCHEMA IF NOT EXISTS storage;
  GRANT USAGE ON SCHEMA storage TO anon, authenticated, service_role;
  CREATE TABLE IF NOT EXISTS storage.buckets (
    id text PRIMARY KEY,
    name text NOT NULL,
    public boolean DEFAULT false,
    file_size_limit bigint,
    allowed_mime_types text[]
  );
  CREATE TABLE IF NOT EXISTS storage.objects (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    bucket_id text REFERENCES storage.buckets(id),
    name text,
    owner uuid,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    metadata jsonb
  );
  ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
  GRANT ALL ON ALL TABLES IN SCHEMA storage TO anon, authenticated, service_role;
`;

async function actAs(client: Client, role: 'anon' | 'authenticated' | 'service_role', claims: Record<string, unknown> = {}) {
  await client.query(`SET LOCAL role ${role}`);
  await client.query("SELECT set_config('request.jwt.claims', $1, true)", [JSON.stringify(claims)]);
}

async function runDirectDatabaseTests() {
  console.log('───────────────────────────────────────────────────────');
  console.log('Direct PostgreSQL Security & RLS Enforcement Test');
  console.log('───────────────────────────────────────────────────────\n');

  const port = await freePort();
  const dbDir = path.join(os.tmpdir(), 'breakdown-db-direct-sec-' + Date.now());
  const pg = new EmbeddedPostgres({
    databaseDir: dbDir,
    port,
    user: 'postgres',
    password: 'sec-test-pw',
    persistent: false,
    initdbFlags: ['--locale=C', '--encoding=UTF8'],
    onLog: () => {},
    onError: () => {},
  });

  let client: Client | null = null;

  try {
    console.log(`Starting isolated PostgreSQL cluster on port ${port}...`);
    await pg.initialise();
    await pg.start();
    client = pg.getPgClient();
    await client.connect();

    console.log('Bootstrapping Supabase-compatible roles & auth stubs...');
    await client.query(BOOTSTRAP_SQL);

    // Apply migrations 001..015
    const migrationsDir = path.join(__dirname, '..', '..', 'supabase', 'migrations');
    const files = fs.readdirSync(migrationsDir)
      .filter(f => /^\d{3}_.*\.sql$/.test(f))
      .sort();

    console.log(`Applying ${files.length} migrations in sequence...`);
    for (const file of files) {
      const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
      const parts = sql.split('-- COMMIT_SPLIT').map(p => p.trim()).filter(Boolean);
      for (const part of parts) {
        await client.query(part);
      }
    }
    console.log('All migrations applied successfully!\n');

    // Grant default privileges on all created tables to test roles
    await client.query('GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role');
    await client.query('GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role');
    await client.query('GRANT USAGE ON SCHEMA identity TO anon, authenticated, service_role').catch(() => {});
    await client.query('GRANT ALL ON ALL TABLES IN SCHEMA identity TO anon, authenticated, service_role').catch(() => {});
    // Preserve migration-defined revokes on internal queue/infrastructure tables
    await client.query('REVOKE ALL ON TABLE public.publication_outbox FROM PUBLIC, anon, authenticated').catch(() => {});

    // ─────────────────────────────────────────────────────────────────
    // 1. Verify RLS is Enabled on Core Base Tables
    // ─────────────────────────────────────────────────────────────────
    console.log('1. RLS Table Configuration');
    const rlsQuery = await client.query(`
      SELECT n.nspname as schemaname, c.relname, c.relrowsecurity
      FROM pg_class c
      JOIN pg_namespace n ON n.oid = c.relnamespace
      WHERE (n.nspname = 'public' AND c.relname IN ('stories', 'topics', 'entities', 'timelines', 'fixes', 'media_items', 'datasets', 'user_roles'))
         OR (n.nspname IN ('public', 'identity') AND c.relname IN ('bookmarks', 'users'))
      ORDER BY n.nspname, c.relname;
    `);
    for (const row of rlsQuery.rows) {
      assert(row.relrowsecurity === true, `RLS enabled on ${row.schemaname}.${row.relname}`);
    }

    // ─────────────────────────────────────────────────────────────────
    // 2. Direct RLS: Public vs Draft Story Access
    // ─────────────────────────────────────────────────────────────────
    console.log('\n2. Direct RLS: Public vs Draft Stories');
    const publishedStoryId = '11111111-0000-0000-0000-000000000001';
    const draftStoryId = '11111111-0000-0000-0000-000000000002';

    await client.query(`
      INSERT INTO public.stories (id, slug, title, status, published_at)
      VALUES 
        ('${publishedStoryId}', 'published-test-story', 'Published Story', 'published', NOW()),
        ('${draftStoryId}', 'draft-test-story', 'Draft Story', 'draft', NULL)
      ON CONFLICT (id) DO NOTHING;
    `);

    // Anonymous visitor
    await client.query('BEGIN');
    await actAs(client, 'anon', {});
    const anonPublished = await client.query(`SELECT id FROM public.stories WHERE id = '${publishedStoryId}'`);
    assert(anonPublished.rowCount === 1, 'Anonymous caller can read published story');

    const anonDraft = await client.query(`SELECT id FROM public.stories WHERE id = '${draftStoryId}'`);
    assert(anonDraft.rowCount === 0, 'Anonymous caller CANNOT read draft story (0 rows returned)');

    // Attempt insert by anonymous
    let anonInsertFailed = false;
    try {
      await client.query(`
        INSERT INTO public.stories (id, slug, title, status)
        VALUES (gen_random_uuid(), 'anon-exploit', 'Anon Story', 'draft')
      `);
    } catch {
      anonInsertFailed = true;
    }
    assert(anonInsertFailed, 'Anonymous caller cannot insert stories into public.stories');
    await client.query('ROLLBACK');

    // ─────────────────────────────────────────────────────────────────
    // 3. Strict User A vs User B Isolation (Bookmarks)
    // ─────────────────────────────────────────────────────────────────
    console.log('\n3. Strict User A vs User B Isolation');
    const bookmarksTableRes = await client.query(`
      SELECT table_schema, table_name 
      FROM information_schema.tables 
      WHERE table_name = 'bookmarks' AND table_schema IN ('identity', 'public')
      LIMIT 1;
    `);
    const bmTable = bookmarksTableRes.rows.length > 0 
      ? `${bookmarksTableRes.rows[0].table_schema}.${bookmarksTableRes.rows[0].table_name}`
      : 'public.bookmarks';

    const userA = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
    const userB = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';
    const bookmarkA = 'aaaa0000-0000-0000-0000-000000000001';

    // Seed users in auth.users and identity.users if present
    await client.query(`
      INSERT INTO auth.users (id, email)
      VALUES 
        ('${userA}', 'user-a@example.com'),
        ('${userB}', 'user-b@example.com')
      ON CONFLICT (id) DO NOTHING;
    `);

    const hasIdentityUsers = (await client.query(`
      SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'identity' AND table_name = 'users') as ok
    `)).rows[0].ok;

    if (hasIdentityUsers) {
      await client.query(`
        INSERT INTO identity.users (id, email, name)
        VALUES 
          ('${userA}', 'user-a@example.com', 'User A'),
          ('${userB}', 'user-b@example.com', 'User B')
        ON CONFLICT (id) DO NOTHING;
      `);
    }

    // Insert as User A and commit
    await client.query('BEGIN');
    await actAs(client, 'authenticated', { sub: userA });
    await client.query(`
      INSERT INTO ${bmTable} (id, user_id, story_id, story_slug, story_title)
      VALUES ('${bookmarkA}', '${userA}', '${publishedStoryId}', 'published-test-story', 'Published Story')
    `);
    const userASelect = await client.query(`SELECT id FROM ${bmTable} WHERE id = '${bookmarkA}'`);
    assert(userASelect.rowCount === 1, 'User A can insert and read their own bookmark');
    await client.query('COMMIT');

    // User A attempts to insert on behalf of User B
    await client.query('BEGIN');
    await actAs(client, 'authenticated', { sub: userA });
    let userASpoofFailed = false;
    try {
      await client.query(`
        INSERT INTO ${bmTable} (id, user_id, story_id, story_slug, story_title)
        VALUES (gen_random_uuid(), '${userB}', '${publishedStoryId}', 'published-test-story', 'Published Story')
      `);
    } catch {
      userASpoofFailed = true;
    }
    assert(userASpoofFailed, 'User A cannot insert bookmark on behalf of User B (rejected by RLS WITH CHECK)');
    await client.query('ROLLBACK');

    // Switch to User B
    await client.query('BEGIN');
    await actAs(client, 'authenticated', { sub: userB });

    // User B tries to read User A's bookmark
    const userBSelect = await client.query(`SELECT id FROM ${bmTable} WHERE id = '${bookmarkA}'`);
    assert(userBSelect.rowCount === 0, 'User B CANNOT read User A bookmark (RLS returns 0 rows)');

    // User B tries to update User A's bookmark
    const userBUpdate = await client.query(`
      UPDATE ${bmTable} SET story_title = 'Tampered' WHERE id = '${bookmarkA}'
    `);
    assert(userBUpdate.rowCount === 0, 'User B CANNOT update User A bookmark (0 rows affected)');

    // User B tries to delete User A's bookmark
    const userBDelete = await client.query(`
      DELETE FROM ${bmTable} WHERE id = '${bookmarkA}'
    `);
    assert(userBDelete.rowCount === 0, 'User B CANNOT delete User A bookmark (0 rows affected)');

    await client.query('ROLLBACK');

    // ─────────────────────────────────────────────────────────────────
    // 4. Role Hierarchy: Reporter vs Admin (Story Deletion)
    // ─────────────────────────────────────────────────────────────────
    console.log('\n4. Role Hierarchy & Editorial Deletion Boundaries');
    const reporterId = '33333333-3333-3333-3333-333333333333';
    const adminId = '44444444-4444-4444-4444-444444444444';
    const deleteTestStoryId = '11111111-0000-0000-0000-000000000099';

    // Seed roles in public.user_roles
    await client.query(`
      INSERT INTO public.user_roles (user_id, role, status)
      VALUES 
        ('${reporterId}', 'reporter', 'active'),
        ('${adminId}', 'owner', 'active')
      ON CONFLICT (user_id) DO UPDATE SET role = EXCLUDED.role, status = EXCLUDED.status;
    `);

    await client.query(`
      INSERT INTO public.stories (id, slug, title, status)
      VALUES ('${deleteTestStoryId}', 'delete-candidate', 'Delete Candidate', 'draft')
      ON CONFLICT (id) DO NOTHING;
    `);

    // Reporter attempts DELETE
    await client.query('BEGIN');
    await actAs(client, 'authenticated', { sub: reporterId });
    const reporterDel = await client.query(`DELETE FROM public.stories WHERE id = '${deleteTestStoryId}'`);
    assert(reporterDel.rowCount === 0, 'Reporter role CANNOT delete stories (0 rows affected)');
    await client.query('ROLLBACK');

    // Admin executes DELETE
    await client.query('BEGIN');
    await actAs(client, 'authenticated', { sub: adminId });
    const adminDel = await client.query(`DELETE FROM public.stories WHERE id = '${deleteTestStoryId}'`);
    assert(adminDel.rowCount === 1, 'Owner/Admin role CAN delete stories (1 row deleted)');
    await client.query('ROLLBACK');

    // ─────────────────────────────────────────────────────────────────
    // 5. SECURITY DEFINER Functions & Privilege Escalation Resistance
    // ─────────────────────────────────────────────────────────────────
    console.log('\n5. SECURITY DEFINER Functions & Privilege Escalation Resistance');

    // Test A: Anonymous caller
    await client.query('BEGIN');
    await actAs(client, 'anon', {});
    const anonRoleRes = await client.query('SELECT public.current_app_role() as role');
    assert(anonRoleRes.rows[0].role === 'guest', 'current_app_role() returns "guest" for anonymous');

    const anonStaffRes = await client.query('SELECT public.is_staff() as is_staff');
    assert(anonStaffRes.rows[0].is_staff === false, 'is_staff() returns false for anonymous');

    const anonAdminRes = await client.query('SELECT public.is_admin() as is_admin');
    assert(anonAdminRes.rows[0].is_admin === false, 'is_admin() returns false for anonymous');
    await client.query('ROLLBACK');

    // Test B: Malicious client attempts user_metadata spoofing
    const attackerId = '55555555-5555-5555-5555-555555555555';
    await client.query(`
      INSERT INTO public.user_roles (user_id, role, status)
      VALUES ('${attackerId}', 'guest', 'active')
      ON CONFLICT (user_id) DO UPDATE SET role = 'guest', status = 'active';
    `);

    await client.query('BEGIN');
    // Attacker passes user_metadata in JWT attempting role escalation
    await actAs(client, 'authenticated', {
      sub: attackerId,
      user_metadata: { role: 'owner', is_super_admin: true },
    });
    const attackerRoleRes = await client.query('SELECT public.current_app_role() as role');
    assert(attackerRoleRes.rows[0].role === 'guest', 'current_app_role() ignores client user_metadata spoofing');

    const attackerStaffRes = await client.query('SELECT public.is_staff() as is_staff');
    assert(attackerStaffRes.rows[0].is_staff === false, 'Attacker cannot escalate to is_staff via user_metadata');

    const attackerAdminRes = await client.query('SELECT public.is_admin() as is_admin');
    assert(attackerAdminRes.rows[0].is_admin === false, 'Attacker cannot escalate to is_admin via user_metadata');
    await client.query('ROLLBACK');

    // Test C: Suspended user fails closed
    const suspendedId = '66666666-6666-6666-6666-666666666666';
    await client.query(`
      INSERT INTO public.user_roles (user_id, role, status)
      VALUES ('${suspendedId}', 'owner', 'suspended')
      ON CONFLICT (user_id) DO UPDATE SET role = 'owner', status = 'suspended';
    `);

    await client.query('BEGIN');
    await actAs(client, 'authenticated', { sub: suspendedId });
    const suspendedRoleRes = await client.query('SELECT public.current_app_role() as role');
    assert(suspendedRoleRes.rows[0].role === 'guest', 'Suspended owner fails closed to "guest" in current_app_role()');

    const suspendedStaffRes = await client.query('SELECT public.is_staff() as is_staff');
    assert(suspendedStaffRes.rows[0].is_staff === false, 'Suspended user is NOT staff');

    const suspendedAdminRes = await client.query('SELECT public.is_admin() as is_admin');
    assert(suspendedAdminRes.rows[0].is_admin === false, 'Suspended user is NOT admin');
    await client.query('ROLLBACK');

    // Test D: Search path immutability
    const searchPathRes = await client.query(`
      SELECT proname, proconfig 
      FROM pg_proc 
      WHERE proname IN ('current_app_role', 'is_staff', 'is_editor', 'is_admin');
    `);
    for (const r of searchPathRes.rows) {
      const configStr = (r.proconfig || []).join(', ');
      assert(configStr.includes('search_path=public, auth, pg_temp'), `${r.proname}() has immutable search_path`);
    }

    // ─────────────────────────────────────────────────────────────────
    // 6. RPC Authority Hardening: fn_publish_story_fenced Privileges
    // ─────────────────────────────────────────────────────────────────
    console.log('\n6. RPC Authority Hardening: fn_publish_story_fenced Privilege Boundaries');

    // 6.1 Function search_path immutability and SECURITY DEFINER
    const rpcProcRes = await client.query(`
      SELECT proname, proconfig, prosecdef
      FROM pg_proc 
      WHERE proname = 'fn_publish_story_fenced';
    `);
    assert(rpcProcRes.rowCount === 1, 'fn_publish_story_fenced exists in pg_proc');
    const rpcConfig = (rpcProcRes.rows[0].proconfig || []).join(', ');
    assert(rpcConfig.includes('search_path=public, pg_temp'), 'fn_publish_story_fenced has immutable search_path (public, pg_temp)');
    assert(rpcProcRes.rows[0].prosecdef === true, 'fn_publish_story_fenced is SECURITY DEFINER');

    // 6.2 Privilege checks via has_function_privilege
    const anonPrivRes = await client.query(`
      SELECT has_function_privilege('anon', 'public.fn_publish_story_fenced(uuid,uuid,timestamptz,integer,timestamptz,text)', 'execute') as priv;
    `);
    assert(anonPrivRes.rows[0].priv === false, 'anon has NO execute privilege on fn_publish_story_fenced');

    const authPrivRes = await client.query(`
      SELECT has_function_privilege('authenticated', 'public.fn_publish_story_fenced(uuid,uuid,timestamptz,integer,timestamptz,text)', 'execute') as priv;
    `);
    assert(authPrivRes.rows[0].priv === false, 'authenticated has NO execute privilege on fn_publish_story_fenced');

    const pubPrivRes = await client.query(`
      SELECT has_function_privilege('public', 'public.fn_publish_story_fenced(uuid,uuid,timestamptz,integer,timestamptz,text)', 'execute') as priv;
    `);
    assert(pubPrivRes.rows[0].priv === false, 'public has NO execute privilege on fn_publish_story_fenced');

    const svcPrivRes = await client.query(`
      SELECT has_function_privilege('service_role', 'public.fn_publish_story_fenced(uuid,uuid,timestamptz,integer,timestamptz,text)', 'execute') as priv;
    `);
    assert(svcPrivRes.rows[0].priv === true, 'service_role HAS execute privilege on fn_publish_story_fenced');

    // 6.3 Direct execution rejection: Anonymous caller fails closed
    await client.query('BEGIN');
    await actAs(client, 'anon', {});
    let anonRpcBlocked = false;
    try {
      await client.query(`
        SELECT public.fn_publish_story_fenced(
          gen_random_uuid(), gen_random_uuid(), NOW(), 1, NOW(), 'system-scheduler'
        );
      `);
    } catch (err: any) {
      if (err.code === '42501') anonRpcBlocked = true;
    }
    assert(anonRpcBlocked, 'Anonymous caller direct RPC execution fails closed with 42501 (insufficient_privilege)');
    await client.query('ROLLBACK');

    // 6.4 Direct execution rejection: Authenticated user fails closed
    await client.query('BEGIN');
    await actAs(client, 'authenticated', { sub: userA });
    let authRpcBlocked = false;
    try {
      await client.query(`
        SELECT public.fn_publish_story_fenced(
          gen_random_uuid(), gen_random_uuid(), NOW(), 1, NOW(), 'system-scheduler'
        );
      `);
    } catch (err: any) {
      if (err.code === '42501') authRpcBlocked = true;
    }
    assert(authRpcBlocked, 'Authenticated user direct RPC execution fails closed with 42501 (insufficient_privilege)');
    await client.query('ROLLBACK');

    // 6.5 Direct execution rejection: publisher_worker and authenticator cannot call fn_publish_story_fenced
    const pubWorkerPrivRes = await client.query(`
      SELECT has_function_privilege('publisher_worker', 'public.fn_publish_story_fenced(uuid,uuid,timestamptz,integer,timestamptz,text)', 'execute') as priv;
    `);
    assert(pubWorkerPrivRes.rows[0].priv === false, 'publisher_worker has NO execute privilege on fn_publish_story_fenced');

    const authRolePrivRes = await client.query(`
      SELECT has_function_privilege('authenticator', 'public.fn_publish_story_fenced(uuid,uuid,timestamptz,integer,timestamptz,text)', 'execute') as priv;
    `);
    assert(authRolePrivRes.rows[0].priv === false, 'authenticator has NO execute privilege on fn_publish_story_fenced');

    await client.query('BEGIN');
    await client.query('SET LOCAL role publisher_worker');
    let pubWorkerRpcBlocked = false;
    try {
      await client.query(`
        SELECT public.fn_publish_story_fenced(
          gen_random_uuid(), gen_random_uuid(), NOW(), 1, NOW(), 'system-scheduler'
        );
      `);
    } catch (err: any) {
      if (err.code === '42501') pubWorkerRpcBlocked = true;
    }
    assert(pubWorkerRpcBlocked, 'publisher_worker direct execution of fn_publish_story_fenced fails closed with 42501');
    await client.query('ROLLBACK');

    // 6.6 Legacy RPC closure: fn_publish_story_with_audit cannot be called by untrusted roles or authenticator
    const legacyAnonPriv = await client.query(`
      SELECT has_function_privilege('anon', 'public.fn_publish_story_with_audit(uuid)', 'execute') as priv;
    `);
    assert(legacyAnonPriv.rows[0].priv === false, 'anon has NO execute privilege on legacy fn_publish_story_with_audit');

    const legacyAuthPriv = await client.query(`
      SELECT has_function_privilege('authenticated', 'public.fn_publish_story_with_audit(uuid)', 'execute') as priv;
    `);
    assert(legacyAuthPriv.rows[0].priv === false, 'authenticated has NO execute privilege on legacy fn_publish_story_with_audit');

    const legacyWorkerPriv = await client.query(`
      SELECT has_function_privilege('publisher_worker', 'public.fn_publish_story_with_audit(uuid)', 'execute') as priv;
    `);
    assert(legacyWorkerPriv.rows[0].priv === false, 'publisher_worker has NO execute privilege on legacy fn_publish_story_with_audit');

    const legacyAuthenticatorPriv = await client.query(`
      SELECT has_function_privilege('authenticator', 'public.fn_publish_story_with_audit(uuid)', 'execute') as priv;
    `);
    assert(legacyAuthenticatorPriv.rows[0].priv === false, 'authenticator has NO execute privilege on legacy fn_publish_story_with_audit');

    await client.query('BEGIN');
    await client.query('SET LOCAL role publisher_worker');
    let legacyWorkerBlocked = false;
    try {
      await client.query(`SELECT public.fn_publish_story_with_audit(gen_random_uuid());`);
    } catch (err: any) {
      if (err.code === '42501') legacyWorkerBlocked = true;
    }
    assert(legacyWorkerBlocked, 'publisher_worker calling legacy fn_publish_story_with_audit fails closed with 42501');
    await client.query('ROLLBACK');

    // 6.7 Legacy claiming RPC closure: fn_claim_due_schedule_entry cannot be called by untrusted roles
    const claimWorkerPriv = await client.query(`
      SELECT has_function_privilege('publisher_worker', 'public.fn_claim_due_schedule_entry()', 'execute') as priv;
    `);
    assert(claimWorkerPriv.rows[0].priv === false, 'publisher_worker has NO execute privilege on legacy fn_claim_due_schedule_entry');

    const claimAuthenticatorPriv = await client.query(`
      SELECT has_function_privilege('authenticator', 'public.fn_claim_due_schedule_entry()', 'execute') as priv;
    `);
    assert(claimAuthenticatorPriv.rows[0].priv === false, 'authenticator has NO execute privilege on legacy fn_claim_due_schedule_entry');

    await client.query('BEGIN');
    await client.query('SET LOCAL role publisher_worker');
    let claimWorkerBlocked = false;
    try {
      await client.query(`SELECT public.fn_claim_due_schedule_entry();`);
    } catch (err: any) {
      if (err.code === '42501') claimWorkerBlocked = true;
    }
    assert(claimWorkerBlocked, 'publisher_worker calling legacy fn_claim_due_schedule_entry fails closed with 42501');
    await client.query('ROLLBACK');

    // ─────────────────────────────────────────────────────────────────
    // 7. Atomic Transactional Fencing & Database-Enforced Lease Expiry Proof
    // ─────────────────────────────────────────────────────────────────
    console.log('\n7. Atomic Transactional Fencing & Database-Enforced Lease Expiry');

    // 7.1 Authoritative Success: Trigger-driven version increment & attribution
    const storyAId = '77777777-0000-0000-0000-000000000001';
    const schedAId = '77777777-0000-0000-0000-000000000002';
    const validLeaseTime = new Date().toISOString();

    await client.query(`
      INSERT INTO public.stories (id, slug, title, status, version)
      VALUES ('${storyAId}', 'proof-story-a', 'Proof Story A', 'draft', 1)
      ON CONFLICT (id) DO UPDATE SET status = 'draft', version = 1;
    `);

    await client.query(`
      INSERT INTO public.editorial_schedule (id, story_id, slot_date, slot_position, status, validated_at)
      VALUES ('${schedAId}', '${storyAId}', '2026-10-18', 1, 'validated', '${validLeaseTime}')
      ON CONFLICT (id) DO UPDATE SET status = 'validated', validated_at = '${validLeaseTime}';
    `);

    await client.query('BEGIN');
    await actAs(client, 'service_role', {});
    const publishResA = await client.query(`
      SELECT public.fn_publish_story_fenced(
        '${schedAId}'::UUID,
        '${storyAId}'::UUID,
        '${validLeaseTime}'::TIMESTAMPTZ,
        1,
        '${validLeaseTime}'::TIMESTAMPTZ,
        'system-scheduler'
      ) as result;
    `);
    await client.query('COMMIT');

    const resultA = publishResA.rows[0].result;
    assert(resultA.success === true, 'Valid claim succeeds under service_role');
    assert(resultA.code === 'PUBLISHED', 'Result code is PUBLISHED');
    assert(resultA.version === 2, 'Story version incremented authoritatively to 2 by trigger');
    assert(resultA.status === 'published', 'Returned status is published');
    assert(resultA.updated_by === '00000000-0000-0000-0000-000000000001', 'RPC JSON updated_by returns persisted UUID');
    assert(resultA.actor === 'system-scheduler', 'RPC JSON actor returns logical scheduler label');
    assert(resultA.scheduled_by === 'system-scheduler', 'RPC JSON scheduled_by returns persisted label');

    // Verify persisted database rows
    const verifyStoryA = await client.query(`SELECT status, version, updated_by, scheduled_by FROM public.stories WHERE id = '${storyAId}'`);
    assert(verifyStoryA.rows[0].status === 'published', 'Story committed status is published');
    assert(verifyStoryA.rows[0].version === 2, 'Database persisted version is exactly 2');
    assert(verifyStoryA.rows[0].updated_by === '00000000-0000-0000-0000-000000000001', 'Attribution safely mapped system-scheduler deterministic UUID');
    assert(verifyStoryA.rows[0].scheduled_by === 'system-scheduler', 'scheduled_by attribution recorded');

    const verifySchedA = await client.query(`SELECT status FROM public.editorial_schedule WHERE id = '${schedAId}'`);
    assert(verifySchedA.rows[0].status === 'published', 'Editorial schedule committed status is published');

    // 7.2 Database-Enforced Lease Expiry (> 5 minutes)
    const storyBId = '88888888-0000-0000-0000-000000000001';
    const schedBId = '88888888-0000-0000-0000-000000000002';
    // Expired lease: validated 6 minutes ago
    const expiredLeaseTime = new Date(Date.now() - 6 * 60 * 1000).toISOString();

    await client.query(`
      INSERT INTO public.stories (id, slug, title, status, version)
      VALUES ('${storyBId}', 'proof-story-b', 'Proof Story B', 'draft', 1)
      ON CONFLICT (id) DO UPDATE SET status = 'draft', version = 1;
    `);

    await client.query(`
      INSERT INTO public.editorial_schedule (id, story_id, slot_date, slot_position, status, validated_at)
      VALUES ('${schedBId}', '${storyBId}', '2026-10-18', 2, 'validated', '${expiredLeaseTime}')
      ON CONFLICT (id) DO UPDATE SET status = 'validated', validated_at = '${expiredLeaseTime}';
    `);

    await client.query('BEGIN');
    await actAs(client, 'service_role', {});
    const publishResB = await client.query(`
      SELECT public.fn_publish_story_fenced(
        '${schedBId}'::UUID,
        '${storyBId}'::UUID,
        '${expiredLeaseTime}'::TIMESTAMPTZ,
        1,
        NOW(),
        'system-scheduler'
      ) as result;
    `);
    await client.query('COMMIT');

    const resultB = publishResB.rows[0].result;
    assert(resultB.success === false, 'Expired lease fails closed');
    assert(resultB.code === 'SCHEDULE_LEASE_EXPIRED', 'Result code is SCHEDULE_LEASE_EXPIRED');

    // Verify zero mutations committed
    const verifyStoryB = await client.query(`SELECT status, version FROM public.stories WHERE id = '${storyBId}'`);
    assert(verifyStoryB.rows[0].status === 'draft', 'Expired lease leaves story in draft state');
    assert(verifyStoryB.rows[0].version === 1, 'Expired lease leaves story version unchanged at 1');

    const verifySchedB = await client.query(`SELECT status FROM public.editorial_schedule WHERE id = '${schedBId}'`);
    assert(verifySchedB.rows[0].status === 'validated', 'Expired lease leaves editorial schedule in validated state');

    // 7.3 Stale Lease Ownership (Worker lease was lost/stolen)
    const storyCId = '99999999-0000-0000-0000-000000000001';
    const schedCId = '99999999-0000-0000-0000-000000000002';
    const currentLeaseTime = new Date().toISOString();
    const staleClaimTime = new Date(Date.now() - 30 * 1000).toISOString();

    await client.query(`
      INSERT INTO public.stories (id, slug, title, status, version)
      VALUES ('${storyCId}', 'proof-story-c', 'Proof Story C', 'draft', 1)
      ON CONFLICT (id) DO UPDATE SET status = 'draft', version = 1;
    `);

    await client.query(`
      INSERT INTO public.editorial_schedule (id, story_id, slot_date, slot_position, status, validated_at)
      VALUES ('${schedCId}', '${storyCId}', '2026-10-18', 3, 'validated', '${currentLeaseTime}')
      ON CONFLICT (id) DO UPDATE SET status = 'validated', validated_at = '${currentLeaseTime}';
    `);

    await client.query('BEGIN');
    await actAs(client, 'service_role', {});
    const publishResC = await client.query(`
      SELECT public.fn_publish_story_fenced(
        '${schedCId}'::UUID,
        '${storyCId}'::UUID,
        '${staleClaimTime}'::TIMESTAMPTZ,
        1,
        NOW(),
        'system-scheduler'
      ) as result;
    `);
    await client.query('COMMIT');

    const resultC = publishResC.rows[0].result;
    assert(resultC.success === false, 'Stale lease claim fails closed');
    assert(resultC.code === 'SCHEDULE_LEASE_LOST', 'Result code is SCHEDULE_LEASE_LOST');

    // 7.4 OCC Story Version Conflict
    const publishResOCC = await client.query(`
      SELECT public.fn_publish_story_fenced(
        '${schedCId}'::UUID,
        '${storyCId}'::UUID,
        '${currentLeaseTime}'::TIMESTAMPTZ,
        99,
        NOW(),
        'system-scheduler'
      ) as result;
    `);
    const resultOCC = publishResOCC.rows[0].result;
    assert(resultOCC.success === false, 'Mismatched expected version fails closed');
    assert(resultOCC.code === 'STORY_VERSION_CONFLICT', 'Result code is STORY_VERSION_CONFLICT');

    // 7.5 Already Published Guard
    // Story A was already published in test 7.1
    const schedAPublishedTime = new Date().toISOString();
    // Insert a new validated schedule slot for story A to test story status check
    const schedA2Id = '77777777-0000-0000-0000-000000000003';
    await client.query(`
      INSERT INTO public.editorial_schedule (id, story_id, slot_date, slot_position, status, validated_at)
      VALUES ('${schedA2Id}', '${storyAId}', '2026-10-19', 1, 'validated', '${schedAPublishedTime}')
      ON CONFLICT (id) DO UPDATE SET status = 'validated', validated_at = '${schedAPublishedTime}';
    `);

    const publishResAlready = await client.query(`
      SELECT public.fn_publish_story_fenced(
        '${schedA2Id}'::UUID,
        '${storyAId}'::UUID,
        '${schedAPublishedTime}'::TIMESTAMPTZ,
        2,
        NOW(),
        'system-scheduler'
      ) as result;
    `);
    const resultAlready = publishResAlready.rows[0].result;
    assert(resultAlready.success === false, 'Already published story fails closed');
    assert(resultAlready.code === 'ALREADY_PUBLISHED', 'Result code is ALREADY_PUBLISHED');

    // 7.6 Distinct Timestamps Propagation
    const storyDistinctId = '77777777-0000-0000-0000-000000000010';
    const schedDistinctId = '77777777-0000-0000-0000-000000000011';
    const originalPublishedAt = '2026-10-15T12:00:00.000Z';
    const validLeaseTimeDistinct = new Date().toISOString();

    await client.query(`
      INSERT INTO public.stories (id, slug, title, status, version, published_at)
      VALUES ('${storyDistinctId}', 'distinct-ts-story', 'Distinct TS Story', 'draft', 1, '${originalPublishedAt}')
      ON CONFLICT (id) DO UPDATE SET status = 'draft', version = 1, published_at = '${originalPublishedAt}';
    `);

    await client.query(`
      INSERT INTO public.editorial_schedule (id, story_id, slot_date, slot_position, status, validated_at)
      VALUES ('${schedDistinctId}', '${storyDistinctId}', '2026-10-20', 1, 'validated', '${validLeaseTimeDistinct}')
      ON CONFLICT (id) DO UPDATE SET status = 'validated', validated_at = '${validLeaseTimeDistinct}';
    `);

    await client.query('BEGIN');
    await actAs(client, 'service_role', {});
    const publishResDistinct = await client.query(`
      SELECT public.fn_publish_story_fenced(
        '${schedDistinctId}'::UUID,
        '${storyDistinctId}'::UUID,
        '${validLeaseTimeDistinct}'::TIMESTAMPTZ,
        1,
        NULL,
        'system-scheduler'
      ) as result;
    `);
    await client.query('COMMIT');

    const resultDistinct = publishResDistinct.rows[0].result;
    assert(resultDistinct.success === true, 'Distinct timestamps publication succeeds');
    assert(new Date(resultDistinct.published_at).toISOString() === originalPublishedAt, 'Story published_at preserved authoritative historical date');
    assert(resultDistinct.published_at !== resultDistinct.updated_at, 'Story published_at and updated_at are distinct timestamps');
    assert(new Date(resultDistinct.schedule_published_at).toISOString() === originalPublishedAt, 'Editorial schedule published_at matches authoritative story published_at');

    const verifyStoryDistinct = await client.query(`SELECT published_at, updated_at FROM public.stories WHERE id = '${storyDistinctId}'`);
    assert(new Date(verifyStoryDistinct.rows[0].published_at).toISOString() === originalPublishedAt, 'Persisted stories.published_at matches authoritative value');
    assert(verifyStoryDistinct.rows[0].published_at.getTime() !== verifyStoryDistinct.rows[0].updated_at.getTime(), 'Persisted stories.published_at and updated_at are distinct');

    const verifySchedDistinct = await client.query(`SELECT published_at, updated_at FROM public.editorial_schedule WHERE id = '${schedDistinctId}'`);
    assert(new Date(verifySchedDistinct.rows[0].published_at).toISOString() === originalPublishedAt, 'Persisted schedule.published_at aligns with stories.published_at');

    // 7.7 Exactly-Five-Minute Lease Boundary (SQL & App Alignment)
    const storyExactExpiredId = '77777777-0000-0000-0000-000000000020';
    const schedExactExpiredId = '77777777-0000-0000-0000-000000000021';

    await client.query(`
      INSERT INTO public.stories (id, slug, title, status, version)
      VALUES ('${storyExactExpiredId}', 'exact-expired-story', 'Exact Expired Story', 'draft', 1)
      ON CONFLICT (id) DO UPDATE SET status = 'draft', version = 1;
    `);

    const exactBoundaryRow = (await client.query(`
      INSERT INTO public.editorial_schedule (id, story_id, slot_date, slot_position, status, validated_at)
      VALUES ('${schedExactExpiredId}', '${storyExactExpiredId}', '2026-10-21', 1, 'validated', date_trunc('milliseconds', clock_timestamp()) - INTERVAL '5 minutes')
      RETURNING validated_at::text as validated_at_text;
    `)).rows[0];
    const exactBoundaryTime = exactBoundaryRow.validated_at_text;

    await client.query('BEGIN');
    await actAs(client, 'service_role', {});
    const publishResExact = await client.query(`
      SELECT public.fn_publish_story_fenced(
        '${schedExactExpiredId}'::UUID,
        '${storyExactExpiredId}'::UUID,
        '${exactBoundaryTime}'::TIMESTAMPTZ,
        1,
        NOW(),
        'system-scheduler'
      ) as result;
    `);
    await client.query('COMMIT');

    const resultExact = publishResExact.rows[0].result;
    assert(resultExact.success === false, 'Lease exactly 5 minutes old is strictly expired');
    assert(resultExact.code === 'SCHEDULE_LEASE_EXPIRED', 'Exact 5m boundary returns SCHEDULE_LEASE_EXPIRED');

    // 4 minutes 59 seconds: NOT expired (should succeed)
    const storyJustValidId = '77777777-0000-0000-0000-000000000030';
    const schedJustValidId = '77777777-0000-0000-0000-000000000031';

    await client.query(`
      INSERT INTO public.stories (id, slug, title, status, version)
      VALUES ('${storyJustValidId}', 'just-valid-story', 'Just Valid Story', 'draft', 1)
      ON CONFLICT (id) DO UPDATE SET status = 'draft', version = 1;
    `);

    const justValidRow = (await client.query(`
      INSERT INTO public.editorial_schedule (id, story_id, slot_date, slot_position, status, validated_at)
      VALUES ('${schedJustValidId}', '${storyJustValidId}', '2026-10-22', 1, 'validated', date_trunc('milliseconds', clock_timestamp()) - INTERVAL '4 minutes 59 seconds')
      RETURNING validated_at::text as validated_at_text;
    `)).rows[0];
    const justValidTime = justValidRow.validated_at_text;

    await client.query('BEGIN');
    await actAs(client, 'service_role', {});
    const publishResJustValid = await client.query(`
      SELECT public.fn_publish_story_fenced(
        '${schedJustValidId}'::UUID,
        '${storyJustValidId}'::UUID,
        '${justValidTime}'::TIMESTAMPTZ,
        1,
        NOW(),
        'system-scheduler'
      ) as result;
    `);
    await client.query('COMMIT');

    const resultJustValid = publishResJustValid.rows[0].result;
    assert(resultJustValid.success === true, 'Lease at 4m59s is within 5-minute lease and succeeds');
    assert(resultJustValid.code === 'PUBLISHED', 'Result code is PUBLISHED');

    // 7.8 Lock Wait Crosses Expiry (Real independent PostgreSQL session with transaction-scoped service_role)
    const storyLockWaitId = '77777777-0000-0000-0000-000000000040';
    const schedLockWaitId = '77777777-0000-0000-0000-000000000041';

    await client.query(`
      INSERT INTO public.stories (id, slug, title, status, version)
      VALUES ('${storyLockWaitId}', 'lock-wait-story', 'Lock Wait Story', 'draft', 1)
      ON CONFLICT (id) DO UPDATE SET status = 'draft', version = 1;
    `);

    const lockWaitRow = (await client.query(`
      INSERT INTO public.editorial_schedule (id, story_id, slot_date, slot_position, status, validated_at)
      VALUES ('${schedLockWaitId}', '${storyLockWaitId}', '2026-10-23', 1, 'validated', date_trunc('milliseconds', clock_timestamp()) - INTERVAL '4 minutes 58 seconds')
      RETURNING validated_at::text as validated_at_text;
    `)).rows[0];
    const lockWaitTime = lockWaitRow.validated_at_text;

    // Client 1 opens a transaction and acquires the exclusive row lock on the schedule record
    await client.query('BEGIN');
    await client.query(`SELECT id FROM public.editorial_schedule WHERE id = '${schedLockWaitId}' FOR UPDATE;`);

    // Client 2 connects as an independent PostgreSQL session
    const client2 = pg.getPgClient();
    await client2.connect();

    try {
      // Record Client 2's specific PostgreSQL backend PID
      const pidRes = await client2.query('SELECT pg_backend_pid() AS pid;');
      const client2Pid = Number(pidRes.rows[0].pid);

      // Client 2 opens an explicit transaction and sets role to service_role WITHIN this transaction
      await client2.query('BEGIN');
      await actAs(client2, 'service_role', { sub: '00000000-0000-0000-0000-000000000001' });

      // Client 2 launches fn_publish_story_fenced inside its transaction (blocks waiting for Client 1)
      const client2Promise = client2.query(`
        SELECT public.fn_publish_story_fenced(
          '${schedLockWaitId}'::UUID,
          '${storyLockWaitId}'::UUID,
          '${lockWaitTime}'::TIMESTAMPTZ,
          1,
          NOW(),
          'system-scheduler'
        ) as result;
      `);

      // Observable bounded synchronization: verify that client2's specific PID is waiting on ungranted lock in pg_locks
      let lockWaitObserved = false;
      for (let i = 0; i < 50; i++) {
        const lockCheck = await client.query(`
          SELECT count(*)::int as waiting_locks
          FROM pg_locks
          WHERE pid = ${client2Pid}
            AND NOT granted;
        `);
        if (Number(lockCheck.rows[0].waiting_locks) > 0) {
          lockWaitObserved = true;
          break;
        }
        await new Promise(r => setTimeout(r, 40));
      }
      assert(lockWaitObserved, 'Client 2 session (verified PID) is confirmed waiting on schedule row lock in pg_locks');

      // Wait 3 seconds so clock_timestamp() advances past the 5-minute threshold
      await new Promise((resolve) => setTimeout(resolve, 3000));

      // Client 1 releases the lock by rolling back
      await client.query('ROLLBACK');

      // Client 2 unblocks, acquires lock, evaluates lease expiry against database clock, and returns
      const client2Res = await client2Promise;
      await client2.query('COMMIT');

      const resultLockWait = client2Res.rows[0].result;
      assert(resultLockWait.success === false, 'Transaction blocked on row lock evaluates expiry after acquiring lock');
      assert(resultLockWait.code === 'SCHEDULE_LEASE_EXPIRED', 'Lock contention crossing 5m returns SCHEDULE_LEASE_EXPIRED');

      const verifyStoryLock = await client.query(`SELECT status, version FROM public.stories WHERE id = '${storyLockWaitId}'`);
      assert(verifyStoryLock.rows[0].status === 'draft', 'Story remains draft after lock contention expiry');
      assert(verifyStoryLock.rows[0].version === 1, 'Story version remains unchanged');

      const verifySchedLock = await client.query(`SELECT status FROM public.editorial_schedule WHERE id = '${schedLockWaitId}'`);
      assert(verifySchedLock.rows[0].status === 'validated', 'Editorial schedule remains validated');
    } finally {
      try { await client.query('ROLLBACK'); } catch {}
      try { await client2.query('ROLLBACK'); } catch {}
      try { await client2.end(); } catch {}
    }

    // 7.9 Transactional Rollback Proof: Controlled abort after story update rolls back all mutations
    const storyRollbackId = '77777777-0000-0000-0000-000000000050';
    const schedRollbackId = '77777777-0000-0000-0000-000000000051';
    const validLeaseRollback = new Date().toISOString();

    await client.query(`
      INSERT INTO public.stories (id, slug, title, status, version)
      VALUES ('${storyRollbackId}', 'rollback-story', 'Rollback Story', 'draft', 1)
      ON CONFLICT (id) DO UPDATE SET status = 'draft', version = 1;
    `);

    await client.query(`
      INSERT INTO public.editorial_schedule (id, story_id, slot_date, slot_position, status, validated_at, category)
      VALUES ('${schedRollbackId}', '${storyRollbackId}', '2026-10-24', 1, 'validated', '${validLeaseRollback}', 'test-abort-trigger')
      ON CONFLICT (id) DO UPDATE SET status = 'validated', validated_at = '${validLeaseRollback}', category = 'test-abort-trigger';
    `);

    await client.query(`
      CREATE OR REPLACE FUNCTION public.fn_test_force_abort() RETURNS TRIGGER AS $$
      BEGIN
        IF NEW.category = 'test-abort-trigger' AND NEW.status = 'published' THEN
          RAISE EXCEPTION 'CONTROLLED_TRANSACTION_FAILURE_INJECTED';
        END IF;
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;

      CREATE TRIGGER trg_test_abort_simulation
        BEFORE UPDATE ON public.editorial_schedule
        FOR EACH ROW EXECUTE FUNCTION public.fn_test_force_abort();
    `);

    await client.query('BEGIN');
    await actAs(client, 'service_role', {});
    let rollbackThrown = false;
    try {
      await client.query(`
        SELECT public.fn_publish_story_fenced(
          '${schedRollbackId}'::UUID,
          '${storyRollbackId}'::UUID,
          '${validLeaseRollback}'::TIMESTAMPTZ,
          1,
          NOW(),
          'system-scheduler'
        );
      `);
    } catch (err: any) {
      if (err.message.includes('CONTROLLED_TRANSACTION_FAILURE_INJECTED')) {
        rollbackThrown = true;
      }
    }
    await client.query('ROLLBACK');

    await client.query('DROP TRIGGER IF EXISTS trg_test_abort_simulation ON public.editorial_schedule;');
    await client.query('DROP FUNCTION IF EXISTS public.fn_test_force_abort();');

    assert(rollbackThrown, 'Injected exception after story update throws in fn_publish_story_fenced');

    const verifyStoryRollback = await client.query(`SELECT status, version FROM public.stories WHERE id = '${storyRollbackId}'`);
    assert(verifyStoryRollback.rows[0].status === 'draft', 'Story update was rolled back atomically (remains draft)');
    assert(verifyStoryRollback.rows[0].version === 1, 'Story version was rolled back atomically (remains 1)');

    const verifySchedRollback = await client.query(`SELECT status FROM public.editorial_schedule WHERE id = '${schedRollbackId}'`);
    assert(verifySchedRollback.rows[0].status === 'validated', 'Editorial schedule remains validated after rollback');

    // 7.10 Story Version Bump Integrity: Verifies version increments exactly once per transition
    const storyVersionCheckId = '77777777-0000-0000-0000-000000000060';
    const schedVersionCheckId = '77777777-0000-0000-0000-000000000061';
    const validLeaseVersionCheck = new Date().toISOString();

    await client.query(`
      INSERT INTO public.stories (id, slug, title, status, version)
      VALUES ('${storyVersionCheckId}', 'version-check-story', 'Version Check Story', 'draft', 5)
      ON CONFLICT (id) DO UPDATE SET status = 'draft', version = 5;
    `);

    await client.query(`
      INSERT INTO public.editorial_schedule (id, story_id, slot_date, slot_position, status, validated_at)
      VALUES ('${schedVersionCheckId}', '${storyVersionCheckId}', '2026-10-25', 1, 'validated', '${validLeaseVersionCheck}')
      ON CONFLICT (id) DO UPDATE SET status = 'validated', validated_at = '${validLeaseVersionCheck}';
    `);

    await client.query('BEGIN');
    await actAs(client, 'service_role', {});
    const publishResVersion = await client.query(`
      SELECT public.fn_publish_story_fenced(
        '${schedVersionCheckId}'::UUID,
        '${storyVersionCheckId}'::UUID,
        '${validLeaseVersionCheck}'::TIMESTAMPTZ,
        5,
        NOW(),
        'system-scheduler'
      ) as result;
    `);
    await client.query('COMMIT');

    const resultVersion = publishResVersion.rows[0].result;
    assert(resultVersion.success === true, 'Publication at version 5 succeeds');
    assert(resultVersion.version === 6, 'Version increments exactly once from 5 to 6');

    const verifyStoryVersion = await client.query(`SELECT version FROM public.stories WHERE id = '${storyVersionCheckId}'`);
    assert(verifyStoryVersion.rows[0].version === 6, 'Persisted database version is authoritatively 6');

    // 7.11 published_at Contract: Draft with no prior timestamp receives publication instant
    const storyNoTsId = '77777777-0000-0000-0000-000000000070';
    const schedNoTsId = '77777777-0000-0000-0000-000000000071';
    const leaseNoTs = new Date().toISOString();

    await client.query(`
      INSERT INTO public.stories (id, slug, title, status, version, published_at, is_test_artifact)
      VALUES ('${storyNoTsId}', 'no-ts-story', 'No Prior TS Story', 'draft', 1, NULL, false)
      ON CONFLICT (id) DO UPDATE SET status = 'draft', version = 1, published_at = NULL, is_test_artifact = false;
    `);

    await client.query(`
      INSERT INTO public.editorial_schedule (id, story_id, slot_date, slot_position, status, validated_at)
      VALUES ('${schedNoTsId}', '${storyNoTsId}', '2026-10-26', 1, 'validated', '${leaseNoTs}')
      ON CONFLICT (id) DO UPDATE SET status = 'validated', validated_at = '${leaseNoTs}';
    `);

    await client.query('BEGIN');
    await actAs(client, 'service_role', {});
    const publishResNoTs = await client.query(`
      SELECT public.fn_publish_story_fenced(
        '${schedNoTsId}'::UUID,
        '${storyNoTsId}'::UUID,
        '${leaseNoTs}'::TIMESTAMPTZ,
        1,
        '2026-10-18T12:00:00.000Z'::TIMESTAMPTZ,
        'system-scheduler'
      ) as result;
    `);
    await client.query('COMMIT');

    const resultNoTs = publishResNoTs.rows[0].result;
    assert(resultNoTs.success === true, 'Publication of story without prior published_at succeeds');
    assert(new Date(resultNoTs.published_at).toISOString() === '2026-10-18T12:00:00.000Z', 'Published_at assigned transaction publish time');

    const verifyPublicNoTs = await client.query(`
      SELECT id FROM public.stories
      WHERE id = '${storyNoTsId}'
        AND status = 'published'
        AND is_test_artifact = false
        AND published_at <= NOW();
    `);
    assert(verifyPublicNoTs.rows.length === 1, 'Story with freshly assigned published_at satisfies public read predicate');

    // 7.12 published_at Contract: Preserves non-null historical timestamp
    const storyHistId = '77777777-0000-0000-0000-000000000080';
    const schedHistId = '77777777-0000-0000-0000-000000000081';
    const leaseHist = new Date().toISOString();
    const historicalTime = '2024-05-10T10:00:00.000Z';

    await client.query(`
      INSERT INTO public.stories (id, slug, title, status, version, published_at, is_test_artifact)
      VALUES ('${storyHistId}', 'hist-story', 'Historical Story', 'draft', 1, '${historicalTime}', false)
      ON CONFLICT (id) DO UPDATE SET status = 'draft', version = 1, published_at = '${historicalTime}', is_test_artifact = false;
    `);

    await client.query(`
      INSERT INTO public.editorial_schedule (id, story_id, slot_date, slot_position, status, validated_at)
      VALUES ('${schedHistId}', '${storyHistId}', '2026-10-27', 1, 'validated', '${leaseHist}')
      ON CONFLICT (id) DO UPDATE SET status = 'validated', validated_at = '${leaseHist}';
    `);

    await client.query('BEGIN');
    await actAs(client, 'service_role', {});
    const publishResHist = await client.query(`
      SELECT public.fn_publish_story_fenced(
        '${schedHistId}'::UUID,
        '${storyHistId}'::UUID,
        '${leaseHist}'::TIMESTAMPTZ,
        1,
        '2026-10-18T14:00:00.000Z'::TIMESTAMPTZ,
        'system-scheduler'
      ) as result;
    `);
    await client.query('COMMIT');

    const resultHist = publishResHist.rows[0].result;
    assert(resultHist.success === true, 'Publication of story with historical timestamp succeeds');
    assert(new Date(resultHist.published_at).toISOString() === historicalTime, 'Historical published_at is strictly preserved');
    assert(new Date(resultHist.updated_at).getTime() > new Date(historicalTime).getTime(), 'Updated_at is current and distinct from historical published_at');
    assert(new Date(resultHist.schedule_published_at).toISOString() === historicalTime, 'Editorial schedule published_at aligns with historical story date');

    const verifyPublicHist = await client.query(`
      SELECT id FROM public.stories
      WHERE id = '${storyHistId}'
        AND status = 'published'
        AND is_test_artifact = false
        AND published_at <= NOW();
    `);
    assert(verifyPublicHist.rows.length === 1, 'Historical published story satisfies public query predicate');

    // 7.13 published_at Contract: Normalizes future timestamp to transaction publish time
    const storyFutureId = '77777777-0000-0000-0000-000000000090';
    const schedFutureId = '77777777-0000-0000-0000-000000000091';
    const leaseFuture = new Date().toISOString();
    const futureTime = '2030-01-01T00:00:00.000Z';
    const txPublishTime = '2026-10-18T15:00:00.000Z';

    await client.query(`
      INSERT INTO public.stories (id, slug, title, status, version, published_at, is_test_artifact)
      VALUES ('${storyFutureId}', 'future-story', 'Future Story', 'draft', 1, '${futureTime}', false)
      ON CONFLICT (id) DO UPDATE SET status = 'draft', version = 1, published_at = '${futureTime}', is_test_artifact = false;
    `);

    await client.query(`
      INSERT INTO public.editorial_schedule (id, story_id, slot_date, slot_position, status, validated_at)
      VALUES ('${schedFutureId}', '${storyFutureId}', '2026-10-28', 1, 'validated', '${leaseFuture}')
      ON CONFLICT (id) DO UPDATE SET status = 'validated', validated_at = '${leaseFuture}';
    `);

    await client.query('BEGIN');
    await actAs(client, 'service_role', {});
    const publishResFuture = await client.query(`
      SELECT public.fn_publish_story_fenced(
        '${schedFutureId}'::UUID,
        '${storyFutureId}'::UUID,
        '${leaseFuture}'::TIMESTAMPTZ,
        1,
        '${txPublishTime}'::TIMESTAMPTZ,
        'system-scheduler'
      ) as result;
    `);
    await client.query('COMMIT');

    const resultFuture = publishResFuture.rows[0].result;
    assert(resultFuture.success === true, 'Publication of story with future timestamp succeeds');
    assert(new Date(resultFuture.published_at).toISOString() === txPublishTime, 'Future timestamp normalized to transaction publish time');

    const verifyPublicFuture = await client.query(`
      SELECT id FROM public.stories
      WHERE id = '${storyFutureId}'
        AND status = 'published'
        AND is_test_artifact = false
        AND published_at <= NOW();
    `);
    assert(verifyPublicFuture.rows.length === 1, 'Normalized story is immediately visible to public queries (not hidden in future)');

    // 7.14 Principal & Scheduler Attribution Contract: UUID storage vs Actor Label
    const storyAttrId = '77777777-0000-0000-0000-000000000100';
    const schedAttrId = '77777777-0000-0000-0000-000000000101';
    const leaseAttr = new Date().toISOString();
    const editorUuid = '11111111-2222-3333-4444-555555555555';

    await client.query(`
      INSERT INTO public.stories (id, slug, title, status, version)
      VALUES ('${storyAttrId}', 'attr-story', 'Attribution Story', 'draft', 1)
      ON CONFLICT (id) DO UPDATE SET status = 'draft', version = 1;
    `);

    await client.query(`
      INSERT INTO public.editorial_schedule (id, story_id, slot_date, slot_position, status, validated_at)
      VALUES ('${schedAttrId}', '${storyAttrId}', '2026-10-29', 1, 'validated', '${leaseAttr}')
      ON CONFLICT (id) DO UPDATE SET status = 'validated', validated_at = '${leaseAttr}';
    `);

    await client.query('BEGIN');
    await actAs(client, 'service_role', {});
    const publishResAttr = await client.query(`
      SELECT public.fn_publish_story_fenced(
        '${schedAttrId}'::UUID,
        '${storyAttrId}'::UUID,
        '${leaseAttr}'::TIMESTAMPTZ,
        1,
        NOW(),
        '${editorUuid}'
      ) as result;
    `);
    await client.query('COMMIT');

    const resultAttr = publishResAttr.rows[0].result;
    assert(resultAttr.success === true, 'Publication with editor UUID succeeds');
    assert(resultAttr.updated_by === editorUuid, 'RPC JSON updated_by returns editor UUID');
    assert(resultAttr.actor === editorUuid, 'RPC JSON actor returns editor UUID');
    assert(resultAttr.scheduled_by === editorUuid, 'RPC JSON scheduled_by returns editor UUID');

    const verifyStoryAttr = await client.query(`SELECT updated_by, scheduled_by FROM public.stories WHERE id = '${storyAttrId}'`);
    assert(verifyStoryAttr.rows[0].updated_by === editorUuid, 'Database persisted updated_by matches editor UUID column');
    assert(verifyStoryAttr.rows[0].scheduled_by === editorUuid, 'Database persisted scheduled_by matches editor UUID label');

    // Untrusted arbitrary string attribution fails safe (does NOT map to trusted user)
    const storyMalId = '77777777-0000-0000-0000-000000000110';
    const schedMalId = '77777777-0000-0000-0000-000000000111';
    const leaseMal = new Date().toISOString();

    await client.query(`
      INSERT INTO public.stories (id, slug, title, status, version)
      VALUES ('${storyMalId}', 'mal-story', 'Malformed Attribution Story', 'draft', 1)
      ON CONFLICT (id) DO UPDATE SET status = 'draft', version = 1;
    `);

    await client.query(`
      INSERT INTO public.editorial_schedule (id, story_id, slot_date, slot_position, status, validated_at)
      VALUES ('${schedMalId}', '${storyMalId}', '2026-10-30', 1, 'validated', '${leaseMal}')
      ON CONFLICT (id) DO UPDATE SET status = 'validated', validated_at = '${leaseMal}';
    `);

    await client.query('BEGIN');
    await actAs(client, 'service_role', {});
    const publishResMal = await client.query(`
      SELECT public.fn_publish_story_fenced(
        '${schedMalId}'::UUID,
        '${storyMalId}'::UUID,
        '${leaseMal}'::TIMESTAMPTZ,
        1,
        NOW(),
        'untrusted-actor-label'
      ) as result;
    `);
    await client.query('COMMIT');

    const resultMal = publishResMal.rows[0].result;
    assert(resultMal.success === true, 'Publication with non-UUID actor succeeds');
    assert(resultMal.updated_by === null, 'Non-UUID input does not map to any trusted UUID (updated_by is null)');
    assert(resultMal.actor === 'untrusted-actor-label', 'Logical actor label preserved in actor field');
    assert(resultMal.scheduled_by === 'untrusted-actor-label', 'Persisted scheduled_by records non-UUID label');

    const verifyStoryMal = await client.query(`SELECT updated_by, scheduled_by FROM public.stories WHERE id = '${storyMalId}'`);
    assert(verifyStoryMal.rows[0].updated_by === null, 'Database persisted updated_by is NULL for untrusted string');
    assert(verifyStoryMal.rows[0].scheduled_by === 'untrusted-actor-label', 'Database persisted scheduled_by stores label');

    // 7.15 Complete Effective Privilege Matrix across all 5 roles
    const roles = ['anon', 'authenticated', 'publisher_worker', 'authenticator', 'service_role'] as const;
    const fencedFp = 'public.fn_publish_story_fenced(uuid,uuid,timestamptz,integer,timestamptz,text)';
    const auditFp = 'public.fn_publish_story_with_audit(uuid)';
    const claimFp = 'public.fn_claim_due_schedule_entry()';

    for (const r of roles) {
      const fencedRes = await client.query(`SELECT has_function_privilege('${r}', '${fencedFp}', 'execute') as p;`);
      const auditRes = await client.query(`SELECT has_function_privilege('${r}', '${auditFp}', 'execute') as p;`);
      const claimRes = await client.query(`SELECT has_function_privilege('${r}', '${claimFp}', 'execute') as p;`);

      if (r === 'service_role') {
        assert(fencedRes.rows[0].p === true, `service_role HAS execute on ${fencedFp}`);
        assert(auditRes.rows[0].p === false, `service_role has NO execute on legacy ${auditFp}`);
        assert(claimRes.rows[0].p === false, `service_role has NO execute on legacy ${claimFp}`);
      } else {
        assert(fencedRes.rows[0].p === false, `${r} has NO execute on ${fencedFp}`);
        assert(auditRes.rows[0].p === false, `${r} has NO execute on legacy ${auditFp}`);
        assert(claimRes.rows[0].p === false, `${r} has NO execute on legacy ${claimFp}`);
      }
    }

    // 7.16 Null expected lease timestamp rejection: p_expected_validated_at = NULL -> SCHEDULE_LEASE_LOST
    const storyNullExpId = '77777777-0000-0000-0000-000000000120';
    const schedNullExpId = '77777777-0000-0000-0000-000000000121';
    const leaseValid16 = new Date().toISOString();

    await client.query(`
      INSERT INTO public.stories (id, slug, title, status, version)
      VALUES ('${storyNullExpId}', 'null-exp-story', 'Null Expected Lease Story', 'draft', 1)
      ON CONFLICT (id) DO UPDATE SET status = 'draft', version = 1;
    `);
    await client.query(`
      INSERT INTO public.editorial_schedule (id, story_id, slot_date, slot_position, status, validated_at)
      VALUES ('${schedNullExpId}', '${storyNullExpId}', '2026-10-31', 1, 'validated', '${leaseValid16}')
      ON CONFLICT (id) DO UPDATE SET status = 'validated', validated_at = '${leaseValid16}';
    `);

    await client.query('BEGIN');
    await actAs(client, 'service_role', {});
    const publishResNullExp = await client.query(`
      SELECT public.fn_publish_story_fenced(
        '${schedNullExpId}'::UUID,
        '${storyNullExpId}'::UUID,
        NULL::TIMESTAMPTZ,
        1,
        NOW(),
        'system-scheduler'
      ) as result;
    `);
    await client.query('COMMIT');

    const resultNullExp = publishResNullExp.rows[0].result;
    assert(resultNullExp.success === false, 'NULL p_expected_validated_at fails closed');
    assert(resultNullExp.code === 'SCHEDULE_LEASE_LOST', 'Returns SCHEDULE_LEASE_LOST when caller provides NULL lease');

    // 7.17 Null stored lease timestamp rejection: locked row validated_at = NULL -> SCHEDULE_LEASE_LOST
    const storyNullStoredId = '77777777-0000-0000-0000-000000000130';
    const schedNullStoredId = '77777777-0000-0000-0000-000000000131';

    await client.query(`
      INSERT INTO public.stories (id, slug, title, status, version)
      VALUES ('${storyNullStoredId}', 'null-stored-story', 'Null Stored Lease Story', 'draft', 1)
      ON CONFLICT (id) DO UPDATE SET status = 'draft', version = 1;
    `);
    await client.query(`
      INSERT INTO public.editorial_schedule (id, story_id, slot_date, slot_position, status, validated_at)
      VALUES ('${schedNullStoredId}', '${storyNullStoredId}', '2026-11-01', 1, 'validated', NULL)
      ON CONFLICT (id) DO UPDATE SET status = 'validated', validated_at = NULL;
    `);

    await client.query('BEGIN');
    await actAs(client, 'service_role', {});
    const publishResNullStored = await client.query(`
      SELECT public.fn_publish_story_fenced(
        '${schedNullStoredId}'::UUID,
        '${storyNullStoredId}'::UUID,
        NULL::TIMESTAMPTZ,
        1,
        NOW(),
        'system-scheduler'
      ) as result;
    `);
    await client.query('COMMIT');

    const resultNullStored = publishResNullStored.rows[0].result;
    assert(resultNullStored.success === false, 'NULL stored validated_at fails closed even if parameter is also NULL');
    assert(resultNullStored.code === 'SCHEDULE_LEASE_LOST', 'Returns SCHEDULE_LEASE_LOST when stored lease is NULL');

    // 7.18 Persisted scheduled_by: story with pre-existing scheduled_by preserves stored value
    const storySchedPreserveId = '77777777-0000-0000-0000-000000000140';
    const schedSchedPreserveId = '77777777-0000-0000-0000-000000000141';
    const leasePreserve18 = new Date().toISOString();

    await client.query(`
      INSERT INTO public.stories (id, slug, title, status, version, scheduled_by)
      VALUES ('${storySchedPreserveId}', 'sched-preserve-story', 'Preserve Scheduled By', 'draft', 1, 'original-scheduler-user')
      ON CONFLICT (id) DO UPDATE SET status = 'draft', version = 1, scheduled_by = 'original-scheduler-user';
    `);
    await client.query(`
      INSERT INTO public.editorial_schedule (id, story_id, slot_date, slot_position, status, validated_at)
      VALUES ('${schedSchedPreserveId}', '${storySchedPreserveId}', '2026-11-02', 1, 'validated', '${leasePreserve18}')
      ON CONFLICT (id) DO UPDATE SET status = 'validated', validated_at = '${leasePreserve18}';
    `);

    await client.query('BEGIN');
    await actAs(client, 'service_role', {});
    const publishResPreserve = await client.query(`
      SELECT public.fn_publish_story_fenced(
        '${schedSchedPreserveId}'::UUID,
        '${storySchedPreserveId}'::UUID,
        '${leasePreserve18}'::TIMESTAMPTZ,
        1,
        NOW(),
        'worker-override-actor'
      ) as result;
    `);
    await client.query('COMMIT');

    const resultPreserve = publishResPreserve.rows[0].result;
    assert(resultPreserve.success === true, 'Publication with pre-existing scheduled_by succeeds');
    assert(resultPreserve.actor === 'worker-override-actor', 'RPC JSON actor reports calling actor');
    assert(resultPreserve.scheduled_by === 'original-scheduler-user', 'RPC JSON scheduled_by preserves pre-existing label');

    const verifyPreserve = await client.query(`SELECT scheduled_by FROM public.stories WHERE id = '${storySchedPreserveId}'`);
    assert(verifyPreserve.rows[0].scheduled_by === 'original-scheduler-user', 'Database row preserves pre-existing scheduled_by');

    // 7.19 Persisted scheduled_by: story with NULL scheduled_by receives input label
    const storySchedNullId = '77777777-0000-0000-0000-000000000150';
    const schedSchedNullId = '77777777-0000-0000-0000-000000000151';
    const leaseNull19 = new Date().toISOString();

    await client.query(`
      INSERT INTO public.stories (id, slug, title, status, version, scheduled_by)
      VALUES ('${storySchedNullId}', 'sched-null-story', 'Null Scheduled By', 'draft', 1, NULL)
      ON CONFLICT (id) DO UPDATE SET status = 'draft', version = 1, scheduled_by = NULL;
    `);
    await client.query(`
      INSERT INTO public.editorial_schedule (id, story_id, slot_date, slot_position, status, validated_at)
      VALUES ('${schedSchedNullId}', '${storySchedNullId}', '2026-11-03', 1, 'validated', '${leaseNull19}')
      ON CONFLICT (id) DO UPDATE SET status = 'validated', validated_at = '${leaseNull19}';
    `);

    await client.query('BEGIN');
    await actAs(client, 'service_role', {});
    const publishResPopulate = await client.query(`
      SELECT public.fn_publish_story_fenced(
        '${schedSchedNullId}'::UUID,
        '${storySchedNullId}'::UUID,
        '${leaseNull19}'::TIMESTAMPTZ,
        1,
        NOW(),
        'first-time-scheduler'
      ) as result;
    `);
    await client.query('COMMIT');

    const resultPopulate = publishResPopulate.rows[0].result;
    assert(resultPopulate.success === true, 'Publication of story with NULL scheduled_by succeeds');
    assert(resultPopulate.scheduled_by === 'first-time-scheduler', 'RPC JSON scheduled_by receives input label');

    const verifyPopulate = await client.query(`SELECT scheduled_by FROM public.stories WHERE id = '${storySchedNullId}'`);
    assert(verifyPopulate.rows[0].scheduled_by === 'first-time-scheduler', 'Database row stores input label in scheduled_by');

    // 7.20 Caller-supplied timestamp boundary: draft with NULL published_at and future p_published_at clamps to database time
    const storyClampId = '77777777-0000-0000-0000-000000000160';
    const schedClampId = '77777777-0000-0000-0000-000000000161';
    const leaseClamp20 = new Date().toISOString();
    const farFuture = '2035-08-01T00:00:00.000Z';

    await client.query(`
      INSERT INTO public.stories (id, slug, title, status, version, published_at, is_test_artifact)
      VALUES ('${storyClampId}', 'clamp-story', 'Future Timestamp Clamped Story', 'draft', 1, NULL, false)
      ON CONFLICT (id) DO UPDATE SET status = 'draft', version = 1, published_at = NULL, is_test_artifact = false;
    `);
    await client.query(`
      INSERT INTO public.editorial_schedule (id, story_id, slot_date, slot_position, status, validated_at)
      VALUES ('${schedClampId}', '${storyClampId}', '2026-11-04', 1, 'validated', '${leaseClamp20}')
      ON CONFLICT (id) DO UPDATE SET status = 'validated', validated_at = '${leaseClamp20}';
    `);

    await client.query('BEGIN');
    await actAs(client, 'service_role', {});
    const publishResClamp = await client.query(`
      SELECT public.fn_publish_story_fenced(
        '${schedClampId}'::UUID,
        '${storyClampId}'::UUID,
        '${leaseClamp20}'::TIMESTAMPTZ,
        1,
        '${farFuture}'::TIMESTAMPTZ,
        'system-scheduler'
      ) as result;
    `);
    await client.query('COMMIT');

    const resultClamp = publishResClamp.rows[0].result;
    assert(resultClamp.success === true, 'Publication with caller future timestamp succeeds');
    assert(new Date(resultClamp.published_at).getTime() < new Date(farFuture).getTime(), 'Caller future timestamp was clamped to database clock');
    assert(new Date(resultClamp.published_at).getTime() <= Date.now() + 5000, 'Clamped published_at is not in the future relative to wall clock');

    const verifyPublicClamp = await client.query(`
      SELECT id FROM public.stories
      WHERE id = '${storyClampId}'
        AND status = 'published'
        AND is_test_artifact = false
        AND published_at <= NOW();
    `);
    assert(verifyPublicClamp.rows.length === 1, 'Clamped story satisfies public read predicate (published_at <= NOW())');

    // 7.21 Caller-supplied timestamp boundary: story with historical published_at and future p_published_at preserves historical timestamp
    const storyHistFutureId = '77777777-0000-0000-0000-000000000170';
    const schedHistFutureId = '77777777-0000-0000-0000-000000000171';
    const leaseHistFuture21 = new Date().toISOString();
    const historicalDate21 = '2023-04-15T08:30:00.000Z';

    await client.query(`
      INSERT INTO public.stories (id, slug, title, status, version, published_at, is_test_artifact)
      VALUES ('${storyHistFutureId}', 'hist-future-story', 'Historical Story With Future Param', 'draft', 1, '${historicalDate21}', false)
      ON CONFLICT (id) DO UPDATE SET status = 'draft', version = 1, published_at = '${historicalDate21}', is_test_artifact = false;
    `);
    await client.query(`
      INSERT INTO public.editorial_schedule (id, story_id, slot_date, slot_position, status, validated_at)
      VALUES ('${schedHistFutureId}', '${storyHistFutureId}', '2026-11-05', 1, 'validated', '${leaseHistFuture21}')
      ON CONFLICT (id) DO UPDATE SET status = 'validated', validated_at = '${leaseHistFuture21}';
    `);

    await client.query('BEGIN');
    await actAs(client, 'service_role', {});
    const publishResHistFuture = await client.query(`
      SELECT public.fn_publish_story_fenced(
        '${schedHistFutureId}'::UUID,
        '${storyHistFutureId}'::UUID,
        '${leaseHistFuture21}'::TIMESTAMPTZ,
        1,
        '${farFuture}'::TIMESTAMPTZ,
        'system-scheduler'
      ) as result;
    `);
    await client.query('COMMIT');

    const resultHistFuture = publishResHistFuture.rows[0].result;
    assert(resultHistFuture.success === true, 'Publication of historical story with future parameter succeeds');
    assert(new Date(resultHistFuture.published_at).toISOString() === historicalDate21, 'Historical published_at is preserved despite caller future parameter');

    // 7.22 Caller-supplied timestamp boundary: story with future published_at and future p_published_at clamps to database time
    const storyFutureBothId = '77777777-0000-0000-0000-000000000180';
    const schedFutureBothId = '77777777-0000-0000-0000-000000000181';
    const leaseBoth22 = new Date().toISOString();
    const futureRowDate = '2032-06-01T00:00:00.000Z';

    await client.query(`
      INSERT INTO public.stories (id, slug, title, status, version, published_at, is_test_artifact)
      VALUES ('${storyFutureBothId}', 'future-both-story', 'Both Future Story', 'draft', 1, '${futureRowDate}', false)
      ON CONFLICT (id) DO UPDATE SET status = 'draft', version = 1, published_at = '${futureRowDate}', is_test_artifact = false;
    `);
    await client.query(`
      INSERT INTO public.editorial_schedule (id, story_id, slot_date, slot_position, status, validated_at)
      VALUES ('${schedFutureBothId}', '${storyFutureBothId}', '2026-11-06', 1, 'validated', '${leaseBoth22}')
      ON CONFLICT (id) DO UPDATE SET status = 'validated', validated_at = '${leaseBoth22}';
    `);

    await client.query('BEGIN');
    await actAs(client, 'service_role', {});
    const publishResBoth = await client.query(`
      SELECT public.fn_publish_story_fenced(
        '${schedFutureBothId}'::UUID,
        '${storyFutureBothId}'::UUID,
        '${leaseBoth22}'::TIMESTAMPTZ,
        1,
        '${farFuture}'::TIMESTAMPTZ,
        'system-scheduler'
      ) as result;
    `);
    await client.query('COMMIT');

    const resultBoth = publishResBoth.rows[0].result;
    assert(resultBoth.success === true, 'Publication of story with future row and future param succeeds');
    assert(new Date(resultBoth.published_at).getTime() < new Date(futureRowDate).getTime(), 'Future published_at from story row was not accepted');
    assert(new Date(resultBoth.published_at).getTime() < new Date(farFuture).getTime(), 'Future published_at from caller param was not accepted');

    const verifyPublicBoth = await client.query(`
      SELECT id FROM public.stories
      WHERE id = '${storyFutureBothId}'
        AND status = 'published'
        AND is_test_artifact = false
        AND published_at <= NOW();
    `);
    assert(verifyPublicBoth.rows.length === 1, 'Clamped both-future story is immediately visible to public query');

    // 7.23 Caller-supplied timestamp boundary: p_published_at = NULL sets database time
    const storyParamNullId = '77777777-0000-0000-0000-000000000190';
    const schedParamNullId = '77777777-0000-0000-0000-000000000191';
    const leaseParamNull23 = new Date().toISOString();

    await client.query(`
      INSERT INTO public.stories (id, slug, title, status, version, published_at, is_test_artifact)
      VALUES ('${storyParamNullId}', 'param-null-story', 'Param NULL Story', 'draft', 1, NULL, false)
      ON CONFLICT (id) DO UPDATE SET status = 'draft', version = 1, published_at = NULL, is_test_artifact = false;
    `);
    await client.query(`
      INSERT INTO public.editorial_schedule (id, story_id, slot_date, slot_position, status, validated_at)
      VALUES ('${schedParamNullId}', '${storyParamNullId}', '2026-11-07', 1, 'validated', '${leaseParamNull23}')
      ON CONFLICT (id) DO UPDATE SET status = 'validated', validated_at = '${leaseParamNull23}';
    `);

    await client.query('BEGIN');
    await actAs(client, 'service_role', {});
    const publishResParamNull = await client.query(`
      SELECT public.fn_publish_story_fenced(
        '${schedParamNullId}'::UUID,
        '${storyParamNullId}'::UUID,
        '${leaseParamNull23}'::TIMESTAMPTZ,
        1,
        NULL::TIMESTAMPTZ,
        'system-scheduler'
      ) as result;
    `);
    await client.query('COMMIT');

    const resultParamNull = publishResParamNull.rows[0].result;
    assert(resultParamNull.success === true, 'Publication with NULL p_published_at succeeds');
    assert(resultParamNull.published_at !== null, 'Published_at is assigned authoritative database clock time');
    assert(new Date(resultParamNull.published_at).getTime() <= Date.now() + 5000, 'Assigned time is not in the future');

    const verifyPublicParamNull = await client.query(`
      SELECT id FROM public.stories
      WHERE id = '${storyParamNullId}'
        AND status = 'published'
        AND is_test_artifact = false
        AND published_at <= NOW();
    `);
    assert(verifyPublicParamNull.rows.length === 1, 'Story with NULL p_published_at satisfies public read predicate');

    // 7.24 Caller-supplied timestamp boundary: p_published_at = NOW() sets valid timestamp
    const storyNowParamId = '77777777-0000-0000-0000-000000000200';
    const schedNowParamId = '77777777-0000-0000-0000-000000000201';
    const leaseNowParam24 = new Date().toISOString();

    await client.query(`
      INSERT INTO public.stories (id, slug, title, status, version, published_at, is_test_artifact)
      VALUES ('${storyNowParamId}', 'now-param-story', 'Now Param Story', 'draft', 1, NULL, false)
      ON CONFLICT (id) DO UPDATE SET status = 'draft', version = 1, published_at = NULL, is_test_artifact = false;
    `);
    await client.query(`
      INSERT INTO public.editorial_schedule (id, story_id, slot_date, slot_position, status, validated_at)
      VALUES ('${schedNowParamId}', '${storyNowParamId}', '2026-11-08', 1, 'validated', '${leaseNowParam24}')
      ON CONFLICT (id) DO UPDATE SET status = 'validated', validated_at = '${leaseNowParam24}';
    `);

    await client.query('BEGIN');
    await actAs(client, 'service_role', {});
    const publishResNow = await client.query(`
      SELECT public.fn_publish_story_fenced(
        '${schedNowParamId}'::UUID,
        '${storyNowParamId}'::UUID,
        '${leaseNowParam24}'::TIMESTAMPTZ,
        1,
        NOW(),
        'system-scheduler'
      ) as result;
    `);
    await client.query('COMMIT');

    const resultNow = publishResNow.rows[0].result;
    assert(resultNow.success === true, 'Publication with NOW() p_published_at succeeds');
    assert(resultNow.published_at !== null, 'Published_at is assigned valid timestamp');
    assert(new Date(resultNow.published_at).getTime() <= Date.now() + 5000, 'Assigned time is not in the future');

    const verifyPublicNow = await client.query(`
      SELECT id FROM public.stories
      WHERE id = '${storyNowParamId}'
        AND status = 'published'
        AND is_test_artifact = false
        AND published_at <= NOW();
    `);
    assert(verifyPublicNow.rows.length === 1, 'Story with NOW() p_published_at satisfies public read predicate');

    // ─────────────────────────────────────────────────────────────────
    // 8. Phase 43: Database-Authoritative Leases, Clock Triggers & Post-Commit Outbox
    // ─────────────────────────────────────────────────────────────────
    console.log('\n8. Phase 43: Database-Authoritative Leases, Clock Triggers & Post-Commit Outbox');

    // 8.1 Database-Authoritative Claim: Acquires lease via database clock_timestamp()
    const storyClaim1Id = '77777777-0000-0000-0000-000000000300';
    const schedClaim1Id = '77777777-0000-0000-0000-000000000301';

    await client.query(`
      INSERT INTO public.stories (id, slug, title, status, version)
      VALUES ('${storyClaim1Id}', 'claim-story-1', 'Claim Story 1', 'draft', 1)
      ON CONFLICT (id) DO UPDATE SET status = 'draft', version = 1;
    `);
    await client.query(`
      INSERT INTO public.editorial_schedule (id, story_id, slot_date, slot_position, status)
      VALUES ('${schedClaim1Id}', '${storyClaim1Id}', CURRENT_DATE, 4, 'ready')
      ON CONFLICT (id) DO UPDATE SET status = 'ready', validated_at = NULL, slot_date = CURRENT_DATE, slot_position = 4;
    `);

    await client.query('BEGIN');
    await actAs(client, 'service_role', {});
    const claimRes1 = await client.query(`
      SELECT public.fn_claim_schedule_entry_fenced(
        '${schedClaim1Id}'::UUID,
        '${storyClaim1Id}'::UUID
      ) as result;
    `);
    await client.query('COMMIT');

    const resultClaim1 = claimRes1.rows[0].result;
    assert(resultClaim1.success === true, 'Database-authoritative claim succeeds for ready entry');
    assert(resultClaim1.code === 'CLAIMED', 'Result code is CLAIMED');
    assert(resultClaim1.status === 'validated', 'Returned status is validated');
    assert(resultClaim1.validated_at !== null, 'Returned validated_at is populated');
    assert(new Date(resultClaim1.validated_at).getTime() <= Date.now() + 2000, 'Claim timestamp generated from database clock');

    const verifyClaim1 = await client.query(`
      SELECT status, validated_at FROM public.editorial_schedule WHERE id = '${schedClaim1Id}';
    `);
    assert(verifyClaim1.rows[0].status === 'validated', 'Persisted status is validated');
    assert(new Date(verifyClaim1.rows[0].validated_at).toISOString() === new Date(resultClaim1.validated_at).toISOString(), 'Persisted validated_at matches RPC returned timestamp');

    // 8.2 Concurrency & Mutual Exclusion: Competing claim while lease is active is rejected
    await client.query('BEGIN');
    await actAs(client, 'service_role', {});
    const claimResActive = await client.query(`
      SELECT public.fn_claim_schedule_entry_fenced(
        '${schedClaim1Id}'::UUID,
        '${storyClaim1Id}'::UUID
      ) as result;
    `);
    await client.query('COMMIT');

    const resultClaimActive = claimResActive.rows[0].result;
    assert(resultClaimActive.success === false, 'Competing claim during active lease fails closed');
    assert(resultClaimActive.code === 'SCHEDULE_LEASE_ACTIVE', 'Result code is SCHEDULE_LEASE_ACTIVE');

    // 8.3 Stale Lease Reclaiming: Expired lease (>= 5 minutes old) is safely reclaimed
    const expiredClaimTime = new Date(Date.now() - 6 * 60 * 1000).toISOString();
    await client.query(`
      UPDATE public.editorial_schedule
      SET validated_at = '${expiredClaimTime}'
      WHERE id = '${schedClaim1Id}';
    `);

    await client.query('BEGIN');
    await actAs(client, 'service_role', {});
    const claimResRenew = await client.query(`
      SELECT public.fn_claim_schedule_entry_fenced(
        '${schedClaim1Id}'::UUID,
        '${storyClaim1Id}'::UUID
      ) as result;
    `);
    await client.query('COMMIT');

    const resultClaimRenew = claimResRenew.rows[0].result;
    assert(resultClaimRenew.success === true, 'Expired lease is safely reclaimed');
    assert(resultClaimRenew.code === 'CLAIMED', 'Renew code is CLAIMED');
    assert(new Date(resultClaimRenew.validated_at).getTime() > new Date(expiredClaimTime).getTime(), 'New lease has fresh database clock timestamp');

    // 8.4 Due Date Invariant: Future slot_date rejected
    const schedFutureDateId = '77777777-0000-0000-0000-000000000302';
    await client.query(`
      INSERT INTO public.editorial_schedule (id, story_id, slot_date, slot_position, status)
      VALUES ('${schedFutureDateId}', '${storyClaim1Id}', CURRENT_DATE + INTERVAL '1 day', 2, 'ready')
      ON CONFLICT (id) DO UPDATE SET status = 'ready', slot_date = CURRENT_DATE + INTERVAL '1 day', slot_position = 2;
    `);

    await client.query('BEGIN');
    await actAs(client, 'service_role', {});
    const claimResFutureDate = await client.query(`
      SELECT public.fn_claim_schedule_entry_fenced(
        '${schedFutureDateId}'::UUID,
        '${storyClaim1Id}'::UUID
      ) as result;
    `);
    await client.query('COMMIT');

    const resultClaimFutureDate = claimResFutureDate.rows[0].result;
    assert(resultClaimFutureDate.success === false, 'Claim of entry with future slot_date fails closed');
    assert(resultClaimFutureDate.code === 'SCHEDULE_NOT_DUE', 'Result code is SCHEDULE_NOT_DUE');

    // 8.5 Mismatched Story ID Rejected
    await client.query('BEGIN');
    await actAs(client, 'service_role', {});
    const claimResMismatch = await client.query(`
      SELECT public.fn_claim_schedule_entry_fenced(
        '${schedClaim1Id}'::UUID,
        gen_random_uuid()
      ) as result;
    `);
    await client.query('COMMIT');

    const resultClaimMismatch = claimResMismatch.rows[0].result;
    assert(resultClaimMismatch.success === false, 'Claim with mismatched story_id fails closed');
    assert(resultClaimMismatch.code === 'SCHEDULE_STORY_MISMATCH', 'Result code is SCHEDULE_STORY_MISMATCH');

    // 8.6 Ineligible Status Rejected
    await client.query(`UPDATE public.editorial_schedule SET status = 'blocked' WHERE id = '${schedClaim1Id}';`);
    await client.query('BEGIN');
    await actAs(client, 'service_role', {});
    const claimResBlocked = await client.query(`
      SELECT public.fn_claim_schedule_entry_fenced(
        '${schedClaim1Id}'::UUID,
        '${storyClaim1Id}'::UUID
      ) as result;
    `);
    await client.query('COMMIT');
    assert(claimResBlocked.rows[0].result.code === 'SCHEDULE_INELIGIBLE', 'Blocked status returns SCHEDULE_INELIGIBLE');

    // 8.7 Checkpoint B: Trigger Clock Timestamp & Lock-Wait Delay Proof
    // Proves that under transaction lock wait, updated_at reflects clock_timestamp() rather than stale now()
    const storyLockDelayId = '77777777-0000-0000-0000-000000000310';
    const schedLockDelayId = '77777777-0000-0000-0000-000000000311';

    // Clear publication outbox so Section 8 tests isolated outbox transitions
    await client.query('DELETE FROM public.publication_outbox;');

    await client.query(`
      INSERT INTO public.stories (id, slug, title, status, version)
      VALUES ('${storyLockDelayId}', 'lock-delay-story', 'Lock Delay Story', 'draft', 1)
      ON CONFLICT (id) DO UPDATE SET status = 'draft', version = 1;
    `);
    await client.query(`
      INSERT INTO public.editorial_schedule (id, story_id, slot_date, slot_position, status, validated_at)
      VALUES ('${schedLockDelayId}', '${storyLockDelayId}', CURRENT_DATE, 5, 'ready', NULL)
      ON CONFLICT (id) DO UPDATE SET status = 'ready', validated_at = NULL, slot_date = CURRENT_DATE, slot_position = 5;
    `);

    // Claim the entry first via database-authoritative claim
    await client.query('BEGIN');
    await actAs(client, 'service_role', {});
    const claimResDelay = await client.query(`
      SELECT public.fn_claim_schedule_entry_fenced('${schedLockDelayId}'::UUID, '${storyLockDelayId}'::UUID) as result;
    `);
    await client.query('COMMIT');
    const delayLeaseTime = claimResDelay.rows[0].result.validated_at;

    // Client 1 locks the editorial_schedule row
    await client.query('BEGIN');
    await client.query(`SELECT id FROM public.editorial_schedule WHERE id = '${schedLockDelayId}' FOR UPDATE;`);

    // Client 2 connects as independent session
    const clientDelay2 = pg.getPgClient();
    await clientDelay2.connect();

    try {
      await clientDelay2.query('BEGIN');
      await actAs(clientDelay2, 'service_role', {});
      const txStartRes = await clientDelay2.query('SELECT now() AS tx_start;');
      const client2TxStart = new Date(txStartRes.rows[0].tx_start).getTime();

      // Client 2 launches fn_publish_story_fenced (blocks on schedule row lock)
      const client2DelayPromise = clientDelay2.query(`
        SELECT public.fn_publish_story_fenced(
          '${schedLockDelayId}'::UUID,
          '${storyLockDelayId}'::UUID,
          '${delayLeaseTime}'::TIMESTAMPTZ,
          1,
          NOW(),
          'system-scheduler'
        ) as result;
      `);

      // Sleep 150ms to create measurable divergence between transaction start now() and clock_timestamp()
      await new Promise(r => setTimeout(r, 150));

      // Client 1 releases the lock
      await client.query('COMMIT');

      const client2DelayRes = await client2DelayPromise;
      await clientDelay2.query('COMMIT');

      const resultDelay2 = client2DelayRes.rows[0].result;
      assert(resultDelay2.success === true, 'Publication succeeded after lock-wait delay');
      assert(resultDelay2.code === 'PUBLISHED', 'Result code is PUBLISHED');

      const updatedTimeMs = new Date(resultDelay2.updated_at).getTime();
      const publishedTimeMs = new Date(resultDelay2.published_at).getTime();

      assert(updatedTimeMs > client2TxStart, 'Updated_at reflects clock_timestamp() after lock delay, not stale transaction-start now()');
      assert(updatedTimeMs >= publishedTimeMs, 'Updated_at is greater than or equal to published_at');

      // Check persisted story row
      const verifyStoryDelay = await client.query(`
        SELECT status, version, updated_at, published_at FROM public.stories WHERE id = '${storyLockDelayId}';
      `);
      assert(verifyStoryDelay.rows[0].status === 'published', 'Persisted story is published');
      assert(verifyStoryDelay.rows[0].version === 2, 'Version incremented to 2 by trigger');
      assert(new Date(verifyStoryDelay.rows[0].updated_at).getTime() === updatedTimeMs, 'Persisted updated_at matches RPC returned timestamp');

      // Check audit archive trigger
      const verifyArchive = await client.query(`
        SELECT story_id, version FROM audit.story_versions WHERE story_id = '${storyLockDelayId}';
      `);
      assert(verifyArchive.rows.length === 1, 'Previous version snapshot archived by trg_stories_archive trigger');
      assert(verifyArchive.rows[0].version === 1, 'Archived version snapshot is version 1');

      // 8.8 Checkpoint C: Transactional Outbox Atomic Enqueue
      const outboxRows = await client.query(`
        SELECT id, effect_type, status, retry_count, last_error, payload
        FROM public.publication_outbox
        WHERE story_id = '${storyLockDelayId}' AND schedule_id = '${schedLockDelayId}'
        ORDER BY effect_type ASC;
      `);
      assert(outboxRows.rows.length === 2, 'Publication atomically enqueued exactly 2 outbox items');
      assert(outboxRows.rows[0].effect_type === 'cache_invalidation', 'Outbox effect 1 is cache_invalidation');
      assert(outboxRows.rows[0].status === 'pending', 'Cache invalidation outbox status is pending');
      assert(outboxRows.rows[0].payload.slug === 'lock-delay-story', 'Cache invalidation payload contains story slug');
      assert(outboxRows.rows[1].effect_type === 'event_dispatch', 'Outbox effect 2 is event_dispatch');
      assert(outboxRows.rows[1].status === 'pending', 'Event dispatch outbox status is pending');
      assert(outboxRows.rows[1].payload.version === 2, 'Event dispatch payload contains committed story version');

      // 8.9 Checkpoint C: Outbox Claiming via FOR UPDATE SKIP LOCKED
      await client.query('BEGIN');
      await actAs(client, 'service_role', {});
      const claimOutboxRes = await client.query(`
        SELECT id, effect_type, status FROM public.fn_claim_publication_outbox(10, 60);
      `);
      await client.query('COMMIT');

      const claimedIds = claimOutboxRes.rows.map(r => r.id);
      assert(claimedIds.includes(outboxRows.rows[0].id), 'Cache invalidation item claimed by worker');
      assert(claimedIds.includes(outboxRows.rows[1].id), 'Event dispatch item claimed by worker');

      // Concurrent worker sees zero rows due to FOR UPDATE SKIP LOCKED
      await clientDelay2.query('BEGIN');
      await actAs(clientDelay2, 'service_role', {});
      const claimOutboxEmpty = await clientDelay2.query(`
        SELECT id FROM public.fn_claim_publication_outbox(10, 60);
      `);
      await clientDelay2.query('COMMIT');
      assert(claimOutboxEmpty.rows.length === 0, 'Concurrent worker receives zero already-claimed items');

      // 8.10 Checkpoint C: Outbox Completion & Failure Tracking
      await client.query('BEGIN');
      await actAs(client, 'service_role', {});
      await client.query(`
        SELECT public.fn_complete_publication_outbox('${outboxRows.rows[0].id}'::UUID, 'completed');
      `);
      await client.query(`
        SELECT public.fn_complete_publication_outbox('${outboxRows.rows[1].id}'::UUID, 'failed', 'Network timeout connecting to event bus');
      `);
      await client.query('COMMIT');

      const verifyCompleted = await client.query(`
        SELECT status, processed_at FROM public.publication_outbox WHERE id = '${outboxRows.rows[0].id}';
      `);
      assert(verifyCompleted.rows[0].status === 'completed', 'Item 1 status updated to completed');
      assert(verifyCompleted.rows[0].processed_at !== null, 'Item 1 processed_at is stamped');

      const verifyFailed = await client.query(`
        SELECT status, retry_count, last_error FROM public.publication_outbox WHERE id = '${outboxRows.rows[1].id}';
      `);
      assert(verifyFailed.rows[0].status === 'failed', 'Item 2 status updated to failed');
      assert(verifyFailed.rows[0].retry_count === 1, 'Item 2 retry_count incremented to 1');
      assert(verifyFailed.rows[0].last_error === 'Network timeout connecting to event bus', 'Item 2 records safe diagnostic error');

      // 8.11 Checkpoint C: Rollback Invariant: No publication and zero outbox rows
      const storyRollbackId = '77777777-0000-0000-0000-000000000320';
      const schedRollbackId = '77777777-0000-0000-0000-000000000321';
      await client.query(`
        INSERT INTO public.stories (id, slug, title, status, version)
        VALUES ('${storyRollbackId}', 'rollback-story-p43', 'Rollback Story P43', 'draft', 1)
        ON CONFLICT (id) DO UPDATE SET status = 'draft', version = 1;
      `);
      await client.query(`
        INSERT INTO public.editorial_schedule (id, story_id, slot_date, slot_position, status, validated_at)
        VALUES ('${schedRollbackId}', '${storyRollbackId}', CURRENT_DATE, 6, 'validated', NOW())
        ON CONFLICT (id) DO UPDATE SET status = 'validated', validated_at = NOW(), slot_date = CURRENT_DATE, slot_position = 6;
      `);

      await client.query('BEGIN');
      await actAs(client, 'service_role', {});
      // Injected OCC failure: expected version 99 vs found 1
      await client.query(`
        SELECT public.fn_publish_story_fenced(
          '${schedRollbackId}'::UUID,
          '${storyRollbackId}'::UUID,
          NOW(),
          99,
          NOW(),
          'system-scheduler'
        );
      `);
      await client.query('ROLLBACK');

      const verifyZeroOutbox = await client.query(`
        SELECT COUNT(*) as count FROM public.publication_outbox WHERE story_id = '${storyRollbackId}';
      `);
      assert(Number(verifyZeroOutbox.rows[0].count) === 0, 'Zero outbox rows exist after transaction rollback');

      // 8.12 Privilege Hardening: Security definer RPCs restricted to service_role
      const unauthRoles: ('anon' | 'authenticated')[] = ['anon', 'authenticated'];
      for (const role of unauthRoles) {
        await client.query('BEGIN');
        await actAs(client, role, {});
        let claimBlocked = false;
        try {
          await client.query(`SELECT public.fn_claim_schedule_entry_fenced('${schedClaim1Id}'::UUID, '${storyClaim1Id}'::UUID);`);
        } catch (err: any) {
          if (err.code === '42501') claimBlocked = true;
        }
        assert(claimBlocked, `${role} cannot execute public.fn_claim_schedule_entry_fenced (fails closed with 42501)`);
        await client.query('ROLLBACK');

        await client.query('BEGIN');
        await actAs(client, role, {});
        let outboxClaimBlocked = false;
        try {
          await client.query(`SELECT * FROM public.fn_claim_publication_outbox(10, 60);`);
        } catch (err: any) {
          if (err.code === '42501') outboxClaimBlocked = true;
        }
        assert(outboxClaimBlocked, `${role} cannot execute public.fn_claim_publication_outbox (fails closed with 42501)`);
        await client.query('ROLLBACK');

        await client.query('BEGIN');
        await actAs(client, role, {});
        let outboxTableBlocked = false;
        try {
          await client.query(`SELECT * FROM public.publication_outbox;`);
        } catch (err: any) {
          if (err.code === '42501') outboxTableBlocked = true;
        }
        assert(outboxTableBlocked, `${role} cannot select from public.publication_outbox directly`);
        await client.query('ROLLBACK');

        await client.query('BEGIN');
        await actAs(client, role, {});
        let outboxCompleteBlocked = false;
        try {
          await client.query(`SELECT public.fn_complete_publication_outbox(gen_random_uuid(), 'completed');`);
        } catch (err: any) {
          if (err.code === '42501') outboxCompleteBlocked = true;
        }
        assert(outboxCompleteBlocked, `${role} cannot execute public.fn_complete_publication_outbox (fails closed with 42501)`);
        await client.query('ROLLBACK');
      }
    } finally {
      await clientDelay2.end().catch(() => {});
    }

    // ─────────────────────────────────────────────────────────────────
    // Summary
    // ─────────────────────────────────────────────────────────────────
    console.log('\n───────────────────────────────────────────────────────');
    console.log(`Direct Database Tests Completed: ${passed} passed, ${failed} failed`);
    console.log('───────────────────────────────────────────────────────');

    if (failed > 0) {
      process.exit(1);
    }
  } finally {
    if (client) {
      await client.end().catch(() => {});
    }
    await pg.stop().catch(() => {});
    console.log('Cleaned up isolated PostgreSQL cluster.\n');
  }
}

runDirectDatabaseTests().catch((err) => {
  console.error('Fatal error during database tests:', err);
  process.exit(1);
});
