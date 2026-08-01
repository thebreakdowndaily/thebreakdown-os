require('dotenv').config({ path: '.env.test' });
const { Client } = require('pg');
(async () => {
  const c = new Client({ connectionString: process.env.TEST_DATABASE_URL, ssl: { rejectUnauthorized: false } });
  await c.connect();

  console.log('=== BATCH 1 DATA DUMP ===\n');

  // Constituencies
  const consts = await c.query("SELECT canonical_id, name, created_at, ingestion_method FROM research_constituencies WHERE canonical_id NOT LIKE 'TEST-%' ORDER BY canonical_id");
  console.log('CONSTITUENCIES (' + consts.rows.length + '):');
  consts.rows.forEach(r => console.log('  ' + r.canonical_id + ' — ' + r.name));
  console.log('');

  // Claims
  const claims = await c.query("SELECT canonical_id, statement, confidence, human_review_status FROM research_claims WHERE ingestion_method = 'PROD-12CONSTITUENCY-CONTROLLED' ORDER BY canonical_id");
  console.log('CLAIMS (' + claims.rows.length + '):');
  claims.rows.forEach(r => {
    console.log('  ' + r.canonical_id + ' [' + r.confidence + '/' + r.human_review_status + ']');
    console.log('    ' + r.statement.substring(0, 120) + (r.statement.length > 120 ? '...' : ''));
  });
  console.log('');

  // Sources
  const sources = await c.query("SELECT title, source_type, ingestion_method FROM research_sources WHERE ingestion_method = 'PROD-12CONSTITUENCY-CONTROLLED' ORDER BY title");
  console.log('SOURCES (' + sources.rows.length + '):');
  sources.rows.forEach(r => console.log('  ' + r.title + ' [' + r.source_type + ']'));
  console.log('');

  // Financial
  const financial = await c.query("SELECT canonical_id, amount, amount_status FROM research_financial_records WHERE ingestion_method = 'PROD-12CONSTITUENCY-CONTROLLED' ORDER BY canonical_id");
  console.log('FINANCIAL RECORDS (' + financial.rows.length + '):');
  financial.rows.forEach(r => console.log('  ' + r.canonical_id + ' — ₹' + r.amount + ' [' + r.amount_status + ']'));

  await c.end();
})().catch(e => { console.error(e.message); process.exit(1); });