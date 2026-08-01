const { Client } = require('pg');
const fs = require('fs');
async function run() {
  const envContent = fs.readFileSync('.env.test', 'utf8');
  const env = {};
  for (const line of envContent.split('\n')) {
    if (line.trim() && !line.startsWith('#')) {
      const parts = line.split('=');
      if (parts.length >= 2) {
        env[parts[0].trim()] = parts.slice(1).join('=').trim().replace(/^["']|["']$/g, '');
      }
    }
  }

  const client = new Client({ connectionString: env.TEST_DATABASE_URL });
  await client.connect();
  try {
      await client.query("DROP TYPE IF EXISTS research_gap_status_type CASCADE;");
      await client.query(fs.readFileSync('supabase/migrations/005_research_gap_schema.sql', 'utf8'));
      console.log('005 applied');
  } catch(e) {
      console.error('Error applying 005:', e);
  }
  await client.end();
}
run();
