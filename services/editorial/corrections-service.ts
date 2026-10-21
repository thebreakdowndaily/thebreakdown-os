/**
 * ─── The Breakdown OS — Corrections & Errata Service ────────────────────────
 * Governing Document: Editorial Constitution v1.1 (Article XIII) & Migration 013
 *
 * Implements the Reader Corrections intake pipeline, rate-limiting gate,
 * staff triage workflow, and public errata publishing projection.
 */

import { randomUUID } from 'crypto';
import { eventBus } from '@/lib/events/event-bus';
import { getServiceClient } from '@/supabase/client';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { TypedDatabase } from '@/supabase/client';
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

function isValidUuid(id?: string | null): boolean {
  if (!id) return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
}

function rowToPublishedCorrection(row: any): PublishedCorrection {
  const relatedStory = Array.isArray(row.stories) ? row.stories[0] : row.stories;
  return {
    id: row.id,
    storyId: row.story_id,
    storyTitle: relatedStory?.title || undefined,
    storySlug: relatedStory?.slug || row.story_slug || undefined,
    storyVersionId: row.story_version_id || undefined,
    claimId: row.claim_id || undefined,
    verificationEventId: row.verification_event_id || undefined,
    category: row.category as CorrectionCategory,
    previousWording: row.previous_wording || '',
    correctedWording: row.corrected_wording || '',
    explanation: row.explanation,
    supersededById: row.superseded_by_id || undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at || row.created_at,
  };
}

function rowToReaderCorrection(row: any): ReaderCorrection {
  const mem = memoryReaderCorrections.get(row.id);
  return {
    id: row.id,
    storyId: row.story_id || mem?.storyId || undefined,
    storySlug: row.story_slug,
    claimId: row.claim_id || undefined,
    resolvedCorrectionId: row.resolved_correction_id || mem?.resolvedCorrectionId || undefined,
    category: row.category as CorrectionCategory,
    passageExcerpt: row.passage_excerpt,
    suggestedCorrection: row.suggested_correction,
    submitterEmail: row.submitter_email || undefined,
    supportingEvidenceUrl: row.supporting_evidence_url || undefined,
    status: row.status,
    triageNotes: row.triage_notes || mem?.triageNotes || undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

let customDbClient: SupabaseClient<any> | null = null;

export function setCorrectionsDbClient(client: SupabaseClient<any> | null): void {
  customDbClient = client;
}

export function getCorrectionsDbClient(): SupabaseClient<any> | null {
  if (customDbClient) return customDbClient;

  if (typeof window === 'undefined') {
    try {
      const client = getServiceClient();
      const key = (client as any)?.supabaseKey;
      if (!key && !process.env.SUPABASE_SERVICE_ROLE_KEY && !(client as any)?._isMock) {
        return null;
      }
      if (key === 'dummy-admin-key' && !process.env.SUPABASE_SERVICE_ROLE_KEY) {
        return null;
      }
      return client;
    } catch {
      return null;
    }
  }

  return null;
}

export interface MockCorrectionsStore {
  readerCorrections: any[];
  stories: any[];
  corrections: any[];
}

export function createMockCorrectionsClient(options: {
  store?: MockCorrectionsStore;
  shouldFailInsert?: boolean;
  shouldThrow?: boolean;
} = {}): any {
  const store = options.store || {
    readerCorrections: [],
    stories: [
      { id: '11111111-1111-1111-1111-111111111111', slug: 'india-china-border-lac' },
      { id: '22222222-2222-2222-2222-222222222222', slug: 'kashmir-the-first-test' },
      { id: '33333333-3333-3333-3333-333333333333', slug: 'the-partition-and-its-legacies' },
      { id: '44444444-4444-4444-4444-444444444444', slug: 'electoral-bonds' },
      { id: '55555555-5555-5555-5555-555555555555', slug: 'mgnrega-reform' },
    ],
    corrections: [],
  };

  return {
    _isMock: true,
    _store: store,
    from: (table: string) => {
      let filterFn = (r: any) => true;
      let insertedPayload: any = null;
      let updatedPayload: any = null;
      let orderBy: string | null = null;
      let orderAscending = true;

      const builder: any = {
        select: (_cols?: string) => builder,
        eq: (col: string, val: any) => {
          const prev = filterFn;
          filterFn = (r: any) => prev(r) && r[col] === val;
          return builder;
        },
        order: (col: string, opts?: { ascending?: boolean }) => {
          orderBy = col;
          orderAscending = opts?.ascending ?? true;
          return builder;
        },
        insert: (payload: any) => {
          insertedPayload = payload;
          return builder;
        },
        update: (payload: any) => {
          updatedPayload = payload;
          return builder;
        },
        single: async () => {
          if (options.shouldThrow) {
            throw new Error('Database connection failed');
          }
          if (options.shouldFailInsert && insertedPayload) {
            return { data: null, error: { message: 'Database insert constraint violation' } };
          }
          if (table === 'reader_corrections' && insertedPayload) {
            const row = {
              ...insertedPayload,
              created_at: insertedPayload.created_at || new Date().toISOString(),
              updated_at: insertedPayload.updated_at || new Date().toISOString(),
            };
            store.readerCorrections.push(row);
            return { data: row, error: null };
          }
          if (table === 'stories') {
            const found = store.stories.find(filterFn);
            return { data: found || null, error: found ? null : { message: 'Story not found' } };
          }
          return { data: null, error: { message: 'Not found' } };
        },
        maybeSingle: async () => {
          if (options.shouldThrow) {
            throw new Error('Database connection failed');
          }
          if (table === 'stories') {
            const found = store.stories.find(filterFn);
            return { data: found || null, error: null };
          }
          if (table === 'reader_corrections') {
            const found = store.readerCorrections.find(filterFn);
            return { data: found || null, error: null };
          }
          return { data: null, error: null };
        },
        then: (resolve: any, reject: any) => {
          if (options.shouldThrow) {
            return Promise.reject(new Error('Database connection failed')).catch(reject);
          }
          if (table === 'reader_corrections') {
            if (updatedPayload) {
              for (const r of store.readerCorrections) {
                if (filterFn(r)) {
                  Object.assign(r, updatedPayload);
                }
              }
              return Promise.resolve({ data: null, error: null }).then(resolve);
            }
            const matching = store.readerCorrections.filter(filterFn);
            return Promise.resolve({ data: matching, error: null }).then(resolve);
          }
          if (table === 'corrections') {
            const matching = store.corrections
              .filter(filterFn)
              .map((row: any) => ({
                ...row,
                stories: store.stories.find((story: any) => story.id === row.story_id) || row.stories || null,
              }));
            if (orderBy) {
              matching.sort((a: any, b: any) => {
                const left = a[orderBy!];
                const right = b[orderBy!];
                const compare = String(left ?? '').localeCompare(String(right ?? ''));
                return orderAscending ? compare : -compare;
              });
            }
            return Promise.resolve({ data: matching, error: null }).then(resolve);
          }
          return Promise.resolve({ data: [], error: null }).then(resolve);
        },
      };

      return builder;
    },
    rpc: async (functionName: string, params: Record<string, any>) => {
      if (options.shouldThrow) {
        throw new Error('Database connection failed');
      }
      if (functionName !== 'publish_reader_correction') {
        return { data: null, error: { message: `Unknown mock RPC: ${functionName}` } };
      }
      if (options.shouldFailInsert) {
        return { data: null, error: { message: 'Database insert constraint violation' } };
      }

      const submission = store.readerCorrections.find((row: any) => row.id === params.p_reader_correction_id);
      if (!submission) {
        return { data: null, error: { message: 'Reader correction not found' } };
      }
      if (submission.resolved_correction_id) {
        const existing = store.corrections.find((row: any) => row.id === submission.resolved_correction_id);
        return existing
          ? { data: [{ ...existing, stories: store.stories.find((story: any) => story.id === existing.story_id) || null }], error: null }
          : { data: null, error: { message: 'Linked published correction is missing' } };
      }
      if (submission.status === 'rejected') {
        return { data: null, error: { message: 'Rejected submissions cannot be published' } };
      }

      const story = store.stories.find((row: any) =>
        row.id === submission.story_id || row.slug === submission.story_slug
      );
      if (!story) {
        return { data: null, error: { message: 'Canonical story not found' } };
      }

      const now = new Date().toISOString();
      const published = {
        id: params.p_published_correction_id,
        story_id: story.id,
        story_version_id: null,
        claim_id: params.p_claim_id || submission.claim_id || null,
        verification_event_id: null,
        category: params.p_category,
        previous_wording: params.p_previous_wording,
        corrected_wording: params.p_corrected_wording,
        explanation: params.p_explanation,
        superseded_by_id: null,
        created_at: now,
        updated_at: now,
      };
      // Mutate both rows only after validation, mirroring the SQL function transaction.
      store.corrections.push(published);
      Object.assign(submission, {
        story_id: story.id,
        claim_id: published.claim_id,
        status: 'resolved',
        resolved_correction_id: published.id,
        updated_at: now,
      });
      return { data: [{ ...published, stories: story }], error: null };
    },
  };
}

if (typeof process !== 'undefined' && process.env.NODE_ENV === 'test') {
  customDbClient = createMockCorrectionsClient();
}


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
  if (typeof process !== 'undefined' && process.env.NODE_ENV === 'test') {
    customDbClient = createMockCorrectionsClient();
  }
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

  // 3. Check database persistence availability
  const db = getCorrectionsDbClient();
  if (!db) {
    return {
      success: false,
      status: 'received',
      message: 'Correction storage service is currently unavailable. Please try again later.',
      receivedAt: now,
    };
  }

  // 4. Construct canonical reader correction object and resolve story foreign key
  const submissionId = randomUUID();
  let resolvedStoryId: string | null = null;

  if (input.storyId && isValidUuid(input.storyId)) {
    resolvedStoryId = input.storyId;
  } else {
    try {
      const { data: story } = await db
        .from('stories')
        .select('id')
        .eq('slug', input.storySlug.trim().toLowerCase())
        .maybeSingle();
      if (story?.id && isValidUuid(story.id)) {
        resolvedStoryId = story.id;
      }
    } catch {
      // Lookup failed or stories table unqueryable; continue with null
    }
  }

  const resolvedClaimId = input.claimId && isValidUuid(input.claimId) ? input.claimId : null;

  const dbInsertPayload = {
    id: submissionId,
    story_id: resolvedStoryId,
    story_slug: input.storySlug.trim().toLowerCase(),
    claim_id: resolvedClaimId,
    category: input.category || 'factual',
    passage_excerpt: input.passageExcerpt.trim(),
    suggested_correction: input.suggestedCorrection.trim(),
    submitter_email: input.submitterEmail?.trim() || null,
    supporting_evidence_url: input.supportingEvidenceUrl?.trim() || null,
    status: 'received' as const,
  };

  // 5. Durably persist to PostgreSQL / Supabase
  let insertedRow: any = null;
  try {
    const { data, error } = await db
      .from('reader_corrections')
      .insert(dbInsertPayload)
      .select()
      .single();

    if (error) {
      console.error('[CorrectionsService] Failed to persist reader correction:', {
        submissionId,
        error: error.message || error,
      });
      return {
        success: false,
        status: 'received',
        message: 'Failed to record correction due to a storage error. Please try again.',
        receivedAt: now,
      };
    }
    insertedRow = data;
  } catch (err: any) {
    console.error('[CorrectionsService] Database communication error during submission:', {
      submissionId,
      error: err?.message || err,
    });
    return {
      success: false,
      status: 'received',
      message: 'Failed to record correction due to a storage error. Please try again.',
      receivedAt: now,
    };
  }

  // 6. Record successfully stored submission
  const record: ReaderCorrection = {
    id: submissionId,
    storyId: input.storyId || resolvedStoryId || undefined,
    storySlug: input.storySlug.trim().toLowerCase(),
    claimId: input.claimId || resolvedClaimId || undefined,
    category: input.category || 'factual',
    passageExcerpt: input.passageExcerpt.trim(),
    suggestedCorrection: input.suggestedCorrection.trim(),
    submitterEmail: input.submitterEmail?.trim(),
    supportingEvidenceUrl: input.supportingEvidenceUrl?.trim(),
    status: 'received',
    createdAt: insertedRow?.created_at || now,
    updatedAt: insertedRow?.updated_at || now,
  };

  // Keep memory cache updated for same-process read operations
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
  const db = getCorrectionsDbClient();
  if (db) {
    try {
      const { data, error } = await db
        .from('reader_corrections')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (!error && data) {
        return rowToReaderCorrection(data);
      }
    } catch {
      // Fall through to memory
    }
  }
  return memoryReaderCorrections.get(id);
}

export async function listReaderCorrections(
  options: { status?: ReaderCorrection['status']; storySlug?: string } = {}
): Promise<ReaderCorrection[]> {
  const db = getCorrectionsDbClient();
  if (db) {
    try {
      let query = db.from('reader_corrections').select('*');
      if (options.status) {
        query = query.eq('status', options.status);
      }
      if (options.storySlug) {
        query = query.eq('story_slug', options.storySlug.toLowerCase());
      }
      const { data, error } = await query.order('created_at', { ascending: false });
      if (!error && data && Array.isArray(data)) {
        return data.map(rowToReaderCorrection);
      }
    } catch {
      // Fall through to memory
    }
  }

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

  const record = (await getReaderCorrectionById(input.correctionId)) || memoryReaderCorrections.get(input.correctionId);
  if (!record) {
    throw new Error(`Correction submission not found: ${input.correctionId}`);
  }

  const now = new Date().toISOString();
  const db = getCorrectionsDbClient();
  const isPublishing = input.status === 'resolved' && Boolean(input.publishedCorrection);

  if (!db && process.env.NODE_ENV === 'production') {
    throw new Error('Correction triage is unavailable: durable database storage is required.');
  }

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

  let publishedNotice: PublishedCorrection | undefined;
  if (isPublishing && input.publishedCorrection) {
    const publishedId = randomUUID();

    if (db) {
      let result: any;
      try {
        result = await db.rpc('publish_reader_correction', {
          p_reader_correction_id: input.correctionId,
          p_published_correction_id: publishedId,
          p_category: input.publishedCorrection.category || record.category,
          p_previous_wording: input.publishedCorrection.previousWording,
          p_corrected_wording: input.publishedCorrection.correctedWording,
          p_explanation: input.publishedCorrection.explanation,
          p_claim_id: handoffRecord?.claimId || record.claimId || null,
          p_triage_notes: input.triageNotes ?? null,
        });
      } catch (err: any) {
        throw new Error(`Failed to publish correction durably: ${err?.message || 'database communication error'}`);
      }

      const { data, error } = result || {};
      const publishedRow = Array.isArray(data) ? data[0] : data;
      if (error || !publishedRow?.id || !publishedRow?.story_id) {
        throw new Error(`Failed to publish correction durably: ${error?.message || 'database returned no correction record'}`);
      }

      const mapped = rowToPublishedCorrection(publishedRow);
      publishedNotice = {
        ...mapped,
        storyId: publishedRow.story_id,
        storySlug: mapped.storySlug || record.storySlug,
      };
      record.storyId = publishedRow.story_id;
    } else {
      // Explicit non-production fallback for isolated local/dev execution only.
      publishedNotice = {
        id: publishedId,
        storyId: record.storyId || record.storySlug,
        storySlug: record.storySlug,
        claimId: handoffRecord?.claimId || record.claimId,
        category: input.publishedCorrection.category || record.category,
        previousWording: input.publishedCorrection.previousWording,
        correctedWording: input.publishedCorrection.correctedWording,
        explanation: input.publishedCorrection.explanation,
        createdAt: now,
        updatedAt: now,
      };
    }
  } else if (db) {
    const triageUpdate: Record<string, string> = {
      status: input.status,
      updated_at: now,
    };
    if (input.triageNotes !== undefined) {
      triageUpdate.triage_notes = input.triageNotes;
    }

    const { error } = await db
      .from('reader_corrections')
      .update(triageUpdate)
      .eq('id', input.correctionId);

    if (error) {
      throw new Error(`Failed to persist reader correction triage status: ${error.message || 'database update failed'}`);
    }
  }

  // Remember existing linkage to suppress duplicate publication events on idempotent retries.
  const previousResolvedCorrectionId = record.resolvedCorrectionId;

  // Update in-process caches only after the durable mutation succeeds.
  record.status = input.status;
  record.updatedAt = now;
  if (input.triageNotes) {
    record.triageNotes = input.triageNotes;
  }
  if (publishedNotice) {
    memoryPublishedCorrections.set(publishedNotice.id, publishedNotice);
    record.resolvedCorrectionId = publishedNotice.id;
  }

  if (publishedNotice && previousResolvedCorrectionId !== publishedNotice.id) {
    try {
      eventBus.publish({
        type: 'correction:published',
        payload: {
          publishedId: publishedNotice.id,
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
  const db = getCorrectionsDbClient();

  if (db) {
    let result: any;
    try {
      result = await db
        .from('corrections')
        .select('*, stories(slug, title)')
        .order('created_at', { ascending: false });
    } catch (err: any) {
      throw new Error(`Public corrections ledger query failed: ${err?.message || 'database communication error'}`);
    }

    const { data, error } = result || {};
    if (error || !Array.isArray(data)) {
      throw new Error(`Public corrections ledger query failed: ${error?.message || 'database returned an invalid result'}`);
    }

    let list = data.map(rowToPublishedCorrection);
    if (storySlugOrId) {
      list = list.filter(
        correction => correction.storySlug === storySlugOrId || correction.storyId === storySlugOrId
      );
    }
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  // Next.js statically prerenders routes during "next build". The CI workflow
  // explicitly sets NEXT_PUBLIC_BREAKDOWN_CI_STATIC_BUILD for this build only and uses the
  // in-memory provider without production database credentials. In that one
  // fixture context, emit known seed notices so CI can test prerendering. The
  // marker is not configured in deployed environments, so runtime still fails closed.
  const isMemoryOnlyProductionBuild =
    process.env.NODE_ENV === 'production' &&
    process.env.NEXT_PUBLIC_BREAKDOWN_CI_STATIC_BUILD === 'true' &&
    process.env.DATA_PROVIDER === 'memory';

  if (process.env.NODE_ENV === 'production' && !isMemoryOnlyProductionBuild) {
    throw new Error('Public corrections ledger is unavailable: durable database storage is required.');
  }

  // Memory seed data is a development fallback or a build-only CI fixture.
  // Deployed production requests always require the durable database ledger.
  let list = Array.from(memoryPublishedCorrections.values());
  if (storySlugOrId) {
    list = list.filter(
      correction => correction.storySlug === storySlugOrId || correction.storyId === storySlugOrId
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
  const db = getCorrectionsDbClient();
  if (db) {
    try {
      const { data: readerData, error: readerError } = await db
        .from('reader_corrections')
        .select('status, created_at');
      if (readerError || !Array.isArray(readerData)) {
        throw new Error(readerError?.message || 'Reader correction query returned an invalid result');
      }

      const { data: correctionsData, error: correctionsError } = await db
        .from('corrections')
        .select('id');
      if (correctionsError || !Array.isArray(correctionsData)) {
        throw new Error(correctionsError?.message || 'Published correction query returned an invalid result');
      }

      const pending = readerData.filter((row: any) => row.status === 'received').length;
      const inReview = readerData.filter((row: any) => row.status === 'in_review').length;
      const lastSubmission = readerData.length > 0
        ? readerData.reduce((latest: string, row: any) => (row.created_at > latest ? row.created_at : latest), readerData[0].created_at)
        : 'UNKNOWN';

      return {
        pendingQueueDepth: pending,
        inReviewCount: inReview,
        publishedErrataCount: correctionsData.length,
        lastSubmissionAt: lastSubmission,
      };
    } catch (err: any) {
      if (process.env.NODE_ENV === 'production') {
        throw new Error(`Correction health metrics query failed: ${err?.message || 'database communication error'}`);
      }
      // Local tests/development may fall back when the mock or database is unavailable.
    }
  } else if (process.env.NODE_ENV === 'production') {
    throw new Error('Correction health metrics are unavailable: durable database storage is required.');
  }

  const all = Array.from(memoryReaderCorrections.values());
  const pending = all.filter(r => r.status === 'received').length;
  const inReview = all.filter(r => r.status === 'in_review').length;
  const lastSubmission = all.length > 0
    ? all.reduce((latest, r) => (r.createdAt > latest ? r.createdAt : latest), all[0].createdAt)
    : 'UNKNOWN';

  return {
    pendingQueueDepth: pending,
    inReviewCount: inReview,
    publishedErrataCount: memoryPublishedCorrections.size,
    lastSubmissionAt: lastSubmission,
  };
}
