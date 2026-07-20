const {Client} = require('pg');
const {createClient} = require('@supabase/supabase-js');
const DB_URL = 'postgresql://postgres:Ntn%40supabase403@db.swektehukscmsgxdzymw.supabase.co:5432/postgres';
const SUPABASE_URL = 'https://swektehukscmsgxdzymw.supabase.co';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN3ZWt0ZWh1a3NjbXNneGR6eW13Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ0NzQ3ODQsImV4cCI6MjEwMDA1MDc4NH0.nUuW161KEAIGG98sjbhpvX3J-P-fZxVCVJaMBpQQXNo';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN3ZWt0ZWh1a3NjbXNneGR6eW13Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NDQ3NDc4NCwiZXhwIjoyMTAwMDUwNzg0fQ.2Yf2PnE8wIh4ynTWAq8jp0hUo3jpgqdnBMv3MDwC6K4';

async function main() {
  const pg = new Client({ connectionString: DB_URL });
  await pg.connect();

  // Create a helper function to check JWT from Supabase client
  await pg.query(`
    CREATE OR REPLACE FUNCTION public.check_jwt() RETURNS jsonb AS $$
      SELECT auth.jwt();
    $$ LANGUAGE sql SECURITY DEFINER STABLE;
  `);

  // Recreate test user
  const adminClient = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { autoRefreshToken: false, persistSession: false } });
  
  // Delete stale user
  const { data: listUsers } = await adminClient.auth.admin.listUsers({ perPage: 200 });
  for (const u of listUsers?.users || []) {
    if (u.email === 'diag-test@example.com') {
      await adminClient.auth.admin.deleteUser(u.id).catch(() => {});
    }
  }

  const { data: user, error: createErr } = await adminClient.auth.admin.createUser({
    email: 'diag-test@example.com',
    password: 'password123',
    email_confirm: true,
    app_metadata: { research_role: 'researcher' },
  });
  if (createErr) throw createErr;
  console.log('User created:', user.user.id);

  // Sign in
  const resClient = createClient(SUPABASE_URL, ANON_KEY, { auth: { persistSession: false } });
  const { error: signInErr } = await resClient.auth.signInWithPassword({
    email: 'diag-test@example.com',
    password: 'password123',
  });
  if (signInErr) throw signInErr;
  console.log('Signed in successfully');

  // Test 1: Check JWT via RPC
  const { data: jwtData, error: jwtErr } = await resClient.rpc('check_jwt');
  console.log('\n=== Test 1: auth.jwt() via RPC ===');
  console.log('  JWT:', JSON.stringify(jwtData));
  console.log('  Error:', jwtErr?.message || 'none');

  // Test 2: DRAFT insert (no explicit status)
  const { data: d2, error: e2 } = await resClient.from('research_claims').insert({
    canonical_id: 'DIAG2-001',
    confidence: 'C1',
    statement: 'Draft insert default',
    ingestion_method: 'TEST',
  }).select();
  console.log('\n=== Test 2: DRAFT insert (defaults) ===');
  console.log('  Error:', JSON.stringify(e2));
  console.log('  Data:', JSON.stringify(d2));

  // Test 3: DRAFT insert (explicit)
  const { data: d3, error: e3 } = await resClient.from('research_claims').insert({
    canonical_id: 'DIAG2-002',
    confidence: 'C1',
    statement: 'Draft insert explicit',
    ingestion_method: 'TEST',
    publication_status: 'DRAFT',
    human_review_status: 'UNREVIEWED',
  }).select();
  console.log('\n=== Test 3: DRAFT insert (explicit DRAFT + UNREVIEWED) ===');
  console.log('  Error:', JSON.stringify(e3));
  console.log('  Data:', JSON.stringify(d3));

  // Test 4: PUBLISHED insert
  const { data: d4, error: e4 } = await resClient.from('research_claims').insert({
    canonical_id: 'DIAG2-003',
    confidence: 'C1',
    statement: 'Published insert',
    ingestion_method: 'TEST',
    publication_status: 'PUBLISHED',
    human_review_status: 'APPROVED',
    published_at: new Date().toISOString(),
  }).select();
  console.log('\n=== Test 4: PUBLISHED insert ===');
  console.log('  Error:', JSON.stringify(e4));
  console.log('  Data:', JSON.stringify(d4));

  // Test 5: RLS via direct SQL simulation
  console.log('\n=== Test 5: Direct SQL with SET ROLE ===');
  try {
    await pg.query('BEGIN');
    await pg.query("SET LOCAL role = 'authenticated'");
    await pg.query(`SET LOCAL request.jwt.claims = '{"app_metadata":{"research_role":"researcher"}}'`);
    const insertResult = await pg.query(
      `INSERT INTO research_claims (canonical_id, confidence, statement, ingestion_method) VALUES ('DIAG2-004', 'C1', 'Direct SQL test', 'TEST') RETURNING id`
    );
    console.log('  Direct SQL insert SUCCEEDED:', insertResult.rows[0].id);
    await pg.query('ROLLBACK');
  } catch (e) {
    console.log('  Direct SQL insert FAILED:', e.message);
    await pg.query('ROLLBACK');
  }

  // Test 6: Check what auth.jwt() returns via direct SQL with SET ROLE
  console.log('\n=== Test 6: auth.jwt() via direct SQL ===');
  try {
    await pg.query('BEGIN');
    await pg.query("SET LOCAL role = 'authenticated'");
    await pg.query(`SET LOCAL request.jwt.claims = '{"app_metadata":{"research_role":"researcher"}}'`);
    const jwtResult = await pg.query("SELECT auth.jwt() as jwt");
    console.log('  auth.jwt():', JSON.stringify(jwtResult.rows[0].jwt));
    await pg.query('ROLLBACK');
  } catch (e) {
    console.log('  Error:', e.message);
    await pg.query('ROLLBACK');
  }

  // Cleanup
  if (user?.user?.id) {
    await adminClient.auth.admin.deleteUser(user.user.id);
  }
  await pg.query('DROP FUNCTION IF EXISTS public.check_jwt()');
  await pg.end();
}
main().catch(e => { console.error(e); process.exit(1); });
