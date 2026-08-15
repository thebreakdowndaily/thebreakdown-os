'use server';

import { revalidatePath } from 'next/cache';
import { getSession } from '@/features/auth/auth-server';
import { canAccessIntelModule, normalizeIntelRole, intelRoleLabel } from '@/features/auth/roles';
import { researchIntelligenceCore } from '@/services/intelligence/research';
import { ensureResearchRuntime } from '@/lib/intelligence/research-bootstrap';

// Governing document: docs/research/RESEARCH_INTELLIGENCE_OPERATING_STANDARD.md
// Server actions for the Research Intelligence workspace. Authorization happens
// HERE, server-side, before any mutation — there is no client-side security
// boundary. The core facade is the only mutation surface.

type ActionResult =
  | { success: true; message: string }
  | { success: false; error: string };

async function requireResearchActor(): Promise<{ ok: true; actor: { id: string; name: string } } | { ok: false; error: string }> {
  const session = await getSession();
  if (!session) {
    return { ok: false, error: 'You must be signed in to manage research projects.' };
  }
  const role = normalizeIntelRole(session.user.role);
  if (!canAccessIntelModule(role, 'research')) {
    return { ok: false, error: `Access denied. The ${intelRoleLabel(role)} role cannot manage research projects.` };
  }
  const name = session.user.name || session.user.email?.split('@')[0] || 'Researcher';
  return { ok: true, actor: { id: session.user.id, name } };
}

async function ensureRuntime(): Promise<ActionResult | null> {
  try {
    await ensureResearchRuntime();
    return null;
  } catch (e) {
    return { success: false, error: `Failed to initialise the research runtime: ${e instanceof Error ? e.message : 'unknown error'}` };
  }
}

export async function createResearchProjectActionCore(
  title: string,
  researchQuestion: string,
  description: string,
  actor: { id: string }
): Promise<ActionResult> {
  if (!title.trim() || !researchQuestion.trim()) {
    return { success: false, error: 'Title and research question are required.' };
  }
  const runtimeError = await ensureRuntime();
  if (runtimeError) return runtimeError;
  const project = researchIntelligenceCore.createProject({
    title: title.trim(),
    researchQuestion: researchQuestion.trim(),
    description: description.trim(),
    priority: 'P2',
    createdBy: actor.id,
  });
  revalidatePath('/intel/research/rie');
  revalidatePath(`/intel/research/rie/${project.id}`);
  return { success: true, message: `Research project "${project.title}" created.` };
}

export async function createResearchProjectAction(formData: FormData): Promise<void> {
  const auth = await requireResearchActor();
  if (!auth.ok) return;
  await createResearchProjectActionCore(
    String(formData.get('title') ?? '').trim(),
    String(formData.get('researchQuestion') ?? '').trim(),
    String(formData.get('description') ?? '').trim(),
    auth.actor
  );
}

export async function runPipelineActionCore(projectId: string, actor: { id: string }): Promise<ActionResult> {
  if (!projectId) return { success: false, error: 'Missing project id.' };
  const runtimeError = await ensureRuntime();
  if (runtimeError) return runtimeError;
  if (!researchIntelligenceCore.getProject(projectId)) {
    return { success: false, error: 'Project not found.' };
  }
  const run = await researchIntelligenceCore.runPipeline(projectId, { triggeredBy: actor.id });
  revalidatePath(`/intel/research/rie/${projectId}`);
  if (run.status === 'FAILED') {
    return { success: false, error: `Pipeline failed: ${run.errors[0] ?? 'unknown error'}` };
  }
  const message =
    run.status === 'PARTIAL'
      ? `Run completed with errors (${String(run.errors.length)}). ${String(run.sourcesFetched)} sources, ${String(run.claimsExtracted)} claims, ${String(run.contradictionsFound)} contradiction(s).`
      : `Run completed. ${String(run.sourcesFetched)} sources, ${String(run.claimsExtracted)} claims, ${String(run.contradictionsFound)} contradiction(s).`;
  return { success: true, message };
}

export async function runPipelineAction(formData: FormData): Promise<void> {
  const auth = await requireResearchActor();
  if (!auth.ok) return;
  await runPipelineActionCore(String(formData.get('projectId') ?? '').trim(), auth.actor);
}

export async function generateStoryBriefActionCore(projectId: string, actor: { id: string }): Promise<ActionResult> {
  if (!projectId) return { success: false, error: 'Missing project id.' };
  const runtimeError = await ensureRuntime();
  if (runtimeError) return runtimeError;
  if (!researchIntelligenceCore.getProject(projectId)) {
    return { success: false, error: 'Project not found.' };
  }
  const brief = researchIntelligenceCore.generateStoryBrief(projectId, actor.id);
  if (!brief) {
    return { success: false, error: 'Brief generation failed.' };
  }
  revalidatePath(`/intel/research/rie/${projectId}`);
  return { success: true, message: `Story brief generated with ${String(brief.keyClaims.length)} key claims.` };
}

export async function generateStoryBriefAction(formData: FormData): Promise<void> {
  const auth = await requireResearchActor();
  if (!auth.ok) return;
  await generateStoryBriefActionCore(String(formData.get('projectId') ?? '').trim(), auth.actor);
}
