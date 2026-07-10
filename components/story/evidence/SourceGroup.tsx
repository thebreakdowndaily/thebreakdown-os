import { groupSources, GROUP_LABELS, type EvidenceSource } from './types';

export default function SourceGroup({ sources, compact }: { sources: EvidenceSource[]; compact?: boolean }) {
  const groups = groupSources(sources);
  const entries = Object.entries(groups);

  if (entries.length === 0) return null;

  if (compact) {
    return (
      <div className="space-y-4">
        {entries.map(([group, items]) => (
          <div key={group}>
            <div className="flex items-center justify-between text-[11px] mb-2">
              <span className="font-bold text-text-muted uppercase tracking-widest">{GROUP_LABELS[group] || group}</span>
              <span className="text-text-muted/60 tabular-nums font-mono">{items.length}</span>
            </div>
            <div className="space-y-1">
              {items.map((s, i) => (
                <a
                  key={i}
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-2 text-xs text-text-secondary hover:text-brand-400 transition-colors no-underline"
                >
                  <span className="text-green-500 text-[10px] mt-0.5">&#10003;</span>
                  <span className="leading-relaxed">{s.name}</span>
                </a>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {entries.map(([group, items]) => (
        <div key={group} className="rounded-sm bg-surface-tertiary border border-border p-3 flex-1 min-w-[140px]">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-bold uppercase tracking-widest text-text-muted">
              {GROUP_LABELS[group] || group}
            </span>
            <span className="text-[10px] text-text-muted/60 tabular-nums font-mono">{items.length}</span>
          </div>
          <div className="space-y-1.5">
            {items.map((s, i) => (
              <a
                key={i}
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-[0.75rem] text-text-secondary hover:text-brand-400 transition-colors truncate no-underline"
              >
                {s.name}
              </a>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
