import React from 'react';
import Link from 'next/link';
import {
  EditorialDashboardData,
  ResearchRecommendation,
} from '@/services/intelligence/intelligence-types';
import { GoldStandardAuditCertificate } from '@/services/editorial/gold-standard-audit.service';

interface IntelligenceDashboardViewProps {
  dashboardData: EditorialDashboardData;
  researchRecommendations: ResearchRecommendation[];
  goldAuditCert: GoldStandardAuditCertificate;
}

export default function IntelligenceDashboardView({
  dashboardData,
  researchRecommendations,
  goldAuditCert,
}: IntelligenceDashboardViewProps) {
  const {
    reviewQueueCount,
    verificationBacklogCount,
    staleContentCount,
    unresolvedConflictsCount,
    evidenceHealthIndex,
    publicationReadinessScore,
    topInsights,
    topGaps,
    topConflicts,
  } = dashboardData;

  return (
    <div className="space-y-8 text-gray-100 font-sans">
      {/* 1. Operational Health Bar */}
      <section aria-labelledby="op-health-heading">
        <h2 id="op-health-heading" className="sr-only">
          Operational Health Overview
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-gray-800/60 border border-gray-700/60 rounded-xl p-4 space-y-1">
            <span className="text-xs text-gray-400 font-medium">Review Queue</span>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-bold text-amber-400">{reviewQueueCount}</span>
              <span className="text-[11px] bg-amber-500/10 text-amber-300 px-2 py-0.5 rounded font-mono border border-amber-500/20">
                Pending Approval
              </span>
            </div>
            <p className="text-[11px] text-gray-400">Chapters awaiting fact-check sign-off</p>
          </div>

          <div className="bg-gray-800/60 border border-gray-700/60 rounded-xl p-4 space-y-1">
            <span className="text-xs text-gray-400 font-medium">Verification Backlog</span>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-bold text-red-400">{verificationBacklogCount}</span>
              <span className="text-[11px] bg-red-500/10 text-red-300 px-2 py-0.5 rounded font-mono border border-red-500/20">
                Action Needed
              </span>
            </div>
            <p className="text-[11px] text-gray-400">Fixes with Low evidence or 0 sources</p>
          </div>

          <div className="bg-gray-800/60 border border-gray-700/60 rounded-xl p-4 space-y-1">
            <span className="text-xs text-gray-400 font-medium">Evidence Health Index</span>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-bold text-emerald-400">{evidenceHealthIndex}%</span>
              <span className="text-[11px] bg-emerald-500/10 text-emerald-300 px-2 py-0.5 rounded font-mono border border-emerald-500/20">
                Verified Quality
              </span>
            </div>
            <p className="text-[11px] text-gray-400">Tier 1 source attestation ratio</p>
          </div>

          <div className="bg-gray-800/60 border border-gray-700/60 rounded-xl p-4 space-y-1">
            <span className="text-xs text-gray-400 font-medium">Stale Content Queue</span>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-bold text-purple-400">{staleContentCount}</span>
              <span className="text-[11px] bg-purple-500/10 text-purple-300 px-2 py-0.5 rounded font-mono border border-purple-500/20">
                &gt;180 Days Stale
              </span>
            </div>
            <p className="text-[11px] text-gray-400">Items requiring verification refresh</p>
          </div>

          <div className="bg-gray-800/60 border border-gray-700/60 rounded-xl p-4 space-y-1">
            <span className="text-xs text-gray-400 font-medium">Unresolved Conflicts</span>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-bold text-blue-400">{unresolvedConflictsCount}</span>
              <span className="text-[11px] bg-blue-500/10 text-blue-300 px-2 py-0.5 rounded font-mono border border-blue-500/20">
                Integrity Alerts
              </span>
            </div>
            <p className="text-[11px] text-gray-400">Cross-object claim or slug conflicts</p>
          </div>
        </div>
      </section>

      {/* 2. Main Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column (8 Cols): Intelligence Insights, Knowledge Gaps, Conflicts */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Module 1: Editorial Intelligence Insights */}
          <section aria-labelledby="insights-heading" className="bg-gray-800/40 border border-gray-700/60 rounded-xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-700/60 pb-3">
              <h3 id="insights-heading" className="text-lg font-bold text-gray-100 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
                Editorial Intelligence Insights ({(topInsights || []).length})
              </h3>
              <span className="text-xs text-gray-400 font-mono">
                Derived dynamically from canonical models
              </span>
            </div>

            <div className="space-y-3">
              {(topInsights || []).map((ins) => (
                <div key={ins.id} className="bg-gray-900/60 border border-gray-800 rounded-lg p-4 space-y-2">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <span className="font-semibold text-amber-300 text-sm">{ins.title}</span>
                    <div className="flex items-center gap-2 text-[11px]">
                      <span className="bg-gray-800 text-gray-300 px-2 py-0.5 rounded font-mono border border-gray-700">
                        {ins.category}
                      </span>
                      <span className={`px-2 py-0.5 rounded font-mono font-bold ${
                        ins.severity === 'CRITICAL' ? 'bg-red-500/20 text-red-300 border border-red-500/40' :
                        ins.severity === 'HIGH' || ins.severity === 'MEDIUM' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' :
                        'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                      }`}>
                        {ins.severity}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-gray-300 leading-relaxed">{ins.explanation}</p>

                  <div className="flex items-center justify-between border-t border-gray-800 pt-2 text-[11px] text-gray-400">
                    <span>Confidence Score: <strong className="text-gray-200">{Math.round(ins.confidence * 100)}%</strong></span>
                    {ins.supportingReferences && ins.supportingReferences.length > 0 && (
                      <div className="flex items-center gap-1">
                        <span>Target:</span>
                        <Link href={`/fix/${ins.supportingReferences[0].targetId}`} className="text-amber-400 hover:underline font-mono">
                          {ins.supportingReferences[0].label || ins.supportingReferences[0].targetId} →
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Module 2: Knowledge Gap Queue */}
          <section aria-labelledby="gaps-heading" className="bg-gray-800/40 border border-gray-700/60 rounded-xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-700/60 pb-3">
              <h3 id="gaps-heading" className="text-lg font-bold text-gray-100 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
                Knowledge Gap Queue ({(topGaps || []).length})
              </h3>
              <span className="text-xs text-gray-400 font-mono">
                Coverage & Freshness Analysis
              </span>
            </div>

            <div className="space-y-3">
              {(topGaps || []).map((gap) => (
                <div key={gap.id} className="bg-gray-900/60 border border-gray-800 rounded-lg p-4 space-y-2">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <span className="font-semibold text-gray-200 text-sm">{gap.title}</span>
                    <span className="bg-amber-500/10 text-amber-300 text-[11px] px-2 py-0.5 rounded font-mono border border-amber-500/30 uppercase">
                      {gap.type}
                    </span>
                  </div>
                  <p className="text-xs text-gray-300 leading-relaxed">{gap.description}</p>

                  <div className="bg-gray-800/50 p-2 rounded border border-gray-700/50 text-[11px] space-y-1">
                    <span className="text-emerald-400 font-bold block">Recommended Action:</span>
                    <span className="text-gray-300 block">{gap.recommendedAction}</span>
                  </div>

                  <div className="pt-1 text-[11px]">
                    <Link href={`/fix/${gap.affectedObjectId}`} className="text-amber-400 hover:underline font-mono">
                      Drill Down to Target Object ({gap.affectedObjectId}) →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Module 3: Conflict Resolution Center */}
          <section aria-labelledby="conflicts-heading" className="bg-gray-800/40 border border-gray-700/60 rounded-xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-700/60 pb-3">
              <h3 id="conflicts-heading" className="text-lg font-bold text-gray-100 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-400"></span>
                Conflict Resolution Center ({(topConflicts || []).length})
              </h3>
              <span className="text-xs text-gray-400 font-mono">
                Cross-Object Integrity Audit
              </span>
            </div>

            {(!topConflicts || topConflicts.length === 0) ? (
              <p className="text-xs text-emerald-400 bg-emerald-500/10 p-3 rounded border border-emerald-500/30">
                ✓ Zero cross-object conflicts detected across canonical repository.
              </p>
            ) : (
              <div className="space-y-3">
                {topConflicts.map((c) => (
                  <div key={c.id} className="bg-gray-900/60 border border-gray-800 rounded-lg p-4 space-y-2">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <span className="font-semibold text-red-300 text-sm">{c.conflictType}</span>
                      <span className="text-[11px] bg-red-500/20 text-red-300 px-2 py-0.5 rounded font-mono border border-red-500/40 font-bold">
                        {c.severity}
                      </span>
                    </div>
                    <p className="text-xs text-gray-300">{c.description}</p>
                    <div className="text-[11px] text-gray-400">
                      <span>Conflicting Items: </span>
                      <strong className="text-gray-200 font-mono">{c.objectIdA}, {c.objectIdB}</strong>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Right Column (4 Cols): Gold Standard Review Status & Research Recommendations */}
        <aside className="lg:col-span-4 space-y-8">
          
          {/* Module 4: Gold Standard Review Audit Monitor */}
          <section aria-labelledby="gold-audit-heading" className="bg-gray-800/60 border border-emerald-500/40 rounded-xl p-5 space-y-4">
            <div className="border-b border-gray-700/60 pb-3">
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest block mb-1">
                Active Publication Clearance
              </span>
              <h3 id="gold-audit-heading" className="text-base font-bold text-gray-100">
                Gold Standard Audit Status
              </h3>
            </div>

            <div className="bg-gray-900/80 p-4 rounded-lg border border-gray-800 space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-400">Target Chapter:</span>
                <Link href={`/founding-edition/${goldAuditCert.chapterSlug}`} className="font-bold text-amber-400 hover:underline">
                  Chapter 1 (Founding)
                </Link>
              </div>

              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-400">Overall Clearance:</span>
                <span className="text-xs bg-emerald-500/20 text-emerald-300 font-mono font-bold px-2 py-0.5 rounded border border-emerald-500/40">
                  {goldAuditCert.percentage}% PASSED
                </span>
              </div>

              <div className="border-t border-gray-800 pt-3 space-y-1.5 text-xs">
                {goldAuditCert.phases.map((p) => (
                  <div key={p.phaseNumber} className="flex items-center justify-between text-[11px]">
                    <span className="text-gray-300">Phase {p.phaseNumber}: {p.phaseName}</span>
                    <span className="text-emerald-400 font-mono font-bold">✓ {p.score}/{p.maxScore}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-1">
              <Link href={`/founding-edition/${goldAuditCert.chapterSlug}`} className="block text-center text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white py-2 rounded-lg transition-colors">
                Inspect Published Chapter 1 →
              </Link>
            </div>
          </section>

          {/* Module 5: Research Support & Recommendations */}
          <section aria-labelledby="research-rec-heading" className="bg-gray-800/40 border border-gray-700/60 rounded-xl p-5 space-y-4">
            <div className="border-b border-gray-700/60 pb-3">
              <h3 id="research-rec-heading" className="text-base font-bold text-gray-100 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-purple-400"></span>
                Research Copilot Suggestions ({researchRecommendations.length})
              </h3>
            </div>

            <div className="space-y-3">
              {researchRecommendations.map((rec) => (
                <div key={rec.id} className="bg-gray-900/60 border border-gray-800 rounded-lg p-3 space-y-1.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-semibold text-purple-300">{rec.category}</span>
                    <span className="text-gray-400 font-mono">Target: {rec.targetType}</span>
                  </div>
                  <p className="text-xs text-gray-300">{rec.title}</p>
                  <p className="text-[11px] text-gray-400 italic">Rationale: {rec.rationale}</p>
                </div>
              ))}
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
