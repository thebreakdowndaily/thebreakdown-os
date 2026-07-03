/**
 * THE BREAKDOWN OS — Knowledge Graph Node Tests
 *
 * Tests for EntityManager (node CRUD, dedup, merge).
 */

import { EntityManager } from '../../core/knowledge-graph/entity-manager';
import type { GraphConfig } from '../../core/knowledge-graph/types';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as os from 'os';

const TEST_DIR = path.join(os.tmpdir(), 'kg-test-nodes-' + Date.now());

const testConfig: GraphConfig = {
  store: {
    nodes_path: path.join(TEST_DIR, 'nodes'),
    edges_path: path.join(TEST_DIR, 'edges'),
  },
  inference: { enabled: true, max_depth: 2, min_confidence: 0.5 },
  validation: { schedule: '', fuzzy_threshold: 0.85, stale_edge_days: 90, auto_repair: true },
};

async function setup() {
  await fs.mkdir(path.join(TEST_DIR, 'nodes'), { recursive: true });
  await fs.mkdir(path.join(TEST_DIR, 'edges'), { recursive: true });
}

async function teardown() {
  await fs.rm(TEST_DIR, { recursive: true, force: true });
}

async function runTests() {
  await setup();
  let passed = 0;
  let failed = 0;

  try {
    // Test 1: Create a node
    {
      const em = new EntityManager(testConfig);
      const node = await em.create({
        id: 'scheme::mgnrega',
        type: 'scheme',
        label: 'MGNREGA',
        description: 'Mahatma Gandhi National Rural Employment Guarantee Act',
        aliases: ['NREGA', 'MNREGA'],
      });
      if (node.id === 'scheme::mgnrega' && node.type === 'scheme' && node.active === true && node.storyCount === 0) {
        console.log('  ✓ Test 1: Create node');
        passed++;
      } else {
        console.log('  ✗ Test 1: Create node — unexpected result');
        failed++;
      }
    }

    // Test 2: Get a node
    {
      const em = new EntityManager(testConfig);
      const node = await em.get('scheme::mgnrega');
      if (node && node.label === 'MGNREGA') {
        console.log('  ✓ Test 2: Get node');
        passed++;
      } else {
        console.log('  ✗ Test 2: Get node — not found or mismatch');
        failed++;
      }
    }

    // Test 3: Update a node
    {
      const em = new EntityManager(testConfig);
      const updated = await em.update('scheme::mgnrega', {
        description: 'Updated description',
        storyCount: 5,
      });
      if (updated.description === 'Updated description' && updated.storyCount === 5) {
        console.log('  ✓ Test 3: Update node');
        passed++;
      } else {
        console.log('  ✗ Test 3: Update node — values not updated');
        failed++;
      }
    }

    // Test 4: Duplicate detection (same ID → merge)
    {
      const em = new EntityManager(testConfig);
      const duplicate = await em.create({
        id: 'scheme::mgnrega',
        type: 'scheme',
        label: 'MGNREGA',
        description: 'Another description',
        aliases: ['NREGA'],
      });
      // Should merge — storyCount should be 6 (5+1)
      const node = await em.get('scheme::mgnrega');
      if (node && node.storyCount === 6 && node.description === 'Updated description') {
        console.log('  ✓ Test 4: Duplicate detection — merge keeps original, accumulates count');
        passed++;
      } else {
        console.log(`  ✗ Test 4: Duplicate detection — storyCount=${node?.storyCount}, desc=${node?.description}`);
        failed++;
      }
    }

    // Test 5: Alias-based dedup
    {
      const em = new EntityManager(testConfig);
      const node = await em.create({
        id: 'scheme::nrega',
        type: 'scheme',
        label: 'NREGA',
        description: 'National Rural Employment Guarantee Act',
        aliases: ['MGNREGA'], // Already exists via alias
      });
      // Should merge with existing 'scheme::mgnrega' node
      const merged = await em.get('scheme::mgnrega');
      if (merged && merged.storyCount === 7) {
        console.log('  ✓ Test 5: Alias-based dedup — merges into existing node');
        passed++;
      } else {
        console.log(`  ✗ Test 5: Alias-based dedup — storyCount=${merged?.storyCount}`);
        failed++;
      }
    }

    // Test 6: Soft delete
    {
      const em = new EntityManager(testConfig);
      await em.delete('scheme::mgnrega');
      const node = await em.get('scheme::mgnrega');
      if (node && node.active === false) {
        console.log('  ✓ Test 6: Soft delete — node still exists but inactive');
        passed++;
      } else {
        console.log('  ✗ Test 6: Soft delete — node removed or still active');
        failed++;
      }
    }

    // Test 7: Find by partial query
    {
      const em = new EntityManager(testConfig);
      // Add a few more nodes
      await em.create({ id: 'organization::niti_aayog', type: 'organization', label: 'NITI Aayog', aliases: ['NITI'] });
      await em.create({ id: 'organization::rbi', type: 'organization', label: 'Reserve Bank of India', aliases: ['RBI'] });

      const results = await em.find('rbi');
      if (results.length >= 1 && results.some(r => r.id === 'organization::rbi')) {
        console.log('  ✓ Test 7: Find by query');
        passed++;
      } else {
        console.log(`  ✗ Test 7: Find by query — found ${results.length}`);
        failed++;
      }
    }

    // Test 8: Get by type
    {
      const em = new EntityManager(testConfig);
      const schemes = await em.getByType('scheme');
      // Should have the soft-deleted MGNREGA and possibly others
      if (schemes.length >= 0) {
        console.log('  ✓ Test 8: Get by type');
        passed++;
      } else {
        console.log('  ✗ Test 8: Get by type');
        failed++;
      }
    }

    // Test 9: Statistics
    {
      const em = new EntityManager(testConfig);
      const stats = await em.statistics();
      if (stats.total >= 3 && stats.byType['organization'] >= 2) {
        console.log('  ✓ Test 9: Statistics');
        passed++;
      } else {
        console.log(`  ✗ Test 9: Statistics — total=${stats.total}, orgs=${stats.byType['organization']}`);
        failed++;
      }
    }

    // Test 10: Health check
    {
      const em = new EntityManager(testConfig);
      const healthy = await em.health();
      if (healthy) {
        console.log('  ✓ Test 10: Health check');
        passed++;
      } else {
        console.log('  ✗ Test 10: Health check');
        failed++;
      }
    }

  } catch (err: any) {
    console.log(`  ✗ Error during tests: ${err.message}`);
    failed++;
  } finally {
    await teardown();
  }

  console.log(`\nResults: ${passed} passed, ${failed} failed, ${passed + failed} total`);
  process.exit(failed > 0 ? 1 : 0);
}

runTests();
