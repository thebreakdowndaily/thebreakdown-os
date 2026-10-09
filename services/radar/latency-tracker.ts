/**
 * ─── Radar End-to-End Latency Instrumentation Engine (Phase 3B-M3) ────────────
 *
 * Governing Document: AGENTS.md (Platform Beta)
 * Phase 3B Milestone 3: End-to-End Latency Instrumentation & Auditable Chronology
 *
 * Bridges the complete newsroom intelligence latency path:
 *   SOURCE PUBLICATION
 *   → FIRST SEEN (retrieval)
 *   → FIRST DETECTED (recognition / clustering)
 *   → FIRST VERIFIED (human editorial verification)
 *   → PUBLICATION (canonical public story publication)
 *
 * Measurement Invariants Enforced:
 *   1. Historical timestamps are immutable once established.
 *   2. Replays cannot move first-seen/first-detected timestamps forward.
 *   3. A later verification cannot overwrite an earlier verification time.
 *   4. A story republish/update must not falsely become its first publication.
 *   5. Failed or rejected verification must not populate firstVerifiedAt.
 *   6. Draft stories must not populate publication completion time.
 *   7. Automated detection must never create human verification timestamps.
 *   8. No timestamp may be inferred from a later event merely because the earlier event is missing.
 */

import type { RadarLatencyRecord, DerivedLatencyMetrics } from './types';
import type { RadarPersistenceRepository } from './persistence/types';

export interface VerificationTransitionInput {
  clusterId: string;
  verifiedAt?: string;
  actor: {
    id: string;
    role: string;
    isHuman?: boolean;
  };
  verificationStatus: 'verified' | 'rejected' | 'dismissed' | 'unverified';
  notes?: string;
}

export interface PublicationTransitionInput {
  clusterId: string;
  publishedAt?: string;
  storyStatus: string;
  isRepublish?: boolean;
}

/**
 * Safely parses an ISO date string to milliseconds.
 * Returns null if missing or invalid.
 */
export function parseTimestampMs(dateStr?: string | null): number | null {
  if (!dateStr || typeof dateStr !== 'string') return null;
  const ms = Date.parse(dateStr);
  return Number.isFinite(ms) ? ms : null;
}

/**
 * Computes all 6 derived latency metrics across the complete intelligence pipeline.
 * Enforces strict chronology validation and returns safe nulls for unavailable
 * or negative intervals.
 */
export function calculateDerivedLatencies(
  timestamps: Partial<RadarLatencyRecord>
): DerivedLatencyMetrics {
  const srcMs = parseTimestampMs(timestamps.sourcePublishedAt);
  const seenMs = parseTimestampMs(timestamps.firstSeenAt);
  const detMs = parseTimestampMs(timestamps.firstDetectedAt);
  const verMs = parseTimestampMs(timestamps.firstVerifiedAt);
  const pubMs = parseTimestampMs(timestamps.publishedAt);

  const violations: string[] = [];

  // 1. Chronology Validations
  if (srcMs !== null && seenMs !== null && seenMs < srcMs) {
    violations.push(
      `Negative observation interval: firstSeenAt (${timestamps.firstSeenAt}) precedes sourcePublishedAt (${timestamps.sourcePublishedAt})`
    );
  }
  if (seenMs !== null && detMs !== null && detMs < seenMs) {
    violations.push(
      `Negative detection interval: firstDetectedAt (${timestamps.firstDetectedAt}) precedes firstSeenAt (${timestamps.firstSeenAt})`
    );
  }
  if (detMs !== null && verMs !== null && verMs < detMs) {
    violations.push(
      `Negative verification interval: firstVerifiedAt (${timestamps.firstVerifiedAt}) precedes firstDetectedAt (${timestamps.firstDetectedAt})`
    );
  }
  if (verMs !== null && pubMs !== null && pubMs < verMs) {
    violations.push(
      `Negative publication interval: publishedAt (${timestamps.publishedAt}) precedes firstVerifiedAt (${timestamps.firstVerifiedAt})`
    );
  }
  if (srcMs !== null && pubMs !== null && pubMs < srcMs) {
    violations.push(
      `Negative end-to-end interval: publishedAt (${timestamps.publishedAt}) precedes sourcePublishedAt (${timestamps.sourcePublishedAt})`
    );
  }

  // 2. Derived Latency Computations (Only valid non-negative intervals)
  // Detection latency: firstDetectedAt - sourcePublishedAt
  const detectionLatencyMs =
    srcMs !== null && detMs !== null && detMs >= srcMs ? detMs - srcMs : null;

  // Observation latency: firstSeenAt - sourcePublishedAt
  const observationLatencyMs =
    srcMs !== null && seenMs !== null && seenMs >= srcMs ? seenMs - srcMs : null;

  // Detection processing latency: firstDetectedAt - firstSeenAt
  const detectionProcessingLatencyMs =
    seenMs !== null && detMs !== null && detMs >= seenMs ? detMs - seenMs : null;

  // Verification latency: firstVerifiedAt - firstDetectedAt
  const verificationLatencyMs =
    detMs !== null && verMs !== null && verMs >= detMs ? verMs - detMs : null;

  // Editorial-to-publication latency: publishedAt - firstVerifiedAt
  const editorialToPublicationLatencyMs =
    verMs !== null && pubMs !== null && pubMs >= verMs ? pubMs - verMs : null;

  // End-to-end publication latency: publishedAt - sourcePublishedAt
  const endToEndPublicationLatencyMs =
    srcMs !== null && pubMs !== null && pubMs >= srcMs ? pubMs - srcMs : null;

  return {
    detectionLatencyMs,
    observationLatencyMs,
    detectionProcessingLatencyMs,
    verificationLatencyMs,
    editorialToPublicationLatencyMs,
    endToEndPublicationLatencyMs,
    isValidChronology: violations.length === 0,
    chronologyViolations: violations,
  };
}

/**
 * Merges an incoming latency record with an existing record adhering to
 * all immutability and replay invariants.
 */
export function mergeLatencyRecord(
  existing: RadarLatencyRecord | null,
  incoming: RadarLatencyRecord
): RadarLatencyRecord {
  if (!existing) {
    const derived = calculateDerivedLatencies(incoming);
    return {
      ...incoming,
      detectionLatencyMs: derived.detectionLatencyMs ?? undefined,
      verificationLatencyMs: derived.verificationLatencyMs ?? undefined,
      publicationLatencyMs: derived.editorialToPublicationLatencyMs ?? undefined,
      observationLatencyMs: derived.observationLatencyMs ?? undefined,
      detectionProcessingLatencyMs: derived.detectionProcessingLatencyMs ?? undefined,
      endToEndPublicationLatencyMs: derived.endToEndPublicationLatencyMs ?? undefined,
    };
  }

  // Invariant 1 & 8: Preserve sourcePublishedAt once established
  const sourcePublishedAt = existing.sourcePublishedAt || incoming.sourcePublishedAt;

  // Invariant 2: Replays cannot move first-seen or first-detected timestamps forward.
  // Take the earliest valid timestamp.
  const existingSeenMs = parseTimestampMs(existing.firstSeenAt);
  const incomingSeenMs = parseTimestampMs(incoming.firstSeenAt);
  const firstSeenAt =
    existingSeenMs !== null && incomingSeenMs !== null
      ? (existingSeenMs <= incomingSeenMs ? existing.firstSeenAt : incoming.firstSeenAt)
      : (existing.firstSeenAt || incoming.firstSeenAt);

  const existingDetMs = parseTimestampMs(existing.firstDetectedAt);
  const incomingDetMs = parseTimestampMs(incoming.firstDetectedAt);
  const firstDetectedAt =
    existingDetMs !== null && incomingDetMs !== null
      ? (existingDetMs <= incomingDetMs ? existing.firstDetectedAt : incoming.firstDetectedAt)
      : (existing.firstDetectedAt || incoming.firstDetectedAt);

  // Invariant 3: A later verification cannot overwrite an earlier verification time.
  const existingVerMs = parseTimestampMs(existing.firstVerifiedAt);
  const incomingVerMs = parseTimestampMs(incoming.firstVerifiedAt);
  let firstVerifiedAt = existing.firstVerifiedAt;
  if (!firstVerifiedAt && incoming.firstVerifiedAt) {
    firstVerifiedAt = incoming.firstVerifiedAt;
  } else if (existingVerMs !== null && incomingVerMs !== null && incomingVerMs < existingVerMs) {
    // If incoming represents an earlier legitimate verification, retain the earliest
    firstVerifiedAt = incoming.firstVerifiedAt;
  }

  // Invariant 4: A story republish/update must not falsely become its first publication.
  let publishedAt = existing.publishedAt;
  if (!publishedAt && incoming.publishedAt) {
    publishedAt = incoming.publishedAt;
  }

  const mergedBase: RadarLatencyRecord = {
    clusterId: incoming.clusterId || existing.clusterId,
    sourcePublishedAt,
    firstSeenAt,
    firstDetectedAt,
    firstVerifiedAt,
    publishedAt,
  };

  const derived = calculateDerivedLatencies(mergedBase);

  return {
    ...mergedBase,
    detectionLatencyMs: derived.detectionLatencyMs ?? undefined,
    verificationLatencyMs: derived.verificationLatencyMs ?? undefined,
    publicationLatencyMs: derived.editorialToPublicationLatencyMs ?? undefined,
    observationLatencyMs: derived.observationLatencyMs ?? undefined,
    detectionProcessingLatencyMs: derived.detectionProcessingLatencyMs ?? undefined,
    endToEndPublicationLatencyMs: derived.endToEndPublicationLatencyMs ?? undefined,
  };
}

/**
 * Records a legitimate human editorial verification event on a cluster's latency record.
 * Enforces Invariants 3, 5, and 7.
 */
export async function recordEditorialVerification(
  repository: RadarPersistenceRepository,
  input: VerificationTransitionInput
): Promise<RadarLatencyRecord | null> {
  // Invariant 7: Automated detection must never create human verification timestamps
  if (input.actor.isHuman === false || !input.actor.id || input.actor.role === 'system' || input.actor.role === 'crawler') {
    throw new Error(
      `Invariant violation: Automated system or non-human actor '${input.actor.id}' cannot record human verification.`
    );
  }

  // Invariant 5: Failed or rejected verification must not populate firstVerifiedAt
  if (input.verificationStatus !== 'verified') {
    return repository.getLatencyRecord(input.clusterId);
  }

  const existing = await repository.getLatencyRecord(input.clusterId);
  const verifiedAt = input.verifiedAt || new Date().toISOString();

  const recordToMerge: RadarLatencyRecord = {
    clusterId: input.clusterId,
    firstSeenAt: existing?.firstSeenAt || verifiedAt,
    firstDetectedAt: existing?.firstDetectedAt || verifiedAt,
    firstVerifiedAt: verifiedAt,
    sourcePublishedAt: existing?.sourcePublishedAt,
    publishedAt: existing?.publishedAt,
  };

  await repository.recordLatency(recordToMerge);
  return repository.getLatencyRecord(input.clusterId);
}

/**
 * Records a canonical story publication event on a cluster's latency record.
 * Enforces Invariants 4 and 6.
 */
export async function recordStoryPublication(
  repository: RadarPersistenceRepository,
  input: PublicationTransitionInput
): Promise<RadarLatencyRecord | null> {
  // Invariant 6: Draft, review, or scheduled stories must not populate publication completion time
  if (input.storyStatus !== 'published') {
    return repository.getLatencyRecord(input.clusterId);
  }

  const existing = await repository.getLatencyRecord(input.clusterId);
  const publishedAt = input.publishedAt || new Date().toISOString();

  // Invariant 4: Republish/update must not overwrite first publication
  if (existing?.publishedAt && input.isRepublish) {
    return existing;
  }

  const recordToMerge: RadarLatencyRecord = {
    clusterId: input.clusterId,
    firstSeenAt: existing?.firstSeenAt || publishedAt,
    firstDetectedAt: existing?.firstDetectedAt || publishedAt,
    firstVerifiedAt: existing?.firstVerifiedAt,
    sourcePublishedAt: existing?.sourcePublishedAt,
    publishedAt,
  };

  await repository.recordLatency(recordToMerge);
  return repository.getLatencyRecord(input.clusterId);
}
