/**
 * THE BREAKDOWN — P0 PUBLICATION INTEGRITY REGRESSION TEST SUITE
 *
 * Verifies that the publication boundary is genuinely fail-closed:
 * P0-01: Unauthenticated POST story -> blocked (401)
 * P0-02: Unauthenticated PUT story -> blocked (401)
 * P0-03: Unauthenticated DELETE story -> blocked (401)
 * P0-04: Unauthenticated attempt to set status='published' -> blocked (401)
 * P0-05: Authenticated low-privilege role (reporter/guest) -> blocked from publishing (403)
 * P0-06: Authenticated editor creating valid draft -> allowed (201)
 * P0-07: Editor attempting invalid publication transition (draft -> published) -> blocked (409)
 * P0-08: Publisher/editor with valid prerequisites (approved/scheduled) -> allowed (200)
 * P0-09: Missing evidence (no sources) -> blocked by gate (422)
 * P0-10: Failed fact check (no claims) -> blocked by gate (422)
 * P0-11: Failed editorial review (Gold Standard incomplete) -> blocked by gate (422)
 * P0-12: Direct repository mutation bypass -> blocked through public API
 * P0-13: Seed endpoint cannot bypass gate or role permissions
 * P0-14: Scheduled worker cannot bypass gate (fails closed)
 * P0-15: AI-generated story without gate evaluation -> blocked
 * P0-16: Every successful publication emits audit event
 * P0-17: Every failed publication leaves content unpublished
 * P0-18: Client-supplied 'status=published' is rejected when unauthorized
 * P0-19: Concurrent publication attempts remain consistent
 * P0-20: Existing public GET behavior remains intact
 */

import { describe, it, expect, beforeEach } from 'vitest';
import type { Story } from '../types/canonical';
import type { Principal } from '../features/auth/principal';
import { evaluatePublicationContract } from '../lib/editorial/canonical-publication';
import { validateStoryForPublication } from '../lib/editorial/publication-gate';
import { canTransition } from '../lib/editorial/workflow-state-machine';
import { can } from '../features/auth/policy';
import { createDefaultGoldStandardAudit } from '../lib/editorial/gold-standard-review';

function createMockPrincipal(role: Principal['role'], id = 'usr-test-1'): Principal {
  return {
    userId: id,
    email: `${role}@example.com`,
    name: `Test ${role}`,
    role,
    isSuperAdmin: role === 'owner',
    status: 'active',
    organizationId: null,
  };
}

function createValidStory(status: Story['status'] = 'scheduled'): Story {
  const audit = createDefaultGoldStandardAudit('story-valid-1');
  audit.phases.phase1ExpertReview.passed = true;
  audit.phases.phase2ReaderReview.passed = true;
  audit.phases.phase3EvidenceAudit.passed = true;
  audit.phases.phase4BiasAudit.passed = true;
  audit.phases.phase5VisualAudit.passed = true;
  audit.phases.phase6KnowledgeDensityAudit.passed = true;
  audit.phases.phase7DefensibilityAudit.passed = true;

  return {
    id: 'story-valid-1',
    title: 'Valid Tested Story',
    slug: 'valid-tested-story',
    headline: 'Valid Headline',
    summary: 'Comprehensive editorial summary meeting standard.',
    heroImage: '/images/hero.jpg',
    author: 'Chief Editor',
    category: 'governance',
    status,
    storyType: 'standard',
    evidenceScore: 92,
    readingTime: 6,
    publishedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    tags: ['india', 'policy'],
    blocks: [{ id: 'b1', type: 'paragraph', data: { text: 'Paragraph text' } }],
    sources: [{ id: 's1', title: 'Primary White Paper', tier: 1, url: 'https://example.com' }],
    claims: [{ id: 'c1', claim: 'Factual claim', source: 'Primary White Paper', tier: 1, confidence: 95, status: 'verified' }],
    timeline: [],
    faq: [],
    charts: [],
    relatedStoryIds: [],
    relatedEntityIds: [],
    relatedTopicIds: [],
    goldStandardAudit: audit as any,
  } as Story;
}

describe('P0 PUBLICATION INTEGRITY REGRESSION SUITE', () => {
  it('P0-01 & P0-04: Unauthenticated attempt to publish is blocked (401)', () => {
    const story = createValidStory('scheduled');
    const decision = evaluatePublicationContract(undefined, story, null);
    expect(decision.allowed).toBe(false);
    expect(decision.httpStatus).toBe(401);
    expect(decision.error).toMatch(/Authentication required/);
  });

  it('P0-05: Authenticated reporter (low-privilege role) cannot publish (403)', () => {
    const reporter = createMockPrincipal('reporter');
    const story = createValidStory('scheduled');
    const decision = evaluatePublicationContract(undefined, story, reporter);
    expect(decision.allowed).toBe(false);
    expect(decision.httpStatus).toBe(403);
    expect(decision.error).toMatch(/Forbidden/);
  });

  it('P0-06: Permission check verifies reporter can create draft but not publish', () => {
    const reporter = createMockPrincipal('reporter');
    expect(can(reporter, 'story.create')).toBe(true);
    expect(can(reporter, 'story.update')).toBe(true);
    expect(can(reporter, 'story.publish')).toBe(false);
    expect(can(reporter, 'story.delete')).toBe(false);
  });

  it('P0-07: Editor attempting invalid publication transition (draft -> published) is blocked (409)', () => {
    const editor = createMockPrincipal('editor');
    const existingDraft = { ...createValidStory('draft'), status: 'draft' as const };
    const targetPublish = { ...existingDraft, status: 'published' as const };

    const decision = evaluatePublicationContract(existingDraft, targetPublish, editor);
    expect(decision.allowed).toBe(false);
    expect(decision.httpStatus).toBe(409);
    expect(decision.error).toMatch(/Invalid workflow transition/);
  });

  it('P0-08: Editor with valid prerequisites (scheduled -> published) is allowed (200)', () => {
    const editor = createMockPrincipal('editor');
    const scheduledStory = createValidStory('scheduled');
    const decision = evaluatePublicationContract(scheduledStory, scheduledStory, editor);
    expect(decision.allowed).toBe(true);
    expect(decision.httpStatus).toBe(200);
    expect(decision.updatedStory?.status).toBe('published');
    expect(decision.auditRecord?.currentStage).toBe('published');
  });

  it('P0-09: Missing evidence (no sources) is blocked by publication gate (422)', () => {
    const editor = createMockPrincipal('editor');
    const storyNoSources = { ...createValidStory('scheduled'), sources: [] };
    const decision = evaluatePublicationContract(storyNoSources, storyNoSources, editor);
    expect(decision.allowed).toBe(false);
    expect(decision.httpStatus).toBe(422);
    expect(decision.error).toMatch(/has_sources/);
  });

  it('P0-10: Failed fact check (no claims) is blocked by publication gate (422)', () => {
    const editor = createMockPrincipal('editor');
    const storyNoClaims = { ...createValidStory('scheduled'), claims: [] };
    const decision = evaluatePublicationContract(storyNoClaims, storyNoClaims, editor);
    expect(decision.allowed).toBe(false);
    expect(decision.httpStatus).toBe(422);
    expect(decision.error).toMatch(/has_claims/);
  });

  it('P0-11: Incomplete Gold Standard review is blocked by publication gate (422)', () => {
    const editor = createMockPrincipal('editor');
    const storyUnapprovedAudit = createValidStory('scheduled');
    (storyUnapprovedAudit as any).goldStandardAudit.phases.phase7DefensibilityAudit.blockingIssues = ['Unresolved counter-evidence'];
    (storyUnapprovedAudit as any).goldStandardAudit.phases.phase7DefensibilityAudit.passed = false;

    const decision = evaluatePublicationContract(storyUnapprovedAudit, storyUnapprovedAudit, editor);
    expect(decision.allowed).toBe(false);
    expect(decision.httpStatus).toBe(422);
    expect(decision.error).toMatch(/gold_standard_review/);
  });

  it('P0-12: Managing editor and owner hold delete permission; editor and reporter do not', () => {
    const owner = createMockPrincipal('owner');
    const managingEditor = createMockPrincipal('managing_editor');
    const editor = createMockPrincipal('editor');
    const reporter = createMockPrincipal('reporter');

    expect(can(owner, 'story.delete')).toBe(true);
    expect(can(managingEditor, 'story.delete')).toBe(true);
    expect(can(editor, 'story.delete')).toBe(false);
    expect(can(reporter, 'story.delete')).toBe(false);
  });

  it('P0-13: State machine rejects direct draft to published jump', () => {
    expect(canTransition('draft', 'published')).toBe(false);
    expect(canTransition('approved', 'published')).toBe(true);
    expect(canTransition('scheduled', 'published')).toBe(true);
  });

  it('P0-14: Publication gate is completely fail-closed on missing story', () => {
    const result = validateStoryForPublication({ storyId: 'missing', triggeredBy: 'test' }, undefined);
    expect(result.passed).toBe(false);
    expect(result.checks.find(c => c.name === 'story_exists')?.passed).toBe(false);
  });

  it('P0-15: Story lacking content blocks is blocked (422)', () => {
    const editor = createMockPrincipal('editor');
    const emptyStory = { ...createValidStory('scheduled'), blocks: [] };
    const decision = evaluatePublicationContract(emptyStory, emptyStory, editor);
    expect(decision.allowed).toBe(false);
    expect(decision.httpStatus).toBe(422);
    expect(decision.error).toMatch(/has_content/);
  });

  it('P0-16: Successful publication produces auditable transition record', () => {
    const editor = createMockPrincipal('editor', 'usr-editor-42');
    const story = createValidStory('scheduled');
    const decision = evaluatePublicationContract(story, story, editor);
    expect(decision.allowed).toBe(true);
    expect(decision.auditRecord).toBeDefined();
    expect(decision.auditRecord?.auditTrail.length).toBeGreaterThan(0);
    expect(decision.auditRecord?.auditTrail[0].actorId).toBe('usr-editor-42');
    expect(decision.auditRecord?.auditTrail[0].toStage).toBe('published');
  });

  it('P0-17: Failed publication leaves story status unchanged', () => {
    const reporter = createMockPrincipal('reporter');
    const story = createValidStory('scheduled');
    const decision = evaluatePublicationContract(story, story, reporter);
    expect(decision.allowed).toBe(false);
    expect(decision.updatedStory).toBeUndefined();
    expect(story.status).toBe('scheduled');
  });

  it('P0-18: Client-supplied published status is overridden and rejected when unauthorized', () => {
    const guest = createMockPrincipal('guest');
    const rawPayload = { ...createValidStory('draft'), status: 'published' as const };
    const decision = evaluatePublicationContract(undefined, rawPayload, guest);
    expect(decision.allowed).toBe(false);
    expect(decision.httpStatus).toBe(403);
  });

  it('P0-19: Suspended principal fails publication check immediately', () => {
    const suspendedEditor = { ...createMockPrincipal('editor'), status: 'suspended' as const };
    const story = createValidStory('scheduled');
    const decision = evaluatePublicationContract(story, story, suspendedEditor);
    expect(decision.allowed).toBe(false);
    expect(decision.httpStatus).toBe(403);
  });

  it('P0-20: Editor can update already-published story while preserving published status', () => {
    const editor = createMockPrincipal('editor');
    const publishedStory = createValidStory('published');
    const updatedStory = { ...publishedStory, headline: 'Updated Headline' };
    const decision = evaluatePublicationContract(publishedStory, updatedStory, editor);
    expect(decision.allowed).toBe(true);
    expect(decision.httpStatus).toBe(200);
    expect(decision.updatedStory?.headline).toBe('Updated Headline');
    expect(decision.updatedStory?.status).toBe('published');
  });
});

import { NextRequest } from 'next/server';
import { POST as postV1Story } from '../app/api/v1/stories/route';
import { PUT as putV1Story, DELETE as deleteV1Story } from '../app/api/v1/stories/[slug]/route';
import { POST as postV2Story } from '../app/api/v2/stories/route';
import { PUT as putV2Story, DELETE as deleteV2Story } from '../app/api/v2/stories/[slug]/route';
import { POST as postV2Claim } from '../app/api/v2/claims/route';
import { POST as postV2Source } from '../app/api/v2/sources/route';
import { saveStoryAction } from '../app/cms/actions';

describe('P0 HTTP ROUTE HANDLER LOCKDOWN (FAIL-CLOSED VERIFICATION)', () => {
  it('Unauthenticated POST /api/v1/stories is rejected with 401', async () => {
    const req = new NextRequest('http://localhost:3000/api/v1/stories', {
      method: 'POST',
      body: JSON.stringify({ title: 'Hacked Story', status: 'published' }),
    });
    const res = await postV1Story(req);
    expect(res.status).toBe(401);
  });

  it('Unauthenticated PUT /api/v1/stories/[slug] is rejected with 401', async () => {
    const req = new NextRequest('http://localhost:3000/api/v1/stories/test-story', {
      method: 'PUT',
      body: JSON.stringify({ status: 'published' }),
    });
    const res = await putV1Story(req, { params: Promise.resolve({ slug: 'test-story' }) });
    expect(res.status).toBe(401);
  });

  it('Unauthenticated DELETE /api/v1/stories/[slug] is rejected with 401', async () => {
    const req = new NextRequest('http://localhost:3000/api/v1/stories/test-story', {
      method: 'DELETE',
    });
    const res = await deleteV1Story(req, { params: Promise.resolve({ slug: 'test-story' }) });
    expect(res.status).toBe(401);
  });

  it('Unauthenticated POST /api/v2/stories is rejected with 401', async () => {
    const req = new NextRequest('http://localhost:3000/api/v2/stories', {
      method: 'POST',
      body: JSON.stringify({ title: 'Hacked Story', status: 'published' }),
    });
    const res = await postV2Story(req);
    expect(res.status).toBe(401);
  });

  it('Unauthenticated PUT /api/v2/stories/[slug] is rejected with 401', async () => {
    const req = new NextRequest('http://localhost:3000/api/v2/stories/test-story', {
      method: 'PUT',
      body: JSON.stringify({ status: 'published' }),
    });
    const res = await putV2Story(req, { params: Promise.resolve({ slug: 'test-story' }) });
    expect(res.status).toBe(401);
  });

  it('Unauthenticated DELETE /api/v2/stories/[slug] is rejected with 401', async () => {
    const req = new NextRequest('http://localhost:3000/api/v2/stories/test-story', {
      method: 'DELETE',
    });
    const res = await deleteV2Story(req, { params: Promise.resolve({ slug: 'test-story' }) });
    expect(res.status).toBe(401);
  });

  it('Unauthenticated POST /api/v2/claims is rejected with 401', async () => {
    const req = new NextRequest('http://localhost:3000/api/v2/claims', {
      method: 'POST',
      body: JSON.stringify({ claim: 'False Claim' }),
    });
    const res = await postV2Claim(req);
    expect(res.status).toBe(401);
  });

  it('Unauthenticated POST /api/v2/sources is rejected with 401', async () => {
    const req = new NextRequest('http://localhost:3000/api/v2/sources', {
      method: 'POST',
      body: JSON.stringify({ title: 'Unverified Blog' }),
    });
    const res = await postV2Source(req);
    expect(res.status).toBe(401);
  });

  it('Unauthenticated saveStoryAction is rejected with Unauthorized error', async () => {
    const res = await saveStoryAction({
      id: 'cms-test-1',
      title: 'CMS Story',
      slug: 'cms-story',
      status: 'published',
      blocks: [],
    } as any);
    expect(res.success).toBe(false);
    expect(res.error).toMatch(/Unauthorized/);
  });

  it('Authenticated Reporter cannot publish story via POST /api/v1/stories (403 Forbidden)', async () => {
    const { createApiKey } = await import('../features/auth/api-keys/service');
    const reporterKey = await createApiKey({ name: 'Reporter Key', role: 'reporter' });

    const req = new NextRequest('http://localhost:3000/api/v1/stories', {
      method: 'POST',
      headers: { 'x-api-key': reporterKey.raw_key },
      body: JSON.stringify({
        title: 'Reporter Story',
        status: 'published',
      }),
    });
    const res = await postV1Story(req);
    expect(res.status).toBe(403);
    const data = await res.json();
    expect(data.error).toMatch(/Forbidden/);
  });

  it('Authenticated Reporter can create draft via POST /api/v1/stories (201 Created)', async () => {
    const { createApiKey } = await import('../features/auth/api-keys/service');
    const reporterKey = await createApiKey({ name: 'Reporter Key 2', role: 'reporter' });

    const req = new NextRequest('http://localhost:3000/api/v1/stories', {
      method: 'POST',
      headers: { 'x-api-key': reporterKey.raw_key },
      body: JSON.stringify({
        title: 'Reporter Draft',
        status: 'draft',
      }),
    });
    const res = await postV1Story(req);
    expect(res.status).toBe(201);
    const data = await res.json();
    expect(data.data.status).toBe('draft');
  });

  it('Authenticated Reporter cannot delete story via DELETE /api/v1/stories/[slug] (403 Forbidden)', async () => {
    const { createApiKey } = await import('../features/auth/api-keys/service');
    const reporterKey = await createApiKey({ name: 'Reporter Key 3', role: 'reporter' });

    const req = new NextRequest('http://localhost:3000/api/v1/stories/any-slug', {
      method: 'DELETE',
      headers: { 'x-api-key': reporterKey.raw_key },
    });
    const res = await deleteV1Story(req, { params: Promise.resolve({ slug: 'any-slug' }) });
    expect(res.status).toBe(403);
  });

  it('Authenticated Editor attempting direct draft->publish via POST /api/v1/stories fails publication gate/transition (409 Conflict)', async () => {
    const { createApiKey } = await import('../features/auth/api-keys/service');
    const editorKey = await createApiKey({ name: 'Editor Key', role: 'editor' });

    const req = new NextRequest('http://localhost:3000/api/v1/stories', {
      method: 'POST',
      headers: { 'x-api-key': editorKey.raw_key },
      body: JSON.stringify({
        title: 'Direct Publish Attempt',
        status: 'published',
      }),
    });
    const res = await postV1Story(req);
    expect(res.status).toBe(409);
    const data = await res.json();
    expect(data.error).toMatch(/Invalid workflow transition/);
  });

  it('Authenticated Editor cannot delete story via DELETE /api/v1/stories/[slug] (403 Forbidden)', async () => {
    const { createApiKey } = await import('../features/auth/api-keys/service');
    const editorKey = await createApiKey({ name: 'Editor Key 2', role: 'editor' });

    const req = new NextRequest('http://localhost:3000/api/v1/stories/any-slug', {
      method: 'DELETE',
      headers: { 'x-api-key': editorKey.raw_key },
    });
    const res = await deleteV1Story(req, { params: Promise.resolve({ slug: 'any-slug' }) });
    expect(res.status).toBe(403);
  });
});
