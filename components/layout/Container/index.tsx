import React from 'react';

interface ContainerProps {
  children: React.ReactNode;
  className?: string;
  as?: 'div' | 'section' | 'main' | 'article' | 'nav';
  narrow?: boolean;
}

export default function Container({
  children,
  className = '',
  as: Tag = 'div',
  narrow = false,
}: ContainerProps) {
  return (
    <Tag className={`w-full ${narrow ? 'max-w-4xl' : 'max-w-7xl'} mx-auto px-6 ${className}`.trim()}>
      {children}
    </Tag>
  );
}
