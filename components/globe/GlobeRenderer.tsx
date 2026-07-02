'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import type { GlobeSpec } from '@/utils/types';

/**
 * THE BREAKDOWN — GlobeRenderer
 *
 * Interactive 3D Globe — The Breakdown's signature visual element.
 *
 * Uses globe.gl (Three.js) for WebGL rendering with:
 *   - Blue marble earth texture
 *   - Brand-amber (#f59e0b) for all highlights
 *   - Atmosphere glow matching brand color
 *   - Auto-rotation (pausable via UI)
 *   - Default POV centered on Indian Ocean (lat: 20, lng: 70)
 *   - Dark sky background
 *
 * Supported types:
 *   country-highlights | trade-routes | point-density | shipping-lanes |
 *   submarine-cables | diplomatic-visits | election-results | satellite-coverage
 *
 * Design constraints:
 *   - Lazy loaded with IntersectionObserver
 *   - Respects prefers-reduced-motion
 *   - Accessible with alt text + controls
 *   - Canvas renderer for performance
 */

/* ── Texture URLs (CDN-hosted) ──────────────────────────────────────── */

const EARTH_TEXTURE = 'https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg';
const EARTH_BUMP = 'https://unpkg.com/three-globe/example/img/earth-topology.png';
const NIGHT_SKY = 'https://unpkg.com/three-globe/example/img/night-sky.png';

/* ── Types ──────────────────────────────────────────────────────────── */

interface GlobeTheme {
  brand: string;
  bg: string;
  textMuted: string;
  textSecondary: string;
  fontFamily: string;
}

/* ── Main Component ────────────────────────────────────────────────── */

interface GlobeRendererProps {
  globe: GlobeSpec;
}

const GlobeRenderer: React.FC<GlobeRendererProps> = ({ globe }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const globeContainerRef = useRef<HTMLDivElement>(null);
  const globeInstanceRef = useRef<any>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isRotating, setIsRotating] = useState(globe.autoRotate ?? true);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [dimensions, setDimensions] = useState({ width: 600, height: 450 });

  // Detect reduced motion
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  // Lazy load with IntersectionObserver
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
      { rootMargin: '300px' }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Responsive sizing
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const updateSize = () => {
      const rect = el.getBoundingClientRect();
      setDimensions({
        width: rect.width - 2,
        height: Math.max(350, Math.min(550, rect.width * 0.6)),
      });
    };

    updateSize();
    const ro = new ResizeObserver(() => updateSize());
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Initialize globe
  useEffect(() => {
    if (!isVisible || !globeContainerRef.current || globeInstanceRef.current) return;

    let mounted = true;

    const initGlobe = async () => {
      try {
        // Dynamic import of globe.gl and three
        const GlobeModule = await import('globe.gl');

        if (!mounted || !globeContainerRef.current) return;

        const container = globeContainerRef.current;
        const Globe = GlobeModule.default || GlobeModule;

        const theme = readGlobeTheme(container);

        // Create globe instance
        const globeInstance = Globe({
          container,
          width: dimensions.width,
          height: dimensions.height,
          rendererConfig: {
            antialias: true,
            alpha: true,
            powerPreference: 'high-performance',
          },
        });

        // Basic configuration
        globeInstance
          .globeImageUrl(EARTH_TEXTURE)
          .bumpImageUrl(EARTH_BUMP)
          .backgroundImageUrl(NIGHT_SKY)
          .pointOfView({
            lat: globe.pov?.lat ?? 20,
            lng: globe.pov?.lng ?? 70,
            altitude: globe.pov?.altitude ?? 2.5,
          })
          .globeMaterial({
            specularColor: { r: 0.2, g: 0.1, b: 0 },
            shininess: 10,
          })
          .atmosphereColor('#f59e0b')
          .atmosphereAltitude(0.25);

        // Auto-rotation
        if (globe.autoRotate && !reducedMotion) {
          globeInstance.controls().autoRotate = true;
          globeInstance.controls().autoRotateSpeed = globe.autoRotateSpeed ?? 0.8;
        }

        // Apply data based on type
        applyGlobeData(globeInstance, globe, theme);

        globeInstanceRef.current = globeInstance;
        if (mounted) setIsLoaded(true);

      } catch (err: any) {
        console.error('GlobeRenderer: Failed to initialize:', err);
        if (mounted) setError(err.message || 'Failed to load 3D globe');
      }
    };

    initGlobe();

    return () => {
      mounted = false;
      // Cleanup Three.js resources
      if (globeInstanceRef.current) {
        try {
          const instance = globeInstanceRef.current;
          if (instance._destructor) instance._destructor();
          if (instance.renderer) {
            instance.renderer.dispose();
            instance.renderer.domElement = null;
          }
          if (instance._globe) {
            instance._globe.material = null;
          }
        } catch {
          // Ignore cleanup errors
        }
        globeInstanceRef.current = null;
      }
    };
  }, [isVisible, dimensions, globe, reducedMotion]);

  // Handle rotation toggle
  useEffect(() => {
    if (!globeInstanceRef.current) return;
    const controls = globeInstanceRef.current.controls();
    if (controls) {
      controls.autoRotate = isRotating && !reducedMotion;
    }
  }, [isRotating, reducedMotion]);

  const handleToggleRotation = useCallback(() => {
    setIsRotating((r) => !r);
  }, []);

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
        <div
          style={{
            width: '100%',
            height: 'clamp(300px, 50vh, 500px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--color-text-muted)',
            fontSize: 'var(--text-sm)',
          }}
          aria-hidden="true"
        >
          <div
            style={{
              width: '120px',
              height: '120px',
              borderRadius: 'var(--radius-full)',
              background: 'linear-gradient(90deg, var(--color-bg-tertiary) 25%, var(--color-bg-secondary) 50%, var(--color-bg-tertiary) 75%)',
              backgroundSize: '200% 100%',
              animation: 'shimmer 1.5s ease-in-out infinite',
            }}
            className="skeleton-shimmer"
          />
        </div>
      ) : (
        <>
          {/* Controls bar */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              zIndex: 10,
              padding: 'var(--spacing-4) var(--spacing-6)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: 'linear-gradient(to bottom, var(--color-bg-primary), transparent)',
              pointerEvents: 'none',
            }}
          >
            <span
              style={{
                fontSize: 'var(--text-sm)',
                fontWeight: 'var(--font-weight-semibold)',
                color: 'var(--color-text-secondary)',
                pointerEvents: 'auto',
              }}
            >
              {globe.purpose || globeTypeLabel(globe.type)}
            </span>

            {!reducedMotion && (
              <button
                type="button"
                onClick={handleToggleRotation}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 'var(--spacing-1)',
                  padding: 'var(--spacing-1) var(--spacing-3)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border-default)',
                  backgroundColor: 'var(--color-bg-secondary)',
                  color: 'var(--color-text-muted)',
                  fontSize: 'var(--text-xs)',
                  cursor: 'pointer',
                  pointerEvents: 'auto',
                  transition: 'all var(--duration-fast)',
                }}
                aria-label={isRotating ? 'Pause rotation' : 'Start rotation'}
              >
                {isRotating ? '⏸ Pause' : '▶ Rotate'}
              </button>
            )}
          </div>

          {/* Globe container */}
          <div
            ref={globeContainerRef}
            style={{
              width: '100%',
              height: `${dimensions.height}px`,
              position: 'relative',
            }}
            aria-hidden="true"
          />

          {/* Loading state */}
          {!isLoaded && !error && (
            <div
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                color: 'var(--color-text-muted)',
                fontSize: 'var(--text-sm)',
                textAlign: 'center',
              }}
              aria-hidden="true"
            >
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  margin: '0 auto var(--spacing-2)',
                  border: '3px solid var(--color-border-default)',
                  borderTopColor: 'var(--color-brand-400)',
                  borderRadius: 'var(--radius-full)',
                  animation: 'spin 0.8s linear infinite',
                }}
              />
              Loading globe...
            </div>
          )}

          {/* Error state */}
          {error && (
            <div
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                color: 'var(--color-text-muted)',
                fontSize: 'var(--text-sm)',
                textAlign: 'center',
              }}
              aria-hidden="true"
            >
              <svg style={{ width: '48px', height: '48px', margin: '0 auto var(--spacing-2)', opacity: 0.4 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" />
                <path d="M2 12h20" />
                <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
              </svg>
              <div>3D Globe unavailable</div>
              <div style={{ fontSize: 'var(--text-xs)', opacity: 0.7, marginTop: 'var(--spacing-1)' }}>
                {globeTypeLabel(globe.type)}
              </div>
            </div>
          )}

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
            {globe.caption}
          </figcaption>
        </>
      )}
    </figure>
  );
};

/* ── Theme Reader ───────────────────────────────────────────────────── */

function readGlobeTheme(el: Element): GlobeTheme {
  const style = getComputedStyle(el);
  const get = (name: string) => style.getPropertyValue(name).trim() || '#000';
  return {
    brand: get('--color-brand-400'),
    bg: get('--color-bg-primary'),
    textMuted: get('--color-text-muted'),
    textSecondary: get('--color-text-secondary'),
    fontFamily: get('--font-sans'),
  };
}

/* ── Data Applicator ─────────────────────────────────────────────────── */

function applyGlobeData(globeInstance: any, spec: GlobeSpec, theme: GlobeTheme) {
  const features = spec.features || {};

  switch (spec.type) {
    case 'country-highlights': {
      // Highlight specific countries
      const countries = (features.highlightedCountries as string[]) || ['India', 'China', 'USA'];
      const hexData = countries.map((country) => {
        // Approximate lat/lng for major countries
        const coords: Record<string, [number, number]> = {
          India: [20, 78],
          China: [35, 105],
          'United States': [38, -97],
          Brazil: [-14, -52],
          Russia: [60, 40],
          Japan: [36, 138],
          Germany: [51, 10],
          UK: [55, -3],
          France: [46, 2],
          Australia: [-25, 135],
          'South Africa': [-30, 25],
          'Saudi Arabia': [24, 45],
          Indonesia: [-5, 120],
          Pakistan: [30, 70],
          Bangladesh: [24, 90],
          Nigeria: [8, 8],
          Egypt: [26, 30],
          Mexico: [23, -102],
          Canada: [56, -106],
          Argentina: [-38, -64],
        };
        const pos = coords[country] || [0, 0];
        return { lat: pos[0], lng: pos[1], color: theme.brand, label: country };
      });

      globeInstance
        .hexBinPointsData(hexData)
        .hexBinPointLat('lat')
        .hexBinPointLng('lng')
        .hexBinPointColor('color')
        .hexBinLabel('label')
        .hexBinResolution(4)
        .hexMargin(0.2);
      break;
    }

    case 'trade-routes':
    case 'shipping-lanes': {
      // Draw arcs between points
      const arcs = (features.arcs as any[]) || [
        { source: [18, 72] as [number, number], target: [38, -97] as [number, number], value: 100 },
        { source: [20, 78] as [number, number], target: [35, 105] as [number, number], value: 80 },
        { source: [20, 78] as [number, number], target: [51, 10] as [number, number], value: 60 },
      ];

      globeInstance
        .arcsData(arcs)
        .arcStartLat((d: any) => d.source[0])
        .arcStartLng((d: any) => d.source[1])
        .arcEndLat((d: any) => d.target[0])
        .arcEndLng((d: any) => d.target[1])
        .arcColor((d: any) => [theme.brand, theme.brand])
        .arcStroke(0.5)
        .arcDashLength(0.15)
        .arcDashGap(0.05)
        .arcDashAnimateTime(3000);
      break;
    }

    case 'point-density':
    case 'satellite-coverage': {
      // Show data points
      const points = (features.points as any[]) || [
        { lat: 20, lng: 78, value: 50 },
        { lat: 35, lng: 105, value: 80 },
        { lat: 38, lng: -97, value: 100 },
        { lat: -14, lng: -52, value: 30 },
        { lat: 51, lng: 10, value: 70 },
      ];

      globeInstance
        .pointsData(points)
        .pointLat('lat')
        .pointLng('lng')
        .pointAltitude('value')
        .pointColor(() => theme.brand)
        .pointRadius(0.5)
        .pointsMerge(true);
      break;
    }

    case 'diplomatic-visits':
    case 'election-results': {
      // Mixed: arcs + highlighted countries
      const highlights = (features.highlightedCountries as string[]) || ['India', 'USA', 'China'];
      const hexData = highlights.map((c) => {
        const coords: Record<string, [number, number]> = {
          India: [20, 78],
          China: [35, 105],
          'United States': [38, -97],
          Russia: [60, 40],
          UK: [55, -3],
          France: [46, 2],
          Japan: [36, 138],
        };
        const pos = coords[c] || [0, 0];
        return { lat: pos[0], lng: pos[1], color: theme.brand, label: c };
      });

      globeInstance
        .hexBinPointsData(hexData)
        .hexBinPointLat('lat')
        .hexBinPointLng('lng')
        .hexBinPointColor('color')
        .hexBinLabel('label')
        .hexBinResolution(4)
        .hexMargin(0.2);

      const arcs = (features.arcs as any[]) || [];
      if (arcs.length > 0) {
        globeInstance
          .arcsData(arcs)
          .arcStartLat((d: any) => d.source[0])
          .arcStartLng((d: any) => d.source[1])
          .arcEndLat((d: any) => d.target[0])
          .arcEndLng((d: any) => d.target[1])
          .arcColor((d: any) => [theme.brand, theme.brand])
          .arcStroke(0.5);
      }
      break;
    }

    case 'submarine-cables': {
      // Curved lines representing cables
      const arcs = (features.arcs as any[]) || [
        { source: [18, 72], target: [-33, 18], value: 1 },
        { source: [-33, 18], target: [38, -97], value: 1 },
        { source: [38, -97], target: [51, 10], value: 1 },
        { source: [20, 78], target: [35, 105], value: 1 },
      ];

      globeInstance
        .arcsData(arcs)
        .arcStartLat((d: any) => d.source[0])
        .arcStartLng((d: any) => d.source[1])
        .arcEndLat((d: any) => d.target[0])
        .arcEndLng((d: any) => d.target[1])
        .arcColor(() => ['#60a5fa', '#3b82f6'])
        .arcStroke(0.8)
        .arcDashLength(0.3)
        .arcDashGap(0.1)
        .arcDashAnimateTime(5000);
      break;
    }

    default: {
      // Fallback: show some generic points
      globeInstance
        .pointsData([
          { lat: 20, lng: 78, value: 100 },
          { lat: 35, lng: 105, value: 80 },
          { lat: 38, lng: -97, value: 90 },
          { lat: 51, lng: 10, value: 70 },
          { lat: -14, lng: -52, value: 50 },
        ])
        .pointLat('lat')
        .pointLng('lng')
        .pointAltitude('value')
        .pointColor(() => theme.brand)
        .pointRadius(0.5);
      break;
    }
  }

  // Custom label for the globe type
  if (spec.type === 'country-highlights' || spec.type === 'election-results') {
    globeInstance.hexBinLabel((d: any) => d.label || '');
  }
}

export default GlobeRenderer;
