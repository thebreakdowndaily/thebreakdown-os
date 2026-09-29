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

async function clean() {
  const client = new Client({ connectionString: process.env.TEST_DATABASE_URL || process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
  await client.connect();
  await client.query("DELETE FROM public.ai_visibility_observations WHERE id IN ('a9c0fcb6-d525-4ced-a930-6eeac865c2ea', '9d200617-ec5d-4f99-88d8-8cc524c31b58')");
  const count = await client.query('SELECT count(*) FROM public.ai_visibility_observations');
  console.log(`Cleaned duplicates. Total canonical rows in database: ${count.rows[0].count}`);
  await client.end();
}

clean().catch(console.error);
