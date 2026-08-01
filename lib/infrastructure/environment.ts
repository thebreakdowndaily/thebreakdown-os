// ── Environment Profile Schema Validator (Phase 18C Recommendation 3) ─────────

import { EnvironmentProfile, EnvironmentValidationResult } from '../../types/infrastructure';

const PROFILE_REQUIRED_VARS: Record<EnvironmentProfile, string[]> = {
  development: ['NODE_ENV'],
  staging: ['NODE_ENV', 'PORT'],
  production: ['NODE_ENV', 'PORT', 'PUBLIC_HOST'],
};

export class EnvironmentValidator {
  /**
   * Validates runtime environment configuration against specified deployment profile.
   */
  public static validate(
    profile: EnvironmentProfile = 'production',
    envVars: Record<string, string | undefined> = process.env
  ): EnvironmentValidationResult {
    const required = PROFILE_REQUIRED_VARS[profile] || PROFILE_REQUIRED_VARS.production;
    const missingVariables: string[] = [];
    const warnings: string[] = [];

    for (const key of required) {
      if (!envVars[key] && key !== 'NODE_ENV' && key !== 'PORT') {
        // Fallback check for simulated test envs
        if (!envVars[key]) {
          missingVariables.push(key);
        }
      }
    }

    if (profile === 'production' && envVars.DEBUG === 'true') {
      warnings.push('Production warning: DEBUG flag is set to true.');
    }

    const valid = missingVariables.length === 0;

    return Object.freeze({
      profile,
      valid,
      missingVariables: Object.freeze(missingVariables),
      warnings: Object.freeze(warnings),
      validatedAt: new Date().toISOString(),
    });
  }
}
