// Run migration SQL via Supabase REST API (needs service_role key)
// Usage: node scripts/supabase-migrate.js <service-role-key>

const fs = require('fs');
const path = require('path');

const projectRef = 'lvfovvidtowadmnggzzf';
const sql = fs.readFileSync(path.resolve(__dirname, '..', 'supabase', 'migrations', '001_create_tables.sql'), 'utf-8');
const key = process.argv[2];

if (!key) {
  console.log('Need service_role key. Get it from:');
  console.log('  Supabase Dashboard → Settings → API → service_role key');
  console.log('');
  console.log('Usage: node scripts/supabase-migrate.js <service-role-key>');
  process.exit(1);
}

async function run() {
  const url = `https://${projectRef}.supabase.co/rest/v1/rpc/pg_query`;
  const resp = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': key,
      'Authorization': `Bearer ${key}`,
    },
    body: JSON.stringify({ query: sql }),
  });
  const text = await resp.text();
  if (resp.ok) {
    console.log('Migration applied successfully!');
    console.log(text.slice(0, 500));
  } else {
    console.error('Failed:', resp.status, text);
    console.log('');
    console.log('Alternative: Open Supabase Dashboard → SQL Editor, paste and run:');
    console.log('  supabase/migrations/001_create_tables.sql');
  }
}

run().catch(console.error);
