import { getKnowledgeLibrarySeedData } from '../utils/data-layer/knowledge-library-data';
const data = getKnowledgeLibrarySeedData();
for (const lib of data) {
  for (const c of lib.collections) {
    for (const v of c.volumes) {
      for (const ch of v.chapters) {
        console.log(JSON.stringify({ lib: lib.slug, col: c.slug, vol: v.slug, chap: ch.slug, status: ch.status, publishedAt: ch.publishedAt }));
      }
    }
  }
}
