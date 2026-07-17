interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  variant?: 'neutral' | 'gold' | 'green' | 'none';
  accent?: 'neutral' | 'gold' | 'green' | 'none';
  as?: 'article' | 'div';
}

const variantBackgrounds: Record<string, string> = {
  neutral: 'bg-[#151515]',
  gold: 'bg-[#D4A843]/10',
  green: 'bg-[#22C55E]/10',
  none: '',
};

const variantBorders: Record<string, string> = {
  neutral: 'border-[#2A2A2A]/50 hover:border-[#D4A843]/30',
  gold: 'border-[#D4A843]/20 hover:border-[#D4A843]/40',
  green: 'border-[#22C55E]/20 hover:border-[#22C55E]/40',
  none: '',
};

const variantShadows: Record<string, string> = {
  neutral: 'hover:shadow-sm hover:shadow-black/20',
  gold: 'hover:shadow-md hover:shadow-[#D4A843]/10',
  green: 'hover:shadow-md hover:shadow-[#22C55E]/10',
  none: '',
};

export default function Card({
  children,
  className = '',
  hover = true,
  variant: propVariant,
  accent,
  as: Tag = 'article',
}: CardProps) {
  const variant = propVariant || accent || 'neutral';
  const baseClasses = 'rounded-2xl transition-all duration-300';
  const variantBg = variantBackgrounds[variant];
  const variantBorder = variantBorders[variant];
  const variantShadow = variantShadows[variant];
  
  const hoverClasses = hover
    ? `hover:-translate-y-1 ${variantBorder} ${variantShadow}`
    : '';

  return (
    <Tag className={`${baseClasses} ${variantBg} ${hoverClasses} ${className}`}>
      {children}
    </Tag>
  );
}
