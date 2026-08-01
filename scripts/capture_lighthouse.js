// scripts/capture_lighthouse.js
// Runs Lighthouse against the running application and captures:
//   audit/reports/lighthouse.report.json + lighthouse.report.html  (full evidence)
//   audit/raw/lighthouse_result.json                                (category verdict)
//
// Requires Chrome/Edge and a reachable server (default http://localhost:3000).
const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const rawDir = path.join(root, 'audit', 'raw');
const reportsDir = path.join(root, 'audit', 'reports');
fs.mkdirSync(rawDir, { recursive: true });
fs.mkdirSync(reportsDir, { recursive: true });

const url = process.env.AUDIT_URL || 'http://localhost:3000';
const outBase = path.join(reportsDir, 'lighthouse');
const logPath = path.join(rawDir, 'lighthouse.log');
const resultPath = path.join(rawDir, 'lighthouse_result.json');
const jsonPath = `${outBase}.report.json`;

const startedAt = Date.now();
const spawnResult = spawnSync(
  `npx.cmd lighthouse ${url} --quiet --chrome-flags=--headless=new --no-sandbox --output=json --output=html --output-path=${outBase} --max-wait-for-load=60000`,
  {
    cwd: root,
    shell: true,
    timeout: 5 * 60 * 1000,
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024,
  }
);
const durationMs = Date.now() - startedAt;

const stdout = typeof spawnResult.stdout === 'string' ? spawnResult.stdout : '';
const stderr = typeof spawnResult.stderr === 'string' ? spawnResult.stderr : '';
fs.writeFileSync(logPath, `${stdout}\n${stderr}`.trim() || '(no output)\n');

const timedOut = spawnResult.error && spawnResult.error.code === 'ETIMEDOUT';

let categories = null;
if (fs.existsSync(jsonPath)) {
  try {
    const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    const cat = data.categories || {};
    categories = Object.fromEntries(
      Object.entries(cat).map(([key, value]) => [key, Math.round(value.score * 100)])
    );
    categories.performance = categories.performance ?? null;
    categories.accessibility = categories.accessibility ?? null;
    categories['best-practices'] = categories['best-practices'] ?? null;
    categories.seo = categories.seo ?? null;
  } catch (e) {
    categories = { parseError: e.message };
  }
} else {
  categories = { missing: 'lighthouse JSON report not produced' };
}

const perf = categories && typeof categories.performance === 'number' ? categories.performance : null;

const result = {
  url,
  command: 'npx lighthouse ' + url,
  timestamp: new Date().toISOString(),
  durationMs,
  timedOut,
  exitCode: spawnResult.status,
  categories,
  passed: !timedOut && spawnResult.status === 0 && perf !== null && perf >= 90,
  jsonReport: path.relative(root, jsonPath).replace(/\\/g, '/'),
  htmlReport: path.relative(root, `${outBase}.report.html`).replace(/\\/g, '/'),
  logFile: path.relative(root, logPath).replace(/\\/g, '/'),
  outputTail: stdout.split('\n').slice(-20).join('\n'),
};

fs.writeFileSync(resultPath, JSON.stringify(result, null, 2));
process.stdout.write(JSON.stringify(result, null, 2) + '\n');
