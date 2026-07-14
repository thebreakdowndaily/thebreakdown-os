'use client';
// @rxs/implementation: contracts/story-shell.md — StoryExperienceController (reading state, navigation, analytics dispatch)

import { createContext, useContext, useState, useCallback, useEffect, useRef, type ReactNode } from 'react';
import { ReadingModeProvider, useSetReadingDepth, useReadingDepth } from '@/components/knowledge-library/reader/ReadingModeContext';
import { SourcesProvider } from '@/components/knowledge-library/sources/SourcesContext';
import { useStoryAnalytics } from '@/components/rxs/hooks/useStoryAnalytics';
import type { Chapter, ReadingDepth } from '@/types/canonical';

export interface StoryExperienceState {
  readingMode: ReadingDepth;
  setReadingMode: (mode: ReadingDepth) => void;
  scrollProgress: number;
  currentSection: string | null;
  activeTocItem: string | null;
  track: ReturnType<typeof useStoryAnalytics>['track'];
  chapter: Chapter;
}

const StoryExperienceContext = createContext<StoryExperienceState | null>(null);

export function useStoryExperience(): StoryExperienceState {
  const ctx = useContext(StoryExperienceContext);
  if (!ctx) throw new Error('useStoryExperience must be used within StoryExperienceController');
  return ctx;
}

function ControllerInner({ chapter, children }: { chapter: Chapter; children: ReactNode }) {
  const { track } = useStoryAnalytics(chapter.slug);
  const currentMode = useReadingDepth();
  const setDepth = useSetReadingDepth();
  const [scrollProgress, setScrollProgress] = useState(0);
  const [currentSection, setCurrentSection] = useState<string | null>(null);
  const [activeTocItem, setActiveTocItem] = useState<string | null>(null);
  const hasTrackedCompletion = useRef(false);

  const setReadingMode = useCallback((mode: ReadingDepth) => {
    const prev = currentMode;
    if (prev !== mode) {
      setDepth(mode);
      track('reading_mode_changed', { from: prev, to: mode });
    }
  }, [currentMode, setDepth, track]);

  useEffect(() => {
    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
      const max = scrollHeight - clientHeight;
      const pct = max > 0 ? Math.min(scrollTop / max, 1) : 0;
      setScrollProgress(pct);

      if (pct >= 0.9 && !hasTrackedCompletion.current) {
        hasTrackedCompletion.current = true;
        track('story_completed', { scrollProgress: pct });
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => { window.removeEventListener('scroll', handleScroll); };
  }, [track]);

  useEffect(() => {
    const headings = document.querySelectorAll('h2[id], h3[id], h4[id]');
    if (!headings.length) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute('id');
            if (id) {
              setCurrentSection(id);
              setActiveTocItem(id);
              track('section_entered', { section_id: id });
            }
            break;
          }
        }
      },
      { rootMargin: '-80px 0px -60% 0px', threshold: 0 }
    );
    headings.forEach((s) => { observer.observe(s); });
    return () => { observer.disconnect(); };
  }, [track]);

  useEffect(() => {
    track('story_started', {
      title: chapter.title,
      claimCount: chapter.content.filter(b => b.type === 'claim').length,
      evidenceCount: chapter.content.filter(b => b.type === 'evidence-summary').length,
    });
    const hash = window.location.hash.slice(1);
    if (hash) {
      setTimeout(() => {
        document.getElementById(hash)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 300);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const value: StoryExperienceState = {
    readingMode: currentMode,
    setReadingMode,
    scrollProgress,
    currentSection,
    activeTocItem,
    track,
    chapter,
  };

  return (
    <StoryExperienceContext.Provider value={value}>
      {children}
    </StoryExperienceContext.Provider>
  );
}

export function StoryExperienceController({ chapter, children }: { chapter: Chapter; children: ReactNode }) {
  return (
    <ReadingModeProvider initial="explorer">
      <SourcesProvider sources={chapter.sources}>
        <ControllerInner chapter={chapter}>
          {children}
        </ControllerInner>
      </SourcesProvider>
    </ReadingModeProvider>
  );
}
