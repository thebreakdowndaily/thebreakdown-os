import assert from 'node:assert/strict';
import type { Story } from '../types/canonical';
import type { Principal } from '../features/auth/principal';
import { evaluatePublicationContractAsync } from '../lib/editorial/canonical-publication';
import { validateStoryHeroImageApproval } from '../lib/image-intelligence/publication-approval';
import type { VerifiedImageRecord } from '../lib/image-intelligence/manifest';
import { validateStoryForPublication } from '../lib/editorial/publication-gate';

const approved: VerifiedImageRecord = {
  storySlug: 'story-a',
  approvedImage: '/images/stories/story-a.jpg',
  assetType: 'authentic-photo',
  provenance: 'Official source archive, item 2026-17',
  sourceUrl: 'https://example.org/original-image',
  license: 'PUBLIC_DOMAIN',
  description: 'Photograph directly relevant to the story.',
};

function check(
  story: { slug: string; heroImage?: string | null } | null | undefined,
  manifest: VerifiedImageRecord | null,
) {
  return validateStoryHeroImageApproval(story, () => manifest);
}

async function testRuntimeGateIntegration(): Promise<void> {
  const story = {
    id: 'story-live-1',
    title: 'A sufficiently described story',
    slug: 'story-without-approved-media',
    headline: 'A sufficiently described story',
    summary: 'A real summary.',
    heroImage: '/images/stories/unreviewed.jpg',
    author: 'Editorial Desk',
    category: 'policy',
    status: 'review',
    storyType: 'standard',
    evidenceScore: 85,
    readingTime: 6,
    publishedAt: '2026-09-01T10:00:00.000Z',
    createdAt: '2026-09-01T10:00:00.000Z',
    updatedAt: '2026-09-01T10:00:00.000Z',
    tags: ['policy'],
    blocks: [{ id: 'body', type: 'text', region: 'main', data: { content: 'Story body.' } }],
    sources: [{ title: 'Official source', url: 'https://example.org/report', accessedAt: '2026-10-20T00:00:00.000Z', tier: 1 }],
    claims: [{ id: 'claim-1', claim: 'A supportable claim.', data: 'Evidence summary.', source: 'Official source', sourceUrl: 'https://example.org/report', tier: 1, confidence: 0.9, status: 'verified' }],
    timeline: [],
    faq: [],
    charts: [],
    relatedStoryIds: [],
    relatedEntityIds: [],
    relatedTopicIds: [],
  } as unknown as Story;

  const result = validateStoryForPublication(
    { storyId: story.id, triggeredBy: 'manual' },
    story,
    new Date('2026-10-26T00:00:00.000Z'),
  );
  const imageCheck = result.checks.find((item) => item.name === 'hero_image_approved');
  assert.ok(imageCheck, 'canonical publication gate must emit hero_image_approved');
  assert.equal(imageCheck.passed, false, 'live publication must fail closed without an approved manifest entry');
  assert.match(imageCheck.reason, /No individually approved hero-image manifest entry/);
  assert.equal(result.passed, false);

  // The canonical contract used by the scheduler must reject before issuing a publication token.
  const principal = {
    userId: 'test-editor',
    email: 'editor@example.org',
    name: 'Test Editor',
    role: 'owner',
    isSuperAdmin: true,
    status: 'active',
    organizationId: null,
  } as unknown as Principal;
  const decision = await evaluatePublicationContractAsync(
    story,
    story,
    principal,
    { now: new Date('2026-10-26T00:00:00.000Z'), triggeredBy: 'manual' },
  );
  assert.equal(decision.allowed, false, 'canonical publication contract must block unapproved hero media');
  assert.equal(decision.httpStatus, 422, 'hero approval failure must be an editorial gate rejection');
  assert.equal(decision.publicationToken, undefined, 'blocked story must not receive a publication token');
  const contractImageCheck = decision.gateResult?.checks.find((item) => item.name === 'hero_image_approved');
  assert.ok(contractImageCheck, 'canonical contract must expose the image failure in its audit checks');
  assert.equal(contractImageCheck.passed, false);
}

async function run(): Promise<void> {
  assert.equal(check(undefined, approved).passed, false, 'missing story must fail');
  assert.equal(check({ slug: 'story-a', heroImage: approved.approvedImage }, null).passed, false, 'missing manifest must fail');
  assert.equal(check({ slug: 'story-b', heroImage: approved.approvedImage }, approved).passed, false, 'manifest slug mismatch must fail');
  assert.equal(check({ slug: 'story-a', heroImage: '' }, approved).passed, false, 'missing hero must fail');
  assert.equal(check({ slug: 'story-a', heroImage: '/images/stories/other.jpg' }, approved).passed, false, 'hero/manifest mismatch must fail');

  assert.equal(check({ slug: 'story-a', heroImage: approved.approvedImage }, {
    ...approved,
    assetType: 'branded-placeholder',
  }).passed, false, 'placeholder asset type must fail');
  assert.equal(check({ slug: 'story-a', heroImage: '/images/placeholders/policy.svg' }, {
    ...approved,
    approvedImage: '/images/placeholders/policy.svg',
  }).passed, false, 'placeholder path must fail even if record type is mislabelled');

  assert.equal(check({ slug: 'story-a', heroImage: approved.approvedImage }, {
    ...approved,
    provenance: '',
  }).passed, false, 'empty provenance must fail');
  assert.equal(check({ slug: 'story-a', heroImage: approved.approvedImage }, {
    ...approved,
    description: ' ',
  }).passed, false, 'empty description must fail');
  assert.equal(check({ slug: 'story-a', heroImage: approved.approvedImage }, {
    ...approved,
    license: '' as VerifiedImageRecord['license'],
  }).passed, false, 'empty license must fail');

  assert.equal(check({ slug: 'story-a', heroImage: approved.approvedImage }, {
    ...approved,
    sourceUrl: undefined,
  }).passed, false, 'missing source URL must fail');
  assert.equal(check({ slug: 'story-a', heroImage: approved.approvedImage }, {
    ...approved,
    sourceUrl: 'http://example.org/image',
  }).passed, false, 'non-HTTPS source URL must fail');
  assert.equal(check({ slug: 'story-a', heroImage: approved.approvedImage }, {
    ...approved,
    sourceUrl: 'not a URL',
  }).passed, false, 'invalid source URL must fail');

  const photoPass = check({ slug: 'story-a', heroImage: approved.approvedImage }, approved);
  assert.equal(photoPass.passed, true, 'complete story-specific photo approval should pass');
  assert.equal(photoPass.name, 'hero_image_approved');

  const mapManifest: VerifiedImageRecord = {
    ...approved,
    approvedImage: '/images/library/chapter-1/maps/map-kashmir-1947.svg',
    assetType: 'authentic-map',
    sourceUrl: 'https://example.org/archival-map-record',
    license: 'PUBLIC_DOMAIN',
  };
  assert.equal(
    check({ slug: 'story-a', heroImage: mapManifest.approvedImage }, mapManifest).passed,
    true,
    'approved archival maps are valid visual assets; SVG extension alone does not mean placeholder',
  );

  await testRuntimeGateIntegration();
  console.log('Hero-image publication approval tests: 25 assertions passed.');
}

run().catch((error) => { console.error(error); process.exitCode = 1; });
