const {Client} = require('pg');
const {createClient} = require('@supabase/supabase-js');
const DB_URL = 'postgresql://postgres:Ntn%40supabase403@db.swektehukscmsgxdzymw.supabase.co:5432/postgres';
const SUPABASE_URL = 'https://swektehukscmsgxdzymw.supabase.co';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN3ZWt0ZWh1a3NjbXNneGR6eW13Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ0NzQ3ODQsImV4cCI6MjEwMDA1MDc4NH0.nUuW161KEAIGG98sjbhpvX3J-P-fZxVCVJaMBpQQXNo';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN3ZWt0ZWh1a3NjbXNneGR6eW13Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NDQ3NDc4NCwiZXhwIjoyMTAwMDUwNzg0fQ.2Yf2PnE8wIh4ynTWAq8jp0hUo3jpgqdnBMv3MDwC6K4';

async function main() {
  const pg = new Client({ connectionString: DB_URL });
  await pg.connect();

  // 1. Check RLS policies on research_claims
  const policies = await pg.query(
    "SELECT polname, polcmd, polqual::text, polwithcheck::text FROM pg_policy WHERE polrelid = 'research_claims'::regclass ORDER BY polname"
  );
  console.log('=== RLS Policies on research_claims ===');
  for (const p of policies.rows) {
    console.log(`  ${p.polname}: cmd=${p.polcmd} qual=${(p.polqual||'').substring(0,100)} withcheck=${(p.polwithcheck||'').substring(0,100)}`);
  }

  // 2. Check grants
  const grants = await pg.query(
    "SELECT grantee, privilege_type FROM information_schema.role_table_grants WHERE table_name = 'research_claims' AND table_schema = 'public'"
  );
  console.log('\n=== Grants on research_claims ===');
  for (const g of grants.rows) {
    console.log(`  ${g.grantee}: ${g.privilege_type}`);
  }

  // 3. Check Supabase roles
  const roles = await pg.query(
    "SELECT rolname FROM pg_roles WHERE rolname IN ('anon','authenticated','service_role')"
  );
  console.log('\n=== Supabase roles ===');
  for (const r of roles.rows) {
    console.log(`  ${r.rolname}`);
  }

  // 4. Check table owner
  const owner = await pg.query(
    "SELECT tableowner FROM pg_tables WHERE tablename = 'research_claims' AND schemaname = 'public'"
  );
  console.log(`\n=== Table owner: ${owner.rows[0]?.tableowner}`);

  // 5. Check if RLS is actually enabled
  const rls = await pg.query(
    "SELECT relrowsecurity, relforcerowsecurity FROM pg_class WHERE relname = 'research_claims'"
  );
  console.log(`=== RLS enabled: ${rls.rows[0]?.relrowsecurity}, forced: ${rls.rows[0]?.relforcerowsecurity}`);

  // 6. Try insert via Supabase as researcher
  const adminClient = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { autoRefreshToken: false, persistSession: false } });

  // Create test researcher
  const { data: user } = await adminClient.auth.admin.createUser({
    email: 'diag-test@example.com',
    password: 'password123',
    email_confirm: true,
    app_metadata: { research_role: 'researcher' },
  });

  const resClient = createClient(SUPABASE_URL, ANON_KEY, { auth: { persistSession: false } });
  const { error: signInErr } = await resClient.auth.signInWithPassword({
    email: 'diag-test@example.com',
    password: 'password123',
  });
  console.log(`\n=== Sign-in error: ${signInErr?.message || 'none'}`);

  // Try insert
  const { data, error } = await resClient.from('research_claims').insert({
    canonical_id: 'DIAG-001',
    confidence: 'C1',
    statement: 'Diagnostic insert',
    ingestion_method: 'TEST',
  }).select();
  console.log(`=== Insert error: ${JSON.stringify(error)}`);
  console.log(`=== Insert data: ${JSON.stringify(data)}`);

  // Try insert with PUBLISHED status
  const { data: d2, error: e2 } = await resClient.from('research_claims').insert({
    canonical_id: 'DIAG-002',
    confidence: 'C1',
    statement: 'Diagnostic insert PUBLISHED',
    ingestion_method: 'TEST',
    publication_status: 'PUBLISHED',
    human_review_status: 'APPROVED',
    published_at: new Date().toISOString(),
  }).select();
  console.log(`=== Insert PUBLISHED error: ${JSON.stringify(e2)}`);
  console.log(`=== Insert PUBLISHED data: ${JSON.stringify(d2)}`);

  // Cleanup
  if (user?.user?.id) {
    await adminClient.auth.admin.deleteUser(user.user.id);
  }

  await pg.end();
}
main().catch(e => { console.error(e); process.exit(1); });
