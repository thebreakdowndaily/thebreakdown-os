'use client';

import React, { useRef, useState, useCallback } from 'react';
import type { GlobeSpec } from '@/utils/types';
import { useReducedMotion } from './hooks/useReducedMotion';
import { useIntersectionObserver } from './hooks/useIntersectionObserver';
import { GlobeCanvas, type GlobeCanvasHandle } from './components/GlobeCanvas';

interface GlobeRendererProps {
  globe: GlobeSpec;
}

const GlobeRenderer: React.FC<GlobeRendererProps> = ({ globe }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<GlobeCanvasHandle>(null);
  const isVisible = useIntersectionObserver(containerRef, { rootMargin: '300px' });
  const reducedMotion = useReducedMotion();

  const [isRotating, setIsRotating] = useState(globe.autoRotate ?? true);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleToggleRotation = useCallback(() => {
    const nextRotation = !isRotating;
    setIsRotating(nextRotation);
    canvasRef.current?.setRotation(nextRotation);
  }, [isRotating]);

  const handleLoad = useCallback(() => { setIsLoaded(true); }, []);
  const handleError = useCallback((msg: string) => { setError(msg); }, []);

  const globeTypeLabel = (type: string): string => {
    const labels: Record<string, string> = {
      'country-highlights': 'Country Highlights',
      'trade-routes': 'Trade Routes',
      'point-density': 'Data Density',
      'shipping-lanes': 'Shipping Lanes',
      'submarine-cables': 'Submarine Cables',
      'diplomatic-visits': 'Diplomatic Visits',
      'election-results': 'Election Results',
      'satellite-coverage': 'Satellite Coverage',
    };
    return labels[type] || '3D Globe';
  };

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  const features = globe.features || {};
  const hasData = (Array.isArray(features.highlightedCountries) && features.highlightedCountries.length > 0) || 
                  (Array.isArray(features.arcs) && features.arcs.length > 0) || 
                  (Array.isArray(features.points) && features.points.length > 0);

  return (
    <figure
      ref={containerRef}
      style={{
        width: '100%',
        minHeight: '450px',
        backgroundColor: 'var(--color-bg-primary)',
        border: '1px solid var(--color-border-default)',
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
        position: 'relative',
      }}
      role="img"
      aria-label={globe.altText}
    >
      {!isVisible ? (
        <Skeleton />
      ) : (
        <>
          <Controls 
            title={globe.purpose || globeTypeLabel(globe.type)}
            isRotating={isRotating}
            reducedMotion={reducedMotion}
            onToggle={handleToggleRotation}
          />

          {!hasData && !error ? (
            <EmptyState type={globe.type} />
          ) : (
            <GlobeCanvas
              ref={canvasRef}
              spec={globe}
              reducedMotion={reducedMotion}
              isRotating={isRotating}
              onLoad={handleLoad}
              onError={handleError}
            />
          )}

          {!isLoaded && !error && hasData && <LoadingState />}
          {error && <ErrorState message={error} type={globeTypeLabel(globe.type)} />}

          <figcaption
            style={{
              fontSize: 'var(--text-xs)',
              color: 'var(--color-text-muted)',
              padding: 'var(--spacing-3) var(--spacing-6)',
              borderTop: '1px solid var(--color-border-default)',
              lineHeight: 1.5,
            }}
          >
            {globe.caption}
          </figcaption>
        </>
      )}
    </figure>
  );
};

/* ── UI Components ───────────────────────────────────────────────────── */

const Skeleton = () => (
  <div style={{ width: '100%', height: 'clamp(300px, 50vh, 500px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }} aria-hidden="true">
    <div style={{ width: '120px', height: '120px', borderRadius: 'var(--radius-full)', background: 'linear-gradient(90deg, var(--color-bg-tertiary) 25%, var(--color-bg-secondary) 50%, var(--color-bg-tertiary) 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s ease-in-out infinite' }} />
  </div>
);

const Controls = ({ title, isRotating, reducedMotion, onToggle }: { title: string, isRotating: boolean, reducedMotion: boolean, onToggle: () => void }) => (
  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10, padding: 'var(--spacing-4) var(--spacing-6)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'linear-gradient(to bottom, var(--color-bg-primary), transparent)', pointerEvents: 'none' }}>
    <span style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-text-secondary)', pointerEvents: 'auto' }}>{title}</span>
    {!reducedMotion && (
      <button type="button" onClick={onToggle} aria-label={isRotating ? 'Pause rotation' : 'Start rotation'} style={{ pointerEvents: 'auto', padding: 'var(--spacing-1) var(--spacing-3)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border-default)', backgroundColor: 'var(--color-bg-secondary)', color: 'var(--color-text-muted)', fontSize: 'var(--text-xs)', cursor: 'pointer' }}>
        {isRotating ? '⏸ Pause' : '▶ Rotate'}
      </button>
    )}
  </div>
);

const EmptyState = ({ type }: { type: string }) => (
  <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)', textAlign: 'center' }}>
    No data available for {type}.
  </div>
);

const LoadingState = () => (
  <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)', textAlign: 'center' }}>
    Loading globe...
  </div>
);

const ErrorState = ({ message, type }: { message: string, type: string }) => (
  <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)', textAlign: 'center' }}>
    <div>{message}</div>
    <div style={{ fontSize: 'var(--text-xs)', opacity: 0.7, marginTop: 'var(--spacing-1)' }}>{type}</div>
  </div>
);

export default GlobeRenderer;
