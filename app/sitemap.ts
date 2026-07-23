import type { MetadataRoute } from 'next';
import { getPublicStories, getEntities, getTopics, getFixes } from '@/utils/data-layer/store';
import { getKnowledgeLibrarySeedData } from '@/utils/data-layer/knowledge-library-data';

export default function sitemap(): MetadataRoute.Sitemap {
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
              lastModified: new Date(chapter.lastVerifiedAt ?? chapter.updatedAt ?? chapter.createdAt),
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
    { url: `${siteUrl}/stories`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
    { url: `${siteUrl}/topics`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.6 },
    { url: `${siteUrl}/entities`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.6 },
    { url: `${siteUrl}/organizations`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.5 },
    { url: `${siteUrl}/countries`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.5 },
    { url: `${siteUrl}/graph`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.3 },
    { url: `${siteUrl}/workspace`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.3 },
  ];

  return [...staticPages, ...canonicalEntries, ...stories, ...entities, ...topics, ...fixes];
}

