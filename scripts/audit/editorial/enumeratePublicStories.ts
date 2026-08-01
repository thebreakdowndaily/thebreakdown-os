// scripts/audit/editorial/enumeratePublicStories.ts
// Audit‑only script – read‑only, no production changes.
// Enumerates all slugs, resolves each story, and classifies public vs non‑public.

import { resolveStory, getAllStoryAndChapterSlugs } from '../../../lib/story/resolver.ts';
import { isCanonicalStoryPublic } from '../../../lib/story/publication.ts';
import { bootstrapServices } from '../../../lib/bootstrap.ts';
import { seedAll } from '../../../lib/knowledge/knowledge-core.ts';

async function enumerate() {
  console.log('--- Enumerating all story and chapter slugs ---');
  seedAll();
  const services = bootstrapServices({ publicOnly: true });

  const all = await getAllStoryAndChapterSlugs();
  const results: { slug: string; isPublic: boolean }[] = [];

  for (const { slug } of all) {
    try {
      const resolution = await resolveStory(slug);
      if (resolution.type === 'not_found') {
        results.push({ slug, isPublic: false });
        continue;
      }
      const canonical = resolution.canonicalStory;
      const publicFlag = isCanonicalStoryPublic(canonical);
      results.push({ slug, isPublic: publicFlag });
    } catch (e) {
      console.error(`Error processing ${slug}:`, (e as Error).message);
    }
  }

  const publicSlugs = results.filter(r => r.isPublic).map(r => r.slug);
  const nonPublic = results.filter(r => !r.isPublic).map(r => r.slug);

  console.log('\n--- PUBLIC STORIES/CHAPTERS (' + publicSlugs.length + ') ---');
  console.log(publicSlugs.join('\n'));
  console.log('\n--- NON‑PUBLIC (' + nonPublic.length + ') ---');
  console.log(nonPublic.join('\n'));

  console.log('\n--- JSON OUTPUT START ---');
  console.log(JSON.stringify({ total: results.length, public: publicSlugs, nonPublic }, null, 2));
  console.log('--- JSON OUTPUT END ---');
}

enumerate();
