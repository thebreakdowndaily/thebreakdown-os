import type { Metadata } from 'next';
import { resolveStory } from './resolver';
import { isCanonicalStoryPublic } from './publication';
import { resolveStoryHeroImage } from '@/lib/image-intelligence/service';

export async function buildStoryMetadata(slug: string): Promise<Metadata> {
  const resolution = await resolveStory(slug);

  if (resolution.type === 'not_found' || !isCanonicalStoryPublic(resolution.canonicalStory)) {
    return { title: 'Story Not Found — The Breakdown' };
  }

  if (resolution.type === 'chapter') {
    const { chapter } = resolution;
    const versionStr = `${chapter.version.major}.${chapter.version.minor}.${chapter.version.patch}`;
    return {
      title: chapter.title,
      description: chapter.summary,
      alternates: { canonical: `https://thebreakdown.in/story/${slug}` },
      openGraph: {
        title: chapter.title,
        description: chapter.summary,
        url: `https://thebreakdown.in/story/${slug}`,
        type: 'article',
      },
      twitter: {
        card: 'summary_large_image',
        title: chapter.title,
        description: chapter.summary,
      },
      other: {
        'article:version': versionStr,
      },
    };
  }

  const { story } = resolution.vm;
  const desc = story.summary.length > 155 ? story.summary.slice(0, 152) + '...' : story.summary;

  return {
    title: story.headline,
    description: desc,
    keywords: story.tags.join(', '),
    alternates: { canonical: `https://thebreakdown.in/story/${story.slug}` },
    other: {
      news_keywords: story.tags.slice(0, 10).join(', '),
    },
    openGraph: {
      title: story.headline,
      description: desc,
      type: 'article',
      publishedTime: story.publishedAt,
      modifiedTime: story.updatedAt,
      url: `https://thebreakdown.in/story/${story.slug}`,
      images: (() => {
        const resolved = resolveStoryHeroImage(story);
        const img = resolved.og?.src || resolved.hero?.src || story.heroImage;
        const isFallback = Boolean(resolved.og?.isFallback || resolved.hero?.isFallback || resolved.og?.type === 'branded-placeholder');
        const alt = isFallback
          ? (resolved.og?.alt || resolved.hero?.alt || `Editorial coverage placeholder for ${story.headline}`)
          : (story.heroImageAlt || resolved.og?.alt || story.headline);
        return img ? [{ url: img, width: resolved.og?.width || 1200, height: resolved.og?.height || 630, alt }] : [];
      })(),
      tags: story.tags.slice(0, 6),
    },
    twitter: {
      card: 'summary_large_image',
      title: story.headline,
      description: desc,
      images: (() => {
        const resolved = resolveStoryHeroImage(story);
        const img = resolved.og?.src || resolved.hero?.src || story.heroImage;
        return img ? [img] : [];
      })(),
    },
  };
}
