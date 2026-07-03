interface ProblemBlockProps {
  problem: string;
  rootCause: string;
}

export default function ProblemBlock({ problem, rootCause }: ProblemBlockProps) {
  return (
    <div className="space-y-3">
      <div>
        <h3 className="text-[11px] font-semibold uppercase tracking-widest text-red-400 mb-1">Problem</h3>
        <p className="text-sm text-gray-300 leading-relaxed">{problem}</p>
      </div>
      <div>
        <h3 className="text-[11px] font-semibold uppercase tracking-widest text-amber-400 mb-1">Root Cause</h3>
        <p className="text-sm text-gray-300 leading-relaxed">{rootCause}</p>
      </div>
    </div>
  );
}
