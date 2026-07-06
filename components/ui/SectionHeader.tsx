interface SectionHeaderProps {
  eyebrow: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
  accent?: 'gold' | 'green';
}

export default function SectionHeader({ eyebrow, title, description, action, accent = 'gold' }: SectionHeaderProps) {
  const accentColor = accent === 'green' ? 'bg-[#22C55E]' : 'bg-[#D4A843]';
  const textColor = accent === 'green' ? 'text-[#22C55E]' : 'text-[#D4A843]';

  return (
    <div className="flex items-start gap-4 mb-10">
      <div className={`w-1 h-10 ${accentColor} rounded-full shrink-0`} />
      <div className="flex-1 min-w-0">
        <h2 className={`text-xs font-semibold tracking-widest uppercase ${textColor}`}>{eyebrow}</h2>
        <h3 className="text-2xl sm:text-3xl font-bold text-[#F5F5F5] mt-1">{title}</h3>
        {description && <p className="mt-1 text-sm text-[#A1A1AA]">{description}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
