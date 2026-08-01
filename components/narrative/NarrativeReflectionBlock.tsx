/**
 * NarrativeReflectionBlock — NOS Volume III Narrative Primitive
 * Governance: NOS-v3.0 Chapter 5 & 28 | RXS-v3.0 § 6
 *
 * Renders metacognitive reflection questions, evidence synthesis, and the open
 * question hand-off that leads the reader to the next logical investigation node.
 */

import Link from 'next/link';

interface NarrativeReflectionBlockProps {
  reflectionQuestion: string;
  establishedTakeaway: string;
  competingInterpretationsSummary?: string;
  openQuestion: string;
  nextInvestigation?: {
    title: string;
    slug: string;
    description?: string;
  } | null;
}

export default function NarrativeReflectionBlock({
  reflectionQuestion,
  establishedTakeaway,
  competingInterpretationsSummary,
  openQuestion,
  nextInvestigation,
}: NarrativeReflectionBlockProps) {
  return (
    <section
      aria-label="Reflection and Investigation Handoff"
      className="my-16 p-6 sm:p-8 rounded-2xl bg-neutral-900/80 border border-emerald-500/30 backdrop-blur-md shadow-2xl space-y-6"
    >
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-neutral-800 pb-4">
        <span className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" aria-hidden="true" />
        <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-emerald-400">
          Metacognitive Reflection & Investigation Handoff
        </h3>
      </div>

      {/* Reflection Question */}
      <div className="space-y-2">
        <h4 className="text-lg sm:text-xl font-bold text-white tracking-tight">
          {reflectionQuestion}
        </h4>
        <p className="text-sm text-neutral-300 leading-relaxed">
          {establishedTakeaway}
        </p>
      </div>

      {/* Competing Interpretations */}
      {competingInterpretationsSummary && (
        <div className="p-4 rounded-xl bg-neutral-950/60 border border-neutral-800/80 space-y-1">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-400">
            Historiographical Friction / Disagreement
          </span>
          <p className="text-xs text-neutral-300 leading-relaxed">
            {competingInterpretationsSummary}
          </p>
        </div>
      )}

      {/* Open Question & Continuation Handoff */}
      <div className="pt-4 border-t border-neutral-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-500">
            The Next Open Question
          </span>
          <p className="text-sm font-semibold text-white">
            {openQuestion}
          </p>
        </div>

        {nextInvestigation && (
          <Link
            href={`/investigation/${nextInvestigation.slug}`}
            className="shrink-0 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-xs rounded-lg transition-colors flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
          >
            <span>Continue Investigation</span>
            <span aria-hidden="true">→</span>
          </Link>
        )}
      </div>
    </section>
  );
}
