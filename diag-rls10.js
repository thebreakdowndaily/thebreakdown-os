const {Client} = require('pg');
const DB_URL = 'postgresql://postgres:Ntn%40supabase403@db.swektehukscmsgxdzymw.supabase.co:5432/postgres';
const {createClient} = require('@supabase/supabase-js');
const SUPABASE_URL = 'https://swektehukscmsgxdzymw.supabase.co';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN3ZWt0ZWh1a3NjbXNneGR6eW13Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ0NzQ3ODQsImV4cCI6MjEwMDA1MDc4NH0.nUuW161KEAIGG98sjbhpvX3J-P-fZxVCVJaMBpQQXNo';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN3ZWt0ZWh1a3NjbXNneGR6eW13Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NDQ3NDc4NCwiZXhwIjoyMTAwMDUwNzg0fQ.2Yf2PnE8wIh4ynTWAq8jp0hUo3jpgqdnBMv3MDwC6K4';

async function main() {
  const pg = new Client({ connectionString: DB_URL });
  await pg.connect();

  const adminClient = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { autoRefreshToken: false, persistSession: false } });

  // First, let's check what happens when we try to connect as 'authenticated' role directly
  console.log('=== Test 1: Connect as authenticator role, SET ROLE authenticated ===');
  const pgAuth = new Client({ 
    connectionString: 'postgresql://postgres:Ntn%40supabase403@db.swektehukscmsgxdzymw.supabase.co:5432/postgres',
    options: '-c role=authenticated'
  });
  try {
    await pgAuth.connect();
    const r = await pgAuth.query('SELECT current_user, session_user');
    console.log('  Users:', r.rows[0]);
    
    await pgAuth.query(`SET LOCAL request.jwt.claims = '{"app_metadata":{"research_role":"researcher"}}'`);
    const result = await pgAuth.query(
      `INSERT INTO research_claims (canonical_id, confidence, statement, ingestion_method) 
       VALUES ('AUTH-CONN-001', 'C1', 'Auth conn test', 'TEST') RETURNING id`
    );
    console.log('  DRAFT INSERT SUCCEEDED:', result.rows[0].id);
  } catch (e) {
    console.log('  DRAFT INSERT FAILED:', e.code, e.message);
  }
  await pgAuth.end().catch(() => {});

  // Test 2: Use PostgREST's actual path: connect as authenticator, SET ROLE authenticated
  console.log('\n=== Test 2: Simulate PostgREST path exactly ===');
  const pgPostgREST = new Client({ connectionString: DB_URL });
  await pgPostgREST.connect();
  try {
    await pgPostgREST.query('BEGIN');
    // PostgREST does SET ROLE (not SET LOCAL)
    await pgPostgREST.query("SET ROLE authenticated");
    // Then sets the JWT claims
    await pgPostgREST.query(`SET request.jwt.claims = '{"app_metadata":{"research_role":"researcher"}}'`);
    
    const roleCheck = await pgPostgREST.query('SELECT current_user, session_user');
    console.log('  Roles:', roleCheck.rows[0]);
    
    const result = await pgPostgREST.query(
      `INSERT INTO research_claims (canonical_id, confidence, statement, ingestion_method) 
       VALUES ('PGRST-SIM-001', 'C1', 'PostgREST sim test', 'TEST') RETURNING id`
    );
    console.log('  DRAFT INSERT SUCCEEDED:', result.rows[0].id);
  } catch (e) {
    console.log('  DRAFT INSERT FAILED:', e.code, e.message);
  }
  await pgPostgREST.query('ROLLBACK');
  await pgPostgREST.end();

  // Test 3: What does PostgREST actually see? Check via a function
  console.log('\n=== Test 3: Create a debug function and call it via Supabase REST ===');
  // Create a function that tries to insert and reports what happens
  await pg.query(`
    CREATE OR REPLACE FUNCTION debug_rls_insert() RETURNS jsonb AS $$
    DECLARE
      result jsonb;
    BEGIN
      INSERT INTO research_claims (canonical_id, confidence, statement, ingestion_method) 
      VALUES ('DEBUG-FN-001', 'C1', 'Debug function test', 'TEST') 
      RETURNING jsonb_build_object('id', id, 'pub_status', publication_status) INTO result;
      RETURN result;
    EXCEPTION WHEN OTHERS THEN
      RETURN jsonb_build_object('error', SQLERRM, 'code', SQLSTATE);
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;
  `);

  // Call via service_role (bypasses RLS, function runs as owner)
  const { data: fnResult, error: fnError } = await adminClient.rpc('debug_rls_insert');
  console.log('  Function result:', fnResult, fnError);
  // Cleanup
  await pg.query(`DELETE FROM research_claims WHERE canonical_id = 'DEBUG-FN-001'`);
  await pg.query(`DROP FUNCTION debug_rls_insert()`);

  // Test 4: The REAL test - use the actual JWT from the researcher user
  console.log('\n=== Test 4: Get actual JWT and use it in direct SQL ===');
  // Clean up test user
  const { data: listUsers } = await adminClient.auth.admin.listUsers({ perPage: 200 });
  for (const u of listUsers?.users || []) {
    if (u.email === 'rls-realjwt@example.com') await adminClient.auth.admin.deleteUser(u.id).catch(() => {});
  }
  
  const { data: testUser } = await adminClient.auth.admin.createUser({
    email: 'rls-realjwt@example.com', password: 'password123', email_confirm: true,
    app_metadata: { research_role: 'researcher' },
  });
  
  const testClient = createClient(SUPABASE_URL, ANON_KEY, { auth: { persistSession: false } });
  const { error: signInErr } = await testClient.auth.signInWithPassword({
    email: 'rls-realjwt@example.com', password: 'password123',
  });
  if (signInErr) throw signInErr;

  // Get the actual session JWT
  const { data: session } = await testClient.auth.getSession();
  const jwt = session?.session?.access_token;
  console.log('  Got JWT, length:', jwt?.length);
  
  if (jwt) {
    // Decode JWT to see what's in it
    const payload = JSON.parse(Buffer.from(jwt.split('.')[1], 'base64url').toString());
    console.log('  JWT app_metadata:', JSON.stringify(payload.app_metadata));
    console.log('  JWT role:', payload.role);
    
    // Now use this REAL JWT in direct SQL
    const pgJwt = new Client({ connectionString: DB_URL });
    await pgJwt.connect();
    try {
      await pgJwt.query('BEGIN');
      await pgJwt.query("SET LOCAL role = 'authenticated'");
      await pgJwt.query(`SET LOCAL request.jwt.claims = '${jwt}'`);
      
      // Verify auth.jwt() returns correct value
      const jwtCheck = await pgJwt.query(`SELECT auth.jwt() -> 'app_metadata' ->> 'research_role' as role_val`);
      console.log('  auth.jwt() role via real JWT:', jwtCheck.rows[0].role_val);
      
      const result = await pgJwt.query(
        `INSERT INTO research_claims (canonical_id, confidence, statement, ingestion_method) 
         VALUES ('REAL-JWT-001', 'C1', 'Real JWT test', 'TEST') RETURNING id, publication_status`
      );
      console.log('  DRAFT INSERT SUCCEEDED:', result.rows[0]);
    } catch (e) {
      console.log('  DRAFT INSERT FAILED:', e.code, e.message);
    }
    await pgJwt.query('ROLLBACK');
    await pgJwt.end();
  }

  // Cleanup
  if (testUser?.user?.id) await adminClient.auth.admin.deleteUser(testUser.user.id);
  await pg.end();
}
main().catch(e => { console.error(e); process.exit(1); });
