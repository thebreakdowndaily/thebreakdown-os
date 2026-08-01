const { Client } = require('pg');
require('dotenv').config({ path: '.env.test' });

(async () => {
  const c = new Client({ connectionString: process.env.TEST_DATABASE_URL, ssl: { rejectUnauthorized: false } });
  await c.connect();

  // Check all claims and their ingestion_methods
  const r = await c.query("SELECT canonical_id, ingestion_method FROM research_claims ORDER BY ingestion_method, canonical_id");
  console.log('ALL claims (' + r.rows.length + '):');
  let lastMethod = '';
  for (const row of r.rows) {
    if (row.ingestion_method !== lastMethod) {
      console.log('\n  [' + (row.ingestion_method || 'NULL') + ']');
      lastMethod = row.ingestion_method;
    }
    console.log('    ' + row.canonical_id);
  }

  // Check counts by ingestion_method
  const r2 = await c.query("SELECT ingestion_method, count(*) as cnt FROM research_claims GROUP BY ingestion_method ORDER BY ingestion_method");
  console.log('\nClaims by ingestion_method:');
  for (const row of r2.rows) {
    console.log('  ' + (row.ingestion_method || 'NULL') + ': ' + row.cnt);
  }

  await c.end();
})().catch(e => { console.error('ERROR:', e.message); process.exit(1); });
