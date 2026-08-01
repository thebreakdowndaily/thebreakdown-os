// ── API Version Registry (Phase 19B Recommendation 2) ─────────────────────────

import { APIVersionDefinition } from '../../types/extensibility';

export const REGISTERED_API_VERSIONS: APIVersionDefinition[] = [
  {
    version: 'v1.0',
    lifecycle: 'STABLE',
    supportedSchema: 'CanonicalFixDomain-v1.0',
    compatibilityRules: Object.freeze(['Additive fields backward compatible', 'Non-breaking schema SemVer']),
  },
  {
    version: 'v1.1-preview',
    lifecycle: 'PREVIEW',
    supportedSchema: 'CanonicalFixDomain-v1.1',
    compatibilityRules: Object.freeze(['Preview features subject to refinement']),
  },
  {
    version: 'v0.9',
    lifecycle: 'DEPRECATED',
    supportedSchema: 'CanonicalFixDomain-v0.9',
    deprecationDate: '2026-12-31',
    compatibilityRules: Object.freeze(['Sunset on Dec 31, 2026']),
  },
];

export class APIVersionRegistry {
  public static listVersions(): readonly APIVersionDefinition[] {
    return Object.freeze(REGISTERED_API_VERSIONS.map((v) => Object.freeze({ ...v })));
  }

  public static getVersion(version: string): APIVersionDefinition | undefined {
    return REGISTERED_API_VERSIONS.find((v) => v.version === version);
  }
}
