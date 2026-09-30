import pg from 'pg';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function audit() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.log('No DATABASE_URL found in .env.local');
    return;
  }
  const client = new pg.Client({
    connectionString: dbUrl,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();
    const runs = await client.query('SELECT * FROM radar_pipeline_runs ORDER BY generated_at DESC LIMIT 5');
    const health = await client.query('SELECT * FROM radar_source_health');
    const fingerprints = await client.query('SELECT count(*) FROM radar_content_fingerprints');
    const locks = await client.query('SELECT * FROM radar_poll_locks');

    console.log('RUNS_COUNT:', runs.rows.length);
    if (runs.rows.length > 0) {
      console.log('LATEST_RUN:', JSON.stringify(runs.rows[0], null, 2));
    }
    console.log('HEALTH_COUNT:', health.rows.length);
    console.log('HEALTH_SAMPLES:', health.rows.slice(0, 5).map(r => ({ id: r.source_id, status: r.status, totalFetches: r.total_fetches, consecutiveFailures: r.consecutive_failures })));
    console.log('FINGERPRINTS_COUNT:', fingerprints.rows[0].count);
    console.log('LOCKS:', locks.rows);
  } catch (err) {
    console.error('Audit query error:', err);
  } finally {
    await client.end();
  }
}

audit();
