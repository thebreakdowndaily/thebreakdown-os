import { PluginManifest } from "../manifest";
import { KOS_VERSION } from "../version";

export class PluginCompatibilityError extends Error {
  public pluginId: string;
  public pluginVersion: string;
  public requiredVersion: string;
  public currentVersion: string;

  constructor(pluginId: string, pluginVersion: string, requiredVersion: string, currentVersion: string) {
    super(`Plugin '${pluginId}' requires KOS version >= ${requiredVersion}, but current version is ${currentVersion}.`);
    this.name = "PluginCompatibilityError";
    this.pluginId = pluginId;
    this.pluginVersion = pluginVersion;
    this.requiredVersion = requiredVersion;
    this.currentVersion = currentVersion;
  }
}

/**
 * Parses a basic x.y.z semantic version string into its numeric components.
 * Throws an error if the format is invalid.
 */
function parseVersion(version: string): [number, number, number] {
  const parts = version.split(".");
  if (parts.length !== 3) {
    throw new Error(`Invalid version format: '${version}'. Expected x.y.z.`);
  }
  
  const nums = parts.map(p => parseInt(p, 10));
  if (nums.some(isNaN)) {
    throw new Error(`Invalid version format: '${version}'. Expected numeric components.`);
  }
  
  return [nums[0], nums[1], nums[2]];
}

/**
 * Compares two semantic version strings (x.y.z).
 * Returns:
 *  1 if a > b
 * -1 if a < b
 *  0 if a === b
 */
export function compareVersions(a: string, b: string): 1 | -1 | 0 {
  const [majorA, minorA, patchA] = parseVersion(a);
  const [majorB, minorB, patchB] = parseVersion(b);

  if (majorA > majorB) return 1;
  if (majorA < majorB) return -1;
  
  if (minorA > minorB) return 1;
  if (minorA < minorB) return -1;
  
  if (patchA > patchB) return 1;
  if (patchA < patchB) return -1;
  
  return 0;
}

/**
 * Checks if the current version meets or exceeds the required version.
 */
export function isCompatible(requiredVersion: string, currentVersion: string = KOS_VERSION): boolean {
  return compareVersions(currentVersion, requiredVersion) >= 0;
}

/**
 * Asserts that the plugin manifest's minimumKOSVersion is compatible with the current version.
 * Throws PluginCompatibilityError if it is not.
 */
export function assertCompatible(manifest: PluginManifest, currentVersion: string = KOS_VERSION): void {
  if (!isCompatible(manifest.minimumKOSVersion, currentVersion)) {
    throw new PluginCompatibilityError(
      manifest.id,
      manifest.version,
      manifest.minimumKOSVersion,
      currentVersion
    );
  }
}
