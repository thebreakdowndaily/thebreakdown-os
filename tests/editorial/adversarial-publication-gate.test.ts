import { describe, it } from 'node:test';
import assert from 'node:assert';
import { validateStoryForPublication, validateStoryForPublicationAsync } from '@/lib/editorial/publication-gate';
import { evaluatePublicationContractAsync } from '@/lib/editorial/canonical-publication';
import { isPubliclyPublished, isCanonicalStoryPublic, storyPublicationContext, diagnosePublication } from '@/lib/story/publication';
import { getEditorialReleaseHold, isStoryUnderReleaseHold } from '@/lib/editorial/release-holds';
import { RepositoryFactory } from '@/services/factory/repository';
import { DirectPublicationForbiddenError } from '@/lib/story/evidence-guard';
import type { Story } from '@/types/canonical';
import type { Principal } from '@/features/auth/principal';

describe('Adversarial Publication Gate & Worker Enforcement (AC-04..08)', () => {
  const editorPrincipal: Principal = {
    userId: 'editor-1',
    email: 'editor@thebreakdown.in',
    name: 'Lead Editor',
    role: 'editor',
    isSuperAdmin: false,
    status: 'active',
    organizationId: null,
  };

  const reporterPrincipal: Principal = {
    userId: 'reporter-1',
    email: 'reporter@thebreakdown.in',
    name: 'Staff Reporter',
    role: 'viewer',
    isSuperAdmin: false,
    status: 'active',
    organizationId: null,
  };

  const cronSchedulerPrincipal: Principal = {
    userId: 'system-scheduler',
    email: 'scheduler@breakdown.local',
    name: 'Editorial Scheduler',
    role: 'owner',
    isSuperAdmin: true,
    status: 'active',
    organizationId: null,
  };

  it('AC-04: rejects publication when user lacks story.publish authorization', async () => {
    const mockStory: Story = {
      id: 'unauth-test-story',
      slug: 'unauth-test-story',
      title: 'Unauthorized Publication Attempt',
      headline: 'Unauthorized Publication Attempt',
      summary: 'Summary of test story',
      publishedAt: '2026-11-01T00:00:00Z',
      updatedAt: '2026-11-01T00:00:00Z',
      status: 'review',
      publicationStatus: 'draft',
      category: 'policy',
      tags: ['test'],
      readingTime: 5,
      evidenceScore: 80,
      storyType: 'standard',
      heroImage: '/images/topics/policy.jpg',
      blocks: [],
      sources: [],
      claims: [],
      relatedTopicIds: [],
    };

    const decision = await evaluatePublicationContractAsync(
      mockStory,
      mockStory,
      reporterPrincipal,
      { triggeredBy: 'manual' }
    );

    assert.strictEqual(decision.allowed, false);
    assert.strictEqual(decision.httpStatus, 403);
    assert.match(decision.error || '', /Forbidden.*cannot publish stories/i);
  });

  it('AC-04: rejects publishing quarantined draft stories without review', async () => {
    const draftStory: Story = {
      id: 'quarantined-story-1',
      slug: 'ng-ch-01-the-promise',
      title: 'Quarantined Draft Chapter',
      headline: 'Quarantined Draft Chapter',
      summary: 'Summary of draft',
      publishedAt: '2026-11-01T00:00:00Z',
      updatedAt: '2026-11-01T00:00:00Z',
      status: 'draft', // Draft status is NOT eligible for publication gate
      publicationStatus: 'draft',
      category: 'environment',
      tags: ['test'],
      readingTime: 5,
      evidenceScore: 80,
      storyType: 'investigation_chapter',
      heroImage: '/images/topics/environment.jpg',
      blocks: [],
      sources: [],
      claims: [],
      relatedTopicIds: [],
    };

    const gateResult = validateStoryForPublication(
      { storyId: draftStory.id, triggeredBy: 'manual' },
      draftStory
    );

    assert.strictEqual(gateResult.passed, false);
    const statusCheck = gateResult.checks.find((c) => c.name === 'status_eligible');
    assert.ok(statusCheck);
    assert.strictEqual(statusCheck.passed, false);
    assert.match(statusCheck.reason, /Story status 'draft' is not eligible/);
  });

  it('AC-05 & AC-07: scheduled cron worker strictly cannot bypass an editorial release hold', async () => {
    const heldStory: Story = {
      id: 'held-bcci-story',
      slug: 'bcci-domestic-mandate-ranji-economics',
      title: 'BCCI Ranji Economics',
      headline: 'BCCI Ranji Economics',
      summary: 'Summary of held story',
      publishedAt: '2026-11-01T00:00:00Z',
      updatedAt: '2026-11-01T00:00:00Z',
      status: 'scheduled',
      publicationStatus: 'scheduled',
      category: 'sports',
      tags: ['cricket', 'bcci'],
      readingTime: 10,
      evidenceScore: 90,
      storyType: 'feature',
      heroImage: '/images/stories/bcci-domestic-mandate-ranji-economics.svg',
      blocks: [],
      sources: [],
      claims: [],
      relatedTopicIds: [],
    };

    // Attempt publication via scheduled cron worker with adversarial bypass flag
    const gateResult = validateStoryForPublication(
      { storyId: heldStory.id, triggeredBy: 'cron' },
      heldStory,
      new Date(),
      { bypassEditorialHold: true } // Cron worker MUST ignore bypass flag
    );

    assert.strictEqual(gateResult.passed, false);
    const holdCheck = gateResult.checks.find((c) => c.name === 'editorial_release_hold');
    assert.ok(holdCheck);
    assert.strictEqual(holdCheck.passed, false);
    assert.match(holdCheck.reason, /Editorial Release Hold is ACTIVE/);
  });

  it('AC-07: release hold alias mapping prevents bypassing hold via legacy slugs', () => {
    assert.strictEqual(isStoryUnderReleaseHold('semiconductor-pli'), true);
    assert.strictEqual(isStoryUnderReleaseHold('india-semiconductor-mission-fab-reality'), true);
    assert.strictEqual(isStoryUnderReleaseHold('ai-literacy'), true);
    assert.strictEqual(isStoryUnderReleaseHold('ai-literacy-india-students-verify-ai'), true);
    assert.strictEqual(isStoryUnderReleaseHold('bcci-ranji'), true);
    assert.strictEqual(isStoryUnderReleaseHold('bcci-domestic-mandate-ranji-economics'), true);

    const hold = getEditorialReleaseHold('semiconductor-pli');
    assert.ok(hold);
    assert.strictEqual(hold.slug, 'india-semiconductor-mission-fab-reality');
    assert.strictEqual(hold.status, 'HOLD');

    // Central visibility predicate must reject alias
    const isPublic = isPubliclyPublished({
      slug: 'semiconductor-pli',
      publicationStatus: 'published',
      publishedAt: '2026-07-01T06:00:00Z',
      isStory: true,
    });
    assert.strictEqual(isPublic, false, 'Legacy alias must not bypass release hold');
  });

  it('AC-08: rejects feature publication with generic placeholder hero image', () => {
    const featureWithPlaceholder: Story = {
      id: 'placeholder-hero-story',
      slug: 'ai-literacy-india-students-verify-ai',
      title: 'AI Literacy in India',
      headline: 'AI Literacy in India',
      summary: 'Summary of feature story',
      publishedAt: '2026-11-01T00:00:00Z',
      updatedAt: '2026-11-01T00:00:00Z',
      status: 'scheduled',
      publicationStatus: 'scheduled',
      category: 'technology',
      tags: ['ai'],
      readingTime: 8,
      evidenceScore: 85,
      storyType: 'feature',
      heroImage: '/images/placeholders/generic-feature-placeholder.svg',
      blocks: [],
      sources: [],
      claims: [],
      relatedTopicIds: [],
    };

    const result = validateStoryForPublication(
      { storyId: featureWithPlaceholder.id, triggeredBy: 'manual' },
      featureWithPlaceholder
    );

    assert.strictEqual(result.passed, false);
    const heroCheck = result.checks.find((c) => c.name === 'hero_media_quality');
    assert.ok(heroCheck);
    assert.strictEqual(heroCheck.passed, false);
    assert.match(heroCheck.reason, /Blocked generic placeholder asset/);
  });

  it('AC-06: direct repository save with status=published throws DirectPublicationForbiddenError without token', async () => {
    const repo = RepositoryFactory.getStoryRepository([]);
    const targetStory: Story = {
      id: 'direct-save-test',
      slug: 'direct-save-test',
      title: 'Direct Save Test',
      headline: 'Direct Save Test',
      summary: 'Summary',
      publishedAt: '2026-11-01T00:00:00Z',
      updatedAt: '2026-11-01T00:00:00Z',
      status: 'published',
      publicationStatus: 'published',
      category: 'policy',
      tags: [],
      readingTime: 5,
      evidenceScore: 80,
      storyType: 'standard',
      heroImage: '/images/topics/policy.jpg',
      blocks: [],
      sources: [],
      claims: [],
      relatedTopicIds: [],
    };

    await assert.rejects(
      async () => {
        await repo.saveStory(targetStory);
      },
      DirectPublicationForbiddenError,
      'Direct saveStory with status=published must be rejected without a verified publication token'
    );
  });

  it('AC-09: centralized publication predicate enforces fail-closed rules', () => {
    // Missing slug when isStory = true
    assert.strictEqual(
      isPubliclyPublished({ isStory: true, publicationStatus: 'published', publishedAt: '2026-10-01T00:00:00Z' }),
      false,
      'Missing slug for story must fail closed'
    );

    // Test artifact
    assert.strictEqual(
      isPubliclyPublished({ slug: 'valid-slug', isTestArtifact: true, publicationStatus: 'published', publishedAt: '2026-10-01T00:00:00Z' }),
      false,
      'Test artifact must never be public'
    );

    // Future publishedAt
    const futureDate = new Date(Date.now() + 86400000).toISOString();
    assert.strictEqual(
      isPubliclyPublished({ slug: 'valid-slug', publicationStatus: 'published', publishedAt: futureDate }),
      false,
      'Future-dated story must not be public'
    );

    // Draft / scheduled / archived status
    for (const status of ['draft', 'scheduled', 'review', 'archived'] as const) {
      assert.strictEqual(
        isPubliclyPublished({ slug: 'valid-slug', publicationStatus: status, publishedAt: '2026-10-01T00:00:00Z' }),
        false,
        `Status '${status}' must not be public`
      );
    }
  });
});
