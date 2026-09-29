import fs from 'node:fs';
import path from 'node:path';
import { Client } from 'pg';

function loadEnv() {
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
}

async function main() {
  loadEnv();
  const dbUrl = process.env.TEST_DATABASE_URL || process.env.DATABASE_URL;
  const client = new Client({ connectionString: dbUrl, ssl: { rejectUnauthorized: false } });
  await client.connect();

  console.log('--- 1. Immutable T0 Baseline Observations (public.ai_visibility_observations) ---');
  const t0Res = await client.query(`
    SELECT query_id, engine, observation_state, failure_classification, 
           diagnostic_signals->>'notes' as diag_notes
    FROM public.ai_visibility_observations
    ORDER BY query_id ASC
  `);
  console.log(`Found ${t0Res.rows.length} canonical T0 records:`);
  console.table(t0Res.rows);

  console.log('\n--- 2. Additive Evidence Assessments (public.geo_evidence_assessments) ---');
  const assessRes = await client.query(`
    SELECT query_id, variant_id, local_readiness_score, intent_coverage_rate,
           index_status, search_retrieval, diagnosis, confidence
    FROM public.geo_evidence_assessments
    ORDER BY created_at DESC
    LIMIT 15;
  `);
  console.log(`Found ${assessRes.rows.length} recent evidence assessment records:`);
  console.table(assessRes.rows);

  await client.end();
}

main().catch(console.error);
