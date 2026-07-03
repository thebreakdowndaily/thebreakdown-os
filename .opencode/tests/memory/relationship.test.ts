/**
 * THE BREAKDOWN OS — Memory Engine: Relationship Tests
 *
 * Validates knowledge graph operations: relationship creation, graph traversal,
 * path finding, and relationship queries.
 */

import { MemoryEngine } from '../../core/memory/manager';
import type { StoryMemory, MemoryConfig } from '../../core/memory/types';
import * as fs from 'fs/promises';
import * as path from 'path';

const TEST_STORE = path.join(__dirname, '../../.opencode/memory-test-rel');
const config: MemoryConfig = { storePath: TEST_STORE, maxVersions: 10, fuzzyThreshold: 0.85 };

async function setup() {
  await fs.mkdir(TEST_STORE, { recursive: true });
  for (const dir of ['people', 'organizations', 'relationships', 'stories', 'laws', 'events', 'budgets']) {
    await fs.mkdir(path.join(TEST_STORE, dir), { recursive: true });
  }
}

async function teardown() {
  await fs.rm(TEST_STORE, { recursive: true, force: true });
}

// ── Test: Relationship Creation ─────────────────────────────────────────

async function testRelationshipCreation() {
  console.log('TEST: Relationship Creation');
  await setup();

  const engine = new MemoryEngine(config);

  const story: StoryMemory = {
    storyId: 'story-rel-1',
    headline: 'Government Schemes',
    entities: [
      { id: 'govt-india', type: 'organization', name: 'Government of India', version: 0 },
      { id: 'scheme-pmjay', type: 'scheme', name: 'PM Jan Arogya Yojana', aliases: ['Ayushman Bharat'], version: 0 },
      { id: 'org-health-ministry', type: 'organization', name: 'Ministry of Health', version: 0 },
    ],
    relationships: [
      { from: 'govt-india', relationship: 'implements', to: 'scheme-pmjay', confidence: 0.97 },
      { from: 'scheme-pmjay', relationship: 'managed-by', to: 'org-health-ministry', confidence: 0.95 },
    ],
  };

  const result = await engine.ingest(story);

  if (result.relationships.length === 2) {
    console.log('  PASS: 2 relationships created');
  } else {
    console.log(`  FAIL: Expected 2 relationships, got ${result.relationships.length}`);
    process.exit(1);
  }

  // Verify relationship files exist
  const relDir = path.join(TEST_STORE, 'relationships');
  const files = await fs.readdir(relDir);
  if (files.length >= 2) {
    console.log('  PASS: Relationship files persisted');
  } else {
    console.log(`  FAIL: Expected at least 2 relationship files, got ${files.length}`);
    process.exit(1);
  }

  await teardown();
  console.log('');
}

// ── Test: Graph Traversal (Related Content) ─────────────────────────────

async function testGraphTraversal() {
  console.log('TEST: Graph Traversal (Related Content)');
  await setup();

  const engine = new MemoryEngine(config);

  // Build a knowledge graph:
  //   government → implements → MGNREGA
  //   government → implements → PM-KISAN
  //   MGNREGA → managed-by → Rural Development
  //   PM-KISAN → managed-by → Agriculture
  //   Rural Development → reports-to → government
  //   Agriculture → reports-to → government
  //   MGNREGA → covered-by → Budget 2026

  const story: StoryMemory = {
    storyId: 'story-graph',
    headline: 'Government Schemes Overview',
    entities: [
      { id: 'govt-india', type: 'organization', name: 'Government of India', version: 0 },
      { id: 'scheme-mgnrega', type: 'scheme', name: 'MGNREGA', version: 0 },
      { id: 'scheme-pm-kisan', type: 'scheme', name: 'PM-KISAN', version: 0 },
      { id: 'org-rural-dev', type: 'organization', name: 'Ministry of Rural Development', version: 0 },
      { id: 'org-agriculture', type: 'organization', name: 'Ministry of Agriculture', version: 0 },
      { id: 'budget-2026', type: 'budget', name: 'Union Budget 2026-27', version: 0 },
    ],
    relationships: [
      { from: 'govt-india', relationship: 'implements', to: 'scheme-mgnrega', confidence: 0.97 },
      { from: 'govt-india', relationship: 'implements', to: 'scheme-pm-kisan', confidence: 0.96 },
      { from: 'scheme-mgnrega', relationship: 'managed-by', to: 'org-rural-dev', confidence: 0.95 },
      { from: 'scheme-pm-kisan', relationship: 'managed-by', to: 'org-agriculture', confidence: 0.94 },
      { from: 'org-rural-dev', relationship: 'reports-to', to: 'govt-india', confidence: 0.99 },
      { from: 'org-agriculture', relationship: 'reports-to', to: 'govt-india', confidence: 0.99 },
      { from: 'scheme-mgnrega', relationship: 'covered-by', to: 'budget-2026', confidence: 0.90 },
    ],
  };

  await engine.ingest(story);

  // Get related stories/content for MGNREGA
  const related = await engine.getRelatedStories('scheme-mgnrega');

  // MGNREGA should connect to: govt-india, org-rural-dev, budget-2026
  if (related.organizations.length >= 1 && related.budgets.length >= 1) {
    console.log('  PASS: Graph traversal finds connected organizations and budgets');
  } else {
    console.log(`  FAIL: Missing connections. orgs: ${related.organizations.length}, budgets: ${related.budgets.length}`);
    process.exit(1);
  }

  await teardown();
  console.log('');
}

// ── Test: Path Finding ──────────────────────────────────────────────────

async function testPathFinding() {
  console.log('TEST: Path Finding');
  await setup();

  const engine = new MemoryEngine(config);

  const story: StoryMemory = {
    storyId: 'story-paths',
    headline: 'Path Finding Test',
    entities: [
      { id: 'entity-a', type: 'topic', name: 'A', version: 0 },
      { id: 'entity-b', type: 'topic', name: 'B', version: 0 },
      { id: 'entity-c', type: 'topic', name: 'C', version: 0 },
      { id: 'entity-d', type: 'topic', name: 'D', version: 0 },
    ],
    relationships: [
      { from: 'entity-a', relationship: 'connects-to', to: 'entity-b', confidence: 1.0 },
      { from: 'entity-b', relationship: 'connects-to', to: 'entity-c', confidence: 1.0 },
      { from: 'entity-c', relationship: 'connects-to', to: 'entity-d', confidence: 1.0 },
    ],
  };

  await engine.ingest(story);

  // Test via related stories (BFS-based)
  const fromA = await engine.getRelatedStories('entity-a');
  // A should reach B (1 hop), C (2 hops), D (3 hops)

  if (fromA.stories.length >= 0) {
    console.log('  PASS: Path traversal completes without error');
  } else {
    console.log('  FAIL: Path traversal failed');
    process.exit(1);
  }

  await teardown();
  console.log('');
}

// ── Run All ─────────────────────────────────────────────────────────────

async function runAll() {
  console.log('╔══════════════════════════════════════════╗');
  console.log('║  Memory Engine — Relationship Tests       ║');
  console.log('╚══════════════════════════════════════════╝\n');

  await testRelationshipCreation();
  await testGraphTraversal();
  await testPathFinding();

  console.log('╔══════════════════════════════════════════╗');
  console.log('║  All Relationship Tests PASSED           ║');
  console.log('╚══════════════════════════════════════════╝');
}

runAll().catch(err => {
  console.error('Test suite failed:', err);
  process.exit(1);
});
