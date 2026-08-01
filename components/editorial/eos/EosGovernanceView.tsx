export interface GovernancePolicy {
  id: string;
  title: string;
  principle: string;
  rules: string[];
  constitutionRef: string;
}

export const GOV_POLICIES: GovernancePolicy[] = [
  {
    id: 'verification-policy',
    title: 'Verification Policy',
    principle: 'No claim is published without a verification status. Every failed verification is a blocking issue.',
    rules: [
      'Every claim carries one of four statuses: Verified, Partially Verified, Needs Verification, Unsupported.',
      'Claims are checked deterministically against the canonical dataset before the fact-check stage can close.',
      'Unresolved claims block publication unless explicitly editor-approved, with the approval recorded in the audit trail.',
      'Verification basis (source registry + quality) is attached to every claim.',
    ],
    constitutionRef: 'Editorial Constitution v1.1 — Article IV (Claims), Evidence Hierarchy Article III',
  },
  {
    id: 'source-policy',
    title: 'Source Policy',
    principle: 'Every fact traces to a registered source with recorded authority, dataset, and quality level.',
    rules: [
      'Provenance is never stripped: original authority, dataset id, version, verification date, cutoff date.',
      'Primary sources outrank secondary; the Evidence Hierarchy governs conflicts.',
      'Data gaps are disclosed in-band rather than silently filled.',
    ],
    constitutionRef: 'Editorial Constitution v1.1 — Article III (Evidence Hierarchy)',
  },
  {
    id: 'correction-policy',
    title: 'Correction Policy',
    principle: 'Corrections are a strength. Every correction is public, versioned, and traced to its cause.',
    rules: [
      'Each correction increments the story version and is recorded in the Book of Record.',
      'The correction notes what changed, why, and the evidence supporting the change.',
      'Related knowledge objects are reviewed for the same class of error.',
    ],
    constitutionRef: 'Editorial Constitution v1.1 — Article XII (Knowledge Lifecycle), Corrections Policy (AGENTS.md)',
  },
  {
    id: 'retraction-policy',
    title: 'Retraction Policy',
    principle: 'When a story cannot be defended, retract it fully — partial salvaging erodes trust.',
    rules: [
      'Retraction is triggered when the evidence spine cannot support the central claim.',
      'The retracted story is archived with a public reason and retained for the historical record.',
    ],
    constitutionRef: 'Editorial Constitution v1.1 — Article XII (Knowledge Lifecycle)',
  },
  {
    id: 'attribution-policy',
    title: 'Attribution Policy',
    principle: 'Credit is explicit: reporters, editors, fact-checkers, and sources are named.',
    rules: [
      'Story metadata records reporters, assigning editor, and fact-checker.',
      'Citation bundles name the source authority and registry entry for every claim.',
      'Editorial judgment is distinguished from established fact and scholarly interpretation.',
    ],
    constitutionRef: 'Editorial Constitution v1.1 — Article XIII (Transparency)',
  },
  {
    id: 'ai-usage-policy',
    title: 'AI Usage Policy',
    principle: 'AI assists. AI never becomes the source of truth. Generated content remains reviewable.',
    rules: [
      'The Story Builder assembles verified research only — no AI-written copy.',
      'Discovery is deterministic rules over canonical data; AI may only suggest, never conclude.',
      'Evidence always overrides AI output.',
    ],
    constitutionRef: 'AGENTS.md — AI Layer; AI Instructions; Editorial Constitution Article III',
  },
  {
    id: 'editorial-ethics-policy',
    title: 'Editorial Ethics',
    principle: 'Evidence before conclusions. Context before certainty.',
    rules: [
      'Prohibited language is never used: "clearly", "obviously", "undoubtedly".',
      'Counterarguments are documented, not hidden.',
      'Editorial analytics measure the workflow, not individual journalists.',
    ],
    constitutionRef: 'Editorial Constitution v1.1 — Article II (Ethics), Article VII (Language)',
  },
];

export default function EosGovernanceView() {
  return (
    <div className="space-y-6">
      <p className="text-sm text-gray-400 max-w-3xl">
        The EOS newsroom operates under the Editorial Constitution v1.1 (locked) and the Product Quality Standard.
        These seven policy standards translate that governance into day-to-day newsroom rules. Full policy documents
        ship with RELEASE-4 in <span className="font-mono text-gray-300">release-4/editorial-governance/</span>.
      </p>
      <div className="grid md:grid-cols-2 gap-4">
        {GOV_POLICIES.map(p => (
          <section key={p.id} id={p.id} aria-label={p.title} className="rounded-lg border border-gray-800 bg-gray-900/60 p-4">
            <div className="text-xs uppercase tracking-widest text-amber-400/80 font-bold">{p.title}</div>
            <p className="mt-2 text-sm text-gray-200">{p.principle}</p>
            <ul className="mt-3 space-y-1.5 text-xs text-gray-400">
              {p.rules.map((r, i) => (
                <li key={i} className="flex gap-2">
                  <span className="text-amber-500/60 shrink-0">•</span>
                  {r}
                </li>
              ))}
            </ul>
            <div className="mt-3 text-[10px] font-mono text-gray-600">governed by {p.constitutionRef}</div>
          </section>
        ))}
      </div>
    </div>
  );
}
