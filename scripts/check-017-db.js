require('dotenv').config({ path: '.env.local' });
require('dotenv').config({ path: '.env.test' });
const { Client } = require('pg');

const url = process.env.TEST_DATABASE_URL || process.env.DATABASE_URL;

(async () => {
  if (!url) {
    console.log('NO_DB_URL: Database URL not found in environment.');
    return;
  }
  const c = new Client({
    connectionString: url,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 5000,
  });

  try {
    await c.connect();
    const res = await c.query(
      "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'ai_visibility_observations'"
    );
    if (res.rows.length > 0) {
      console.log('DEPLOYED: Table ai_visibility_observations exists in database.');
    } else {
      console.log('PENDING: Migration 017 file exists on disk, but has NOT yet been applied to the database.');
    }
  } catch (err) {
    console.log('DB_CONNECT_ERROR:', err.message);
  } finally {
    try { await c.end(); } catch {}
  }
})();
