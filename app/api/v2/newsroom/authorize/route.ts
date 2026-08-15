import { NextRequest, NextResponse } from 'next/server';
import { guardIntelModule } from '@/features/auth/intel-server';
import { getSession } from '@/features/auth/auth-server';
import { INTEL_ROLE_ORDER } from '@/features/auth/roles';
import { beatRoutingService } from '@/services/intelligence/newsroom/beat-routing-service';
import { newsroomIntelligenceCore } from '@/services/intelligence/newsroom';
import { Phase2Authorization } from '@/types/newsroom-intelligence';

/**
 * POST /api/v2/newsroom/authorize
 *
 * Phase 2 activation requires explicit human authorization (Operating Standard
 * §8). This route is the ONLY production mechanism for that decision, and it is
 * restricted to managing_editor and above. Bootstrap never auto-authorizes.
 *
 * Body:
 *   { "action": "authorize", "approvedScope": "...", "approvedRecipients": [],
 *     "approvedBeats": [], "approvedChannels": [], "rollbackAuthority": "..." }
 * or:
 *   { "action": "revoke" }
 *
 * Actor identity is always derived from the session; body-supplied actor fields
 * are ignored.
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  const gate = await guardIntelModule('newsroom');
  if (!gate.authorized) {
    return NextResponse.json(
      { error: gate.reason },
      { status: gate.reason === 'unauthenticated' ? 401 : 403 }
    );
  }

  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });
  }

  if (INTEL_ROLE_ORDER.indexOf(gate.role) < INTEL_ROLE_ORDER.indexOf('managing_editor')) {
    return NextResponse.json(
      { error: 'forbidden: managing_editor or above required' },
      { status: 403 }
    );
  }

  await newsroomIntelligenceCore.ensureLoaded();

  const rawBody = (await req.json()) as unknown;
  if (rawBody === null || typeof rawBody !== 'object') {
    return NextResponse.json({ error: 'invalid body' }, { status: 400 });
  }
  const body = rawBody as Record<string, unknown>;
  const action = body.action === 'revoke' ? 'revoke' : 'authorize';

  if (action === 'authorize') {
    const auth: Phase2Authorization = {
      authorizedBy: session.user.id,
      authorizedRole: gate.role,
      authorizationTimestamp: new Date().toISOString(),
      approvedScope:
        typeof body.approvedScope === 'string'
          ? body.approvedScope
          : 'Beat alerting activation',
      approvedRecipients: Array.isArray(body.approvedRecipients)
        ? (body.approvedRecipients as string[])
        : [],
      approvedBeats: Array.isArray(body.approvedBeats)
        ? (body.approvedBeats as string[])
        : [],
      approvedChannels: Array.isArray(body.approvedChannels)
        ? (body.approvedChannels as string[])
        : ['internal_editorial_channel'],
      rollbackAuthority:
        typeof body.rollbackAuthority === 'string'
          ? body.rollbackAuthority
          : session.user.id,
    };
    beatRoutingService.authorizePhase2(auth);
  } else {
    beatRoutingService.deauthorizePhase2();
  }

  newsroomIntelligenceCore.persist();

  return NextResponse.json({
    action,
    phase2Active: beatRoutingService.isPhase2Active(),
    authorizedBy: session.user.id,
    timestamp: new Date().toISOString(),
  });
}
