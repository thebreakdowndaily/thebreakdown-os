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
});
