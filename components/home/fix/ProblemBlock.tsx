interface ProblemBlockProps {
  problem: string;
  rootCause: string;
}

export default function ProblemBlock({ problem, rootCause }: ProblemBlockProps) {
  return (
    <div className="space-y-3">
      <div>
        <h3 className="text-[11px] font-semibold uppercase tracking-widest text-[#EF4444] mb-1">Problem</h3>
        <p className="text-sm text-[#A1A1AA] leading-relaxed">{problem}</p>
      </div>
      <div>
        <h3 className="text-[11px] font-semibold uppercase tracking-widest text-[#D4A843] mb-1">Root Cause</h3>
        <p className="text-sm text-[#A1A1AA] leading-relaxed">{rootCause}</p>
      </div>
    </div>
  );
}
