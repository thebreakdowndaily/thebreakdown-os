import type { Metadata } from 'next';
import Script from 'next/script';
import { notFound, permanentRedirect } from 'next/navigation';
import { StoryShell } from '@/components/rxs/StoryShell';
import { buildStoryMetadata } from '@/lib/story/metadata';
import { resolveStory, getAllStoryAndChapterSlugs } from '@/lib/story/resolver';
import { isCanonicalStoryPublic } from '@/lib/story/publication';
import { createStoryJsonLd } from '@/lib/seo/jsonld-story';
import { buildStoryPresentationModel } from '@/lib/story/presentation-model';
import { applyReadingModePolicy } from '@/lib/story/reading-mode-policy';
import StoryMemoryWriter from '@/components/narrative/StoryMemoryWriter';
import type { ReadingMode, Story } from '@/types/canonical';
import { getTopic } from '@/utils/data-layer/store';
import { getEntityById } from '@/utils/data-layer/entity-index';

interface StoryEntityRef {
  id?: string;
  slug?: string;
  name?: string;
  title?: string;
}


import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

export const dynamicParams = true;
export const revalidate = 60;

export async function generateStaticParams() {
  return getAllStoryAndChapterSlugs();
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  return buildStoryMetadata(slug);
}

export default async function StoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { slug } = await params;
  const resolvedSearchParams = await searchParams;
  const rawMode = (resolvedSearchParams.mode as string) || 'standard';
  const mode: ReadingMode = rawMode === 'quick' || rawMode === 'deep' ? rawMode : 'standard';

  const resolution = await resolveStory(slug);
  if (resolution.type === 'not_found') notFound();

  if (resolution.type === 'chapter') {
    const queryString = new URLSearchParams(resolvedSearchParams as Record<string, string>).toString();
    const dest = `/series/${resolution.collectionSlug}/volume/${resolution.volumeSlug}/chapter/${resolution.chapter.slug}${queryString ? `?${queryString}` : ''}`;
    permanentRedirect(dest);
  }

  const canonicalStory = resolution.canonicalStory;

  // Fail-closed publication safety check
  if (!isCanonicalStoryPublic(canonicalStory)) {
    let isAuthenticated = false;
    try {
      const cookieStore = await cookies();
      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder_key',
        { cookies: { getAll: () => cookieStore.getAll() } }
      );
      const { data: { session } } = await supabase.auth.getSession();
      isAuthenticated = Boolean(session);
    } catch {
      // Ignore
    }
    if (!isAuthenticated) notFound();
  }

  const jsonLd = createStoryJsonLd(canonicalStory);

  // TASK-08 EXP-05: internal-link strip — only emit links to topics/entities
  // that resolve to real pages (no 404 links). One variable: adding the links.
  const topicLinks: { slug: string; name: string }[] = [];
  const seenTopics = new Set<string>();
  for (const id of canonicalStory.relatedTopicIds ?? []) {
    if (topicLinks.length >= 6 || seenTopics.has(id)) continue;
    seenTopics.add(id);
    const topic = getTopic(id);
    if (topic) topicLinks.push({ slug: id, name: topic.name });
  }

  const entityLinks: { slug: string; name: string }[] = [];
  const storyWithEntities = canonicalStory as Story & { relatedEntities?: StoryEntityRef[] };
  for (const re of storyWithEntities.relatedEntities ?? []) {
    if (entityLinks.length >= 6) break;
    const resolved = getEntityById(re.id || re.slug || '');
    if (resolved) entityLinks.push({ slug: resolved.slug, name: resolved.title ?? resolved.name ?? resolved.slug });
  }

  // 1. Build Canonical Story Presentation Model DTO
  const presentationModel = buildStoryPresentationModel(
    canonicalStory,
    resolution.candidateTimelineEvents,
    resolution.relatedStories
  );

  // 2. Apply Reading Mode Policy for progressive disclosure
  const visibleExperience = applyReadingModePolicy(presentationModel, mode);

  return (
    <>
      {/* Narrative Memory writer — passive localStorage write, side-effect only */}
      <StoryMemoryWriter slug={slug} headline={canonicalStory.headline} />

      {jsonLd.map((ld, i) => (
        <Script key={`sc-${String(i)}`} id={`schema-${String(i)}`} type="application/ld+json" strategy="beforeInteractive">
          {JSON.stringify(ld)}
        </Script>
      ))}

      <StoryShell visibleExperience={visibleExperience} relatedTopicLinks={topicLinks} relatedEntityLinks={entityLinks} />
    </>
  );
}
