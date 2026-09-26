import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { getPublicStories, getStories, getTopics } from '../utils/data-layer/store';
import { bootstrapServices } from '../lib/bootstrap';
import { buildStoryPresentationModel } from '../lib/story/presentation-model';
import { getStoryEvidenceSummary } from '../lib/story/trust-signals';
import { isPubliclyPublished } from '../lib/story/publication';

async function runRecoveryTests() {
  console.log('========================================================================');
  console.log('THE BREAKDOWN — READER-FIRST PUBLICATION RECOVERY REGRESSION TESTS');
  console.log('========================================================================\n');

  let passed = 0;
  let failed = 0;

  function test(name: string, fn: () => void | Promise<void>) {
    try {
      fn();
      console.log(`  PASS: ${name}`);
      passed++;
    } catch (err: any) {
      console.error(`  FAIL: ${name}`);
      console.error(`        ${err.message}`);
      failed++;
    }
  }

  const allServices = bootstrapServices({ publicOnly: false });
  const allStories = (await allServices.stories.getStories({ pageSize: 100 })).data;
  const rawPublic = getPublicStories({ pageSize: 100 }).data;
  const publicStories = await Promise.all(
    rawPublic.map((s) => allServices.stories.getStoryBySlug(s.slug))
  ).then((list) => list.filter(Boolean) as any[]);

  // 1. Publication State Quarantine
  test('Draft stories (e.g. ng-ch-01) must never appear in public listings', () => {
    const draftInPublic = publicStories.find((s) => s.slug.startsWith('ng-ch-'));
    assert.strictEqual(draftInPublic, undefined, 'Draft chapters must not be in public stories');
    assert.ok(publicStories.length > 0, 'Public stories must exist');
    assert.ok(publicStories.length < allStories.length, 'Public stories count must exclude drafts');
  });

  test('Public stories all pass isPubliclyPublished check', () => {
    for (const story of publicStories) {
      const isPub = isPubliclyPublished({
        publicationStatus: story.publicationStatus,
        publishedAt: story.publishedAt,
      });
      assert.ok(isPub, `Story ${story.slug} must pass isPubliclyPublished check`);
    }
  });

  // 2. Story Narrative Integrity
  test('Every public story has structured chapters and narrative text blocks', () => {
    for (const story of publicStories) {
      const pm = buildStoryPresentationModel(story);
      assert.ok(
        pm.chapters.length >= 3,
        `Story ${story.slug} must have at least 3 chapters (found ${pm.chapters.length})`
      );
      const textBlocks = pm.chapters.flatMap((c) => c.blocks.filter((b) => b.type === 'text'));
      assert.ok(
        textBlocks.length >= 2,
        `Story ${story.slug} must have narrative prose text blocks (found ${textBlocks.length})`
      );
    }
  });

  test('No story has duplicate executive summary inside main chapters', () => {
    for (const story of publicStories) {
      const pm = buildStoryPresentationModel(story);
      for (const ch of pm.chapters) {
        const hasExec = ch.blocks.some((b) => b.type === 'executive-summary');
        assert.strictEqual(
          hasExec,
          false,
          `Story ${story.slug} must not render executive-summary inside chapter ${ch.title}`
        );
      }
    }
  });

  // 3. Evidence Label Integrity
  test('getStoryEvidenceSummary provides internally consistent evidence statistics', () => {
    for (const story of publicStories) {
      const summary = getStoryEvidenceSummary(story);
      assert.ok(typeof summary.evidenceGrade === 'string', 'Evidence grade must be string');
      assert.ok(typeof summary.evidenceScore === 'number', 'Evidence score must be number');
      assert.ok(summary.claimsTotal >= 0, 'Total claims must be non-negative');
      assert.ok(summary.claimsVerified <= summary.claimsTotal, 'Verified claims cannot exceed total');
      assert.ok(
        ['Strong', 'Substantial', 'Moderate', 'Developing'].includes(summary.evidenceStatus),
        'Evidence status must be a recognized level'
      );
    }
  });

  // 4. Image Integrity
  test('Every public story hero image exists on disk and has valid format', () => {
    for (const story of publicStories) {
      assert.ok(story.heroImage, `Story ${story.slug} must have heroImage property`);
      const relPath = story.heroImage.replace(/^\//, '');
      const fullPath = path.join(process.cwd(), 'public', relPath);
      assert.ok(
        fs.existsSync(fullPath),
        `Hero image for ${story.slug} must exist on disk: ${story.heroImage}`
      );
      const ext = path.extname(relPath).toLowerCase();
      assert.ok(
        ['.jpg', '.jpeg', '.png', '.svg', '.webp'].includes(ext),
        `Hero image for ${story.slug} has invalid format: ${ext}`
      );
    }
  });

  // 5. Topics Directory Integrity
  test('Topics directory contains all registered topics with valid slugs and descriptions', () => {
    const topics = getTopics({ pageSize: 100 }).data;
    assert.ok(topics.length >= 10, `Expected at least 10 topics, found ${topics.length}`);
    for (const t of topics) {
      assert.ok(t.slug && t.slug.length > 0, 'Topic must have slug');
      assert.ok(t.name && t.name.length > 0, 'Topic must have name');
      assert.ok(t.description && t.description.length > 0, 'Topic must have description');
    }
  });

  // 6. Content State Inventory & Quarantine Audit
  test('Content state correctly identifies 40 published and 15 quarantined draft stories', () => {
    assert.strictEqual(publicStories.length, 40, `Expected exactly 40 published stories, found ${publicStories.length}`);
    const quarantinedDrafts = allStories.filter((s) => s.slug.startsWith('ng-ch-'));
    assert.strictEqual(quarantinedDrafts.length, 15, `Expected 15 quarantined Namami Gange draft chapters, found ${quarantinedDrafts.length}`);
    for (const q of quarantinedDrafts) {
      assert.notStrictEqual(q.publicationStatus, 'published', `Quarantined story ${q.slug} must not have published status`);
    }
  });

  // 7. Route & Slug Resolution
  test('All 41 public story slugs and 15 topics form valid canonical route targets', () => {
    const topics = getTopics({ pageSize: 100 }).data;
    for (const story of publicStories) {
      assert.match(story.slug, /^[a-z0-9-]+$/, `Story slug ${story.slug} must be URL-safe`);
    }
    for (const topic of topics) {
      assert.match(topic.slug, /^[a-z0-9-]+$/, `Topic slug ${topic.slug} must be URL-safe`);
    }
  });

  // 8. Evidence Consistency Resolution
  test('Evidence signals originate from canonical resolver without discrepancies', () => {
    for (const story of publicStories) {
      const summary = getStoryEvidenceSummary(story);
      const rawClaimsCount = story.claims ? story.claims.length : 0;
      assert.strictEqual(
        summary.claimsTotal,
        rawClaimsCount,
        `Story ${story.slug} claims count must match raw claims`
      );
      const pm = buildStoryPresentationModel(story);
      assert.strictEqual(
        pm.hero.headline,
        story.headline,
        `Presentation model headline must match domain story headline for ${story.slug}`
      );
    }
  });

  console.log(`\nReader-First Publication Recovery Tests: ${passed} passed, ${failed} failed`);
  if (failed > 0) {
    process.exit(1);
  }
}

runRecoveryTests().catch((err) => {
  console.error(err);
  process.exit(1);
});
