import { cn } from '@/utils/cn';
import { STATUS_CONFIG, type ClaimStatus } from './types';

export default function ConfidenceBadge({ status, confidence }: { status: ClaimStatus; confidence: number }) {
  const cfg = STATUS_CONFIG[status];
  return (
    <span
      className={cn("inline-flex items-center gap-1.5 px-2 py-0.5 rounded-sm text-[10px] font-bold uppercase tracking-widest border", cfg.wrapperClass)}
    >
      <span className={cn("w-1.5 h-1.5 rounded-full", cfg.dotClass)} />
      <span>{cfg.label}</span>
      <span className="opacity-60 tabular-nums font-mono">{confidence}%</span>
    </span>
  );
}
