import assert from 'node:assert/strict';
import { getHeroImageFallbackPath } from '../lib/image-intelligence/placeholder-fallback';
import { validateImageFile } from '../lib/image-intelligence/asset-validator';

const cases: Array<[string, string]> = [
  ['geopolitics', '/images/placeholders/policy-placeholder.svg'],
  ['governance', '/images/placeholders/policy-placeholder.svg'],
  ['politics', '/images/placeholders/policy-placeholder.svg'],
  ['economy', '/images/placeholders/economy-placeholder.svg'],
  ['employment', '/images/placeholders/economy-placeholder.svg'],
  ['technology', '/images/placeholders/technology-placeholder.svg'],
  ['education', '/images/placeholders/education-placeholder.svg'],
  ['health', '/images/placeholders/health-placeholder.svg'],
  ['environment', '/images/placeholders/environment-placeholder.svg'],
  ['unknown-category', '/images/placeholders/policy-placeholder.svg'],
  ['', '/images/placeholders/policy-placeholder.svg'],
];

for (const [category, expected] of cases) {
  const resolved = getHeroImageFallbackPath(category);
  assert.equal(resolved, expected, `fallback path for "${category}" must use a known placeholder`);
  assert.equal(validateImageFile(resolved).isValid, true, `fallback asset ${resolved} must exist and be a valid image`);
}

console.log('Hero image fallback tests: 22 assertions passed');
