/**
 * Sprint 21 — Production Deployment Release-Integrity smoke test.
 *
 * Verifies the live `thebreakdown.in` deployment independently of the local
 * repository, so repository/build/test state can never mask a stale or broken
 * production build (Section 1: REPOSITORY STATE != PRODUCTION STATE).
 *
 * Run: npx tsx tests/production-deployment.test.ts
 * (Added as `npm run test:smoke-prod`.)
 *
 * Developer note: base URL defaults to production; override with
 * `PROD_SMOKE_BASE` env var (e.g. a preview URL or `http://localhost:3000`)
 * for non-production verification. Do not hardcode a temporary URL.
 */

const BASE = process.env.PROD_SMOKE_BASE || 'https://thebreakdown.in';
const TIMEOUT_MS = 20000;

interface ExpectedRoute {
  path: string;
  status: number; // expected final HTTP status
  reason?: string;
}

const EXPECTED_200: ExpectedRoute[] = [
  { path: '/', status: 200, reason: 'homepage serves' },
  { path: '/trackers', status: 200, reason: 'trackers index' },
  { path: '/trackers/mgnrega', status: 200, reason: 'flagship tracker' },
  { path: '/trackers/upi', status: 200, reason: 'flagship tracker' },
  { path: '/trackers/semiconductor', status: 200, reason: 'flagship tracker' },
  { path: '/trackers/pmfby', status: 200, reason: 'flagship tracker' },
  { path: '/membership', status: 200, reason: 'commercial route' },
  { path: '/search', status: 200, reason: 'search route' },
  { path: '/trust', status: 200, reason: 'trust dashboard' },
  { path: '/topics', status: 200, reason: 'topics' },
  { path: '/series', status: 200, reason: 'series' },
  { path: '/data', status: 200, reason: 'data' },
  { path: '/sitemap.xml', status: 200, reason: 'sitemap' },
  { path: '/robots.txt', status: 200, reason: 'robots' },
];

// DEPRECATED_DEBUG_ROUTES intentionally 404 by middleware.ts:42.
const EXPECTED_404: ExpectedRoute[] = [
  { path: '/compare', status: 404, reason: 'deprecated debug route' },
  { path: '/evolution', status: 404, reason: 'deprecated debug route' },
  { path: '/precedents', status: 404, reason: 'deprecated debug route' },
  { path: '/problems', status: 404, reason: 'deprecated debug route' },
];

async function statusOf(path: string): Promise<number> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(`${BASE}${path}`, {
      signal: controller.signal,
      redirect: 'manual',
    });
    return res.status;
  } finally {
    clearTimeout(timer);
  }
}

async function runTests() {
  let passed = 0;
  let failed = 0;
  const assert = (cond: boolean, name: string) => {
    if (cond) {
      console.log(`  PASS: ${name}`);
      passed++;
    } else {
      console.error(`  FAIL: ${name}`);
      failed++;
    }
  };

  console.log(`\nProduction deployment smoke vs ${BASE}\n`);

  for (const r of EXPECTED_200) {
    try {
      const code = await statusOf(r.path);
      assert(code === r.status, `${r.path} -> ${code} (expected ${r.status}) ${r.reason ?? ''}`);
    } catch (e) {
      assert(false, `${r.path} -> request error: ${(e as Error).message}`);
    }
  }

  for (const r of EXPECTED_404) {
    try {
      const code = await statusOf(r.path);
      assert(code === r.status, `${r.path} -> ${code} (expected ${r.status} deprecated) ${r.reason ?? ''}`);
    } catch (e) {
      assert(false, `${r.path} -> request error: ${(e as Error).message}`);
    }
  }

  // Sitemap completeness: all four flagship trackers must be present.
  try {
    const sitemap = await (await fetch(`${BASE}/sitemap.xml`, { signal: AbortSignal.timeout(TIMEOUT_MS) })).text();
    for (const t of ['/trackers/mgnrega', '/trackers/upi', '/trackers/semiconductor', '/trackers/pmfby']) {
      assert(sitemap.includes(`https://thebreakdown.in${t}`), `sitemap contains ${t}`);
    }
  } catch (e) {
    assert(false, `sitemap fetch error: ${(e as Error).message}`);
  }

  // Robots must reference the sitemap and allow public content.
  try {
    const robots = await (await fetch(`${BASE}/robots.txt`, { signal: AbortSignal.timeout(TIMEOUT_MS) })).text();
    assert(robots.includes('Sitemap:'), 'robots.txt references a Sitemap');
    assert(robots.includes('Allow: /trackers'), 'robots.txt allows /trackers');
  } catch (e) {
    assert(false, `robots fetch error: ${(e as Error).message}`);
  }

  // Security: HSTS present on homepage.
  try {
    const res = await fetch(`${BASE}/`, { signal: AbortSignal.timeout(TIMEOUT_MS) });
    const hsts = res.headers.get('strict-transport-security') ?? '';
    assert(hsts.includes('max-age'), 'homepage sends Strict-Transport-Security');
  } catch (e) {
    assert(false, `homepage header error: ${(e as Error).message}`);
  }

  console.log(`\n${passed} passed, ${failed} failed\n`);
  if (failed > 0) process.exit(1);
}

runTests().catch((e) => {
  console.error(e);
  process.exit(1);
});
