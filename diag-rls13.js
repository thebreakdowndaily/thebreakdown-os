const {Client} = require('pg');
const DB_URL = 'postgresql://postgres:Ntn%40supabase403@db.swektehukscmsgxdzymw.supabase.co:5432/postgres';

async function main() {
  const pg = new Client({ connectionString: DB_URL });
  await pg.connect();

  // The mystery: DRAFT insert (using defaults) fails, PUBLISHED (explicit) succeeds.
  // Both should pass researcher_insert_claims WITH CHECK.
  // Let's test: is the issue the DEFAULT values or something else?

  // Test 1: DRAFT with ALL defaults specified explicitly
  console.log('=== Test 1: DRAFT with all defaults explicit ===');
  try {
    await pg.query('BEGIN');
    await pg.query("SET LOCAL role = 'authenticated'");
    await pg.query(`SET LOCAL request.jwt.claims = '{"app_metadata":{"research_role":"researcher"}}'`);
    await pg.query(
      `INSERT INTO research_claims (canonical_id, confidence, statement, publication_status, human_review_status, ingestion_method) 
       VALUES ('FULL-EXPL-001', 'C1', 'Full explicit DRAFT', 'DRAFT', 'UNREVIEWED', 'TEST') RETURNING id`
    );
    console.log('  SUCCEEDED');
  } catch (e) {
    console.log('  FAILED:', e.code, e.message);
  }
  await pg.query('ROLLBACK');

  // Test 2: What exact SQL does Supabase PostgREST generate? Let's use EXPLAIN
  console.log('\n=== Test 2: EXPLAIN INSERT (does it show RLS check?) ===');
  try {
    await pg.query('BEGIN');
    await pg.query("SET LOCAL role = 'authenticated'");
    await pg.query(`SET LOCAL request.jwt.claims = '{"app_metadata":{"research_role":"researcher"}}'`);
    const explain = await pg.query(
      `EXPLAIN INSERT INTO research_claims (canonical_id, confidence, statement, publication_status, human_review_status, ingestion_method) 
       VALUES ('EXPLAIN-001', 'C1', 'Explain test', 'DRAFT', 'UNREVIEWED', 'TEST')`
    );
    for (const row of explain.rows) {
      console.log(' ', row['QUERY PLAN']);
    }
  } catch (e) {
    console.log('  EXPLAIN FAILED:', e.code, e.message);
  }
  await pg.query('ROLLBACK');

  // Test 3: Try inserting with ONLY the PUBLISHED values but also include published_at
  // (making it match BOTH CHECK constraints)
  console.log('\n=== Test 3: DRAFT with published_at=NULL explicit ===');
  try {
    await pg.query('BEGIN');
    await pg.query("SET LOCAL role = 'authenticated'");
    await pg.query(`SET LOCAL request.jwt.claims = '{"app_metadata":{"research_role":"researcher"}}'`);
    await pg.query(
      `INSERT INTO research_claims (canonical_id, confidence, statement, publication_status, human_review_status, published_at, ingestion_method) 
       VALUES ('DRAFT-NULL-001', 'C1', 'Draft with explicit null', 'DRAFT', 'UNREVIEWED', NULL, 'TEST') RETURNING id`
    );
    console.log('  SUCCEEDED');
  } catch (e) {
    console.log('  FAILED:', e.code, e.message);
  }
  await pg.query('ROLLBACK');

  // Test 4: What if we INSERT with no columns at all, using all defaults?
  // This should use: publication_status = 'DRAFT', human_review_status = 'UNREVIEWED'
  console.log('\n=== Test 4: INSERT DEFAULT VALUES ===');
  try {
    await pg.query('BEGIN');
    await pg.query("SET LOCAL role = 'authenticated'");
    await pg.query(`SET LOCAL request.jwt.claims = '{"app_metadata":{"research_role":"researcher"}}'`);
    // Can't do full DEFAULT VALUES since canonical_id, confidence, etc. are NOT NULL
    // But let's try with minimal columns
    await pg.query(
      `INSERT INTO research_claims (canonical_id, confidence, statement, ingestion_method) 
       VALUES ('DEFAULT-001', 'C1', 'Default values', 'TEST')`
    );
    console.log('  SUCCEEDED');
  } catch (e) {
    console.log('  FAILED:', e.code, e.message);
  }
  await pg.query('ROLLBACK');

  // Test 5: EXPLICITLY set the session_user to something non-owner-like
  // and try the same DRAFT insert
  console.log('\n=== Test 5: Check if session_user matters ===');
  try {
    await pg.query('BEGIN');
    console.log('  session_user:', (await pg.query('SELECT session_user')).rows[0].session_user);
    console.log('  current_user before SET ROLE:', (await pg.query('SELECT current_user')).rows[0].current_user);
    await pg.query("SET LOCAL role = 'authenticated'");
    console.log('  current_user after SET ROLE:', (await pg.query('SELECT current_user')).rows[0].current_user);
    
    // Check if pg_has_role works
    const hasRole = await pg.query(`SELECT pg_has_role('authenticated', 'authenticated', 'member')`);
    console.log('  pg_has_role:', hasRole.rows[0]);
    
    // Check the effective user ID
    const authUid = await pg.query(`SELECT auth.uid()`);
    console.log('  auth.uid():', authUid.rows[0]);
    
    await pg.query('ROLLBACK');
  } catch (e) {
    console.log('  FAILED:', e.message);
    await pg.query('ROLLBACK');
  }

  // Test 6: Create a helper function that does the INSERT with SECURITY DEFINER
  // to bypass RLS and check the actual values
  console.log('\n=== Test 6: SECURITY DEFINER function to INSERT ===');
  await pg.query(`DROP FUNCTION IF EXISTS debug_insert_draft()`);
  await pg.query(`
    CREATE FUNCTION debug_insert_draft() RETURNS jsonb AS $$
    DECLARE
      result jsonb;
    BEGIN
      INSERT INTO research_claims (canonical_id, confidence, statement, publication_status, human_review_status, ingestion_method) 
      VALUES ('SECDEF-001', 'C1', 'Security definer test', 'DRAFT', 'UNREVIEWED', 'TEST')
      RETURNING jsonb_build_object('id', id, 'pub', publication_status, 'rev', human_review_status) INTO result;
      RETURN result;
    EXCEPTION WHEN OTHERS THEN
      RETURN jsonb_build_object('error', SQLERRM, 'code', SQLSTATE);
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;
  `);
  const fnResult = await pg.query('SELECT debug_insert_draft()');
  console.log('  Function result:', fnResult.rows[0].debug_insert_draft);
  await pg.query(`DELETE FROM research_claims WHERE canonical_id = 'SECDEF-001'`);
  await pg.query(`DROP FUNCTION debug_insert_draft()`);

  // Test 7: CRITICAL - What if the issue is NOT the INSERT but some BEFORE INSERT trigger
  // or the DEFAULT expressions themselves?
  console.log('\n=== Test 7: Check if gen_random_uuid() or NOW() cause issues ===');
  try {
    await pg.query('BEGIN');
    await pg.query("SET LOCAL role = 'authenticated'");
    await pg.query(`SET LOCAL request.jwt.claims = '{"app_metadata":{"research_role":"researcher"}}'`);
    // Provide ALL values explicitly, bypassing ALL defaults
    await pg.query(
      `INSERT INTO research_claims (id, canonical_id, confidence, statement, human_review_status, publication_status, created_at, ingestion_method) 
       VALUES (gen_random_uuid(), 'ALL-VALS-001', 'C1', 'All values explicit', 'UNREVIEWED', 'DRAFT', NOW(), 'TEST') RETURNING id`
    );
    console.log('  SUCCEEDED (all values explicit, no defaults needed)');
  } catch (e) {
    console.log('  FAILED:', e.code, e.message);
  }
  await pg.query('ROLLBACK');

  await pg.end();
}
main().catch(e => { console.error(e); process.exit(1); });
