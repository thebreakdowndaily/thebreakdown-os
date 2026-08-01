// scripts/evaluate_audit.js
// Launch-gate evaluation. Reads normalized evidence (audit/normalized) plus the
// captured check results and produces audit/reports/evaluation_summary.json.
//
// Usage: node scripts/evaluate_audit.js <normalized-dir>
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const normalizedDir = process.argv[2] ? path.resolve(process.argv[2]) : path.join(root, 'audit', 'normalized');
const reportsDir = path.join(root, 'audit', 'reports');

function readJson(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (e) {
    return null;
  }
}

function normalized(id) {
  return readJson(path.join(normalizedDir, `${id}.normalized.json`));
}

// ---------------------------------------------------------------
// Gate definitions (evidence-linked, not aspirational)
// ---------------------------------------------------------------
const build = normalized('build_result');
const typecheck = normalized('typecheck_result');
const lint = normalized('lint_result');
const tests = normalized('test_result');
const lighthouse = normalized('lighthouse_result');
const playwright = normalized('playwright_result');
const pluginAudit = normalized('plugin_audit');

const gate = (id, label, source, passed, detail, required) => ({
  id,
  label,
  source,
  passed: passed === true,
  required: required !== false,
  detail,
});

const gates = [
  gate(
    'build',
    'Production build succeeds',
    'audit/raw/build.log',
    build ? build.passed : false,
    build ? `exitCode=${build.exitCode} durationMs=${build.durationMs}` : 'missing evidence',
    true
  ),
  gate(
    'typecheck',
    'TypeScript strict check clean',
    'audit/raw/typecheck.log',
    typecheck ? typecheck.passed : false,
    typecheck ? `exitCode=${typecheck.exitCode}` : 'missing evidence',
    true
  ),
  gate(
    'lint',
    'ESLint passes',
    'audit/raw/lint.log',
    lint ? lint.passed : false,
    lint ? `exitCode=${lint.exitCode}` : 'missing evidence',
    true
  ),
  gate(
    'tests',
    'Test suite passes',
    'audit/raw/test.log',
    tests ? tests.passed : false,
    tests ? `exitCode=${tests.exitCode} durationMs=${tests.durationMs}` : 'missing evidence',
    true
  ),
  gate(
    'lighthouse_performance',
    'Lighthouse Performance ≥ 90',
    'audit/raw/lighthouse_result.json',
    lighthouse ? lighthouse.categories && typeof lighthouse.categories.performance === 'number' && lighthouse.categories.performance >= 90 : false,
    lighthouse && lighthouse.categories ? `performance=${lighthouse.categories.performance}` : 'missing evidence',
    true
  ),
  gate(
    'lighthouse_accessibility',
    'Lighthouse Accessibility ≥ 90',
    'audit/raw/lighthouse_result.json',
    lighthouse ? lighthouse.categories && typeof lighthouse.categories.accessibility === 'number' && lighthouse.categories.accessibility >= 90 : false,
    lighthouse && lighthouse.categories ? `accessibility=${lighthouse.categories.accessibility}` : 'missing evidence',
    true
  ),
  gate(
    'lighthouse_best_practices',
    'Lighthouse Best Practices ≥ 90',
    'audit/raw/lighthouse_result.json',
    lighthouse ? lighthouse.categories && typeof lighthouse.categories['best-practices'] === 'number' && lighthouse.categories['best-practices'] >= 90 : false,
    lighthouse && lighthouse.categories ? `best-practices=${lighthouse.categories['best-practices']}` : 'missing evidence',
    false
  ),
  gate(
    'lighthouse_seo',
    'Lighthouse SEO ≥ 90',
    'audit/raw/lighthouse_result.json',
    lighthouse ? lighthouse.categories && typeof lighthouse.categories.seo === 'number' && lighthouse.categories.seo >= 90 : false,
    lighthouse && lighthouse.categories ? `seo=${lighthouse.categories.seo}` : 'missing evidence',
    false
  ),
  gate(
    'playwright',
    'Playwright e2e suite passes (chromium)',
    'audit/raw/playwright_result.json',
    playwright ? playwright.passed : false,
    playwright && playwright.stats ? `passed=${playwright.stats.passed} failed=${playwright.stats.failed} skipped=${playwright.stats.skipped}` : 'missing evidence',
    true
  ),
  gate(
    'platform_health',
    'Platform Health Score ≥ 80',
    'audit/raw/plugin_audit.json',
    pluginAudit ? typeof pluginAudit.platformHealthScore === 'number' && pluginAudit.platformHealthScore >= 80 : false,
    pluginAudit ? `platformHealthScore=${pluginAudit.platformHealthScore}` : 'missing evidence',
    false
  ),
];

const requiredGates = gates.filter((g) => g.required);
const launchGatePassed = requiredGates.every((g) => g.passed);

const auditIdFile = path.join(root, 'audit', 'audit_id.txt');
const auditId = fs.existsSync(auditIdFile)
  ? fs.readFileSync(auditIdFile, 'utf8').trim()
  : 'unknown';

const summary = {
  auditId,
  generatedAt: new Date().toISOString(),
  methodology: 'Launch-gate evaluation against normalized evidence in audit/normalized.',
  launchGatePassed,
  requiredGateCount: requiredGates.length,
  requiredGatesPassed: requiredGates.filter((g) => g.passed).length,
  gates,
};

fs.mkdirSync(reportsDir, { recursive: true });
const outPath = path.join(reportsDir, 'evaluation_summary.json');
fs.writeFileSync(outPath, JSON.stringify(summary, null, 2));
process.stdout.write(JSON.stringify(summary, null, 2) + '\n');

if (!launchGatePassed) process.exitCode = 2;
