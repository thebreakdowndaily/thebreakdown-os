/**
 * EvidenceStatus — Signature Evidence Component
 * Governance: Editorial Constitution v1.1 · AGENTS.md Platform Beta
 *
 * The Breakdown's signature evidence status component.
 * Renders null when no evidence data is provided — never fabricates numbers.
 *
 * Visual identity:
 *   EVIDENCE STATUS
 *   12 claims  ███████████░░ 83%
 *   ✓ 10 verified  ◐ 1 partial  ? 1 unresolved
 *   8 primary documents · 3 government sources
 *   VIEW EVIDENCE TRAIL →
 *
 * Accessibility:
 *   - Progress bar is supplemental — numbers are the primary signal.
 *   - Status is always communicated by label + symbol, not color alone.
 *   - Evidence TRAIL link included only when href is provided.
 *
 * Deep Research environment: darkest background, precision type.
 */

import Link from 'next/link';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface EvidenceStatusData {
  totalClaims:         number;
  verifiedClaims:      number;
  partialClaims?:      number;
  unresolvedClaims?:   number;
  primaryDocuments?:   number;
  governmentSources?:  number;
  evidenceTrailHref?:  string;
  lastVerified?:       string;
}

interface EvidenceStatusProps {
  data: EvidenceStatusData | null | undefined;
  /** Compact variant for inline use in story headers */
  compact?: boolean;
  className?: string;
}

// ── Progress bar ─────────────────────────────────────────────────────────────

function EvidenceBar({ percentage }: { percentage: number }) {
  const clamped = Math.max(0, Math.min(100, percentage));

  return (
    <div
      className="relative h-1.5 rounded-full overflow-hidden"
      style={{ backgroundColor: 'var(--color-border-research)' }}
      role="presentation"
      aria-hidden="true"
    >
      <div
        className="absolute inset-y-0 left-0 rounded-full"
        style={{
          width:   `${clamped}%`,
          background: clamped >= 80
            ? 'var(--color-evidence-verified-text)'
            : clamped >= 50
            ? 'var(--color-evidence-partial-text)'
            : 'var(--color-evidence-unresolved-text)',
        }}
      />
    </div>
  );
}

// ── Evidence state pill ───────────────────────────────────────────────────────

function StatePill({
  symbol,
  count,
  label,
  type,
}: {
  symbol: string;
  count: number;
  label: string;
  type: 'verified' | 'partial' | 'unresolved';
}) {
  const styles = {
    verified:   { bg: 'var(--color-evidence-verified)',   border: 'var(--color-evidence-verified-border)',   text: 'var(--color-evidence-verified-text)'   },
    partial:    { bg: 'var(--color-evidence-partial)',    border: 'var(--color-evidence-partial-border)',    text: 'var(--color-evidence-partial-text)'    },
    unresolved: { bg: 'var(--color-evidence-unresolved)', border: 'var(--color-evidence-unresolved-border)', text: 'var(--color-evidence-unresolved-text)' },
  };
  const s = styles[type];

  return (
    <span
      className="inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs font-mono"
      style={{ backgroundColor: s.bg, border: `1px solid ${s.border}`, color: s.text }}
      title={`${count} ${label}`}
    >
      <span aria-hidden="true">{symbol}</span>
      <span>{count}</span>
      <span className="sr-only">{label}</span>
    </span>
  );
}

// ── Root ──────────────────────────────────────────────────────────────────────

export default function EvidenceStatus({
  data,
  compact = false,
  className = '',
}: EvidenceStatusProps) {
  // Never fabricate data. Render nothing if no evidence data available.
  if (!data) return null;

  const {
    totalClaims,
    verifiedClaims,
    partialClaims    = 0,
    unresolvedClaims = 0,
    primaryDocuments,
    governmentSources,
    evidenceTrailHref,
    lastVerified,
  } = data;

  if (totalClaims === 0) return null;

  const percentage   = Math.round((verifiedClaims / totalClaims) * 100);
  const remaining    = totalClaims - verifiedClaims - partialClaims - unresolvedClaims;

  return (
    <div
      className={`rounded border ${className}`}
      style={{
        backgroundColor: compact ? 'transparent' : 'var(--color-bg-research)',
        borderColor:     compact ? 'transparent' : 'var(--color-border-research)',
      }}
      aria-label="Evidence status for this article"
    >
      <div className={compact ? '' : 'p-5'}>
        {/* Header */}
        {!compact && (
          <div className="flex items-center justify-between mb-4">
            <p
              className="text-[10px] font-mono uppercase tracking-[0.2em]"
              style={{ color: 'var(--color-earth-ochre)' }}
            >
              Evidence Status
            </p>
            {lastVerified && (
              <p
                className="text-[10px] font-mono"
                style={{ color: 'var(--color-earth-dust)' }}
              >
                Verified {lastVerified}
              </p>
            )}
          </div>
        )}

        {/* Claim count + percentage */}
        <div className="flex items-baseline justify-between mb-2">
          <span
            className="text-sm font-mono"
            style={{ color: 'var(--color-text-research)' }}
          >
            <span className="text-lg font-bold" style={{ fontFamily: 'var(--font-playfair), Georgia, serif' }}>
              {totalClaims}
            </span>
            {' '}claims
          </span>
          <span
            className="text-xs font-mono font-semibold"
            style={{
              color: percentage >= 80
                ? 'var(--color-evidence-verified-text)'
                : percentage >= 50
                ? 'var(--color-evidence-partial-text)'
                : 'var(--color-evidence-unresolved-text)',
            }}
          >
            {percentage}% verified
          </span>
        </div>

        {/* Progress bar */}
        <EvidenceBar percentage={percentage} />

        {/* State pills */}
        <div className="flex flex-wrap items-center gap-2 mt-3">
          {verifiedClaims > 0 && (
            <StatePill symbol="✓" count={verifiedClaims} label="verified claims" type="verified" />
          )}
          {partialClaims > 0 && (
            <StatePill symbol="◐" count={partialClaims} label="partial claims" type="partial" />
          )}
          {unresolvedClaims > 0 && (
            <StatePill symbol="?" count={unresolvedClaims} label="unresolved claims" type="unresolved" />
          )}
          {remaining > 0 && (
            <span className="text-[10px] font-mono" style={{ color: 'var(--color-earth-dust)' }}>
              +{remaining} pending
            </span>
          )}
        </div>

        {/* Source metadata */}
        {!compact && (primaryDocuments || governmentSources) ? (
          <div
            className="flex flex-wrap gap-x-3 gap-y-1 mt-3 pt-3 text-xs font-mono"
            style={{
              color:      'var(--color-earth-dust)',
              borderTop:  '1px solid var(--color-border-research)',
            }}
          >
            {primaryDocuments && primaryDocuments > 0 ? (
              <span>{primaryDocuments} primary documents</span>
            ) : null}
            {primaryDocuments && primaryDocuments > 0 && governmentSources && governmentSources > 0 ? (
              <span aria-hidden="true">·</span>
            ) : null}
            {governmentSources && governmentSources > 0 ? (
              <span>{governmentSources} government sources</span>
            ) : null}
          </div>
        ) : null}

        {/* Evidence trail CTA */}
        {evidenceTrailHref && !compact && (
          <div className="mt-4">
            <Link
              href={evidenceTrailHref}
              className="text-xs font-mono uppercase tracking-[0.14em] transition-colors duration-150"
              style={{ color: 'var(--color-earth-ochre)', textDecoration: 'none' }}
            >
              View Evidence Trail →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
