/**
 * TrustBar — Institutional Trust Signals
 * Governance: docs/rxs/screens/homepage.md · AGENTS.md Platform Beta
 *
 * Earth-inspired design. Dark Discovery environment.
 * Surfaces live platform metrics so readers encounter institutional
 * rigour before they encounter editorial content.
 *
 * Only shows real data. Falls back to labels if counts are zero/undefined.
 */

import Link from 'next/link';

interface TrustBarProps {
  chaptersPublished?: number;
  claimsRegistered?: number;
  primarySources?: number;
  lastVerified?: string;
}

interface TrustSignal {
  label: string;
  value: string;
  verified: boolean;
}

export function TrustBar({
  chaptersPublished,
  claimsRegistered,
  primarySources,
  lastVerified,
}: TrustBarProps) {
  const signals: TrustSignal[] = [
    {
      label:    'Chapters Reviewed',
      value:    chaptersPublished && chaptersPublished > 0
                  ? `${chaptersPublished}`
                  : '—',
      verified: Boolean(chaptersPublished && chaptersPublished > 0),
    },
    {
      label:    'Claims Registered',
      value:    claimsRegistered && claimsRegistered > 0
                  ? `${claimsRegistered}`
                  : '—',
      verified: Boolean(claimsRegistered && claimsRegistered > 0),
    },
    {
      label:    'Primary Sources',
      value:    primarySources && primarySources > 0
                  ? `${primarySources}`
                  : '—',
      verified: Boolean(primarySources && primarySources > 0),
    },
    {
      label:    'Last Verified',
      value:    lastVerified && lastVerified !== 'NOT VERIFIED'
                  ? lastVerified
                  : '—',
      verified: Boolean(lastVerified && lastVerified !== 'NOT VERIFIED'),
    },
  ];

  return (
    <section
      aria-label="Institutional trust metrics"
      style={{
        backgroundColor: 'var(--color-bg-secondary)',
        borderBottom: '1px solid var(--color-border-default)',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex flex-wrap items-center justify-between gap-x-8 gap-y-3">

          {/* Signals */}
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            {signals.map((signal, i) => (
              <div key={signal.label} className="flex items-center gap-4">
                {i > 0 && (
                  <span
                    className="hidden sm:block w-px h-3 shrink-0"
                    style={{ backgroundColor: 'var(--color-border-default)' }}
                    aria-hidden="true"
                  />
                )}
                <div className="flex items-center gap-2">
                  {/* Status indicator — not color alone; also uses ✓ / — */}
                  <span
                    className="text-[10px] font-mono"
                    style={{
                      color: signal.verified
                        ? 'var(--color-evidence-verified-text)'
                        : 'var(--color-earth-dust)',
                    }}
                    aria-hidden="true"
                  >
                    {signal.verified ? '✓' : '—'}
                  </span>
                  <span
                    className="text-xs font-mono"
                    style={{ color: 'var(--color-text-muted)' }}
                  >
                    {signal.label}:
                  </span>
                  <span
                    className="text-xs font-mono font-semibold"
                    style={{
                      color: signal.verified
                        ? 'var(--color-text-secondary)'
                        : 'var(--color-earth-dust)',
                    }}
                  >
                    {signal.value}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Trust dashboard link */}
          <Link
            href="/trust"
            className="text-[10px] font-mono uppercase tracking-[0.14em] transition-colors duration-150 shrink-0"
            style={{ color: 'var(--color-earth-ochre)' }}
          >
            Trust Dashboard ↗
          </Link>

        </div>
      </div>
    </section>
  );
}
