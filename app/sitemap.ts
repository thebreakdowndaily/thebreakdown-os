import type { MetadataRoute } from 'next';
import { getPublicStories, getEntities, getTopics, getFixes } from '@/utils/data-layer/store';
import { getKnowledgeLibrarySeedData } from '@/utils/data-layer/knowledge-library-data';
import { extractProblems } from '@/lib/problem-helpers';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = 'https://thebreakdown.in';

  const stories = getPublicStories({ pageSize: 100 }).data.map((s) => ({
    url: `${siteUrl}/story/${s.slug}`,
    lastModified: new Date(s.updatedAt || s.publishedAt),
    changeFrequency: 'daily' as const,
    priority: 0.9,
  }));

  const entities = getEntities({ pageSize: 100 }).data.map((e) => ({
    url: `${siteUrl}/entity/${e.slug}`,
    lastModified: new Date(e.updatedAt),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  const topics = getTopics({ pageSize: 100 }).data.map((t) => ({
    url: `${siteUrl}/topic/${t.slug}`,
    lastModified: new Date(t.updatedAt),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  const fixes = getFixes({ pageSize: 100 }).data.map((f) => ({
    url: `${siteUrl}/fix/${f.slug}`,
    lastModified: new Date(f.updatedAt),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  const libraryData = getKnowledgeLibrarySeedData();
  const canonicalEntries: MetadataRoute.Sitemap = [];

  for (const library of libraryData) {
    for (const collection of library.collections) {
      canonicalEntries.push({
        url: `${siteUrl}/series/${collection.slug}`,
        lastModified: new Date(collection.updatedAt || collection.createdAt),
        changeFrequency: 'weekly',
        priority: 1.0,
      });

      for (const volume of collection.volumes) {
        canonicalEntries.push({
          url: `${siteUrl}/series/${collection.slug}/volume/${volume.slug}`,
          lastModified: new Date(volume.updatedAt || volume.createdAt),
          changeFrequency: 'monthly',
          priority: 0.9,
        });

        for (const chapter of volume.chapters) {
          if (chapter.status === 'published' || chapter.status === 'verified') {
            canonicalEntries.push({
              url: `${siteUrl}/series/${collection.slug}/volume/${volume.slug}/chapter/${chapter.slug}`,
              lastModified: new Date(chapter.updatedAt),
              changeFrequency: 'monthly',
              priority: 0.8,
            });
          }
        }
      }
    }
  }

  const staticPages: MetadataRoute.Sitemap = [
    { url: siteUrl, lastModified: new Date(), changeFrequency: 'daily', priority: 1.0 },
    { url: `${siteUrl}/series`, lastModified: new Date(), changeFrequency: 'daily', priority: 1.0 },
    { url: `${siteUrl}/topics`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.6 },
    { url: `${siteUrl}/entities`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.6 },
    { url: `${siteUrl}/organizations`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.5 },
    { url: `${siteUrl}/countries`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.5 },
    // Founding Edition public package (robots: allow) — trust & transparency pages
    { url: `${siteUrl}/founding-edition`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.9 },
    { url: `${siteUrl}/methodology`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${siteUrl}/trust`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${siteUrl}/editorial-constitution`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${siteUrl}/data`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.6 },
    { url: `${siteUrl}/problems`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${siteUrl}/compare`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${siteUrl}/evolution`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${siteUrl}/precedents`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${siteUrl}/tracking`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${siteUrl}/trackers`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${siteUrl}/trackers/mgnrega`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${siteUrl}/trackers/semiconductor`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${siteUrl}/trackers/upi`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${siteUrl}/trackers/pmfby`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
  ];

  const problems = extractProblems();
  const problemEntries: MetadataRoute.Sitemap = [];

  for (const problem of problems) {
    const lastMod = problem.lastUpdated ? new Date(parseInt(problem.lastUpdated)) : new Date();
    
    problemEntries.push({
      url: `${siteUrl}/problems/${problem.slug}`,
      lastModified: lastMod,
      changeFrequency: 'weekly',
      priority: 0.7,
    });
    problemEntries.push({
      url: `${siteUrl}/problems/${problem.slug}/compare`,
      lastModified: lastMod,
      changeFrequency: 'weekly',
      priority: 0.6,
    });
    problemEntries.push({
      url: `${siteUrl}/problems/${problem.slug}/evolution`,
      lastModified: lastMod,
      changeFrequency: 'weekly',
      priority: 0.6,
    });
    problemEntries.push({
      url: `${siteUrl}/problems/${problem.slug}/precedents`,
      lastModified: lastMod,
      changeFrequency: 'weekly',
      priority: 0.6,
    });
    problemEntries.push({
      url: `${siteUrl}/problems/${problem.slug}/tracking`,
      lastModified: lastMod,
      changeFrequency: 'weekly',
      priority: 0.6,
    });
  }

  return [...staticPages, ...canonicalEntries, ...stories, ...entities, ...topics, ...fixes, ...problemEntries];
}

