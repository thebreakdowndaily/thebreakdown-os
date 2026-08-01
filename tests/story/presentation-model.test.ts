/**
 * THE BREAKDOWN — Presentation Model & Predicates Unit Tests
 *
 * Validates:
 * 1. Semantic Trust Signal Predicates (distinct claim conclusions, aggregate state, no score thresholds, no timestamp-only update badge).
 * 2. Relevance Predicates (timeline relevance, UN event filtering, logo asset filtering).
 * 3. Authored Chapter Preservation (blocks order preserved, no auto-reordering/renaming/fabricating).
 * 4. Progressive Disclosure Reading Mode Policy (quick, standard, deep modes).
 */

import { strict as assert } from 'node:assert';
import type { Story, TimelineEvent } from '../../types/canonical';
import {
  deriveStoryTrustSignals,
  canSayPrimarySourcesAvailable,
  canSayUpdated,
  canSayPartiallyVerified,
  classifyClaimConclusion,
} from '../../lib/story/predicates/semantic';
import { filterRelevantTimelineEvents, isTimelineEventRelevant, isVisualAssetRelevant } from '../../lib/story/predicates/relevance';
import { buildStoryPresentationModel } from '../../lib/story/presentation-model';
import { applyReadingModePolicy } from '../../lib/story/reading-mode-policy';

async function runTests() {
  let passed = 0;
  let failed = 0;

  function test(name: string, fn: () => void) {
    try {
      fn();
      console.log(`  PASS: ${name}`);
      passed++;
    } catch (e: any) {
      console.error(`  FAIL: ${name}`);
      console.error(e);
      failed++;
    }
  }

  const baseStory: Story = {
    id: 'indian-education-crisis',
    slug: 'indian-education-crisis',
    title: "India's Education Paradox",
    headline: "India's Education Paradox: Rising Enrolment, Falling Learning — What Went Wrong?",
    summary: 'Investigation into primary education learning poverty.',
    heroImage: '/images/test.jpg',
    author: 'The Breakdown Editorial',
    category: 'policy',
    status: 'published',
    publicationStatus: 'published',
    storyType: 'explainer',
    evidenceScore: 93,
    readingTime: 16,
    publishedAt: '2026-07-22T06:00:00Z',
    createdAt: '2026-07-22T06:00:00Z',
    updatedAt: '2026-07-22T08:00:00Z',
    tags: ['education', 'learning outcomes'],
    blocks: [
      {
        id: 'b1',
        type: 'paragraph',
        region: 'main',
        data: { text: 'First narrative block' },
      },
      {
        id: 'b2',
        type: 'paragraph',
        region: 'main',
        data: { text: 'Second narrative block' },
      },
    ],
    sources: [
      {
        title: 'UDISE+ Official Data',
        url: 'https://udiseplus.gov.in',
        accessedAt: '2026-07-22',
        tier: 1,
      },
    ],
    claims: [
      {
        id: 'claim-1',
        claim: 'Half of Grade 5 students cannot read Grade 2 text',
        data: 'ASER 2024 national survey',
        source: 'ASER Centre',
        sourceUrl: 'https://asercentre.org',
        tier: 1,
        confidence: 0.9,
        status: 'verified',
      },
    ],
    timeline: [
      { date: '2009-04-01', title: 'RTE Act Enforcement', description: 'Right to Education Act' },
      { date: '2020-07-30', title: 'NEP 2020 Approved', description: 'National Education Policy' },
    ],
    faq: [{ question: 'What is ASER?', answer: 'Annual Status of Education Report' }],
    charts: [],
    relatedStoryIds: [],
    relatedEntityIds: ['un', 'india'],
    relatedTopicIds: [],
  };

  test('1. Enforces strict timeline relevance and filters out entity-leaked UN events', () => {
    const unEvent: TimelineEvent = {
      date: '1945-10-24',
      title: 'UN Founded',
      description: 'United Nations Charter comes into force',
    };
    const unscEvent: TimelineEvent = {
      date: '1950-01-01',
      title: 'First UNSC Term',
      description: 'India serves on UN Security Council',
    };

    const candidateEvents: TimelineEvent[] = [...baseStory.timeline, unEvent, unscEvent];
    const filtered = filterRelevantTimelineEvents(candidateEvents, baseStory);

    assert.equal(isTimelineEventRelevant(unEvent, baseStory), false);
    assert.equal(isTimelineEventRelevant(unscEvent, baseStory), false);
    assert.equal(filtered.length, 2);
    assert.deepEqual(
      filtered.map((e) => e.title),
      ['RTE Act Enforcement', 'NEP 2020 Approved']
    );
  });

  test('2. Filters out standalone UNESCO/UN logos as major Visual Intelligence', () => {
    const logoAsset = {
      resolvedAsset: {
        id: 'unesco-logo',
        type: 'logo',
        metadata: { imageCategory: 'LOGO' },
      },
    };
    const chartAsset = {
      resolvedAsset: {
        id: 'learning-outcomes-chart',
        type: 'chart',
        metadata: { imageCategory: 'INFOGRAPHIC' },
      },
    };

    assert.equal(isVisualAssetRelevant(logoAsset), false);
    assert.equal(isVisualAssetRelevant(chartAsset), true);
  });

  test('3. Derives semantic trust signals without score thresholds or timestamp-only badges', () => {
    const signals = deriveStoryTrustSignals(baseStory);
    const signalTypes = signals.map((s) => s.type);

    assert.equal(canSayPrimarySourcesAvailable(baseStory), true);
    assert.equal(signalTypes.includes('primary'), true);
    assert.equal(signalTypes.includes('verified'), true);

    // Timestamp update alone MUST NOT trigger "updated" signal
    assert.equal(canSayUpdated(baseStory), false);
  });

  test('4. Differentiates claim-level conclusions and aggregate trust states', () => {
    // 4a. Supported claim
    assert.equal(classifyClaimConclusion(baseStory.claims[0]), 'supported');

    // 4b. Mixed claim
    const storyWithMixed: Story = {
      ...baseStory,
      claims: [
        { ...baseStory.claims[0], status: 'verified' },
        { id: 'c2', claim: 'Enrolment reached 98%', data: '', source: '', sourceUrl: '', tier: 2, confidence: 0.7, status: 'moderate' },
      ],
    };
    assert.equal(canSayPartiallyVerified(storyWithMixed), true);

    // 4c. Not supported (false) claim prevents "Partially verified" aggregate state
    const storyWithFalse: Story = {
      ...baseStory,
      claims: [
        { ...baseStory.claims[0], status: 'verified' },
        { id: 'c3', claim: 'Fake claim', data: '', source: '', sourceUrl: '', tier: 3, confidence: 0.1, status: 'not_supported' },
      ],
    };
    assert.equal(canSayPartiallyVerified(storyWithFalse), false);
  });

  test('5. Preserves authored chapter block order and does not reorder or fabricate content', () => {
    const presentation = buildStoryPresentationModel(baseStory, [], []);

    assert.equal(presentation.chapters.length, 1);
    assert.equal(presentation.chapters[0].blocks.length, 2);
    assert.equal(presentation.chapters[0].blocks[0].id, 'b1');
    assert.equal(presentation.chapters[0].blocks[1].id, 'b2');
    assert.equal(presentation.hero.headline, baseStory.headline);
  });

  test('6. Applies progressive disclosure reading mode policy correctly', () => {
    const presentation = buildStoryPresentationModel(baseStory, [], []);

    // Quick Mode
    const quickExp = applyReadingModePolicy(presentation, 'quick');
    assert.equal(quickExp.mode, 'quick');
    assert.equal(quickExp.chapters.length, 0);
    assert.equal(quickExp.quickBrief?.answer, baseStory.summary);

    // Standard Mode
    const stdExp = applyReadingModePolicy(presentation, 'standard');
    assert.equal(stdExp.mode, 'standard');
    assert.equal(stdExp.chapters.length, 1);
    assert.equal(stdExp.showTimeline, true);

    // Deep Mode
    const deepExp = applyReadingModePolicy(presentation, 'deep');
    assert.equal(deepExp.mode, 'deep');
    assert.equal(deepExp.showResearchAppendix, true);
  });

  console.log(`\nPresentation Model & Predicate Tests: ${passed} passed, ${failed} failed`);
  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
