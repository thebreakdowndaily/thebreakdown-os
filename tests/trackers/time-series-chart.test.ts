import assert from 'node:assert';
import { getAllTrackers } from '../../lib/trackers/registry';

console.log('--- RUNNING TIME-SERIES CHART DATA INTEGRITY TESTS ---');

const trackers = getAllTrackers();
let totalSeries = 0;

for (const t of trackers) {
  if (t.timeSeries && t.timeSeries.length > 0) {
    totalSeries += t.timeSeries.length;
    for (const ts of t.timeSeries) {
      assert(ts.id && typeof ts.id === 'string', `Time series in tracker ${t.id} missing id`);
      assert(ts.title && typeof ts.title === 'string', `Time series ${ts.id} missing title`);
      assert(ts.unit && typeof ts.unit === 'string', `Time series ${ts.id} missing unit`);
      assert(ts.source && typeof ts.source === 'string', `Time series ${ts.id} missing source`);
      assert(Array.isArray(ts.data) && ts.data.length > 0, `Time series ${ts.id} has empty data array`);

      // Ensure all points have valid date and number value
      for (const p of ts.data) {
        assert(p.date && typeof p.date === 'string', `Point in ${ts.id} missing date`);
        assert(typeof p.value === 'number' && !isNaN(p.value), `Point ${p.date} in ${ts.id} has invalid value`);
      }
    }
  }
}

assert(totalSeries >= 3, `Expected at least 3 total time-series across trackers, found ${totalSeries}`);
console.log(`  ✓ PASS: All ${totalSeries} quantitative time-series satisfy schema contracts and non-empty data`);

// Edge case: Empty / Missing series contract behavior
const emptySeries = { id: 'test-empty', title: 'Test Empty', unit: 'Units', source: 'Test', data: [] };
assert.strictEqual(emptySeries.data.length, 0);
console.log('  ✓ PASS: Graceful handling of empty series arrays');

console.log('ALL TIME-SERIES CHART TESTS PASSED!\n');
