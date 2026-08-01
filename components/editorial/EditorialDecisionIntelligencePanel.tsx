import React from 'react';
import { PlatformEditorialIntelligenceProjection } from '@/types/editorial-intelligence';

interface EditorialDecisionIntelligencePanelProps {
  projection: PlatformEditorialIntelligenceProjection;
}

export default function EditorialDecisionIntelligencePanel({ projection }: EditorialDecisionIntelligencePanelProps) {
  const { storyImpact, evidenceQuality, sourceDiversity, riskAssessments, readinessRecommendation } = projection;

  return (
    <div className="bg-gray-800/40 border border-gray-700/60 rounded-xl p-6 space-y-6 font-sans text-gray-100">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-700/60 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-emerald-400 font-bold uppercase">
              {projection.platformVersion} Editorial Decision Intelligence
            </span>
            <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2.5 py-0.5 rounded border border-emerald-500/40 font-bold font-mono">
              Story Readiness: {readinessRecommendation.readinessPercent}%
            </span>
          </div>
          <h3 className="text-xl font-bold text-gray-100 mt-1">
            Multidimensional Editorial Decision Support & Readiness Evaluator
          </h3>
        </div>

        <div className="flex items-center gap-3 font-mono text-xs">
          <span className="text-gray-400">Editorial Confidence:</span>
          <span className="px-3 py-1 rounded-full border font-bold uppercase bg-blue-500/20 text-blue-300 border-blue-500/40">
            {readinessRecommendation.editorialConfidencePercent}%
          </span>
        </div>
      </div>

      {/* Summary Cards (4 Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Story Impact Score */}
        <div className="bg-gray-900/60 p-4 rounded-xl border border-gray-800 space-y-1">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Story Impact</span>
          <strong className="text-2xl text-emerald-400 font-mono">{storyImpact.overallImpactScore} / 100</strong>
          <div className="text-[11px] text-gray-400 font-mono pt-1 border-t border-gray-800 flex justify-between">
            <span>Knowledge Gap: {storyImpact.knowledgeGapScore}</span>
          </div>
        </div>

        {/* Card 2: Evidence Quality */}
        <div className="bg-gray-900/60 p-4 rounded-xl border border-gray-800 space-y-1">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Evidence Quality</span>
          <strong className="text-2xl text-blue-400 font-mono">{evidenceQuality.overallQualityScore} / 100</strong>
          <div className="text-[11px] text-gray-400 font-mono pt-1 border-t border-gray-800 flex justify-between">
            <span>Traceability: {evidenceQuality.traceabilityScore}%</span>
          </div>
        </div>

        {/* Card 3: Source Diversity */}
        <div className="bg-gray-900/60 p-4 rounded-xl border border-gray-800 space-y-1">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Source Diversity</span>
          <strong className="text-2xl text-purple-400 font-mono">{sourceDiversity.academicSourceCount + sourceDiversity.primarySourceCount} Sources</strong>
          <div className="text-[11px] text-gray-400 font-mono pt-1 border-t border-gray-800 flex justify-between">
            <span>Primary: {sourceDiversity.primarySourceCount} | Academic: {sourceDiversity.academicSourceCount}</span>
          </div>
        </div>

        {/* Card 4: Editorial Risk */}
        <div className="bg-gray-900/60 p-4 rounded-xl border border-gray-800 space-y-1">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Risk Assessment</span>
          <strong className="text-2xl text-amber-300 font-mono">Low Risk</strong>
          <div className="text-[11px] text-gray-400 font-mono pt-1 border-t border-gray-800 flex justify-between">
            <span>6 Risk Axes Evaluated</span>
          </div>
        </div>

      </div>

      {/* 6 Risk Axes Grid */}
      <div className="space-y-3">
        <h4 className="text-sm font-bold text-gray-300 uppercase tracking-wider">
          Multi-Axis Editorial Risk Heatmap ({riskAssessments.length} Axes)
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs font-mono">
          {riskAssessments.map((risk) => (
            <div key={risk.riskAxis} className="bg-gray-900/60 p-3 rounded-lg border border-gray-800 space-y-1">
              <div className="flex justify-between items-center">
                <strong className="text-gray-200 font-bold">{risk.riskAxis}</strong>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/40">
                  {risk.score}/100 Risk
                </span>
              </div>
              <p className="text-gray-400 text-[11px]">{risk.summary}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Actionable Readiness Recommendation */}
      <div className="space-y-3">
        <h4 className="text-sm font-bold text-gray-300 uppercase tracking-wider">
          Publication Readiness Recommendation & Actionable Steps
        </h4>
        <div className="bg-gray-900/60 p-4 rounded-xl border border-gray-800 space-y-3 text-xs font-mono">
          <div>
            <strong className="text-emerald-400 block text-xs uppercase mb-1">Strengths:</strong>
            <ul className="list-disc list-inside space-y-0.5 text-gray-300">
              {readinessRecommendation.strengths.map((s, idx) => (
                <li key={idx}>{s}</li>
              ))}
            </ul>
          </div>
          <div>
            <strong className="text-amber-300 block text-xs uppercase mb-1">Concerns:</strong>
            <ul className="list-disc list-inside space-y-0.5 text-gray-300">
              {readinessRecommendation.concerns.map((c, idx) => (
                <li key={idx}>{c}</li>
              ))}
            </ul>
          </div>
          <div>
            <strong className="text-blue-300 block text-xs uppercase mb-1">Recommended Actions:</strong>
            <ul className="list-disc list-inside space-y-0.5 text-gray-300">
              {readinessRecommendation.recommendedActions.map((a, idx) => (
                <li key={idx}>{a}</li>
              ))}
            </ul>
          </div>
          <div className="text-[10px] text-gray-400 italic pt-2 border-t border-gray-800">
            {readinessRecommendation.advisoryDisclaimer}
          </div>
        </div>
      </div>

    </div>
  );
}
