/**
 * lib/seo/geo-evidence.ts
 * The Breakdown OS — Formal GEO Evidence Attribution Model
 * 
 * Implements:
 * 1. Atomic Evidence Status Model (NOT_TESTED, OBSERVED, SUPPORTED, CONFIRMED, CONTRADICTED)
 * 2. Independent Index Evidence States (INDEXED_CONFIRMED, NOT_INDEXED_CONFIRMED, INDEX_STATUS_UNKNOWN)
 * 3. Decoupled Pipeline Stages: INDEX -> RETRIEVAL -> INGESTION -> MENTION -> CITATION -> GROUNDING
 * 4. Semantic Content Gap Evaluation (Query-Requirements Model & intent_coverage_rate)
 * 5. Two Independent Scores: LOCAL READINESS (0-100) vs EXTERNAL RETRIEVAL (0-100 or null)
 * 6. Evidence-based Diagnostic Confidence (0.00 to 1.00)
 * 7. Resolution paths: missing_evidence[] and resolution_test[]
 * 8. State Transitions with historical provenance
 * 
 * Governing documents:
 *   - docs/aeo-geo/architecture.md (Phase 12)
 *   - docs/aeo-geo/diagnostic-attribution-framework.md
 *   - Editorial Constitution §XIII (transparency & defensibility)
 */

import fs from 'node:fs';
import path from 'node:path';
import type { AIEngine, FailureClassification, RetrievalIntent } from './geo-measurement';

export type EvidenceSignalStatus =
  | 'NOT_TESTED'
  | 'OBSERVED'
  | 'SUPPORTED'
  | 'CONFIRMED'
  | 'CONTRADICTED';

export type EvidenceMethod =
  | 'http_probe'
  | 'html_parse'
  | 'schema_validator'
  | 'search_api'
  | 'gsc_inspection'
  | 'manual_inspection'
  | 'static_analysis';

export interface EvidenceSignal<T = any> {
  signal: string;
  value: T;
  source: string | null;
  timestamp: string;
  method: EvidenceMethod;
  status: EvidenceSignalStatus;
  confidence: number; // 0.00 to 1.00
  notes?: string;
}

export type IndexEvidenceState =
  | 'INDEXED_CONFIRMED'
  | 'NOT_INDEXED_CONFIRMED'
  | 'INDEX_STATUS_UNKNOWN';

export type SearchRetrievalState =
  | 'RETRIEVED'
  | 'NOT_RETRIEVED'
  | 'RETRIEVAL_UNKNOWN';

export type LLMIngestionState =
  | 'INGESTED'
  | 'NOT_INGESTED'
  | 'INGESTION_UNKNOWN';

export type MentionState =
  | 'MENTIONED'
  | 'NOT_MENTIONED'
  | 'MENTION_UNKNOWN';

export type CitationState =
  | 'CITING_CORRECT_CANONICAL'
  | 'CITING_INCORRECT_URL'
  | 'UNCITED'
  | 'CITATION_UNKNOWN';

export type ClaimGroundingState =
  | 'GROUNDED'
  | 'PARTIALLY_GROUNDED'
  | 'UNSUPPORTED'
  | 'CONTRADICTED'
  | 'GROUNDING_UNKNOWN';

export type RequirementStatus = 'PRESENT' | 'PARTIAL' | 'ABSENT' | 'UNKNOWN';

export interface InformationUnitRequirement {
  id: string;
  description: string;
  weight: number;
  status: RequirementStatus;
  matchedTerms?: string[];
  evidenceSnippet?: string;
  notes?: string;
}

export interface QueryRequirementsDoc {
  queryId: string;
  query: string;
  targetSlug: string;
  requirements: Array<{ id: string; description: string; weight: number }>;
}

export type QueryVariantType =
  | 'natural'
  | 'specific'
  | 'entity'
  | 'question_formulation'
  | 'source_seeking'
  | 'navigational';

export interface QueryVariant {
  variantId: string;
  queryId: string;
  query: string;
  variantType: QueryVariantType;
  intent: RetrievalIntent;
  expectedInformationUnits: string[];
}

export interface DiagnosticTransition {
  previousDiagnosis?: FailureClassification;
  newDiagnosis: FailureClassification;
  evidence: string;
  timestamp: string;
  diagnosticVersion: string;
}

export interface GEODiagnosticAssessment {
  id?: string;
  assessmentVersion: string;
  queryId: string;
  variantId?: string;
  targetUrl: string;
  engine: AIEngine;
  surface: string;
  model?: string;
  region: string;
  language: string;
  indexStatus: IndexEvidenceState;
  searchRetrieval: SearchRetrievalState;
  llmIngestion: LLMIngestionState;
  mentionStatus: MentionState;
  citationStatus: CitationState;
  claimGrounding: ClaimGroundingState;
  localReadinessScore: number;
  local_evidence_readiness?: number; // Explicit decoupled score alias (LOCAL_EVIDENCE_READINESS)
  externalRetrievalScore: number | null;
  googleIndexStatus?: IndexEvidenceState;
  bingIndexStatus?: IndexEvidenceState;
  intentCoverageRate: number;
  queryRequirements: InformationUnitRequirement[];
  evidenceSignals: EvidenceSignal[];
  diagnosis: FailureClassification;
  confidence: number;
  missingEvidence: string[];
  resolutionTest: string[];
  previousDiagnosis?: FailureClassification;
  transitionEvidence?: string;
  assessedAt: string;
}

/**
 * Loads query requirements from canonical JSON
 */
export function loadQueryRequirements(): QueryRequirementsDoc[] {
  const filePath = path.resolve(process.cwd(), 'data/geo-query-requirements.json');
  if (!fs.existsSync(filePath)) {
    throw new Error(`Query requirements file not found at: ${filePath}`);
  }
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

/**
 * Loads query variants from canonical JSON
 */
export function loadQueryVariants(): QueryVariant[] {
  const filePath = path.resolve(process.cwd(), 'data/geo-query-variants.json');
  if (!fs.existsSync(filePath)) {
    throw new Error(`Query variants file not found at: ${filePath}`);
  }
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

/**
 * Evaluates semantic content coverage by matching required information units against rendered document body.
 * Returns intent_coverage_rate (0.00 to 100.00) and atomic requirement status.
 */
export function evaluateSemanticContentCoverage(
  docText: string,
  reqs: Array<{ id: string; description: string; weight: number }>
): { coverageRate: number; results: InformationUnitRequirement[] } {
  const textLower = docText.toLowerCase();
  const stopwords = new Set([
    'what', 'is', 'the', 'and', 'how', 'does', 'in', 'of', 'for', 'to', 'a',
    'an', 'are', 'between', 'across', 'was', 'with', 'by', 'at', 'from', 'on',
    'under', 'or', 'as', 'its', 'their', 'that', 'this', 'these', 'into'
  ]);

  let totalWeight = 0;
  let earnedWeight = 0;
  const results: InformationUnitRequirement[] = [];

  for (const r of reqs) {
    totalWeight += r.weight;
    // Extract substantive terms from requirement description
    const terms = r.description
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .split(/\s+/)
      .filter((w) => w.length > 2 && !stopwords.has(w));
    
    const uniqueTerms = Array.from(new Set(terms));
    const matchedTerms = uniqueTerms.filter((term) => textLower.includes(term));
    const matchRatio = uniqueTerms.length > 0 ? matchedTerms.length / uniqueTerms.length : 0;

    let status: RequirementStatus = 'ABSENT';
    if (matchRatio >= 0.6) {
      status = 'PRESENT';
      earnedWeight += r.weight;
    } else if (matchRatio >= 0.3) {
      status = 'PARTIAL';
      earnedWeight += r.weight * 0.5;
    }

    results.push({
      id: r.id,
      description: r.description,
      weight: r.weight,
      status,
      matchedTerms,
      notes: `${matchedTerms.length}/${uniqueTerms.length} terms matched (${Math.round(matchRatio * 100)}%)`,
    });
  }

  const coverageRate = totalWeight > 0 ? Number(((earnedWeight / totalWeight) * 100).toFixed(2)) : 0;
  return { coverageRate, results };
}

/**
 * Calculates Local Readiness Score (0.00 - 100.00)
 * Decoupled from external search performance.
 * Measures technical health, canonical correctness, schema markup, and content completeness.
 */
export function calculateLocalReadiness(signals: Record<string, EvidenceSignal>): number {
  let score = 0;

  // 1. HTTP Reachability (15 pts)
  if (signals.http_status?.value === 200 && signals.http_status?.status === 'CONFIRMED') {
    score += 15;
  }

  // 2. Robots & Sitemaps permission (15 pts)
  if (signals.robots_permission?.value === true && signals.sitemap_declared?.value === true) {
    score += 15;
  }

  // 3. Canonical tag integrity (15 pts)
  if (signals.canonical_match?.value === true && signals.canonical_match?.status === 'CONFIRMED') {
    score += 15;
  }

  // 4. Schema.org JSON-LD validity & NewsArticle presence (20 pts)
  if (signals.schema_validity?.value === true && signals.schema_validity?.status === 'CONFIRMED') {
    score += 20;
  }

  // 5. Primary source backing (15 pts)
  if (typeof signals.primary_sources_count?.value === 'number' && signals.primary_sources_count.value > 0) {
    score += 15;
  }

  // 6. Semantic Intent Coverage Rate (20 pts)
  const coverageRate = Number(signals.intent_coverage_rate?.value) || 0;
  score += Number(((coverageRate / 100) * 20).toFixed(2));

  return Number(Math.min(100, Math.max(0, score)).toFixed(2));
}

/**
 * Evaluates the Diagnostic Attribution based on explicit forensic evidence.
 * Strict Rule: Never assign INDEXING_DISCOVERY_GAP or RANKING_RETRIEVAL_GAP without empirical index status.
 */
export function diagnoseEvidenceAttribution(
  stages: {
    indexStatus: IndexEvidenceState;
    searchRetrieval: SearchRetrievalState;
    mentionStatus: MentionState;
    citationStatus: CitationState;
    claimGrounding: ClaimGroundingState;
  },
  localReadiness: number,
  intentCoverage: number,
  signals: Record<string, EvidenceSignal>
): {
  diagnosis: FailureClassification;
  confidence: number;
  missingEvidence: string[];
  resolutionTest: string[];
} {
  const missingEvidence: string[] = [];
  const resolutionTest: string[] = [];

  // Check 1: Citation outcomes
  if (stages.citationStatus === 'CITING_CORRECT_CANONICAL' || stages.citationStatus === 'CITING_INCORRECT_URL') {
    if (stages.citationStatus === 'CITING_INCORRECT_URL') {
      // Scenario A: Clean redirect to canonical exists and is confirmed
      if (signals.canonical_redirect?.value === true || signals.canonical_redirect?.status === 'CONFIRMED') {
        return {
          diagnosis: 'CITATION_REDIRECT_RESOLVED',
          confidence: 0.90,
          missingEvidence: [],
          resolutionTest: ['Confirm LLM follows HTTP 301/308 redirect to canonical target'],
        };
      }

      // Scenario B: Canonical conflict (target canonical mismatches or conflict flag set)
      if (
        signals.canonical_conflict?.value === true ||
        signals.canonical_conflict?.status === 'CONFIRMED' ||
        signals.canonical_match?.value === false
      ) {
        return {
          diagnosis: 'CANONICALIZATION_GAP',
          confidence: 0.95,
          missingEvidence: [],
          resolutionTest: ['Verify canonical tag and internal redirect chains to point exclusively to canonical URL'],
        };
      }

      // Scenario C: Alternate representation (syndication / feed / print version cited)
      if (
        signals.alternate_representation?.value === true ||
        signals.alternate_representation?.status === 'CONFIRMED'
      ) {
        return {
          diagnosis: 'CITATION_SELECTION_GAP',
          confidence: 0.85,
          missingEvidence: [],
          resolutionTest: ['Ensure alternate representation includes rel=canonical to primary story'],
        };
      }

      // Scenario D: Unknown canonical relationship
      if (signals.canonical_relation?.value === 'unknown' || signals.canonical_relation?.status === 'NOT_TESTED') {
        return {
          diagnosis: 'UNKNOWN_INSUFFICIENT_EVIDENCE',
          confidence: 0.35,
          missingEvidence: ['Redirect trace and canonical tag comparison on cited URL'],
          resolutionTest: ['Inspect HTTP headers and HTML rel=canonical on cited URL'],
        };
      }

      // Default fallback for incorrect citation
      return {
        diagnosis: 'CANONICALIZATION_GAP',
        confidence: 0.90,
        missingEvidence: [],
        resolutionTest: ['Verify canonical tag and internal redirect chains'],
      };
    }

    if (stages.claimGrounding === 'CONTRADICTED') {
      return {
        diagnosis: 'REPRESENTATION_GAP',
        confidence: 0.90,
        missingEvidence: [],
        resolutionTest: ['Audit LLM hallucination and adjust executive summary clarity'],
      };
    }
    if (stages.claimGrounding === 'UNSUPPORTED') {
      return {
        diagnosis: 'EVIDENCE_GAP',
        confidence: 0.80,
        missingEvidence: ['Primary evidentiary documentation for stated claim'],
        resolutionTest: ['Add primary source citation block to story'],
      };
    }
    return {
      diagnosis: 'UNKNOWN_INSUFFICIENT_EVIDENCE',
      confidence: 1.0,
      missingEvidence: [],
      resolutionTest: [],
    };
  }

  // Check 2: Authority evaluation (Mention without citation or competitor displacement)
  const competitorObserved =
    signals.competitor_displacement?.status === 'OBSERVED' ||
    signals.competitor_displacement?.value !== undefined;
  const hasAuthorityEvidence =
    signals.authority_gap_evidence?.value === true ||
    signals.authority_gap_evidence?.status === 'CONFIRMED' ||
    signals.backlink_gap?.status === 'CONFIRMED' ||
    signals.domain_rating_gap?.status === 'CONFIRMED' ||
    signals.authority_metrics?.status === 'CONFIRMED';

  if (stages.mentionStatus === 'MENTIONED' && stages.citationStatus === 'UNCITED') {
    if (competitorObserved || hasAuthorityEvidence) {
      return {
        diagnosis: 'AUTHORITY_GAP',
        confidence: 0.75,
        missingEvidence: ['Competitor backlink profile and domain rating audit'],
        resolutionTest: ['Monitor institutional citation displacement in SERPs'],
      };
    }
    return {
      diagnosis: 'AUTHORITY_GAP',
      confidence: 0.60,
      missingEvidence: ['Referring domain authority and anchor text telemetry'],
      resolutionTest: ['Build authoritative institutional citations and backlinks'],
    };
  }

  // Competitor cited while The Breakdown is unretrieved/unmentioned
  if (competitorObserved && stages.citationStatus === 'UNCITED') {
    if (hasAuthorityEvidence) {
      return {
        diagnosis: 'AUTHORITY_GAP',
        confidence: 0.80,
        missingEvidence: [],
        resolutionTest: ['Build authoritative institutional citations and high-impact referring backlinks'],
      };
    }
    // Hardening rule: Competitor citation without measured authority evidence remains UNKNOWN
    if (stages.indexStatus === 'INDEX_STATUS_UNKNOWN' || stages.searchRetrieval === 'NOT_RETRIEVED') {
      return {
        diagnosis: 'UNKNOWN_INSUFFICIENT_EVIDENCE',
        confidence: 0.35,
        missingEvidence: [
          'Independent authority telemetry (backlink profile comparison, referring domain authority, longitudinal SERP displacement)'
        ],
        resolutionTest: [
          'Collect comparative backlink metrics via external authority provider or OpenAlex citation graph'
        ],
      };
    }
  }

  // Check 3: Technical failure blocks (Local proof)
  if (signals.http_status?.value !== 200 || signals.robots_permission?.value === false || signals.x_robots_tag?.value === 'noindex') {
    return {
      diagnosis: 'INDEXING_DISCOVERY_GAP',
      confidence: 0.95,
      missingEvidence: [],
      resolutionTest: ['Fix server 4xx/5xx errors or remove noindex / robots block'],
    };
  }

  if (signals.canonical_match?.value === false) {
    return {
      diagnosis: 'CANONICALIZATION_GAP',
      confidence: 0.90,
      missingEvidence: [],
      resolutionTest: ['Fix self-referential canonical tag mismatch on target route'],
    };
  }

  if (signals.schema_validity?.value === false) {
    return {
      diagnosis: 'STRUCTURED_DATA_GAP',
      confidence: 0.90,
      missingEvidence: [],
      resolutionTest: ['Fix Schema.org JSON-LD syntax errors or missing required fields'],
    };
  }

  if (intentCoverage < 40) {
    return {
      diagnosis: 'CONTENT_GAP',
      confidence: 0.85,
      missingEvidence: ['Substantive information units answering query intent'],
      resolutionTest: ['Expand editorial coverage to address missing information units'],
    };
  }

  // Check 4: Engine-specific behaviors
  if (signals.engine_behavior?.status === 'OBSERVED') {
    const val = String(signals.engine_behavior.value);
    if (val.includes('refusal') || val.includes('guardrail') || val.includes('policy')) {
      return {
        diagnosis: 'ENGINE_SPECIFIC_BEHAVIOR',
        confidence: 0.85,
        missingEvidence: [],
        resolutionTest: ['Audit query formulation against engine content moderation policies'],
      };
    }
  }

  // Check 5: Empirical External Index Status
  const isConfirmedNotIndexed =
    stages.indexStatus === 'NOT_INDEXED_CONFIRMED' ||
    signals.google_index_status?.value === 'NOT_INDEXED_CONFIRMED' ||
    signals.bing_index_status?.value === 'NOT_INDEXED_CONFIRMED';

  if (isConfirmedNotIndexed) {
    return {
      diagnosis: 'INDEXING_DISCOVERY_GAP',
      confidence: 0.95,
      missingEvidence: [],
      resolutionTest: ['Submit URL for indexing via Google Search Console / IndexNow'],
    };
  }

  const isConfirmedIndexed =
    stages.indexStatus === 'INDEXED_CONFIRMED' ||
    signals.google_index_status?.value === 'INDEXED_CONFIRMED';

  if (isConfirmedIndexed && stages.searchRetrieval === 'NOT_RETRIEVED') {
    return {
      diagnosis: 'RANKING_RETRIEVAL_GAP',
      confidence: 0.80,
      missingEvidence: ['SERP position telemetry and top-10 RAG snippet selection logs'],
      resolutionTest: ['Optimize title, semantic headings, and lead paragraph for relevance'],
    };
  }

  // Check 6: Unobserved with Index Status Unknown (The T0 Ground Truth)
  if (stages.indexStatus === 'INDEX_STATUS_UNKNOWN' && stages.searchRetrieval === 'NOT_RETRIEVED') {
    missingEvidence.push(
      'Google Search Console URL Inspection API telemetry',
      'Bing Webmaster Tools index coverage status',
      'Real-time SERP position data for target query',
      'Crawler bot edge log access verification'
    );
    resolutionTest.push(
      'Query Google Search Console URL Inspection for canonical URL',
      'Verify whether Googlebot has crawled the URL post-deployment',
      'Measure SERP position of competing institutional domains'
    );

    return {
      diagnosis: 'UNKNOWN_INSUFFICIENT_EVIDENCE',
      confidence: 0.30, // Low confidence in any specific cause because index telemetry is missing
      missingEvidence,
      resolutionTest,
    };
  }

  // Default Fallback
  return {
    diagnosis: 'UNKNOWN_INSUFFICIENT_EVIDENCE',
    confidence: 0.20,
    missingEvidence: ['External index and retrieval telemetry'],
    resolutionTest: ['Collect longitudinal search and LLM citation observations'],
  };
}

export interface ExternalEvidenceImportRecord {
  queryId: string;
  targetUrl: string;
  engine?: string;
  source: string;
  timestamp?: string;
  googleIndexStatus?: IndexEvidenceState;
  bingIndexStatus?: IndexEvidenceState;
  searchRetrieval?: SearchRetrievalState;
  mentionStatus?: MentionState;
  citationStatus?: CitationState;
  claimGrounding?: ClaimGroundingState;
  authorityEvidence?: {
    backlinkGapConfirmed?: boolean;
    domainRatingGapConfirmed?: boolean;
    notes?: string;
  };
  canonicalRelation?: 'match' | 'redirect_resolved' | 'conflict' | 'alternate_representation' | 'unknown';
  notes?: string;
}

const VALID_INDEX_STATES = new Set<IndexEvidenceState>([
  'INDEXED_CONFIRMED',
  'NOT_INDEXED_CONFIRMED',
  'INDEX_STATUS_UNKNOWN',
]);

const VALID_RETRIEVAL_STATES = new Set<SearchRetrievalState>([
  'RETRIEVED',
  'NOT_RETRIEVED',
  'RETRIEVAL_UNKNOWN',
]);

const VALID_MENTION_STATES = new Set<MentionState>([
  'MENTIONED',
  'NOT_MENTIONED',
  'MENTION_UNKNOWN',
]);

const VALID_CITATION_STATES = new Set<CitationState>([
  'CITING_CORRECT_CANONICAL',
  'CITING_INCORRECT_URL',
  'UNCITED',
  'CITATION_UNKNOWN',
]);

const VALID_GROUNDING_STATES = new Set<ClaimGroundingState>([
  'GROUNDED',
  'PARTIALLY_GROUNDED',
  'UNSUPPORTED',
  'CONTRADICTED',
  'GROUNDING_UNKNOWN',
]);

/**
 * Validates an imported operator-assisted external evidence record.
 * Rejects malformed structures, missing queryId/targetUrl/provenance, or invalid states.
 */
export function validateExternalEvidenceImport(record: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!record || typeof record !== 'object') {
    return { valid: false, errors: ['Record must be a non-null object'] };
  }

  if (!record.queryId || typeof record.queryId !== 'string' || !record.queryId.trim()) {
    errors.push('queryId is required and must be a non-empty string');
  }

  if (!record.targetUrl || typeof record.targetUrl !== 'string' || !record.targetUrl.startsWith('http')) {
    errors.push('targetUrl is required and must be a valid HTTP(S) URL');
  }

  if (!record.source || typeof record.source !== 'string' || !record.source.trim()) {
    errors.push('source is required to guarantee provenance');
  }

  if (record.googleIndexStatus && !VALID_INDEX_STATES.has(record.googleIndexStatus)) {
    errors.push(`Invalid googleIndexStatus: ${record.googleIndexStatus}`);
  }

  if (record.bingIndexStatus && !VALID_INDEX_STATES.has(record.bingIndexStatus)) {
    errors.push(`Invalid bingIndexStatus: ${record.bingIndexStatus}`);
  }

  if (record.searchRetrieval && !VALID_RETRIEVAL_STATES.has(record.searchRetrieval)) {
    errors.push(`Invalid searchRetrieval: ${record.searchRetrieval}`);
  }

  if (record.mentionStatus && !VALID_MENTION_STATES.has(record.mentionStatus)) {
    errors.push(`Invalid mentionStatus: ${record.mentionStatus}`);
  }

  if (record.citationStatus && !VALID_CITATION_STATES.has(record.citationStatus)) {
    errors.push(`Invalid citationStatus: ${record.citationStatus}`);
  }

  if (record.claimGrounding && !VALID_GROUNDING_STATES.has(record.claimGrounding)) {
    errors.push(`Invalid claimGrounding: ${record.claimGrounding}`);
  }

  if (record.timestamp) {
    const parsed = Date.parse(record.timestamp);
    if (isNaN(parsed)) {
      errors.push(`Invalid timestamp format: ${record.timestamp}`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
