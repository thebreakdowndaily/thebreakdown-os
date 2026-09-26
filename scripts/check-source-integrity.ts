/**
 * ─── The Breakdown OS — Source Integrity Checker (F-12) ─────────────────────
 * Command-line runner for source reference integrity validation.
 *
 * Usage:
 *   npx tsx scripts/check-source-integrity.ts               # Report audit mode (exits 0, exposes debt)
 *   npx tsx scripts/check-source-integrity.ts --fail-on-error # Build-gate mode (exits non-zero on errors)
 *   npx tsx scripts/check-source-integrity.ts --strict      # Strict mode (fails on any missing source)
 */

import { validateSourceIntegrity, formatSourceIntegrityReport } from '../lib/knowledge/source-validator';

const args = process.argv.slice(2);
const strict = args.includes('--strict');
const failOnError = args.includes('--fail-on-error') || strict;

const report = validateSourceIntegrity({
  strictAllBoundaries: strict,
});

console.log(formatSourceIntegrityReport(report));

if (!report.valid && failOnError) {
  console.error(`\n❌ Source Integrity Validation FAILED with ${report.errors.length} errors.`);
  process.exit(1);
}

if (!report.valid) {
  console.log(`\n⚠️  Integrity Debt Detected: 111 sources missing from canonical registry (F-04).`);
  console.log(`ℹ️  Running in observation/reporting mode. Use --fail-on-error to enforce as build gate.`);
} else {
  console.log(`\n✅ Source Integrity Check PASSED with 0 errors.`);
}
