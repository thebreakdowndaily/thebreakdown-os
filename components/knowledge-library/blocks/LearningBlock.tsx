'use client';

import type { FC } from 'react';
import type { BlockComponentProps } from '../core/block-registry';
import type { LearningBlockData, LearningItem } from '@/types/canonical';
import { useState } from 'react';

const variantConfig = {
  'key-takeaways': {
    label: 'Key Takeaways',
    icon: '✦',
    color: 'green',
  },
  'quiz': {
    label: 'Quiz',
    icon: '?',
    color: 'blue',
  },
  'flashcards': {
    label: 'Flashcards',
    icon: '⬡',
    color: 'purple',
  },
  'research-questions': {
    label: 'Research Questions',
    icon: '◎',
    color: 'amber',
  },
  'recommended-reading': {
    label: 'Recommended Reading',
    icon: '📖',
    color: 'indigo',
  },
};

export const LearningBlock: FC<BlockComponentProps> = ({ data, depth }) => {
  const { variant, items } = data as unknown as LearningBlockData;
  const config = variantConfig[variant] || variantConfig['key-takeaways'];

  const isScholar = depth === 'scholar' || depth === 'researcher';

  return (
    <div className={`border-2 border-${config.color}-200 rounded-xl overflow-hidden my-8`}>
      <div className={`px-5 py-3 bg-${config.color}-50 border-b border-${config.color}-200`}>
        <div className="flex items-center gap-2">
          <span className="text-lg">{config.icon}</span>
          <span className="text-sm uppercase tracking-wider font-semibold text-gray-600">{config.label}</span>
        </div>
      </div>

      <div className="px-5 py-4 divide-y divide-gray-100">
        {items.map((item, i) => (
          <LearningItemRow key={i} item={item} variant={variant} index={i} showAnswer={isScholar} />
        ))}
      </div>
    </div>
  );
};

function LearningItemRow({
  item, variant, index, showAnswer
}: {
  item: LearningItem;
  variant: string;
  index: number;
  showAnswer: boolean;
}) {
  const [revealed, setRevealed] = useState(false);

  if (variant === 'quiz' || variant === 'flashcards') {
    return (
      <div className="py-3 first:pt-0 last:pb-0">
        <div className="flex items-start gap-3">
          <span className="text-xs font-bold text-gray-400 mt-0.5 shrink-0">
            {index + 1}.
          </span>
          <div className="min-w-0">
            <p className="text-sm text-gray-800">{item.text}</p>
            {item.answer && (
              <div className="mt-2">
                <button
                  onClick={() => setRevealed(!revealed)}
                  className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                >
                  {revealed ? 'Hide answer' : 'Show answer'}
                </button>
                {revealed && (
                  <p className="mt-1 text-sm text-gray-600 pl-3 border-l-2 border-blue-300">{item.answer}</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-3 first:pt-0 last:pb-0">
      <div className="flex items-start gap-3">
        <span className="text-xs font-bold text-gray-400 mt-0.5 shrink-0">{index + 1}.</span>
        <div className="min-w-0">
          <p className="text-sm text-gray-800">{item.text}</p>
          {item.answer && showAnswer && (
            <p className="mt-1 text-sm text-gray-500">{item.answer}</p>
          )}
          {item.sources && item.sources.length > 0 && (
            <div className="mt-1 flex gap-1">
              {item.sources.map((s, j) => (
                <span key={j} className="text-xs text-gray-400">[Source {s.replace('s', '')}]</span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
