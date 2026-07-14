'use client';

import type { FC } from 'react';
import type { BlockComponentProps } from '../core/block-registry';
import { LicensingPlaceholder } from './LicensingPlaceholder';

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
  note?: string;
  archivalProvenance?: ArchivalProvenance;
}

export const ImageBlock: FC<BlockComponentProps> = ({ data }) => {
  const {
    title, caption, altText, url, provenance, license, credit,
    status, aiGenerated, archivalProvenance,
  } = data as unknown as ImageBlockData;

  const canRender = Boolean(url);
  const isAiGenerated = aiGenerated === true;
  const evidenceLevel = archivalProvenance?.evidenceLevel;

  if (!canRender) {
    return (
      <figure className="my-8">
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
    <figure className="my-8">
      <div className="relative">
        <div className="relative overflow-hidden rounded-xl border border-gray-200 bg-gray-50">
          <img
            src={url}
            alt={altText || title}
            className="w-full h-auto max-h-[600px] object-contain"
            loading="lazy"
          />
          {isAiGenerated && (
            <span className="absolute top-2 right-2 px-2 py-0.5 text-xs font-medium rounded bg-purple-100 text-purple-700 border border-purple-200">
              AI-generated diagram
            </span>
          )}
        </div>
      </div>

      <figcaption className="mt-3 px-1">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-gray-900">{title}</p>
            {caption && <p className="text-sm text-gray-600 mt-0.5">{caption}</p>}
            {credit && (
              <p className="text-xs text-gray-400 mt-1">
                {credit}
                {evidenceLevel && <span className="ml-2">(Evidence: {evidenceLevel})</span>}
              </p>
            )}
          </div>
        </div>

        {(provenance || license || archivalProvenance?.citationChicago) && (
          <details className="mt-2 group">
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
};
