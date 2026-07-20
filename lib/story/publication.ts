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
}

/**
 * Core predicate: is this story eligible for public publication?
 *
 * Fail-closed rules:
 *   missing publicationStatus → false
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
  };
}

export function isCanonicalStoryPublic(
  story: Story,
  now: Date = new Date(),
): boolean {
  return isPubliclyPublished(storyPublicationContext(story), now);
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
