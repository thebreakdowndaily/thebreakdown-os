import type { Metadata } from 'next';
import Script from 'next/script';
import { notFound } from 'next/navigation';
import { StoryShell } from '@/components/rxs/StoryShell';
import { CanonicalStoryPage } from '@/components/story/CanonicalStoryPage';
import { buildStoryMetadata } from '@/lib/story/metadata';
import { resolveStory, getAllStoryAndChapterSlugs } from '@/lib/story/resolver';
import { isCanonicalStoryPublic } from '@/lib/story/publication';
import { createStoryJsonLd } from '@/lib/seo/jsonld-story';

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
  const mode = (resolvedSearchParams?.mode as string) || 'standard';

  const resolution = await resolveStory(slug);
  if (resolution.type === 'not_found') notFound();

  const canonicalStory = resolution.type === 'chapter'
    ? resolution.canonicalStory
    : resolution.vm.story;

  if (!isCanonicalStoryPublic(canonicalStory)) notFound();

  const jsonLd = createStoryJsonLd(canonicalStory);

  return (
    <>
      {jsonLd.map((ld, i) => (
        <Script key={`sc-${i}`} id={`schema-${i}`} type="application/ld+json" strategy="beforeInteractive">
          {JSON.stringify(ld)}
        </Script>
      ))}

      {resolution.type === 'chapter' ? (
        <StoryShell
          chapter={resolution.chapter}
          collectionSlug={resolution.collectionSlug}
          volumeSlug={resolution.volumeSlug}
          enrichedClaims={resolution.enrichedClaims}
          claimCount={resolution.claimCount}
          evidenceCount={resolution.evidenceCount}
          thinkerCount={resolution.thinkerCount}
          documentCount={resolution.documentCount}
          nextChapter={resolution.nextChapter}
          relatedInvestigation={resolution.relatedInvestigation}
        />
      ) : (
        <CanonicalStoryPage vm={resolution.vm} mode={mode} />
      )}
    </>
  );
}
