import type { VerificationTimelineData } from './types';

function fmt(iso?: string) {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });
}

const steps = [
  { key: 'createdAt', label: 'Created' },
  { key: 'reviewedAt', label: 'Reviewed' },
  { key: 'updatedAt', label: 'Updated' },
  { key: 'verifiedAt', label: 'Last Verified' },
] as const;

export default function VerificationTimeline({ data }: { data: VerificationTimelineData }) {
  const active = steps.filter((s) => data[s.key as keyof VerificationTimelineData]);

  if (active.length === 0) return null;

  return (
    <div className="rounded-2xl bg-[#151515] border border-[#2A2A2A] p-5">
      <h3 className="text-sm font-bold text-[#F5F5F5] mb-4">Verification Timeline</h3>
      <div className="relative pl-6">
        <div className="absolute left-[7px] top-1 bottom-1 w-px bg-[#2A2A2A]" aria-hidden="true" />
        {active.map((step, i) => {
          const date = fmt(data[step.key as keyof VerificationTimelineData]);
          const isLast = i === active.length - 1;
          return (
            <div key={step.key} className="relative pb-4 last:pb-0">
              <div className="absolute left-[-17px] top-1" aria-hidden="true">
                <span
                  className={`block w-[14px] h-[14px] rounded-full border-2 ${
                    isLast ? 'bg-[#22C55E] border-[#22C55E]' : 'bg-[#2A2A2A] border-[#2A2A2A]'
                  }`}
                />
              </div>
              <div>
                <span className="text-xs font-medium text-[#A1A1AA]">{step.label}</span>
                {date && <span className="text-xs text-[#A1A1AA]/40 ml-2 tabular-nums">{date}</span>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
