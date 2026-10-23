import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Principal } from '../features/auth/principal';
import { canPreviewUnpublishedStory } from '../lib/story/preview-authorization';
import { readFileSync } from 'node:fs';
import path from 'node:path';

function principal(role: Principal['role'], status: Principal['status'] = 'active'): Principal {
  return {
    userId: `test-${role}`,
    email: `${role}@example.test`,
    name: role,
    role,
    isSuperAdmin: false,
    status,
    organizationId: null,
  };
}

describe('unpublished story preview authorization', () => {
  it.each([
    ['anonymous caller', null],
    ['guest account', principal('guest')],
    ['reporter account', principal('reporter')],
    ['suspended editor', principal('editor', 'suspended')],
  ] as const)('denies draft preview to %s', (_label, caller) => {
    expect(canPreviewUnpublishedStory(caller)).toBe(false);
  });

  it.each([
    ['editor', principal('editor')],
    ['managing editor', principal('managing_editor')],
    ['owner', principal('owner')],
  ] as const)('allows active editorial role: %s', (_label, caller) => {
    expect(canPreviewUnpublishedStory(caller)).toBe(true);
  });

  it('ensures the story page applies the shared policy before rendering a private story', () => {
    const pagePath = path.join(process.cwd(), 'app/story/[slug]/page.tsx');
    const pageSource = readFileSync(pagePath, 'utf8');
    expect(pageSource).toContain('if (!canPreviewUnpublishedStory(principal)) notFound();');
    expect(pageSource).toContain('if (!isCanonicalStoryPublic(canonicalStory))');
  });
});
