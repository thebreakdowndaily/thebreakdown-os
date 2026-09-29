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

async function run() {
  const client = new Client({ connectionString: process.env.TEST_DATABASE_URL || process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
  await client.connect();
  const res = await client.query('SELECT id, query_id, engine, observation_state, answer_present, answer_accuracy, failure_classification FROM public.ai_visibility_observations ORDER BY query_id ASC');
  console.log(`Found ${res.rows.length} observation records:`);
  console.table(res.rows);
  await client.end();
}

run().catch(console.error);
