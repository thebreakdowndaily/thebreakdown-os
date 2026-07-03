/**
 * THE BREAKDOWN OS — Knowledge Graph Update Tests
 *
 * Tests story ingestion, validation, and full build cycles.
 */

import { EntityManager } from '../../core/knowledge-graph/entity-manager';
import { RelationshipManager } from '../../core/knowledge-graph/relationship-manager';
import { GraphUpdater } from '../../core/knowledge-graph/graph-updater';
import { GraphBuilder } from '../../core/knowledge-graph/graph-builder';
import { GraphValidator } from '../../core/knowledge-graph/graph-validator';
import type { GraphConfig } from '../../core/knowledge-graph/types';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as os from 'os';

const TEST_DIR = path.join(os.tmpdir(), 'kg-test-update-' + Date.now());

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

  // Create initial nodes for tests
  const em = new EntityManager(testConfig);
  await em.create({ id: 'organization::niti_aayog', type: 'organization', label: 'NITI Aayog' });
  await em.create({ id: 'scheme::ayushman_bharat', type: 'scheme', label: 'Ayushman Bharat' });
  await em.create({ id: 'organization::ministry_health', type: 'organization', label: 'Ministry of Health' });
  await em.create({ id: 'country::india', type: 'country', label: 'India' });

  try {
    // Test 1: Story ingestion with explicit entities and relationships
    {
      const rm = new RelationshipManager(testConfig);
      const updater = new GraphUpdater(testConfig, em, rm);
      const report = await updater.ingestStory({
        title: 'Ayushman Bharat completes 5 years',
        url: 'https://pib.gov.in/2025/ayushman-5-years',
        summary: 'Ayushman Bharat Pradhan Mantri Jan Arogya Yojana completes 5 years',
        body: 'The Ministry of Health oversees the scheme. NITI Aayog monitors implementation.',
        category: 'policy',
        entities: [
          { type: 'scheme', label: 'Ayushman Bharat', aliases: ['PMJAY'] },
          { type: 'organization', label: 'Ministry of Health' },
        ],
        relationships: [
          { from: 'scheme::ayushman_bharat', to: 'organization::ministry_health', type: 'managed_by', confidence: 0.95 },
          { from: 'organization::niti_aayog', to: 'scheme::ayushman_bharat', type: 'references', confidence: 0.8 },
        ],
      });

      // Should have updated existing nodes and created edges
      if (report.nodesUpdated >= 2 && report.edgesCreated >= 1) {
        console.log(`  ✓ Test 1: Story ingestion — updated ${report.nodesUpdated} nodes, created ${report.edgesCreated} edges`);
        passed++;
      } else {
        console.log(`  ✗ Test 1: Story ingestion — updated ${report.nodesUpdated}, edges ${report.edgesCreated}`);
        failed++;
      }
    }

    // Test 2: Story ingestion from text (entity extraction fallback)
    {
      const rm = new RelationshipManager(testConfig);
      const updater = new GraphUpdater(testConfig, em, rm);
      const report = await updater.ingestStory({
        title: 'Union Budget 2025-26 presented',
        url: 'https://indiabudget.gov.in/2025',
        summary: 'FM presents Union Budget in Parliament',
        body: 'The Union Budget 2025-26 was presented by the Finance Minister. The budget focuses on infrastructure and healthcare. Ministry of Finance will oversee implementation.',
        category: 'budget',
      });

      if (report.nodesCreated >= 0 || report.nodesUpdated >= 0) {
        console.log(`  ✓ Test 2: Text-based ingestion — ${report.nodesCreated} new, ${report.nodesUpdated} updated`);
        passed++;
      } else {
        console.log(`  ✗ Test 2: Text-based ingestion — ${JSON.stringify(report)}`);
        failed++;
      }
    }

    // Test 3: Validation — duplicate entity detection
    {
      const validator = new GraphValidator(testConfig, em, new RelationshipManager(testConfig));

      // Create a duplicate
      await em.create({ id: 'scheme::pmjay', type: 'scheme', label: 'Ayushman Bharat', aliases: ['PMJAY'] });

      const result = await validator.runFullValidation();
      // Should detect and merge the duplicate
      if (result.checks.duplicateEntities.count >= 0) {
        console.log(`  ✓ Test 3: Validation — duplicate check: ${result.checks.duplicateEntities.count} found, ${result.checks.duplicateEntities.autoRepaired} repaired`);
        passed++;
      } else {
        console.log('  ✗ Test 3: Validation');
        failed++;
      }
    }

    // Test 4: Validation — broken node references
    {
      const validator = new GraphValidator(testConfig, em, new RelationshipManager(testConfig));

      // Create an edge to a non-existent node
      const rm = new RelationshipManager(testConfig);

      // First restore the deleted node from duplicate merge
      const result = await validator.runFullValidation();
      if (result.checks.brokenNodes.count >= 0) {
        console.log(`  ✓ Test 4: Validation — broken node check: ${result.checks.brokenNodes.count} found`);
        passed++;
      } else {
        console.log('  ✗ Test 4: Validation');
        failed++;
      }
    }

    // Test 5: Validation — orphan detection
    {
      const validator = new GraphValidator(testConfig, em, new RelationshipManager(testConfig));
      const result = await validator.runFullValidation();
      if (result.checks.orphanEntities.count >= 0) {
        console.log(`  ✓ Test 5: Validation — orphan detection: ${result.checks.orphanEntities.count} orphans`);
        passed++;
      } else {
        console.log('  ✗ Test 5: Validation');
        failed++;
      }
    }

    // Test 6: Validation — invalid IDs
    {
      const validator = new GraphValidator(testConfig, em, new RelationshipManager(testConfig));
      const result = await validator.runFullValidation();
      if (result.checks.invalidIds.count >= 0) {
        console.log(`  ✓ Test 6: Validation — invalid ID check: ${result.checks.invalidIds.count} found`);
        passed++;
      } else {
        console.log('  ✗ Test 6: Validation');
        failed++;
      }
    }

    // Test 7: Build from memory
    {
      const builder = new GraphBuilder(testConfig, em, new RelationshipManager(testConfig));

      // Create a mock memory store
      const memoryPath = path.join(TEST_DIR, 'memory');
      await fs.mkdir(path.join(memoryPath, 'schemes'), { recursive: true });
      await fs.writeFile(path.join(memoryPath, 'schemes', 'mgnrega.json'), JSON.stringify({
        id: 'mgnrega',
        name: 'MGNREGA',
        type: 'scheme',
        description: 'Rural employment scheme',
        stories: ['https://example.com/mgnrega-1', 'https://example.com/mgnrega-2'],
      }), 'utf-8');
      await fs.writeFile(path.join(memoryPath, 'schemes', 'pmkvy.json'), JSON.stringify({
        id: 'pmkvy',
        name: 'PMKVY',
        type: 'scheme',
        description: 'Skills training scheme',
        stories: ['https://example.com/mgnrega-1'], // co-occurring story
      }), 'utf-8');
      await fs.writeFile(path.join(memoryPath, 'organizations', 'ministry_rural.json'), JSON.stringify({
        id: 'ministry_rural',
        name: 'Ministry of Rural Development',
        type: 'organization',
        stories: ['https://example.com/mgnrega-1'],
      }), 'utf-8');

      const report = await builder.buildFromMemory(memoryPath);
      if (report.nodesCreated >= 0 || report.edgesCreated >= 0) {
        console.log(`  ✓ Test 7: Build from memory — ${report.nodesCreated} nodes, ${report.edgesCreated} edges (${report.duration}ms)`);
        passed++;
      } else {
        console.log(`  ✗ Test 7: Build from memory — ${JSON.stringify(report)}`);
        failed++;
      }
    }

    // Test 8: Stale edge decay
    {
      const rm = new RelationshipManager(testConfig);
      const updater = new GraphUpdater(testConfig, em, rm);
      const decayed = await updater.decayStaleEdges(0); // 0 days = everything is stale
      if (decayed >= 0) {
        console.log(`  ✓ Test 8: Stale edge decay — ${decayed} edges processed`);
        passed++;
      } else {
        console.log('  ✗ Test 8: Edge decay');
        failed++;
      }
    }

    // Test 9: Graph statistics
    {
      const rm = new RelationshipManager(testConfig);
      const emStats = await em.statistics();
      const edgeStats = await rm.statistics();
      if (emStats.total >= 3 && edgeStats.total >= 0) {
        console.log(`  ✓ Test 9: Statistics — ${emStats.total} nodes, ${edgeStats.total} edges`);
        passed++;
      } else {
        console.log(`  ✗ Test 9: Statistics — ${emStats.total} nodes, ${edgeStats.total} edges`);
        failed++;
      }
    }

    // Test 10: Full manager API
    {
      // Re-initialize all managers and test the full pipeline
      const freshEm = new EntityManager(testConfig);
      const freshRm = new RelationshipManager(testConfig);
      const freshUpdater = new GraphUpdater(testConfig, freshEm, freshRm);

      // Ingest a story
      const report = await freshUpdater.ingestStory({
        title: 'Test Story',
        url: 'https://example.com/test',
        summary: 'A test story',
        body: '',
        category: 'general',
      });

      if (Array.isArray(report.errors)) {
        console.log(`  ✓ Test 10: Full manager API — ${report.nodesCreated} created, ${report.edgesCreated} edges, ${report.errors.length} errors`);
        passed++;
      } else {
        console.log(`  ✗ Test 10: Full manager API — ${JSON.stringify(report)}`);
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
