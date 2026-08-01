// scripts/generate_audit_id.js
// Generates a unique audit identifier and writes it to audit/audit_id.txt
const fs = require('fs');
const path = require('path');

function generateId() {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const rand = Math.floor(Math.random() * 1000);
  return `AUD-${date}-RC${rand}`;
}

const auditId = generateId();
const outDir = path.resolve(__dirname, '..', 'audit');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}
fs.writeFileSync(path.join(outDir, 'audit_id.txt'), auditId + '\n');
console.log('Audit ID written:', auditId);
