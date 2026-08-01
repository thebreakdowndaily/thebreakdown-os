'use client';

import React from 'react';
import Link from 'next/link';
import type { Fix, Stakeholder, ExistingSolution, GlobalExample, FixAction, FixMetric, FixSection } from '../../types/canonical';
import { getSourceCount, formatDateLong } from '../../lib/fix-helpers';
import { FeedbackSection } from '../rxs/LearningFooter';
import FixHeroStrip from './FixHeroStrip';
import TrustCard from './TrustCard';
import ExecutiveSummaryPanel from './ExecutiveSummaryPanel';
import ImpactScorecard from './ImpactScorecard';
import FixStickyNav from './FixStickyNav';
import FixLeftSidebar from './FixLeftSidebar';
import KnowledgeSidebar from './KnowledgeSidebar';
import TradeOffsMatrix from './TradeOffsMatrix';
import ImplementationRoadmap from './ImplementationRoadmap';
import SuccessMetricsDashboard from './SuccessMetricsDashboard';

interface FixRendererProps {
  fix: Fix;
}

function SectionCard({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="bg-[var(--color-surface-primary)] border border-[var(--color-border)] rounded-xl p-5 sm:p-6 mb-6">
      <h2 className="text-lg font-bold text-[var(--color-text-primary)] mb-4">{title}</h2>
      {children}
    </section>
  );
}

function FixSectionContent({ section }: { section: FixSection }) {
  return (
    <div>
      <h3 className="text-base font-semibold text-[var(--color-brand-400)] mb-2">{section.title}</h3>
      <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed mb-3">{section.content}</p>
      {section.supportingData && section.supportingData.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-3">
          {section.supportingData.map((d, i) => (
            <div key={i} className="bg-[var(--color-surface-secondary)] border border-[var(--color-border)] rounded-lg p-3 text-center">
              <span className="block text-lg font-bold text-[var(--color-brand-400)]">{d.value}</span>
              <span className="text-xs text-[var(--color-text-tertiary)]">{d.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function FixStakeholders({ stakeholders }: { stakeholders: Stakeholder[] }) {
  const stanceColors: Record<string, string> = {
    supports: 'bg-emerald-900/40 text-emerald-300 border-emerald-700',
    opposes: 'bg-red-900/40 text-red-300 border-red-700',
    neutral: 'bg-gray-700/40 text-gray-300 border-gray-600',
    mixed: 'bg-amber-900/40 text-amber-300 border-amber-700',
  };

  return (
    <SectionCard id="fix-stakeholders" title="Stakeholders">
      <div className="grid gap-3">
        {stakeholders.map((s, i) => (
          <div key={i} className="flex items-start gap-4 bg-[var(--color-surface-secondary)] border border-[var(--color-border)] rounded-lg p-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-[var(--color-text-primary)] text-sm">{s.name}</span>
                <span className="text-[10px] bg-[var(--color-surface-tertiary)] text-[var(--color-text-tertiary)] px-2 py-0.5 rounded">{s.type.replace('-', ' ')}</span>
                {s.stance && (
                  <span className={`text-[10px] px-2 py-0.5 rounded-full border ${stanceColors[s.stance] || stanceColors.neutral}`}>
                    {s.stance}
                  </span>
                )}
              </div>
              <p className="text-xs text-[var(--color-text-secondary)] mt-1">{s.role}</p>
              <p className="text-xs text-[var(--color-text-tertiary)] mt-0.5 italic">Interests: {s.interest}</p>
            </div>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}

function FixExistingSolutions({ solutions }: { solutions: ExistingSolution[] }) {
  const statusColors: Record<string, string> = {
    active: 'bg-blue-900/40 text-blue-300',
    proposed: 'bg-amber-900/40 text-amber-300',
    expired: 'bg-gray-700 text-gray-400',
    failed: 'bg-red-900/40 text-red-300',
  };

  return (
    <SectionCard id="fix-existing" title="What Has Been Tried?">
      {solutions.length === 0 ? (
        <p className="text-sm text-[var(--color-text-tertiary)] italic">No existing solutions documented.</p>
      ) : (
        <div className="grid gap-3">
          {solutions.map((s, i) => (
            <div key={i} className="bg-[var(--color-surface-secondary)] border border-[var(--color-border)] rounded-lg p-4">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="font-semibold text-[var(--color-text-primary)] text-sm">{s.name}</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full ${statusColors[s.status] || ''}`}>{s.status}</span>
              </div>
              <p className="text-xs text-[var(--color-text-secondary)]">{s.description}</p>
              {s.source && <p className="text-[10px] text-[var(--color-text-tertiary)] mt-1">Source: {s.source}</p>}
            </div>
          ))}
        </div>
      )}
    </SectionCard>
  );
}

function FixGlobalExamples({ examples }: { examples: GlobalExample[] }) {
  return (
    <SectionCard id="fix-global" title="Global Lessons">
      {examples.length === 0 ? (
        <p className="text-sm text-[var(--color-text-tertiary)] italic">No comparable global examples found.</p>
      ) : (
        <div className="grid gap-4">
          {examples.map((ex, i) => (
            <div key={i} className="bg-[var(--color-surface-secondary)] border border-[var(--color-border)] rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className="text-base font-semibold text-[var(--color-text-primary)]">{ex.country}</span>
                <span className="text-[10px] bg-indigo-900/40 text-indigo-300 px-2 py-0.5 rounded">{ex.policy}</span>
                {ex.applicableToIndia !== undefined && (
                  <span className={`text-[10px] px-2 py-0.5 rounded ${ex.applicableToIndia ? 'bg-emerald-900/40 text-emerald-300' : 'bg-gray-700 text-gray-400'}`}>
                    {ex.applicableToIndia ? 'Applicable to India' : 'Context-specific'}
                  </span>
                )}
              </div>
              <p className="text-xs text-[var(--color-text-secondary)] mb-2">{ex.description}</p>
              <div className="bg-[var(--color-surface-primary)] border border-[var(--color-border)] rounded p-2">
                <span className="text-xs font-medium text-[var(--color-brand-400)]">Outcome: </span>
                <span className="text-xs text-[var(--color-text-secondary)]">{ex.outcome}</span>
              </div>
              {ex.source && <p className="text-[10px] text-[var(--color-text-tertiary)] mt-2">Source: {ex.source}</p>}
            </div>
          ))}
        </div>
      )}
    </SectionCard>
  );
}

function FixActionList({ actions, title }: { actions: FixAction[]; title: string }) {
  const priorityColors: Record<string, string> = {
    critical: 'bg-red-900/50 text-red-300 border-red-700',
    high: 'bg-amber-900/50 text-amber-300 border-amber-700',
    medium: 'bg-blue-900/50 text-blue-300 border-blue-700',
    low: 'bg-gray-700 text-gray-400 border-gray-600',
  };

  const timeframeColors: Record<string, string> = {
    immediate: 'text-red-400',
    'short-term': 'text-amber-400',
    'medium-term': 'text-blue-400',
    'long-term': 'text-gray-400',
  };

  const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
  const sorted = [...actions].sort((a, b) => (priorityOrder[a.priority] || 99) - (priorityOrder[b.priority] || 99));

  return (
    <SectionCard id={title.toLowerCase().replace(/\s+/g, '-')} title={title}>
      {sorted.map((a, i) => (
        <div key={i} className="bg-[var(--color-surface-secondary)] border border-[var(--color-border)] rounded-lg p-4 mb-3 last:mb-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${priorityColors[a.priority] || priorityColors.medium}`}>
              {a.priority}
            </span>
            <span className={`text-[10px] ${timeframeColors[a.timeframe] || timeframeColors['medium-term']}`}>
              {a.timeframe.replace('-', ' ')}
            </span>
          </div>
          <h4 className="font-semibold text-[var(--color-text-primary)] text-sm mt-1">{a.title}</h4>
          <p className="text-xs text-[var(--color-text-secondary)] mt-1">{a.description}</p>
          <div className="flex flex-wrap gap-1.5 mt-2">
            {a.actors.map((actor) => (
              <span key={actor} className="text-[10px] bg-[var(--color-surface-primary)] text-[var(--color-text-tertiary)] px-2 py-0.5 rounded border border-[var(--color-border)]">
                {actor}
              </span>
            ))}
          </div>
        </div>
      ))}
    </SectionCard>
  );
}

function FixMetricsTable({ metrics }: { metrics: FixMetric[] }) {
  return (
    <SectionCard id="fix-metrics" title="Metrics to Track">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--color-border)]">
              <th className="text-left py-2 pr-4 text-[10px] uppercase tracking-wider text-[var(--color-text-tertiary)] font-semibold">Metric</th>
              <th className="text-left py-2 pr-4 text-[10px] uppercase tracking-wider text-[var(--color-text-tertiary)] font-semibold">Current</th>
              <th className="text-left py-2 pr-4 text-[10px] uppercase tracking-wider text-[var(--color-text-tertiary)] font-semibold">Target</th>
              <th className="text-left py-2 pr-4 text-[10px] uppercase tracking-wider text-[var(--color-text-tertiary)] font-semibold">Source</th>
              <th className="text-left py-2 text-[10px] uppercase tracking-wider text-[var(--color-text-tertiary)] font-semibold">Frequency</th>
            </tr>
          </thead>
          <tbody>
            {metrics.map((m, i) => (
              <tr key={i} className="border-b border-[var(--color-border)] last:border-b-0 hover:bg-[var(--color-surface-secondary)]">
                <td className="py-3 pr-4 text-[var(--color-text-primary)] text-xs font-medium">{m.name}</td>
                <td className="py-3 pr-4 text-amber-400 text-xs">{m.currentValue}</td>
                <td className="py-3 pr-4 text-emerald-400 text-xs">{m.targetValue}</td>
                <td className="py-3 pr-4 text-[var(--color-text-tertiary)] text-[10px]">{m.dataSource}</td>
                <td className="py-3 text-[var(--color-text-tertiary)] text-[10px]">{m.updateFrequency}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </SectionCard>
  );
}

/* ── Main Renderer ────────────────────────────────────────────────────── */

const SECTIONS = [
  { id: 'executive-summary', label: 'Executive Summary' },
  { id: 'problem', label: 'Problem' },
  { id: 'evidence', label: 'Evidence' },
  { id: 'root-causes', label: 'Root Causes' },
  { id: 'global-lessons', label: 'Global Lessons' },
  { id: 'recommended-reform', label: 'Recommended Reform' },
  { id: 'trade-offs', label: 'Trade-offs' },
  { id: 'metrics', label: 'Metrics' },
  { id: 'implementation', label: 'Implementation' },
  { id: 'sources', label: 'Sources' },
  { id: 'compare', label: 'Compare' },
];

export default function FixRenderer({ fix }: FixRendererProps) {
  return (
    <div className="w-full">
      {/* Full-width Hero Strip */}
      <FixHeroStrip fix={fix} />

      {/* Sticky Navigation */}
      <FixStickyNav sections={SECTIONS} />

      {/* Executive Summary + Impact Scorecard — full width, compressed */}
      <div id="executive-summary" className="pt-6 pb-2">
        <ExecutiveSummaryPanel fix={fix} />
        <ImpactScorecard fix={fix} />
      </div>

      {/* 3-Column Grid: Left Sidebar | Main Content | Trust + Knowledge Sidebar */}
      <div className="flex gap-6 mt-2">
        <FixLeftSidebar fix={fix} sections={SECTIONS} />

        {/* Main Content Column */}
        <div className="flex-1 min-w-0">
          {/* Problem Section */}
          <div id="problem">
            <SectionCard id="problem-inner" title="What's Wrong?">
              <FixSectionContent section={fix.problem} />
            </SectionCard>
          </div>

          {/* Evidence Section */}
          <div id="evidence">
            <SectionCard id="evidence-inner" title="Evidence">
              <FixSectionContent section={fix.evidence} />
            </SectionCard>
          </div>

          {/* Root Causes */}
          <div id="root-causes">
            <SectionCard id="root-causes-inner" title="Root Causes">
              <FixSectionContent section={fix.rootCauses} />
            </SectionCard>
          </div>

          {/* Stakeholders */}
          {fix.stakeholders && fix.stakeholders.length > 0 && (
            <FixStakeholders stakeholders={fix.stakeholders} />
          )}

          {/* Existing Solutions */}
          <FixExistingSolutions solutions={fix.existingSolutions} />

          {/* Global Lessons */}
          <div id="global-lessons">
            <FixGlobalExamples examples={fix.globalExamples} />
          </div>

          {/* Recommended Reform */}
          <div id="recommended-reform">
            <FixActionList actions={fix.recommendedActions} title="Recommended Reform" />
          </div>

          {/* Citizens & Governments */}
          {fix.citizenActions.length > 0 && (
            <FixActionList actions={fix.citizenActions} title="What Citizens Can Do" />
          )}
          {fix.governmentActions.length > 0 && (
            <FixActionList actions={fix.governmentActions} title="What Governments Can Do" />
          )}

          {/* Trade-offs Matrix */}
          <div id="trade-offs">
            <TradeOffsMatrix tradeOffs={fix.tradeOffs || []} />
          </div>

          {/* Success Metrics Dashboard */}
          <div id="metrics">
            {fix.successMetrics && fix.successMetrics.length > 0 && (
              <SuccessMetricsDashboard metrics={fix.successMetrics} />
            )}
            {fix.metricsToTrack && fix.metricsToTrack.length > 0 && (
              <FixMetricsTable metrics={fix.metricsToTrack} />
            )}
          </div>

          {/* Implementation Roadmap */}
          <div id="implementation">
            <ImplementationRoadmap fix={fix} />
          </div>

          {/* Sources Section */}
          <div id="sources">
            <SectionCard id="sources-inner" title="Sources & Methodology">
              <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
                This Fix has been verified against {fix.evidenceGrade || 'Moderate'}-grade evidence from {getSourceCount(fix)} cited sources.
                Last verified on {formatDateLong(fix.lastVerified)}.
              </p>
              <p className="text-xs text-[var(--color-text-tertiary)] mt-2">
                All evidence is evaluated under the Editorial Constitution v1.1 Evidence Standard.
                Corrections are published transparently with version tracking.
              </p>
            </SectionCard>
          </div>

          {/* Compare with Similar */}
          <div id="compare">
            <SectionCard id="compare-inner" title="Compare with Similar Solutions">
              <p className="text-sm text-[var(--color-text-secondary)] mb-4">
                Compare this solution with others to see evidence quality, implementation cost, trade-offs, and global precedents side by side.
              </p>
              <Link
                href={`/compare?fixes=${fix.slug}`}
                className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--color-brand-400)]/10 border border-[var(--color-brand-400)]/30 rounded-lg text-xs font-medium text-[var(--color-brand-400)] hover:bg-[var(--color-brand-400)]/20 transition-colors"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Compare with Other Solutions
              </Link>
            </SectionCard>
          </div>

          <FeedbackSection className="mt-8" />
        </div>

        {/* Right Sidebar: Trust first, then Knowledge */}
        <aside className="hidden xl:block w-64 shrink-0" aria-label="Trust and linked knowledge">
          <div className="sticky top-28 space-y-5">
            <TrustCard fix={fix} />
            <KnowledgeSidebar fix={fix} />
          </div>
        </aside>
      </div>
    </div>
  );
}
