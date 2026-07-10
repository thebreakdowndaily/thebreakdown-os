interface ExpansionStep {
  from: string;
  to: string;
  relation: string;
  weight: number;
}

interface ConceptTrailProps {
  detectedConcepts: Array<{ id: string; label: string; domain: string }>;
  expansionTrail: ExpansionStep[];
}

const domainColors: Record<string, string> = {
  'rural-development': 'bg-green-500/10 text-green-500 border-green-500/20',
  'economy': 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  'employment': 'bg-purple-500/10 text-purple-500 border-purple-500/20',
  'technology': 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20',
  'governance': 'bg-brand-400/10 text-brand-400 border-brand-400/20',
  'legal': 'bg-rose-500/10 text-rose-500 border-rose-500/20',
  'institutions': 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20',
  'infrastructure': 'bg-orange-500/10 text-orange-500 border-orange-500/20',
  'social-welfare': 'bg-pink-500/10 text-pink-500 border-pink-500/20',
};

function getDomainColor(domain: string): string {
  return domainColors[domain] || 'bg-surface-tertiary text-text-muted border-border';
}

const relationLabels: Record<string, string> = {
  'funded-by': 'funded by',
  'provides': 'provides',
  'involves': 'involves',
  'state-share': 'state share',
  'is-a': 'is a',
  'impacts': 'impacts',
  'drives': 'drives',
  'employs': 'employs',
  'subsidized': 'subsidized via',
  'receives': 'receives',
  'covers': 'covers',
  'protects': 'protects',
  'requires': 'requires',
  'payouts': 'payouts',
  'enables': 'enables',
  'part-of': 'part of',
  'funds': 'funds',
  'allocates-to': 'allocates to',
  'implements': 'implements',
  'co-funded': 'co-funded',
  'sets': 'sets',
  'controls': 'controls',
  'regulates': 'regulates',
  'operates': 'operates',
  'audits': 'audits',
  'transforms': 'transforms',
  'promotes': 'promotes',
  'governs': 'governs',
  'reviews': 'reviews',
  'hears': 'hears',
  'interprets': 'interprets',
  'decided-by': 'decided by',
  'concerns': 'concerns',
  'subject-of': 'subject of',
  'tested-in': 'tested in',
  'enacted-as': 'enacted as',
  'co-funds': 'co-funds',
  'disputed-in': 'disputed in',
  'investigated-by': 'investigated by',
  'related': 'relates to',
  'informs': 'informs',
  'includes': 'includes',
  'responsible': 'responsible for',
  'improves': 'improves',
  'creates': 'creates',
  'compensates': 'compensates',
  'employed-by': 'employed by',
  'earns': 'earns',
  'erodes': 'erodes',
  'determines': 'determines',
  'linked-to': 'linked to',
  'targeted-by': 'targeted by',
  'monitors': 'monitors',
  'correlated': 'correlated with',
  'stimulates': 'stimulates',
  'depends-on': 'depends on',
  'component': 'component of',
  'programme': 'programme',
  'regulated-by': 'regulated by',
  'operated-by': 'operated by',
  'facilitates': 'facilitates',
};

function getRelationLabel(relation: string): string {
  return relationLabels[relation] || relation;
}

export default function ConceptTrail({ detectedConcepts, expansionTrail }: ConceptTrailProps) {
  if (detectedConcepts.length === 0) return null;

  // Build trail display: only the chain between detected and expanded concepts
  const trailSteps = expansionTrail.slice(0, 6);

  return (
    <div className="bg-surface-secondary border border-border rounded-md p-4">
      <div className="flex items-center gap-2 mb-4">
        <svg className="w-4 h-4 text-brand-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
        <span className="text-[10px] font-bold uppercase tracking-widest text-text-primary">Search Understanding</span>
      </div>

      {/* Detected concepts */}
      <div className="flex flex-wrap gap-2 mb-4">
        {detectedConcepts.map((c) => (
          <span
            key={c.id}
            className={`text-[10px] uppercase font-bold tracking-widest px-2 py-1 rounded-sm border ${getDomainColor(c.domain)}`}
            title={`Domain: ${c.domain}`}
          >
            {c.label}
          </span>
        ))}
      </div>

      {/* Expansion trail */}
      {trailSteps.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 text-xs text-text-muted">
          {trailSteps.map((step, i) => (
            <span key={i} className="flex items-center gap-2">
              {i > 0 && <span className="text-text-muted/40 mx-0.5 font-bold">·</span>}
              <span className="text-text-secondary font-bold font-serif">{step.from}</span>
              <span className="text-text-muted italic">{getRelationLabel(step.relation)}</span>
              <span className="text-text-secondary font-bold font-serif">{step.to}</span>
            </span>
          ))}
          {expansionTrail.length > 6 && (
            <span className="text-text-muted/60 ml-2 font-mono tabular-nums text-[10px]">
              +{expansionTrail.length - 6} MORE
            </span>
          )}
        </div>
      )}

      <div className="mt-4 text-[10px] text-text-muted font-bold tracking-widest uppercase">
        Results include direct, concept, and semantic matches.
      </div>
    </div>
  );
}
