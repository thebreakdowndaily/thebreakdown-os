/**
 * ─── The Breakdown OS — Reader Corrections Durable Persistence Test Suite ───
 * Phase 3 Forensic Verification Suite
 *
 * Verifies that:
 * 1. Valid submissions are durably persisted to PostgreSQL before HTTP 201 is returned.
 * 2. Persistence failures fail closed and never return HTTP 201 false success.
 * 3. Database unavailability fails honestly (HTTP 503 / 500) and never reports false success.
 * 4. Validation errors are rejected prior to persistence.
 * 5. Rate limiting protects the intake endpoint before persistence.
 * 6. Access control preserves private submission isolation from public eyes.
 * 7. Submissions persist across instances connected to the same store.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { NextRequest } from 'next/server';
import { POST } from '@/app/api/corrections/submit/route';
import {
  submitReaderCorrection,
  getReaderCorrectionById,
  listReaderCorrections,
  triageReaderCorrection,
  listPublishedCorrections,
  setCorrectionsDbClient,
  createMockCorrectionsClient,
  resetCorrectionsMemoryStore,
  type MockCorrectionsStore,
} from '@/services/editorial/corrections-service';
import type { ReaderCorrectionSubmissionInput } from '@/types/corrections';

describe('Reader Corrections Durable Persistence (Phase 3 Audit)', () => {
  let mockStore: MockCorrectionsStore;
  const originalServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  beforeEach(() => {
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
    mockStore = {
      readerCorrections: [],
      stories: [
        { id: '11111111-1111-1111-1111-111111111111', slug: 'india-china-border-lac' },
        { id: '22222222-2222-2222-2222-222222222222', slug: 'kashmir-the-first-test' },
      ],
      corrections: [],
    };
    resetCorrectionsMemoryStore(false);
    setCorrectionsDbClient(createMockCorrectionsClient({ store: mockStore }));
  });

  afterEach(() => {
    if (originalServiceKey) {
      process.env.SUPABASE_SERVICE_ROLE_KEY = originalServiceKey;
    } else {
      delete process.env.SUPABASE_SERVICE_ROLE_KEY;
    }
    setCorrectionsDbClient(null);
    resetCorrectionsMemoryStore(true);
  });

  const createRequest = (body: Record<string, unknown>, ip: string = '192.168.1.1'): NextRequest => {
    const headers = new Headers();
    headers.set('content-type', 'application/json');
    headers.set('x-forwarded-for', ip);

    return new NextRequest('http://localhost:3000/api/corrections/submit', {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });
  };

  it('1. Valid submission: successfully and durably inserts into database and returns HTTP 201', async () => {
    const payload: ReaderCorrectionSubmissionInput = {
      storySlug: 'india-china-border-lac',
      passageExcerpt: 'Line of Actual Control demarcated permanently in 1960.',
      suggestedCorrection: 'The LAC remains undemarcated across multiple disputed sectors.',
      submitterEmail: 'reader@example.com',
      supportingEvidenceUrl: 'https://treaties.un.org/example',
    };

    const req = createRequest(payload, '10.0.0.1');
    const res = await POST(req);

    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.submissionId).toBeDefined();
    expect(body.status).toBe('received');
    expect(body.message).toContain('Correction report successfully received');

    // Verify durable storage was updated in PostgreSQL store
    expect(mockStore.readerCorrections.length).toBe(1);
    const persisted = mockStore.readerCorrections[0];
    expect(persisted.id).toBe(body.submissionId);
    expect(persisted.story_slug).toBe('india-china-border-lac');
    expect(persisted.story_id).toBe('11111111-1111-1111-1111-111111111111');
    expect(persisted.passage_excerpt).toBe(payload.passageExcerpt);
    expect(persisted.suggested_correction).toBe(payload.suggestedCorrection);
    expect(persisted.submitter_email).toBe('reader@example.com');
    expect(persisted.status).toBe('received');

    // Never leak submitter email in response
    expect(body.submitterEmail).toBeUndefined();
    expect(body.submitter_email).toBeUndefined();
  });

  it('2. Persistence failure: returns non-201 and never reports false success', async () => {
    // Configure database to reject insert with a storage error
    setCorrectionsDbClient(
      createMockCorrectionsClient({
        store: mockStore,
        shouldFailInsert: true,
      })
    );

    const payload: ReaderCorrectionSubmissionInput = {
      storySlug: 'india-china-border-lac',
      passageExcerpt: 'Line of Actual Control demarcated permanently in 1960.',
      suggestedCorrection: 'The LAC remains undemarcated across multiple disputed sectors.',
    };

    const req = createRequest(payload, '10.0.0.2');
    const res = await POST(req);

    // Must NOT be 201
    expect(res.status).not.toBe(201);
    expect(res.status).toBe(500);

    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.message).toContain('storage error');
    expect(mockStore.readerCorrections.length).toBe(0);
  });

  it('3. Database unavailable: fails honestly with HTTP 503 without reporting false success', async () => {
    // Disconnect database client completely with no credentials
    setCorrectionsDbClient(null);

    const payload: ReaderCorrectionSubmissionInput = {
      storySlug: 'india-china-border-lac',
      passageExcerpt: 'Line of Actual Control demarcated permanently in 1960.',
      suggestedCorrection: 'The LAC remains undemarcated across multiple disputed sectors.',
    };

    const req = createRequest(payload, '10.0.0.3');
    const res = await POST(req);

    // Must NOT be 201
    expect(res.status).not.toBe(201);
    expect(res.status).toBe(503);

    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.message).toContain('currently unavailable');
    expect(mockStore.readerCorrections.length).toBe(0);
  });

  it('4. Validation failure: rejects invalid payloads with HTTP 400 without persisting', async () => {
    const invalidPayload = {
      storySlug: 'invalid slug with spaces!',
      passageExcerpt: 'Tiny', // < 5 characters
      suggestedCorrection: '', // Empty
    };

    const req = createRequest(invalidPayload, '10.0.0.4');
    const res = await POST(req);

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.errors).toBeDefined();
    expect(mockStore.readerCorrections.length).toBe(0);
  });

  it('5. Rate limiting: blocks requests exceeding limit with HTTP 429 without persisting', async () => {
    const testIp = '10.99.88.77';
    const payload: ReaderCorrectionSubmissionInput = {
      storySlug: 'india-china-border-lac',
      passageExcerpt: 'Excerpt text for rate limiting verification.',
      suggestedCorrection: 'Suggested correction text for rate limiting.',
    };

    // First 5 requests succeed
    for (let i = 0; i < 5; i++) {
      const req = createRequest(payload, testIp);
      const res = await POST(req);
      expect(res.status).toBe(201);
    }
    expect(mockStore.readerCorrections.length).toBe(5);

    // 6th request from same IP is blocked
    const blockedReq = createRequest(payload, testIp);
    const blockedRes = await POST(blockedReq);
    expect(blockedRes.status).toBe(429);
    const body = await blockedRes.json();
    expect(body.success).toBe(false);

    // 6th submission was NOT persisted to database
    expect(mockStore.readerCorrections.length).toBe(5);
  });

  it('6. Access control: submitted corrections remain strictly private and cannot be read by public errata queries', async () => {
    const payload: ReaderCorrectionSubmissionInput = {
      storySlug: 'kashmir-the-first-test',
      passageExcerpt: 'Private submitter excerpt passage.',
      suggestedCorrection: 'Private submitter suggested correction text.',
      submitterEmail: 'whistleblower@archives.org',
    };

    const req = createRequest(payload, '10.0.0.6');
    const res = await POST(req);
    expect(res.status).toBe(201);

    // Public errata list MUST NOT contain the private submission
    const publicList = await listPublishedCorrections('kashmir-the-first-test');
    expect(publicList.length).toBe(0);

    // Unauthorized staff roles cannot triage reader submissions
    const submissionId = (await res.json()).submissionId;
    await expect(
      triageReaderCorrection(
        {
          correctionId: submissionId,
          status: 'in_review',
        },
        { userId: 'reader-user', role: 'reader' }
      )
    ).rejects.toThrow(/Unauthorized/);
  });

  it('7. Persistence across instances: corrections written through one service instance are retrievable by a separate instance', async () => {
    const sharedStore: MockCorrectionsStore = {
      readerCorrections: [],
      stories: [{ id: '11111111-1111-1111-1111-111111111111', slug: 'india-china-border-lac' }],
      corrections: [],
    };

    // Instance A
    const clientA = createMockCorrectionsClient({ store: sharedStore });
    setCorrectionsDbClient(clientA);

    const submissionResult = await submitReaderCorrection({
      storySlug: 'india-china-border-lac',
      passageExcerpt: 'Passage submitted by instance A.',
      suggestedCorrection: 'Correction submitted by instance A.',
      submitterEmail: 'instance-a@example.com',
    });
    expect(submissionResult.success).toBe(true);
    const submissionId = submissionResult.submissionId!;

    // Instance B (separate client instance connecting to the same shared store)
    const clientB = createMockCorrectionsClient({ store: sharedStore });
    setCorrectionsDbClient(clientB);

    // Clear local in-memory Map to simulate cold-start in instance B
    resetCorrectionsMemoryStore(false);
    // Keep instance B connected to the shared database
    setCorrectionsDbClient(clientB);

    // Instance B retrieves by ID from durable database
    const retrieved = await getReaderCorrectionById(submissionId);
    expect(retrieved).toBeDefined();
    expect(retrieved?.id).toBe(submissionId);
    expect(retrieved?.storySlug).toBe('india-china-border-lac');
    expect(retrieved?.passageExcerpt).toBe('Passage submitted by instance A.');

    // Instance B lists by status from durable database
    const allReceived = await listReaderCorrections({ status: 'received' });
    expect(allReceived.length).toBe(1);
    expect(allReceived[0].id).toBe(submissionId);
  });
  it('8. Resolved correction is written to the canonical ledger and survives a cold-start reset', async () => {
    const submission = await submitReaderCorrection({
      storySlug: 'india-china-border-lac',
      passageExcerpt: 'The report states the border agreement was signed in 1962.',
      suggestedCorrection: 'The agreement date requires primary-document verification.',
      category: 'factual',
    });
    expect(submission.success).toBe(true);
    const sharedClient = createMockCorrectionsClient({ store: mockStore });
    setCorrectionsDbClient(sharedClient);

    const triaged = await triageReaderCorrection({
      correctionId: submission.submissionId!,
      status: 'resolved',
      publishedCorrection: {
        category: 'factual',
        previousWording: 'The agreement was signed in 1962.',
        correctedWording: 'The agreement date is under correction.',
        explanation: 'The earlier date could not be substantiated by the cited primary record.',
      },
    }, { userId: 'editor-1', role: 'editor' });

    expect(triaged.success).toBe(true);
    expect(mockStore.corrections).toHaveLength(1);
    expect(mockStore.corrections[0].story_id).toBe('11111111-1111-1111-1111-111111111111');
    expect(mockStore.readerCorrections[0].status).toBe('resolved');

    resetCorrectionsMemoryStore(false);
    setCorrectionsDbClient(sharedClient);
    const publicRows = await listPublishedCorrections('india-china-border-lac');
    expect(publicRows).toHaveLength(1);
    expect(publicRows[0].storySlug).toBe('india-china-border-lac');
    expect(publicRows[0].correctedWording).toBe('The agreement date is under correction.');
  });

  it('9. Failed public correction persistence never marks the private submission resolved', async () => {
    const submission = await submitReaderCorrection({
      storySlug: 'india-china-border-lac',
      passageExcerpt: 'The report states the border agreement was signed in 1962.',
      suggestedCorrection: 'The agreement date requires primary-document verification.',
      category: 'factual',
    });
    expect(submission.success).toBe(true);
    setCorrectionsDbClient(createMockCorrectionsClient({ store: mockStore, shouldFailInsert: true }));

    await expect(triageReaderCorrection({
      correctionId: submission.submissionId!,
      status: 'resolved',
      publishedCorrection: {
        category: 'factual',
        previousWording: 'The agreement was signed in 1962.',
        correctedWording: 'The agreement date is under correction.',
        explanation: 'The earlier date could not be substantiated by the cited primary record.',
      },
    }, { userId: 'editor-2', role: 'editor' })).rejects.toThrow(/Failed to persist public correction/);

    expect(mockStore.readerCorrections[0].status).toBe('received');
    expect(mockStore.corrections).toHaveLength(0);
  });

});
