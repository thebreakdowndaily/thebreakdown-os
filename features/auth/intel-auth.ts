import {
  INTEL_MODULES,
  normalizeIntelRole,
  canAccessIntelModule,
  intelRoleLabel,
  type IntelModule,
  type IntelRole,
} from './roles';

export interface IntelSessionLike {
  user: {
    role?: string | null;
  };
}

export type IntelAuthDecision =
  | { status: 'authorized'; role: IntelRole; roleLabel: string }
  | { status: 'denied'; role: IntelRole; roleLabel: string };

export type IntelGuardResult =
  | { authorized: true; role: IntelRole; roleLabel: string }
  | { authorized: false; reason: 'unauthenticated'; roleLabel: string }
  | { authorized: false; reason: 'forbidden'; role: IntelRole; roleLabel: string };

export function decideIntelAccess(module: IntelModule, role: string | null | undefined): IntelAuthDecision {
  const normalized = normalizeIntelRole(role);
  const roleLabel = intelRoleLabel(normalized);
  return canAccessIntelModule(normalized, module)
    ? { status: 'authorized', role: normalized, roleLabel }
    : { status: 'denied', role: normalized, roleLabel };
}

export async function guardIntel(
  module: IntelModule,
  loadSession: () => Promise<IntelSessionLike | null>
): Promise<IntelGuardResult> {
  const session = await loadSession();
  if (!session) {
    return { authorized: false, reason: 'unauthenticated', roleLabel: 'Guest' };
  }
  const decision = decideIntelAccess(module, session.user.role);
  if (decision.status === 'denied') {
    return { authorized: false, reason: 'forbidden', role: decision.role, roleLabel: decision.roleLabel };
  }
  return { authorized: true, role: decision.role, roleLabel: decision.roleLabel };
}

export function intelModuleFromPath(pathname: string): IntelModule | null {
  if (pathname === '/intel' || pathname === '/intel/') return 'dashboard';
  if (!pathname.startsWith('/intel/')) return null;
  const segment = pathname.slice('/intel/'.length).split('/')[0] ?? '';
  return (INTEL_MODULES as readonly string[]).includes(segment) ? (segment as IntelModule) : null;
}
