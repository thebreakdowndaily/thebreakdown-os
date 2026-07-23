/**
 * THE BREAKDOWN — Publication Policy Tests
 *
 * Behavioral tests for the centralized publication lifecycle.
 * Every predicate is fail-closed: missing or ambiguous metadata = NOT public.
 */

import {
  isPubliclyPublished,
  canPubliclyViewStory,
  shouldIndexStory,
  shouldIncludeInFeed,
  shouldIncludeInDiscovery,
  diagnosePublication,
  storyPublicationContext,
  isCanonicalStoryPublic,
} from '../lib/story/publication';
import { getPublicStories, getPublicStory, getPublicStoryDiagnostics, LEGACY_PUBLIC_SLUGS } from '../utils/data-layer/store';
import type { Story } from '../types/canonical';

const NOW = new Date('2026-07-19T12:00:00Z');

function assert(condition: boolean, name: string, results: { passed: number; failed: number }) {
  if (condition) {
    console.log(`  PASS: ${name}`);
    results.passed++;
  } else {
    console.error(`  FAIL: ${name}`);
    results.failed++;
  }
}

async function runTests() {
  const r = { passed: 0, failed: 0 };

  // ═══════════════════════════════════════════════════════════════════════════
  // 1. isPubliclyPublished — the core predicate
  // ═══════════════════════════════════════════════════════════════════════════

  // 1a. Fail-closed: missing publicationStatus
  assert(
    isPubliclyPublished({ publicationStatus: undefined }, NOW) === false,
    'missing publicationStatus → NOT public',
    r
  );
  assert(
    isPubliclyPublished({ publicationStatus: undefined, publishedAt: '2026-01-01T00:00:00Z' }, NOW) === false,
    'missing publicationStatus + valid past publishedAt → NOT public',
    r
  );

  // 1b. draft → NOT public
  assert(
    isPubliclyPublished({ publicationStatus: 'draft', publishedAt: '2026-01-01T00:00:00Z' }, NOW) === false,
    'draft → NOT public',
    r
  );

  // 1c. review → NOT public
  assert(
    isPubliclyPublished({ publicationStatus: 'review', publishedAt: '2026-01-01T00:00:00Z' }, NOW) === false,
    'review → NOT public',
    r
  );

  // 1d. archived → NOT public
  assert(
    isPubliclyPublished({ publicationStatus: 'archived', publishedAt: '2026-01-01T00:00:00Z' }, NOW) === false,
    'archived → NOT public',
    r
  );

  // 1e. scheduled → NOT public (Option B: requires explicit transition)
  assert(
    isPubliclyPublished({ publicationStatus: 'scheduled', publishedAt: '2026-01-01T00:00:00Z' }, NOW) === false,
    'scheduled → NOT public (requires explicit transition)',
    r
  );

  // 1f. published + valid past publishedAt → public
  assert(
    isPubliclyPublished({ publicationStatus: 'published', publishedAt: '2026-01-01T00:00:00Z' }, NOW) === true,
    'published + past publishedAt → public',
    r
  );

  // 1g. published + future publishedAt → NOT public
  assert(
    isPubliclyPublished({ publicationStatus: 'published', publishedAt: '2027-01-01T00:00:00Z' }, NOW) === false,
    'published + future publishedAt → NOT public',
    r
  );

  // 1h. published + missing publishedAt → NOT public
  assert(
    isPubliclyPublished({ publicationStatus: 'published' }, NOW) === false,
    'published + missing publishedAt → NOT public',
    r
  );

  // 1i. published + invalid publishedAt → NOT public
  assert(
    isPubliclyPublished({ publicationStatus: 'published', publishedAt: 'not-a-date' }, NOW) === false,
    'published + invalid publishedAt → NOT public',
    r
  );

  // 1j. published + empty publishedAt → NOT public
  assert(
    isPubliclyPublished({ publicationStatus: 'published', publishedAt: '' }, NOW) === false,
    'published + empty publishedAt → NOT public',
    r
  );

  // ═══════════════════════════════════════════════════════════════════════════
  // 2. Derived predicates mirror the core
  // ═══════════════════════════════════════════════════════════════════════════

  const publicCtx = { publicationStatus: 'published' as const, publishedAt: '2026-01-01T00:00:00Z' };
  const privateCtx = { publicationStatus: 'draft' as const, publishedAt: '2026-01-01T00:00:00Z' };

  assert(canPubliclyViewStory(publicCtx, NOW) === true, 'canPubliclyViewStory → published = true', r);
  assert(canPubliclyViewStory(privateCtx, NOW) === false, 'canPubliclyViewStory → draft = false', r);
  assert(shouldIndexStory(publicCtx, NOW) === true, 'shouldIndexStory → published = true', r);
  assert(shouldIndexStory(privateCtx, NOW) === false, 'shouldIndexStory → draft = false', r);
  assert(shouldIncludeInFeed(publicCtx, NOW) === true, 'shouldIncludeInFeed → published = true', r);
  assert(shouldIncludeInFeed(privateCtx, NOW) === false, 'shouldIncludeInFeed → draft = false', r);
  assert(shouldIncludeInDiscovery(publicCtx, NOW) === true, 'shouldIncludeInDiscovery → published = true', r);
  assert(shouldIncludeInDiscovery(privateCtx, NOW) === false, 'shouldIncludeInDiscovery → draft = false', r);

  // ═══════════════════════════════════════════════════════════════════════════
  // 3. storyPublicationContext / isCanonicalStoryPublic
  // ═══════════════════════════════════════════════════════════════════════════

  const publicStory = { publicationStatus: 'published', publishedAt: '2026-01-01T00:00:00Z', slug: 'public-story' } as unknown as Story;
  const draftStory = { publicationStatus: 'draft', publishedAt: '2026-01-01T00:00:00Z', slug: 'draft-story' } as unknown as Story;
  const legacyStory = { publishedAt: '2026-01-01T00:00:00Z', slug: 'legacy-story' } as unknown as Story;

  assert(isCanonicalStoryPublic(publicStory, NOW) === true, 'isCanonicalStoryPublic → published story = true', r);
  assert(isCanonicalStoryPublic(draftStory, NOW) === false, 'isCanonicalStoryPublic → draft story = false', r);
  assert(isCanonicalStoryPublic(legacyStory, NOW) === false, 'isCanonicalStoryPublic → legacy story (no publicationStatus) = false', r);

  const ctx = storyPublicationContext(publicStory);
  assert(ctx.publicationStatus === 'published', 'storyPublicationContext extracts publicationStatus', r);
  assert(ctx.publishedAt === '2026-01-01T00:00:00Z', 'storyPublicationContext extracts publishedAt', r);

  // ═══════════════════════════════════════════════════════════════════════════
  // 4. diagnosePublication
  // ═══════════════════════════════════════════════════════════════════════════

  const d1 = diagnosePublication('test-1', { publicationStatus: undefined }, NOW);
  assert(d1.isPublic === false, 'diagnose: missing status → not public', r);
  assert(d1.reason === 'missing publicationStatus', 'diagnose: missing status reason', r);

  const d2 = diagnosePublication('test-2', { publicationStatus: 'draft' }, NOW);
  assert(d2.isPublic === false, 'diagnose: draft → not public', r);
  assert(d2.reason === 'draft status', 'diagnose: draft reason', r);

  const d3 = diagnosePublication('test-3', { publicationStatus: 'scheduled' }, NOW);
  assert(d3.isPublic === false, 'diagnose: scheduled → not public', r);

  const d4 = diagnosePublication('test-4', { publicationStatus: 'published', publishedAt: '2026-01-01T00:00:00Z' }, NOW);
  assert(d4.isPublic === true, 'diagnose: published + past → public', r);
  assert(d4.reason === 'published with valid past publishedAt', 'diagnose: published reason', r);

  const d5 = diagnosePublication('test-5', { publicationStatus: 'published', publishedAt: '2027-01-01T00:00:00Z' }, NOW);
  assert(d5.isPublic === false, 'diagnose: published + future → not public', r);
  assert(d5.reason === 'published but publishedAt is in the future', 'diagnose: future reason', r);

  // ═══════════════════════════════════════════════════════════════════════════
  // 5. Legacy store: getPublicStories / getPublicStory / diagnostics
  // ═══════════════════════════════════════════════════════════════════════════

  const publicStories = getPublicStories({ pageSize: 100 });
  assert(publicStories.data.length > 0, 'getPublicStories returns at least 1 story', r);
  assert(publicStories.data.length <= 39, 'getPublicStories returns ≤ 39 (allowlist size)', r);

  for (const s of publicStories.data) {
    const hasNewPolicy = s.publicationStatus === 'published';
    const isLegacyAllowed = LEGACY_PUBLIC_SLUGS.has(s.slug);
    assert(
      hasNewPolicy || isLegacyAllowed,
      `getPublicStories: ${s.slug} is public (new policy: ${hasNewPolicy}, legacy allowlist: ${isLegacyAllowed})`,
      r
    );
  }

  // getPublicStory with a known public slug
  const firstPublic = publicStories.data[0];
  if (firstPublic) {
    const found = getPublicStory(firstPublic.slug);
    assert(found !== undefined, `getPublicStory('${firstPublic.slug}') returns story`, r);
  }

  // getPublicStory with a non-public slug (future-dated story)
  const futureStory = getPublicStory('ration-digitization');
  assert(futureStory === null, "getPublicStory('ration-digitization') → null (future/draft)", r);

  // getPublicStory with a completely invalid slug
  const missingStory = getPublicStory('this-slug-does-not-exist');
  assert(missingStory === null, "getPublicStory('nonexistent') → null", r);

  // Diagnostics
  const allDiags = getPublicStoryDiagnostics();
  assert(allDiags.length > 0, 'getPublicStoryDiagnostics returns entries', r);
  const publicDiags = allDiags.filter(d => d.isPublic);
  const privateDiags = allDiags.filter(d => !d.isPublic);
  assert(publicDiags.length > 0, 'diagnostics has at least 1 public story', r);
  assert(privateDiags.length > 0, 'diagnostics has at least 1 non-public story (future-dated)', r);

  // ═══════════════════════════════════════════════════════════════════════════
  // 6. Edge cases
  // ═══════════════════════════════════════════════════════════════════════════

  // Published exactly at NOW should be public (<=)
  assert(
    isPubliclyPublished({ publicationStatus: 'published', publishedAt: '2026-07-19T12:00:00Z' }, NOW) === true,
    'published exactly at NOW → public (boundary test)',
    r
  );

  // 1ms after NOW should NOT be public
  const futureMs = new Date(NOW.getTime() + 1).toISOString();
  assert(
    isPubliclyPublished({ publicationStatus: 'published', publishedAt: futureMs }, NOW) === false,
    'published 1ms after NOW → NOT public (boundary test)',
    r
  );

  // Empty context (all undefined) → NOT public
  assert(isPubliclyPublished({}, NOW) === false, 'empty context → NOT public', r);

  // scheduled with valid dates still NOT public
  assert(
    isPubliclyPublished({ publicationStatus: 'scheduled', publishedAt: '2026-01-01T00:00:00Z', scheduledAt: '2026-01-15T00:00:00Z' }, NOW) === false,
    'scheduled + valid dates → NOT public (requires explicit transition)',
    r
  );

  // ═══════════════════════════════════════════════════════════════════════════
  // 6. Phase 0/1 Regression Tests — Deterministic Claim IDs & Draft Isolation
  // ═══════════════════════════════════════════════════════════════════════════
  const { apiStoryToCanonical } = await import('../lib/bootstrap');

  const draftAPIStory = {
    id: 'test-draft-story',
    slug: 'test-draft-story',
    headline: 'Test Draft Story',
    summary: 'Draft summary',
    publishedAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
    readingTime: 5,
    author: { name: 'Test Author' },
    evidenceScore: 80,
    category: 'policy',
    tags: ['test'],
    keyPoints: [],
    timeline: [],
    facts: [],
    claims: [
      { claim: 'Claim 1', source: 'Source 1', verification: 'true', explanation: 'Exp 1', confidence: 0.9 },
      { claim: 'Claim 2', source: 'Source 2', verification: 'false', explanation: 'Exp 2', confidence: 0.5 },
    ],
    sources: [],
    charts: [],
    faq: [],
    relatedStories: [],
    relatedEntities: [],
    publicationStatus: 'draft' as const,
  };

  const canonicalDraft = apiStoryToCanonical(draftAPIStory as any);
  assert(canonicalDraft.status === 'draft', 'apiStoryToCanonical preserves draft status', r);
  assert(isCanonicalStoryPublic(canonicalDraft, NOW) === false, 'canonicalDraft is not publicly viewable', r);

  const canonicalDraft1 = apiStoryToCanonical(draftAPIStory as any);
  const canonicalDraft2 = apiStoryToCanonical(draftAPIStory as any);
  assert(
    canonicalDraft1.claims[0].id === 'claim-test-draft-story-0' &&
    canonicalDraft1.claims[0].id === canonicalDraft2.claims[0].id,
    'apiStoryToCanonical generates deterministic claim IDs across calls',
    r
  );

  console.log(`\nPublication Policy Tests: ${r.passed} passed, ${r.failed} failed`);
  if (r.failed > 0) process.exit(1);
}

runTests();
