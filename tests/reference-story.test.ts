/**
 * THE BREAKDOWN OS — Golden Reference Story Test Suite (Phase 4)
 *
 * Verifies Chapter 1 (Foundations of Indian Strategic Autonomy 1947–1962)
 * reference implementation against Phase 4 architectural constraints.
 */

import { CHAPTER_1_SOURCES, CHAPTER_1_CLAIMS } from '../lib/editorial/chapter-1-data';
import { transformStoryToViewModel } from '../lib/projections/story/transformStory';
import type { Story } from '../types/canonical';

function runReferenceStoryTests() {
  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, name: string) {
    if (condition) {
      console.log(`  ✓ PASS: ${name}`);
      passed++;
    } else {
      console.error(`  ✗ FAIL: ${name}`);
      failed++;
    }
  }

  console.log('--- RUNNING PHASE 4 GOLDEN REFERENCE STORY TESTS ---');

  const chapter1CanonicalStory: Story = {
    id: 'chapter-1-foundations',
    title: 'Foundations of Indian Strategic Autonomy (1947–1962)',
    slug: 'foundations-of-strategic-autonomy-1947-1962',
    headline: 'How early post-independence choices created a resilient diplomatic stance',
    summary: 'An exhaustive examination of India foreign policy post-1947.',
    heroImage: '/assets/images/chapter1-hero.jpg',
    author: 'Editorial Bureau & History Panel',
    category: 'Foreign Policy',
    status: 'published',
    storyType: 'investigation_chapter',
    evidenceScore: 96,
    readingTime: 12,
    publishedAt: '2026-07-16',
    createdAt: '2026-07-01',
    updatedAt: '2026-07-25',
    tags: ['strategic-autonomy', 'non-alignment', 'nehru-era'],
    blocks: [],
    sources: CHAPTER_1_SOURCES,
    claims: CHAPTER_1_CLAIMS,
    timeline: [
      { id: 'evt-1947', date: '1947-08-15', title: 'Independence', description: 'India achieves independence.' },
      { id: 'evt-1954', date: '1954-04-29', title: 'Panchsheel Agreement', description: 'Five Principles signed.' },
      { id: 'evt-1955', date: '1955-04-24', title: 'Bandung Conference', description: 'Birth of Non-Aligned Movement.' },
    ],
    faq: [],
    charts: [],
    relatedStoryIds: [],
    relatedEntityIds: [],
    relatedTopicIds: [],
    takeaway: 'India strategic autonomy was forged through deliberate resistance to Cold War bloc alignment.',
    whoIsAffected: 'Directly informs contemporary Indian multi-alignment foreign policy.',
  };

  try {
    const vm = transformStoryToViewModel(chapter1CanonicalStory);

    assert(vm.id === 'chapter-1-foundations', 'Chapter 1 ID preserved in StoryViewModel');
    assert(vm.title.includes('Foundations of Indian Strategic Autonomy'), 'Title correctly projected');
    assert(vm.evidenceDrawer.primarySourcesCount === CHAPTER_1_SOURCES.length, 'Evidence drawer reflects all Chapter 1 primary sources');
    assert(vm.evidenceDrawer.totalClaimsCount === CHAPTER_1_CLAIMS.length, 'Evidence drawer reflects all Chapter 1 claims');
    assert(vm.timelineNodes.length === 3, 'Projected timeline array populated with 3 events');
    assert(typeof vm.narrativeBlocks.whatHappened === 'string', 'Mandatory Block 1 (What Happened) present');
    assert(typeof vm.narrativeBlocks.whyItMatters === 'string', 'Mandatory Block 2 (Why It Matters) present');
    assert(typeof vm.narrativeBlocks.whatEvidenceExists === 'string', 'Mandatory Block 6 (What Evidence Exists) present');
    assert(typeof vm.narrativeBlocks.whatToExploreNext === 'string', 'Mandatory Block 7 (What to Explore Next) present');
    assert(vm.seo.canonicalUrl === 'https://thebreakdown.in/stories/foundations-of-strategic-autonomy-1947-1962', 'Canonical SEO URL generated');
  } catch (err) {
    console.error('  ✗ FAIL: Chapter 1 Golden Reference test threw exception', err);
    failed++;
  }

  console.log(`\nRESULTS: ${passed} passed, ${failed} failed.`);
  if (failed > 0) {
    process.exit(1);
  }
}

runReferenceStoryTests();
