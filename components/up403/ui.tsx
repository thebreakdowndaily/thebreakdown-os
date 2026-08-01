'use client';

import { partyColorClass, formatNumber } from '@/lib/up403/format';

export function PartyBadge({ party }: { party: string | null | undefined }) {
  const cls = partyColorClass(party);
  return (
    <span className={`inline-flex items-center rounded border px-2 py-0.5 text-xs font-medium ${cls}`}>
      {party || 'N/A'}
    </span>
  );
}

export function StatCard({ label, value, sub, accent = 'neutral' }: { label: string; value: string | number; sub?: string; accent?: 'neutral' | 'gold' | 'green' }) {
  const accentCls =
    accent === 'gold'
      ? 'border-[#D4A843]/30'
      : accent === 'green'
        ? 'border-[#22C55E]/30'
        : 'border-[#2A2A2A]';
  const valueCls =
    accent === 'gold'
      ? 'text-[#D4A843]'
      : accent === 'green'
        ? 'text-[#22C55E]'
        : 'text-[#F5F5F5]';
  return (
    <div className={`rounded-2xl border bg-[#151515] p-4 ${accentCls}`}>
      <div className="text-xs uppercase tracking-wide text-[#A1A1AA]">{label}</div>
      <div className={`mt-1 text-2xl font-semibold ${valueCls}`}>{typeof value === 'number' ? formatNumber(value) : value}</div>
      {sub ? <div className="mt-1 text-xs text-[#A1A1AA]">{sub}</div> : null}
    </div>
  );
}

export function StatusPill({ label, kind }: { label: string; kind: 'available' | 'partial' | 'missing' | 'neutral' }) {
  const cls =
    kind === 'available'
      ? 'bg-[#22C55E]/15 text-[#22C55E] border-[#22C55E]/30'
      : kind === 'partial'
        ? 'bg-[#D4A843]/15 text-[#D4A843] border-[#D4A843]/30'
        : kind === 'missing'
          ? 'bg-[#FF3B30]/15 text-[#FF6B61] border-[#FF3B30]/30'
          : 'bg-[#2A2A2A] text-[#A1A1AA] border-[#3A3A3A]';
  return (
    <span className={`inline-flex items-center gap-1 rounded border px-2 py-0.5 text-xs font-medium ${cls}`}>
      {label}
    </span>
  );
}
