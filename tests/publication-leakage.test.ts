/**
 * Publication Leakage Regression Tests
 *
 * Proves that draft/review/fact_check content cannot leak publicly.
 * Run after every change to publication logic, adapters, or visibility predicates.
 */

import * as assert from 'assert';
import {
  isPubliclyPublished,
  isCanonicalStoryPublic,
  diagnosePublication,
  storyPublicationContext,
} from '../lib/story/publication';
import { positionalClaimId, isValidClaimId } from '../lib/story/claim-identity';
import type { Story } from '../types/canonical';

function makeStory(overrides: Partial<Story> = {}): Story {
  return {
    id: 'test-story',
    title: 'Test',
    slug: 'test-story',
    headline: 'Test Story',
    summary: 'A test story',
    heroImage: '',
    author: 'Test',
    category: 'test',
    status: 'draft',
    publicationStatus: 'draft',
    storyType: 'standard',
    evidenceScore: 0,
    readingTime: 5,
    publishedAt: '2024-01-01T00:00:00Z',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    tags: [],
    blocks: [],
    sources: [],
    claims: [],
    timeline: [],
    faq: [],
    charts: [],
    relatedStoryIds: [],
    relatedEntityIds: [],
    relatedTopicIds: [],
    ...overrides,
  };
}

function runTests() {
  console.log('Running Publication Leakage Regression Tests...\n');
  let passed = 0;
  let failed = 0;

  function runTest(name: string, fn: () => void) {
    try {
      fn();
      console.log(`  ✅ PASS: ${name}`);
      passed++;
    } catch (e: any) {
      console.error(`  ❌ FAIL: ${name}`);
      console.error(`     ${e.message}`);
      failed++;
    }
  }

  const now = new Date('2025-06-15T12:00:00Z');

  // ─── isPubliclyPublished ───────────────────────────────────────────────

  console.log('─── isPubliclyPublished ───');

  runTest('draft is NOT publicly visible', () => {
    assert.strictEqual(isPubliclyPublished({ publicationStatus: 'draft', publishedAt: '2024-01-01' }, now), false);
  });

  runTest('review is NOT publicly visible', () => {
    assert.strictEqual(isPubliclyPublished({ publicationStatus: 'review', publishedAt: '2024-01-01' }, now), false);
  });

  runTest('archived is NOT publicly visible', () => {
    assert.strictEqual(isPubliclyPublished({ publicationStatus: 'archived', publishedAt: '2024-01-01' }, now), false);
  });

  runTest('scheduled is NOT publicly visible (requires explicit published transition)', () => {
    assert.strictEqual(isPubliclyPublished({ publicationStatus: 'scheduled', publishedAt: '2024-01-01' }, now), false);
  });

  runTest('missing publicationStatus is NOT publicly visible (fail-closed)', () => {
    assert.strictEqual(isPubliclyPublished({ publishedAt: '2024-01-01' }, now), false);
  });

  runTest('published with past date IS publicly visible', () => {
    assert.strictEqual(isPubliclyPublished({ publicationStatus: 'published', publishedAt: '2024-01-01' }, now), true);
  });

  runTest('published with future date is NOT publicly visible', () => {
    assert.strictEqual(isPubliclyPublished({ publicationStatus: 'published', publishedAt: '2026-01-01' }, now), false);
  });

  runTest('published with invalid publishedAt is NOT publicly visible', () => {
    assert.strictEqual(isPubliclyPublished({ publicationStatus: 'published', publishedAt: '' }, now), false);
  });

  runTest('published with missing publishedAt is NOT publicly visible', () => {
    assert.strictEqual(isPubliclyPublished({ publicationStatus: 'published' }, now), false);
  });

  // ─── isCanonicalStoryPublic ────────────────────────────────────────────

  console.log('\n─── isCanonicalStoryPublic ───');

  runTest('draft story is NOT publicly visible', () => {
    const story = makeStory({ publicationStatus: 'draft', publishedAt: '2024-01-01T00:00:00Z' });
    assert.strictEqual(isCanonicalStoryPublic(story, now), false);
  });

  runTest('published story IS publicly visible', () => {
    const story = makeStory({ publicationStatus: 'published', publishedAt: '2024-01-01T00:00:00Z' });
    assert.strictEqual(isCanonicalStoryPublic(story, now), true);
  });

  runTest('story without publicationStatus is NOT publicly visible', () => {
    const story = makeStory({ publishedAt: '2024-01-01T00:00:00Z' });
    delete (story as any).publicationStatus;
    assert.strictEqual(isCanonicalStoryPublic(story, now), false);
  });

  // ─── diagnosePublication ───────────────────────────────────────────────

  console.log('\n─── diagnosePublication ───');

  runTest('diagnose: draft reports correct reason', () => {
    const diag = diagnosePublication('test', { publicationStatus: 'draft', publishedAt: '2024-01-01' }, now);
    assert.strictEqual(diag.isPublic, false);
    assert.strictEqual(diag.reason, 'draft status');
  });

  runTest('diagnose: missing publicationStatus reports correct reason', () => {
    const diag = diagnosePublication('test', { publishedAt: '2024-01-01' }, now);
    assert.strictEqual(diag.isPublic, false);
    assert.strictEqual(diag.reason, 'missing publicationStatus');
  });

  runTest('diagnose: published with future date reports correct reason', () => {
    const diag = diagnosePublication('test', { publicationStatus: 'published', publishedAt: '2026-01-01' }, now);
    assert.strictEqual(diag.isPublic, false);
    assert.strictEqual(diag.reason, 'published but publishedAt is in the future');
  });

  runTest('diagnose: published with valid past date reports public', () => {
    const diag = diagnosePublication('test', { publicationStatus: 'published', publishedAt: '2024-01-01' }, now);
    assert.strictEqual(diag.isPublic, true);
    assert.strictEqual(diag.reason, 'published with valid past publishedAt');
  });

  // ─── storyPublicationContext ───────────────────────────────────────────

  console.log('\n─── storyPublicationContext ───');

  runTest('extracts publicationStatus from story', () => {
    const story = makeStory({ publicationStatus: 'published', publishedAt: '2024-01-01T00:00:00Z' });
    const ctx = storyPublicationContext(story);
    assert.strictEqual(ctx.publicationStatus, 'published');
    assert.strictEqual(ctx.publishedAt, '2024-01-01T00:00:00Z');
  });

  // ─── Deterministic claim IDs ───────────────────────────────────────────

  console.log('\n─── Deterministic claim IDs ───');

  runTest('positionalClaimId is deterministic', () => {
    const id1 = positionalClaimId('test-story', 0);
    const id2 = positionalClaimId('test-story', 0);
    assert.strictEqual(id1, id2);
    assert.strictEqual(id1, 'claim-test-story-0');
  });

  runTest('positionalClaimId changes with index', () => {
    const id1 = positionalClaimId('test-story', 0);
    const id2 = positionalClaimId('test-story', 1);
    assert.notStrictEqual(id1, id2);
  });

  runTest('isValidClaimId validates correctly', () => {
    assert.strictEqual(isValidClaimId('claim-test-story-0'), true);
    assert.strictEqual(isValidClaimId('claim-abc-123'), true);
    assert.strictEqual(isValidClaimId(''), false);
    assert.strictEqual(isValidClaimId('story-123'), false);
  });

  // ─── Summary ───────────────────────────────────────────────────────────

  console.log(`\nPublication leakage tests: ${passed} passed, ${failed} failed.`);
  if (failed > 0) process.exit(1);
}

runTests();
