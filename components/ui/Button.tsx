'use client';

import Link from 'next/link';

type ButtonVariant = 'primary' | 'secondary' | 'text';

interface ButtonProps {
  variant?: ButtonVariant;
  href?: string;
  children: React.ReactNode;
  className?: string;
  accent?: 'gold' | 'green' | 'neutral';
  onClick?: () => void;
  fullWidth?: boolean;
}

const base = 'inline-flex items-center justify-center gap-2 text-sm font-medium transition-all duration-200';

const variants: Record<string, Record<string, string>> = {
  neutral: {
    primary:
      'px-6 py-3 bg-[#D4A843] text-black font-semibold rounded-lg hover:bg-[#D4A843]/90 hover:-translate-y-0.5 active:translate-y-0',
    secondary:
      'px-5 py-3 text-[#A1A1AA] border border-[#2A2A2A] rounded-lg hover:border-[#D4A843]/40 hover:text-[#F5F5F5] hover:-translate-y-0.5 active:translate-y-0',
    text:
      'text-[#D4A843] hover:text-[#D4A843]/80',
  },
  gold: {
    primary:
      'px-6 py-3 bg-[#D4A843] text-black font-semibold rounded-lg hover:bg-[#D4A843]/90 hover:-translate-y-0.5 active:translate-y-0',
    secondary:
      'px-5 py-3 text-[#A1A1AA] border border-[#2A2A2A] rounded-lg hover:border-[#D4A843]/40 hover:text-[#F5F5F5] hover:-translate-y-0.5 active:translate-y-0',
    text:
      'text-[#D4A843] hover:text-[#D4A843]/80',
  },
  green: {
    primary:
      'px-6 py-3 bg-[#22C55E] text-black font-semibold rounded-lg hover:bg-[#22C55E]/90 hover:-translate-y-0.5 active:translate-y-0',
    secondary:
      'px-6 py-3 text-[#22C55E] border border-[#22C55E]/30 rounded-lg hover:bg-[#22C55E]/5 hover:text-[#22C55E]/90 transition-all duration-200',
    text:
      'text-[#22C55E] hover:text-[#22C55E]/80',
  },
}

export default function Button({
  variant = 'primary',
  href,
  children,
  className = '',
  accent = 'neutral',
  onClick,
  fullWidth = false,
}: ButtonProps) {
  const classes = `${base} ${variants[accent][variant]} ${fullWidth ? 'w-full' : ''} ${className}`;

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button type="button" onClick={onClick} className={classes}>
      {children}
    </button>
  );
}
