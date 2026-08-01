// scripts/assemble_report.js
// Consumes normalized evidence + evaluation summary and writes audit_report.md
// at the repository root with traceable links to raw/normalized artifacts.
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const rawDir = path.join(root, 'audit', 'raw');
const normalizedDir = path.join(root, 'audit', 'normalized');
const reportsDir = path.join(root, 'audit', 'reports');
const outPath = path.join(root, 'audit_report.md');

function readJson(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (e) {
    return null;
  }
}

function listFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith('.json'))
    .map((f) => {
      const full = path.join(dir, f);
      const stat = fs.statSync(full);
      return { name: f, size: stat.size };
    })
    .sort((a, b) => a.name.localeCompare(b.name));
}

const env = readJson(path.join(root, 'audit', 'environment.json'));
const evalSummary = readJson(path.join(reportsDir, 'evaluation_summary.json'));
const pluginAudit = readJson(path.join(normalizedDir, 'plugin_audit.normalized.json'));
const lighthouse = readJson(path.join(normalizedDir, 'lighthouse_result.normalized.json'));
const auditId = (fs.existsSync(path.join(root, 'audit', 'audit_id.txt'))
  ? fs.readFileSync(path.join(root, 'audit', 'audit_id.txt'), 'utf8')
  : 'unknown'
).trim();

const rawFiles = listFiles(rawDir);
const normalizedFiles = listFiles(normalizedDir);

const size = (bytes) => (bytes >= 1024 ? `${(bytes / 1024).toFixed(1)} KB` : `${bytes} B`);

const lines = [];
lines.push('# The Breakdown — Audit Report');
lines.push('');
lines.push(`**Audit ID:** \`${auditId}\``);
lines.push('');
lines.push(`**Generated:** ${new Date().toISOString()}`);
lines.push('');
lines.push(
  evalSummary && evalSummary.launchGatePassed
    ? '**Launch gate:** ✅ PASSED'
    : '**Launch gate:** ❌ BLOCKED'
);
lines.push('');
lines.push('---');
lines.push('');

// Environment
lines.push('## 1. Environment');
lines.push('');
lines.push('| Key | Value |');
lines.push('|-----|-------|');
if (env) {
  lines.push(`| Commit | \`${env.git?.commit}\` |`);
  lines.push(`| Branch | \`${env.git?.branch}\` |`);
  lines.push(`| Working tree | ${env.git?.dirty ? 'dirty' : 'clean'} |`);
  lines.push(`| Node.js | ${env.node} |`);
  lines.push(`| npm | ${env.npm} |`);
  lines.push(`| OS | ${env.os} |`);
  lines.push(`| Next.js | ${env.next} |`);
  lines.push(`| React | ${env.react} |`);
  lines.push(`| Timestamp | ${env.timestamp} |`);
} else {
  lines.push('| environment.json missing | - |');
}
lines.push('');
lines.push('---');
lines.push('');

// Launch gates
lines.push('## 2. Launch Gates');
lines.push('');
lines.push('| Gate | Required | Result | Detail | Evidence |');
lines.push('|------|:--------:|:------:|--------|----------|');
if (evalSummary && evalSummary.gates) {
  for (const g of evalSummary.gates) {
    const status = g.required ? (g.passed ? '✅ PASS' : '❌ FAIL') : g.passed ? '✅ PASS' : '⚠️ INFO';
    const link = g.source && g.source.startsWith('audit/') ? g.source : `audit/reports/${evalSummary.basename || ''}`;
    lines.push(
      `| ${g.label} | ${g.required ? 'yes' : 'no'} | ${status} | ${g.detail || ''} | [link](${link}) |`
    );
  }
} else {
  lines.push('| evaluation_summary.json missing | | | | |');
}
lines.push('');
lines.push('---');
lines.push('');

// Raw evidence
lines.push('## 3. Raw Evidence (`audit/raw/`)');
lines.push('');
lines.push('| Artifact | Size | Link |');
lines.push('|----------|------|------|');
for (const f of rawFiles) {
  lines.push(`| ${f.name} | ${size(f.size)} | [open](audit/raw/${f.name}) |`);
}
lines.push('');
lines.push('---');
lines.push('');

// Normalized evidence
lines.push('## 4. Normalized Evidence (`audit/normalized/`)');
lines.push('');
lines.push('| Artifact | Size | Link |');
lines.push('|----------|------|------|');
for (const f of normalizedFiles) {
  lines.push(`| ${f.name} | ${size(f.size)} | [open](audit/normalized/${f.name}) |`);
}
lines.push('');
lines.push('---');
lines.push('');

// Plugin audit
lines.push('## 5. Platform Health (Audit-as-Code framework)');
lines.push('');
if (pluginAudit && pluginAudit.results) {
  lines.push(`**Platform Health Score:** ${pluginAudit.platformHealthScore.toFixed(1)} / 100`);
  lines.push('');
  lines.push('| Plugin | State | Score | Coverage |');
  lines.push('|--------|:-----:|------:|---------:|');
  for (const r of pluginAudit.results) {
    const score = typeof r.data?.score === 'number' ? r.data.score : '—';
    const cov = typeof r.data?.coverage === 'number' ? r.data.coverage : '—';
    lines.push(`| ${r.pluginName} | ${r.state} | ${score} | ${cov} |`);
  }
} else {
  lines.push('Plugin audit evidence missing.');
}
lines.push('');
lines.push('---');
lines.push('');

// Lighthouse
lines.push('## 6. Lighthouse Scores');
lines.push('');
if (lighthouse && lighthouse.categories) {
  lines.push('| Category | Score |');
  lines.push('|----------|------:|');
  for (const [key, value] of Object.entries(lighthouse.categories)) {
    if (typeof value === 'number') lines.push(`| ${key} | ${value} |`);
  }
  lines.push('');
  lines.push(`Full report: [lighthouse.report.json](audit/reports/lighthouse.report.json) · [lighthouse.report.html](audit/reports/lighthouse.report.html)`);
} else {
  lines.push('Lighthouse evidence missing.');
}
lines.push('');
lines.push('---');
lines.push('');

// Gaps
lines.push('## 7. Known Gaps & Limitations');
lines.push('');
lines.push('- Every gate above is derived from captured evidence files under `audit/raw/`; no value is asserted without a traceable artifact.');
lines.push('- Evidence is reproducible via `bash scripts/run_audit.sh` from a clean checkout at the recorded commit.');
if (evalSummary) {
  const failed = evalSummary.gates.filter((g) => g.required && !g.passed).map((g) => g.id);
  if (failed.length > 0) {
    lines.push(`- **Open required gates:** ${failed.join(', ')}.`);
  } else {
    lines.push('- No open required gates.');
  }
}
lines.push('');

fs.writeFileSync(outPath, lines.join('\n'));
console.log(`Audit report written to audit_report.md`);
