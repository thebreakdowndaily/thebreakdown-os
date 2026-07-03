/**
 * THE BREAKDOWN OS — Memory Engine: Entity Tests
 *
 * Validates entity creation, update, dedup, and versioning.
 */

import { MemoryEngine } from '../../core/memory/manager';
import type { EntityMemory, StoryMemory, MemoryConfig } from '../../core/memory/types';
import * as fs from 'fs/promises';
import * as path from 'path';

const TEST_STORE = path.join(__dirname, '../../.opencode/memory-test');

const config: MemoryConfig = {
  storePath: TEST_STORE,
  maxVersions: 10,
  fuzzyThreshold: 0.85,
};

async function setup() {
  await fs.mkdir(TEST_STORE, { recursive: true });
  for (const dir of ['people', 'organizations', 'stories', 'relationships', 'sources', 'events', 'facts']) {
    await fs.mkdir(path.join(TEST_STORE, dir), { recursive: true });
  }
}

async function teardown() {
  await fs.rm(TEST_STORE, { recursive: true, force: true });
}

// ── Test: Create Entity ──────────────────────────────────────────────────

async function testCreateEntity() {
  console.log('TEST: Create Entity');

  const engine = new MemoryEngine(config);

  const entity: EntityMemory = {
    id: 'person-narendra-modi',
    type: 'person',
    name: 'Narendra Modi',
    aliases: ['Modi', 'Narendra Damodardas Modi'],
    roles: ['Prime Minister of India'],
    organizations: ['government-of-india', 'bjp'],
    version: 0, // will be set by engine
  };

  const story: StoryMemory = {
    storyId: 'test-story-001',
    headline: 'Test Story',
    entities: [entity],
  };

  const result = await engine.ingest(story);

  if (result.entities.includes('person-narendra-modi')) {
    console.log('  PASS: Entity created successfully');
  } else {
    console.log('  FAIL: Entity not found in ingest result');
    process.exit(1);
  }

  // Verify entity file exists
  const entityPath = path.join(TEST_STORE, 'people', 'person-narendra-modi.json');
  try {
    const saved = JSON.parse(await fs.readFile(entityPath, 'utf-8'));
    if (saved.name === 'Narendra Modi' && saved.version === 1) {
      console.log('  PASS: Entity file written correctly');
    } else {
      console.log(`  FAIL: Entity file has wrong data: ${JSON.stringify(saved)}`);
      process.exit(1);
    }
  } catch {
    console.log('  FAIL: Entity file not found');
    process.exit(1);
  }

  // Cleanup
  await teardown();
  console.log('');
}

// ── Test: Update Entity (Dedup) ─────────────────────────────────────────

async function testUpdateEntity() {
  console.log('TEST: Update Entity (Dedup)');
  await setup();

  const engine = new MemoryEngine(config);

  // First ingestion
  const entity1: EntityMemory = {
    id: 'org-reserve-bank-of-india',
    type: 'organization',
    name: 'Reserve Bank of India',
    aliases: ['RBI'],
    version: 0,
  };

  await engine.ingest({
    storyId: 'story-001',
    headline: 'RBI Policy',
    entities: [entity1],
  });

  // Second ingestion — same entity, new story
  const entity2: EntityMemory = {
    id: 'org-reserve-bank-of-india',
    type: 'organization',
    name: 'Reserve Bank of India',
    aliases: ['RBI', 'Reserve Bank'],
    roles: ['Central Bank of India'],
    version: 0,
  };

  const result = await engine.ingest({
    storyId: 'story-002',
    headline: 'RBI Circular',
    entities: [entity2],
  });

  if (result.entities.includes('org-reserve-bank-of-india')) {
    console.log('  PASS: Entity updated without duplicate');
  } else {
    console.log('  FAIL: Entity not found in second ingest');
    process.exit(1);
  }

  // Verify merge
  const entity = await engine.getEntity('org-reserve-bank-of-india');
  if (entity && entity.aliases?.length === 2 && entity.stories?.length === 2) {
    console.log('  PASS: Entity merged correctly (aliases + stories)');
  } else {
    console.log(`  FAIL: Entity merge incorrect: ${JSON.stringify(entity)}`);
    process.exit(1);
  }

  // Verify version history
  const history = await engine.version('org-reserve-bank-of-india');
  if (history.length === 2) {
    console.log('  PASS: Version history has 2 entries');
  } else {
    console.log(`  FAIL: Expected 2 versions, got ${history.length}`);
    process.exit(1);
  }

  await teardown();
  console.log('');
}

// ── Test: Entity Search ─────────────────────────────────────────────────

async function testEntitySearch() {
  console.log('TEST: Entity Search');
  await setup();

  const engine = new MemoryEngine(config);

  // Seed entities
  await engine.ingest({
    storyId: 'story-003',
    headline: 'Budget 2026',
    entities: [
      { id: 'person-nirmala-sitharaman', type: 'person', name: 'Nirmala Sitharaman', aliases: ['Nirmala'], version: 0 },
      { id: 'org-finance-ministry', type: 'organization', name: 'Ministry of Finance', aliases: ['Finance Ministry', 'MoF'], version: 0 },
      { id: 'budget-2026', type: 'budget', name: 'Union Budget 2026-27', aliases: ['Budget 2026'], version: 0 },
    ],
  });

  // Search by name
  const searchResults = await engine.search('Nirmala');
  if (searchResults.length > 0 && searchResults[0].id === 'person-nirmala-sitharaman') {
    console.log('  PASS: Search by name works');
  } else {
    console.log(`  FAIL: Search returned: ${JSON.stringify(searchResults)}`);
    process.exit(1);
  }

  // Search by alias
  const aliasResults = await engine.search('MoF');
  if (aliasResults.length > 0 && aliasResults[0].id === 'org-finance-ministry') {
    console.log('  PASS: Search by alias works');
  } else {
    console.log(`  FAIL: Alias search returned: ${JSON.stringify(aliasResults)}`);
    process.exit(1);
  }

  // Search by topic
  const budgetResults = await engine.search('Budget');
  if (budgetResults.length > 0) {
    console.log('  PASS: Search by topic returns results');
  } else {
    console.log('  FAIL: Topic search returned nothing');
    process.exit(1);
  }

  await teardown();
  console.log('');
}

// ── Test: Version History ───────────────────────────────────────────────

async function testVersionHistory() {
  console.log('TEST: Version History');
  await setup();

  const engine = new MemoryEngine(config);

  // Create entity
  await engine.ingest({
    storyId: 'story-v1',
    headline: 'Version 1',
    entities: [
      { id: 'person-test', type: 'person', name: 'Test Person', aliases: ['TP'], version: 0 },
    ],
  });

  // Update entity three times
  for (let i = 0; i < 3; i++) {
    await engine.ingest({
      storyId: `story-v${i + 2}`,
      headline: `Version ${i + 2}`,
      entities: [
        { id: 'person-test', type: 'person', name: 'Test Person', aliases: ['TP', `TP-v${i + 2}`], version: 0 },
      ],
    });
  }

  const history = await engine.version('person-test');
  if (history.length === 4) {
    console.log('  PASS: All 4 versions preserved');
  } else {
    console.log(`  FAIL: Expected 4 versions, got ${history.length}`);
    process.exit(1);
  }

  // Verify never overwrites
  const entity = await engine.getEntity('person-test');
  if (entity && entity.version === 4) {
    console.log('  PASS: Version counter at 4');
  } else {
    console.log(`  FAIL: Expected version 4, got ${entity?.version}`);
    process.exit(1);
  }

  await teardown();
  console.log('');
}

// ── Test: Knows (Cache Check) ──────────────────────────────────────────

async function testKnows() {
  console.log('TEST: Knows (Cache Check)');
  await setup();

  const engine = new MemoryEngine(config);

  // Nothing known yet
  const before = await engine.knows('RBI');
  if (!before.known) {
    console.log('  PASS: Correctly reports unknown topic');
  } else {
    console.log('  FAIL: Should not know about RBI yet');
    process.exit(1);
  }

  // Add knowledge
  await engine.ingest({
    storyId: 'story-knows',
    headline: 'RBI Monetary Policy',
    entities: [
      { id: 'org-rbi', type: 'organization', name: 'Reserve Bank of India', aliases: ['RBI'], version: 0 },
    ],
  });

  // Now it should know
  const after = await engine.knows('RBI');
  if (after.known) {
    console.log('  PASS: Correctly reports known topic after ingest');
  } else {
    console.log('  FAIL: Should know about RBI after ingest');
    process.exit(1);
  }

  await teardown();
  console.log('');
}

// ── Run All Tests ───────────────────────────────────────────────────────

async function runAll() {
  console.log('╔══════════════════════════════════════════╗');
  console.log('║  Memory Engine — Entity Tests             ║');
  console.log('╚══════════════════════════════════════════╝\n');

  await testCreateEntity();
  await testUpdateEntity();
  await testEntitySearch();
  await testVersionHistory();
  await testKnows();

  console.log('╔══════════════════════════════════════════╗');
  console.log('║  All Entity Tests PASSED                 ║');
  console.log('╚══════════════════════════════════════════╝');
}

runAll().catch(err => {
  console.error('Test suite failed:', err);
  process.exit(1);
});
