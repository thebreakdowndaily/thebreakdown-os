import assert from 'assert';
import { buildEvidenceGraph, getClaimLineage } from '../../lib/graph/evidence-graph';

async function runTests() {
  console.log('Running evidence-graph tests...');

  const mockStories = [
    {
      id: 'story-1',
      title: 'Test Story',
      sources: [
        { id: 'src-1', name: 'Source 1', url: 'http://src1.com' }
      ],
      citations: [
        { id: 'cite-1', title: 'Citation 1', url: 'http://cite1.com', status: 'approved' }
      ],
      claims: [
        {
          id: 'claim-1',
          claim: 'Test Claim 1',
          verification: 'verified',
          explanation: 'This is the evidence for claim 1.',
          source: 'Source 1',
        }
      ]
    }
  ];

  const graph = buildEvidenceGraph(mockStories);
  assert(graph.nodes.some(n => n.type === 'story' && n.id === 'story-1'), 'Missing story node');
  assert(graph.nodes.some(n => n.type === 'claim' && n.id === 'claim-1'), 'Missing claim node');
  assert(graph.nodes.some(n => n.type === 'evidence'), 'Missing evidence node');
  assert(graph.nodes.some(n => n.type === 'source' && n.id === 'src-1'), 'Missing source node');
  assert(graph.nodes.some(n => n.type === 'citation' && n.id === 'cite-1'), 'Missing citation node');

  // Verify edges
  assert(graph.edges.some(e => e.source === 'story-1' && e.target === 'claim-1' && e.type === 'references'), 'Missing story->claim edge');
  assert(graph.edges.some(e => e.source === 'story-1' && e.target === 'cite-1' && e.type === 'references'), 'Missing story->citation edge');
  assert(graph.edges.some(e => e.target === 'claim-1' && e.type === 'verifies'), 'Missing evidence->claim edge');

  const lineage = getClaimLineage(graph, 'claim-1');
  assert(lineage.nodes.some(n => n.id === 'claim-1'), 'Lineage missing claim');
  assert(lineage.nodes.some(n => n.id === 'story-1'), 'Lineage missing story');
  assert(lineage.nodes.some(n => n.type === 'evidence'), 'Lineage missing evidence');

  console.log('All tests passed.');
}

runTests().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
