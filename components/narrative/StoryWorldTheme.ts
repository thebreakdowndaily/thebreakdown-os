/**
 * Story World Theme — Presentation Constants
 * Governance: ERD-NAV-001 | RXS-v3.0 | docs/rxs/homepage-narrative-blueprint.md § 5
 *
 * Maps Story World keys to Tailwind class strings and palette values.
 * Presentation belongs in presentation. No logic, no domain data.
 */

export type StoryWorldKey = 'state' | 'citizen' | 'planet' | 'economy' | 'constitution' | 'future';

export interface StoryWorldTheme {
  /** Primary background colour (Tailwind arbitrary or utility) */
  bg: string;
  /** Gradient overlay class for visual depth */
  gradient: string;
  /** Primary accent text colour */
  accent: string;
  /** Subtle border colour */
  border: string;
  /** Icon or decorative element colour */
  icon: string;
  /** Raw hex used for SVG/canvas elements */
  hex: string;
  /** Ambient descriptor phrase */
  ambience: string;
}

export const STORY_WORLD_THEMES: Record<StoryWorldKey, StoryWorldTheme> = {
  state: {
    bg: 'bg-[#0B132B]',
    gradient: 'from-[#0B132B] via-[#0d1a3a] to-[#091127]',
    accent: 'text-blue-300',
    border: 'border-blue-800/40',
    icon: 'text-blue-400',
    hex: '#0B132B',
    ambience: 'Diplomacy · Power · Strategy',
  },
  citizen: {
    bg: 'bg-[#1a1008]',
    gradient: 'from-[#1a1008] via-[#1f1509] to-[#150d06]',
    accent: 'text-amber-300',
    border: 'border-amber-800/40',
    icon: 'text-amber-400',
    hex: '#1a1008',
    ambience: 'Rights · Identity · Community',
  },
  planet: {
    bg: 'bg-[#041a12]',
    gradient: 'from-[#041a12] via-[#062318] to-[#03130d]',
    accent: 'text-emerald-300',
    border: 'border-emerald-800/40',
    icon: 'text-emerald-400',
    hex: '#041a12',
    ambience: 'Climate · Resources · Survival',
  },
  economy: {
    bg: 'bg-[#18181B]',
    gradient: 'from-[#18181B] via-[#1c1c20] to-[#141417]',
    accent: 'text-yellow-300',
    border: 'border-yellow-800/40',
    icon: 'text-yellow-400',
    hex: '#18181B',
    ambience: 'Markets · Trade · Inequality',
  },
  constitution: {
    bg: 'bg-[#1E293B]',
    gradient: 'from-[#1E293B] via-[#243147] to-[#18202f]',
    accent: 'text-slate-300',
    border: 'border-slate-600/40',
    icon: 'text-slate-400',
    hex: '#1E293B',
    ambience: 'Law · Rights · Justice',
  },
  future: {
    bg: 'bg-[#030712]',
    gradient: 'from-[#030712] via-[#050c1a] to-[#02040c]',
    accent: 'text-violet-300',
    border: 'border-violet-800/40',
    icon: 'text-violet-400',
    hex: '#030712',
    ambience: 'Technology · AI · Possibility',
  },
} as const;

export const STORY_WORLD_LABELS: Record<StoryWorldKey, string> = {
  state: 'The State',
  citizen: 'The Citizen',
  planet: 'The Planet',
  economy: 'The Economy',
  constitution: 'The Constitution',
  future: 'The Future',
} as const;
