/**
 * Public story API boundary.
 *
 * Publication eligibility determines which rows may be returned; this
 * projection separately determines which fields may be returned. A published
 * record can still contain internal editorial/workflow metadata.
 */
import type { Story } from '@/types/canonical';

/**
 * Internal fields that must not cross unauthenticated public read surfaces.
 * Include both canonical camelCase fields and raw database snake_case fields
 * because v1 repository reads and v2 database queries have different shapes.
 */
const INTERNAL_STORY_FIELDS = [
  'notes',
  'updatedBy',
  'isTestArtifact',
  'version',
  'scheduledAt',
  'scheduledBy',
  'blockReason',
  'blockedAt',
  'fallbackStoryId',
  'legacy_id',
  'is_test_artifact',
  'updated_by',
  'scheduled_at',
  'scheduled_by',
  'block_reason',
  'blocked_at',
  'fallback_story_id',
] as const;

type InternalStoryField = (typeof INTERNAL_STORY_FIELDS)[number];

/**
 * Known public database columns. Do not replace this list with select('*'):
 * future editorial/workflow columns must not become public by default.
 *
 * Keep this list aligned with the public story response contract and the
 * checked-in Supabase schema. Do not include internal notes, schedule fields,
 * block diagnostics, quarantine flags, legacy identifiers, or staff IDs.
 */
export const PUBLIC_STORY_SELECT = [
  'id',
  'slug',
  'title',
  'headline',
  'summary',
  'hero_image',
  'author',
  'category',
  'status',
  'evidence_score',
  'reading_time',
  'tags',
  'blocks',
  'sources',
  'claims',
  'timeline',
  'faq',
  'charts',
  'related_story_ids',
  'related_entity_ids',
  'related_topic_ids',
  'published_at',
  'created_at',
  'updated_at',
].join(',');

/** Defense-in-depth projection for already-loaded story objects/rows. */
export function stripInternalStoryFields<T extends object>(
  story: T,
): Omit<T, InternalStoryField> {
  const projected: Record<string, unknown> = {
    ...(story as Record<string, unknown>),
  };

  for (const field of INTERNAL_STORY_FIELDS) {
    delete projected[field];
  }

  return projected as Omit<T, InternalStoryField>;
}

/** Typed convenience wrapper for canonical Story objects. */
export function toPublicStory(story: Story): Omit<Story, InternalStoryField> {
  return stripInternalStoryFields(story);
}
