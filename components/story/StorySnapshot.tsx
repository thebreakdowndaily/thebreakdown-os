import React from 'react';

interface StorySnapshotProps {
  status?: string;
  category?: string;
  location?: string;
  stakeholderNames?: string[];
  impactLevel?: string;
  legislation?: string;
  costValue?: string;
  updatedAt?: string;
  evidenceScore?: number;
  sourceCount?: number;
}

const statusConfig: Record<string, { color: string; label: string }> = {
  breaking: { color: 'bg-red-500', label: 'Breaking' },
  developing: { color: 'bg-amber-500', label: 'Developing' },
  verified: { color: 'bg-green-500', label: 'Verified' },
  explainer: { color: 'bg-blue-500', label: 'Explainer' },
  archive: { color: 'bg-gray-400', label: 'Archive' },
  published: { color: 'bg-green-500', label: 'Published' },
  updated: { color: 'bg-blue-500', label: 'Updated' },
};

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  return `${Math.floor(days / 7)} weeks ago`;
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2 border-b border-border last:border-0">
      <span className="text-[11px] uppercase tracking-widest text-text-muted font-semibold shrink-0">{label}</span>
      <span className="text-sm text-text-primary font-medium text-right">{children}</span>
    </div>
  );
}

const StorySnapshot: React.FC<StorySnapshotProps> = ({
  status,
  category,
  location,
  stakeholderNames,
  impactLevel,
  legislation,
  costValue,
  updatedAt,
  evidenceScore,
  sourceCount,
}) => {
  const cfg = status ? statusConfig[status] : null;

  return (
    <aside
      className="bg-surface-secondary border border-border rounded-xl overflow-hidden"
      aria-label="Story snapshot"
    >
      <div className="px-4 py-3 border-b border-border bg-surface-tertiary/50">
        <h3 className="text-xs font-bold uppercase tracking-widest text-text-muted">Snapshot</h3>
      </div>
      <div className="px-4 py-1">
        {cfg && (
          <Row label="Status">
            <span className="inline-flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${cfg.color}`} />
              <span>{cfg.label}</span>
            </span>
          </Row>
        )}
        {category && <Row label="Category">{category}</Row>}
        {location && <Row label="Location">{location}</Row>}
        {evidenceScore !== undefined && (
          <Row label="Evidence">
            <span className="font-mono font-bold">{evidenceScore}%</span>
          </Row>
        )}
        {sourceCount !== undefined && (
          <Row label="Sources">
            <span className="font-mono">{sourceCount}</span>
          </Row>
        )}
        {impactLevel && <Row label="Impact">{impactLevel}</Row>}
        {costValue && <Row label="Value">{costValue}</Row>}
        {legislation && <Row label="Legislation">{legislation}</Row>}
        {stakeholderNames && stakeholderNames.length > 0 && (
          <Row label="Stakeholders">
            <div className="flex flex-wrap gap-1 justify-end">
              {stakeholderNames.map((s, i) => (
                <span key={i} className="text-[11px] bg-surface-tertiary px-1.5 py-0.5 rounded border border-border">
                  {s}
                </span>
              ))}
            </div>
          </Row>
        )}
        {updatedAt && <Row label="Updated">{timeAgo(updatedAt)}</Row>}
      </div>
    </aside>
  );
};

export default StorySnapshot;