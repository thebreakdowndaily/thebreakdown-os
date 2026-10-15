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
  'confidenceBreakdown',
  'confidence_breakdown',
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
  'hero_image_alt',
  'hero_image_is_decorative',
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
    ...(story as unknown as Record<string, unknown>),
  };

  for (const field of INTERNAL_STORY_FIELDS) {
    delete projected[field];
  }

  return projected as Omit<T, InternalStoryField>;
}

/**
 * Explicit reader-facing canonical response contract for v1.
 *
 * Unlike a denylist, this projection does not automatically expose new fields
 * added to Story in future releases. Keep content, evidence and context fields
 * here only when intended for public readers.
 */
const PUBLIC_CANONICAL_STORY_FIELDS = [
  'id',
  'title',
  'slug',
  'headline',
  'summary',
  'heroImage',
  'heroImageAlt',
  'heroImageIsDecorative',
  'author',
  'category',
  'status',
  'publicationStatus',
  'storyType',
  'evidenceScore',
  'readingTime',
  'publishedAt',
  'createdAt',
  'updatedAt',
  'tags',
  'blocks',
  'sources',
  'claims',
  'timeline',
  'faq',
  'charts',
  'primaryEntityId',
  'relatedStoryIds',
  'relatedEntityIds',
  'relatedTopicIds',
  'relatedFixSlugs',
  'metadata',
  'takeaway',
  'whoIsAffected',
  'impactLevel',
  'location',
  'stakeholderNames',
  'legislation',
  'costValue',
  'versionHistory',
  'freshness',
  'answerSummary',
  'whatIsUnknown',
  'reportingType',
] as const satisfies readonly (keyof Story)[];

type PublicCanonicalStoryField = (typeof PUBLIC_CANONICAL_STORY_FIELDS)[number];

export function toPublicStory(story: Story): Pick<Story, PublicCanonicalStoryField> {
  const publicStory: Record<string, unknown> = {};
  const source = story as unknown as Record<string, unknown>;

  for (const field of PUBLIC_CANONICAL_STORY_FIELDS) {
    if (Object.prototype.hasOwnProperty.call(source, field)) {
      publicStory[field] = source[field];
    }
  }

  return publicStory as Pick<Story, PublicCanonicalStoryField>;
}
