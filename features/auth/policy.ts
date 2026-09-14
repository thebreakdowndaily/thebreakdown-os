import type { Principal } from './principal';
import type { AppPermission } from './permissions';
import type { IntelRole } from './roles';

const ROLE_PERMISSIONS: Record<IntelRole, Set<AppPermission>> = {
  owner: new Set<AppPermission>([
    'story.read', 'story.create', 'story.update', 'story.publish', 'story.delete',
    'investigation.read', 'investigation.write', 'citation.create', 'citation.modify', 'editorial.schedule',
    'intel.dashboard', 'intel.watchlist', 'intel.predictions', 'intel.scenarios', 'intel.candidates',
    'intel.media', 'intel.research', 'intel.toolkit', 'intel.editorial', 'intel.story_builder',
    'intel.verification', 'intel.rti', 'intel.tasks', 'intel.newsroom', 'intel.demand',
    'api_key.read', 'api_key.create', 'api_key.revoke',
    'user.role.grant', 'user.role.revoke', 'audit.read', 'system.config',
  ]),

  managing_editor: new Set<AppPermission>([
    'story.read', 'story.create', 'story.update', 'story.publish', 'story.delete',
    'investigation.read', 'investigation.write', 'citation.create', 'citation.modify', 'editorial.schedule',
    'intel.dashboard', 'intel.watchlist', 'intel.predictions', 'intel.scenarios', 'intel.candidates',
    'intel.media', 'intel.research', 'intel.toolkit', 'intel.editorial', 'intel.story_builder',
    'intel.verification', 'intel.rti', 'intel.tasks', 'intel.newsroom', 'intel.demand',
    'api_key.read', 'api_key.create', 'api_key.revoke',
    'user.role.grant', 'user.role.revoke', 'audit.read',
  ]),

  editor: new Set<AppPermission>([
    'story.read', 'story.create', 'story.update', 'story.publish',
    'investigation.read', 'investigation.write', 'citation.create', 'citation.modify', 'editorial.schedule',
    'intel.dashboard', 'intel.watchlist', 'intel.predictions', 'intel.scenarios', 'intel.candidates',
    'intel.media', 'intel.research', 'intel.toolkit', 'intel.editorial', 'intel.story_builder',
    'intel.verification', 'intel.rti', 'intel.tasks', 'intel.newsroom', 'intel.demand',
  ]),

  analyst: new Set<AppPermission>([
    'story.read', 'investigation.read',
    'intel.dashboard', 'intel.watchlist', 'intel.predictions', 'intel.scenarios', 'intel.candidates',
    'intel.media', 'intel.research', 'intel.toolkit', 'intel.verification', 'intel.rti',
    'intel.tasks', 'intel.newsroom', 'intel.demand',
  ]),

  reporter: new Set<AppPermission>([
    'story.read', 'story.create', 'story.update',
    'intel.dashboard', 'intel.candidates', 'intel.media', 'intel.research', 'intel.toolkit',
    'intel.verification', 'intel.rti', 'intel.tasks', 'intel.newsroom',
  ]),

  researcher: new Set<AppPermission>([
    'story.read', 'investigation.read',
    'intel.dashboard', 'intel.candidates', 'intel.research', 'intel.verification', 'intel.rti',
    'intel.demand',
  ]),

  fact_checker: new Set<AppPermission>([
    'story.read',
    'intel.dashboard', 'intel.verification',
  ]),

  guest: new Set<AppPermission>([
    'story.read',
    'intel.dashboard',
  ]),
};

/**
 * Pure authorization check evaluating whether a Principal holds a specific permission.
 * Suspended principals fail all permission checks.
 * Anonymous (null) callers only hold public read permissions.
 */
export function can(
  principal: Principal | null | undefined,
  permission: AppPermission,
  resource?: unknown
): boolean {
  void resource;
  if (!principal) {
    return permission === 'story.read';
  }

  if (principal.status === 'suspended') {
    return false;
  }

  if (principal.isSuperAdmin) {
    return true;
  }

  const rolePermissions = ROLE_PERMISSIONS[principal.role] as Set<AppPermission> | undefined;
  return rolePermissions ? rolePermissions.has(permission) : false;
}

