import type { FixPageViewModel, Story, Entity } from '@/types/canonical';
import type { Services } from '@/services/registry';

export async function buildFixPage(services: Services, slug: string): Promise<FixPageViewModel | null> {
  const fix = await services.fixes.getFixBySlug(slug);
  if (!fix) return null;

  const f = fix as unknown as Record<string, unknown>;
  const raw = (f._raw || f) as Record<string, unknown>;
  const relatedEntityIds = (raw.relatedEntities || []) as Array<Record<string, unknown>>;

  const relatedStoriesPromises = (fix as any).relatedStoryIds.map((id: string) => services.stories.getStory(id));
  const relatedStoriesResult = await Promise.all(relatedStoriesPromises);
  const relatedStories = relatedStoriesResult.filter(Boolean) as Story[];

  const relatedEntitiesPromises = relatedEntityIds
    .map((re) => services.entities.getEntity(re.id as string));
  const relatedEntities = (await Promise.all(relatedEntitiesPromises)).filter(Boolean) as Entity[];

  const headline = f.headline as string || f.title as string;

  return {
    fixJSON: raw,
    headline,
    summary: (f.summary as string) || '',
    tags: (f.tags || []) as string[],
    heroImage: f.heroImage as string | undefined,
    publishedAt: (f.publishedAt as string) || '',
    evidenceScore: (f.evidenceScore as number) || 0,
    readingTime: (f.readingTime as number) || 0,
    storySlug: (f.storySlug as string) || '',
    relatedStories,
    relatedEntities,
    seo: {
      title: `${headline} — The Breakdown Fix`,
      description: ((f.summary as string) || '').slice(0, 160),
      canonical: `https://thebreakdown.in/fix/${slug}`,
      ogImage: f.heroImage as string | undefined,
    },
    breadcrumbs: [
      { label: 'Home', href: '/' },
      { label: 'The Fix', href: '/fix' },
      { label: headline, href: `/fix/${slug}` },
    ],
  };
}
