'use client';

import type { FC } from 'react';
import type { Chapter, ReadingDepth } from '@/types/canonical';

interface HeroSectionProps {
  chapter: Chapter;
  onStartReading: () => void;
}

const questions = [
  'What happened?',
  'Why did it happen?',
  'What alternatives existed?',
  'Why did India choose this path?',
  'What were the consequences?',
  'Why does it matter today?',
];

export const HeroSection: FC<HeroSectionProps> = ({ chapter, onStartReading }) => {
  return (
    <section className="relative mb-12 rounded-xl border border-gray-200 bg-gradient-to-br from-gray-50 to-white overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-amber-50/40 to-transparent rounded-bl-full" />

      <div className="relative px-8 py-10 md:py-14">
        <div className="flex items-center gap-3 mb-4">
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
            ★ Gold Standard
          </span>
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
            chapter.status === 'published' ? 'bg-green-100 text-green-700' :
            chapter.status === 'verified' ? 'bg-blue-100 text-blue-700' :
            'bg-gray-100 text-gray-500'
          }`}>
            {chapter.status}
          </span>
        </div>

        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight mb-2">
          {chapter.title}
        </h1>
        <p className="text-lg md:text-xl text-gray-600 mb-6 leading-snug max-w-3xl">
          {chapter.summary}
        </p>

        <div className="flex flex-wrap items-center gap-4 mb-8">
          <div className="flex items-center gap-1.5 text-sm text-gray-500">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <span>Read: <strong>{chapter.readingTime.explorer}</strong> min · <strong>{chapter.readingTime.scholar}</strong> min · <strong>{chapter.readingTime.researcher}</strong> min (by mode)</span>
          </div>
          <div className="flex items-center gap-1.5 text-sm text-gray-500">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            <span>Difficulty: <strong>{'★'.repeat(chapter.difficulty)}{'☆'.repeat(5 - chapter.difficulty)}</strong></span>
          </div>
          <div className="flex items-center gap-1.5 text-sm text-gray-500">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
            <span>Trust Score: <strong className="text-green-600">96</strong></span>
          </div>
          {chapter.lastVerifiedAt && (
            <div className="flex items-center gap-1.5 text-sm text-gray-500">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
              <span>Verified <strong>{new Date(chapter.lastVerifiedAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</strong></span>
            </div>
          )}
        </div>

        <div className="mb-8">
          <p className="text-sm font-semibold text-gray-700 mb-3">Before you begin, you will learn:</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
            {questions.map((q, i) => (
              <div key={i} className="flex items-center gap-2 text-sm text-gray-600">
                <svg className="w-4 h-4 text-green-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                {q}
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={onStartReading}
          className="inline-flex items-center gap-2 px-6 py-3 bg-amber-600 text-white rounded-lg font-medium hover:bg-amber-700 transition-colors shadow-sm"
        >
          Start Reading
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
        </button>
      </div>
    </section>
  );
};
