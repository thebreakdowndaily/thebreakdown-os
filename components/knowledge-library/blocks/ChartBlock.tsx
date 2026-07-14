'use client';

import type { FC } from 'react';
import type { BlockComponentProps } from '../core/block-registry';
import { LicensingPlaceholder } from './LicensingPlaceholder';

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
    provenance, license, credit, status, archivalProvenance,
  } = data as unknown as ChartBlockData;

  const canRender = Boolean(url);
  const evidenceLevel = archivalProvenance?.evidenceLevel;

  if (!canRender) {
    return (
      <figure className="my-8">
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
    <figure className="my-8">
      <div className="relative">
        <div className="relative overflow-hidden rounded-xl border border-gray-200 bg-white p-2">
          <img
            src={url}
            alt={altText || title}
            className="w-full h-auto max-h-[400px] object-contain"
            loading="lazy"
          />
        </div>
      </div>

      <figcaption className="mt-3 px-1">
        <p className="text-sm font-semibold text-gray-900">{title}</p>
        {caption && <p className="text-sm text-gray-600 mt-0.5">{caption}</p>}
        <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-gray-400 mt-1">
          {chartType && <span>Type: {chartType}</span>}
          {dataSource && <span>Data: {dataSource}</span>}
          {credit && <span>{credit}</span>}
          {evidenceLevel && <span>Evidence: {evidenceLevel}</span>}
        </div>

        {(chartType || provenance || license || archivalProvenance?.citationChicago) && (
          <details className="mt-2 group">
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
};
