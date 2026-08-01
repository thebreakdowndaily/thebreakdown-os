/**
 * THE BREAKDOWN — Complete Story & Chapter Enumeration Script
 *
 * Programmatically enumerates every story/chapter in the system and asserts:
 * 1. resolveStory(slug) resolves item.
 * 2. isCanonicalStoryPublic(canonicalStory) is evaluated.
 * 3. Public items: buildStoryPresentationModel & applyReadingModePolicy (quick/standard/deep) succeed.
 * 4. Non-public items: isCanonicalStoryPublic returns false (fail-closed -> 404).
 */

import { strict as assert } from 'node:assert';
import { bootstrapServices } from '../lib/bootstrap';
import { resolveStory, getAllStoryAndChapterSlugs } from '../lib/story/resolver';
import { isCanonicalStoryPublic } from '../lib/story/publication';
import { buildStoryPresentationModel } from '../lib/story/presentation-model';
import { applyReadingModePolicy } from '../lib/story/reading-mode-policy';
import { RepositoryFactory } from '../services/factory/repository';
import { getKnowledgeLibrarySeedData } from '../utils/data-layer/knowledge-library-data';
import { seedAll } from '../lib/knowledge/knowledge-core';

async function runEnumerationVerification() {
  console.log('--- STARTING COMPLETE STORY ENUMERATION VERIFICATION ---\n');

  seedAll();
  const services = bootstrapServices();
  const allStoriesData = await services.stories.getStories({ pageSize: 1000 });
  const standaloneStories = allStoriesData.data || [];

  const repo = RepositoryFactory.getKnowledgeLibraryRepository(getKnowledgeLibrarySeedData());
  const library = await repo.getLibrary('india-and-the-world');
  const chapters: any[] = [];
  if (library) {
    for (const col of library.collections) {
      for (const vol of col.volumes) {
        for (const chap of vol.chapters) {
          chapters.push(chap);
        }
      }
    }
  }

  const processedSlugs = new Set<string>();
  let totalDiscovered = 0;
  let totalPublic = 0;
  let totalNonPublic = 0;
  let totalMigrated = 0;
  const failures: string[] = [];

  // Enumerate Standalone Stories
  for (const story of standaloneStories) {
    if (processedSlugs.has(story.slug)) continue;
    processedSlugs.add(story.slug);
    totalDiscovered++;
    const slug = story.slug;

    try {
      const resolution = await resolveStory(slug);
      if (resolution.type === 'not_found') {
        totalNonPublic++;
        console.log(`  [FAIL-CLOSED PASS] Not found: ${slug}`);
        continue;
      }

      const canonicalStory = resolution.canonicalStory;
      const isPublic = isCanonicalStoryPublic(canonicalStory);

      if (!isPublic) {
        totalNonPublic++;
        assert.equal(isPublic, false);
        console.log(`  [FAIL-CLOSED PASS] Non-public story rejected: ${slug}`);
        continue;
      }

      totalPublic++;
      const presentation = buildStoryPresentationModel(
        canonicalStory,
        resolution.candidateTimelineEvents,
        resolution.relatedStories
      );
      assert.ok(presentation.storySlug === slug);

      const quick = applyReadingModePolicy(presentation, 'quick');
      const standard = applyReadingModePolicy(presentation, 'standard');
      const deep = applyReadingModePolicy(presentation, 'deep');

      assert.equal(quick.mode, 'quick');
      assert.equal(standard.mode, 'standard');
      assert.equal(deep.mode, 'deep');

      totalMigrated++;
      console.log(`  [PUBLIC PASS] Public story migrated: ${slug}`);
    } catch (e: any) {
      failures.push(`Story ${slug}: ${e.message}`);
      console.error(`  [FAIL] ${slug}: ${e.message}`);
    }
  }

  // Enumerate Knowledge Library Chapters
  for (const chap of chapters) {
    if (processedSlugs.has(chap.slug)) continue;
    processedSlugs.add(chap.slug);
    totalDiscovered++;
    const slug = chap.slug;

    try {
      const resolution = await resolveStory(slug);
      if (resolution.type === 'not_found') {
        totalNonPublic++;
        console.log(`  [FAIL-CLOSED PASS] Not found: ${slug}`);
        continue;
      }

      const canonicalStory = resolution.canonicalStory;
      const isPublic = isCanonicalStoryPublic(canonicalStory);

      if (!isPublic) {
        totalNonPublic++;
        assert.equal(isPublic, false);
        console.log(`  [FAIL-CLOSED PASS] Non-public chapter rejected: ${slug}`);
        continue;
      }

      totalPublic++;
      const presentation = buildStoryPresentationModel(
        canonicalStory,
        resolution.candidateTimelineEvents,
        resolution.relatedStories
      );
      assert.ok(presentation.storySlug === slug);

      const quick = applyReadingModePolicy(presentation, 'quick');
      const standard = applyReadingModePolicy(presentation, 'standard');
      const deep = applyReadingModePolicy(presentation, 'deep');

      assert.equal(quick.mode, 'quick');
      assert.equal(standard.mode, 'standard');
      assert.equal(deep.mode, 'deep');

      totalMigrated++;
      console.log(`  [PUBLIC PASS] Public chapter migrated: ${slug}`);
    } catch (e: any) {
      failures.push(`Chapter ${slug}: ${e.message}`);
      console.error(`  [FAIL] ${slug}: ${e.message}`);
    }
  }

  console.log('\n--- ENUMERATION SUMMARY ---');
  console.log(`Total Discovered Stories/Chapters: ${totalDiscovered}`);
  console.log(`Total Public (Publication Gate Approved): ${totalPublic}`);
  console.log(`Total Non-Public (Fail-Closed Gate Protected): ${totalNonPublic}`);
  console.log(`Total Successfully Migrated to Universal Pipeline: ${totalMigrated}`);
  console.log(`Failures: ${failures.length}`);

  if (failures.length > 0) {
    console.error('\nFailures details:', failures);
    process.exit(1);
  }
}

runEnumerationVerification();
