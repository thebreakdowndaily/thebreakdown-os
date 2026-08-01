import type { ConstituencyRecord } from './types';

export function partyColorClass(party: string | null | undefined): string {
  switch (party) {
    case 'BJP': return 'bg-[#D4A843]/15 text-[#D4A843] border-[#D4A843]/30';
    case 'SP': return 'bg-[#22C55E]/15 text-[#22C55E] border-[#22C55E]/30';
    case 'INC': return 'bg-sky-500/15 text-sky-400 border-sky-500/30';
    case 'BSP': return 'bg-blue-600/15 text-blue-400 border-blue-600/30';
    default: return 'bg-[#2A2A2A] text-[#A1A1AA] border-[#3A3A3A]';
  }
}

export function dataStatusBadge(status: string | null | undefined): string {
  if (!status) return 'bg-[#2A2A2A] text-[#A1A1AA]';
  const s = status.toLowerCase();
  if (s.includes('available') || s.includes('verified')) return 'bg-[#22C55E]/15 text-[#22C55E]';
  if (s.includes('partial')) return 'bg-[#D4A843]/15 text-[#D4A843]';
  if (s.includes('not_available') || s.includes('unavailable')) return 'bg-[#FF3B30]/15 text-[#FF6B61]';
  return 'bg-[#2A2A2A] text-[#A1A1AA]';
}

export function formatNumber(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) return '—';
  return value.toLocaleString('en-IN');
}

export function formatPct(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) return '—';
  return `${value.toFixed(1)}%`;
}

export function formatInteger(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) return '—';
  return Math.round(value).toLocaleString('en-IN');
}

const YEAR_SUFFIX = { 2012: '2012', 2017: '2017', 2022: '2022' } as const;

type WinnerBase = 'winner' | 'winner_party' | 'victory_margin_pct' | 'winner_vote_share' | 'runner_up_party';

export function winnerRow(rec: ConstituencyRecord, year: 2012 | 2017 | 2022) {
  const sfx = YEAR_SUFFIX[year];
  const key = <B extends WinnerBase>(base: B): `${B}_${(typeof YEAR_SUFFIX)[typeof year]}` => `${base}_${sfx}`;
  return {
    winner: rec[key('winner')],
    party: rec[key('winner_party')],
    margin: rec[key('victory_margin_pct')],
    voteShare: rec[key('winner_vote_share')],
    runnerUpParty: rec[key('runner_up_party')],
  };
}
