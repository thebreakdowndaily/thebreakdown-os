import React from 'react';
import type { GeographicCoverageReport, CoverageGap } from '@/services/radar/coverage/types';

interface CoverageScorecardProps {
  report: GeographicCoverageReport;
  countryName?: string;
}

export function CoverageScorecard({ report, countryName = 'India (Madhya Pradesh)' }: CoverageScorecardProps) {
  const {
    totalGeographicUnits,
    strongCoverageCount,
    activeCoverageCount,
    partialCoverageCount,
    blindCoverageCount,
    detectedGaps,
    units,
  } = report;

  const totalPrimary = units.reduce((acc, u) => acc + u.primarySources, 0);
  const totalSecondary = units.reduce((acc, u) => acc + u.secondarySources, 0);
  const totalHealthy = units.reduce((acc, u) => acc + u.healthySources, 0);
  const totalSources = totalPrimary + totalSecondary;

  const criticalGaps = detectedGaps.filter((g) => g.severity === 'CRITICAL');
  const warningGaps = detectedGaps.filter((g) => g.severity === 'WARNING');

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6 mb-8 shadow-sm">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 pb-4 border-b border-gray-100 dark:border-gray-800 gap-2">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-gray-900 dark:text-gray-100">
            Global Coverage Scorecard — {countryName}
          </h2>
          <p className="text-xs text-gray-500">
            Multi-dimensional sensing telemetry across {totalGeographicUnits} administrative units
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs px-2.5 py-1 bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300 rounded font-medium">
            {blindCoverageCount} Blind Nodes
          </span>
          <span className="text-xs px-2.5 py-1 bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 rounded font-medium">
            {partialCoverageCount} Partial
          </span>
          <span className="text-xs px-2.5 py-1 bg-green-100 text-green-800 dark:bg-green-950/60 dark:text-green-300 rounded font-medium">
            {strongCoverageCount + activeCoverageCount} Active / Strong
          </span>
        </div>
      </div>

      {/* Multi-Dimensional Sensor Breakdown */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded border border-gray-100 dark:border-gray-800">
          <span className="text-xs text-gray-500 block uppercase font-medium">Primary Sources</span>
          <span className="text-2xl font-light text-gray-900 dark:text-gray-100">{totalPrimary}</span>
          <span className="text-[11px] text-gray-400 block">
            {totalSources > 0 ? `${Math.round((totalPrimary / totalSources) * 100)}% official origin` : '—'}
          </span>
        </div>
        <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded border border-gray-100 dark:border-gray-800">
          <span className="text-xs text-gray-500 block uppercase font-medium">Secondary Press</span>
          <span className="text-2xl font-light text-gray-900 dark:text-gray-100">{totalSecondary}</span>
          <span className="text-[11px] text-gray-400 block">regional / media</span>
        </div>
        <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded border border-gray-100 dark:border-gray-800">
          <span className="text-xs text-gray-500 block uppercase font-medium">Healthy Sensors</span>
          <span className="text-2xl font-light text-green-600 dark:text-green-400">{totalHealthy}</span>
          <span className="text-[11px] text-gray-400 block">
            {totalSources > 0 ? `${Math.round((totalHealthy / totalSources) * 100)}% availability` : '—'}
          </span>
        </div>
        <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded border border-gray-100 dark:border-gray-800">
          <span className="text-xs text-gray-500 block uppercase font-medium">Coverage Deficits</span>
          <span className="text-2xl font-light text-amber-600 dark:text-amber-400">{detectedGaps.length}</span>
          <span className="text-[11px] text-gray-400 block">
            {criticalGaps.length} critical, {warningGaps.length} warning
          </span>
        </div>
      </div>

      {/* Diagnostic Coverage Deficits */}
      {detectedGaps.length > 0 && (
        <div className="mt-4">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">
            Active Coverage Gaps &amp; Blind Spot Diagnostics
          </h3>
          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
            {detectedGaps.map((gap: CoverageGap, idx: number) => (
              <div
                key={`${gap.geographyId}-${gap.gapType}-${idx}`}
                className="flex items-start justify-between p-2.5 bg-gray-50 dark:bg-gray-800/40 rounded border border-gray-200 dark:border-gray-700/50 text-xs"
              >
                <div className="pr-4">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-900 dark:text-gray-100">
                      {gap.geographyName}
                    </span>
                    <span className="text-[10px] text-gray-400">({gap.gapType})</span>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 mt-0.5">{gap.details}</p>
                  <p className="text-[11px] text-blue-600 dark:text-blue-400 mt-0.5 font-medium">
                    ↳ Remedy: {gap.remedyRecommendation}
                  </p>
                </div>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase shrink-0 ${
                    gap.severity === 'CRITICAL'
                      ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                      : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                  }`}
                >
                  {gap.severity}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
