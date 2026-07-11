/* eslint-disable */
import React, { useEffect, useRef, useState, useImperativeHandle, forwardRef } from 'react';
import type { GlobeSpec } from '@/types/canonical';
import { useGlobeTheme } from '../hooks/useGlobeTheme';
import { useResizeObserver } from '../hooks/useResizeObserver';
import { GlobeLayerRegistry } from '../registries/GlobeLayerRegistry';

const EARTH_TEXTURE = 'https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg';
const EARTH_BUMP = 'https://unpkg.com/three-globe/example/img/earth-topology.png';
const NIGHT_SKY = 'https://unpkg.com/three-globe/example/img/night-sky.png';

export interface GlobeCanvasHandle {
  setRotation: (isRotating: boolean) => void;
}

interface GlobeCanvasProps {
  spec: GlobeSpec;
  reducedMotion: boolean;
  isRotating: boolean;
  onLoad: () => void;
  onError: (msg: string) => void;
}

export const GlobeCanvas = forwardRef<GlobeCanvasHandle, GlobeCanvasProps>(
  ({ spec, reducedMotion, isRotating, onLoad, onError }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const globeInstanceRef = useRef<any>(null);
    const theme = useGlobeTheme(containerRef);
    const dimensions = useResizeObserver(containerRef);

    useImperativeHandle(ref, () => ({
      setRotation: (rotate: boolean) => {
        if (globeInstanceRef.current && !reducedMotion) {
          globeInstanceRef.current.controls().autoRotate = rotate;
        }
      }
    }));

    useEffect(() => {
      if (!containerRef.current || !theme) return;
      
      let mounted = true;

      const initGlobe = async () => {
        try {
          const GlobeModule = await import('globe.gl');
          if (!mounted) return;

          const GlobeCtor = GlobeModule.default as any;
          const container = containerRef.current;
          if (!container) return;

          const globe = new GlobeCtor(container, {
            width: dimensions.width,
            height: dimensions.height,
            rendererConfig: {
              antialias: true,
              alpha: true,
              powerPreference: 'high-performance',
            },
          });

          globe
            .globeImageUrl(EARTH_TEXTURE)
            .bumpImageUrl(EARTH_BUMP)
            .backgroundImageUrl(NIGHT_SKY)
            .pointOfView({
              lat: spec.pov?.lat ?? 20,
              lng: spec.pov?.lng ?? 70,
              altitude: spec.pov?.altitude ?? 2.5,
            })
            .globeMaterial({
              specular: { r: 0.2, g: 0.1, b: 0 },
              shininess: 10,
            })
            .atmosphereColor('#f59e0b')
            .atmosphereAltitude(0.25);

          if (spec.autoRotate && !reducedMotion) {
            globe.controls().autoRotate = isRotating;
            globe.controls().autoRotateSpeed = spec.autoRotateSpeed ?? 0.8;
          }

          const strategy = GlobeLayerRegistry.get(spec.type);
          if (strategy) {
            strategy.apply(globe, spec, theme);
          }

          globeInstanceRef.current = globe;
          onLoad();
        } catch (err: any) {
          console.error('GlobeCanvas: Failed to load globe.gl', err);
          if (mounted) onError(err?.message || 'Failed to initialize WebGL');
        }
      };

      void initGlobe();

      return () => {
        mounted = false;
        if (globeInstanceRef.current) {
          try {
            const strategy = GlobeLayerRegistry.get(spec.type);
            if (strategy) {
              strategy.remove(globeInstanceRef.current);
            }
            const instance = globeInstanceRef.current;
            if (instance._destructor) instance._destructor();
            if (instance.renderer) {
              instance.renderer.dispose();
              instance.renderer.domElement = null;
            }
            if (instance._globe) {
              instance._globe.material = null;
            }
          } catch (e) {
            console.error('Globe cleanup error:', e);
          }
          globeInstanceRef.current = null;
        }
      };
    }, [theme]); // Re-initialize only if theme changes.

    // Handle Resize without destroying globe
    useEffect(() => {
      if (globeInstanceRef.current) {
        globeInstanceRef.current.width(dimensions.width);
        globeInstanceRef.current.height(dimensions.height);
      }
    }, [dimensions]);

    return (
      <div
        ref={containerRef}
        style={{
          width: '100%',
          height: `${dimensions.height}px`,
          position: 'relative',
        }}
        aria-hidden="true"
      />
    );
  }
);

GlobeCanvas.displayName = 'GlobeCanvas';
