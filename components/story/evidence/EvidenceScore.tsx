export default function EvidenceScore({ score, label }: { score: number; label?: string }) {
  return (
    <div className="flex flex-col items-center sm:items-start">
      <span className="text-4xl sm:text-5xl font-bold text-brand-400 tabular-nums leading-none tracking-tighter">{score}</span>
      {label && <span className="text-[10px] font-bold uppercase tracking-widest text-text-muted mt-1">{label}</span>}
    </div>
  );
}
