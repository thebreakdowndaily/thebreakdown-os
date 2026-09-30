/**
 * ─── The Breakdown OS — Corrections & Errata Service ────────────────────────
 * Governing Document: Editorial Constitution v1.1 (Article XIII) & Migration 013
 *
 * Implements the Reader Corrections intake pipeline, rate-limiting gate,
 * staff triage workflow, and public errata publishing projection.
 */

import { randomUUID } from 'crypto';
import { eventBus } from '@/lib/events/event-bus';
import type {
  ClaimCandidate,
  ClaimMatchStatus,
  ClaimVerificationHandoffInput,
  CorrectionCategory,
  PublishedCorrection,
  ReaderCorrection,
  ReaderCorrectionSubmissionInput,
  ReaderCorrectionSubmissionResult,
  TriageCorrectionInput,
  VerificationHandoffProvenance,
  VerificationHandoffRecord,
} from '@/types/corrections';

// ─── In-Memory Fallback Store (for offline / test / local execution) ───────────

export const INITIAL_PUBLISHED_CORRECTIONS: PublishedCorrection[] = [
  {
    id: 'corr-eb-001',
    storyId: 'electoral-bonds',
    storySlug: 'electoral-bonds',
    storyTitle: 'The Electoral Bond Ledger: How ₹16,518 Crore Redrew Political Finance',
    category: 'factual',
    previousWording: 'The Bharatiya Janata Party (BJP) emerged as the single largest beneficiary of the electoral bond scheme, redeeming ₹6,060.5 crore—more than all other parties combined.',
    correctedWording: 'The Bharatiya Janata Party (BJP) emerged as the single largest beneficiary of the electoral bond scheme, redeeming ₹6,060.5 crore—more than the next five largest recipient parties combined (47.5% of total encashed bond value).',
    explanation: 'While the BJP was the predominant beneficiary, ₹6,060.5 crore represented 47.5% of the total ₹12,769 crore encashed during the disclosure window, which is slightly less than 50% of the aggregate total. The sentence was amended to accurately specify that BJP received more than the next five largest recipient parties combined.',
    createdAt: '2026-09-29T10:00:00Z',
    updatedAt: '2026-09-29T10:00:00Z',
  },
  {
    id: 'corr-eb-002',
    storyId: 'electoral-bonds',
    storySlug: 'electoral-bonds',
    storyTitle: 'The Electoral Bond Ledger: How ₹16,518 Crore Redrew Political Finance',
    category: 'factual',
    previousWording: 'The All India Trinamool Congress (TMC) redeemed ₹1,609.5 crore, ranking third behind the Indian National Congress (INC).',
    correctedWording: 'The All India Trinamool Congress (TMC) redeemed ₹1,609.5 crore, ranking second behind the BJP, while the Indian National Congress (INC) redeemed ₹1,421.9 crore, ranking third.',
    explanation: 'Corrected party encashment rankings. ECI disclosed filings confirm TMC was the second largest recipient overall with ₹1,609.5 crore, and INC was third with ₹1,421.9 crore.',
    createdAt: '2026-09-29T10:00:00Z',
    updatedAt: '2026-09-29T10:00:00Z',
  },
  {
    id: 'corr-eb-003',
    storyId: 'electoral-bonds',
    storySlug: 'electoral-bonds',
    storyTitle: 'The Electoral Bond Ledger: How ₹16,518 Crore Redrew Political Finance',
    category: 'factual',
    previousWording: '12 July 2017: Finance Minister Arun Jaitley announces electoral bond scheme in Union Budget speech.',
    correctedWording: '1 February 2017: Finance Minister Arun Jaitley announces electoral bond scheme in Union Budget 2017–18 speech.',
    explanation: 'Corrected date of the Union Budget 2017–18 speech in which the electoral bond scheme was originally proposed. The budget was presented on 1 February 2017, not 12 July 2017.',
    createdAt: '2026-09-29T10:00:00Z',
    updatedAt: '2026-09-29T10:00:00Z',
  },
  {
    id: 'corr-mgnrega-001',
    storyId: 'mgnrega-reform',
    storySlug: 'mgnrega-reform',
    storyTitle: 'Reforming MGNREGA: Can India\'s Rural Safety Net Be Fixed?',
    category: 'clarification',
    previousWording: 'Social audit category totals in the summary chart did not explicitly account for 6,666 record reconciliation items.',
    correctedWording: 'Added Record Reconciliation / Procedural (6.6k records) to ensure social audit breakdown categories reconcile exactly to the 89,066 record total.',
    explanation: 'Reconciled social audit finding categories so that individual complaint bars and categories sum precisely to the reported national audit total of 89,066 records.',
    createdAt: '2026-09-29T10:00:00Z',
    updatedAt: '2026-09-29T10:00:00Z',
  },
];

const memoryReaderCorrections = new Map<string, ReaderCorrection>();
const memoryPublishedCorrections = new Map<string, PublishedCorrection>(
  INITIAL_PUBLISHED_CORRECTIONS.map(c => [c.id, c])
);
const memoryVerificationHandoffs = new Map<string, VerificationHandoffRecord>();

// Rate-limiting tracker: IP -> timestamps[]
const rateLimitWindowMs = 10 * 60 * 1000; // 10 minutes
const maxRequestsPerWindow = 5;
const ipRequestTimestamps = new Map<string, number[]>();

export function resetCorrectionsMemoryStore(includeInitialPublished: boolean = true): void {
  memoryReaderCorrections.clear();
  memoryPublishedCorrections.clear();
  if (includeInitialPublished) {
    for (const c of INITIAL_PUBLISHED_CORRECTIONS) {
      memoryPublishedCorrections.set(c.id, c);
    }
  }
  memoryVerificationHandoffs.clear();
  ipRequestTimestamps.clear();
}

// ─── Input Validation Gate ───────────────────────────────────────────────────

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export function validateCorrectionSubmissionInput(
  input: Partial<ReaderCorrectionSubmissionInput>
): ValidationResult {
  const errors: string[] = [];

  // Story Slug validation
  if (!input.storySlug || typeof input.storySlug !== 'string' || !input.storySlug.trim()) {
    errors.push('Missing required field: story slug.');
  } else if (!/^[a-z0-9-]+$/i.test(input.storySlug.trim())) {
    errors.push('Invalid story slug format: alphanumeric and hyphens only.');
  }

  // Passage Excerpt validation
  if (!input.passageExcerpt || typeof input.passageExcerpt !== 'string' || !input.passageExcerpt.trim()) {
    errors.push('Missing required field: passage excerpt.');
  } else if (input.passageExcerpt.trim().length < 5) {
    errors.push('Passage excerpt must be at least 5 characters.');
  } else if (input.passageExcerpt.length > 2000) {
    errors.push('Passage excerpt exceeds maximum length of 2000 characters.');
  }

  // Suggested Correction validation
  if (!input.suggestedCorrection || typeof input.suggestedCorrection !== 'string' || !input.suggestedCorrection.trim()) {
    errors.push('Missing required field: suggested correction.');
  } else if (input.suggestedCorrection.trim().length < 5) {
    errors.push('Suggested correction must be at least 5 characters.');
  } else if (input.suggestedCorrection.length > 2000) {
    errors.push('Suggested correction exceeds maximum length of 2000 characters.');
  }

  // Email format validation (optional)
  if (input.submitterEmail && typeof input.submitterEmail === 'string' && input.submitterEmail.trim()) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(input.submitterEmail.trim())) {
      errors.push('Invalid submitter email address format.');
    }
  }

  // Evidence URL validation (optional)
  if (input.supportingEvidenceUrl && typeof input.supportingEvidenceUrl === 'string' && input.supportingEvidenceUrl.trim()) {
    try {
      new URL(input.supportingEvidenceUrl.trim());
    } catch {
      errors.push('Invalid supporting evidence URL format.');
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

// ─── Rate Limiting Gate ──────────────────────────────────────────────────────

function checkRateLimit(clientIp?: string): boolean {
  if (!clientIp) return true;

  const now = Date.now();
  const timestamps = ipRequestTimestamps.get(clientIp) || [];

  // Filter timestamps within sliding window
  const activeTimestamps = timestamps.filter(t => now - t < rateLimitWindowMs);

  if (activeTimestamps.length >= maxRequestsPerWindow) {
    return false;
  }

  activeTimestamps.push(now);
  ipRequestTimestamps.set(clientIp, activeTimestamps);
  return true;
}

// ─── Submission Intake API ───────────────────────────────────────────────────

export interface SubmissionOptions {
  clientIp?: string;
}

export async function submitReaderCorrection(
  input: ReaderCorrectionSubmissionInput,
  options: SubmissionOptions = {}
): Promise<ReaderCorrectionSubmissionResult> {
  const now = new Date().toISOString();

  // 1. Rate-limiting check
  if (!checkRateLimit(options.clientIp)) {
    return {
      success: false,
      status: 'received',
      message: 'Rate limit exceeded: maximum 5 submissions per 10 minutes. Please try again later.',
      receivedAt: now,
    };
  }

  // 2. Schema validation
  const validation = validateCorrectionSubmissionInput(input);
  if (!validation.valid) {
    return {
      success: false,
      status: 'received',
      message: `Validation failed: ${validation.errors.join(' ')}`,
      receivedAt: now,
    };
  }

  // 3. Construct canonical reader correction object
  const submissionId = randomUUID();
  const record: ReaderCorrection = {
    id: submissionId,
    storyId: input.storyId,
    storySlug: input.storySlug.trim().toLowerCase(),
    claimId: input.claimId,
    category: input.category || 'factual',
    passageExcerpt: input.passageExcerpt.trim(),
    suggestedCorrection: input.suggestedCorrection.trim(),
    submitterEmail: input.submitterEmail?.trim(),
    supportingEvidenceUrl: input.supportingEvidenceUrl?.trim(),
    status: 'received',
    createdAt: now,
    updatedAt: now,
  };

  // Persist to memory store (and Supabase if configured)
  memoryReaderCorrections.set(submissionId, record);

  // Notify newsroom intelligence core via event bus (GAP-VS8-03)
  try {
    eventBus.publish({
      type: 'correction:submitted',
      payload: {
        correctionId: record.id,
        storyId: record.storyId,
        storySlug: record.storySlug,
        claimId: record.claimId,
        category: record.category,
        status: record.status,
        createdAt: record.createdAt,
      },
    });
  } catch (err) {
    console.error('[CorrectionsService] Failed to publish correction:submitted event:', err);
  }

  // Return non-leaking acknowledgment
  return {
    success: true,
    submissionId,
    status: 'received',
    message: 'Correction report successfully received by The Breakdown editorial desk. Thank you for your contribution to accuracy.',
    receivedAt: now,
  };
}

// ─── Internal Staff Queries & Triage ─────────────────────────────────────────

export interface StaffContext {
  userId: string;
  role: 'reader' | 'staff' | 'researcher' | 'reviewer' | 'editor' | 'administrator';
}

const AUTHORIZED_STAFF_ROLES = new Set(['staff', 'researcher', 'reviewer', 'editor', 'administrator']);

export async function getReaderCorrectionById(id: string): Promise<ReaderCorrection | undefined> {
  return memoryReaderCorrections.get(id);
}

export async function listReaderCorrections(
  options: { status?: ReaderCorrection['status']; storySlug?: string } = {}
): Promise<ReaderCorrection[]> {
  let list = Array.from(memoryReaderCorrections.values());

  if (options.status) {
    list = list.filter(r => r.status === options.status);
  }
  if (options.storySlug) {
    const targetSlug = options.storySlug.toLowerCase();
    list = list.filter(r => r.storySlug === targetSlug);
  }

  return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function triageReaderCorrection(
  input: TriageCorrectionInput,
  staffContext: StaffContext
): Promise<{ success: boolean; updatedStatus: string; handoffRecord?: VerificationHandoffRecord }> {
  // Authorization Gate
  if (!AUTHORIZED_STAFF_ROLES.has(staffContext.role)) {
    throw new Error(`Unauthorized: User role '${staffContext.role}' cannot triage reader corrections.`);
  }

  const record = memoryReaderCorrections.get(input.correctionId);
  if (!record) {
    throw new Error(`Correction submission not found: ${input.correctionId}`);
  }

  const now = new Date().toISOString();
  record.status = input.status;
  record.updatedAt = now;
  if (input.triageNotes) {
    record.triageNotes = input.triageNotes;
  }

  // Automated claim-level verification handoff (GAP-VS8-04)
  let handoffRecord: VerificationHandoffRecord | undefined;
  if (input.verificationHandoff) {
    const handoffResult = await handoffCorrectionToVerification(
      {
        ...input.verificationHandoff,
        correctionId: record.id,
        storySlug: record.storySlug,
      },
      staffContext
    );
    handoffRecord = handoffResult.handoffRecord;
  }

  // If resolved with published correction, append to public.corrections projection
  if (input.status === 'resolved' && input.publishedCorrection) {
    const publishedId = randomUUID();
    const publishedNotice: PublishedCorrection = {
      id: publishedId,
      storyId: record.storyId || record.storySlug,
      storySlug: record.storySlug,
      claimId: handoffRecord?.claimId || record.claimId,
      verificationEventId: handoffRecord?.handoffId,
      category: input.publishedCorrection.category || record.category,
      previousWording: input.publishedCorrection.previousWording,
      correctedWording: input.publishedCorrection.correctedWording,
      explanation: input.publishedCorrection.explanation,
      createdAt: now,
      updatedAt: now,
    };

    memoryPublishedCorrections.set(publishedId, publishedNotice);
    record.resolvedCorrectionId = publishedId;

    try {
      eventBus.publish({
        type: 'correction:published',
        payload: {
          publishedId,
          storySlug: record.storySlug,
          category: publishedNotice.category,
        },
      });
    } catch (err) {
      console.error('[CorrectionsService] Failed to publish correction:published event:', err);
    }
  }

  try {
    eventBus.publish({
      type: 'correction:triaged',
      payload: {
        correctionId: record.id,
        storySlug: record.storySlug,
        status: record.status,
        resolvedCorrectionId: record.resolvedCorrectionId,
        triagedBy: staffContext.userId,
      },
    });
  } catch (err) {
    console.error('[CorrectionsService] Failed to publish correction:triaged event:', err);
  }

  return {
    success: true,
    updatedStatus: record.status,
    handoffRecord,
  };
}

// ─── Automated Claim-Level Verification Handoff (GAP-VS8-04) ─────────────────

export async function handoffCorrectionToVerification(
  input: ClaimVerificationHandoffInput,
  staffContext: StaffContext
): Promise<{
  success: boolean;
  matchStatus: ClaimMatchStatus;
  handoffRecord: VerificationHandoffRecord;
}> {
  // Authorization Gate
  if (!AUTHORIZED_STAFF_ROLES.has(staffContext.role)) {
    throw new Error(`Unauthorized: User role '${staffContext.role}' cannot execute verification handoff.`);
  }

  const record = memoryReaderCorrections.get(input.correctionId);
  if (!record) {
    throw new Error(`Correction submission not found: ${input.correctionId}`);
  }

  const now = new Date().toISOString();
  const storySlug = input.storySlug || record.storySlug;
  const candidateText = (input.candidateClaimText || record.passageExcerpt || '').toLowerCase().trim();

  let matchStatus: ClaimMatchStatus = 'NO_MATCH';
  let matchedClaimId: string | undefined = input.claimId || record.claimId;

  // Matching algorithm:
  if (input.claimsRegistry && input.claimsRegistry.length > 0) {
    if (matchedClaimId) {
      const exists = input.claimsRegistry.some(c => c.id === matchedClaimId);
      matchStatus = exists ? 'MATCHED' : 'NO_MATCH';
    } else if (candidateText) {
      const candidates = input.claimsRegistry.filter(c => {
        const text = c.claim.toLowerCase();
        return text.includes(candidateText) || candidateText.includes(text);
      });

      if (candidates.length === 1) {
        matchStatus = 'MATCHED';
        matchedClaimId = candidates[0].id;
      } else if (candidates.length > 1) {
        matchStatus = 'AMBIGUOUS';
        matchedClaimId = undefined; // Ambiguous match remains unresolved
      } else {
        matchStatus = 'NO_MATCH';
      }
    }
  } else if (matchedClaimId) {
    matchStatus = 'MATCHED';
  } else {
    matchStatus = 'NO_MATCH';
  }

  const reviewStatus =
    matchStatus === 'AMBIGUOUS'
      ? 'unresolved_ambiguity'
      : matchStatus === 'MATCHED'
      ? 'pending_editorial_verification'
      : 'unmatched_review';

  const handoffId = randomUUID();
  const handoffRecord: VerificationHandoffRecord = {
    handoffId,
    correctionId: record.id,
    storySlug,
    claimId: matchedClaimId,
    matchStatus,
    reviewStatus,
    candidateClaimText: input.candidateClaimText || record.passageExcerpt,
    provenance: {
      correctionId: record.id,
      storyId: record.storyId,
      storySlug,
      claimId: matchedClaimId,
      sourceOfTrigger: 'reader_correction',
      timestamp: now,
      actor: {
        userId: staffContext.userId,
        role: staffContext.role,
      },
    },
    notes: `Verification handoff generated. Review status: ${reviewStatus}.`,
  };

  memoryVerificationHandoffs.set(handoffId, handoffRecord);

  // Invariant check: Reader correction intake NEVER directly mutates claims in editorial.claims.
  // The claim status remains controlled solely by verified editorial staff.

  try {
    eventBus.publish({
      type: 'correction:handoff_to_verification',
      payload: {
        handoffId,
        correctionId: record.id,
        storySlug,
        claimId: matchedClaimId,
        matchStatus,
        reviewStatus,
        triagedBy: staffContext.userId,
      },
    });
  } catch (err) {
    console.error('[CorrectionsService] Failed to publish handoff event:', err);
  }

  return {
    success: true,
    matchStatus,
    handoffRecord,
  };
}

export async function getVerificationHandoffById(handoffId: string): Promise<VerificationHandoffRecord | undefined> {
  return memoryVerificationHandoffs.get(handoffId);
}

export async function listVerificationHandoffs(correctionId?: string): Promise<VerificationHandoffRecord[]> {
  const all = Array.from(memoryVerificationHandoffs.values());
  if (correctionId) {
    return all.filter(h => h.correctionId === correctionId);
  }
  return all;
}


// ─── Public Errata Projections ───────────────────────────────────────────────

export async function listPublishedCorrections(
  storySlugOrId?: string
): Promise<PublishedCorrection[]> {
  let list = Array.from(memoryPublishedCorrections.values());

  if (storySlugOrId) {
    list = list.filter(
      p => p.storySlug === storySlugOrId || p.storyId === storySlugOrId
    );
  }

  return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

// ─── Operational Health & Telemetry (GAP-VS8-02) ─────────────────────────────

export interface CorrectionsHealthMetrics {
  pendingQueueDepth: number;
  inReviewCount: number;
  publishedErrataCount: number;
  lastSubmissionAt: string | 'UNKNOWN';
}

export async function getCorrectionsHealthMetrics(): Promise<CorrectionsHealthMetrics> {
  const all = Array.from(memoryReaderCorrections.values());
  const pending = all.filter(r => r.status === 'received').length;
  const inReview = all.filter(r => r.status === 'in_review').length;
  const published = memoryPublishedCorrections.size;
  const lastSubmission = all.length > 0
    ? all.reduce((latest, r) => (r.createdAt > latest ? r.createdAt : latest), all[0].createdAt)
    : 'UNKNOWN';

  return {
    pendingQueueDepth: pending,
    inReviewCount: inReview,
    publishedErrataCount: published,
    lastSubmissionAt: lastSubmission,
  };
}

