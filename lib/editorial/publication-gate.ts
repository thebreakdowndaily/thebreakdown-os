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
import { validateStoryHeroMedia } from '@/lib/image-intelligence/publication-validation';
import { countNarrativeWords, estimateReadingTimeMinutes, getEditorialNarrativeTarget } from '@/lib/story/narrative-metrics';
import { validateStoryEvidenceCompleteness } from '@/lib/story/evidence-guard';
import type { EvidenceVaultService } from '@/services/intelligence/evidence-vault.service';

const ELIGIBLE_STATUSES: StoryStatus[] = ['scheduled', 'review', 'fact_check'];

/**
 * Full async gate adds Gate 15: evidence-vault reconstructibility after all synchronous checks pass.
 */
export async function validateStoryForPublicationAsync(
  input: PublicationGateInput,
  story: Story | undefined,
  vault?: EvidenceVaultService,
  now: Date = new Date(),
  options?: { vaultInitError?: string }
): Promise<PublicationGateResult> {
  const syncResult = validateStoryForPublication(input, story, now);
  const checks = [...syncResult.checks];

  if (!syncResult.passed || !story) {
    return { ...syncResult, checks };
  }

  // Gate 15: Evidence Vault Completeness & Cryptographic Reconstructibility (Article III & IV)
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

  // Gate 11: Reader-facing narrative depth and reading-time integrity.
  const narrativeWords = countNarrativeWords(story.blocks);
  const narrativeTarget = getEditorialNarrativeTarget(story);
  const calculatedReadingTime = estimateReadingTimeMinutes(narrativeWords);
  const hasNarrativeDepth = narrativeWords >= narrativeTarget;
  checks.push({
    name: 'narrative_depth',
    passed: hasNarrativeDepth,
    reason: hasNarrativeDepth
      ? `Narrative contains ${narrativeWords} words (minimum ${narrativeTarget} for this assignment).`
      : `Publication blocked: narrative contains ${narrativeWords} words; requires at least ${narrativeTarget}. Headline, summary, source apparatus, claims, FAQ and timeline are excluded.`,
    details: `storyType=${story.storyType}; target=${narrativeTarget}; actual=${narrativeWords}`,
  });
  const readingTimeConsistent = calculatedReadingTime > 0 && story.readingTime === calculatedReadingTime;
  checks.push({
    name: 'reading_time_matches_narrative',
    passed: readingTimeConsistent,
    reason: readingTimeConsistent
      ? `Declared reading time matches ${calculatedReadingTime} minutes at 220 words/minute.`
      : `Publication blocked: declared reading time is ${story.readingTime} minutes; narrative-based estimate is ${calculatedReadingTime} minutes at 220 words/minute.`,
  });

  // Gate 12: Story-specific hero asset, rights metadata, relevance rationale and human approval.
  const heroValidation = validateStoryHeroMedia(story);
  checks.push({
    name: 'story_specific_hero_media',
    passed: heroValidation.passed,
    reason: heroValidation.passed
      ? `Feature hero media is editorially eligible (${heroValidation.assetId || 'legacy manifest asset'}).`
      : `Publication blocked: ${heroValidation.violations.join('; ')}`,
    details: heroValidation.violations.length ? heroValidation.violations.join('\n') : undefined,
  });

  // Gate 13: Gold Standard Review Integrity (Article XI)
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

  // Gate 14: Retracted sources check (Article III & XIII)
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
