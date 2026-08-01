// scripts/capture_playwright.js
// Runs the Playwright e2e suite (chromium project) against the running
// application and captures a machine-readable verdict at audit/raw/playwright_result.json.
//
// Requires a built production server reachable on the port from playwright.config.ts
// (Playwright reuses it via reuseExistingServer).
const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const rawDir = path.join(root, 'audit', 'raw');
fs.mkdirSync(rawDir, { recursive: true });

const jsonResultsPath = path.join(rawDir, 'playwright_results.json');
const logPath = path.join(rawDir, 'playwright.log');
const resultPath = path.join(rawDir, 'playwright_result.json');

const startedAt = Date.now();
const spawnResult = spawnSync(
  'npx.cmd playwright test --project=chromium --reporter=json,list',
  {
    cwd: root,
    shell: true,
    timeout: 10 * 60 * 1000,
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024,
    env: { ...process.env, PLAYWRIGHT_JSON_OUTPUT_NAME: 'audit/raw/playwright_results.json' },
  }
);
const durationMs = Date.now() - startedAt;

const stdout = typeof spawnResult.stdout === 'string' ? spawnResult.stdout : '';
const stderr = typeof spawnResult.stderr === 'string' ? spawnResult.stderr : '';
fs.writeFileSync(logPath, `${stdout}\n${stderr}`.trim() || '(no output)\n');

const timedOut = spawnResult.error && spawnResult.error.code === 'ETIMEDOUT';

let stats = null;
if (fs.existsSync(jsonResultsPath)) {
  try {
    const data = JSON.parse(fs.readFileSync(jsonResultsPath, 'utf8'));
    const suites = [];
    const flattenSuites = (items) => {
      for (const s of items || []) {
        suites.push(s);
        flattenSuites(s.suites);
      }
    };
    flattenSuites(data.suites);
    const tests = suites.flatMap((s) => s.specs || []).flatMap((spec) => spec.tests || []);
    let passed = 0;
    let failed = 0;
    let skipped = 0;
    let timedOutTests = 0;
    for (const t of tests) {
      for (const r of t.results || []) {
        if (r.status === 'passed') passed++;
        else if (r.status === 'skipped') skipped++;
        else if (r.status === 'timedOut') timedOutTests++;
        else failed++;
      }
    }
    stats = { passed, failed, skipped, timedOut: timedOutTests, total: tests.length };
  } catch (e) {
    stats = { parseError: e.message };
  }
} else {
  stats = { missing: 'playwright JSON results not produced' };
}

const result = {
  command: 'npx playwright test --project=chromium --reporter=json,list',
  timestamp: new Date().toISOString(),
  durationMs,
  timedOut,
  exitCode: spawnResult.status,
  passed: !timedOut && spawnResult.status === 0,
  stats,
  logFile: path.relative(root, logPath).replace(/\\/g, '/'),
  resultsFile: path.relative(root, jsonResultsPath).replace(/\\/g, '/'),
  outputTail: stdout.split('\n').slice(-30).join('\n'),
};

fs.writeFileSync(resultPath, JSON.stringify(result, null, 2));
process.stdout.write(JSON.stringify(result, null, 2) + '\n');
