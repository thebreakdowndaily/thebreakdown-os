/**
 * ─── Evidence Vault Database Configuration & Fail-Closed Test ─────────────────
 *
 * Verifies that EvidenceVaultService fails closed when database URL is missing:
 * - STAGING_DATABASE_URL and DATABASE_URL are unset.
 * - Any query invocation throws a clear configuration error.
 * - No implicit hardcoded credentials exist.
 */

import { EvidenceVaultService } from '../../services/intelligence/evidence-vault.service';

let passed = 0;
let failed = 0;

function assert(condition: boolean, message: string) {
  if (condition) {
    console.log(`  ✓ PASS: ${message}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${message}`);
    failed++;
  }
}

async function run() {
  console.log('\n=== Testing Evidence Vault Database Configuration Fail-Closed ===\n');

  const origStaging = process.env.STAGING_DATABASE_URL;
  const origDb = process.env.DATABASE_URL;

  try {
    delete process.env.STAGING_DATABASE_URL;
    delete process.env.DATABASE_URL;

    const vault = new EvidenceVaultService();

    let threwExpected = false;
    try {
      await vault.findByRawSha256('0'.repeat(64));
    } catch (err: any) {
      if (/Evidence vault database is not configured/i.test(err?.message)) {
        threwExpected = true;
      }
    }
    assert(threwExpected, 'EvidenceVaultService fails closed when database URL is unset');

    let threwOnRetrieve = false;
    try {
      await vault.getArtifactMetadata('11111111-1111-1111-1111-111111111111');
    } catch (err: any) {
      if (/Evidence vault database is not configured/i.test(err?.message)) {
        threwOnRetrieve = true;
      }
    }
    assert(threwOnRetrieve, 'getArtifactMetadata fails closed when database URL is unset');
  } finally {
    if (origStaging !== undefined) process.env.STAGING_DATABASE_URL = origStaging;
    else delete process.env.STAGING_DATABASE_URL;

    if (origDb !== undefined) process.env.DATABASE_URL = origDb;
    else delete process.env.DATABASE_URL;
  }

  console.log(`\nResults: ${passed} passed, ${failed} failed.\n`);
  if (failed > 0) process.exit(1);
}

run().catch((err) => {
  console.error('Fatal error in test:', err);
  process.exit(1);
});
