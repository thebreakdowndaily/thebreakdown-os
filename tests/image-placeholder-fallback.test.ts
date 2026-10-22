import assert from 'node:assert/strict';
import { describe, it } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { getHeroImageFallbackPath } from '../lib/image-intelligence/placeholder-fallback';
import { validateImageFile } from '../lib/image-intelligence/asset-validator';

describe('Story image category fallback', () => {
  it('resolves only existing neutral placeholders and hides unavailable-photo alt text', () => {
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


const componentSource = readFileSync(
  path.join(process.cwd(), 'components/story/StoryImage/index.tsx'),
  'utf8',
);
assert.match(componentSource, /getHeroImageFallbackPath/);
assert.match(componentSource, /alt=\{hasError\s*\?\s*''\s*:\s*alt\}/);
assert.match(componentSource, /const getFallback = \(cat: StoryCategory\) => getHeroImageFallbackPath\(cat\)/);
assert.match(componentSource, /setImgSrc\(getFallback\(category\)\)/);


  });
});

