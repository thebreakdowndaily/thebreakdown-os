// scripts/prepare-artifacts.js
// Ensure the artifacts directory exists before any verification steps.
const fs = require('fs');
const path = require('path');

const artifactsDir = path.resolve(__dirname, '..', 'artifacts');
if (!fs.existsSync(artifactsDir)) {
  fs.mkdirSync(artifactsDir, { recursive: true });
  console.log('✅ Created artifacts directory');
} else {
  console.log('✅ Artifacts directory already exists');
}
process.exit(0);
