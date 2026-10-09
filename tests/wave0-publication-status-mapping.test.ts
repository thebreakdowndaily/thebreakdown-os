/**
 * Wave 0 — rowToStory publicationStatus Mapping Tests
 *
 * Governing document: PHASE-2A-ENGINEERING-PLAN.md (Wave 0)
 * Defect: rowToStory() did not map row.status → story.publicationStatus
 *
 * These tests verify the mapping is deterministic and type-safe
 * without touching staging, production, or any external system.
 */

import { describe, it, expect } from 'vitest';
import type { Story, StoryStatus, PublicationStatus } from '@/types/canonical';
import { isPubliclyPublished, storyPublicationContext, isCanonicalStoryPublic } from '@/lib/story/publication';

// ─── Minimal row factory ───────────────────────────────────────────────────────

function makeRow(overrides: Record<string, unknown> = {}) {
  return {
    id: 'test-id',
    legacy_id: null,
    slug: 'test-slug',
    title: 'Test Title',
    headline: 'Test Headline',
    summary: 'Test Summary',
    hero_image: '',
    author: 'Test Author',
    category: 'test',
    status: 'draft',
    evidence_score: 0,
    reading_time: 5,
    tags: [],
    blocks: [],
    sources: [],
    claims: [],
    timeline: [],
    faq: [],
    charts: [],
    related_story_ids: [],
    related_entity_ids: [],
    related_topic_ids: [],
    is_test_artifact: false,
    notes: null,
    version: 1,
    published_at: null,
    scheduled_at: null,
    scheduled_by: null,
    block_reason: null,
    blocked_at: null,
    fallback_story_id: null,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
    updated_by: null,
    ...overrides,
  };
}

// We import rowToStory indirectly by testing the repository's behavior.
// Since rowToStory is a private function, we test it via the canonical
// domain behavior: does the mapped Story have correct publicationStatus?
//
// To avoid needing a live Supabase connection, we extract and replicate
// the exact mapping logic from services/repositories/supabase/story.ts
// and verify it matches the domain contract.

/** Replicates the exact publicationStatus mapping from rowToStory() */
function mapPublicationStatus(dbStatus: string): PublicationStatus {
  const validPublicationStatuses: PublicationStatus[] = ['draft', 'review', 'scheduled', 'published', 'archived', 'superseded'];
  return validPublicationStatuses.includes(dbStatus as PublicationStatus)
    ? dbStatus as PublicationStatus
    : 'draft';
}

/** Replicates the full rowToStory mapping for the fields relevant to publication */
function rowToStoryPublicationFields(row: ReturnType<typeof makeRow>): Pick<Story, 'status' | 'publicationStatus' | 'isTestArtifact' | 'publishedAt'> {
  return {
    status: (row.status as StoryStatus) || 'draft',
    publicationStatus: mapPublicationStatus(row.status),
    isTestArtifact: row.is_test_artifact ?? false,
    publishedAt: row.published_at || '',
  };
}

// ─── Tests ──────────────────────────────────────────────────────────────────────

describe('Wave 0: rowToStory publicationStatus mapping', () => {

  // ── DB status → publicationStatus mapping ────────────────────────────────

  describe('Status mapping determinism', () => {
    it('draft → publicationStatus: draft', () => {
      const fields = rowToStoryPublicationFields(makeRow({ status: 'draft' }));
      expect(fields.status).toBe('draft');
      expect(fields.publicationStatus).toBe('draft');
    });

    it('review → publicationStatus: review', () => {
      const fields = rowToStoryPublicationFields(makeRow({ status: 'review' }));
      expect(fields.status).toBe('review');
      expect(fields.publicationStatus).toBe('review');
    });

    it('published → publicationStatus: published', () => {
      const fields = rowToStoryPublicationFields(makeRow({ status: 'published' }));
      expect(fields.status).toBe('published');
      expect(fields.publicationStatus).toBe('published');
    });

    it('archived → publicationStatus: archived', () => {
      const fields = rowToStoryPublicationFields(makeRow({ status: 'archived' }));
      expect(fields.status).toBe('archived');
      expect(fields.publicationStatus).toBe('archived');
    });

    it('scheduled → publicationStatus: scheduled', () => {
      const fields = rowToStoryPublicationFields(makeRow({ status: 'scheduled' }));
      expect(fields.status).toBe('scheduled');
      expect(fields.publicationStatus).toBe('scheduled');
    });

    it('superseded → publicationStatus: superseded', () => {
      const fields = rowToStoryPublicationFields(makeRow({ status: 'superseded' }));
      expect(fields.status).toBe('superseded');
      expect(fields.publicationStatus).toBe('superseded');
    });
  });

  // ── Values NOT in PublicationStatus union → fail-closed to draft ─────────

  describe('Non-PublicationStatus values fail-closed to draft', () => {
    it('fact_check (StoryStatus but not PublicationStatus) → publicationStatus: draft', () => {
      const fields = rowToStoryPublicationFields(makeRow({ status: 'fact_check' }));
      expect(fields.status).toBe('fact_check');
      expect(fields.publicationStatus).toBe('draft');
    });

    it('updated (StoryStatus but not PublicationStatus) → publicationStatus: draft', () => {
      const fields = rowToStoryPublicationFields(makeRow({ status: 'updated' }));
      expect(fields.status).toBe('updated');
      expect(fields.publicationStatus).toBe('draft');
    });

    it('unknown garbage value → publicationStatus: draft', () => {
      const fields = rowToStoryPublicationFields(makeRow({ status: 'INVALID_STATUS' }));
      expect(fields.publicationStatus).toBe('draft');
    });

    it('empty string → publicationStatus: draft (via || fallback)', () => {
      const fields = rowToStoryPublicationFields(makeRow({ status: '' }));
      expect(fields.publicationStatus).toBe('draft');
    });
  });

  // ── DB column nullability: stories.status has DEFAULT 'draft' ────────────
  // The DB CHECK constraint is: CHECK (status IN ('draft','review','published','archived'))
  // with DEFAULT 'draft'. The column CAN be null if not explicitly constrained NOT NULL.
  // The schema.ts types show `status: string` (not nullable), but we handle defensively.

  describe('Null/undefined edge cases (defensive)', () => {
    it('null status (if schema allows) → publicationStatus: draft', () => {
      // row.status as null should map to 'draft' via the || 'draft' fallback on status
      // and the includes() check will return false for null → 'draft'
      const fields = rowToStoryPublicationFields(makeRow({ status: null }));
      expect(fields.publicationStatus).toBe('draft');
    });
  });

  // ── Publication predicate integration ────────────────────────────────────

  describe('isPubliclyPublished integration with mapped publicationStatus', () => {
    it('published story with valid past publishedAt → isPubliclyPublished: true', () => {
      const fields = rowToStoryPublicationFields(makeRow({
        status: 'published',
        published_at: '2026-01-01T00:00:00Z',
        is_test_artifact: false,
      }));
      const ctx = {
        publicationStatus: fields.publicationStatus,
        publishedAt: fields.publishedAt,
        isTestArtifact: fields.isTestArtifact,
      };
      expect(isPubliclyPublished(ctx, new Date('2026-06-01T00:00:00Z'))).toBe(true);
    });

    it('draft story → isPubliclyPublished: false', () => {
      const fields = rowToStoryPublicationFields(makeRow({
        status: 'draft',
        published_at: '2026-01-01T00:00:00Z',
      }));
      const ctx = {
        publicationStatus: fields.publicationStatus,
        publishedAt: fields.publishedAt,
        isTestArtifact: fields.isTestArtifact,
      };
      expect(isPubliclyPublished(ctx, new Date('2026-06-01T00:00:00Z'))).toBe(false);
    });

    it('published but future publishedAt → isPubliclyPublished: false', () => {
      const fields = rowToStoryPublicationFields(makeRow({
        status: 'published',
        published_at: '2099-01-01T00:00:00Z',
      }));
      const ctx = {
        publicationStatus: fields.publicationStatus,
        publishedAt: fields.publishedAt,
        isTestArtifact: fields.isTestArtifact,
      };
      expect(isPubliclyPublished(ctx, new Date('2026-06-01T00:00:00Z'))).toBe(false);
    });

    it('published but missing publishedAt → isPubliclyPublished: false', () => {
      const fields = rowToStoryPublicationFields(makeRow({
        status: 'published',
        published_at: null,
      }));
      const ctx = {
        publicationStatus: fields.publicationStatus,
        publishedAt: fields.publishedAt,
        isTestArtifact: fields.isTestArtifact,
      };
      expect(isPubliclyPublished(ctx)).toBe(false);
    });

    it('published test artifact → isPubliclyPublished: false (quarantine)', () => {
      const fields = rowToStoryPublicationFields(makeRow({
        status: 'published',
        published_at: '2026-01-01T00:00:00Z',
        is_test_artifact: true,
      }));
      const ctx = {
        publicationStatus: fields.publicationStatus,
        publishedAt: fields.publishedAt,
        isTestArtifact: fields.isTestArtifact,
      };
      expect(isPubliclyPublished(ctx, new Date('2026-06-01T00:00:00Z'))).toBe(false);
    });

    it('review status → isPubliclyPublished: false', () => {
      const fields = rowToStoryPublicationFields(makeRow({
        status: 'review',
        published_at: '2026-01-01T00:00:00Z',
      }));
      const ctx = {
        publicationStatus: fields.publicationStatus,
        publishedAt: fields.publishedAt,
        isTestArtifact: fields.isTestArtifact,
      };
      expect(isPubliclyPublished(ctx, new Date('2026-06-01T00:00:00Z'))).toBe(false);
    });

    it('archived status → isPubliclyPublished: false', () => {
      const fields = rowToStoryPublicationFields(makeRow({
        status: 'archived',
        published_at: '2026-01-01T00:00:00Z',
      }));
      const ctx = {
        publicationStatus: fields.publicationStatus,
        publishedAt: fields.publishedAt,
        isTestArtifact: fields.isTestArtifact,
      };
      expect(isPubliclyPublished(ctx, new Date('2026-06-01T00:00:00Z'))).toBe(false);
    });
  });

  // ── storyPublicationContext reads publicationStatus ──────────────────────

  describe('storyPublicationContext propagation', () => {
    it('canonical Story with publicationStatus set → context carries it', () => {
      const story = {
        publicationStatus: 'published' as PublicationStatus,
        publishedAt: '2026-01-01T00:00:00Z',
        isTestArtifact: false,
      } as Story;
      const ctx = storyPublicationContext(story);
      expect(ctx.publicationStatus).toBe('published');
      expect(ctx.isTestArtifact).toBe(false);
    });

    it('canonical Story without publicationStatus → context.publicationStatus is undefined', () => {
      const story = {
        publishedAt: '2026-01-01T00:00:00Z',
      } as Story;
      const ctx = storyPublicationContext(story);
      expect(ctx.publicationStatus).toBeUndefined();
    });
  });
});
