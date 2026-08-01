// Quick check script
require('dotenv').config({ path: '.env.test' });
const { Client } = require('pg');
(async () => {
  const c = new Client({ connectionString: process.env.TEST_DATABASE_URL, ssl: { rejectUnauthorized: false } });
  await c.connect();
  const cols = await c.query(`SELECT column_name FROM information_schema.columns WHERE table_name = 'research_sources' ORDER BY ordinal_position`);
  console.log('Sources columns:');
  cols.rows.forEach(r => console.log('  ' + r.column_name));
  await c.end();
})().catch(e => console.error(e.message));