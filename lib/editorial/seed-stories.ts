/**
 * Seed Story Plan — Week of Aug 19–25, 2026
 *
 * Governing document: AGENTS.md (Editorial Calendar + Autonomous Weekly Publishing)
 *
 * 7 story slots, one per day. Each slot has:
 *   - A category (explainer, analysis, briefing, investigation)
 *   - A priority (1-10)
 *   - A rationale (why this story for this slot)
 *
 * These are PLANNED stories — they need to be written, verified, and
 * pass the publication gate before they go live.
 */

import type { SeedStoryPlan } from '@/types/editorial-calendar';

export const FIRST_WEEK_PLAN: SeedStoryPlan[] = [
  {
    slotDate: '2026-08-19',
    slotPosition: 1,
    category: 'explainer',
    title: 'Monsoon Session 2026: What Bills Are on the Table',
    summary: 'A comprehensive explainer on the key legislation expected during the Monsoon Session of Parliament, including constitutional amendments, economic reform bills, and social welfare legislation.',
    priority: 8,
    rationale: 'Monsoon Session is the most legislatively productive session — readers need a clear map of what is being debated.',
  },
  {
    slotDate: '2026-08-20',
    slotPosition: 2,
    category: 'analysis',
    title: 'RBI Rate Decision: What the Repo Rate Means for Borrowers',
    summary: 'Analysis of the latest RBI monetary policy decision, its impact on home loans, business credit, and the broader inflation trajectory.',
    priority: 7,
    rationale: 'RBI decisions directly affect 200M+ borrowers — immediate reader relevance.',
  },
  {
    slotDate: '2026-08-21',
    slotPosition: 3,
    category: 'briefing',
    title: 'Supreme Court This Week: Key Cases to Watch',
    summary: 'Weekly briefing on the most significant cases before the Supreme Court, including constitutional challenges, public interest litigations, and landmark judgments expected.',
    priority: 6,
    rationale: 'SC cases shape policy — a weekly briefing helps readers track judicial impact.',
  },
  {
    slotDate: '2026-08-22',
    slotPosition: 4,
    category: 'explainer',
    title: 'India\'s Digital Public Infrastructure: Where It Stands in 2026',
    summary: 'Explainer on the current state of India\'s DPI stack — UPI, DigiLocker, Aadhaar, ONDC — and how it compares to global alternatives.',
    priority: 7,
    rationale: 'DPI is India\'s most exported innovation — readers need a clear status update.',
  },
  {
    slotDate: '2026-08-23',
    slotPosition: 5,
    category: 'analysis',
    title: 'State Elections 2026: What the Polls Are Telling Us',
    summary: 'Deep analysis of upcoming state election trends, voter sentiment, and the key battlegrounds that will shape national politics.',
    priority: 8,
    rationale: 'State elections are the dress rehearsal for national politics — early signal for readers.',
  },
  {
    slotDate: '2026-08-24',
    slotPosition: 6,
    category: 'investigation',
    title: 'Public Spending Tracker: Where Did the Budget Go',
    summary: 'Data-driven investigation tracking the first quarter utilisation of key budget allocations — health, education, infrastructure, and social welfare.',
    priority: 9,
    rationale: 'Budget tracking is the core promise of accountability journalism — highest editorial value.',
  },
  {
    slotDate: '2026-08-25',
    slotPosition: 7,
    category: 'explainer',
    title: 'India and the World: Weekly Foreign Policy Digest',
    summary: 'Weekly roundup of India\'s diplomatic activity — bilateral meetings, multilateral engagements, trade agreements, and strategic partnerships.',
    priority: 6,
    rationale: 'Foreign policy is under-covered in Indian media — a weekly digest fills the gap.',
  },
];

export const WEEK_START = '2026-08-19';
