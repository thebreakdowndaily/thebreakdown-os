import { describe, it, expect } from 'vitest';
import {
  ALL_GLOBAL_RADAR_SOURCES,
  USA_RADAR_SOURCES,
  UK_RADAR_SOURCES,
  GERMANY_RADAR_SOURCES,
  getSourcesForCountry,
} from '@/data/radar/sources-global';

describe('Global Pilot Sources Registry', () => {
  it('includes sensors for all 4 pilot countries', () => {
    expect(ALL_GLOBAL_RADAR_SOURCES.length).toBeGreaterThanOrEqual(25);
    expect(USA_RADAR_SOURCES.length).toBeGreaterThanOrEqual(4);
    expect(UK_RADAR_SOURCES.length).toBeGreaterThanOrEqual(3);
    expect(GERMANY_RADAR_SOURCES.length).toBeGreaterThanOrEqual(4);
  });

  it('provides required 4-part sensor distribution for Germany (DE)', () => {
    const deSources = getSourcesForCountry('DE');

    const primaryGov = deSources.find((s) => s.beat === 'government' && s.officialStatus === 'official_primary');
    const publicSafety = deSources.find((s) => s.beat === 'public_safety' && s.officialStatus === 'official_primary');
    const localMedia = deSources.find((s) => s.officialStatus === 'media');

    expect(primaryGov).toBeDefined();
    expect(publicSafety).toBeDefined();
    expect(localMedia).toBeDefined();
    expect(deSources.some((s) => s.language === 'de')).toBe(true);
  });

  it('provides required 4-part sensor distribution for United States (US)', () => {
    const usSources = getSourcesForCountry('US');

    const primaryGov = usSources.find((s) => s.beat === 'government' && s.officialStatus === 'official_primary');
    const publicSafety = usSources.find((s) => s.beat === 'public_safety' && s.officialStatus === 'official_primary');
    const localMedia = usSources.find((s) => s.officialStatus === 'media');

    expect(primaryGov).toBeDefined();
    expect(publicSafety).toBeDefined();
    expect(localMedia).toBeDefined();
  });
});
