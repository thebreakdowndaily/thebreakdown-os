import type { MetadataRoute } from 'next';
import { bootstrapServices } from '@/lib/bootstrap';
import { getKnowledgeLibrarySeedData } from '@/utils/data-layer/knowledge-library-data';
import { parseValidContentDate, resolveDynamicPageFreshness } from '@/lib/seo/sitemap-freshness';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = 'https://thebreakdown.in';
  const services = bootstrapServices();

  const [storiesRes, entitiesRes, topicsRes, fixesRes] = await Promise.all([
    services.stories.getPublicStories({ pageSize: 100 }),
    services.entities.getEntities({ pageSize: 100 }),
    services.topics.getTopics({ pageSize: 100 }),
    services.fixes.getFixes({ pageSize: 100 }),
  ]);

  // Static trust, governance, and directory pages — use actual content review dates.
  // Using new Date() on stable pages falsely signals daily changes and wastes crawl budget.
  const STATIC_PAGE_DATES = {
    homeBaseline: new Date('2026-09-29T00:00:00.000Z'),
    trust: new Date('2026-07-01T00:00:00.000Z'),
    methodology: new Date('2026-07-01T00:00:00.000Z'),
    editorialConstitution: new Date('2026-07-01T00:00:00.000Z'),
    about: new Date('2026-07-01T00:00:00.000Z'),
    series: new Date('2026-07-30T00:00:00.000Z'),
    topics: new Date('2026-07-30T00:00:00.000Z'),
    entities: new Date('2026-07-30T00:00:00.000Z'),
    investigations: new Date('2026-07-30T00:00:00.000Z'),
    data: new Date('2026-07-30T00:00:00.000Z'),
    trackers: new Date('2026-07-30T00:00:00.000Z'),
    corrections: new Date('2026-09-29T00:00:00.000Z'),
  } as const;

  const stories = storiesRes.data.map((s) => ({
    url: `${siteUrl}/story/${s.slug}`,
    lastModified: parseValidContentDate(s.updatedAt || s.publishedAt) || STATIC_PAGE_DATES.homeBaseline,
    changeFrequency: 'daily' as const,
    priority: 0.9,
  }));

  const entities = entitiesRes.data.map((e) => ({
    url: `${siteUrl}/entity/${e.slug}`,
    lastModified: parseValidContentDate(e.updatedAt || e.createdAt) || STATIC_PAGE_DATES.entities,
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  const topics = topicsRes.data.map((t) => ({
    url: `${siteUrl}/topic/${t.slug}`,
    lastModified: parseValidContentDate(t.updatedAt || t.createdAt) || STATIC_PAGE_DATES.topics,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  const fixes = fixesRes.data.map((f) => ({
    url: `${siteUrl}/fix/${f.slug}`,
    lastModified: parseValidContentDate(f.updatedAt || f.publishedAt) || STATIC_PAGE_DATES.data,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  const libraryData = getKnowledgeLibrarySeedData();
  const canonicalEntries: MetadataRoute.Sitemap = [];

  for (const library of libraryData) {
    for (const collection of library.collections) {
      canonicalEntries.push({
        url: `${siteUrl}/series/${collection.slug}`,
        lastModified: parseValidContentDate(collection.updatedAt || collection.createdAt) || STATIC_PAGE_DATES.series,
        changeFrequency: 'weekly',
        priority: 1.0,
      });

      for (const volume of collection.volumes) {
        canonicalEntries.push({
          url: `${siteUrl}/series/${collection.slug}/volume/${volume.slug}`,
          lastModified: parseValidContentDate(volume.updatedAt || volume.createdAt) || STATIC_PAGE_DATES.series,
          changeFrequency: 'monthly',
          priority: 0.9,
        });

        for (const chapter of volume.chapters) {
          if (chapter.status === 'published' || chapter.status === 'verified') {
            canonicalEntries.push({
              url: `${siteUrl}/series/${collection.slug}/volume/${volume.slug}/chapter/${chapter.slug}`,
              lastModified: parseValidContentDate(chapter.updatedAt) || STATIC_PAGE_DATES.series,
              changeFrequency: 'monthly',
              priority: 0.8,
            });
          }
        }
      }
    }
  }

  // Truthful, content-derived freshness for dynamic story inventory pages:
  // - Homepage reflects the latest modification of stories rendered in its inventory (lead/briefings/deep-dives)
  // - Stories Archive reflects the latest modification across the entire public story archive
  const homeLastModified = resolveDynamicPageFreshness(storiesRes.data, {
    sliceCount: 10,
    fallbackDate: STATIC_PAGE_DATES.homeBaseline,
  });

  const storiesArchiveLastModified = resolveDynamicPageFreshness(storiesRes.data, {
    fallbackDate: STATIC_PAGE_DATES.homeBaseline,
  });

  const staticPages: MetadataRoute.Sitemap = [
    { url: siteUrl, lastModified: homeLastModified, changeFrequency: 'daily', priority: 1.0 },
    { url: `${siteUrl}/about`, lastModified: STATIC_PAGE_DATES.about, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${siteUrl}/series`, lastModified: STATIC_PAGE_DATES.series, changeFrequency: 'daily', priority: 1.0 },
    { url: `${siteUrl}/topics`, lastModified: STATIC_PAGE_DATES.topics, changeFrequency: 'weekly', priority: 0.6 },
    { url: `${siteUrl}/entities`, lastModified: STATIC_PAGE_DATES.entities, changeFrequency: 'weekly', priority: 0.6 },
    { url: `${siteUrl}/organizations`, lastModified: STATIC_PAGE_DATES.entities, changeFrequency: 'weekly', priority: 0.5 },
    { url: `${siteUrl}/countries`, lastModified: STATIC_PAGE_DATES.entities, changeFrequency: 'weekly', priority: 0.5 },
    { url: `${siteUrl}/investigations`, lastModified: STATIC_PAGE_DATES.investigations, changeFrequency: 'weekly', priority: 0.8 },
    // Trust & transparency package — stable pages, real last-review dates
    { url: `${siteUrl}/founding-edition`, lastModified: new Date('2026-07-30T00:00:00.000Z'), changeFrequency: 'monthly', priority: 0.9 },
    { url: `${siteUrl}/methodology`, lastModified: STATIC_PAGE_DATES.methodology, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${siteUrl}/trust`, lastModified: STATIC_PAGE_DATES.trust, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${siteUrl}/editorial-constitution`, lastModified: STATIC_PAGE_DATES.editorialConstitution, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${siteUrl}/data`, lastModified: STATIC_PAGE_DATES.data, changeFrequency: 'weekly', priority: 0.6 },
    { url: `${siteUrl}/compare`, lastModified: STATIC_PAGE_DATES.data, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${siteUrl}/trackers`, lastModified: STATIC_PAGE_DATES.trackers, changeFrequency: 'daily', priority: 0.9 },
    { url: `${siteUrl}/trackers/mgnrega`, lastModified: STATIC_PAGE_DATES.trackers, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${siteUrl}/trackers/pmfby`, lastModified: STATIC_PAGE_DATES.trackers, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${siteUrl}/trackers/semiconductor`, lastModified: STATIC_PAGE_DATES.trackers, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${siteUrl}/trackers/upi`, lastModified: STATIC_PAGE_DATES.trackers, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${siteUrl}/stories`, lastModified: storiesArchiveLastModified, changeFrequency: 'daily', priority: 0.9 },
    { url: `${siteUrl}/fix`, lastModified: STATIC_PAGE_DATES.data, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${siteUrl}/transparency/corrections`, lastModified: STATIC_PAGE_DATES.corrections, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${siteUrl}/newsletter`, lastModified: STATIC_PAGE_DATES.series, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${siteUrl}/subscribe`, lastModified: STATIC_PAGE_DATES.about, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${siteUrl}/timeline`, lastModified: STATIC_PAGE_DATES.series, changeFrequency: 'weekly', priority: 0.7 },
  ];

  return [...staticPages, ...canonicalEntries, ...stories, ...entities, ...topics, ...fixes];
}
