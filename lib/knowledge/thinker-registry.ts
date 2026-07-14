import type { CanonicalThinker } from '@/types/canonical';

const thinkers = new Map<string, CanonicalThinker>();

export function getThinker(id: string): CanonicalThinker | undefined {
  return thinkers.get(id);
}

export function getAllThinkers(): CanonicalThinker[] {
  return Array.from(thinkers.values());
}

export function getThinkersByConcept(conceptId: string): CanonicalThinker[] {
  return Array.from(thinkers.values()).filter(
    t => t.conceptIds.includes(conceptId)
  );
}

export function registerThinker(thinker: CanonicalThinker): void {
  thinkers.set(thinker.id, thinker);
}

export function seedThinkers(): void {
  const seed: CanonicalThinker[] = [
    {
      id: 'thinker.nehru',
      name: 'Jawaharlal Nehru',
      school: 'Non-Alignment / Liberal Internationalism',
      birthYear: 1889,
      deathYear: 1964,
      corePrinciples: [
        'National sovereignty must not be compromised by alliance with either Cold War bloc',
        'International institutions are the proper forum for dispute resolution',
        'Economic development is prerequisite for strategic independence',
        'Secularism at home enables credibility abroad',
        'Colonialism and racialism are moral evils to be opposed universally',
        'Asian solidarity provides a counterweight to European and American dominance',
      ],
      arguments: [
        {
          title: 'Non-Alignment as Strategic Autonomy',
          summary: 'Nehru argued that India could best serve its national interest by avoiding formal military alliances with either the US or the Soviet Union.',
          supportingEvidence: [
            { sourceId: 's1', relevance: 'direct', excerpt: 'Non-alignment preserved India\'s freedom of action in a bipolar world.' },
          ],
        },
        {
          title: 'International Institutions as a Forum',
          summary: 'Nehru believed that international law and the UN could resolve disputes impartially.',
          supportingEvidence: [
            { sourceId: 's6', relevance: 'direct', excerpt: 'India referred Kashmir to the UN based on a genuine belief in international arbitration.' },
          ],
        },
      ],
      criticism: [
        {
          title: 'Non-Alignment as Moral Posturing',
          summary: 'Critics argue non-alignment gave India rhetorical cover without strategic substance.',
          counterarguments: [
            { sourceId: 's1', relevance: 'supporting', excerpt: 'Non-alignment preserved strategic autonomy and maximized aid from both blocs.' },
          ],
        },
      ],
      quoteIds: [],
      bookIds: ['The Discovery of India', 'An Autobiography'],
      chapterIds: ['kl-ch-1'],
      conceptIds: ['con-non-alignment', 'con-strategic-autonomy', 'con-secular-nationalism', 'con-united-nations', 'con-panchsheel'],
    },
    {
      id: 'thinker.patel',
      name: 'Sardar Vallabhbhai Patel',
      school: 'Practical Nationalism / State-Building Realism',
      birthYear: 1875,
      deathYear: 1950,
      corePrinciples: [
        'National unity must be secured through decisive administrative action, not diplomatic idealism',
        'Pakistan is a hostile state and should be treated as such — no concessions on Kashmir or assets',
        'Princely states must be integrated through a combination of diplomacy and coercive pressure',
        'A strong centralized state with a unified military is essential for India\'s survival',
        'Secularism is a political necessity — India must protect its Muslim minority to maintain credibility',
      ],
      arguments: [
        {
          title: 'Integration of Princely States',
          summary: 'Patel, with V.P. Menon as his deputy, orchestrated the integration of 565 princely states through a policy of surrender of power agreements backed by implicit military threat.',
          supportingEvidence: [
            { sourceId: 's18', relevance: 'direct', excerpt: 'Menon\'s account details how Patel used diplomatic persuasion, financial pressure, and military threat to integrate the princely states.' },
          ],
        },
        {
          title: 'Hard Line on Pakistan',
          summary: 'Patel advocated a harder line on Pakistan than Nehru, arguing India should not negotiate with a state created by Partition and should withhold assets until Kashmir was resolved.',
          supportingEvidence: [
            { sourceId: 's1', relevance: 'direct', excerpt: 'Patel favored a more assertive posture toward Pakistan, arguing India should not reward Pakistan\'s creation by being conciliatory.' },
          ],
        },
      ],
      criticism: [
        {
          title: 'Authoritarian Tendencies',
          summary: 'Critics argue Patel\'s approach to state-building was authoritarian, centralizing power in Delhi and suppressing regional dissent in the name of national unity.',
          counterarguments: [
            { sourceId: 's1', relevance: 'supporting', excerpt: 'The integration of princely states was widely supported as necessary for national survival, and Patel acted with the authority of the Constituent Assembly.' },
          ],
        },
        {
          title: 'Communal Leanings',
          summary: 'Some historians argue Patel was more sympathetic to Hindu nationalism than Nehru, and his hardline approach to Pakistan exacerbated communal tensions.',
          counterarguments: [
            { sourceId: 's1', relevance: 'supporting', excerpt: 'Patel worked closely with Nehru on secular policies and was committed to protecting Muslim rights in India.' },
          ],
        },
      ],
      quoteIds: [],
      bookIds: ['Sardar Patel: A Biography by Rajmohan Gandhi', 'Patel: A Life by N.V. Rajkumar'],
      chapterIds: ['kl-ch-1'],
      conceptIds: ['con-partition', 'con-secular-nationalism', 'con-strategic-autonomy'],
    },
    {
      id: 'thinker.jinnah',
      name: 'Muhammad Ali Jinnah',
      school: 'Two-Nation Theory / Muslim Nationalism',
      birthYear: 1876,
      deathYear: 1948,
      corePrinciples: [
        'Hindus and Muslims constitute two distinct nations with separate identities, cultures, and histories',
        'Muslims require a separate homeland to protect their political, economic, and cultural rights',
        'Pakistan must be a democratic state where all citizens have equal rights',
        'Kashmir, as a Muslim-majority state, rightfully belongs to Pakistan',
        'The British cannot be trusted to protect Muslim interests — Muslims must secure their own future',
      ],
      arguments: [
        {
          title: 'Two-Nation Theory',
          summary: 'Jinnah argued Hindus and Muslims were two distinct nations who could not coexist in a single democratic state, as majority rule would permanently subordinate Muslim interests.',
          supportingEvidence: [
            { sourceId: 's17', relevance: 'direct', excerpt: 'Jalal argues that Jinnah used the Two-Nation theory strategically to demand parity for Muslims rather than necessarily seeking partition.' },
          ],
        },
        {
          title: 'Kashmir Claim',
          summary: 'Jinnah maintained that Kashmir, as a Muslim-majority state contiguous to Pakistan, should have acceded to Pakistan, and that the Maharaja\'s accession to India was illegal.',
          supportingEvidence: [
            { sourceId: 's1', relevance: 'direct', excerpt: 'Jinnah refused to accept Kashmir\'s accession to India and ordered Pakistani troops to support the tribal invasion.' },
          ],
        },
      ],
      criticism: [
        {
          title: 'Ambiguous Intentions',
          summary: 'Some historians argue Jinnah never clearly intended to create Pakistan but used it as a bargaining chip for Muslim autonomy within a united India.',
          counterarguments: [
            { sourceId: 's17', relevance: 'supporting', excerpt: 'Jalal\'s revisionist account suggests Jinnah was a constitutionalist who preferred a negotiated settlement within a united India.' },
          ],
        },
      ],
      quoteIds: [],
      bookIds: ['Pakistan: A Personal History by Imran Khan', 'Jinnah: India-Partition-Independence by Jaswant Singh'],
      chapterIds: ['kl-ch-1'],
      conceptIds: ['con-two-nation-theory', 'con-partition', 'con-kashmir'],
    },
    {
      id: 'thinker.gandhi',
      name: 'Mahatma Gandhi',
      school: 'Non-Violence / Composite Nationalism',
      birthYear: 1869,
      deathYear: 1948,
      corePrinciples: [
        'India is a composite nation of multiple religions and cultures that should not be divided',
        'Non-violence (ahimsa) must guide both domestic politics and foreign policy',
        'Religious conversion through force or inducement is immoral',
        'Village self-rule (gram swaraj) is the foundation of Indian democracy',
        'Hindu-Muslim unity is essential for India\'s moral and political integrity',
      ],
      arguments: [
        {
          title: 'Against Partition',
          summary: 'Gandhi opposed Partition to the very end, arguing it would institutionalize religious division and create permanent conflict.',
          supportingEvidence: [
            { sourceId: 's1', relevance: 'direct', excerpt: 'Gandhi opposed the partition of India and was heartbroken by the communal violence that accompanied it.' },
          ],
        },
      ],
      criticism: [
        {
          title: 'Political Naivety',
          summary: 'Critics argue Gandhi\'s opposition to Partition was unrealistic and his insistence on non-violence limited India\'s ability to defend itself.',
          counterarguments: [
            { sourceId: 's1', relevance: 'supporting', excerpt: 'Gandhi\'s moral authority helped prevent even greater violence, and his fasts directly calmed communal tensions in Delhi and Bengal.' },
          ],
        },
      ],
      quoteIds: [],
      bookIds: ['The Story of My Experiments with Truth', 'Hind Swaraj'],
      chapterIds: ['kl-ch-1'],
      conceptIds: ['con-partition', 'con-secular-nationalism', 'con-two-nation-theory'],
    },
    {
      id: 'thinker.vp-menon',
      name: 'Vappala Pangunni Menon',
      school: 'Administrative Realism',
      birthYear: 1894,
      deathYear: 1966,
      corePrinciples: [
        'Integration of princely states requires pragmatic diplomacy backed by constitutional and political pressure',
        'Administrative continuity from British to independent India is essential for stability',
        'States must be integrated before India\'s constitution is finalized',
        'Speed in integration prevents foreign powers from exploiting divisions among Indian states',
      ],
      arguments: [
        {
          title: 'Integration through Instruments of Accession',
          summary: 'Menon designed the legal framework for princely state integration, using Instruments of Accession limited to defence, foreign affairs, and communications.',
          supportingEvidence: [
            { sourceId: 's18', relevance: 'direct', excerpt: 'Menon\'s account provides the definitive insider narrative of how integration was achieved in less than two years.' },
          ],
        },
      ],
      criticism: [],
      quoteIds: [],
      bookIds: ['The Story of the Integration of the Indian States', 'The Transfer of Power in India'],
      chapterIds: ['kl-ch-1'],
      conceptIds: ['con-partition'],
    },
  ];

  for (const t of seed) thinkers.set(t.id, t);
}
