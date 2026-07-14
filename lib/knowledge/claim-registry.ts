import type { CanonicalClaim } from '@/types/canonical';

const claims = new Map<string, CanonicalClaim>();

export function getClaim(id: string): CanonicalClaim | undefined {
  return claims.get(id);
}

export function getAllClaims(): CanonicalClaim[] {
  return Array.from(claims.values());
}

export function getClaimsByEntity(entityId: string): CanonicalClaim[] {
  return Array.from(claims.values()).filter(
    c => c.entityIds.includes(entityId)
  );
}

export function getClaimsByConcept(conceptId: string): CanonicalClaim[] {
  return Array.from(claims.values()).filter(
    c => c.conceptIds.includes(conceptId)
  );
}

export function registerClaim(claim: CanonicalClaim): void {
  claims.set(claim.id, claim);
}

export function seedClaims(): void {
  const seed: CanonicalClaim[] = [
    {
      id: 'claim.partition.security-consciousness',
      statement: 'The Partition violence created a permanent security consciousness in India\'s foreign policy establishment that persisted long after the immediate refugee crisis ended.',
      confidence: 'established',
      evidence: [
        { sourceId: 's1', relevance: 'direct', excerpt: 'The trauma of Partition embedded a deep sensitivity to any external force that could exacerbate internal religious divisions.' },
        { sourceId: 's3', relevance: 'supporting', excerpt: 'India\'s approach to Pakistan has been framed by the unfinished business of Partition from the very first day of independence.' },
      ],
      counterArguments: ['Some historians argue India\'s security consciousness predates Partition and stems from colonial-era foreign domination.'],
      sourceIds: ['s1', 's3', 's10'],
      documentIds: ['doc-nehru-tryst'],
      entityIds: ['india', 'pakistan', 'partition'],
      conceptIds: ['con-partition', 'con-two-nation-theory'],
      appearsIn: [
        { contentType: 'chapter', contentId: 'kl-ch-1', contentTitle: 'India\'s Inheritance: The Partition and Its Legacies' },
      ],
      createdAt: '2026-07-12T00:00:00Z',
      updatedAt: '2026-07-12T00:00:00Z',
      lastVerifiedAt: '2026-07-12T00:00:00Z',
    },
    {
      id: 'claim.kashmir.un-referral',
      statement: 'India\'s decision to take the Kashmir dispute to the UN reflected both Nehru\'s idealist faith in international institutions and a calculated diplomatic move to legitimize India\'s position.',
      confidence: 'established',
      evidence: [
        { sourceId: 's1', relevance: 'direct', excerpt: 'Nehru believed the UN would recognize the validity of Kashmir\'s accession to India under international law.' },
        { sourceId: 's3', relevance: 'contextual', excerpt: 'Jinnah\'s Pakistan viewed the accession as fraudulent and expected the international community to support self-determination.' },
        { sourceId: 's6', relevance: 'supporting', excerpt: 'UN Security Council Resolution 47 called for a plebiscite that was never held.' },
      ],
      counterArguments: ['Critics argue that internationalizing Kashmir was a strategic error that legitimized Pakistan\'s claim.'],
      sourceIds: ['s1', 's3', 's6', 's8'],
      documentIds: ['doc-un-res-47'],
      entityIds: ['kashmir', 'india', 'pakistan', 'jawaharlal-nehru', 'un'],
      conceptIds: ['con-kashmir', 'con-united-nations'],
      appearsIn: [
        { contentType: 'chapter', contentId: 'kl-ch-1', contentTitle: 'India\'s Inheritance: The Partition and Its Legacies' },
      ],
      createdAt: '2026-07-12T00:00:00Z',
      updatedAt: '2026-07-12T00:00:00Z',
    },
    {
      id: 'claim.nonalignment.strategic-autonomy',
      statement: 'Non-alignment was not passivity or moral posturing but an active strategy to preserve India\'s strategic autonomy in a bipolar world.',
      confidence: 'established',
      evidence: [
        { sourceId: 's1', relevance: 'direct', excerpt: 'Non-alignment preserved India\'s freedom of action and maximized aid from both Cold War blocs.' },
        { sourceId: 's7', relevance: 'supporting', excerpt: 'Nehru believed military alliances would subordinate Indian decision-making to great power interests.' },
      ],
      counterArguments: ['Critics argue non-alignment gave India rhetorical cover without strategic substance, and that India accepted aid from both superpowers while criticizing them.'],
      sourceIds: ['s1', 's7'],
      documentIds: [],
      entityIds: ['india', 'jawaharlal-nehru'],
      conceptIds: ['con-non-alignment', 'con-strategic-autonomy', 'con-cold-war'],
      appearsIn: [
        { contentType: 'chapter', contentId: 'kl-ch-1', contentTitle: 'India\'s Inheritance: The Partition and Its Legacies' },
      ],
      createdAt: '2026-07-12T00:00:00Z',
      updatedAt: '2026-07-12T00:00:00Z',
    },
    {
      id: 'claim.secular-nationalism.foreign-policy',
      statement: 'Nehru\'s commitment to secular nationalism at home was intrinsically linked to his foreign policy, enabling credibility with non-aligned nations and Muslim-majority countries.',
      confidence: 'debated',
      evidence: [
        { sourceId: 's1', relevance: 'direct', excerpt: 'India\'s secular identity was a key diplomatic asset in relations with the Arab world and Southeast Asia.' },
        { sourceId: 's4', relevance: 'contextual', excerpt: 'Nehru\'s Tryst with Destiny speech frames Indian nationalism in explicitly civic, not religious, terms.' },
      ],
      counterArguments: ['Some scholars argue that India\'s secularism was more rhetorical than substantive, and that foreign policy was driven by material interests rather than ideological commitments.'],
      sourceIds: ['s1', 's4', 's7'],
      documentIds: ['doc-nehru-tryst'],
      entityIds: ['india', 'jawaharlal-nehru'],
      conceptIds: ['con-secular-nationalism', 'con-non-alignment'],
      appearsIn: [
        { contentType: 'chapter', contentId: 'kl-ch-1', contentTitle: 'India\'s Inheritance: The Partition and Its Legacies' },
      ],
      createdAt: '2026-07-12T00:00:00Z',
      updatedAt: '2026-07-12T00:00:00Z',
    },
    {
      id: 'claim.partition.founding-trauma',
      statement: 'The Partition of 1947 constituted a foundational trauma that shaped India\'s national identity, security doctrine, and foreign policy priorities from the moment of independence.',
      confidence: 'established',
      evidence: [
        { sourceId: 's1', relevance: 'direct', excerpt: 'The trauma of Partition embedded a deep sensitivity to any external force that could exacerbate internal religious divisions.' },
        { sourceId: 's16', relevance: 'supporting', excerpt: 'Partition\'s violence and displacement left scars on the collective consciousness that influenced every dimension of state policy.' },
        { sourceId: 's21', relevance: 'direct', excerpt: 'The strategic implications of Partition — a divided subcontinent, two hostile states, a contested border — became the organizing framework of Indian security policy.' },
        { sourceId: 's22', relevance: 'supporting', excerpt: 'Nehru and Patel both recognized that Partition had fundamentally altered India\'s strategic environment and required a new framework for foreign and defence policy.' },
      ],
      counterArguments: ['Some historians argue that Partition was merely one of several formative influences, and that India\'s strategic culture was equally shaped by the colonial experience and pre-colonial traditions.'],
      sourceIds: ['s1', 's11', 's12', 's16', 's21', 's22'],
      documentIds: ['doc-independence-act'],
      entityIds: ['india', 'pakistan', 'partition'],
      conceptIds: ['con-partition'],
      appearsIn: [
        { contentType: 'chapter', contentId: 'kl-ch-1', contentTitle: 'India\'s Inheritance: Partition and Its Strategic Legacy (1947)' },
      ],
      createdAt: '2026-07-12T00:00:00Z',
      updatedAt: '2026-07-12T00:00:00Z',
      lastVerifiedAt: '2026-07-12T00:00:00Z',
    },
    {
      id: 'claim.partition.refugee-crisis',
      statement: 'The mass displacement of 12-20 million people during Partition created a refugee crisis that overwhelmed India\'s administrative capacity and shaped its domestic and foreign policy for decades.',
      confidence: 'established',
      evidence: [
        { sourceId: 's1', relevance: 'direct', excerpt: 'An estimated 12 to 15 million people crossed the new borders in both directions, making Partition the largest mass migration in human history.' },
        { sourceId: 's16', relevance: 'supporting', excerpt: 'The refugee crisis strained India\'s limited administrative and financial resources at the very moment of independence.' },
        { sourceId: 's31', relevance: 'direct', excerpt: 'Punjab and Bengal bore the brunt of the displacement, with entire communities uprooted and forced to rebuild from nothing.' },
      ],
      counterArguments: ['Some scholars note that India successfully absorbed refugees and that the crisis, while severe, was managed without state collapse, demonstrating institutional resilience rather than permanent weakness.'],
      sourceIds: ['s1', 's16', 's31'],
      documentIds: [],
      entityIds: ['india', 'pakistan', 'partition', 'punjab', 'bengal'],
      conceptIds: ['con-partition'],
      appearsIn: [
        { contentType: 'chapter', contentId: 'kl-ch-1', contentTitle: 'India\'s Inheritance: Partition and Its Strategic Legacy (1947)' },
      ],
      createdAt: '2026-07-12T00:00:00Z',
      updatedAt: '2026-07-12T00:00:00Z',
      lastVerifiedAt: '2026-07-12T00:00:00Z',
    },
    {
      id: 'claim.partition.princely-states',
      statement: 'The integration of 565 princely states into the Indian Union was a diplomatic and administrative achievement that was directly complicated by the Partition, as rulers of Muslim-majority states faced conflicting pressures.',
      confidence: 'established',
      evidence: [
        { sourceId: 's1', relevance: 'direct', excerpt: 'Sardar Patel and V.P. Menon orchestrated the integration of princely states through a combination of diplomacy, incentives, and the occasional use of force.' },
        { sourceId: 's14', relevance: 'supporting', excerpt: 'The Instrument of Accession provided a legal mechanism for integration, but the process was fraught with political complications arising from Partition.' },
        { sourceId: 's18', relevance: 'direct', excerpt: 'Kashmir, Hyderabad, and Junagadh illustrated the difficulties of integrating princely states when communal considerations and geopolitical interests intersected.' },
      ],
      counterArguments: ['Critics argue that the integration was achieved through coercion, particularly in Hyderabad, Junagadh, and Kashmir, and that the use of military force set problematic precedents.'],
      sourceIds: ['s1', 's11', 's14', 's18'],
      documentIds: ['doc-kashmir-accession'],
      entityIds: ['india', 'sardar-patel', 'v-p-menon', 'kashmir', 'hyderabad', 'junagadh'],
      conceptIds: ['con-partition', 'con-secular-nationalism'],
      appearsIn: [
        { contentType: 'chapter', contentId: 'kl-ch-1', contentTitle: 'India\'s Inheritance: Partition and Its Strategic Legacy (1947)' },
      ],
      createdAt: '2026-07-12T00:00:00Z',
      updatedAt: '2026-07-12T00:00:00Z',
      lastVerifiedAt: '2026-07-12T00:00:00Z',
    },
    {
      id: 'claim.partition.division-of-assets',
      statement: 'The partition of the British Indian Army, civil service, financial reserves, and railway system crippled India\'s institutional capacity at the moment of independence and required urgent reconstruction of national institutions.',
      confidence: 'established',
      evidence: [
        { sourceId: 's1', relevance: 'direct', excerpt: 'The division of assets left both states scrambling to rebuild administrative capacity at a time when effective governance was most urgently needed.' },
        { sourceId: 's11', relevance: 'supporting', excerpt: 'The British Indian Army was divided roughly two-thirds to one-third in India\'s favour, but the process disrupted unit cohesion and command structures.' },
        { sourceId: 's29', relevance: 'direct', excerpt: 'Financial reserves, railway networks, and the civil service were split in ways that disadvantaged both states but hit Pakistan harder due to its smaller institutional base.' },
      ],
      counterArguments: ['India inherited the bulk of the military assets, civil service institutions, and financial reserves, and the division arguably gave India a stronger institutional foundation than many post-colonial states.'],
      sourceIds: ['s1', 's11', 's13', 's29'],
      documentIds: ['doc-independence-act', 'doc-radcliffe-award'],
      entityIds: ['india', 'pakistan', 'partition', 'indian-army'],
      conceptIds: ['con-partition'],
      appearsIn: [
        { contentType: 'chapter', contentId: 'kl-ch-1', contentTitle: 'India\'s Inheritance: Partition and Its Strategic Legacy (1947)' },
      ],
      createdAt: '2026-07-12T00:00:00Z',
      updatedAt: '2026-07-12T00:00:00Z',
      lastVerifiedAt: '2026-07-12T00:00:00Z',
    },
    {
      id: 'claim.partition.security-paradigm',
      statement: 'Partition created a security paradigm that viewed Pakistan as an existential threat and directed India\'s military posture, intelligence priorities, and diplomatic strategy toward the western border for the next seven decades.',
      confidence: 'established',
      evidence: [
        { sourceId: 's21', relevance: 'direct', excerpt: 'The western border became the primary theatre of Indian military planning from 1947 onward, a reality that persisted through four wars and multiple crises.' },
        { sourceId: 's23', relevance: 'direct', excerpt: 'India\'s intelligence apparatus and military deployments were overwhelmingly oriented toward the Pakistan threat for decades after Partition.' },
        { sourceId: 's25', relevance: 'supporting', excerpt: 'The Pakistan-centric security paradigm shaped India\'s defence spending, force structure, and alliance calculations in ways that limited its strategic flexibility.' },
      ],
      counterArguments: ['Some analysts argue that India\'s security paradigm has been overly Pakistan-centric, neglecting the China threat that emerged with the 1962 war and the broader geopolitical challenges of the Indo-Pacific.'],
      sourceIds: ['s1', 's21', 's23', 's24', 's25'],
      documentIds: [],
      entityIds: ['india', 'pakistan', 'partition'],
      conceptIds: ['con-partition', 'con-cold-war'],
      appearsIn: [
        { contentType: 'chapter', contentId: 'kl-ch-1', contentTitle: 'India\'s Inheritance: Partition and Its Strategic Legacy (1947)' },
      ],
      createdAt: '2026-07-12T00:00:00Z',
      updatedAt: '2026-07-12T00:00:00Z',
      lastVerifiedAt: '2026-07-12T00:00:00Z',
    },
    {
      id: 'claim.partition.relations-pakistan-permanent',
      statement: 'The unresolved issues of Partition — Kashmir, minority rights, water-sharing, and the very legitimacy of the two-nation theory — created a permanent state of hostility between India and Pakistan that no government on either side has been able to overcome.',
      confidence: 'established',
      evidence: [
        { sourceId: 's23', relevance: 'direct', excerpt: 'Every major India-Pakistan confrontation — 1947, 1965, 1971, 1999, 2001, 2016 — can be traced directly to the unresolved legacies of Partition.' },
        { sourceId: 's28', relevance: 'supporting', excerpt: 'Water-sharing disputes over the Indus system remained a source of tension despite the Indus Waters Treaty of 1960.' },
        { sourceId: 's30', relevance: 'contextual', excerpt: 'The two-nation theory that justified Partition continued to undermine the possibility of normalized relations by denying the shared heritage of both nations.' },
      ],
      counterArguments: ['There were periods of détente (Simla 1972, Agra 2001, composite dialogue 2004-2008) that demonstrate the hostility is not permanent but contingent on political will and leadership on both sides.'],
      sourceIds: ['s23', 's25', 's28', 's30'],
      documentIds: [],
      entityIds: ['india', 'pakistan', 'partition', 'kashmir'],
      conceptIds: ['con-partition', 'con-kashmir', 'con-two-nation-theory'],
      appearsIn: [
        { contentType: 'chapter', contentId: 'kl-ch-1', contentTitle: 'India\'s Inheritance: Partition and Its Strategic Legacy (1947)' },
      ],
      createdAt: '2026-07-12T00:00:00Z',
      updatedAt: '2026-07-12T00:00:00Z',
      lastVerifiedAt: '2026-07-12T00:00:00Z',
    },
    {
      id: 'claim.partition.kashmir-unfinished',
      statement: 'Kashmir became the unfinished business of Partition — a territorial dispute that symbolized the failure of both the two-nation theory and the secular nationalist vision, and that has defied resolution for over seven decades.',
      confidence: 'established',
      evidence: [
        { sourceId: 's21', relevance: 'direct', excerpt: 'Kashmir\'s contested status was a direct consequence of Partition\'s incomplete resolution of the communal question in princely states.' },
        { sourceId: 's23', relevance: 'supporting', excerpt: 'The Kashmir dispute has been the primary irritant in India-Pakistan relations and the most persistent legacy of Partition.' },
        { sourceId: 's6', relevance: 'supporting', excerpt: 'UN Security Council Resolution 47 called for a plebiscite, entrenching the international dimension of the dispute.' },
      ],
      counterArguments: ['India maintains that the Instrument of Accession resolved the legal status of Kashmir and that Pakistan\'s claim is based on an illegitimate invasion. From this perspective, there is no "unfinished business" — only Pakistan\'s refusal to accept reality.'],
      sourceIds: ['s1', 's6', 's8', 's21', 's23'],
      documentIds: ['doc-kashmir-accession', 'doc-un-res-47'],
      entityIds: ['kashmir', 'india', 'pakistan', 'hari-singh', 'sheikh-abdullah', 'jawaharlal-nehru'],
      conceptIds: ['con-kashmir', 'con-partition', 'con-united-nations'],
      appearsIn: [
        { contentType: 'chapter', contentId: 'kl-ch-1', contentTitle: 'India\'s Inheritance: Partition and Its Strategic Legacy (1947)' },
      ],
      createdAt: '2026-07-12T00:00:00Z',
      updatedAt: '2026-07-12T00:00:00Z',
      lastVerifiedAt: '2026-07-12T00:00:00Z',
    },
    {
      id: 'claim.partition.minorities',
      statement: 'The fate of religious minorities in both India and Pakistan became a foreign policy issue from the first days of independence, with each state using the treatment of minorities as a diplomatic lever against the other.',
      confidence: 'established',
      evidence: [
        { sourceId: 's1', relevance: 'direct', excerpt: 'The protection of minorities on both sides of the border became an immediate diplomatic concern, with both governments accusing each other of persecution.' },
        { sourceId: 's15', relevance: 'supporting', excerpt: 'The Liaquat-Nehru Pact of 1950 attempted to address minority rights but failed to resolve the underlying tensions.' },
        { sourceId: 's16', relevance: 'contextual', excerpt: 'Minority populations in both countries became pawns in the larger India-Pakistan rivalry, their fate dictated by geopolitical calculations as much as domestic policy.' },
      ],
      counterArguments: ['India\'s commitment to secularism and minority protection was genuine, not merely instrumental, and India\'s treatment of its Muslim minority compares favorably to Pakistan\'s treatment of its Hindu minority.'],
      sourceIds: ['s1', 's15', 's16'],
      documentIds: ['doc-liaquat-nehru-pact'],
      entityIds: ['india', 'pakistan', 'partition'],
      conceptIds: ['con-partition', 'con-secular-nationalism', 'con-two-nation-theory'],
      appearsIn: [
        { contentType: 'chapter', contentId: 'kl-ch-1', contentTitle: 'India\'s Inheritance: Partition and Its Strategic Legacy (1947)' },
      ],
      createdAt: '2026-07-12T00:00:00Z',
      updatedAt: '2026-07-12T00:00:00Z',
      lastVerifiedAt: '2026-07-12T00:00:00Z',
    },
    {
      id: 'claim.partition.demographic-impact',
      statement: 'Partition fundamentally altered the demographic composition of Punjab and Bengal, creating new majority-minority dynamics that reshaped regional politics and cross-border relations.',
      confidence: 'established',
      evidence: [
        { sourceId: 's27', relevance: 'direct', excerpt: 'West Punjab\'s Muslim-majority population was almost entirely replaced by Hindu and Sikh refugees from East Punjab, while East Punjab\'s Sikhs and Hindus were displaced westward.' },
        { sourceId: 's26', relevance: 'supporting', excerpt: 'Bengal\'s partition created similar demographic upheaval, with millions crossing in both directions and permanently altering the character of communities on both sides of the border.' },
        { sourceId: 's1', relevance: 'direct', excerpt: 'The demographic transformation of border provinces created new political realities that neither India nor Pakistan had anticipated or planned for.' },
      ],
      counterArguments: [],
      sourceIds: ['s1', 's9', 's26', 's27'],
      documentIds: [],
      entityIds: ['india', 'pakistan', 'punjab', 'bengal'],
      conceptIds: ['con-partition'],
      appearsIn: [
        { contentType: 'chapter', contentId: 'kl-ch-1', contentTitle: 'India\'s Inheritance: Partition and Its Strategic Legacy (1947)' },
      ],
      createdAt: '2026-07-12T00:00:00Z',
      updatedAt: '2026-07-12T00:00:00Z',
      lastVerifiedAt: '2026-07-12T00:00:00Z',
    },
    {
      id: 'claim.partition.violence-civil-society',
      statement: 'The genocidal violence of Partition — including mass killing, sexual violence, forced conversion, and abduction — destroyed the pluralistic social fabric of mixed communities and created lasting trauma that continues to affect India-Pakistan relations.',
      confidence: 'established',
      evidence: [
        { sourceId: 's19', relevance: 'direct', excerpt: 'Partition violence claimed an estimated one to two million lives and left an indelible mark on the collective memory of both nations.' },
        { sourceId: 's20', relevance: 'direct', excerpt: 'The scale of sexual violence during Partition — estimated at 75,000 to 100,000 women abducted — created a gendered trauma that shaped state policy on both sides.' },
        { sourceId: 's27', relevance: 'supporting', excerpt: 'The destruction of mixed communities in Punjab and Bengal eliminated the lived experience of coexistence that had sustained pluralistic society for centuries.' },
      ],
      counterArguments: ['Some historians caution against overstating the scale of violence, noting that large parts of India (the south, the west coast, most of the central provinces) experienced no communal violence during Partition.'],
      sourceIds: ['s10', 's16', 's19', 's20', 's27'],
      documentIds: [],
      entityIds: ['india', 'pakistan', 'partition', 'punjab', 'bengal'],
      conceptIds: ['con-partition'],
      appearsIn: [
        { contentType: 'chapter', contentId: 'kl-ch-1', contentTitle: 'India\'s Inheritance: Partition and Its Strategic Legacy (1947)' },
      ],
      createdAt: '2026-07-12T00:00:00Z',
      updatedAt: '2026-07-12T00:00:00Z',
      lastVerifiedAt: '2026-07-12T00:00:00Z',
    },
    {
      id: 'claim.partition.nehru-patel-dynamic',
      statement: 'The differing worldviews of Nehru and Patel — Nehru\'s internationalist secularism versus Patel\'s practical nationalism — created a productive tension in India\'s early foreign policy that balanced idealism with realism.',
      confidence: 'debated',
      evidence: [
        { sourceId: 's1', relevance: 'direct', excerpt: 'Nehru and Patel disagreed on approaches to Pakistan, Kashmir, and the pace of integration of princely states, but their disagreements were framed within shared commitment to national unity.' },
        { sourceId: 's17', relevance: 'supporting', excerpt: 'Patel\'s skepticism of Nehru\'s idealism provided a counterweight that grounded Indian foreign policy in strategic realism without abandoning its democratic principles.' },
        { sourceId: 's22', relevance: 'contextual', excerpt: 'The Nehru-Patel dynamic reflected a broader tension within the Indian independence movement between ideological aspiration and practical governance.' },
      ],
      counterArguments: ['Some scholars argue that the differences between Nehru and Patel have been exaggerated and that they agreed on fundamental principles, disagreeing mainly on tactics and emphasis.'],
      sourceIds: ['s1', 's17', 's22'],
      documentIds: [],
      entityIds: ['jawaharlal-nehru', 'sardar-patel', 'india'],
      conceptIds: ['con-non-alignment', 'con-secular-nationalism', 'con-strategic-autonomy'],
      appearsIn: [
        { contentType: 'chapter', contentId: 'kl-ch-1', contentTitle: 'India\'s Inheritance: Partition and Its Strategic Legacy (1947)' },
      ],
      createdAt: '2026-07-12T00:00:00Z',
      updatedAt: '2026-07-12T00:00:00Z',
      lastVerifiedAt: '2026-07-12T00:00:00Z',
    },
    {
      id: 'claim.partition.economic-impact',
      statement: 'Partition imposed severe economic costs on India — including the loss of key agricultural regions (the rich cotton and wheat lands of West Punjab), disruption of trade networks, and the burden of refugee rehabilitation — that constrained India\'s developmental ambitions and foreign policy options.',
      confidence: 'established',
      evidence: [
        { sourceId: 's1', relevance: 'direct', excerpt: 'India lost significant agricultural output and industrial capacity to Pakistan, while bearing the enormous cost of rehabilitating millions of refugees.' },
        { sourceId: 's11', relevance: 'supporting', excerpt: 'The economic disruption of Partition set back India\'s development plans and forced the new government to prioritize stabilization over growth in the early years.' },
        { sourceId: 's3', relevance: 'contextual', excerpt: 'The financial burden of Partition — refugee rehabilitation, military build-up, institutional reconstruction — shaped India\'s fiscal policy for decades.' },
      ],
      counterArguments: [],
      sourceIds: ['s1', 's3', 's11'],
      documentIds: ['doc-independence-act'],
      entityIds: ['india', 'pakistan', 'punjab', 'bengal', 'partition'],
      conceptIds: ['con-partition'],
      appearsIn: [
        { contentType: 'chapter', contentId: 'kl-ch-1', contentTitle: 'India\'s Inheritance: Partition and Its Strategic Legacy (1947)' },
      ],
      createdAt: '2026-07-12T00:00:00Z',
      updatedAt: '2026-07-12T00:00:00Z',
      lastVerifiedAt: '2026-07-12T00:00:00Z',
    },
    {
      id: 'claim.partition.avoidable',
      statement: 'The question of whether Partition was avoidable remains one of the most contentious historiographical debates, with implications for how India understands its own origins and its relationship with Pakistan.',
      confidence: 'debated',
      evidence: [
        { sourceId: 's17', relevance: 'direct', excerpt: 'Historians remain divided on whether Partition was inevitable once the British adopted divide-and-rule policies, or whether it resulted from specific political failures in the 1930s and 1940s.' },
        { sourceId: 's26', relevance: 'supporting', excerpt: 'The communal violence of 1946-47, particularly the Great Calcutta Killings, created conditions that made Partition increasingly difficult to avoid.' },
        { sourceId: 's22', relevance: 'contextual', excerpt: 'The failure of the Cabinet Mission Plan of 1946 represented the last realistic opportunity to preserve Indian unity, and its collapse has been attributed to miscalculations by multiple parties.' },
      ],
      counterArguments: ['The nationalist school argues Partition was inevitable once the British adopted divide-and-rule policies; the revisionist school argues that political miscalculations by Congress leadership made it avoidable.'],
      sourceIds: ['s17', 's22', 's26'],
      documentIds: [],
      entityIds: ['india', 'pakistan', 'british-empire', 'partition', 'jawaharlal-nehru', 'mohammad-ali-jinnah'],
      conceptIds: ['con-partition', 'con-two-nation-theory'],
      appearsIn: [
        { contentType: 'chapter', contentId: 'kl-ch-1', contentTitle: 'India\'s Inheritance: Partition and Its Strategic Legacy (1947)' },
      ],
      createdAt: '2026-07-12T00:00:00Z',
      updatedAt: '2026-07-12T00:00:00Z',
      lastVerifiedAt: '2026-07-12T00:00:00Z',
    },
    {
      id: 'claim.partition.gender',
      statement: 'Partition violence had a distinct gendered dimension — including mass abduction, rape, forced marriage, and the recovery operations that became a state project — that shaped India\'s understanding of honor, identity, and the state\'s responsibility toward its citizens.',
      confidence: 'established',
      evidence: [
        { sourceId: 's20', relevance: 'direct', excerpt: 'The gendered violence of Partition — mass abduction, rape, forced conversion — became a defining feature of the catastrophe and shaped state recovery operations on both sides.' },
        { sourceId: 's19', relevance: 'supporting', excerpt: 'The recovery and rehabilitation of abducted women became a major state project, revealing how gendered violence was inextricably linked to nationalist politics.' },
      ],
      counterArguments: ['The focus on sexual violence in Partition historiography, while important, risks reducing women\'s experiences to victimhood and overlooking their agency in rebuilding communities.'],
      sourceIds: ['s19', 's20'],
      documentIds: [],
      entityIds: ['india', 'pakistan', 'partition'],
      conceptIds: ['con-partition'],
      appearsIn: [
        { contentType: 'chapter', contentId: 'kl-ch-1', contentTitle: 'India\'s Inheritance: Partition and Its Strategic Legacy (1947)' },
      ],
      createdAt: '2026-07-12T00:00:00Z',
      updatedAt: '2026-07-12T00:00:00Z',
      lastVerifiedAt: '2026-07-12T00:00:00Z',
    },
    {
      id: 'claim.partition.memory',
      statement: 'The memory of Partition has been selectively preserved and politically instrumentalized in both India and Pakistan, serving different narratives of national identity that sustain hostility between the two countries.',
      confidence: 'debated',
      evidence: [
        { sourceId: 's19', relevance: 'direct', excerpt: 'Partition memory in both countries has been shaped by official narratives that emphasize victimhood and villainy while suppressing complexity and shared experience.' },
        { sourceId: 's20', relevance: 'supporting', excerpt: 'The politics of memory around Partition — who is remembered, how, and for what purpose — continues to influence India-Pakistan relations.' },
      ],
      counterArguments: [],
      sourceIds: ['s19', 's20'],
      documentIds: [],
      entityIds: ['india', 'pakistan', 'partition'],
      conceptIds: ['con-partition', 'con-secular-nationalism', 'con-two-nation-theory'],
      appearsIn: [
        { contentType: 'chapter', contentId: 'kl-ch-1', contentTitle: 'India\'s Inheritance: Partition and Its Strategic Legacy (1947)' },
      ],
      createdAt: '2026-07-12T00:00:00Z',
      updatedAt: '2026-07-12T00:00:00Z',
      lastVerifiedAt: '2026-07-12T00:00:00Z',
    },
    {
      id: 'claim.kashmir.accession-disputed',
      statement: 'The legality and legitimacy of Kashmir\'s accession to India has been contested since 1947, with India arguing that the Instrument of Accession was legally valid and Pakistan arguing that it was obtained through coercion and fraud.',
      confidence: 'debated',
      evidence: [
        { sourceId: 's1', relevance: 'direct', excerpt: 'The Instrument of Accession was signed by Maharaja Hari Singh on October 26, 1947, under pressure from the tribal invasion and the advance of Pakistani forces.' },
        { sourceId: 's14', relevance: 'supporting', excerpt: 'India argued the accession was legally valid under the Indian Independence Act, while Pakistan maintained it was coerced and did not reflect the will of Kashmir\'s Muslim majority.' },
        { sourceId: 's6', relevance: 'contextual', excerpt: 'The UN Security Council resolution of 1948 complicated the legal picture by calling for a plebiscite, implicitly questioning the finality of the accession.' },
      ],
      counterArguments: ['International legal opinion has generally supported the validity of the accession, while noting that the UN Security Council resolution 47 complicated matters by calling for a plebiscite.'],
      sourceIds: ['s1', 's6', 's14', 's8'],
      documentIds: ['doc-kashmir-accession', 'doc-un-res-47'],
      entityIds: ['kashmir', 'india', 'pakistan', 'hari-singh', 'jawaharlal-nehru'],
      conceptIds: ['con-kashmir', 'con-united-nations'],
      appearsIn: [
        { contentType: 'chapter', contentId: 'kl-ch-1', contentTitle: 'India\'s Inheritance: Partition and Its Strategic Legacy (1947)' },
      ],
      createdAt: '2026-07-12T00:00:00Z',
      updatedAt: '2026-07-12T00:00:00Z',
      lastVerifiedAt: '2026-07-12T00:00:00Z',
    },
    {
      id: 'claim.nonalignment.origins',
      statement: 'Nehru\'s policy of non-alignment was not merely a Cold War strategy but was rooted in India\'s anti-colonial experience, its commitment to national sovereignty, and its conviction that the newly independent nations of Asia and Africa could chart an independent path in world affairs.',
      confidence: 'established',
      evidence: [
        { sourceId: 's22', relevance: 'direct', excerpt: 'Nehru\'s non-alignment grew from the anti-colonial movement\'s insistence that India should not exchange one form of subordination for another.' },
        { sourceId: 's7', relevance: 'direct', excerpt: 'The Bandung Conference of 1955 gave institutional expression to Nehru\'s vision of a world order not dominated by the Cold War superpowers.' },
        { sourceId: 's1', relevance: 'supporting', excerpt: 'India\'s independence movement provided the philosophical and practical foundations for non-alignment as both a foreign policy and a worldview.' },
      ],
      counterArguments: ['Realist critics argue that non-alignment was possible only because India was geographically remote from the main theatres of the Cold War and because both superpowers saw value in courting India.'],
      sourceIds: ['s1', 's7', 's22'],
      documentIds: [],
      entityIds: ['india', 'jawaharlal-nehru'],
      conceptIds: ['con-non-alignment', 'con-strategic-autonomy', 'con-decolonization'],
      appearsIn: [
        { contentType: 'chapter', contentId: 'kl-ch-1', contentTitle: 'India\'s Inheritance: Partition and Its Strategic Legacy (1947)' },
      ],
      createdAt: '2026-07-12T00:00:00Z',
      updatedAt: '2026-07-12T00:00:00Z',
      lastVerifiedAt: '2026-07-12T00:00:00Z',
    },
    {
      id: 'claim.partition.china-opportunity',
      statement: 'Partition\'s diversion of India\'s attention and resources to the western border created an opportunity for China to consolidate its position in Tibet and the Aksai Chin region that India was unable to effectively contest in the 1950s.',
      confidence: 'debated',
      evidence: [
        { sourceId: 's1', relevance: 'direct', excerpt: 'India\'s preoccupation with Pakistan and the Kashmir crisis left it unable to mount an effective response to China\'s consolidation of control over Tibet and the Aksai Chin.' },
        { sourceId: 's22', relevance: 'contextual', excerpt: 'The strategic bandwidth consumed by the Pakistan problem limited India\'s ability to monitor and respond to Chinese activities along the Himalayan frontier.' },
      ],
      counterArguments: ['India was not militarily capable of contesting Chinese control of Tibet even without the Pakistan distraction, given the logistical challenges of Himalayan warfare and India\'s limited mountain warfare capacity.'],
      sourceIds: ['s1', 's22'],
      documentIds: [],
      entityIds: ['india', 'china', 'tibet', 'partition'],
      conceptIds: ['con-partition', 'con-panchsheel'],
      appearsIn: [
        { contentType: 'chapter', contentId: 'kl-ch-1', contentTitle: 'India\'s Inheritance: Partition and Its Strategic Legacy (1947)' },
      ],
      createdAt: '2026-07-12T00:00:00Z',
      updatedAt: '2026-07-12T00:00:00Z',
      lastVerifiedAt: '2026-07-12T00:00:00Z',
    },
  ];

  for (const c of seed) claims.set(c.id, c);
}
