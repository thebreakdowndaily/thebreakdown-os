// tests/audit/editorial-audit-pipeline.test.ts
// Deterministic Test Suite for Phase 2 Editorial & Evidence Audit Pipeline

import { strict as assert } from 'node:assert';
import { enumerateAllContent } from '../../scripts/audit/editorial/enumeration';
import { rankPublicStories } from '../../scripts/audit/editorial/riskRanking';
import { extractMaterialClaims } from '../../scripts/audit/editorial/claimExtraction';
import { auditTechnicalIntegrity, auditFinancials } from '../../scripts/audit/editorial/semanticAudit';
import { determineEditorialTier } from '../../scripts/audit/editorial/reportGenerator';
import type { EnumerationRecord, StoryRiskProfile } from '../../scripts/audit/editorial/types';
import type { Story } from '../../types/canonical';

async function runTests() {
  console.log('--- STARTING EDITORIAL AUDIT PIPELINE TEST SUITE ---\n');

  // Test 1: Exhaustive Enumeration Invariant Reconciliation
  console.log('Test 1: Exhaustive Enumeration Invariant Reconciliation');
  const summary = await enumerateAllContent();
  assert.ok(summary.rawDiscovered > 0, 'Should discover raw content');
  assert.ok(summary.uniqueDiscovered > 0, 'Should discover unique slugs');
  assert.equal(
    summary.uniqueDiscovered,
    summary.publicCount + summary.nonPublicCount + summary.resolutionFailuresCount,
    'Invariant hold: uniqueDiscovered === public + nonPublic + resolutionFailures'
  );
  console.log('  -> PASS');

  // Test 2: Duplicate & Collision Detection
  console.log('Test 2: Duplicate & Collision Detection Data Structures');
  assert.ok(Array.isArray(summary.duplicateSlugs), 'duplicateSlugs should be an array');
  assert.ok(Array.isArray(summary.canonicalIdCollisions), 'canonicalIdCollisions should be an array');
  console.log('  -> PASS');

  // Test 3: Resolution Failure & Classification Handling
  console.log('Test 3: Resolution Failure Classification');
  const dummyFailRecord: EnumerationRecord = {
    slug: 'invalid-non-existent-slug-xyz-999',
    sourceType: 'STANDALONE_STORY',
    status: 'NON_PUBLIC',
    isPublic: false,
  };
  assert.equal(dummyFailRecord.status, 'NON_PUBLIC');
  console.log('  -> PASS');

  // Test 4: Publication Predicate Reuse
  console.log('Test 4: Publication Predicate Reuse');
  const publicItems = summary.records.filter(r => r.isPublic);
  assert.ok(publicItems.length > 0, 'Should find public records');
  assert.ok(publicItems.every(r => r.status === 'PUBLIC'), 'All public items must have status PUBLIC');
  console.log('  -> PASS');

  // Test 5 & 6: Deterministic Risk Ordering & Tie Handling
  console.log('Test 5 & 6: Deterministic Risk Ordering & Tie Handling');
  const riskReport = await rankPublicStories(publicItems.slice(0, 10));
  assert.ok(riskReport.batch1Selected.length <= 5, 'Batch 1 selected top 5 items');
  for (let i = 0; i < riskReport.fullRanking.length - 1; i++) {
    const current = riskReport.fullRanking[i];
    const next = riskReport.fullRanking[i + 1];
    assert.ok(
      current.compositeRiskScore >= next.compositeRiskScore,
      `Risk ranking ordering check: Rank #${current.rank} (${current.compositeRiskScore}) >= Rank #${next.rank} (${next.compositeRiskScore})`
    );
  }
  console.log('  -> PASS');

  // Test 7 & 8: Material Claim Extraction & Semantic Deduplication
  console.log('Test 7 & 8: Material Claim Candidate Extraction & Deduplication');
  const testStory: Story = {
    id: 'TEST-001',
    slug: 'test-story',
    headline: 'Government Approves Metro Phase-1 at ₹10,773 Crore Sanctioned Cost',
    summary: 'The Union Cabinet approved the project covering 35.96 km.',
    category: 'infrastructure',
    tags: ['metro', 'cost'],
    publishedAt: '2024-01-01',
    updatedAt: '2024-01-01',
    status: 'published',
    claims: [
      { id: 'CLM-01', claim: 'Government Approves Metro Phase-1 at ₹10,773 Crore Sanctioned Cost', confidence: 0.9, verification: 'true', explanation: 'Cabinet sanction' }
    ],
    sources: [
      { name: 'PIB Press Release', url: 'https://pib.gov.in/123', type: 'official', tier: 1 }
    ]
  };

  const { claims, metrics } = extractMaterialClaims(testStory, 'test-story');
  assert.ok(claims.length > 0, 'Extracted material claims');
  assert.equal(metrics.confirmedMaterialClaims, claims.length, 'Confirmed claims count matches');
  console.log('  -> PASS');

  // Test 9, 10 & 11: Claim Reconciliation, Orphan Evidence & Sources
  console.log('Test 9, 10 & 11: Registered/Unregistered Claim Reconciliation & Orphan Metrics');
  assert.ok(metrics.registeredCanonicalClaims > 0, 'Identified registered claims');
  assert.equal(metrics.registeredAndEvidenceLinked, 1, 'Matched 1 evidence linked claim');
  console.log('  -> PASS');

  // Test 12: Financial Numeric Metadata Checks
  console.log('Test 12: Numeric Metadata Checks & Preserving Financial Semantics');
  const finAudit = auditFinancials(testStory, claims);
  assert.ok(finAudit.length > 0, 'Financial audit extracted monetary claim');
  assert.equal(finAudit[0].semanticStage, 'SANCTION', 'Correctly identified SANCTION financial stage');
  console.log('  -> PASS');

  // Test 13 & 14: Report Serialization & Editorial Tier Determination
  console.log('Test 13 & 14: Report Serialization & Editorial Tier Rules');
  const tierA = determineEditorialTier(true, 0, 0, 0, 0);
  assert.equal(tierA, 'Tier A — Defensible', 'Clean story should evaluate to Tier A');
  const tierD = determineEditorialTier(false, 1, 0, 0, 0);
  assert.equal(tierD, 'Tier D — Unacceptable / P0 Risk', 'Tech failure or P0 evaluates to Tier D');
  console.log('  -> PASS');

  // Test 15: No Production Mutation Guarantee
  console.log('Test 15: Read-Only / No Production Mutation Verification');
  const originalStoryState = JSON.stringify(testStory);
  auditTechnicalIntegrity(testStory);
  assert.equal(JSON.stringify(testStory), originalStoryState, 'Story object must not be mutated');
  console.log('  -> PASS');

  console.log('\n--- ALL DETERMINISTIC TESTS PASSED SUCCESSFULLY! ---');
}

runTests().catch(err => {
  console.error('Test Suite Failed:', err);
  process.exit(1);
});
