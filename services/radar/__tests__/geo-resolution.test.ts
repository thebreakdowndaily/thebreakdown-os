import { describe, it, expect } from 'vitest';
import { resolveLocation, getGeoHierarchy } from '@/data/radar/geo-india';

describe('Geo Resolution', () => {
  it('resolves Rewa to rewa-district', () => {
    const loc = resolveLocation('Rewa');
    expect(loc?.id).toBe('rewa-district');
  });

  it('resolves Hindi रीवा to rewa-district', () => {
    const loc = resolveLocation('रीवा');
    expect(loc?.id).toBe('rewa-district');
  });

  it('resolves Madhya Pradesh to mp', () => {
    const loc = resolveLocation('Madhya Pradesh');
    expect(loc?.id).toBe('mp');
  });

  it('resolves भोपाल to bhopal-district', () => {
    const loc = resolveLocation('भोपाल');
    expect(loc?.id).toBe('bhopal-district');
  });

  it('returns hierarchy from getGeoHierarchy', () => {
    const hierarchy = getGeoHierarchy('rewa-city');
    expect(hierarchy.map(h => h.id)).toEqual(['rewa-city', 'rewa-district', 'rewa-division', 'mp', 'india']);
  });

  it('returns null for unknown location', () => {
    const loc = resolveLocation('UnknownPlaceXYZ');
    expect(loc).toBeNull();
  });

  it('is case insensitive', () => {
    const loc1 = resolveLocation('REWA');
    const loc2 = resolveLocation('rewa');
    expect(loc1?.id).toBe('rewa-district');
    expect(loc1?.id).toEqual(loc2?.id);
  });

  // ── Phase 3B-M1 Depth Precedence & Specificity Test Matrix ──────────────────

  it('Criterion A: resolves text containing India + Madhya Pradesh + Rewa to most granular Rewa district', () => {
    const loc = resolveLocation('India + Madhya Pradesh + Rewa');
    expect(loc?.id).toBe('rewa-district');
    expect(loc?.level).toBe('district');
  });

  it('Criterion B: resolves Madhya Pradesh without Rewa to state mp', () => {
    const loc = resolveLocation('Government of Madhya Pradesh announces state budget');
    expect(loc?.id).toBe('mp');
    expect(loc?.level).toBe('state');
  });

  it('Criterion C: resolves India without an Indian state/UT to country india', () => {
    const loc = resolveLocation('Government of India announces national foreign policy');
    expect(loc?.id).toBe('india');
    expect(loc?.level).toBe('country');
  });

  it('Criterion D: resolves City + district + state + country to most specific city location', () => {
    const loc = resolveLocation('Rewa City, Rewa District, Madhya Pradesh, India');
    expect(loc?.id).toBe('rewa-city');
    expect(loc?.level).toBe('city');
  });

  it('Criterion D2: resolves Bhopal City + Bhopal District + MP to bhopal-city', () => {
    const loc = resolveLocation('Press release from Bhopal City regarding Bhopal District in MP');
    expect(loc?.id).toBe('bhopal-city');
    expect(loc?.level).toBe('city');
  });

  it('Criterion E: returns null safely for arbitrary text without geography', () => {
    expect(resolveLocation('')).toBeNull();
    expect(resolveLocation('   ')).toBeNull();
    expect(resolveLocation('Unrelated sentence about financial technology')).toBeNull();
  });

  it('Word boundary guard: does not match short state alias mp inside unrelated words like company', () => {
    const loc = resolveLocation('The company reported strong earnings across India');
    expect(loc?.id).toBe('india'); // Not 'mp' from 'company'
  });

  it('Criterion G: preserves valid mappings across all MP districts and Hindi variants', () => {
    expect(resolveLocation('Bhopal')?.id).toBe('bhopal-district');
    expect(resolveLocation('भोपाल')?.id).toBe('bhopal-district');
    expect(resolveLocation('Indore')?.id).toBe('indore-district');
    expect(resolveLocation('इंदौर')?.id).toBe('indore-district');
    expect(resolveLocation('Jabalpur')?.id).toBe('jabalpur-district');
    expect(resolveLocation('जबलपुर')?.id).toBe('jabalpur-district');
    expect(resolveLocation('Gwalior')?.id).toBe('gwalior-district');
    expect(resolveLocation('ग्वालियर')?.id).toBe('gwalior-district');
    expect(resolveLocation('Sagar')?.id).toBe('sagar-district');
    expect(resolveLocation('सागर')?.id).toBe('sagar-district');
    expect(resolveLocation('Satna')?.id).toBe('satna-district');
    expect(resolveLocation('सतना')?.id).toBe('satna-district');
  });
});
