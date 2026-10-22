/**
 * Publication Policy — centralized, fail-closed visibility control.
 *
 * One place to determine whether a story is publicly visible.
 * Every public consumer (page, metadata, sitemap, RSS, search, related, API)
 * MUST consult these predicates rather than implementing ad-hoc checks.
 *
 * Principle: a story is public only when its lifecycle state explicitly and
 * validly permits publication. Missing or ambiguous metadata = NOT public.
 */

import type { APIStory, PublicationStatus } from '@/utils/data-layer/types';
import type { Story } from '@/types/canonical';

// ─── Date validation ───────────────────────────────────────────────────────────

function isValidDate(dateStr: string | undefined): boolean {
  if (!dateStr) return false;
  const t = Date.parse(dateStr);
  return Number.isFinite(t) && t > 0;
}

function isPast(dateStr: string | undefined, now: Date): boolean {
  if (!isValidDate(dateStr)) return false;
  return new Date(dateStr!).getTime() <= now.getTime();
}

function isFuture(dateStr: string | undefined, now: Date): boolean {
  if (!isValidDate(dateStr)) return false;
  return new Date(dateStr!).getTime() > now.getTime();
}

// ─── Canonical publication predicate ──────────────────────────────────────────

export interface PublicationContext {
  publicationStatus?: PublicationStatus;
  publishedAt?: string;
  scheduledAt?: string;
  isTestArtifact?: boolean;
}

/**
 * Core predicate: is this story eligible for public publication?
 *
 * Fail-closed rules:
 *   missing publicationStatus → false
 *   isTestArtifact === true → false (quarantined test artifact)
 *   draft / review / archived → false
 *   published + valid past publishedAt → true
 *   published + future publishedAt → false
 *   published + invalid publishedAt → false
 *   scheduled → false (requires explicit transition to published)
 */
export function isPubliclyPublished(
  ctx: PublicationContext,
  now: Date = new Date(),
): boolean {
  if (ctx.isTestArtifact === true) return false;

  const ps = ctx.publicationStatus;

  if (ps !== 'published') return false;

  if (!isValidDate(ctx.publishedAt)) return false;
  if (!isPast(ctx.publishedAt, now)) return false;

  return true;
}

// ─── Derived policies ─────────────────────────────────────────────────────────

export function canPubliclyViewStory(
  ctx: PublicationContext,
  now: Date = new Date(),
): boolean {
  return isPubliclyPublished(ctx, now);
}

export function shouldIndexStory(
  ctx: PublicationContext,
  now: Date = new Date(),
): boolean {
  return isPubliclyPublished(ctx, now);
}

export function shouldIncludeInFeed(
  ctx: PublicationContext,
  now: Date = new Date(),
): boolean {
  return isPubliclyPublished(ctx, now);
}

export function shouldIncludeInDiscovery(
  ctx: PublicationContext,
  now: Date = new Date(),
): boolean {
  return isPubliclyPublished(ctx, now);
}

// ─── Canonical Story helpers ──────────────────────────────────────────────────

export function storyPublicationContext(story: Story): PublicationContext {
  return {
    publicationStatus: (story as Story & { publicationStatus?: PublicationStatus }).publicationStatus,
    publishedAt: story.publishedAt,
    isTestArtifact: story.isTestArtifact,
  };
}

export function isCanonicalStoryPublic(
  story: Story,
  now: Date = new Date(),
): boolean {
  return isPubliclyPublished(storyPublicationContext(story), now);
}

// ─── Entity Publication Predicates ──────────────────────────────────────────

export interface EntityPublicationContext {
  id?: string;
  slug?: string;
  name?: string;
  type?: string;
  publicationStatus?: PublicationStatus | string | null;
  isTestArtifact?: boolean;
  status?: string | null;
  isDraft?: boolean;
  isQuarantined?: boolean;
}

/**
 * Core entity publication predicate: determines whether an entity is eligible
 * for public visibility across the platform.
 *
 * Publication Policy Specification:
 * 1. Missing Entity / Falsy:
 *    - null or undefined entity → false (fail-closed).
 *
 * 2. Explicit Quarantine / Test Artifact Safeguards:
 *    - isTestArtifact === true → false (quarantined test fixture).
 *    - isDraft === true → false (quarantined draft entity).
 *    - isQuarantined === true → false (quarantined entity).
 *
 * 3. Publication Status Check (entity.publicationStatus):
 *    - publicationStatus === null → false (null values fail-closed).
 *    - publicationStatus !== undefined:
 *      * 'published' → permitted (subject to status/quarantine checks).
 *      * Any other value ('draft', 'review', 'in_review', 'archived', 'quarantined',
 *        'pending', 'unknown', or any arbitrary unsupported string) → false (unsupported status fails closed).
 *
 * 4. General Status Check (entity.status):
 *    - status === null → false (null values fail-closed).
 *    - status !== undefined:
 *      * 'published' or 'active' → permitted.
 *      * Any other value ('draft', 'quarantined', 'review', 'archived', 'pending',
 *        'unknown', or any arbitrary unsupported string) → false (unsupported status fails closed).
 *
 * 5. Legacy Public Catalog Entries (both publicationStatus and status are undefined):
 *    - Legacy catalog entities in data-layer/store and database rows from public.entities
 *      do not have a publicationStatus column in their schema.
 *    - A legitimate catalog entry MUST possess valid identity and structure:
 *      * non-empty string for (id or slug)
 *      * non-empty string for name
 *      * non-empty string for type
 *    - If any required field is missing or empty, or if an empty object {} is provided, fails closed (false).
 *    - If valid, it is recognized as an approved public catalog entity → true.
 */
/**
 * Canonical allowlist of legacy catalog entities with verified publication provenance.
 *
 * Background:
 * The initial system catalog contained 42 approved core entities (and 3 canonical
 * aliases) in the baseline data store without explicit publication status metadata.
 *
 * Policy:
 * Legacy entities in this allowlist that have valid identity and structure are permitted
 * to be publicly viewed IF they have not been explicitly marked draft, quarantined, or test artifacts.
 *
 * Crucially, ANY entity NOT in this allowlist lacking explicit publication metadata
 * MUST fail closed (false). Merely having id, name, and type is NOT sufficient
 * for public visibility. New entities MUST explicitly possess publicationStatus: 'published'
 * or status: 'published' | 'active'.
 */
export const LEGACY_PUBLIC_ENTITY_IDENTIFIERS: ReadonlySet<string> = new Set([
  'adb',
  'aiib',
  'bihar',
  'bimstec',
  'brics',
  'cag',
  'cdri',
  'cert-in',
  'commonwealth',
  'comptroller-and-auditor-general',
  'cpcb',
  'eci',
  'election-commission',
  'fatf',
  'g20',
  'g77',
  'icmr',
  'ilo',
  'imf',
  'india',
  'iora',
  'isa',
  'mgnrega',
  'ministry-of-agriculture',
  'ministry-of-education',
  'ministry-of-finance',
  'ministry-of-jal-shakti',
  'ministry-of-labour',
  'ministry-of-rural-development',
  'ministry-of-women-and-child-development',
  'nam',
  'nmcg',
  'npci',
  'quad',
  'rbi',
  'resecurity',
  'saarc',
  'sc',
  'sco',
  'supreme-court-of-india',
  'uidai',
  'un',
  'who',
  'world-bank',
  'wto',
]);

export function isEntityPubliclyPublishable(
  entity: EntityPublicationContext | Record<string, unknown> | undefined | null
): boolean {
  if (!entity || typeof entity !== 'object') return false;

  const e = entity as EntityPublicationContext;

  // 1. Explicit Quarantine and Test Artifact Gates
  if (e.isTestArtifact === true) return false;
  if (e.isDraft === true) return false;
  if (e.isQuarantined === true) return false;

  // 2. Publication Status Validation (fail-closed on null, empty, or unsupported statuses)
  if (e.publicationStatus !== undefined) {
    if (e.publicationStatus === null) return false;
    const normalized = String(e.publicationStatus).toLowerCase().trim();
    if (!normalized || normalized !== 'published') {
      return false;
    }
  }

  // 3. Status Validation (fail-closed on null, empty, or unsupported statuses)
  if (e.status !== undefined) {
    if (e.status === null) return false;
    const normalizedStatus = String(e.status).toLowerCase().trim();
    if (!normalizedStatus || (normalizedStatus !== 'published' && normalizedStatus !== 'active')) {
      return false;
    }
  }

  // 4. If explicitly marked published / active
  if (e.publicationStatus === 'published') return true;
  if (e.status === 'published' || e.status === 'active') return true;

  // 5. Bounded Legacy Catalog Compatibility Rule
  // Both publicationStatus and status are undefined: require proven legacy catalog provenance
  const id = e.id ? String(e.id).trim().toLowerCase() : '';
  const slug = e.slug ? String(e.slug).trim().toLowerCase() : '';
  const isTrustedLegacy =
    (Boolean(id) && LEGACY_PUBLIC_ENTITY_IDENTIFIERS.has(id)) ||
    (Boolean(slug) && LEGACY_PUBLIC_ENTITY_IDENTIFIERS.has(slug));

  if (!isTrustedLegacy) {
    // New or unverified entity lacking publication metadata MUST fail closed.
    return false;
  }

  // For trusted legacy records, verify basic structural integrity
  const hasIdentifier = Boolean(id || slug);
  const hasName = Boolean(e.name && String(e.name).trim());
  const hasType = Boolean(e.type && String(e.type).trim());

  if (hasIdentifier && hasName && hasType) {
    return true;
  }

  // Incomplete legacy record fails closed
  return false;
}

export function canPubliclyViewEntity(
  entity: EntityPublicationContext | Record<string, unknown> | undefined | null
): boolean {
  return isEntityPubliclyPublishable(entity);
}


// ─── Topic Publication Predicates ───────────────────────────────────────────

export interface TopicPublicationContext {
  id?: string;
  slug?: string;
  name?: string;
  description?: string;
  publicationStatus?: PublicationStatus | string | null;
  status?: string | null;
  isTestArtifact?: boolean;
  isDraft?: boolean;
  isQuarantined?: boolean;
}

/**
 * Canonical allowlist of legacy catalog topics with verified publication provenance.
 *
 * Background:
 * The baseline Breakdown OS knowledge store initialized with 15 core curated topics
 * without explicit publication status metadata columns.
 */
export const LEGACY_PUBLIC_TOPIC_IDENTIFIERS: ReadonlySet<string> = new Set([
  'economy',
  'technology',
  'cybersecurity',
  'policy',
  'agriculture',
  'digital-payments',
  'employment',
  'environment',
  'education',
  'semiconductor',
  'health',
  'mental-health',
  'governance',
  'infrastructure',
  'geopolitics',
]);

export function isTopicPubliclyPublishable(
  topic: TopicPublicationContext | Record<string, unknown> | undefined | null
): boolean {
  if (!topic || typeof topic !== 'object') return false;

  const t = topic as TopicPublicationContext;

  // 1. Explicit Quarantine and Test Artifact Gates
  if (t.isTestArtifact === true) return false;
  if (t.isDraft === true) return false;
  if (t.isQuarantined === true) return false;

  // 2. Publication Status Validation (fail-closed on null, empty, or unsupported statuses)
  if (t.publicationStatus !== undefined) {
    if (t.publicationStatus === null) return false;
    const normalized = String(t.publicationStatus).toLowerCase().trim();
    if (!normalized || normalized !== 'published') {
      return false;
    }
  }

  // 3. Status Validation (fail-closed on null, empty, or unsupported statuses)
  if (t.status !== undefined) {
    if (t.status === null) return false;
    const normalizedStatus = String(t.status).toLowerCase().trim();
    if (!normalizedStatus || (normalizedStatus !== 'published' && normalizedStatus !== 'active')) {
      return false;
    }
  }

  // 4. If explicitly marked published / active
  if (t.publicationStatus === 'published') return true;
  if (t.status === 'published' || t.status === 'active') return true;

  // 5. Bounded Legacy Catalog Compatibility Rule
  const id = t.id ? String(t.id).trim().toLowerCase() : '';
  const slug = t.slug ? String(t.slug).trim().toLowerCase() : '';
  const isTrustedLegacy =
    (Boolean(id) && LEGACY_PUBLIC_TOPIC_IDENTIFIERS.has(id)) ||
    (Boolean(slug) && LEGACY_PUBLIC_TOPIC_IDENTIFIERS.has(slug));

  if (!isTrustedLegacy) {
    // New or unverified topic lacking publication metadata MUST fail closed.
    return false;
  }

  // For trusted legacy records, verify basic structural integrity
  const hasIdentifier = Boolean(id || slug);
  const hasName = Boolean(t.name && String(t.name).trim());

  if (hasIdentifier && hasName) {
    return true;
  }

  return false;
}

export function canPubliclyViewTopic(
  topic: TopicPublicationContext | Record<string, unknown> | undefined | null
): boolean {
  return isTopicPubliclyPublishable(topic);
}

// ─── Timeline Publication Predicates ────────────────────────────────────────

export interface TimelinePublicationContext {
  id?: string;
  slug?: string;
  title?: string;
  description?: string;
  publicationStatus?: PublicationStatus | string | null;
  status?: string | null;
  isTestArtifact?: boolean;
  isDraft?: boolean;
  isQuarantined?: boolean;
}

/**
 * Canonical allowlist of legacy catalog timelines with verified publication provenance.
 *
 * Background:
 * The baseline Breakdown OS knowledge store initialized with 13 core curated timelines
 * without explicit publication status metadata columns.
 */
export const LEGACY_PUBLIC_TIMELINE_IDENTIFIERS: ReadonlySet<string> = new Set([
  'mgnrega-timeline',
  'upi-timeline',
  'pmfby-timeline',
  'semiconductor-pli-timeline',
  'dpdp-bill-timeline',
  'rbi-repo-rate-timeline',
  'climate-finance-timeline',
  'education-budget-timeline',
  'groundwater-depletion-timeline',
  'ration-digitization-timeline',
  'anganwadi-icds-timeline',
  'supply-chain-shift-timeline',
  'aadhaar-breach-timeline',
]);

export function isTimelinePubliclyPublishable(
  timeline: TimelinePublicationContext | Record<string, unknown> | undefined | null
): boolean {
  if (!timeline || typeof timeline !== 'object') return false;

  const tl = timeline as TimelinePublicationContext;

  // 1. Explicit Quarantine and Test Artifact Gates
  if (tl.isTestArtifact === true) return false;
  if (tl.isDraft === true) return false;
  if (tl.isQuarantined === true) return false;

  // 2. Publication Status Validation (fail-closed on null, empty, or unsupported statuses)
  if (tl.publicationStatus !== undefined) {
    if (tl.publicationStatus === null) return false;
    const normalized = String(tl.publicationStatus).toLowerCase().trim();
    if (!normalized || normalized !== 'published') {
      return false;
    }
  }

  // 3. Status Validation (fail-closed on null, empty, or unsupported statuses)
  if (tl.status !== undefined) {
    if (tl.status === null) return false;
    const normalizedStatus = String(tl.status).toLowerCase().trim();
    if (!normalizedStatus || (normalizedStatus !== 'published' && normalizedStatus !== 'active')) {
      return false;
    }
  }

  // 4. If explicitly marked published / active
  if (tl.publicationStatus === 'published') return true;
  if (tl.status === 'published' || tl.status === 'active') return true;

  // 5. Bounded Legacy Catalog Compatibility Rule
  const id = tl.id ? String(tl.id).trim().toLowerCase() : '';
  const slug = tl.slug ? String(tl.slug).trim().toLowerCase() : '';
  const isTrustedLegacy =
    (Boolean(id) && LEGACY_PUBLIC_TIMELINE_IDENTIFIERS.has(id)) ||
    (Boolean(slug) && LEGACY_PUBLIC_TIMELINE_IDENTIFIERS.has(slug));

  if (!isTrustedLegacy) {
    // New or unverified timeline lacking publication metadata MUST fail closed.
    return false;
  }

  // For trusted legacy records, verify basic structural integrity
  const hasIdentifier = Boolean(id || slug);
  const hasTitle = Boolean(tl.title && String(tl.title).trim());

  if (hasIdentifier && hasTitle) {
    return true;
  }

  return false;
}

export function canPubliclyViewTimeline(
  timeline: TimelinePublicationContext | Record<string, unknown> | undefined | null
): boolean {
  return isTimelinePubliclyPublishable(timeline);
}

// ─── Diagnostics ──────────────────────────────────────────────────────────────

export interface PublicationDiagnostic {
  slug: string;
  publicationStatus: PublicationStatus | undefined;
  publishedAt: string | undefined;
  scheduledAt: string | undefined;
  isPublic: boolean;
  reason: string;
}

export function diagnosePublication(
  slug: string,
  ctx: PublicationContext,
  now: Date = new Date(),
): PublicationDiagnostic {
  const ps = ctx.publicationStatus;

  if (ps === undefined || ps === null) {
    return { slug, publicationStatus: ps, publishedAt: ctx.publishedAt, scheduledAt: ctx.scheduledAt, isPublic: false, reason: 'missing publicationStatus' };
  }
  if (ps === 'draft') {
    return { slug, publicationStatus: ps, publishedAt: ctx.publishedAt, scheduledAt: ctx.scheduledAt, isPublic: false, reason: 'draft status' };
  }
  if (ps === 'review') {
    return { slug, publicationStatus: ps, publishedAt: ctx.publishedAt, scheduledAt: ctx.scheduledAt, isPublic: false, reason: 'review status' };
  }
  if (ps === 'archived') {
    return { slug, publicationStatus: ps, publishedAt: ctx.publishedAt, scheduledAt: ctx.scheduledAt, isPublic: false, reason: 'archived status' };
  }
  if (ps === 'scheduled') {
    return { slug, publicationStatus: ps, publishedAt: ctx.publishedAt, scheduledAt: ctx.scheduledAt, isPublic: false, reason: 'scheduled status — requires explicit published transition' };
  }
  if (ps === 'published') {
    if (!isValidDate(ctx.publishedAt)) {
      return { slug, publicationStatus: ps, publishedAt: ctx.publishedAt, scheduledAt: ctx.scheduledAt, isPublic: false, reason: 'published but invalid/missing publishedAt' };
    }
    if (isFuture(ctx.publishedAt, now)) {
      return { slug, publicationStatus: ps, publishedAt: ctx.publishedAt, scheduledAt: ctx.scheduledAt, isPublic: false, reason: 'published but publishedAt is in the future' };
    }
    return { slug, publicationStatus: ps, publishedAt: ctx.publishedAt, scheduledAt: ctx.scheduledAt, isPublic: true, reason: 'published with valid past publishedAt' };
  }

  return { slug, publicationStatus: ps, publishedAt: ctx.publishedAt, scheduledAt: ctx.scheduledAt, isPublic: false, reason: 'unknown publicationStatus' };
}
