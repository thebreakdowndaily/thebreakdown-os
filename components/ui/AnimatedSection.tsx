'use client';

import { type ReactNode } from 'react';
import { useInView } from '@/hooks/useInView';

interface AnimatedSectionProps {
  children: ReactNode;
  className?: string;
  as?: 'section' | 'div';
  delay?: number;
}

export default function AnimatedSection({
  children,
  className = '',
  as: Tag = 'section',
  delay = 0,
}: AnimatedSectionProps) {
  const { ref, inView } = useInView({ threshold: 0.05 });

  return (
    <Tag
      ref={ref}
      className={className}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? 'translateY(0)' : 'translateY(16px)',
        transition: `opacity 600ms ease-out, transform 600ms ease-out`,
        transitionDelay: `${delay}ms`,
      }}
    >
      {children}
    </Tag>
  );
}
