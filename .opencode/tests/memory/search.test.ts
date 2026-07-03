/**
 * THE BREAKDOWN OS — Memory Engine: Search Tests
 *
 * Validates cross-category search, related story engine, and timeline queries.
 */

import { MemoryEngine } from '../../core/memory/manager';
import type { EntityMemory, StoryMemory, MemoryConfig } from '../../core/memory/types';
import * as fs from 'fs/promises';
import * as path from 'path';

const TEST_STORE = path.join(__dirname, '../../.opencode/memory-test-search');
const config: MemoryConfig = { storePath: TEST_STORE, maxVersions: 10, fuzzyThreshold: 0.85 };

async function setup() {
  await fs.mkdir(TEST_STORE, { recursive: true });
  for (const dir of ['people', 'organizations', 'stories', 'relationships', 'events', 'laws', 'budgets']) {
    await fs.mkdir(path.join(TEST_STORE, dir), { recursive: true });
  }
}

async function teardown() {
  await fs.rm(TEST_STORE, { recursive: true, force: true });
}

// ── Test: Cross-Category Search ─────────────────────────────────────────

async function testCrossCategorySearch() {
  console.log('TEST: Cross-Category Search');
  await setup();

  const engine = new MemoryEngine(config);
  const storyId = 'story-mgnrega-001';

  const story: StoryMemory = {
    storyId,
    headline: 'MGNREGA Budget 2026 Analysis',
    summary: 'Analysis of MGNREGA allocation in Union Budget 2026-27 and its impact on rural employment.',
    publishedAt: '2026-02-01T10:00:00Z',
    entities: [
      { id: 'scheme-mgnrega', type: 'scheme', name: 'MGNREGA', aliases: ['NREGA', 'Rural Job Scheme'], version: 0 },
      { id: 'org-finance-ministry', type: 'organization', name: 'Ministry of Finance', aliases: ['Finance Ministry'], version: 0 },
      { id: 'org-rural-development', type: 'organization', name: 'Ministry of Rural Development', aliases: ['MoRD'], version: 0 },
      { id: 'person-nirmala-sitharaman', type: 'person', name: 'Nirmala Sitharaman', aliases: ['Nirmala'], version: 0 },
      { id: 'budget-2026', type: 'budget', name: 'Union Budget 2026-27', aliases: ['Budget 2026'], version: 0 },
    ],
    relationships: [
      { from: 'government-of-india', relationship: 'implements', to: 'scheme-mgnrega', confidence: 0.97 },
      { from: 'scheme-mgnrega', relationship: 'managed-by', to: 'org-rural-development', confidence: 0.95 },
    ],
    topics: ['rural employment', 'budget', 'MGNREGA', 'government scheme'],
  };

  await engine.ingest(story);

  // Cross-category search
  const results = await engine.search('MGNREGA');
  if (results.length > 0) {
    console.log(`  PASS: Search returned ${results.length} results`);
  } else {
    console.log('  FAIL: No results for MGNREGA');
    process.exit(1);
  }

  // Verify multiple categories returned
  const categories = new Set(results.map(r => r.category));
  if (categories.has('scheme') && categories.has('organization')) {
    console.log('  PASS: Multiple categories returned (scheme + organization)');
  } else {
    console.log(`  FAIL: Expected scheme + organization, got: ${[...categories].join(', ')}`);
    process.exit(1);
  }

  await teardown();
  console.log('');
}

// ── Test: Related Stories Engine ────────────────────────────────────────

async function testRelatedStories() {
  console.log('TEST: Related Stories Engine');
  await setup();

  const engine = new MemoryEngine(config);

  // Seed multiple related stories
  const stories = [
    { id: 'story-010', headline: 'MGNREGA Wage Hike Announced', entities: [{ id: 'scheme-mgnrega', type: 'scheme', name: 'MGNREGA', version: 0 }] },
    { id: 'story-011', headline: 'Budget 2026: Rural Focus', entities: [{ id: 'budget-2026', type: 'budget', name: 'Union Budget 2026-27', version: 0 }] },
    { id: 'story-012', headline: 'Rural Employment Numbers', entities: [{ id: 'scheme-mgnrega', type: 'scheme', name: 'MGNREGA', version: 0 }] },
    { id: 'story-013', headline: 'Unrelated Tech News', entities: [{ id: 'topic-tech', type: 'topic', name: 'Technology', version: 0 }] },
  ];

  for (const s of stories) {
    await engine.ingest({
      storyId: s.id,
      headline: s.headline,
      entities: s.entities as EntityMemory[],
    });
  }

  // Query related stories for MGNREGA
  const result = await engine.getRelatedStories('scheme-mgnrega');
  if (result.stories.length >= 2) {
    console.log(`  PASS: Found ${result.stories.length} related stories`);
  } else {
    console.log(`  FAIL: Expected at least 2 related stories, got ${result.stories.length}`);
    process.exit(1);
  }

  // Unrelated story should have fewer connections
  const unrelated = await engine.getRelatedStories('topic-tech');
  if (unrelated.stories.length < result.stories.length) {
    console.log('  PASS: Unrelated entity has fewer connections');
  } else {
    console.log('  FAIL: Unrelated entity should have fewer connections');
    process.exit(1);
  }

  await teardown();
  console.log('');
}

// ── Test: Timeline Query ────────────────────────────────────────────────

async function testTimelineQuery() {
  console.log('TEST: Timeline Query');
  await setup();

  const engine = new MemoryEngine(config);

  const story: StoryMemory = {
    storyId: 'story-timeline',
    headline: 'RBI Policy Timeline',
    entities: [
      {
        id: 'org-rbi',
        type: 'organization',
        name: 'Reserve Bank of India',
        timeline: [
          { date: '1935-04-01', event: 'RBI established', source: 'RBI Act 1934' },
          { date: '1949-01-01', event: 'RBI nationalised', source: 'Historical record' },
          { date: '2016-11-08', event: 'Demonetisation announced', source: 'Government notification' },
        ],
        version: 0,
      },
    ],
  };

  await engine.ingest(story);

  const timeline = await engine.getTimeline('org-rbi');
  if (timeline.length === 3) {
    console.log('  PASS: Timeline has 3 events');
  } else {
    console.log(`  FAIL: Expected 3 events, got ${timeline.length}`);
    process.exit(1);
  }

  // Verify chronological order
  if (timeline[0].date <= timeline[1].date && timeline[1].date <= timeline[2].date) {
    console.log('  PASS: Timeline is chronologically sorted');
  } else {
    console.log('  FAIL: Timeline not sorted');
    process.exit(1);
  }

  await teardown();
  console.log('');
}

// ── Test: Empty Search ──────────────────────────────────────────────────

async function testEmptySearch() {
  console.log('TEST: Empty Search (No Data)');
  await setup();

  const engine = new MemoryEngine(config);

  const results = await engine.search('something that does not exist');
  if (results.length === 0) {
    console.log('  PASS: Empty search returns 0 results');
  } else {
    console.log(`  FAIL: Expected 0 results, got ${results.length}`);
    process.exit(1);
  }

  await teardown();
  console.log('');
}

// ── Run All ─────────────────────────────────────────────────────────────

async function runAll() {
  console.log('╔══════════════════════════════════════════╗');
  console.log('║  Memory Engine — Search Tests             ║');
  console.log('╚══════════════════════════════════════════╝\n');

  await testCrossCategorySearch();
  await testRelatedStories();
  await testTimelineQuery();
  await testEmptySearch();

  console.log('╔══════════════════════════════════════════╗');
  console.log('║  All Search Tests PASSED                 ║');
  console.log('╚══════════════════════════════════════════╝');
}

runAll().catch(err => {
  console.error('Test suite failed:', err);
  process.exit(1);
});
