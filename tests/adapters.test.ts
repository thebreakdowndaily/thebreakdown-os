/**
 * THE BREAKDOWN — Canonical Story Source Adapters Tests
 *
 * Validates that APIStory, Chapter, and DB inputs produce consistent Canonical Story objects.
 * Covers: field mapping, edge cases, publication visibility, deterministic IDs, status transitions.
 */

import {
  apiStoryToCanonicalAdapter,
  chapterToCanonicalAdapter,
  dbStoryToCanonicalAdapter,
  mapAPIStatusToCanonicalStatus,
} from '../lib/story/adapters';
import { isCanonicalStoryPublic, isPubliclyPublished, storyPublicationContext } from '../lib/story/publication';
import { positionalClaimId, isValidClaimId } from '../lib/story/claim-identity';
import type { Chapter, Story } from '../types/canonical';
import type { APIStory } from '../utils/data-layer/types';

function assert(condition: boolean, name: string, results: { passed: number; failed: number }) {
  if (condition) {
    console.log(`  PASS: ${name}`);
    results.passed++;
  } else {
    console.error(`  FAIL: ${name}`);
    results.failed++;
  }
}

function assertEqual<T>(actual: T, expected: T, name: string, results: { passed: number; failed: number }) {
  if (actual === expected) {
    console.log(`  PASS: ${name}`);
    results.passed++;
  } else {
    console.error(`  FAIL: ${name} — expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
    results.failed++;
  }
}

async function runTests() {
  const r = { passed: 0, failed: 0 };

  // ─── 1. mapAPIStatusToCanonicalStatus ────────────────────────────────────
  console.log('\n── Status Mapping ──');
  assertEqual(mapAPIStatusToCanonicalStatus('verified', 'published'), 'published', 'verified+published → published', r);
  assertEqual(mapAPIStatusToCanonicalStatus('developing', 'draft'), 'draft', 'developing+draft → draft', r);
  assertEqual(mapAPIStatusToCanonicalStatus(undefined, 'scheduled'), 'scheduled', 'undefined+scheduled → scheduled', r);
  assertEqual(mapAPIStatusToCanonicalStatus('verified', undefined), 'published', 'verified+undefined → published', r);
  assertEqual(mapAPIStatusToCanonicalStatus(undefined, undefined), 'draft', 'both undefined → draft', r);
  assertEqual(mapAPIStatusToCanonicalStatus('published', 'review'), 'review', 'published+review → review (publicationStatus wins)', r);
  assertEqual(mapAPIStatusToCanonicalStatus('anything', 'published'), 'published', 'anything+published → published', r);
  assertEqual(mapAPIStatusToCanonicalStatus('review', 'draft'), 'draft', 'review+draft → draft (publicationStatus wins)', r);

  // ─── 2. apiStoryToCanonicalAdapter — field mapping ───────────────────────
  console.log('\n── APIStory Adapter: Core Mapping ──');
  const mockApiStory: APIStory = {
    id: 'api-123',
    slug: 'india-trade-policy',
    headline: 'India Trade Policy Assessment',
    summary: 'A deep assessment of foreign trade policies.',
    publishedAt: '2026-05-10T10:00:00Z',
    updatedAt: '2026-05-10T10:00:00Z',
    readingTime: 8,
    author: { name: 'Editorial Desk' },
    evidenceScore: 94,
    category: 'economy',
    tags: ['trade', 'economy'],
    keyPoints: ['Export growth 12%', 'Tariffs adjusted'],
    timeline: [{ date: '2026-01-01', title: 'Policy Launch', description: 'New policy announced.' }],
    facts: [{ label: 'Export Volume', value: '$450B', source: 'Ministry of Commerce' }],
    claims: [{ claim: 'Exports grew by 12%', source: 'MoC', verification: 'true', explanation: 'Verified via MoC records', confidence: 0.95 }],
    sources: [{ name: 'Ministry of Commerce Report', url: 'https://commerce.gov.in', type: 'government', tier: 1 }],
    charts: [],
    faq: [{ question: 'What is the target?', answer: '$1 Trillion by 2030' }],
    relatedStories: [],
    relatedEntities: [],
    publicationStatus: 'published',
  };

  const canonicalFromAPI = apiStoryToCanonicalAdapter(mockApiStory);
  assertEqual(canonicalFromAPI.title, 'India Trade Policy Assessment', 'apiStory: title mapped', r);
  assertEqual(canonicalFromAPI.slug, 'india-trade-policy', 'apiStory: slug preserved', r);
  assertEqual(canonicalFromAPI.status, 'published', 'apiStory: status mapped', r);
  assertEqual(canonicalFromAPI.publicationStatus, 'published', 'apiStory: publicationStatus preserved', r);
  assertEqual(canonicalFromAPI.author, 'Editorial Desk', 'apiStory: author.name → string', r);
  assertEqual(canonicalFromAPI.category, 'economy', 'apiStory: category preserved', r);
  assertEqual(canonicalFromAPI.evidenceScore, 94, 'apiStory: evidenceScore preserved', r);
  assertEqual(canonicalFromAPI.readingTime, 8, 'apiStory: readingTime preserved', r);
  assert(JSON.stringify(canonicalFromAPI.tags) === JSON.stringify(['trade', 'economy']), 'apiStory: tags preserved', r);
  assertEqual(canonicalFromAPI.sources.length, 1, 'apiStory: sources mapped', r);
  assertEqual(canonicalFromAPI.sources[0].title, 'Ministry of Commerce Report', 'apiStory: source.title ← name', r);
  assertEqual(canonicalFromAPI.sources[0].tier, 1, 'apiStory: source.tier preserved', r);

  // ─── 3. apiStoryToCanonicalAdapter — deterministic claim IDs ─────────────
  console.log('\n── APIStory Adapter: Deterministic Claim IDs ──');
  assertEqual(canonicalFromAPI.claims[0].id, 'claim-india-trade-policy-0', 'apiStory: deterministic claim ID', r);
  assert(isValidClaimId(canonicalFromAPI.claims[0].id), 'apiStory: claim ID passes validation', r);

  const call1 = apiStoryToCanonicalAdapter(mockApiStory);
  const call2 = apiStoryToCanonicalAdapter(mockApiStory);
  assertEqual(call1.claims[0].id, call2.claims[0].id, 'apiStory: deterministic across calls', r);

  // ─── 4. apiStoryToCanonicalAdapter — edge cases ──────────────────────────
  console.log('\n── APIStory Adapter: Edge Cases ──');
  const minimalApiStory: APIStory = {
    slug: 'minimal-story',
    headline: 'Minimal',
    summary: 'Short.',
    publishedAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  };
  const canonicalMinimal = apiStoryToCanonicalAdapter(minimalApiStory);
  assertEqual(canonicalMinimal.title, 'Minimal', 'apiStory minimal: title mapped', r);
  assertEqual(canonicalMinimal.author, 'The Breakdown', 'apiStory minimal: default author', r);
  assertEqual(canonicalMinimal.category, 'general', 'apiStory minimal: default category', r);
  assertEqual(canonicalMinimal.readingTime, 5, 'apiStory minimal: default readingTime', r);
  assertEqual(canonicalMinimal.claims.length, 0, 'apiStory minimal: no claims', r);
  assertEqual(canonicalMinimal.sources.length, 0, 'apiStory minimal: no sources', r);
  assertEqual(canonicalMinimal.tags.length, 0, 'apiStory minimal: no tags', r);

  // Publication status fallback via LEGACY_PUBLIC_SLUGS
  const legacySlug = apiStoryToCanonicalAdapter({ ...minimalApiStory, slug: 'mgnrega-reform' } as APIStory);
  assertEqual(legacySlug.publicationStatus, 'published', 'apiStory: LEGACY_PUBLIC_SLUGS fallback → published', r);

  const unknownSlug = apiStoryToCanonicalAdapter({ ...minimalApiStory, slug: 'unknown-slug-xyz' } as APIStory);
  assertEqual(unknownSlug.publicationStatus, 'draft', 'apiStory: unknown slug → draft', r);

  // ─── 5. apiStoryToCanonicalAdapter — claim status derivation ─────────────
  console.log('\n── APIStory Adapter: Claim Status Derivation ──');
  const storyWithClaims = apiStoryToCanonicalAdapter({
    ...mockApiStory,
    claims: [
      { claim: 'Verified claim', source: 'X', verification: 'true', confidence: 0.9 },
      { claim: 'Strong claim', source: 'Y', confidence: 0.85 },
      { claim: 'Moderate claim', source: 'Z', confidence: 0.65 },
      { claim: 'Weak claim', source: 'W', confidence: 0.3 },
    ],
  } as APIStory);
  assertEqual(storyWithClaims.claims[0].status, 'verified', 'apiStory: verified claim (verification=true)', r);
  assertEqual(storyWithClaims.claims[1].status, 'strong', 'apiStory: strong claim (confidence≥0.8)', r);
  assertEqual(storyWithClaims.claims[2].status, 'moderate', 'apiStory: moderate claim (confidence≥0.6)', r);
  assertEqual(storyWithClaims.claims[3].status, 'unverified', 'apiStory: unverified claim (confidence<0.6)', r);

  // ─── 6. chapterToCanonicalAdapter — core mapping ─────────────────────────
  console.log('\n── Chapter Adapter: Core Mapping ──');
  const mockChapter: Chapter = {
    id: 'ch-101',
    collectionSlug: 'india-and-the-world',
    volumeSlug: 'foundations-1947-1962',
    slug: 'the-partition-and-its-legacies',
    title: 'The Partition and Its Legacies',
    summary: 'Examining the border demarcations and diplomatic aftermath of 1947.',
    order: 1,
    content: [],
    metadata: {
      researchBriefId: 'rb-01',
      version: '1.0',
      status: 'verified',
      wordCount: 12000,
      readingTimeMinutes: 25,
      qualityScore: 96,
      densityScore: 92,
      evidenceCoverageRatio: 0.95,
      historiographicalRangeScore: 0.9,
      learningObjectiveCount: 10,
    },
    keyQuestions: [],
    misconceptions: [],
    keyTerms: [],
    sources: [{ title: 'Mountbatten Papers', url: 'https://archives.org', accessedAt: '2026-01-01', tier: 1 }],
    claims: [],
    version: { major: 1, minor: 0, patch: 0 },
    relatedEntityIds: ['mountbatten', 'radcliffe'],
    relatedConceptIds: ['partition', 'borders'],
    relatedSourceIds: [],
    status: 'verified',
    readingTime: { explorer: 15, scholar: 30 },
    studyTime: { explorer: 20, scholar: 40 },
    difficulty: 3,
    prerequisites: [],
    learningObjectives: [],
    recommendedNext: ['kashmir-first-test'],
    createdAt: '2026-07-01T00:00:00Z',
    updatedAt: '2026-07-01T00:00:00Z',
  };

  const canonicalFromChapter = chapterToCanonicalAdapter(mockChapter);
  assertEqual(canonicalFromChapter.title, 'The Partition and Its Legacies', 'chapter: title mapped', r);
  assertEqual(canonicalFromChapter.slug, 'the-partition-and-its-legacies', 'chapter: slug preserved', r);
  assertEqual(canonicalFromChapter.status, 'published', 'chapter: verified → published', r);
  assertEqual(canonicalFromChapter.publicationStatus, 'published', 'chapter: verified → published (pub)', r);
  assertEqual(canonicalFromChapter.category, 'india-and-the-world', 'chapter: collectionSlug → category', r);
  assertEqual(canonicalFromChapter.readingTime, 15, 'chapter: explorer readingTime', r);
  assertEqual(canonicalFromChapter.author, 'The Breakdown Editorial', 'chapter: default author', r);
  assertEqual(canonicalFromChapter.storyType, 'investigation_chapter', 'chapter: storyType', r);
  assertEqual(canonicalFromChapter.evidenceScore, 90, 'chapter: default evidenceScore', r);
  assertEqual(canonicalFromChapter.sources.length, 1, 'chapter: sources mapped', r);
  assertEqual(canonicalFromChapter.sources[0].title, 'Mountbatten Papers', 'chapter: source title', r);

  // ─── 7. chapterToCanonicalAdapter — edge cases ──────────────────────────
  console.log('\n── Chapter Adapter: Edge Cases ──');
  const draftChapter: Chapter = {
    ...mockChapter,
    id: 'ch-draft',
    slug: 'draft-chapter',
    title: 'Draft Chapter',
    status: 'draft',
    readingTime: undefined,
    keyQuestions: [{ id: 'kq-1', question: 'Why?', answer: 'Because.' }],
  } as unknown as Chapter;
  const canonicalDraft = chapterToCanonicalAdapter(draftChapter);
  assertEqual(canonicalDraft.status, 'draft', 'chapter draft: status preserved', r);
  assertEqual(canonicalDraft.publicationStatus, 'draft', 'chapter draft: pub status draft', r);
  assertEqual(canonicalDraft.faq.length, 1, 'chapter: keyQuestions → faq', r);
  assertEqual(canonicalDraft.faq[0].question, 'Why?', 'chapter: keyQuestions[0].question mapped', r);
  assertEqual(canonicalDraft.readingTime, 10, 'chapter: fallback readingTime when undefined', r);

  // Chapter with scholar readingTime fallback
  const scholarChapter: Chapter = {
    ...mockChapter,
    id: 'ch-scholar',
    slug: 'scholar-chapter',
    title: 'Scholar Chapter',
    readingTime: { explorer: undefined, scholar: 40 },
  } as unknown as Chapter;
  const canonicalScholar = chapterToCanonicalAdapter(scholarChapter);
  assertEqual(canonicalScholar.readingTime, 40, 'chapter: scholar readingTime fallback', r);

  // ─── 8. chapterToCanonicalAdapter — content → blocks ─────────────────────
  console.log('\n── Chapter Adapter: Content → Blocks ──');
  const chapterWithContent: Chapter = {
    ...mockChapter,
    id: 'ch-content',
    content: [
      { id: 'kb-1', type: 'narrative', data: { text: 'Hello' } },
      { id: 'kb-2', type: 'claim', data: { claim: 'Test' } },
    ],
  } as unknown as Chapter;
  const canonicalContent = chapterToCanonicalAdapter(chapterWithContent);
  assertEqual(canonicalContent.blocks.length, 2, 'chapter: content → blocks', r);
  assertEqual(canonicalContent.blocks[0].id, 'kb-1', 'chapter: block id preserved', r);
  assertEqual(canonicalContent.blocks[0].type, 'narrative', 'chapter: block type preserved', r);
  assertEqual(canonicalContent.blocks[0].region, 'main', 'chapter: block region defaults to main', r);

  // ─── 9. dbStoryToCanonicalAdapter — core mapping ────────────────────────
  console.log('\n── DB Record Adapter: Core Mapping ──');
  const mockDbRecord = {
    id: 'db-999',
    slug: 'digital-public-infrastructure',
    headline: 'Digital Public Infrastructure in India',
    summary: 'Analysis of Aadhaar, UPI, and ONDC.',
    publicationStatus: 'published',
    status: 'published',
    evidenceScore: 98,
    tags: ['dpi', 'technology'],
  };

  const canonicalFromDb = dbStoryToCanonicalAdapter(mockDbRecord);
  assertEqual(canonicalFromDb.title, 'Digital Public Infrastructure in India', 'dbStory: headline → title', r);
  assertEqual(canonicalFromDb.slug, 'digital-public-infrastructure', 'dbStory: slug preserved', r);
  assertEqual(canonicalFromDb.status, 'published', 'dbStory: status mapped', r);
  assertEqual(canonicalFromDb.publicationStatus, 'published', 'dbStory: pub status preserved', r);
  assertEqual(canonicalFromDb.evidenceScore, 98, 'dbStory: evidenceScore preserved', r);
  assert(JSON.stringify(canonicalFromDb.tags) === JSON.stringify(['dpi', 'technology']), 'dbStory: tags preserved', r);

  // ─── 10. dbStoryToCanonicalAdapter — empty record ────────────────────────
  console.log('\n── DB Record Adapter: Empty Record ──');
  const emptyRecord = {};
  const canonicalEmpty = dbStoryToCanonicalAdapter(emptyRecord);
  assertEqual(canonicalEmpty.title, '', 'dbStory empty: title is empty string', r);
  assertEqual(canonicalEmpty.slug, '', 'dbStory empty: slug is empty string', r);
  assertEqual(canonicalEmpty.status, 'draft', 'dbStory empty: status defaults to draft', r);
  assertEqual(canonicalEmpty.blocks.length, 0, 'dbStory empty: blocks is empty array', r);
  assertEqual(canonicalEmpty.sources.length, 0, 'dbStory empty: sources is empty array', r);
  assertEqual(canonicalEmpty.claims.length, 0, 'dbStory empty: claims is empty array', r);

  // ─── 11. Publication visibility — adapter outputs ────────────────────────
  console.log('\n── Publication Visibility: Adapter Outputs ──');
  // Published API story should be publicly visible
  const pubApiStory = apiStoryToCanonicalAdapter(mockApiStory);
  assert(isCanonicalStoryPublic(pubApiStory), 'apiStory published → publicly visible', r);

  // Draft API story should NOT be publicly visible
  const draftApiStory = apiStoryToCanonicalAdapter({
    ...mockApiStory,
    slug: 'draft-story',
    publicationStatus: 'draft',
  } as APIStory);
  assert(!isCanonicalStoryPublic(draftApiStory), 'apiStory draft → NOT publicly visible', r);

  // Published chapter should be publicly visible
  const pubChapter = chapterToCanonicalAdapter(mockChapter);
  assert(isCanonicalStoryPublic(pubChapter), 'chapter published → publicly visible', r);

  // Draft chapter should NOT be publicly visible
  const draftChapterPub = chapterToCanonicalAdapter(draftChapter);
  assert(!isCanonicalStoryPublic(draftChapterPub), 'chapter draft → NOT publicly visible', r);

  // Published DB record should be publicly visible
  const pubDb = dbStoryToCanonicalAdapter(mockDbRecord);
  assert(isCanonicalStoryPublic(pubDb), 'dbStory published → publicly visible', r);

  // Draft DB record should NOT be publicly visible
  const draftDb = dbStoryToCanonicalAdapter({ ...mockDbRecord, publicationStatus: 'draft', status: 'draft' });
  assert(!isCanonicalStoryPublic(draftDb), 'dbStory draft → NOT publicly visible', r);

  // ─── 12. Cross-adapter consistency ──────────────────────────────────────
  console.log('\n── Cross-Adapter Consistency ──');
  // All adapters should produce Story objects with required fields
  const stories: Story[] = [pubApiStory, pubChapter, pubDb];
  for (const story of stories) {
    assert(typeof story.id === 'string' && story.id.length > 0, `cross-adapter: ${story.slug} has id`, r);
    assert(typeof story.title === 'string', `cross-adapter: ${story.slug} has title`, r);
    assert(typeof story.slug === 'string', `cross-adapter: ${story.slug} has slug`, r);
    assert(typeof story.headline === 'string', `cross-adapter: ${story.slug} has headline`, r);
    assert(typeof story.summary === 'string', `cross-adapter: ${story.slug} has summary`, r);
    assert(typeof story.author === 'string', `cross-adapter: ${story.slug} has author (string)`, r);
    assert(typeof story.category === 'string', `cross-adapter: ${story.slug} has category`, r);
    assert(Array.isArray(story.tags), `cross-adapter: ${story.slug} has tags (array)`, r);
    assert(Array.isArray(story.blocks), `cross-adapter: ${story.slug} has blocks (array)`, r);
    assert(Array.isArray(story.sources), `cross-adapter: ${story.slug} has sources (array)`, r);
    assert(Array.isArray(story.claims), `cross-adapter: ${story.slug} has claims (array)`, r);
    assert(Array.isArray(story.timeline), `cross-adapter: ${story.slug} has timeline (array)`, r);
    assert(Array.isArray(story.faq), `cross-adapter: ${story.slug} has faq (array)`, r);
    assert(Array.isArray(story.charts), `cross-adapter: ${story.slug} has charts (array)`, r);
    assert(Array.isArray(story.relatedStoryIds), `cross-adapter: ${story.slug} has relatedStoryIds (array)`, r);
    assert(Array.isArray(story.relatedEntityIds), `cross-adapter: ${story.slug} has relatedEntityIds (array)`, r);
    assert(Array.isArray(story.relatedTopicIds), `cross-adapter: ${story.slug} has relatedTopicIds (array)`, r);
  }

  // ─── 13. Claim identity module ──────────────────────────────────────────
  console.log('\n── Claim Identity ──');
  const id1 = positionalClaimId('partition', 0);
  const id2 = positionalClaimId('partition', 0);
  assertEqual(id1, id2, 'positionalClaimId: deterministic for same inputs', r);
  assert(isValidClaimId(id1), 'positionalClaimId: produces valid ID', r);
  assert(!isValidClaimId(''), 'isValidClaimId: rejects empty string', r);
  assert(!isValidClaimId('not-a-claim-id'), 'isValidClaimId: rejects malformed ID', r);
  const id3 = positionalClaimId('partition', 1);
  assert(id1 !== id3, 'positionalClaimId: different positions → different IDs', r);

  // ─── Summary ─────────────────────────────────────────────────────────────
  console.log(`\nAdapter Tests: ${r.passed} passed, ${r.failed} failed`);
  if (r.failed > 0) process.exit(1);
}

runTests();
