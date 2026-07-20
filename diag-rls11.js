const {Client} = require('pg');
const DB_URL = 'postgresql://postgres:Ntn%40supabase403@db.swektehukscmsgxdzymw.supabase.co:5432/postgres';

async function main() {
  const pg = new Client({ connectionString: DB_URL });
  await pg.connect();

  // Step 1: Drop ALL INSERT policies except researcher_insert_claims
  console.log('=== Step 1: Drop agent_insert_claims ===');
  await pg.query('DROP POLICY agent_insert_claims ON research_claims');
  
  // Step 2: Test DRAFT insert with only researcher_insert_claims
  console.log('\n=== Step 2: DRAFT insert with ONLY researcher_insert_claims ===');
  try {
    await pg.query('BEGIN');
    await pg.query("SET LOCAL role = 'authenticated'");
    await pg.query(`SET LOCAL request.jwt.claims = '{"app_metadata":{"research_role":"researcher"}}'`);
    const result = await pg.query(
      `INSERT INTO research_claims (canonical_id, confidence, statement, ingestion_method) 
       VALUES ('SINGLE-001', 'C1', 'Single policy test', 'TEST') RETURNING id, publication_status`
    );
    console.log('  SUCCEEDED:', result.rows[0]);
  } catch (e) {
    console.log('  FAILED:', e.code, e.message);
  }
  await pg.query('ROLLBACK');

  // Step 3: Check if it's the UPDATE policies interfering
  console.log('\n=== Step 3: Drop ALL UPDATE policies too ===');
  await pg.query('DROP POLICY researcher_update_claims ON research_claims');
  await pg.query('DROP POLICY reviewer_update_claims ON research_claims');
  await pg.query('DROP POLICY editor_publish_claims ON research_claims');
  await pg.query('DROP POLICY admin_update_claims ON research_claims');

  console.log('\n=== Step 4: DRAFT insert with ONLY researcher_insert_claims (no UPDATE policies) ===');
  try {
    await pg.query('BEGIN');
    await pg.query("SET LOCAL role = 'authenticated'");
    await pg.query(`SET LOCAL request.jwt.claims = '{"app_metadata":{"research_role":"researcher"}}'`);
    const result = await pg.query(
      `INSERT INTO research_claims (canonical_id, confidence, statement, ingestion_method) 
       VALUES ('SINGLE-002', 'C1', 'Only insert policy', 'TEST') RETURNING id, publication_status`
    );
    console.log('  SUCCEEDED:', result.rows[0]);
  } catch (e) {
    console.log('  FAILED:', e.code, e.message);
  }
  await pg.query('ROLLBACK');

  // Step 5: Drop researcher_insert_claims too - should fail (no INSERT policies at all)
  console.log('\n=== Step 5: Drop ALL policies - should fail ===');
  await pg.query('DROP POLICY researcher_insert_claims ON research_claims');
  await pg.query('DROP POLICY public_read_published_claims ON research_claims');
  
  try {
    await pg.query('BEGIN');
    await pg.query("SET LOCAL role = 'authenticated'");
    await pg.query(`SET LOCAL request.jwt.claims = '{"app_metadata":{"research_role":"researcher"}}'`);
    await pg.query(
      `INSERT INTO research_claims (canonical_id, confidence, statement, ingestion_method) 
       VALUES ('NO-POLICY-001', 'C1', 'No policy', 'TEST') RETURNING id`
    );
    console.log('  SUCCEEDED (unexpected!)');
  } catch (e) {
    console.log('  FAILED:', e.code, '(expected - no policies)');
  }
  await pg.query('ROLLBACK');

  // Step 6: Create a brand new INSERT policy and test
  console.log('\n=== Step 6: Create new simple INSERT policy ===');
  await pg.query(`
    CREATE POLICY simple_insert ON research_claims
    FOR INSERT WITH CHECK (
      current_setting('request.jwt.claims', true)::json -> 'app_metadata' ->> 'research_role' = 'researcher'
    )
  `);

  console.log('\n=== Step 7: DRAFT insert with new simple policy ===');
  try {
    await pg.query('BEGIN');
    await pg.query("SET LOCAL role = 'authenticated'");
    await pg.query(`SET LOCAL request.jwt.claims = '{"app_metadata":{"research_role":"researcher"}}'`);
    const result = await pg.query(
      `INSERT INTO research_claims (canonical_id, confidence, statement, ingestion_method) 
       VALUES ('SIMPLE-001', 'C1', 'Simple policy test', 'TEST') RETURNING id, publication_status`
    );
    console.log('  SUCCEEDED:', result.rows[0]);
  } catch (e) {
    console.log('  FAILED:', e.code, e.message);
  }
  await pg.query('ROLLBACK');

  // Step 8: If step 7 failed, the issue is fundamental. Test without any auth.jwt()
  console.log('\n=== Step 8: Test with literal TRUE policy ===');
  await pg.query('DROP POLICY simple_insert ON research_claims');
  await pg.query(`CREATE POLICY open_insert ON research_claims FOR INSERT WITH CHECK (true)`);

  try {
    await pg.query('BEGIN');
    await pg.query("SET LOCAL role = 'authenticated'");
    const result = await pg.query(
      `INSERT INTO research_claims (canonical_id, confidence, statement, ingestion_method) 
       VALUES ('OPEN-001', 'C1', 'Open policy', 'TEST') RETURNING id`
    );
    console.log('  DRAFT INSERT SUCCEEDED:', result.rows[0].id);
  } catch (e) {
    console.log('  DRAFT INSERT FAILED:', e.code, e.message);
  }
  await pg.query('ROLLBACK');

  // CLEANUP: Recreate all original policies
  console.log('\n=== CLEANUP: Recreating all policies ===');
  await pg.query('DROP POLICY open_insert ON research_claims');
  
  // Drop the public_read policy too since we dropped it
  await pg.query(`
    CREATE POLICY public_read_published_claims ON research_claims
    FOR SELECT USING (publication_status = 'PUBLISHED')
  `);
  await pg.query(`
    CREATE POLICY researcher_insert_claims ON research_claims
    FOR INSERT WITH CHECK (
      (SELECT auth.jwt() -> 'app_metadata' ->> 'research_role') = 'researcher'
    )
  `);
  await pg.query(`
    CREATE POLICY researcher_update_claims ON research_claims
    FOR UPDATE USING (
      (SELECT auth.jwt() -> 'app_metadata' ->> 'research_role') = 'researcher'
      AND publication_status = 'DRAFT'
    ) WITH CHECK (
      publication_status = 'DRAFT'
      AND human_review_status = 'UNREVIEWED'
    )
  `);
  await pg.query(`
    CREATE POLICY reviewer_update_claims ON research_claims
    FOR UPDATE USING (
      (SELECT auth.jwt() -> 'app_metadata' ->> 'research_role') = 'reviewer'
    ) WITH CHECK (
      publication_status NOT IN ('PUBLISHED')
    )
  `);
  await pg.query(`
    CREATE POLICY editor_publish_claims ON research_claims
    FOR UPDATE USING (
      (SELECT auth.jwt() -> 'app_metadata' ->> 'research_role') = 'editor'
    )
  `);
  await pg.query(`
    CREATE POLICY admin_update_claims ON research_claims
    FOR UPDATE USING (
      (SELECT auth.jwt() -> 'app_metadata' ->> 'research_role') = 'administrator'
    )
  `);
  await pg.query(`
    CREATE POLICY agent_insert_claims ON research_claims
    FOR INSERT WITH CHECK (
      (SELECT auth.jwt() -> 'app_metadata' ->> 'research_role') = 'automated_ingestion_agent'
      AND publication_status = 'DRAFT'
      AND human_review_status = 'UNREVIEWED'
    )
  `);
  console.log('  All policies recreated');

  await pg.end();
}
main().catch(e => { console.error(e); process.exit(1); });
