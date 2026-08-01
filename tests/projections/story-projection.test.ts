/**
 * THE BREAKDOWN OS — Bounded Projection Context Test: Story
 *
 * Verifies transformStoryToViewModel correctly produces clean StoryViewModel projections.
 */

import { transformStoryToViewModel } from '../../lib/projections/story/transformStory';
import type { Story } from '../../types/canonical';

function runStoryProjectionTests() {
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

  console.log('--- RUNNING STORY PROJECTION CONTEXT TESTS ---');

  const mockStory: Story = {
    id: 'story_1947',
    title: 'Foundations of Strategic Autonomy',
    slug: 'foundations-strategic-autonomy',
    headline: 'How 1947 choices shape modern diplomacy',
    summary: 'Detailed examination of Indian non-alignment origins.',
    heroImage: '/images/hero.jpg',
    author: 'Editorial Bureau',
    category: 'Foreign Policy',
    status: 'published',
    storyType: 'analysis',
    evidenceScore: 92,
    readingTime: 8,
    publishedAt: '2026-07-16',
    createdAt: '2026-07-01',
    updatedAt: '2026-07-16',
    tags: ['history', 'foreign-policy'],
    blocks: [],
    sources: [
      {
        id: 'src_1',
        title: 'Declassified External Affairs Archive 1954',
        url: 'https://archive.org/doc1',
        accessedAt: '2026-07-16',
        tier: 1,
        archiveHash: 'sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      },
    ],
    claims: [
      {
        id: 'cl_1',
        claim: 'Panchsheel Agreement was signed in Peking on April 29, 1954.',
        data: 'Bilateral treaty text',
        source: 'Declassified External Affairs Archive 1954',
        sourceUrl: 'https://archive.org/doc1',
        tier: 1,
        evidenceTier: 'tier_1_primary_archival',
        confidence: 98,
        status: 'verified',
      },
    ],
    timeline: [
      {
        id: 'evt_1',
        date: '1954-04-29',
        title: 'Panchsheel Agreement Signed',
        description: 'Five Principles of Peaceful Coexistence established.',
      },
    ],
    faq: [],
    charts: [],
    relatedStoryIds: [],
    relatedEntityIds: [],
    relatedTopicIds: [],
  };

  try {
    const vm = transformStoryToViewModel(mockStory);

    assert(vm.id === 'story_1947', 'ViewModel receives story ID');
    assert(vm.title === 'Foundations of Strategic Autonomy', 'ViewModel receives story title');
    assert(vm.evidenceDrawer.totalClaimsCount === 1, 'Evidence drawer tracks claims count');
    assert(vm.evidenceDrawer.primarySourcesCount === 1, 'Evidence drawer tracks primary sources count');
    assert(vm.timelineNodes.length === 1, 'Timeline projection array populated');
    assert(vm.seo.canonicalUrl === 'https://thebreakdown.in/stories/foundations-strategic-autonomy', 'SEO canonical URL correctly generated');
    assert(typeof vm.narrativeBlocks.whatHappened === 'string', '7 Mandatory Narrative Blocks present');
  } catch (err) {
    console.error('  ✗ FAIL: Story projection transformer threw exception', err);
    failed++;
  }

  console.log(`\nRESULTS: ${passed} passed, ${failed} failed.`);
  if (failed > 0) {
    process.exit(1);
  }
}

runStoryProjectionTests();
