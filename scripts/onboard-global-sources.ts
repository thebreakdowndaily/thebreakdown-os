import pg from 'pg';
import * as dotenv from 'dotenv';
import { ALL_GLOBAL_RADAR_SOURCES } from '../data/radar/sources-global';

dotenv.config({ path: '.env.local' });

async function onboard() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error('Missing DATABASE_URL');
    process.exit(1);
  }

  const client = new pg.Client({
    connectionString: dbUrl,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();
    console.log(`Connected. Registering ${ALL_GLOBAL_RADAR_SOURCES.length} configured sources into PostgreSQL...`);

    let inserted = 0;
    for (const src of ALL_GLOBAL_RADAR_SOURCES) {
      const res = await client.query(
        `INSERT INTO radar_source_health (
          source_id, status, consecutive_failures, total_fetches, 
          schedule_state, next_eligible_poll_at, updated_at
        ) VALUES ($1, 'healthy', 0, 0, 'READY', NOW(), NOW())
        ON CONFLICT (source_id) DO NOTHING`,
        [src.id]
      );
      if ((res.rowCount ?? 0) > 0) inserted++;
    }

    console.log(`Registered ${inserted} new sources (Total configured: ${ALL_GLOBAL_RADAR_SOURCES.length}).`);
    const countRes = await client.query('SELECT count(*) FROM radar_source_health');
    console.log(`Total active registered sensors in radar_source_health: ${countRes.rows[0].count}`);
  } catch (err) {
    console.error('Error onboarding sources:', err);
  } finally {
    await client.end();
  }
}

onboard();
