import { groupSources, GROUP_LABELS, type EvidenceSource } from './types';

export default function SourceGroup({ sources, compact }: { sources: EvidenceSource[]; compact?: boolean }) {
  const groups = groupSources(sources);
  const entries = Object.entries(groups);

  if (entries.length === 0) return null;

  if (compact) {
    return (
      <div className="space-y-2">
        {entries.map(([group, items]) => (
          <div key={group}>
            <div className="flex items-center justify-between text-[11px] mb-1">
              <span className="font-medium text-[#A1A1AA] uppercase tracking-wider">{GROUP_LABELS[group] || group}</span>
              <span className="text-[#A1A1AA]/40 tabular-nums">{items.length}</span>
            </div>
            <div className="space-y-0.5">
              {items.map((s, i) => (
                <a
                  key={i}
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-xs text-[#A1A1AA]/70 hover:text-[#D4A843] transition-colors"
                >
                  <span className="text-[#22C55E] text-[10px]">&#10003;</span>
                  <span>{s.name}</span>
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
        <div key={group} className="rounded-lg bg-[#0A0A0A] border border-[#2A2A2A] p-3 flex-1 min-w-[140px]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-[#A1A1AA]">
              {GROUP_LABELS[group] || group}
            </span>
            <span className="text-[10px] text-[#A1A1AA]/40 tabular-nums">{items.length}</span>
          </div>
          <div className="space-y-1">
            {items.map((s, i) => (
              <a
                key={i}
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-xs text-[#A1A1AA]/70 hover:text-[#D4A843] transition-colors truncate"
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
