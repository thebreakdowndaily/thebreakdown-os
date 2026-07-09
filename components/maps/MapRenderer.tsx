'use client';

import { useRef, useEffect, useState } from 'react';
import type { MapSpec } from '@/utils/types';
import MapCanvas from './components/MapCanvas';
import MapControls from './components/MapControls';
import { useMapResize } from './hooks/useMapResize';
import { useMapData } from './hooks/useMapData';
import { useMapTheme } from './hooks/useMapTheme';

interface MapRendererProps {
  map: MapSpec;
}

export default function MapRenderer({ map }: MapRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  
  const dimensions = useMapResize(containerRef);
  const theme = useMapTheme(containerRef);
  const valueMap = useMapData(map.data);

  // Lazy loading
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '200px' }
    );
    observer.observe(el);
    return () => { observer.disconnect(); };
  }, []);

  return (
    <figure
      ref={containerRef}
      style={{
        width: '100%',
        minHeight: '400px',
        backgroundColor: 'var(--color-bg-secondary)',
        border: '1px solid var(--color-border-default)',
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
        position: 'relative',
      }}
      role="img"
      aria-label={map.altText}
    >
      {!isVisible ? (
        <div
          style={{
            width: '100%',
            height: 'clamp(250px, 40vh, 450px)',
            borderRadius: 'var(--radius-md)',
            background: 'linear-gradient(90deg, var(--color-bg-tertiary) 25%, var(--color-bg-secondary) 50%, var(--color-bg-tertiary) 75%)',
            backgroundSize: '200% 100%',
            animation: 'shimmer 1.5s ease-in-out infinite',
          }}
          className="skeleton-shimmer"
          aria-hidden="true"
        />
      ) : (
        <>
          <MapCanvas 
            map={map} 
            dimensions={dimensions} 
            theme={theme} 
            valueMap={valueMap} 
          />
          <MapControls interaction={map.interaction} />
          <figcaption
            style={{
              fontSize: 'var(--text-xs)',
              color: 'var(--color-text-muted)',
              padding: 'var(--spacing-3) var(--spacing-6)',
              borderTop: '1px solid var(--color-border-default)',
              marginTop: 'var(--spacing-1)',
              lineHeight: 1.5,
            }}
          >
            {map.caption}
          </figcaption>
        </>
      )}
    </figure>
  );
}
