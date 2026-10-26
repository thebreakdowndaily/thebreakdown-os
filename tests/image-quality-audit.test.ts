import assert from 'node:assert/strict';
import {
  detectImageQualityIssues,
  imageQualityIssueKey,
  validateImageQualityBaseline,
  type ImageQualityException,
  type ImageQualityIssue,
  type ImageQualityRecord,
} from '../lib/image-intelligence/quality-audit';

function record(overrides: Partial<ImageQualityRecord> = {}): ImageQualityRecord {
  return {
    slug: 'story-a',
    assetPath: '/images/stories/story-a.jpg',
    sha256: 'sha-a',
    hasManifest: true,
    manifestMatchesResolvedAsset: true,
    manifestComplete: true,
    isPlaceholder: false,
    ...overrides,
  };
}

function exception(issue: ImageQualityIssue, overrides: Partial<ImageQualityException> = {}): ImageQualityException {
  return {
    ...issue,
    id: 'LIMG-TEST-001',
    reason: 'Legacy defect documented for remediation.',
    owner: 'Editor-in-Chief',
    evidence: 'https://github.com/thebreakdowndaily/thebreakdown-os/issues/144',
    expiresAt: '2026-11-25',
    ...overrides,
  };
}

function run(): void {
  // Only actual story-specific manifest approval is sufficient for a clean pass.
  assert.deepEqual(detectImageQualityIssues([record()]), []);

  // A category placeholder remains a quality finding even when it has a manifest.
  assert.equal(
    detectImageQualityIssues([record({ isPlaceholder: true })])[0]?.kind,
    'placeholder',
  );

  // New stories cannot pass via missing manifest or a resolver/manifest mismatch.
  assert.deepEqual(
    detectImageQualityIssues([record({ hasManifest: false })]).map((i) => i.kind),
    ['missing-manifest'],
  );
  assert.deepEqual(
    detectImageQualityIssues([record({ manifestMatchesResolvedAsset: false })]).map((i) => i.kind),
    ['manifest-mismatch'],
  );

  // Manifest completeness can represent licensing/source metadata requirements.
  assert.deepEqual(
    detectImageQualityIssues([record({ manifestComplete: false })]).map((i) => i.kind),
    ['incomplete-manifest'],
  );

  // Identical path reuse and byte-identical files under different paths are both detected.
  const duplicatePaths = detectImageQualityIssues([
    record({ slug: 'story-a' }),
    record({ slug: 'story-b' }),
  ]);
  assert.equal(duplicatePaths.length, 1);
  assert.equal(duplicatePaths[0].kind, 'duplicate-path');
  assert.deepEqual(duplicatePaths[0].slugs, ['story-a', 'story-b']);

  const duplicateContent = detectImageQualityIssues([
    record({ slug: 'story-a', assetPath: '/images/stories/a.jpg', sha256: 'same-content' }),
    record({ slug: 'story-b', assetPath: '/images/stories/b.jpg', sha256: 'same-content' }),
  ]);
  assert.equal(duplicateContent.length, 1);
  assert.equal(duplicateContent[0].kind, 'duplicate-content');
  assert.deepEqual(duplicateContent[0].assets, ['/images/stories/a.jpg', '/images/stories/b.jpg']);

  // An exact, temporary baseline item matches; changing its story or asset fails closed.
  const placeholderIssue = detectImageQualityIssues([record({ isPlaceholder: true })])[0];
  const allowed = validateImageQualityBaseline(
    [placeholderIssue],
    [exception(placeholderIssue)],
    '2026-10-26',
  );
  assert.equal(allowed.approvedLegacy.length, 1);
  assert.equal(allowed.unapproved.length, 0);
  assert.equal(allowed.expired.length, 0);
  assert.equal(allowed.stale.length, 0);
  assert.equal(allowed.invalidExceptions.length, 0);

  const changedIssue = { ...placeholderIssue, assets: ['/images/placeholders/other.svg'] };
  const noBlanketBypass = validateImageQualityBaseline(
    [changedIssue],
    [exception(placeholderIssue)],
    '2026-10-26',
  );
  assert.equal(noBlanketBypass.unapproved.length, 1);
  assert.equal(noBlanketBypass.stale.length, 1);

  const expired = validateImageQualityBaseline(
    [placeholderIssue],
    [exception(placeholderIssue, { expiresAt: '2026-10-25' })],
    '2026-10-26',
  );
  assert.equal(expired.expired.length, 1);
  assert.equal(expired.unapproved.length, 1);

  const stale = validateImageQualityBaseline(
    [],
    [exception(placeholderIssue)],
    '2026-10-26',
  );
  assert.equal(stale.stale.length, 1);

  const invalid = validateImageQualityBaseline(
    [placeholderIssue],
    [exception(placeholderIssue, { reason: '', evidence: 'not-a-url' })],
    '2026-10-26',
  );
  assert.equal(invalid.invalidExceptions.length, 1);

  // Keys are deterministic and insensitive to input ordering.
  assert.equal(
    imageQualityIssueKey({ kind: 'placeholder', slugs: ['story-b', 'story-a'], assets: ['/b', '/a'] }),
    imageQualityIssueKey({ kind: 'placeholder', slugs: ['story-a', 'story-b'], assets: ['/a', '/b'] }),
  );

  console.log('Image quality audit tests: 14 assertions passed.');
}

run();
