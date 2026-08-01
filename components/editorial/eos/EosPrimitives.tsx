import type { NewsroomStage } from '@/types/editorial-newsroom';

const STAGE_STYLES: Record<NewsroomStage, string> = {
  assigned: 'bg-sky-500/15 text-sky-300 border-sky-500/30',
  research: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30',
  writing: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  fact_check: 'bg-orange-500/15 text-orange-300 border-orange-500/30',
  editorial_review: 'bg-fuchsia-500/15 text-fuchsia-300 border-fuchsia-500/30',
  scheduled: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
  published: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  archived: 'bg-gray-600/20 text-gray-400 border-gray-500/30',
};

export function EosStageBadge({ stage }: { stage: NewsroomStage }) {
  return (
    <span
      className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold border uppercase tracking-wide ${STAGE_STYLES[stage]}`}
    >
      {stage.replace('_', ' ')}
    </span>
  );
}

export function EosVerificationBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    Verified: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
    'Partially Verified': 'bg-amber-500/15 text-amber-300 border-amber-500/30',
    'Needs Verification': 'bg-orange-500/15 text-orange-300 border-orange-500/30',
    Unsupported: 'bg-red-500/15 text-red-300 border-red-500/30',
  };
  return (
    <span
      className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold border ${styles[status] ?? 'bg-gray-600/20 text-gray-400 border-gray-500/30'}`}
    >
      {status}
    </span>
  );
}

export function EosStatCard({
  label,
  value,
  hint,
  accent,
}: {
  label: string;
  value: string;
  hint?: string;
  accent?: boolean;
}) {
  return (
    <div className="p-4 rounded-lg border border-gray-800 bg-gray-900/60">
      <div className="text-[11px] uppercase tracking-widest text-gray-500 font-semibold">{label}</div>
      <div className={`mt-1 text-2xl font-bold ${accent ? 'text-amber-400' : 'text-gray-100'}`}>{value}</div>
      {hint ? <div className="mt-0.5 text-xs text-gray-500">{hint}</div> : null}
    </div>
  );
}
