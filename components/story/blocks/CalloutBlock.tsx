import type { CalloutData } from './types';

export default function CalloutBlock({ variant, title, content }: CalloutData) {
  const variantStyles = {
    'context': 'border-blue-400 bg-blue-400/5',
    'definition': 'border-purple-400 bg-purple-400/5',
    'why-it-matters': 'border-[#D4A843] bg-[#D4A843]/5',
    'what-changed': 'border-green-400 bg-green-400/5',
    'warning': 'border-red-400 bg-red-400/5',
  };

  const icons = {
    'context': '🔵',
    'definition': '📘',
    'why-it-matters': '⚡',
    'what-changed': '🔄',
    'warning': '⚠️',
  };

  return (
    <aside className={`my-8 p-6 border-l-4 rounded-r-lg ${variantStyles[variant]}`}>
      <div className="flex items-center gap-3 mb-2">
        <span className="text-lg" aria-hidden="true">{icons[variant]}</span>
        <h3 className="font-bold text-white tracking-wide text-sm uppercase">{title || variant.replace(/-/g, ' ')}</h3>
      </div>
      <p className="text-[#A1A1AA] leading-relaxed text-[15px]">{content}</p>
    </aside>
  );
}
