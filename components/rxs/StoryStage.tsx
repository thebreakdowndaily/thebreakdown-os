import type { ReactNode } from 'react';

export function StoryStage({
  number,
  title,
  children,
}: {
  number: number;
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="mb-16">
      <div className="flex items-center gap-3 mb-6">
        <span className="flex items-center justify-center w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold shrink-0">
          {number}
        </span>
        <div className="h-px flex-1 bg-gradient-to-r from-emerald-200 to-transparent" />
        <span className="text-xs font-semibold text-emerald-600 uppercase tracking-widest">{title}</span>
      </div>
      {children}
    </section>
  );
}
