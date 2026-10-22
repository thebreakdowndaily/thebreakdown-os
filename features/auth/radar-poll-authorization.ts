import type { AppPermission } from './permissions';

export const RADAR_POLL_PERMISSION = 'radar.poll' as const;
export const RADAR_POLL_FORCE_PERMISSION = 'radar.poll.force' as const;

export type RadarPollAuthorizationResult =
  | { allowed: true }
  | { allowed: false; status: 401 | 403; error: 'unauthorized' | 'forbidden' };

/**
 * Enforces the least-privilege boundary for API-key-triggered Radar work.
 * Cron credentials are a separate machine-identity path and are not treated
 * as API keys. API keys require the base poll scope; forced runs additionally
 * require the explicit force scope.
 */
export function authorizeRadarPoll(input: {
  isCronAuthorized: boolean;
  keyPermissions: readonly AppPermission[] | null | undefined;
  forceAll: boolean;
}): RadarPollAuthorizationResult {
  if (input.isCronAuthorized) {
    return { allowed: true };
  }

  if (!input.keyPermissions) {
    return { allowed: false, status: 401, error: 'unauthorized' };
  }

  if (!input.keyPermissions.includes(RADAR_POLL_PERMISSION)) {
    return { allowed: false, status: 403, error: 'forbidden' };
  }

  if (input.forceAll && !input.keyPermissions.includes(RADAR_POLL_FORCE_PERMISSION)) {
    return { allowed: false, status: 403, error: 'forbidden' };
  }

  return { allowed: true };
}
