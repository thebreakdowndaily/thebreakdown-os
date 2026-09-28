import type { MetadataRoute } from 'next';
import { getPublicStories, getEntities, getTopics, getFixes } from '@/utils/data-layer/store';
import { getKnowledgeLibrarySeedData } from '@/utils/data-layer/knowledge-library-data';

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

  // Static trust and editorial pages — use actual content review dates, not build time.
  // Using new Date() on stable pages falsely signals daily changes and wastes crawl budget.
  const STATIC_PAGE_DATES = {
    home: new Date(),  // Homepage changes frequently — use build time
    trust: new Date('2026-07-01'),
    methodology: new Date('2026-07-01'),
    editorialConstitution: new Date('2026-07-01'),
    about: new Date('2026-07-01'),
    series: new Date(),
    topics: new Date(),
    entities: new Date(),
    investigations: new Date(),
    data: new Date(),
    trackers: new Date(),
  } as const;

  const staticPages: MetadataRoute.Sitemap = [
    { url: siteUrl, lastModified: STATIC_PAGE_DATES.home, changeFrequency: 'daily', priority: 1.0 },
    { url: `${siteUrl}/about`, lastModified: STATIC_PAGE_DATES.about, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${siteUrl}/series`, lastModified: STATIC_PAGE_DATES.series, changeFrequency: 'daily', priority: 1.0 },
    { url: `${siteUrl}/topics`, lastModified: STATIC_PAGE_DATES.topics, changeFrequency: 'weekly', priority: 0.6 },
    { url: `${siteUrl}/entities`, lastModified: STATIC_PAGE_DATES.entities, changeFrequency: 'weekly', priority: 0.6 },
    { url: `${siteUrl}/organizations`, lastModified: STATIC_PAGE_DATES.entities, changeFrequency: 'weekly', priority: 0.5 },
    { url: `${siteUrl}/countries`, lastModified: STATIC_PAGE_DATES.entities, changeFrequency: 'weekly', priority: 0.5 },
    { url: `${siteUrl}/investigations`, lastModified: STATIC_PAGE_DATES.investigations, changeFrequency: 'weekly', priority: 0.8 },
    // Trust & transparency package — stable pages, real last-review dates
    { url: `${siteUrl}/founding-edition`, lastModified: new Date('2026-07-30'), changeFrequency: 'monthly', priority: 0.9 },
    { url: `${siteUrl}/methodology`, lastModified: STATIC_PAGE_DATES.methodology, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${siteUrl}/trust`, lastModified: STATIC_PAGE_DATES.trust, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${siteUrl}/editorial-constitution`, lastModified: STATIC_PAGE_DATES.editorialConstitution, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${siteUrl}/data`, lastModified: STATIC_PAGE_DATES.data, changeFrequency: 'weekly', priority: 0.6 },
    { url: `${siteUrl}/compare`, lastModified: STATIC_PAGE_DATES.data, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${siteUrl}/trackers`, lastModified: STATIC_PAGE_DATES.trackers, changeFrequency: 'daily', priority: 0.9 },
    { url: `${siteUrl}/trackers/mgnrega`, lastModified: STATIC_PAGE_DATES.trackers, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${siteUrl}/trackers/semiconductor`, lastModified: STATIC_PAGE_DATES.trackers, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${siteUrl}/trackers/upi`, lastModified: STATIC_PAGE_DATES.trackers, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${siteUrl}/trackers/pmfby`, lastModified: STATIC_PAGE_DATES.trackers, changeFrequency: 'weekly', priority: 0.9 },
  ];

  return [...staticPages, ...canonicalEntries, ...stories, ...entities, ...topics, ...fixes];
}

