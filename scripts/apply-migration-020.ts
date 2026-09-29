import { Client } from 'pg';
import * as fs from 'fs';
import * as path from 'path';

function loadEnv() {
  for (const envFile of ['.env.local', '.env.test']) {
    const fullPath = path.resolve(process.cwd(), envFile);
    if (fs.existsSync(fullPath)) {
      const envContent = fs.readFileSync(fullPath, 'utf8');
      envContent.split('\n').forEach((line) => {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#')) {
          const [key, ...vals] = trimmed.split('=');
          if (key && vals.length > 0 && !process.env[key.trim()]) {
            process.env[key.trim()] = vals.join('=').trim().replace(/^['"]|['"]$/g, '');
          }
        }
      });
    }
  }
}

async function main() {
  loadEnv();
  const dbUrl = process.env.TEST_DATABASE_URL || process.env.DATABASE_URL;
  if (!dbUrl) throw new Error('Missing database connection URL in environment');

  const client = new Client({ connectionString: dbUrl, ssl: { rejectUnauthorized: false } });
  await client.connect();

  console.log('Connecting to remote Supabase to apply Migration 020...');
  const migrationPath = path.resolve(process.cwd(), 'supabase/migrations/020_geo_evidence_attribution.sql');
  const sql = fs.readFileSync(migrationPath, 'utf8');

  await client.query(sql);
  console.log('Migration 020 successfully applied!');

  // Verify table
  const res = await client.query(`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'geo_evidence_assessments'
    ORDER BY ordinal_position;
  `);

  console.log(`Table public.geo_evidence_assessments created with ${res.rows.length} columns.`);
  console.table(res.rows);

  await client.end();
}

main().catch(console.error);
