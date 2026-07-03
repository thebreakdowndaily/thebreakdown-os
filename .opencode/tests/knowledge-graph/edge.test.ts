/**
 * THE BREAKDOWN OS — Knowledge Graph Edge Tests
 *
 * Tests for RelationshipManager (edge CRUD, query, merge).
 */

import { EntityManager } from '../../core/knowledge-graph/entity-manager';
import { RelationshipManager } from '../../core/knowledge-graph/relationship-manager';
import type { GraphConfig } from '../../core/knowledge-graph/types';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as os from 'os';

const TEST_DIR = path.join(os.tmpdir(), 'kg-test-edges-' + Date.now());

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

  // Create test nodes
  const em = new EntityManager(testConfig);
  await em.create({ id: 'scheme::mgnrega', type: 'scheme', label: 'MGNREGA' });
  await em.create({ id: 'organization::ministry_rural', type: 'organization', label: 'Ministry of Rural Development' });
  await em.create({ id: 'law::mgnreg_act', type: 'law', label: 'MGNREG Act' });
  await em.create({ id: 'country::india', type: 'country', label: 'India' });
}

async function teardown() {
  await fs.rm(TEST_DIR, { recursive: true, force: true });
}

async function runTests() {
  await setup();
  let passed = 0;
  let failed = 0;

  try {
    // Test 1: Create an edge
    {
      const rm = new RelationshipManager(testConfig);
      const edge = await rm.create({
        from: 'scheme::mgnrega',
        to: 'organization::ministry_rural',
        relationship: 'managed_by',
        confidence: 0.95,
        weight: 1.0,
        sources: ['https://egazette.gov.in/2025/scheme-mgnrega'],
      });
      if (edge.id === 'scheme::mgnrega|managed_by|organization::ministry_rural' &&
          edge.confidence === 0.95 && edge.active === true) {
        console.log('  ✓ Test 1: Create edge');
        passed++;
      } else {
        console.log(`  ✗ Test 1: Create edge — id=${edge.id}, active=${edge.active}`);
        failed++;
      }
    }

    // Test 2: Query edges by source
    {
      const rm = new RelationshipManager(testConfig);
      const edges = await rm.query({ from: 'scheme::mgnrega' });
      if (edges.length === 1 && edges[0].relationship === 'managed_by') {
        console.log('  ✓ Test 2: Query edges by source');
        passed++;
      } else {
        console.log(`  ✗ Test 2: Query edges by source — found ${edges.length}`);
        failed++;
      }
    }

    // Test 3: Query edges by relationship type
    {
      const rm = new RelationshipManager(testConfig);
      const edges = await rm.getByType('managed_by');
      if (edges.length === 1) {
        console.log('  ✓ Test 3: Query edges by relationship type');
        passed++;
      } else {
        console.log(`  ✗ Test 3: Query edges by type — found ${edges.length}`);
        failed++;
      }
    }

    // Test 4: Edge merge (same from→rel→to updates confidence/weight)
    {
      const rm = new RelationshipManager(testConfig);
      const merged = await rm.create({
        from: 'scheme::mgnrega',
        to: 'organization::ministry_rural',
        relationship: 'managed_by',
        confidence: 0.85,
        weight: 2.0,
        sources: ['https://pib.gov.in/2025/mgnrega-update'],
      });
      // Should merge: confidence = max(0.95, 0.85) = 0.95, weight = 1.0 + 2.0 = 3.0, 2 sources
      if (merged.confidence === 0.95 && merged.weight === 3.0 && merged.sources?.length === 2) {
        console.log('  ✓ Test 4: Edge merge — max confidence, cumulative weight, union sources');
        passed++;
      } else {
        console.log(`  ✗ Test 4: Edge merge — conf=${merged.confidence}, weight=${merged.weight}, sources=${merged.sources?.length}`);
        failed++;
      }
    }

    // Test 5: Get edges for a node
    {
      const rm = new RelationshipManager(testConfig);
      const edges = await rm.getEdgesForNode('scheme::mgnrega');
      if (edges.length === 1) {
        console.log('  ✓ Test 5: Get edges for node');
        passed++;
      } else {
        console.log(`  ✗ Test 5: Get edges for node — found ${edges.length}`);
        failed++;
      }
    }

    // Test 6: Delete edge
    {
      const rm = new RelationshipManager(testConfig);
      const edgeId = 'scheme::mgnrega|managed_by|organization::ministry_rural';
      await rm.delete(edgeId);

      const edges = await rm.query({ from: 'scheme::mgnrega' });
      // Should now be inactive — query filters to active only
      if (edges.length === 0) {
        console.log('  ✓ Test 6: Delete edge');
        passed++;
      } else {
        console.log(`  ✗ Test 6: Delete edge — found ${edges.length} active edges`);
        failed++;
      }
    }

    // Test 7: Multiple edges for different relationships
    {
      const rm = new RelationshipManager(testConfig);
      await rm.create({ from: 'scheme::mgnrega', to: 'country::india', relationship: 'located_in', confidence: 0.9, sources: [] });
      await rm.create({ from: 'law::mgnreg_act', to: 'scheme::mgnrega', relationship: 'implements', confidence: 0.95, sources: [] });

      const allForScheme = await rm.getEdgesForNode('scheme::mgnrega');
      if (allForScheme.length === 2) {
        console.log('  ✓ Test 7: Multiple edges for different relationships');
        passed++;
      } else {
        console.log(`  ✗ Test 7: Multiple edges — found ${allForScheme.length}`);
        failed++;
      }
    }

    // Test 8: Remove all edges for a node
    {
      const rm = new RelationshipManager(testConfig);
      await rm.removeEdgesForNode('scheme::mgnrega');

      const edges = await rm.getEdgesForNode('scheme::mgnrega');
      if (edges.length === 0) {
        console.log('  ✓ Test 8: Remove all edges for node');
        passed++;
      } else {
        console.log(`  ✗ Test 8: Remove all edges — found ${edges.length}`);
        failed++;
      }
    }

    // Test 9: Statistics
    {
      const rm = new RelationshipManager(testConfig);
      const stats = await rm.statistics();
      if (stats.total === 0) {
        console.log('  ✓ Test 9: Edge statistics');
        passed++;
      } else {
        console.log(`  ✗ Test 9: Edge statistics — total=${stats.total}`);
        failed++;
      }
    }

    // Test 10: Health check
    {
      const rm = new RelationshipManager(testConfig);
      const healthy = await rm.health();
      if (healthy) {
        console.log('  ✓ Test 10: Edge health check');
        passed++;
      } else {
        console.log('  ✗ Test 10: Edge health check');
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
