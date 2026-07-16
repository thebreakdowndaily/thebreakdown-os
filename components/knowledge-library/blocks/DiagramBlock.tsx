'use client';

import type { FC } from 'react';
import type { BlockComponentProps } from '../core/block-registry';
import { useLightbox } from '@/hooks/useLightbox';

interface DiagramBlockData {
  title: string;
  caption: string;
  altText?: string;
  url?: string;
  explanation: string;
  linkedClaims: string[];
  status: 'archived' | 'requested' | 'draft' | 'recreated';
  note?: string;
  provenance?: { source?: string; creator?: string; date?: string };
  license?: string;
  credit?: string;
}

export const DiagramBlock: FC<BlockComponentProps> = ({ data }) => {
  const {
    title, caption, altText, url, explanation,
    linkedClaims, status, note, provenance, license, credit,
  } = data as unknown as DiagramBlockData;

  const canRender = Boolean(url);
  const lightbox = useLightbox({ id: title });

  if (!canRender) {
    return (
      <figure className="my-12 md:my-16 p-4 md:p-6 bg-gray-50/40 rounded-xl border border-gray-200/50">
        <div className="w-full rounded-xl border-2 border-dashed border-amber-300 bg-amber-50/50 p-6 text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-amber-700">Diagram Pending Recreation</p>
          <p className="mt-2 text-sm text-gray-700 font-medium">{title}</p>
          <p className="text-xs text-amber-600 mt-1 uppercase tracking-wider">{status}</p>
        </div>
      </figure>
    );
  }

  return (
    <figure className="my-12 md:my-16 p-4 md:p-6 bg-gray-50/40 rounded-xl border border-gray-200/50" data-visual-block="diagram">
      <div className="relative overflow-hidden rounded-xl border border-gray-200 bg-white p-2">
        <img
          src={url}
          alt={altText || title}
          className="w-full h-auto object-contain cursor-pointer"
          loading="lazy"
          onClick={lightbox.open}
        />
      </div>

      <figcaption className="mt-3 px-1">
        <p className="text-sm font-semibold text-gray-900">{title}</p>
        {caption && <p className="text-sm text-gray-600 mt-0.5">{caption}</p>}

        <details className="mt-2 group">
          <summary className="text-xs text-blue-600 cursor-pointer hover:text-blue-800 select-none">
            Explanation
          </summary>
          <p className="mt-2 text-sm text-gray-700 pl-3 border-l-2 border-gray-200">{explanation}</p>
        </details>

        {linkedClaims.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5 text-xs">
            {linkedClaims.map((c) => (
              <button
                key={c}
                onClick={(e) => { e.stopPropagation(); lightbox.dispatchInvestigation(c); }}
                className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100 hover:bg-blue-100 hover:text-blue-800 transition-colors cursor-pointer"
              >
                {c}
              </button>
            ))}
          </div>
        )}

        {(provenance || license || credit) && (
          <details className="mt-2 group">
            <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-700 select-none">
              Source & Attribution
            </summary>
            <div className="mt-2 space-y-1 pl-3 border-l-2 border-gray-200 text-xs text-gray-500">
              {provenance?.source && <p>Source: {provenance.source}</p>}
              {provenance?.creator && <p>Creator: {provenance.creator}</p>}
              {provenance?.date && <p>Date: {provenance.date}</p>}
              {license && <p>License: {license}</p>}
              {credit && <p>Credit: {credit}</p>}
            </div>
          </details>
        )}

        {note && <p className="mt-1 text-xs text-amber-600">{note}</p>}

        <button
          onClick={lightbox.open}
          className="mt-2 text-xs text-blue-600 hover:text-blue-800 font-medium"
        >
          Expand full size
        </button>
      </figcaption>

      {lightbox.isOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          {...lightbox.overlayProps}
        >
          <div className="relative max-w-5xl max-h-[90vh] flex flex-col items-center" onClick={(e) => { e.stopPropagation(); }}>
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
                onClick={(e) => { e.stopPropagation(); lightbox.setZoom(z => Math.min(z + 0.25, 4)); }}
                className="w-8 h-8 rounded-full bg-white/90 shadow-md flex items-center justify-center text-gray-700 hover:text-gray-900 text-sm font-bold"
                aria-label="Zoom in"
              >
                +
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); lightbox.setZoom(z => Math.max(z - 0.25, 1)); }}
                className="w-8 h-8 rounded-full bg-white/90 shadow-md flex items-center justify-center text-gray-700 hover:text-gray-900 text-sm font-bold"
                aria-label="Zoom out"
              >
                −
              </button>
              {lightbox.zoom > 1 && (
                <button
                  onClick={(e) => { e.stopPropagation(); lightbox.resetZoom(); }}
                  className="px-2 h-8 rounded-full bg-white/90 shadow-md flex items-center justify-center text-gray-700 hover:text-gray-900 text-xs font-medium"
                  aria-label="Reset zoom"
                >
                  Reset
                </button>
              )}
              <button
                onClick={(e) => { e.stopPropagation(); lightbox.close(); }}
                className="w-8 h-8 rounded-full bg-white/90 shadow-md flex items-center justify-center text-gray-700 hover:text-gray-900 text-sm"
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
};
