'use client';

import React from 'react';
import type { TradeOffItem } from '../../types/canonical';

interface TradeOffsMatrixProps {
  tradeOffs: TradeOffItem[];
}

export default function TradeOffsMatrix({ tradeOffs }: TradeOffsMatrixProps) {
  if (!tradeOffs || tradeOffs.length === 0) return null;

  return (
    <div className="bg-[var(--color-surface-primary)] border border-[var(--color-border)] rounded-xl p-5 mb-6">
      <h3 className="text-sm font-semibold text-[var(--color-text-primary)] mb-4 flex items-center gap-2">
        <svg className="w-4 h-4 text-[var(--color-brand-400)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
        </svg>
        Trade-offs
      </h3>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--color-border)]">
              <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wider text-[var(--color-text-tertiary)] font-semibold">Dimension</th>
              <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wider text-emerald-400/70 font-semibold">
                <span className="flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  Winner
                </span>
              </th>
              <th className="text-left py-2 pr-3 text-[10px] uppercase tracking-wider text-amber-400/70 font-semibold">
                <span className="flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>
                  Loser
                </span>
              </th>
              <th className="text-left py-2 text-[10px] uppercase tracking-wider text-[var(--color-text-tertiary)] font-semibold">Affected</th>
            </tr>
          </thead>
          <tbody>
            {tradeOffs.map((to, i) => (
              <tr key={i} className="border-b border-[var(--color-border)] last:border-b-0">
                <td className="py-3 pr-3">
                  <span className="text-xs font-medium text-[var(--color-text-primary)]">{to.dimension}</span>
                </td>
                <td className="py-3 pr-3">
                  <span className="text-xs text-emerald-400/90">{to.advantage}</span>
                </td>
                <td className="py-3 pr-3">
                  <span className="text-xs text-amber-400/90">{to.disadvantage}</span>
                </td>
                <td className="py-3">
                  {to.affectedParties && to.affectedParties.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {to.affectedParties.map(p => (
                        <span key={p} className="text-[9px] text-[var(--color-text-tertiary)] bg-[var(--color-surface-secondary)] px-1.5 py-0.5 rounded">{p}</span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-[10px] text-[var(--color-text-tertiary)]">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
