'use client';

import React from 'react';
import type { ConstituencyRecord } from '@/lib/up403/types';
import type { NewsroomClaim, VerificationStatus } from '@/types/editorial-newsroom';
import { verifyClaim } from '@/lib/editorial/eos/eos-verification';
import { EosVerificationBadge } from './EosPrimitives';

const EDITOR_ID = 'editor-anita';

function unresolvedCount(claims: NewsroomClaim[]): number {
  return claims.filter(
    c =>
      c.status === 'Needs Verification' ||
      c.status === 'Unsupported' ||
      (c.status === 'Partially Verified' && !c.checkedBy)
  ).length;
}

export default function EosFactCheckConsole({
  storyId,
  initialClaims,
  record,
  initialBlockers,
}: {
  storyId: string;
  initialClaims: NewsroomClaim[];
  record: ConstituencyRecord;
  initialBlockers: string[];
}) {
  const [claims, setClaims] = React.useState<NewsroomClaim[]>(initialClaims);
  const [notes, setNotes] = React.useState<Record<string, string>>({});

  const runCheck = () => {
    const next = claims.map(c => {
      const result = verifyClaim(c, record);
      return { ...c, ...result, checkedBy: 'checker-sameer', checkedAt: new Date().toISOString() };
    });
    setClaims(next);
  };

  const approve = (claimId: string, status: VerificationStatus) => {
    setClaims(prev =>
      prev.map(c =>
        c.id === claimId
          ? {
              ...c,
              status,
              blocking: status === 'Unsupported' || status === 'Needs Verification',
              checkedBy: EDITOR_ID,
              checkedAt: new Date().toISOString(),
              notes: notes[claimId] || c.notes,
            }
          : c
      )
    );
  };

  const blocking = claims.filter(c => c.blocking);
  const unresolved = unresolvedCount(claims);
  const gateOpen = unresolved === 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={runCheck}
          className="rounded bg-amber-500 px-4 py-2 text-sm font-bold text-gray-950 hover:bg-amber-400"
        >
          Run deterministic fact check
        </button>
        <span className="text-xs text-gray-500">
          Verifies every claim against the canonical UP403 record. Failed verifications become blocking issues.
        </span>
      </div>

      <section
        aria-label="Publication gate"
        className={`rounded-lg border p-4 ${
          gateOpen ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-red-500/30 bg-red-500/5'
        }`}
      >
        <div className="text-sm font-bold uppercase tracking-widest text-gray-300">Publication gate</div>
        <div className={`mt-1 text-lg font-bold ${gateOpen ? 'text-emerald-300' : 'text-red-300'}`}>
          {gateOpen ? 'OPEN — all claims verified or editor-approved' : `BLOCKED — ${String(unresolved)} unresolved claim(s)`}
        </div>
        {blocking.length > 0 ? (
          <ul className="mt-2 space-y-1 text-xs text-red-200/80">
            {blocking.map(b => (
              <li key={b.id}>
                {b.id}: {b.text} — {b.status}. Asserted "{b.assertedValue}"; canonical "{b.canonicalValue}". {b.basis}
              </li>
            ))}
          </ul>
        ) : null}
        {initialBlockers.length > 0 ? (
          <div className="mt-2 text-xs text-gray-500">Story-level blockers: {initialBlockers.length}</div>
        ) : null}
      </section>

      <section aria-label="Claim verification table" className="rounded-lg border border-gray-800 overflow-hidden">
        <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400 px-4 pt-4 mb-2">
          Claims under review ({claims.length})
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-950/60 text-left text-xs uppercase tracking-wider text-gray-500">
              <tr>
                <th className="px-4 py-2">Claim</th>
                <th className="px-4 py-2">Category</th>
                <th className="px-4 py-2">Asserted</th>
                <th className="px-4 py-2">Canonical</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2">Editor action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/70">
              {claims.map(c => (
                <tr key={c.id}>
                  <td className="px-4 py-2.5 text-gray-200 max-w-xs">{c.text}</td>
                  <td className="px-4 py-2.5 text-xs text-gray-500">{c.category}</td>
                  <td className="px-4 py-2.5 font-mono text-xs text-gray-400">{c.assertedValue}</td>
                  <td className="px-4 py-2.5 font-mono text-xs text-gray-400">{c.canonicalValue}</td>
                  <td className="px-4 py-2.5"><EosVerificationBadge status={c.status} /></td>
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-1.5">
                      <select
                        aria-label={`Editor status for claim ${c.id}`}
                        value={c.status}
                        onChange={e => { approve(c.id, e.target.value as VerificationStatus); }}
                        className="bg-gray-950 border border-gray-700 rounded px-2 py-1 text-xs text-gray-200"
                      >
                        <option>Verified</option>
                        <option>Partially Verified</option>
                        <option>Needs Verification</option>
                        <option>Unsupported</option>
                      </select>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t border-gray-800">
          <label htmlFor={`notes-${storyId}`} className="block text-xs text-gray-500 mb-1">
            Approval note (recorded in audit trail)
          </label>
          <input
            id={`notes-${storyId}`}
            value={notes[claims[0]?.id ?? ''] ?? ''}
            onChange={e => { setNotes(prev => ({ ...prev, [claims[0]?.id ?? '']: e.target.value })); }}
            className="w-full bg-gray-950 border border-gray-700 rounded px-3 py-2 text-sm text-gray-200"
            placeholder="e.g. Editor approves pending dataset capture."
          />
        </div>
      </section>
    </div>
  );
}
