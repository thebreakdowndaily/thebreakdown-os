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
      const countRes = await c.query('SELECT count(*) FROM public.ai_visibility_observations');
      console.log('Row count in ai_visibility_observations:', countRes.rows[0].count);

      const rlsRes = await c.query(
        "SELECT rowsecurity FROM pg_tables WHERE schemaname = 'public' AND tablename = 'ai_visibility_observations'"
      );
      console.log('RLS enabled on table:', rlsRes.rows[0].rowsecurity);

      const polRes = await c.query(
        "SELECT policyname, cmd FROM pg_policies WHERE schemaname = 'public' AND tablename = 'ai_visibility_observations'"
      );
      console.log('Active policies:', polRes.rows.map(p => `${p.policyname} (${p.cmd})`));
    } else {
      console.log('PENDING: Migration 017 file exists on disk, but has NOT yet been applied to the database.');
    }
  } catch (err) {
    console.log('DB_CONNECT_ERROR:', err.message);
  } finally {
    try { await c.end(); } catch {}
  }
})();
