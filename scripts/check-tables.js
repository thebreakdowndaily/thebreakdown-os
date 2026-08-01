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
  const res = await client.query("SELECT tablename FROM pg_tables WHERE schemaname='public'");
  console.log(res.rows.map(r => r.tablename));
  await client.end();
}
run();
