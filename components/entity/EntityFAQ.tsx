import React from 'react';
import TopicFAQ from '@/components/topic/TopicFAQ';
import type { FAQItem } from '@/types/canonical';

interface EntityFAQProps {
  questions: FAQItem[];
}

export default function EntityFAQ({ questions }: EntityFAQProps) {
  if (questions.length === 0) return null;
  return (
    <section aria-label="Frequently asked questions" className="py-6 sm:py-8">
      <h2 className="text-lg sm:text-xl font-bold text-[#F5F5F5] mb-5">FAQs</h2>
      <TopicFAQ questions={questions} />
    </section>
  );
}
