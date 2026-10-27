import { strict as assert } from 'node:assert';
import { matchImageToStoryContext } from '../../lib/image-intelligence/context-matcher';
import { getManifestEntry } from '../../lib/image-intelligence/manifest';

// 1. UK relations must NEVER match Europe relations image
const ukVsEurope = matchImageToStoryContext(
  '/images/stories/india-europe-relations.jpg',
  { slug: 'india-uk-relations', category: 'geopolitics' }
);
assert.equal(ukVsEurope.isMatch, false, 'UK relations must not match Europe image');
assert.equal(ukVsEurope.aligned, false);
assert.equal(ukVsEurope.matchType, 'MISMATCH');

// 2. Indonesia relations must NEVER match Europe relations image
const indoVsEurope = matchImageToStoryContext(
  '/images/stories/india-europe-relations.jpg',
  { slug: 'india-indonesia-relations', category: 'geopolitics' }
);
assert.equal(indoVsEurope.isMatch, false, 'Indonesia relations must not match Europe image');
assert.equal(indoVsEurope.aligned, false);
assert.equal(indoVsEurope.matchType, 'MISMATCH');

// 3. US relations matches its authentic asset
const usVsUs = matchImageToStoryContext(
  '/images/stories/india-us-relations.jpg',
  { slug: 'india-us-relations', category: 'geopolitics' },
  getManifestEntry
);
assert.equal(usVsUs.aligned, true, 'US relations must match US image');

// 4. Europe relations matches its authentic asset
const europeVsEurope = matchImageToStoryContext(
  '/images/stories/india-europe-relations.jpg',
  { slug: 'india-europe-relations', category: 'geopolitics' },
  getManifestEntry
);
assert.equal(europeVsEurope.aligned, true, 'Europe relations must match Europe image');

// 5. China relations matches border tensions image via documented synergy
const chinaVsChina = matchImageToStoryContext(
  '/images/stories/india-china-border-tensions.jpg',
  { slug: 'india-china-relations', category: 'geopolitics' },
  getManifestEntry
);
assert.equal(chinaVsChina.aligned, true, 'China relations must match China border tensions image');

// 6. Generic bilateral stories without dedicated photo align with honest category placeholder
const ukPlaceholder = matchImageToStoryContext(
  '/images/placeholders/policy-placeholder.svg',
  { slug: 'india-uk-relations', category: 'geopolitics' }
);
assert.equal(ukPlaceholder.aligned, true, 'UK relations must align with geopolitics placeholder');
assert.equal(ukPlaceholder.matchType, 'CATEGORY_PLACEHOLDER_MATCH');

const indoPlaceholder = matchImageToStoryContext(
  '/images/placeholders/policy-placeholder.svg',
  { slug: 'india-indonesia-relations', category: 'geopolitics' }
);
assert.equal(indoPlaceholder.aligned, true, 'Indonesia relations must align with geopolitics placeholder');
assert.equal(indoPlaceholder.matchType, 'CATEGORY_PLACEHOLDER_MATCH');

console.log('PASS bilateral context matching regression suite: independent mappings verified.');
