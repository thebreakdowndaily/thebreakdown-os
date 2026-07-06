'use client';

import { useState } from 'react';
import type { FAQData } from './types';

export default function FAQBlock({ questions }: FAQData) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  if (questions.length === 0) return null;

  return (
    <section id="faq" aria-label="Frequently asked questions" className="py-8 sm:py-10">
      <h2 className="text-lg sm:text-xl font-bold text-[#F5F5F5] mb-5">Frequently Asked Questions</h2>
      <div className="space-y-2">
        {questions.map((item, i) => {
          const isOpen = openIndex === i;
          return (
            <div key={i} className="rounded-xl bg-[#151515] border border-[#2A2A2A] overflow-hidden">
              <button
                type="button"
                onClick={() => setOpenIndex(isOpen ? null : i)}
                className="w-full flex items-center justify-between px-5 py-4 text-left text-sm font-medium text-[#F5F5F5] hover:bg-[#1D1D1D] transition-colors"
                aria-expanded={isOpen}
                aria-controls={`faq-answer-${i}`}
              >
                <span>{item.question}</span>
                <span className={`shrink-0 text-[#D4A843] transition-transform duration-200 ${isOpen ? 'rotate-45' : ''}`} aria-hidden="true">+</span>
              </button>
              {isOpen && (
                <div id={`faq-answer-${i}`} className="px-5 pb-4 text-sm text-[#A1A1AA] leading-relaxed">
                  {item.answer}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
