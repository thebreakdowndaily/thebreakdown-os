import { Client } from 'pg';
import * as fs from 'fs';
import * as path from 'path';

// Load .env.local and .env.test if present
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
  if (!dbUrl) {
    throw new Error('Missing TEST_DATABASE_URL or DATABASE_URL in environment');
  }

  console.log('Connecting to PostgreSQL database...');
  const client = new Client({
    connectionString: dbUrl,
    ssl: { rejectUnauthorized: false }
  });
  await client.connect();

  console.log('Checking required helper functions...');
  const funcCheck = await client.query(`
    SELECT proname, pronamespace::regnamespace::text as schema
    FROM pg_proc 
    WHERE proname IN ('is_staff', 'is_editor', 'is_admin');
  `);
  console.log('Found helper functions:', funcCheck.rows);

  console.log('Applying Migration 017 (017_geo_measurement_schema.sql)...');
  const sqlPath = path.resolve(process.cwd(), 'supabase/migrations/017_geo_measurement_schema.sql');
  const sql = fs.readFileSync(sqlPath, 'utf8');

  await client.query(sql);
  console.log('Migration 017 executed successfully!');

  // Verify Table
  const tableCheck = await client.query(`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'ai_visibility_observations';
  `);
  console.log('Table existence in public schema:', tableCheck.rows.map(r => r.table_name));

  // Verify Columns
  const cols = await client.query(`
    SELECT column_name, data_type, is_nullable
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'ai_visibility_observations'
    ORDER BY ordinal_position;
  `);
  console.log(`Verified ${cols.rows.length} columns in ai_visibility_observations:`);
  cols.rows.forEach(c => console.log(`  - ${c.column_name}: ${c.data_type} (nullable: ${c.is_nullable})`));

  // Verify Indexes
  const indexes = await client.query(`
    SELECT indexname, indexdef
    FROM pg_indexes
    WHERE schemaname = 'public' AND tablename = 'ai_visibility_observations';
  `);
  console.log(`Verified ${indexes.rows.length} indexes:`);
  indexes.rows.forEach(i => console.log(`  - ${i.indexname}`));

  // Verify RLS Policies
  const policies = await client.query(`
    SELECT policyname, permissive, roles, cmd, qual
    FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'ai_visibility_observations';
  `);
  console.log(`Verified ${policies.rows.length} RLS policies:`);
  policies.rows.forEach(p => console.log(`  - ${p.policyname} (${p.cmd})`));

  // Smoke Test: Insert, Query, Delete
  console.log('\nRunning database insertion/read smoke test...');
  const testIdQuery = await client.query(`
    INSERT INTO public.ai_visibility_observations (
      engine, query, query_id, story_id, mentioned, cited, answer_accuracy, notes, observer
    ) VALUES (
      'perplexity', 'test query for migration 017 verification', 'TEST-MIG-017', 'mgnrega-reform', true, true, 4, 'Smoke test entry', 'automated-verification'
    ) RETURNING id, engine, query, observed_at, created_at;
  `);
  const inserted = testIdQuery.rows[0];
  console.log('Inserted test observation:', inserted);

  // Read back
  const readCheck = await client.query(
    'SELECT id, engine, query, mentioned, cited FROM public.ai_visibility_observations WHERE id = $1',
    [inserted.id]
  );
  console.log('Read back test observation:', readCheck.rows[0]);

  // Clean up test row
  await client.query('DELETE FROM public.ai_visibility_observations WHERE id = $1', [inserted.id]);
  console.log('Cleaned up test observation row.');

  await client.end();
  console.log('\nMigration 017 deployment and smoke test completed successfully.');
}

main().catch((err) => {
  console.error('Error applying migration 017:', err);
  process.exit(1);
});
