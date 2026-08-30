/**
 * ─── Research Intelligence Engine — Phase 4 Test Suite ──────────────────────
 *
 * Covers:
 *   1. Canonical proposition matching (language-independent claim evaluation)
 *   2. Entity coverage trace (end-to-end instrumentation)
 *   3. Cross-language claim evaluation
 *   4. A/B/C/D experiments (standalone resolver coverage, integrated entity recall,
 *      cross-language claim recall, candidate/resolver coverage)
 */

import {
  buildCanonicalProposition,
  matchCanonicalPropositions,
  traceEntity,
  type CanonicalProposition,
  type ClaimMatchState,
} from '@/lib/intel/research/benchmark/metrics';
import {
  resolveEntity,
  CROSS_SCRIPT_ENTITY_REGISTRY,
} from '@/lib/intel/research/entity-resolver';

// ── Canonical Proposition Matching Tests ─────────────────────────────────────

describe('Phase 4 — Canonical Proposition Matching', () => {
  test('buildCanonicalProposition extracts numeric values', () => {
    const prop = buildCanonicalProposition(
      'GST revenue collections hit ₹1,20,000 crore in August 2026',
      'en'
    );
    expect(prop.numericValues.length).toBeGreaterThan(0);
    expect(prop.normalizedTokens.length).toBeGreaterThan(0);
    expect(prop.language).toBe('en');
  });

  test('EXACT_TEXT match for identical claims', () => {
    const a = buildCanonicalProposition('The GDP growth rate is 6.5%', 'en');
    const b = buildCanonicalProposition('The GDP growth rate is 6.5%', 'en');
    const result = matchCanonicalPropositions(a, b);
    expect(result.state).toBe('EXACT_TEXT');
    expect(result.confidence).toBe(1.0);
  });

  test('NUMERIC_MATCH for same numbers in different text', () => {
    const a = buildCanonicalProposition('Revenue increased to ₹1,20,000 crore', 'en');
    const b = buildCanonicalProposition('राजस्व बढ़कर 120000 करोड़ हुआ', 'hi');
    const result = matchCanonicalPropositions(a, b);
    expect(result.confidence).toBeGreaterThan(0);
  });

  test('NO_MATCH for unrelated claims', () => {
    const a = buildCanonicalProposition('The cricket match was won by India', 'en');
    const b = buildCanonicalProposition('New data protection law passed', 'en');
    const result = matchCanonicalPropositions(a, b);
    expect(result.state).toBe('NO_MATCH');
  });

  test('Lakh/crore normalization works', () => {
    const prop = buildCanonicalProposition('5 lakh people affected, 2 crore allocated', 'en');
    expect(prop.numericValues).toContain('500000');
    expect(prop.numericValues).toContain('20000000');
  });

  test('Dollar/billion normalization works', () => {
    const prop = buildCanonicalProposition('Trade deficit narrowed to $15.2 billion', 'en');
    expect(prop.numericValues).toContain('15200000000');
  });
});

// ── Entity Coverage Trace Tests ─────────────────────────────────────────────

describe('Phase 4 — Entity Coverage Trace', () => {
  test('traceEntity reports entity present in doc text', () => {
    const expansionEntities = [
      { name: 'अयोध्या', aliases: ['Ayodhya'] },
    ];
    const topic = {
      topicId: 'topic-ayodhya',
      language: 'Hindi' as const,
      geography: 'national' as const,
    } as any;
    const snapshot = { fullClaims: [] } as any;

    const trace = traceEntity(
      'अयोध्या',
      topic,
      snapshot,
      expansionEntities,
      CROSS_SCRIPT_ENTITY_REGISTRY,
      ['The Supreme Court verdict on अयोध्या was historic']
    );
    expect(trace.presentInDocText).toBe(true);
    expect(trace.presentInExpansion).toBe(true);
  });

  test('traceEntity reports entity absent from doc text', () => {
    const expansionEntities = [
      { name: 'Karnataka', aliases: ['Karnataka State'] },
    ];
    const topic = {
      topicId: 'topic-karnataka',
      language: 'English' as const,
      geography: 'state' as const,
    } as any;
    const snapshot = { fullClaims: [] } as any;

    const trace = traceEntity(
      'अयोध्या',
      topic,
      snapshot,
      expansionEntities,
      CROSS_SCRIPT_ENTITY_REGISTRY,
      ['The Karnataka bill was passed by the state assembly']
    );
    expect(trace.presentInDocText).toBe(false);
    expect(trace.presentInExpansion).toBe(false);
  });

  test('traceEntity detects entity in claim entityMentions', () => {
    const expansionEntities = [
      { name: 'अयोध्या', aliases: ['Ayodhya'] },
    ];
    const topic = {
      topicId: 'topic-ayodhya',
      language: 'Hindi' as const,
      geography: 'national' as const,
    } as any;
    const snapshot = {
      fullClaims: [
        { entityMentions: ['अयोध्या', 'Supreme Court'] },
      ],
    } as any;

    const trace = traceEntity(
      'अयोध्या',
      topic,
      snapshot,
      expansionEntities,
      CROSS_SCRIPT_ENTITY_REGISTRY,
      []
    );
    expect(trace.detectedInClaim).toBe(true);
    expect(trace.detectedEntityMention).toBe('अयोध्या');
    expect(trace.countedAsRecalled).toBe(true);
  });

  test('traceEntity reports NO_MATCH when entity not in any pipeline stage', () => {
    const expansionEntities = [
      { name: 'Karnataka', aliases: ['Karnataka State'] },
    ];
    const topic = {
      topicId: 'topic-karnataka',
      language: 'English' as const,
      geography: 'state' as const,
    } as any;
    const snapshot = { fullClaims: [{ entityMentions: ['Karnataka'] }] } as any;

    const trace = traceEntity(
      'अयोध्या',  // Devanagari script — not in any stage for Karnataka topic
      topic,
      snapshot,
      expansionEntities,
      CROSS_SCRIPT_ENTITY_REGISTRY,
      []
    );
    expect(trace.detectedInClaim).toBe(false);
    expect(trace.countedAsRecalled).toBe(false);
  });

  test('traceEntity correctly identifies expansion resolution for same-script match', () => {
    const expansionEntities = [
      { name: 'अयोध्या', aliases: ['Ayodhya'] },
    ];
    const topic = {
      topicId: 'topic-ayodhya',
      language: 'Hindi' as const,
      geography: 'national' as const,
    } as any;
    const snapshot = {
      fullClaims: [{ entityMentions: ['अयोध्या'] }],
    } as any;

    const trace = traceEntity(
      'अयोध्या',
      topic,
      snapshot,
      expansionEntities,
      CROSS_SCRIPT_ENTITY_REGISTRY,
      ['अयोध्या में भूमि विवाद']
    );
    expect(trace.resolutionMethod).toBe('EXPANSION');
    expect(trace.detectedInClaim).toBe(true);
  });
});

// ── Cross-Language Claim Evaluation Tests ────────────────────────────────────

describe('Phase 4 — Cross-Language Claim Evaluation', () => {
  test('English and Hindi numeric claims match via NUMERIC_MATCH', () => {
    const en = buildCanonicalProposition('GST collections reached ₹1,20,000 crore', 'en');
    const hi = buildCanonicalProposition('GST संग्रह 120000 करोड़ तक पहुंचा', 'hi');
    const result = matchCanonicalPropositions(en, hi);
    expect(result.confidence).toBeGreaterThan(0);
    expect(result.state).not.toBe('NO_MATCH');
  });

  test('English and Hindi claims with entity overlap match via entity resolution', () => {
    const en = buildCanonicalProposition('Supreme Court verdict in Ayodhya land dispute', 'en');
    const hi = buildCanonicalProposition('अयोध्या भूमि विवाद में सुप्रीम कोर्ट का फैसला', 'hi');
    const result = matchCanonicalPropositions(en, hi);
    expect(result.confidence).toBeGreaterThan(0);
  });

  test('English and Malayalam geographic claims match via entity resolution', () => {
    const en = buildCanonicalProposition('Wayanad district received heavy rainfall', 'en');
    const ml = buildCanonicalProposition('വയനാട് ജില്ലയ്ക്ക് ശക്തമായ മഴ ലഭിച്ചു', 'ml');
    const result = matchCanonicalPropositions(en, ml);
    expect(result.confidence).toBeGreaterThan(0);
  });

  test('Cross-script entity detection works for Hindi entities via registry', () => {
    const result = resolveEntity('कर्नाटक', [], {
      crossScriptEntities: CROSS_SCRIPT_ENTITY_REGISTRY,
      maxLayer: 4,
    });
    expect(result.canonicalName).toBe('कर्नाटक');
    expect(result.matchMethod).toBe('CROSS_SCRIPT');
  });

  test('Cross-script entity detection works for new Hindi entities', () => {
    const result = resolveEntity('तेलंगाना', [], {
      crossScriptEntities: CROSS_SCRIPT_ENTITY_REGISTRY,
      maxLayer: 4,
    });
    expect(result.canonicalName).toBe('तेलंगाना');
    expect(result.matchMethod).toBe('CROSS_SCRIPT');
  });

  test('Supreme Court Hindi entity resolves via cross-script registry', () => {
    const result = resolveEntity('सुप्रीम कोर्ट', [], {
      crossScriptEntities: CROSS_SCRIPT_ENTITY_REGISTRY,
      maxLayer: 4,
    });
    expect(result.canonicalName).toBe('सुप्रीम कोर्ट');
    expect(result.matchMethod).toBe('CROSS_SCRIPT');
  });
});

// ── A/B/C/D Experiments ──────────────────────────────────────────────────────
// A = current pipeline (baseline)
// B = A + cross-language proposition evaluation
// C = B + targeted Hindi entity aliases
// D = C + end-to-end candidate-coverage instrumentation

describe('Phase 4 — A/B/C/D Experiments', () => {
  const KNOWN_ENTITIES = [
    { name: 'अयोध्या', aliases: ['Ayodhya'] },
    { name: 'വയനാട്', aliases: ['Wayanad', 'Wayanad district'] },
    { name: 'കേരളം', aliases: ['Kerala', 'Kerala State'] },
    { name: 'മഹാരാഷ്ട്ര', aliases: ['Maharashtra', 'MH'] },
    { name: 'വിഭാഗ', aliases: ['Cabinet', 'Department', 'Division'] },
    { name: 'बिहार', aliases: ['Bihar', 'बिहार राज्य'] },
    { name: 'पंचायती राज', aliases: ['Panchayat', 'Panchayati Raj'] },
    { name: 'कश्मीर', aliases: ['Kashmir', 'Jammu and Kashmir', 'J&K'] },
  ];

  // Test corpus: entity strings that the resolver should handle
  const entityCorpus = [
    // True matches (17 entities)
    { observed: 'अयोध्या', expected: 'अयोध्या' },
    { observed: 'Ayodhya', expected: 'अयोध्या' },
    { observed: 'വയനാട്', expected: 'വയനാട്' },
    { observed: 'Wayanad', expected: 'വയനാട്' },
    { observed: 'കേരളം', expected: 'കേരളം' },
    { observed: 'Kerala', expected: 'കേരളം' },
    { observed: 'Maharashtra', expected: 'മഹാരാഷ്ട്ര' },
    { observed: 'बिहार', expected: 'बिहार' },
    { observed: 'Bihar', expected: 'बिहार' },
    { observed: 'कश्मीर', expected: 'कश्मीर' },
    { observed: 'Kashmir', expected: 'कश्मीर' },
    { observed: 'कर्नाटक', expected: 'कर्नाटक' },
    { observed: 'Karnataka', expected: 'कर्नाटक' },
    { observed: 'तेलंगाना', expected: 'तेलंगाना' },
    { observed: 'Telangana', expected: 'तेलंगाना' },
    { observed: 'सुप्रीम कोर्ट', expected: 'सुप्रीम कोर्ट' },
    { observed: 'Supreme Court', expected: 'सुप्रीम कोर्ट' },
    // False-merge traps (should NOT match)
    { observed: 'Keralites', expected: null },
    { observed: 'CBI', expected: null },
    // Ambiguous (should NOT match)
    { observed: 'Delhi', expected: null },
    { observed: 'India', expected: null },
  ];

  test('A — Baseline: standalone resolver achieves >= 85% entity recall', () => {
    const trueMatches = entityCorpus.filter((tc) => tc.expected !== null);
    let hits = 0;
    for (const tc of trueMatches) {
      const result = resolveEntity(tc.observed, KNOWN_ENTITIES, {
        crossScriptEntities: CROSS_SCRIPT_ENTITY_REGISTRY,
      });
      if (result.canonicalName === tc.expected) hits += 1;
    }
    const recall = hits / trueMatches.length;
    console.log(`  [A] Standalone Entity Recall: ${(recall * 100).toFixed(1)}% (${hits}/${trueMatches.length})`);
    expect(recall).toBeGreaterThanOrEqual(0.85);
  });

  test('B — Cross-language proposition evaluation matches across scripts', () => {
    const enProp = buildCanonicalProposition('Supreme Court verdict in Ayodhya land dispute', 'en');
    const hiProp = buildCanonicalProposition('अयोध्या भूमि विवाद में सुप्रीम कोर्ट का फैसला', 'hi');
    const result = matchCanonicalPropositions(enProp, hiProp);
    console.log(`  [B] Cross-language match: state=${result.state}, confidence=${result.confidence.toFixed(3)}`);
    expect(result.confidence).toBeGreaterThan(0);
    expect(result.state).not.toBe('NO_MATCH');
  });

  test('C — Targeted Hindi entity aliases improve cross-script resolution', () => {
    const result = resolveEntity('Karnataka', KNOWN_ENTITIES, {
      crossScriptEntities: CROSS_SCRIPT_ENTITY_REGISTRY,
    });
    console.log(`  [C] Karnataka resolution: canonical=${result.canonicalName}, method=${result.matchMethod}`);
    expect(result.canonicalName).toBe('कर्नाटक');
    expect(result.matchMethod).toBe('CROSS_SCRIPT');
  });

  test('D — End-to-end candidate coverage: all expected entities have at least one resolution path', () => {
    const expectedEntities = ['अयोध्या', 'വയനാട്', 'കേരളം', 'മഹാരാഷ്ട്ര', 'വിഭാഗ'];
    const coverageReport: Array<{ entity: string; hasExpansionPath: boolean; hasRegistryPath: boolean }> = [];

    for (const entity of expectedEntities) {
      const expansionResult = resolveEntity(entity, KNOWN_ENTITIES, {
        crossScriptEntities: [],
        maxLayer: 3,
      });
      const registryResult = resolveEntity(entity, [], {
        crossScriptEntities: CROSS_SCRIPT_ENTITY_REGISTRY,
        maxLayer: 4,
      });

      coverageReport.push({
        entity,
        hasExpansionPath: expansionResult.matchMethod !== 'NO_MATCH',
        hasRegistryPath: registryResult.matchMethod !== 'NO_MATCH',
      });
    }

    console.log('  [D] Entity Coverage Report:');
    for (const entry of coverageReport) {
      const paths = [
        entry.hasExpansionPath ? 'EXPANSION' : null,
        entry.hasRegistryPath ? 'REGISTRY' : null,
      ].filter(Boolean).join('+') || 'NONE';
      console.log(`    ${entry.entity}: ${paths}`);
    }

    for (const entry of coverageReport) {
      expect(entry.hasExpansionPath || entry.hasRegistryPath).toBe(true);
    }
  });

  test('False-merge rate remains 0% after adding new entities', () => {
    const falseTraps = entityCorpus.filter((tc) => tc.expected === null);
    let falsePositives = 0;
    for (const tc of falseTraps) {
      const result = resolveEntity(tc.observed, KNOWN_ENTITIES, {
        crossScriptEntities: CROSS_SCRIPT_ENTITY_REGISTRY,
      });
      if (result.canonicalName !== null) falsePositives += 1;
    }
    const falseMergeRate = falsePositives / falseTraps.length;
    console.log(`  FalseMergeRate: ${(falseMergeRate * 100).toFixed(1)}% (${falsePositives}/${falseTraps.length})`);
    expect(falseMergeRate).toBe(0);
  });
});
