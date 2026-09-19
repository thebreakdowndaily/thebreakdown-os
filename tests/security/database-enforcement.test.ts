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
      INSERT INTO public.stories (id, slug, title, status)
      VALUES 
        ('${publishedStoryId}', 'published-test-story', 'Published Story', 'published'),
        ('${draftStoryId}', 'draft-test-story', 'Draft Story', 'draft')
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
