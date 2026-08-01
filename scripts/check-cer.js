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
    const res = await client.query("SELECT * FROM research_claim_evidence_relationships LIMIT 1");
    console.log('TABLE EXISTS:', res.rows);
  } catch(e) {
    console.error('TABLE DOES NOT EXIST:', e.message);
  }
  await client.end();
}
run();
