import assert from 'node:assert';
import {
  getAllTrackers,
  getTrackerBySlug,
  getTrackersForTopic,
  getTrackersForStory,
} from '../../lib/trackers/registry';
import { pmfbyTracker } from '../../lib/trackers/pmfby-tracker';

console.log('--- RUNNING PMFBY (CROP INSURANCE) TRACKER TESTS ---');

// 1. Registry & Lookup
const trackers = getAllTrackers();
assert(trackers.length >= 4, `Expected at least 4 registered trackers, found ${trackers.length}`);
assert(trackers.some((t) => t.id === 'pmfby'), 'PMFBY tracker not found in getAllTrackers()');

const pmfby = getTrackerBySlug('pmfby');
assert(pmfby !== undefined, 'PMFBY tracker should resolve by slug "pmfby"');
assert.strictEqual(pmfby.id, 'pmfby');
assert.strictEqual(pmfby.topicSlug, 'agriculture');
console.log('  ✓ PASS: PMFBY tracker registered and resolvable by slug');

// 2. Data Integrity & Key Metrics
assert(Array.isArray(pmfby.keyDataPoints) && pmfby.keyDataPoints.length >= 5, 'PMFBY tracker missing key data points');
const premiumMetric = pmfby.keyDataPoints.find((dp) => dp.label.includes('Gross Premium'));
assert(premiumMetric !== undefined, 'Gross Premium metric missing');
assert(premiumMetric.value.includes('31,450'), 'Premium should reflect ₹31,450 Crore');

const penaltyMetric = pmfby.keyDataPoints.find((dp) => dp.label.includes('Penalty'));
assert(penaltyMetric !== undefined, 'Penalty metric missing');
assert(penaltyMetric.value.includes('12%'), 'Penalty must reflect 12% penal interest');
console.log('  ✓ PASS: Key metrics reflect verified statutory data (₹31,450 Cr, 12% penal interest)');

// 3. Time Series Validation
assert(Array.isArray(pmfby.timeSeries) && pmfby.timeSeries.length >= 2, 'PMFBY tracker should have at least 2 time series');
const settlementSeries = pmfby.timeSeries.find((ts) => ts.id === 'pmfby-claims-settlement-trend');
assert(settlementSeries !== undefined, 'pmfby-claims-settlement-trend time series missing');
assert.strictEqual(settlementSeries.data.length, 10, 'Expected 10 years of settlement data (2016-2026)');
assert.strictEqual(settlementSeries.data[0].date, '2016-17');
assert.strictEqual(settlementSeries.data[9].date, '2025-26');
console.log('  ✓ PASS: Decadal claim settlement trend data intact and verified');

// 4. Topic and Story Linking
const topicTrackers = getTrackersForTopic('agriculture');
assert(topicTrackers.some((t) => t.id === 'pmfby'), 'Expected PMFBY tracker under agriculture topic');

const storyTrackers = getTrackersForStory('pm-fasal-bima-claims');
assert(storyTrackers.some((t) => t.id === 'pmfby'), 'Expected PMFBY tracker linked to pm-fasal-bima-claims story');
console.log('  ✓ PASS: Topic and Story cross-linking verified');

// 5. Document Provenance
assert(Array.isArray(pmfby.documents) && pmfby.documents.length >= 3, 'PMFBY tracker missing primary documents');
const cagDoc = pmfby.documents.find((d) => d.title.includes('CAG') || d.title.includes('Performance Audit'));
assert(cagDoc !== undefined, 'CAG Report 2024 document missing');
assert(cagDoc.publisher.includes('CAG') || cagDoc.publisher.includes('Comptroller'), 'Publisher should be CAG');
console.log('  ✓ PASS: Primary document provenance and publisher attribution verified');

console.log('ALL PMFBY TRACKER TESTS PASSED!\n');
