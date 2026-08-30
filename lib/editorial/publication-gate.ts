/**
 * Publication Gate — fail-closed validation for editorial calendar publishing.
 *
 * Governing document: AGENTS.md (Editorial Calendar + Autonomous Weekly Publishing)
 *
 * Principle: A story is NEVER published by scheduled timestamp alone.
 * Every gate check is auditable. Every failure is logged.
 *
 * Gate checks (all must pass):
 *   1. Story exists and is not deleted
 *   2. Story status is 'scheduled' or 'review' or 'fact_check' (eligible for gate)
 *   3. Story has a non-empty title
 *   4. Story has a non-empty summary
 *   5. Story has at least one block (content)
 *   6. Story has at least one source (evidence)
 *   7. Story has at least one claim
 *   8. Story has a publishedAt timestamp
 *   9. Story's publicationStatus is not 'archived' or 'superseded'
 *  10. Story is not blocked (no block_reason set)
 */

import type { Story, StoryStatus } from '@/types/canonical';
import type { GateCheck, PublicationGateResult, PublicationGateInput } from '@/types/editorial-calendar';

const ELIGIBLE_STATUSES: StoryStatus[] = ['scheduled', 'review', 'fact_check'];

export function validateStoryForPublication(
  input: PublicationGateInput,
  story: Story | undefined,
  now: Date = new Date(),
): PublicationGateResult {
  const checks: GateCheck[] = [];
  const storyId = input.storyId;

  // Gate 1: Story exists
  if (!story) {
    checks.push({
      name: 'story_exists',
      passed: false,
      reason: 'Story not found in database',
    });
    return buildResult(input, checks, false, now);
  }

  // Gate 2: Story status is eligible
  const statusCheck = checkStatus(story);
  checks.push(statusCheck);

  // Gate 3: Has title
  checks.push(checkField(story.title, 'has_title', 'Story has no title'));

  // Gate 4: Has summary
  checks.push(checkField(story.summary, 'has_summary', 'Story has no summary'));

  // Gate 5: Has content (blocks)
  const hasBlocks = story.blocks && story.blocks.length > 0;
  checks.push({
    name: 'has_content',
    passed: hasBlocks,
    reason: hasBlocks ? 'Story has content blocks' : 'Story has no content blocks',
  });

  // Gate 6: Has sources
  const hasSources = story.sources && story.sources.length > 0;
  checks.push({
    name: 'has_sources',
    passed: hasSources,
    reason: hasSources ? `Story has ${story.sources.length} source(s)` : 'Story has no sources — evidence required',
  });

  // Gate 7: Has claims
  const hasClaims = story.claims && story.claims.length > 0;
  checks.push({
    name: 'has_claims',
    passed: hasClaims,
    reason: hasClaims ? `Story has ${story.claims.length} claim(s)` : 'Story has no claims — editorial claims required',
  });

  // Gate 8: Has publishedAt
  const hasPublishedAt = typeof story.publishedAt === 'string' && story.publishedAt.length > 0;
  checks.push({
    name: 'has_published_at',
    passed: hasPublishedAt,
    reason: hasPublishedAt ? 'Story has publishedAt timestamp' : 'Story has no publishedAt timestamp',
  });

  // Gate 9: Not archived or superseded
  const pubStatus = (story as Story & { publicationStatus?: string }).publicationStatus;
  const notArchived = pubStatus !== 'archived' && pubStatus !== 'superseded';
  checks.push({
    name: 'not_archived',
    passed: notArchived,
    reason: notArchived ? `publicationStatus is '${pubStatus || 'undefined'}'` : `publicationStatus is '${pubStatus}' — cannot publish archived/superseded content`,
  });

  // Gate 10: Not blocked
  const storyWithBlock = story as Story & { blockReason?: string };
  const notBlocked = !storyWithBlock.blockReason;
  checks.push({
    name: 'not_blocked',
    passed: notBlocked,
    reason: notBlocked ? 'Story is not blocked' : `Story is blocked: ${storyWithBlock.blockReason}`,
  });

  const allPassed = checks.every(c => c.passed);

  return buildResult(input, checks, allPassed, now);
}

function checkStatus(story: Story): GateCheck {
  const status = story.status;
  const passed = ELIGIBLE_STATUSES.includes(status);
  return {
    name: 'status_eligible',
    passed,
    reason: passed
      ? `Story status '${status}' is eligible for publication gate`
      : `Story status '${status}' is not eligible — expected ${ELIGIBLE_STATUSES.join(' or ')}`,
  };
}

function checkField(value: unknown, name: string, failReason: string): GateCheck {
  const passed = typeof value === 'string' && value.trim().length > 0;
  return {
    name,
    passed,
    reason: passed ? `${name}: present` : failReason,
  };
}

function buildResult(
  input: PublicationGateInput,
  checks: GateCheck[],
  passed: boolean,
  now: Date,
): PublicationGateResult {
  return {
    storyId: input.storyId,
    scheduleId: input.scheduleId,
    passed,
    checks,
    checkedAt: now.toISOString(),
    triggeredBy: input.triggeredBy,
  };
}
