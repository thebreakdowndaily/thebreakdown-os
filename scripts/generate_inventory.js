// scripts/generate_inventory.js
// Generates a comprehensive repository inventory JSON file.
// Emits JSON to stdout (consumed by run_audit.sh -> audit/raw/inventory.json).
// Also writes a copy to audit/repository_inventory.json.

const fs = require('fs');
const path = require('path');

const SKIP_DIRS = new Set([
  'node_modules',
  '.next',
  '.git',
  'dist',
  'coverage',
  'playwright-report',
  'test-results',
  'audit_bundle',
]);

function walk(dir) {
  const entries = [];
  const items = fs.readdirSync(dir, { withFileTypes: true });
  for (const item of items) {
    const fullPath = path.join(dir, item.name);
    if (item.isDirectory()) {
      if (SKIP_DIRS.has(item.name)) continue;
      entries.push({ type: 'directory', path: fullPath });
      entries.push(...walk(fullPath));
    } else {
      entries.push({ type: 'file', path: fullPath });
    }
  }
  return entries;
}

const root = path.resolve(__dirname, '..'); // project root
const inventory = walk(root);

const outDir = path.join(root, 'audit');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir);
}

fs.writeFileSync(
  path.join(outDir, 'repository_inventory.json'),
  JSON.stringify(inventory, null, 2)
);
process.stdout.write(JSON.stringify(inventory, null, 2) + '\n');
