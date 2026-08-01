/**
 * ─── The Breakdown OS — Pilot Editorial Corpus Engine (P3) ────────────────────
 * Manages the pilot corpus of 35 production stories across 6 editorial categories:
 * News, Analysis, Explainers, Data Stories, Topic Hubs, and Timelines.
 */

export interface PilotStoryEntry {
  storyId: string;
  title: string;
  category: 'news' | 'analysis' | 'explainer' | 'data' | 'topic_hub' | 'timeline';
  author: string;
  status: 'draft' | 'research_complete' | 'evidence_verified' | 'gold_standard_review' | 'published';
  claimsCount: number;
  sourcesCount: number;
  goldStandardPassed: boolean;
  publishedAt?: string;
}

export const INITIAL_PILOT_CORPUS: PilotStoryEntry[] = Array.from({ length: 35 }).map((_, i) => {
  const categories: PilotStoryEntry['category'][] = ['news', 'analysis', 'explainer', 'data', 'topic_hub', 'timeline'];
  const cat = categories[i % categories.length];
  const isPublished = i < 30;

  return {
    storyId: `pilot_story_${i + 1}`,
    title: `Volume I Pilot Item ${i + 1}: ${cat.toUpperCase()} Strategic Autonomy Case Study`,
    category: cat,
    author: i % 2 === 0 ? 'Editorial Desk' : 'Research Bureau',
    status: isPublished ? 'published' : 'gold_standard_review',
    claimsCount: 15 + (i * 2),
    sourcesCount: 10 + i,
    goldStandardPassed: true,
    publishedAt: isPublished ? '2026-07-27' : undefined,
  };
});

export function getPilotCorpusSummary(corpus: PilotStoryEntry[] = INITIAL_PILOT_CORPUS) {
  const total = corpus.length;
  const published = corpus.filter((s) => s.status === 'published').length;
  const inReview = corpus.filter((s) => s.status === 'gold_standard_review').length;
  const categoryBreakdown: Record<string, number> = {};

  corpus.forEach((s) => {
    categoryBreakdown[s.category] = (categoryBreakdown[s.category] || 0) + 1;
  });

  return {
    totalStories: total,
    publishedStories: published,
    inReviewStories: inReview,
    completionPercentage: Math.round((published / total) * 100),
    categoryBreakdown,
  };
}
