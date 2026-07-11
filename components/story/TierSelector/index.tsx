'use client';

import { useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export type Tier = 'quick' | 'standard' | 'deep';

interface TierSelectorProps {
  currentTier: Tier;
  quickTime: number;
  standardTime: number;
  deepTime: number;
}

const tiers: { key: Tier; label: string; description: string }[] = [
  { key: 'quick', label: 'Quick Brief', description: '30s — key takeaways' },
  { key: 'standard', label: 'Standard', description: '5–7 min — full article' },
  { key: 'deep', label: 'Deep Research', description: '15–20 min — with sources & evidence' },
];

export default function TierSelector({ currentTier, quickTime, standardTime, deepTime }: TierSelectorProps) {
  const router = useRouter();
  const pathname = usePathname();

  const times = { quick: quickTime, standard: standardTime, deep: deepTime };

  const handleTierChange = useCallback((tier: Tier) => {
    if (tier === 'standard') {
      router.push(pathname, { scroll: false });
    } else {
      router.push(`${pathname}?mode=${tier}`, { scroll: false });
    }
  }, [router, pathname]);

  return (
    <nav aria-label="Reading depth" className="border-b border-border pb-4 mb-8">
      <div className="flex flex-wrap gap-2">
        {tiers.map((t) => {
          const isActive = currentTier === t.key;
          return (
            <button
              key={t.key}
              onClick={() => handleTierChange(t.key)}
              aria-current={isActive ? 'true' : undefined}
              className={`group relative px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                isActive
                  ? 'bg-foreground text-background'
                  : 'bg-surface-secondary text-muted hover:text-foreground hover:bg-surface-tertiary'
              }`}
            >
              <span className="flex items-center gap-2">
                <span>{t.label}</span>
                <span className={`text-[11px] ${isActive ? 'opacity-80' : 'opacity-60'}`}>
                  {times[t.key] < 2 ? '~1 min' : `~${times[t.key]} min`}
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
