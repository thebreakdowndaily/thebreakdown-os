import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import type { Story } from '@/types/canonical';
import {
  validateStoryHeroMedia,
  validateStorySupportingMedia,
} from '@/lib/image-intelligence/publication-validation';
import {
  VERIFIED_STORY_IMAGE_MANIFEST,
  findRegisteredAssetForStory,
  isAssetAuthorizedForStory,
} from '@/lib/image-intelligence/manifest';
import { validateStoryForPublication } from '@/lib/editorial/publication-gate';
import {
  validateLocalAssetDetailed,
  readImageDimensions,
  calculateContentDigest,
} from '@/lib/image-intelligence/asset-validator';
import { createValidGoldStandardAudit } from '@/lib/editorial/gold-standard-review';
import { REMEDIATED_BCCI_CRICKET_STORY } from '@/lib/editorial/drafts/remediated-stories';

describe('Mission H.2: Image Intelligence Contract & Adversarial Regression Suite', () => {
  const storySlug = 'bcci-domestic-mandate-ranji-economics';

  function createTestStory(overrides: Partial<Story> = {}): Story {
    return {
      ...REMEDIATED_BCCI_CRICKET_STORY,
      ...overrides,
    };
  }

  // Case 1: Correctly authorized BCCI hero and supporting graphic
  it('Case 1: verifies correctly authorized BCCI hero and supporting graphic in real validation and publication gate', () => {
    // Hero validation
    const heroValidation = validateStoryHeroMedia(REMEDIATED_BCCI_CRICKET_STORY);
    expect(heroValidation.passed).toBe(true);
    expect(heroValidation.assetId).toBe('tb-bcci-ranji-trophy-photo-v1');
    expect(heroValidation.violations).toHaveLength(0);

    // Supporting graphic when explicitly approved by human reviewer in test fixture
    const prev = { ...VERIFIED_STORY_IMAGE_MANIFEST['bcci-domestic-fees'] };
    try {
      VERIFIED_STORY_IMAGE_MANIFEST['bcci-domestic-fees'] = {
        ...prev,
        approvalStatus: 'approved',
        approvalTimestamp: '2026-10-25T12:00:00.000Z',
        approvedDigest: 'sha256:47170c9d849ff71b0c70d669efd4c9213cf311612a0b8160f971f5c3f80ed344',
        reviewedBy: 'Visual Desk Editor',
        reviewerRole: 'Senior Visual Editor',
      };

      const supportingValidation = validateStorySupportingMedia(REMEDIATED_BCCI_CRICKET_STORY);
      expect(supportingValidation.passed).toBe(true);
      expect(supportingValidation.violations).toHaveLength(0);

      const approvedStory = {
        ...REMEDIATED_BCCI_CRICKET_STORY,
        goldStandardAudit: createValidGoldStandardAudit(REMEDIATED_BCCI_CRICKET_STORY),
      };

      const gateResult = validateStoryForPublication(
        { storyId: approvedStory.id },
        approvedStory,
        new Date(),
        { bypassEditorialHold: true }
      );

      const heroGate = gateResult.checks.find((c) => c.name === 'hero_media_quality');
      const supportingGate = gateResult.checks.find((c) => c.name === 'supporting_media_approval');
      expect(heroGate?.passed).toBe(true);
      expect(supportingGate?.passed).toBe(true);
      expect(gateResult.passed).toBe(true);
    } finally {
      VERIFIED_STORY_IMAGE_MANIFEST['bcci-domestic-fees'] = prev;
    }
  });

  // Case 2: A valid global asset URL used by an unauthorized story
  it('Case 2: strictly rejects cross-story reuse of a valid global asset when used by an unauthorized story', () => {
    const unauthorizedStory: Story = {
      ...createTestStory(),
      id: 'story-unauthorized-id',
      slug: 'unauthorized-consumer-story',
      storyType: 'feature' as any,
      blocks: [
        {
          id: 'unauthorized-img-block',
          type: 'image',
          data: {
            src: '/images/editorial/bcci-domestic-fees.svg',
            alt: 'BCCI fee chart in unrelated consumer story',
            caption: 'Unauthorized reuse attempt',
          },
        },
      ],
    };

    const supportingValidation = validateStorySupportingMedia(unauthorizedStory);
    expect(supportingValidation.passed).toBe(false);
    expect(
      supportingValidation.violations.some((v) =>
        v.includes('is not authorized for use in story "unauthorized-consumer-story"')
      )
    ).toBe(true);

    const gateResult = validateStoryForPublication(
      { storyId: unauthorizedStory.id },
      unauthorizedStory,
      new Date(),
      { bypassEditorialHold: true }
    );
    const supportingGate = gateResult.checks.find((c) => c.name === 'supporting_media_approval');
    expect(supportingGate?.passed).toBe(false);
    expect(supportingGate?.reason).toContain('is not authorized for use in story');
  });

  // Case 3: Missing explicit story authorization
  it('Case 3: strictly rejects assets that lack explicit story authorization in the manifest', () => {
    const { record, isAuthorized } = findRegisteredAssetForStory(
      '/images/editorial/bcci-domestic-fees.svg',
      'completely-unrelated-story-slug'
    );
    expect(record).toBeDefined();
    expect(isAuthorized).toBe(false);

    // Hero lookup authorization check
    const heroRecord = VERIFIED_STORY_IMAGE_MANIFEST[storySlug];
    expect(isAssetAuthorizedForStory(heroRecord, 'some-random-slug')).toBe(false);
  });

  // Case 4: Missing, malformed, or mismatched expected SHA-256
  it('Case 4: strictly rejects missing, malformed, or mismatched expected SHA-256 digests', () => {
    const originalEntry = { ...VERIFIED_STORY_IMAGE_MANIFEST[storySlug] };
    try {
      // 4a. Missing expected digest on pilot-covered asset
      VERIFIED_STORY_IMAGE_MANIFEST[storySlug] = {
        ...originalEntry,
        expectedDigest: undefined,
      };
      const missingExpected = validateStoryHeroMedia(createTestStory());
      expect(missingExpected.passed).toBe(false);
      expect(missingExpected.violations.some((v) => v.includes('missing mandatory expectedDigest'))).toBe(true);

      // 4b. Malformed expected digest
      VERIFIED_STORY_IMAGE_MANIFEST[storySlug] = {
        ...originalEntry,
        expectedDigest: 'sha256:not-a-valid-hex-digest',
      };
      const malformedExpected = validateStoryHeroMedia(createTestStory());
      expect(malformedExpected.passed).toBe(false);
      expect(malformedExpected.violations.some((v) => v.includes('malformed'))).toBe(true);

      // 4c. Mismatched expected digest against actual disk bytes
      VERIFIED_STORY_IMAGE_MANIFEST[storySlug] = {
        ...originalEntry,
        expectedDigest: 'sha256:0000000000000000000000000000000000000000000000000000000000000000',
      };
      const mismatchedExpected = validateStoryHeroMedia(createTestStory());
      expect(mismatchedExpected.passed).toBe(false);
      expect(mismatchedExpected.violations.some((v) => v.includes('file integrity check failed'))).toBe(true);

      // Verify publication gate failure
      const gateResult = validateStoryForPublication(
        { storyId: createTestStory().id },
        createTestStory(),
        new Date(),
        { bypassEditorialHold: true }
      );
      const heroGate = gateResult.checks.find((c) => c.name === 'hero_media_quality');
      expect(heroGate?.passed).toBe(false);
      expect(heroGate?.reason).toContain('file integrity check failed');
    } finally {
      VERIFIED_STORY_IMAGE_MANIFEST[storySlug] = originalEntry;
    }
  });

  // Case 5: Missing or mismatched approval digest
  it('Case 5: strictly rejects missing approval digest when digest-lock required, and rejects mismatched approval digests', () => {
    const originalEntry = { ...VERIFIED_STORY_IMAGE_MANIFEST[storySlug] };
    try {
      // 5a. Missing approved digest when digest lock is required
      VERIFIED_STORY_IMAGE_MANIFEST[storySlug] = {
        ...originalEntry,
        approvedDigest: undefined,
      };
      const missingApprovalDigest = validateStoryHeroMedia(createTestStory(), { requireDigestLock: true });
      expect(missingApprovalDigest.passed).toBe(false);
      expect(missingApprovalDigest.violations.some((v) => v.includes('approved content digest'))).toBe(true);

      // 5b. Mismatched approval digest (stale approval)
      VERIFIED_STORY_IMAGE_MANIFEST[storySlug] = {
        ...originalEntry,
        approvedDigest: 'sha256:1111111111111111111111111111111111111111111111111111111111111111',
      };
      const staleApproval = validateStoryHeroMedia(createTestStory());
      expect(staleApproval.passed).toBe(false);
      expect(staleApproval.violations.some((v) => v.includes('approval is stale') || v.includes('Media approval is stale'))).toBe(true);
    } finally {
      VERIFIED_STORY_IMAGE_MANIFEST[storySlug] = originalEntry;
    }
  });

  // Case 6: Path traversal and a path escaping the public directory
  it('Case 6: strictly blocks path traversal, escaping the public root, null bytes, and remote URLs', () => {
    // 6a. Directory traversal escaping public directory
    const traversalValidation = validateLocalAssetDetailed('/images/../../package.json');
    expect(traversalValidation.isValid).toBe(false);
    expect(traversalValidation.isPathContained).toBe(false);
    expect(traversalValidation.error).toContain('Path traversal violation');

    // 6b. Deep traversal
    const deepTraversal = validateLocalAssetDetailed('../../../../etc/passwd');
    expect(deepTraversal.isValid).toBe(false);
    expect(deepTraversal.isPathContained).toBe(false);

    // 6c. Null byte injection
    const nullByteValidation = validateLocalAssetDetailed('/images/stories/bcci-ranji-trophy.jpg\0.png');
    expect(nullByteValidation.isValid).toBe(false);
    expect(nullByteValidation.error).toContain('null byte');

    // 6d. Remote URL where local binary required
    const remoteUrlValidation = validateLocalAssetDetailed('https://malicious.example.com/exploit.jpg');
    expect(remoteUrlValidation.isValid).toBe(false);
    expect(remoteUrlValidation.error).toContain('Remote URL');
  });

  // Case 7: A file whose extension conflicts with its actual format
  it('Case 7: strictly rejects files whose extension conflicts with actual binary format (magic bytes)', () => {
    const fakeJpgPath = path.resolve(process.cwd(), 'public/images/audit/adversarial-fake.jpg');
    fs.mkdirSync(path.dirname(fakeJpgPath), { recursive: true });

    // Write valid PNG bytes into a .jpg file
    const pngBuffer = Buffer.from([
      0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, // PNG signature
      0x00, 0x00, 0x00, 0x0d, 0x49, 0x48, 0x44, 0x52, // IHDR chunk length & type
      0x00, 0x00, 0x04, 0xb0, 0x00, 0x00, 0x02, 0xa3, // 1200 x 675
      0x08, 0x06, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    ]);
    fs.writeFileSync(fakeJpgPath, pngBuffer);

    try {
      const result = validateLocalAssetDetailed('/images/audit/adversarial-fake.jpg');
      expect(result.isValid).toBe(false);
      expect(result.isFormatExtensionMismatch).toBe(true);
      expect(result.error).toContain('conflicts with detected binary format');
    } finally {
      if (fs.existsSync(fakeJpgPath)) fs.unlinkSync(fakeJpgPath);
    }
  });

  // Case 8: HTML error content masquerading as an image
  it('Case 8: strictly detects HTML error pages or text responses masquerading as images', () => {
    const htmlErrorPath = path.resolve(process.cwd(), 'public/images/audit/adversarial-error.jpg');
    fs.mkdirSync(path.dirname(htmlErrorPath), { recursive: true });
    fs.writeFileSync(
      htmlErrorPath,
      '<!DOCTYPE html><html><head><title>Wikimedia Error: 404 Not Found</title></head><body>File not found</body></html>',
      'utf8'
    );

    try {
      const result = validateLocalAssetDetailed('/images/audit/adversarial-error.jpg');
      expect(result.isValid).toBe(false);
      expect(result.isHtmlError).toBe(true);
      expect(result.format).toBe('corrupt-html');
      expect(result.error).toContain('HTML text error response');
    } finally {
      if (fs.existsSync(htmlErrorPath)) fs.unlinkSync(htmlErrorPath);
    }
  });

  // Case 9: Corrupt, truncated, empty, or invalid-dimension files
  it('Case 9: strictly rejects 0-byte empty files, truncated headers, and files with invalid dimensions', () => {
    // 9a. 0-byte file
    const emptyFilePath = path.resolve(process.cwd(), 'public/images/audit/adversarial-empty.jpg');
    fs.mkdirSync(path.dirname(emptyFilePath), { recursive: true });
    fs.writeFileSync(emptyFilePath, Buffer.alloc(0));

    // 9b. Truncated header
    const truncatedFilePath = path.resolve(process.cwd(), 'public/images/audit/adversarial-truncated.jpg');
    fs.writeFileSync(truncatedFilePath, Buffer.from([0xff, 0xd8, 0xff]));

    try {
      const emptyResult = validateLocalAssetDetailed('/images/audit/adversarial-empty.jpg');
      expect(emptyResult.isValid).toBe(false);
      expect(emptyResult.error).toContain('0 bytes (empty file)');

      const truncatedResult = validateLocalAssetDetailed('/images/audit/adversarial-truncated.jpg');
      expect(truncatedResult.isValid).toBe(false);
      expect(truncatedResult.error).toContain('Corrupt or invalid dimensions');
    } finally {
      if (fs.existsSync(emptyFilePath)) fs.unlinkSync(emptyFilePath);
      if (fs.existsSync(truncatedFilePath)) fs.unlinkSync(truncatedFilePath);
    }
  });

  // Case 10: Manifest dimensions that disagree with actual file dimensions
  it('Case 10: detects manifest dimensions that disagree with actual on-disk dimensions', () => {
    const originalEntry = { ...VERIFIED_STORY_IMAGE_MANIFEST[storySlug] };
    try {
      VERIFIED_STORY_IMAGE_MANIFEST[storySlug] = {
        ...originalEntry,
        width: 1920, // Claim 1920x1080 when disk file is 1200x675
        height: 1080,
      };

      const heroValidation = validateStoryHeroMedia(createTestStory());
      expect(heroValidation.passed).toBe(false);
      expect(
        heroValidation.violations.some((v) =>
          v.includes('Manifest declared dimensions (1920×1080) do not match actual underlying file dimensions (1200×675)')
        )
      ).toBe(true);

      const gateResult = validateStoryForPublication(
        { storyId: createTestStory().id },
        createTestStory(),
        new Date(),
        { bypassEditorialHold: true }
      );
      const heroGate = gateResult.checks.find((c) => c.name === 'hero_media_quality');
      expect(heroGate?.passed).toBe(false);
      expect(heroGate?.reason).toContain('do not match actual underlying file dimensions');
    } finally {
      VERIFIED_STORY_IMAGE_MANIFEST[storySlug] = originalEntry;
    }
  });

  // Case 11: A modified graphic whose old approval must no longer authorize the new digest
  it('Case 11: invalidates approval when graphic content changes on disk after approval was granted', () => {
    const originalEntry = { ...VERIFIED_STORY_IMAGE_MANIFEST['bcci-domestic-fees'] };
    try {
      // Approved for an older digest
      VERIFIED_STORY_IMAGE_MANIFEST['bcci-domestic-fees'] = {
        ...originalEntry,
        approvalStatus: 'approved',
        approvalTimestamp: '2026-10-24T12:00:00.000Z',
        approvedDigest: 'sha256:0000000000000000000000000000000000000000000000000000000000000000',
        reviewedBy: 'Visual Editor',
        reviewerRole: 'Editorial Visual Desk',
      };

      const supportingValidation = validateStorySupportingMedia(createTestStory());
      expect(supportingValidation.passed).toBe(false);
      expect(
        supportingValidation.violations.some((v) =>
          v.includes('approval is stale: asset content on disk has changed since human approval')
        )
      ).toBe(true);
    } finally {
      VERIFIED_STORY_IMAGE_MANIFEST['bcci-domestic-fees'] = originalEntry;
    }
  });

  // Case 12: The revised BCCI fee graphic remaining blocked while approval is pending
  it('Case 12: strictly blocks publication while the revised BCCI fee graphic remains pending approval', () => {
    // Real canonical story against real manifest
    const supportingValidation = validateStorySupportingMedia(REMEDIATED_BCCI_CRICKET_STORY);
    expect(supportingValidation.passed).toBe(false);
    expect(
      supportingValidation.violations.some((v) =>
        v.includes('requires explicit human media approval after the latest revision')
      )
    ).toBe(true);

    const gateResult = validateStoryForPublication(
      { storyId: REMEDIATED_BCCI_CRICKET_STORY.id },
      REMEDIATED_BCCI_CRICKET_STORY,
      new Date(),
      { bypassEditorialHold: true }
    );
    const supportingGate = gateResult.checks.find((c) => c.name === 'supporting_media_approval');
    expect(supportingGate?.passed).toBe(false);
    expect(supportingGate?.reason).toContain('requires explicit human media approval');
    expect(gateResult.passed).toBe(false);
  });

  // Case 13: Existing legitimate image-manifest cases and unrelated publication gates remaining correct
  it('Case 13: verifies existing legitimate manifest entries and unrelated publication gates continue to evaluate correctly', () => {
    // Legitimate existing manifest entries
    const existingSlugs = ['pm-fasal-bima-claims', 'dpdp-bill', 'climate-finance'];
    for (const slug of existingSlugs) {
      const entry = VERIFIED_STORY_IMAGE_MANIFEST[slug];
      expect(entry).toBeDefined();
      expect(isAssetAuthorizedForStory(entry, slug)).toBe(true);
    }

    // Unrelated publication gates: check status, depth, reading time, claims, sources
    const shallowStory = {
      ...createTestStory(),
      blocks: [
        { id: 'p1', type: 'paragraph', data: { text: 'Short narrative' } },
      ],
    };
    const gateResult = validateStoryForPublication(
      { storyId: shallowStory.id },
      shallowStory,
      new Date(),
      { bypassEditorialHold: true }
    );

    const narrativeDepthCheck = gateResult.checks.find((c) => c.name === 'narrative_depth');
    expect(narrativeDepthCheck?.passed).toBe(false);

    const claimsCheck = gateResult.checks.find((c) => c.name === 'claims_verified');
    expect(claimsCheck?.passed).toBe(true);

    const hasSourcesCheck = gateResult.checks.find((c) => c.name === 'has_sources');
    expect(hasSourcesCheck?.passed).toBe(true);

    const sourcesNotRetractedCheck = gateResult.checks.find((c) => c.name === 'sources_not_retracted');
    expect(sourcesNotRetractedCheck?.passed).toBe(true);
  });
});
