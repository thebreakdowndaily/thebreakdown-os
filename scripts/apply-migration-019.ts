import { Client } from 'pg';
import * as fs from 'fs';
import * as path from 'path';

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

async function main() {
  const dbUrl = process.env.TEST_DATABASE_URL || process.env.DATABASE_URL;
  if (!dbUrl) throw new Error('Missing database connection URL');

  console.log('Connecting to PostgreSQL database...');
  const client = new Client({ connectionString: dbUrl, ssl: { rejectUnauthorized: false } });
  await client.connect();

  console.log('Applying Migration 019 (019_geo_diagnostic_attribution.sql)...');
  const sqlPath = path.resolve(process.cwd(), 'supabase/migrations/019_geo_diagnostic_attribution.sql');
  const sql = fs.readFileSync(sqlPath, 'utf8');
  await client.query(sql);
  console.log('Migration 019 executed successfully!');

  // Verify Columns
  const cols = await client.query(`
    SELECT column_name, data_type, is_nullable
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'ai_visibility_observations'
    ORDER BY ordinal_position;
  `);
  console.log(`Verified ${cols.rows.length} columns in ai_visibility_observations:`);
  console.log('Columns list:', cols.rows.map(c => c.column_name).join(', '));

  // Verify Rows
  const rowsRes = await client.query(`
    SELECT id, query_id, engine, observation_state, answer_present, answer_accuracy, failure_classification
    FROM public.ai_visibility_observations
    ORDER BY query_id ASC;
  `);
  console.log(`\nVerified ${rowsRes.rows.length} canonical observation rows after migration 019:`);
  console.table(rowsRes.rows);

  await client.end();
}

main().catch((err) => {
  console.error('Error applying migration 019:', err);
  process.exit(1);
});
