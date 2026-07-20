const {Client} = require('pg');
const DB_URL = 'postgresql://postgres:Ntn%40supabase403@db.swektehukscmsgxdzymw.supabase.co:5432/postgres';

async function main() {
  const pg = new Client({ connectionString: DB_URL });
  await pg.connect();

  // Key question: WHY does DRAFT fail but PUBLISHED succeeds?
  // The only INSERT policy is researcher_insert_claims which only checks JWT role.
  // Let's test systematically.

  // Test 1: Disable RLS temporarily - does DRAFT insert succeed?
  console.log('=== Test 1: DRAFT insert with RLS disabled ===');
  try {
    await pg.query('BEGIN');
    await pg.query("SET LOCAL role = 'authenticated'");
    await pg.query(`SET LOCAL request.jwt.claims = '{"app_metadata":{"research_role":"researcher"}}'`);
    await pg.query("SET LOCAL row_security = off");
    await pg.query(
      `INSERT INTO research_claims (canonical_id, confidence, statement, ingestion_method) 
       VALUES ('RLS-OFF-001', 'C1', 'RLS off test', 'TEST') RETURNING id`
    );
    console.log('  SUCCEEDED');
  } catch (e) {
    console.log('  FAILED:', e.code, e.message);
  }
  await pg.query('ROLLBACK');

  // Test 2: Does the issue reproduce with a brand new connection?
  console.log('\n=== Test 2: Fresh connection DRAFT insert ===');
  const pg2 = new Client({ connectionString: DB_URL });
  await pg2.connect();
  try {
    await pg2.query('BEGIN');
    await pg2.query("SET LOCAL role = 'authenticated'");
    await pg2.query(`SET LOCAL request.jwt.claims = '{"app_metadata":{"research_role":"researcher"}}'`);
    const result = await pg2.query(
      `INSERT INTO research_claims (canonical_id, confidence, statement, ingestion_method) 
       VALUES ('FRESH-CONN-001', 'C1', 'Fresh conn test', 'TEST') RETURNING id, publication_status, human_review_status`
    );
    console.log('  SUCCEEDED:', result.rows[0]);
  } catch (e) {
    console.log('  FAILED:', e.code, e.message);
  }
  await pg2.query('ROLLBACK');
  await pg2.end();

  // Test 3: What if we set ALL columns explicitly?
  console.log('\n=== Test 3: ALL columns explicit, DRAFT ===');
  try {
    await pg.query('BEGIN');
    await pg.query("SET LOCAL role = 'authenticated'");
    await pg.query(`SET LOCAL request.jwt.claims = '{"app_metadata":{"research_role":"researcher"}}'`);
    await pg.query(
      `INSERT INTO research_claims (canonical_id, confidence, statement, human_review_status, publication_status, ingestion_method) 
       VALUES ('ALL-EXPL-001', 'C1', 'All explicit DRAFT', 'UNREVIEWED', 'DRAFT', 'TEST') RETURNING id, publication_status, human_review_status`
    );
    console.log('  SUCCEEDED');
  } catch (e) {
    console.log('  FAILED:', e.code, e.message);
  }
  await pg.query('ROLLBACK');

  // Test 4: What if the issue is the authenticator->authenticated path? Test as anon.
  console.log('\n=== Test 4: DRAFT insert as anon (should fail - no INSERT policy for anon)');
  try {
    await pg.query('BEGIN');
    await pg.query("SET LOCAL role = 'anon'");
    await pg.query(
      `INSERT INTO research_claims (canonical_id, confidence, statement, ingestion_method) 
       VALUES ('ANON-001', 'C1', 'Anon test', 'TEST') RETURNING id`
    );
    console.log('  SUCCEEDED (unexpected!)');
  } catch (e) {
    console.log('  FAILED:', e.code, '(expected - no INSERT policy for anon)');
  }
  await pg.query('ROLLBACK');

  // Test 5: Does the WITH CHECK expression actually work? Test with agent role
  console.log('\n=== Test 5: DRAFT insert as automated_ingestion_agent ===');
  try {
    await pg.query('BEGIN');
    await pg.query("SET LOCAL role = 'authenticated'");
    await pg.query(`SET LOCAL request.jwt.claims = '{"app_metadata":{"research_role":"automated_ingestion_agent"}}'`);
    await pg.query(
      `INSERT INTO research_claims (canonical_id, confidence, statement, publication_status, human_review_status, ingestion_method) 
       VALUES ('AGENT-001', 'C1', 'Agent test', 'DRAFT', 'UNREVIEWED', 'TEST') RETURNING id`
    );
    console.log('  SUCCEEDED');
  } catch (e) {
    console.log('  FAILED:', e.code, e.message);
  }
  await pg.query('ROLLBACK');

  // Test 6: Agent trying PUBLISHED (should fail - WITH CHECK requires DRAFT)
  console.log('\n=== Test 6: PUBLISHED insert as automated_ingestion_agent (should fail) ===');
  try {
    await pg.query('BEGIN');
    await pg.query("SET LOCAL role = 'authenticated'");
    await pg.query(`SET LOCAL request.jwt.claims = '{"app_metadata":{"research_role":"automated_ingestion_agent"}}'`);
    await pg.query(
      `INSERT INTO research_claims (canonical_id, confidence, statement, publication_status, human_review_status, published_at, ingestion_method) 
       VALUES ('AGENT-PUB-001', 'C1', 'Agent pub test', 'PUBLISHED', 'APPROVED', NOW(), 'TEST') RETURNING id`
    );
    console.log('  SUCCEEDED (unexpected!)');
  } catch (e) {
    console.log('  FAILED:', e.code, '(expected - agent WITH CHECK requires DRAFT)');
  }
  await pg.query('ROLLBACK');

  // Test 7: Check if auth.jwt() actually returns the right value inside the transaction
  console.log('\n=== Test 7: Verify auth.jwt() inside transaction ===');
  try {
    await pg.query('BEGIN');
    await pg.query("SET LOCAL role = 'authenticated'");
    await pg.query(`SET LOCAL request.jwt.claims = '{"app_metadata":{"research_role":"researcher"}}'`);
    const r1 = await pg.query(`SELECT auth.jwt() -> 'app_metadata' ->> 'research_role' as role_val`);
    console.log('  auth.jwt() role:', r1.rows[0].role_val);
    const r2 = await pg.query(`SELECT current_setting('request.jwt.claims', true)::json -> 'app_metadata' ->> 'research_role' as raw_val`);
    console.log('  raw current_setting:', r2.rows[0].raw_val);
  } catch (e) {
    console.log('  FAILED:', e.message);
  }
  await pg.query('ROLLBACK');

  await pg.end();
}
main().catch(e => { console.error(e); process.exit(1); });
