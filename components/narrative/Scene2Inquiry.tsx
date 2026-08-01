'use client';

/**
 * Scene 2 — Begin With a Question (Intent-Based Inquiry Terminal)
 * Governance: ERD-NAV-001 | NOS-CERT-v1.0 | RXS-v3.0 § 6 Scene 2
 * One Question: answered by the reader themselves — "What do you want to understand?"
 *
 * Client Component — hydrates only for: animated placeholder cycling + form submit.
 * State: current input value only. No journey state. No recommendations.
 */

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import type { SyntheticEvent } from 'react';


const PLACEHOLDER_QUESTIONS = [
  'Why does air pollution persist in Indian cities?',
  'What was Nehru\'s vision for India\'s foreign policy?',
  'How did Partition shape modern India?',
  'What is the evidence on electoral bonds?',
  'Why did India choose non-alignment?',
  'How does the Supreme Court interpret free speech?',
  'What caused the 1962 war with China?',
  'How does India\'s economy compare to 1947?',
];

const CYCLE_INTERVAL_MS = 3200;

export default function Scene2Inquiry() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Cycle placeholder text when input is not focused
  useEffect(() => {
    if (isFocused) return;
    const id = setInterval(() => {
      setPlaceholderIndex((i) => (i + 1) % PLACEHOLDER_QUESTIONS.length);
    }, CYCLE_INTERVAL_MS);
    return () => { clearInterval(id); };
  }, [isFocused]);


  function handleSubmit(e: SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;
    router.push(`/search?q=${encodeURIComponent(trimmed)}`);
  }


  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen px-6 py-24 bg-neutral-950">
      {/* Radial ambient light centred on input */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_50%,_#0f2a1a_0%,_transparent_70%)]"
      />

      <div className="relative z-10 w-full max-w-3xl mx-auto space-y-10 text-center">

        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-white leading-tight">
          What do you want to{' '}
          <span className="text-emerald-400">understand</span>?
        </h2>

        <p className="text-base text-neutral-400 max-w-xl mx-auto leading-relaxed">
          Ask anything about India&apos;s history, politics, economy, or governance.
          Every answer is grounded in evidence.
        </p>

        {/* Inquiry Terminal */}
        <form
          onSubmit={handleSubmit}
          role="search"
          aria-label="What do you want to understand?"
          className="relative"
        >
          <label htmlFor="narrative-inquiry" className="sr-only">
            What do you want to understand?
          </label>

          <input
            ref={inputRef}
            id="narrative-inquiry"
            type="search"
            autoComplete="off"
            spellCheck="false"
            value={query}
            onChange={(e) => { setQuery(e.target.value); }}
            onFocus={() => { setIsFocused(true); }}
            onBlur={() => { setIsFocused(false); }}

            placeholder={PLACEHOLDER_QUESTIONS[placeholderIndex]}
            className="w-full px-6 py-5 pr-16 rounded-2xl bg-neutral-900 border border-neutral-700 text-white placeholder-neutral-600 text-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all font-sans"
            aria-describedby="inquiry-hint"
          />

          <button
            type="submit"
            aria-label="Begin inquiry"
            className="absolute right-3 top-1/2 -translate-y-1/2 p-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
        </form>

        <p id="inquiry-hint" className="text-xs font-mono text-neutral-600">
          Press Enter or click the search icon — we&apos;ll find the evidence
        </p>
      </div>
    </div>
  );
}
