/**
 * scripts/verify-aeo-geo-loopback.ts
 * Master Closed-Loop Verification Gate for AEO / GEO Engine.
 *
 * Runs all forensic audits, schema assertions, graph checks, adversarial suites,
 * and discovery endpoints in a single unified pipeline.
 *
 * Governing documents:
 *   - docs/aeo-geo/architecture.md
 *   - docs/aeo-geo/loopback-baseline.md
 *   - AGENTS.md (Definition of Done & Platform Beta Rules)
 */

import { execSync } from 'child_process';
import path from 'path';

interface GateStep {
  name: string;
  command: string;
}

const steps: GateStep[] = [
  { name: '1. Forensic Schema.org & JSON-LD Validator', command: 'npx tsx scripts/validate-schema.ts' },
  { name: '2. Entity & Citation Graph Integrity Audit', command: 'npx tsx scripts/audit-entity-graph.ts' },
  { name: '3. Rendered Page Metadata & Canonical Audit', command: 'npx tsx scripts/audit-rendered-pages.ts' },
  { name: '4. GEO Measurement Adversarial Stress Suite', command: 'npx tsx tests/geo-measurement-stress.test.ts' },
  { name: '5. Security, SSRF & Adversarial Crawler Suite', command: 'npx tsx tests/aeo-geo-adversarial.test.ts' },
  { name: '6. Database Migration Safety Gate', command: 'npx tsx scripts/verify-migrations.ts' },
];

console.log('═════════════════════════════════════════════════════════════════════');
console.log('THE BREAKDOWN OS — AEO/GEO CLOSED-LOOP MASTER VERIFICATION GATE');
console.log('═════════════════════════════════════════════════════════════════════\n');

let allPassed = true;
const results: Array<{ step: string; status: 'PASS' | 'FAIL'; durationMs: number }> = [];

for (const step of steps) {
  process.stdout.write(`⏳ Running: ${step.name}... `);
  const start = Date.now();
  try {
    execSync(step.command, {
      cwd: path.resolve(__dirname, '..'),
      stdio: ['ignore', 'pipe', 'pipe'],
      encoding: 'utf-8',
    });
    const durationMs = Date.now() - start;
    console.log(`✅ PASS (${durationMs}ms)`);
    results.push({ step: step.name, status: 'PASS', durationMs });
  } catch (error: any) {
    const durationMs = Date.now() - start;
    console.log(`❌ FAIL (${durationMs}ms)`);
    if (error.stdout) console.log(error.stdout.toString().slice(0, 1000));
    if (error.stderr) console.error(error.stderr.toString().slice(0, 1000));
    results.push({ step: step.name, status: 'FAIL', durationMs });
    allPassed = false;
  }
}

console.log('\n═════════════════════════════════════════════════════════════════════');
console.log('GATE EXECUTION SUMMARY:');
console.log('═════════════════════════════════════════════════════════════════════');
for (const r of results) {
  console.log(`[${r.status}] ${r.step} (${r.durationMs}ms)`);
}
console.log('─────────────────────────────────────────────────────────────────────');

if (allPassed) {
  console.log('🎉 ALL AEO/GEO MASTER VERIFICATION GATES PASSED (100% GREEN)!\n');
  process.exit(0);
} else {
  console.error('💥 MASTER VERIFICATION GATE FAILED. See errors above.\n');
  process.exit(1);
}
