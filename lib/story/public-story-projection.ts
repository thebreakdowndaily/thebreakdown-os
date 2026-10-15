/**
 * Public story API response contracts.
 *
 * Publication eligibility determines which records may be returned. This
 * module separately defines which fields may cross public API boundaries.
 * The database query and response projection share the same explicit field
 * allowlist so adding an internal column cannot expose it by default.
 */
import type { Story } from '@/types/canonical';

/**
 * Explicit, reader-facing database columns. Preserve original database field
 * names in v2 responses. Keep in sync with the checked-in Supabase schema.
 */
export const PUBLIC_DATABASE_STORY_FIELDS = [
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
] as const;

export const PUBLIC_STORY_SELECT = PUBLIC_DATABASE_STORY_FIELDS.join(',');

/**
 * Project raw v2 database results through the same allowlist as the query.
 * This also makes tests and alternate adapters fail closed if they hand the
 * route an object containing more columns than were requested.
 */
export function toPublicDatabaseStory(story: object): Record<string, unknown> {
  const source = story as unknown as Record<string, unknown>;
  const projected: Record<string, unknown> = {};

  for (const field of PUBLIC_DATABASE_STORY_FIELDS) {
    if (Object.prototype.hasOwnProperty.call(source, field)) {
      projected[field] = source[field];
    }
  }

  return projected;
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
  const source = story as unknown as Record<string, unknown>;
  const projected: Record<string, unknown> = {};

  for (const field of PUBLIC_CANONICAL_STORY_FIELDS) {
    if (Object.prototype.hasOwnProperty.call(source, field)) {
      projected[field] = source[field];
    }
  }

  return projected as Pick<Story, PublicCanonicalStoryField>;
}
