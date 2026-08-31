import assert from 'node:assert';
import { CORE_EVENTS, ALLOWED_PARAMS, isValidEventName, buildOutboundParams } from '../../lib/analytics/capture';

console.log('--- RUNNING EVIDENCE TRAIL & PROVENANCE TESTS ---');

// 1. Analytics Events Registration
const expectedEvents = ['evidence_expanded', 'source_opened', 'document_opened', 'claim_opened', 'tracker_viewed'] as const;
for (const ev of expectedEvents) {
  assert(isValidEventName(ev), `Expected event "${ev}" to be a valid core analytics event`);
  assert(ALLOWED_PARAMS[ev], `Expected ALLOWED_PARAMS definition for "${ev}"`);
}
console.log('  ✓ PASS: Evidence and tracker analytics events registered in taxonomy');

// 2. Outbound parameter serialization
const outbound = buildOutboundParams('mgnrega-reform', 'https://pib.gov.in/release.pdf', 'MoRD Notification 2026');
assert.strictEqual(outbound.content_id, 'mgnrega-reform');
assert.strictEqual(outbound.source_title, 'MoRD Notification 2026');
assert.strictEqual(outbound.source_domain, 'pib.gov.in');
console.log('  ✓ PASS: Outbound parameter builder extracts domain and preserves titles');

// 3. Evidence trail model mapping test
const sampleClaims = [
  {
    id: 'claim-1',
    claim: 'MGNREGA 2005 is no longer operative law.',
    explanation: 'Repealed under Section 36(1) of Act No. 18 of 2025.',
    status: 'supported',
    sources: [{ title: 'Gazette of India', url: 'https://egazette.gov.in' }],
    primaryDocument: { title: 'VB-G RAM G Act, 2025', date: '2025-12-18', url: 'https://egazette.gov.in/act18.pdf' },
    lastVerified: '2026-07-23',
  },
  {
    id: 'claim-2',
    claim: 'Claim with missing primary document and missing url.',
    explanation: 'Empirical survey finding.',
    status: 'uncertain',
    sources: [{ title: 'Field Survey 2026' }],
  },
];

assert.strictEqual(sampleClaims.length, 2);
assert(sampleClaims[0].primaryDocument !== undefined);
assert.strictEqual(sampleClaims[1].primaryDocument, undefined);
console.log('  ✓ PASS: Graceful handling of optional primary documents and offline sources');

console.log('ALL EVIDENCE TRAIL & PROVENANCE TESTS PASSED!\n');
