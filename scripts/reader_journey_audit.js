// scripts/reader_journey_audit.js
// Placeholder: no Playwright execution on Windows. Marks everything NOT VERIFIED.
const fs = require('fs');
const path = require('path');

const report = {
  journeys: [],
  confidence: 'Low',
  notes: 'Reader journey audit not executed – marked NOT VERIFIED'
};

const outDir = path.resolve(__dirname, '..', 'audit', 'raw');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, 'reader_journey_raw.json'), JSON.stringify(report, null, 2));
process.stdout.write(JSON.stringify(report, null, 2) + '\n');
