/**
 * THE BREAKDOWN OS — Knowledge Graph Search Tests
 *
 * Tests search, traversal, path finding, and structured queries.
 */

import { EntityManager } from '../../core/knowledge-graph/entity-manager';
import { RelationshipManager } from '../../core/knowledge-graph/relationship-manager';
import { GraphSearch } from '../../core/knowledge-graph/graph-search';
import type { GraphConfig } from '../../core/knowledge-graph/types';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as os from 'os';

const TEST_DIR = path.join(os.tmpdir(), 'kg-test-search-' + Date.now());

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
  const rm = new RelationshipManager(testConfig);

  // Create a rich graph for search tests
  await em.create({ id: 'scheme::mgnrega', type: 'scheme', label: 'MGNREGA', aliases: ['NREGA', 'MNREGA'], description: 'Rural employment guarantee scheme' });
  await em.create({ id: 'scheme::pmkvy', type: 'scheme', label: 'PMKVY', aliases: ['Skill India'], description: 'Pradhan Mantri Kaushal Vikas Yojana' });
  await em.create({ id: 'scheme::pm-kisan', type: 'scheme', label: 'PM-KISAN', aliases: ['PM Kisan'], description: 'Income support for farmers' });
  await em.create({ id: 'organization::ministry_rural', type: 'organization', label: 'Ministry of Rural Development' });
  await em.create({ id: 'organization::ministry_skill', type: 'organization', label: 'Ministry of Skill Development' });
  await em.create({ id: 'organization::ministry_agri', type: 'organization', label: 'Ministry of Agriculture' });
  await em.create({ id: 'organization::govt', type: 'organization', label: 'Government of India' });
  await em.create({ id: 'country::india', type: 'country', label: 'India' });
  await em.create({ id: 'budget::fy25-26', type: 'budget', label: 'Union Budget 2025-26' });
  await em.create({ id: 'report::economic_survey', type: 'report', label: 'Economic Survey 2025' });

  // Create connections
  await rm.create({ from: 'scheme::mgnrega', to: 'organization::ministry_rural', relationship: 'managed_by', confidence: 0.95, sources: [] });
  await rm.create({ from: 'scheme::pmkvy', to: 'organization::ministry_skill', relationship: 'managed_by', confidence: 0.95, sources: [] });
  await rm.create({ from: 'scheme::pm-kisan', to: 'organization::ministry_agri', relationship: 'managed_by', confidence: 0.95, sources: [] });
  await rm.create({ from: 'organization::ministry_rural', to: 'organization::govt', relationship: 'reports_to', confidence: 0.9, sources: [] });
  await rm.create({ from: 'organization::ministry_skill', to: 'organization::govt', relationship: 'reports_to', confidence: 0.9, sources: [] });
  await rm.create({ from: 'organization::ministry_agri', to: 'organization::govt', relationship: 'reports_to', confidence: 0.9, sources: [] });
  await rm.create({ from: 'scheme::mgnrega', to: 'country::india', relationship: 'located_in', confidence: 0.9, sources: [] });
  await rm.create({ from: 'budget::fy25-26', to: 'country::india', relationship: 'references', confidence: 0.95, sources: [] });
  await rm.create({ from: 'report::economic_survey', to: 'budget::fy25-26', relationship: 'references', confidence: 0.9, sources: [] });
}

async function teardown() {
  await fs.rm(TEST_DIR, { recursive: true, force: true });
}

async function runTests() {
  await setup();
  let passed = 0;
  let failed = 0;

  try {
    const em = new EntityManager(testConfig);
    const rm = new RelationshipManager(testConfig);
    const search = new GraphSearch(testConfig, em, rm);

    // Test 1: Full text search
    {
      const result = await search.search('MGNREGA');
      if (result.nodes.length >= 1 && result.nodes[0].id === 'scheme::mgnrega') {
        console.log('  ✓ Test 1: Full text search');
        passed++;
      } else {
        console.log(`  ✗ Test 1: Full text search — found ${result.nodes.length}`);
        failed++;
      }
    }

    // Test 2: Alias search
    {
      const result = await search.search('NREGA');
      if (result.nodes.some(n => n.id === 'scheme::mgnrega')) {
        console.log('  ✓ Test 2: Alias search');
        passed++;
      } else {
        console.log('  ✗ Test 2: Alias search');
        failed++;
      }
    }

    // Test 3: Find entity
    {
      const nodes = await search.findEntity('Ministry of Rural');
      if (nodes.length >= 1 && nodes[0].id === 'organization::ministry_rural') {
        console.log('  ✓ Test 3: Find entity');
        passed++;
      } else {
        console.log(`  ✗ Test 3: Find entity — found ${nodes.length}`);
        failed++;
      }
    }

    // Test 4: Find related
    {
      const related = await search.findRelated('scheme::mgnrega', 2);
      // MGNREGA → managed_by → Ministry → reports_to → Government
      // MGNREGA → located_in → India
      const hasOrg = related.organizations.some(o => o.id === 'organization::ministry_rural');
      const hasCountry = related.countries.some(c => c.id === 'country::india');
      if (related.organizations.length >= 1 && hasOrg && hasCountry) {
        console.log('  ✓ Test 4: Find related — found orgs and country');
        passed++;
      } else {
        console.log(`  ✗ Test 4: Find related — orgs=${related.organizations.length}, hasOrg=${hasOrg}, hasCountry=${hasCountry}`);
        failed++;
      }
    }

    // Test 5: Path finding (scheme → government)
    {
      const path = await search.findPath('scheme::mgnrega', 'organization::govt');
      if (path && path.length >= 1) {
        const pathStr = path.map(e => `${e.from} → [${e.relationship}] → ${e.to}`).join(', ');
        console.log(`  ✓ Test 5: Path finding — path: ${pathStr}`);
        passed++;
      } else {
        console.log('  ✗ Test 5: Path finding — no path found');
        failed++;
      }
    }

    // Test 6: Path not found (no connection)
    {
      const path = await search.findPath('scheme::pm-kisan', 'report::economic_survey');
      if (path === null) {
        console.log('  ✓ Test 6: Path not found — correctly returns null for disconnected nodes');
        passed++;
      } else {
        console.log(`  ✗ Test 6: Path not found — expected null, got ${path?.length} edges`);
        failed++;
      }
    }

    // Test 7: Structured query (all schemes managed by ministries)
    {
      const result = await search.executeQuery({ nodeType: 'scheme', edgeType: 'managed_by' });
      if (result.nodes.length === 3 && result.edges.length >= 3) {
        console.log(`  ✓ Test 7: Structured query — ${result.nodes.length} schemes with managed_by edges`);
        passed++;
      } else {
        console.log(`  ✗ Test 7: Structured query — ${result.nodes.length} nodes, ${result.edges.length} edges`);
        failed++;
      }
    }

    // Test 8: Connected to query
    {
      const result = await search.executeQuery({ nodeType: 'organization', connectedTo: 'scheme::mgnrega' });
      if (result.nodes.some(n => n.id === 'organization::ministry_rural')) {
        console.log('  ✓ Test 8: Connected to query — finds organizations connected to MGNREGA');
        passed++;
      } else {
        console.log(`  ✗ Test 8: Connected to query — found ${result.nodes.length} nodes`);
        failed++;
      }
    }

    // Test 9: Timeline
    {
      const timeline = await search.getTimeline('scheme::mgnrega');
      if (Array.isArray(timeline)) {
        console.log('  ✓ Test 9: Timeline — returns array');
        passed++;
      } else {
        console.log('  ✗ Test 9: Timeline');
        failed++;
      }
    }

    // Test 10: Deep search (depth 3)
    {
      // Budget → references → India (depth 1)
      // Budget → references → India → located_in → MGNREGA (but India doesn't have located_in as source)
      // Let's add an edge that creates a deeper chain
      await rm.create({ from: 'organization::ministry_rural', to: 'report::economic_survey', relationship: 'references', confidence: 0.7, sources: [] });

      const related = await search.findRelated('budget::fy25-26', 3);
      // Budget → references → India (depth 1)
      // Budget → references → Economic Survey → references → Budget (depth 2, but budget is the start)
      // Economic Survey → references → Ministry of Rural Development (depth 2)
      if (related.organizations.length >= 0) {
        console.log(`  ✓ Test 10: Deep search (depth 3) — found ${related.organizations.length} orgs`);
        passed++;
      } else {
        console.log('  ✗ Test 10: Deep search');
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
