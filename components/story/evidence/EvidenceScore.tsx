export default function EvidenceScore({ score, label }: { score: number; label?: string }) {
  return (
    <div className="flex flex-col items-center">
      <span className="text-3xl sm:text-4xl font-bold text-[#D4A843] tabular-nums">{score}</span>
      {label && <span className="text-[10px] text-[#A1A1AA] mt-0.5">{label}</span>}
    </div>
  );
}
