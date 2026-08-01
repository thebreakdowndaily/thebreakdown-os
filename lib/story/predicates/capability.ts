/**
 * Capability Predicates
 * Determines structural eligibility of optional components without fabricating missing content.
 */

import type { Story, TimelineEvent } from '@/types/canonical';

export interface StoryCapabilities {
  hasOrientation: boolean;
  hasNarrative: boolean;
  hasEvidence: boolean;
  hasMeaningfulTimeline: boolean;
  hasKeyNumbers: boolean;
  hasVisualizations: boolean;
  hasUncertainty: boolean;
  hasFAQ: boolean;
  hasResearchAppendix: boolean;
  hasRelatedStories: boolean;
}

export function deriveStoryCapabilities(
  story: Story,
  filteredTimeline: TimelineEvent[],
  validatedRelatedStories: any[]
): StoryCapabilities {
  const hasOrientation = Boolean(
    story.summary ||
    story.takeaway ||
    (story.blocks && story.blocks.some((b) => b.type === 'executive-summary'))
  );

  const hasNarrative = Boolean(story.blocks && story.blocks.length > 0);

  const hasEvidence = Boolean(
    (story.claims && story.claims.length > 0) ||
    (story.blocks && story.blocks.some((b) => b.type === 'claim' || b.type === 'evidence-summary'))
  );

  const hasMeaningfulTimeline = filteredTimeline.length >= 2;

  const hasKeyNumbers = Boolean(
    story.blocks &&
    story.blocks.some(
      (b) =>
        b.type === 'key-numbers' ||
        b.type === 'quick-facts' ||
        (b.data && Array.isArray((b.data as any).items) && (b.data as any).items.length > 0)
    )
  );

  const hasVisualizations = Boolean(
    (story.charts && story.charts.length > 0) ||
    (story.blocks && story.blocks.some((b) => b.type === 'chart' || b.type === 'map'))
  );

  const hasUncertainty = Boolean(
    (story.claims &&
      story.claims.some(
        (c) =>
          c.status === 'moderate' ||
          c.status === 'unverified' ||
          (c as any).verification === 'misleading' ||
          (c as any).verification === 'unverifiable'
      )) ||
    (story.blocks && story.blocks.some((b) => b.type === 'misconception' || b.type === 'debate'))
  );

  const hasFAQ = Boolean(story.faq && story.faq.length > 0);

  const hasResearchAppendix = Boolean(
    hasEvidence ||
    (story.sources && story.sources.length > 0) ||
    hasFAQ ||
    (story.versionHistory && story.versionHistory.length > 0)
  );

  const hasRelatedStories = validatedRelatedStories.length > 0;

  return {
    hasOrientation,
    hasNarrative,
    hasEvidence,
    hasMeaningfulTimeline,
    hasKeyNumbers,
    hasVisualizations,
    hasUncertainty,
    hasFAQ,
    hasResearchAppendix,
    hasRelatedStories,
  };
}
