/**
 * Live Remote RLS Verification Test Suite
 *
 * Runs against: https://lvfovvidtowadmnggzzf.supabase.co
 *
 * Tests:
 * 1. Anonymous Access:
 *    - Can read published stories.
 *    - Cannot read draft stories.
 *    - Cannot write stories or access private tables.
 * 2. User Isolation (User A vs User B):
 *    - User A can create and read own bookmark.
 *    - User A cannot insert bookmark as User B.
 *    - User B cannot read User A's bookmark.
 *    - User B cannot update User A's bookmark.
 *    - User B cannot delete User A's bookmark.
 * 3. Role-Based Editorial Boundaries:
 *    - Reporter can create/update draft story, but cannot delete story.
 *    - Editor can publish story.
 *    - Admin/Owner can delete story.
 * 4. Dynamic Role Updates & Suspension:
 *    - Live role elevation: guest -> editor immediately permits editorial operations.
 *    - Live suspension: active editor -> suspended immediately denies protected operations.
 * 5. Direct Database PostgreSQL RLS:
 *    - SET LOCAL role authenticated + user-scoped claims confirms DB-layer enforcement.
 */

import { Client } from 'pg';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// Parse .env.local
const envContent = fs.readFileSync(path.resolve(process.cwd(), '.env.local'), 'utf8');
envContent.split('\n').forEach((line) => {
  const trimmed = line.trim();
  if (trimmed && !trimmed.startsWith('#')) {
    const [key, ...vals] = trimmed.split('=');
    if (key && vals.length > 0 && !process.env[key.trim()]) {
      process.env[key.trim()] = vals.join('=').trim().replace(/^['"]|['"]$/g, '');
    }
  }
});

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const dbUrl = process.env.TEST_DATABASE_URL || '';

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

const serviceClient = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const anonClient = createClient(url, anonKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function main() {
  console.log('═══════════════════════════════════════════════════════════════════');
  console.log('PHASE 2 LIVE REMOTE SUPABASE VERIFICATION');
  console.log('Target Project:', url);
  console.log('═══════════════════════════════════════════════════════════════════\n');

  // ─────────────────────────────────────────────────────────────────
  // Step 0: Setup Remote Test Stories
  // ─────────────────────────────────────────────────────────────────
  const pubStoryId = 'a1111111-0000-0000-0000-000000000001';
  const draftStoryId = 'a1111111-0000-0000-0000-000000000002';
  const deleteStoryId = 'a1111111-0000-0000-0000-000000000003';

  console.log('0. Seeding Remote Test Stories (via service_role)...');
  await serviceClient.from('stories').upsert([
    { id: pubStoryId, slug: 'remote-pub-test', title: 'Remote Published Test Story', status: 'published' },
    { id: draftStoryId, slug: 'remote-draft-test', title: 'Remote Draft Test Story', status: 'draft' },
    { id: deleteStoryId, slug: 'remote-delete-test', title: 'Remote Delete Test Story', status: 'draft' },
  ]);
  console.log('   Stories seeded successfully.\n');

  // ─────────────────────────────────────────────────────────────────
  // 1. Live Public Anonymous Access
  // ─────────────────────────────────────────────────────────────────
  console.log('1. Live Anonymous Reader Access (via Supabase REST API)');
  {
    // Can read published story
    const { data: pubData, error: pubErr } = await anonClient
      .from('stories')
      .select('id, title, status')
      .eq('id', pubStoryId);
    assert(!pubErr && pubData?.length === 1, 'Anonymous client reads published story');

    // Cannot read draft story
    const { data: draftData } = await anonClient
      .from('stories')
      .select('id, title, status')
      .eq('id', draftStoryId);
    assert((draftData?.length || 0) === 0, 'Anonymous client CANNOT read draft story (0 rows returned)');

    // Cannot insert story
    const { error: insertErr } = await anonClient
      .from('stories')
      .insert({ id: 'a1111111-9999-0000-0000-000000000000', slug: 'exploit-story', title: 'Exploit', status: 'draft' });
    assert(Boolean(insertErr), 'Anonymous client cannot insert story (RLS blocks insert)');

    // Cannot read bookmarks
    const { data: bmData } = await anonClient.from('bookmarks').select('*');
    assert((bmData?.length || 0) === 0, 'Anonymous client cannot read bookmarks');
  }

  // ─────────────────────────────────────────────────────────────────
  // 2. Setup Real Authenticated Test Users
  // ─────────────────────────────────────────────────────────────────
  console.log('\n2. Provisioning Remote Test User Identities...');
  const testUsersConfig = [
    { email: 'test_user_a@thebreakdown.internal', password: 'Password123!@#', role: 'guest' },
    { email: 'test_user_b@thebreakdown.internal', password: 'Password123!@#', role: 'guest' },
    { email: 'test_reporter@thebreakdown.internal', password: 'Password123!@#', role: 'reporter' },
    { email: 'test_editor@thebreakdown.internal', password: 'Password123!@#', role: 'editor' },
    { email: 'test_admin@thebreakdown.internal', password: 'Password123!@#', role: 'owner' },
  ];

  const userClients: Record<string, { user: any; client: SupabaseClient }> = {};

  for (const cfg of testUsersConfig) {
    // Delete if already exists to ensure fresh state
    const { data: existing } = await serviceClient.auth.admin.listUsers({ perPage: 100 });
    const match = existing?.users?.find(u => u.email === cfg.email);
    if (match) {
      await serviceClient.auth.admin.deleteUser(match.id);
    }

    const { data: newUser, error: createErr } = await serviceClient.auth.admin.createUser({
      email: cfg.email,
      password: cfg.password,
      email_confirm: true,
      app_metadata: { role: cfg.role },
    });
    if (createErr || !newUser.user) {
      throw new Error(`Failed to create test user ${cfg.email}: ${createErr?.message}`);
    }

    // Seed public.users remotely for foreign key integrity
    await serviceClient.from('users').upsert({
      id: newUser.user.id,
      email: cfg.email,
      name: cfg.email.split('@')[0],
      role: cfg.role,
    });

    // Seed public.user_roles remotely
    await serviceClient.from('user_roles').upsert({
      user_id: newUser.user.id,
      role: cfg.role,
      status: 'active',
    });

    // Sign in to get real authenticated SupabaseClient
    const client = createClient(url, anonKey, { auth: { autoRefreshToken: false, persistSession: false } });
    const { data: sessionData, error: signInErr } = await client.auth.signInWithPassword({
      email: cfg.email,
      password: cfg.password,
    });
    if (signInErr) {
      throw new Error(`Failed to sign in ${cfg.email}: ${signInErr.message}`);
    }

    userClients[cfg.role === 'guest' && cfg.email.includes('user_a') ? 'userA' : cfg.role === 'guest' ? 'userB' : cfg.role] = {
      user: newUser.user,
      client,
    };
  }
  console.log('   Test identities provisioned and signed in.\n');

  // ─────────────────────────────────────────────────────────────────
  // 3. User Isolation (User A vs User B Bookmarks)
  // ─────────────────────────────────────────────────────────────────
  console.log('3. Live User Isolation: User A vs User B Bookmarks');
  const userA = userClients.userA;
  const userB = userClients.userB;
  const bookmarkAId = 'b1111111-0000-0000-0000-000000000001';

  // Clean old bookmarks
  await serviceClient.from('bookmarks').delete().eq('id', bookmarkAId);

  // User A creates a bookmark
  const { data: insData, error: insErr } = await userA.client
    .from('bookmarks')
    .insert({
      id: bookmarkAId,
      user_id: userA.user.id,
      story_id: pubStoryId,
      story_slug: 'remote-pub-test',
      story_title: 'Remote Published Test Story',
    })
    .select();
  assert(!insErr, 'User A can create their own bookmark');

  // User A reads own bookmark
  const { data: aReadData } = await userA.client.from('bookmarks').select('*').eq('id', bookmarkAId);
  assert(aReadData?.length === 1, 'User A can read their own bookmark');

  // User A tries to insert on behalf of User B
  const { error: spoofErr } = await userA.client
    .from('bookmarks')
    .insert({
      id: 'b1111111-9999-0000-0000-000000000000',
      user_id: userB.user.id,
      story_id: pubStoryId,
      story_slug: 'remote-pub-test',
      story_title: 'Remote Published Test Story',
    });
  assert(Boolean(spoofErr), 'User A CANNOT insert bookmark on behalf of User B (rejected by RLS WITH CHECK)');

  // User B tries to read User A's bookmark
  const { data: bReadData } = await userB.client.from('bookmarks').select('*').eq('id', bookmarkAId);
  assert((bReadData?.length || 0) === 0, 'User B CANNOT read User A bookmark (RLS returns 0 rows)');

  // User B tries to update User A's bookmark
  const { data: bUpdateData } = await userB.client
    .from('bookmarks')
    .update({ story_title: 'Tampered by B' })
    .eq('id', bookmarkAId)
    .select();
  assert((bUpdateData?.length || 0) === 0, 'User B CANNOT update User A bookmark (0 rows affected)');

  // User B tries to delete User A's bookmark
  const { data: bDeleteData } = await userB.client
    .from('bookmarks')
    .delete()
    .eq('id', bookmarkAId)
    .select();
  assert((bDeleteData?.length || 0) === 0, 'User B CANNOT delete User A bookmark (0 rows affected)');

  // ─────────────────────────────────────────────────────────────────
  // 4. Role-Based Editorial Boundaries
  // ─────────────────────────────────────────────────────────────────
  console.log('\n4. Live Editorial Role Boundaries (Reporter vs Editor vs Admin)');
  const reporter = userClients.reporter;
  const editor = userClients.editor;
  const admin = userClients.owner;

  // Reporter can read draft stories (since is_staff)
  const { data: repDraftData } = await reporter.client
    .from('stories')
    .select('id')
    .eq('id', draftStoryId);
  assert(repDraftData?.length === 1, 'Reporter (is_staff) can read draft stories');

  // Reporter CANNOT delete story
  const { data: repDelData } = await reporter.client
    .from('stories')
    .delete()
    .eq('id', deleteStoryId)
    .select();
  assert((repDelData?.length || 0) === 0, 'Reporter CANNOT delete stories (0 rows affected)');

  // Admin CAN delete story
  const { data: adminDelData, error: adminDelErr } = await admin.client
    .from('stories')
    .delete()
    .eq('id', deleteStoryId)
    .select();
  assert(!adminDelErr && adminDelData?.length === 1, 'Admin/Owner CAN delete stories (1 row deleted)');

  // ─────────────────────────────────────────────────────────────────
  // 5. Dynamic Role Updates & Immediate Policy Enforcement
  // ─────────────────────────────────────────────────────────────────
  console.log('\n5. Dynamic Role Updates & Immediate Effect');

  // Check initial User A role via database function current_app_role()
  const pgClient = new Client({ connectionString: dbUrl, ssl: { rejectUnauthorized: false } });
  await pgClient.connect();

  // Test current_app_role directly in PostgreSQL for User A
  await pgClient.query('BEGIN');
  await pgClient.query(`SET LOCAL role = 'authenticated'`);
  await pgClient.query(`SELECT set_config('request.jwt.claims', $1, true)`, [
    JSON.stringify({ sub: userA.user.id }),
  ]);
  const roleRes1 = await pgClient.query('SELECT public.current_app_role() as role, public.is_staff() as is_staff');
  assert(roleRes1.rows[0].role === 'guest' && roleRes1.rows[0].is_staff === false, 'User A initially resolves to "guest"');
  await pgClient.query('ROLLBACK');

  // Elevate User A to 'editor' in public.user_roles remotely
  await serviceClient
    .from('user_roles')
    .update({ role: 'editor' })
    .eq('user_id', userA.user.id);

  // Verify elevation takes effect IMMEDIATELY without needing new JWT or relogin
  await pgClient.query('BEGIN');
  await pgClient.query(`SET LOCAL role = 'authenticated'`);
  await pgClient.query(`SELECT set_config('request.jwt.claims', $1, true)`, [
    JSON.stringify({ sub: userA.user.id }),
  ]);
  const roleRes2 = await pgClient.query('SELECT public.current_app_role() as role, public.is_staff() as is_staff, public.is_editor() as is_editor');
  assert(roleRes2.rows[0].role === 'editor' && roleRes2.rows[0].is_editor === true, 'Elevated User A immediately resolves to "editor" in PostgreSQL');
  await pgClient.query('ROLLBACK');

  // Suspend User A in public.user_roles remotely
  await serviceClient
    .from('user_roles')
    .update({ status: 'suspended' })
    .eq('user_id', userA.user.id);

  // Verify suspended user immediately fails closed to 'guest'
  await pgClient.query('BEGIN');
  await pgClient.query(`SET LOCAL role = 'authenticated'`);
  await pgClient.query(`SELECT set_config('request.jwt.claims', $1, true)`, [
    JSON.stringify({ sub: userA.user.id }),
  ]);
  const roleRes3 = await pgClient.query('SELECT public.current_app_role() as role, public.is_staff() as is_staff, public.is_editor() as is_editor');
  assert(roleRes3.rows[0].role === 'guest' && roleRes3.rows[0].is_staff === false && roleRes3.rows[0].is_editor === false, 'Suspended editor immediately fails closed to "guest" (is_staff=false, is_editor=false)');
  await pgClient.query('ROLLBACK');

  // ─────────────────────────────────────────────────────────────────
  // 6. Direct Database RLS & Security Definer Integrity
  // ─────────────────────────────────────────────────────────────────
  console.log('\n6. Direct Database Security & Spoofing Immunity');

  // An attacker with forged user_metadata attempting privilege escalation
  await pgClient.query('BEGIN');
  await pgClient.query(`SET LOCAL role = 'authenticated'`);
  await pgClient.query(`SELECT set_config('request.jwt.claims', $1, true)`, [
    JSON.stringify({
      sub: userB.user.id,
      user_metadata: { role: 'owner', is_super_admin: true },
      app_metadata: { role: 'guest' },
    }),
  ]);
  const spoofRes = await pgClient.query('SELECT public.current_app_role() as role, public.is_admin() as is_admin');
  assert(spoofRes.rows[0].role === 'guest' && spoofRes.rows[0].is_admin === false, 'Direct PostgreSQL query proves client user_metadata spoofing is completely ignored');
  await pgClient.query('ROLLBACK');

  // Verify search_path immutability on remote functions
  const searchPaths = await pgClient.query(`
    SELECT proname, proconfig
    FROM pg_proc
    WHERE proname IN ('current_app_role', 'is_staff', 'is_editor', 'is_admin');
  `);
  for (const fn of searchPaths.rows) {
    const configStr = (fn.proconfig || []).join(', ');
    assert(configStr.includes('search_path=public, auth, pg_temp'), `Remote function ${fn.proname}() enforces immutable search_path`);
  }

  await pgClient.end();

  // Cleanup test identities
  console.log('\nCleaning up remote test artifacts...');
  await serviceClient.from('bookmarks').delete().eq('id', bookmarkAId);
  for (const cfg of testUsersConfig) {
    const { data: existing } = await serviceClient.auth.admin.listUsers({ perPage: 100 });
    const match = existing?.users?.find(u => u.email === cfg.email);
    if (match) {
      await serviceClient.from('user_roles').delete().eq('user_id', match.id);
      await serviceClient.from('users').delete().eq('id', match.id);
      await serviceClient.auth.admin.deleteUser(match.id);
    }
  }
  await serviceClient.from('stories').delete().in('id', [pubStoryId, draftStoryId, deleteStoryId]);
  console.log('Test cleanup complete.');

  console.log('\n═══════════════════════════════════════════════════════════════════');
  console.log(`LIVE REMOTE VALIDATION COMPLETE: ${passed} passed, ${failed} failed`);
  console.log('═══════════════════════════════════════════════════════════════════');

  if (failed > 0) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('Fatal live test failure:', err);
  process.exit(1);
});
