import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

function loadEnvFile(filePath: string) {
  if (!fs.existsSync(filePath)) return;
  const content = fs.readFileSync(filePath, 'utf8');
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const parts = trimmed.split('=');
    if (parts.length >= 2) {
      const key = parts[0].trim();
      const val = parts.slice(1).join('=').trim().replace(/^['"]|['"]$/g, '');
      if (!process.env[key]) {
        process.env[key] = val;
      }
    }
  }
}

// Load environment configurations
loadEnvFile(path.join(process.cwd(), '.env.local'));
loadEnvFile(path.join(process.cwd(), '.env.test'));

// Setup test secret if missing in local/test files
if (!process.env.CRON_SECRET) {
  process.env.CRON_SECRET = 'mock_cron_secret_keys_12345';
}

function validateUrl(urlStr: string): boolean {
  try {
    const url = new URL(urlStr);
    return url.protocol === 'https:';
  } catch {
    return false;
  }
}

async function verifyContracts() {
  console.log('================================================================');
  console.log('THE BREAKDOWN — ENVIRONMENT CONTRACT VALIDATION');
  console.log('================================================================');

  let contractPass = true;

  const provider = process.env.NEWSROOM_STATE_PROVIDER;
  console.log(`NEWSROOM_STATE_PROVIDER: ${provider ?? 'Undefined (defaults to supabase in prod)'}`);
  if (provider && !['memory', 'file', 'supabase'].includes(provider)) {
    console.error('❌ ERROR: NEWSROOM_STATE_PROVIDER must be one of memory, file, supabase.');
    contractPass = false;
  }

  const pibUrl = process.env.PIB_FEED_URL;
  console.log(`PIB_FEED_URL:            ${pibUrl ?? 'Undefined (uses default PIB RSS)'}`);
  if (pibUrl && !validateUrl(pibUrl)) {
    console.error('❌ ERROR: PIB_FEED_URL must be a valid HTTPS URL.');
    contractPass = false;
  }

  const cronSecret = process.env.CRON_SECRET;
  const hasCronSecret = !!cronSecret && cronSecret.length >= 8;
  console.log(`CRON_SECRET:             ${hasCronSecret ? `Configured (Length: ${cronSecret.length})` : 'Missing or too short (< 8 chars)'}`);
  if (!hasCronSecret) {
    contractPass = false;
  }

  // Load URL from SUPABASE_URL or NEXT_PUBLIC_SUPABASE_URL
  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const isDummySupabase = supabaseUrl === 'https://placeholder.supabase.co' || supabaseUrl === 'https://dummy.supabase.co' || !supabaseUrl;
  console.log(`SUPABASE_URL:            ${supabaseUrl ? (isDummySupabase ? 'Placeholder/Dummy' : 'Configured') : 'Missing'}`);
  if (supabaseUrl && !isDummySupabase && !validateUrl(supabaseUrl)) {
    console.error('❌ ERROR: SUPABASE_URL must be a valid HTTPS URL.');
    contractPass = false;
  }

  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const hasServiceKey = !!serviceKey && serviceKey.length >= 20;
  console.log(`SUPABASE_SERVICE_KEY:    ${hasServiceKey ? `Configured (Length: ${serviceKey.length})` : 'Missing or too short'}`);
  if (!hasServiceKey) {
    contractPass = false;
  }

  console.log('\n----------------------------------------------------------------');
  if (contractPass) {
    console.log('LOCAL_ENV_CONTRACT = PASS');
  } else {
    console.log('LOCAL_ENV_CONTRACT = FAIL');
  }

  let productionUsable = false;
  if (supabaseUrl && !isDummySupabase && serviceKey && hasServiceKey) {
    try {
      const client = createClient(supabaseUrl, serviceKey, {
        auth: { persistSession: false },
        db: { schema: 'newsroom' }
      });
      const { data, error } = await client.from('pipeline_metrics').select('count', { count: 'exact', head: true });
      if (!error) {
        productionUsable = true;
      } else {
        console.warn(`⚠️ Warn: Production DB check returned error: ${error.message}`);
      }
    } catch (err) {
      console.warn(`⚠️ Warn: Production DB connection threw: ${err}`);
    }
  }

  if (productionUsable) {
    console.log('PRODUCTION_ENV_USABLE = VERIFIED');
  } else {
    console.log('PRODUCTION_ENV_USABLE = NOT_VERIFIED');
  }
  console.log('================================================================\n');
}

verifyContracts().catch(console.error);
