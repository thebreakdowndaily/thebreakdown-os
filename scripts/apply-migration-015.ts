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

const connStr = process.env.TEST_DATABASE_URL || '';
const migrationPath = path.resolve(process.cwd(), 'supabase/migrations/015_enable_rls_and_consolidate_roles.sql');
const migrationSql = fs.readFileSync(migrationPath, 'utf8');

async function applyMigration() {
  console.log('Connecting to remote Supabase database...');
  const client = new Client({
    connectionString: connStr,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 10000,
  });

  await client.connect();
  console.log('✅ Connected successfully to remote database!');

  console.log('Applying migration 015_enable_rls_and_consolidate_roles.sql...');
  const parts = migrationSql.split('-- COMMIT_SPLIT').map(p => p.trim()).filter(Boolean);

  for (let i = 0; i < parts.length; i++) {
    console.log(`Executing migration part ${i + 1}/${parts.length}...`);
    await client.query(parts[i]);
  }

  console.log('✅ Migration 015 successfully applied to remote Supabase project!');

  // Verify created artifacts
  const tableCheck = await client.query(`
    SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_roles') as has_user_roles;
  `);
  console.log('Verified user_roles table exists:', tableCheck.rows[0].has_user_roles);

  const polCount = await client.query(`
    SELECT count(*)::int as count FROM pg_policies WHERE schemaname = 'public';
  `);
  console.log('Verified active policies in public schema:', polCount.rows[0].count);

  const fnCheck = await client.query(`
    SELECT proname FROM pg_proc WHERE proname IN ('current_app_role', 'is_staff', 'is_editor', 'is_admin');
  `);
  console.log('Verified helper functions exist:', fnCheck.rows.map(r => r.proname));

  // Reload PostgREST schema cache
  await client.query("NOTIFY pgrst, 'reload schema'").catch(() => {});
  console.log('Notified PostgREST to reload schema cache.');

  await client.end();
}

applyMigration().catch((err) => {
  console.error('❌ Migration failed:', err);
  process.exit(1);
});
