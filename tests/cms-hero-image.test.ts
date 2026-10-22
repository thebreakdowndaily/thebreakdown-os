import assert from 'node:assert/strict';
import { resolveCMSHeroImage, type Block } from '../utils/cms-data';

function heroBlock(heroImage: string): Block {
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

console.log('CMS hero image sync tests: 4 passed, 0 failed');
