'use client';

import type { FC } from 'react';
import type { BlockComponentProps } from '../core/block-registry';
import { LicensingPlaceholder } from './LicensingPlaceholder';
import { useLightbox } from '@/hooks/useLightbox';

interface ImageProvenance {
  creator: string;
  source: string;
  reference?: string;
  date: string;
}

interface ArchivalProvenance {
  evidenceLevel: string;
  archiveHierarchy?: string;
  iiifUrl?: string;
  citationChicago?: string;
  note?: string;
}

function isPdfUrl(url?: string): boolean {
  return Boolean(url && /\.pdf$/i.test(url));
}

interface ImageBlockData {
  title: string;
  caption: string;
  altText?: string;
  url?: string;
  provenance?: ImageProvenance;
  license?: string;
  credit?: string;
  status: 'archived' | 'requested' | 'draft' | 'recreated';
  aiGenerated?: boolean;
  linkedClaims?: string[];
  relatedSources?: string[];
  note?: string;
  archivalProvenance?: ArchivalProvenance;
}

export const ImageBlock: FC<BlockComponentProps> = ({ data }) => {
  const {
    title, caption, altText, url, provenance, license, credit,
    status, aiGenerated, linkedClaims, relatedSources, archivalProvenance,
  } = data as unknown as ImageBlockData;

  const canRender = Boolean(url);
  const isAiGenerated = aiGenerated === true;
  const evidenceLevel = archivalProvenance?.evidenceLevel;
  const isPdf = isPdfUrl(url);

  const lightbox = useLightbox({ id: title });

  if (!canRender) {
    return (
      <figure className="my-12 md:my-16 p-4 md:p-6 bg-gray-50/40 rounded-xl border border-gray-200/50" data-visual-block="image">
        <LicensingPlaceholder
          type="image"
          title={title}
          caption={caption}
          creator={provenance?.creator}
          source={provenance?.source}
          reference={provenance?.reference}
          rights={license}
          status={status}
        />
        <figcaption className="mt-3 px-1">
          {(provenance || license || archivalProvenance?.citationChicago) && (
            <details className="group">
              <summary className="text-xs text-blue-600 cursor-pointer hover:text-blue-800 select-none">
                Full metadata & citation
              </summary>
              <div className="mt-2 pl-3 border-l-2 border-gray-200 space-y-1.5 text-xs text-gray-500">
                {provenance?.creator && <p><span className="font-medium">Creator:</span> {provenance.creator}</p>}
                {provenance?.source && <p><span className="font-medium">Source:</span> {provenance.source}</p>}
                {provenance?.reference && <p><span className="font-medium">Reference:</span> {provenance.reference}</p>}
                {provenance?.date && <p><span className="font-medium">Date:</span> {provenance.date}</p>}
                {license && <p><span className="font-medium">License:</span> {license}</p>}
                {archivalProvenance?.citationChicago && (
                  <div className="mt-2 pt-2 border-t border-gray-100">
                    <p className="font-medium text-gray-600">Citation (Chicago):</p>
                    <p className="mt-0.5 italic">{archivalProvenance.citationChicago}</p>
                  </div>
                )}
                {archivalProvenance?.archiveHierarchy && (
                  <p><span className="font-medium">Archive:</span> {archivalProvenance.archiveHierarchy}</p>
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
      </figure>
    );
  }

  return (
    <figure className="my-12 md:my-16 p-4 md:p-6 bg-gray-50/40 rounded-xl border border-gray-200/50" data-visual-block="image">
      <div
        className="relative overflow-hidden rounded-xl border border-gray-200 bg-gray-50"
        onClick={lightbox.open}
      >
        {isPdf ? (
          <div className="flex flex-col items-center justify-center py-16 px-8 cursor-pointer hover:bg-gray-100 transition-colors">
            <svg className="w-16 h-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3v4a1 1 0 001 1h4" />
            </svg>
            <p className="text-sm font-medium text-gray-700 mb-1">Document Facsimile</p>
            <p className="text-xs text-gray-500">Click to view</p>
          </div>
        ) : (
          <>
            <img
              src={url}
              alt={altText || title}
              className="w-full h-auto object-contain cursor-pointer"
              loading="lazy"
            />
            {isAiGenerated && (
              <span className="absolute top-2 right-2 px-2 py-0.5 text-xs font-medium rounded bg-purple-100 text-purple-700 border border-purple-200">
                AI-generated diagram
              </span>
            )}
          </>
        )}
      </div>

      <figcaption className="mt-3 px-1 space-y-2">
        <p className="text-sm font-semibold text-gray-900">{title}</p>
        {caption && <p className="text-sm text-gray-600">{caption}</p>}

        <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-gray-400">
          {credit && <span>{credit}</span>}
          {evidenceLevel && <span className="font-mono">Evidence: {evidenceLevel}</span>}
          {archivalProvenance?.archiveHierarchy && <span className="truncate max-w-[200px]">{archivalProvenance.archiveHierarchy}</span>}
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

        {relatedSources && relatedSources.length > 0 && (
          <div className="pt-1">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Related Sources</p>
            <div className="flex flex-wrap gap-1.5 mt-0.5">
              {relatedSources.map((s) => (
                <span key={s} className="px-2 py-0.5 text-xs rounded-full bg-gray-50 text-gray-600 border border-gray-200">
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}

        {archivalProvenance?.note && (
          <p className="text-xs text-amber-600"><span className="font-medium">Note:</span> {archivalProvenance.note}</p>
        )}

        <button
          onClick={lightbox.open}
          className="text-xs text-blue-600 hover:text-blue-800 font-medium"
        >
          {isPdf ? 'View document' : 'Open high-resolution'}
        </button>

        {(provenance || license || archivalProvenance?.citationChicago) && (
          <details className="group">
            <summary className="text-xs text-blue-600 cursor-pointer hover:text-blue-800 select-none">
              Asset details & citation
            </summary>
            <div className="mt-2 pl-3 border-l-2 border-gray-200 space-y-1.5 text-xs text-gray-500">
              {provenance?.creator && <p><span className="font-medium">Creator:</span> {provenance.creator}</p>}
              {provenance?.source && <p><span className="font-medium">Source:</span> {provenance.source}</p>}
              {provenance?.reference && <p><span className="font-medium">Reference:</span> {provenance.reference}</p>}
              {provenance?.date && <p><span className="font-medium">Date:</span> {provenance.date}</p>}
              {license && <p><span className="font-medium">License:</span> {license}</p>}
              {archivalProvenance?.citationChicago && (
                <div className="mt-2 pt-2 border-t border-gray-100">
                  <p className="font-medium text-gray-600">Citation (Chicago):</p>
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

      {lightbox.isOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          {...lightbox.overlayProps}
        >
          <div className="relative max-w-5xl max-h-[90vh] flex flex-col items-center" onClick={(e) => e.stopPropagation()}>
            {isPdf ? (
              <iframe
                src={url}
                className="w-full h-[80vh] rounded-lg"
                title={title}
              />
            ) : (
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
            )}
            <div className="absolute top-4 right-4 flex items-center gap-2">
              {!isPdf && (
                <>
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
                </>
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
