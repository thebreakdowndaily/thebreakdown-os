interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  accent?: 'gold' | 'green' | 'none';
  as?: 'article' | 'div';
}

const accentBorders: Record<string, string> = {
  gold: 'hover:border-[#D4A843]/30',
  green: 'hover:border-[#22C55E]/30',
  none: '',
};

const accentShadows: Record<string, string> = {
  gold: 'hover:shadow-lg hover:shadow-[#D4A843]/5',
  green: 'hover:shadow-lg hover:shadow-[#22C55E]/5',
  none: '',
};

export default function Card({
  children,
  className = '',
  hover = true,
  accent = 'gold',
  as: Tag = 'article',
}: CardProps) {
  const baseClasses = 'rounded-2xl bg-[#151515] transition-all duration-300';
  const hoverClasses = hover
    ? `hover:-translate-y-1 ${accentBorders[accent]} ${accentShadows[accent]} group-hover:animate-accent-pulse`
    : '';

  return (
    <Tag className={`${baseClasses} ${hoverClasses} ${className}`}>
      {children}
    </Tag>
  );
}
