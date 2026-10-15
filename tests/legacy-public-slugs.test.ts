import assert from 'node:assert/strict';
import { LEGACY_PUBLIC_SLUGS } from '../utils/data-layer/legacy-public-slugs';

const expectedCount = 44;
assert.equal(
  LEGACY_PUBLIC_SLUGS.size,
  expectedCount,
  'Moving the legacy publication manifest must preserve every existing entry'
);

for (const slug of [
  'mgnrega-reform',
  'rbi-repo-rate',
  'accountability-in-india',
  'ration-digitization',
  'anganwadi-icds',
  'supply-chain-shift',
  'ethanol-backlash',
]) {
  assert.ok(LEGACY_PUBLIC_SLUGS.has(slug), `Expected the existing manifest to retain "${slug}"`);
}

assert.equal(
  LEGACY_PUBLIC_SLUGS.has('not-a-real-legacy-story'),
  false,
  'Unknown slugs must not be implicitly treated as legacy-public'
);

console.log('Legacy public slug manifest tests passed (44 entries; compatibility samples verified).');
