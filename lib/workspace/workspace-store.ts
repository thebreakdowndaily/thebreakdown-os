// ── Research Workspace Domain & Storage Abstraction (Phase 16B) ───────────────
// Manages non-mutating client workspace state (collections, reading lists, notes, tags).
// Enforces 0 mutation on canonical Knowledge Objects.

import { Fix, Claim } from '../../types/canonical';

export interface WorkspaceNote {
  id: string;
  targetId: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface WorkspaceTag {
  id: string;
  targetId: string;
  label: string;
}

export interface SavedCollection {
  id: string;
  name: string;
  description: string;
  fixIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface WorkspaceState {
  schemaVersion: string;
  createdAt: string;
  updatedAt: string;
  collections: SavedCollection[];
  readingList: string[]; // Fix IDs in sequence
  notes: WorkspaceNote[];
  tags: WorkspaceTag[];
}

export interface DossierExportPackage {
  meta: {
    exportTimestamp: string;
    workspaceVersion: string;
    schemaVersion: string;
    generator: string;
  };
  collectionName: string;
  fixes: Array<{
    id: string;
    title: string;
    slug: string;
    primaryCategory?: string;
    evidenceGrade?: string;
    isSuperseded: boolean;
  }>;
  notes: WorkspaceNote[];
  tags: WorkspaceTag[];
  markdownDossier: string;
  risBibliography: string;
}

export class MemoryWorkspaceAdapter {
  private state: WorkspaceState;

  constructor(initialState?: Partial<WorkspaceState>) {
    this.state = {
      schemaVersion: '1.0.0',
      createdAt: initialState?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      collections: initialState?.collections || [
        {
          id: 'default-collection',
          name: 'Strategic Autonomy Research 1947–1962',
          description: 'Foundational research collection covering defense procurement, non-alignment, and border crises.',
          fixIds: ['fix-strategic-autonomy-recalibration'],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
      readingList: initialState?.readingList || ['fix-strategic-autonomy-recalibration'],
      notes: initialState?.notes || [],
      tags: initialState?.tags || [],
    };
  }

  public getState(): WorkspaceState {
    return { ...this.state };
  }

  public addFixToCollection(collectionId: string, fixId: string): WorkspaceState {
    const col = this.state.collections.find((c) => c.id === collectionId);
    if (col && !col.fixIds.includes(fixId)) {
      col.fixIds.push(fixId);
      col.updatedAt = new Date().toISOString();
      this.state.updatedAt = new Date().toISOString();
    }
    return this.getState();
  }

  public addNote(targetId: string, content: string): WorkspaceNote {
    const note: WorkspaceNote = {
      id: `note-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      targetId,
      content,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.state.notes.push(note);
    this.state.updatedAt = new Date().toISOString();
    return note;
  }

  public addTag(targetId: string, label: string): WorkspaceTag {
    const tag: WorkspaceTag = {
      id: `tag-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      targetId,
      label,
    };
    this.state.tags.push(tag);
    this.state.updatedAt = new Date().toISOString();
    return tag;
  }

  /**
   * Detects canonical drift between saved collection references and active domain state.
   */
  public detectDrift(collectionId: string, fixes: Fix[]): Array<{ fixId: string; isSuperseded: boolean; message: string }> {
    const col = this.state.collections.find((c) => c.id === collectionId);
    if (!col) return [];

    return col.fixIds.map((fixId) => {
      const active = fixes.find((f) => f.id === fixId);
      if (!active) {
        return { fixId, isSuperseded: false, message: 'Object missing from active repository.' };
      }
      if (active.publicationStatus === 'superseded') {
        return { fixId, isSuperseded: true, message: `Superseded by ${active.supersededByFixId || 'newer version'}.` };
      }
      return { fixId, isSuperseded: false, message: 'Canonical state up-to-date.' };
    });
  }

  /**
   * Compiles reproducible Evidence Dossiers (Markdown + RIS + JSON).
   */
  public generateDossier(collectionId: string, fixes: Fix[]): DossierExportPackage {
    const col = this.state.collections.find((c) => c.id === collectionId) || this.state.collections[0];
    const targetFixes = fixes.filter((f) => col.fixIds.includes(f.id));

    const markdownLines: string[] = [
      `# Evidence Dossier: ${col.name}`,
      `*Generated on ${new Date().toISOString()} via The Breakdown Knowledge Platform (v1.0.0)*`,
      `**Description:** ${col.description}`,
      '',
      '## Included Knowledge Objects',
      ...targetFixes.map((f) => `- **${f.title || f.headline}** (${f.id}) — Grade: ${f.evidenceGrade || 'N/A'}`),
      '',
      '## Personal Notes & Observations',
      ...this.state.notes.filter((n) => col.fixIds.includes(n.targetId)).map((n) => `- [${n.targetId}] ${n.content}`),
    ];

    const risLines: string[] = targetFixes.map((f) => [
      'TY  - GOVT',
      `TI  - ${f.title || f.headline}`,
      'AU  - The Breakdown Editorial Bureau',
      `PY  - 2026`,
      `UR  - https://thebreakdown.gov/fix/${f.slug}`,
      'ER  -',
    ].join('\n'));

    return {
      meta: {
        exportTimestamp: new Date().toISOString(),
        workspaceVersion: '1.0.0',
        schemaVersion: this.state.schemaVersion,
        generator: 'The Breakdown Research Workspace Export Engine',
      },
      collectionName: col.name,
      fixes: targetFixes.map((f) => ({
        id: f.id,
        title: f.title || f.headline || '',
        slug: f.slug,
        primaryCategory: f.primaryCategory,
        evidenceGrade: f.evidenceGrade,
        isSuperseded: f.publicationStatus === 'superseded',
      })),
      notes: this.state.notes.filter((n) => col.fixIds.includes(n.targetId)),
      tags: this.state.tags.filter((t) => col.fixIds.includes(t.targetId)),
      markdownDossier: markdownLines.join('\n'),
      risBibliography: risLines.join('\n\n'),
    };
  }
}
