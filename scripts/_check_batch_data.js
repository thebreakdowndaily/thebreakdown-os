const { Client } = require('pg');
require('dotenv').config({ path: '.env.test' });

(async () => {
  const c = new Client({
    connectionString: process.env.TEST_DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
  await c.connect();

  const tables = [
    'research_constituencies', 'research_sources', 'research_evidence_items',
    'research_claims', 'research_financial_records',
    'research_claim_evidence_relationships', 'research_claim_subject_relationships'
  ];

  for (const t of tables) {
    const r = await c.query(`SELECT count(*) as cnt, ingestion_method FROM ${t} GROUP BY ingestion_method`);
    console.log(`${t}:`);
    for (const row of r.rows) {
      console.log('  ', row.ingestion_method || 'NULL', ':', row.cnt);
    }
  }

  await c.end();
})().catch(e => { console.error('ERROR:', e.message); process.exit(1); });
