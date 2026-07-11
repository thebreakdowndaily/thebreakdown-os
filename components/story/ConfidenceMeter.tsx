'use client';

import { useState } from 'react';

interface ConfidenceMeterProps {
  overallScore: number;
  sourceQuality: number;
  confirmations: number;
  dataAvailability: number;
  verificationStatus: number;
  totalClaims: number;
  verified: number;
  misleading: number;
  unverifiable: number;
}

const scoreColor = (score: number) => {
  if (score >= 80) return { bar: '#22C55E', text: 'text-green-400', label: 'Strong' };
  if (score >= 60) return { bar: '#F59E0B', text: 'text-amber-400', label: 'Moderate' };
  if (score >= 40) return { bar: '#F97316', text: 'text-orange-400', label: 'Weak' };
  return { bar: '#EF4444', text: 'text-red-400', label: 'Insufficient' };
};

const dimensions = [
  { key: 'sourceQuality', label: 'Source Quality' },
  { key: 'confirmations', label: 'Confirmations' },
  { key: 'dataAvailability', label: 'Data Availability' },
  { key: 'verificationStatus', label: 'Verification Status' },
] as const;

export default function ConfidenceMeter({
  overallScore,
  sourceQuality,
  confirmations,
  dataAvailability,
  verificationStatus,
  totalClaims,
  verified,
  misleading,
  unverifiable,
}: ConfidenceMeterProps) {
  const [expanded, setExpanded] = useState(false);
  const { bar, text, label } = scoreColor(overallScore);

  const scores: Record<string, number> = {
    sourceQuality,
    confirmations,
    dataAvailability,
    verificationStatus,
  };

  const unverifiedClaims = totalClaims - verified - misleading - unverifiable;

  return (
    <div className="rounded-2xl border border-[#2A2A2A] bg-[#0F0F0F] overflow-hidden">
      {/* Header */}
      <div className="px-6 py-5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          {/* Circular gauge */}
          <div className="relative w-16 h-16 flex-shrink-0">
            <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
              <circle
                cx="18" cy="18" r="15.9"
                fill="none" stroke="#1F1F1F" strokeWidth="3.5"
              />
              <circle
                cx="18" cy="18" r="15.9"
                fill="none"
                stroke={bar}
                strokeWidth="3.5"
                strokeDasharray={`${overallScore} ${100 - overallScore}`}
                strokeLinecap="round"
                className="transition-all duration-700"
              />
            </svg>
            <span className={`absolute inset-0 flex items-center justify-center text-base font-bold ${text}`}>
              {overallScore}
            </span>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-[#A1A1AA]">Confidence Score</p>
            <p className={`text-xl font-bold ${text}`}>{label} Evidence</p>
            {totalClaims > 0 && (
              <p className="text-xs text-[#A1A1AA] mt-0.5">
                {verified}/{totalClaims} claims verified
              </p>
            )}
          </div>
        </div>

        {/* Claims mini-breakdown */}
        {totalClaims > 0 && (
          <div className="hidden sm:flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5 text-green-400">
              <span className="w-2 h-2 rounded-full bg-green-400" />
              {verified} Verified
            </span>
            {misleading > 0 && (
              <span className="flex items-center gap-1.5 text-amber-400">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                {misleading} Misleading
              </span>
            )}
            {unverifiable > 0 && (
              <span className="flex items-center gap-1.5 text-[#A1A1AA]">
                <span className="w-2 h-2 rounded-full bg-[#A1A1AA]" />
                {unverifiable} Unverifiable
              </span>
            )}
            {unverifiedClaims > 0 && (
              <span className="flex items-center gap-1.5 text-[#71717A]">
                <span className="w-2 h-2 rounded-full bg-[#71717A]" />
                {unverifiedClaims} Unchecked
              </span>
            )}
          </div>
        )}

        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1.5 text-xs font-semibold text-[#A1A1AA] hover:text-[#F5F5F5] transition-colors"
          aria-expanded={expanded}
          aria-label="Expand confidence breakdown"
        >
          {expanded ? 'Less' : 'Details'}
          <svg
            className={`w-3.5 h-3.5 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
            fill="none" stroke="currentColor" viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {/* Expandable breakdown */}
      {expanded && (
        <div className="px-6 pb-6 border-t border-[#1F1F1F] pt-5 space-y-4">
          {dimensions.map(({ key, label: dimLabel }) => {
            const val = scores[key];
            const c = scoreColor(val);
            return (
              <div key={key}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-medium text-[#A1A1AA]">{dimLabel}</span>
                  <span className={`text-xs font-bold ${c.text}`}>{val}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-[#1F1F1F] overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${val}%`, backgroundColor: c.bar }}
                  />
                </div>
              </div>
            );
          })}

          <p className="text-[11px] text-[#A1A1AA] pt-2 border-t border-[#1F1F1F]">
            Confidence is calculated from source tier distribution, number of independent confirmations,
            availability of primary data sources, and the ratio of verified to unverified claims.
          </p>
        </div>
      )}
    </div>
  );
}
