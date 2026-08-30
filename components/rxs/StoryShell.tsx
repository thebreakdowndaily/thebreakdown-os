'use client';

import { useState, useEffect, useRef } from 'react';
import { captureEvent } from '@/lib/analytics/capture';
import type { VisibleStoryExperience } from '@/lib/story/reading-mode-policy';
import type { Chapter } from '@/types/canonical';
import type { ChapterGraph } from '@/lib/knowledge/knowledge-graph';
import { StoryHeroCanonical } from '@/components/story/StoryHeroCanonical';
import { StoryOrientation } from '@/components/story/StoryOrientation';
import { StoryOrientationRail } from '@/components/story/StoryOrientationRail';
import { StoryResearchAppendix } from '@/components/story/StoryResearchAppendix';
import { BlockRenderer } from '@/components/story/blocks/registry';
import NextExploration from '@/components/story/NextExploration';
import ExploreConnections from '@/components/story/ExploreConnections';
import { StoryProgress, StoryProgressBar } from '@/components/rxs/StoryProgress';
import { ReadingRegion } from '@/components/rxs/regions/ReadingRegion';
import { LearningFooter } from '@/components/rxs/LearningFooter';
import { extractTocItems } from '@/lib/toc';
import { useReadingDepth, useSetReadingDepth } from '@/components/knowledge-library/reader/ReadingModeContext';
import StoryNewsletterCTA from '@/components/retention/StoryNewsletterCTA';
import RecentlyRead from '@/components/retention/RecentlyRead';
import SaveStoryButton from '@/components/retention/SaveStoryButton';
import { AdSlot } from '@/components/monetization/AdSlot';
import { AdBlockDetector } from '@/components/monetization/AdBlockDetector';
import { PaywallOverlay } from '@/components/monetization/PaywallOverlay';
import { CitationExporter } from '@/components/intel/CitationExporter';
import { SocialSharePanel } from '@/components/retention/SocialSharePanel';

interface StoryShellProps {
  visibleExperience?: VisibleStoryExperience;
  // Legacy chapter support props
  chapter?: Chapter;
  collectionSlug?: string;
  volumeSlug?: string;
  enrichedClaims?: any[];
  claimCount?: number;
  evidenceCount?: number;
  thinkerCount?: number;
  documentCount?: number;
  graph?: ChapterGraph;
  nextChapter?: { title: string; slug: string } | null;
  relatedInvestigation?: { title: string; slug: string } | null;
  // TASK-08 EXP-05: contextual internal links (topics/entities that resolve)
  relatedTopicLinks?: { slug: string; name: string }[];
  relatedEntityLinks?: { slug: string; name: string }[];
}

export function StoryShell({
  visibleExperience,
  chapter,
  collectionSlug,
  volumeSlug,
  enrichedClaims,
  nextChapter,
  relatedInvestigation,
  relatedTopicLinks,
  relatedEntityLinks,
}: StoryShellProps) {
  const [readingProgress, setReadingProgress] = useState(0);
  const [isSupporter, setIsSupporter] = useState(false);
  const openedRef = useRef(false);
  const completedRef = useRef(false);

  useEffect(() => {
    setIsSupporter(localStorage.getItem('tb_supporter') === 'true');
  }, []);

  const contentId = visibleExperience?.storySlug || chapter?.slug || '';
  const contentType = visibleExperience ? 'story' : chapter ? 'chapter' : '';

  // TASK-07: story_opened fires once per view; story_completed fires once
  // when the reader reaches 90% scroll depth (reading intent marker).
  useEffect(() => {
    if (!contentId) return;
    if (!openedRef.current) {
      openedRef.current = true;
      captureEvent('story_opened', {
        content_id: contentId,
        content_type: contentType,
      });
    }
    if (!completedRef.current && readingProgress >= 90) {
      completedRef.current = true;
      captureEvent('story_completed', {
        content_id: contentId,
        content_type: contentType,
        scroll_depth_pct: Math.round(readingProgress),
      });
    }
  }, [contentId, contentType, readingProgress]);

  useEffect(() => {
    let rafId: number;
    const updateProgress = () => {
      const article = document.querySelector('article');
      if (!article) return;
      const rect = article.getBoundingClientRect();
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const articleTop = rect.top + scrollTop;
      const articleHeight = rect.height;
      const windowHeight = window.innerHeight;

      const totalScrollable = articleHeight - windowHeight;
      if (totalScrollable <= 0) {
        setReadingProgress(100);
        return;
      }
      const currentScroll = scrollTop - articleTop;
      const pct = Math.min(100, Math.max(0, (currentScroll / totalScrollable) * 100));
      setReadingProgress(pct);
    };

    const handleScroll = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(updateProgress);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll, { passive: true });
    updateProgress();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
      cancelAnimationFrame(rafId);
    };
  }, []);

  // If visibleExperience is present, render the universal story reader
  if (visibleExperience) {
    const {
      mode,
      storySlug,
      hero,
      orientation,
      chapters,
      toc,
      showTimeline,
      timeline,
      showEvidenceSummary,
      evidence,
      showResearchAppendix,
      research,
      showRelatedStories,
      relatedStories,
      crossStoryRecommendations,
      quickBrief,
    } = visibleExperience;

    return (
      <div className="min-h-screen bg-surface-canvas text-neutral-100 font-sans selection:bg-emerald-500/30 selection:text-emerald-200">
        {/* Sticky Reading Progress Bar (uses canonical z-sticky index below header) */}
        <div className="sticky top-[4rem] z-[var(--z-sticky)] w-full">
          <StoryProgressBar progress={readingProgress} />
        </div>

        <StoryProgress />

        <main id="main-content" tabIndex={-1} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 focus:outline-none">
          <AdBlockDetector />
          <div className="flex gap-12 items-start">
            {/* Desktop Orientation Rail */}
            <StoryOrientationRail
              toc={toc}
              readingTimeMinutes={hero.readingTimeMinutes}
              updatedAt={hero.updatedAt}
              hasResearchAppendix={showResearchAppendix}
            />

            {/* Main Story Article Column (Width capped 65-75 characters line length for prose) */}
            <article className="flex-1 max-w-3xl min-w-0 mx-auto">
              {/* Hero */}
              <StoryHeroCanonical hero={hero} />

              {/* Mode Switcher — semantic navigation, not ARIA tabs */}
              <nav
                aria-label="Reading mode"
                className="my-6 flex items-center gap-2 p-1 rounded-xl bg-neutral-900/80 border border-neutral-800 w-fit max-w-full overflow-x-auto"
              >
                {([
                  { modeValue: 'quick' as const, label: 'Quick Brief' },
                  { modeValue: 'standard' as const, label: 'Standard' },
                  { modeValue: 'deep' as const, label: 'Deep Research' },
                ]).map(({ modeValue, label }) => (
                  <a
                    key={modeValue}
                    href={`/story/${storySlug}?mode=${modeValue}`}
                    aria-current={mode === modeValue ? 'page' : undefined}
                    className={`focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg-canvas)] px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-colors ${
                      mode === modeValue ? 'bg-[var(--color-brand-400)] text-neutral-950 font-bold' : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    {label}
                  </a>
                ))}
              </nav>

              {/* Quick Brief View */}
              {mode === 'quick' && quickBrief && (
                <section id="quick-brief" aria-live="polite" aria-label="30-Second Brief" className="my-8 p-6 rounded-2xl bg-neutral-900/60 border border-neutral-800 space-y-6">
                  <div>
                    <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-widest block mb-2">
                      Question
                    </span>
                    <h3 className="text-xl font-bold text-white leading-snug">{quickBrief.question}</h3>
                  </div>

                  {quickBrief.answer && (
                    <div>
                      <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-widest block mb-1">
                        Answer
                      </span>
                      <p className="text-base text-neutral-200 leading-relaxed font-medium">{quickBrief.answer}</p>
                    </div>
                  )}

                  {quickBrief.keyFindings && (
                    <div id="key-findings" className="pt-4 border-t border-neutral-800 space-y-2">
                      <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-widest block mb-2">
                        What the Evidence Shows
                      </span>
                      <ul className="space-y-2 text-sm text-neutral-300">
                        {quickBrief.keyFindings.map((finding, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="text-emerald-500 font-bold">•</span>
                            <span>{finding}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {quickBrief.whyItMatters && (
                    <div className="pt-4 border-t border-neutral-800">
                      <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-widest block mb-1">
                        Why It Matters
                      </span>
                      <p className="text-sm text-neutral-300">{quickBrief.whyItMatters}</p>
                    </div>
                  )}

                  {quickBrief.essentialSources && (
                    <div id="essential-sources" className="pt-4 border-t border-neutral-800 text-xs">
                      <span className="text-[10px] font-mono uppercase text-neutral-400 font-bold block mb-2">
                        Key Sources
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {quickBrief.essentialSources.map((src, i) => (
                          <a
                            key={i}
                            href={src.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-2.5 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-emerald-400 transition-colors"
                          >
                            {src.title} ↗
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </section>
              )}

              {/* Standard & Deep Views */}
              {mode !== 'quick' && (
                <>
                  {/* Short Version Orientation */}
                  <StoryOrientation orientation={orientation} />
                  <SocialSharePanel storySlug={storySlug} storyTitle={hero.headline} />
                  <SaveStoryButton slug={storySlug} headline={hero.headline} />

                  <AdSlot placement="leaderboard" storySlug={storySlug} />

                  <CitationExporter storySlug={storySlug} storyTitle={hero.headline} />

                  {/* Main Chapters */}
                  <div className="space-y-12 my-8 prose prose-invert max-w-none">
                    {chapters.map((ch) => (
                      <section key={ch.id} id={ch.id} className="space-y-6">
                        {ch.title && ch.title !== 'Main Narrative' && (
                          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight border-b border-neutral-800/80 pb-3">
                            {ch.title}
                          </h2>
                        )}

                        <div className="space-y-6">
                          {ch.blocks.map((block) => (
                            <BlockRenderer key={block.id} block={block as any} />
                          ))}
                        </div>
                      </section>
                    ))}
                  </div>

                  <AdSlot placement="mpu" storySlug={storySlug} />

                  {/* Timeline */}
                  {showTimeline && timeline && timeline.events.length > 0 && (
                    <section id="timeline" className="my-12 p-6 rounded-2xl bg-neutral-900/40 border border-neutral-800/80 space-y-6">
                      <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        Relevant Chronology & Timeline
                      </h3>
                      <div className="space-y-4">
                        {timeline.events.map((evt, i) => (
                          <div key={i} className="pl-4 border-l-2 border-emerald-500/40 relative space-y-1">
                            <div className="absolute w-2.5 h-2.5 rounded-full bg-emerald-500 -left-[6px] top-1" />
                            <time className="text-xs font-mono font-bold text-emerald-400 block">{evt.date}</time>
                            <h4 className="text-sm font-semibold text-white">{evt.title}</h4>
                            <p className="text-xs text-neutral-300 leading-relaxed">{evt.description}</p>
                          </div>
                        ))}
                      </div>
                    </section>
                  )}

                  {/* Evidence Summary / Uncertainty */}
                  {showEvidenceSummary && evidence && evidence.claims.length > 0 && (
                    <section id="uncertainty" aria-labelledby="uncertainty-title" className="my-12 p-6 rounded-2xl bg-neutral-900/40 border border-neutral-800/80 space-y-4">
                      <h3 id="uncertainty-title" className="text-lg font-bold text-white">State of the Evidence & Uncertainty</h3>
                      <div className="grid grid-cols-1 gap-3">
                        {evidence.claims.slice(0, 3).map((claim) => (
                          <div key={claim.id} className="p-3.5 rounded-xl bg-neutral-950/60 border border-neutral-800/60 text-xs space-y-1">
                            <span className={`font-mono text-[10px] uppercase font-bold ${
                              claim.status === 'not_supported' ? 'text-red-400' :
                              claim.status === 'mixed' ? 'text-amber-400' :
                              'text-emerald-400'
                            }`}>
                              [{claim.status.toUpperCase()}]
                            </span>
                            <p className="font-medium text-white">{claim.statement}</p>
                            {claim.explanation && <p className="text-neutral-400">{claim.explanation}</p>}
                          </div>
                        ))}
                      </div>
                    </section>
                  )}

                  {/* Research Appendix */}
                  {showResearchAppendix && (
                    mode === 'deep' && !isSupporter ? (
                      <div className="relative my-12">
                        <div className="blur-sm opacity-40 select-none pointer-events-none p-6 rounded-2xl bg-neutral-900/40 border border-neutral-800/80">
                          <h3 className="text-2xl font-bold text-white mb-6">Research Appendix & Citations</h3>
                          {research?.claims && research.claims.length > 0 && (
                            <div className="p-4 bg-neutral-950/60 rounded-xl border border-neutral-800/60 mb-4">
                              <p className="font-medium text-white">{research.claims[0].statement}</p>
                            </div>
                          )}
                        </div>
                        <div className="absolute inset-0 flex items-center justify-center top-12 z-10 h-full">
                          <PaywallOverlay placement="story_appendix" storySlug={storySlug} />
                        </div>
                      </div>
                    ) : (
                      <StoryResearchAppendix research={research} />
                    )
                  )}

                  {/* Continue Exploring */}
                  <div id="continue-exploring" className="my-12 pt-8 border-t border-neutral-800">
                      <NextExploration
                        storySlug={storySlug}
                        stories={relatedStories?.map((rs) => ({
                          id: rs.slug,
                          slug: rs.slug,
                          headline: rs.headline,
                          summary: rs.summary || '',
                          heroImage: rs.image?.url || '',
                          publishedAt: new Date().toISOString(),
                          createdAt: new Date().toISOString(),
                          updatedAt: new Date().toISOString(),
                          readingTime: rs.readingTimeMinutes || 5,
                          evidenceScore: 90,
                          category: rs.category || 'policy',
                          tags: [],
                          author: 'The Breakdown',
                          status: 'published',
                          storyType: 'standard',
                          blocks: [],
                          sources: [],
                          claims: [],
                          timeline: [],
                          faq: [],
                          charts: [],
                          relatedStoryIds: [],
                          relatedEntityIds: [],
                          relatedTopicIds: [],
                          title: rs.headline,
                        }))}
                      />
                    </div>
                  
                  <StoryNewsletterCTA />
                  <RecentlyRead currentSlug={storySlug} />

                  <AdSlot placement="leaderboard" storySlug={storySlug} />

                  {/* Cross-Story Intelligence Connections Drawer */}
                  {crossStoryRecommendations && crossStoryRecommendations.length > 0 && (
                    <ExploreConnections
                      recommendations={crossStoryRecommendations}
                      readingMode={mode}
                      storySlug={storySlug}
                    />
                  )}

                  {/* TASK-08 EXP-05: contextual internal links to topics & entities that exist */}
                  {((relatedTopicLinks?.length ?? 0) > 0 || (relatedEntityLinks?.length ?? 0) > 0) && (
                    <section
                      aria-label="Related topics and entities"
                      className="my-12 p-6 rounded-2xl bg-neutral-900/40 border border-neutral-800/80 space-y-4"
                    >
                      <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        Related Topics &amp; Entities
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {(relatedTopicLinks ?? []).map((t) => (
                          <a
                            key={`topic-${t.slug}`}
                            href={`/topic/${t.slug}`}
                            data-analytics="topic"
                            data-topic-id={t.slug}
                            className="px-3 py-1.5 rounded-lg text-xs font-mono font-medium text-emerald-400 bg-neutral-950/60 border border-neutral-700/60 hover:border-emerald-500/50 hover:text-emerald-300 transition-colors"
                          >
                            {t.name}
                          </a>
                        ))}
                        {(relatedEntityLinks ?? []).map((e) => (
                          <a
                            key={`entity-${e.slug}`}
                            href={`/entity/${e.slug}`}
                            data-analytics="entity"
                            data-entity-id={e.slug}
                            className="px-3 py-1.5 rounded-lg text-xs font-mono font-medium text-sky-400 bg-neutral-950/60 border border-neutral-700/60 hover:border-sky-500/50 hover:text-sky-300 transition-colors"
                          >
                            {e.name}
                          </a>
                        ))}
                      </div>
                    </section>
                  )}
                </>
              )}
            </article>
          </div>
        </main>
      </div>
    );
  }

  // Canonical chapter rendering pipeline
  if (chapter) {
    return (
      <ChapterShellView
        chapter={chapter}
        collectionSlug={collectionSlug}
        volumeSlug={volumeSlug}
        enrichedClaims={enrichedClaims}
        nextChapter={nextChapter}
        relatedInvestigation={relatedInvestigation}
        readingProgress={readingProgress}
      />
    );
  }

  return null;
}

function ChapterShellView({
  chapter,
  collectionSlug,
  volumeSlug,
  enrichedClaims,
  nextChapter,
  relatedInvestigation,
  readingProgress,
}: {
  chapter: Chapter;
  collectionSlug?: string;
  volumeSlug?: string;
  enrichedClaims?: any[];
  nextChapter?: { title: string; slug: string } | null;
  relatedInvestigation?: { title: string; slug: string } | null;
  readingProgress: number;
}) {
  const depth = useReadingDepth();
  const setDepth = useSetReadingDepth();

  const toc = extractTocItems(chapter.content || []).map((t) => ({
    id: t.id,
    label: t.text,
    level: t.level,
  }));

  const readingTimeMinutes =
    chapter.readingTime?.[depth] ||
    chapter.readingTime?.scholar ||
    chapter.readingTime?.explorer ||
    Math.max(1, Math.round((chapter.metadata?.wordCount || 1000) / 200));

  const hasResearchAppendix = (chapter.content || []).some(
    (b) => b.id.includes('research') || b.type === 'historiography' || b.type === 'primary-source' || b.type === 'document'
  );

  return (
    <div className="min-h-screen bg-surface-canvas text-neutral-100 font-sans selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* Sticky Reading Progress Bar */}
      <div className="sticky top-[4rem] z-[var(--z-sticky)] w-full">
        <StoryProgressBar progress={readingProgress} />
      </div>

      <StoryProgress />

      <main id="main-content" tabIndex={-1} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 focus:outline-none">
        <div className="flex gap-12 items-start">
          {/* Desktop Orientation Rail with TOC derived from chapter heading blocks */}
          <StoryOrientationRail
            toc={toc}
            readingTimeMinutes={readingTimeMinutes}
            updatedAt={chapter.updatedAt || chapter.createdAt || new Date().toISOString()}
            hasResearchAppendix={hasResearchAppendix}
          />

          {/* Main Chapter Content Column */}
          <article className="flex-1 max-w-3xl min-w-0 mx-auto">
            <header className="mb-8 border-b border-neutral-800/80 pb-6">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#C9A84C]">
                  Chapter {chapter.order}
                </span>
                <span className="text-neutral-600">·</span>
                <span className="text-xs font-mono text-neutral-400">
                  {readingTimeMinutes} min read
                </span>
                {chapter.status && (
                  <>
                    <span className="text-neutral-600">·</span>
                    <span className="text-xs font-mono text-emerald-400 uppercase">
                      [{chapter.status}]
                    </span>
                  </>
                )}
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight mb-4 font-playfair">
                {chapter.title}
              </h1>

              {chapter.summary && (
                <p className="text-lg text-neutral-300 leading-relaxed font-serif mb-6">
                  {chapter.summary}
                </p>
              )}

              {/* Mode Switcher for Chapter: Explorer / Scholar / Researcher */}
              <nav
                aria-label="Reading depth"
                className="my-6 flex items-center gap-2 p-1 rounded-xl bg-neutral-900/80 border border-neutral-800 w-fit max-w-full overflow-x-auto"
              >
                {([
                  { depthValue: 'explorer' as const, label: 'Explorer' },
                  { depthValue: 'scholar' as const, label: 'Scholar' },
                  { depthValue: 'researcher' as const, label: 'Researcher' },
                ]).map(({ depthValue, label }) => (
                  <button
                    key={depthValue}
                    type="button"
                    onClick={() => setDepth(depthValue)}
                    aria-current={depth === depthValue ? 'page' : undefined}
                    className={`focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg-canvas)] px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-colors ${
                      depth === depthValue ? 'bg-[#C9A84C] text-neutral-950 font-bold' : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </nav>
            </header>

            {/* Central Reading Viewport */}
            <ReadingRegion
              chapter={chapter}
              enrichedClaims={enrichedClaims}
            />

            {/* Learning Footer */}
            <LearningFooter
              chapter={chapter}
              collectionSlug={collectionSlug || chapter.collectionSlug || ''}
              volumeSlug={volumeSlug || chapter.volumeSlug || ''}
              nextChapter={nextChapter}
              relatedInvestigation={relatedInvestigation}
            />
          </article>
        </div>
      </main>
    </div>
  );
}
