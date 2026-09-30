import pg from 'pg';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function applyMigrations() {
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
    console.log('Connected to Supabase PostgreSQL database.');

    const migrationFiles = [
      'supabase/migrations/20250929_radar_tables.sql',
      'supabase/migrations/20250929_radar_v2_operational.sql',
    ];

    for (const file of migrationFiles) {
      console.log(`Applying migration: ${file}`);
      const sql = fs.readFileSync(path.resolve(file), 'utf-8');
      await client.query(sql);
      console.log(`Successfully applied: ${file}`);
    }

    console.log('All radar migrations applied successfully.');
  } catch (err) {
    console.error('Error applying migrations:', err);
    process.exit(1);
  } finally {
    await client.end();
  }
}

applyMigrations();
