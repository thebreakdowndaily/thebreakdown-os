import type { Fix } from '../../types/canonical';
import { FIX_MGNREGA_REFORM } from './fix-mgnrega';
import { FIX_PMFBY_CLAIMS } from './fix-pmfby';
import { FIX_AIR_POLLUTION, FIX_FARM_INCOME, FIX_JUDICIAL_PENDENCY, FIX_ANGANWADI } from './fix-remaining';

export const CANONICAL_FIXTURES: Fix[] = [
  FIX_MGNREGA_REFORM,
  FIX_PMFBY_CLAIMS,
  FIX_AIR_POLLUTION,
  FIX_FARM_INCOME,
  FIX_JUDICIAL_PENDENCY,
  FIX_ANGANWADI,
];

export const FIXTURE_MAP: Record<string, Fix> = Object.fromEntries(
  CANONICAL_FIXTURES.map(f => [f.id, f])
);

export function getFixtureBySlug(slug: string): Fix | undefined {
  return CANONICAL_FIXTURES.find(f => f.slug === slug);
}

export function getFixtureById(id: string): Fix | undefined {
  return FIXTURE_MAP[id];
}
