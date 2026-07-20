const { Client } = require('pg');
const fs = require('fs');
const envContent = fs.readFileSync('.env.test', 'utf8');
let dbUrl = '';
envContent.split('\n').forEach(line => {
  const trimmed = line.trim();
  if (trimmed && !trimmed.startsWith('#')) {
    const [key, ...vals] = trimmed.split('=');
    if (key === 'TEST_DATABASE_URL') {
      dbUrl = vals.join('=').trim().replace(/^['"]|['"]$/g, '');
    }
  }
});
async function run() {
  const admin = new Client({ connectionString: dbUrl });
  await admin.connect();
  const res = await admin.query("SELECT policyname, cmd, roles, qual, with_check FROM pg_policies WHERE tablename = 'research_claims'");
  console.table(res.rows);
  await admin.end();
}
run().catch(console.error);
