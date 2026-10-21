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
  it('8. Static production build can prerender seed notices only in the explicit CI memory phase', async () => {
    const originalNodeEnv = process.env.NODE_ENV;
    const originalNextPhase = process.env.NEXT_PHASE;
    const originalDataProvider = process.env.DATA_PROVIDER;
    const originalCI = process.env.CI;

    try {
      process.env.NODE_ENV = 'production';
      process.env.NEXT_PHASE = 'phase-production-build';
      process.env.DATA_PROVIDER = 'memory';
      process.env.CI = 'true';
      setCorrectionsDbClient(null);
      resetCorrectionsMemoryStore(true);

      const seeded = await listPublishedCorrections();
      expect(seeded.length).toBeGreaterThan(0);
      expect(seeded.some(row => row.storySlug === 'electoral-bonds')).toBe(true);
      expect(seeded.some(row => row.storySlug === 'mgnrega-reform')).toBe(true);
    } finally {
      if (originalNodeEnv === undefined) delete process.env.NODE_ENV;
      else process.env.NODE_ENV = originalNodeEnv;
      if (originalNextPhase === undefined) delete process.env.NEXT_PHASE;
      else process.env.NEXT_PHASE = originalNextPhase;
      if (originalDataProvider === undefined) delete process.env.DATA_PROVIDER;
      else process.env.DATA_PROVIDER = originalDataProvider;
      if (originalCI === undefined) delete process.env.CI;
      else process.env.CI = originalCI;
      setCorrectionsDbClient(createMockCorrectionsClient({ store: mockStore }));
    }
  });

  it('9. Deployed production still fails closed when the durable corrections ledger is unavailable', async () => {
    const originalNodeEnv = process.env.NODE_ENV;
    const originalNextPhase = process.env.NEXT_PHASE;
    const originalDataProvider = process.env.DATA_PROVIDER;
    const originalCI = process.env.CI;

    try {
      process.env.NODE_ENV = 'production';
      process.env.NEXT_PHASE = 'phase-production-server';
      process.env.DATA_PROVIDER = 'memory';
      process.env.CI = 'false';
      setCorrectionsDbClient(null);

      await expect(listPublishedCorrections()).rejects.toThrow(
        /Public corrections ledger is unavailable: durable database storage is required/
      );
    } finally {
      if (originalNodeEnv === undefined) delete process.env.NODE_ENV;
      else process.env.NODE_ENV = originalNodeEnv;
      if (originalNextPhase === undefined) delete process.env.NEXT_PHASE;
      else process.env.NEXT_PHASE = originalNextPhase;
      if (originalDataProvider === undefined) delete process.env.DATA_PROVIDER;
      else process.env.DATA_PROVIDER = originalDataProvider;
      if (originalCI === undefined) delete process.env.CI;
      else process.env.CI = originalCI;
      setCorrectionsDbClient(createMockCorrectionsClient({ store: mockStore }));
    }
  });

  it('10. Published corrections are durable and reload after a cold start', async () => {
    const submission = await submitReaderCorrection({
      storySlug: 'india-china-border-lac',
      passageExcerpt: 'The border was demarcated in 1960 according to this passage.',
      suggestedCorrection: 'The LAC remains undemarcated across multiple disputed sectors.',
    });
    expect(submission.success).toBe(true);

    await triageReaderCorrection({
      correctionId: submission.submissionId!,
      status: 'resolved',
      publishedCorrection: {
        category: 'factual',
        previousWording: 'The border was demarcated in 1960 according to this passage.',
        correctedWording: 'The LAC remains undemarcated across multiple disputed sectors.',
        explanation: 'The original wording overstated the status of demarcation.',
      },
    }, { userId: 'editor-ledger-test', role: 'editor' });

    expect(mockStore.corrections).toHaveLength(1);
    const storedSubmission = mockStore.readerCorrections.find(row => row.id === submission.submissionId);
    expect(storedSubmission?.status).toBe('resolved');
    expect(storedSubmission?.resolved_correction_id).toBe(mockStore.corrections[0].id);

    resetCorrectionsMemoryStore(false);
    setCorrectionsDbClient(createMockCorrectionsClient({ store: mockStore }));
    const reloaded = await listPublishedCorrections('india-china-border-lac');
    expect(reloaded).toHaveLength(1);
    expect(reloaded[0].id).toBe(mockStore.corrections[0].id);
    expect(reloaded[0].storyId).toBe('11111111-1111-1111-1111-111111111111');
    expect(reloaded[0].correctedWording).toBe('The LAC remains undemarcated across multiple disputed sectors.');
  });

  it('11. Failed correction publication never reports success or partially updates the submission', async () => {
    const submission = await submitReaderCorrection({
      storySlug: 'india-china-border-lac',
      passageExcerpt: 'A passage that must not create a correction on failure.',
      suggestedCorrection: 'A suggested change that will fail publication.',
    });
    expect(submission.success).toBe(true);

    setCorrectionsDbClient(createMockCorrectionsClient({
      store: mockStore,
      shouldFailInsert: true,
    }));

    await expect(triageReaderCorrection({
      correctionId: submission.submissionId!,
      status: 'resolved',
      publishedCorrection: {
        category: 'factual',
        previousWording: 'Original wording.',
        correctedWording: 'Corrected wording.',
        explanation: 'Publication should fail as the mock database rejects the transaction.',
      },
    }, { userId: 'editor-ledger-failure-test', role: 'editor' })).rejects.toThrow(/Failed to publish correction durably/);

    expect(mockStore.corrections).toHaveLength(0);
    const storedSubmission = mockStore.readerCorrections.find(row => row.id === submission.submissionId);
    expect(storedSubmission?.status).toBe('received');
    expect(storedSubmission?.resolved_correction_id).toBeUndefined();
  });

});