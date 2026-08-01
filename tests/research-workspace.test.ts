import { describe, it, expect } from 'vitest';
import { MemoryWorkspaceAdapter } from '../lib/workspace/workspace-store';
import { CHAPTER_1_FIX } from '../lib/editorial/chapter-1-data';

describe('TEST-WORKSPACE: Research Workspace (Phase 16B)', () => {
  it('TEST-WS-01: Manages Research Collections, Notes, and Tags', () => {
    const adapter = new MemoryWorkspaceAdapter();
    const state = adapter.getState();

    expect(state.collections.length).toBeGreaterThan(0);
    expect(state.schemaVersion).toBe('1.0.0');

    const note = adapter.addNote(CHAPTER_1_FIX.id, 'Test personal research observation.');
    expect(note.content).toBe('Test personal research observation.');
    expect(adapter.getState().notes.length).toBe(1);

    const tag = adapter.addTag(CHAPTER_1_FIX.id, '#procurement-reform');
    expect(tag.label).toBe('#procurement-reform');
    expect(adapter.getState().tags.length).toBe(1);
  });

  it('TEST-WS-02: Detects Canonical Drift on Superseded Objects', () => {
    const adapter = new MemoryWorkspaceAdapter();

    const normalReport = adapter.detectDrift('default-collection', [CHAPTER_1_FIX]);
    expect(normalReport[0].isSuperseded).toBe(false);

    const supersededFix = { ...CHAPTER_1_FIX, publicationStatus: 'superseded' as const, supersededByFixId: 'fix-newer-v2' };
    const driftReport = adapter.detectDrift('default-collection', [supersededFix]);
    expect(driftReport[0].isSuperseded).toBe(true);
    expect(driftReport[0].message).toContain('Superseded by fix-newer-v2');
  });

  it('TEST-WS-03: Compiles Evidence Dossiers (Markdown + RIS)', () => {
    const adapter = new MemoryWorkspaceAdapter();
    adapter.addNote(CHAPTER_1_FIX.id, 'Crucial procurement note.');

    const dossier = adapter.generateDossier('default-collection', [CHAPTER_1_FIX]);

    expect(dossier.meta.generator).toContain('The Breakdown Research Workspace');
    expect(dossier.markdownDossier).toContain('# Evidence Dossier:');
    expect(dossier.markdownDossier).toContain('Crucial procurement note.');
    expect(dossier.risBibliography).toContain('TY  - GOVT');
  });

  it('TEST-WS-04: Non-Mutation Guarantee on Canonical Objects', () => {
    const originalJson = JSON.stringify(CHAPTER_1_FIX);
    const adapter = new MemoryWorkspaceAdapter();
    adapter.addFixToCollection('default-collection', CHAPTER_1_FIX.id);
    adapter.addNote(CHAPTER_1_FIX.id, 'Note 1');
    adapter.addTag(CHAPTER_1_FIX.id, '#tag1');
    adapter.generateDossier('default-collection', [CHAPTER_1_FIX]);

    expect(JSON.stringify(CHAPTER_1_FIX)).toBe(originalJson);
  });
});
