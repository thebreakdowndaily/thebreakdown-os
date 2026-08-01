/**
 * Reading Mode Policy Engine
 *
 * Applies progressive disclosure rules to a `StoryPresentationModel` without mutating or rebuilding
 * underlying domain data or presentation DTOs.
 */

import type { StoryPresentationModel, StoryChapterPresentation } from '@/lib/story/presentation-model';
import type { ReadingMode } from '@/types/canonical';
import type { CrossStoryRecommendation } from '@/services/graph/crossStoryResolver';

export interface VisibleStoryExperience {
  mode: ReadingMode;
  storySlug: string;
  hero: StoryPresentationModel['hero'];
  orientation?: StoryPresentationModel['orientation'];
  chapters: StoryChapterPresentation[];
  toc: Array<{ id: string; label: string; level: number }>;
  showTimeline: boolean;
  timeline?: StoryPresentationModel['timeline'];
  showEvidenceSummary: boolean;
  evidence?: StoryPresentationModel['evidence'];
  showResearchAppendix: boolean;
  research?: StoryPresentationModel['research'];
  showRelatedStories: boolean;
  relatedStories: StoryPresentationModel['relatedStories'];
  crossStoryRecommendations?: CrossStoryRecommendation[];
  quickBrief?: {
    question?: string;
    answer?: string;
    keyFindings?: string[];
    whyItMatters?: string;
    essentialSources?: Array<{ title: string; url: string }>;
  };
}

export function applyReadingModePolicy(
  model: StoryPresentationModel,
  mode: ReadingMode = 'standard'
): VisibleStoryExperience {
  const { capabilities } = model;

  if (mode === 'quick') {
    const keyFindings = model.orientation?.keyTakeaways || model.research?.claims.map((c) => c.statement).slice(0, 4) || [];
    const essentialSources = model.research?.sources.slice(0, 3).map((s) => ({ title: s.title, url: s.url })) || [];

    const quickBrief = {
      question: model.orientation?.question || `What is the central finding behind ${model.hero.headline}?`,
      answer: model.orientation?.centralFinding || model.hero.dek,
      keyFindings: keyFindings.length > 0 ? keyFindings : undefined,
      whyItMatters: model.orientation?.whyItMatters,
      essentialSources: essentialSources.length > 0 ? essentialSources : undefined,
    };

    return {
      mode: 'quick',
      storySlug: model.storySlug,
      hero: model.hero,
      orientation: model.orientation,
      chapters: [], // Quick mode renders Quick Brief instead of full chapter blocks
      toc: [
        { id: 'quick-brief', label: 'Quick Brief', level: 1 },
        { id: 'key-findings', label: 'Key Findings', level: 1 },
        { id: 'essential-sources', label: 'Essential Sources', level: 1 },
      ],
      showTimeline: false,
      showEvidenceSummary: false,
      showResearchAppendix: false,
      showRelatedStories: capabilities.hasRelatedStories,
      relatedStories: model.relatedStories,
      quickBrief,
    };
  }

  if (mode === 'deep') {
    return {
      mode: 'deep',
      storySlug: model.storySlug,
      hero: model.hero,
      orientation: model.orientation,
      chapters: model.chapters,
      toc: model.toc,
      showTimeline: capabilities.hasMeaningfulTimeline,
      timeline: model.timeline,
      showEvidenceSummary: capabilities.hasEvidence,
      evidence: model.evidence,
      showResearchAppendix: true, // Deep mode explicitly expands Research Appendix
      research: model.research,
      showRelatedStories: capabilities.hasRelatedStories,
      relatedStories: model.relatedStories,
    };
  }

  // Standard Mode (Default)
  return {
    mode: 'standard',
    storySlug: model.storySlug,
    hero: model.hero,
    orientation: model.orientation,
    chapters: model.chapters,
    toc: model.toc,
    showTimeline: capabilities.hasMeaningfulTimeline,
    timeline: model.timeline,
    showEvidenceSummary: capabilities.hasEvidence,
    evidence: model.evidence,
    showResearchAppendix: capabilities.hasResearchAppendix,
    research: model.research,
    showRelatedStories: capabilities.hasRelatedStories,
    relatedStories: model.relatedStories,
  };
}
