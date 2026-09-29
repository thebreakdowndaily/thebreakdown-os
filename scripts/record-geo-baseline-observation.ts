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
    throw new Error('Missing database connection URL');
  }

  const client = new Client({ connectionString: dbUrl, ssl: { rejectUnauthorized: false } });
  await client.connect();

  console.log('Recording genuine initial GEO baseline observations (Zero Fabrications)...');

  const baselineObservations = [
    {
      engine: 'google_ai_overview',
      query: 'What is the RBI repo rate and how does monetary policy work in India?',
      query_id: 'Q002',
      story_id: 'rbi-repo-rate',
      mentioned: false,
      cited: false,
      citation_url: null,
      citation_correct: null,
      answer_accuracy: 0,
      notes: 'Initial production baseline: site:thebreakdown.in returns 0 indexed results in public search. Awaiting search engine crawler cycle.',
      observer: 'release-loopback-audit'
    },
    {
      engine: 'google_ai_overview',
      query: 'How does MGNREGA work and what are the key reform challenges?',
      query_id: 'Q003',
      story_id: 'mgnrega-reform',
      mentioned: false,
      cited: false,
      citation_url: null,
      citation_correct: null,
      answer_accuracy: 0,
      notes: 'Initial production baseline: Public web indexing cycle pending. Discovery endpoints (/robots.txt, /news-sitemap.xml, /llms.txt) live and unblocked.',
      observer: 'release-loopback-audit'
    }
  ];

  for (const obs of baselineObservations) {
    const res = await client.query(`
      INSERT INTO public.ai_visibility_observations (
        engine, query, query_id, story_id, mentioned, cited, citation_url, citation_correct, answer_accuracy, notes, observer
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING id, engine, query_id, observed_at;
    `, [
      obs.engine, obs.query, obs.query_id, obs.story_id, obs.mentioned, obs.cited,
      obs.citation_url, obs.citation_correct, obs.answer_accuracy, obs.notes, obs.observer
    ]);
    console.log(`Recorded observation for ${obs.query_id} -> ID: ${res.rows[0].id}`);
  }

  const countRes = await client.query('SELECT count(*) FROM public.ai_visibility_observations');
  console.log(`Total observations in database: ${countRes.rows[0].count}`);

  await client.end();
}

main().catch(console.error);
