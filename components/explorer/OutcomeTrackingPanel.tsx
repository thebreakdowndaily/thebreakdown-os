import React from 'react';
import { OutcomeTrackingProjection } from '@/types/outcome-tracking';
import Link from 'next/link';

interface OutcomeTrackingPanelProps {
  projection: OutcomeTrackingProjection;
}

export default function OutcomeTrackingPanel({ projection }: OutcomeTrackingPanelProps) {
  const { metrics, metricCount, descriptiveDisclaimer, problemSlug } = projection;

  return (
    <div className="bg-gray-800/40 border border-gray-700/60 rounded-xl p-6 space-y-6 font-sans text-gray-100 max-w-5xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-700/60 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-emerald-400 font-bold uppercase">
              {projection.platformVersion} Outcome Tracking Engine
            </span>
            <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2.5 py-0.5 rounded border border-emerald-500/40 font-bold font-mono">
              {metricCount} Longitudinal Metrics
            </span>
          </div>
          <h3 className="text-2xl font-bold text-gray-100 mt-1">
            Longitudinal Outcome Tracking & Metrics Dashboard
          </h3>
          <p className="text-xs text-gray-400 font-mono mt-1">
            Observe baseline vs current implementation metrics over time with explicit evidence provenance and revision markers.
          </p>
        </div>

        {problemSlug && (
          <Link href={`/problems/${problemSlug}`} className="text-xs font-mono text-emerald-400 hover:underline">
            ← Back to Problem Tree
          </Link>
        )}
      </div>

      {/* Non-Causal Safeguard Disclaimer (Refinement 1) */}
      <div className="bg-gray-900/80 border border-emerald-500/40 rounded-xl p-4 text-xs font-mono text-emerald-300 space-y-1">
        <strong className="block uppercase text-[11px] font-bold">📈 Descriptive Outcome Safeguard</strong>
        <p className="text-gray-300 text-[11px]">{descriptiveDisclaimer}</p>
      </div>

      {/* Metric Dashboard Cards */}
      <div className="space-y-6">
        {metrics.map((met) => (
          <div key={met.metricId} className="bg-gray-900/60 p-6 rounded-xl border border-gray-800 space-y-6 font-mono text-xs">
            
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] bg-blue-500/20 text-blue-300 px-2.5 py-0.5 rounded border border-blue-500/40 font-bold uppercase">
                  {met.resolution} Resolution
                </span>
                <h4 className="text-lg font-bold text-gray-100 mt-2">{met.metricTitle}</h4>
              </div>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded border border-emerald-500/40 font-bold uppercase">
                Trend: {met.trend}
              </span>
            </div>

            {/* Baseline vs Current Callouts (Refinement 8) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gray-800/40 p-4 rounded-lg border border-gray-800 text-xs">
              <div>
                <span className="text-gray-400 text-[10px] block uppercase">Baseline Observation</span>
                <strong className="text-xl text-gray-200">{met.baselineValue} {met.unit}</strong>
              </div>
              <div>
                <span className="text-gray-400 text-[10px] block uppercase">Current Observation</span>
                <strong className="text-xl text-emerald-400">{met.currentValue} {met.unit}</strong>
              </div>
            </div>

            <p className="text-gray-300 text-xs bg-gray-800/40 p-3 rounded-lg border border-gray-800">
              <strong className="text-amber-300 text-[11px] block uppercase mb-0.5">Trend Explanation & Limitation:</strong>
              {met.trendReason}
              <br />
              <span className="text-gray-400 text-[11px] pt-1 block border-t border-gray-700/60 mt-2">
                ⚠️ <strong>Attribution Limitation:</strong> {met.attributionLimitation}
              </span>
            </p>

            {/* Time-Series Snapshots & Evidence Provenance (Refinements 5, 6) */}
            <div className="space-y-2">
              <strong className="text-xs font-bold text-gray-300 uppercase">Longitudinal Time-Series Snapshots ({met.timeSeries.length})</strong>
              <div className="space-y-1">
                {met.timeSeries.map((pt) => (
                  <div key={pt.pointId} className="bg-gray-800/40 p-2.5 rounded border border-gray-800 flex justify-between items-center text-[11px]">
                    <div>
                      <strong className="text-gray-200">{pt.label} ({pt.timestamp})</strong>
                      <p className="text-gray-400 text-[10px]">Source: {pt.evidenceSourceTitle}</p>
                    </div>
                    <strong className="text-emerald-400 font-mono text-sm">{pt.value} {pt.unit}</strong>
                  </div>
                ))}
              </div>
            </div>

            {/* Implementation Revision Log (Refinement 4) */}
            <div className="space-y-2">
              <strong className="text-xs font-bold text-gray-300 uppercase">Implementation Revision Markers ({met.revisions.length})</strong>
              <div className="space-y-1.5">
                {met.revisions.map((rev) => (
                  <div key={rev.revisionId} className="bg-gray-800/40 p-3 rounded border border-gray-800 text-[11px] space-y-1">
                    <div className="flex justify-between items-center">
                      <strong className="text-purple-300">{rev.title} ({rev.revisionDate})</strong>
                      <span className="text-[10px] text-gray-400">{rev.revisionId}</span>
                    </div>
                    <p className="text-gray-300">{rev.description}</p>
                    <p className="text-gray-400 text-[10px]">Notification: {rev.officialNotificationTitle}</p>
                    <p className="text-emerald-300 text-[10px]">Observed Note: {rev.observedPostChangeNote}</p>
                  </div>
                ))}
              </div>
            </div>

          </div>
        ))}
      </div>

    </div>
  );
}
