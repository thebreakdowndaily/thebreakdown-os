/**
 * THE BREAKDOWN — Canonical Story Source Adapters Tests
 *
 * Validates that APIStory, Chapter, and DB inputs produce consistent Canonical Story objects.
 */

import {
  apiStoryToCanonicalAdapter,
  chapterToCanonicalAdapter,
  dbStoryToCanonicalAdapter,
  mapAPIStatusToCanonicalStatus,
} from '../lib/story/adapters';
import type { Chapter } from '../types/canonical';
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

async function runTests() {
  const r = { passed: 0, failed: 0 };

  // 1. mapAPIStatusToCanonicalStatus
  assert(mapAPIStatusToCanonicalStatus('verified', 'published') === 'published', 'status mapping published', r);
  assert(mapAPIStatusToCanonicalStatus('developing', 'draft') === 'draft', 'status mapping draft', r);
  assert(mapAPIStatusToCanonicalStatus(undefined, 'scheduled') === 'scheduled', 'status mapping scheduled', r);

  // 2. apiStoryToCanonicalAdapter
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
  assert(canonicalFromAPI.title === 'India Trade Policy Assessment', 'apiStoryToCanonical maps title', r);
  assert(canonicalFromAPI.status === 'published', 'apiStoryToCanonical maps status', r);
  assert(canonicalFromAPI.claims[0].id === 'claim-india-trade-policy-0', 'apiStoryToCanonical uses deterministic claim ID', r);

  // 3. chapterToCanonicalAdapter
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
  assert(canonicalFromChapter.title === 'The Partition and Its Legacies', 'chapterToCanonical maps title', r);
  assert(canonicalFromChapter.status === 'published', 'chapterToCanonical maps verified status to published', r);
  assert(canonicalFromChapter.category === 'india-and-the-world', 'chapterToCanonical maps collectionSlug to category', r);
  assert(canonicalFromChapter.readingTime === 15, 'chapterToCanonical maps explorer readingTime', r);

  // 4. dbStoryToCanonicalAdapter
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
  assert(canonicalFromDb.title === 'Digital Public Infrastructure in India', 'dbStoryToCanonical maps headline', r);
  assert(canonicalFromDb.status === 'published', 'dbStoryToCanonical maps publicationStatus', r);
  assert(canonicalFromDb.evidenceScore === 98, 'dbStoryToCanonical maps evidenceScore', r);

  console.log(`\nAdapter Tests: ${r.passed} passed, ${r.failed} failed`);
  if (r.failed > 0) process.exit(1);
}

runTests();
