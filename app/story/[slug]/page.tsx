import type { Metadata } from 'next';
import Script from 'next/script';
import { notFound } from 'next/navigation';
import { StoryShell } from '@/components/rxs/StoryShell';
import { buildStoryMetadata } from '@/lib/story/metadata';
import { resolveStory, getAllStoryAndChapterSlugs } from '@/lib/story/resolver';
import { isCanonicalStoryPublic } from '@/lib/story/publication';
import { createStoryJsonLd } from '@/lib/seo/jsonld-story';
import { buildStoryPresentationModel } from '@/lib/story/presentation-model';
import { applyReadingModePolicy } from '@/lib/story/reading-mode-policy';
import StoryMemoryWriter from '@/components/narrative/StoryMemoryWriter';
import type { ReadingMode } from '@/types/canonical';


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

      <StoryShell visibleExperience={visibleExperience} />
    </>
  );
}
