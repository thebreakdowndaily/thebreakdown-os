import { describe, expect, it } from 'vitest';
import { toPublicStory, toPublicDatabaseStory } from '@/lib/story/public-story-projection';
import type { Story } from '@/types/canonical';

const nestedStory = {
  id: 'story-1',
  title: 'Public title',
  slug: 'public-title',
  headline: 'Public headline',
  summary: 'Public summary',
  heroImage: '/public.jpg',
  author: 'Editorial desk',
  category: 'governance',
  status: 'published',
  publicationStatus: 'published',
  storyType: 'standard',
  evidenceScore: 80,
  readingTime: 5,
  publishedAt: '2026-10-01T00:00:00.000Z',
  createdAt: '2026-09-30T00:00:00.000Z',
  updatedAt: '2026-10-01T00:00:00.000Z',
  tags: ['public'],
  relatedStoryIds: [],
  relatedEntityIds: [],
  relatedTopicIds: [],
  notes: 'top-level private note',
  blocks: [{
    id: 'block-1',
    type: 'paragraph',
    region: 'main',
    collapsed: false,
    staffId: 'staff-secret',
    data: {
      text: 'Reader-facing paragraph',
      scheduledAt: '2026-11-01T00:00:00.000Z',
      internalNotes: 'do not expose',
      internal_future_field: 'future private data',
      nested: { updated_by: 'editor-secret', text: 'public nested text' },
    },
  }],
  sources: [{
    id: 'source-1',
    title: 'Official report',
    url: 'https://example.gov/report',
    accessedAt: '2026-10-01T00:00:00.000Z',
    tier: 1,
    publisher: 'Government',
    archiveHash: 'private-archive-hash',
    metadata: { staffOnly: true },
  }],
  claims: [{
    id: 'claim-1',
    claim: 'The report states the policy was adopted.',
    data: 'Public claim data',
    source: 'Official report',
    sourceUrl: 'https://example.gov/report',
    tier: 1,
    confidence: 0.9,
    status: 'verified',
    verifiedAt: '2026-10-01T00:00:00.000Z',
    archiveId: 'private-archive-id',
    cellAddress: 'internal-cell',
    evidenceId: 'internal-evidence-id',
    counterArguments: [{ internalNotes: 'not reader content' }],
  }],
  timeline: [{
    id: 'event-1',
    date: '2026-10-01',
    title: 'Policy announced',
    description: 'The policy was announced.',
    sourceUrl: 'https://example.gov/report',
    storyId: 'internal-story-id',
    evidenceId: 'internal-evidence-id',
    confidence: 0.9,
  }],
  faq: [{
    question: 'What changed?',
    answer: 'The policy was announced.',
    staffNotes: 'private note',
  }],
  charts: [{
    type: 'bar',
    title: 'Public chart',
    description: 'Reader-facing chart',
    data: [{ year: 2025, value: 42, internal_source_id: 'secret', internalNotes: 'private' }],
    xKey: 'year',
    yKey: 'value',
    color: 'blue',
    caption: 'Source: official data',
    staffNotes: 'private chart note',
  }],
} as unknown as Story;

describe('nested public story projection', () => {
  it('allowlists typed nested fields and strips known private keys recursively', () => {
    const result = toPublicStory(nestedStory) as unknown as Record<string, any>;
    expect(result).not.toHaveProperty('notes');
    expect(result.blocks[0]).not.toHaveProperty('staffId');
    expect(result.blocks[0].data).toMatchObject({ text: 'Reader-facing paragraph' });
    expect(result.blocks[0].data).not.toHaveProperty('scheduledAt');
    expect(result.blocks[0].data).not.toHaveProperty('internalNotes');
    expect(result.blocks[0].data).not.toHaveProperty('internal_future_field');
    expect(result.blocks[0].data.nested).not.toHaveProperty('updated_by');

    expect(result.sources[0]).toMatchObject({ id: 'source-1', title: 'Official report', url: 'https://example.gov/report' });
    expect(result.sources[0]).not.toHaveProperty('archiveHash');
    expect(result.sources[0]).not.toHaveProperty('metadata');

    expect(result.claims[0]).toMatchObject({ id: 'claim-1', status: 'verified', confidence: 0.9 });
    for (const field of ['archiveId', 'cellAddress', 'evidenceId', 'counterArguments']) {
      expect(result.claims[0]).not.toHaveProperty(field);
    }

    expect(result.timeline[0]).toMatchObject({ id: 'event-1', title: 'Policy announced' });
    for (const field of ['storyId', 'evidenceId', 'confidence']) {
      expect(result.timeline[0]).not.toHaveProperty(field);
    }
    expect(result.faq[0]).toEqual({ question: 'What changed?', answer: 'The policy was announced.' });
    expect(result.charts[0]).not.toHaveProperty('staffNotes');
    expect(result.charts[0].data[0]).not.toHaveProperty('internal_source_id');
    expect(result.charts[0].data[0]).not.toHaveProperty('internalNotes');
  });

  it('applies nested projections to raw database-story responses too', () => {
    const result = toPublicDatabaseStory({
      id: 'db-story',
      slug: 'db-story',
      status: 'published',
      blocks: [{ id: 'b1', type: 'paragraph', data: { text: 'Public', blocked_at: 'secret' }, internal_future_field: 'secret' }],
      sources: [{ title: 'Source', url: 'https://example.gov', metadata: { staffOnly: true } }],
      claims: [{ id: 'c1', claim: 'Public claim', archive_id: 'secret', status: 'verified' }],
      timeline: [{ date: '2026-01-01', title: 'Event', evidence_id: 'secret' }],
      faq: [{ question: 'Q?', answer: 'A.', staff_notes: 'secret' }],
      charts: [{ type: 'bar', title: 'Chart', data: [{ value: 1, private_notes: 'secret' }], xKey: 'year', yKey: 'value', internal: true }],
      notes: 'top-level secret',
    }) as Record<string, any>;

    expect(result).not.toHaveProperty('notes');
    expect(result.blocks[0]).not.toHaveProperty('internal_future_field');
    expect(result.blocks[0].data).not.toHaveProperty('blocked_at');
    expect(result.sources[0]).not.toHaveProperty('metadata');
    expect(result.claims[0]).not.toHaveProperty('archive_id');
    expect(result.timeline[0]).not.toHaveProperty('evidence_id');
    expect(result.faq[0]).toEqual({ question: 'Q?', answer: 'A.' });
    expect(result.charts[0]).not.toHaveProperty('internal');
    expect(result.charts[0].data[0]).not.toHaveProperty('private_notes');
  });
});
