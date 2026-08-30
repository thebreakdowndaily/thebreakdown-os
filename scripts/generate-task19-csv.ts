import { getStore } from '../utils/data-layer/store';
import { buildEvidenceGraph } from '../lib/graph/evidence-graph';
import * as fs from 'fs';

const store = getStore();
const stories = Array.from(store.stories.values());
const graph = buildEvidenceGraph(stories);

let nodesCsv = 'id,type,label\n';
for (const node of graph.nodes) {
  const label = node.label.replace(/"/g, '""').replace(/\n/g, ' ');
  nodesCsv += `"${node.id}","${node.type}","${label}"\n`;
}

fs.writeFileSync('audit/task-19/01-graph-nodes.csv', nodesCsv);

let edgesCsv = 'source,target,type\n';
for (const edge of graph.edges) {
  edgesCsv += `"${edge.source}","${edge.target}","${edge.type}"\n`;
}

fs.writeFileSync('audit/task-19/02-graph-edges.csv', edgesCsv);

console.log('CSV files generated successfully.');
