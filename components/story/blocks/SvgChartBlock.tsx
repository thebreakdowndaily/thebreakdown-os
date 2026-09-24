'use client';

import { useState } from 'react';
import type { CanonicalSvgChartBlockData } from '@/lib/story/chart-contract';
import { useLightbox } from '@/hooks/useLightbox';
import { LicensingPlaceholder } from '@/components/knowledge-library/blocks/LicensingPlaceholder';

export default function SvgChartBlock({
  chartId,
  chartType,
  title,
  caption,
  url,
  altText,
  credit,
  dataSource,
  status,
}: CanonicalSvgChartBlockData) {
  const [failed, setFailed] = useState(false);
  const canRender = Boolean(url && typeof url === 'string' && url.trim().length > 0);
  const lightbox = useLightbox({ id: title });

  if (!canRender) {
    return (
      <figure
        id={`chart-${chartId}`}
        className="my-10 p-4 md:p-6 bg-[var(--color-bg-secondary,#151515)] rounded-xl border border-[var(--color-border,#2A2A2A)]"
        data-visual-block="chart"
      >
        <LicensingPlaceholder
          type="chart"
          title={title}
          caption={caption || ''}
          source={dataSource}
          rights={credit}
          status={(status as any) || 'draft'}
        />
      </figure>
    );
  }

  return (
    <figure
      id={`chart-${chartId}`}
      className="my-10 p-4 md:p-6 bg-[var(--color-bg-secondary,#151515)] rounded-xl border border-[var(--color-border,#2A2A2A)]"
      data-visual-block="chart"
    >
      <div className="relative overflow-hidden rounded-xl border border-[var(--color-border,#2A2A2A)] bg-white p-2">
        {!failed ? (
          <img
            src={url}
            alt={altText || title}
            className="w-full h-auto object-contain cursor-pointer"
            loading="lazy"
            onClick={lightbox.open}
            onError={() => setFailed(true)}
          />
        ) : (
          <div
            role="img"
            aria-label={altText || title || 'Chart visualization unavailable'}
            className="flex h-64 w-full items-center justify-center bg-[var(--color-bg-secondary,#151515)] p-6 text-center text-sm text-[var(--color-text-muted,#A1A1AA)]"
          >
            Chart visualization unavailable
          </div>
        )}
      </div>

      <figcaption className="mt-3 px-1 space-y-2">
        <p className="text-sm font-semibold text-text-primary">{title}</p>
        {caption && <p className="text-sm text-text-secondary">{caption}</p>}

        <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-text-muted">
          {chartType && <span className="capitalize">Type: {chartType}</span>}
          {dataSource && <span>Data: {dataSource}</span>}
          {credit && <span>{credit}</span>}
        </div>

        {!failed && (
          <button
            type="button"
            onClick={lightbox.open}
            className="text-xs text-brand-400 hover:text-brand-500 font-medium cursor-pointer"
          >
            Expand
          </button>
        )}
      </figcaption>

      {lightbox.isOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          {...lightbox.overlayProps}
        >
          <div
            className="relative max-w-5xl max-h-[90vh] flex flex-col items-center"
            onClick={(e) => { e.stopPropagation(); }}
          >
            <div
              className="overflow-hidden rounded-lg select-none"
              onMouseDown={lightbox.handleMouseDown}
              style={{ touchAction: 'none' }}
            >
              <img
                src={url}
                alt={altText || title}
                className="max-w-full max-h-[85vh] object-contain transition-transform duration-100"
                style={lightbox.imageZoomStyle}
                draggable={false}
              />
            </div>
            <div className="absolute top-4 right-4 flex items-center gap-2">
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); lightbox.setZoom((z) => Math.min(z + 0.25, 4)); }}
                className="w-8 h-8 rounded-full bg-white/90 shadow-md flex items-center justify-center text-gray-700 hover:text-gray-900 text-sm font-bold cursor-pointer"
                aria-label="Zoom in"
              >
                +
              </button>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); lightbox.setZoom((z) => Math.max(z - 0.25, 1)); }}
                className="w-8 h-8 rounded-full bg-white/90 shadow-md flex items-center justify-center text-gray-700 hover:text-gray-900 text-sm font-bold cursor-pointer"
                aria-label="Zoom out"
              >
                −
              </button>
              {lightbox.zoom > 1 && (
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); lightbox.resetZoom(); }}
                  className="px-2 h-8 rounded-full bg-white/90 shadow-md flex items-center justify-center text-gray-700 hover:text-gray-900 text-xs font-medium cursor-pointer"
                  aria-label="Reset zoom"
                >
                  Reset
                </button>
              )}
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); lightbox.close(); }}
                className="w-8 h-8 rounded-full bg-white/90 shadow-md flex items-center justify-center text-gray-700 hover:text-gray-900 text-sm cursor-pointer"
                aria-label="Close lightbox"
              >
                ✕
              </button>
            </div>
            <p className="mt-2 text-xs text-white/70">Scroll to zoom · Drag to pan · Esc to close</p>
          </div>
        </div>
      )}
    </figure>
  );
}
