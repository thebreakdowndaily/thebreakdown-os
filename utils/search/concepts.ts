export interface Concept {
  id: string;
  label: string;
  aliases: string[];
  domain: string;
  parents: string[];
  children: string[];
  related: Array<{ id: string; type: string; weight: number }>;
  entityAssociations: Array<{ id: string; type: 'story' | 'entity' | 'topic' }>;
}

const rawConcepts: Concept[] = [
  // ── Rural Development & Agriculture ──────────────────────────────
  {
    id: 'rural-development',
    label: 'Rural Development',
    aliases: ['rural', 'rural india', 'village development', 'gramin vikas'],
    domain: 'rural-development',
    parents: [],
    children: ['mgnrega', 'agriculture', 'rural-infrastructure', 'rural-economy', 'rural-employment'],
    related: [{ id: 'state-funding', type: 'funds', weight: 0.7 }, { id: 'government-schemes', type: 'implements', weight: 0.8 }],
    entityAssociations: [{ id: 'ministry-of-rural-development', type: 'entity' }],
  },
  {
    id: 'mgnrega',
    label: 'MGNREGA',
    aliases: ['nrega', 'national rural employment guarantee', 'rural employment scheme', '100 days employment', 'job guarantee', 'manrega', 'mahatma gandhi national rural employment guarantee act'],
    domain: 'rural-development',
    parents: ['rural-development', 'rural-employment'],
    children: [],
    related: [
      { id: 'budget', type: 'funded-by', weight: 0.9 },
      { id: 'employment', type: 'provides', weight: 0.95 },
      { id: 'labour', type: 'involves', weight: 0.85 },
      { id: 'wages', type: 'determines', weight: 0.8 },
      { id: 'state-funding', type: 'state-share', weight: 0.75 },
      { id: 'government-schemes', type: 'is-a', weight: 0.9 },
      { id: 'rural-economy', type: 'impacts', weight: 0.85 },
    ],
    entityAssociations: [{ id: 'mgnrega', type: 'entity' }, { id: 'mgnrega-reform', type: 'story' }, { id: 'ministry-of-rural-development', type: 'entity' }],
  },
  {
    id: 'agriculture',
    label: 'Agriculture',
    aliases: ['farming', 'crops', 'farm sector', 'kheti', 'krishi', 'agricultural'],
    domain: 'rural-development',
    parents: ['rural-development'],
    children: ['crop-insurance', 'farmer-welfare', 'agriculture-policy'],
    related: [
      { id: 'rural-economy', type: 'drives', weight: 0.9 },
      { id: 'employment', type: 'employs', weight: 0.85 },
      { id: 'state-funding', type: 'subsidized', weight: 0.7 },
      { id: 'budget', type: 'receives', weight: 0.75 },
    ],
    entityAssociations: [{ id: 'ministry-of-agriculture', type: 'entity' }],
  },
  {
    id: 'crop-insurance',
    label: 'Crop Insurance',
    aliases: ['pmfby', 'pm fasal bima yojana', 'crop insurance scheme', 'fasal bima', 'claims settlement'],
    domain: 'rural-development',
    parents: ['agriculture'],
    children: [],
    related: [
      { id: 'agriculture', type: 'covers', weight: 0.9 },
      { id: 'farmer-welfare', type: 'protects', weight: 0.85 },
      { id: 'state-funding', type: 'requires', weight: 0.8 },
      { id: 'claims', type: 'payouts', weight: 0.8 },
      { id: 'government-schemes', type: 'is-a', weight: 0.85 },
    ],
    entityAssociations: [{ id: 'pm-fasal-bima-claims', type: 'story' }, { id: 'ministry-of-agriculture', type: 'entity' }],
  },
  {
    id: 'farmer-welfare',
    label: 'Farmer Welfare',
    aliases: ['kisan', 'farmer schemes', 'farmers', 'kisan welfare', 'farmer support'],
    domain: 'rural-development',
    parents: ['agriculture'],
    children: [],
    related: [
      { id: 'agriculture', type: 'supports', weight: 0.9 },
      { id: 'crop-insurance', type: 'protects', weight: 0.85 },
      { id: 'claims', type: 'entitlements', weight: 0.7 },
      { id: 'government-schemes', type: 'includes', weight: 0.8 },
    ],
    entityAssociations: [],
  },
  {
    id: 'agriculture-policy',
    label: 'Agriculture Policy',
    aliases: ['farm policy', 'agricultural policy', 'farm laws', 'agri reforms'],
    domain: 'rural-development',
    parents: ['agriculture', 'policy'],
    children: [],
    related: [
      { id: 'agriculture', type: 'governs', weight: 0.8 },
      { id: 'policy', type: 'part-of', weight: 0.85 },
      { id: 'government-schemes', type: 'includes', weight: 0.75 },
      { id: 'supreme-court', type: 'reviewed-by', weight: 0.5 },
    ],
    entityAssociations: [],
  },
  {
    id: 'rural-infrastructure',
    label: 'Rural Infrastructure',
    aliases: ['rural roads', 'village infrastructure', 'gram sadak', 'rural connectivity', 'pmgsy'],
    domain: 'rural-development',
    parents: ['rural-development', 'infrastructure'],
    children: [],
    related: [
      { id: 'rural-development', type: 'part-of', weight: 0.9 },
      { id: 'infrastructure', type: 'is-a', weight: 0.8 },
      { id: 'budget', type: 'funded-by', weight: 0.7 },
      { id: 'employment', type: 'creates', weight: 0.7 },
    ],
    entityAssociations: [],
  },
  {
    id: 'rural-economy',
    label: 'Rural Economy',
    aliases: ['rural economic', 'village economy', 'gramin arthvyavastha', 'rural income'],
    domain: 'rural-development',
    parents: ['rural-development', 'economy'],
    children: ['rural-employment', 'rural-finance'],
    related: [
      { id: 'economy', type: 'part-of', weight: 0.85 },
      { id: 'rural-development', type: 'drives', weight: 0.9 },
      { id: 'employment', type: 'depends-on', weight: 0.85 },
      { id: 'agriculture', type: 'drives', weight: 0.8 },
      { id: 'state-funding', type: 'stimulates', weight: 0.75 },
      { id: 'budget', type: 'impacts', weight: 0.7 },
      { id: 'digital-payments', type: 'transforms', weight: 0.6 },
    ],
    entityAssociations: [],
  },
  {
    id: 'rural-employment',
    label: 'Rural Employment',
    aliases: ['rural jobs', 'village employment', 'gramin rozgar'],
    domain: 'rural-development',
    parents: ['rural-economy', 'employment'],
    children: ['mgnrega'],
    related: [
      { id: 'employment', type: 'is-a', weight: 0.9 },
      { id: 'rural-economy', type: 'drives', weight: 0.9 },
      { id: 'mgnrega', type: 'provides', weight: 0.95 },
      { id: 'labour', type: 'involves', weight: 0.8 },
      { id: 'wages', type: 'determines', weight: 0.8 },
    ],
    entityAssociations: [],
  },
  {
    id: 'rural-finance',
    label: 'Rural Finance',
    aliases: ['rural banking', 'village finance', 'rural credit', 'microfinance', 'kisan credit card'],
    domain: 'rural-development',
    parents: ['rural-economy', 'economy'],
    children: [],
    related: [
      { id: 'rural-economy', type: 'enables', weight: 0.8 },
      { id: 'digital-payments', type: 'transforms', weight: 0.7 },
      { id: 'economy', type: 'part-of', weight: 0.7 },
      { id: 'financial-inclusion', type: 'promotes', weight: 0.85 },
    ],
    entityAssociations: [],
  },

  // ── Economy & Finance ────────────────────────────────────────────
  {
    id: 'economy',
    label: 'Economy',
    aliases: ['economic', 'economic policy', 'economy india', 'arthvyavastha', 'macroeconomic'],
    domain: 'economy',
    parents: [],
    children: ['budget', 'fiscal-policy', 'monetary-policy', 'gdp', 'inflation', 'taxation', 'economy-sectors'],
    related: [
      { id: 'rural-economy', type: 'includes', weight: 0.7 },
      { id: 'state-funding', type: 'impacts', weight: 0.8 },
      { id: 'policy', type: 'guides', weight: 0.75 },
    ],
    entityAssociations: [],
  },
  {
    id: 'budget',
    label: 'Budget',
    aliases: ['union budget', 'budget allocation', 'fiscal budget', 'government budget', 'budgetary', 'annual budget', 'budget outlay', 'expenditure', 'budgetary allocation'],
    domain: 'economy',
    parents: ['economy'],
    children: [],
    related: [
      { id: 'economy', type: 'part-of', weight: 0.9 },
      { id: 'fiscal-policy', type: 'implements', weight: 0.85 },
      { id: 'state-funding', type: 'allocates-to', weight: 0.9 },
      { id: 'government-schemes', type: 'funds', weight: 0.85 },
      { id: 'mgnrega', type: 'funds', weight: 0.9 },
      { id: 'taxation', type: 'financed-by', weight: 0.7 },
    ],
    entityAssociations: [],
  },
  {
    id: 'fiscal-policy',
    label: 'Fiscal Policy',
    aliases: ['fiscal', 'fiscal deficit', 'government spending', 'fiscal management', 'fiscal consolidation'],
    domain: 'economy',
    parents: ['economy'],
    children: [],
    related: [
      { id: 'economy', type: 'part-of', weight: 0.9 },
      { id: 'budget', type: 'implements', weight: 0.85 },
      { id: 'state-funding', type: 'determines', weight: 0.8 },
      { id: 'taxation', type: 'includes', weight: 0.75 },
      { id: 'gdp', type: 'impacts', weight: 0.7 },
    ],
    entityAssociations: [],
  },
  {
    id: 'monetary-policy',
    label: 'Monetary Policy',
    aliases: ['rbi policy', 'interest rates', 'repo rate', 'moneytary', 'central bank policy'],
    domain: 'economy',
    parents: ['economy'],
    children: [],
    related: [
      { id: 'economy', type: 'part-of', weight: 0.85 },
      { id: 'rbi', type: 'sets', weight: 0.9 },
      { id: 'inflation', type: 'targets', weight: 0.85 },
      { id: 'digital-payments', type: 'regulates', weight: 0.6 },
    ],
    entityAssociations: [{ id: 'rbi', type: 'entity' }],
  },
  {
    id: 'gdp',
    label: 'GDP',
    aliases: ['gross domestic product', 'economic growth', 'gdp growth', 'economic output'],
    domain: 'economy',
    parents: ['economy'],
    children: [],
    related: [
      { id: 'economy', type: 'measures', weight: 0.9 },
      { id: 'budget', type: 'impacts', weight: 0.7 },
      { id: 'inflation', type: 'correlated', weight: 0.6 },
      { id: 'employment', type: 'linked-to', weight: 0.75 },
    ],
    entityAssociations: [],
  },
  {
    id: 'inflation',
    label: 'Inflation',
    aliases: ['price rise', 'cpi', 'consumer price index', 'inflation rate', 'price increase', 'mahngai'],
    domain: 'economy',
    parents: ['economy'],
    children: [],
    related: [
      { id: 'economy', type: 'affects', weight: 0.85 },
      { id: 'monetary-policy', type: 'targeted-by', weight: 0.85 },
      { id: 'rbi', type: 'monitors', weight: 0.8 },
      { id: 'wages', type: 'erodes', weight: 0.75 },
    ],
    entityAssociations: [{ id: 'rbi', type: 'entity' }],
  },
  {
    id: 'taxation',
    label: 'Taxation',
    aliases: ['tax', 'gst', 'income tax', 'tax policy', 'direct tax', 'indirect tax', 'tax revenue'],
    domain: 'economy',
    parents: ['economy'],
    children: [],
    related: [
      { id: 'economy', type: 'part-of', weight: 0.8 },
      { id: 'budget', type: 'finances', weight: 0.85 },
      { id: 'fiscal-policy', type: 'includes', weight: 0.8 },
      { id: 'state-funding', type: 'source', weight: 0.75 },
    ],
    entityAssociations: [],
  },
  {
    id: 'economy-sectors',
    label: 'Economic Sectors',
    aliases: ['economic sectors', 'sectoral growth', 'industry sectors', 'services', 'manufacturing'],
    domain: 'economy',
    parents: ['economy'],
    children: [],
    related: [
      { id: 'economy', type: 'comprises', weight: 0.8 },
      { id: 'employment', type: 'distributed-across', weight: 0.7 },
      { id: 'agriculture', type: 'sector', weight: 0.7 },
    ],
    entityAssociations: [],
  },

  // ── Employment & Labour ──────────────────────────────────────────
  {
    id: 'employment',
    label: 'Employment',
    aliases: ['jobs', 'job', 'rozgar', 'employment rate', 'job creation', 'unemployment', 'workforce', 'job market', 'labour force'],
    domain: 'employment',
    parents: [],
    children: ['rural-employment', 'labour', 'wages', 'skilling'],
    related: [
      { id: 'economy', type: 'driven-by', weight: 0.85 },
      { id: 'mgnrega', type: 'provides', weight: 0.95 },
      { id: 'rural-economy', type: 'depends-on', weight: 0.85 },
      { id: 'labour', type: 'comprises', weight: 0.9 },
      { id: 'wages', type: 'compensates', weight: 0.85 },
      { id: 'gdp', type: 'linked-to', weight: 0.75 },
    ],
    entityAssociations: [],
  },
  {
    id: 'labour',
    label: 'Labour',
    aliases: ['labor', 'worker', 'migrant labour', 'unskilled labour', 'labour rights', 'labour laws', 'shramik', 'mazdoor', 'construction worker'],
    domain: 'employment',
    parents: ['employment'],
    children: [],
    related: [
      { id: 'employment', type: 'part-of', weight: 0.9 },
      { id: 'mgnrega', type: 'employs', weight: 0.85 },
      { id: 'wages', type: 'earns', weight: 0.9 },
      { id: 'court-cases', type: 'subject-of', weight: 0.6 },
      { id: 'supreme-court', type: 'rules-on', weight: 0.5 },
    ],
    entityAssociations: [],
  },
  {
    id: 'wages',
    label: 'Wages',
    aliases: ['wage', 'salary', 'minimum wage', 'wage rate', 'earnings', 'income', 'mazdoori'],
    domain: 'employment',
    parents: ['employment'],
    children: [],
    related: [
      { id: 'employment', type: 'compensates', weight: 0.85 },
      { id: 'labour', type: 'earned-by', weight: 0.9 },
      { id: 'mgnrega', type: 'sets', weight: 0.8 },
      { id: 'inflation', type: 'erodes', weight: 0.75 },
      { id: 'living-standards', type: 'determines', weight: 0.7 },
    ],
    entityAssociations: [],
  },
  {
    id: 'skilling',
    label: 'Skilling',
    aliases: ['skill development', 'vocational training', 'skill india', 'kaushal vikas', 'training'],
    domain: 'employment',
    parents: ['employment'],
    children: [],
    related: [
      { id: 'employment', type: 'enables', weight: 0.85 },
      { id: 'government-schemes', type: 'includes', weight: 0.7 },
      { id: 'digital-payments', type: 'requires', weight: 0.5 },
    ],
    entityAssociations: [],
  },

  // ── Technology & Digital ─────────────────────────────────────────
  {
    id: 'technology',
    label: 'Technology',
    aliases: ['tech', 'information technology', 'it', 'digital technology', 'innovation'],
    domain: 'technology',
    parents: [],
    children: ['digital-payments', 'fintech', 'digital-india'],
    related: [{ id: 'economy', type: 'drives', weight: 0.6 }],
    entityAssociations: [],
  },
  {
    id: 'digital-payments',
    label: 'Digital Payments',
    aliases: ['upi', 'digital payment', 'online payment', 'cashless', 'digital transaction', 'unified payments interface', 'bhaim', 'payments'],
    domain: 'technology',
    parents: ['technology'],
    children: [],
    related: [
      { id: 'technology', type: 'part-of', weight: 0.85 },
      { id: 'fintech', type: 'enables', weight: 0.9 },
      { id: 'npci', type: 'operated-by', weight: 0.9 },
      { id: 'rbi', type: 'regulated-by', weight: 0.7 },
      { id: 'financial-inclusion', type: 'promotes', weight: 0.85 },
      { id: 'rural-economy', type: 'transforms', weight: 0.6 },
    ],
    entityAssociations: [{ id: 'digital-payments-boom', type: 'story' }, { id: 'npci', type: 'entity' }, { id: 'rbi', type: 'entity' }],
  },
  {
    id: 'fintech',
    label: 'Fintech',
    aliases: ['financial technology', 'digital finance', 'payments bank', 'digital lending', 'financial innovation'],
    domain: 'technology',
    parents: ['technology'],
    children: [],
    related: [
      { id: 'technology', type: 'part-of', weight: 0.85 },
      { id: 'digital-payments', type: 'includes', weight: 0.9 },
      { id: 'financial-inclusion', type: 'enables', weight: 0.8 },
      { id: 'rbi', type: 'regulates', weight: 0.7 },
    ],
    entityAssociations: [],
  },
  {
    id: 'digital-india',
    label: 'Digital India',
    aliases: ['digital india programme', 'e-governance', 'digital governance', 'online services', 'digilocker', 'aadhaar'],
    domain: 'technology',
    parents: ['technology'],
    children: [],
    related: [
      { id: 'technology', type: 'programme', weight: 0.8 },
      { id: 'digital-payments', type: 'component', weight: 0.7 },
      { id: 'government-schemes', type: 'includes', weight: 0.7 },
    ],
    entityAssociations: [],
  },

  // ── Financial Inclusion ──────────────────────────────────────────
  {
    id: 'financial-inclusion',
    label: 'Financial Inclusion',
    aliases: ['banking access', 'jan dhan', 'financial access', 'banking unbanked', 'financial literacy'],
    domain: 'economy',
    parents: [],
    children: [],
    related: [
      { id: 'digital-payments', type: 'enables', weight: 0.85 },
      { id: 'rural-finance', type: 'promotes', weight: 0.85 },
      { id: 'npci', type: 'facilitates', weight: 0.7 },
      { id: 'rbi', type: 'promotes', weight: 0.6 },
    ],
    entityAssociations: [],
  },

  // ── Governance & Policy ──────────────────────────────────────────
  {
    id: 'governance',
    label: 'Governance',
    aliases: ['governance india', 'public administration', 'government functioning', 'shasan'],
    domain: 'governance',
    parents: [],
    children: ['policy', 'government-schemes', 'state-funding', 'legislation'],
    related: [{ id: 'economy', type: 'impacts', weight: 0.6 }],
    entityAssociations: [],
  },
  {
    id: 'policy',
    label: 'Policy',
    aliases: ['government policy', 'public policy', 'policy making', 'niti', 'policy analysis'],
    domain: 'governance',
    parents: ['governance'],
    children: ['agriculture-policy'],
    related: [
      { id: 'governance', type: 'part-of', weight: 0.9 },
      { id: 'government-schemes', type: 'implements', weight: 0.85 },
      { id: 'state-funding', type: 'enables', weight: 0.75 },
      { id: 'legislation', type: 'informs', weight: 0.7 },
      { id: 'supreme-court', type: 'reviews', weight: 0.6 },
    ],
    entityAssociations: [],
  },
  {
    id: 'government-schemes',
    label: 'Government Schemes',
    aliases: ['yojana', 'government program', 'central scheme', 'centrally sponsored scheme', 'govt scheme', 'welfare scheme', 'sarkari yojana'],
    domain: 'governance',
    parents: ['governance'],
    children: [],
    related: [
      { id: 'governance', type: 'part-of', weight: 0.85 },
      { id: 'policy', type: 'implements', weight: 0.85 },
      { id: 'budget', type: 'funds', weight: 0.9 },
      { id: 'state-funding', type: 'co-funded', weight: 0.8 },
      { id: 'mgnrega', type: 'is-a', weight: 0.9 },
      { id: 'crop-insurance', type: 'is-a', weight: 0.85 },
    ],
    entityAssociations: [],
  },
  {
    id: 'state-funding',
    label: 'State Funding',
    aliases: ['state share', 'center-state funding', 'state budget', 'state government funding', 'central assistance', 'state contribution', 'center-state finance'],
    domain: 'governance',
    parents: ['governance'],
    children: [],
    related: [
      { id: 'governance', type: 'part-of', weight: 0.8 },
      { id: 'budget', type: 'allocated-via', weight: 0.9 },
      { id: 'government-schemes', type: 'co-funds', weight: 0.85 },
      { id: 'mgnrega', type: 'funds', weight: 0.75 },
      { id: 'crop-insurance', type: 'co-funds', weight: 0.8 },
      { id: 'fiscal-policy', type: 'determines', weight: 0.75 },
      { id: 'claims', type: 'uses', weight: 0.6 },
    ],
    entityAssociations: [],
  },
  {
    id: 'legislation',
    label: 'Legislation',
    aliases: ['act', 'law', 'parliament bill', 'ordinance', 'legal framework', 'statute'],
    domain: 'governance',
    parents: ['governance'],
    children: [],
    related: [
      { id: 'governance', type: 'part-of', weight: 0.85 },
      { id: 'policy', type: 'informs', weight: 0.8 },
      { id: 'supreme-court', type: 'interprets', weight: 0.7 },
      { id: 'court-cases', type: 'tested-in', weight: 0.6 },
      { id: 'mgnrega', type: 'enacted-as', weight: 0.8 },
    ],
    entityAssociations: [],
  },

  // ── Legal & Judiciary ────────────────────────────────────────────
  {
    id: 'legal',
    label: 'Legal & Judiciary',
    aliases: ['legal system', 'judiciary', 'judicial', 'law and order', 'nyay'],
    domain: 'legal',
    parents: [],
    children: ['supreme-court', 'court-cases', 'constitutional-law', 'legal-rights'],
    related: [{ id: 'governance', type: 'oversees', weight: 0.6 }],
    entityAssociations: [],
  },
  {
    id: 'supreme-court',
    label: 'Supreme Court',
    aliases: ['sc', 'supreme court of india', 'apex court', 'chief justice', 'constitution bench', 'sc judgment', 'supreme court judgment'],
    domain: 'legal',
    parents: ['legal'],
    children: [],
    related: [
      { id: 'legal', type: 'apex-body', weight: 0.9 },
      { id: 'court-cases', type: 'hears', weight: 0.9 },
      { id: 'constitutional-law', type: 'interprets', weight: 0.85 },
      { id: 'legislation', type: 'reviews', weight: 0.7 },
      { id: 'policy', type: 'reviews', weight: 0.6 },
      { id: 'labour', type: 'protects', weight: 0.5 },
    ],
    entityAssociations: [],
  },
  {
    id: 'court-cases',
    label: 'Court Cases',
    aliases: ['litigation', 'legal case', 'petition', 'case law', 'judgment', 'lawsuit', 'public interest litigation', 'pil', 'legal dispute'],
    domain: 'legal',
    parents: ['legal'],
    children: [],
    related: [
      { id: 'legal', type: 'part-of', weight: 0.9 },
      { id: 'supreme-court', type: 'decided-by', weight: 0.85 },
      { id: 'constitutional-law', type: 'based-on', weight: 0.7 },
      { id: 'policy', type: 'challenges', weight: 0.6 },
      { id: 'labour', type: 'concerns', weight: 0.6 },
      { id: 'claims', type: 'involves', weight: 0.5 },
    ],
    entityAssociations: [],
  },
  {
    id: 'constitutional-law',
    label: 'Constitutional Law',
    aliases: ['constitution', 'constitutional', 'fundamental rights', 'constitutional provisions', 'indian constitution', 'samvidhan'],
    domain: 'legal',
    parents: ['legal'],
    children: [],
    related: [
      { id: 'legal', type: 'foundation', weight: 0.9 },
      { id: 'supreme-court', type: 'interprets', weight: 0.85 },
      { id: 'court-cases', type: 'invokes', weight: 0.7 },
      { id: 'legal-rights', type: 'guarantees', weight: 0.8 },
    ],
    entityAssociations: [],
  },
  {
    id: 'legal-rights',
    label: 'Legal Rights',
    aliases: ['rights', 'human rights', 'fundamental rights', 'legal entitlements', 'adikar'],
    domain: 'legal',
    parents: ['legal'],
    children: [],
    related: [
      { id: 'legal', type: 'part-of', weight: 0.8 },
      { id: 'constitutional-law', type: 'guaranteed-by', weight: 0.85 },
      { id: 'court-cases', type: 'enforced-via', weight: 0.7 },
      { id: 'labour', type: 'protects', weight: 0.6 },
    ],
    entityAssociations: [],
  },

  // ── Claims & Entitlements ────────────────────────────────────────
  {
    id: 'claims',
    label: 'Claims & Entitlements',
    aliases: ['insurance claims', 'claim settlement', 'benefits', 'entitlements', 'payout', 'dues'],
    domain: 'governance',
    parents: [],
    children: [],
    related: [
      { id: 'crop-insurance', type: 'payout', weight: 0.9 },
      { id: 'state-funding', type: 'enables', weight: 0.6 },
      { id: 'court-cases', type: 'disputed-in', weight: 0.5 },
      { id: 'government-schemes', type: 'provides', weight: 0.7 },
    ],
    entityAssociations: [{ id: 'pm-fasal-bima-claims', type: 'story' }],
  },

  // ── Institutions ─────────────────────────────────────────────────
  {
    id: 'rbi',
    label: 'Reserve Bank of India',
    aliases: ['rbi', 'central bank', 'reserve bank', 'bhartiya reserve bank'],
    domain: 'institutions',
    parents: [],
    children: [],
    related: [
      { id: 'monetary-policy', type: 'sets', weight: 0.9 },
      { id: 'inflation', type: 'controls', weight: 0.85 },
      { id: 'digital-payments', type: 'regulates', weight: 0.7 },
      { id: 'financial-inclusion', type: 'promotes', weight: 0.6 },
    ],
    entityAssociations: [{ id: 'rbi', type: 'entity' }],
  },
  {
    id: 'npci',
    label: 'NPCI',
    aliases: ['national payments corporation', 'payments corporation', 'npci india'],
    domain: 'institutions',
    parents: [],
    children: [],
    related: [
      { id: 'digital-payments', type: 'operates', weight: 0.95 },
      { id: 'fintech', type: 'enables', weight: 0.8 },
      { id: 'rbi', type: 'overseen-by', weight: 0.6 },
    ],
    entityAssociations: [{ id: 'npci', type: 'entity' }],
  },
  {
    id: 'cag',
    label: 'CAG',
    aliases: ['comptroller and auditor general', 'auditor general', 'cag india', 'government audit'],
    domain: 'institutions',
    parents: [],
    children: [],
    related: [
      { id: 'governance', type: 'audits', weight: 0.8 },
      { id: 'budget', type: 'audits', weight: 0.7 },
      { id: 'government-schemes', type: 'audits', weight: 0.7 },
      { id: 'claims', type: 'investigated-by', weight: 0.6 },
    ],
    entityAssociations: [{ id: 'cag', type: 'entity' }],
  },
  {
    id: 'ministry-of-rural-development',
    label: 'Ministry of Rural Development',
    aliases: ['mord', 'rural development ministry', 'rural ministry'],
    domain: 'institutions',
    parents: [],
    children: [],
    related: [
      { id: 'mgnrega', type: 'implements', weight: 0.9 },
      { id: 'rural-development', type: 'governs', weight: 0.95 },
    ],
    entityAssociations: [{ id: 'ministry-of-rural-development', type: 'entity' }],
  },
  {
    id: 'ministry-of-agriculture',
    label: 'Ministry of Agriculture',
    aliases: ['agriculture ministry', 'moa', 'ministry of agriculture and farmers welfare'],
    domain: 'institutions',
    parents: [],
    children: [],
    related: [
      { id: 'agriculture', type: 'governs', weight: 0.95 },
      { id: 'crop-insurance', type: 'implements', weight: 0.9 },
      { id: 'farmer-welfare', type: 'responsible', weight: 0.85 },
    ],
    entityAssociations: [{ id: 'ministry-of-agriculture', type: 'entity' }],
  },

  // ── Living Standards ─────────────────────────────────────────────
  {
    id: 'living-standards',
    label: 'Living Standards',
    aliases: ['standard of living', 'quality of life', 'poverty', 'wellbeing', 'poverty line', 'below poverty line', 'bpl'],
    domain: 'social-welfare',
    parents: [],
    children: [],
    related: [
      { id: 'employment', type: 'improves', weight: 0.8 },
      { id: 'wages', type: 'determines', weight: 0.7 },
      { id: 'rural-economy', type: 'impacts', weight: 0.7 },
      { id: 'government-schemes', type: 'improves', weight: 0.6 },
    ],
    entityAssociations: [],
  },

  // ── Infrastructure ───────────────────────────────────────────────
  {
    id: 'infrastructure',
    label: 'Infrastructure',
    aliases: ['infra', 'basic infrastructure', 'physical infrastructure'],
    domain: 'infrastructure',
    parents: [],
    children: ['rural-infrastructure'],
    related: [
      { id: 'economy', type: 'enables', weight: 0.7 },
      { id: 'budget', type: 'funds', weight: 0.7 },
      { id: 'employment', type: 'creates', weight: 0.6 },
    ],
    entityAssociations: [],
  },
];

/* ── Build Indexes ───────────────────────────────────────────────────── */

const conceptMap = new Map<string, Concept>();
const aliasIndex = new Map<string, string[]>();
const domainIndex = new Map<string, Concept[]>();

export function buildIndexes() {
  for (const c of rawConcepts) {
    conceptMap.set(c.id, c);

    const allAliases = [c.label.toLowerCase(), ...c.aliases.map(a => a.toLowerCase())];
    for (const alias of allAliases) {
      const existing = aliasIndex.get(alias) || [];
      existing.push(c.id);
      aliasIndex.set(alias, existing);
    }

    const domainConcepts = domainIndex.get(c.domain) || [];
    domainConcepts.push(c);
    domainIndex.set(c.domain, domainConcepts);
  }
}

buildIndexes();

/* ── Public API ───────────────────────────────────────────────────────── */

export function getConcept(id: string): Concept | undefined {
  return conceptMap.get(id);
}

export function getAllConcepts(): Concept[] {
  return rawConcepts;
}

export function findConceptsByAlias(text: string): Concept[] {
  const lower = text.toLowerCase();
  const matched: Set<string> = new Set();
  const results: Concept[] = [];

  for (const [alias, ids] of aliasIndex) {
    if (lower.includes(alias) || alias.includes(lower)) {
      for (const id of ids) {
        if (!matched.has(id)) {
          matched.add(id);
          const c = conceptMap.get(id);
          if (c) results.push(c);
        }
      }
    }
  }

  return results;
}

export function expandConcept(conceptId: string, depth: number = 1): Set<string> {
  const visited = new Set<string>();
  const queue: Array<{ id: string; d: number }> = [{ id: conceptId, d: 0 }];

  while (queue.length > 0) {
    const entry = queue.shift();
    if (!entry) continue;
    const { id, d } = entry;
    if (visited.has(id) || d > depth) continue;
    visited.add(id);

    const c = conceptMap.get(id);
    if (!c) continue;

    // Traverse children
    for (const childId of c.children) {
      if (!visited.has(childId)) queue.push({ id: childId, d: d + 1 });
    }

    // Traverse parents
    for (const parentId of c.parents) {
      if (!visited.has(parentId)) queue.push({ id: parentId, d: d + 1 });
    }

    // Traverse related concepts
    for (const rel of c.related) {
      if (!visited.has(rel.id)) queue.push({ id: rel.id, d: d + 1 });
    }
  }

  return visited;
}

export function getConceptPath(fromId: string, toId: string, maxDepth: number = 4): string[] | null {
  if (fromId === toId) return [fromId];

  const queue: Array<{ id: string; path: string[] }> = [{ id: fromId, path: [fromId] }];
  const visited = new Set<string>();

  while (queue.length > 0) {
    const entry = queue.shift();
    if (!entry) continue;
    const { id, path } = entry;
    if (path.length > maxDepth) continue;
    if (visited.has(id)) continue;
    visited.add(id);

    const c = conceptMap.get(id);
    if (!c) continue;

    const neighbors = [...c.parents, ...c.children, ...c.related.map(r => r.id)];
    for (const nId of neighbors) {
      if (nId === toId) return [...path, nId];
      if (!visited.has(nId)) {
        queue.push({ id: nId, path: [...path, nId] });
      }
    }
  }

  return null;
}
