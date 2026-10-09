'use client';

import React from 'react';
import { useSearchParams } from 'next/navigation';
import { StoryShell } from '@/components/rxs/StoryShell';
import { applyReadingModePolicy } from '@/lib/story/reading-mode-policy';
import type { StoryPresentationModel } from '@/lib/story/presentation-model';
import type { ReadingMode, Fix } from '@/types/canonical';
import type { NextBestUnderstandingPlan } from '@/lib/comprehension/next-best-understanding';

export interface ClientStoryExperienceProps {
  presentationModel: StoryPresentationModel;
  relatedTopicLinks: { slug: string; name: string }[];
  relatedEntityLinks: { slug: string; name: string }[];
  publishedCorrections: any[];
  nextBestPlan?: NextBestUnderstandingPlan;
  relatedFixes: Fix[];
}

export function ClientStoryExperience({
  presentationModel,
  relatedTopicLinks,
  relatedEntityLinks,
  publishedCorrections,
  nextBestPlan,
  relatedFixes,
}: ClientStoryExperienceProps) {
  const searchParams = useSearchParams();
  const rawMode = searchParams.get('mode');
  const mode: ReadingMode = rawMode === 'quick' || rawMode === 'deep' ? rawMode : 'standard';

  const visibleExperience = applyReadingModePolicy(presentationModel, mode);

  return (
    <StoryShell
      visibleExperience={visibleExperience}
      relatedTopicLinks={relatedTopicLinks}
      relatedEntityLinks={relatedEntityLinks}
      publishedCorrections={publishedCorrections}
      nextBestPlan={nextBestPlan}
      relatedFixes={relatedFixes}
    />
  );
}
