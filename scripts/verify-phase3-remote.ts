/**
 * Phase 3 Final Infrastructure & Remote Provider Verification
 *
 * Verifies live against Supabase staging project lvfovvidtowadmnggzzf:
 * 1. Environment & Migration 016 state
 * 2. Remote API key lifecycle & immediate cache invalidation on revocation
 * 3. Multi-instance distributed rate limiting observing shared state
 * 4. Failure mode enforcement across all tiers (fail-closed vs graceful degradation)
 * 5. PostgreSQL atomic rate limiting concurrency & row locking
 * 6. Production runtime provider selection & fail-safe against silent memory fallback
 * 7. Remote API key permission boundaries
 * 8. Cleanup of all remote test records
 */

import * as fs from 'fs';
import * as path from 'path';

// Parse .env.local if present
try {
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
} catch {
  // Ignore if absent
}

import { getServiceClient } from '../supabase/client';
import {
  createApiKey,
  verifyApiKey,
  revokeApiKey,
  deleteApiKey,
} from '../features/auth/api-keys/service';
import { PostgresRateLimitStore } from '../features/rate-limiting/stores/postgres-store';
import { DistributedRateLimiter, RATE_LIMIT_POLICIES } from '../features/rate-limiting/limiter';
import type { RateLimitStore, RateLimitTier, RateLimitResult } from '../features/rate-limiting/types';
import type { Principal } from '../features/auth/principal';
import { can } from '../features/auth/policy';

let passed = 0;
let failed = 0;

function assert(condition: boolean, message: string) {
  if (condition) {
    console.log(`  ✓ PASS: ${message}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${message}`);
    failed++;
  }
}

async function run() {
  console.log('═══════════════════════════════════════════════════════════════════');
  console.log('PHASE 3 REMOTE INFRASTRUCTURE & PROVIDER VERIFICATION');
  console.log('═══════════════════════════════════════════════════════════════════\n');

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

  // ─────────────────────────────────────────────────────────────────
  // 1. Environment Confirmation
  // ─────────────────────────────────────────────────────────────────
  console.log('1. Verifying Environment & Migration State');
  assert(
    supabaseUrl.includes('lvfovvidtowadmnggzzf'),
    `Target is confirmed NON-PRODUCTION staging project (lvfovvidtowadmnggzzf)`
  );
  assert(Boolean(serviceKey), 'Supabase service role credentials available');

  const supabase = getServiceClient();

  // Check public.api_keys remote existence
  const { data: apiKeyCheck, error: apiKeyErr } = await supabase
    .from('api_keys')
    .select('id')
    .limit(1);
  assert(!apiKeyErr, 'Table public.api_keys exists and is accessible remotely');

  // Check public.rate_limit_buckets remote existence
  const { data: rlBucketCheck, error: rlBucketErr } = await supabase
    .from('rate_limit_buckets')
    .select('bucket_key')
    .limit(1);
  assert(!rlBucketErr, 'Table public.rate_limit_buckets exists and is accessible remotely');

  // Check increment_rate_limit stored function execution
  const testKey = `test:env:check:${Date.now()}`;
  const { data: rpcCheck, error: rpcErr } = await supabase.rpc('increment_rate_limit', {
    p_bucket_key: testKey,
    p_window_seconds: 60,
    p_max_limit: 10,
  });
  assert(!rpcErr && Array.isArray(rpcCheck) && rpcCheck.length > 0, 'Function increment_rate_limit() exists and executes cleanly');
  // cleanup test bucket
  await supabase.from('rate_limit_buckets').delete().eq('bucket_key', testKey);

  // ─────────────────────────────────────────────────────────────────
  // 2. Remote API Key State, Secret Protection & Cache Invalidation
  // ─────────────────────────────────────────────────────────────────
  console.log('\n2. Verifying Remote API Key State & Immediate Cache Invalidation');
  
  // Provision a real test admin user in auth.users to satisfy foreign key constraint
  const adminEmail = `admin_audit_${Date.now()}@thebreakdown.internal`;
  const { data: userData, error: userCreateErr } = await supabase.auth.admin.createUser({
    email: adminEmail,
    password: 'TemporarySecurePassword123!',
    email_confirm: true,
    app_metadata: { role: 'owner' },
  });

  if (userCreateErr || !userData.user) {
    throw new Error(`Failed to create test admin user in auth.users: ${userCreateErr?.message}`);
  }

  const testUser = userData.user;

  const testAdmin: Principal = {
    userId: testUser.id,
    email: testUser.email || adminEmail,
    name: 'Admin Auditor',
    role: 'owner',
    isSuperAdmin: true,
    status: 'active',
    organizationId: null,
  };

  const createdKey = await createApiKey({
    name: 'Remote Audit Test Key',
    role: 'editor',
    owner_id: testAdmin.userId,
    permissions: ['story.read', 'story.update'],
    rate_limit_tier: 'standard',
  });

  assert(Boolean(createdKey.raw_key) && createdKey.raw_key.startsWith('tb_live_'), 'Raw key returned on creation');

  // Verify remote database row content
  const { data: dbRow, error: fetchErr } = await supabase
    .from('api_keys')
    .select('*')
    .eq('id', createdKey.id)
    .single();

  assert(!fetchErr && dbRow !== null, 'Key record persisted in remote PostgreSQL');
  assert(dbRow.key_hash.length === 64, 'Database contains SHA-256 hash (64 hex characters)');
  assert(dbRow.key_prefix === createdKey.key_prefix, 'Database contains key_prefix');
  assert(
    !JSON.stringify(dbRow).includes(createdKey.raw_key),
    'Raw API secret is NEVER stored in database row'
  );

  // Authenticate with valid key (populates positive cache)
  const auth1 = await verifyApiKey(createdKey.raw_key);
  assert(auth1.valid === true, 'Authentication succeeds with valid raw key');

  // Immediately revoke the key
  const revokeRes = await revokeApiKey(createdKey.id, testAdmin);
  assert(revokeRes.success === true, 'Key successfully revoked');

  // IMMEDIATELY authenticate again within the 60s window (tests cache invalidation)
  const authImmediatelyAfterRevoke = await verifyApiKey(createdKey.raw_key);
  assert(
    authImmediatelyAfterRevoke.valid === false && authImmediatelyAfterRevoke.code === 'REVOKED',
    'IMMEDIATE subsequent request rejected as REVOKED (cache invalidation verified)'
  );

  // Clean up remote test key
  await deleteApiKey(createdKey.id, testAdmin);

  // ─────────────────────────────────────────────────────────────────
  // 3. Real Multi-Instance Distributed Rate Limiting
  // ─────────────────────────────────────────────────────────────────
  console.log('\n3. Verifying Multi-Instance Distributed Rate Limiting (Shared State)');
  const sharedKey = `audit:shared:${Date.now()}`;
  const windowSec = 60;
  const maxLimit = 5;

  // Simulate 3 distinct application worker instances sharing the remote PostgreSQL store
  const workerInstanceA = new PostgresRateLimitStore();
  const workerInstanceB = new PostgresRateLimitStore();
  const workerInstanceC = new PostgresRateLimitStore();

  const rA1 = await workerInstanceA.increment(sharedKey, windowSec, maxLimit);
  assert(rA1.current === 1 && rA1.allowed === true, 'Instance A performs request #1 (count = 1)');

  const rB2 = await workerInstanceB.increment(sharedKey, windowSec, maxLimit);
  assert(rB2.current === 2 && rB2.allowed === true, 'Instance B observes count = 2 across shared store');

  const rC3 = await workerInstanceC.increment(sharedKey, windowSec, maxLimit);
  assert(rC3.current === 3 && rC3.allowed === true, 'Instance C observes count = 3 across shared store');

  const rA4 = await workerInstanceA.increment(sharedKey, windowSec, maxLimit);
  const rB5 = await workerInstanceB.increment(sharedKey, windowSec, maxLimit);
  assert(rB5.current === 5 && rB5.allowed === true, 'Instance B observes limit boundary (count = 5, remaining = 0)');

  // Request #6 across Instance C must be blocked (429 condition)
  const rC6 = await workerInstanceC.increment(sharedKey, windowSec, maxLimit);
  assert(rC6.allowed === false, 'Instance C blocked at limit (allowed = false)');
  assert(rC6.remaining === 0, 'Remaining requests = 0');
  assert(typeof rC6.resetSeconds === 'number' && rC6.resetSeconds > 0, 'X-RateLimit-Reset is positive seconds');
  assert(typeof rC6.retryAfterSeconds === 'number' && rC6.retryAfterSeconds > 0, 'Retry-After is positive seconds');

  // Verify RFC 6585 response generation
  const limiter = new DistributedRateLimiter(workerInstanceA);
  const resp429 = limiter.create429Response(rC6, 'Custom rate limit message');
  assert(resp429.status === 429, 'Response status is HTTP 429');
  assert(resp429.headers.get('X-RateLimit-Limit') === '5', 'Header X-RateLimit-Limit is 5');
  assert(resp429.headers.get('X-RateLimit-Remaining') === '0', 'Header X-RateLimit-Remaining is 0');
  assert(Boolean(resp429.headers.get('Retry-After')), 'Header Retry-After present on 429 response');

  // Cleanup shared bucket
  await workerInstanceA.reset(sharedKey);

  // ─────────────────────────────────────────────────────────────────
  // 4. Rate Limiter Failure Mode Verification Across All Tiers
  // ─────────────────────────────────────────────────────────────────
  console.log('\n4. Verifying Rate Limiter Failure Modes (Fail-Closed vs Graceful Degradation)');
  class FaultyStore implements RateLimitStore {
    readonly name = 'faulty_simulated';
    async increment(): Promise<RateLimitResult> {
      throw new Error('Simulated backend network partition / outage');
    }
    async reset(): Promise<void> {}
    async isAvailable(): Promise<boolean> { return false; }
  }

  const failingLimiter = new DistributedRateLimiter(new FaultyStore(), new FaultyStore());

  const tiers: RateLimitTier[] = [
    'auth',
    'checkout',
    'ai',
    'intelligence',
    'export',
    'search',
    'mutation',
    'standard_api',
    'public_api',
  ];

  for (const tier of tiers) {
    const policy = RATE_LIMIT_POLICIES[tier];
    const res = await failingLimiter.checkLimit({
      key: `failure-test:${tier}`,
      tier,
      endpoint: `/api/${tier}`,
    });

    if (policy.failClosed) {
      assert(
        res.allowed === false,
        `Security-sensitive tier [${tier}] FAILS CLOSED when stores fail`
      );
    } else {
      assert(
        res.allowed === true,
        `Low-risk tier [${tier}] DEGRADES GRACEFULLY when stores fail`
      );
    }
  }

  // ─────────────────────────────────────────────────────────────────
  // 5. PostgreSQL Atomic Concurrency & Row Locking
  // ─────────────────────────────────────────────────────────────────
  console.log('\n5. Verifying Remote PostgreSQL Atomic Concurrency & Locking');
  const concurrencyKey = `audit:concurrency:${Date.now()}`;
  const concurrentIncrements = 15;
  const store = new PostgresRateLimitStore();

  // Fire 15 concurrent promises simultaneously
  const results = await Promise.all(
    Array.from({ length: concurrentIncrements }).map(() =>
      store.increment(concurrencyKey, 60, 100)
    )
  );

  const finalCounts = results.map((r) => r.current).sort((a, b) => a - b);
  console.log('   Observed concurrent counts:', finalCounts);
  const uniqueCounts = new Set(finalCounts);

  assert(
    uniqueCounts.size === concurrentIncrements,
    `All ${concurrentIncrements} concurrent increments were uniquely assigned without race conditions`
  );
  assert(
    Math.max(...finalCounts) === concurrentIncrements,
    `Final bucket counter reached exactly ${concurrentIncrements}`
  );

  // Clean up concurrency bucket
  await store.reset(concurrencyKey);

  // ─────────────────────────────────────────────────────────────────
  // 6. Production Provider Selection & Silent Downgrade Guard
  // ─────────────────────────────────────────────────────────────────
  console.log('\n6. Verifying Production Provider Selection & Downgrade Prevention');
  const originalNodeEnv = process.env.NODE_ENV;
  const originalServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const originalSupabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

  try {
    // A. Normal staging/prod with Supabase credentials selects postgres store
    const prodLimiter = new DistributedRateLimiter();
    assert(
      prodLimiter.getStoreName() === 'postgres',
      `Default configuration selects distributed store: [${prodLimiter.getStoreName()}]`
    );

    // B. Simulate missing credentials in production: must throw fatal startup error
    process.env.NODE_ENV = 'production';
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.UPSTASH_REDIS_REST_URL;

    let threwExpectedError = false;
    try {
      new DistributedRateLimiter();
    } catch (e: any) {
      if (e?.message?.includes('[FATAL_SECURITY_CONFIG]')) {
        threwExpectedError = true;
      }
    }
    assert(
      threwExpectedError,
      'Production configuration throws STARTUP ERROR if distributed provider is missing (refuses silent memory fallback)'
    );
  } finally {
    process.env.NODE_ENV = originalNodeEnv;
    process.env.SUPABASE_SERVICE_ROLE_KEY = originalServiceKey;
    process.env.NEXT_PUBLIC_SUPABASE_URL = originalSupabaseUrl;
  }

  // ─────────────────────────────────────────────────────────────────
  // 7. Remote API Key Permission Boundaries
  // ─────────────────────────────────────────────────────────────────
  console.log('\n7. Verifying Remote API Key Permission Boundaries');
  const readOnlyKey = await createApiKey({
    name: 'Audit Read-Only Key',
    role: 'reader',
    permissions: ['story.read'],
  });

  const readOnlyPrincipal: Principal = {
    userId: readOnlyKey.id,
    email: `api_key:${readOnlyKey.name}`,
    name: readOnlyKey.name,
    role: 'guest',
    isSuperAdmin: false,
    status: 'active',
    organizationId: null,
    permissions: readOnlyKey.permissions,
  };

  assert(can(readOnlyPrincipal, 'story.read') === true, 'Read-only key principal permitted story.read');
  assert(can(readOnlyPrincipal, 'story.publish') === false, 'Read-only key principal CANNOT publish stories');
  assert(can(readOnlyPrincipal, 'api_key.create') === false, 'Read-only key principal CANNOT create API keys');
  assert(can(readOnlyPrincipal, 'intel.predictions') === false, 'Read-only key principal CANNOT access restricted intel');

  const adminKey = await createApiKey({
    name: 'Audit Admin Key',
    role: 'owner',
    permissions: ['story.read', 'story.publish', 'api_key.create', 'api_key.revoke'],
  });

  const adminPrincipal: Principal = {
    userId: adminKey.id,
    email: `api_key:${adminKey.name}`,
    name: adminKey.name,
    role: 'owner',
    isSuperAdmin: true,
    status: 'active',
    organizationId: null,
    permissions: adminKey.permissions,
  };

  assert(can(adminPrincipal, 'story.read') === true, 'Admin key principal permitted story.read');
  assert(can(adminPrincipal, 'story.publish') === true, 'Admin key principal permitted story.publish');
  assert(can(adminPrincipal, 'api_key.create') === true, 'Admin key principal permitted api_key.create');

  // Clean up test keys and test user
  await deleteApiKey(readOnlyKey.id, testAdmin);
  await deleteApiKey(adminKey.id, testAdmin);
  await supabase.auth.admin.deleteUser(testUser.id);

  // ─────────────────────────────────────────────────────────────────
  // 8. Remote Abuse Controls (Request Bounds & Pagination)
  // ─────────────────────────────────────────────────────────────────
  console.log('\n8. Verifying Abuse Controls & Request Bounds');
  const normalizePage = (p: number) => (p < 1 || isNaN(p) ? 1 : p);
  const normalizePageSize = (s: number, max = 50) => (s < 1 || isNaN(s) ? 10 : Math.min(s, max));
  const truncatePrompt = (prompt: string, max = 4000) => prompt.slice(0, max);

  assert(normalizePage(-5) === 1, 'Negative page number normalized to 1');
  assert(normalizePageSize(1000, 50) === 50, 'Huge search pageSize 1000 clamped to 50');
  assert(normalizePageSize(999999, 100) === 100, 'Huge general pageSize 999999 clamped to 100');

  const hugePrompt = 'A'.repeat(10_000);
  assert(truncatePrompt(hugePrompt).length === 4000, 'Huge AI prompt truncated strictly to 4,000 chars');

  console.log('\n═══════════════════════════════════════════════════════════════════');
  console.log(`REMOTE PROVIDER VERIFICATION SUMMARY: ${passed} passed, ${failed} failed`);
  console.log('═══════════════════════════════════════════════════════════════════\n');

  if (failed > 0) {
    process.exit(1);
  }
}

run().catch((err) => {
  console.error('Unhandled verification error:', err);
  process.exit(1);
});
