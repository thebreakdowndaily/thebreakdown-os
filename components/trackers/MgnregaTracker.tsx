import Link from 'next/link';
import type { MgnregaTracker } from '@/lib/trackers/mgnrega-tracker';

interface MgnregaTrackerProps {
  tracker: MgnregaTracker;
}

const impactColor = {
  critical: 'bg-red-500/20 text-red-300 border-red-500/40',
  major: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
  minor: 'bg-gray-500/20 text-gray-300 border-gray-500/40',
} as const;

const confidenceColor = {
  established: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
  strong: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
  contested: 'bg-red-500/20 text-red-300 border-red-500/40',
} as const;

const categoryIcon = {
  legislation: '\u{1F4DC}',
  policy: '\u{1F4DD}',
  data: '\u{1F4CA}',
  event: '\u{1F514}',
} as const;

export default function MgnregaTrackerComponent({ tracker }: MgnregaTrackerProps) {
  return (
    <div className="bg-gray-800/40 border border-gray-700/60 rounded-xl p-6 space-y-8 font-sans text-gray-100 max-w-5xl mx-auto">
      {/* Header */}
      <div className="border-b border-gray-700/60 pb-4 space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-amber-400 font-bold uppercase">Flagship Knowledge System</span>
          <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2.5 py-0.5 rounded border border-amber-500/40 font-bold font-mono">
            Tracker
          </span>
        </div>
        <h1 className="text-2xl font-bold text-gray-100">{tracker.title}</h1>
        <p className="text-sm text-gray-400">{tracker.subtitle}</p>
      </div>

      {/* Current Status */}
      <div className="bg-gray-900/80 border border-emerald-500/40 rounded-xl p-4 space-y-1">
        <strong className="block text-[11px] font-mono uppercase text-emerald-300">Current Status</strong>
        <p className="text-sm text-gray-200">{tracker.currentStatus}</p>
      </div>

      {/* Last Verified */}
      <div className="flex items-center gap-4 text-[11px] font-mono text-gray-400">
        <span>Last updated: <strong className="text-gray-200">{tracker.lastUpdated}</strong></span>
        <span>Verified by: <strong className="text-gray-200">{tracker.lastVerifiedBy}</strong></span>
      </div>

      {/* Key Data Points */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold text-gray-300 uppercase font-mono">Key Data</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {tracker.keyDataPoints.map((dp) => (
            <div key={dp.label} className="bg-gray-900/60 border border-gray-800 rounded-lg p-3 space-y-1">
              <span className="text-[10px] font-mono text-gray-400 uppercase block">{dp.label}</span>
              <strong className="text-lg text-gray-100">{dp.value}</strong>
              <p className="text-[10px] text-gray-500 font-mono">{dp.source} ({dp.asOf})</p>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Changes */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold text-gray-300 uppercase font-mono">What Changed Recently</h2>
        <div className="space-y-2">
          {tracker.recentChanges.map((ch) => (
            <div key={ch.title} className="bg-gray-900/60 border border-gray-800 rounded-lg p-3 space-y-1">
              <div className="flex items-center gap-2">
                <span className={`text-[10px] px-2 py-0.5 rounded border font-bold font-mono ${impactColor[ch.impact]}`}>{ch.impact}</span>
                <strong className="text-sm text-gray-100">{ch.title}</strong>
                <span className="text-[10px] font-mono text-gray-500 ml-auto">{ch.date}</span>
              </div>
              <p className="text-xs text-gray-300">{ch.description}</p>
              <p className="text-[10px] text-gray-500 font-mono">{ch.source}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Timeline */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold text-gray-300 uppercase font-mono">Historical Timeline</h2>
        <div className="space-y-1">
          {tracker.timeline.sort((a, b) => a.date.localeCompare(b.date)).map((evt) => (
            <div key={evt.title} className="bg-gray-900/40 border border-gray-800 rounded-lg p-3 flex gap-3 items-start text-xs">
              <span className="text-[10px] text-gray-500 font-mono whitespace-nowrap mt-0.5">{categoryIcon[evt.category]} {evt.date}</span>
              <div className="space-y-0.5">
                <strong className="text-gray-100">{evt.title}</strong>
                <p className="text-gray-400">{evt.description}</p>
                <p className="text-[10px] text-gray-500 font-mono">{evt.source}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Evidence Chain */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold text-gray-300 uppercase font-mono">Evidence Chain</h2>
        <div className="space-y-2">
          {tracker.evidenceChain.map((ev) => (
            <div key={ev.claim} className="bg-gray-900/60 border border-gray-800 rounded-lg p-3 space-y-1">
              <div className="flex items-center gap-2">
                <span className={`text-[10px] px-2 py-0.5 rounded border font-bold font-mono ${confidenceColor[ev.confidence]}`}>{ev.confidence}</span>
                <span className="text-[10px] font-mono text-gray-500 ml-auto">Verified: {ev.lastVerified}</span>
              </div>
              <p className="text-sm text-gray-200">{ev.claim}</p>
              <p className="text-[10px] text-gray-400 font-mono">{ev.source}</p>
              {ev.counterargument && (
                <p className="text-[11px] text-amber-300/80 border-t border-gray-800 pt-1 mt-1">Counterpoint: {ev.counterargument}</p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Documents */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold text-gray-300 uppercase font-mono">Key Documents</h2>
        <div className="space-y-1">
          {tracker.documents.map((doc) => (
            <div key={doc.title} className="bg-gray-900/40 border border-gray-800 rounded-lg p-3 text-xs space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-700 text-gray-300 font-mono uppercase">{doc.type}</span>
                <strong className="text-gray-100">{doc.title}</strong>
                <span className="text-[10px] font-mono text-gray-500 ml-auto">{doc.date}</span>
              </div>
              <p className="text-gray-400">{doc.summary}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Related Links */}
      <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-700/60">
        {tracker.relatedStorySlugs.map((slug) => (
          <Link
            key={slug}
            href={`/story/${slug}`}
            className="text-xs font-mono text-blue-400 hover:text-blue-300 underline underline-offset-2"
          >
            Full story: {slug}
          </Link>
        ))}
        {tracker.relatedEntityIds.map((eid) => (
          <Link
            key={eid}
            href={`/entity/${eid}`}
            className="text-xs font-mono text-blue-400 hover:text-blue-300 underline underline-offset-2"
          >
            Entity: {eid}
          </Link>
        ))}
        <Link href="/trust" className="text-xs font-mono text-gray-400 hover:text-gray-300 underline underline-offset-2">
          Trust dashboard
        </Link>
      </div>
    </div>
  );
}
