/**
 * ─── The Breakdown OS — VS8 Cross-System Corrections & Verification ──────────
 * Tests:
 * 1. GAP-VS8-02: Pipeline Stage 7 & 9 sample reader corrections metrics
 * 2. GAP-VS8-03: Newsroom event bus receives correction events
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  submitReaderCorrection,
  triageReaderCorrection,
  getCorrectionsHealthMetrics,
  resetCorrectionsMemoryStore,
} from '../services/editorial/corrections-service';
import { NewsroomPipelineHealthAggregator } from '../lib/operations/pipeline-health';
import { eventBus } from '../lib/events/event-bus';
import type { Event } from '../types/canonical';

describe('VS8: Cross-System Corrections & Operations Pipeline Integration', () => {
  beforeEach(() => {
    resetCorrectionsMemoryStore();
  });

  it('GAP-VS8-03: emits correction:submitted event when reader submits correction', async () => {
    const receivedEvents: Event[] = [];
    const unsubscribe = eventBus.subscribe('correction:submitted', (event) => {
      receivedEvents.push(event);
    });

    const result = await submitReaderCorrection({
      storySlug: 'india-china-border-lac',
      passageExcerpt: 'The border was demarcated in 1960.',
      suggestedCorrection: 'The LAC remains undemarcated across multiple sectors.',
      submitterEmail: 'reader@example.com',
    });

    expect(result.success).toBe(true);
    expect(receivedEvents.length).toBe(1);
    expect(receivedEvents[0].type).toBe('correction:submitted');
    expect(receivedEvents[0].payload.storySlug).toBe('india-china-border-lac');
    expect(receivedEvents[0].payload.status).toBe('received');

    unsubscribe();
  });

  it('GAP-VS8-03: emits correction:triaged and correction:published on resolution', async () => {
    const triagedEvents: Event[] = [];
    const publishedEvents: Event[] = [];
    const unsubTriaged = eventBus.subscribe('correction:triaged', (e) => triagedEvents.push(e));
    const unsubPublished = eventBus.subscribe('correction:published', (e) => publishedEvents.push(e));

    const submission = await submitReaderCorrection({
      storySlug: 'kashmir-the-first-test',
      passageExcerpt: 'Ceasefire was declared in 1948.',
      suggestedCorrection: 'The ceasefire took effect on 1 January 1949.',
    });

    await triageReaderCorrection(
      {
        correctionId: submission.submissionId!,
        status: 'resolved',
        triageNotes: 'Verified against UNCIP resolution documents.',
        publishedCorrection: {
          category: 'factual',
          previousWording: 'Ceasefire was declared in 1948.',
          correctedWording: 'The ceasefire took effect on 1 January 1949.',
          explanation: 'Corrected to reflect the exact date of the UN ceasefire implementation.',
        },
      },
      { userId: 'editor-1', role: 'editor' }
    );

    expect(triagedEvents.length).toBe(1);
    expect(triagedEvents[0].payload.status).toBe('resolved');
    expect(publishedEvents.length).toBe(1);
    expect(publishedEvents[0].payload.storySlug).toBe('kashmir-the-first-test');

    unsubTriaged();
    unsubPublished();
  });

  it('GAP-VS8-02: Pipeline Stage 7 and Stage 9 reflect reader corrections queue depth', async () => {
    // Empty state
    let health = await NewsroomPipelineHealthAggregator.evaluatePipelineHealth();
    let stage7 = health.stages.find((s) => s.stage === 'VERIFICATION');
    let stage9 = health.stages.find((s) => s.stage === 'READER');

    expect(stage7?.queueDepth).toBe(0);
    expect(stage9?.queueDepth).toBe(0);
    expect(stage9?.throughput).toBe(0);

    // Submit 2 corrections
    await submitReaderCorrection({
      storySlug: 'india-china-border-lac',
      passageExcerpt: 'Excerpt text one here for testing.',
      suggestedCorrection: 'Correction text one here for testing.',
    });
    await submitReaderCorrection({
      storySlug: 'india-china-border-lac',
      passageExcerpt: 'Excerpt text two here for testing.',
      suggestedCorrection: 'Correction text two here for testing.',
    });

    health = await NewsroomPipelineHealthAggregator.evaluatePipelineHealth();
    stage7 = health.stages.find((s) => s.stage === 'VERIFICATION');
    stage9 = health.stages.find((s) => s.stage === 'READER');

    expect(stage7?.queueDepth).toBe(2);
    expect(stage9?.queueDepth).toBe(2);
    expect(stage9?.throughput).toBe(0);

    const metrics = await getCorrectionsHealthMetrics();
    expect(metrics.pendingQueueDepth).toBe(2);
    expect(metrics.inReviewCount).toBe(0);
    expect(metrics.publishedErrataCount).toBe(0);
  });
});
