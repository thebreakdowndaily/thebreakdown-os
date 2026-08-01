/**
 * THE BREAKDOWN OS — Reader Product Surface & Information Architecture Tests (Phase 5)
 *
 * Verifies Homepage Information Architecture answering the 3 core questions:
 * 1. What matters today?
 * 2. What should I understand?
 * 3. Where do I go next?
 */

import { transformStoryToReaderCard } from '../lib/projections/reader/transformReaderCard';
import { transformTopicToViewModel } from '../lib/projections/topic/transformTopic';
import { transformTimelineToViewModel } from '../lib/projections/timeline/transformTimeline';
import type { Story, Topic, TimelineEvent } from '../types/canonical';

function runReaderProductSurfaceTests() {
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

  console.log('--- RUNNING PHASE 5 READER PRODUCT SURFACE & IA TESTS ---');

  const mockLeadStory: Story = {
    id: 'story_lead_1947',
    title: 'The Foundations of Indian Strategic Autonomy',
    slug: 'foundations-strategic-autonomy',
    headline: 'How early post-independence choices shape modern diplomacy',
    summary: 'An exhaustive examination of India foreign policy post-1947.',
    heroImage: '/images/lead.jpg',
    author: 'Editorial Bureau',
    category: 'Foreign Policy',
    status: 'published',
    storyType: 'analysis',
    evidenceScore: 95,
    readingTime: 10,
    publishedAt: '2026-07-26',
    createdAt: '2026-07-01',
    updatedAt: '2026-07-26',
    tags: ['foreign-policy'],
    blocks: [],
    sources: [{ title: 'Archive 1954', url: 'https://archive.org', accessedAt: '2026-07-26', tier: 1 }],
    claims: [{ id: 'c1', claim: 'Panchsheel Agreement signed.', data: 'Text', source: 'Archive', sourceUrl: '#', tier: 1, confidence: 95, status: 'verified' }],
    timeline: [],
    faq: [],
    charts: [],
    relatedStoryIds: [],
    relatedEntityIds: [],
    relatedTopicIds: [],
  };

  const mockTopic: Topic = {
    id: 'top_1',
    name: 'Indian Foreign Policy',
    slug: 'foreign-policy',
    description: 'Origins of Indian non-alignment.',
    storyIds: ['story_lead_1947'],
    relatedEntityIds: [],
    featuredStoryIds: ['story_lead_1947'],
    countries: ['India'],
    faq: [],
    timeline: [],
    statistics: [],
    createdAt: '2026-07-01',
    updatedAt: '2026-07-26',
  };

  const mockTimelineEvents: TimelineEvent[] = [
    { date: '1947-08-15', title: 'Independence', description: 'Partition and independence.' },
    { date: '1954-04-29', title: 'Panchsheel', description: 'Five Principles.' },
  ];

  // Test 1: Lead Story Reader Card Transformation
  try {
    const leadCard = transformStoryToReaderCard(mockLeadStory, true);
    assert(leadCard.isFeatured === true, 'Lead story card marked as featured');
    assert(leadCard.verifiedEvidenceBadge.includes('1 Verified Claims'), 'Verified evidence badge formatted');
  } catch (err) {
    console.error('  ✗ FAIL: Lead story reader card test failed', err);
    failed++;
  }

  // Test 2: Topic Projection for Homepage Navigation
  try {
    const storiesMap = new Map<string, Story>([[mockLeadStory.id, mockLeadStory]]);
    const topicVM = transformTopicToViewModel(mockTopic, storiesMap);
    assert(topicVM.name === 'Indian Foreign Policy', 'Featured topic hub name projected');
    assert(topicVM.featuredStories.length === 1, 'Featured topic story array populated');
  } catch (err) {
    console.error('  ✗ FAIL: Topic projection test failed', err);
    failed++;
  }

  // Test 3: Interactive Timeline Projection for Homepage Knowledge Paths
  try {
    const timelineVM = transformTimelineToViewModel('tl_foundations', 'foundations-timeline', 'Strategic Autonomy Timeline', 'Key decisions', mockTimelineEvents);
    assert(timelineVM.totalEventsCount === 2, 'Timeline events count accurate');
    assert(timelineVM.startYear === '1947' && timelineVM.endYear === '1954', 'Timeline year span computed correctly');
  } catch (err) {
    console.error('  ✗ FAIL: Timeline projection test failed', err);
    failed++;
  }

  console.log(`\nRESULTS: ${passed} passed, ${failed} failed.`);
  if (failed > 0) {
    process.exit(1);
  }
}

runReaderProductSurfaceTests();
