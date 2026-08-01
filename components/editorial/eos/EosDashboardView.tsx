import Link from 'next/link';
import type {
  NewsroomStory,
  NewsroomMetrics,
  EditorialAssignment,
  EditorialCollection,
  DiscoveryOpportunity,
  CollaborationActivity,
} from '@/types/editorial-newsroom';
import { EosStageBadge, EosStatCard } from './EosPrimitives';

export interface EosDashboardViewProps {
  metrics: NewsroomMetrics;
  stories: NewsroomStory[];
  assignments: EditorialAssignment[];
  collections: EditorialCollection[];
  opportunities: DiscoveryOpportunity[];
  activities: CollaborationActivity[];
  governanceGap: boolean;
}

export default function EosDashboardView({
  metrics,
  stories,
  assignments,
  collections,
  opportunities,
  activities,
  governanceGap,
}: EosDashboardViewProps) {
  const stageOrder: NewsroomStory['stage'][] = [
    'assigned',
    'research',
    'writing',
    'fact_check',
    'editorial_review',
    'scheduled',
    'published',
  ];
  const recentActivity = [...activities].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1)).slice(0, 6);
  const topOpportunities = [...opportunities].sort((a, b) => a.priority - b.priority).slice(0, 8);
  const activeAssignments = assignments
    .filter(a => a.stage !== 'published' && a.stage !== 'archived')
    .sort((a, b) => {
      if (a.stage === 'fact_check' && b.stage !== 'fact_check') return -1;
      if (b.stage === 'fact_check' && a.stage !== 'fact_check') return 1;
      return 0;
    });

  return (
    <div className="space-y-8">
      {governanceGap ? (
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 px-4 py-3 text-sm text-amber-200">
          <span className="font-semibold">Data gap notice:</span> constituency-level governance issue data is not yet
          captured (governance_issue_count = 0 across all 403 seats, UP403-DATA-10). Governance stories will be
          flagged as needing primary research, not auto-generated.
        </div>
      ) : null}

      {/* Metrics strip */}
      <section aria-label="Editorial metrics" className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <EosStatCard label="Stories tracked" value={String(metrics.totalStories)} />
        <EosStatCard label="Published" value={String(metrics.published)} accent />
        <EosStatCard label="In workflow" value={String(metrics.inWorkflow)} />
        <EosStatCard label="Verification rate" value={`${String(metrics.verificationRate)}%`} />
        <EosStatCard label="Evidence density" value={String(metrics.evidenceDensity)} hint="captures / story" />
        <EosStatCard label="Source diversity" value={String(metrics.sourceDiversity)} hint="canonical sources used" />
      </section>

      {/* Pipeline */}
      <section aria-label="Editorial pipeline">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400">Editorial pipeline</h3>
          <Link href="/editor/assignments" className="text-xs text-amber-400 hover:text-amber-300">
            Assignment board →
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
          {stageOrder.map(stage => {
            const count = metrics.stageDistribution[stage] ?? 0;
            return (
              <div key={stage} className="rounded-lg border border-gray-800 bg-gray-900/60 p-3">
                <div className="text-xs text-gray-400 font-semibold uppercase tracking-wide">{stage.replace('_', ' ')}</div>
                <div className="mt-1 text-xl font-bold text-gray-100">{count}</div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Active assignments */}
      <section aria-label="Active assignments">
        <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-3">Active assignments</h3>
        <div className="rounded-lg border border-gray-800 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-950/60 text-left text-xs uppercase tracking-wider text-gray-500">
              <tr>
                <th className="px-4 py-2.5">Story</th>
                <th className="px-4 py-2.5">Stage</th>
                <th className="px-4 py-2.5">Constituency</th>
                <th className="px-4 py-2.5">Priority</th>
                <th className="px-4 py-2.5 hidden lg:table-cell">Deadline</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/70">
              {activeAssignments.map(a => {
                const story = stories.find(s => s.id === a.storyId);
                return (
                  <tr key={a.id}>
                    <td className="px-4 py-2.5">
                      <Link href={`/editor/stories/${a.storyId}`} className="text-amber-300 hover:text-amber-200">
                        {a.title}
                      </Link>
                    </td>
                    <td className="px-4 py-2.5"><EosStageBadge stage={a.stage} /></td>
                    <td className="px-4 py-2.5 text-gray-400">{story?.constituencyId ?? '—'}</td>
                    <td className="px-4 py-2.5">
                      <span className={`text-[11px] font-semibold uppercase ${a.priority === 'high' ? 'text-orange-300' : a.priority === 'medium' ? 'text-amber-300' : 'text-gray-500'}`}>
                        {a.priority}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-gray-500 hidden lg:table-cell">{a.deadline ? new Date(a.deadline).toLocaleDateString() : '—'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Story opportunities */}
        <section aria-label="Story opportunities">
          <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-3">
            Story opportunities <span className="text-gray-600 normal-case tracking-normal font-normal">(deterministic discovery)</span>
          </h3>
          <ul className="space-y-2">
            {topOpportunities.map(o => (
              <li key={o.id} className="rounded-lg border border-gray-800 bg-gray-900/60 p-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold text-gray-100">{o.title}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{o.description}</div>
                  </div>
                  <span className="shrink-0 text-[10px] uppercase tracking-wider text-amber-400/80 border border-amber-500/30 rounded px-2 py-0.5">
                    {o.category}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </section>

        {/* Collections + activity */}
        <div className="space-y-6">
          <section aria-label="Editorial collections">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400">Editorial collections</h3>
              <Link href="/editor/collections" className="text-xs text-amber-400 hover:text-amber-300">
                All →
              </Link>
            </div>
            <div className="flex flex-wrap gap-2">
              {collections.map(c => (
                <Link
                  key={c.id}
                  href={`/editor/collections#${c.id}`}
                  className="inline-flex items-center gap-2 rounded border border-gray-700 bg-gray-900/60 px-3 py-1.5 text-xs text-gray-300 hover:border-amber-500/40"
                >
                  {c.name}
                  <span className="text-gray-500 font-mono">{c.constituencyIds.length}</span>
                </Link>
              ))}
            </div>
          </section>

          <section aria-label="Recent activity">
            <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-3">Recent activity</h3>
            <ul className="space-y-1.5">
              {recentActivity.map(a => (
                <li key={a.id} className="flex gap-3 text-sm text-gray-400">
                  <span className="text-amber-500/70 shrink-0">•</span>
                  <div>
                    <span className="text-gray-300">{a.actorId}</span> — {a.body}
                    <span className="block text-xs text-gray-600 font-mono">
                      {new Date(a.createdAt).toLocaleString()}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
