import assert from 'node:assert';
import {
  getAllTrackers,
  getTrackerBySlug,
  getTrackersForTopic,
  getTrackersForStory,
} from '../../lib/trackers/registry';

console.log('--- RUNNING TRACKER FRAMEWORK TESTS ---');

// 1. Registry & Collections
const trackers = getAllTrackers();
assert(trackers.length >= 2, `Expected at least 2 registered trackers, found ${trackers.length}`);
console.log(`  ✓ PASS: Registered trackers count verified (${trackers.length} active trackers)`);

// 2. Slug Lookup
const mgnrega = getTrackerBySlug('mgnrega');
assert(mgnrega !== undefined, 'MGNREGA tracker not found by slug');
assert.strictEqual(mgnrega.id, 'mgnrega');
assert.strictEqual(mgnrega.slug, 'mgnrega');

const semi = getTrackerBySlug('semiconductor');
assert(semi !== undefined, 'Semiconductor tracker not found by slug');
assert.strictEqual(semi.id, 'semiconductor');
assert.strictEqual(semi.slug, 'semiconductor');

const caseInsensitive = getTrackerBySlug('MGNREGA');
assert(caseInsensitive !== undefined, 'Slug lookup should be case-insensitive');

const unknown = getTrackerBySlug('nonexistent-tracker');
assert.strictEqual(unknown, undefined, 'Unknown slug should return undefined');
console.log('  ✓ PASS: Slug lookup and case-insensitivity verified');

// 3. Topic Resolution
const economyTrackers = getTrackersForTopic('economy');
assert(economyTrackers.some((t) => t.id === 'mgnrega'), 'Expected MGNREGA in economy topic trackers');

const techTrackers = getTrackersForTopic('technology');
assert(techTrackers.some((t) => t.id === 'semiconductor'), 'Expected Semiconductor in technology topic trackers');
console.log('  ✓ PASS: Topic to tracker mapping verified');

// 4. Story Resolution
const mgnregaStories = getTrackersForStory('mgnrega-reform');
assert(mgnregaStories.some((t) => t.id === 'mgnrega'), 'Expected MGNREGA tracker for mgnrega-reform story');

const semiStories = getTrackersForStory('semiconductor-pli');
assert(semiStories.some((t) => t.id === 'semiconductor'), 'Expected Semiconductor tracker for semiconductor-pli story');
console.log('  ✓ PASS: Story to tracker cross-linking verified');

// 5. Contract Integrity Sweep
for (const t of trackers) {
  assert(t.id && typeof t.id === 'string', `Tracker ${t.id} missing id`);
  assert(t.title && typeof t.title === 'string', `Tracker ${t.id} missing title`);
  assert(t.subtitle && typeof t.subtitle === 'string', `Tracker ${t.id} missing subtitle`);
  assert(t.currentStatus && typeof t.currentStatus === 'string', `Tracker ${t.id} missing currentStatus`);
  assert(t.lastUpdated && typeof t.lastUpdated === 'string', `Tracker ${t.id} missing lastUpdated`);
  assert(t.lastVerifiedBy && typeof t.lastVerifiedBy === 'string', `Tracker ${t.id} missing lastVerifiedBy`);
  assert(Array.isArray(t.keyDataPoints) && t.keyDataPoints.length > 0, `Tracker ${t.id} missing keyDataPoints`);
  assert(Array.isArray(t.recentChanges) && t.recentChanges.length > 0, `Tracker ${t.id} missing recentChanges`);
  assert(Array.isArray(t.timeline) && t.timeline.length > 0, `Tracker ${t.id} missing timeline`);
  assert(Array.isArray(t.evidenceChain) && t.evidenceChain.length > 0, `Tracker ${t.id} missing evidenceChain`);
  assert(Array.isArray(t.documents) && t.documents.length > 0, `Tracker ${t.id} missing documents`);
}
console.log('  ✓ PASS: All tracker contracts satisfy required schema fields');

console.log('ALL TRACKER FRAMEWORK TESTS PASSED!\n');
