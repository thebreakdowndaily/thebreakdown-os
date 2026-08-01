// scripts/normalize.js
// Simple normalizer: copies raw JSON to normalized directory after basic validation.
const fs = require('fs');
const path = require('path');

const [,, rawPath] = process.argv; // e.g. audit/raw/inventory.json
if (!rawPath) {
  console.error('Usage: node scripts/normalize.js <raw-json-path>');
  process.exit(1);
}

if (!fs.existsSync(rawPath)) {
  console.error('Raw file not found:', rawPath);
  process.exit(1);
}

const data = JSON.parse(fs.readFileSync(rawPath, 'utf8'));
// For now we just pass through the data (placeholder validation)
const normalizedDir = path.resolve(__dirname, '..', 'audit', 'normalized');
if (!fs.existsSync(normalizedDir)) fs.mkdirSync(normalizedDir, { recursive: true });

const baseName = path.basename(rawPath, '.json');
const outPath = path.join(normalizedDir, `${baseName}.normalized.json`);
fs.writeFileSync(outPath, JSON.stringify(data, null, 2));
console.error('Normalized', rawPath, 'to', outPath);
