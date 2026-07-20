const {Client} = require('pg');
const DB_URL = 'postgresql://postgres:Ntn%40supabase403@db.swektehukscmsgxdzymw.supabase.co:5432/postgres';

async function main() {
  const pg = new Client({ connectionString: DB_URL });
  await pg.connect();

  // 1. Check actual polcmd for each policy (FOR INSERT vs FOR ALL etc.)
  console.log('=== 1. Policy command types from pg_catalog ===');
  const cmds = await pg.query(`
    SELECT p.polname, 
           CASE p.polcmd 
             WHEN 'r' THEN 'SELECT'
             WHEN 'a' THEN 'INSERT' 
             WHEN 'w' THEN 'UPDATE'
             WHEN 'd' THEN 'DELETE'
             WHEN '*' THEN 'ALL'
           END as cmd,
           p.polpermissive::int as is_permissive,
           p.polroles::text
    FROM pg_policy p 
    WHERE p.polrelid = 'research_claims'::regclass
    ORDER BY p.polname
  `);
  for (const r of cmds.rows) {
    console.log(`  ${r.polname}: cmd=${r.cmd} permissive=${r.is_permissive} roles=${r.polroles}`);
  }

  // 2. Check table owner
  console.log('\n=== 2. Table owner ===');
  const owner = await pg.query(`SELECT tableowner FROM pg_class WHERE relname = 'research_claims'`);
  console.log('  Owner:', owner.rows[0].tableowner);

  // 3. Check if postgres role has bypass privilege
  console.log('\n=== 3. Role attributes ===');
  const roles = await pg.query(`SELECT rolname, rolsuper, rolbypassrls FROM pg_roles WHERE rolname IN ('postgres','authenticated','service_role','anon','authenticator')`);
  for (const r of roles.rows) {
    console.log(`  ${r.rolname}: super=${r.rolsuper} bypassrls=${r.rolbypassrls}`);
  }

  // 4. Check if RLS is forced on any role
  console.log('\n=== 4. FORCE ROW LEVEL SECURITY ===');
  const force = await pg.query(`SELECT relname, relforcerowsecurity FROM pg_class WHERE relname = 'research_claims'`);
  console.log('  relforcerowsecurity:', force.rows[0]?.relforcerowsecurity);

  // 5. Minimal reproduction: create a tiny table with same policy and test
  console.log('\n=== 5. Minimal reproduction test ===');
  await pg.query('DROP TABLE IF EXISTS rls_minimal_test');
  await pg.query(`CREATE TABLE rls_minimal_test (
    id SERIAL PRIMARY KEY,
    data TEXT NOT NULL DEFAULT 'default_val'
  )`);
  await pg.query('ALTER TABLE rls_minimal_test ENABLE ROW LEVEL SECURITY');
  await pg.query(`
    CREATE POLICY researcher_insert_test ON rls_minimal_test
    FOR INSERT WITH CHECK (
      (SELECT auth.jwt() -> 'app_metadata' ->> 'research_role') = 'researcher'
    )
  `);
  // Grant authenticated role
  await pg.query('GRANT INSERT, SELECT ON rls_minimal_test TO authenticated');

  // Test A: DRAFT-like insert (default values)
  console.log('\n  Test A: Insert with defaults (DRAFT-like)');
  try {
    await pg.query('BEGIN');
    await pg.query("SET LOCAL role = 'authenticated'");
    await pg.query(`SET LOCAL request.jwt.claims = '{"app_metadata":{"research_role":"researcher"}}'`);
    await pg.query(`INSERT INTO rls_minimal_test (data) VALUES ('hello') RETURNING id`);
    console.log('    SUCCEEDED');
  } catch (e) {
    console.log('    FAILED:', e.code, e.message);
  }
  await pg.query('ROLLBACK');

  // Test B: Insert with all explicit
  console.log('  Test B: Insert with explicit value');
  try {
    await pg.query('BEGIN');
    await pg.query("SET LOCAL role = 'authenticated'");
    await pg.query(`SET LOCAL request.jwt.claims = '{"app_metadata":{"research_role":"researcher"}}'`);
    await pg.query(`INSERT INTO rls_minimal_test (data) VALUES ('explicit') RETURNING id`);
    console.log('    SUCCEEDED');
  } catch (e) {
    console.log('    FAILED:', e.code, e.message);
  }
  await pg.query('ROLLBACK');

  await pg.query('DROP TABLE rls_minimal_test');

  // 6. Now the real test: what if we test WITH THE SAME COLUMN PATTERN as research_claims?
  // Maybe there's something about the column ordering or defaults
  console.log('\n=== 6. Exact column pattern test ===');
  await pg.query('DROP TABLE IF EXISTS rls_exact_test');
  await pg.query(`CREATE TABLE rls_exact_test (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    canonical_id VARCHAR(100) UNIQUE NOT NULL,
    statement TEXT NOT NULL,
    confidence VARCHAR(5) NOT NULL,
    human_review_status VARCHAR(20) NOT NULL DEFAULT 'UNREVIEWED',
    publication_status VARCHAR(20) NOT NULL DEFAULT 'DRAFT',
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ingestion_method VARCHAR(50) NOT NULL
  )`);
  await pg.query('ALTER TABLE rls_exact_test ENABLE ROW LEVEL SECURITY');
  await pg.query(`
    CREATE POLICY res_insert ON rls_exact_test
    FOR INSERT WITH CHECK (
      (SELECT auth.jwt() -> 'app_metadata' ->> 'research_role') = 'researcher'
    )
  `);
  await pg.query('GRANT INSERT, SELECT ON rls_exact_test TO authenticated');

  // Test C: Insert like DRAFT (no publication_status, no human_review_status)
  console.log('\n  Test C: DRAFT-like (defaults)');
  try {
    await pg.query('BEGIN');
    await pg.query("SET LOCAL role = 'authenticated'");
    await pg.query(`SET LOCAL request.jwt.claims = '{"app_metadata":{"research_role":"researcher"}}'`);
    await pg.query(`INSERT INTO rls_exact_test (canonical_id, statement, confidence, ingestion_method) VALUES ('TEST-C', 'Draft', 'C1', 'TEST') RETURNING id`);
    console.log('    SUCCEEDED');
  } catch (e) {
    console.log('    FAILED:', e.code, e.message);
  }
  await pg.query('ROLLBACK');

  // Test D: Insert like PUBLISHED (explicit status)
  console.log('  Test D: PUBLISHED-like (explicit)');
  try {
    await pg.query('BEGIN');
    await pg.query("SET LOCAL role = 'authenticated'");
    await pg.query(`SET LOCAL request.jwt.claims = '{"app_metadata":{"research_role":"researcher"}}'`);
    await pg.query(`INSERT INTO rls_exact_test (canonical_id, statement, confidence, human_review_status, publication_status, published_at, ingestion_method) VALUES ('TEST-D', 'Pub', 'C1', 'APPROVED', 'PUBLISHED', NOW(), 'TEST') RETURNING id`);
    console.log('    SUCCEEDED');
  } catch (e) {
    console.log('    FAILED:', e.code, e.message);
  }
  await pg.query('ROLLBACK');

  await pg.query('DROP TABLE rls_exact_test');

  await pg.end();
}
main().catch(e => { console.error(e); process.exit(1); });
