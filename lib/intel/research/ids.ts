/**
 * ─── Research Intelligence Engine — IDs ───────────────────────────────────────
 * Governing document: docs/research/RESEARCH_INTELLIGENCE_OPERATING_STANDARD.md
 *
 * Deterministic, collision-resistant identifier generation for all RIE entities.
 * Uses a compact time-ordered prefix + random suffix so ids sort roughly by
 * creation time (mirrors the newsroom intelligence id convention).
 */

export function createId(prefix: string): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${timestamp}_${random}`;
}

export function createProjectId(): string {
  return createId('rp');
}

export function createQueryId(): string {
  return createId('rq');
}

export function createSourceId(): string {
  return createId('rs');
}

export function createDocumentId(): string {
  return createId('rd');
}

export function createClaimId(): string {
  return createId('rc');
}

export function createEvidenceId(): string {
  return createId('re');
}

export function createContradictionId(): string {
  return createId('rx');
}

export function createGapId(): string {
  return createId('rg');
}

export function createEventId(): string {
  return createId('rv');
}

export function createQuestionId(): string {
  return createId('rqst');
}

export function createRunId(): string {
  return createId('run');
}

export function createClusterId(): string {
  return createId('clu');
}

export function createSignalId(): string {
  return createId('sig');
}

export function createChangeId(): string {
  return createId('chg');
}

export function createStoryBriefId(): string {
  return createId('brief');
}
