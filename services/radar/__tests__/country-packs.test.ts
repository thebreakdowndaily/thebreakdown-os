import { describe, it, expect } from 'vitest';
import {
  getCountryPack,
  INDIA_COUNTRY_PACK,
  USA_COUNTRY_PACK,
  UK_COUNTRY_PACK,
} from '@/data/radar/countries';

describe('International Country Packs & Geographic Hierarchy', () => {
  it('loads India country pack with federal administrative hierarchy', () => {
    const pack = getCountryPack('IN');
    expect(pack).toBeDefined();
    expect(pack?.countryName).toBe('India');
    expect(pack?.administrativeLevels.map((l) => l.nameKey)).toEqual([
      'country',
      'state',
      'division',
      'district',
      'city',
      'tehsil',
    ]);
    expect(pack?.supportedLanguages).toContain('hi');
  });

  it('loads USA country pack with county-based administrative hierarchy', () => {
    const pack = getCountryPack('US');
    expect(pack).toBeDefined();
    expect(pack?.countryName).toBe('United States');
    expect(pack?.administrativeLevels.map((l) => l.nameKey)).toEqual([
      'country',
      'state',
      'county',
      'city',
    ]);
  });

  it('loads UK country pack with nation and unitary authority hierarchy', () => {
    const pack = getCountryPack('GB');
    expect(pack).toBeDefined();
    expect(pack?.countryName).toBe('United Kingdom');
    expect(pack?.administrativeLevels.map((l) => l.nameKey)).toEqual([
      'country',
      'nation',
      'authority',
      'borough',
    ]);
  });

  it('loads Germany country pack with bundesland, landkreis, and gemeinde', () => {
    const pack = getCountryPack('DE');
    expect(pack).toBeDefined();
    expect(pack?.countryName).toBe('Germany');
    expect(pack?.defaultLanguage).toBe('de');
    expect(pack?.administrativeLevels.map((l) => l.nameKey)).toEqual([
      'country',
      'bundesland',
      'landkreis',
      'gemeinde',
    ]);
    expect(pack?.nodes['de-muenchen']).toBeDefined();
    expect(pack?.nodes['de-muenchen'].name).toBe('Munich');
    expect(pack?.nodes['de-muenchen'].multilingualNames?.de).toBe('München');
  });

  it('returns null for unregistered country codes without throwing', () => {
    expect(getCountryPack('XX')).toBeNull();
  });
});
