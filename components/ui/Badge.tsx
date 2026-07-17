import React from 'react';

type BadgeVariant = 'breaking' | 'evidence' | 'updated' | 'topic' | 'category' | 'success' | 'warning' | 'error' | 'neutral' | 'info' | 'brand';

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
  showIcon?: boolean;
}

const variants: Record<BadgeVariant, string> = {
  // Mapping old variants to design system equivalent variants
  success: 'bg-green-500/10 border border-green-500/20 text-green-600',
  warning: 'bg-amber-500/10 border border-amber-500/20 text-amber-600',
  error: 'bg-red-500/10 border border-red-500/20 text-red-600',
  info: 'bg-blue-500/10 border border-blue-500/20 text-blue-600',
  neutral: 'bg-gray-500/10 border border-gray-500/20 text-gray-600',
  brand: 'bg-[#D4A843]/10 border border-[#D4A843]/30 text-[#D4A843]/90',
  // Original variants (backwards compatible)
  breaking: 'bg-[#D4A843]/10 border border-[#D4A843]/30 text-[#D4A843]/90',
  evidence: 'bg-[#22C55E]/10 border border-[#22C55E]/20 text-[#22C55E]/90',
  updated: 'bg-blue-500/10 border border-blue-500/20 text-blue-400/90',
  topic: 'bg-gray-800/50 text-gray-300/80 border border-gray-700/80',
  category: 'bg-gray-800/30 text-gray-400/80 border border-gray-700/60',
};

function getIcon(variant: BadgeVariant) {
  switch (variant) {
    case 'breaking':
      return (
        <span className="w-1.5 h-1.5 bg-[#D4A843] rounded-full" />
      );
    case 'evidence':
      return (
        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    default:
      return null;
  }
}

export default function Badge({ variant = 'neutral', children, className = '', showIcon = true }: BadgeProps) {
  const badgeVariant = variant in variants ? variant : 'neutral';
  
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${variants[badgeVariant]} ${className}`}
    >
      {showIcon && getIcon(badgeVariant)}
      {children}
    </span>
  );
}
