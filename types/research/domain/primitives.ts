/**
 * Primitives for the Research Domain
 * 
 * Shared foundational types that enforce methodological rigor across 
 * all canonical research entities.
 */

// 1. Identifiers

/** UUIDv4 internal primary key for the database */
export type InternalPrimaryKey = string & { __brand: "InternalPrimaryKey" };

/** 
 * Stable public identity assigned by the platform 
 * e.g. UP-AC-001
 */
export type CanonicalResearchId = string & { __brand: "CanonicalResearchId" };

/** 
 * Identifiers from external systems 
 * e.g. ECI candidate ID, UP Govt Tender ID
 */
export type ExternalIdentifier = string & { __brand: "ExternalIdentifier" };

/** Human readable routing ID */
export type Slug = string & { __brand: "Slug" };


// 2. Bitemporal Core

/** 
 * Enforces true bitemporal semantics. 
 * validFrom/validTo represents when the fact was true in the real world.
 * systemFrom/systemTo represents when the platform knew about this fact.
 * 
 * Interval semantics: [start, end)
 */
export interface BitemporalInterval {
  validFrom: string; // ISO8601 Date or DateTime
  validTo: string | null;
  systemFrom: string; // ISO8601 DateTime
  systemTo: string | null;
}

// 3. Provenance & Audit

/** Audit trail of system execution. Not to be confused with Evidentiary Provenance. */
export interface SystemProvenance {
  createdByUserId: InternalPrimaryKey;
  createdAt: string; // ISO8601
  updatedByUserId?: InternalPrimaryKey;
  updatedAt?: string; // ISO8601
  ingestionMethod: 'MANUAL' | 'AUTOMATED_PIPELINE' | 'BULK_IMPORT';
  aiAssisted?: boolean;
}

/** Ties a record to its underlying claims and evidence */
export interface EvidenceProvenance {
  supportingClaimIds: InternalPrimaryKey[];
  methodologyVersion: string; // e.g. '1.0'
}

/** Operational tracking of human verification */
export interface HumanReviewMetadata {
  reviewedByUserId?: InternalPrimaryKey;
  reviewedAt?: string;
  humanReviewStatus: 'UNREVIEWED' | 'IN_REVIEW' | 'APPROVED' | 'REJECTED';
}

/** Operational tracking of publication lifecycle */
export interface PublicationMetadata {
  publicationStatus: 'DRAFT' | 'READY_FOR_PUBLICATION' | 'PUBLISHED' | 'ARCHIVED' | 'WITHDRAWN';
  publishedAt?: string;
  publishedByUserId?: InternalPrimaryKey;
  archivedAt?: string;
  withdrawalReason?: string;
}

/** Generic value availability to distinguish unknown from zero */
export type ValueAvailabilityStatus = 
  | 'KNOWN'
  | 'UNKNOWN'
  | 'NOT_FOUND'
  | 'WITHHELD'
  | 'NOT_REPORTED'
  | 'NOT_APPLICABLE';

/** Operational freshness metrics */
export interface FreshnessMetadata {
  lastVerifiedAt: string;
  nextCheckDueAt?: string;
  freshnessStatus: 'FRESH' | 'MONITORING' | 'CHANGED' | 'REVIEW_REQUIRED' | 'STALE';
}
