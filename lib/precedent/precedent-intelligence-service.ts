// ── Precedent Intelligence Service (Phase 25B WP2) ───────────────────────────

import { PrecedentJurisdictionNode, PrecedentChronologyEvent, ObservedOutcome, ContextualApplicabilityConstraint } from '../../types/precedent-explorer';

export class PrecedentIntelligenceService {
  /**
   * Composes canonical Knowledge Objects into pure, non-mutating PrecedentJurisdictionNode structures.
   */
  public static getCanonicalPrecedents(): readonly PrecedentJurisdictionNode[] {
    const chronology1: PrecedentChronologyEvent[] = [
      {
        eventId: 'evt-karachi-1949',
        year: 1949,
        title: 'Karachi Ceasefire Agreement',
        description: 'Established the Ceasefire Line (CFL) and deployed the UN Military Observer Group.',
      },
      {
        eventId: 'evt-simla-1972',
        year: 1972,
        title: 'Simla Agreement',
        description: 'Converted Ceasefire Line into Line of Control (LoC) committing to bilateral resolution.',
      },
      {
        eventId: 'evt-lahore-1999',
        year: 1999,
        title: 'Lahore Declaration',
        description: 'Bilateral confidence-building measures on nuclear and conventional security.',
      },
      {
        eventId: 'evt-ceasefire-2003',
        year: 2003,
        title: 'Bilateral Ceasefire Understanding',
        description: 'Formal renewal of border ceasefire along the Line of Control.',
      },
    ];

    const outcomes1: ObservedOutcome[] = [
      {
        outcomeId: 'out-01',
        metricTitle: 'Border Conflict De-escalation',
        observedResult: 'Temporary reduction in cross-border artillery engagements (2003–2007).',
        supportingEvidenceTitle: 'UNMOGIP Ceasefire Incident Reports & Ministry of Defence Statements',
        attributionLimitation: 'Multiple simultaneous political negotiations prevent attributing all calm to the ceasefire agreement alone.',
      },
    ];

    const constraints1: ContextualApplicabilityConstraint = {
      designedFor: Object.freeze(['Bilateral nuclear-armed neighbors with shared borders']),
      lessComparableTo: Object.freeze(['Small island states or non-adjacent regional disputes']),
      requiredPrerequisites: Object.freeze(['Direct military-to-military hotline', 'Mutual diplomatic recognition']),
    };

    const karachiPrecedent: PrecedentJurisdictionNode = {
      precedentId: 'prec-karachi-ceasefire-1949',
      slug: 'karachi-ceasefire-agreement-1949',
      jurisdictionName: 'Karachi Ceasefire Framework (India & Pakistan)',
      region: 'SOUTH_ASIA',
      implementationYearRange: '1949–Present',
      contextSummary: 'Bilateral ceasefire demarcation overseen by international observers following the 1947–48 conflict.',
      contextSimilarityScore: 92,
      comparableCharacteristics: Object.freeze([
        'Post-conflict territorial demarcation',
        'International observer monitoring',
        'Shared bilateral border',
      ]),
      majorDifferences: Object.freeze([
        'Nuclear deterrence framework absent in 1949',
        'Different UN Security Council geopolitical alignment',
      ]),
      chronology: Object.freeze(chronology1.map((c) => Object.freeze({ ...c }))),
      observedOutcomes: Object.freeze(outcomes1.map((o) => Object.freeze({ ...o }))),
      applicabilityConstraints: Object.freeze(constraints1),
      relatedProblemSlugs: Object.freeze(['kashmir-1947-un-reference']),
      relatedFixIds: Object.freeze(['FIX-DOM-001']),
    };

    return Object.freeze([Object.freeze(karachiPrecedent)]);
  }

  public static getPrecedentBySlug(slug: string): PrecedentJurisdictionNode | undefined {
    return this.getCanonicalPrecedents().find((p) => p.slug === slug);
  }
}
