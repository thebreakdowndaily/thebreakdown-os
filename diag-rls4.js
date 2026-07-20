const {Client} = require('pg');
const {createClient} = require('@supabase/supabase-js');
const DB_URL = 'postgresql://postgres:Ntn%40supabase403@db.swektehukscmsgxdzymw.supabase.co:5432/postgres';
const SUPABASE_URL = 'https://swektehukscmsgxdzymw.supabase.co';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN3ZWt0ZWh1a3NjbXNneGR6eW13Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ0NzQ3ODQsImV4cCI6MjEwMDA1MDc4NH0.nUuW161KEAIGG98sjbhpvX3J-P-fZxVCVJaMBpQQXNo';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN3ZWt0ZWh1a3NjbXNneGR6eW13Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NDQ3NDc4NCwiZXhwIjoyMTAwMDUwNzg0fQ.2Yf2PnE8wIh4ynTWAq8jp0hUo3jpgqdnBMv3MDwC6K4';

async function main() {
  const pg = new Client({ connectionString: DB_URL });
  await pg.connect();

  // Create test table with simple RLS
  await pg.query(`DROP TABLE IF EXISTS rls_diag_test`);
  await pg.query(`
    CREATE TABLE rls_diag_test (
      id SERIAL PRIMARY KEY,
      data TEXT NOT NULL
    )
  `);
  await pg.query(`ALTER TABLE rls_diag_test ENABLE ROW LEVEL SECURITY`);
  await pg.query(`
    CREATE POLICY test_insert_policy ON rls_diag_test
    FOR INSERT WITH CHECK (data != 'blocked')
  `);

  // Create Supabase test user
  const adminClient = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { autoRefreshToken: false, persistSession: false } });
  const { data: listUsers } = await adminClient.auth.admin.listUsers({ perPage: 200 });
  for (const u of listUsers?.users || []) {
    if (u.email === 'rlsdiag@example.com') await adminClient.auth.admin.deleteUser(u.id).catch(() => {});
  }
  const { data: user } = await adminClient.auth.admin.createUser({
    email: 'rlsdiag@example.com', password: 'password123', email_confirm: true,
    app_metadata: { research_role: 'researcher' },
  });

  const client = createClient(SUPABASE_URL, ANON_KEY, { auth: { persistSession: false } });
  await client.auth.signInWithPassword({ email: 'rlsdiag@example.com', password: 'password123' });

  // Test 1: Simple INSERT via Supabase (should succeed, data != 'blocked')
  const r1 = await client.from('rls_diag_test').insert({ data: 'hello' }).select();
  console.log('Test 1 (simple RLS INSERT via Supabase):', r1.error ? 'FAILED: ' + r1.error.message : 'OK');

  // Test 2: Simple INSERT via direct SQL with SET ROLE
  await pg.query('BEGIN');
  await pg.query("SET LOCAL role = 'authenticated'");
  try {
    await pg.query(`INSERT INTO rls_diag_test (data) VALUES ('direct test')`);
    console.log('Test 2 (simple RLS INSERT via direct SQL): OK');
  } catch (e) {
    console.log('Test 2 (simple RLS INSERT via direct SQL): FAILED:', e.message);
  }
  await pg.query('ROLLBACK');

  // Cleanup test table
  await pg.query(`DROP TABLE rls_diag_test`);

  // Now test: does the research_claims INSERT fail even with direct SQL?
  // The issue might be that postgres (superuser) SET LOCAL role doesn't properly simulate
  // PostgREST behavior. Let me check what role PostgREST actually uses.

  // Test 3: Check who PostgREST connects as
  console.log('\n=== Check PostgREST connection info ===');
  const connInfo = await pg.query(`SELECT current_user, session_user`);
  console.log('  current_user:', connInfo.rows[0].current_user, 'session_user:', connInfo.rows[0].session_user);

  // Test 4: Check if postgres bypasses RLS even with SET role
  await pg.query('BEGIN');
  await pg.query("SET LOCAL role = 'authenticated'");
  await pg.query(`SET LOCAL request.jwt.claims = '{"app_metadata":{"research_role":"researcher"}}'`);
  
  // Check the effective user for RLS
  const roleInfo = await pg.query(`SELECT current_user, session_user`);
  console.log('\n  After SET LOCAL role=authenticated:');
  console.log('  current_user:', roleInfo.rows[0].current_user, 'session_user:', roleInfo.rows[0].session_user);
  
  // Try the EXACT same insert that PASSES via PostgREST but FAILS via direct SQL
  const insResult = await pg.query(
    `INSERT INTO research_claims (canonical_id, confidence, statement, publication_status, human_review_status, published_at, ingestion_method) 
     VALUES ('DIRECT-TEST', 'C1', 'Direct test', 'PUBLISHED', 'APPROVED', NOW(), 'TEST') 
     RETURNING id, publication_status`
  ).catch(e => ({ error: e.message }));
  console.log('  PUBLISHED insert via direct SQL:', insResult.error || 'OK: ' + insResult.rows?.[0]?.id);
  await pg.query('ROLLBACK');

  // Test 5: DRAFT insert via direct SQL
  await pg.query('BEGIN');
  await pg.query("SET LOCAL role = 'authenticated'");
  await pg.query(`SET LOCAL request.jwt.claims = '{"app_metadata":{"research_role":"researcher"}}'`);
  const draftResult = await pg.query(
    `INSERT INTO research_claims (canonical_id, confidence, statement, ingestion_method) 
     VALUES ('DIRECT-DRAFT', 'C1', 'Direct draft test', 'TEST') 
     RETURNING id`
  ).catch(e => ({ error: e.message }));
  console.log('  DRAFT insert via direct SQL:', draftResult.error || 'OK: ' + draftResult.rows?.[0]?.id);
  await pg.query('ROLLBACK');

  // Cleanup
  if (user?.user?.id) await adminClient.auth.admin.deleteUser(user.user.id);
  await pg.end();
}
main().catch(e => { console.error(e); process.exit(1); });
