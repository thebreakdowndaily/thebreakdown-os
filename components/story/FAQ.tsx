'use client';

import React, { useState } from 'react';

interface FAQProps {
  questions: Array<{ question: string; answer: string }>;
}

const FAQ: React.FC<FAQProps> = ({ questions }) => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (i: number) => { setOpenIndex((prev) => (prev === i ? null : i)); };

  return (
    <section aria-label="Frequently asked questions" className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h2 className="text-xl sm:text-2xl font-bold text-gray-100 mb-6">
        Frequently Asked Questions
      </h2>
      <div className="space-y-3">
        {questions.map((item, i) => {
          const isOpen = openIndex === i;
          const id = `faq-answer-${String(i)}`;
          return (
            <div key={i} className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden">
              <button
                onClick={() => { toggle(i); }}
                className="w-full flex items-center justify-between px-5 py-4 text-left text-gray-100 font-medium hover:bg-gray-700/50 transition-colors"
                aria-expanded={isOpen}
                aria-controls={id}
              >
                <span>{item.question}</span>
                <span
                  className={`flex-shrink-0 text-amber-400 transition-transform duration-200 ${isOpen ? 'rotate-45' : ''}`}
                  aria-hidden="true"
                >
                  +
                </span>
              </button>
              {isOpen && (
                <div id={id} className="px-5 pb-4 text-sm text-gray-300 leading-relaxed">
                  {item.answer}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default FAQ;
