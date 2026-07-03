'use client';

interface SubscribeButtonProps {
  variant?: 'primary' | 'mobile';
}

export default function SubscribeButton({ variant = 'primary' }: SubscribeButtonProps) {
  return (
    <a
      href="/subscribe"
      className={`inline-flex items-center justify-center font-semibold transition-all duration-200 ${
        variant === 'mobile'
          ? 'w-full bg-amber-500 text-black px-6 py-3 rounded-lg text-base hover:bg-amber-400'
          : 'bg-amber-500 text-black px-5 py-2 rounded-lg text-sm hover:bg-amber-400'
      }`}
    >
      Subscribe
      <svg className="ml-1.5 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
      </svg>
    </a>
  );
}
