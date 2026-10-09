import { describe, it, expect } from 'vitest';
import { resolveEntities } from '../entity-resolution';

describe('Entity Resolution', () => {
  it('resolves Government of Madhya Pradesh to ent_gov_mp', () => {
    const entities = resolveEntities('The Government of Madhya Pradesh announced a new policy.');
    expect(entities.some(e => e.id === 'ent_gov_mp')).toBe(true);
  });

  it('resolves Hindi name मध्य प्रदेश सरकार', () => {
    const entities = resolveEntities('मध्य प्रदेश सरकार ने नई योजना शुरू की।');
    expect(entities.some(e => e.id === 'ent_gov_mp' || e.aliases.includes('मध्य प्रदेश सरकार'))).toBe(true);
  });

  it('resolves abbreviation MP Police', () => {
    const entities = resolveEntities('The MP Police arrived at the scene.');
    expect(entities.some(e => e.id === 'ent_mp_police' || e.name === 'MP Police' || e.aliases?.includes('MP Police') || e.id.includes('police'))).toBe(true);
  });

  it('detects multiple entities in same text', () => {
    const text = 'MP Police and Government of Madhya Pradesh are working together.';
    const entities = resolveEntities(text);
    expect(entities.length).toBeGreaterThanOrEqual(2);
  });

  it('returns no duplicates when multiple aliases match', () => {
    const text = 'Government of Madhya Pradesh, also known as the Government of MP.';
    const entities = resolveEntities(text);
    const mpGovEntities = entities.filter(e => e.id === 'ent_gov_mp');
    expect(mpGovEntities.length).toBeLessThanOrEqual(1);
  });

  it('returns empty array for empty text', () => {
    const entities = resolveEntities('');
    expect(entities).toEqual([]);
  });

  it('is case insensitive', () => {
    const lowerEntities = resolveEntities('government of madhya pradesh');
    const upperEntities = resolveEntities('GOVERNMENT OF MADHYA PRADESH');
    
    expect(lowerEntities.length).toBeGreaterThan(0);
    expect(lowerEntities.map(e => e.id)).toEqual(upperEntities.map(e => e.id));
  });
});
