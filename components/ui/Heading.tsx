import type { ReactNode } from 'react';

type HeadingLevel = 'display' | 'h1' | 'h2' | 'h3' | 'body' | 'caption';

interface HeadingProps {
  level: HeadingLevel;
  children: ReactNode;
  className?: string;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'span';
}

const tagMap: Record<HeadingLevel, 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'span'> = {
  display: 'h1',
  h1: 'h1',
  h2: 'h2',
  h3: 'h3',
  body: 'p',
  caption: 'span',
};

const styles: Record<HeadingLevel, string> = {
  display:
    'text-5xl sm:text-6xl font-bold text-[#F5F5F5] leading-[1.05] tracking-tight',
  h1:
    'text-4xl sm:text-5xl font-bold text-[#F5F5F5] leading-[1.1] tracking-tight',
  h2:
    'text-3xl sm:text-4xl font-bold text-[#F5F5F5] leading-[1.15]',
  h3:
    'text-2xl sm:text-3xl font-bold text-[#F5F5F5] leading-[1.2]',
  body:
    'text-lg text-[#A1A1AA] leading-relaxed',
  caption:
    'text-sm text-[#A1A1AA] leading-relaxed',
};

export default function Heading({
  level,
  children,
  className = '',
  as,
}: HeadingProps) {
  const Tag = as ?? tagMap[level];

  return (
    <Tag className={`${styles[level]} ${className}`}>
      {children}
    </Tag>
  );
}
