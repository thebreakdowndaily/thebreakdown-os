const { Client } = require('pg');
require('dotenv').config({ path: '.env.test' });

(async () => {
  const c = new Client({ connectionString: process.env.TEST_DATABASE_URL, ssl: { rejectUnauthorized: false } });
  await c.connect();

  // Find the orphaned published claims
  const r = await c.query(`
    SELECT c.canonical_id, c.statement, c.publication_status, c.ingestion_method
    FROM research_claims c
    WHERE c.publication_status = 'PUBLISHED'
    AND NOT EXISTS (
      SELECT 1 FROM research_claim_evidence_relationships cer WHERE cer.claim_id = c.id
    )
  `);
  console.log('Orphaned published claims (' + r.rows.length + '):');
  for (const row of r.rows) {
    console.log('  ' + row.canonical_id + ' [' + row.ingestion_method + '] pub_status=' + row.publication_status);
    console.log('    Statement: ' + row.statement.substring(0, 120));
  }

  // Also check: are there TEST claims with PUBLISHED status?
  const testPublished = await c.query(`
    SELECT canonical_id, publication_status, ingestion_method
    FROM research_claims WHERE ingestion_method = 'TEST' AND publication_status = 'PUBLISHED'
  `);
  console.log('\nTEST claims with PUBLISHED status:', testPublished.rows.length);
  for (const row of testPublished.rows) {
    console.log('  ' + row.canonical_id + ': ' + row.publication_status);
  }

  await c.end();
})().catch(e => { console.error('ERROR:', e.message); process.exit(1); });
