// scripts/detect_dead_code.js
// Placeholder dead code detection – marks all as NOT VERIFIED
const fs = require('fs');
const path = require('path');

const report = {
  deadCode: [], // list of dead code entries (empty placeholder)
  confidence: 'Low',
  notes: 'Dead code detection not implemented – marked NOT VERIFIED'
};

const outDir = path.resolve(__dirname, '..', 'audit', 'raw');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, 'dead_code_report.json'), JSON.stringify(report, null, 2));
process.stdout.write(JSON.stringify(report, null, 2) + '\n');
