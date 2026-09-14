/**
 * THE BREAKDOWN — Security Regression Test Suite
 *
 * Verifies Phase 1 Authentication & Authorization Hardening:
 * 1. User metadata cannot grant privilege (prevents client-controlled privilege escalation).
 * 2. Roles are derived strictly from authoritative server-controlled app_metadata.
 * 3. Suspended principals fail all permission checks.
 * 4. Anonymous callers fail closed on all non-public operations.
 * 5. Default backdoor administrative API key is eliminated.
 * 6. Centralized policy guards throw appropriate 401/403 errors.
 */

import { extractAuthoritativeRole, type IntelRole } from '../../features/auth/roles';
import { resolvePrincipalFromUser, type Principal } from '../../features/auth/principal';
import { can } from '../../features/auth/policy';
import { requirePermission, requireRole } from '../../features/auth/require-role';
import { UnauthorizedError, ForbiddenError } from '../../features/auth/require-auth';
import { validateApiKey } from '../../utils/api-auth';
import type { User } from '@supabase/supabase-js';

let passed = 0;
let failed = 0;

function assert(condition: boolean, message: string) {
  if (condition) {
    console.log(`  ✓ PASS: ${message}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${message}`);
    failed++;
  }
}

async function runSecuritySuite() {
  console.log('───────────────────────────────────────────────────────');
  console.log('Phase 1 Security Regression: Auth & Privilege Gates');
  console.log('───────────────────────────────────────────────────────\n');

  // 1. Role Escalation Prevention
  console.log('1. Privilege Escalation Prevention via Mutable user_metadata');
  {
    // Attacker crafts a user payload with user_metadata.role = 'owner'
    const attackerUser: Partial<User> = {
      id: 'attacker-uuid-1234',
      email: 'attacker@example.com',
      app_metadata: {}, // Empty app_metadata (normal authenticated reader)
      user_metadata: {
        role: 'owner', // Injected by attacker via client supabase.auth.updateUser()
        name: 'Malicious Actor',
      },
    };

    const role = extractAuthoritativeRole(attackerUser as User);
    assert(role === 'guest', 'user_metadata.role = "owner" is strictly rejected and falls back to "guest"');

    const principal = resolvePrincipalFromUser(attackerUser as User);
    assert(principal.role === 'guest', 'Principal role resolves to "guest" regardless of user_metadata');
    assert(principal.isSuperAdmin === false, 'Attacker is not granted superadmin privileges');
    assert(can(principal, 'intel.predictions') === false, 'Attacker cannot access intel.predictions');
    assert(can(principal, 'intel.editorial') === false, 'Attacker cannot access intel.editorial');
    assert(can(principal, 'story.publish') === false, 'Attacker cannot publish stories');
    assert(can(principal, 'api_key.create') === false, 'Attacker cannot generate API keys');
    assert(can(principal, 'user.role.grant') === false, 'Attacker cannot grant roles to other users');
  }

  // 2. Authoritative app_metadata Authority
  console.log('\n2. Authoritative Server-Controlled app_metadata Roles');
  {
    const editorUser: Partial<User> = {
      id: 'editor-uuid-5678',
      email: 'editor@thebreakdown.in',
      app_metadata: { role: 'editor' },
      user_metadata: { name: 'Staff Editor' },
    };

    const editorPrincipal = resolvePrincipalFromUser(editorUser as User);
    assert(editorPrincipal.role === 'editor', 'Legitimate editor role recognized from app_metadata');
    assert(can(editorPrincipal, 'story.publish') === true, 'Editor can publish stories');
    assert(can(editorPrincipal, 'intel.editorial') === true, 'Editor can access intel.editorial');
    assert(can(editorPrincipal, 'api_key.create') === false, 'Editor cannot create platform API keys');

    const ownerUser: Partial<User> = {
      id: 'owner-uuid-9999',
      email: 'owner@thebreakdown.in',
      app_metadata: { role: 'owner' },
      user_metadata: { name: 'Station Chief' },
    };

    const ownerPrincipal = resolvePrincipalFromUser(ownerUser as User);
    assert(ownerPrincipal.role === 'owner', 'Owner role recognized from app_metadata');
    assert(ownerPrincipal.isSuperAdmin === true, 'Owner is marked as superadmin');
    assert(can(ownerPrincipal, 'api_key.create') === true, 'Owner can create API keys');
    assert(can(ownerPrincipal, 'user.role.grant') === true, 'Owner can grant roles');
  }

  // 3. Suspended Principal Isolation
  console.log('\n3. Suspended Principal Isolation');
  {
    const bannedUser: Partial<User> = {
      id: 'banned-uuid-0001',
      email: 'rogue@thebreakdown.in',
      banned_until: new Date(Date.now() + 86400000).toISOString(),
      app_metadata: { role: 'owner' }, // Even if previously had owner role
      user_metadata: { name: 'Rogue Employee' },
    };

    const bannedPrincipal = resolvePrincipalFromUser(bannedUser as User);
    assert(bannedPrincipal.status === 'suspended', 'User with active banned_until resolves to suspended');
    assert(can(bannedPrincipal, 'story.publish') === false, 'Suspended owner cannot publish stories');
    assert(can(bannedPrincipal, 'api_key.create') === false, 'Suspended owner cannot create API keys');
    assert(can(bannedPrincipal, 'intel.dashboard') === false, 'Suspended user cannot access intel dashboard');
  }

  // 4. Anonymous Fail-Closed Policy
  console.log('\n4. Anonymous Callers Fail Closed');
  {
    assert(can(null, 'story.read') === true, 'Anonymous caller can read published stories');
    assert(can(null, 'story.publish') === false, 'Anonymous caller cannot publish');
    assert(can(null, 'intel.dashboard') === false, 'Anonymous caller cannot access intel dashboard');
    assert(can(null, 'api_key.read') === false, 'Anonymous caller cannot view API keys');
  }

  // 5. Backdoor Admin API Key Elimination
  console.log('\n5. Backdoor Admin API Key Elimination');
  {
    const defaultDevKey = 'dev-key-0000-0000-0000-000000000000';
    const validated = validateApiKey(defaultDevKey);
    assert(validated === null, 'Hardcoded dev-key-0000-0000-0000-000000000000 is rejected');
  }

  // 6. Centralized Guard Exceptions
  console.log('\n6. Guard Error Contracts');
  {
    const unauthError = new UnauthorizedError();
    assert(unauthError.status === 401, 'UnauthorizedError returns HTTP 401');

    const forbiddenError = new ForbiddenError();
    assert(forbiddenError.status === 403, 'ForbiddenError returns HTTP 403');
  }

  console.log('\n───────────────────────────────────────────────────────');
  console.log(`Security Regression Tests: ${passed} passed, ${failed} failed`);
  console.log('───────────────────────────────────────────────────────');
  process.exit(failed > 0 ? 1 : 0);
}

runSecuritySuite();
