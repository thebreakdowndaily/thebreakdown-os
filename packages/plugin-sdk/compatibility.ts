/**
 * Compatibility aliases and utilities for the Plugin SDK.
 * Deprecated aliases are kept for backward compatibility and will be removed in SDK v2.0.
 */

import { ExperienceAction } from "../kxe/types";

const KOS_VERSION = "1.0.0";

/**
 * @deprecated Use ExperienceAction instead.
 * @see ExperienceAction
 * Planned removal in SDK v2.0.
 */
export type KXEAction = ExperienceAction;

export class PluginCompatibilityError extends Error {
  constructor(
    public readonly pluginId: string,
    public readonly requiredVersion: string,
    public readonly currentVersion: string,
  ) {
    super(
      `Plugin '${pluginId}' requires KOS version ${requiredVersion}, but current version is ${currentVersion}`,
    );
    this.name = "PluginCompatibilityError";
  }
}

export function compareVersions(a: string, b: string): number {
  const pa = a.split(".").map(Number);
  const pb = b.split(".").map(Number);
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const na = pa[i] ?? 0;
    const nb = pb[i] ?? 0;
    if (na > nb) return 1;
    if (na < nb) return -1;
  }
  return 0;
}

export function isCompatible(version: string, minimumVersion: string): boolean {
  return compareVersions(version, minimumVersion) >= 0;
}

export function assertCompatible(manifest: { id: string; minimumKOSVersion: string }) {
  if (!isCompatible(KOS_VERSION, manifest.minimumKOSVersion)) {
    throw new PluginCompatibilityError(
      manifest.id,
      manifest.minimumKOSVersion,
      KOS_VERSION,
    );
  }
}
