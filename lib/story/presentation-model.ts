/**
 * Canonical Story Presentation Model Builder
 *
 * Transforms a domain `Story` object into a pure reader-facing `StoryPresentationModel` DTO.
 * UI components consume presentation models, never raw domain models.
 *
 * Governance:
 * - Authored chapter order is authoritative and NEVER reordered by story patterns.
 * - Presentation blocks reuse canonical `StoryBlock[]` without introducing parallel types.
 * - Orientation fields are strictly optional; no content is fabricated.
 */

import type { Story, StoryBlock, TimelineEvent, Claim, Source, FAQItem } from '../../types/canonical';
import { deriveStoryTrustSignals, type TrustSignal } from './predicates/semantic';
import { deriveStoryCapabilities, type StoryCapabilities } from './predicates/capability';
import { filterRelevantTimelineEvents } from './predicates/relevance';

export interface StoryHeroModel {
  category: string;
  storyTypeLabel: string;
  headline: string;
  dek: string;
  author: string;
  publishedAt: string;
  updatedAt: string;
  readingTimeMinutes: number;
  trustSignals: TrustSignal[];
  heroMedia?: {
    url: string;
    altText: string;
    caption?: string;
    credit?: string;
  };
}

export interface StoryOrientationModel {
  question?: string;
  centralFinding?: string;
  keyTakeaways?: string[];
  keyNumbers?: Array<{ label: string; value: string; period?: string; source?: string }>;
  whyItMatters?: string;
}

export interface StoryChapterPresentation {
  id: string;
  order: number;
  title: string;
  eyebrow?: string;
  /** Reuses canonical StoryBlock[] presentation contract without introducing parallel types */
  blocks: StoryBlock[];
}

export interface StoryTimelinePresentation {
  events: Array<{
    date: string;
    title: string;
    description: string;
    source?: string;
  }>;
}

export interface EvidencePresentation {
  summaryState?: 'established' | 'debated' | 'contested' | 'unverified';
  summaryText?: string;
  claims: Array<{
    id: string;
    statement: string;
    status: 'supported' | 'unverified' | 'mixed' | 'not_supported';
    explanation: string;
    sources: Array<{ title: string; url: string; publisher?: string }>;
    limitations?: string;
  }>;
}

export interface ResearchAppendixPresentation {
  claims: EvidencePresentation['claims'];
  sources: Array<{
    title: string;
    url: string;
    publisher?: string;
    organization?: string;
    date?: string;
    sourceType?: string;
    tierLabel?: string;
  }>;
  methodology?: string;
  dataNotes?: string;
  corrections?: Array<{ date: string; description: string }>;
  versionHistory?: Array<{ date: string; description: string }>;
  faq?: Array<{ question: string; answer: string }>;
}

export interface RelatedStoryPresentation {
  slug: string;
  headline: string;
  summary?: string;
  category?: string;
  publishedAt?: string;
  readingTimeMinutes?: number;
  relationshipContext?: string;
  image?: {
    url: string;
    altText: string;
  };
}

export interface StoryPresentationModel {
  storySlug: string;
  hero: StoryHeroModel;
  orientation?: StoryOrientationModel;
  chapters: StoryChapterPresentation[];
  toc: Array<{ id: string; label: string; level: number }>;
  capabilities: StoryCapabilities;
  timeline?: StoryTimelinePresentation;
  evidence?: EvidencePresentation;
  research?: ResearchAppendixPresentation;
  relatedStories: RelatedStoryPresentation[];
}

function extractOrientationModel(story: Story): StoryOrientationModel | undefined {
  const keyPoints: string[] = [];
  let centralFinding: string | undefined = undefined;
  let whyItMatters: string | undefined = undefined;
  const keyNumbers: Array<{ label: string; value: string; period?: string; source?: string }> = [];

  // Check structured takeaway field
  if (story.takeaway) {
    centralFinding = story.takeaway;
  }

  // Check executive summary block if available
  const execSummaryBlock = story.blocks?.find((b) => b.type === 'executive-summary');
  if (execSummaryBlock?.data) {
    const data = execSummaryBlock.data as any;
    if (data.keyPoints && Array.isArray(data.keyPoints)) {
      keyPoints.push(...data.keyPoints);
    }
    if (data.takeaway && !centralFinding) {
      centralFinding = data.takeaway;
    }
    if (data.whyItMatters) {
      whyItMatters = data.whyItMatters;
    }
  }

  // Extract key numbers from quick-facts or key-numbers blocks
  const keyNumberBlocks = story.blocks?.filter((b) => b.type === 'key-numbers' || b.type === 'quick-facts');
  if (keyNumberBlocks) {
    for (const b of keyNumberBlocks) {
      const items = (b.data as any)?.items || [];
      for (const item of items) {
        if (item.label && item.value) {
          keyNumbers.push({
            label: item.label,
            value: item.value,
            period: item.period || item.date,
            source: item.source,
          });
        }
      }
    }
  }

  // Omit orientation entirely if no structured orientation data exists
  if (!centralFinding && keyPoints.length === 0 && keyNumbers.length === 0 && !whyItMatters) {
    return undefined;
  }

  return {
    centralFinding,
    keyTakeaways: keyPoints.length > 0 ? keyPoints : undefined,
    keyNumbers: keyNumbers.length > 0 ? keyNumbers : undefined,
    whyItMatters,
  };
}

function extractChaptersPresentation(story: Story): StoryChapterPresentation[] {
  // Preserve explicit authored block region & order
  const mainBlocks = story.blocks?.filter((b) => !b.region || b.region === 'main') || [];
  
  // Group blocks by chapter headings if present, otherwise group into single main chapter
  const chapters: StoryChapterPresentation[] = [];
  let currentChapterBlocks: StoryBlock[] = [];
  let currentChapterTitle = 'Main Narrative';
  let currentChapterId = 'chapter-0';
  let chapterIndex = 0;

  for (const block of mainBlocks) {
    if (block.type === 'chapter-heading' || block.type === 'heading-1') {
      if (currentChapterBlocks.length > 0) {
        chapters.push({
          id: currentChapterId,
          order: chapterIndex++,
          title: currentChapterTitle,
          blocks: currentChapterBlocks,
        });
        currentChapterBlocks = [];
      }
      currentChapterTitle = (block.data as any)?.title || (block.data as any)?.text || `Chapter ${chapterIndex + 1}`;
      currentChapterId = `chapter-${chapterIndex}`;
    } else {
      currentChapterBlocks.push(block);
    }
  }

  if (currentChapterBlocks.length > 0 || chapters.length === 0) {
    chapters.push({
      id: currentChapterId,
      order: chapterIndex,
      title: currentChapterTitle,
      blocks: currentChapterBlocks,
    });
  }

  return chapters;
}

function extractTOC(
  chapters: StoryChapterPresentation[],
  capabilities: StoryCapabilities,
  orientation?: StoryOrientationModel
): Array<{ id: string; label: string; level: number }> {
  const toc: Array<{ id: string; label: string; level: number }> = [];

  const hasOrientationContent = Boolean(
    orientation &&
    (orientation.centralFinding ||
     (orientation.keyTakeaways && orientation.keyTakeaways.length > 0) ||
     (orientation.keyNumbers && orientation.keyNumbers.length > 0) ||
     orientation.whyItMatters)
  );

  if (hasOrientationContent) {
    toc.push({ id: 'orientation', label: 'Short Version', level: 1 });
  }

  for (const ch of chapters) {
    toc.push({ id: ch.id, label: ch.title, level: 1 });
  }

  if (capabilities.hasMeaningfulTimeline) {
    toc.push({ id: 'timeline', label: 'Timeline', level: 1 });
  }

  if (capabilities.hasResearchAppendix) {
    toc.push({ id: 'research-appendix', label: 'Sources & Documentation', level: 1 });
  }

  if (capabilities.hasRelatedStories) {
    toc.push({ id: 'continue-exploring', label: 'Continue Exploring', level: 1 });
  }

  return toc;
}

export function buildStoryPresentationModel(
  story: Story,
  rawTimelineCandidateEvents: TimelineEvent[] = [],
  rawRelatedStories: Story[] = []
): StoryPresentationModel {
  // 1. Filter timeline with strict explicit relevance rules
  const allTimelineEvents = [...(story.timeline || []), ...rawTimelineCandidateEvents];
  const filteredTimelineEvents = filterRelevantTimelineEvents(allTimelineEvents, story);

  // 2. Map related stories into presentation DTOs
  const relatedStoriesPresentation: RelatedStoryPresentation[] = (rawRelatedStories || [])
    .filter((rs) => rs && rs.slug !== story.slug)
    .map((rs) => ({
      slug: rs.slug,
      headline: rs.headline || rs.title,
      summary: rs.summary,
      category: rs.category,
      publishedAt: rs.publishedAt,
      readingTimeMinutes: rs.readingTime || 5,
      image: rs.heroImage && !rs.heroImage.includes('placehold.co') ? { url: rs.heroImage, altText: rs.headline } : undefined,
    }));

  // 3. Derive capabilities
  const capabilities = deriveStoryCapabilities(story, filteredTimelineEvents, relatedStoriesPresentation);

  // 4. Derive semantic trust signals
  const trustSignals = deriveStoryTrustSignals(story);

  // 5. Hero Model
  const hero: StoryHeroModel = {
    category: story.category || 'policy',
    storyTypeLabel: (story.storyType || 'explainer').replace(/_/g, ' ').toUpperCase(),
    headline: story.headline || story.title,
    dek: story.summary,
    author: story.author || 'The Breakdown Editorial',
    publishedAt: story.publishedAt,
    updatedAt: story.updatedAt || story.publishedAt,
    readingTimeMinutes: story.readingTime || 5,
    trustSignals,
    heroMedia: story.heroImage && !story.heroImage.includes('placehold.co')
      ? { url: story.heroImage, altText: story.headline }
      : undefined,
  };

  // 6. Orientation Model (optional)
  const orientation = extractOrientationModel(story);

  // 7. Chapter presentation (authored order preserved)
  const chapters = extractChaptersPresentation(story);

  // 8. TOC extraction
  const toc = extractTOC(chapters, capabilities, orientation);

  // 9. Timeline presentation
  const timelinePresentation: StoryTimelinePresentation | undefined = capabilities.hasMeaningfulTimeline
    ? {
        events: filteredTimelineEvents.map((e) => ({
          date: e.date,
          title: e.title,
          description: e.description,
          source: (e as any).source,
        })),
      }
    : undefined;

  // 10. Evidence presentation
  const claimsList = (story.claims || []).map((c, i) => {
    const status = c.status === 'verified' || c.status === 'strong'
      ? 'supported'
      : (c as any).verification === 'misleading' || c.status === 'moderate'
      ? 'mixed'
      : (c as any).verification === 'false'
      ? 'not_supported'
      : 'unverified';

    return {
      id: c.id || `claim-${story.slug}-${i}`,
      statement: c.claim || '',
      status: status as 'supported' | 'unverified' | 'mixed' | 'not_supported',
      explanation: c.data || (c as any).explanation || '',
      sources: c.source ? [{ title: c.source, url: c.sourceUrl || '' }] : [],
      limitations: (c as any).limitations,
    };
  });

  const evidencePresentation: EvidencePresentation | undefined = capabilities.hasEvidence
    ? {
        claims: claimsList,
      }
    : undefined;

  // 11. Sources & Documentation presentation
  const researchPresentation: ResearchAppendixPresentation | undefined = capabilities.hasResearchAppendix
    ? {
        claims: claimsList,
        sources: (story.sources || []).map((s) => {
          const rawTitle = s.title || (s as any).name || 'Documentary Source';
          let org = (s as any).publisher || (s as any).organization;
          if (!org || org === rawTitle) {
            const t = rawTitle.toLowerCase();
            if (t.includes('gazette') || t.includes('ministry') || t.includes('government') || t.includes('mord') || t.includes('meity') || t.includes('mnre') || t.includes('parliament')) org = 'Government of India';
            else if (t.includes('supreme court')) org = 'Supreme Court of India';
            else if (t.includes('rbi') || t.includes('reserve bank')) org = 'Reserve Bank of India';
            else if (t.includes('npci') || t.includes('upi')) org = 'National Payments Corporation of India';
            else if (t.includes('cag') || t.includes('comptroller')) org = 'Comptroller & Auditor General';
            else if (t.includes('eci') || t.includes('election commission')) org = 'Election Commission of India';
            else if (t.includes('who') || t.includes('cancer report')) org = 'World Health Organization';
            else if (t.includes('un') || t.includes('security council')) org = 'United Nations';
            else if (t.includes('prs')) org = 'PRS Legislative Research';
            else if (t.includes('ceew')) org = 'Council on Energy, Environment and Water';
            else org = (s as any).type ? String((s as any).type).toUpperCase() : 'Official Authority';
          }
          const isPrimary = s.tier === 1 || (s as any).type === 'government' || (s as any).type === 'statutory' || (s as any).type === 'primary';
          const typeLabel = isPrimary ? 'Primary Statutory Record' : s.tier === 2 ? 'Official Dataset' : 'Reference Document';

          return {
            title: rawTitle,
            url: s.url || '',
            publisher: org,
            organization: org,
            date: (s as any).date || (s as any).accessedAt || undefined,
            sourceType: typeLabel,
            tierLabel: typeLabel,
          };
        }),
        faq: (story.faq || []).map((f) => ({ question: f.question, answer: f.answer })),
        versionHistory: story.versionHistory?.map((v) => ({ date: v.date, description: v.description })),
      }
    : undefined;

  return {
    storySlug: story.slug,
    hero,
    orientation,
    chapters,
    toc,
    capabilities,
    timeline: timelinePresentation,
    evidence: evidencePresentation,
    research: researchPresentation,
    relatedStories: relatedStoriesPresentation,
  };
}
