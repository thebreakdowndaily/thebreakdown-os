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

const PUBLIC_SOURCE_FIELDS = [
  'id', 'title', 'url', 'accessedAt', 'accessed_at', 'tier', 'publisher',
  'sourceType', 'source_type', 'publishedAt', 'published_at',
] as const;

const PUBLIC_CLAIM_FIELDS = [
  'id', 'claim', 'data', 'source', 'sourceUrl', 'source_url', 'tier',
  'evidenceTier', 'evidence_tier', 'confidence', 'status',
  'verificationLevel', 'verification_level', 'verifiedAt', 'verified_at',
  'sourceCount', 'source_count',
] as const;

const PUBLIC_TIMELINE_FIELDS = [
  'id', 'date', 'title', 'description', 'sourceUrl', 'source_url',
] as const;

const PUBLIC_FAQ_FIELDS = ['question', 'answer'] as const;

const PUBLIC_CHART_FIELDS = [
  'type', 'chartType', 'chart_type', 'title', 'description', 'data',
  'xKey', 'x_key', 'yKey', 'y_key', 'color', 'caption',
] as const;

// Dynamic block/chart payloads remain extensible, but known internal lifecycle,
// identity, debug and provenance fields must never survive recursive projection.
const PRIVATE_NESTED_KEYS = new Set([
  'notes', 'updatedby', 'updated_by', 'istestartifact', 'is_test_artifact',
  'versionhistory', 'version_history', 'scheduledat', 'scheduled_at',
  'scheduledby', 'scheduled_by', 'blockreason', 'block_reason', 'blockedat',
  'blocked_at', 'fallbackstoryid', 'fallback_story_id', 'confidencebreakdown',
  'confidence_breakdown', 'archiveid', 'archive_id', 'celladdress',
  'cell_address', 'evidenceid', 'evidence_id', 'verifiedby', 'verified_by',
  'staffid', 'staff_id', 'staffids', 'staff_ids', 'ownerid', 'owner_id',
  'internal', 'internalnotes', 'internal_notes', 'private', 'privateNotes',
  'private_notes', 'debug', 'rawpayload', 'raw_payload', 'rawdata', 'raw_data',
  'apikey', 'api_key', 'token', 'secret', 'moderationnotes', 'moderation_notes',
  'reviewnotes', 'review_notes', 'editorialnotes', 'editorial_notes',
]);

function projectObjectFields(value: unknown, fields: readonly string[]): unknown {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return undefined;
  const source = value as Record<string, unknown>;
  const projected: Record<string, unknown> = {};
  for (const field of fields) {
    if (Object.prototype.hasOwnProperty.call(source, field)) {
      projected[field] = projectDynamicPublicValue(source[field]);
    }
  }
  return projected;
}

function projectDynamicPublicValue(value: unknown, depth = 0): unknown {
  if (value === null || typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return value;
  }
  if (depth >= 12) return undefined;
  if (Array.isArray(value)) {
    return value.slice(0, 500)
      .map((item) => projectDynamicPublicValue(item, depth + 1))
      .filter((item) => item !== undefined);
  }
  if (typeof value === 'object') {
    const projected: Record<string, unknown> = {};
    for (const [key, nested] of Object.entries(value as Record<string, unknown>)) {
      const normalized = key.replace(/[-_]/g, '').toLowerCase();
      if (PRIVATE_NESTED_KEYS.has(key) || PRIVATE_NESTED_KEYS.has(normalized)) continue;
      const safeValue = projectDynamicPublicValue(nested, depth + 1);
      if (safeValue !== undefined) projected[key] = safeValue;
    }
    return projected;
  }
  return undefined;
}

function projectPublicBlocks(value: unknown): unknown {
  if (!Array.isArray(value)) return [];
  return value.slice(0, 500).map((block) => {
    if (!block || typeof block !== 'object' || Array.isArray(block)) return undefined;
    const source = block as Record<string, unknown>;
    const projected: Record<string, unknown> = {};
    for (const field of ['id', 'type', 'region', 'collapsed'] as const) {
      if (Object.prototype.hasOwnProperty.call(source, field)) projected[field] = source[field];
    }
    if (Object.prototype.hasOwnProperty.call(source, 'data')) {
      projected.data = projectDynamicPublicValue(source.data);
    }
    return projected;
  }).filter((block) => block !== undefined);
}

function projectNestedStoryFields(story: Record<string, unknown>): Record<string, unknown> {
  const projected = { ...story };
  if ('blocks' in projected) projected.blocks = projectPublicBlocks(projected.blocks);
  if ('sources' in projected) {
    projected.sources = Array.isArray(projected.sources)
      ? projected.sources.map((item) => projectObjectFields(item, PUBLIC_SOURCE_FIELDS)).filter(Boolean)
      : [];
  }
  if ('claims' in projected) {
    projected.claims = Array.isArray(projected.claims)
      ? projected.claims.map((item) => projectObjectFields(item, PUBLIC_CLAIM_FIELDS)).filter(Boolean)
      : [];
  }
  if ('timeline' in projected) {
    projected.timeline = Array.isArray(projected.timeline)
      ? projected.timeline.map((item) => projectObjectFields(item, PUBLIC_TIMELINE_FIELDS)).filter(Boolean)
      : [];
  }
  if ('faq' in projected) {
    projected.faq = Array.isArray(projected.faq)
      ? projected.faq.map((item) => projectObjectFields(item, PUBLIC_FAQ_FIELDS)).filter(Boolean)
      : [];
  }
  if ('charts' in projected) {
    projected.charts = Array.isArray(projected.charts)
      ? projected.charts.map((item) => projectObjectFields(item, PUBLIC_CHART_FIELDS)).filter(Boolean)
      : [];
  }
  return projected;
}

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

  return projectNestedStoryFields(projected);
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

  return projectNestedStoryFields(projected) as Pick<Story, PublicCanonicalStoryField>;
}
