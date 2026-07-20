const {Client} = require('pg');
const DB_URL = 'postgresql://postgres:Ntn%40supabase403@db.swektehukscmsgxdzymw.supabase.co:5432/postgres';

async function main() {
  const pg = new Client({ connectionString: DB_URL });
  await pg.connect();

  // Test 1: DRAFT insert via direct SQL (researcher role)
  console.log('=== Test 1: DRAFT insert (researcher, defaults) ===');
  try {
    await pg.query('BEGIN');
    await pg.query("SET LOCAL role = 'authenticated'");
    await pg.query(`SET LOCAL request.jwt.claims = '{"app_metadata":{"research_role":"researcher"}}'`);
    const result = await pg.query(
      `INSERT INTO research_claims (canonical_id, confidence, statement, ingestion_method) 
       VALUES ('DIA6-DRAFT-001', 'C1', 'Draft test', 'TEST') RETURNING id, publication_status`
    );
    console.log('  SUCCEEDED:', result.rows[0]);
  } catch (e) {
    console.log('  FAILED:', e.code, e.message);
  }
  await pg.query('ROLLBACK');

  // Test 2: PUBLISHED insert via direct SQL (researcher role)
  console.log('\n=== Test 2: PUBLISHED insert (researcher, explicit) ===');
  try {
    await pg.query('BEGIN');
    await pg.query("SET LOCAL role = 'authenticated'");
    await pg.query(`SET LOCAL request.jwt.claims = '{"app_metadata":{"research_role":"researcher"}}'`);
    const result = await pg.query(
      `INSERT INTO research_claims (canonical_id, confidence, statement, publication_status, human_review_status, published_at, ingestion_method) 
       VALUES ('DIA6-PUB-001', 'C1', 'Pub test', 'PUBLISHED', 'APPROVED', NOW(), 'TEST') RETURNING id, publication_status`
    );
    console.log('  SUCCEEDED:', result.rows[0]);
  } catch (e) {
    console.log('  FAILED:', e.code, e.message);
  }
  await pg.query('ROLLBACK');

  // Test 3: DRAFT insert via direct SQL with FULL JWT (mimicking PostgREST)
  console.log('\n=== Test 3: DRAFT insert (researcher, full JWT payload) ===');
  try {
    await pg.query('BEGIN');
    await pg.query("SET LOCAL role = 'authenticated'");
    const fullJwt = JSON.stringify({
      aal: 'aal1', amr: [{ method: 'password', timestamp: Date.now() }],
      aud: 'authenticated', exp: 2100050784, iat: 1784474784,
      sub: 'test-sub', role: 'authenticated', email: 'researcher@example.com',
      app_metadata: { provider: 'email', providers: ['email'], research_role: 'researcher' },
      user_metadata: { email_verified: true }
    });
    await pg.query(`SET LOCAL request.jwt.claims = '${fullJwt}'`);
    const result = await pg.query(
      `INSERT INTO research_claims (canonical_id, confidence, statement, ingestion_method) 
       VALUES ('DIA6-DRAFT-002', 'C1', 'Draft test full JWT', 'TEST') RETURNING id, publication_status`
    );
    console.log('  SUCCEEDED:', result.rows[0]);
  } catch (e) {
    console.log('  FAILED:', e.code, e.message);
  }
  await pg.query('ROLLBACK');

  // Test 4: Test if postgres superuser role matters
  console.log('\n=== Test 4: Check current_user before and after SET ROLE ===');
  try {
    await pg.query('BEGIN');
    const before = await pg.query('SELECT current_user, session_user');
    console.log('  Before SET ROLE:', before.rows[0]);
    await pg.query("SET LOCAL role = 'authenticated'");
    const after = await pg.query('SELECT current_user, session_user');
    console.log('  After SET ROLE:', after.rows[0]);
    await pg.query('ROLLBACK');
  } catch (e) {
    console.log('  FAILED:', e.message);
    await pg.query('ROLLBACK');
  }

  // Test 5: DRAFT insert with no SET ROLE (just JWT claims as postgres)
  console.log('\n=== Test 5: DRAFT insert as postgres superuser with JWT claims ===');
  try {
    await pg.query('BEGIN');
    await pg.query(`SET LOCAL request.jwt.claims = '{"app_metadata":{"research_role":"researcher"}}'`);
    const result = await pg.query(
      `INSERT INTO research_claims (canonical_id, confidence, statement, ingestion_method) 
       VALUES ('DIA6-SUPER-001', 'C1', 'Super draft test', 'TEST') RETURNING id, publication_status`
    );
    console.log('  SUCCEEDED:', result.rows[0]);
  } catch (e) {
    console.log('  FAILED:', e.code, e.message);
  }
  await pg.query('ROLLBACK');

  // Test 6: DRAFT insert with no SET ROLE and no JWT claims (pure superuser)
  console.log('\n=== Test 6: DRAFT insert as postgres superuser, no JWT claims ===');
  try {
    await pg.query('BEGIN');
    const result = await pg.query(
      `INSERT INTO research_claims (canonical_id, confidence, statement, ingestion_method) 
       VALUES ('DIA6-PURE-001', 'C1', 'Pure superuser test', 'TEST') RETURNING id, publication_status`
    );
    console.log('  SUCCEEDED:', result.rows[0]);
  } catch (e) {
    console.log('  FAILED:', e.code, e.message);
  }
  await pg.query('ROLLBACK');

  // Test 7: Check auth.uid() and auth.role() functions
  console.log('\n=== Test 7: Check auth helper functions ===');
  try {
    await pg.query('BEGIN');
    await pg.query("SET LOCAL role = 'authenticated'");
    await pg.query(`SET LOCAL request.jwt.claims = '{"app_metadata":{"research_role":"researcher"}}'`);
    const authUid = await pg.query('SELECT auth.uid()').catch(e => ({ error: e.message }));
    const authRole = await pg.query('SELECT auth.role()').catch(e => ({ error: e.message }));
    console.log('  auth.uid():', authUid.error || authUid.rows[0]?.auth_uid);
    console.log('  auth.role():', authRole.error || authRole.rows[0]?.auth_role);
    await pg.query('ROLLBACK');
  } catch (e) {
    console.log('  FAILED:', e.message);
    await pg.query('ROLLBACK');
  }

  // Test 8: Check if the role has INSERT grant
  console.log('\n=== Test 8: Check INSERT grants on research_claims ===');
  const grants = await pg.query(
    `SELECT grantee, privilege_type FROM information_schema.role_table_grants 
     WHERE table_name = 'research_claims' AND privilege_type = 'INSERT'`
  );
  for (const g of grants.rows) {
    console.log(`  ${g.grantee}: ${g.privilege_type}`);
  }

  await pg.end();
}
main().catch(e => { console.error(e); process.exit(1); });
