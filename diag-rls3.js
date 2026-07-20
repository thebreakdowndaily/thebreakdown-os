const {Client} = require('pg');
const DB_URL = 'postgresql://postgres:Ntn%40supabase403@db.swektehukscmsgxdzymw.supabase.co:5432/postgres';

async function main() {
  const pg = new Client({ connectionString: DB_URL });
  await pg.connect();

  // Test: does the policy expression evaluate to true?
  console.log('=== Direct SQL policy evaluation ===');
  
  await pg.query('BEGIN');
  await pg.query("SET LOCAL role = 'authenticated'");
  await pg.query(`SET LOCAL request.jwt.claims = '{"app_metadata":{"research_role":"researcher"}}'`);
  
  const evalResult = await pg.query(
    "SELECT (SELECT auth.jwt() -> 'app_metadata' ->> 'research_role') = 'researcher' as policy_check"
  );
  console.log('  Policy expression result:', evalResult.rows[0].policy_check);
  
  const jwtResult = await pg.query("SELECT auth.jwt() as jwt");
  console.log('  auth.jwt():', JSON.stringify(jwtResult.rows[0].jwt));
  
  await pg.query('ROLLBACK');

  // Test: check if there's a conflicting FOR ALL policy
  console.log('\n=== All policies (raw) ===');
  const allPolicies = await pg.query(
    "SELECT oid, polname, polcmd::text, polpermissive::text, polroles::text, polqual::text, polwithcheck::text FROM pg_policy WHERE polrelid = 'research_claims'::regclass"
  );
  for (const p of allPolicies.rows) {
    console.log(`  ${p.polname}: permissive=${p.polpermissive} cmd=${p.polcmd} roles=${p.polroles}`);
    console.log(`    qual(USING): ${(p.polqual || '<none>').substring(0, 200)}`);
    console.log(`    withcheck: ${(p.polwithcheck || '<none>').substring(0, 200)}`);
  }

  // Test: check if policies are permissive or restrictive
  console.log('\n=== Policy type breakdown ===');
  const permCheck = await pg.query(
    "SELECT polpermissive, count(*) as cnt FROM pg_policy WHERE polrelid = 'research_claims'::regclass GROUP BY polpermissive"
  );
  for (const r of permCheck.rows) {
    console.log(`  ${r.polpermissive}: ${r.cnt} policies`);
  }

  // Test: simulate what PostgREST does - convert RLS to WHERE clause
  console.log('\n=== Simulated PostgREST INSERT SQL ===');
  await pg.query('BEGIN');
  await pg.query("SET LOCAL role = 'authenticated'");
  await pg.query(`SET LOCAL request.jwt.claims = '{"app_metadata":{"research_role":"researcher"}}'`);
  
  // Check: can authenticated role even INSERT?
  try {
    await pg.query(
      `INSERT INTO research_claims (canonical_id, confidence, statement, ingestion_method) VALUES ('SIM-001', 'C1', 'Sim test', 'TEST') RETURNING id`
    );
    console.log('  INSERT succeeded');
    await pg.query('ROLLBACK');
  } catch (e) {
    console.log('  INSERT failed:', e.message);
    await pg.query('ROLLBACK');
  }

  // Test: try with ONLY the researcher policy (drop agent policy temporarily?)
  // Instead, let's check the exact SQL PostgREST generates by looking at pg_stat_statements
  console.log('\n=== Check PostgREST role switching ===');
  const roleCheck = await pg.query(
    "SELECT rolname, rolsuper, rolcreaterole, rolcreatedb, rolcanlogin, rolconnlimit FROM pg_roles WHERE rolname IN ('anon','authenticated','service_role','authenticator')"
  );
  for (const r of roleCheck.rows) {
    console.log(`  ${r.rolname}: super=${r.rolsuper} login=${r.rolcanlogin} connlimit=${r.rolconnlimit}`);
  }

  // Test: who is the table owner and does it affect RLS?
  console.log('\n=== Table ownership and default privileges ===');
  const tableInfo = await pg.query(
    "SELECT tableowner, relacl FROM pg_class WHERE relname = 'research_claims' AND relnamespace = 'public'::regnamespace"
  );
  console.log('  Owner:', tableInfo.rows[0]?.tableowner);
  console.log('  ACL:', tableInfo.rows[0]?.relacl);

  await pg.end();
}
main().catch(e => { console.error(e); process.exit(1); });
