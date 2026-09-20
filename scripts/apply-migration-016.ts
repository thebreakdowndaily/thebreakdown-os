import { Client } from 'pg';
import * as fs from 'fs';
import * as path from 'path';

// Parse .env.local
const envContent = fs.readFileSync(path.resolve(process.cwd(), '.env.local'), 'utf8');
envContent.split('\n').forEach((line) => {
  const trimmed = line.trim();
  if (trimmed && !trimmed.startsWith('#')) {
    const [key, ...vals] = trimmed.split('=');
    if (key && vals.length > 0 && !process.env[key.trim()]) {
      process.env[key.trim()] = vals.join('=').trim().replace(/^['"]|['"]$/g, '');
    }
  }
});

async function main() {
  const dbUrl = process.env.TEST_DATABASE_URL || process.env.DATABASE_URL;
  if (!dbUrl) {
    throw new Error('Missing TEST_DATABASE_URL or DATABASE_URL');
  }

  console.log('Applying Migration 016 to remote PostgreSQL...');
  const client = new Client({ connectionString: dbUrl, ssl: { rejectUnauthorized: false } });
  await client.connect();

  const sqlPath = path.resolve(process.cwd(), 'supabase/migrations/016_api_keys_and_rate_limiting.sql');
  const sql = fs.readFileSync(sqlPath, 'utf8');

  await client.query(sql);
  console.log('Migration 016 applied successfully!');

  // Verify table existence
  const tables = await client.query(`
    SELECT table_name FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name IN ('api_keys', 'rate_limit_buckets');
  `);
  console.log('Verified tables in public:', tables.rows.map(r => r.table_name));

  // Verify function existence
  const funcs = await client.query(`
    SELECT proname FROM pg_proc WHERE proname = 'increment_rate_limit';
  `);
  console.log('Verified function:', funcs.rows.map(r => r.proname));

  await client.end();
}

main().catch((err) => {
  console.error('Error applying migration 016:', err);
  process.exit(1);
});
