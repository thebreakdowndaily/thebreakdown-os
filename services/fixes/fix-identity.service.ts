// ── Fix Identity & Slug Service (AR-13A.0 Specification) ───────────────────

import crypto from 'node:crypto';

export class FixIdentityService {
  /**
   * Generates a new RFC 4122 compliant UUIDv4 identifier.
   */
  public static generateId(): string {
    if (typeof globalThis.crypto?.randomUUID === 'function') {
      return globalThis.crypto.randomUUID();
    }
    return crypto.randomUUID();
  }

  /**
   * Validates if a string is a valid UUIDv4.
   */
  public static isValidUuid(id: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return typeof id === 'string' && uuidRegex.test(id);
  }

  /**
   * Generates a valid kebab-case slug from a title string.
   */
  public static generateSlug(title: string): string {
    return title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/[\s_]+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  /**
   * Validates if a slug strictly matches kebab-case syntax.
   */
  public static isValidSlug(slug: string): boolean {
    const kebabRegex = /^[a-z0-9]+(-[a-z0-9]+)*$/;
    return typeof slug === 'string' && kebabRegex.test(slug);
  }

  /**
   * Validates SemVer version string (e.g., "1.0.0").
   */
  public static isValidSemVer(version: string): boolean {
    const semVerRegex = /^\d+\.\d+\.\d+$/;
    return typeof version === 'string' && semVerRegex.test(version);
  }

  /**
   * Increments a SemVer string based on release type.
   */
  public static incrementVersion(version: string, releaseType: 'patch' | 'minor' | 'major'): string {
    if (!FixIdentityService.isValidSemVer(version)) {
      return '1.0.0';
    }
    const [major, minor, patch] = version.split('.').map(Number);
    if (releaseType === 'major') {
      return `${major + 1}.0.0`;
    }
    if (releaseType === 'minor') {
      return `${major}.${minor + 1}.0`;
    }
    return `${major}.${minor}.${patch + 1}`;
  }
}
