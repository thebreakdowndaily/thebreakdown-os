// scripts/capture_plugin_audit.js
// Runs the canonical Audit-as-Code framework (audit/plugins) and captures a
// clean evidence snapshot at audit/raw/plugin_audit.json.
//
// The framework's audit.ts exits non-zero when any plugin FAILs (including the
// mock-crash demo plugin), so this wrapper tolerates that exit code but treats
// a hard crash (no audit-report.json produced) as fatal.
const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const reportPath = path.join(root, 'audit-report.json');
const outPath = path.join(root, 'audit', 'raw', 'plugin_audit.json');

const isWindows = process.platform === 'win32';
const npxCmd = isWindows ? 'npx.cmd' : 'npx';

function run() {
  const result = spawnSync(npxCmd, ['tsx', 'audit/scripts/audit.ts'], {
    cwd: root,
    stdio: 'inherit',
    shell: false,
  });

  const written = fs.existsSync(reportPath);
  if (!written) {
    console.error('Canonical audit failed: audit-report.json was not produced.');
    process.exit(1);
  }

  let report;
  try {
    report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
  } catch (e) {
    console.error('Canonical audit produced unreadable audit-report.json:', e.message);
    process.exit(1);
  }

  // Demo/test fixtures are not evidence. Filter them out.
  const realResults = (report.results || []).filter(
    (r) => r.pluginName && !r.pluginName.startsWith('mock-') && r.pluginName !== 'hello-world'
  );

  const scores = realResults
    .filter((r) => typeof r.data?.score === 'number')
    .map((r) => r.data.score);
  const coverages = realResults
    .filter((r) => typeof r.data?.coverage === 'number')
    .map((r) => r.data.coverage);

  const snapshot = {
    capturedAt: new Date().toISOString(),
    source: 'audit/scripts/audit.ts (Audit-as-Code framework)',
    frameworkVersion: report.frameworkVersion,
    reportVersion: report.reportVersion,
    platformHealthScore:
      scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0,
    coverage: coverages.length > 0 ? coverages.reduce((a, b) => a + b, 0) / coverages.length : 0,
    successfulPlugins: realResults.filter((r) => r.state === 'PASSED').length,
    failedPlugins: realResults.filter((r) => r.state === 'FAILED').length,
    skippedPlugins: realResults.filter((r) => r.state === 'SKIPPED').length,
    results: realResults,
    frameworkExitCode: result.status ?? 1,
  };

  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(snapshot, null, 2));
  process.stdout.write(JSON.stringify(snapshot, null, 2) + '\n');
  console.error('Plugin audit snapshot written to audit/raw/plugin_audit.json');
}

run();
