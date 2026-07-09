export function fmt(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K';
  return String(n);
}

export function fmtPct(n: number): string {
  return (n * 100).toFixed(0) + '%';
}

export function fmtTime(ms: number): string {
  if (ms >= 60_000) return (ms / 60_000).toFixed(1) + 'm';
  if (ms >= 1_000) return (ms / 1_000).toFixed(0) + 's';
  return String(ms) + 'ms';
}
