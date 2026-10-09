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
import { evaluateGoldStandardPass, type GoldStandardAuditRecord } from './gold-standard-review';
import { getSource } from '@/lib/knowledge/source-registry';
import { validateStoryEvidenceCompleteness } from '@/lib/story/evidence-guard';
import type { EvidenceVaultService } from '@/services/intelligence/evidence-vault.service';

const ELIGIBLE_STATUSES: StoryStatus[] = ['scheduled', 'review', 'fact_check'];

/**
 * Full Async Publication Gate — evaluates Gates 1-12 plus Gate 13 (Evidence Vault Reconstructibility).
 */
export async function validateStoryForPublicationAsync(
  input: PublicationGateInput,
  story: Story | undefined,
  vault?: EvidenceVaultService,
  now: Date = new Date(),
): Promise<PublicationGateResult> {
  const syncResult = validateStoryForPublication(input, story, now);
  const checks = [...syncResult.checks];

  if (!syncResult.passed || !story) {
    return { ...syncResult, checks };
  }

  // Gate 13: Evidence Vault Completeness & Cryptographic Reconstructibility (Article III & IV)
  const evidenceRes = await validateStoryEvidenceCompleteness(story, vault);
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

  // Gate 11: Gold Standard Review & Evidence Density (Article XI)
  const auditRecord = (story as Story & { goldStandardAudit?: GoldStandardAuditRecord }).goldStandardAudit;
  if (auditRecord) {
    const passedGoldStandard = evaluateGoldStandardPass(auditRecord);
    checks.push({
      name: 'gold_standard_review',
      passed: passedGoldStandard,
      reason: passedGoldStandard
        ? 'Gold Standard Review passed all 7 phases with zero blocking issues'
        : 'Gold Standard Review has incomplete phases or unresolved blocking issues',
    });
  } else {
    const hasDensity = hasSources && hasClaims;
    checks.push({
      name: 'gold_standard_review',
      passed: hasDensity,
      reason: hasDensity
        ? 'Story meets foundational evidence and claim density requirements'
        : 'Story lacks required evidence sources or claims for editorial density',
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
