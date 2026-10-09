import type { CountryPack } from './types';
import { INDIA_COUNTRY_PACK } from './india';
import { USA_COUNTRY_PACK } from './usa';
import { UK_COUNTRY_PACK } from './uk';
import { GERMANY_COUNTRY_PACK } from './germany';

export * from './types';
export { INDIA_COUNTRY_PACK } from './india';
export { USA_COUNTRY_PACK } from './usa';
export { UK_COUNTRY_PACK } from './uk';
export { GERMANY_COUNTRY_PACK } from './germany';

export const REGISTERED_COUNTRY_PACKS: Record<string, CountryPack> = {
  IN: INDIA_COUNTRY_PACK,
  US: USA_COUNTRY_PACK,
  GB: UK_COUNTRY_PACK,
  DE: GERMANY_COUNTRY_PACK,
};

export function getCountryPack(countryCode: string): CountryPack | null {
  const normalized = countryCode.toUpperCase();
  return REGISTERED_COUNTRY_PACKS[normalized] || null;
}
