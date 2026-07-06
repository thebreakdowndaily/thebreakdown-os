type BadgeVariant = 'breaking' | 'evidence' | 'updated' | 'topic' | 'category';

interface BadgeProps {
  variant: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

const variants: Record<BadgeVariant, string> = {
  breaking:
    'bg-[#D4A843]/10 border border-[#D4A843]/30 text-[#D4A843]',
  evidence:
    'bg-[#22C55E]/10 border border-[#22C55E]/20 text-[#22C55E]',
  updated:
    'bg-blue-500/10 border border-blue-500/20 text-blue-400',
  topic:
    'bg-gray-800 text-gray-300 border border-gray-700',
  category:
    'bg-gray-800/50 text-gray-300 border border-gray-700',
};

export default function Badge({ variant, children, className = '' }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${variants[variant]} ${className}`}
    >
      {variant === 'breaking' && (
        <span className="w-1.5 h-1.5 bg-[#D4A843] rounded-full animate-pulse" />
      )}
      {variant === 'evidence' && (
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )}
      {children}
    </span>
  );
}
