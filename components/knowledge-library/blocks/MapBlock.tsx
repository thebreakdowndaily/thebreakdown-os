'use client';

import type { FC } from 'react';
import type { BlockComponentProps } from '../core/block-registry';
import { LicensingPlaceholder } from './LicensingPlaceholder';

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

interface MapBlockData {
  title: string;
  caption: string;
  altText?: string;
  url?: string;
  mapType: string;
  dataSource: string;
  disputedBoundaries?: boolean;
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
    disputedBoundaries, provenance, license, credit,
    status, archivalProvenance,
  } = data as unknown as MapBlockData;

  const canRender = Boolean(url);
  const evidenceLevel = archivalProvenance?.evidenceLevel;

  if (!canRender) {
    return (
      <figure className="my-8">
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
    <figure className="my-8">
      <div className="relative">
        <div className="relative overflow-hidden rounded-xl border border-gray-200 bg-white p-2">
          <img
            src={url}
            alt={altText || title}
            className="w-full h-auto max-h-[500px] object-contain"
            loading="lazy"
          />
          {disputedBoundaries && (
            <span className="absolute top-3 left-3 px-2 py-0.5 text-xs font-medium rounded bg-amber-100 text-amber-700 border border-amber-200">
              Contains disputed boundaries
            </span>
          )}
        </div>
      </div>

      <figcaption className="mt-3 px-1">
        <p className="text-sm font-semibold text-gray-900">{title}</p>
        {caption && <p className="text-sm text-gray-600 mt-0.5">{caption}</p>}
        <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-gray-400 mt-1">
          {mapType && <span>Type: {mapType}</span>}
          {dataSource && <span>Data: {dataSource}</span>}
          {credit && <span>{credit}</span>}
          {evidenceLevel && <span>Evidence: {evidenceLevel}</span>}
        </div>

        {(provenance || license || archivalProvenance?.citationChicago) && (
          <details className="mt-2 group">
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
              {disputedBoundaries && (
                <p className="text-amber-600"><span className="font-medium">Boundary note:</span> Dashed lines mark disputed borders. Per Book of Record #0003, these must not be presented as settled fact.</p>
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
};
