const {Client} = require('pg');
const DB_URL = 'postgresql://postgres:Ntn%40supabase403@db.swektehukscmsgxdzymw.supabase.co:5432/postgres';

async function main() {
  const pg = new Client({ connectionString: DB_URL });
  await pg.connect();

  // 1. Deparse all policy expressions
  const deparsed = await pg.query(`
    SELECT polname, pg_get_expr(polqual, polrelid) as using_expr, pg_get_expr(polwithcheck, polrelid) as withcheck_expr
    FROM pg_policy WHERE polrelid = 'research_claims'::regclass ORDER BY polname
  `);
  console.log('=== Deparsed Policy Expressions ===');
  for (const p of deparsed.rows) {
    console.log(`\n  ${p.polname}:`);
    console.log(`    USING: ${p.using_expr || '<none>'}`);
    console.log(`    WITH CHECK: ${p.withcheck_expr || '<none>'}`);
  }

  // 2. Check constraints
  const constraints = await pg.query(`
    SELECT conname, contype::text, pg_get_constraintdef(oid) as def 
    FROM pg_constraint WHERE conrelid = 'research_claims'::regclass
  `);
  console.log('\n=== Constraints ===');
  for (const c of constraints.rows) {
    console.log(`  ${c.conname} (${c.contype}): ${c.def}`);
  }

  // 3. Check triggers
  const triggers = await pg.query(`
    SELECT tgname, tgenabled FROM pg_trigger 
    WHERE tgrelid = 'research_claims'::regclass AND NOT tgisinternal
  `);
  console.log('\n=== Triggers:', triggers.rowCount, '===');

  // 4. Check all policies for ALL tables (maybe there's a policy on a parent table?)
  const allPolicies = await pg.query(`
    SELECT t.relname as table_name, p.polname, pg_get_expr(p.polwithcheck, p.polrelid) as wc
    FROM pg_policy p JOIN pg_class t ON p.polrelid = t.oid
    WHERE t.relname LIKE 'research_%'
    ORDER BY t.relname, p.polname
  `);
  console.log('\n=== All RLS policies on research_* tables ===');
  for (const p of allPolicies.rows) {
    console.log(`  ${p.table_name}.${p.polname}: WC=${(p.wc || '<none>').substring(0, 120)}`);
  }

  // 5. Most importantly: simulate EXACTLY what happens during an INSERT
  console.log('\n=== Simulated INSERT with debug ===');
  await pg.query('BEGIN');
  await pg.query("SET LOCAL role = 'authenticated'");
  await pg.query(`SET LOCAL request.jwt.claims = '{"app_metadata":{"research_role":"researcher"}}'`);
  
  // Enable statement logging for this transaction
  await pg.query("SET LOCAL log_statement = 'all'");
  
  try {
    const result = await pg.query(`
      INSERT INTO research_claims (canonical_id, confidence, statement, ingestion_method) 
      VALUES ('FINAL-TEST', 'C1', 'Final test', 'TEST') RETURNING id
    `);
    console.log('  INSERT SUCCEEDED:', result.rows[0].id);
  } catch (e) {
    console.log('  INSERT FAILED:', e.message);
    
    // Try to understand WHY by testing each piece
    console.log('\n  Debugging: check each policy individually...');
    
    // Check if it's the researcher_insert_claims policy
    const check1 = await pg.query(`SELECT (SELECT auth.jwt() -> 'app_metadata' ->> 'research_role') = 'researcher' as result`);
    console.log('    researcher role check:', check1.rows[0].result);
    
    // Check if there's something wrong with the default values
    const check2 = await pg.query(`SELECT 'DRAFT'::publication_status_type = 'DRAFT' as pub_check, 'UNREVIEWED'::human_review_status_type = 'UNREVIEWED' as rev_check`);
    console.log('    default publication_status check:', check2.rows[0].pub_check);
    console.log('    default human_review_status check:', check2.rows[0].rev_check);

    // Try the EXACT same insert that WORKS (PUBLISHED)
    console.log('\n  Now trying PUBLISHED insert (which we know works)...');
    try {
      const result2 = await pg.query(`
        INSERT INTO research_claims (canonical_id, confidence, statement, publication_status, human_review_status, published_at, ingestion_method) 
        VALUES ('FINAL-PUB', 'C1', 'Final pub test', 'PUBLISHED', 'APPROVED', NOW(), 'TEST') RETURNING id
      `);
      console.log('  PUBLISHED INSERT SUCCEEDED:', result2.rows[0].id);
      await pg.query(`DELETE FROM research_claims WHERE canonical_id = 'FINAL-PUB'`);
    } catch (e2) {
      console.log('  PUBLISHED INSERT FAILED:', e2.message);
    }
  }
  await pg.query('ROLLBACK');

  await pg.end();
}
main().catch(e => { console.error(e); process.exit(1); });
