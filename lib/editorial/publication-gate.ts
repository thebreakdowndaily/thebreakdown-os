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
import {
  evaluateGoldStandardPass,
  validateGoldStandardAuditRecord,
  type GoldStandardAuditRecord,
} from './gold-standard-review';
import { getSource } from '@/lib/knowledge/source-registry';
import { validateStoryEvidenceCompleteness } from '@/lib/story/evidence-guard';
import type { EvidenceVaultService } from '@/services/intelligence/evidence-vault.service';
import { getManifestEntry } from '@/lib/image-intelligence/manifest';
import { matchImageToStoryContext } from '@/lib/image-intelligence/context-matcher';
import { countNarrativeWords, estimateReadingTimeMinutes, getEditorialNarrativeTarget } from '@/lib/story/narrative-metrics';
import { validateStoryHeroMedia, validateStorySupportingMedia } from '@/lib/image-intelligence/publication-validation';

export const EDITORIAL_RELEASE_HOLD_SLUGS = [
  'ai-literacy-india-students-verify-ai',
  'india-semiconductor-mission-fab-reality',
];

export interface PublicationGateOptions {
  bypassEditorialHold?: boolean;
  vaultInitError?: string;
  requireDigestLock?: boolean;
}

const ELIGIBLE_STATUSES: StoryStatus[] = ['scheduled', 'review', 'fact_check'];

/**
 * Full Async Publication Gate — evaluates Gates 1-12 plus Gate 13 (Evidence Vault Reconstructibility).
 */
export async function validateStoryForPublicationAsync(
  input: PublicationGateInput,
  story: Story | undefined,
  vault?: EvidenceVaultService,
  now: Date = new Date(),
  options?: PublicationGateOptions
): Promise<PublicationGateResult> {
  const syncResult = validateStoryForPublication(input, story, now, options);
  const checks = [...syncResult.checks];

  if (!syncResult.passed || !story) {
    return { ...syncResult, checks };
  }

  // Gate 13: Evidence Vault Completeness & Cryptographic Reconstructibility (Article III & IV)
  const evidenceRes = await validateStoryEvidenceCompleteness(story, vault, options);
  checks.push({
    name: 'evidence_preservation_vault',
    passed: evidenceRes.valid,
    reason: evidenceRes.valid
      ? `All ${story.claims?.length || 0} claims backed by verified, intact vault evidence`
      : `Evidence Guard blocked publication: ${evidenceRes.violations.join('; ')}`,
    details: evidenceRes.violations.length > 0 ? evidenceRes.violations.join('\n') : undefined,
  });

  const allPassed = checks.every(c => c.passed);
  return buildResult(input, checks, allPassed, now);
}

export function validateStoryForPublication(
  inputOrStory: PublicationGateInput | Story,
  storyOrOptions?: Story | PublicationGateOptions,
  nowOrOptions?: Date | PublicationGateOptions,
  maybeOptions?: PublicationGateOptions,
): PublicationGateResult {
  const isFirstArgStory = Boolean(
    inputOrStory &&
    typeof inputOrStory === 'object' &&
    ('slug' in inputOrStory || 'category' in inputOrStory || 'blocks' in inputOrStory)
  );

  let input: PublicationGateInput;
  let story: Story | undefined;
  let now: Date;
  let options: PublicationGateOptions | undefined;

  if (isFirstArgStory) {
    story = inputOrStory as Story;
    input = {
      storyId: story.id || 'unknown-id',
      triggeredBy: 'manual',
    };
    if (storyOrOptions && typeof storyOrOptions === 'object' && !('blocks' in storyOrOptions) && !('slug' in storyOrOptions)) {
      options = storyOrOptions as PublicationGateOptions;
    } else if (maybeOptions) {
      options = maybeOptions;
    }
    now = (nowOrOptions instanceof Date) ? nowOrOptions : new Date();
  } else {
    input = inputOrStory as PublicationGateInput;
    story = storyOrOptions as Story | undefined;
    now = (nowOrOptions instanceof Date) ? nowOrOptions : new Date();
    options = maybeOptions || (typeof nowOrOptions === 'object' && !(nowOrOptions instanceof Date) ? (nowOrOptions as PublicationGateOptions) : undefined);
  }

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

  // Gate 7b: Claims Verification (Article III & P0 criteria)
  const isEnforcedFeatureStory = Boolean(
    (story as any).isFeatureStory ||
    ['feature', 'explainer', 'analysis', 'investigation_chapter'].includes(String(story.storyType || '')) ||
    EDITORIAL_RELEASE_HOLD_SLUGS.includes(story.slug || '')
  );

  const unverifiedClaims = (story.claims || []).filter((c: any) => {
    const status = (c.status || c.verificationStatus || '').toLowerCase();
    if (['unverified', 'unsupported', 'not_supported', 'rejected', 'disputed'].includes(status)) {
      return true;
    }
    if (isEnforcedFeatureStory && !c.source && !c.sourceId && !c.sourceUrl) {
      return true;
    }
    return false;
  });

  const claimsVerified = unverifiedClaims.length === 0;
  checks.push({
    name: 'claims_verified',
    passed: claimsVerified,
    reason: claimsVerified
      ? `All ${story.claims?.length || 0} claims verified with supporting evidence`
      : `Story contains ${unverifiedClaims.length} unverified or unsupported claim(s): ${unverifiedClaims.map((c: any) => `"${c.claim || c.text || c.id}"`).join('; ')} — all material claims must be verified before publication`,
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

  // Gate 11: Gold Standard Review Integrity (Article XI)
  const auditRecord = (story as Story & { goldStandardAudit?: GoldStandardAuditRecord }).goldStandardAudit;
  if (!auditRecord) {
    checks.push({
      name: 'gold_standard_review',
      passed: false,
      reason: 'Missing Gold Standard Review record (all 7 phases required per Article XI)',
    });
  } else {
    const validation = validateGoldStandardAuditRecord(auditRecord, story);
    checks.push({
      name: 'gold_standard_review',
      passed: validation.valid,
      reason: validation.valid
        ? 'Gold Standard Review passed all 7 phases with zero blocking issues and valid content fingerprint'
        : `Gold Standard Review failed (incomplete phases or unresolved blocking issues): ${validation.violations.join('; ')}`,
    });
  }

  // Gate 12: Retracted sources check (Article III & XIII)
  const hasRetractedSources = story.sources?.some((s: any) => {
    if (s.status === 'retracted' || s.verificationStatus === 'retracted') return true;
    if (s.id) {
      const canonical = getSource(s.id);
      if (canonical && canonical.verificationStatus === 'retracted') return true;
    }
    return false;
  });

  checks.push({
    name: 'sources_not_retracted',
    passed: !hasRetractedSources,
    reason: !hasRetractedSources
      ? 'No retracted sources detected in story evidence'
      : 'Story cites one or more retracted sources — publication blocked',
  });

  // Gate 14: Editorial Release Hold (Section 2 Rule 5)
  const isUnderEditorialHold = EDITORIAL_RELEASE_HOLD_SLUGS.includes(story.slug || '') && !options?.bypassEditorialHold;
  checks.push({
    name: 'editorial_release_hold',
    passed: !isUnderEditorialHold,
    reason: !isUnderEditorialHold
      ? 'Story is not under active editorial release hold'
      : `Story "${story.slug}" blocked: Editorial Release Hold is ACTIVE pending story quality and image remediation.`,
  });

  // Gate 15: Hero Media Quality & Relevance Check
  if (isEnforcedFeatureStory) {
    const heroImage = story.heroImage;
    const isPlaceholder = typeof heroImage === 'string' && heroImage.includes('/images/placeholders/');

    if (!heroImage || isPlaceholder) {
      checks.push({
        name: 'hero_media_quality',
        passed: false,
        reason: isPlaceholder
          ? 'Feature/standard story cannot use generic SVG placeholder as hero image. Blocked generic placeholder asset. Verified authentic photography or bespoke visual required.'
          : 'Feature/standard story missing required hero visual.',
      });
    } else {
      const heroValidation = validateStoryHeroMedia(story, options);
      if (!heroValidation.passed) {
        checks.push({
          name: 'hero_media_quality',
          passed: false,
          reason: `Hero media validation failed: ${heroValidation.violations.join('; ')}`,
          details: heroValidation.violations.join('\n'),
        });
      } else {
        const match = matchImageToStoryContext(heroImage, story, getManifestEntry);
        checks.push({
          name: 'hero_media_quality',
          passed: match.aligned,
          reason: match.aligned
            ? `Hero media context verified: ${match.reason}`
            : `Hero media failed context alignment check: ${match.reason}`,
        });
      }
    }
  }

  // Gate 16: Minimum narrative depth and reading-time consistency.
  // Depth is an independent invariant: a short story cannot pass by merely declaring a short read time.
  if (isEnforcedFeatureStory && story.blocks && story.blocks.length > 0) {
    const narrativeWords = countNarrativeWords(story.blocks);
    const minimumWords = getEditorialNarrativeTarget(story);
    const hasMinimumDepth = narrativeWords >= minimumWords;
    checks.push({
      name: 'narrative_depth',
      passed: hasMinimumDepth,
      reason: hasMinimumDepth
        ? `Narrative depth passed: ${narrativeWords} words meets the ${minimumWords}-word target`
        : `Long-form story requires at least ${minimumWords} narrative words; found ${narrativeWords}. Headlines, summaries, source lists, claims, timelines and metadata do not count.`,
    });

    if (Number.isFinite(story.readingTime) && story.readingTime > 0) {
      const calculatedReadingTime = estimateReadingTimeMinutes(narrativeWords);
      const diff = Math.abs(story.readingTime - calculatedReadingTime);
      const percentDiff = diff / Math.max(calculatedReadingTime, 1);
      const isConsistent = percentDiff <= 0.25 || diff <= 1;
      checks.push({
        name: 'reading_time_consistency',
        passed: isConsistent,
        reason: isConsistent
          ? `Narrative word count (${narrativeWords} words) consistent with declared reading time (${story.readingTime} min declared vs ${calculatedReadingTime} min calculated at 220 wpm)`
          : `Reading time discrepancy exceeded: declared ${story.readingTime} min vs calculated ${calculatedReadingTime} min (${narrativeWords} words). Discrepancy ${(percentDiff * 100).toFixed(0)}% exceeds 25% tolerance limit.`,
      });
    } else {
      checks.push({
        name: 'reading_time_consistency',
        passed: false,
        reason: 'Long-form stories must declare a positive readingTime that matches the shared narrative word-count model.',
      });
    }
  }

  // Gate 17a: Supporting visual provenance and approval.
  if (isEnforcedFeatureStory && story.blocks && story.blocks.length > 0) {
    const supportingMedia = validateStorySupportingMedia(story, options);
    checks.push({
      name: 'supporting_media_approval',
      passed: supportingMedia.passed,
      reason: supportingMedia.passed
        ? `All ${supportingMedia.assetIds.length} supporting image asset(s) have provenance and explicit approval`
        : `Supporting media is not publication-ready: ${supportingMedia.violations.join('; ')}`,
      details: supportingMedia.violations.length ? supportingMedia.violations.join('\\n') : undefined,
    });
  }

  // Gate 17: Visual Blocks Presence for Long-form Journalism
  if (isEnforcedFeatureStory && story.blocks && story.blocks.length > 0) {
    const visualBlocks = story.blocks.filter((b: any) =>
      ['chart', 'comparison', 'timeline', 'key-numbers', 'map', 'dataset-reference', 'table'].includes(b.type)
    );
    const hasVisuals = visualBlocks.length > 0;
    checks.push({
      name: 'visual_intelligence_pipeline',
      passed: hasVisuals,
      reason: hasVisuals
        ? `Story includes ${visualBlocks.length} supporting visual block(s) (${visualBlocks.map((v: any) => v.type).join(', ')})`
        : 'Long-form journalism requires at least one supporting visual block (chart, comparison, timeline, key-numbers).',
    });
  }

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
