'use client';

import type { FC } from 'react';
import type { BlockComponentProps } from '../core/block-registry';
import { LicensingPlaceholder } from './LicensingPlaceholder';
import { useLightbox } from '@/hooks/useLightbox';

interface MapProvenance {
  creator?: string;
  source: string;
  reference?: string;
  date?: string;
}

interface MapArchivalProvenance {
  evidenceLevel: string;
  archiveHierarchy?: string;
  iiifUrl?: string;
  citationChicago?: string;
  cartographicStrategy?: string;
  note?: string;
}

interface LegendItem {
  label: string;
  color: string;
  type?: 'solid' | 'dashed' | 'dotted';
}

interface MapBlockData {
  title: string;
  caption: string;
  altText?: string;
  url?: string;
  mapType: string;
  dataSource: string;
  disputedBoundaries?: boolean;
  legend?: LegendItem[];
  scale?: string;
  projection?: string;
  linkedTimelineId?: string;
  linkedDocuments?: string[];
  provenance?: MapProvenance;
  license?: string;
  credit?: string;
  status: 'archived' | 'requested' | 'draft' | 'recreated';
  aiGenerated?: boolean;
  linkedClaims?: string[];
  archivalProvenance?: MapArchivalProvenance;
}

export const MapBlock: FC<BlockComponentProps> = ({ data }) => {
  const {
    title, caption, altText, url, mapType, dataSource,
    disputedBoundaries, legend, scale, projection,
    linkedTimelineId, linkedDocuments,
    provenance, license, credit,
    status, linkedClaims, archivalProvenance,
  } = data as unknown as MapBlockData;

  const canRender = Boolean(url);
  const evidenceLevel = archivalProvenance?.evidenceLevel;
  const lightbox = useLightbox({ id: title });

  if (!canRender) {
    return (
      <figure className="my-8" data-visual-block="map">
        <LicensingPlaceholder
          type="map"
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
                Map details & citation
              </summary>
              <div className="mt-2 pl-3 border-l-2 border-gray-200 space-y-1.5 text-xs text-gray-500">
                {provenance?.source && <p><span className="font-medium">Source:</span> {provenance.source}</p>}
                {provenance?.creator && <p><span className="font-medium">Creator:</span> {provenance.creator}</p>}
                {license && <p><span className="font-medium">License:</span> {license}</p>}
                {archivalProvenance?.cartographicStrategy && (
                  <p><span className="font-medium">Strategy:</span> {archivalProvenance.cartographicStrategy}</p>
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
    <figure className="my-8" data-visual-block="map">
      <div className="relative overflow-hidden rounded-xl border border-gray-200 bg-white p-2">
        <img
          src={url}
          alt={altText || title}
          className="w-full h-auto object-contain cursor-pointer"
          loading="lazy"
          onClick={lightbox.open}
        />
        {disputedBoundaries && (
          <span className="absolute top-3 left-3 px-2 py-0.5 text-xs font-medium rounded bg-amber-100 text-amber-700 border border-amber-200">
            Contains disputed boundaries
          </span>
        )}
      </div>

      <figcaption className="mt-3 px-1 space-y-2">
        <p className="text-sm font-semibold text-gray-900">{title}</p>
        {caption && <p className="text-sm text-gray-600">{caption}</p>}

        {legend && legend.length > 0 && (
          <div className="pt-1">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Legend</p>
            <div className="flex flex-wrap gap-2 mt-1">
              {legend.map((item, i) => (
                <div
                  key={i}
                  className="group flex items-center gap-1.5 px-1.5 py-0.5 rounded hover:bg-gray-50 transition-colors cursor-default"
                  title={item.label}
                >
                  <span
                    className={`inline-block w-5 h-0.5 ${item.type === 'dashed' ? 'border-t-2 border-dashed' : ''} ${item.type === 'dotted' ? 'border-t-2 border-dotted' : ''}`}
                    style={{ backgroundColor: item.type && item.type !== 'solid' ? 'transparent' : item.color, borderColor: item.type ? item.color : undefined }}
                  >
                    {(!item.type || item.type === 'solid') && <span className="sr-only">{item.label}</span>}
                  </span>
                  <span className="text-xs text-gray-600 group-hover:text-gray-900 transition-colors">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-gray-400">
          {mapType && <span>Type: {mapType}</span>}
          {scale && <span>Scale: {scale}</span>}
          {projection && <span>Projection: {projection}</span>}
          {dataSource && <span>Data: {dataSource}</span>}
          {credit && <span>{credit}</span>}
          {evidenceLevel && <span>Evidence: {evidenceLevel}</span>}
        </div>

        {disputedBoundaries && (
          <p className="text-xs text-amber-600">
            Dashed lines mark disputed borders. Per Book of Record #0003, these must not be presented as settled fact.
          </p>
        )}

        {linkedTimelineId && (
          <button
            onClick={() => {
              document.getElementById('timeline')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }}
            className="text-xs text-blue-600 hover:text-blue-800 font-medium hover:underline"
          >
            View related timeline
          </button>
        )}

        {linkedDocuments && linkedDocuments.length > 0 && (
          <div className="pt-1">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Related Documents</p>
            <div className="flex flex-wrap gap-1.5 mt-0.5">
              {linkedDocuments.map((d) => (
                <button
                  key={d}
                  onClick={() => {
                    document.getElementById(`document-${d}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }}
                  className="px-2 py-0.5 text-xs rounded-full bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100 hover:text-gray-900 transition-colors cursor-pointer"
                >
                  {d}
                </button>
              ))}
            </div>
          </div>
        )}

        {linkedClaims && linkedClaims.length > 0 && (
          <div className="pt-1">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Related Claims</p>
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

        <button
          onClick={lightbox.open}
          className="text-xs text-blue-600 hover:text-blue-800 font-medium"
        >
          Open full screen
        </button>

        {(provenance || license || archivalProvenance?.citationChicago) && (
          <details className="group">
            <summary className="text-xs text-blue-600 cursor-pointer hover:text-blue-800 select-none">
              Map details & citation
            </summary>
            <div className="mt-2 pl-3 border-l-2 border-gray-200 space-y-1.5 text-xs text-gray-500">
              {provenance?.source && <p><span className="font-medium">Source:</span> {provenance.source}</p>}
              {provenance?.creator && <p><span className="font-medium">Creator:</span> {provenance.creator}</p>}
              {license && <p><span className="font-medium">License:</span> {license}</p>}
              {archivalProvenance?.cartographicStrategy && (
                <p><span className="font-medium">Strategy:</span> {archivalProvenance.cartographicStrategy}</p>
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
          <div className="relative max-w-5xl max-h-[90vh] flex flex-col items-center" onClick={(e) => e.stopPropagation()}>
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
