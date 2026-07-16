'use client';

import type { FC } from 'react';
import type { BlockComponentProps } from '../core/block-registry';
import { LicensingPlaceholder } from './LicensingPlaceholder';
import { useLightbox } from '@/hooks/useLightbox';

interface ChartProvenance {
  source: string;
}

interface ChartArchivalProvenance {
  evidenceLevel: string;
  chartStrategy?: string;
  citationChicago?: string;
  iiifUrl?: string;
  note?: string;
}

interface ChartBlockData {
  title: string;
  caption: string;
  altText?: string;
  url?: string;
  chartType: string;
  dataSource: string;
  methodology?: string;
  dataset?: string;
  limitations?: string;
  provenance?: ChartProvenance;
  license?: string;
  credit?: string;
  status: 'archived' | 'requested' | 'draft' | 'recreated';
  aiGenerated?: boolean;
  linkedClaims?: string[];
  archivalProvenance?: ChartArchivalProvenance;
}

export const ChartBlock: FC<BlockComponentProps> = ({ data }) => {
  const {
    title, caption, altText, url, chartType, dataSource,
    methodology, dataset, limitations,
    provenance, license, credit, status, linkedClaims, archivalProvenance,
  } = data as unknown as ChartBlockData;

  const canRender = Boolean(url);
  const evidenceLevel = archivalProvenance?.evidenceLevel;
  const lightbox = useLightbox({ id: title });

  if (!canRender) {
    return (
      <figure className="my-12 md:my-16 p-4 md:p-6 bg-gray-50/40 rounded-xl border border-gray-200/50" data-visual-block="chart">
        <LicensingPlaceholder
          type="chart"
          title={title}
          caption={caption}
          source={dataSource || provenance?.source}
          rights={license}
          status={status}
        />
        <figcaption className="mt-3 px-1">
          {(provenance || license || archivalProvenance?.citationChicago) && (
            <details className="group">
              <summary className="text-xs text-blue-600 cursor-pointer hover:text-blue-800 select-none">
                Chart details & citation
              </summary>
              <div className="mt-2 pl-3 border-l-2 border-gray-200 space-y-1.5 text-xs text-gray-500">
                {provenance?.source && <p><span className="font-medium">Source:</span> {provenance.source}</p>}
                {license && <p><span className="font-medium">License:</span> {license}</p>}
                {archivalProvenance?.chartStrategy && (
                  <p><span className="font-medium">Strategy:</span> {archivalProvenance.chartStrategy}</p>
                )}
                {archivalProvenance?.citationChicago && (
                  <div className="mt-2 pt-2 border-t border-gray-100">
                    <p className="font-medium text-gray-600">Citation:</p>
                    <p className="mt-0.5 italic">{archivalProvenance.citationChicago}</p>
                  </div>
                )}
                {archivalProvenance?.iiifUrl && (
                  <p><a href={archivalProvenance.iiifUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">View at source ↗</a></p>
                )}
              </div>
            </details>
          )}
        </figcaption>
      </figure>
    );
  }

  return (
    <figure className="my-12 md:my-16 p-4 md:p-6 bg-gray-50/40 rounded-xl border border-gray-200/50" data-visual-block="chart">
      <div className="relative overflow-hidden rounded-xl border border-gray-200 bg-white p-2">
        <img
          src={url}
          alt={altText || title}
          className="w-full h-auto object-contain cursor-pointer"
          loading="lazy"
          onClick={lightbox.open}
        />
      </div>

      <figcaption className="mt-3 px-1 space-y-2">
        <p className="text-sm font-semibold text-gray-900">{title}</p>
        {caption && <p className="text-sm text-gray-600">{caption}</p>}

        <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-gray-400">
          {chartType && <span>Type: {chartType}</span>}
          {dataSource && <span>Data: {dataSource}</span>}
          {credit && <span>{credit}</span>}
          {evidenceLevel && <span>Evidence: {evidenceLevel}</span>}
        </div>

        {linkedClaims && linkedClaims.length > 0 && (
          <div className="pt-1">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Linked Claims</p>
            <div className="flex flex-wrap gap-1.5 mt-0.5">
              {linkedClaims.map((c) => (
                <button
                  key={c}
                  onClick={(e) => { e.stopPropagation(); lightbox.dispatchInvestigation(c); }}
                  className="px-2 py-0.5 text-xs rounded-full bg-blue-50 text-blue-700 border border-blue-100 hover:bg-blue-100 hover:text-blue-800 transition-colors cursor-pointer"
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-2 pt-1">
          {methodology && (
            <details className="group">
              <summary className="text-xs text-blue-600 cursor-pointer hover:text-blue-800 select-none">Methodology</summary>
              <p className="mt-1 text-xs text-gray-600 pl-2 border-l-2 border-gray-200">{methodology}</p>
            </details>
          )}
          {dataset && (
            <details className="group">
              <summary className="text-xs text-blue-600 cursor-pointer hover:text-blue-800 select-none">Dataset</summary>
              <p className="mt-1 text-xs text-gray-600 pl-2 border-l-2 border-gray-200">{dataset}</p>
            </details>
          )}
          {limitations && (
            <details className="group">
              <summary className="text-xs text-amber-600 cursor-pointer hover:text-amber-800 select-none">Limitations</summary>
              <p className="mt-1 text-xs text-amber-700 pl-2 border-l-2 border-amber-200">{limitations}</p>
            </details>
          )}
        </div>

        <button
          onClick={lightbox.open}
          className="text-xs text-blue-600 hover:text-blue-800 font-medium"
        >
          Expand
        </button>

        {(provenance || license || archivalProvenance?.citationChicago) && (
          <details className="group">
            <summary className="text-xs text-blue-600 cursor-pointer hover:text-blue-800 select-none">
              Chart details & citation
            </summary>
            <div className="mt-2 pl-3 border-l-2 border-gray-200 space-y-1.5 text-xs text-gray-500">
              {provenance?.source && <p><span className="font-medium">Source:</span> {provenance.source}</p>}
              {license && <p><span className="font-medium">License:</span> {license}</p>}
              {archivalProvenance?.chartStrategy && (
                <p><span className="font-medium">Strategy:</span> {archivalProvenance.chartStrategy}</p>
              )}
              {archivalProvenance?.citationChicago && (
                <div className="mt-2 pt-2 border-t border-gray-100">
                  <p className="font-medium text-gray-600">Citation:</p>
                  <p className="mt-0.5 italic">{archivalProvenance.citationChicago}</p>
                </div>
              )}
              {archivalProvenance?.iiifUrl && (
                <p><a href={archivalProvenance.iiifUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">View at source ↗</a></p>
              )}
              {archivalProvenance?.note && (
                <p className="text-amber-600"><span className="font-medium">Note:</span> {archivalProvenance.note}</p>
              )}
            </div>
          </details>
        )}
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
