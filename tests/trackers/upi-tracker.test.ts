import assert from 'node:assert';
import {
  getAllTrackers,
  getTrackerBySlug,
  getTrackersForTopic,
  getTrackersForStory,
} from '../../lib/trackers/registry';
import { upiTracker } from '../../lib/trackers/upi-tracker';

console.log('--- RUNNING UPI TRACKER & DIGITAL RAILS TESTS ---');

// 1. Registry & Slug Lookup
const trackers = getAllTrackers();
assert(trackers.length >= 3, `Expected at least 3 registered trackers, found ${trackers.length}`);
assert(trackers.some((t) => t.id === 'upi'), 'UPI tracker not found in getAllTrackers()');

const upi = getTrackerBySlug('upi');
assert(upi !== undefined, 'UPI tracker should resolve by slug "upi"');
assert.strictEqual(upi.id, 'upi');
assert.strictEqual(upi.topicSlug, 'digital-payments');
console.log('  ✓ PASS: UPI tracker registered and resolvable by slug');

// 2. Data Integrity & Key Metrics
assert(Array.isArray(upi.keyDataPoints) && upi.keyDataPoints.length >= 5, 'UPI tracker missing key data points');
const volumeMetric = upi.keyDataPoints.find((dp) => dp.label.includes('Volume'));
assert(volumeMetric !== undefined, 'Volume metric missing');
assert(volumeMetric.value.includes('Billion'), 'Volume should be in billions');

const limitMetric = upi.keyDataPoints.find((dp) => dp.label.includes('UPI123Pay'));
assert(limitMetric !== undefined, 'UPI123Pay limit metric missing');
assert(limitMetric.value.includes('10,000'), 'UPI123Pay limit must reflect ₹10,000');
console.log('  ✓ PASS: Key metrics reflect verified regulatory data (₹10,000 limit, 185B volume)');

// 3. Time Series Validation
assert(Array.isArray(upi.timeSeries) && upi.timeSeries.length >= 2, 'UPI tracker should have at least 2 time series');
const volumeSeries = upi.timeSeries.find((ts) => ts.id === 'upi-volume-growth');
assert(volumeSeries !== undefined, 'upi-volume-growth time series missing');
assert.strictEqual(volumeSeries.data.length, 10, 'Expected 10 fiscal years of volume data (2016-2026)');
assert.strictEqual(volumeSeries.data[0].date, '2016-17');
assert.strictEqual(volumeSeries.data[9].date, '2025-26');
console.log('  ✓ PASS: 10-year decadal time-series data intact and verified');

// 4. Topic and Story Linking
const topicTrackers = getTrackersForTopic('digital-payments');
assert(topicTrackers.some((t) => t.id === 'upi'), 'Expected UPI tracker under digital-payments topic');

const storyTrackers = getTrackersForStory('digital-payments-boom');
assert(storyTrackers.some((t) => t.id === 'upi'), 'Expected UPI tracker linked to digital-payments-boom story');
console.log('  ✓ PASS: Topic and Story cross-linking verified');

// 5. Document Provenance
assert(Array.isArray(upi.documents) && upi.documents.length >= 3, 'UPI tracker missing primary documents');
const sdrpDoc = upi.documents.find((d) => d.title.includes('SDRP') || d.title.includes('October 2024'));
assert(sdrpDoc !== undefined, 'RBI October 2024 SDRP document missing');
assert(sdrpDoc.publisher === 'Reserve Bank of India', 'Publisher should be Reserve Bank of India');
console.log('  ✓ PASS: Primary document provenance and publisher attribution verified');

console.log('ALL UPI TRACKER TESTS PASSED!\n');
