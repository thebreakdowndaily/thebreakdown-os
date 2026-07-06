import { STATUS_CONFIG, type ClaimStatus } from './types';

export default function ConfidenceBadge({ status, confidence }: { status: ClaimStatus; confidence: number }) {
  const cfg = STATUS_CONFIG[status];
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border"
      style={{ color: cfg.color, backgroundColor: cfg.bg, borderColor: `${cfg.color}30` }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: cfg.color }} />
      <span>{cfg.label}</span>
      <span className="opacity-60 tabular-nums">{confidence}%</span>
    </span>
  );
}
