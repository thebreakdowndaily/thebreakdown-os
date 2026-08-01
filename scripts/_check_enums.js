const { Client } = require('pg');
require('dotenv').config({ path: '.env.test' });

(async () => {
  const c = new Client({ connectionString: process.env.TEST_DATABASE_URL, ssl: { rejectUnauthorized: false } });
  await c.connect();

  // All enum types and their values (one row per enum value)
  const enums = await c.query(`
    SELECT t.typname, e.enumlabel, e.enumsortorder
    FROM pg_type t
    JOIN pg_enum e ON t.oid = e.enumtypid
    ORDER BY t.typname, e.enumsortorder
  `);
  let currentType = '';
  console.log('ALL ENUMS:');
  for (const r of enums.rows) {
    if (r.typname !== currentType) {
      if (currentType) console.log('');
      currentType = r.typname;
      process.stdout.write('  ' + r.typname + ': [');
    } else {
      process.stdout.write(', ');
    }
    process.stdout.write(r.enumlabel);
  }
  console.log(']');

  // RLS policies on claim_evidence
  const policies = await c.query("SELECT policyname, cmd, roles, qual FROM pg_policies WHERE tablename = 'research_claim_evidence_relationships'");
  console.log('\n\nRLS POLICIES on research_claim_evidence_relationships:');
  for (const r of policies.rows) {
    console.log('  ' + r.policyname + ' (' + r.cmd + '): roles=' + JSON.stringify(r.roles));
  }

  // Check what the service role key grants
  const grants = await c.query("SELECT grantee, privilege_type FROM information_schema.role_table_grants WHERE table_name='research_claim_evidence_relationships' ORDER BY grantee");
  console.log('\nGRANTS on research_claim_evidence_relationships:');
  for (const r of grants.rows) {
    console.log('  ' + r.grantee + ': ' + r.privilege_type);
  }

  await c.end();
})().catch(e => { console.error('ERROR:', e.message); process.exit(1); });
