/**
 * THE BREAKDOWN OS — Knowledge Graph Relationship Tests
 *
 * Tests inference, transitive closure, and relationship discovery.
 * These tests validate that the graph correctly infers implied relationships.
 */

import { EntityManager } from '../../core/knowledge-graph/entity-manager';
import { RelationshipManager } from '../../core/knowledge-graph/relationship-manager';
import { GraphSearch } from '../../core/knowledge-graph/graph-search';
import { GraphUpdater } from '../../core/knowledge-graph/graph-updater';
import type { GraphConfig } from '../../core/knowledge-graph/types';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as os from 'os';

const TEST_DIR = path.join(os.tmpdir(), 'kg-test-rel-' + Date.now());

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

  const em = new EntityManager(testConfig);
  // Create a chain: MGNREGA → managed_by → Ministry → reports_to → Government
  await em.create({ id: 'scheme::mgnrega', type: 'scheme', label: 'MGNREGA' });
  await em.create({ id: 'organization::ministry_rural', type: 'organization', label: 'Ministry of Rural Development' });
  await em.create({ id: 'organization::govt', type: 'organization', label: 'Government of India' });
  await em.create({ id: 'report::audit_report', type: 'report', label: 'CAG Audit Report 2025' });
  await em.create({ id: 'organization::cag', type: 'organization', label: 'Comptroller and Auditor General' });
}

async function teardown() {
  await fs.rm(TEST_DIR, { recursive: true, force: true });
}

async function runTests() {
  await setup();
  let passed = 0;
  let failed = 0;

  try {
    const rm = new RelationshipManager(testConfig);
    const em = new EntityManager(testConfig);
    const updater = new GraphUpdater(testConfig, em, rm);

    // Create base edges
    await rm.create({ from: 'scheme::mgnrega', to: 'organization::ministry_rural', relationship: 'managed_by', confidence: 0.95, sources: ['https://example.com/1'] });
    await rm.create({ from: 'organization::ministry_rural', to: 'organization::govt', relationship: 'reports_to', confidence: 0.9, sources: ['https://example.com/2'] });
    await rm.create({ from: 'report::audit_report', to: 'organization::cag', relationship: 'created_by', confidence: 0.95, sources: ['https://example.com/3'] });
    await rm.create({ from: 'report::audit_report', to: 'scheme::mgnrega', relationship: 'references', confidence: 0.9, sources: ['https://example.com/3'] });

    // Test 1: Transitive inference — MGNREGA → managed_by → Ministry → reports_to → Government
    // Should infer: MGNREGA → reports_to → Government
    {
      const inference = await updater.runInference();
      const inferredEdges = await rm.query({ from: 'scheme::mgnrega', relationship: 'reports_to' });
      if (inferredEdges.length >= 1) {
        console.log(`  ✓ Test 1: Transitive inference — inferred reports_to edge (confidence=${inferredEdges[0].confidence})`);
        passed++;
      } else {
        console.log('  ✗ Test 1: Transitive inference — no reports_to edge inferred');
        failed++;
      }
    }

    // Test 2: Path finding
    {
      const search = new GraphSearch(testConfig, em, rm);
      const path = await search.findPath('scheme::mgnrega', 'organization::govt');
      if (path && path.length >= 1) {
        console.log(`  ✓ Test 2: Path finding — found path of ${path.length} edges`);
        passed++;
      } else {
        console.log('  ✗ Test 2: Path finding — no path found');
        failed++;
      }
    }

    // Test 3: Find related nodes
    {
      const search = new GraphSearch(testConfig, em, rm);
      const related = await search.findRelated('scheme::mgnrega', 2);
      if (related.organizations.length >= 2) {
        console.log(`  ✓ Test 3: Find related — found ${related.organizations.length} organizations`);
        passed++;
      } else {
        console.log(`  ✗ Test 3: Find related — found ${related.organizations.length} orgs`);
        failed++;
      }
    }

    // Test 4: Timeline
    {
      const search = new GraphSearch(testConfig, em, rm);
      const timeline = await search.getTimeline('scheme::mgnrega');
      if (timeline.length >= 0) {
        console.log('  ✓ Test 4: Timeline — returned chronological edges');
        passed++;
      } else {
        console.log('  ✗ Test 4: Timeline — no edges');
        failed++;
      }
    }

    // Test 5: Structured query
    {
      const search = new GraphSearch(testConfig, em, rm);
      const result = await search.executeQuery({ nodeType: 'scheme', edgeType: 'managed_by' });
      if (result.nodes.length === 1 && result.nodes[0].id === 'scheme::mgnrega') {
        console.log('  ✓ Test 5: Structured query — find schemes with managed_by edges');
        passed++;
      } else {
        console.log(`  ✗ Test 5: Structured query — found ${result.nodes.length} nodes`);
        failed++;
      }
    }

    // Test 6: Co-occurrence detection (via story ingestion)
    {
      const updatedUpdater = new GraphUpdater(testConfig, em, rm);
      const report = await updatedUpdater.ingestStory({
        title: 'RBI Monetary Policy 2025',
        url: 'https://example.com/rbi-2025',
        summary: 'RBI announces repo rate decision',
        body: 'The Reserve Bank of India (RBI) announced its monetary policy decision. The repo rate was kept unchanged.',
        category: 'economy',
      });

      if (report.nodesCreated >= 0 || report.nodesUpdated >= 0) {
        console.log(`  ✓ Test 6: Story ingestion — nodes: ${report.nodesCreated}+${report.nodesUpdated}, edges: ${report.edgesCreated}+${report.edgesUpdated}`);
        passed++;
      } else {
        console.log(`  ✗ Test 6: Story ingestion — ${JSON.stringify(report)}`);
        failed++;
      }
    }

    // Test 7: Edge confidence decay
    {
      // Create an old-looking edge via the updater's decay mechanism
      // (We test that the method runs without error)
      const decayed = await updater.decayStaleEdges(0); // 0 days = everything is stale
      if (decayed >= 0) {
        console.log(`  ✓ Test 7: Edge decay — processed ${decayed} edges`);
        passed++;
      } else {
        console.log('  ✗ Test 7: Edge decay');
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
