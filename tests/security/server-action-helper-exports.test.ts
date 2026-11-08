import * as fs from 'node:fs';
import * as path from 'node:path';
import { describe, expect, it } from 'vitest';

describe('Next.js server action helper visibility', () => {
  const actionModules = [
    'app/intel/research/rie/actions.ts',
    'app/intel/story-builder/actions.ts',
    'app/intel/verification/actions.ts',
  ];

  it('does not export internal ActionCore helpers from use-server modules', () => {
    for (const relativePath of actionModules) {
      const source = fs.readFileSync(path.resolve(process.cwd(), relativePath), 'utf8');
      expect(source, relativePath).toMatch(/^['"]use server['"];?/m);
      expect(source, relativePath).not.toMatch(/export\s+(?:async\s+)?function\s+\w*ActionCore\b/);
    }
  });

  it('keeps the intended form-action entry points exported', () => {
    const verification = fs.readFileSync(
      path.resolve(process.cwd(), 'app/intel/verification/actions.ts'),
      'utf8'
    );
    expect(verification).toMatch(/export async function transitionVerificationAction\(/);
    expect(verification).toMatch(/export async function assignVerificationReviewerAction\(/);
    expect(verification).toMatch(/export async function addVerificationNoteAction\(/);
  });
});
