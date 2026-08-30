// src: types/citation.ts
/**
 * Citation represents an external reference linked to a story, claim, or other knowledge object.
 * It is editor‑managed; editors create, approve, or reject citations.
 * A citation may reference an existing Source record (by sourceId) or contain its own
 * minimal metadata when no Source exists yet.
 */
export interface Citation {
  /** Unique identifier (UUID) */
  id: string;
  /** The slug of the story this citation belongs to */
  storySlug: string;
  /** Human‑readable title of the cited work */
  title: string;
  /** URL to the external resource */
  url: string;
  /** Date the editor accessed the resource (ISO‑8601) */
  accessedAt: string;
  /** Confidence tier (1–5) assigned by the editor */
  tier: number;
  /** Optional reference to an existing Source record */
  sourceId?: string;
  /** Optional archival hash of the captured snapshot */
  archiveHash?: string;
  /** Publication status – only approved citations are public */
  status: 'pending' | 'approved' | 'rejected';
  /** Optional short description or annotation */
  note?: string;
  /** Timestamps */
  createdAt: string;
  updatedAt: string;
}
