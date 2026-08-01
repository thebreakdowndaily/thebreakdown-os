import type { NewsroomMetrics, NewsroomStory } from '@/types/editorial-newsroom';
import { EosStatCard } from './EosPrimitives';

export default function EosAnalyticsView({
  metrics,
  stories,
}: {
  metrics: NewsroomMetrics;
  stories: NewsroomStory[];
}) {
  const stages = Object.entries(metrics.stageDistribution).sort((a, b) => b[1] - a[1]);
  const max = Math.max(1, ...stages.map(([, n]) => n));
  const verifiedTotal = stories.reduce((acc, s) => acc + s.claims.length, 0);
  const verifiedCount = stories.reduce((acc, s) => acc + s.claims.filter(c => c.status === 'Verified').length, 0);

  return (
    <div className="space-y-8">
      <div className="rounded-lg border border-amber-500/25 bg-amber-500/5 px-4 py-3 text-sm text-amber-200">
        Editorial analytics measure the <span className="font-semibold">workflow</span> — verification rate, research
        time, evidence density, corrections. They do <span className="font-semibold">not</span> rank individual
        journalists.
      </div>

      <section aria-label="Workflow metrics" className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <EosStatCard label="Avg research time" value={`${String(metrics.averageResearchTimeHours)}h`} hint="modelled from transitions" />
        <EosStatCard label="Verification rate" value={`${String(metrics.verificationRate)}%`} hint={`${String(verifiedCount)}/${String(verifiedTotal)} claims verified`} />
        <EosStatCard label="Avg turnaround" value={String(metrics.averageTurnaroundHours)} hint="transitions / published" />
        <EosStatCard label="Evidence density" value={String(metrics.evidenceDensity)} hint="captures / story" />
        <EosStatCard label="Source diversity" value={String(metrics.sourceDiversity)} hint="canonical sources" />
        <EosStatCard label="Corrections issued" value={String(metrics.correctionsIssued)} accent />
      </section>

      <section aria-label="Stage distribution" className="rounded-lg border border-gray-800 bg-gray-900/60 p-4">
        <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-4">Stage distribution</h3>
        <ul className="space-y-3">
          {stages.map(([stage, count]) => (
            <li key={stage}>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-gray-300 font-semibold uppercase tracking-wide">{stage.replace('_', ' ')}</span>
                <span className="text-gray-500 font-mono">{count}</span>
              </div>
              <div className="h-2 rounded bg-gray-800 overflow-hidden">
                <div
                  className="h-full rounded bg-amber-500/70"
                  style={{ width: `${String((count / max) * 100)}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section aria-label="Blocking and corrections" className="grid md:grid-cols-2 gap-4">
        <div className="rounded-lg border border-gray-800 bg-gray-900/60 p-4">
          <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-3">Stories with unresolved claims</h3>
          <ul className="space-y-1.5 text-sm text-gray-400">
            {stories.filter(s => s.claims.some(c => c.blocking)).map(s => (
              <li key={s.id} className="flex justify-between">
                <span>{s.title}</span>
                <span className="text-orange-300">{s.claims.filter(c => c.blocking).length} blocked</span>
              </li>
            ))}
            {stories.every(s => !s.claims.some(c => c.blocking)) ? (
              <li className="text-gray-500">No stories currently blocked.</li>
            ) : null}
          </ul>
        </div>
        <div className="rounded-lg border border-gray-800 bg-gray-900/60 p-4">
          <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-3">Correction history</h3>
          <ul className="space-y-1.5 text-sm text-gray-400">
            {stories.flatMap(s => s.corrections.map(c => ({ story: s.title, c }))).map(({ story, c }) => (
              <li key={c.id} className="flex justify-between gap-3">
                <span>{story}</span>
                <span className="text-gray-500 shrink-0">v{c.version}</span>
              </li>
            ))}
            {stories.every(s => s.corrections.length === 0) ? (
              <li className="text-gray-500">No corrections on record.</li>
            ) : null}
          </ul>
        </div>
      </section>
    </div>
  );
}
