export type IntelRole =
  | 'owner'
  | 'managing_editor'
  | 'editor'
  | 'reporter'
  | 'researcher'
  | 'analyst'
  | 'fact_checker'
  | 'guest';

export type IntelModule =
  | 'dashboard'
  | 'watch-list'
  | 'predictions'
  | 'scenarios'
  | 'candidates'
  | 'media'
  | 'research'
  | 'toolkit'
  | 'editorial'
  | 'story-builder'
  | 'verification'
  | 'rti'
  | 'tasks'
  | 'newsroom';

export const INTEL_MODULES: IntelModule[] = [
  'dashboard',
  'watch-list',
  'predictions',
  'scenarios',
  'candidates',
  'media',
  'research',
  'toolkit',
  'editorial',
  'story-builder',
  'verification',
  'rti',
  'tasks',
  'newsroom',
];

export const INTEL_ROLE_ORDER: IntelRole[] = [
  'guest',
  'fact_checker',
  'researcher',
  'reporter',
  'analyst',
  'editor',
  'managing_editor',
  'owner',
];

const MODULE_MIN_ROLE: Record<IntelModule, IntelRole> = {
  dashboard: 'guest',
  'watch-list': 'analyst',
  predictions: 'analyst',
  scenarios: 'analyst',
  candidates: 'researcher',
  media: 'reporter',
  research: 'researcher',
  toolkit: 'reporter',
  editorial: 'editor',
  'story-builder': 'editor',
  verification: 'fact_checker',
  rti: 'researcher',
  tasks: 'reporter',
  newsroom: 'reporter',
};

const ROLE_RANK: Record<IntelRole, number> = {
  guest: 0,
  fact_checker: 1,
  researcher: 2,
  reporter: 3,
  analyst: 4,
  editor: 5,
  managing_editor: 6,
  owner: 7,
};

const ROLE_LABEL: Record<IntelRole, string> = {
  owner: 'Owner',
  managing_editor: 'Managing Editor',
  editor: 'Editor',
  reporter: 'Reporter',
  researcher: 'Researcher',
  analyst: 'Analyst',
  fact_checker: 'Fact Checker',
  guest: 'Guest',
};

export function normalizeIntelRole(role: string | null | undefined): IntelRole {
  const r = (role ?? 'guest').toLowerCase().replace(/[\s-]+/g, '_') as IntelRole;
  return r in ROLE_RANK ? r : 'guest';
}

export function intelRoleRank(role: string | null | undefined): number {
  return ROLE_RANK[normalizeIntelRole(role)];
}

export function canAccessIntelModule(role: string | null | undefined, module: IntelModule): boolean {
  const min = MODULE_MIN_ROLE[module];
  return intelRoleRank(role) >= ROLE_RANK[min];
}

export function intelRoleLabel(role: string | null | undefined): string {
  return ROLE_LABEL[normalizeIntelRole(role)];
}

export function intelModulesForRole(role: string | null | undefined): IntelModule[] {
  return INTEL_MODULES.filter(m => canAccessIntelModule(role, m));
}
