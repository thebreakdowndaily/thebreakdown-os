import React from 'react';
import type { Fix, Stakeholder, ExistingSolution, GlobalExample, FixAction, FixMetric, FixSection } from '@/types/canonical';
import Link from 'next/link';

interface FixRendererProps {
  fix: Fix;
}

/* ── Reusable section wrapper ──────────────────────────────────────────── */

function SectionCard({ id, title, children, className }: { id: string; title: string; children: React.ReactNode; className?: string }) {
  return (
    <section id={id} className={`bg-gray-800/50 border border-gray-700/50 rounded-lg p-6 mb-6 ${className || ''}`}>
      <h2 className="text-xl font-bold text-gray-100 mb-4">{title}</h2>
      {children}
    </section>
  );
}

function FixSectionContent({ section }: { section: FixSection }) {
  return (
    <div>
      <h3 className="text-lg font-semibold text-amber-300 mb-2">{section.title}</h3>
      <p className="text-gray-300 leading-relaxed mb-3">{section.content}</p>
      {section.supportingData && section.supportingData.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-3">
          {section.supportingData.map((d, i) => (
            <div key={i} className="bg-gray-900/60 border border-gray-700/50 rounded-lg p-3 text-center">
              <span className="block text-lg font-bold text-emerald-400">{d.value}</span>
              <span className="text-xs text-gray-400">{d.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Framework Section Components ──────────────────────────────────────── */

function FixHeader({ fix }: { fix: Fix }) {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-2 mb-3">
        <span className="bg-emerald-900/60 text-emerald-300 text-xs font-semibold px-3 py-1 rounded-full border border-emerald-700">
          The Fix
        </span>
        <span className="text-xs text-gray-500">
          Evidence Score: {fix.evidenceScore}/100 · {fix.readingTime} min read
        </span>
      </div>
      <h1 className="text-3xl sm:text-4xl font-bold text-gray-100 mb-4 leading-tight">{fix.headline}</h1>
      <p className="text-lg text-gray-400 leading-relaxed">{fix.summary}</p>
      <div className="flex items-center gap-3 mt-4 text-sm text-gray-500">
        <span>By {fix.author.name}</span>
        <span>·</span>
        <span>{new Date(fix.publishedAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
        {fix.storySlug && (
          <>
            <span>·</span>
            <Link href={`/story/${fix.storySlug}`} className="text-amber-400 hover:text-amber-300 underline">
              Read the original story
            </Link>
          </>
        )}
      </div>
      <div className="flex flex-wrap gap-2 mt-4">
        {fix.tags.map((tag) => (
          <span key={tag} className="text-xs bg-gray-800 text-gray-400 px-2.5 py-1 rounded-full border border-gray-700">{tag}</span>
        ))}
      </div>
    </div>
  );
}

function FixProblem({ section }: { section: FixSection }) {
  return (
    <SectionCard id="fix-problem" title="What&apos;s Wrong?">
      <FixSectionContent section={section} />
    </SectionCard>
  );
}

function FixAffected({ section }: { section: FixSection }) {
  return (
    <SectionCard id="fix-affected" title="Who Is Affected?">
      <FixSectionContent section={section} />
    </SectionCard>
  );
}

function FixRootCauses({ section }: { section: FixSection }) {
  return (
    <SectionCard id="fix-root-causes" title="Root Causes">
      <FixSectionContent section={section} />
    </SectionCard>
  );
}

function FixEvidence({ section }: { section: FixSection }) {
  return (
    <SectionCard id="fix-evidence" title="Evidence">
      <FixSectionContent section={section} />
    </SectionCard>
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
          <div key={i} className="flex items-start gap-4 bg-gray-900/40 border border-gray-700/50 rounded-lg p-4">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-gray-200">{s.name}</span>
                <span className="text-xs bg-gray-700 text-gray-400 px-2 py-0.5 rounded">{s.type.replace('-', ' ')}</span>
                {s.stance && (
                  <span className={`text-xs px-2 py-0.5 rounded-full border ${stanceColors[s.stance] || stanceColors.neutral}`}>
                    {s.stance}
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-400 mt-1">{s.role}</p>
              <p className="text-sm text-gray-500 mt-0.5 italic">Interests: {s.interest}</p>
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

  const effColors: Record<string, string> = {
    high: 'text-emerald-400',
    medium: 'text-amber-400',
    low: 'text-red-400',
    unknown: 'text-gray-500',
  };

  return (
    <SectionCard id="fix-existing" title="What Has Been Tried?">
      {solutions.length === 0 ? (
        <p className="text-gray-500 italic">No existing solutions documented.</p>
      ) : (
        <div className="grid gap-3">
          {solutions.map((s, i) => (
            <div key={i} className="bg-gray-900/40 border border-gray-700/50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-semibold text-gray-200">{s.name}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${statusColors[s.status] || ''}`}>{s.status}</span>
                {s.effectiveness && (
                  <span className={`text-xs ${effColors[s.effectiveness] || ''}`}>
                    Effectiveness: {s.effectiveness}
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-400">{s.description}</p>
              {s.source && <p className="text-xs text-gray-600 mt-1">Source: {s.source}</p>}
            </div>
          ))}
        </div>
      )}
    </SectionCard>
  );
}

function FixGlobalExamples({ examples }: { examples: GlobalExample[] }) {
  return (
    <SectionCard id="fix-global" title="Global Examples">
      {examples.length === 0 ? (
        <p className="text-gray-500 italic">No comparable global examples found.</p>
      ) : (
        <div className="grid gap-4">
          {examples.map((ex, i) => (
            <div key={i} className="bg-gray-900/40 border border-gray-700/50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg font-semibold text-gray-200">{ex.country}</span>
                <span className="text-xs bg-indigo-900/40 text-indigo-300 px-2 py-0.5 rounded">{ex.policy}</span>
                {ex.applicableToIndia !== undefined && (
                  <span className={`text-xs px-2 py-0.5 rounded ${ex.applicableToIndia ? 'bg-emerald-900/40 text-emerald-300' : 'bg-gray-700 text-gray-400'}`}>
                    {ex.applicableToIndia ? 'Applicable to India' : 'Context-specific'}
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-400 mb-2">{ex.description}</p>
              <div className="bg-gray-800/50 border border-gray-700/50 rounded p-2">
                <span className="text-sm font-medium text-amber-400">Outcome: </span>
                <span className="text-sm text-gray-300">{ex.outcome}</span>
              </div>
              {ex.source && <p className="text-xs text-gray-600 mt-2">Source: {ex.source}</p>}
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

  // Sort by priority
  const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
  const sorted = [...actions].sort((a, b) => (priorityOrder[a.priority] || 99) - (priorityOrder[b.priority] || 99));

  return (
    <SectionCard id={title.toLowerCase().replace(/\s+/g, '-')} title={title}>
      {sorted.map((a, i) => (
        <div key={i} className="bg-gray-900/40 border border-gray-700/50 rounded-lg p-4 mb-3 last:mb-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${priorityColors[a.priority] || priorityColors.medium}`}>
              {a.priority}
            </span>
            <span className={`text-xs ${timeframeColors[a.timeframe] || timeframeColors['medium-term']}`}>
              {a.timeframe.replace('-', ' ')}
            </span>
          </div>
          <h4 className="font-semibold text-gray-200 mt-1">{a.title}</h4>
          <p className="text-sm text-gray-400 mt-1">{a.description}</p>
          <div className="flex flex-wrap gap-1.5 mt-2">
            {a.actors.map((actor) => (
              <span key={actor} className="text-xs bg-gray-800 text-gray-400 px-2 py-0.5 rounded border border-gray-700">
                {actor}
              </span>
            ))}
          </div>
        </div>
      ))}
    </SectionCard>
  );
}

function FixMetrics({ metrics }: { metrics: FixMetric[] }) {
  return (
    <SectionCard id="fix-metrics" title="Metrics to Track">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-700">
              <th className="text-left py-2 pr-4 text-gray-400 font-medium">Metric</th>
              <th className="text-left py-2 pr-4 text-gray-400 font-medium">Current</th>
              <th className="text-left py-2 pr-4 text-gray-400 font-medium">Target</th>
              <th className="text-left py-2 pr-4 text-gray-400 font-medium">Source</th>
              <th className="text-left py-2 text-gray-400 font-medium">Frequency</th>
            </tr>
          </thead>
          <tbody>
            {metrics.map((m, i) => (
              <tr key={i} className="border-b border-gray-800 hover:bg-gray-800/30">
                <td className="py-3 pr-4 text-gray-200 font-medium">{m.name}</td>
                <td className="py-3 pr-4 text-amber-300">{m.currentValue}</td>
                <td className="py-3 pr-4 text-emerald-400">{m.targetValue}</td>
                <td className="py-3 pr-4 text-gray-400 text-xs">{m.dataSource}</td>
                <td className="py-3 text-gray-500 text-xs">{m.updateFrequency}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </SectionCard>
  );
}

/* ── Main Renderer ────────────────────────────────────────────────────── */

export default function FixRenderer({ fix }: FixRendererProps) {
  return (
    <div>
      <FixHeader fix={fix} />

      <div className="sticky top-0 z-10 bg-gray-900/90 backdrop-blur-sm border-b border-gray-800 py-2 mb-6 overflow-x-auto">
        <nav className="flex gap-4 text-sm whitespace-nowrap">
          <a href="#fix-problem" className="text-gray-400 hover:text-amber-400 transition-colors">Problem</a>
          <a href="#fix-affected" className="text-gray-400 hover:text-amber-400 transition-colors">Affected</a>
          <a href="#fix-root-causes" className="text-gray-400 hover:text-amber-400 transition-colors">Root Causes</a>
          <a href="#fix-evidence" className="text-gray-400 hover:text-amber-400 transition-colors">Evidence</a>
          <a href="#fix-stakeholders" className="text-gray-400 hover:text-amber-400 transition-colors">Stakeholders</a>
          <a href="#fix-existing" className="text-gray-400 hover:text-amber-400 transition-colors">Existing Solutions</a>
          <a href="#fix-global" className="text-gray-400 hover:text-amber-400 transition-colors">Global Examples</a>
          <a href="#recommended-actions" className="text-gray-400 hover:text-amber-400 transition-colors">Recommended</a>
          <a href="#what-citizens-can-do" className="text-gray-400 hover:text-amber-400 transition-colors">Citizens</a>
          <a href="#what-governments-can-do" className="text-gray-400 hover:text-amber-400 transition-colors">Governments</a>
          <a href="#fix-metrics" className="text-gray-400 hover:text-amber-400 transition-colors">Metrics</a>
        </nav>
      </div>

      <FixProblem section={fix.problem} />
      <FixAffected section={fix.whoIsAffected} />
      <FixRootCauses section={fix.rootCauses} />
      <FixEvidence section={fix.evidence} />
      <FixStakeholders stakeholders={fix.stakeholders} />
      <FixExistingSolutions solutions={fix.existingSolutions} />
      <FixGlobalExamples examples={fix.globalExamples} />
      <FixActionList actions={fix.recommendedActions} title="Recommended Actions" />
      <FixActionList actions={fix.citizenActions} title="What Citizens Can Do" />
      <FixActionList actions={fix.governmentActions} title="What Governments Can Do" />
      <FixMetrics metrics={fix.metricsToTrack} />
    </div>
  );
}
