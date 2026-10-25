/**
 * ─── The Breakdown OS — Corrections & Errata Service ────────────────────────
 * Governing Document: Editorial Constitution v1.1 (Article XIII) & Migration 013
 *
 * Implements the Reader Corrections intake pipeline, rate-limiting gate,
 * staff triage workflow, and public errata publishing projection.
 */

import { randomUUID } from 'crypto';
import { revalidatePath } from 'next/cache';
import { eventBus } from '@/lib/events/event-bus';
import { getAnonClient, getServiceClient } from '@/supabase/client';
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

function rowToReaderCorrection(row: any): ReaderCorrection {
  const mem = memoryReaderCorrections.get(row.id);
  return {
    id: row.id,
    // Database identity wins over cached values; do not surface a legacy slug
    // or non-UUID fixture as a foreign key on a durable correction record.
    storyId: row.story_id || (isValidUuid(mem?.storyId) ? mem?.storyId : undefined),
    storySlug: row.story_slug,
    claimId: row.claim_id || (isValidUuid(mem?.claimId) ? mem?.claimId : undefined),
    category: row.category as CorrectionCategory,
    passageExcerpt: row.passage_excerpt,
    suggestedCorrection: row.suggested_correction,
    submitterEmail: row.submitter_email || undefined,
    supportingEvidenceUrl: row.supporting_evidence_url || undefined,
    status: row.status,
    triageNotes: row.triage_notes ?? mem?.triageNotes,
    resolvedCorrectionId: row.resolved_correction_id ?? mem?.resolvedCorrectionId,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function rowToPublishedCorrection(
  row: any,
  fallback: Partial<PublishedCorrection> = {},
): PublishedCorrection {
  const relatedStory = Array.isArray(row.stories) ? row.stories[0] : row.stories;
  return {
    id: row.id,
    storyId: row.story_id || fallback.storyId || '',
    storyTitle: relatedStory?.title || row.story_title || fallback.storyTitle,
    storySlug: relatedStory?.slug || row.story_slug || fallback.storySlug,
    storyVersionId: row.story_version_id || undefined,
    claimId: row.claim_id || undefined,
    verificationEventId: row.verification_event_id || undefined,
    category: row.category as CorrectionCategory,
    previousWording: row.previous_wording || '',
    correctedWording: row.corrected_wording || '',
    explanation: row.explanation,
    supersededById: row.superseded_by_id || undefined,
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

/**
 * Public ledger reads must use the public/anon role, not require a
 * service-role credential. Migration 013 explicitly grants anon SELECT on
 * public.corrections. Private submissions and triage continue to use the
 * privileged client through getCorrectionsDbClient().
 */
function getPublicCorrectionsReadClient(): SupabaseClient<any> | null {
  // Preserve the injected client used by deterministic tests and offline mocks.
  if (customDbClient) return customDbClient;

  // Outside production, preserve the explicit in-memory fixture fallback.
  if (process.env.NODE_ENV !== 'production' || typeof window !== 'undefined') {
    return null;
  }

  try {
    return getAnonClient() as unknown as SupabaseClient<any>;
  } catch {
    return null;
  }
}

export interface MockCorrectionsStore {
  readerCorrections: any[];
  stories: any[];
  corrections: any[];
}

export function createMockCorrectionsClient(options: {
  store?: MockCorrectionsStore;
  shouldFailInsert?: boolean;
  shouldFailPublish?: boolean;
  shouldThrow?: boolean;
} = {}): any {
  const store = options.store || {
    readerCorrections: [],
    stories: [
      { id: '11111111-1111-1111-1111-111111111111', slug: 'india-china-border-lac', title: 'India–China Border LAC' },
      { id: '22222222-2222-2222-2222-222222222222', slug: 'kashmir-the-first-test', title: 'Kashmir: The First Test' },
      { id: '33333333-3333-3333-3333-333333333333', slug: 'the-partition-and-its-legacies', title: 'The Partition and Its Legacies' },
      { id: '44444444-4444-4444-4444-444444444444', slug: 'electoral-bonds', title: 'The Electoral Bond Ledger' },
      { id: '55555555-5555-5555-5555-555555555555', slug: 'mgnrega-reform', title: 'Reforming MGNREGA' },
    ],
    corrections: [],
  };

  return {
    _isMock: true,
    _store: store,
    rpc: async (functionName: string, args: Record<string, any>) => {
      if (options.shouldThrow) {
        throw new Error('Database connection failed');
      }
      if (functionName !== 'publish_reader_correction') {
        return { data: null, error: { message: `Unknown RPC: ${functionName}` } };
      }
      if (options.shouldFailPublish) {
        return { data: null, error: { message: 'Correction publication transaction failed' } };
      }

      const submissionId = args.p_reader_correction_id;
      const reader = store.readerCorrections.find((r: any) => r.id === submissionId);
      if (!reader) {
        return { data: null, error: { message: 'Reader correction not found' } };
      }

      if (reader.resolved_correction_id) {
        const existing = store.corrections.find((c: any) => c.id === reader.resolved_correction_id);
        return existing
          ? { data: [existing], error: null }
          : { data: null, error: { message: 'Resolved correction reference is inconsistent' } };
      }

      if (reader.status === 'rejected') {
        return { data: null, error: { message: 'A rejected reader correction cannot be published' } };
      }

      if (store.corrections.some((c: any) => c.id === submissionId)) {
        return { data: null, error: { message: 'Correction id exists without submission linkage' } };
      }

      const story = reader.story_id
        ? store.stories.find((s: any) => s.id === reader.story_id)
        : store.stories.find((s: any) => s.slug === reader.story_slug);
      if (!story?.id) {
        return { data: null, error: { message: 'Reader correction does not resolve to a canonical story' } };
      }
      if (!args.p_category || !['factual', 'source', 'interpretive', 'clarification', 'context_update', 'retraction'].includes(args.p_category)) {
        return { data: null, error: { message: 'Invalid correction category' } };
      }
      if (typeof args.p_corrected_wording !== 'string' || !args.p_corrected_wording.trim()) {
        return { data: null, error: { message: 'Corrected wording is required' } };
      }
      if (typeof args.p_explanation !== 'string' || !args.p_explanation.trim()) {
        return { data: null, error: { message: 'Correction explanation is required' } };
      }

      const now = new Date().toISOString();
      const notice = {
        id: submissionId,
        story_id: story.id,
        story_slug: story.slug,
        story_title: story.title,
        story_version_id: null,
        claim_id: reader.claim_id || null,
        verification_event_id: null,
        category: args.p_category,
        previous_wording: args.p_previous_wording || '',
        corrected_wording: args.p_corrected_wording.trim(),
        explanation: args.p_explanation.trim(),
        superseded_by_id: null,
        created_at: now,
        updated_at: now,
        stories: { slug: story.slug, title: story.title },
      };

      // Model the database transaction: only mutate either table after every
      // validation gate has passed and the public notice can be committed.
      store.corrections.push(notice);
      reader.status = 'resolved';
      reader.triage_notes = args.p_triage_notes || reader.triage_notes || null;
      reader.resolved_correction_id = notice.id;
      reader.updated_at = now;
      return { data: [notice], error: null };
    },
    from: (table: string) => {
      let filterFn = (r: any) => true;
      let insertedPayload: any = null;
      let updatedPayload: any = null;
      let orderColumn: string | null = null;
      let orderAscending = true;

      const decorateCorrection = (row: any) => {
        const story = row.stories || store.stories.find((s: any) => s.id === row.story_id);
        return {
          ...row,
          stories: story ? { slug: story.slug, title: story.title } : null,
        };
      };

      const getRows = () => {
        const source = table === 'reader_corrections'
          ? store.readerCorrections
          : table === 'corrections'
          ? store.corrections
          : table === 'stories'
          ? store.stories
          : [];
        let rows = source.filter(filterFn);
        if (table === 'corrections') rows = rows.map(decorateCorrection);
        if (orderColumn) {
          rows = [...rows].sort((a: any, b: any) => {
            const left = a[orderColumn!];
            const right = b[orderColumn!];
            const cmp = String(left ?? '').localeCompare(String(right ?? ''));
            return orderAscending ? cmp : -cmp;
          });
        }
        return rows;
      };

      const builder: any = {
        select: (_cols?: string) => builder,
        eq: (col: string, val: any) => {
          const prev = filterFn;
          filterFn = (r: any) => prev(r) && r[col] === val;
          return builder;
        },
        order: (col: string, opts?: { ascending?: boolean }) => {
          orderColumn = col;
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
            const now = new Date().toISOString();
            const row = {
              ...insertedPayload,
              created_at: insertedPayload.created_at || now,
              updated_at: insertedPayload.updated_at || now,
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
          const found = getRows()[0];
          return { data: found || null, error: null };
        },
        then: (resolve: any, reject: any) => {
          if (options.shouldThrow) {
            return Promise.reject(new Error('Database connection failed')).catch(reject);
          }
          if (updatedPayload && table === 'reader_corrections') {
            const matching = getRows();
            for (const row of matching) Object.assign(row, updatedPayload);
            return Promise.resolve({ data: matching, error: null }).then(resolve);
          }
          return Promise.resolve({ data: getRows(), error: null }).then(resolve);
        },
      };

      return builder;
    },
  };
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

/**
 * Test-only fixture adapter. In production, public corrections come only from
 * public.corrections. These seed examples are not silently treated as durable
 * production records.
 */
function createDefaultCorrectionsMock(includeInitialPublished: boolean = true): any {
  const client = createMockCorrectionsClient();
  if (includeInitialPublished) {
    for (const correction of INITIAL_PUBLISHED_CORRECTIONS) {
      client._store.corrections.push({
        id: correction.id,
        story_id: correction.storyId,
        story_slug: correction.storySlug,
        story_title: correction.storyTitle,
        story_version_id: correction.storyVersionId || null,
        claim_id: correction.claimId || null,
        verification_event_id: correction.verificationEventId || null,
        category: correction.category,
        previous_wording: correction.previousWording,
        corrected_wording: correction.correctedWording,
        explanation: correction.explanation,
        superseded_by_id: correction.supersededById || null,
        created_at: correction.createdAt,
        updated_at: correction.updatedAt,
        stories: correction.storySlug
          ? { slug: correction.storySlug, title: correction.storyTitle }
          : null,
      });
    }
  }
  return client;
}

if (typeof process !== 'undefined' && process.env.NODE_ENV === 'test') {
  customDbClient = createDefaultCorrectionsMock(true);
}

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
    customDbClient = createDefaultCorrectionsMock(includeInitialPublished);
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
    storyId: resolvedStoryId || undefined,
    storySlug: input.storySlug.trim().toLowerCase(),
    claimId: resolvedClaimId || undefined,
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
    const { data, error } = await db
      .from('reader_corrections')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      console.error('[CorrectionsService] Failed to read reader correction from durable storage:', error.message);
      throw new Error('Reader correction storage is unavailable.');
    }
    return data ? rowToReaderCorrection(data) : undefined;
  }

  if (process.env.NODE_ENV === 'production') {
    throw new Error('Reader correction storage is not configured.');
  }
  return memoryReaderCorrections.get(id);
}

export async function listReaderCorrections(
  options: { status?: ReaderCorrection['status']; storySlug?: string } = {}
): Promise<ReaderCorrection[]> {
  const db = getCorrectionsDbClient();
  if (db) {
    let query = db.from('reader_corrections').select('*');
    if (options.status) {
      query = query.eq('status', options.status);
    }
    if (options.storySlug) {
      query = query.eq('story_slug', options.storySlug.toLowerCase());
    }
    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) {
      console.error('[CorrectionsService] Failed to list reader corrections from durable storage:', error.message);
      throw new Error('Reader correction storage is unavailable.');
    }
    return Array.isArray(data) ? data.map(rowToReaderCorrection) : [];
  }

  if (process.env.NODE_ENV === 'production') {
    throw new Error('Reader correction storage is not configured.');
  }

  let list = Array.from(memoryReaderCorrections.values());
  if (options.status) list = list.filter((r) => r.status === options.status);
  if (options.storySlug) {
    const targetSlug = options.storySlug.toLowerCase();
    list = list.filter((r) => r.storySlug === targetSlug);
  }

  return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function triageReaderCorrection(
  input: TriageCorrectionInput,
  staffContext: StaffContext
): Promise<{ success: boolean; updatedStatus: string; handoffRecord?: VerificationHandoffRecord }> {
  if (!AUTHORIZED_STAFF_ROLES.has(staffContext.role)) {
    throw new Error(`Unauthorized: User role '${staffContext.role}' cannot triage reader corrections.`);
  }

  const db = getCorrectionsDbClient();
  if (!db && process.env.NODE_ENV === 'production') {
    throw new Error('Correction triage requires durable storage.');
  }

  const record = await getReaderCorrectionById(input.correctionId);
  if (!record) {
    throw new Error(`Correction submission not found: ${input.correctionId}`);
  }
  // Keep the cache aligned with the durable row before the optional in-memory
  // verification handoff uses it.
  memoryReaderCorrections.set(record.id, record);

  // This handoff is currently an in-memory workflow record, not a durable
  // verification event. It is deliberately not misrepresented as a foreign
  // key in public.corrections.
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

  const now = new Date().toISOString();
  const shouldPublish = input.status === 'resolved' && Boolean(input.publishedCorrection);
  let publishedNotice: PublishedCorrection | undefined;

  if (shouldPublish) {
    if (!db || !input.publishedCorrection) {
      throw new Error('Publishing a correction requires durable storage.');
    }

    const { data, error } = await db.rpc('publish_reader_correction', {
      p_reader_correction_id: record.id,
      p_triage_notes: input.triageNotes?.trim() || null,
      p_category: input.publishedCorrection.category || record.category,
      p_previous_wording: input.publishedCorrection.previousWording ?? '',
      p_corrected_wording: input.publishedCorrection.correctedWording,
      p_explanation: input.publishedCorrection.explanation,
    });

    if (error) {
      console.error('[CorrectionsService] Durable correction publication failed:', {
        correctionId: record.id,
        error: error.message || error,
      });
      // The RPC is transactional. Do not mark the submission resolved, add a
      // process-local public notice, or emit a success event after a failed write.
      throw new Error('Failed to publish correction to the durable ledger. The submission was not resolved.');
    }

    const publishedRow = Array.isArray(data) ? data[0] : data;
    if (!publishedRow) {
      throw new Error('Durable correction publication returned no record.');
    }

    publishedNotice = rowToPublishedCorrection(publishedRow, {
      storySlug: record.storySlug,
    });
    record.status = 'resolved';
    record.updatedAt = publishedNotice.updatedAt || now;
    if (input.triageNotes) record.triageNotes = input.triageNotes;
    record.resolvedCorrectionId = publishedNotice.id;
    memoryReaderCorrections.set(record.id, record);

    // Same-process cache only. Public reads use public.corrections when a DB
    // client is configured and never rely on this Map as production truth.
    memoryPublishedCorrections.set(publishedNotice.id, publishedNotice);

    // Public pages use ISR. Revalidate the durable ledger and corrected story
    // after the committed write so readers do not wait for a stale cache window.
    try {
      revalidatePath('/transparency/corrections');
      revalidatePath(`/story/${record.storySlug}`);
    } catch (err) {
      console.error('[CorrectionsService] Durable correction saved but cache revalidation failed:', err);
    }

    try {
      eventBus.publish({
        type: 'correction:published',
        payload: {
          publishedId: publishedNotice.id,
          storySlug: publishedNotice.storySlug || record.storySlug,
          category: publishedNotice.category,
        },
      });
    } catch (err) {
      console.error('[CorrectionsService] Failed to publish correction:published event:', err);
    }
  } else {
    if (db) {
      const { error } = await db
        .from('reader_corrections')
        .update({
          status: input.status,
          triage_notes: input.triageNotes?.trim() || record.triageNotes || null,
          updated_at: now,
        })
        .eq('id', record.id);

      if (error) {
        console.error('[CorrectionsService] Failed to persist triage state:', {
          correctionId: record.id,
          error: error.message || error,
        });
        throw new Error('Failed to save correction triage state.');
      }
    }

    record.status = input.status;
    record.updatedAt = now;
    if (input.triageNotes) record.triageNotes = input.triageNotes;
    memoryReaderCorrections.set(record.id, record);
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

  const record = (await getReaderCorrectionById(input.correctionId)) || memoryReaderCorrections.get(input.correctionId);
  if (!record) {
    throw new Error(`Correction submission not found: ${input.correctionId}`);
  }
  memoryReaderCorrections.set(record.id, record);

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
  const db = getPublicCorrectionsReadClient();
  if (db) {
    const { data, error } = await db
      .from('corrections')
      .select('*, stories(slug,title)')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[CorrectionsService] Failed to read durable public corrections ledger:', error.message);
      // Do not fall back to an in-memory copy and misrepresent it as the
      // institutional ledger when the configured source of truth is failing.
      throw new Error('Durable public corrections ledger is unavailable.');
    }

    let list = Array.isArray(data) ? data.map((row: any) => rowToPublishedCorrection(row)) : [];
    if (storySlugOrId) {
      list = list.filter((correction) =>
        correction.storySlug === storySlugOrId || correction.storyId === storySlugOrId,
      );
    }
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  if (process.env.NODE_ENV === 'production') {
    throw new Error('Durable public corrections ledger storage is not configured.');
  }

  // Explicit offline/test fallback only. This map is never used as production
  // evidence that the correction ledger has been durably published.
  let list = Array.from(memoryPublishedCorrections.values());
  if (storySlugOrId) {
    list = list.filter(
      (correction) => correction.storySlug === storySlugOrId || correction.storyId === storySlugOrId,
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
    const [queueResult, publishedResult] = await Promise.all([
      db.from('reader_corrections').select('status, created_at'),
      db.from('corrections').select('id'),
    ]);

    if (queueResult.error || publishedResult.error) {
      console.error('[CorrectionsService] Failed to calculate durable correction metrics:', {
        queueError: queueResult.error?.message,
        publishedError: publishedResult.error?.message,
      });
      throw new Error('Correction health metrics are unavailable.');
    }

    const queue = Array.isArray(queueResult.data) ? queueResult.data : [];
    const published = Array.isArray(publishedResult.data) ? publishedResult.data : [];
    const lastSubmission = queue.length > 0
      ? queue.reduce((latest: string, row: any) => (row.created_at > latest ? row.created_at : latest), queue[0].created_at)
      : 'UNKNOWN';

    return {
      pendingQueueDepth: queue.filter((row: any) => row.status === 'received').length,
      inReviewCount: queue.filter((row: any) => row.status === 'in_review').length,
      publishedErrataCount: published.length,
      lastSubmissionAt: lastSubmission,
    };
  }

  if (process.env.NODE_ENV === 'production') {
    throw new Error('Correction health metrics require durable storage.');
  }

  const all = Array.from(memoryReaderCorrections.values());
  const lastSubmission = all.length > 0
    ? all.reduce((latest, record) => (record.createdAt > latest ? record.createdAt : latest), all[0].createdAt)
    : 'UNKNOWN';

  return {
    pendingQueueDepth: all.filter((record) => record.status === 'received').length,
    inReviewCount: all.filter((record) => record.status === 'in_review').length,
    publishedErrataCount: memoryPublishedCorrections.size,
    lastSubmissionAt: lastSubmission,
  };
}

