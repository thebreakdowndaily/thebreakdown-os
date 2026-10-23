import assert from 'node:assert/strict';
import type { Block } from '../utils/cms-data';
import { resolveCMSHeroContent, resolveCMSHeroImage, resolveCMSHeroMetadata, withCMSHeroBlock } from '../lib/editorial/cms-hero-image';

function heroBlock(
  heroImage: string,
  metadata: { heroImageAlt?: string; heroImageIsDecorative?: boolean; heroImageMetadataConfirmed?: boolean } = {},
): Block {
  return {
    id: 'hero-1',
    type: 'hero',
    data: {
      headline: 'A test story',
      summary: 'Test summary',
      heroImage,
      category: 'policy',
      author: 'Test editor',
      publishedAt: '',
      ...metadata,
    },
  };
}

const staleImage = '/images/stories/old-image.jpg';
const selectedImage = '/images/stories/selected-image.jpg';

assert.equal(
  resolveCMSHeroImage([heroBlock(selectedImage)], staleImage),
  selectedImage,
  'the image chosen in the CMS hero block must override the old canonical image',
);

assert.equal(
  resolveCMSHeroImage([heroBlock('')], staleImage),
  '',
  'an explicitly blank image in an existing hero block must clear the old image',
);

assert.equal(
  resolveCMSHeroImage([{ id: 'text-1', type: 'text', data: { html: '<p>Body</p>' } }], staleImage),
  staleImage,
  'legacy stories with no hero block must retain their existing canonical image',
);

assert.equal(
  resolveCMSHeroImage([heroBlock(`  ${selectedImage}  `)], staleImage),
  selectedImage,
  'the saved image URL must be trimmed',
);

console.log('CMS hero image sync tests: 8 assertions passed');

const legacyBlocks: Block[] = [{ id: 'body-1', type: 'text', data: { html: '<p>Body</p>' } }];
const converted = withCMSHeroBlock(legacyBlocks, {
  id: 'legacy-story',
  title: 'Legacy story',
  summary: 'Existing summary',
  heroImage: staleImage,
  heroImageAlt: 'A description of the existing story image.',
  heroImageIsDecorative: false,
  category: 'policy',
  author: 'Editor',
  publishedAt: '2026-10-22T00:00:00.000Z',
});
assert.equal(converted[0].type, 'hero', 'legacy stories should receive an editable hero block');
assert.equal((converted[0].data as { heroImage: string }).heroImage, staleImage, 'the synthesized hero block should expose the existing canonical image');
assert.equal((converted[0].data as { heroImageAlt: string }).heroImageAlt, 'A description of the existing story image.', 'the synthesized hero block should expose canonical alt text');
assert.equal((converted[0].data as { heroImageIsDecorative: boolean }).heroImageIsDecorative, false, 'the synthesized hero block should expose the canonical decorative flag');
assert.equal(converted[1].id, 'body-1', 'existing narrative block order must be preserved');

const existingHero = heroBlock(selectedImage);
const unchanged = withCMSHeroBlock([existingHero, ...legacyBlocks], {
  id: 'story-with-hero',
  title: 'Story with hero',
  heroImage: staleImage,
  heroImageAlt: 'Existing image description.',
});
assert.equal(unchanged[0].data && (unchanged[0].data as { heroImage: string }).heroImage, selectedImage, 'an existing CMS hero block remains authoritative');
assert.equal((unchanged[0].data as { heroImageAlt: string }).heroImageAlt, '', 'legacy hero blocks must not hydrate stale alt text when the image URL differs');
assert.equal((unchanged[0].data as { heroImageIsDecorative: boolean }).heroImageIsDecorative, false, 'a mismatched image must not inherit the old decorative flag');

const legacyBlankHero = withCMSHeroBlock([heroBlock(''), ...legacyBlocks], {
  id: 'legacy-blank-hero',
  title: 'Legacy block missing image field',
  heroImage: staleImage,
  heroImageAlt: 'Canonical image description.',
  heroImageIsDecorative: false,
});
assert.equal((legacyBlankHero[0].data as { heroImage: string }).heroImage, staleImage, 'a legacy blank hero field must hydrate the canonical image rather than erase it on save');
assert.equal((legacyBlankHero[0].data as { heroImageAlt: string }).heroImageAlt, 'Canonical image description.', 'the matching canonical alt text should accompany a hydrated legacy image');

const blockOnlyLegacy = withCMSHeroBlock([heroBlock(staleImage, {
  heroImageAlt: 'Description stored alongside the legacy image.',
  heroImageIsDecorative: false,
}), ...legacyBlocks], {
  id: 'legacy-block-only-image',
  title: 'Legacy block is only image source',
  heroImage: '',
  heroImageAlt: '',
  heroImageIsDecorative: false,
});
assert.equal((blockOnlyLegacy[0].data as { heroImage: string }).heroImage, staleImage, 'a block-only legacy image must not be discarded when the canonical URL is blank');
assert.equal((blockOnlyLegacy[0].data as { heroImageAlt: string }).heroImageAlt, 'Description stored alongside the legacy image.', 'metadata belonging to a block-only legacy image must be preserved');

const staleBlockMetadata = withCMSHeroBlock([heroBlock('', {
  heroImageAlt: 'Alt text for the old image that is no longer assigned.',
  heroImageIsDecorative: true,
}), ...legacyBlocks], {
  id: 'legacy-canonical-image',
  title: 'Canonical image is authoritative when legacy block URL is blank',
  heroImage: selectedImage,
  heroImageAlt: 'Alt text for the canonical image.',
  heroImageIsDecorative: false,
});
assert.equal((staleBlockMetadata[0].data as { heroImage: string }).heroImage, selectedImage, 'a blank legacy block image must be hydrated from the canonical URL');
assert.equal((staleBlockMetadata[0].data as { heroImageAlt: string }).heroImageAlt, 'Alt text for the canonical image.', 'stale block metadata must not override canonical metadata during hydration');
assert.equal((staleBlockMetadata[0].data as { heroImageIsDecorative: boolean }).heroImageIsDecorative, false, 'stale decorative state must not override the canonical record');

const resolvedMetadata = resolveCMSHeroMetadata([heroBlock(selectedImage, { heroImageAlt: 'Existing image description.', heroImageIsDecorative: false })], '  Existing image description.  ', false, selectedImage);
assert.deepEqual(resolvedMetadata, { heroImageAlt: 'Existing image description.', heroImageIsDecorative: false }, 'legacy metadata is retained for the same image and alt text is normalized');
const decorativeMetadata = resolveCMSHeroMetadata([heroBlock(selectedImage, { heroImageAlt: '', heroImageIsDecorative: true })], 'stale description', true, selectedImage);
assert.deepEqual(decorativeMetadata, { heroImageAlt: '', heroImageIsDecorative: true }, 'decorative images must not retain informative alt text');

const changedImageMetadata = resolveCMSHeroMetadata([heroBlock(selectedImage, { heroImageAlt: '', heroImageIsDecorative: false })], 'Old photo description.', false, staleImage);
assert.deepEqual(changedImageMetadata, { heroImageAlt: '', heroImageIsDecorative: false }, 'a replacement image cannot inherit old alt text or decorative status');
const suppliedNewAlt = resolveCMSHeroMetadata(
  [heroBlock(selectedImage, { heroImageAlt: 'A detailed replacement image description.', heroImageIsDecorative: false, heroImageMetadataConfirmed: true })],
  'Old photo description.',
  false,
  staleImage,
);
assert.deepEqual(suppliedNewAlt, { heroImageAlt: 'A detailed replacement image description.', heroImageIsDecorative: false }, 'new metadata survives a URL change when supplied explicitly');
const intentionallyReusedAlt = resolveCMSHeroMetadata(
  [heroBlock(selectedImage, { heroImageAlt: 'Old photo description.', heroImageIsDecorative: false, heroImageMetadataConfirmed: true })],
  'Old photo description.',
  false,
  staleImage,
);
assert.deepEqual(
  intentionallyReusedAlt,
  { heroImageAlt: 'Old photo description.', heroImageIsDecorative: false },
  'an editor may explicitly reuse the same alt wording on a replacement image after confirming it',
);
const unconfirmedOldAlt = resolveCMSHeroMetadata(
  [heroBlock(selectedImage, { heroImageAlt: 'Old photo description.', heroImageIsDecorative: false, heroImageMetadataConfirmed: false })],
  'Old photo description.',
  false,
  staleImage,
);
assert.deepEqual(
  unconfirmedOldAlt,
  { heroImageAlt: '', heroImageIsDecorative: false },
  'a URL change without explicit metadata confirmation must invalidate the previous alt description',
);

const resolvedContent = resolveCMSHeroContent([heroBlock(selectedImage)], {
  headline: 'Old headline',
  summary: 'Old summary',
  category: 'economy',
  author: 'Old author',
});
assert.deepEqual(resolvedContent, {
  headline: 'A test story',
  summary: 'Test summary',
  category: 'policy',
  author: 'Test editor',
}, 'all editable hero content fields resolve into canonical story fields');
assert.deepEqual(resolveCMSHeroContent(legacyBlocks, {
  headline: 'Existing headline',
  summary: 'Existing summary',
  category: 'environment',
  author: 'Existing author',
}), {
  headline: 'Existing headline',
  summary: 'Existing summary',
  category: 'environment',
  author: 'Existing author',
}, 'stories without a hero block preserve canonical content fields');
