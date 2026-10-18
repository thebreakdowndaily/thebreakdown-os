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

    // 6.5 Direct execution rejection: publisher_worker cannot call fn_publish_story_fenced
    const pubWorkerPrivRes = await client.query(`
      SELECT has_function_privilege('publisher_worker', 'public.fn_publish_story_fenced(uuid,uuid,timestamptz,integer,timestamptz,text)', 'execute') as priv;
    `);
    assert(pubWorkerPrivRes.rows[0].priv === false, 'publisher_worker has NO execute privilege on fn_publish_story_fenced');

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

    // 6.6 Legacy RPC closure: fn_publish_story_with_audit cannot be called by untrusted roles
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

    // 6.7 Legacy claiming RPC closure: fn_claim_due_schedule_entry cannot be called by publisher_worker
    const claimWorkerPriv = await client.query(`
      SELECT has_function_privilege('publisher_worker', 'public.fn_claim_due_schedule_entry()', 'execute') as priv;
    `);
    assert(claimWorkerPriv.rows[0].priv === false, 'publisher_worker has NO execute privilege on legacy fn_claim_due_schedule_entry');

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

    // 7.8 Lock Wait Crosses Expiry (Real independent PostgreSQL session)
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

    await client.query('BEGIN');
    await client.query(`SELECT id FROM public.editorial_schedule WHERE id = '${schedLockWaitId}' FOR UPDATE;`);

    const client2 = pg.getPgClient();
    await client2.connect();
    await actAs(client2, 'service_role', {});

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

    // Wait 3 seconds so clock_timestamp() advances past the 5-minute threshold
    await new Promise((resolve) => setTimeout(resolve, 3000));

    // Client 1 releases the lock
    await client.query('ROLLBACK');

    const client2Res = await client2Promise;
    await client2.end();

    const resultLockWait = client2Res.rows[0].result;
    assert(resultLockWait.success === false, 'Transaction blocked on row lock evaluates expiry after acquiring lock');
    assert(resultLockWait.code === 'SCHEDULE_LEASE_EXPIRED', 'Lock contention crossing 5m returns SCHEDULE_LEASE_EXPIRED');

    const verifyStoryLock = await client.query(`SELECT status, version FROM public.stories WHERE id = '${storyLockWaitId}'`);
    assert(verifyStoryLock.rows[0].status === 'draft', 'Story remains draft after lock contention expiry');
    assert(verifyStoryLock.rows[0].version === 1, 'Story version remains unchanged');

    const verifySchedLock = await client.query(`SELECT status FROM public.editorial_schedule WHERE id = '${schedLockWaitId}'`);
    assert(verifySchedLock.rows[0].status === 'validated', 'Editorial schedule remains validated');

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
