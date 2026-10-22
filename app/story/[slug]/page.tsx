import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ClientStoryExperience } from '@/components/rxs/ClientStoryExperience';
import { buildStoryMetadata } from '@/lib/story/metadata';
import { resolveStory, getAllStoryAndChapterSlugs } from '@/lib/story/resolver';
import { isCanonicalStoryPublic } from '@/lib/story/publication';
import { createStoryJsonLd } from '@/lib/seo/jsonld-story';
import { buildStoryPresentationModel } from '@/lib/story/presentation-model';
import StoryMemoryWriter from '@/components/narrative/StoryMemoryWriter';
import { bootstrapServices } from '@/lib/bootstrap';
import { listPublishedCorrections } from '@/services/editorial/corrections-service';
import { resolveNextBestUnderstanding } from '@/lib/comprehension/next-best-understanding';
import { getFixesForStory } from '@/lib/fix-helpers';
import type { Story, Fix } from '@/types/canonical';

interface StoryEntityRef {
  id?: string;
  slug?: string;
  name?: string;
  title?: string;
}

import { getCurrentPrincipal } from '@/features/auth/principal';
import { canPreviewUnpublishedStory } from '@/lib/story/preview-authorization';

export const dynamicParams = true;
export const revalidate = 60;

export async function generateStaticParams() {
  return getAllStoryAndChapterSlugs();
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const resolution = await resolveStory(slug);
  if (resolution.type === 'not_found' || !isCanonicalStoryPublic(resolution.canonicalStory)) {
    return { title: 'Story Not Found — The Breakdown' };
  }
  return buildStoryMetadata(slug);
}

export default async function StoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const resolution = await resolveStory(slug);
  if (resolution.type === 'not_found') notFound();

  const canonicalStory = resolution.canonicalStory;

  // Unpublished stories are editorial-only; authentication by itself does not grant preview access.
  // Use the authoritative server-side principal and centralized policy so guests,
  // reporters, unauthenticated users, and suspended accounts cannot preview drafts.
  if (!isCanonicalStoryPublic(canonicalStory)) {
    const principal = await getCurrentPrincipal();
    if (!canPreviewUnpublishedStory(principal)) notFound();
  }

  // TASK-08 EXP-05: internal-link strip — only emit links to topics/entities
  // that resolve to real pages (no 404 links). One variable: adding the links.
  const services = bootstrapServices();
  const topicLinks: { slug: string; name: string }[] = [];
  const seenTopics = new Set<string>();
  for (const id of canonicalStory.relatedTopicIds ?? []) {
    if (topicLinks.length >= 6 || seenTopics.has(id)) continue;
    seenTopics.add(id);
    const topic = (await services.topics.getTopicBySlug(id)) || (await services.topics.getTopic(id));
    if (topic) topicLinks.push({ slug: topic.slug || id, name: topic.name });
  }

  const entityLinks: { slug: string; name: string }[] = [];
  const resolvedEntities: { slug: string; name: string }[] = [];
  const storyWithEntities = canonicalStory as Story & { relatedEntities?: StoryEntityRef[] };
  const allEntityCandidates = [
    ...(storyWithEntities.relatedEntities ?? []).map((re) => re.id || re.slug || ''),
    ...(canonicalStory.relatedEntityIds ?? []),
  ];
  const seenEntitySlugs = new Set<string>();
  for (const idOrSlug of allEntityCandidates) {
    if (!idOrSlug) continue;
    const resolved = (await services.entities.getEntityBySlug(idOrSlug)) || (await services.entities.getEntity(idOrSlug));
    if (resolved && !seenEntitySlugs.has(resolved.slug)) {
      seenEntitySlugs.add(resolved.slug);
      const name = resolved.name || (resolved as any).title || resolved.slug;
      resolvedEntities.push({ slug: resolved.slug, name });
      if (entityLinks.length < 6) {
        entityLinks.push({ slug: resolved.slug, name });
      }
    }
  }

  // 1. Build Canonical Story Presentation Model DTO
  const presentationModel = buildStoryPresentationModel(
    canonicalStory,
    resolution.candidateTimelineEvents,
    resolution.relatedStories
  );

  // 3. Fetch published editorial errata/corrections for this story (GAP-VS8-01)
  const publishedCorrections = await listPublishedCorrections(slug);

  // 3a. Resolve Fixes and Next Best Understanding plan via Service Layer
  let relatedFixes: Fix[] = [];
  let nextBestPlan;
  try {
    const fixesRes = await services.fixes.getFixes();
    const allFixes = fixesRes?.data || [];
    relatedFixes = getFixesForStory(slug, allFixes);
    nextBestPlan = resolveNextBestUnderstanding(slug, {
      story: canonicalStory,
      fixes: allFixes,
      otherStories: resolution.relatedStories as unknown as Story[],
      entityLookup: (id: string) => {
        const match = resolvedEntities.find((e) => e.slug === id);
        return match ? { slug: match.slug, name: match.name, title: match.name } : undefined;
      },
    });
  } catch {
    // Fail-open for client-side fallback if fixes service is unavailable
  }

  // 4. Build JSON-LD — after corrections and entities are resolved so schema is enriched
  const jsonLd = createStoryJsonLd(canonicalStory, {
    entities: resolvedEntities,
    corrections: publishedCorrections?.map((c) => ({
      timestamp: c.createdAt || c.updatedAt || canonicalStory.updatedAt || canonicalStory.publishedAt,
      description: c.explanation || c.correctedWording || '',
    })),
  });

  return (
    <>
      {/* Narrative Memory writer — passive localStorage write, side-effect only */}
      <StoryMemoryWriter slug={slug} headline={canonicalStory.headline} />

      {jsonLd.map((ld, i) => (
        <script
          key={`sc-${String(i)}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(ld).replace(/</g, '\\u003c'),
          }}
        />
      ))}

      <Suspense fallback={null}>
        <ClientStoryExperience
          presentationModel={presentationModel}
          relatedTopicLinks={topicLinks}
          relatedEntityLinks={entityLinks}
          publishedCorrections={publishedCorrections}
          nextBestPlan={nextBestPlan}
          relatedFixes={relatedFixes}
        />
      </Suspense>
    </>
  );
}
