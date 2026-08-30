/**
 * THE BREAKDOWN — Scheduled Publish Worker Tests
 *
 * Behavioral tests for the standalone Cloudflare Cron Worker and
 * publication gate integration.
 *
 * Governing document: AGENTS.md (Editorial Calendar + Autonomous Weekly Publishing)
 */

function assert(condition: boolean, name: string, results: { passed: number; failed: number }) {
  if (condition) {
    console.log(`  PASS: ${name}`);
    results.passed++;
  } else {
    console.error(`  FAIL: ${name}`);
    results.failed++;
  }
}

// ── Shared fixtures ──
const NOW = new Date('2026-08-20T10:00:00Z');

const MINIMAL_SOURCE = {
  id: 'src-1',
  title: 'Test Source',
  url: 'https://example.com/source',
  accessedAt: '2026-08-01T00:00:00Z',
  tier: 'primary' as const,
};

const MINIMAL_CLAIM = {
  id: 'claim-1',
  claim: 'Test claim',
  data: 'Test data',
  source: 'Test Source',
  sourceUrl: 'https://example.com/source',
  tier: 'primary' as const,
  confidence: 80,
  status: 'verified' as const,
};

function makeStory(overrides: Record<string, unknown> = {}) {
  return {
    id: 'story-1',
    slug: 'test-story',
    title: 'Valid Story Title',
    headline: 'Valid Headline',
    summary: 'A valid summary for publication.',
    heroImage: '/img.jpg',
    author: 'Test Author',
    category: 'Test',
    status: 'scheduled' as const,
    publicationStatus: 'draft' as const,
    storyType: 'standard' as const,
    evidenceScore: 50,
    readingTime: 5,
    publishedAt: '2026-08-20T10:00:00Z',
    createdAt: '2026-08-01',
    updatedAt: '2026-08-01',
    tags: [],
    blocks: [{ id: 'b1', type: 'text', content: 'x'.repeat(200) }],
    sources: [MINIMAL_SOURCE],
    claims: [MINIMAL_CLAIM],
    timeline: [],
    faq: [],
    charts: [],
    relatedStoryIds: [],
    relatedEntityIds: [],
    relatedTopicIds: [],
    ...overrides,
  };
}

async function runTests() {
  const r = { passed: 0, failed: 0 };

  // ═══════════════════════════════════════════════════════════════════════════
  // 1. Worker Module Shape
  // ═══════════════════════════════════════════════════════════════════════════

  console.log('\n═══ Worker Module Shape ═══');

  const handler = await import('../workers/scheduled-publish/index');
  const mod = handler.default || handler;

  assert(typeof mod === 'object', 'Worker module exports an object', r);
  assert(typeof mod.scheduled === 'function', 'Worker exports scheduled() handler', r);
  assert(typeof mod.fetch === 'function', 'Worker exports fetch() handler', r);

  // fetch() returns health check
  const env = { SUPABASE_URL: 'test', SUPABASE_SERVICE_ROLE_KEY: 'test', CRON_SECRET: '' };
  const fetchResponse = await mod.fetch(
    new Request('https://example.com'),
    env,
    {} as ExecutionContext,
  );
  const fetchBody = await fetchResponse.json() as Record<string, unknown>;
  assert(fetchResponse.status === 200, 'fetch() returns 200', r);
  assert(fetchBody.service === 'thebreakdown-scheduled-publish', 'fetch() returns service name', r);
  assert(typeof fetchBody.timestamp === 'string', 'fetch() includes timestamp', r);

  // ═══════════════════════════════════════════════════════════════════════════
  // 2. Publication Gate — Fail-Closed
  // ═══════════════════════════════════════════════════════════════════════════

  console.log('\n═══ Publication Gate — Fail-Closed ═══');

  const { validateStoryForPublication } = await import('../lib/editorial/publication-gate');

  // 2a. Missing story → BLOCKED
  {
    const result = validateStoryForPublication(
      { storyId: 'missing-1', triggeredBy: 'cron' },
      undefined,
      NOW,
    );
    assert(result.passed === false, 'missing story → BLOCKED', r);
    assert(result.checks[0]?.name === 'story_exists', 'first check is story_exists', r);
    assert(result.checks[0]?.passed === false, 'story_exists fails', r);
  }

  // 2b. Status 'draft' → BLOCKED (not eligible)
  {
    const result = validateStoryForPublication(
      { storyId: 'draft-1', triggeredBy: 'cron' },
      makeStory({ status: 'draft' }) as never,
      NOW,
    );
    assert(result.passed === false, 'status draft → BLOCKED', r);
    const statusCheck = result.checks.find(c => c.name === 'status_eligible');
    assert(statusCheck?.passed === false, 'status_eligible fails for draft', r);
  }

  // 2c. Missing title → BLOCKED
  {
    const result = validateStoryForPublication(
      { storyId: 'no-title', triggeredBy: 'cron' },
      makeStory({ title: '' }) as never,
      NOW,
    );
    assert(result.passed === false, 'missing title → BLOCKED', r);
    assert(result.checks.some(c => c.name === 'has_title' && !c.passed), 'has_title fails', r);
  }

  // 2d. Missing summary → BLOCKED
  {
    const result = validateStoryForPublication(
      { storyId: 'no-summary', triggeredBy: 'cron' },
      makeStory({ summary: '' }) as never,
      NOW,
    );
    assert(result.passed === false, 'missing summary → BLOCKED', r);
    assert(result.checks.some(c => c.name === 'has_summary' && !c.passed), 'has_summary fails', r);
  }

  // 2e. Empty blocks → BLOCKED
  {
    const result = validateStoryForPublication(
      { storyId: 'no-content', triggeredBy: 'cron' },
      makeStory({ blocks: [] }) as never,
      NOW,
    );
    assert(result.passed === false, 'empty blocks → BLOCKED', r);
    assert(result.checks.some(c => c.name === 'has_content' && !c.passed), 'has_content fails', r);
  }

  // 2f. No sources → BLOCKED
  {
    const result = validateStoryForPublication(
      { storyId: 'no-sources', triggeredBy: 'cron' },
      makeStory({ sources: [] }) as never,
      NOW,
    );
    assert(result.passed === false, 'no sources → BLOCKED', r);
    assert(result.checks.some(c => c.name === 'has_sources' && !c.passed), 'has_sources fails', r);
  }

  // 2g. No claims → BLOCKED
  {
    const result = validateStoryForPublication(
      { storyId: 'no-claims', triggeredBy: 'cron' },
      makeStory({ claims: [] }) as never,
      NOW,
    );
    assert(result.passed === false, 'no claims → BLOCKED', r);
    assert(result.checks.some(c => c.name === 'has_claims' && !c.passed), 'has_claims fails', r);
  }

  // 2h. Missing publishedAt → BLOCKED
  {
    const result = validateStoryForPublication(
      { storyId: 'no-pub-at', triggeredBy: 'cron' },
      makeStory({ publishedAt: '' }) as never,
      NOW,
    );
    assert(result.passed === false, 'missing publishedAt → BLOCKED', r);
    assert(result.checks.some(c => c.name === 'has_published_at' && !c.passed), 'has_published_at fails', r);
  }

  // 2i. Archived → BLOCKED
  {
    const result = validateStoryForPublication(
      { storyId: 'archived', triggeredBy: 'cron' },
      makeStory({ publicationStatus: 'archived' }) as never,
      NOW,
    );
    assert(result.passed === false, 'archived → BLOCKED', r);
    assert(result.checks.some(c => c.name === 'not_archived' && !c.passed), 'not_archived fails', r);
  }

  // 2j. Blocked by editor → BLOCKED
  {
    const result = validateStoryForPublication(
      { storyId: 'blocked', triggeredBy: 'cron' },
      makeStory({ blockReason: 'Needs fact-check' }) as never,
      NOW,
    );
    assert(result.passed === false, 'editor-blocked → BLOCKED', r);
    assert(result.checks.some(c => c.name === 'not_blocked' && !c.passed), 'not_blocked fails', r);
  }

  // 2k. Already published → BLOCKED by gate (status not eligible)
  //     Idempotency is handled by schedule-cf.ts BEFORE calling the gate.
  {
    const result = validateStoryForPublication(
      { storyId: 'already-pub', triggeredBy: 'cron' },
      makeStory({ status: 'published', publicationStatus: 'published' }) as never,
      NOW,
    );
    assert(result.passed === false, 'already published → BLOCKED by gate (correct — idempotency handled by schedule service)', r);
    const statusCheck = result.checks.find(c => c.name === 'status_eligible');
    assert(statusCheck?.passed === false, 'status_eligible correctly rejects published', r);
  }

  // 2l. Valid story, status 'scheduled' → PASS
  {
    const result = validateStoryForPublication(
      { storyId: 'valid-scheduled', triggeredBy: 'cron' },
      makeStory({ status: 'scheduled' }) as never,
      NOW,
    );
    assert(result.passed === true, 'valid scheduled story → PASS', r);
    assert(result.triggeredBy === 'cron', 'triggeredBy preserved', r);
    assert(result.storyId === 'valid-scheduled', 'storyId preserved', r);
    assert(result.checkedAt === NOW.toISOString(), 'checkedAt set', r);
  }

  // 2m. Valid story, status 'review' → PASS
  {
    const result = validateStoryForPublication(
      { storyId: 'valid-review', triggeredBy: 'cron' },
      makeStory({ status: 'review' }) as never,
      NOW,
    );
    assert(result.passed === true, 'valid review story → PASS', r);
  }

  // 2n. Valid story, status 'fact_check' → PASS
  {
    const result = validateStoryForPublication(
      { storyId: 'valid-factcheck', triggeredBy: 'cron' },
      makeStory({ status: 'fact_check' }) as never,
      NOW,
    );
    assert(result.passed === true, 'valid fact_check story → PASS', r);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 3. Build Artifacts
  // ═══════════════════════════════════════════════════════════════════════════

  console.log('\n═══ Build Artifacts ═══');

  const fs = await import('node:fs');
  const path = await import('node:path');
  const distPath = path.join(process.cwd(), 'workers', 'scheduled-publish', 'dist', 'index.js');
  const distExists = fs.existsSync(distPath);
  assert(distExists, 'dist/index.js exists', r);

  if (distExists) {
    const stat = fs.statSync(distPath);
    assert(stat.size > 0, `dist/index.js is non-empty (${(stat.size / 1024).toFixed(1)}KB)`, r);

    const content = fs.readFileSync(distPath, 'utf-8');
    assert(content.includes('scheduled'), 'bundle contains scheduled handler', r);
    assert(content.includes('fetch'), 'bundle contains fetch handler', r);
    assert(content.includes('SUPABASE_URL'), 'bundle references SUPABASE_URL', r);
    assert(content.includes('publication_gate_log'), 'bundle references gate log table', r);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 4. Cloudflare Schedule Service Module
  // ═══════════════════════════════════════════════════════════════════════════

  console.log('\n═══ Cloudflare Schedule Service ═══');

  const cfModule = await import('../services/editorial/schedule-cf');
  assert(typeof cfModule.publishDueStories === 'function', 'publishDueStories is exported', r);

  // Verify the function accepts env bindings
  assert(
    cfModule.publishDueStories.length === 1 || cfModule.publishDueStories.length === 2,
    'publishDueStories accepts env parameter',
    r,
  );

  // ═══════════════════════════════════════════════════════════════════════════
  // 5. Wrangler Config
  // ═══════════════════════════════════════════════════════════════════════════

  console.log('\n═══ Wrangler Configuration ═══');

  const wranglerPath = path.join(process.cwd(), 'workers', 'scheduled-publish', 'wrangler.toml');
  const wranglerExists = fs.existsSync(wranglerPath);
  assert(wranglerExists, 'wrangler.toml exists', r);

  if (wranglerExists) {
    const toml = fs.readFileSync(wranglerPath, 'utf-8');
    assert(toml.includes('crons'), 'wrangler.toml defines cron triggers', r);
    assert(toml.includes('0 * * * *'), 'cron is hourly', r);
    assert(toml.includes('thebreakdown-scheduled-publish'), 'worker name is set', r);
    assert(toml.includes('dist/index.js'), 'main entry point is dist/index.js', r);
    assert(toml.includes('nodejs_compat'), 'nodejs_compat flag is enabled', r);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // Summary
  // ═══════════════════════════════════════════════════════════════════════════

  console.log(`\n═══ Results: ${r.passed} passed, ${r.failed} failed ═══`);

  if (r.failed > 0) {
    process.exit(1);
  }
}

runTests().catch((error) => {
  console.error('Test runner failed:', error);
  process.exit(1);
});
