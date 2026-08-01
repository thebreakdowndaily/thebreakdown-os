import type { FC } from 'react';
import type { BlockComponentProps } from '../core/block-registry';
import type { CalloutBlockData } from '@/types/canonical';

const variants = {
  info: 'bg-[#111111] border-[#C9A84C] text-[#A1A1AA]',
  warning: 'bg-[#181510] border-[#D4A017] text-[#D4A017]',
  question: 'bg-[#15101A] border-purple-500 text-purple-200',
  definition: 'bg-[#0E1510] border-emerald-500 text-emerald-200',
};

const labels = {
  info: 'EXECUTIVE SUMMARY',
  warning: 'WARNING',
  question: 'KEY QUESTION',
  definition: 'DEFINITION',
};

export const CalloutBlock: FC<BlockComponentProps> = ({ data }) => {
  const { variant, text } = data as unknown as CalloutBlockData;
  const isInfo = variant === 'info';
  
  return (
    <div className={`border-l-2 rounded-r p-6 my-8 ${variants[variant] || variants.info}`}>
      <p className="text-xs font-mono tracking-[0.15em] uppercase mb-3 text-[#C9A84C]">
        {labels[variant] || labels.info}
      </p>
      <div className={`text-sm leading-relaxed ${isInfo ? 'font-serif text-white text-base space-y-3' : 'space-y-2'}`}>
        {text.split('\n').map((para, i) => (
          <p key={i}>{para}</p>
        ))}
      </div>
    </div>
  );
};

