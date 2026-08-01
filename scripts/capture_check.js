// scripts/capture_check.js
// Generic, reproducible evidence capture for a command-line check.
//
// Usage:
//   node scripts/capture_check.js <id> [--timeout <ms>] -- <command> [args...]
//
// Writes:
//   audit/raw/<id>_result.json  - machine-readable verdict
//   audit/raw/<id>.log          - full command output (traceability)
//
// A non-zero exit code is captured as evidence (passed:false) but does NOT
// abort the pipeline by itself; launch-gate evaluation decides the verdict.
const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const dashIdx = args.indexOf('--');
if (dashIdx === -1 || dashIdx === 0) {
  console.error('Usage: node scripts/capture_check.js <id> [--timeout <ms>] -- <command> [args...]');
  process.exit(1);
}

const id = args[0];
const commandArgs = args.slice(dashIdx + 1);
if (commandArgs.length === 0) {
  console.error(`No command provided for check "${id}".`);
  process.exit(1);
}

let timeoutMs = 15 * 60 * 1000; // default 15 minutes
const timeoutIdx = args.indexOf('--timeout');
if (timeoutIdx !== -1 && args[timeoutIdx + 1]) {
  timeoutMs = Number(args[timeoutIdx + 1]);
}

const root = path.resolve(__dirname, '..');
const rawDir = path.join(root, 'audit', 'raw');
fs.mkdirSync(rawDir, { recursive: true });

const logPath = path.join(rawDir, `${id}.log`);
const resultPath = path.join(rawDir, `${id}_result.json`);

const startedAt = Date.now();
const spawnResult = spawnSync(commandArgs.join(' '), {
  cwd: root,
  shell: true,
  timeout: timeoutMs,
  encoding: 'utf8',
  maxBuffer: 64 * 1024 * 1024,
  env: process.env,
});
const durationMs = Date.now() - startedAt;

const stdout = typeof spawnResult.stdout === 'string' ? spawnResult.stdout : '';
const stderr = typeof spawnResult.stderr === 'string' ? spawnResult.stderr : '';
const fullLog = `${stdout}\n${stderr}`.trim();

fs.writeFileSync(logPath, fullLog || '(no output)\n');

const timedOut = spawnResult.error && spawnResult.error.code === 'ETIMEDOUT';
const exitCode = timedOut ? null : spawnResult.status;

const result = {
  id,
  command: commandArgs.join(' '),
  timestamp: new Date().toISOString(),
  startedAt: new Date(startedAt).toISOString(),
  durationMs,
  exitCode,
  timedOut,
  passed: !timedOut && exitCode === 0,
  logFile: path.relative(root, logPath).replace(/\\/g, '/'),
  outputTail: fullLog.split('\n').slice(-25).join('\n'),
};

fs.writeFileSync(resultPath, JSON.stringify(result, null, 2));
process.stdout.write(JSON.stringify(result, null, 2) + '\n');
