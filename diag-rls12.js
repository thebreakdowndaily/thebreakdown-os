const {Client} = require('pg');
const DB_URL = 'postgresql://postgres:Ntn%40supabase403@db.swektehukscmsgxdzymw.supabase.co:5432/postgres';

async function main() {
  const pg = new Client({ connectionString: DB_URL });
  await pg.connect();

  // CRITICAL FINDING: Even WITH CHECK (true) fails for DRAFT inserts.
  // This means the error is NOT from RLS policies.
  // It's a CHECK constraint being misreported, OR some other issue.

  // Step 1: Drop ALL constraints from research_claims, keep only RLS
  console.log('=== Step 1: Identify ALL constraints ===');
  const constraints = await pg.query(`
    SELECT conname, contype, pg_get_constraintdef(oid) as def 
    FROM pg_constraint WHERE conrelid = 'research_claims'::regclass
  `);
  for (const c of constraints.rows) {
    console.log(`  ${c.conname} (${c.contype}): ${c.def}`);
  }

  // Step 2: Temporarily drop CHECK constraints to see if they're the cause
  console.log('\n=== Step 2: Drop CHECK constraints temporarily ===');
  await pg.query('ALTER TABLE research_claims DROP CONSTRAINT research_claims_check');
  await pg.query('ALTER TABLE research_claims DROP CONSTRAINT claim_publish_requires_approval');
  console.log('  Dropped both CHECK constraints');

  // Step 3: Test DRAFT insert with RLS true but no CHECK constraints
  console.log('\n=== Step 3: DRAFT insert with RLS + WITH CHECK (true) but NO table CHECKs ===');
  // First, make sure we only have the simple policy
  const currentPolicies = await pg.query(`
    SELECT polname FROM pg_policy WHERE polrelid = 'research_claims'::regclass
  `);
  console.log('  Current policies:', currentPolicies.rows.map(r => r.polname));

  try {
    await pg.query('BEGIN');
    await pg.query("SET LOCAL role = 'authenticated'");
    await pg.query(`SET LOCAL request.jwt.claims = '{"app_metadata":{"research_role":"researcher"}}'`);
    const result = await pg.query(
      `INSERT INTO research_claims (canonical_id, confidence, statement, ingestion_method) 
       VALUES ('NO-CHECK-001', 'C1', 'No check constraints', 'TEST') RETURNING id, publication_status, human_review_status`
    );
    console.log('  DRAFT INSERT SUCCEEDED:', result.rows[0]);
  } catch (e) {
    console.log('  DRAFT INSERT FAILED:', e.code, e.message);
  }
  await pg.query('ROLLBACK');

  // Step 4: Restore CHECK constraints
  console.log('\n=== Step 4: Restore CHECK constraints ===');
  await pg.query(`
    ALTER TABLE research_claims ADD CONSTRAINT research_claims_check CHECK (
      (publication_status IN ('PUBLISHED', 'ARCHIVED', 'WITHDRAWN') AND published_at IS NOT NULL) OR
      (publication_status IN ('DRAFT', 'READY_FOR_PUBLICATION') AND published_at IS NULL)
    )
  `);
  await pg.query(`
    ALTER TABLE research_claims ADD CONSTRAINT claim_publish_requires_approval 
    CHECK (publication_status != 'PUBLISHED' OR human_review_status = 'APPROVED')
  `);

  // Step 5: Now test DRAFT with CHECK constraints restored
  console.log('\n=== Step 5: DRAFT insert with CHECK constraints restored ===');
  try {
    await pg.query('BEGIN');
    await pg.query("SET LOCAL role = 'authenticated'");
    await pg.query(`SET LOCAL request.jwt.claims = '{"app_metadata":{"research_role":"researcher"}}'`);
    const result = await pg.query(
      `INSERT INTO research_claims (canonical_id, confidence, statement, ingestion_method) 
       VALUES ('RESTORE-001', 'C1', 'Check restored', 'TEST') RETURNING id`
    );
    console.log('  DRAFT INSERT SUCCEEDED:', result.rows[0]);
  } catch (e) {
    console.log('  DRAFT INSERT FAILED:', e.code, e.message);
  }
  await pg.query('ROLLBACK');

  // Step 6: Test PUBLISHED with the same policies (control)
  console.log('\n=== Step 6: PUBLISHED insert (control, should succeed) ===');
  try {
    await pg.query('BEGIN');
    await pg.query("SET LOCAL role = 'authenticated'");
    await pg.query(`SET LOCAL request.jwt.claims = '{"app_metadata":{"research_role":"researcher"}}'`);
    const result = await pg.query(
      `INSERT INTO research_claims (canonical_id, confidence, statement, publication_status, human_review_status, published_at, ingestion_method) 
       VALUES ('CTRL-001', 'C1', 'Control pub', 'PUBLISHED', 'APPROVED', NOW(), 'TEST') RETURNING id`
    );
    console.log('  PUBLISHED INSERT SUCCEEDED:', result.rows[0]);
  } catch (e) {
    console.log('  PUBLISHED INSERT FAILED:', e.code, e.message);
  }
  await pg.query('ROLLBACK');

  // Step 7: Verify what the policies currently look like
  console.log('\n=== Step 7: Current policies ===');
  const policies = await pg.query(`
    SELECT polname, pg_get_expr(polwithcheck, polrelid) as wc 
    FROM pg_policy WHERE polrelid = 'research_claims'::regclass
  `);
  for (const p of policies.rows) {
    console.log(`  ${p.polname}: WC=${p.wc || '<none>'}`);
  }

  await pg.end();
}
main().catch(e => { console.error(e); process.exit(1); });
