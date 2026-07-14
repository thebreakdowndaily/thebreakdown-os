import type { CanonicalDocument } from '@/types/canonical';

const documents = new Map<string, CanonicalDocument>();

export function getDocument(id: string): CanonicalDocument | undefined {
  return documents.get(id);
}

export function getAllDocuments(): CanonicalDocument[] {
  return Array.from(documents.values());
}

export function registerDocument(doc: CanonicalDocument): void {
  documents.set(doc.id, doc);
}

export function seedDocuments(): void {
  const seed: CanonicalDocument[] = [
    {
      id: 'doc-nehru-tryst',
      title: 'Tryst with Destiny',
      documentType: 'speech',
      date: '15 August 1947',
      parties: ['Jawaharlal Nehru', 'Constituent Assembly of India'],
      paragraphs: [
        { id: 'para-nehru-1', text: 'Long years ago we made a tryst with destiny, and now the time comes when we shall redeem our pledge, not wholly or in full measure, but very substantially.', claimIds: ['claim.secular-nationalism.foreign-policy'] },
        { id: 'para-nehru-2', text: 'At the stroke of the midnight hour, when the world sleeps, India will awake to life and freedom.', claimIds: [] },
        { id: 'para-nehru-3', text: 'We end today a period of ill fortune and India discovers herself again.', claimIds: [] },
      ],
      claimIds: ['claim.secular-nationalism.foreign-policy'],
      entityIds: ['jawaharlal-nehru', 'india'],
      treatyIds: [],
      mapIds: [],
      chapterIds: ['kl-ch-1'],
      sourceId: 's4',
    },
    {
      id: 'doc-un-res-47',
      title: 'UN Security Council Resolution 47',
      documentType: 'resolution',
      date: '21 April 1948',
      parties: ['United Nations Security Council', 'India', 'Pakistan'],
      paragraphs: [
        { id: 'para-un-1', text: 'The Security Council recommends that the Government of India and the Government of Pakistan should take measures to improve the situation.', claimIds: ['claim.kashmir.un-referral'] },
        { id: 'para-un-2', text: 'The Council calls for a plebiscite to be held under the auspices of the United Nations.', claimIds: ['claim.kashmir.un-referral'] },
      ],
      claimIds: ['claim.kashmir.un-referral'],
      entityIds: ['un', 'kashmir', 'india', 'pakistan'],
      treatyIds: [],
      mapIds: [],
      chapterIds: ['kl-ch-1'],
      sourceId: 's6',
    },
    {
      id: 'doc-independence-act',
      title: 'Indian Independence Act, 1947',
      documentType: 'legislation',
      date: '18 July 1947',
      parties: ['British Parliament', 'India', 'Pakistan'],
      paragraphs: [
        { id: 'para-ind-1', text: 'His Majesty\'s Government relinquish their responsibility for the government of British India, and the territories formerly governed under the British Raj shall be divided into two independent Dominions, India and Pakistan.', claimIds: ['claim.partition.founding-trauma'] },
        { id: 'para-ind-2', text: 'From the appointed day, the suzerainty of His Majesty over the Indian States lapses, and all treaties and agreements with the Indian States shall cease to have effect.', claimIds: ['claim.partition.princely-states'] },
        { id: 'para-ind-3', text: 'The said territories shall be governed in accordance with the provisions of this Act until new constitutions are adopted by the respective Constituent Assemblies.', claimIds: [] },
      ],
      claimIds: ['claim.partition.founding-trauma', 'claim.partition.princely-states'],
      entityIds: ['india', 'pakistan', 'british-empire'],
      treatyIds: [],
      mapIds: [],
      chapterIds: ['kl-ch-1'],
      sourceId: 's11',
    },
    {
      id: 'doc-mountbatten-plan',
      title: 'Mountbatten Plan (3 June Plan)',
      documentType: 'plan',
      date: '3 June 1947',
      parties: ['Lord Mountbatten', 'Indian National Congress', 'Muslim League'],
      paragraphs: [
        { id: 'para-mount-1', text: 'The British Government propose to introduce legislation for the transfer of power to one or two successor authorities on the basis of the partition of British India.', claimIds: ['claim.partition.founding-trauma'] },
        { id: 'para-mount-2', text: 'The provinces of Bengal and Punjab shall be partitioned, if their legislative assemblies so decide, along lines of religious majority.', claimIds: [] },
      ],
      claimIds: ['claim.partition.founding-trauma'],
      entityIds: ['india', 'pakistan', 'british-empire', 'lord-mountbatten'],
      treatyIds: [],
      mapIds: [],
      chapterIds: ['kl-ch-1'],
      sourceId: 's12',
    },
    {
      id: 'doc-radcliffe-award',
      title: 'Radcliffe Award (Boundary Demarcation)',
      documentType: 'award',
      date: '17 August 1947',
      parties: ['Sir Cyril Radcliffe', 'India', 'Pakistan'],
      paragraphs: [
        { id: 'para-rad-1', text: 'The boundary line between India and Pakistan in the Punjab and Bengal shall be as described in the schedules annexed hereto.', claimIds: [] },
        { id: 'para-rad-2', text: 'The award is final and binding on all parties, and there shall be no appeal against it to any court or tribunal.', claimIds: [] },
      ],
      claimIds: ['claim.partition.founding-trauma', 'claim.partition.division-of-assets'],
      entityIds: ['india', 'pakistan', 'british-empire', 'punjab', 'bengal'],
      treatyIds: [],
      mapIds: [],
      chapterIds: ['kl-ch-1'],
      sourceId: 's13',
    },
    {
      id: 'doc-kashmir-accession',
      title: 'Instrument of Accession of Jammu and Kashmir',
      documentType: 'treaty',
      date: '26 October 1947',
      parties: ['Maharaja Hari Singh', 'Dominion of India'],
      paragraphs: [
        { id: 'para-acc-1', text: 'I hereby declare that I accede to the Dominion of India with the intent that the Government of India might be in a position to defend the State against external aggression.', claimIds: ['claim.kashmir.accession-disputed'] },
        { id: 'para-acc-2', text: 'Nothing in this Instrument shall be deemed to commit me in any way to acceptance of any future constitution of India.', claimIds: ['claim.kashmir.accession-disputed'] },
        { id: 'para-acc-3', text: 'I shall be regarded as having accepted the matters specified in Schedule I to this Instrument, and no others.', claimIds: [] },
      ],
      claimIds: ['claim.kashmir.accession-disputed', 'claim.partition.princely-states'],
      entityIds: ['kashmir', 'india', 'hari-singh'],
      treatyIds: [],
      mapIds: [],
      chapterIds: ['kl-ch-1'],
      sourceId: 's14',
    },
    {
      id: 'doc-liaquat-nehru-pact',
      title: 'Liaquat-Nehru Pact',
      documentType: 'treaty',
      date: '8 April 1950',
      parties: ['Jawaharlal Nehru', 'Liaquat Ali Khan'],
      paragraphs: [
        { id: 'para-lnp-1', text: 'The Governments of India and Pakistan solemnly agree that each shall ensure to the minorities within its territory complete equality of citizenship and full freedom of conscience, speech, worship, and association.', claimIds: ['claim.partition.minorities'] },
        { id: 'para-lnp-2', text: 'Both Governments agree to set up a Ministry of Minority Affairs and to appoint Minority Commissions to oversee the implementation of these guarantees.', claimIds: [] },
      ],
      claimIds: ['claim.partition.minorities'],
      entityIds: ['india', 'pakistan', 'jawaharlal-nehru', 'liaquat-ali-khan'],
      treatyIds: [],
      mapIds: [],
      chapterIds: ['kl-ch-1'],
      sourceId: 's15',
    },
  ];

  for (const d of seed) documents.set(d.id, d);
}
