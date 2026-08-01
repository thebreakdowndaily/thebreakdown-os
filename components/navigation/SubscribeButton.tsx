'use client';

interface SubscribeButtonProps {
  variant?: 'primary' | 'mobile';
}

/**
 * SubscribeButton — RC-1 Editorial
 * Gold (#C9A84C) · black text · no icon — consistent with HeroSection CTAs
 */
export default function SubscribeButton({ variant = 'primary' }: SubscribeButtonProps) {
  return (
    <a
      href="/subscribe"
      className="inline-flex items-center justify-center font-semibold transition-colors duration-150"
      style={{
        backgroundColor: '#C9A84C',
        color: '#0A0A0A',
        padding: variant === 'mobile' ? '0.75rem 1.5rem' : '0.45rem 1.1rem',
        borderRadius: '4px',
        fontSize: variant === 'mobile' ? '0.9375rem' : '0.75rem',
        letterSpacing: '0.04em',
        textTransform: 'uppercase' as const,
        width: variant === 'mobile' ? '100%' : undefined,
      }}
    >
      Subscribe Free
    </a>
  );
}

