import React, { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { ClientStoryExperience } from '@/components/rxs/ClientStoryExperience';
import { REMEDIATED_STORIES_MAP } from '@/lib/editorial/drafts/remediated-stories';
import { buildStoryPresentationModel } from '@/lib/story/presentation-model';

export default async function StoryPreviewPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const draft = REMEDIATED_STORIES_MAP[slug];
  if (!draft) notFound();

  const presentationModel = buildStoryPresentationModel(draft);

  return (
    <main className="min-h-screen bg-[#0A0A0A] text-white">
      <div className="bg-amber-950/60 border-b border-amber-500/30 px-4 py-2 text-center text-xs font-mono text-amber-300">
        [EDITORIAL PREVIEW MODE] — Reviewing Remediated Draft for &quot;{draft.slug}&quot; (Release Hold Active)
      </div>
      <Suspense fallback={null}>
        <ClientStoryExperience
          presentationModel={presentationModel}
          relatedTopicLinks={[]}
          relatedEntityLinks={[]}
          publishedCorrections={[]}
          nextBestPlan={undefined}
          relatedFixes={[]}
        />
      </Suspense>
    </main>
  );
}
