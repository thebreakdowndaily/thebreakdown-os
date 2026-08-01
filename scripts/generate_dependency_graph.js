// scripts/generate_dependency_graph.js
// Generates a basic dependency graph using madge (if installed) or a simple placeholder.
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function generateGraph() {
  try {
    // Attempt to use madge for a real graph
    const output = execSync('npx madge --json --extensions ts,tsx ./app', { stdio: 'pipe', encoding: 'utf8' });
    return JSON.parse(output);
  } catch (e) {
    // Fallback placeholder if madge not available
    return { error: 'madge not installed or failed', graph: {} };
  }
}

const graph = generateGraph();
const outDir = path.resolve(__dirname, '..', 'audit');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, 'raw', 'dependency_graph.json'), JSON.stringify(graph, null, 2));
process.stdout.write(JSON.stringify(graph, null, 2) + '\n');
