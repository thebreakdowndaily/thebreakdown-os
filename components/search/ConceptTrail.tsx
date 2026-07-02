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
  'rural-development': 'bg-emerald-900/40 text-emerald-300 border-emerald-700',
  'economy': 'bg-blue-900/40 text-blue-300 border-blue-700',
  'employment': 'bg-violet-900/40 text-violet-300 border-violet-700',
  'technology': 'bg-cyan-900/40 text-cyan-300 border-cyan-700',
  'governance': 'bg-amber-900/40 text-amber-300 border-amber-700',
  'legal': 'bg-red-900/40 text-red-300 border-red-700',
  'institutions': 'bg-indigo-900/40 text-indigo-300 border-indigo-700',
  'infrastructure': 'bg-orange-900/40 text-orange-300 border-orange-700',
  'social-welfare': 'bg-pink-900/40 text-pink-300 border-pink-700',
};

function getDomainColor(domain: string): string {
  return domainColors[domain] || 'bg-gray-800 text-gray-300 border-gray-600';
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
    <div className="bg-gray-900/60 border border-gray-800 rounded-lg p-4">
      <div className="flex items-center gap-2 mb-3">
        <svg className="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
        <span className="text-sm font-medium text-gray-200">Search Understanding</span>
      </div>

      {/* Detected concepts */}
      <div className="flex flex-wrap gap-2 mb-3">
        {detectedConcepts.map((c) => (
          <span
            key={c.id}
            className={`text-xs px-2.5 py-1 rounded-full border ${getDomainColor(c.domain)}`}
            title={`Domain: ${c.domain}`}
          >
            {c.label}
          </span>
        ))}
      </div>

      {/* Expansion trail */}
      {trailSteps.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 text-xs text-gray-400">
          {trailSteps.map((step, i) => (
            <span key={i} className="flex items-center gap-1.5">
              {i > 0 && <span className="text-gray-600 mx-0.5">·</span>}
              <span className="text-gray-300 font-medium">{step.from}</span>
              <span className="text-gray-500 italic">{getRelationLabel(step.relation)}</span>
              <span className="text-gray-300">{step.to}</span>
            </span>
          ))}
          {expansionTrail.length > 6 && (
            <span className="text-gray-500 ml-1">
              +{expansionTrail.length - 6} more connections
            </span>
          )}
        </div>
      )}

      <div className="mt-2 text-xs text-gray-600">
        Results include direct matches, concept-based matches, and expanded semantic results.
      </div>
    </div>
  );
}
