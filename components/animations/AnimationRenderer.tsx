'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';

interface AnimationStep {
  step: number;
  time: number;
  duration: number;
  action: string;
  target?: string;
  description: string;
  easing?: string;
  transition?: string;
}

interface AnimationControls {
  autoplay?: boolean;
  loop?: boolean;
  showTimeline?: boolean;
  showProgress?: boolean;
  playPauseButton?: boolean;
  speedControl?: number[];
}

interface AnimationSpec {
  animationId: string;
  type: 'cascade' | 'progressive-reveal' | 'data-animation' | 'map-animation';
  purpose: string;
  duration: number;
  steps: AnimationStep[];
  controls?: AnimationControls;
  caption: string;
  altText: string;
  theme?: string;
  lazyLoad?: boolean;
}

interface AnimationRendererProps {
  animation: AnimationSpec;
}

/**
 * AnimationRenderer — Timed visual sequence player.
 *
 * Plays planned animations step by step with controls.
 * Respects prefers-reduced-motion.
 */
const AnimationRenderer: React.FC<AnimationRendererProps> = ({ animation }) => {
  const [currentStep, setCurrentStep] = useState(-1); // -1 = before start
  const [isPlaying, setIsPlaying] = useState(animation.controls?.autoplay ?? false);
  const [speed, setSpeed] = useState(1);
  const [reducedMotion, setReducedMotion] = useState(
    typeof window !== 'undefined'
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false
  );
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Detect prefers-reduced-motion
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handler = (e: MediaQueryListEvent) => { setReducedMotion(e.matches); };
    mediaQuery.addEventListener('change', handler);
    return () => { mediaQuery.removeEventListener('change', handler); };
  }, []);

  // Play logic
  const play = useCallback(() => {
    setIsPlaying(true);
    setCurrentStep(0);
  }, []);

  const pause = useCallback(() => {
    setIsPlaying(false);
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const reset = useCallback(() => {
    pause();
    setCurrentStep(-1);
  }, [pause]);

  // Step timer
  useEffect(() => {
    if (!isPlaying || reducedMotion) return;
    if (currentStep >= animation.steps.length) {
      if (animation.controls?.loop) {
        const id = setTimeout(() => { setCurrentStep(0); }, 0);
        return () => { clearTimeout(id); };
      } else {
        const id = setTimeout(() => { setIsPlaying(false); }, 0);
        return () => { clearTimeout(id); };
      }
    }
    if (currentStep < 0) return;

    const step = animation.steps[currentStep];
    const delay = (step.duration * 1000) / speed;

    timerRef.current = setTimeout(() => {
      setCurrentStep((prev) => prev + 1);
    }, delay);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isPlaying, currentStep, speed, animation.steps, animation.controls?.loop, reducedMotion]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  // If reduced motion, show static fallback
  if (reducedMotion) {
    return (
      <figure
        ref={containerRef}
        style={{
          width: '100%',
          backgroundColor: 'var(--color-bg-secondary)',
          border: '1px solid var(--color-border-default)',
          borderRadius: 'var(--radius-lg)',
          padding: 'var(--spacing-6)',
        }}
        role="img"
        aria-label={animation.altText}
      >
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', textAlign: 'center' }}>
          Animation disabled (reduced motion preference).
          <br />
          <span style={{ fontSize: 'var(--text-xs)' }}>
            {animation.purpose} — {animation.steps.length} steps
          </span>
        </p>
        <figcaption style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: 'var(--spacing-3)', paddingTop: 'var(--spacing-3)', borderTop: '1px solid var(--color-border-default)' }}>
          {animation.caption}
        </figcaption>
      </figure>
    );
  }

  return (
    <figure
      ref={containerRef}
      style={{
        width: '100%',
        backgroundColor: 'var(--color-bg-secondary)',
        border: '1px solid var(--color-border-default)',
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
      }}
      role="img"
      aria-label={animation.altText}
    >
      {/* Purpose + controls */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: 'var(--spacing-4) var(--spacing-6)',
          borderBottom: '1px solid var(--color-border-default)',
        }}
      >
        <span style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-text-secondary)' }}>
          {animation.purpose}
        </span>

        {/* Speed control */}
        {animation.controls?.speedControl && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)' }}>
            {animation.controls.speedControl.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => { setSpeed(s); }}
                style={{
                  padding: '2px 8px',
                  borderRadius: 'var(--radius-sm)',
                  border: `1px solid ${s === speed ? 'var(--color-brand-400)' : 'var(--color-border-default)'}`,
                  backgroundColor: s === speed ? 'var(--color-bg-tertiary)' : 'transparent',
                  color: s === speed ? 'var(--color-brand-400)' : 'var(--color-text-muted)',
                  fontSize: 'var(--text-xs)',
                  cursor: 'pointer',
                }}
                aria-label={`Speed ${String(s)}x`}
              >
                {s}x
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Animation stage */}
      <div
        style={{
          minHeight: '200px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 'var(--spacing-8) var(--spacing-6)',
          position: 'relative',
        }}
      >
        {currentStep < 0 ? (
          <div style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)', textAlign: 'center' }}>
            <svg style={{ width: '48px', height: '48px', margin: '0 auto var(--spacing-3)', opacity: 0.4 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p>Press play to start</p>
          </div>
        ) : currentStep < animation.steps.length ? (
          <div style={{ textAlign: 'center', animation: currentStep >= 0 ? 'fadeIn 0.3s ease-out' : 'none' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '40px',
              height: '40px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'var(--color-brand-400)',
              color: 'var(--color-text-inverse)',
              fontWeight: 'var(--font-weight-bold)',
              fontSize: 'var(--text-sm)',
              marginBottom: 'var(--spacing-3)',
            }}>
              {currentStep + 1}
            </div>
            <p style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-text-primary)', marginBottom: 'var(--spacing-1)' }}>
              {animation.steps[currentStep].action.replace(/-/g, ' ')}
            </p>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', maxWidth: '400px', margin: '0 auto' }}>
              {animation.steps[currentStep].description}
            </p>
          </div>
        ) : (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-brand-400)', marginBottom: 'var(--spacing-2)' }}>
              Complete
            </div>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
              {animation.steps.length} steps &middot; {animation.duration}s total
            </p>
          </div>
        )}
      </div>

      {/* Progress bar */}
      {animation.controls?.showProgress && (
        <div
          style={{
            height: '4px',
            backgroundColor: 'var(--color-bg-tertiary)',
            position: 'relative',
          }}
        >
          <div
            style={{
              height: '100%',
              width: `${String(Math.max(0, Math.min(100, ((currentStep + 1) / animation.steps.length) * 100)))}%`,
              backgroundColor: 'var(--color-brand-400)',
              transition: 'width 0.3s ease-out',
            }}
            aria-hidden="true"
          />
        </div>
      )}

      {/* Playback controls */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 'var(--spacing-3)',
          padding: 'var(--spacing-3) var(--spacing-6)',
          borderTop: '1px solid var(--color-border-default)',
        }}
      >
        <button
          type="button"
          onClick={reset}
          style={controlBtnStyle}
          aria-label="Reset animation"
          disabled={currentStep < 0}
        >
          ⟲
        </button>

        {isPlaying ? (
          <button type="button" onClick={pause} style={{ ...controlBtnStyle, backgroundColor: 'var(--color-bg-tertiary)' }} aria-label="Pause">
            ⏸
          </button>
        ) : (
          <button
            type="button"
            onClick={play}
            style={{ ...controlBtnStyle, backgroundColor: 'var(--color-brand-400)', color: 'var(--color-text-inverse)' }}
            aria-label="Play"
          >
            ▶
          </button>
        )}

        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
          {currentStep + 1}/{animation.steps.length}
        </span>
      </div>

      {/* Caption */}
      <figcaption
        style={{
          fontSize: 'var(--text-xs)',
          color: 'var(--color-text-muted)',
          padding: 'var(--spacing-3) var(--spacing-6)',
          borderTop: '1px solid var(--color-border-default)',
          lineHeight: 1.5,
        }}
      >
        {animation.caption}
      </figcaption>
    </figure>
  );
};

const controlBtnStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '32px',
  height: '32px',
  borderRadius: 'var(--radius-md)',
  border: '1px solid var(--color-border-default)',
  backgroundColor: 'transparent',
  color: 'var(--color-text-muted)',
  fontSize: 'var(--text-sm)',
  cursor: 'pointer',
  transition: 'all var(--duration-fast) var(--easing-out)',
};

export default AnimationRenderer;
