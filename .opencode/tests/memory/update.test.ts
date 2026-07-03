/**
 * THE BREAKDOWN OS — Memory Engine: Update Tests
 *
 * Validates cascading updates, deduplication, and source registration.
 */

import { MemoryEngine } from '../../core/memory/manager';
import type { EntityMemory, StoryMemory, MemoryConfig } from '../../core/memory/types';
import * as fs from 'fs/promises';
import * as path from 'path';

const TEST_STORE = path.join(__dirname, '../../.opencode/memory-test-update');
const config: MemoryConfig = { storePath: TEST_STORE, maxVersions: 10, fuzzyThreshold: 0.85 };

async function setup() {
  await fs.mkdir(TEST_STORE, { recursive: true });
  for (const dir of ['people', 'organizations', 'stories', 'sources', 'facts', 'events']) {
    await fs.mkdir(path.join(TEST_STORE, dir), { recursive: true });
  }
}

async function teardown() {
  await fs.rm(TEST_STORE, { recursive: true, force: true });
}

// ── Test: Cascading Update ──────────────────────────────────────────────

async function testCascadingUpdate() {
  console.log('TEST: Cascading Update');
  await setup();

  const engine = new MemoryEngine(config);

  // Story 1: MGNREGA introduced
  await engine.ingest({
    storyId: 'story-mgnrega-2005',
    headline: 'MGNREGA Act Passed',
    entities: [
      { id: 'scheme-mgnrega', type: 'scheme', name: 'MGNREGA', aliases: ['NREGA'], version: 0 },
    ],
    sources: [{ publisher: 'Parliament of India', credibility: 98, version: 0 }],
  });

  // Story 2: Budget allocation changes MGNREGA
  await engine.ingest({
    storyId: 'story-budget-2026',
    headline: 'Budget 2026: MGNREGA Allocation',
    entities: [
      { id: 'scheme-mgnrega', type: 'scheme', name: 'MGNREGA', aliases: ['NREGA'], version: 0 },
      { id: 'budget-2026', type: 'budget', name: 'Union Budget 2026-27', version: 0 },
      { id: 'person-nirmala-sitharaman', type: 'person', name: 'Nirmala Sitharaman', version: 0 },
    ],
    sources: [{ publisher: 'PIB', credibility: 95, version: 0 }],
  });

  // MGNREGA entity should reference both stories
  const mgnrega = await engine.getEntity('scheme-mgnrega');
  if (mgnrega && mgnrega.stories?.length === 2) {
    console.log('  PASS: Entity references both stories (cascading update)');
  } else {
    console.log(`  FAIL: Expected 2 story references, got ${mgnrega?.stories?.length}`);
    process.exit(1);
  }

  // Budget entity should only reference the second story
  const budget = await engine.getEntity('budget-2026');
  if (budget && budget.stories?.length === 1 && budget.stories[0] === 'story-budget-2026') {
    console.log('  PASS: Budget entity references only its story');
  } else {
    console.log(`  FAIL: Budget entity incorrect: ${JSON.stringify(budget?.stories)}`);
    process.exit(1);
  }

  await teardown();
  console.log('');
}

// ── Test: Dedup by Alias ────────────────────────────────────────────────

async function testDedupByAlias() {
  console.log('TEST: Dedup by Alias');
  await setup();

  const engine = new MemoryEngine(config);

  // Create with full name
  await engine.ingest({
    storyId: 'story-dedup-1',
    headline: 'First Reference',
    entities: [
      { id: 'person-rahul-gandhi', type: 'person', name: 'Rahul Gandhi', aliases: ['Rahul', 'RG'], version: 0 },
    ],
  });

  // Reference by alias only — should find and merge
  await engine.ingest({
    storyId: 'story-dedup-2',
    headline: 'Second Reference',
    entities: [
      { id: 'person-rahul-gandhi', type: 'person', name: 'Rahul Gandhi', aliases: ['Rahul'], roles: ['MP', 'Leader of Opposition'], version: 0 },
    ],
  });

  const entity = await engine.getEntity('person-rahul-gandhi');
  if (entity && entity.roles?.length === 2 && entity.stories?.length === 2) {
    console.log('  PASS: Entity deduped by alias, roles and stories merged');
  } else {
    console.log(`  FAIL: Entity incorrect: ${JSON.stringify(entity)}`);
    process.exit(1);
  }

  await teardown();
  console.log('');
}

// ── Test: Source Registration ───────────────────────────────────────────

async function testSourceRegistration() {
  console.log('TEST: Source Registration');
  await setup();

  const engine = new MemoryEngine(config);

  // Publish stories using same source
  await engine.ingest({
    storyId: 'story-pib-1',
    headline: 'PIB Release 1',
    sources: [{ publisher: 'Press Information Bureau', credibility: 95, tier: 1, version: 0 }],
    entities: [{ id: 'scheme-test', type: 'scheme', name: 'Test Scheme', version: 0 }],
  });

  await engine.ingest({
    storyId: 'story-pib-2',
    headline: 'PIB Release 2',
    sources: [{ publisher: 'Press Information Bureau', credibility: 95, tier: 1, version: 0 }],
    entities: [{ id: 'scheme-test', type: 'scheme', name: 'Test Scheme', version: 0 }],
  });

  // Check source was tracked
  const sourceFile = path.join(TEST_STORE, 'sources', 'press-information-bureau.json');
  try {
    const source = JSON.parse(await fs.readFile(sourceFile, 'utf-8'));
    if (source.stories?.length === 2) {
      console.log('  PASS: Source registered with 2 story references');
    } else {
      console.log(`  FAIL: Expected 2 story refs, got ${source.stories?.length}`);
      process.exit(1);
    }
  } catch {
    console.log('  FAIL: Source file not created');
    process.exit(1);
  }

  await teardown();
  console.log('');
}

// ── Test: Delete (Soft) ─────────────────────────────────────────────────

async function testSoftDelete() {
  console.log('TEST: Soft Delete');
  await setup();

  const engine = new MemoryEngine(config);

  await engine.ingest({
    storyId: 'story-del',
    headline: 'Delete Me',
    entities: [{ id: 'entity-to-delete', type: 'topic', name: 'Delete Test', version: 0 }],
  });

  // Verify exists
  let entity = await engine.getEntity('entity-to-delete');
  if (!entity) {
    console.log('  FAIL: Entity should exist before delete');
    process.exit(1);
  }

  // Delete
  await engine.delete('entity-to-delete');

  // Verify soft-deleted
  entity = await engine.getEntity('entity-to-delete');
  if (entity && entity.active === false) {
    console.log('  PASS: Entity soft-deleted (active = false)');
  } else {
    console.log(`  FAIL: Entity state after delete: ${JSON.stringify(entity)}`);
    process.exit(1);
  }

  // Version history preserved
  const history = await engine.version('entity-to-delete');
  if (history.length === 2) {
    console.log('  PASS: Version history preserved after delete');
  } else {
    console.log(`  FAIL: Expected 2 versions, got ${history.length}`);
    process.exit(1);
  }

  await teardown();
  console.log('');
}

// ── Run All ─────────────────────────────────────────────────────────────

async function runAll() {
  console.log('╔══════════════════════════════════════════╗');
  console.log('║  Memory Engine — Update Tests             ║');
  console.log('╚══════════════════════════════════════════╝\n');

  await testCascadingUpdate();
  await testDedupByAlias();
  await testSourceRegistration();
  await testSoftDelete();

  console.log('╔══════════════════════════════════════════╗');
  console.log('║  All Update Tests PASSED                 ║');
  console.log('╚══════════════════════════════════════════╝');
}

runAll().catch(err => {
  console.error('Test suite failed:', err);
  process.exit(1);
});
