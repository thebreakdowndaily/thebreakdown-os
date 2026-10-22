import assert from 'node:assert/strict';
import { matchImageToStoryContext } from '../lib/image-intelligence/context-matcher';
import { getManifestEntry } from '../lib/image-intelligence/manifest';

const indiaUK = {
  slug: 'india-uk-relations',
  headline: 'India-UK Relations: Beyond Colonial History to a Modern Strategic Partnership',
  category: 'geopolitics',
  tags: ['India-UK', 'FTA', 'diaspora', 'Commonwealth', 'defence', 'migration', 'colonial history'],
};
const indiaIndonesia = {
  slug: 'india-indonesia-relations',
  headline: 'India-Indonesia: How Maritime Neighbours Are Reshaping the Indo-Pacific',
  category: 'geopolitics',
  tags: ['India-Indonesia', 'maritime security', 'ASEAN', 'Indo-Pacific', 'trade', 'Act East'],
};
const indiaEV = {
  slug: 'india-ev-paradox',
  headline: "India's EV Paradox: Rising Sales, Stalled Charging, and the Battery Import Bill",
  category: 'environment',
  tags: ['EV', 'electric vehicles', 'FAME', 'batteries', 'charging infrastructure', 'PLI', 'sustainable transport', 'lithium-ion', 'import dependency'],
};

assert.equal(
  matchImageToStoryContext('/images/stories/india-europe-relations.jpg', indiaUK, getManifestEntry).isMatch,
  false,
  'an EU summit image must not be accepted for an India-UK story on the strength of shared words alone',
);
assert.equal(
  matchImageToStoryContext('/images/stories/india-europe-relations.jpg', indiaIndonesia, getManifestEntry).isMatch,
  false,
  'an EU summit image must not be accepted for an India-Indonesia story on the strength of shared words alone',
);
assert.equal(
  matchImageToStoryContext('/images/stories/climate-finance.jpg', indiaEV, getManifestEntry).isMatch,
  false,
  'climate-finance imagery must not be accepted as an EV story hero without a topic-specific match',
);
assert.equal(
  matchImageToStoryContext('/images/stories/india-china-border-tensions.jpg', {
    slug: 'india-china-relations',
    headline: 'India-China: Two Asian Giants in an Era of Mistrust and Strategic Rivalry',
    category: 'geopolitics',
    tags: ['India-China', 'border tensions', 'LAC', 'strategic rivalry'],
  }, getManifestEntry).isMatch,
  true,
  'specific China/border/tensions overlap remains acceptable',
);
assert.equal(
  matchImageToStoryContext('/images/placeholders/policy-placeholder.svg', indiaUK, getManifestEntry).isMatch,
  true,
  'an explicitly registered neutral category placeholder is acceptable until a verified image is sourced',
);

console.log('Image context mismatch regression tests: 5 assertions passed');
