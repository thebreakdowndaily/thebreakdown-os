require('dotenv').config({ path: '.env.test' });
const { Client } = require('pg');
(async () => {
  const c = new Client({ connectionString: process.env.TEST_DATABASE_URL, ssl: { rejectUnauthorized: false } });
  await c.connect();

  // Check financial_records columns
  const cols = await c.query(`SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_name = 'research_financial_records' ORDER BY ordinal_position`);
  console.log('Financial_records columns:');
  cols.rows.forEach(r => console.log('  ' + r.column_name + ' (' + r.data_type + ', nullable=' + r.is_nullable + ')'));

  // Check financial_records rows
  const financial = await c.query("SELECT * FROM research_financial_records ORDER BY canonical_id");
  console.log('\nFinancial_records (' + financial.rows.length + '):');
  financial.rows.forEach(r => {
    console.log('  ' + r.canonical_id);
    Object.keys(r).forEach(k => {
      if (k !== 'id' && k !== 'canonical_id' && k !== 'ingestion_method' && k !== 'created_at' && k !== 'created_by_user_id') {
        console.log('    ' + k + ': ' + (r[k] !== null ? r[k] : 'NULL'));
      }
    });
  });

  await c.end();
})().catch(e => { console.error(e.message); process.exit(1); });