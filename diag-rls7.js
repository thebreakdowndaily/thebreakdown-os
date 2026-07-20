const {Client} = require('pg');
const DB_URL = 'postgresql://postgres:Ntn%40supabase403@db.swektehukscmsgxdzymw.supabase.co:5432/postgres';

async function main() {
  const pg = new Client({ connectionString: DB_URL });
  await pg.connect();

  // The mystery: DRAFT insert fails but PUBLISHED succeeds when role=authenticated.
  // Both should pass researcher_insert_claims WITH CHECK (only checks JWT role).
  // Let's isolate the issue.

  // Test 1: DRAFT with EXPLICIT columns (same as PUBLISHED but with DRAFT values)
  console.log('=== Test 1: DRAFT insert with all columns explicit ===');
  try {
    await pg.query('BEGIN');
    await pg.query("SET LOCAL role = 'authenticated'");
    await pg.query(`SET LOCAL request.jwt.claims = '{"app_metadata":{"research_role":"researcher"}}'`);
    const result = await pg.query(
      `INSERT INTO research_claims (canonical_id, confidence, statement, publication_status, human_review_status, ingestion_method) 
       VALUES ('DIA7-EXP-001', 'C1', 'Explicit DRAFT', 'DRAFT', 'UNREVIEWED', 'TEST') RETURNING id, publication_status`
    );
    console.log('  SUCCEEDED:', result.rows[0]);
  } catch (e) {
    console.log('  FAILED:', e.code, e.message);
  }
  await pg.query('ROLLBACK');

  // Test 2: DRAFT with only publication_status explicit (human_review_status uses default)
  console.log('\n=== Test 2: DRAFT insert with only publication_status explicit ===');
  try {
    await pg.query('BEGIN');
    await pg.query("SET LOCAL role = 'authenticated'");
    await pg.query(`SET LOCAL request.jwt.claims = '{"app_metadata":{"research_role":"researcher"}}'`);
    const result = await pg.query(
      `INSERT INTO research_claims (canonical_id, confidence, statement, publication_status, ingestion_method) 
       VALUES ('DIA7-PART-001', 'C1', 'Partial DRAFT', 'DRAFT', 'TEST') RETURNING id, publication_status`
    );
    console.log('  SUCCEEDED:', result.rows[0]);
  } catch (e) {
    console.log('  FAILED:', e.code, e.message);
  }
  await pg.query('ROLLBACK');

  // Test 3: DRAFT with EXACTLY the same pattern as PUBLISHED but different status
  console.log('\n=== Test 3: PUBLISHED-like but DRAFT status ===');
  try {
    await pg.query('BEGIN');
    await pg.query("SET LOCAL role = 'authenticated'");
    await pg.query(`SET LOCAL request.jwt.claims = '{"app_metadata":{"research_role":"researcher"}}'`);
    const result = await pg.query(
      `INSERT INTO research_claims (canonical_id, confidence, statement, publication_status, human_review_status, ingestion_method) 
       VALUES ('DIA7-MATCH-001', 'C1', 'PUB-like DRAFT', 'DRAFT', 'UNREVIEWED', 'TEST') RETURNING id, publication_status`
    );
    console.log('  SUCCEEDED:', result.rows[0]);
  } catch (e) {
    console.log('  FAILED:', e.code, e.message);
  }
  await pg.query('ROLLBACK');

  // Test 4: Drop agent_insert_claims, try DRAFT again
  console.log('\n=== Test 4: DRAFT insert after dropping agent_insert_claims ===');
  try {
    await pgAdmin_query(pg, "DROP POLICY agent_insert_claims ON research_claims");
    console.log('  Dropped agent_insert_claims policy');
    
    await pg.query('BEGIN');
    await pg.query("SET LOCAL role = 'authenticated'");
    await pg.query(`SET LOCAL request.jwt.claims = '{"app_metadata":{"research_role":"researcher"}}'`);
    const result = await pg.query(
      `INSERT INTO research_claims (canonical_id, confidence, statement, ingestion_method) 
       VALUES ('DIA7-NOAGENT-001', 'C1', 'No agent policy', 'TEST') RETURNING id, publication_status`
    );
    console.log('  SUCCEEDED:', result.rows[0]);
  } catch (e) {
    console.log('  FAILED:', e.code, e.message);
  }
  await pg.query('ROLLBACK');

  // Test 5: PUBLISHED insert (should still work)
  console.log('\n=== Test 5: PUBLISHED insert (control) ===');
  try {
    await pg.query('BEGIN');
    await pg.query("SET LOCAL role = 'authenticated'");
    await pg.query(`SET LOCAL request.jwt.claims = '{"app_metadata":{"research_role":"researcher"}}'`);
    const result = await pg.query(
      `INSERT INTO research_claims (canonical_id, confidence, statement, publication_status, human_review_status, published_at, ingestion_method) 
       VALUES ('DIA7-CTRL-001', 'C1', 'Control PUB', 'PUBLISHED', 'APPROVED', NOW(), 'TEST') RETURNING id, publication_status`
    );
    console.log('  SUCCEEDED:', result.rows[0]);
  } catch (e) {
    console.log('  FAILED:', e.code, e.message);
  }
  await pg.query('ROLLBACK');

  // Recreate the agent policy
  console.log('\n=== Recreating agent_insert_claims ===');
  await pgAdmin_query(pg, `
    CREATE POLICY agent_insert_claims ON research_claims
    FOR INSERT WITH CHECK (
        (SELECT auth.jwt() -> 'app_metadata' ->> 'research_role') = 'automated_ingestion_agent'
        AND publication_status = 'DRAFT'
        AND human_review_status = 'UNREVIEWED'
    )
  `);
  console.log('  Recreated agent_insert_claims');

  // Test 6: After recreating, DRAFT fails again?
  console.log('\n=== Test 6: DRAFT insert after policy recreation ===');
  try {
    await pg.query('BEGIN');
    await pg.query("SET LOCAL role = 'authenticated'");
    await pg.query(`SET LOCAL request.jwt.claims = '{"app_metadata":{"research_role":"researcher"}}'`);
    const result = await pg.query(
      `INSERT INTO research_claims (canonical_id, confidence, statement, ingestion_method) 
       VALUES ('DIA7-RECREATE-001', 'C1', 'Recreated test', 'TEST') RETURNING id, publication_status`
    );
    console.log('  SUCCEEDED:', result.rows[0]);
  } catch (e) {
    console.log('  FAILED:', e.code, e.message);
  }
  await pg.query('ROLLBACK');

  await pg.end();
}

async function pgAdmin_query(pg, sql) {
  return pg.query(sql);
}

main().catch(e => { console.error(e); process.exit(1); });
