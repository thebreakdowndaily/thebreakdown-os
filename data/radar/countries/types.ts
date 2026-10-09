/**
 * ─── Country Pack & International Geographic Model ────────────────────────────
 *
 * Country-agnostic geographic representation.
 * Supports different administrative structures:
 *   - Federal (India: Country → State → Division → District → City)
 *   - County-based (USA: Country → State → County → City)
 *   - Unitary (UK: Country → Nation → Unitary Authority / Borough)
 */

export interface AdministrativeLevelDefinition {
  levelNumber: number; // 0 = country, 1 = state/province, 2 = district/county, etc.
  nameKey: string;     // e.g. "state", "province", "county", "district"
  displayName: string;
}

export interface GeographicNode {
  id: string;
  name: string;
  countryCode: string;
  level: string; // matches levelDefinition.nameKey
  parentId?: string;
  latitude?: number;
  longitude?: number;
  aliases: string[];
  multilingualNames?: Record<string, string>; // e.g. { hi: "भोपाल", es: "...", fr: "..." }
}

export interface CountrySourceDiscoveryPattern {
  beat: string;
  institutionKeywords: string[];
  domainSuffixes: string[];
  officialFeedPatterns: string[];
  authorityWeight: 'PRIMARY' | 'OFFICIAL' | 'JUDICIAL' | 'REGULATORY' | 'GENERAL_MEDIA';
}

export interface CountryPack {
  countryCode: string; // ISO 3166-1 alpha-2 / slug e.g. "IN", "US", "GB"
  countryName: string;
  administrativeLevels: AdministrativeLevelDefinition[];
  defaultLanguage: string;
  supportedLanguages: string[];
  nodes: Record<string, GeographicNode>;
  discoveryPatterns: CountrySourceDiscoveryPattern[];
}
