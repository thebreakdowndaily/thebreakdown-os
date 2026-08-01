// scripts/audit/editorial/enumeration.ts
// Stage A: Exhaustive Content Enumeration & Publication Reconciliation

import { bootstrapServices } from '../../../lib/bootstrap';
import { resolveStory } from '../../../lib/story/resolver';
import { isCanonicalStoryPublic } from '../../../lib/story/publication';
import { RepositoryFactory } from '../../../services/factory/repository';
import { getKnowledgeLibrarySeedData } from '../../../utils/data-layer/knowledge-library-data';
import { seedAll } from '../../../lib/knowledge/knowledge-core';
import type { EnumerationRecord, EnumerationSummary } from './types';

export async function enumerateAllContent(): Promise<EnumerationSummary> {
  seedAll();

  // We explicitly use bootstrapServices() without publicOnly: true so all stories in store are accessible
  const services = bootstrapServices({ publicOnly: false });

  const rawRecords: EnumerationRecord[] = [];
  const slugCounts = new Map<string, number>();
  const canonicalIdMap = new Map<string, string[]>();

  // 1. Enumerate Standalone Stories exhaustively across pages
  let page = 1;
  let hasMore = true;
  while (hasMore) {
    const res = await services.stories.getStories({ page, pageSize: 100 });
    const stories = res.data || [];
    for (const story of stories) {
      slugCounts.set(story.slug, (slugCounts.get(story.slug) || 0) + 1);
      rawRecords.push({
        slug: story.slug,
        sourceType: 'STANDALONE_STORY',
        canonicalId: story.id,
        title: story.title || story.headline,
        status: 'NON_PUBLIC', // Initialized, will be resolved
        isPublic: false,
      });

      if (story.id) {
        const existing = canonicalIdMap.get(story.id) || [];
        existing.push(story.slug);
        canonicalIdMap.set(story.id, existing);
      }
    }
    if (stories.length < 100 || (res.total && page * 100 >= res.total)) {
      hasMore = false;
    } else {
      page++;
    }
  }

  // 2. Enumerate Knowledge Library Chapters exhaustively
  try {
    const repo = RepositoryFactory.getKnowledgeLibraryRepository(getKnowledgeLibrarySeedData());
    const library = await repo.getLibrary('india-and-the-world');
    if (library) {
      for (const col of library.collections) {
        for (const vol of col.volumes) {
          for (const chap of vol.chapters) {
            slugCounts.set(chap.slug, (slugCounts.get(chap.slug) || 0) + 1);
            rawRecords.push({
              slug: chap.slug,
              sourceType: 'KNOWLEDGE_LIBRARY_CHAPTER',
              canonicalId: chap.id,
              title: chap.title,
              status: 'NON_PUBLIC',
              isPublic: false,
            });

            if (chap.id) {
              const existing = canonicalIdMap.get(chap.id) || [];
              existing.push(chap.slug);
              canonicalIdMap.set(chap.id, existing);
            }
          }
        }
      }
    }
  } catch (err: any) {
    console.error('Error enumerating Knowledge Library chapters:', err.message);
  }

  // Detect duplicate slugs
  const duplicateSlugs = Array.from(slugCounts.entries())
    .filter(([_, count]) => count > 1)
    .map(([slug]) => slug);

  // Detect canonical ID collisions across different slugs
  const canonicalIdCollisions: string[] = [];
  for (const [id, slugs] of canonicalIdMap.entries()) {
    const uniqueSlugsForId = Array.from(new Set(slugs));
    if (uniqueSlugsForId.length > 1) {
      canonicalIdCollisions.push(`ID ${id} shared by slugs: ${uniqueSlugsForId.join(', ')}`);
    }
  }

  // Deduplicate discovered records by unique slug for classification
  const uniqueRecordsMap = new Map<string, EnumerationRecord>();
  for (const record of rawRecords) {
    if (!uniqueRecordsMap.has(record.slug)) {
      uniqueRecordsMap.set(record.slug, record);
    }
  }

  const uniqueRecords = Array.from(uniqueRecordsMap.values());

  let publicCount = 0;
  let nonPublicCount = 0;
  let resolutionFailuresCount = 0;

  // 3. Resolve each unique record and evaluate publication predicate
  for (const rec of uniqueRecords) {
    try {
      const resolution = await resolveStory(rec.slug);
      if (resolution.type === 'not_found') {
        rec.status = 'NON_PUBLIC';
        rec.isPublic = false;
        nonPublicCount++;
        continue;
      }

      const canonicalStory = resolution.canonicalStory;
      const publicFlag = isCanonicalStoryPublic(canonicalStory);

      if (publicFlag) {
        rec.status = 'PUBLIC';
        rec.isPublic = true;
        publicCount++;
      } else {
        rec.status = 'NON_PUBLIC';
        rec.isPublic = false;
        nonPublicCount++;
      }
    } catch (err: any) {
      rec.status = 'RESOLUTION_FAILURE';
      rec.isPublic = false;
      rec.error = err.message || String(err);
      resolutionFailuresCount++;
    }
  }

  const summary: EnumerationSummary = {
    rawDiscovered: rawRecords.length,
    uniqueDiscovered: uniqueRecords.length,
    publicCount,
    nonPublicCount,
    resolutionFailuresCount,
    duplicateSlugs,
    canonicalIdCollisions,
    records: uniqueRecords,
  };

  // Invariant verification check
  const invariantHold = summary.uniqueDiscovered === (publicCount + nonPublicCount + resolutionFailuresCount);
  if (!invariantHold) {
    throw new Error(
      `ENUMERATION INVARIANT BROKEN: uniqueDiscovered (${summary.uniqueDiscovered}) !== public (${publicCount}) + nonPublic (${nonPublicCount}) + failures (${resolutionFailuresCount})`
    );
  }

  return summary;
}
