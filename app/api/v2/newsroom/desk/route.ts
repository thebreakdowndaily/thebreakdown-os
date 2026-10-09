/**
 * ─── Newsroom Desk API Endpoint (Phase 3B-M5) ──────────────────────────────
 *
 * GET  /api/v2/newsroom/desk
 * POST /api/v2/newsroom/desk
 *
 * Governing documents:
 *   - AGENTS.md (Operating Doctrine)
 *   - Editorial Constitution (Article XI — Quality Gates & Verification)
 *   - NEWSROOM_INTELLIGENCE_OPERATING_STANDARD.md §21
 *
 * Role Gate:
 *   - Requires authenticated session with newsroom module access (minimum 'reporter').
 *   - Anonymous requests return 401 Unauthorized.
 *   - Unauthorized roles (guest) return 403 Forbidden.
 *   - Actor identity is derived strictly from the authenticated session (no spoofing).
 *   - Optimistic concurrency control via expectedVersion (409 Conflict).
 *   - Publication is strictly guarded (cannot publish stories via desk triage).
 */

import { NextRequest, NextResponse } from 'next/server';
import { guardIntelModule } from '@/features/auth/intel-server';
import { getSession } from '@/features/auth/auth-server';
import {
  newsroomDeskService,
  NewsroomDeskFilter,
  NewsroomDeskActionInput,
} from '@/services/intelligence/newsroom/desk-service';
import type {
  NewsroomTriageAction,
  NewsroomActionPayload,
  EditorialPriority,
  SignalLifecycleState,
  QueueSection,
} from '@/types/newsroom-intelligence';

export async function GET(req: NextRequest) {
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

  const userContext = {
    id: session.user.id,
    role: gate.role,
    name: session.user.name || gate.roleLabel,
  };

  const { searchParams } = new URL(req.url);

  try {
    // 1. Desk summary request
    if (searchParams.get('summary') === 'true' || searchParams.get('summary') === '1') {
      const summary = await newsroomDeskService.getDeskSummary(userContext);
      return NextResponse.json({
        summary,
        timestamp: new Date().toISOString(),
      });
    }

    // 2. Single desk item request
    const signalId = searchParams.get('signalId') || searchParams.get('id');
    if (signalId) {
      const item = await newsroomDeskService.getDeskItem(signalId, userContext);
      if (!item) {
        return NextResponse.json({ error: 'Desk item not found' }, { status: 404 });
      }
      return NextResponse.json({
        item,
        timestamp: new Date().toISOString(),
      });
    }

    // 3. Filtered desk queue list request
    const filters: NewsroomDeskFilter = {};

    const section = searchParams.get('section');
    if (section && [
      'BREAKING_P0',
      'P1_IMPORTANT',
      'DEVELOPING',
      'NEEDS_VERIFICATION',
      'CONTRADICTIONS',
      'COVERAGE_GAPS',
      'RESOLVED',
    ].includes(section)) {
      filters.section = section as QueueSection;
    }

    const priority = searchParams.get('priority');
    if (priority && ['P0', 'P1', 'P2', 'P3'].includes(priority)) {
      filters.priority = priority as EditorialPriority;
    }

    const workflowState = searchParams.get('workflowState') || searchParams.get('state');
    if (workflowState) {
      filters.workflowState = workflowState as SignalLifecycleState;
    }

    const beat = searchParams.get('beat');
    if (beat) {
      filters.beat = beat;
    }

    const geography = searchParams.get('geography') || searchParams.get('geo');
    if (geography) {
      filters.geography = geography;
    }

    const sourceId = searchParams.get('sourceId');
    if (sourceId) {
      filters.sourceId = sourceId;
    }

    const assignedTo = searchParams.get('assignedTo');
    if (assignedTo) {
      filters.assignedTo = assignedTo;
    }

    const changeType = searchParams.get('changeType');
    if (changeType && ['new', 'changed', 'unchanged'].includes(changeType)) {
      filters.changeType = changeType as 'new' | 'changed' | 'unchanged';
    }

    const needsVerification = searchParams.get('needsVerification');
    if (needsVerification !== null) {
      filters.needsVerification = needsVerification === 'true' || needsVerification === '1';
    }

    const hasContradictions = searchParams.get('hasContradictions');
    if (hasContradictions !== null) {
      filters.hasContradictions = hasContradictions === 'true' || hasContradictions === '1';
    }

    const since = searchParams.get('since');
    if (since) {
      filters.since = since;
    }

    const until = searchParams.get('until');
    if (until) {
      filters.until = until;
    }

    const limit = searchParams.get('limit');
    if (limit) {
      filters.limit = parseInt(limit, 10);
    }

    const offset = searchParams.get('offset');
    if (offset) {
      filters.offset = parseInt(offset, 10);
    }

    const response = await newsroomDeskService.getDeskItems(filters, userContext);
    return NextResponse.json({
      ...response,
      timestamp: new Date().toISOString(),
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    if (message.includes('Forbidden')) {
      return NextResponse.json({ error: message }, { status: 403 });
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
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

  const rawBody = (await req.json().catch(() => null)) as unknown;
  const body =
    rawBody && typeof rawBody === 'object'
      ? (rawBody as Record<string, unknown>)
      : {};

  const action = body.action as NewsroomTriageAction;
  if (typeof action !== 'string') {
    return NextResponse.json({ error: 'Missing action field' }, { status: 400 });
  }

  const signalId = body.signalId as string;
  if (typeof signalId !== 'string' || !signalId.trim()) {
    return NextResponse.json({ error: 'Missing or invalid signalId' }, { status: 400 });
  }

  const userContext = {
    id: session.user.id,
    role: gate.role,
    name: session.user.name || gate.roleLabel,
  };

  const payload: NewsroomDeskActionInput = {
    signalId,
    action,
    assignedTo: typeof body.assignedTo === 'string' ? body.assignedTo : undefined,
    note: typeof body.note === 'string' ? body.note : undefined,
    escalatedPriority: body.escalatedPriority as NewsroomDeskActionInput['escalatedPriority'],
    mutationId: typeof body.mutationId === 'string' ? body.mutationId : undefined,
    expectedVersion: typeof body.expectedVersion === 'number' ? body.expectedVersion : undefined,
  };

  try {
    const result = await newsroomDeskService.executeTriageAction(payload, userContext);
    return NextResponse.json({
      success: true,
      item: result.item,
      timestamp: new Date().toISOString(),
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Action execution failed';

    if (message.includes('Signal not found')) {
      return NextResponse.json({ error: message }, { status: 404 });
    }
    if (message.includes('Version conflict')) {
      return NextResponse.json({ error: message }, { status: 409 });
    }
    if (message.includes('Forbidden') || message.includes('not permitted')) {
      return NextResponse.json({ error: message }, { status: 403 });
    }

    return NextResponse.json({ error: message }, { status: 400 });
  }
}
