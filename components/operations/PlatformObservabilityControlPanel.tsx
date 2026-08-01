import React from 'react';
import { PlatformObservabilityProjection } from '@/types/observability';

interface PlatformObservabilityControlPanelProps {
  projection: PlatformObservabilityProjection;
}

export default function PlatformObservabilityControlPanel({ projection }: PlatformObservabilityControlPanelProps) {
  const { systemHealthScore, traceSpans, anomalyAlerts, capacityForecasts, reliabilityScore, recommendations } = projection;

  return (
    <div className="bg-gray-800/40 border border-gray-700/60 rounded-xl p-6 space-y-6 font-sans text-gray-100">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-700/60 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-cyan-400 font-bold uppercase">
              {projection.platformVersion} Observability & Intelligence
            </span>
            <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2.5 py-0.5 rounded border border-emerald-500/40 font-bold font-mono">
              System Health Score: {systemHealthScore}/100
            </span>
          </div>
          <h3 className="text-xl font-bold text-gray-100 mt-1">
            Distributed Tracing, Anomaly Detection & AI Insights
          </h3>
        </div>

        <div className="flex items-center gap-3 font-mono text-xs">
          <span className="text-gray-400">Trace DAG Spans:</span>
          <span className="px-3 py-1 rounded-full border font-bold uppercase bg-cyan-500/20 text-cyan-300 border-cyan-500/40">
            {traceSpans.length} Spans Correlated
          </span>
        </div>
      </div>

      {/* Observability & Reliability Summary (4 Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Overall System Health */}
        <div className="bg-gray-900/60 p-4 rounded-xl border border-gray-800 space-y-1">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">System Health Score</span>
          <strong className="text-2xl text-emerald-400 font-mono">{systemHealthScore} / 100</strong>
          <div className="text-[11px] text-gray-400 font-mono pt-1 border-t border-gray-800 flex justify-between">
            <span>SLO Compliance: {reliabilityScore.sloComplianceScore}%</span>
          </div>
        </div>

        {/* Card 2: Anomaly Alerts */}
        <div className="bg-gray-900/60 p-4 rounded-xl border border-gray-800 space-y-1">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Anomalies Detected</span>
          <strong className="text-2xl text-amber-300 font-mono">{anomalyAlerts.length} Active</strong>
          <div className="text-[11px] text-gray-400 font-mono pt-1 border-t border-gray-800 flex justify-between">
            <span>Severity: {anomalyAlerts[0]?.severity || 'NONE'}</span>
          </div>
        </div>

        {/* Card 3: Capacity Forecasts */}
        <div className="bg-gray-900/60 p-4 rounded-xl border border-gray-800 space-y-1">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Capacity Forecast (72h)</span>
          <strong className="text-2xl text-blue-400 font-mono">
            {capacityForecasts[0]?.expectedUtilizationPercent || 55}% Max
          </strong>
          <div className="text-[11px] text-gray-400 font-mono pt-1 border-t border-gray-800 flex justify-between">
            <span>Confidence: {capacityForecasts[0]?.confidencePercent || 94.5}%</span>
          </div>
        </div>

        {/* Card 4: Advisory Recommendations */}
        <div className="bg-gray-900/60 p-4 rounded-xl border border-gray-800 space-y-1">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">AI Operational Insights</span>
          <strong className="text-2xl text-purple-400 font-mono">{recommendations.length} Advisory</strong>
          <div className="text-[11px] text-gray-400 font-mono pt-1 border-t border-gray-800 flex justify-between">
            <span>Model: {recommendations[0]?.modelVersion || 'v2.1'}</span>
          </div>
        </div>

      </div>

      {/* Decomposable Reliability Score Breakdown */}
      <div className="space-y-3">
        <h4 className="text-sm font-bold text-gray-300 uppercase tracking-wider">
          Decomposable Reliability Score Breakdown
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs font-mono">
          <div className="bg-gray-900/60 p-3 rounded-lg border border-gray-800">
            <span className="text-gray-400 text-[10px] block">Deployment Success</span>
            <strong className="text-emerald-300 text-base">{reliabilityScore.deploymentSuccessScore}%</strong>
          </div>
          <div className="bg-gray-900/60 p-3 rounded-lg border border-gray-800">
            <span className="text-gray-400 text-[10px] block">SLO Compliance</span>
            <strong className="text-emerald-300 text-base">{reliabilityScore.sloComplianceScore}%</strong>
          </div>
          <div className="bg-gray-900/60 p-3 rounded-lg border border-gray-800">
            <span className="text-gray-400 text-[10px] block">Latency Stability</span>
            <strong className="text-emerald-300 text-base">{reliabilityScore.latencyStabilityScore}%</strong>
          </div>
          <div className="bg-gray-900/60 p-3 rounded-lg border border-gray-800">
            <span className="text-gray-400 text-[10px] block">Error-Rate Stability</span>
            <strong className="text-emerald-300 text-base">{reliabilityScore.errorRateStabilityScore}%</strong>
          </div>
          <div className="bg-gray-900/60 p-3 rounded-lg border border-gray-800">
            <span className="text-gray-400 text-[10px] block">Rollback Frequency</span>
            <strong className="text-emerald-300 text-base">{reliabilityScore.rollbackFrequencyScore}%</strong>
          </div>
        </div>
      </div>

      {/* Distributed Trace DAG Spans */}
      <div className="space-y-3">
        <h4 className="text-sm font-bold text-gray-300 uppercase tracking-wider">
          Distributed Trace Spans ({traceSpans.length})
        </h4>
        <div className="space-y-2 text-xs font-mono">
          {traceSpans.map((span) => (
            <div key={span.spanId} className="bg-gray-900/60 p-3 rounded-lg border border-gray-800 flex justify-between items-center">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-cyan-400 font-bold">{span.subsystem}</span>
                  <span className="text-gray-400">/</span>
                  <strong className="text-gray-200">{span.operation}</strong>
                </div>
                <span className="text-[10px] text-gray-400">
                  Trace: {span.traceId} | Parent: {span.parentSpanId || 'NONE (ROOT)'}
                </span>
              </div>
              <div className="text-right">
                <span className="text-emerald-300 font-bold block">{span.durationMs}ms</span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-500/40">
                  {span.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Explainable Operational Recommendations (Observe. Explain. Recommend. Never execute.) */}
      <div className="space-y-3">
        <h4 className="text-sm font-bold text-gray-300 uppercase tracking-wider">
          Explainable Advisory Recommendations ({recommendations.length})
        </h4>
        <div className="space-y-2 text-xs font-mono">
          {recommendations.map((rec) => (
            <div key={rec.recommendationId} className="bg-gray-900/60 p-3 rounded-lg border border-gray-800 space-y-1">
              <div className="flex justify-between items-center">
                <strong className="text-purple-300 font-bold">{rec.title}</strong>
                <span className="text-[10px] bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded border border-purple-500/40">
                  Confidence: {rec.confidenceScore * 100}% | Model: {rec.modelVersion}
                </span>
              </div>
              <p className="text-gray-300 text-[11px]">{rec.rationale}</p>
              <div className="text-[10px] text-gray-400 pt-1 border-t border-gray-800 flex justify-between">
                <span>Suggested Action: {rec.suggestedAction}</span>
                <span>Subsystems: {rec.affectedSubsystems.join(', ')}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
