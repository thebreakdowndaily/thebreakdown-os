import { createDefaultFilters, NODE_TYPE_COLORS, NODE_TYPE_LABELS, NODE_TYPE_ICONS, RELATION_LABELS } from './types';
import { buildGraphPage, buildEntityGraphPreview, buildTopicGraphPreview } from './view-model';
import { bootstrapServices } from '@/lib/bootstrap';
import { getServices } from '@/services/registry';
import type { Services } from '@/services/registry';

function runTests() {
  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, name: string) {
    if (condition) {
      console.log(`  PASS: ${name}`);
      passed++;
    } else {
      console.error(`  FAIL: ${name}`);
      failed++;
    }
  }

  // ── Types ────────────────────────────────────────────────────

  try {
    const filters = createDefaultFilters();
    assert(typeof filters === 'object', 'createDefaultFilters returns object');
    assert(filters.story, 'default story filter is true');
    assert(filters.topic, 'default topic filter is true');
    assert(filters.entity, 'default entity filter is true');
    assert(filters.country, 'default country filter is true');
    assert(filters.organization, 'default organization filter is true');
    assert(filters.policy, 'default policy filter is true');
    assert(filters.timeline, 'default timeline filter is true');
    assert(filters.dataset, 'default dataset filter is true');
    assert(filters.fix, 'default fix filter is true');
  } catch (e) {
    console.error('  FAIL: createDefaultFilters threw exception', e);
    failed++;
  }

  try {
    assert(typeof NODE_TYPE_COLORS === 'object', 'NODE_TYPE_COLORS is object');
    assert(NODE_TYPE_COLORS.story === '#3B82F6', 'story color is #3B82F6');
    assert(NODE_TYPE_COLORS.topic === '#D4A843', 'topic color is #D4A843');
    assert(NODE_TYPE_COLORS.entity === '#A855F7', 'entity color is #A855F7');
    assert(NODE_TYPE_COLORS.policy === '#22C55E', 'policy color is #22C55E');
    assert(NODE_TYPE_COLORS.organization === '#8B5CF6', 'organization color is #8B5CF6');
  } catch (e) {
    console.error('  FAIL: NODE_TYPE_COLORS threw exception', e);
    failed++;
  }

  try {
    assert(typeof NODE_TYPE_LABELS === 'object', 'NODE_TYPE_LABELS is object');
    assert(NODE_TYPE_LABELS.story === 'Story', 'story label is Story');
    assert(NODE_TYPE_LABELS.topic === 'Topic', 'topic label is Topic');
    assert(NODE_TYPE_LABELS.event === 'Event', 'event label is Event');
  } catch (e) {
    console.error('  FAIL: NODE_TYPE_LABELS threw exception', e);
    failed++;
  }

  try {
    assert(typeof NODE_TYPE_ICONS === 'object', 'NODE_TYPE_ICONS is object');
    assert(typeof NODE_TYPE_ICONS.story === 'string', 'story icon is string');
    assert(typeof NODE_TYPE_ICONS.topic === 'string', 'topic icon is string');
  } catch (e) {
    console.error('  FAIL: NODE_TYPE_ICONS threw exception', e);
    failed++;
  }

  try {
    assert(typeof RELATION_LABELS === 'object', 'RELATION_LABELS is object');
    assert(typeof RELATION_LABELS.mentions === 'string', 'mentions relation has label');
  } catch (e) {
    console.error('  FAIL: RELATION_LABELS threw exception', e);
    failed++;
  }

  // ── View Models ──────────────────────────────────────────────

  let services: Services;
  try {
    bootstrapServices();
    services = getServices();
    assert(typeof services === 'object', 'bootstrapServices returns services');
  } catch (e) {
    console.error('  FAIL: bootstrapServices threw exception', e);
    failed++;
    console.log(`\nResults: ${String(passed)} passed, ${String(failed)} failed\n`);
    process.exit(failed > 0 ? 1 : 0);
    return;
  }

  try {
    const graphPage = buildGraphPage(services);
    assert(Array.isArray(graphPage.allNodes), 'graphPage.allNodes is array');
    assert(Array.isArray(graphPage.allEdges), 'graphPage.allEdges is array');
    assert(typeof graphPage.nodeCount === 'number', 'graphPage.nodeCount is number');
    assert(typeof graphPage.edgeCount === 'number', 'graphPage.edgeCount is number');
    assert(graphPage.allNodes.length > 0, 'graphPage has at least 1 node');
    assert(graphPage.nodeCount === graphPage.allNodes.length, 'nodeCount matches allNodes length');
  } catch (e) {
    console.error('  FAIL: buildGraphPage threw exception', e);
    failed++;
  }

  try {
    const entityPreview = buildEntityGraphPreview(services, 'mgnrega');
    assert(entityPreview !== null, 'buildEntityGraphPreview(mgnrega) returns non-null');
    if (entityPreview) {
      assert(Array.isArray(entityPreview.connections), 'entity preview connections is array');
    }
  } catch (e) {
    console.error('  FAIL: buildEntityGraphPreview(mgnrega) threw exception', e);
    failed++;
  }

  try {
    const unknown = buildEntityGraphPreview(services, 'nonexistent-entity');
    assert(unknown === null, 'buildEntityGraphPreview(nonexistent) returns null');
  } catch (e) {
    console.error('  FAIL: buildEntityGraphPreview(nonexistent) threw exception', e);
    failed++;
  }

  try {
    const topicPreview = buildTopicGraphPreview(services, 'agriculture');
    assert(topicPreview !== null, 'buildTopicGraphPreview(agriculture) returns non-null');
    if (topicPreview) {
      assert(Array.isArray(topicPreview.connections), 'topic preview connections is array');
    }
  } catch (e) {
    console.error('  FAIL: buildTopicGraphPreview(agriculture) threw exception', e);
    failed++;
  }

  try {
    const unknown = buildTopicGraphPreview(services, 'nonexistent-topic');
    assert(unknown === null, 'buildTopicGraphPreview(nonexistent) returns null');
  } catch (e) {
    console.error('  FAIL: buildTopicGraphPreview(nonexistent) threw exception', e);
    failed++;
  }

  console.log(`\nResults: ${String(passed)} passed, ${String(failed)} failed\n`);
  process.exit(failed > 0 ? 1 : 0);
}

runTests();
