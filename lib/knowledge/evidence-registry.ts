import type { CanonicalEvidence } from '@/types/canonical';

const evidenceEntries = new Map<string, CanonicalEvidence>();

export function getEvidence(id: string): CanonicalEvidence | undefined {
  return evidenceEntries.get(id);
}

export function getEvidenceByClaim(claimId: string): CanonicalEvidence[] {
  return Array.from(evidenceEntries.values()).filter(
    e => e.claimId === claimId
  );
}

export function getEvidenceBySource(sourceId: string): CanonicalEvidence[] {
  return Array.from(evidenceEntries.values()).filter(
    e => e.sourceId === sourceId
  );
}

export function registerEvidence(ev: CanonicalEvidence): void {
  evidenceEntries.set(ev.id, ev);
}

export function seedEvidence(): void {
  const seed: CanonicalEvidence[] = [
    {
      id: 'ev.partition.1',
      claimId: 'claim.partition.security-consciousness',
      sourceId: 's1',
      relevance: 'direct',
      excerpt: 'The trauma of Partition embedded a deep sensitivity to any external force that could exacerbate internal religious divisions.',
      documentId: undefined,
      paragraphId: undefined,
      verifiedAt: '2026-07-12T00:00:00Z',
      confidence: 0.9,
    },
    {
      id: 'ev.partition.2',
      claimId: 'claim.partition.security-consciousness',
      sourceId: 's3',
      relevance: 'supporting',
      excerpt: 'India\'s approach to Pakistan has been framed by the unfinished business of Partition.',
      verifiedAt: '2026-07-12T00:00:00Z',
      confidence: 0.85,
    },
    {
      id: 'ev.kashmir.1',
      claimId: 'claim.kashmir.un-referral',
      sourceId: 's1',
      relevance: 'direct',
      excerpt: 'Nehru believed the UN would recognize the validity of Kashmir\'s accession under international law.',
      verifiedAt: '2026-07-12T00:00:00Z',
      confidence: 0.8,
    },
    {
      id: 'ev.kashmir.2',
      claimId: 'claim.kashmir.un-referral',
      sourceId: 's6',
      relevance: 'supporting',
      excerpt: 'UN Security Council Resolution 47 called for a plebiscite that was never held.',
      documentId: 'doc-un-res-47',
      paragraphId: 'para-un-2',
      verifiedAt: '2026-07-12T00:00:00Z',
      confidence: 0.95,
    },
    {
      id: 'ev.nonalignment.1',
      claimId: 'claim.nonalignment.strategic-autonomy',
      sourceId: 's1',
      relevance: 'direct',
      excerpt: 'Non-alignment preserved India\'s freedom of action and maximized aid from both Cold War blocs.',
      verifiedAt: '2026-07-12T00:00:00Z',
      confidence: 0.85,
    },
    {
      id: 'ev.secular.1',
      claimId: 'claim.secular-nationalism.foreign-policy',
      sourceId: 's4',
      relevance: 'direct',
      excerpt: 'Nehru\'s Tryst with Destiny speech frames Indian nationalism in explicitly civic, not religious, terms.',
      documentId: 'doc-nehru-tryst',
      paragraphId: 'para-nehru-1',
      verifiedAt: '2026-07-12T00:00:00Z',
      confidence: 0.9,
    },
    {
      id: 'ev.partition.3',
      claimId: 'claim.partition.founding-trauma',
      sourceId: 's1',
      relevance: 'direct',
      excerpt: 'The Partition of India in August 1947 was the central trauma that shaped the newly independent state\'s consciousness.',
      confidence: 0.9,
      verifiedAt: '2026-07-12T00:00:00Z',
    },
    {
      id: 'ev.partition.4',
      claimId: 'claim.partition.founding-trauma',
      sourceId: 's16',
      relevance: 'supporting',
      excerpt: 'Partition was not just a division of territory but a division of people, families, and memories — a wound that never fully healed.',
      confidence: 0.85,
      verifiedAt: '2026-07-12T00:00:00Z',
    },
    {
      id: 'ev.partition.5',
      claimId: 'claim.partition.refugee-crisis',
      sourceId: 's1',
      relevance: 'direct',
      excerpt: 'An estimated 14.5 million people crossed the new borders in one of the largest and fastest migrations in human history.',
      documentId: undefined,
      verifiedAt: '2026-07-12T00:00:00Z',
      confidence: 0.9,
    },
    {
      id: 'ev.partition.6',
      claimId: 'claim.partition.princely-states',
      sourceId: 's18',
      relevance: 'direct',
      excerpt: 'The integration of 565 princely states was achieved through a combination of diplomacy, pressure, and in some cases, military action.',
      confidence: 0.85,
      verifiedAt: '2026-07-12T00:00:00Z',
    },
    {
      id: 'ev.partition.7',
      claimId: 'claim.partition.division-of-assets',
      sourceId: 's1',
      relevance: 'direct',
      excerpt: 'The division of the Indian Army, civil service, and financial reserves was contentious and created immediate administrative challenges for both new dominions.',
      confidence: 0.85,
      verifiedAt: '2026-07-12T00:00:00Z',
    },
    {
      id: 'ev.partition.8',
      claimId: 'claim.partition.security-paradigm',
      sourceId: 's21',
      relevance: 'direct',
      excerpt: 'Midnight\'s Furies documents how Partition\'s violence created a security psychosis that made India-Pakistan reconciliation nearly impossible.',
      confidence: 0.8,
      verifiedAt: '2026-07-12T00:00:00Z',
    },
    {
      id: 'ev.partition.9',
      claimId: 'claim.partition.relations-pakistan-permanent',
      sourceId: 's23',
      relevance: 'direct',
      excerpt: 'The India-Pakistan rivalry, rooted in Partition, has been one of the most intractable conflicts of the post-colonial world.',
      confidence: 0.85,
      verifiedAt: '2026-07-12T00:00:00Z',
    },
    {
      id: 'ev.partition.10',
      claimId: 'claim.partition.kashmir-unfinished',
      sourceId: 's21',
      relevance: 'direct',
      excerpt: 'The Kashmir dispute became the enduring symbol of Partition\'s failure to resolve the fundamental questions of nationhood in South Asia.',
      confidence: 0.85,
      verifiedAt: '2026-07-12T00:00:00Z',
    },
    {
      id: 'ev.partition.11',
      claimId: 'claim.partition.minorities',
      sourceId: 's1',
      relevance: 'direct',
      excerpt: 'The fate of Muslims in India and Hindus in Pakistan became a diplomatic issue from the moment of independence.',
      confidence: 0.9,
      verifiedAt: '2026-07-12T00:00:00Z',
    },
    {
      id: 'ev.partition.12',
      claimId: 'claim.partition.demographic-impact',
      sourceId: 's27',
      relevance: 'direct',
      excerpt: 'Punjab\'s demographic transformation was near-total: the western districts lost almost all their non-Muslim population, while the eastern districts lost almost all their Muslim population.',
      confidence: 0.9,
      verifiedAt: '2026-07-12T00:00:00Z',
    },
    {
      id: 'ev.partition.13',
      claimId: 'claim.partition.violence-civil-society',
      sourceId: 's19',
      relevance: 'direct',
      excerpt: 'Partition violence was not spontaneous but organized, with political and communal organizations planning and executing attacks on minority populations.',
      confidence: 0.85,
      verifiedAt: '2026-07-12T00:00:00Z',
    },
    {
      id: 'ev.partition.14',
      claimId: 'claim.partition.nehru-patel-dynamic',
      sourceId: 's1',
      relevance: 'direct',
      excerpt: 'Nehru and Patel represented two poles of Indian nationalism: Nehru the internationalist visionary, Patel the practical nation-builder.',
      confidence: 0.85,
      verifiedAt: '2026-07-12T00:00:00Z',
    },
    {
      id: 'ev.partition.15',
      claimId: 'claim.partition.economic-impact',
      sourceId: 's1',
      relevance: 'direct',
      excerpt: 'India lost the rich cotton-growing districts of West Punjab and the jute-rich regions of East Bengal, disrupting established economic networks.',
      confidence: 0.9,
      verifiedAt: '2026-07-12T00:00:00Z',
    },
    {
      id: 'ev.partition.16',
      claimId: 'claim.partition.avoidable',
      sourceId: 's17',
      relevance: 'direct',
      excerpt: 'Jalal argues that Jinnah used the Pakistan demand as a bargaining chip and that a negotiated settlement short of partition was possible until mid-1947.',
      confidence: 0.7,
      verifiedAt: '2026-07-12T00:00:00Z',
    },
    {
      id: 'ev.partition.17',
      claimId: 'claim.partition.gender',
      sourceId: 's20',
      relevance: 'direct',
      excerpt: 'Butalia\'s oral histories reveal the specific experiences of women during Partition — abduction, rape, forced marriage, and the state\'s recovery operations.',
      confidence: 0.85,
      verifiedAt: '2026-07-12T00:00:00Z',
    },
    {
      id: 'ev.partition.18',
      claimId: 'claim.partition.memory',
      sourceId: 's19',
      relevance: 'direct',
      excerpt: 'The memory of Partition has been shaped by nationalist narratives that emphasize certain aspects while suppressing others.',
      confidence: 0.8,
      verifiedAt: '2026-07-12T00:00:00Z',
    },
    {
      id: 'ev.kashmir.3',
      claimId: 'claim.kashmir.accession-disputed',
      sourceId: 's1',
      relevance: 'direct',
      excerpt: 'The legality of Kashmir\'s accession remains contested: India maintains it was legally valid, while Pakistan argues it was obtained through fraud.',
      confidence: 0.8,
      verifiedAt: '2026-07-12T00:00:00Z',
    },
    {
      id: 'ev.nonalignment.2',
      claimId: 'claim.nonalignment.origins',
      sourceId: 's22',
      relevance: 'direct',
      excerpt: 'Gopal emphasizes that Nehru\'s foreign policy was rooted in India\'s anti-colonial struggle and a deep commitment to national sovereignty.',
      confidence: 0.85,
      verifiedAt: '2026-07-12T00:00:00Z',
    },
    {
      id: 'ev.partition.19',
      claimId: 'claim.partition.china-opportunity',
      sourceId: 's1',
      relevance: 'direct',
      excerpt: 'India\'s preoccupation with Pakistan allowed China to consolidate its position in Tibet without significant Indian opposition.',
      confidence: 0.7,
      verifiedAt: '2026-07-12T00:00:00Z',
    },
  ];

  for (const e of seed) evidenceEntries.set(e.id, e);
}
