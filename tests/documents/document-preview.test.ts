import assert from 'node:assert';
import { CORE_EVENTS, ALLOWED_PARAMS, isValidEventName } from '../../lib/analytics/capture';
import { getAllTrackers } from '../../lib/trackers/registry';

console.log('--- RUNNING PRIMARY DOCUMENT PREVIEW & PROVENANCE TESTS ---');

// 1. Analytics Events
assert(isValidEventName('document_preview_opened'), 'document_preview_opened should be in CORE_EVENTS');
assert(isValidEventName('chart_interacted'), 'chart_interacted should be in CORE_EVENTS');
assert(ALLOWED_PARAMS.document_preview_opened.includes('document_title'), 'document_preview_opened missing document_title');
assert(ALLOWED_PARAMS.chart_interacted.includes('chart_id'), 'chart_interacted missing chart_id');
console.log('  ✓ PASS: document_preview_opened and chart_interacted registered in analytics taxonomy');

// 2. Document Whitelist / Approval Boundaries
const trackers = getAllTrackers();
let totalDocuments = 0;

for (const t of trackers) {
  assert(Array.isArray(t.documents) && t.documents.length > 0, `Tracker ${t.id} has no documents`);
  totalDocuments += t.documents.length;

  for (const doc of t.documents) {
    assert(doc.title && typeof doc.title === 'string', `Document in ${t.id} missing title`);
    assert(doc.type && typeof doc.type === 'string', `Document ${doc.title} missing type`);
    assert(doc.date && typeof doc.date === 'string', `Document ${doc.title} missing date`);
    assert(doc.summary && typeof doc.summary === 'string', `Document ${doc.title} missing summary`);
    if (doc.url) {
      assert(doc.url.startsWith('https://'), `Document URL for ${doc.title} must be secure HTTPS`);
    }
  }
}

assert(totalDocuments >= 10, `Expected at least 10 verified primary documents across trackers, found ${totalDocuments}`);
console.log(`  ✓ PASS: All ${totalDocuments} primary documents conform to secure provenance requirements`);

console.log('ALL PRIMARY DOCUMENT PREVIEW TESTS PASSED!\n');
