interface TopicIconProps {
  slug: string;
  size?: 'sm' | 'md' | 'lg';
}

const icons: Record<string, string> = {
  economy: '📈',
  technology: '📱',
  policy: '📝',
  agriculture: '🌾',
  'digital-payments': '💳',
  defence: '🛡️',
  climate: '🌧️',
  healthcare: '🏥',
  elections: '🗳️',
  governance: '🏛️',
  economyfinance: '📈',
};

const sizes = {
  sm: 'text-xl',
  md: 'text-2xl',
  lg: 'text-3xl',
};

export default function TopicIcon({ slug, size = 'md' }: TopicIconProps) {
  return (
    <span className={`${sizes[size]} leading-none flex-shrink-0`} aria-hidden="true">
      {icons[slug] || '📊'}
    </span>
  );
}