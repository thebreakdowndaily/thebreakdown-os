'use client';

import React, { useEffect, useCallback } from 'react';
import { useTracking } from '@/hooks/useTracking';
import { incrementVisitCount, getVisitCount, trackEvent, flushAnalytics } from '@/utils/analytics';

interface TrackedStoryWrapperProps {
  storySlug: string;
  children: React.ReactNode;
}

/**
 * TrackedStoryWrapper — Wraps a story page with all analytics tracking.
 *
 * Tracks:
 *   - Scroll depth (useScrollTracking)
 *   - Return visits (session counter)
 *   - Page unload (flush remaining events)
 *   - Provides section refs for child tracking
 *
 * Each story section should use useSectionTracking to track its own engagement.
 */
export default function TrackedStoryWrapper({ storySlug, children }: TrackedStoryWrapperProps) {
  // Track scroll depth across the entire story
  useTracking({ storySlug, enableScrollTracking: true });

  // Track return visit on mount
  useEffect(() => {
    const visitCount = getVisitCount();
    incrementVisitCount();

    if (visitCount > 1) {
      // This is a return visit — track it
      trackEvent({
        type: 'return_visit',
        storySlug,
        visitCount,
      });
    }
  }, [storySlug]);

  // Flush analytics on page unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      flushAnalytics();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        flushAnalytics();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      flushAnalytics();
    };
  }, [storySlug]);

  return (
    <div data-story-slug={storySlug} data-tracked="true">
      {children}
    </div>
  );
}

// ── Section Tracking Helper ────────────────────────────────────────────────

interface TrackedSectionProps {
  storySlug: string;
  sectionId: string;
  children: React.ReactNode;
  as?: React.ElementType;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * TrackedSection — Wraps a story section and tracks time-on-section.
 *
 * Usage:
 *   <TrackedSection storySlug="my-story" sectionId="evidence">
 *     <EvidenceSection ... />
 *   </TrackedSection>
 */
export function TrackedSection({
  storySlug,
  sectionId,
  children,
  as: Tag = 'section',
  className,
  style,
}: TrackedSectionProps) {
  const { registerSection } = useTracking({ storySlug });

  return (
    <Tag
      id={sectionId}
      ref={registerSection(sectionId)}
      data-section-id={sectionId}
      className={className}
      style={style}
    >
      {children}
    </Tag>
  );
}

// ── Share Tracking ─────────────────────────────────────────────────────────

interface ShareTrackerProps {
  storySlug: string;
  headline: string;
}

/**
 * ShareTracker — Provides share buttons with analytics tracking.
 * Fires analytics event before opening share dialog.
 */
export function ShareTracker({ storySlug, headline }: ShareTrackerProps) {
  const handleShare = useCallback(
    (medium: 'twitter' | 'linkedin' | 'whatsapp' | 'copy_link') => {
      const url = `${window.location.origin}/story/${storySlug}`;
      const text = `${headline} — The Breakdown`;

      trackEvent({
        type: 'share',
        storySlug,
        medium,
      });

      switch (medium) {
        case 'twitter':
          window.open(
            `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
            '_blank',
            'noopener'
          );
          break;
        case 'linkedin':
          window.open(
            `https://linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
            '_blank',
            'noopener'
          );
          break;
        case 'whatsapp':
          window.open(
            `https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`,
            '_blank',
            'noopener'
          );
          break;
        case 'copy_link':
          void navigator.clipboard.writeText(url).catch(() => {
            const ta = document.createElement('textarea');
            ta.value = url;
            document.body.appendChild(ta);
            ta.select();
            document.body.removeChild(ta);
          });
          break;
      }
    },
    [storySlug, headline]
  );

  const buttonStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 'var(--spacing-1)',
    padding: 'var(--spacing-2) var(--spacing-3)',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--color-border-default)',
    background: 'var(--color-bg-secondary)',
    color: 'var(--color-text-secondary)',
    fontSize: 'var(--text-sm)',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  };

  return (
    <div style={{ display: 'flex', gap: 'var(--spacing-2)', flexWrap: 'wrap' }}>
      <button
        onClick={() => { handleShare('twitter'); }}
        style={buttonStyle}
        aria-label="Share on Twitter"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
        Twitter
      </button>
      <button
        onClick={() => { handleShare('linkedin'); }}
        style={buttonStyle}
        aria-label="Share on LinkedIn"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
        LinkedIn
      </button>
      <button
        onClick={() => { handleShare('whatsapp'); }}
        style={buttonStyle}
        aria-label="Share on WhatsApp"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
        WhatsApp
      </button>
      <button
        onClick={() => { handleShare('copy_link'); }}
        style={buttonStyle}
        aria-label="Copy link to story"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></svg>
        Copy Link
      </button>
    </div>
  );
}

// ── Bookmark Button ────────────────────────────────────────────────────────

interface BookmarkButtonProps {
  storySlug: string;
}

export function BookmarkButton({ storySlug }: BookmarkButtonProps) {
  const [isBookmarked, setIsBookmarked] = React.useState(false);

  useEffect(() => {
    void import('@/utils/analytics').then(({ isBookmarked: check }) => {
      setIsBookmarked(check(storySlug));
    });
  }, [storySlug]);

  const handleToggle = useCallback(async () => {
    const { toggleBookmark } = await import('@/utils/analytics');
    const action = toggleBookmark(storySlug);
    setIsBookmarked(action === 'add');

    trackEvent({
      type: 'bookmark',
      storySlug,
      action,
    });
  }, [storySlug]);

  return (
    <button
      onClick={() => { void handleToggle(); }}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 'var(--spacing-1)',
        padding: 'var(--spacing-2) var(--spacing-3)',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--color-border-default)',
        background: isBookmarked ? 'var(--color-brand-400)' : 'var(--color-bg-secondary)',
        color: isBookmarked ? 'var(--color-bg-primary)' : 'var(--color-text-secondary)',
        fontSize: 'var(--text-sm)',
        cursor: 'pointer',
        transition: 'all 0.15s ease',
      }}
      aria-label={isBookmarked ? 'Remove bookmark' : 'Bookmark this story'}
      aria-pressed={isBookmarked}
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill={isBookmarked ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2v16z" />
      </svg>
      {isBookmarked ? 'Bookmarked' : 'Bookmark'}
    </button>
  );
}
