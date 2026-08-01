'use client';

import React, { useState } from 'react';
import type { Problem } from '../../lib/problem-helpers';
import ProblemCategoryGrid from './ProblemCategoryGrid';
import ProblemSearch from './ProblemSearch';

interface ProblemExplorerPanelProps {
  problems: Problem[];
}

export default function ProblemExplorerPanel({ problems }: ProblemExplorerPanelProps) {
  const [filteredProblems, setFilteredProblems] = useState<Problem[]>(problems);

  return (
    <div className="space-y-6">
      <header className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--color-text-primary)]">
          Problem Intelligence Explorer
        </h1>
        <p className="mt-2 text-[var(--color-text-secondary)] max-w-2xl">
          Explore public policy and historical challenges mapped to root causes, evidence, and solution fixes.
        </p>
      </header>

      <section aria-label="Problem categories">
        <ProblemCategoryGrid />
      </section>

      <section aria-label="Search and filter problems">
        <ProblemSearch problems={problems} onFilterChange={setFilteredProblems} />
      </section>
    </div>
  );
}
