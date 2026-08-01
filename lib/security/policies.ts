// ── Declarative Policy Objects & Policy Registry (Phase 18B Recommendation 4) ─

import { SecurityPolicy, SystemResourceCategory, Permission } from '../../types/security';

export const BUILTIN_POLICIES: SecurityPolicy[] = [
  {
    policyId: 'pol-pub-read',
    resourceCategory: 'KNOWLEDGE',
    action: 'read_public',
    requiredPermission: 'public:read',
    description: 'Allows reading public knowledge objects.',
  },
  {
    policyId: 'pol-res-export',
    resourceCategory: 'RESEARCH',
    action: 'export_dossier',
    requiredPermission: 'research:export',
    description: 'Allows exporting research dossiers.',
  },
  {
    policyId: 'pol-ed-write',
    resourceCategory: 'EDITORIAL',
    action: 'draft_chapter',
    requiredPermission: 'editorial:write',
    description: 'Allows creating and editing story chapter drafts.',
  },
  {
    policyId: 'pol-ed-pub',
    resourceCategory: 'EDITORIAL',
    action: 'publish_chapter',
    requiredPermission: 'editorial:publish',
    description: 'Allows publishing certified chapters.',
  },
  {
    policyId: 'pol-ops-view',
    resourceCategory: 'OPERATIONS',
    action: 'view_control_plane',
    requiredPermission: 'operations:view',
    description: 'Allows viewing operations control plane dashboard.',
  },
  {
    policyId: 'pol-ops-exec',
    resourceCategory: 'OPERATIONS',
    action: 'execute_job',
    requiredPermission: 'operations:execute_job',
    description: 'Allows enqueuing and running operational jobs.',
  },
  {
    policyId: 'pol-sec-manage',
    resourceCategory: 'SECURITY',
    action: 'manage_roles',
    requiredPermission: 'security:manage_roles',
    description: 'Allows managing user roles and permissions.',
  },
];

export class PolicyRegistry {
  private static policies = new Map<string, SecurityPolicy>();

  public static initialize(): void {
    if (this.policies.size === 0) {
      BUILTIN_POLICIES.forEach((pol) => this.policies.set(pol.policyId, Object.freeze({ ...pol })));
    }
  }

  public static findRequiredPermission(category: SystemResourceCategory, action: string): Permission {
    this.initialize();
    for (const pol of this.policies.values()) {
      if (pol.resourceCategory === category && pol.action === action) {
        return pol.requiredPermission;
      }
    }
    // Fallback default requirement for unlisted administrative actions
    return 'admin:full';
  }

  public static listAll(): SecurityPolicy[] {
    this.initialize();
    return Array.from(this.policies.values());
  }
}
