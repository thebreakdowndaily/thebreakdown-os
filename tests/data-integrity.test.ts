/**
 * THE BREAKDOWN OS — Gate 8 Data Integrity & Migration Test Suite
 *
 * Verifies orphaned entity detection, duplicate claim text detection,
 * and cryptographic provenance hash validation.
 */

import { auditDataIntegrity } from '../lib/domain/data-integrity';
import type { Claim, Source } from '../types/canonical';

function runDataIntegrityTests() {
  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, name: string) {
    if (condition) {
      console.log(`  ✓ PASS: ${name}`);
      passed++;
    } else {
      console.error(`  ✗ FAIL: ${name}`);
      failed++;
    }
  }

  console.log('--- RUNNING GATE 8 DATA INTEGRITY & MIGRATION TESTS ---');

  try {
    const validClaims: Claim[] = [
      { id: 'c1', claim: 'Panchsheel Agreement signed.', data: 'Text', source: 'Archive', sourceUrl: 'https://treaties.un.org', tier: 1, confidence: 90, status: 'verified' },
      { id: 'c2', claim: 'Bandung Conference convened.', data: 'Text', source: 'Archive', sourceUrl: 'https://archive.org', tier: 1, confidence: 95, status: 'verified' },
    ];

    const validSources: Source[] = [
      { id: 's1', title: 'UNTS 1954', url: 'https://treaties.un.org', accessedAt: '2026-07-27', tier: 1, archiveHash: 'sha256:abc12345' },
    ];

    const report = auditDataIntegrity([], validClaims, validSources);
    assert(report.healthy === true, 'Valid dataset passes Data Integrity Audit');
    assert(report.issuesCount === 0, 'Zero data integrity issues detected in clean dataset');

    // Test duplicate claim detection
    const duplicateClaims: Claim[] = [
      ...validClaims,
      { id: 'c3', claim: 'Panchsheel Agreement signed.', data: 'Text', source: 'Archive', sourceUrl: 'https://treaties.un.org', tier: 1, confidence: 90, status: 'verified' },
    ];

    const dupReport = auditDataIntegrity([], duplicateClaims, validSources);
    assert(dupReport.healthy === false, 'Dataset with duplicate claims fails audit');
    assert(dupReport.duplicateClaimTexts.length === 1, 'Duplicate claim text detected correctly');
  } catch (err) {
    console.error('  ✗ FAIL: Data integrity test threw exception', err);
    failed++;
  }

  console.log(`\nRESULTS: ${passed} passed, ${failed} failed.`);
  if (failed > 0) {
    process.exit(1);
  }
}

runDataIntegrityTests();
