/**
 * THE BREAKDOWN OS — All Bounded Projections Test Suite & Deterministic Snapshot Test
 *
 * Verifies Story, Topic, Timeline, Search, and Reader Card projection contexts.
 * Guarantees deterministic, identical output when transformers run twice over the same data.
 */

import { transformStoryToViewModel } from '../../lib/projections/story/transformStory';
import { transformTopicToViewModel } from '../../lib/projections/topic/transformTopic';
import { transformTimelineToViewModel } from '../../lib/projections/timeline/transformTimeline';
import { transformSearchToViewModel } from '../../lib/projections/search/transformSearch';
import { transformStoryToReaderCard } from '../../lib/projections/reader/transformReaderCard';
import type { Story, Topic, Claim, TimelineEvent } from '../../types/canonical';

function runAllProjectionTests() {
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

  console.log('--- RUNNING BOUNDED PROJECTION CONTEXT SUITE & SNAPSHOT TESTS ---');

  // Sample Canonical Mock Data
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
    tags: ['history'],
    blocks: [],
    sources: [{ id: 'src_1', title: 'Archive 1954', url: 'https://archive.org/doc1', accessedAt: '2026-07-16', tier: 1 }],
    claims: [{ id: 'cl_1', claim: 'Panchsheel Agreement signed in 1954.', data: 'Text', source: 'Archive 1954', sourceUrl: 'https://archive.org', tier: 1, confidence: 98, status: 'verified' }],
    timeline: [{ id: 'evt_1', date: '1954-04-29', title: 'Panchsheel Agreement Signed', description: 'Five Principles.' }],
    faq: [],
    charts: [],
    relatedStoryIds: [],
    relatedEntityIds: [],
    relatedTopicIds: [],
  };

  const mockTopic: Topic = {
    id: 'topic_foreign_policy',
    name: 'Indian Foreign Policy',
    slug: 'foreign-policy',
    description: 'Origins and evolution of India strategic autonomy.',
    storyIds: ['story_1947'],
    relatedEntityIds: [],
    featuredStoryIds: ['story_1947'],
    countries: ['India'],
    faq: [],
    timeline: [],
    statistics: [],
    createdAt: '2026-07-01',
    updatedAt: '2026-07-16',
  };

  // Test 1: Story Projection & Deterministic Snapshot Test
  try {
    const vm1 = transformStoryToViewModel(mockStory);
    const vm2 = transformStoryToViewModel(mockStory);
    assert(JSON.stringify(vm1) === JSON.stringify(vm2), 'Story projection is byte-for-byte deterministic');
  } catch (err) {
    console.error('  ✗ FAIL: Story projection deterministic test failed', err);
    failed++;
  }

  // Test 2: Topic Projection & Deterministic Snapshot Test
  try {
    const storiesMap = new Map<string, Story>([[mockStory.id, mockStory]]);
    const topicVM1 = transformTopicToViewModel(mockTopic, storiesMap);
    const topicVM2 = transformTopicToViewModel(mockTopic, storiesMap);
    assert(JSON.stringify(topicVM1) === JSON.stringify(topicVM2), 'Topic projection is byte-for-byte deterministic');
    assert(topicVM1.featuredStories.length === 1, 'Topic features 1 projected story');
  } catch (err) {
    console.error('  ✗ FAIL: Topic projection test failed', err);
    failed++;
  }

  // Test 3: Timeline Projection & Deterministic Snapshot Test
  try {
    const events: TimelineEvent[] = [
      { date: '1954-04-29', title: 'Panchsheel', description: 'Treaty' },
      { date: '1947-08-15', title: 'Independence', description: 'Independence Day' },
    ];
    const timelineVM = transformTimelineToViewModel('tl_1', 'india-foundations', 'India Foundations', 'Key events', events);
    assert(timelineVM.events[0].year === '1947', 'Timeline events sorted chronologically');
    assert(timelineVM.startYear === '1947' && timelineVM.endYear === '1954', 'Timeline start and end years computed correctly');
  } catch (err) {
    console.error('  ✗ FAIL: Timeline projection test failed', err);
    failed++;
  }

  // Test 4: Search Projection Test
  try {
    const searchVM = transformSearchToViewModel('foreign policy', [mockStory], [mockTopic], mockStory.claims);
    assert(searchVM.totalMatchesCount === 3, 'Search projection includes stories, topics, and claims matches');
    assert(searchVM.results[0].kind === 'story', 'Search projection classifies story match');
  } catch (err) {
    console.error('  ✗ FAIL: Search projection test failed', err);
    failed++;
  }

  // Test 5: Reader Card Projection Test
  try {
    const cardVM = transformStoryToReaderCard(mockStory, true);
    assert(cardVM.isFeatured === true, 'Reader card receives isFeatured flag');
    assert(cardVM.verifiedEvidenceBadge.includes('1 Verified Claims'), 'Reader card badge formats claims summary');
  } catch (err) {
    console.error('  ✗ FAIL: Reader card projection test failed', err);
    failed++;
  }

  console.log(`\nRESULTS: ${passed} passed, ${failed} failed.`);
  if (failed > 0) {
    process.exit(1);
  }
}

runAllProjectionTests();
