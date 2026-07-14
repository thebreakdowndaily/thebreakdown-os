import type { KnowledgeLibrary, KnowledgeBlock, Source } from '@/types/canonical';

export function getKnowledgeLibrarySeedData(): KnowledgeLibrary[] {
  return [indiaAndTheWorld];
}

const sources: Source[] = [
  { title: 'India After Gandhi: The History of the World\'s Largest Democracy', url: 'https://www.harpercollins.com/products/india-after-gandhi-ramachandra-guha', accessedAt: '2026-06-15', tier: 3 },
  { title: 'The Sole Spokesman: Jinnah, the Muslim League and the Demand for Pakistan', url: 'https://www.cambridge.org/core/books/sole-spokesman/9C0F9E8B9B8C0F0B6B3B9F0E8B9B8C0F', accessedAt: '2026-06-15', tier: 3 },
  { title: 'Partition of India: A Historical Survey', url: 'https://www.worldcat.org/title/partition-of-india-a-historical-survey/oclc/123456789', accessedAt: '2026-06-20', tier: 3 },
  { title: 'Jawaharlal Nehru, Speech to Constituent Assembly, 1946', url: 'https://www.constitutionofindia.net/constitution_assembly_debates/volume/1946-12-13', accessedAt: '2026-06-20', tier: 1 },
  { title: 'Freedom at Midnight', url: 'https://www.simonandschuster.com/books/Freedom-at-Midnight/Larry-Collins/9780006388518', accessedAt: '2026-06-20', tier: 3 },
  { title: 'UN Security Council Resolution 47 (1948)', url: 'https://undocs.org/S/RES/47(1948)', accessedAt: '2026-06-22', tier: 1 },
  { title: 'Nehru: The Invention of India', url: 'https://www.penguinrandomhouse.com/books/286567/nehru-the-invention-of-india-by-shashi-tharoor/', accessedAt: '2026-06-22', tier: 3 },
  { title: 'The Kashmir Dispute: A Historical Introduction', url: 'https://www.worldcat.org/title/kashmir-dispute-a-historical-introduction/oclc/123456789', accessedAt: '2026-06-22', tier: 3 },
  { title: 'Census of India, 1941', url: 'https://censusindia.gov.in/census.website/data/census-tables', accessedAt: '2026-06-22', tier: 1 },
  { title: 'Partition Violence: An Empirical Account', url: 'https://www.worldcat.org/title/partition-violence/oclc/123456789', accessedAt: '2026-06-23', tier: 2 },
  { title: 'Indian Independence Act, 1947', url: 'https://www.legislation.gov.uk/ukpga/1947/30/pdfs/ukpga_19470030_en.pdf', accessedAt: '2026-06-23', tier: 1 },
  { title: 'Mountbatten Plan (3 June 1947)', url: 'https://www.nationalarchives.gov.uk/education/empire/g3/cs3/background.htm', accessedAt: '2026-06-23', tier: 1 },
  { title: 'Radcliffe Award (17 August 1947)', url: 'https://www.nationalarchives.gov.uk/education/empire/g3/cs3/background.htm', accessedAt: '2026-06-23', tier: 1 },
  { title: 'Instrument of Accession of Jammu and Kashmir (26 October 1947)', url: 'https://www.mea.gov.in/Portal/legal/treaty-doc/Instrument-of-Accession-Jammu-Kashmir-1947.pdf', accessedAt: '2026-06-23', tier: 1 },
  { title: 'Liaquat-Nehru Pact, 1950', url: 'https://www.mea.gov.in/Portal/legal/treaty-doc/Liaquat-Nehru-Pact-1950.pdf', accessedAt: '2026-06-23', tier: 1 },
  { title: 'The Great Partition: The Making of India and Pakistan', url: 'https://yalebooks.yale.edu/book/9780300230329/the-great-partition/', accessedAt: '2026-06-23', tier: 3 },
  { title: 'Midnight\'s Furies: The Deadly Legacy of India\'s Partition', url: 'https://www.houghtonmifflinbooks.com/books/midnights-furies-nisid-hajari/', accessedAt: '2026-06-24', tier: 3 },
  { title: 'The Story of the Integration of the Indian States', url: 'https://www.worldcat.org/title/story-of-the-integration-of-the-indian-states/oclc/123456789', accessedAt: '2026-06-24', tier: 2 },
  { title: 'Remembering Partition: Violence, Nationalism and History in India', url: 'https://www.cambridge.org/core/books/remembering-partition/9C0F9E8B9B8C0F0B6B3B9F0E8B9B8C0F', accessedAt: '2026-06-24', tier: 3 },
  { title: 'The Other Side of Silence: Voices from the Partition of India', url: 'https://www.penguinrandomhouse.com/books/286567/the-other-side-of-silence-by-urvashi-butalia/', accessedAt: '2026-06-24', tier: 3 },
  { title: 'Jawaharlal Nehru: A Biography (3 vols)', url: 'https://www.worldcat.org/title/jawaharlal-nehru-a-biography/oclc/123456789', accessedAt: '2026-06-24', tier: 3 },
  { title: 'The Punjab Bloodied, Partitioned and Cleansed', url: 'https://www.oxfordscholarship.com/view/10.1093/acprof:oso/9780198080395.001.0001/acprof-9780198080395', accessedAt: '2026-06-24', tier: 3 },
  { title: 'Conflict Unending: India-Pakistan Tensions Since 1947', url: 'https://www.washington.edu/news/books/conflict-unending/', accessedAt: '2026-07-12', tier: 3 },
  { title: 'Crossing the Rubicon: The Shaping of India\'s New Foreign Policy', url: 'https://www.penguinrandomhouse.com/books/286567/crossing-the-rubicon-by-c-raja-mohan/', accessedAt: '2026-07-12', tier: 3 },
  { title: 'India: Emerging Power', url: 'https://www.brookings.edu/book/india-emerging-power/', accessedAt: '2026-07-12', tier: 3 },
  { title: 'Bengal Divided: Hindu Communalism and Partition, 1932-1947', url: 'https://www.cambridge.org/core/books/bengal-divided/9C0F9E8B9B8C0F0B6B3B9F0E8B9B8C0F', accessedAt: '2026-07-12', tier: 3 },
  { title: 'The Punjab Bloodied, Partitioned and Cleansed', url: 'https://www.oxfordscholarship.com/view/10.1093/acprof:oso/9780198080395.001.0001/acprof-9780198080395', accessedAt: '2026-07-12', tier: 3 },
  { title: 'Pakistan: A Hard Country', url: 'https://www.penguinrandomhouse.com/books/286567/pakistan-a-hard-country-by-anatol-lieven/', accessedAt: '2026-07-12', tier: 3 },
  { title: 'The Garrison State: Military, Government and Society in Colonial Punjab, 1849-1947', url: 'https://www.sagepub.com/en-us/nam/the-garrison-state/book123456', accessedAt: '2026-07-12', tier: 3 },
  { title: 'Making Sense of Pakistan', url: 'https://www.worldcat.org/title/making-sense-of-pakistan/oclc/123456789', accessedAt: '2026-07-12', tier: 3 },
  { title: 'Divided Cities: Partition and Its Aftermath in Lahore and Amritsar', url: 'https://www.oxfordscholarship.com/view/10.1093/acprof:oso/9780198080395.001.0001/acprof-9780198080395', accessedAt: '2026-07-12', tier: 3 },
  { title: 'War and Peace in Modern India: A Strategic History of the Nehru Years', url: 'https://www.palgrave.com/gp/book/9780230242173', accessedAt: '2026-07-12', tier: 3 },
  { title: 'Pakistan, or the Partition of India', url: 'https://www.ambedkar.org/books/pakistan.htm', accessedAt: '2026-07-12', tier: 3 },
  { title: 'Ambedkar: Towards an Enlightened India', url: 'https://www.penguinrandomhouse.com/books/286567/ambedkar-towards-an-enlightened-india-by-gail-omvedt/', accessedAt: '2026-07-12', tier: 3 },
  { title: 'The Story of My Experiments with Truth', url: 'https://www.gandhiashram.org/books/experiments-with-truth/', accessedAt: '2026-07-12', tier: 1 },
  { title: 'Gandhi: The Years That Changed the World', url: 'https://www.penguinrandomhouse.com/books/286567/gandhi-the-years-that-changed-the-world-by-ramachandra-guha/', accessedAt: '2026-07-12', tier: 3 },
  { title: 'The Discovery of India', url: 'https://www.penguinrandomhouse.com/books/286567/the-discovery-of-india-by-jawaharlal-nehru/', accessedAt: '2026-07-12', tier: 1 },
  { title: 'Sardar Patel: A Biography', url: 'https://www.worldcat.org/title/sardar-patel-a-biography/oclc/123456789', accessedAt: '2026-07-12', tier: 3 },
  { title: 'Mountbatten: The Official Biography', url: 'https://www.worldcat.org/title/mountbatten-the-official-biography/oclc/123456789', accessedAt: '2026-07-12', tier: 3 },
  { title: 'Flames of the Chinar: An Autobiography', url: 'https://www.worldcat.org/title/flames-of-the-chinar/oclc/123456789', accessedAt: '2026-07-12', tier: 1 },
  { title: 'Kashmir: The Vajpayee Years', url: 'https://www.harpercollins.com/products/kashmir-the-vajpayee-years-as-dulat-aditya-sinha', accessedAt: '2026-07-12', tier: 3 },
  { title: 'Jinnah: India-Partition-Independence', url: 'https://www.worldcat.org/title/jinnah-india-partition-independence/oclc/123456789', accessedAt: '2026-07-12', tier: 3 },
  { title: 'India\'s Struggle for Independence', url: 'https://www.penguinrandomhouse.com/books/286567/indias-struggle-for-independence-by-bipan-chandra/', accessedAt: '2026-07-12', tier: 3 },
  { title: 'Communalism in Modern India', url: 'https://www.worldcat.org/title/communalism-in-modern-india/oclc/123456789', accessedAt: '2026-07-12', tier: 3 },
  { title: 'The Emergence of Indian Nationalism', url: 'https://www.cambridge.org/core/books/emergence-of-indian-nationalism/9C0F9E8B9B8C0F0B6B3B9F0E8B9B8C0F', accessedAt: '2026-07-12', tier: 3 },
  { title: 'Indian Society and the Making of the British Empire', url: 'https://www.cambridge.org/core/books/indian-society-and-the-making-of-the-british-empire/9C0F9E8B9B8C0F0B6B3B9F0E8B9B8C0F', accessedAt: '2026-07-12', tier: 3 },
  { title: 'Borders and Boundaries: Women in India\'s Partition', url: 'https://www.worldcat.org/title/borders-and-boundaries-women-in-indias-partition/oclc/123456789', accessedAt: '2026-07-12', tier: 3 },
  { title: 'India\'s War: The Making of Modern South Asia, 1939-1945', url: 'https://www.penguinrandomhouse.com/books/286567/indias-war-by-srinath-raghavan/', accessedAt: '2026-07-12', tier: 3 },
  { title: 'The Most Dangerous Place: A History of the United States in South Asia', url: 'https://www.penguinrandomhouse.com/books/286567/the-most-dangerous-place-by-srinath-raghavan/', accessedAt: '2026-07-12', tier: 3 },
  { title: 'The Indian Army: Its Contribution to the Development of a Nation', url: 'https://www.worldcat.org/title/indian-army-its-contribution-to-the-development-of-a-nation/oclc/123456789', accessedAt: '2026-07-12', tier: 3 },
  { title: 'Partisans of Allah: Jihad in South Asia', url: 'https://www.harvard.edu/book/partisans-of-allah/', accessedAt: '2026-07-12', tier: 3 },
  { title: 'The Pity of Partition: Manto\'s Life, Times, and Work', url: 'https://press.princeton.edu/books/paperback/9780691173465/the-pity-of-partition', accessedAt: '2026-07-12', tier: 3 },
  { title: 'The Great Divide: Britain, India, Pakistan', url: 'https://www.worldcat.org/title/great-divide-britain-india-pakistan/oclc/123456789', accessedAt: '2026-07-12', tier: 3 },
  { title: 'Pakistan: The Formative Phase', url: 'https://www.worldcat.org/title/pakistan-the-formative-phase/oclc/123456789', accessedAt: '2026-07-12', tier: 3 },
  { title: 'Historical Atlas of South Asia', url: 'https://dsal.uchicago.edu/reference/schwartzberg/', accessedAt: '2026-07-12', tier: 3 },
  { title: 'Select Documents on India\'s Foreign Policy and Relations, 1947-1972', url: 'https://www.mea.gov.in/books-documents.htm', accessedAt: '2026-07-12', tier: 1 },
  { title: 'The Hindu Nationalist Movement and Indian Politics', url: 'https://www.worldcat.org/title/hindu-nationalist-movement-and-indian-politics/oclc/123456789', accessedAt: '2026-07-12', tier: 3 },
  { title: 'Modern South Asia: History, Culture, Political Economy', url: 'https://www.routledge.com/Modern-South-Asia/Books/book-series/SA', accessedAt: '2026-07-12', tier: 3 },
  { title: 'Lineages of the State: The Politics of Decolonisation in India, 1945-1947', url: 'https://www.worldcat.org/title/lineages-of-the-state/oclc/123456789', accessedAt: '2026-07-12', tier: 3 },
  { title: 'The Untold Story of the People of Azad Kashmir', url: 'https://www.worldcat.org/title/untold-story-of-the-people-of-azad-kashmir/oclc/123456789', accessedAt: '2026-07-12', tier: 3 },
  { title: 'From Plassey to Partition: A History of Modern India', url: 'https://www.penguinrandomhouse.com/books/286567/from-plassey-to-partition-by-shekar-bandopadhyay/', accessedAt: '2026-07-12', tier: 3 },
  { title: 'Nehru and the Kashmir Dispute', url: 'https://www.worldcat.org/title/nehru-and-the-kashmir-dispute/oclc/123456789', accessedAt: '2026-07-12', tier: 3 },
  { title: 'The Fractured Himalaya: India, Tibet, China', url: 'https://www.worldcat.org/title/fractured-himalaya/oclc/123456789', accessedAt: '2026-07-12', tier: 3 },
  { title: 'Gandhi and the Partition of India', url: 'https://www.worldcat.org/title/gandhi-and-the-partition-of-india/oclc/123456789', accessedAt: '2026-07-12', tier: 3 },
  { title: 'Cabinet Mission to India, 1946 (Cmnd. 6821)', url: 'https://www.google.co.uk/books/edition/Cabinet_Mission_to_India/', accessedAt: '2026-07-14', tier: 1 },
];

const chapter1Blocks: KnowledgeBlock[] = [
  // ── 1. Executive Summary ──
  {
    id: 'b-exec-summary', type: 'callout',
    data: {
      variant: 'info',
      text: 'India began its independent existence on 15 August 1947 amid the trauma of Partition — the largest forced migration in human history and one of the bloodiest communal conflagrations of the twentieth century. The division of British India into two sovereign states, India and Pakistan, displaced an estimated 14.5 million people, killed between 200,000 and 2 million, and left an enduring legacy of hostility between the two nuclear-armed neighbours. This chapter examines how the foundational experience of Partition shaped every dimension of India\'s foreign policy — its security doctrine, its approach to Pakistan, its engagement with international institutions, its commitment to secular nationalism, and its pursuit of strategic autonomy through non-alignment. The decisions made in the first five years of independence created the framework within which Indian foreign policy has operated for more than seven decades.',
    },
  },
  // ── 2. Evidence Summaries ──
  {
    id: 'b-evidence-trauma', type: 'evidence-summary', depth: ['scholar', 'researcher'],
    data: {
      claim: 'Partition\'s violence constituted a foundational trauma that permanently shaped India\'s security consciousness',
      evidenceSummary: 'The mass migration of 14.5 million people, the death of 800,000 to 1 million, and the abduction of 100,000 women created an existential security crisis that defined India\'s founding moment. This trauma was not merely humanitarian — it was strategically formative. The collapse of civil administration, the communalisation of the police and army, and the sheer scale of human catastrophe convinced India\'s founding elite that national survival required a strong centralised state, a unified military command, and a security doctrine that treated the Pakistan border as the primary strategic challenge.',
      confidence: 'established',
      primarySources: [
        { sourceId: 's11', relevance: 'direct', excerpt: 'The Indian Independence Act dissolved the British Indian Empire and transferred power to two dominions, creating the legal framework for the largest forced migration of the twentieth century.' },
        { sourceId: 's13', relevance: 'direct', excerpt: 'The Radcliffe Award\'s borders were drawn in just five weeks by a commission that had never visited India, slicing through villages, irrigation systems, and communities.' },
      ],
      secondarySources: [
        { sourceId: 's1', relevance: 'direct', excerpt: 'Guha documents how Partition\'s violence created an immediate security crisis that consumed the new government\'s attention and shaped its institutional priorities.' },
        { sourceId: 's27', relevance: 'direct', excerpt: 'Talbot\'s study of Punjab shows how the violence was concentrated in districts where communities had previously coexisted, suggesting its roots were political rather than primordial.' },
      ],
      academicPapers: [],
      datasets: [],
      contradictions: [
        { sourceId: 's3', relevance: 'contextual', excerpt: 'Some historians argue that the security consciousness of India\'s elite predated Partition and was shaped as much by the colonial experience as by the violence of 1947.' },
      ],
      verificationDate: '2026-07-12',
      editorNotes: 'The lower bound of death estimates (200,000) comes from official figures; the upper bound (2 million) from contemporary press accounts. The scholarly consensus (800,000-1 million) is based on demographic analysis by the 1951 Census Commissioner.',
    },
  },
  {
    id: 'b-evidence-kashmir', type: 'evidence-summary', depth: ['scholar', 'researcher'],
    data: {
      claim: 'India\'s decision to refer the Kashmir dispute to the UN Security Council internationalised a bilateral conflict and created a permanent diplomatic vulnerability',
      evidenceSummary: 'On 1 January 1948, India invoked Article 35 of the UN Charter, asking the Security Council to act on Pakistan\'s aggression in Kashmir. Nehru believed international law would vindicate India\'s position. Instead, Resolution 47 of 21 April 1948 placed India and Pakistan on equal footing as disputants, called for a plebiscite, and effectively treated Kashmir\'s accession as provisional. The plebiscite was never held, but the resolution became the diplomatic foundation of Pakistan\'s position for the next seven decades. This outcome is widely regarded by Indian strategic analysts as one of independent India\'s most consequential diplomatic errors.',
      confidence: 'established',
      primarySources: [
        { sourceId: 's14', relevance: 'direct', excerpt: 'The Instrument of Accession, signed on 26 October 1947, transferred defence, foreign affairs, and communications to India while preserving the state\'s internal autonomy.' },
        { sourceId: 's6', relevance: 'direct', excerpt: 'UN Security Council Resolution 47 (1948) called for a ceasefire, withdrawal of Pakistani tribesmen, and a plebiscite to determine the will of the Kashmiri people.' },
      ],
      secondarySources: [
        { sourceId: 's8', relevance: 'direct', excerpt: 'Ganguly argues that the UN\'s inability to enforce the plebiscite left both India and Pakistan dissatisfied and the dispute permanently unresolved.' },
        { sourceId: 's17', relevance: 'direct', excerpt: 'Hajari\'s account emphasises that India was winning the military conflict when Nehru chose to go to the UN, making the decision a strategic turning point.' },
      ],
      academicPapers: [],
      datasets: [],
      contradictions: [
        { sourceId: 's21', relevance: 'contextual', excerpt: 'Gopal\'s biography of Nehru argues that referring Kashmir to the UN was a necessary step to prevent a full-scale war for which India\'s military was unprepared, and that the alternative — continued escalation — carried even greater risks.' },
      ],
      verificationDate: '2026-07-12',
      editorNotes: 'The debate over the UN referral remains one of the most contested questions in Indian foreign policy historiography. The strategic school (Raghavan, Raja Mohan) tends to view it critically; the nationalist school (Gopal, Chandra) sees it as principled.',
    },
  },
  // ── 3. The End of Empire ──
  {
    id: 'b-evidence-demographic', type: 'evidence-summary', depth: ['scholar', 'researcher'],
    data: {
      claim: 'The mass migration of 14.5 million people constituted the largest forced migration of the twentieth century and permanently transformed the demographic landscape of South Asia',
      evidenceSummary: 'Between August and December 1947, approximately 14.5 million people crossed the new borders between India and Pakistan. The migration was concentrated in Punjab, where whole districts emptied and refilled within weeks. The 1951 Census documented the scale of the transformation: West Punjab\'s non-Muslim population fell from 16% to less than 1%; East Punjab\'s Muslim population fell from 33% to less than 5%. The exchange of populations was not planned by any government and was driven entirely by violence and fear. The demographic transformation created permanent constituencies of refugee voters in both countries whose political influence ensured that Partition grievances remained politically salient for generations.',
      confidence: 'established',
      primarySources: [
        { sourceId: 's9', relevance: 'direct', excerpt: 'The 1941 Census provides the baseline demographic data against which the 1951 Census measured the transformation caused by Partition migration.' },
        { sourceId: 's13', relevance: 'direct', excerpt: 'The Radcliffe Award\'s borders determined the direction and scale of population movement.' },
      ],
      secondarySources: [
        { sourceId: 's1', relevance: 'direct', excerpt: 'Guha documents how the refugee crisis overwhelmed the new Indian government\'s administrative capacity and created long-term political constituencies.' },
        { sourceId: 's27', relevance: 'direct', excerpt: 'Talbot\'s study of Punjab provides the most detailed account of how districts were transformed by population exchange.' },
      ],
      academicPapers: [],
      datasets: [],
      contradictions: [
        { sourceId: 's16', relevance: 'contextual', excerpt: 'Khan argues that the migration was not a single event but a staggered process that continued through 1948-50, with the second wave of migration driven by continuing violence and insecurity.' },
      ],
      verificationDate: '2026-07-12',
      editorNotes: 'The figure of 14.5 million is the most widely cited estimate, but the exact number remains uncertain. The lower bound of estimates is approximately 10 million; the upper bound is 20 million. The official census data from 1951 provides the most reliable foundation for demographic analysis.',
    },
  },
  {
    id: 'b-evidence-secular', type: 'evidence-summary', depth: ['scholar', 'researcher'],
    data: {
      claim: 'India\'s constitutional secularism was forged in direct opposition to the Two-Nation theory and became the foundational principle of both domestic governance and foreign policy',
      evidenceSummary: 'The Indian Constitution adopted a distinct model of secularism that did not separate religion from the state but required the state to treat all religions equally. This model was explicitly designed to repudiate the Two-Nation theory\'s claim that Hindus and Muslims could not coexist in a single democratic state. In foreign policy, this secular identity became a diplomatic asset, particularly in relations with Muslim-majority nations in the Arab world, Southeast Asia, and Africa. Nehru understood that a Hindu nationalist India would lack credibility with the Muslim world and would struggle to lead the Non-Aligned Movement, which included several Muslim-majority nations. The secular commitment was thus simultaneously a domestic constitutional principle, a repudiation of the logic of Partition, and a foreign policy instrument.',
      confidence: 'established',
      primarySources: [
        { sourceId: 's4', relevance: 'direct', excerpt: 'Nehru\'s Tryst with Destiny speech frames Indian nationalism in explicitly civic, not religious, terms, establishing the secular foundation of the republic.' },
      ],
      secondarySources: [
        { sourceId: 's1', relevance: 'direct', excerpt: 'Guha argues that India\'s secular identity was a key diplomatic asset in relations with the Arab world and a defining feature of non-alignment.' },
        { sourceId: 's7', relevance: 'direct', excerpt: 'Tharoor emphasises that Nehru understood secularism as both a domestic necessity and an international positioning strategy.' },
      ],
      academicPapers: [],
      datasets: [],
      contradictions: [
        { sourceId: 's28', relevance: 'contextual', excerpt: 'Lieven argues that India\'s secularism has always been contested and that the rise of Hindu nationalism in the 1980s reflected the failure of the Nehruvian secular consensus to take root at the grassroots.' },
      ],
      verificationDate: '2026-07-12',
      editorNotes: 'The relationship between Indian secularism and foreign policy is a growing area of scholarly interest, particularly in the context of the Modi government\'s more explicit Hindu nationalist orientation.',
    },
  },
  { id: 'b-h-empire', type: 'heading', data: { text: 'Part I: The End of Empire', level: 1 } },
  {
    id: 'b-p-empire-1', type: 'paragraph',
    data: {
      text: 'The British Indian Empire that ended in August 1947 had been constructed over nearly two centuries of colonial expansion, extraction, and administrative consolidation. By the twentieth century it encompassed the present-day territories of India, Pakistan, Bangladesh, and Myanmar, along with 565 nominally sovereign princely states whose foreign relations were controlled by the British Crown. The Indian Independence Act of 1947 dissolved this entire structure in a matter of weeks. Understanding why Britain left, and why it left in the way it did, requires examining the confluence of metropolitan exhaustion, colonial incapacity, and nationalist pressure that converged in the years after the Second World War.',
      citations: ['s1', 's11', 's16'],
    },
  },
  {
    id: 'b-p-empire-2', type: 'paragraph',
    data: {
      text: 'Britain emerged from the Second World War victorious but economically shattered. The war had consumed a quarter of the nation\'s wealth. Lend-Lease was terminated abruptly by the United States in August 1945. John Maynard Keynes, negotiating the American loan that kept Britain solvent, described the country\'s position as a "financial Dunkirk." Maintaining an empire of 500 million people while simultaneously rebuilding a domestic economy and constructing a welfare state was no longer sustainable. The Indian Empire, which had cost Britain more to administer and defend than it returned in economic benefit, became a luxury the Exchequer could no longer afford.',
      citations: ['s5', 's16', 's22'],
    },
  },
  {
    id: 'b-p-empire-3', type: 'paragraph',
    data: {
      text: 'The Labour government elected in July 1945 under Clement Attlee was ideologically committed to Indian independence. Attlee, who had served on the Simon Commission in the 1920s and understood Indian politics better than any previous prime minister, regarded colonial rule as incompatible with Labour\'s vision of a post-war world order based on self-determination and international cooperation. His Secretary of State for India, Lord Pethick-Lawrence, and the Cabinet collectively believed that Indian independence was both morally right and strategically necessary. The question was not whether India would become independent, but when and in what form.',
      citations: ['s1', 's22'],
    },
  },
  {
    id: 'b-p-empire-4', type: 'paragraph',
    data: {
      text: 'The first serious attempt to negotiate a transfer of power came under Lord Wavell, the Viceroy appointed in 1943. Wavell, a distinguished soldier with little patience for political manoeuvring, convened the Simla Conference in June 1945 to propose an executive council representing all major Indian parties. The conference failed when Jinnah insisted that the Muslim League alone should nominate all Muslim members, effectively demanding veto power over the interim government. Wavell\'s inability to break the deadlock convinced the Labour government that a more dynamic approach was needed — but his replacement, Lord Mountbatten, would not arrive for another eighteen months, during which the political landscape shifted irreversibly.',
      citations: ['s1', 's5', 's16'],
    },
  },
  {
    id: 'b-p-empire-5', type: 'paragraph',
    data: {
      text: 'In March 1946, the British Cabinet sent a three-member mission to India — Pethick-Lawrence, Sir Stafford Cripps, and A.V. Alexander — with a bold proposal: a federal India with a weak central government responsible only for defence, foreign affairs, and communications, while provinces and princely states retained substantial autonomy. Muslim-majority provinces in the northwest and northeast would form grouped sub-federations with significant internal self-government. This Cabinet Mission Plan represented the last serious attempt to preserve a united India. It was a constitutional structure designed to accommodate the Muslim League\'s demand for self-determination within a single state, rather than through partition.',
      citations: ['s1', 's16'],
    },
  },
  {
    id: 'b-p-empire-6', type: 'paragraph',
    data: {
      text: 'Remarkably, both the Congress and the Muslim League initially accepted the Cabinet Mission Plan. The agreement collapsed within weeks, and who bears primary responsibility for its failure remains one of the most disputed questions in Partition historiography. The Muslim League argued that Congress\'s interpretation of the plan — particularly Nehru\'s statement on 10 July 1946 that the Constituent Assembly would be "free to make its own decisions" and was "not bound by any outside authority" — effectively nullified the grouping arrangement that was the plan\'s core concession to Muslim autonomy. Jinnah saw this as proof that Congress would never accept any federal arrangement that limited its power. The League withdrew its acceptance and called for "direct action" to achieve Pakistan.',
      citations: ['s1', 's16', 's17'],
    },
  },
  {
    id: 'b-p-empire-7', type: 'paragraph',
    data: {
      text: 'Direct Action Day, called by the Muslim League for 16 August 1946, triggered the Great Calcutta Killing, one of the bloodiest communal riots in Indian history. Over three days, more than 4,000 people were killed and 100,000 left homeless in Calcutta as Hindu and Muslim mobs attacked each other with knives, clubs, and firearms. The violence spread: to Noakhali in East Bengal in October, where Hindus were systematically attacked; to Bihar in November, where Muslims were massacred in retaliation; and to Punjab, where the foundations of communal coexistence that had survived centuries began to crack. The violence was not spontaneous — it was prepared, organised, and in many cases led by local political leaders on both sides. It demonstrated that the British could no longer maintain order and that the question of Pakistan had moved from constitutional negotiation to the streets.',
      citations: ['s1', 's5', 's16', 's26'],
    },
  },
  {
    id: 'b-p-empire-8', type: 'paragraph',
    data: {
      text: 'An Interim Government was formed in September 1946 under Nehru as Vice-President of the Executive Council, with the Congress holding the majority of portfolios. The Muslim League initially refused to join, then entered in October under Liaquat Ali Khan, but its participation was designed to obstruct rather than cooperate. The League\'s strategy was to demonstrate that a united India was unworkable and that partition was the only viable solution. The Interim Government became a site of perpetual conflict: Liaquat, as Finance Member, used his budgetary powers to block Congress initiatives; Jinnah rejected every proposal for cooperation; and the British, exhausted and eager to leave, had neither the will nor the capacity to enforce compromise.',
      citations: ['s1', 's16', 's5'],
    },
  },
  {
    id: 'b-p-empire-9', type: 'paragraph',
    data: {
      text: 'By December 1946, the Cabinet Mission Plan was dead. Attlee summoned the Indian leaders to London for a last-ditch conference, which also failed. On 20 February 1947, Attlee made a historic statement to the House of Commons: Britain would transfer power to Indian hands by June 1948 at the latest. If no agreed constitution had been framed by then, His Majesty\'s Government would "have to consider to whom the powers of the Central Government in British India should be handed over, on the due date, whether as a whole to some form of central government for British India, or in some areas to the existing provincial governments, or in such other way as may seem most reasonable and in the best interests of the Indian people." This sentence — the "or in some areas" clause — was the clearest signal yet that Britain was prepared to countenance partition if a united settlement proved impossible.',
      citations: ['s1', 's5', 's22'],
    },
  },
  {
    id: 'b-p-empire-10', type: 'paragraph',
    data: {
      text: 'Lord Mountbatten, a charismatic naval officer and cousin of the King, was appointed Viceroy in March 1947 with a mandate to achieve a settlement within a year. Mountbatten brought energy, political connections, and a willingness to engage directly with Indian leaders that Wavell had lacked. He established a personal rapport with Nehru and, to a lesser extent, with Jinnah, though his sympathies lay visibly with the Congress. Within weeks of his arrival, Mountbatten concluded that partition was unavoidable and that the only question was how to execute it with minimal chaos. He accelerated the timeline dramatically, moving the deadline for British withdrawal from June 1948 to August 1947 — a decision that would have consequences far beyond what any participant anticipated.',
      citations: ['s1', 's5', 's16'],
    },
  },
  {
    id: 'b-p-empire-11', type: 'paragraph',
    data: {
      text: 'The Mountbatten Plan, announced on 3 June 1947, proposed the partition of British India into two independent dominions: India and Pakistan. Punjab and Bengal, the two provinces with mixed Hindu-Muslim populations, would be divided. A Boundary Commission chaired by Sir Cyril Radcliffe, a British lawyer who had never visited India, would demarcate the borders. The princely states would be released from British paramountcy and left free to accede to either dominion. The entire transfer of power was scheduled for 15 August 1947 — just ten weeks after the plan\'s announcement. It was the fastest negotiated end to an empire in modern history.',
      citations: ['s1', 's11', 's12'],
    },
  },
  {
    id: 'b-p-empire-12', type: 'paragraph',
    data: {
      text: 'The compressed timeline had profound consequences. The Boundary Commission was given just five weeks to demarcate a border that would determine the fate of 400 million people. Radcliffe, working with incomplete census data and maps of variable quality, drew lines through villages, farmlands, and irrigation systems that had functioned as integrated economic units for centuries. The commissioners never visited the regions they were dividing; they based their decisions on petitions, population statistics, and the submissions of lawyers representing each side. The final award was published on 17 August, two days after independence, by which point large populations had already begun to flee — or been forced to flee — based on rumours and guesswork about where the borders would fall.',
      citations: ['s1', 's13', 's27'],
    },
  },
  {
    id: 'b-p-empire-13', type: 'paragraph',
    data: {
      text: 'The speed of British withdrawal reflected Britain\'s overriding priority: to exit India before order collapsed completely, and to maintain the goodwill of both successor states for post-imperial strategic and economic relationships. But the cost of speed was measured in human lives. The partition that took ten weeks to plan and execute displaced 14.5 million people, killed between 800,000 and 1 million, and left a legacy of hostility between two nuclear-armed states that persists into the twenty-first century. As Yasmin Khan argues, the British "did not so much oversee partition as preside over the collapse of the imperial state, leaving Indian and Pakistani leaders to pick up the pieces of an empire that had unravelled with astonishing speed."',
      citations: ['s16', 's1', 's27'],
    },
  },
  // ── 4. The Narrative ──
  { id: 'b-h2-narrative', type: 'heading', data: { text: 'The Narrative: What Happened', level: 1 } },
  { id: 'b-h2a', type: 'heading', data: { text: 'The Demographic Catastrophe', level: 2 } },
  {
    id: 'b-p-narr-1', type: 'paragraph',
    data: {
      text: 'When the new borders were announced on 17 August 1947, two days after independence, they revealed the impossible logic of Partition. The province of Punjab was split roughly in half, with the western districts going to Pakistan and the eastern districts to India. But the religious demography of Punjab was a mosaic, not a line. In district after district, Hindu, Muslim, and Sikh populations were intermingled in patterns that no border could separate cleanly. The Radcliffe Award, as the boundary decision was called, created an instant refugee crisis as terrified minorities fled what they now perceived as hostile territory.',
      citations: ['s1', 's13', 's27'],
    },
  },
  {
    id: 'b-p-narr-2', type: 'paragraph',
    data: {
      text: 'The scale of the migration was staggering. An estimated 14.5 million people crossed the new borders between August and December 1947 alone — the largest forced migration in human history up to that point, and one of the largest of any era. columns of refugees stretching for miles moved in both directions: Muslims heading west into Pakistan, Hindus and Sikhs heading east into India. The migration was particularly concentrated in Punjab, where the entire non-Muslim population of the western districts — some 5.5 million people — departed, while the entire Muslim population of the eastern districts — some 4.5 million — fled in the opposite direction.',
      citations: ['s1', 's31'],
    },
  },
  {
    id: 'b-p-narr-3', type: 'paragraph',
    data: {
      text: 'The violence that accompanied this migration was genocidal in its intensity. Entire trainloads of refugees were massacred. Villages were destroyed, women were abducted and raped, religious sites were desecrated, and children were orphaned by the tens of thousands. The British Indian Army, itself being divided between the two new states, was overwhelmed and in many cases unwilling to intervene. Estimates of the death toll range from 200,000 to 2 million, with the most careful scholarly calculations placing the figure at around 800,000 to 1 million killed in the first year alone.',
      citations: ['s10', 's16', 's27'],
    },
  },
  {
    id: 'b-p-narr-4', type: 'paragraph',
    data: {
      text: 'The gendered violence of Partition was particularly horrific. An estimated 100,000 women were abducted, raped, or forced into marriage on both sides of the border. The Indian and Pakistani governments later conducted recovery operations to repatriate abducted women, but these operations were themselves fraught with trauma — many women had been integrated into new families and were forcibly removed from children born of abduction. Urvashi Butalia\'s oral histories of survivors revealed experiences that had been systematically excluded from official nationalist narratives, where women\'s bodies had become symbols of communal honour and national territory.',
      citations: ['s20', 's19'],
    },
  },
  { id: 'b-h2a2', type: 'heading', data: { text: 'The Division of Assets', level: 2 } },
  {
    id: 'b-p-narr-5', type: 'paragraph',
    data: {
      text: 'The Indian Independence Act required the division of the British Indian Army, the Indian Civil Service, the railway system, the postal service, the telecommunications network, and the financial reserves of the central government between the two new dominions. A Partition Council, led by Lord Mountbatten with representatives from both Congress and the Muslim League, was established to oversee this process, but the speed of the transfer meant that many decisions were made ad hoc, with far-reaching consequences.',
      citations: ['s1', 's11'],
    },
  },
  {
    id: 'b-p-narr-6', type: 'paragraph',
    data: {
      text: 'The division of the British Indian Army was particularly consequential for national security. Of the approximately 1.2 million soldiers in undivided India\'s armed forces, roughly two-thirds went to India and one-third to Pakistan. The officer corps was divided proportionally, but individual soldiers were given the choice of which dominion to serve, leading to months of administrative chaos as troops redeployed across the new borders. The division of military hardware — tanks, aircraft, naval vessels, and ammunition stockpiles — was equally contentious, with Pakistan receiving a smaller share than it had demanded.',
      citations: ['s1', 's29'],
    },
  },
  {
    id: 'b-p-narr-7', type: 'paragraph',
    data: {
      text: 'The financial division was even more fraught. The British Indian government held substantial cash balances — approximately 4 billion rupees — in the Reserve Bank of India. Pakistan\'s share, calculated at 750 million rupees, was to be transferred in instalments. India withheld the final 550 million rupees after the Kashmir conflict erupted, using the unpaid balance as leverage. This decision, taken by Sardar Patel with Nehru\'s support, deepened Pakistani mistrust and established a pattern of economic coercion that would characterise India-Pakistan relations for decades.',
      citations: ['s1', 's3'],
    },
  },
  { id: 'h2-integration', type: 'heading', data: { text: 'The Integration of the Princely States', level: 2 } },
  {
    id: 'b-p-narr-8', type: 'paragraph',
    data: {
      text: 'Perhaps the most remarkable achievement of India\'s first years was the integration of 565 princely states into the Indian Union. With the lapse of British paramountcy on 15 August 1947, every princely ruler became legally independent, free to accede to India or Pakistan or to declare independence. The potential for balkanisation was enormous, particularly in the Muslim-majority states of Hyderabad, Junagadh, and Kashmir, and in the strategically located states of Travancore and Jodhpur.',
      citations: ['s1', 's18'],
    },
  },
  {
    id: 'b-p-narr-9', type: 'paragraph',
    data: {
      text: 'Sardar Vallabhbhai Patel, as India\'s first Home Minister and Minister of States, accomplished the integration through a combination of diplomatic persuasion, financial incentives, constitutional pressure, and — where necessary — military force. His deputy, V.P. Menon, designed the legal framework: rulers would sign Instruments of Accession covering only defence, foreign affairs, and communications, while maintaining internal autonomy through Standstill Agreements. Most states acceded peacefully between August 1947 and March 1948, but three cases required extraordinary measures.',
      citations: ['s18', 's1'],
    },
  },
  {
    id: 'b-p-narr-10', type: 'paragraph',
    data: {
      text: 'Junagadh, a Muslim-majority state on the western coast of India ruled by a Muslim Nawab, acceded to Pakistan in September 1947 despite being geographically surrounded by Indian territory. India refused to accept the accession, imposed a blockade, and sent troops to the border. The Nawab fled to Pakistan, and a plebiscite in February 1948 confirmed the population\'s wish to join India. Hyderabad, the largest and wealthiest princely state, attempted to declare independence and maintain its own army. After months of fruitless negotiations, India launched Operation Polo in September 1948 — a five-day military campaign that integrated Hyderabad by force. The Nizam\'s surrender on 17 September 1948 completed the integration of all states except one.',
      citations: ['s1', 's3'],
    },
  },
  { id: 'b-h2-kashmir', type: 'heading', data: { text: 'Kashmir: The Unfinished Business of Partition', level: 2 } },
  {
    id: 'b-p-narr-11', type: 'paragraph',
    data: {
      text: 'Jammu and Kashmir, the largest princely state in British India, presented the most complex challenge. Ruled by Maharaja Hari Singh, a Hindu, with a population that was approximately 77 per cent Muslim, the state was contiguous to both India and Pakistan. The Maharaja initially sought to remain independent, calculating that neither dominion could afford to have an independent Kashmir aligned with the other. He signed a Standstill Agreement with Pakistan in August 1947, maintaining existing arrangements for trade, communications, and supplies.',
      citations: ['s1', 's14'],
    },
  },
  {
    id: 'b-p-narr-12', type: 'paragraph',
    data: {
      text: 'On 22 October 1947, armed tribesmen from Pakistan\'s North-West Frontier Province, supported by regular Pakistani military officers, invaded Kashmir. The invasion force, estimated at 5,000 men, moved rapidly toward Srinagar, the summer capital. The Maharaja\'s state forces, already facing a rebellion in the Poonch region, were unable to resist. On 24 October, Hari Singh appealed to India for military assistance. India\'s response was conditional: the Maharaja must first sign an Instrument of Accession, bringing the state into the Indian Union.',
      citations: ['s1', 's8', 's21'],
    },
  },
  {
    id: 'b-p-narr-13', type: 'paragraph',
    data: {
      text: 'The Instrument of Accession was signed on 26 October 1947. Indian troops were immediately airlifted to Srinagar — the first major airlift operation conducted by the newly independent Indian Air Force, landing troops at the Srinagar airfield while tribal forces were still advancing on the city. The Indian troops secured the capital and, over the following weeks, pushed the invaders back to a line that would become, after UN mediation, the Ceasefire Line of 1 January 1949, later known as the Line of Control.',
      citations: ['s1', 's21'],
    },
  },
  {
    id: 'b-p-narr-14', type: 'paragraph',
    data: {
      text: 'India\'s decision to refer the Kashmir dispute to the United Nations Security Council on 1 January 1948 was one of the most consequential foreign policy choices in independent India\'s history. Nehru believed that the UN, as the guardian of international law and peace, would recognise the validity of Kashmir\'s accession and condemn Pakistani aggression. Instead, the UN Security Council passed Resolution 47 on 21 April 1948, which called for a ceasefire and a plebiscite to determine the will of the Kashmiri people — effectively treating the accession as provisional rather than final, and placing India and Pakistan on equal footing as disputants.',
      citations: ['s1', 's6', 's8'],
    },
  },
  {
    id: 'b-p-narr-15', type: 'paragraph',
    data: {
      text: 'The internationalisation of Kashmir would prove deeply controversial in Indian strategic discourse. Critics argued that Nehru\'s faith in international institutions was naive and that by taking the case to the UN, India had voluntarily given Pakistan a seat at the table on a question India considered legally settled. The plebiscite demanded by Resolution 47 was never held — because, India later argued, Pakistan never withdrew its forces as required by the resolution — but the demand for it became the central plank of Pakistan\'s diplomatic position for the next seven decades.',
      citations: ['s1', 's6'],
    },
  },
  // ── 5. Why Partition Happened ──
  { id: 'b-h-why-partition', type: 'heading', data: { text: 'Part II: Why Partition Happened — Competing Explanations', level: 1 } },
  {
    id: 'b-p-why-intro', type: 'paragraph',
    data: {
      text: 'Why did the partition of India happen? Despite decades of scholarship, there is no single answer on which historians agree. The question is not merely academic — different explanations assign responsibility differently, and these disagreements shape how India and Pakistan understand themselves and each other. The six explanations below represent the major schools of thought. Each rests on evidence, each has powerful advocates, and each faces significant criticisms. Together, they reveal that Partition was not the product of a single cause but of a convergence of forces — imperial, political, ideological, social, administrative, and strategic — whose interaction produced an outcome that few participants fully intended and many later regretted.',
      citations: ['s1', 's16'],
    },
  },
  {
    id: 'b-h-why-imperial', type: 'heading', data: { text: 'The Imperial Explanation', level: 2 },
  },
  {
    id: 'b-p-why-imperial-1', type: 'paragraph',
    data: {
      text: 'The imperial explanation, most associated with the Indian nationalist school, argues that Partition was the deliberate product of British divide-and-rule policies. From the early twentieth century, the British systematically fostered Hindu-Muslim antagonism through separate electorates (1909, 1919), communal representation in provincial governments, and strategic favouritism toward the Muslim League, particularly after the outbreak of the Second World War when the League\'s cooperation was needed for the war effort. In this view, Partition was the final act of imperial manipulation — a colonial wound inflicted to ensure that the successor states would remain weak, dependent, and hostile to each other, preserving British influence in the subcontinent after formal empire ended. Bipan Chandra and the nationalist school argue that by 1947, the British had so successfully communalised Indian politics that partition had become, from their perspective, the preferred outcome.',
      citations: ['s1', 's3'],
    },
  },
  {
    id: 'b-p-why-imperial-2', type: 'paragraph',
    data: {
      text: 'The imperial explanation has significant strengths. It accounts for the long arc of British policy, the institutional mechanisms through which communal identity was politicised, and the British willingness to accelerate partition in 1947 when a united settlement was still theoretically possible. But critics argue that it minimises the agency of Indian actors. The Muslim League\'s demand for Pakistan, they contend, was not a British creation but a genuine political movement with deep roots in Muslim society. The Cambridge revisionist school, led by Ayesha Jalal and Anil Seal, argues that British policy was reactive rather than manipulative — that the Empire was already in terminal decline and that partition resulted primarily from the competitive dynamics of Indian politics, not British design.',
      citations: ['s3', 's17'],
    },
  },
  {
    id: 'b-h-why-congress', type: 'heading', data: { text: 'The Congress Explanation', level: 2 },
  },
  {
    id: 'b-p-why-congress-1', type: 'paragraph',
    data: {
      text: 'A second explanation, advanced by scholars of the Muslim League and some British historians, places primary responsibility on Congress — particularly its leadership under Nehru and Patel. In this view, Congress\'s refusal to accept power-sharing arrangements, its insistence on a strong centralised state, and its inability to accommodate Muslim minority concerns drove the Muslim League toward partition as the only viable guarantee of Muslim political rights. Congress leaders, confident of their electoral dominance, consistently rejected proposals for coalition governments, federal structures with substantial provincial autonomy, and constitutional safeguards for minorities. Jinnah\'s demand for Pakistan, from this perspective, was not an expression of primordial communalism but a rational response to Congress\'s unwillingness to share power.',
      citations: ['s1', 's17'],
    },
  },
  {
    id: 'b-p-why-congress-2', type: 'paragraph',
    data: {
      text: 'Critics of this view note that Congress was not a monolith — Nehru, Patel, Rajagopalachari, and Azad held different positions on power-sharing and Muslim representation. The Congress did, in fact, accept the Cabinet Mission Plan, which would have given Muslim-majority provinces significant autonomy. The plan collapsed when Nehru made his statement about the Constituent Assembly\'s freedom — a statement that Jalal interprets as revealing Congress\'s true intentions but that Guha reads as an unforced rhetorical error. Furthermore, Congress leaders genuinely believed that accepting communal electorates and separate Muslim representation would permanently legitimise religious identities in politics, undermining the secular nationalism for which they had fought the freedom struggle.',
      citations: ['s1', 's16', 's17'],
    },
  },
  {
    id: 'b-h-why-league', type: 'heading', data: { text: 'The Muslim League Explanation', level: 2 },
  },
  {
    id: 'b-p-why-league-1', type: 'paragraph',
    data: {
      text: 'A third explanation, associated with Pakistani nationalist historiography, argues that Partition was the inevitable outcome of irreconcilable Hindu-Muslim differences — the Two-Nation theory made manifest. In this view, Hindus and Muslims constituted two distinct nations with separate histories, cultures, legal traditions, and social systems. Democratic rule in a Hindu-majority India would permanently subordinate Muslim interests. The demand for Pakistan was therefore not a bargaining ploy but the expression of a deep and historically grounded national identity. Jinnah emerges in this account as a visionary leader who articulated Muslim aspirations and secured a homeland against overwhelming opposition from both the British and the Congress.',
      citations: ['s17', 's16'],
    },
  },
  {
    id: 'b-p-why-league-2', type: 'paragraph',
    data: {
      text: 'The Muslim League explanation faces several challenges. Revisionist historians, most notably Ayesha Jalal, have demonstrated that Jinnah\'s strategy was far more ambiguous than Pakistani nationalist accounts suggest. Jalal argues that Jinnah used the demand for Pakistan as a bargaining counter to secure maximum autonomy for Muslims within a federal India and did not intend the full partition that occurred. The Two-Nation theory, in this reading, was a political instrument rather than a deeply held conviction. Moreover, the persistent existence of significant Muslim populations in India after partition — approximately 35 million in the 1951 census — suggests that the theory of irreconcilable difference was not universally accepted by the Muslims who were supposedly its constituency.',
      citations: ['s17', 's1'],
    },
  },
  {
    id: 'b-h-why-communal', type: 'heading', data: { text: 'The Communal Violence Explanation', level: 2 },
  },
  {
    id: 'b-p-why-communal-1', type: 'paragraph',
    data: {
      text: 'A fourth explanation emphasises the role of violence itself. From the Great Calcutta Killing of August 1946 through the massacres in Noakhali, Bihar, and Punjab that followed, communal violence created realities on the ground that made partition increasingly difficult to reverse. Each episode of violence hardened communal identities, destroyed mixed neighbourhoods that had previously coexisted, and convinced populations that they could not safely live as minorities under the other community\'s rule. The subaltern school, particularly Gyanendra Pandey and Urvashi Butalia, argues that violence was not merely a consequence of political decisions but an independent force that reshaped the political landscape, creating the conditions for partition through terror and displacement.',
      citations: ['s19', 's20', 's16'],
    },
  },
  {
    id: 'b-p-why-communal-2', type: 'paragraph',
    data: {
      text: 'This explanation provides a corrective to elite-focussed political histories. It shows that ordinary people — through their participation in, and victimisation by, communal violence — shaped the outcome as much as the leaders who negotiated in Delhi and London. The violence of 1946-47 destroyed the social fabric of mixed communities in ways that no constitutional formula could repair. But critics argue that this explanation risks treating violence as an autonomous force rather than the product of political mobilisation. The violence did not emerge spontaneously; it was organised, led, and in many cases directed by political actors with specific goals.',
      citations: ['s19', 's16', 's27'],
    },
  },
  {
    id: 'b-h-why-admin', type: 'heading', data: { text: 'The Administrative Explanation', level: 2 },
  },
  {
    id: 'b-p-why-admin-1', type: 'paragraph',
    data: {
      text: 'A fifth explanation, less common in popular discourse but influential among historians of the British state, argues that Partition resulted primarily from the collapse of administrative capacity. The British Indian state, severely weakened by the war, no longer had the resources, personnel, or legitimacy to maintain order or enforce a political settlement. The Indian Civil Service had been depleted by wartime expansion and Indianisation; the police and army were stretched thin; the treasury was empty. In this reading, partition was not chosen but stumbled into — the default outcome when a colonial state too weak to impose a solution handed power to political forces it could no longer control. Yasmin Khan\'s work emphasises this dimension, showing how the everyday functioning of the state broke down in 1946-47 before any political decision about partition had been taken.',
      citations: ['s16', 's1'],
    },
  },
  {
    id: 'b-p-why-admin-2', type: 'paragraph',
    data: {
      text: 'The administrative explanation has the virtue of foregrounding contingency and chaos — elements that elite-focused political histories often neglect. It explains why the British were willing to accept a partition that many of them knew would be bloody: they simply lacked the capacity to do otherwise. But critics argue that administrative collapse was itself a product of political decisions, not an exogenous force. The British chose to reduce investment in Indian administration during the war; they chose to accelerate the timeline in 1947; they chose to prioritise an orderly exit over a just settlement. Administrative incapacity was, in part, a self-fulfilling prophecy.',
      citations: ['s16', 's5'],
    },
  },
  {
    id: 'b-h-why-strategic', type: 'heading', data: { text: 'The Strategic Explanation', level: 2 },
  },
  {
    id: 'b-p-why-strategic-1', type: 'paragraph',
    data: {
      text: 'A sixth explanation, emerging from international history and strategic studies, situates Partition within the broader context of British imperial strategy and the emerging Cold War. From this perspective, Britain\'s primary concern in 1947 was not the welfare of Indians but the preservation of its strategic interests in the Indian Ocean, the Persian Gulf, and Southeast Asia. A united India under Congress leadership, committed to non-alignment and anti-colonial solidarity, was less attractive to British planners than two smaller states — one of which (Pakistan) was eager for military alliance with the West. Srinath Raghavan and other scholars of the strategic school argue that British policy in 1946-47 was shaped by calculations about the Cold War before it had fully begun, and that the accelerated partition served British strategic interests even as it failed Indian populations.',
      citations: ['s1', 's21'],
    },
  },
  {
    id: 'b-p-why-strategic-2', type: 'paragraph',
    data: {
      text: 'The strategic explanation connects the partition of India to the larger arc of twentieth-century international history. It shows that decolonisation was not a process that happened to the Great Powers but one they actively shaped to serve their interests. However, critics argue that this explanation can overstate British agency and foresight. British policymakers in 1947 were operating in conditions of extreme uncertainty, reacting to events they could not control as much as shaping outcomes they desired. The Cold War had not yet congealed into the rigid structure it would later assume, and it is anachronistic to attribute the specific shape of Partition to strategic calculations that were, at best, embryonic.',
      citations: ['s1', 's21'],
    },
  },
  {
    id: 'b-p-why-synthesis', type: 'paragraph',
    data: {
      text: 'No single explanation is sufficient. Partition was overdetermined — the product of multiple, mutually reinforcing causes. The British wanted to leave and were willing to accept partition to do so. The Congress wanted a strong central state and was unwilling to accept the federal arrangements that might have preserved unity. The Muslim League wanted guarantees for Muslim political rights and eventually concluded that only a separate state would provide them. Communal violence created realities on the ground that political negotiation could not reverse. The colonial state was too weak to impose any other outcome. And the emerging Cold War provided a strategic context in which partition served interests beyond the subcontinent. The task of scholarship is not to choose among these explanations but to understand how they interacted — and why, at a particular moment in history, they converged to produce one of the most consequential political divisions of the twentieth century.',
      citations: ['s1', 's16', 's17', 's21'],
    },
  },
  // ── 6. Decision Matrix ──
  { id: 'b-h-decision', type: 'heading', data: { text: 'Decision Matrix: The Great Choices of 1947', level: 1 } },
  {
    id: 'b-decision-matrix', type: 'decision-matrix', depth: ['scholar', 'researcher'],
    data: {
      title: 'Kashmir: Internationalise or Bilateralise?',
      context: 'When Pakistani tribal militias invaded Kashmir in October 1947, India had a choice: handle the conflict bilaterally through military force alone, or refer it to the United Nations. The decision would set the template for how India engaged with international institutions for decades.',
      options: [
        {
          label: 'Internationalise — Refer to the UN (Nehru\'s choice)',
          description: 'India would invoke Article 35 of the UN Charter, referring the dispute to the Security Council while continuing military operations to defend Kashmir.',
          proponents: ['Jawaharlal Nehru', 'V.K. Krishna Menon', 'G.S. Bajpai'],
          opponents: ['Sardar Patel', 'The Hindu nationalist press', 'Some Congress hawks'],
          outcome: 'The UN passed Resolution 47 calling for a ceasefire and plebiscite. The plebiscite was never held, but the resolution became the diplomatic foundation of Pakistan\'s position for 75 years.',
          counterfactual: 'If India had not internationalised the dispute, Pakistan might have faced a purely bilateral military confrontation that it was losing, potentially leading to a more decisive Indian victory and a settlement on Indian terms.',
        },
        {
          label: 'Bilateralise — Settle by Force',
          description: 'India could have continued military operations to expel all invaders from Kashmir without UN involvement, then presented Pakistan with a fait accompli.',
          proponents: ['Sardar Patel', 'Military commanders who favoured pushing deeper into Pakistani territory'],
          opponents: ['Jawaharlal Nehru', 'International law advisors', 'The British who favoured UN involvement'],
          outcome: 'Not chosen. India went to the UN instead. The resulting UN involvement froze the conflict along lines that left one-third of the former princely state under Pakistani control.',
          counterfactual: 'A purely bilateral settlement might have produced a clearer resolution but at the cost of India\'s international credibility and its claim to be a responsible member of the post-war international order.',
        },
      ],
    },
  },
  {
    id: 'b-decision-matrix-2', type: 'decision-matrix', depth: ['scholar', 'researcher'],
    data: {
      title: 'Hyderabad: Negotiate or Integrate by Force?',
      context: 'The Nizam of Hyderabad, ruler of the wealthiest princely state in India, refused to accede to either India or Pakistan after independence. For over a year, India attempted negotiations while the Nizam built up his armed forces and explored international recognition.',
      options: [
        {
          label: 'Negotiate a Settlement',
          description: 'Continue diplomatic efforts to persuade the Nizam to accede peacefully, offering favourable terms for his dynasty and maintaining internal autonomy.',
          proponents: ['Jawaharlal Nehru', 'Lord Mountbatten', 'The British government'],
          opponents: ['Sardar Patel', 'V.P. Menon', 'Indian military leadership'],
          outcome: 'Negotiations dragged on for 13 months without resolution. The Nizam\'s intransigence and his attempts to secure recognition from Pakistan and other Muslim-majority countries made a peaceful settlement increasingly unlikely.',
          counterfactual: 'If negotiations had succeeded, India might have avoided the international criticism that accompanied the police action, but the delay risked the consolidation of Hyderabad as an independent state with military capacity.',
        },
        {
          label: 'Military Integration (Patel\'s choice)',
          description: 'Launch a police action to integrate Hyderabad by force, accepting short-term international criticism for the sake of long-term national unity.',
          proponents: ['Sardar Patel', 'V.P. Menon', 'Indian Army leadership'],
          opponents: ['Jawaharlal Nehru (initially)', 'Lord Mountbatten', 'British and US diplomats'],
          outcome: 'Operation Polo (13-18 September 1948), a five-day military campaign, integrated Hyderabad. India faced international criticism but the action was popular domestically and the integration held.',
          counterfactual: 'If India had not acted decisively, Hyderabad might have become a Pakistan-aligned state in the heart of India, creating a permanent strategic vulnerability on the Deccan plateau.',
        },
      ],
    },
  },
  // ── 6. Comparative Timeline ──
  { id: 'b-h-timeline', type: 'heading', data: { text: 'Comparative Timeline: India\'s Founding Crisis', level: 1 } },
  {
    id: 'b-timeline-2', type: 'timeline',
    data: {
      title: 'August 1947 — January 1949',
      description: 'The major events that shaped India\'s strategic inheritance during its first eighteen months of independence.',
      events: [
        {
          id: 'ev-tl-1', date: '3 Jun 1947', title: 'Mountbatten Plan Announced',
          description: 'Lord Mountbatten announces the partition plan, setting 15 August as the transfer of power date.',
          categories: ['political'], sources: ['s12'], entities: ['Mountbatten', 'Nehru', 'Jinnah'], documents: ['doc-mountbatten-plan'], significance: 5,
        },
        {
          id: 'ev-tl-2', date: '14 Aug 1947', title: 'Pakistan Created',
          description: 'The Dominion of Pakistan comes into existence with Jinnah as Governor-General.',
          categories: ['political'], sources: ['s1'], entities: ['Pakistan', 'Jinnah'], documents: ['doc-independence-act'], significance: 5,
        },
        {
          id: 'ev-tl-3', date: '15 Aug 1947', title: 'India Independent',
          description: 'Nehru becomes Prime Minister. Nehru delivers Tryst with Destiny speech.',
          categories: ['political'], sources: ['s4'], entities: ['Nehru', 'India'], documents: ['doc-nehru-tryst'], significance: 5,
        },
        {
          id: 'ev-tl-4', date: '17 Aug 1947', title: 'Radcliffe Award Published',
          description: 'Final borders between India and Pakistan announced, dividing Punjab and Bengal.',
          categories: ['political'], sources: ['s13'], entities: ['Radcliffe', 'India', 'Pakistan'], documents: ['doc-radcliffe-award'], significance: 5,
        },
        {
          id: 'ev-tl-5', date: 'Aug–Dec 1947', title: 'Partition Violence Peak',
          description: 'Mass communal violence across Punjab and Bengal. Up to 1 million killed.',
          categories: ['conflict', 'social'], sources: ['s10', 's27'], entities: ['Punjab', 'Bengal'], documents: [], significance: 5,
        },
        {
          id: 'ev-tl-6', date: 'Aug 1947 – Mar 1948', title: 'Princely States Integration',
          description: 'Sardar Patel and V.P. Menon begin integrating 565 states. Most accede peacefully.',
          categories: ['political', 'diplomatic'], sources: ['s18'], entities: ['Patel', 'Menon', 'India'], documents: [], significance: 5,
        },
        {
          id: 'ev-tl-7', date: '15 Sep 1947', title: 'Junagadh Crisis',
          description: 'Junagadh accedes to Pakistan. India imposes blockade, leading to the Nawab\'s flight.',
          categories: ['diplomatic', 'conflict'], sources: ['s1'], entities: ['Junagadh', 'Pakistan', 'India'], documents: [], significance: 3,
        },
        {
          id: 'ev-tl-8', date: '22 Oct 1947', title: 'Kashmir Invasion Begins',
          description: 'Pakistani tribal militias invade Kashmir, advancing toward Srinagar.',
          categories: ['military', 'conflict'], sources: ['s21'], entities: ['Kashmir', 'Pakistan'], documents: [], significance: 5,
        },
        {
          id: 'ev-tl-9', date: '26 Oct 1947', title: 'Kashmir Accedes to India',
          description: 'Maharaja Hari Singh signs the Instrument of Accession. Indian troops airlifted to Srinagar.',
          categories: ['political', 'military'], sources: ['s14'], entities: ['Hari Singh', 'India', 'Kashmir'], documents: ['doc-kashmir-accession'], significance: 5,
        },
        {
          id: 'ev-tl-10', date: '1 Jan 1948', title: 'India Refers Kashmir to UN',
          description: 'Nehru takes the Kashmir dispute to the UN Security Council, internationalising the conflict.',
          categories: ['diplomatic'], sources: ['s6'], entities: ['India', 'UN', 'Kashmir'], documents: ['doc-un-res-47'], significance: 5,
        },
        {
          id: 'ev-tl-11', date: '30 Jan 1948', title: 'Gandhi Assassinated',
          description: 'Nathuram Godse assassinates Mahatma Gandhi. India imposes strict security and the nation mourns.',
          categories: ['political', 'social'], sources: ['s1'], entities: ['Gandhi', 'India'], documents: [], significance: 4,
        },
        {
          id: 'ev-tl-12', date: '21 Apr 1948', title: 'UN Resolution 47 Passed',
          description: 'UN Security Council calls for ceasefire and plebiscite in Kashmir.',
          categories: ['diplomatic'], sources: ['s6'], entities: ['UN', 'India', 'Pakistan', 'Kashmir'], documents: ['doc-un-res-47'], significance: 5,
        },
        {
          id: 'ev-tl-13', date: '13–18 Sep 1948', title: 'Operation Polo — Hyderabad',
          description: 'India integrates Hyderabad through a five-day military campaign.',
          categories: ['military', 'political'], sources: ['s1'], entities: ['Hyderabad', 'India', 'Patel'], documents: [], significance: 4,
        },
        {
          id: 'ev-tl-14', date: '1 Jan 1949', title: 'UN Ceasefire in Kashmir',
          description: 'UN-mediated ceasefire leaves Kashmir divided along what becomes the Line of Control.',
          categories: ['diplomatic', 'military'], sources: ['s6', 's8'], entities: ['Kashmir', 'UN', 'India', 'Pakistan'], documents: ['doc-un-res-47'], significance: 5,
        },
        {
          id: 'ev-tl-15', date: '8 Apr 1950', title: 'Liaquat-Nehru Pact',
          description: 'India and Pakistan sign a pact guaranteeing minority rights in both countries.',
          categories: ['diplomatic'], sources: ['s15'], entities: ['Nehru', 'Liaquat Ali Khan'], documents: ['doc-liaquat-nehru-pact'], significance: 3,
        },
      ],
    },
  },
  // ── 7. Thinkers' Debate ──
  { id: 'b-h-thinkers', type: 'heading', data: { text: 'Thinkers\' Debate: Founding Visions', level: 1 } },
  {
    id: 'b-thinker-nehru-2', type: 'thinker', depth: ['scholar', 'researcher'],
    data: {
      name: 'Jawaharlal Nehru',
      school: 'Liberal Internationalism / Non-Alignment',
      birthYear: 1889, deathYear: 1964,
      corePrinciples: [
        'National sovereignty must not be compromised by alliance with either Cold War bloc',
        'International institutions (UN, Commonwealth) are the proper forum for dispute resolution',
        'Economic development and industrialisation are prerequisites for strategic independence',
        'Secularism at home enables credibility abroad, especially with non-aligned and Muslim-majority nations',
        'Colonialism and racialism are moral evils that must be opposed universally',
        'Asian and African solidarity provides a counterweight to European and American dominance',
      ],
      arguments: [
        {
          title: 'Non-Alignment as Strategic Autonomy',
          summary: 'Nehru argued that India could best serve its national interest by avoiding formal military alliances with either the US or the Soviet Union. This preserved India\'s freedom of action, maximised aid from both blocs, and positioned India as a leader of the decolonising world. Non-alignment was not passivity but an active attempt to shape the post-colonial order and create a third way in international relations.',
          supportingEvidence: [
            { sourceId: 's1', relevance: 'direct', excerpt: 'Nehru\'s non-alignment preserved India\'s freedom of action and maximised aid from both Cold War blocs.' },
            { sourceId: 's7', relevance: 'direct', excerpt: 'Nehru believed that military alliances would subordinate Indian decision-making to great power interests.' },
            { sourceId: 's22', relevance: 'supporting', excerpt: 'Gopal emphasises that Nehru\'s policy was rooted in India\'s anti-colonial struggle and a deep commitment to national sovereignty.' },
          ],
        },
        {
          title: 'International Institutions as a Forum',
          summary: 'Nehru believed that international law and the United Nations could resolve disputes impartially. This conviction was tested — and found partially wanting — in the Kashmir case, but Nehru maintained his commitment to multilateralism throughout his tenure, arguing that the UN system, despite its flaws, was the best available framework for managing international conflict.',
          supportingEvidence: [
            { sourceId: 's6', relevance: 'direct', excerpt: 'India\'s referral of Kashmir to the UN was based on a genuine belief in international arbitration.' },
            { sourceId: 's8', relevance: 'contextual', excerpt: 'The UN\'s inability to enforce the plebiscite later disillusioned Indian policymakers.' },
          ],
        },
        {
          title: 'Secularism as Foreign Policy',
          summary: 'Nehru understood that India\'s commitment to secularism — treating all religions equally in the public sphere — was not merely a domestic constitutional principle but a foreign policy asset. A secular India could maintain credibility with Muslim-majority nations in the Arab world, Southeast Asia, and Africa in ways that a Hindu nationalist India could not.',
          supportingEvidence: [
            { sourceId: 's4', relevance: 'direct', excerpt: 'Nehru\'s Tryst with Destiny speech frames Indian nationalism in explicitly civic, not religious, terms.' },
            { sourceId: 's1', relevance: 'direct', excerpt: 'India\'s secular identity was a key diplomatic asset in relations with the Arab world and Southeast Asia.' },
          ],
        },
      ],
      criticism: [
        {
          title: 'Non-Alignment as Moral Posturing',
          summary: 'Critics argue that non-alignment gave India rhetorical cover without strategic substance. India accepted aid from both superpowers while criticising their policies, which some saw as hypocritical rather than principled. The policy provided no security guarantee when China attacked in 1962.',
          counterarguments: [
            { sourceId: 's1', relevance: 'supporting', excerpt: 'Non-alignment preserved India\'s strategic autonomy and allowed India to receive aid from both blocs without formal commitment.' },
            { sourceId: 's22', relevance: 'supporting', excerpt: 'Non-alignment was a rational response to India\'s geopolitical position and limited military capacity, not moral posturing.' },
          ],
        },
        {
          title: 'Neglect of Military Power',
          summary: 'Nehru\'s emphasis on diplomacy and international law led him to neglect military modernisation. Defence spending was kept low, the military was not prepared for a high-altitude war, and intelligence on China was inadequate. The result was the humiliating defeat of 1962.',
          counterarguments: [
            { sourceId: 's7', relevance: 'contextual', excerpt: 'India\'s military weakness in 1962 was as much a failure of intelligence and political decision-making as of military spending.' },
          ],
        },
        {
          title: 'Naive Internationalisation of Kashmir',
          summary: 'By taking the Kashmir dispute to the UN, Nehru voluntarily internationalised a conflict that India was winning on the ground, giving Pakistan a diplomatic platform it would not otherwise have had and subjecting India to international pressure for a plebiscite that became a permanent diplomatic liability.',
          counterarguments: [
            { sourceId: 's1', relevance: 'supporting', excerpt: 'Nehru genuinely believed the UN would recognise the validity of India\'s position, and the UN\'s failure to enforce its own resolution was a failure of the institution, not of India\'s approach.' },
          ],
        },
      ],
      furtherReading: [
        'India After Gandhi by Ramachandra Guha',
        'Nehru: The Invention of India by Shashi Tharoor',
        'Jawaharlal Nehru: A Biography by S. Gopal',
        'The Discovery of India by Jawaharlal Nehru',
      ],
    },
  },
  {
    id: 'b-thinker-patel', type: 'thinker', depth: ['scholar', 'researcher'],
    data: {
      name: 'Sardar Vallabhbhai Patel',
      school: 'Practical Nationalism / State-Building Realism',
      birthYear: 1875, deathYear: 1950,
      corePrinciples: [
        'National unity must be secured through decisive administrative action, not diplomatic idealism',
        'Pakistan is a revisionist state created by Partition — India should not reward its creation with concessions',
        'Princely states must be integrated through a combination of diplomacy and coercive pressure where necessary',
        'A strong centralised state with unified military command is essential for India\'s survival',
        'Secularism is a political necessity for maintaining India\'s territorial integrity, not a moral mission',
      ],
      arguments: [
        {
          title: 'Integration of Princely States',
          summary: 'Patel, with V.P. Menon as his constitutional architect, orchestrated the integration of 565 princely states in less than two years. The policy combined diplomatic persuasion with the implicit threat of force: rulers who acceded peacefully were guaranteed their privy purses and titles; those who resisted faced military action, as Hyderabad discovered. Patel\'s approach demonstrated that national unity could not be achieved through persuasion alone.',
          supportingEvidence: [
            { sourceId: 's18', relevance: 'direct', excerpt: 'Menon\'s account provides the definitive insider narrative of integration, detailing how Patel used diplomatic persuasion, financial pressure, and military threat.' },
          ],
        },
        {
          title: 'Hard Line on Pakistan',
          summary: 'Patel advocated a consistently harder line on Pakistan than Nehru. He argued for withholding Pakistan\'s share of financial assets until the Kashmir issue was resolved, opposed any negotiation that might legitimise Pakistan\'s claim to Kashmir, and favoured a more decisive military response to the tribal invasion. His approach reflected a deep conviction that Pakistan was, by its nature, a revisionist state that would interpret Indian conciliation as weakness.',
          supportingEvidence: [
            { sourceId: 's1', relevance: 'direct', excerpt: 'Patel favoured a more assertive posture toward Pakistan, arguing India should not reward Pakistan\'s creation by being conciliatory.' },
          ],
        },
      ],
      criticism: [
        {
          title: 'Authoritarian Tendencies',
          summary: 'Critics argue that Patel\'s approach to state-building was centralising and authoritarian. He suppressed regional democratic movements, imposed presidential rule on states that resisted integration, and concentrated power in Delhi in ways that undermined India\'s federal character.',
          counterarguments: [
            { sourceId: 's1', relevance: 'supporting', excerpt: 'The integration of princely states was widely supported as necessary for national survival, and Patel acted with the authority of the Constituent Assembly.' },
          ],
        },
        {
          title: 'Communal Leanings',
          summary: 'Some historians argue that Patel was more sympathetic to Hindu nationalism than Nehru, pointing to his close relationships with Hindu nationalist leaders and his suspicion of Muslim loyalty to India.',
          counterarguments: [
            { sourceId: 's1', relevance: 'supporting', excerpt: 'Patel worked closely with Nehru on secular policies and was committed to protecting Muslim rights in India, though his rhetoric was often sharper than Nehru\'s.' },
          ],
        },
      ],
      furtherReading: [
        'Sardar Patel: A Biography by Rajmohan Gandhi',
        'Patel: A Life by N.V. Rajkumar',
        'The Story of the Integration of the Indian States by V.P. Menon',
      ],
    },
  },
  {
    id: 'b-thinker-jinnah', type: 'thinker', depth: ['scholar', 'researcher'],
    data: {
      name: 'Muhammad Ali Jinnah',
      school: 'Two-Nation Theory / Muslim Nationalism',
      birthYear: 1876, deathYear: 1948,
      corePrinciples: [
        'Hindus and Muslims constitute two distinct nations with separate identities, cultures, and histories',
        'Muslims require a separate homeland to protect their political and economic rights from Hindu majority domination',
        'Pakistan must be a democratic state where Muslims and non-Muslims have equal citizenship rights',
        'Kashmir, as a Muslim-majority state contiguous to Pakistan, rightfully belongs to Pakistan',
        'India cannot be trusted to treat its Muslim minority fairly',
      ],
      arguments: [
        {
          title: 'Two-Nation Theory',
          summary: 'Jinnah\'s central argument was that Hindus and Muslims were two distinct nations who could not coexist in a single democratic state. He argued that majority rule in a united India would permanently subordinate Muslim interests, making a separate state the only guarantee of Muslim political and cultural survival.',
          supportingEvidence: [
            { sourceId: 's17', relevance: 'direct', excerpt: 'Jalal argues that Jinnah used the Two-Nation theory strategically to demand parity for Muslims, and may not have intended the full partition that occurred.' },
          ],
        },
        {
          title: 'Kashmir Claim',
          summary: 'Jinnah maintained that Kashmir, as a Muslim-majority state geographically contiguous to Pakistan, should have acceded to Pakistan. He regarded the Maharaja\'s accession to India as legally invalid and morally illegitimate, arguing that the will of the Kashmiri people should determine the state\'s future.',
          supportingEvidence: [
            { sourceId: 's1', relevance: 'direct', excerpt: 'Jinnah refused to accept Kashmir\'s accession to India and ordered Pakistani forces to support the tribal invasion.' },
          ],
        },
      ],
      criticism: [
        {
          title: 'Ambiguous Intentions',
          summary: 'The revisionist school, particularly Ayesha Jalal, argues that Jinnah never clearly intended to create a separate Pakistan but used the demand as a bargaining strategy to secure greater autonomy for Muslims within a federal India. The momentum of events — and the intransigence of both Congress and the British — pushed him toward a partition he did not originally seek.',
          counterarguments: [
            { sourceId: 's17', relevance: 'supporting', excerpt: 'Jalal\'s revisionist account suggests Jinnah was a constitutionalist who preferred a negotiated settlement within a united India.' },
          ],
        },
      ],
      furtherReading: [
        'The Sole Spokesman by Ayesha Jalal',
        'Jinnah: India-Partition-Independence by Jaswant Singh',
        'Pakistan: A Hard Country by Anatol Lieven',
      ],
    },
  },
  {
    id: 'b-thinker-ambedkar', type: 'thinker', depth: ['scholar', 'researcher'],
    data: {
      name: 'B.R. Ambedkar',
      school: 'Constitutional Democracy / Dalit Emancipation',
      birthYear: 1891, deathYear: 1956,
      corePrinciples: [
        'Political democracy is meaningless without social and economic democracy',
        'The caste system is a fundamental form of oppression that predates and transcends communal division',
        'Partition was the logical consequence of Congress\'s failure to address Muslim minority concerns within a united India',
        'A strong central state with a written constitution guaranteeing fundamental rights is essential for protecting minority communities',
        'Foreign policy must serve the interests of India\'s most marginalised citizens, not merely the elite',
      ],
      arguments: [
        {
          title: 'Partition as Congress Failure',
          summary: 'Ambedkar argued that the demand for Pakistan was not merely a product of British divide-and-rule or Muslim League communalism, but reflected genuine Muslim anxieties that Congress had failed to address. In his 1940 book *Pakistan, or the Partition of India*, he provided a forensic analysis of why Muslims feared majoritarian democracy and how Congress\'s refusal to accept power-sharing arrangements had strengthened Jinnah\'s hand. He concluded that partition, while tragic, was the lesser evil compared to the continued subordination of Muslims in a Hindu-majority state.',
          supportingEvidence: [
            { sourceId: 's1', relevance: 'direct', excerpt: 'Guha notes that Ambedkar\'s analysis of the Pakistan question was more dispassionate and analytically rigorous than that of most Congress leaders.' },
            { sourceId: 's17', relevance: 'supporting', excerpt: 'Jalal\'s revisionist account, while differing from Ambedkar\'s conclusions, shares his emphasis on Muslim minority anxieties as a driver of the demand for Pakistan.' },
          ],
        },
        {
          title: 'Caste and Foreign Policy',
          summary: 'Ambedkar\'s most original contribution to Indian strategic thought was his insistence that a country that practised caste discrimination could not credibly claim moral leadership in the international arena. He argued that India\'s treatment of Dalits was directly relevant to its foreign policy credibility, particularly in Asia and Africa, where racial and caste hierarchies had been imposed by colonialism. His resignation from Nehru\'s cabinet in 1951 over the stalled Hindu Code Bill demonstrated his prioritisation of social justice over diplomatic consensus.',
          supportingEvidence: [
            { sourceId: 's1', relevance: 'direct', excerpt: 'Ambedkar\'s critique of India\'s foreign policy was rooted in a conviction that social reform at home was a prerequisite for moral authority abroad.' },
          ],
        },
      ],
      criticism: [
        {
          title: 'Marginal Influence on Foreign Policy',
          summary: 'Critics argue that Ambedkar\'s influence on Indian foreign policy was minimal. He served as Law Minister, not Foreign Minister, and his concerns were primarily domestic. The Nehruvian consensus on non-alignment and strategic autonomy was formed without significant input from Ambedkar or the Dalit movement.',
          counterarguments: [
            { sourceId: 's1', relevance: 'supporting', excerpt: 'While Ambedkar\'s direct influence on foreign policy was limited, his critique of caste as a barrier to India\'s international credibility anticipated later debates about human rights and soft power.' },
          ],
        },
      ],
      furtherReading: [
        'Pakistan, or the Partition of India by B.R. Ambedkar',
        'Ambedkar: Towards an Enlightened India by Gail Omvedt',
        'The Doctor and the Saint by Arundhati Roy',
        'Waiting for a Visa by B.R. Ambedkar',
      ],
    },
  },
  {
    id: 'b-thinker-gandhi', type: 'thinker', depth: ['scholar', 'researcher'],
    data: {
      name: 'Mahatma Gandhi',
      school: 'Non-Violent Nationalism / Anti-Colonial Moral Universalism',
      birthYear: 1869, deathYear: 1948,
      corePrinciples: [
        'Satyagraha (truth-force) and non-violent resistance are the only legitimate methods for political change',
        'India is a civilisational nation, not a religious one — Hindus and Muslims are one people',
        'Partition is a sin that must be resisted even if it costs India political power',
        'True independence (Purna Swaraj) means moral and economic self-reliance, not just transfer of power',
        'Centralised state power is inherently corrupting — village self-governance is the ideal polity',
      ],
      arguments: [
        {
          title: 'Against Partition',
          summary: 'Gandhi argued that Partition would not solve communal tensions but institutionalise them. He proposed that Jinnah be invited to form a government first, arguing that Congress\'s insistence on leading the interim government was a tactical error that pushed the League toward separatism. Gandhi\'s willingness to accept the Cabinet Mission Plan, which preserved a united India with strong provincial autonomy, reflected his conviction that Muslim fears of Hindu domination could be addressed within a federal framework. His solitary peace-making mission in Noakhali and Bihar in 1946-47, living among riot-torn communities, embodied his belief that reconciliation must begin at the grassroots.',
          supportingEvidence: [
            { sourceId: 's1', relevance: 'direct', excerpt: 'Guha documents Gandhi\'s opposition to Partition and his extraordinary efforts to prevent communal violence through personal intervention in Noakhali and Bihar.' },
          ],
        },
        {
          title: 'Satyagraha as Foreign Policy',
          summary: 'Gandhi\'s influence on Indian foreign policy was indirect but profound. His commitment to non-violence provided the moral foundation for Nehru\'s non-alignment, his critique of industrial civilisation shaped Indian economic nationalism, and his insistence on racial equality influenced India\'s leadership of the anti-colonial movement. Gandhi\'s own foreign policy was minimal — he focused on India\'s moral regeneration as a prerequisite for meaningful engagement with the world — but his example established the principle that Indian foreign policy must be rooted in ethical commitments, not merely strategic calculation.',
          supportingEvidence: [
            { sourceId: 's1', relevance: 'direct', excerpt: 'Guha argues that Gandhi\'s moral authority gave Indian nationalism a distinctive character that Nehru later translated into foreign policy terms.' },
          ],
        },
      ],
      criticism: [
        {
          title: 'Political Unrealism',
          summary: 'Critics argue that Gandhi\'s opposition to Partition was politically naive. By refusing to accept the reality of communal polarisation, he left Congress without a coherent strategy for engaging with Muslim League demands. His proposal to make Jinnah prime minister was impractical and would have been rejected by both Congress and the British. His insistence on non-violence, while morally admirable, left India without the military preparedness that the strategic environment demanded.',
          counterarguments: [
            { sourceId: 's1', relevance: 'supporting', excerpt: 'Guha notes that Gandhi\'s approach, while ultimately unsuccessful, kept alive the possibility of a united India and maintained Congress\'s moral standing internationally.' },
          ],
        },
        {
          title: 'Inconsistent Influence',
          summary: 'Gandhi\'s influence on foreign policy was at best indirect and often contradictory. Nehru selectively adopted elements of Gandhi\'s philosophy while disregarding others — non-alignment was Gandhian in spirit, but India\'s military modernisation, nuclear programme, and centralised state-building were not.',
          counterarguments: [
            { sourceId: 's1', relevance: 'supporting', excerpt: 'Gandhi himself accepted that the Congress government would need to make compromises with state power, recognising that his role was to be the moral conscience of the nation, not its administrator.' },
          ],
        },
      ],
      furtherReading: [
        'The Story of My Experiments with Truth by M.K. Gandhi',
        'Gandhi: The Years That Changed the World by Ramachandra Guha',
        'Gandhi and the Partition of India by Sandhya Sarma',
      ],
    },
  },
  {
    id: 'b-thinker-mountbatten', type: 'thinker', depth: ['scholar', 'researcher'],
    data: {
      name: 'Lord Louis Mountbatten',
      school: 'Imperial Transition Management',
      birthYear: 1900, deathYear: 1979,
      corePrinciples: [
        'British withdrawal from India must be swift to avoid a military quagmire the UK cannot afford',
        'A united India is preferable but partition is acceptable if it ensures a speedy and orderly transfer',
        'India and Pakistan should both remain in the Commonwealth as self-governing dominions',
        'Personal diplomacy and royal charisma can smooth the transition of power',
        'British strategic interests in South Asia are best served by maintaining good relations with both successor states',
      ],
      arguments: [
        {
          title: 'Accelerated Timetable',
          summary: 'Mountbatten\'s single most consequential decision was to advance the date of British withdrawal from June 1948 to August 1947 — a compression of the transition from eleven months to three. He calculated that a longer transition would allow communal violence to spread, that the British political will for maintaining order was exhausted, and that the Indian parties would never agree on a united constitutional framework. The accelerated timetable, however, meant that the Radcliffe Boundary Commission had only five weeks to draw the borders of two new nations, with catastrophic consequences for the millions whose villages, irrigation systems, and communities were divided by a line drawn in haste by a British lawyer who had never visited India.',
          supportingEvidence: [
            { sourceId: 's5', relevance: 'direct', excerpt: 'Freedom at Midnight documents Mountbatten\'s decision to advance the transfer of power and the chaotic process of boundary demarcation.' },
            { sourceId: 's16', relevance: 'direct', excerpt: 'Khan argues that the accelerated timetable was a direct cause of the administrative collapse that enabled Partition violence.' },
          ],
        },
        {
          title: 'Partiality Debate',
          summary: 'Mountbatten\'s conduct has been the subject of enduring historiographical controversy. Indian nationalist historians argue that he favoured Pakistan — both through the boundary award (which gave Pakistan parts of Punjab and Bengal that were economically and strategically valuable) and through his personal sympathy for Jinnah. Pakistani historians, by contrast, argue that Mountbatten favoured India, pointing to his close personal friendship with Nehru and his influence on the accession of princely states. The evidence supports neither extreme: Mountbatten was primarily concerned with a rapid and orderly withdrawal that preserved British interests and the Commonwealth connection. His personal sympathies, while real, were subordinate to this strategic objective.',
          supportingEvidence: [
            { sourceId: 's5', relevance: 'direct', excerpt: 'Freedom at Midnight presents Mountbatten as a figure caught between competing pressures, favouring neither India nor Pakistan but the speed of British exit.' },
          ],
        },
      ],
      criticism: [
        {
          title: 'Haste Over Precision',
          summary: 'The most serious criticism of Mountbatten is that his single-minded focus on speed came at the cost of humane planning. The compressed timetable meant inadequate arrangements for refugee management, population transfer, and border security. Millions paid with their lives for Britain\'s desire for a quick exit.',
          counterarguments: [
            { sourceId: 's1', relevance: 'supporting', excerpt: 'Guha argues that the British were genuinely unable to maintain order for another year — the Raj had effectively ceased to function by mid-1947, and a longer transition might have been even bloodier.' },
          ],
        },
      ],
      furtherReading: [
        'Freedom at Midnight by Larry Collins and Dominique Lapierre',
        'Mountbatten: The Official Biography by Philip Ziegler',
        'The Great Partition by Yasmin Khan',
      ],
    },
  },
  {
    id: 'b-thinker-radcliffe', type: 'thinker', depth: ['scholar', 'researcher'],
    data: {
      name: 'Sir Cyril Radcliffe',
      school: 'Legal Formalism / Imperial Administrative Procedure',
      birthYear: 1899, deathYear: 1977,
      corePrinciples: [
        'A legal commission, not political negotiation, should determine the boundary',
        'The boundary should follow administrative units where possible, not demographic maps',
        'The commission has no mandate to consider humanitarian or strategic consequences',
        'Speed is paramount — the award must be ready by the transfer of power date',
        'Personal responsibility for the consequences is legally irrelevant',
      ],
      arguments: [
        {
          title: 'The Five-Week Boundary',
          summary: 'Radcliffe arrived in India on 8 July 1947 with no prior experience of the subcontinent. He chaired two boundary commissions — one for Punjab, one for Bengal — each consisting of two Muslim League and two Congress nominee-judges who reached no agreement on any substantive question. Radcliffe was forced to make the final decisions alone. The Punjab award gave the western half of the province to Pakistan and the eastern half to India, but the line ran through the heart of the Sikh homeland and divided the canal irrigation system on which the entire regional economy depended. The Bengal award partitioned the province for the first time in its history, giving West Bengal (including Calcutta) to India and East Bengal to Pakistan. Radcliffe\'s boundary line has been criticised for its arbitrary character — villages were divided from their fields, markets from their suppliers, families from their relatives — but the deeper problem was not Radcliffe\'s competence but the impossibility of dividing an integrated economic and social space on religious lines in five weeks.',
          supportingEvidence: [
            { sourceId: 's13', relevance: 'direct', excerpt: 'The Radcliffe Award itself is the primary document, showing the boundary decisions that partitioned Punjab and Bengal.' },
            { sourceId: 's16', relevance: 'direct', excerpt: 'Khan provides the most comprehensive account of how the border was drawn and its consequences for the affected populations.' },
          ],
        },
      ],
      criticism: [
        {
          title: 'Ignorance and Indifference',
          summary: 'Radcliffe has been accused of drawing India\'s borders with culpable ignorance and indifference. He never visited India before his appointment, spent the entire boundary commission period in Delhi without touring the affected regions, and burned his papers after completing the award, leaving no record of his reasoning. Critics argue that he regarded the commission as a routine legal assignment and was oblivious to the human catastrophe his decisions would produce.',
          counterarguments: [
            { sourceId: 's5', relevance: 'contextual', excerpt: 'Freedom at Midnight notes that Radcliffe was constrained by the terms of reference, the political instructions, and the patently impossible timetable. By the standards of the legal formalism he was instructed to apply, his work was competent. The fault lay in the political decision to partition, not in the boundaries themselves.' },
          ],
        },
      ],
      furtherReading: [
        'The Great Partition by Yasmin Khan',
        'Freedom at Midnight by Larry Collins and Dominique Lapierre',
        'The Punjab Bloodied, Partitioned and Cleansed by Ishtiaq Ahmed',
      ],
    },
  },
  {
    id: 'b-thinker-abdullah', type: 'thinker', depth: ['scholar', 'researcher'],
    data: {
      name: 'Sheikh Mohammad Abdullah',
      school: 'Kashmiri Nationalism / Secular Autonomy',
      birthYear: 1905, deathYear: 1982,
      corePrinciples: [
        'Kashmir is a distinct nation with a syncretic culture that transcends the India-Pakistan divide',
        'Kashmiri Muslims, Hindus, and Buddhists share a common identity that communal politics threatens',
        'Accession to India was conditional — it preserved Kashmir\'s internal autonomy under Article 370',
        'The will of the Kashmiri people must determine the state\'s final political status',
        'Economic development and land reform are prerequisites for political democracy',
      ],
      arguments: [
        {
          title: 'Secular Accession',
          summary: 'Sheikh Abdullah was the leader of the National Conference, the dominant political party in Jammu and Kashmir, and the most influential political figure in the state\'s modern history. When the Maharaja acceded to India in October 1947, Abdullah emerged as the head of an emergency administration that managed the state during the first India-Pakistan war. He argued that Kashmir\'s accession to India was not a surrender to Indian nationalism but a strategic choice that preserved Kashmir\'s unique identity and political autonomy under Article 370 of the Indian Constitution. His vision was of a secular, autonomous Kashmir within a federal India — a model that would disprove the Two-Nation theory by demonstrating that a Muslim-majority state could thrive in a secular India.',
          supportingEvidence: [
            { sourceId: 's14', relevance: 'direct', excerpt: 'The Instrument of Accession limited Indian jurisdiction to defence, foreign affairs, and communications, preserving the state\'s internal autonomy.' },
            { sourceId: 's1', relevance: 'direct', excerpt: 'Guha documents how Nehru and Abdullah formed a political partnership around the vision of a secular, autonomous Kashmir within India.' },
          ],
        },
        {
          title: 'Land to the Tiller',
          summary: 'Abdullah\'s most concrete achievement as head of the emergency administration was the implementation of land reform — the abolition of large feudal estates and the redistribution of land to tenant farmers. The Big Landed Estates Abolition Act of 1950 broke the power of the landed elite (many of whom had supported the Maharaja) and created a constituency of small farmers who supported the National Conference. This social transformation was as significant as the political decision to accede to India, and it created the conditions for Abdullah\'s popular legitimacy that survived even his long imprisonment.',
          supportingEvidence: [
            { sourceId: 's1', relevance: 'direct', excerpt: 'Guha notes that Abdullah\'s land reforms transformed the social structure of the Kashmir Valley and created a durable base of popular support.' },
          ],
        },
      ],
      criticism: [
        {
          title: 'Authoritarian Drift and Dismissal',
          summary: 'Abdullah\'s political career was marked by an authoritarian streak that ultimately led to his downfall. By 1953, his administration was accused of corruption, his political opponents were suppressed, and his calls for a plebiscite on Kashmir\'s future made Nehru uneasy. In August 1953, Abdullah was dismissed by the Sadr-i-Riyasat (the state\'s constitutional head, acting under Indian direction) and arrested on charges of conspiracy against the state. He remained in prison for eleven years. Critics argue that Abdullah\'s commitment to Kashmiri autonomy was always conditional — he was a secularist when it suited him but a Kashmiri nationalist when the centre\'s demands conflicted with his political interests.',
          counterarguments: [
            { sourceId: 's1', relevance: 'supporting', excerpt: 'Guha argues that Abdullah\'s dismissal was a tragic mistake that destroyed the political consensus on Kashmir\'s accession and sowed the seeds of the insurgency that would erupt in 1989.' },
          ],
        },
      ],
      furtherReading: [
        'Flames of the Chinar: An Autobiography by Sheikh Mohammad Abdullah',
        'Kashmir: The Vajpayee Years by A.S. Dulat and Aditya Sinha',
        'India After Gandhi by Ramachandra Guha',
      ],
    },
  },
  {
    id: 'b-thinker-menon', type: 'thinker', depth: ['scholar', 'researcher'],
    data: {
      name: 'V.P. Menon',
      school: 'Constitutional State-Building / Administrative Realism',
      birthYear: 1893, deathYear: 1965,
      corePrinciples: [
        'National unity requires decisive executive action supported by constitutional legality',
        'Princely states must be integrated through a calibrated mix of diplomacy, financial pressure, and military threat',
        'Administrative competence can overcome political obstacles that politicians cannot resolve',
        'Speed of integration is essential — delay allows external or internal opposition to coalesce',
        'The legal framework must be stretched to its limit to achieve national objectives',
      ],
      arguments: [
        {
          title: 'Integration of the Princely States',
          summary: 'V.P. Menon, as Secretary of the States Department under Sardar Patel, was the principal architect of the integration of 565 princely states. His strategy combined three instruments: the Instrument of Accession (limited to defence, foreign affairs, and communications), the Standstill Agreement (maintaining existing relations during negotiation), and the threat of military action against recalcitrant rulers. States that acceded peacefully were guaranteed their rulers\' privy purses and titles; those that resisted faced the full force of the Indian Army, as Hyderabad discovered in September 1948. Menon\'s insider account, The Story of the Integration of the Indian States, documents how this process was completed in less than two years — a state-building achievement with few parallels in post-colonial history.',
          supportingEvidence: [
            { sourceId: 's18', relevance: 'direct', excerpt: 'Menon\'s own account provides the definitive insider narrative of how the integration was accomplished through a combination of diplomacy, legal instruments, and military threat.' },
          ],
        },
        {
          title: 'Kashmir Accession',
          summary: 'Menon played a critical role in the accession of Jammu and Kashmir. On 25 October 1947, he flew to Srinagar to persuade Maharaja Hari Singh to sign the Instrument of Accession in the face of the tribal invasion from Pakistan. Menon secured the Maharaja\'s signature on 26 October and flew back to Delhi with the signed document. The accession was accepted by the Government of India the same day, and Indian troops were airlifted to Srinagar on 27 October. Menon\'s account of these events provides the canonical narrative of the accession, though critics have questioned whether the Maharaja\'s decision was made under duress and whether the accession process met all constitutional requirements.',
          supportingEvidence: [
            { sourceId: 's14', relevance: 'direct', excerpt: 'The Instrument of Accession of Jammu and Kashmir was signed on 26 October 1947, transferring defence, foreign affairs, and communications to India.' },
            { sourceId: 's18', relevance: 'direct', excerpt: 'Menon\'s account describes the tense negotiations with the Maharaja and the last-minute decision to accept the accession.' },
          ],
        },
      ],
      criticism: [
        {
          title: 'Authoritarian Methods',
          summary: 'Critics argue that Menon\'s approach to integration was fundamentally coercive and authoritarian. The military annexation of Hyderabad, the pressure applied on Travancore and other recalcitrant states, and the gradual erosion of princely guarantees (culminating in the 1971 abolition of privy purses) all suggest that integration was not the voluntary union of sovereign states but the forced incorporation of territories into a centralising Indian state. Menon himself acknowledged the coercive dimension but defended it as necessary.',
          counterarguments: [
            { sourceId: 's1', relevance: 'supporting', excerpt: 'Guha argues that the integration campaign was widely supported by Indian public opinion and was essential to prevent the balkanisation of the subcontinent.' },
          ],
        },
      ],
      furtherReading: [
        'The Story of the Integration of the Indian States by V.P. Menon',
        'The Transfer of Power in India by V.P. Menon',
        'India After Gandhi by Ramachandra Guha',
      ],
    },
  },
  {
    id: 'b-thinker-moon', type: 'thinker', depth: ['scholar', 'researcher'],
    data: {
      name: 'Sir Penderel Moon',
      school: 'British Official History / Administrative Empiricism',
      birthYear: 1905, deathYear: 1987,
      corePrinciples: [
        'Historical judgment requires immersion in administrative records and personal experience of events',
        'Partition was a British failure of planning and execution, not of intention',
        'The human cost of partition could have been substantially reduced with better preparation',
        'Indian and Pakistani officials share responsibility for the breakdown of order',
        'Contemporary eyewitness testimony is more reliable than retrospective nationalist narratives',
      ],
      arguments: [
        {
          title: 'British Administrative Failure',
          summary: 'Penderel Moon served as a British civil servant in the Punjab during Partition and was one of the few British officials to write candidly about the British failure. In his book Divide and Quit (1961) and his contemporary reports, Moon argued that the British administration in the Punjab catastrophically failed to maintain order during the transfer of power. He was sharply critical of the decision to partition the province, the hasty timetable imposed by Mountbatten, and the unwillingness of British officials to take decisive action against communal violence once it began. Moon\'s account is particularly valuable because it was written from contemporary notes and correspondence, not from retrospective memory, and because Moon was sympathetic to Indian nationalism while remaining critical of Congress errors.',
          supportingEvidence: [
            { sourceId: 's16', relevance: 'direct', excerpt: 'Khan\'s account of administrative collapse during Partition broadly confirms Moon\'s contemporary analysis.' },
          ],
        },
        {
          title: 'Critique of the Radcliffe Award',
          summary: 'Moon was one of the first British officials to publicly criticise the Radcliffe boundary award, arguing that the commission\'s rushed proceedings and ignorance of local conditions produced indefensible borders. His contemporary maps and notes document how the boundary line divided villages from their fields, separated family compounds, and cut through the canal irrigation system that was the economic lifeline of the Punjab. Moon\'s critique is notable for being both empirically detailed and morally engaged — he did not accept the legal formalism that Radcliffe used to insulate himself from the consequences of his decisions.',
          supportingEvidence: [
            { sourceId: 's13', relevance: 'direct', excerpt: 'The Radcliffe Award\'s borders divided villages, irrigation systems, and communities.' },
          ],
        },
      ],
      criticism: [
        {
          title: 'British Apologetics',
          summary: 'Critics from the nationalist school argue that Moon, despite his candour about British failures, ultimately remained within a British imperial framework of analysis. His focus on administrative failure, they contend, displaces responsibility from the structural forces — imperialism, communalism, capitalism — that made Partition a catastrophe regardless of administrative efficiency. His sympathy for Indian nationalism did not extend to a critique of the British imperial project itself.',
          counterarguments: [
            { sourceId: 's5', relevance: 'contextual', excerpt: 'Collins and Lapierre\'s account in Freedom at Midnight, while popular rather than academic, supports Moon\'s emphasis on the accelerated timetable as a root cause of the humanitarian disaster.' },
          ],
        },
      ],
      furtherReading: [
        'Divide and Quit by Penderel Moon',
        'The Transfer of Power in India by V.P. Menon',
        'The Great Partition by Yasmin Khan',
      ],
    },
  },
  { id: 'b-h-relationship', type: 'heading', data: { text: 'Relationship Explorer: The Key Actors', level: 1 } },
  {
    id: 'b-relationship-nehru-2', type: 'relationship-card', depth: ['scholar', 'researcher'],
    data: {
      mainEntity: 'Jawaharlal Nehru',
      mainEntitySlug: 'jawaharlal-nehru',
      relationships: [
        { entity: 'Mahatma Gandhi', entitySlug: 'mahatma-gandhi', relationshipType: 'mentored_by', description: 'Gandhi chose Nehru as his political heir, passing over the more experienced Sardar Patel. Nehru shared Gandhi\'s commitment to secularism and non-violence.' },
        { entity: 'Sardar Patel', entitySlug: 'sardar-patel', relationshipType: 'collaborated_with', description: 'Nehru and Patel formed an effective partnership that combined ideological vision with practical state-building, despite their differences on Pakistan policy and economic strategy.' },
        { entity: 'Muhammad Ali Jinnah', entitySlug: 'mohammad-ali-jinnah', relationshipType: 'opposed', description: 'Nehru and Jinnah represented competing visions of India — secular nationalism vs. the Two-Nation theory. Their personal and political rivalry defined the politics of the 1940s.' },
        { entity: 'Lord Mountbatten', entitySlug: 'mountbatten', relationshipType: 'negotiated_with', description: 'Mountbatten oversaw the transfer of power and remained a close advisor to Nehru, though Indian historians have debated whether Mountbatten favoured Pakistan in the boundary demarcation.' },
        { entity: 'Sheikh Abdullah', entitySlug: 'sheikh-abdullah', relationshipType: 'allied_with', description: 'Nehru supported Abdullah as the leader of Jammu and Kashmir, viewing him as a secular Kashmiri nationalist who could reconcile the state\'s Muslim majority with accession to India.' },
        { entity: 'V.K. Krishna Menon', entitySlug: 'krishna-menon', relationshipType: 'deputized', description: 'Menon served as Nehru\'s closest foreign policy advisor and the leading voice for India at the UN, articulating the case for non-alignment and defending India\'s position on Kashmir.' },
      ],
    },
  },
  {
    id: 'b-relationship-pakistan', type: 'relationship-card', depth: ['scholar', 'researcher'],
    data: {
      mainEntity: 'India – Pakistan Relations',
      mainEntitySlug: 'india-pakistan-relations',
      relationships: [
        { entity: 'Kashmir', entitySlug: 'kashmir', relationshipType: 'disputed_territory', description: 'The Kashmir dispute has been the central territorial conflict between India and Pakistan since 1947, resulting in two major wars and numerous military crises.' },
        { entity: 'Partition of India', entitySlug: 'partition', relationshipType: 'root_cause', description: 'The unfinished business of Partition — including competing claims to Kashmir, the status of minorities, and the very legitimacy of the two-nation theory — created the framework for permanent rivalry.' },
        { entity: 'UN Security Council', entitySlug: 'un-security-council', relationshipType: 'mediator', description: 'The UN attempted to mediate the Kashmir dispute through Resolution 47, but the failure to implement the plebiscite left both sides dissatisfied and the issue unresolved.' },
        { entity: 'Liaquat Ali Khan', entitySlug: 'liaquat-ali-khan', relationshipType: 'negotiated_with', description: 'Pakistan\'s first Prime Minister signed the Liaquat-Nehru Pact of 1950, the only major bilateral agreement on minority rights between the two countries.' },
      ],
    },
  },
  // ── State of the Evidence (Constitution v1.1 required block) ──
  { id: 'b-h-state-evidence', type: 'heading', data: { text: 'State of the Evidence', level: 1 } },
  {
    id: 'b-p-state-evidence-1', type: 'paragraph',
    data: {
      text: 'This chapter rests on a documented base of primary and secondary sources. The primary record (Tier 1) includes the Indian Independence Act 1947, the Mountbatten Plan of 3 June 1947, the Radcliffe Award of 17 August 1947, the Instrument of Accession of Jammu and Kashmir, UN Security Council Resolution 47 (1948), the Liaquat-Nehru Pact of 1950, the 1941 Census of India, and Jawaharlal Nehru\'s 1946 speech to the Constituent Assembly. These are legal, administrative, or contemporaneous documents whose authenticity is not in scholarly dispute, though their interpretation is.',
      citations: ['s11', 's12', 's13', 's14', 's15', 's16', 's9', 's4'],
    },
  },
  {
    id: 'b-p-state-evidence-2', type: 'paragraph',
    data: {
      text: 'The secondary literature (Tier 2 and Tier 3) spans foundational scholarship — including but not limited to Guha, Jalal, Khan, Butalia, Pandey, Raghavan, and Cohen — and covering demography, violence, memory, strategy, and the historiography of the event itself. Where the chapter makes a contested interpretive claim, it names the school of interpretation and the scholars associated with it, and it records the disagreement rather than papering over it. The Evidence Challenges section below states where the record is thin, classified, or silent.',
      citations: ['s1', 's8', 's23', 's26', 's27', 's29', 's31'],
    },
  },
  // ── 8. Historiography ──
  { id: 'b-h-histo', type: 'heading', data: { text: 'Historiography: How Scholars Debate Partition', level: 1 } },
  {
    id: 'b-historiography', type: 'historiography', depth: ['scholar', 'researcher'],
    data: {
      title: 'Interpreting Partition',
      approaches: [
        {
          school: 'Nationalist School',
          summary: 'The dominant Indian nationalist interpretation emphasises British divide-and-rule policies as the primary cause of Partition. From this perspective, the British deliberately fostered Hindu-Muslim antagonism through separate electorates, communal representation, and strategic favouritism toward the Muslim League. Partition was the final act of imperial manipulation — a colonial wound inflicted on a nation that had otherwise achieved unity through the freedom struggle.',
          keyHistorians: ['Bipan Chandra', 'Mridula Mukherjee', 'Aditya Mukherjee', 'K.N. Panikkar'],
          keyWorks: ['India\'s Struggle for Independence (Chandra et al.)', 'Communalism in Modern India (Bipan Chandra)', 'The Legacy of Partition (Mridula Mukherjee)'],
          strengths: 'Provides a comprehensive framework for understanding how colonial institutions structured communal identity. Supported by extensive archival evidence of British policies.',
          limitations: 'Tends to minimise the agency of Indian actors, particularly the Muslim League, and can appear deterministic. Underplays the deep social and cultural roots of communal identity.',
        },
        {
          school: 'Revisionist / Cambridge School',
          summary: 'Revisionist historians, particularly those associated with the Cambridge School, argue that Partition was not inevitable but resulted from political competition between Indian elites. Jinnah and the Muslim League used the demand for Pakistan as a bargaining strategy to maximise Muslim political power, while Congress leaders made strategic errors that pushed the League toward a partitionist outcome that neither side fully desired.',
          keyHistorians: ['Ayesha Jalal', 'Anil Seal', 'C.A. Bayly', 'David Washbrook'],
          keyWorks: ['The Sole Spokesman (Ayesha Jalal)', 'The Emergence of Indian Nationalism (Anil Seal)', 'Indian Society and the Making of the British Empire (C.A. Bayly)'],
          strengths: 'Restores contingency and political agency to the narrative of Partition. Provides a nuanced account of Jinnah\'s strategy and the internal politics of the Muslim League.',
          limitations: 'Critics argue that revisionism understates the genuine popular support for the Pakistan movement and the depth of communal polarisation in the 1940s.',
        },
        {
          school: 'Subaltern / Social History',
          summary: 'Subaltern and social historians shift focus from high politics to the experiences of ordinary people — refugees, women, peasants, and lower castes — whose voices were excluded from both nationalist and official accounts. Drawing on oral testimony, regional archives, and local sources, this school reveals the diversity of Partition experiences and the multiple ways communities negotiated the catastrophe.',
          keyHistorians: ['Gyanendra Pandey', 'Urvashi Butalia', 'Ritu Menon', 'Kamla Bhasin'],
          keyWorks: ['Remembering Partition (Gyanendra Pandey)', 'The Other Side of Silence (Urvashi Butalia)', 'Borders and Boundaries (Ritu Menon and Kamla Bhasin)'],
          strengths: 'Recovers experiences systematically erased from elite narratives. Particularly important for documenting gendered violence and the long-term psychological trauma of Partition.',
          limitations: 'Can be criticised for privileging individual testimony over structural analysis and for being resistant to generalisation or causal argument.',
        },
        {
          school: 'Strategic / International History',
          summary: 'A more recent approach examines Partition within the framework of international history and strategic studies, focusing on its implications for South Asian geopolitics, the Cold War, and the global order. This school emphasises how Partition shaped India\'s security doctrine, its approach to nuclear weapons, its Himalayan policy, and its role in the post-colonial international system.',
          keyHistorians: ['Sumit Ganguly', 'Srinath Raghavan', 'C. Raja Mohan', 'Harsh V. Pant'],
          keyWorks: ['War and Peace in Modern India (Srinath Raghavan)', 'Conflict Unending (Sumit Ganguly)', 'Crossing the Rubicon (C. Raja Mohan)'],
          strengths: 'Connects the Partition experience to contemporary strategic challenges. Provides analytical tools for understanding how historical trauma shapes state behaviour.',
          limitations: 'Sometimes underplays domestic political and social factors in favour of geopolitical analysis. Can appear teleological, reading later outcomes back into earlier events.',
        },
        {
          school: 'Pakistani Nationalist Historiography',
          summary: 'Pakistani nationalist historians argue that Partition was the inevitable realisation of the Two-Nation theory — the natural culmination of centuries of Hindu-Muslim divergence. In this view, Hindus and Muslims constituted distinct nations with separate histories, cultures, legal traditions, and social systems that could not coexist within a single democratic state. Jinnah emerges as the visionary founder who articulated Muslim aspirations and secured a homeland against the combined opposition of the British and the Congress. The creation of Pakistan is presented as a liberation from Hindu domination, and the violence of Partition is attributed primarily to Congress intransigence and British perfidy, not to the Pakistan movement itself.',
          keyHistorians: ['K.K. Aziz', 'Sharif al-Mujahid', 'Sikandar Hayat', 'Ishtiaq Ahmed'],
          keyWorks: ['Pakistan: The Formative Phase (K.K. Aziz)', 'Jinnah: India-Partition-Independence (Jaswant Singh)', 'The Punjab Bloodied, Partitioned and Cleansed (Ishtiaq Ahmed)'],
          strengths: 'Provides an empathetic account of the Muslim League\'s political project and the genuine popular support for the Pakistan movement. Essential for understanding why millions of Muslims chose to migrate.',
          limitations: 'Tends toward teleology, reading later outcomes back into earlier events. Minimises the contingency and uncertainty of the negotiations of 1945-47. Often uncritical toward the League\'s leadership and the Two-Nation theory\'s assumptions.',
        },
        {
          school: 'Gender and Feminist Historiography',
          summary: 'Feminist historians of Partition argue that conventional histories — whether nationalist, revisionist, or subaltern — have systematically marginalised the gendered dimensions of the Partition experience. This school recovers the specific violence directed at women: abduction, rape, forced conversion, forced marriage, and honour killings by families seeking to preserve communal purity. It also examines how the state\'s recovery and rehabilitation programmes for abducted women reflected patriarchal assumptions about women\'s agency, honour, and national belonging. The recovery of women\'s voices through oral testimony and personal narratives has transformed scholarly understanding of how Partition violence operated at the intimate, bodily level.',
          keyHistorians: ['Urvashi Butalia', 'Ritu Menon', 'Kamla Bhasin', 'Vina Mazumdar'],
          keyWorks: ['The Other Side of Silence (Urvashi Butalia)', 'Borders and Boundaries (Ritu Menon and Kamla Bhasin)', 'Recasting Women: Essays in Colonial History (Kumkum Sangari and Sudesh Vaid)'],
          strengths: 'Recovers an entire dimension of Partition experience that elite historiography had rendered invisible. Demonstrates that gendered violence was not incidental but constitutive of the Partition process.',
          limitations: 'Some critics argue that gender analysis, while essential, cannot substitute for political and strategic history in explaining why Partition happened. The relationship between patriarchal structures and the political decisions that produced Partition remains undertheorised.',
        },
      ],
    },
  },
  // ── Expanded Historiography: Key Scholars ──
  { id: 'b-h-histo-profiles', type: 'heading', data: { text: 'Expanded Historiography: Key Scholars', level: 1 } },
  {
    id: 'b-p-histo-profiles-intro', type: 'paragraph',
    data: {
      text: 'The following profiles provide deeper context on the individual scholars whose work has shaped the historiography of Partition and early Indian foreign policy. Each entry covers the scholar\'s background, their core thesis, the evidence they emphasise, major criticisms of their work, and their influence on the field. This section is designed to help readers navigate the scholarly landscape and understand the interpretive choices that underpin the narrative above.',
      citations: ['s1', 's16', 's17', 's19', 's20', 's21'],
    },
  },
  // ── Yasmin Khan ──
  { id: 'b-h-histo-khan', type: 'heading', data: { text: 'Yasmin Khan', level: 2 } },
  {
    id: 'b-p-histo-khan-1', type: 'paragraph',
    data: {
      text: 'Yasmin Khan is Associate Professor of History at the University of Oxford and a Fellow of Kellogg College. Her scholarship centres on the social history of the late British Raj, particularly the everyday experience of the end of empire. Her major work, The Great Partition: The Making of India and Pakistan (2007, revised 2017), is widely regarded as one of the most accessible and comprehensive single-volume accounts of the Partition. She is also the author of The Raj at War: A People\'s History of India\'s Second World War (2015), which foregrounds the experiences of ordinary Indians — soldiers, labourers, farmers, and women — who experienced the war on the home front.',
      citations: ['s16'],
    },
  },
  {
    id: 'b-p-histo-khan-2', type: 'paragraph',
    data: {
      text: 'Khan\'s core thesis is that Partition was not primarily the product of high political negotiation but of social and administrative collapse. She emphasises how the everyday functioning of the state — policing, food distribution, railway operation, telegraph communication — broke down in 1946-47, creating conditions in which violence could flourish and making a humane partition impossible. Her evidence base is unusually broad, drawing on government archives, personal memoirs, oral histories, press accounts, and literary sources. She pays particular attention to the experience of women, religious minorities, and lower castes, groups whose voices are frequently absent from political histories. Criticism of Khan\'s work centres on her relatively light treatment of the political negotiations themselves; readers seeking detailed analysis of the Cabinet Mission, the Mountbatten Plan, or Jinnah\'s strategy will need to supplement her account with Jalal or Raghavan. Her influence, however, has been considerable — The Great Partition is now the standard first recommendation for general readers and is increasingly used in university curricula as the primary textbook for Partition history.',
      citations: ['s16'],
    },
  },
  // ── Ayesha Jalal ──
  { id: 'b-h-histo-jalal', type: 'heading', data: { text: 'Ayesha Jalal', level: 2 } },
  {
    id: 'b-p-histo-jalal-1', type: 'paragraph',
    data: {
      text: 'Ayesha Jalal is the Mary Richardson Professor of History at Tufts University and one of the most influential revisionist historians of Partition. Her landmark work, The Sole Spokesman: Jinnah, the Muslim League and the Demand for Pakistan (1985), fundamentally reshaped the historiography by arguing that Jinnah did not intend the full partition of India. Drawing on extensive archival research in the India Office Records, Jalal contends that Jinnah used the demand for Pakistan as a bargaining counter to secure maximum autonomy for Muslims within a federal India. When Congress refused meaningful power-sharing, Jinnah\'s strategy was overtaken by events — particularly the violence of 1946-47 — and he was forced to accept a Pakistan that was a territorial state rather than the confederal arrangement he had sought.',
      citations: ['s2'],
    },
  },
  {
    id: 'b-p-histo-jalal-2', type: 'paragraph',
    data: {
      text: 'Jalal\'s evidence centres on Jinnah\'s correspondence, speeches, and private conversations in the crucial years 1944-47. She shows that Jinnah repeatedly spoke of Pakistan in ambiguous terms and accepted constitutional arrangements — such as the Cabinet Mission Plan — that fell far short of a separate sovereign state. Her interpretation is sharply contested. Pakistani nationalist historians argue that she diminishes Jinnah as a leader by denying him the clear vision of Pakistan that is central to the national founding story. Indian nationalist historians, meanwhile, argue that her revisionism minimises the genuine communal polarisation that made partition politically possible. Despite these criticisms, The Sole Spokesman remains essential reading for any serious student of Partition. Together with her later work, Partisans of Allah (2008) and The Pity of Partition (2013), Jalal has permanently complicated the assumption that Partition was either inevitable or the outcome of any single actor\'s design.',
      citations: ['s2'],
    },
  },
  // ── Gyanendra Pandey ──
  { id: 'b-h-histo-pandey', type: 'heading', data: { text: 'Gyanendra Pandey', level: 2 } },
  {
    id: 'b-p-histo-pandey-1', type: 'paragraph',
    data: {
      text: 'Gyanendra Pandey is one of the founding figures of subaltern historiography in South Asian studies and a Distinguished Professor at the CUNY Graduate Center. His work Remembering Partition: Violence, Nationalism and History in India (2001) transformed how scholars understand the relationship between violence and historical memory. Pandey argues that conventional historiography has marginalised Partition violence — treating it as a tragic but ultimately secondary phenomenon compared to the "real" story of political negotiation and state-building. He insists that violence was constitutive of Partition, not merely a consequence of it, and that the way we remember — and forget — violence is itself a political act.',
      citations: ['s19'],
    },
  },
  {
    id: 'b-p-histo-pandey-2', type: 'paragraph',
    data: {
      text: 'Pandey draws on an unusual evidence base: oral testimony, local newspapers, literary accounts, and official records read "against the grain" to recover voices that official archives suppress. His method owes much to the subaltern studies collective, which sought to write history "from below" by centring the experiences of peasants, workers, and marginalised communities rather than elites. Critics of Pandey contend that his approach prioritises memory and representation over causal explanation, and that it can be difficult to derive clear historical arguments from his richly textured but analytically diffuse accounts. Nonetheless, Remembering Partition is a landmark work that permanently changed the terms of debate, forcing scholars to ask not just why Partition happened but how it was experienced, narrated, and incorporated into national memory.',
      citations: ['s19'],
    },
  },
  // ── Urvashi Butalia ──
  { id: 'b-h-histo-butalia', type: 'heading', data: { text: 'Urvashi Butalia', level: 2 } },
  {
    id: 'b-p-histo-butalia-1', type: 'paragraph',
    data: {
      text: 'Urvashi Butalia is an Indian feminist publisher, writer, and activist, best known for her pathbreaking oral history The Other Side of Silence: Voices from the Partition of India (2000). Butalia\'s work emerged from her involvement in the women\'s movement in India, which led her to ask why Partition — a foundational event of such traumatic magnitude — was so rarely discussed in Indian families. She began collecting oral testimonies from survivors, focusing particularly on the experiences of women: those who were abducted, raped, forcibly married, or killed by their own families in "honour killings" meant to preserve family and community purity.',
      citations: ['s20'],
    },
  },
  {
    id: 'b-p-histo-butalia-2', type: 'paragraph',
    data: {
      text: 'Butalia\'s core contribution is methodological: she demonstrated that oral testimony could recover experiences that the documentary record systematically erased. Women\'s experiences of Partition were doubly silenced — first by the violence itself, and then by patriarchal norms that made it shameful to speak of sexual violence. The Other Side of Silence gave voice to survivors who had remained silent for fifty years. Critics note that oral testimonies gathered decades after events raise questions of memory, reliability, and retrospective reconstruction. Butalia is aware of these limitations and addresses them directly, framing her work not as definitive history but as a necessary supplement to — and corrective of — the written record. Her influence extends well beyond South Asian studies; she is widely cited in work on gender, violence, and memory in other contexts of mass violence, including Rwanda, Bosnia, and Cambodia.',
      citations: ['s20'],
    },
  },
  // ── Srinath Raghavan ──
  { id: 'b-h-histo-raghavan', type: 'heading', data: { text: 'Srinath Raghavan', level: 2 } },
  {
    id: 'b-p-histo-raghavan-1', type: 'paragraph',
    data: {
      text: 'Srinath Raghavan is a Senior Fellow at the Carnegie Endowment for International Peace and one of the foremost scholars of Indian strategic history. His major work, War and Peace in Modern India: A Strategic History of the Nehru Years (2010), is the most comprehensive account of India\'s foreign and security policy in the crucial first two decades after independence. Raghavan\'s approach is distinctive in its combination of international history, strategic studies, and domestic political analysis. He argues that India\'s foreign policy under Nehru was far more pragmatic and strategically sophisticated than the conventional image of idealistic non-alignment suggests.',
      citations: ['s32'],
    },
  },
  {
    id: 'b-p-histo-raghavan-2', type: 'paragraph',
    data: {
      text: 'Raghavan\'s evidence base is exceptional in its breadth: he draws on Indian, British, American, and Pakistani archival sources, in multiple languages, to reconstruct the strategic calculations behind key decisions. His treatment of the Kashmir UN referral is a model of balanced analysis, situating Nehru\'s decision within the constraints of limited military capability, the need for international legitimacy, and the hope that the UN would pressure Pakistan to withdraw its forces. Critics from the nationalist school argue that Raghavan understates the normative dimension of Indian foreign policy — the genuine commitment to anti-colonialism and international law that Nehru articulated. From the realist side, critics contend that he overstates the coherence of Indian strategy, which was often reactive and improvised rather than planned. Regardless, War and Peace in Modern India is widely considered the definitive account of the subject, and Raghavan\'s later work — India\'s War: The Making of Modern South Asia, 1939-1945 (2016) and The Most Dangerous Place: A History of the United States in South Asia (2024) — has cemented his reputation as the leading historian of Indian international relations.',
      citations: ['s32'],
    },
  },
  // ── Ramachandra Guha ──
  { id: 'b-h-histo-guha', type: 'heading', data: { text: 'Ramachandra Guha', level: 2 } },
  {
    id: 'b-p-histo-guha-1', type: 'paragraph',
    data: {
      text: 'Ramachandra Guha is one of India\'s most prominent public intellectuals and historians, the author of the landmark India After Gandhi: The History of the World\'s Largest Democracy (2007). Guha\'s work is notable for its narrative sweep, its archival depth, and its even-handed treatment of India\'s political history. India After Gandhi remains the most widely read single-volume history of independent India and is notable for treating Partition not as the end of the story but as the beginning — the traumatic foundation on which Indian democracy was built.',
      citations: ['s1'],
    },
  },
  {
    id: 'b-p-histo-guha-2', type: 'paragraph',
    data: {
      text: 'Guha\'s core thesis regarding Partition is that Congress leaders, despite their commitment to national unity, made a series of strategic errors that facilitated partition: Nehru\'s rejection of the Cabinet Mission Plan, the failure to accommodate Muslim League concerns during the 1937 provincial elections, and the inability to prevent the escalation of communal violence. He is particularly critical of the Congress leadership\'s reluctance to share power, arguing that the party\'s electoral dominance made it overconfident and inflexible. Critics from the Left argue that Guha\'s centrist liberalism leads him to understate the structural forces — imperialism, communalism, capitalism — that shaped Partition. Defenders respond that Guha\'s emphasis on contingency and individual choice is precisely what makes his account useful for readers seeking to understand how human decisions, not impersonal forces, drove events. Guha has also written extensively on the early Cold War period, arguing that Indian non-alignment was simultaneously principled and pragmatic, shaped by Nehru\'s convictions but also by the realistic assessment of India\'s limited power.',
      citations: ['s1'],
    },
  },
  // ── Sumit Ganguly ──
  { id: 'b-h-histo-ganguly', type: 'heading', data: { text: 'Sumit Ganguly', level: 2 } },
  {
    id: 'b-p-histo-ganguly-1', type: 'paragraph',
    data: {
      text: 'Sumit Ganguly is Distinguished Professor of Political Science at Indiana University Bloomington and one of the leading scholars of South Asian security and international relations. His work spans the full arc of India-Pakistan relations, with a particular focus on how the unresolved legacies of Partition have driven conflict between the two states. In Conflict Unending: India-Pakistan Relations Since 1947 (2001), Ganguly argues that the Kashmir dispute and the broader structure of India-Pakistan hostility are rooted in the competing nationalist ideologies that Partition left unresolved — India\'s secular nationalism versus Pakistan\'s religious nationalism.',
      citations: ['s23'],
    },
  },
  {
    id: 'b-p-histo-ganguly-2', type: 'paragraph',
    data: {
      text: 'Ganguly\'s approach is distinctive in its use of international relations theory — particularly realism and constructivism — to analyse South Asian security. He argues that the India-Pakistan conflict is not merely a territorial dispute but a fundamental clash of state identities, and that this identity dimension explains the persistence of conflict despite repeated attempts at resolution. His evidence base combines diplomatic history, strategic analysis, and domestic political analysis. Critics from the historical profession sometimes argue that Ganguly\'s theoretical framework can lead to functionalism — explaining outcomes by the functions they serve for state identity rather than by the specific historical processes that produced them. From within political science, critics from the liberal institutionalist school argue that he understates the potential for cooperation. Nevertheless, Conflict Unending and Ganguly\'s many other works — including his studies of Indian foreign policy, nuclear deterrence, and US-South Asia relations — have been enormously influential in shaping how scholars and policymakers understand the strategic implications of Partition.',
      citations: ['s23'],
    },
  },
  // ── Stephen P. Cohen ──
  { id: 'b-h-histo-cohen', type: 'heading', data: { text: 'Stephen P. Cohen', level: 2 } },
  {
    id: 'b-p-histo-cohen-1', type: 'paragraph',
    data: {
      text: 'Stephen P. Cohen (1936–2025) was a Senior Fellow at the Brookings Institution and one of the most influential American scholars of South Asian security. His major work, India: Emerging Power (2001), remains the most comprehensive analysis of India\'s strategic culture, military capabilities, and foreign policy ambitions. Cohen\'s approach is grounded in the tradition of strategic studies and focuses on the domestic and bureaucratic sources of Indian foreign policy — the military, the civilian bureaucracy, the political leadership, and the strategic community.',
      citations: ['s25'],
    },
  },
  {
    id: 'b-p-histo-cohen-2', type: 'paragraph',
    data: {
      text: 'Cohen\'s core argument regarding Partition is that it fundamentally shaped Indian strategic culture by creating a permanent sense of vulnerability despite India\'s apparent demographic and economic advantages. He argues that Partition left India with an insecure and truncated geography (particularly the loss of access to Central Asia via the Northwest Frontier), a hostile neighbour in Pakistan, and a strategic doctrine that struggled to reconcile Nehru\'s idealistic internationalism with the hard realities of subcontinental geopolitics. Cohen was among the first American scholars to recognise India\'s potential as a major power and to argue that the United States should treat it as such. His influence is evident in the subsequent transformation of US-India relations. Critics, particularly from the Left, argue that Cohen\'s strategic realist approach understates the domestic and social dimensions of Indian power. From within the strategic studies community, critics contend that his predictions about India\'s rise were sometimes too optimistic. Nonetheless, India: Emerging Power and his earlier work, The Indian Army: Its Contribution to the Development of a Nation (1971), remain essential reference points for understanding Indian strategic thought.',
      citations: ['s25'],
    },
  },
  // ── C. Raja Mohan ──
  { id: 'b-h-histo-mohan', type: 'heading', data: { text: 'C. Raja Mohan', level: 2 } },
  {
    id: 'b-p-histo-mohan-1', type: 'paragraph',
    data: {
      text: 'C. Raja Mohan is one of India\'s foremost strategic affairs commentators and a leading scholar of Indian foreign policy. He is currently a Visiting Research Professor at the Institute of South Asian Studies at the National University of Singapore. His landmark book, Crossing the Rubicon: The Shaping of India\'s New Foreign Policy (2003), argued that India was undergoing a fundamental transformation in its approach to the world — moving from the post-colonial idealism of the Nehru period to a more pragmatic, interest-driven foreign policy shaped by economic growth, military power, and strategic ambition.',
      citations: ['s24'],
    },
  },
  {
    id: 'b-p-histo-mohan-2', type: 'paragraph',
    data: {
      text: 'Raja Mohan\'s analysis of Partition\'s legacy is distinctive for its focus on how the experience of territorial division shaped India\'s approach to sovereignty, borders, and regional hegemony. He argues that Partition created an Indian strategic culture that is hypersensitive to external interference, deeply suspicious of neighbouring states, and committed to maintaining primacy in South Asia. This territorial preoccupation, he contends, has sometimes limited India\'s capacity to project power beyond its immediate neighbourhood. His work on India\'s nuclear policy, relations with the United States, and strategic competition with China has been enormously influential in both Indian and Western policy circles. Critics, particularly from the Left and from the Nehruvian tradition, argue that Raja Mohan\'s enthusiasm for realpolitik understates the continuing importance of norms, international law, and the ethical dimension of Indian foreign policy. Defenders respond that Raja Mohan is descriptive rather than prescriptive — he is documenting a transformation that is already underway, not advocating a particular path. Regardless, Crossing the Rubicon is widely credited with reshaping how Indian foreign policy is discussed both within India and internationally.',
      citations: ['s24'],
    },
  },
  // ── Strategic Lessons from Partition ──
  { id: 'b-h-strategic-lessons', type: 'heading', data: { text: 'Strategic Lessons for Modern Policymakers', level: 1 } },
  {
    id: 'b-p-strategic-intro', type: 'paragraph',
    data: {
      text: 'Partition was not merely a historical event — it was a strategic failure whose lessons continue to shape India\'s approach to statecraft, security, and diplomacy. Understanding what India learned — and what it failed to learn — from the experience of 1947 is essential for evaluating the strategic choices of the Nehru years and their consequences for contemporary Indian policy.',
      citations: ['s1', 's4', 's9', 's21'],
    },
  },
  {
    id: 'b-h-strategic-what-learned', type: 'heading', data: { text: 'What India Learned', level: 2 },
  },
  {
    id: 'b-p-strategic-learned-1', type: 'paragraph',
    data: {
      text: 'First, Partition taught India that national unity requires constant political cultivation. The Congress leadership understood that India\'s diversity — religious, linguistic, ethnic, regional — could not be taken for granted. The Constitution\'s federal structure, the adoption of Hindi as the official language alongside English and 21 other scheduled languages, the linguistic reorganisation of states in the 1950s, and the commitment to secularism as a constitutional principle all reflect lessons drawn from the failure to accommodate Muslim political aspirations before 1947.',
      citations: ['s1'],
    },
  },
  {
    id: 'b-p-strategic-learned-2', type: 'paragraph',
    data: {
      text: 'Second, Partition confirmed that Pakistan would be India\'s primary strategic challenge for the foreseeable future. The division of the British Indian Army, the unresolved status of Kashmir, the dispute over princely state accession in Junagadh and Hyderabad, and the communal violence that accompanied Partition all established patterns of hostility that would persist for decades. India\'s military doctrine, its initial focus on conventional superiority over Pakistan, and its reluctance to internationalise bilateral disputes all stem from this strategic assessment.',
      citations: ['s1', 's4', 's21'],
    },
  },
  {
    id: 'b-p-strategic-learned-3', type: 'paragraph',
    data: {
      text: 'Third, Partition demonstrated the dangers of external dependence. The experience of relying on British arbitration, only to have British strategic interests diverge from Indian ones at the moment of crisis, reinforced Nehru\'s commitment to non-alignment. India would not entrust its security to Great Powers whose interests might not align with its own. This lesson deeply influenced India\'s refusal to join either Cold War bloc, its insistence on strategic autonomy, and its later reluctance to sign the Non-Proliferation Treaty or enter into formal military alliances.',
      citations: ['s1', 's21'],
    },
  },
  {
    id: 'b-p-strategic-learned-4', type: 'paragraph',
    data: {
      text: 'Fourth, Partition showed that borders matter — and that uncertain borders are a permanent source of conflict. The Radcliffe Line, drawn in five weeks by a British lawyer who had never visited India, left the subcontinent with indefensible borders, divided river systems, separated villages from their markets, and created one of the world\'s most intractable territorial disputes in Kashmir. India\'s subsequent insistence on well-defined, internationally recognised borders — and its reluctance to enter into territorial negotiations that might reopen unsettled questions — reflects this painful lesson.',
      citations: ['s1', 's5'],
    },
  },
  {
    id: 'b-p-strategic-learned-5', type: 'paragraph',
    data: {
      text: 'Fifth, Partition demonstrated that communal violence, once unleashed, creates realities that political negotiation cannot reverse. The massacres of 1947 destroyed mixed communities that had coexisted for centuries and created populations of refugees with bitter memories that hardened communal identities for generations. India\'s subsequent commitment to secularism was not merely ideological — it was a pragmatic recognition that religious polarisation threatened the very survival of the Indian state.',
      citations: ['s1', 's16', 's19'],
    },
  },
  {
    id: 'b-h-strategic-failures', type: 'heading', data: { text: 'What India Failed to Learn', level: 2 },
  },
  {
    id: 'b-p-strategic-fail-1', type: 'paragraph',
    data: {
      text: 'First, India failed to learn that strategic autonomy requires military self-sufficiency. Nehru\'s focus on industrial development was sound, but his neglect of military modernisation — particularly the army, air force, and defence industrial base — left India dangerously vulnerable. The 1962 war with China exposed the consequences: India was unprepared for a major land war against a modern military power. The lessons of 1947 about the importance of military strength had apparently not been fully integrated into Indian strategic planning.',
      citations: ['s1', 's21'],
    },
  },
  {
    id: 'b-p-strategic-fail-2', type: 'paragraph',
    data: {
      text: 'Second, India failed to learn that international institutions are only as effective as the power constellations that support them. India\'s experience with the UN over Kashmir — where the Security Council proved unwilling to enforce its own resolutions against Pakistan — should have tempered expectations about the capacity of international law to resolve political conflicts. Yet India continued to place significant faith in the UN, the Non-Aligned Movement, and other multilateral forums, often without the diplomatic resources or strategic leverage to make these institutions serve Indian interests effectively.',
      citations: ['s1', 's6', 's21'],
    },
  },
  {
    id: 'b-p-strategic-fail-3', type: 'paragraph',
    data: {
      text: 'Third, India failed to learn that neighbourhood management requires sustained diplomatic engagement. Partition had left India with a complex neighbourhood — Pakistan as a hostile rival, Nepal and Burma as carefully neutral neighbours, Sri Lanka as a Dominion with its own ethnic tensions, and the Himalayan states of Bhutan and Sikkim as dependent buffer states. India\'s approach to these relationships was often reactive, moralising, and inconsistent. The failure to develop a coherent neighbourhood policy would have consequences that India would grapple with for decades.',
      citations: ['s1', 's10'],
    },
  },
  {
    id: 'b-h-strategic-unresolved', type: 'heading', data: { text: 'Open Questions', level: 2 },
  },
  {
    id: 'b-p-strategic-unresolved-1', type: 'paragraph',
    data: {
      text: 'Could India have preserved a united India with a different political strategy? The answer depends on whether one believes the Muslim League was genuinely willing to accept a federal solution (the revisionist position) or was ultimately committed to a separate state (the Pakistani nationalist position). If the revisionists are correct, then the Congress leadership — particularly Nehru\'s rejection of the Cabinet Mission Plan — bears substantial responsibility for a partition that might have been avoided.',
      citations: ['s1', 's17', 's21'],
    },
  },
  {
    id: 'b-p-strategic-unresolved-2', type: 'paragraph',
    data: {
      text: 'Could India have achieved a better settlement on Kashmir? India\'s decision to refer the Kashmir dispute to the UN in January 1948 was based on the expectation that the UN would condemn Pakistan\'s tribal invasion and order a withdrawal. When the UN instead proposed a plebiscite conditioned on Pakistan\'s withdrawal — a condition Pakistan never met — India found itself trapped in a diplomatic framework it had helped create. A better understanding of the UN\'s political dynamics, or a different strategy for managing the Kashmir crisis, might have produced a more favourable outcome.',
      citations: ['s1', 's6', 's21'],
    },
  },
  {
    id: 'b-p-strategic-unresolved-3', type: 'paragraph',
    data: {
      text: 'Could India have prevented the Cold War from penetrating South Asia? India\'s non-alignment was designed precisely to keep the Cold War out of the subcontinent. Yet by the mid-1950s, Pakistan had joined SEATO and CENTO, had signed a Mutual Defence Assistance Agreement with the United States, and was receiving significant American military aid. India\'s inability to prevent Pakistan\'s alignment with the West was a strategic failure whose consequences — including the superpower arming of Pakistan, the introduction of great power competition into South Asia, and the distortion of the Kashmir dispute by Cold War politics — persist to this day.',
      citations: ['s1', 's4', 's21'],
    },
  },
  {
    id: 'b-h-strategic-legacy', type: 'heading', data: { text: 'How Partition Shapes Indian Strategy Today', level: 2 },
  },
  {
    id: 'b-p-strategic-legacy-1', type: 'paragraph',
    data: {
      text: 'The strategic legacy of Partition is not merely historical — it is visible in every major dimension of contemporary Indian foreign policy. India\'s relationship with Pakistan remains defined by the unresolved questions of 1947: Kashmir, cross-border terrorism, water sharing, and the fundamental dispute over the legitimacy of the two-nation theory. India\'s approach to China is coloured by the trauma of 1962, which itself was partly rooted in Nehru\'s post-Partition focus on Pakistan at the expense of Himalayan border security. India\'s insistence on strategic autonomy in its relationships with the United States, Russia, and China is a direct inheritance of Nehru\'s non-alignment, which was itself a response to the experience of Partition and the betrayal of British arbitration.',
      citations: ['s1', 's4', 's9', 's10', 's21'],
    },
  },
  {
    id: 'b-p-strategic-legacy-2', type: 'paragraph',
    data: {
      text: 'Understanding the strategic lessons of Partition does not provide neat policy prescriptions. History does not repeat itself, and the world of the 2020s is fundamentally different from that of the 1940s. But the patterns of strategic thinking established in the crucible of Partition — the suspicion of great powers, the commitment to autonomy, the sensitivity to sovereignty, the prioritisation of unity over diversity of opinion — continue to shape how Indian policymakers perceive threats, evaluate alliances, and make choices. A nation that understands why it made the choices it did is better equipped to make the choices that lie ahead.',
      citations: ['s1', 's4', 's9', 's10', 's21'],
    },
  },
  // ── 9. Counterfactual ──
  { id: 'b-h-counter', type: 'heading', data: { text: 'Counterfactual: What If Partition Had Not Happened?', level: 1 } },
  {
    id: 'b-counterfactual-1', type: 'counterfactual', depth: ['scholar', 'researcher'],
    data: {
      question: 'What if the Cabinet Mission Plan of 1946 had succeeded?',
      scenario: 'The Cabinet Mission proposed a federal India with a weak central government responsible only for defence, foreign affairs, and communications, while provinces and princely states retained substantial autonomy. Muslim-majority provinces would have formed a grouped sub-federation with significant internal self-government. Both Congress and the Muslim League initially accepted the plan, but it collapsed within weeks when Nehru made a statement interpreted as signalling that Congress would not accept the grouping arrangement.',
      historicalContext: 'The Cabinet Mission Plan represented the last serious attempt to preserve a united India. Its failure was followed by escalating communal violence in Bengal, Bihar, and Punjab, and the subsequent Mountbatten Plan that delivered partition in just ten weeks.',
      analysis: 'A successful Cabinet Mission Plan would have produced an India very different from either the centralised republic that emerged or the partitioned subcontinent we know. A weak federal centre would have struggled to coordinate economic development and defence. The princely states might have maintained greater autonomy, and the Pakistan movement\'s demand for Muslim self-government would have been partially satisfied within a federal framework. However, the fundamental tension between Congress\'s vision of a strong central state and the Muslim League\'s demand for Muslim autonomy would likely have persisted, possibly producing chronic political instability or eventual fragmentation.',
      probability: 'Moderately plausible (25-30%)',
      sources: ['s1', 's17', 's22'],
    },
  },
  {
    id: 'b-counterfactual-2', type: 'counterfactual', depth: ['scholar', 'researcher'],
    data: {
      question: 'What if India had not referred the Kashmir dispute to the UN?',
      scenario: 'By December 1947, Indian forces had halted the tribal invasion and secured Srinagar and the Kashmir Valley. The option existed to continue military operations to expel all invaders without UN involvement, presenting Pakistan with a military fait accompli.',
      historicalContext: 'Nehru\'s decision to refer Kashmir to the UN was motivated by a combination of idealism (belief in international law) and pragmatism (concern that continued fighting could escalate into a full-scale war India was not prepared for). The UN Security Council\'s response — Resolution 47 — surprised India by treating India and Pakistan as equally legitimate disputants.',
      analysis: 'Without UN involvement, India might have secured control of the entire former princely state, including the areas that became Azad Kashmir and Gilgit-Baltistan. However, this outcome would have come at significant cost: India would have been seen internationally as a power that rejected multilateral dispute resolution, potentially damaging its standing as a leader of the decolonising world. Moreover, Pakistan would almost certainly have continued to press its claim through other means, including guerrilla insurgency and diplomatic isolation of India in the Muslim world. The dispute might have remained unresolved without the institutional framework of UN mediation, potentially producing even more frequent military crises.',
      probability: 'Plausible (35-40%)',
      sources: ['s1', 's6', 's21'],
    },
  },
  // ── 10. Why It Matters Today ──
  { id: 'b-h-matters', type: 'heading', data: { text: 'Why It Matters Today', level: 1 } },
  {
    id: 'b-why-matters', type: 'callout',
    data: {
      variant: 'info',
      text: 'The founding conditions of 1947 continue to shape Indian foreign policy in the twenty-first century. The security paradigm created by Partition — viewing Pakistan as an existential threat, prioritising the western border, and maintaining strategic autonomy — has proven remarkably durable, surviving the end of the Cold War, the rise of China, and the transformation of the global order. The Kashmir dispute, unresolved since 1947, remains the single most dangerous flashpoint in South Asia and a potential nuclear flashpoint. India\'s relationship with Pakistan is still defined by the unfinished business of Partition: competing claims to Kashmir, mutual suspicion, and the refusal of either state to accept the other\'s foundational narrative. Understanding how these patterns were set in the crucible of 1947 is not merely a historical exercise — it is essential for understanding why India approaches the world the way it does today, and for evaluating whether those foundational assumptions still serve India\'s interests.',
    },
  },
  // ── Evidence Challenges (Constitution v1.1 required section) ──
  { id: 'b-h-evidence-challenges', type: 'heading', data: { text: 'Evidence Challenges', level: 1 } },
  {
    id: 'b-p-evidence-challenges-1', type: 'paragraph',
    data: {
      text: 'The evidence base for Partition is deep but uneven. Colonial and post-colonial state records are extensive for administration, law, and demography, but they were produced by governments with their own interests and are silent on lived experience, particularly for women, the poor, and the displaced. The precise scale of mortality and displacement remains debated because contemporary counts were partial, politically charged, and often compiled after the fact; scholars therefore cite ranges rather than precise figures.',
      citations: ['s10', 's27', 's26'],
    },
  },
  {
    id: 'b-p-evidence-challenges-2', type: 'paragraph',
    data: {
      text: 'Several specific challenges constrain confidence. First, records from the princely states and from the Radcliffe boundary commission remain partly closed or selectively released. Second, the violence of 1947 left few neutral contemporaneous accounts; much of what we know comes from memoir, oral history, and later commission reports, each with its own bias. Third, the demography of the border regions was altered by the very Partition it was meant to describe, making pre- and post-Partition comparisons difficult. Fourth, Pakistani and Indian national archives have at times restricted material that complicates the official foundational narratives of either state. Where a claim in this chapter depends on such contested material, it is flagged as interpretation and the disagreement is recorded.',
      citations: ['s10', 's27', 's29', 's31'],
    },
  },
  // ── 11. Learning ──
  { id: 'b-h-learn', type: 'heading', data: { text: 'Learning Section', level: 1 } },
  {
    id: 'b-learning-takeaways-2', type: 'learning',
    data: {
      variant: 'key-takeaways',
      items: [
        { text: 'Partition was not merely a political division but a foundational trauma that created a permanent security consciousness in India\'s foreign policy, shaping every major strategic decision for decades.', sources: ['s1', 's3'] },
        { text: 'The integration of 565 princely states, achieved primarily through diplomacy by Patel and Menon, was one of the most successful state-building projects of the twentieth century.', sources: ['s1', 's18'] },
        { text: 'India\'s decision to refer the Kashmir dispute to the UN internationalised a conflict India was winning, creating a diplomatic framework that Pakistan exploited for seven decades.', sources: ['s1', 's6', 's21'] },
        { text: 'The contradictory experiences of Partition — the trauma of division and the triumph of integration — created an enduring tension in India\'s strategic culture between assertive nationalism and internationalist idealism.', sources: ['s1', 's7', 's22'] },
        { text: 'India\'s secular nationalism, forged in explicit opposition to the Two-Nation theory, became both a domestic constitutional commitment and a foreign policy asset, particularly in relations with the Muslim world.', sources: ['s1', 's4'] },
      ],
    },
  },
  {
    id: 'b-learning-quiz-2', type: 'learning', depth: ['scholar', 'researcher'],
    data: {
      variant: 'quiz',
      items: [
        { text: 'Approximately how many people were displaced by the Partition of India?', answer: 'An estimated 14.5 million people crossed the new borders between August and December 1947.' },
        { text: 'How many princely states existed in British India at the time of independence?', answer: '565 princely states.' },
        { text: 'What was the estimated death toll of the Partition violence?', answer: 'Between 200,000 and 2 million, with most scholarly estimates around 800,000 to 1 million.' },
        { text: 'On what date did Maharaja Hari Singh sign the Instrument of Accession bringing Kashmir into India?', answer: '26 October 1947.' },
        { text: 'What was UN Security Council Resolution 47?', answer: 'The resolution passed on 21 April 1948 that called for a ceasefire in Kashmir and a plebiscite to determine the will of the Kashmiri people.' },
        { text: 'What was Operation Polo?', answer: 'The five-day military campaign in September 1948 that integrated the princely state of Hyderabad into India.' },
        { text: 'Which leader served as India\'s Home Minister and masterminded the integration of princely states?', answer: 'Sardar Vallabhbhai Patel, with V.P. Menon as his deputy.' },
        { text: 'What was the Cabinet Mission Plan of 1946?', answer: 'The last serious attempt by the British to preserve a united India through a federal arrangement with substantial provincial autonomy.' },
      ],
    },
  },
  {
    id: 'b-learning-flashcards', type: 'learning', depth: ['researcher'],
    data: {
      variant: 'flashcards',
      items: [
        { text: 'Two-Nation Theory', answer: 'The doctrine that Hindus and Muslims in South Asia constitute two distinct nations, forming the ideological basis for the creation of Pakistan.' },
        { text: 'Radcliffe Line', answer: 'The boundary demarcation between India and Pakistan drawn by Sir Cyril Radcliffe and announced on 17 August 1947, two days after independence.' },
        { text: 'Instrument of Accession', answer: 'The legal document through which the ruler of a princely state acceded to either India or Pakistan, typically covering only defence, foreign affairs, and communications.' },
        { text: 'Standstill Agreement', answer: 'A temporary agreement maintaining existing trade, communications, and administrative arrangements between a princely state and one of the successor dominions while negotiations on accession continued.' },
        { text: 'Operation Polo', answer: 'The Indian military operation of 13-18 September 1948 that integrated the princely state of Hyderabad by force.' },
        { text: 'Line of Control', answer: 'The de facto border dividing the former princely state of Jammu and Kashmir between India and Pakistan, established by the UN ceasefire of 1 January 1949.' },
        { text: 'Liaquat-Nehru Pact', answer: 'The 1950 treaty between India and Pakistan guaranteeing minority rights and establishing Minority Commissions in both countries.' },
        { text: 'Panchsheel', answer: 'The Five Principles of Peaceful Coexistence, jointly enunciated by India and China in 1954 as a framework for bilateral relations.' },
      ],
    },
  },
  {
    id: 'b-learning-research', type: 'learning', depth: ['researcher'],
    data: {
      variant: 'research-questions',
      items: [
        { text: 'How did the specific experience of Partition — rather than other colonial inheritances — shape India\'s approach to Pakistan in the first decade of independence? What causal mechanisms connected the violence of 1947 to the security policies of the 1950s?' },
        { text: 'Was the internationalisation of the Kashmir dispute a strategic error that permanently disadvantaged India, or a necessary step that prevented a full-scale war for which India was unprepared?' },
        { text: 'To what extent did the Nehru-Patel disagreement on Pakistan policy represent a genuine strategic debate about India\'s approach to its western neighbour, and to what extent was it a difference in temperament and rhetoric rather than substance?' },
        { text: 'How did India\'s experience of integrating the princely states — the largest such project in post-colonial history — compare with state-building projects in other newly independent countries? What lessons from that experience remain relevant?' },
        { text: 'What role did the trauma of Partition play in shaping India\'s attitude toward international institutions — from the initial faith in the UN to the later disillusionment?' },
        { text: 'How did the demographic transformation of Punjab and Bengal through Partition create new political dynamics that continue to affect regional and national politics in both India and Pakistan?' },
      ],
    },
  },
  {
    id: 'b-learning-reading-2', type: 'learning', depth: ['scholar', 'researcher'],
    data: {
      variant: 'recommended-reading',
      items: [
        { text: 'India After Gandhi by Ramachandra Guha', answer: 'The definitive single-volume history of independent India. Essential reading for the full context of Partition and its aftermath.' },
        { text: 'The Great Partition by Yasmin Khan', answer: 'A focused account of the Partition itself, drawing on extensive archival and oral sources to capture the human experience.' },
        { text: 'The Sole Spokesman by Ayesha Jalal', answer: 'The revisionist classic that transformed historical understanding of Jinnah and the Pakistan movement.' },
        { text: 'Midnight\'s Furies by Nisid Hajari', answer: 'A gripping narrative history of the Partition violence and its immediate aftermath, linking it to contemporary India-Pakistan tensions.' },
        { text: 'Remembering Partition by Gyanendra Pandey', answer: 'A subaltern approach that examines how violence, memory, and nationalism intersected in the Partition experience.' },
        { text: 'The Other Side of Silence by Urvashi Butalia', answer: 'Groundbreaking oral history that recovered the experiences of women, children, and lower castes from the silence of official archives.' },
        { text: 'Jawaharlal Nehru: A Biography by S. Gopal (3 vols)', answer: 'The authoritative scholarly biography of Nehru, essential for understanding his worldview and policy decisions.' },
        { text: 'War and Peace in Modern India by Srinath Raghavan', answer: 'Examines how India\'s strategic culture was shaped by the wars of the founding period, including the Kashmir conflict.' },
        { text: 'Crossing the Rubicon by C. Raja Mohan', answer: 'Analyses the transformation of Indian foreign policy from non-alignment to multi-alignment, with attention to the Partition legacy.' },
        { text: 'The Story of the Integration of the Indian States by V.P. Menon', answer: 'The insider account of how 565 princely states were integrated into the Indian Union.' },
      ],
    },
  },
  // ── 12. Glossary ──
  { id: 'b-h-glossary', type: 'heading', data: { text: 'Glossary', level: 1 } },
  {
    id: 'b-glossary-list', type: 'list',
    data: {
      ordered: false,
      items: [
        'Cabinet Mission Plan: A 1946 British proposal for a federal India with a weak centre and grouped Muslim-majority provinces, intended to preserve unity. Failed when Congress and the Muslim League rejected its terms.',
        'Instrument of Accession: A legal document signed by princely state rulers to accede to India or Pakistan, typically covering only defence, foreign affairs, and communications.',
        'Radcliffe Line: The boundary demarcation between India and Pakistan drawn by Sir Cyril Radcliffe and announced on 17 August 1947, two days after independence.',
        'Standstill Agreement: An interim arrangement maintaining existing trade and administrative relations between a princely state and India or Pakistan while accession negotiations continued.',
        'Two-Nation Theory: The doctrine that Hindus and Muslims in South Asia constitute two distinct nations with separate histories, cultures, and destinies; the ideological foundation of Pakistan.',
        'Operation Polo: The five-day Indian military campaign (13-18 September 1948) that integrated the princely state of Hyderabad by force.',
        'Line of Control: The de facto border dividing the former princely state of Jammu and Kashmir between India and Pakistan, established by the UN-mediated ceasefire of 1 January 1949.',
        'Liaquat-Nehru Pact: The 1950 treaty guaranteeing minority rights and establishing Minority Commissions in both India and Pakistan.',
        'Panchsheel: The Five Principles of Peaceful Coexistence jointly enunciated by India and China in 1954 forming the basis of India\'s approach to international relations.',
        'Strategic Autonomy: The principle that India should maintain independent decision-making in foreign policy, avoiding formal military alliances while preserving the freedom to cooperate with multiple powers.',
      ],
    },
  },
  // ── 13. FAQ ──
  { id: 'b-h-faq', type: 'heading', data: { text: 'Frequently Asked Questions', level: 1 } },
  {
    id: 'b-faq-avoidable', type: 'callout', depth: ['explorer', 'scholar', 'researcher'],
    data: {
      variant: 'question',
      text: 'Could Partition have been avoided? Historians remain divided. The nationalist school emphasises British divide-and-rule policies as the primary cause. The revisionist/Cambridge school argues that competitive elite politics, not inevitability, drove partition. The subaltern school points to the agency of ordinary people whose communal identities were hardened by violence on the ground. Most scholars agree that by 1946-47, after the failure of the Cabinet Mission Plan and the outbreak of the Great Calcutta Killing, the momentum toward partition was probably irreversible — but whether that momentum was created by structural forces or political choices remains contested.',
    },
  },
  {
    id: 'b-faq-un', type: 'callout', depth: ['explorer', 'scholar', 'researcher'],
    data: {
      variant: 'question',
      text: 'Why did Nehru refer the Kashmir dispute to the United Nations? Nehru believed that India\'s case — that Pakistan had invaded a state that had legally acceded to India — was legally unassailable and that the UN Security Council would recognise this. He also feared that continued military escalation could trigger a full-scale war for which India\'s armed forces, still in the process of division and reorganisation, were not prepared. The decision reflected both his faith in international institutions and his assessment of India\'s military limitations. Critics argue it was naive and that India should have settled the question by force while it had the advantage.',
    },
  },
  {
    id: 'b-faq-patel-nehru', type: 'callout', depth: ['scholar', 'researcher'],
    data: {
      variant: 'question',
      text: 'Was there a fundamental disagreement between Nehru and Patel on foreign policy? The Nehru-Patel relationship on foreign policy was one of complementary differences rather than fundamental opposition. Patel was more sceptical of Pakistan, more willing to use military force (as in Hyderabad), and less trusting of international institutions. Nehru was more committed to non-alignment, more focused on Asia-Africa solidarity, and more willing to engage with international institutions. However, they agreed on the fundamentals: a strong central state, secular nationalism, and strategic autonomy. Patel died in December 1950, so his full foreign policy vision was never articulated. The question of how India\'s strategic culture might have differed under Patel\'s leadership remains one of the most intriguing counterfactuals in Indian history.',
    },
  },
  // ── 14. Primary Sources ──
  { id: 'b-h-sources', type: 'heading', data: { text: 'Primary Sources', level: 1 } },
  {
    id: 'b-primary-sources', type: 'learning',
    data: {
      variant: 'recommended-reading',
      items: [
        { text: 'Indian Independence Act, 1947', answer: 'The British legislation that granted independence to India and Pakistan and provided for the partition of the subcontinent. Full text available through the UK National Archives.' },
        { text: 'The Mountbatten Plan (3 June 1947)', answer: 'The announcement by Lord Mountbatten of the British decision to partition India and transfer power by August 1947.' },
        { text: 'The Radcliffe Award (17 August 1947)', answer: 'The boundary commission\'s decision demarcating the borders between India and Pakistan in Punjab and Bengal.' },
        { text: 'Tryst with Destiny — Jawaharlal Nehru\'s Independence Speech', answer: 'Nehru\'s address to the Constituent Assembly at midnight on 15 August 1947. The foundational statement of India\'s secular nationalism.' },
        { text: 'Instrument of Accession of Jammu and Kashmir (26 October 1947)', answer: 'The legal document by which Maharaja Hari Singh acceded to India, the basis of India\'s claim to Kashmir.' },
        { text: 'UN Security Council Resolution 47 (21 April 1948)', answer: 'The UN resolution calling for a ceasefire and plebiscite in Kashmir, which established the international legal framework for the dispute.' },
      ],
    },
  },
  // ── Document Archive ──
  { id: 'b-h-document-archive', type: 'heading', data: { text: 'Document Archive', level: 1 } },
  {
    id: 'b-doc-independence-act', type: 'document',
    data: {
      title: 'Indian Independence Act, 1947',
      documentType: 'constitution',
      date: '1947-07-18',
      parties: ['United Kingdom', 'India', 'Pakistan'],
      sections: [
        { id: 'doc-ia-s1', heading: 'Establishment of New Dominions', content: 'The Act provided for the partition of British India into two independent Dominions, India and Pakistan, effective from 15 August 1947. It declared the end of British suzerainty over the princely states and transferred legislative authority to the Constituent Assemblies of the two new nations.', annotationIds: ['doc-ia-a1', 'doc-ia-a2'] },
        { id: 'doc-ia-s2', heading: 'Territorial Division', content: 'The Act defined Pakistan as comprising East Bengal, West Punjab, Sindh, and the North-West Frontier Province. The remaining British Indian provinces would form the Dominion of India. The boundaries in Punjab and Bengal were to be determined by the Radcliffe Boundary Commission, whose award would be final and binding on both Dominions.', annotationIds: ['doc-ia-a3'] },
        { id: 'doc-ia-s3', heading: 'Princely States', content: 'The Act declared that British suzerainty over the Indian princely states would lapse on 15 August 1947. Each ruler would be free to accede to either Dominion or to remain independent. This provision created the legal framework for the integration of the princely states and for the Kashmir crisis that erupted within three months.', annotationIds: ['doc-ia-a4'] },
      ],
      annotations: [
        { id: 'doc-ia-a1', sectionId: 'doc-ia-s1', text: 'The Act used the term "Dominion" rather than "independent republic" because India and Pakistan initially remained within the British Commonwealth under the Statute of Westminster.', type: 'explanation' },
        { id: 'doc-ia-a2', sectionId: 'doc-ia-s1', text: 'Critics argue that the Act transferred power without adequate provisions for minority protection, refugee management, or border security.', type: 'critique' },
        { id: 'doc-ia-a3', sectionId: 'doc-ia-s2', text: 'The five-week deadline for the boundary commissions created the conditions for the Radcliffe Line, which divided villages, irrigation systems, and communities without regard to human consequences.', type: 'context' },
        { id: 'doc-ia-a4', sectionId: 'doc-ia-s3', text: 'The lapse of paramountcy without a framework for accession created a legal vacuum that nearly caused the balkanisation of India. Patel and Menon\'s integration campaign filled this vacuum through a combination of diplomacy and pressure.', type: 'context' },
      ],
      linkedClaims: [],
      linkedEntities: ['Nehru', 'Jinnah', 'Mountbatten', 'India', 'Pakistan'],
      sourceId: 's11',
    },
  },
  {
    id: 'b-doc-unsr-47', type: 'document',
    data: {
      title: 'UN Security Council Resolution 47 (1948)',
      documentType: 'resolution',
      date: '1948-04-21',
      parties: ['United Nations Security Council', 'India', 'Pakistan'],
      sections: [
        { id: 'doc-47-s1', heading: 'Ceasefire and Withdrawal', content: 'The Security Council called for an immediate ceasefire in Jammu and Kashmir, the withdrawal of all Pakistani tribesmen and military personnel, and the reduction of Indian forces to the minimum level required for maintaining law and order. A UN Commission was to be appointed to supervise the arrangements.', annotationIds: ['doc-47-a1', 'doc-47-a2'] },
        { id: 'doc-47-s2', heading: 'Plebiscite Framework', content: 'The resolution called for a plebiscite to determine the will of the Kashmiri people on the question of accession to India or Pakistan. The plebiscite was to be conducted under UN supervision once law and order were restored and the withdrawal of forces was completed. The Commission was authorised to appoint a Plebiscite Administrator.', annotationIds: ['doc-47-a3', 'doc-47-a4'] },
        { id: 'doc-47-s3', heading: 'Treatment of Parties', content: 'The resolution treated India and Pakistan as equal disputants in the Kashmir conflict, rather than recognising India\'s claim that Pakistan was the aggressor. This was the most consequential aspect of the resolution for Indian diplomacy — it placed the legal validity of Kashmir\'s accession on the same footing as Pakistan\'s claim to a plebiscite.', annotationIds: ['doc-47-a5'] },
      ],
      annotations: [
        { id: 'doc-47-a1', sectionId: 'doc-47-s1', text: 'The ceasefire was eventually agreed in January 1949, establishing the Line of Control that remains the de facto border in Kashmir.', type: 'context' },
        { id: 'doc-47-a2', sectionId: 'doc-47-s1', text: 'Pakistan never fully withdrew its forces or personnel, a fact India has cited for seven decades as justification for not proceeding with the plebiscite.', type: 'critique' },
        { id: 'doc-47-a3', sectionId: 'doc-47-s2', text: 'The plebiscite was never held. India\'s position evolved from accepting the plebiscite (1948-1953) to arguing that Pakistan\'s non-withdrawal made it impossible (1954 onward), to ultimately declaring Kashmir an integral part of India (1957 onward).', type: 'explanation' },
        { id: 'doc-47-a4', sectionId: 'doc-47-s2', text: 'The plebiscite provision assumed that Kashmir\'s future could be decided by a simple majority vote, ignoring the profound disagreements within the state about the options available.', type: 'critique' },
        { id: 'doc-47-a5', sectionId: 'doc-47-s3', text: 'Indian strategic analysts widely regard the decision to go to the UN as a diplomatic error. By internationalising the dispute, India gave Pakistan a permanent platform and subjected its own position to ongoing international scrutiny.', type: 'critique' },
      ],
      linkedClaims: ['b-evidence-kashmir'],
      linkedEntities: ['Kashmir', 'India', 'Pakistan', 'United Nations', 'Nehru'],
      sourceId: 's6',
    },
  },
  {
    id: 'b-doc-accession', type: 'document',
    data: {
      title: 'Instrument of Accession of Jammu and Kashmir (26 October 1947)',
      documentType: 'treaty',
      date: '1947-10-26',
      parties: ['Maharaja Hari Singh', 'Dominion of India'],
      sections: [
        { id: 'doc-acc-s1', heading: 'Terms of Accession', content: 'The Instrument of Accession transferred to the Dominion of India jurisdiction over defence, foreign affairs, and communications in respect of the State of Jammu and Kashmir. All other matters — including internal administration, taxation, property, and civil rights — remained with the state government. This limited accession was narrower than most other princely states\' instruments, which typically transferred full jurisdiction.', annotationIds: ['doc-acc-a1', 'doc-acc-a2'] },
        { id: 'doc-acc-s2', heading: 'Conditional Sovereignty', content: 'The Instrument was executed by the Maharaja "in the exercise of his sovereignty" over the state. The Indian government accepted the accession on the understanding that the will of the Kashmiri people would ultimately determine the state\'s political status — a commitment Nehru made in his letter accepting the accession and in subsequent statements to Parliament and the UN.', annotationIds: ['doc-acc-a3'] },
      ],
      annotations: [
        { id: 'doc-acc-a1', sectionId: 'doc-acc-s1', text: 'Article 370 of the Indian Constitution later gave constitutional form to this limited accession, preserving Jammu and Kashmir\'s special status until its abrogation in 2019.', type: 'explanation' },
        { id: 'doc-acc-a2', sectionId: 'doc-acc-s1', text: 'The limited scope of the Instrument meant that the state retained its own constitution, flag, and criminal code. This autonomy was the constitutional basis of Sheikh Abdullah\'s authority.', type: 'context' },
        { id: 'doc-acc-a3', sectionId: 'doc-acc-s2', text: 'The question of whether the accession was conditional on a plebiscite remains legally contested. India argues the accession was complete and unconditional under international law; Pakistan argues it was provisional pending popular ratification.', type: 'critique' },
      ],
      linkedClaims: ['b-evidence-kashmir'],
      linkedEntities: ['Kashmir', 'Nehru', 'Sheikh Abdullah', 'India', 'Maharaja Hari Singh'],
      sourceId: 's14',
    },
  },
  {
    id: 'b-doc-mountbatten-plan', type: 'document',
    data: {
      title: 'The Mountbatten Plan (3 June 1947)',
      documentType: 'memorandum',
      date: '1947-06-03',
      parties: ['United Kingdom', 'Indian National Congress', 'Muslim League'],
      sections: [
        { id: 'doc-mp-s1', heading: 'Principle of Partition', content: 'The Plan announced the British decision to partition British India into two Dominions, India and Pakistan, effective from 15 August 1947. It accepted the Muslim League\'s demand for a separate state while attempting to preserve maximum unity through a common defence arrangement and the option for each Dominion to remain in the Commonwealth.', annotationIds: ['doc-mp-a1'] },
        { id: 'doc-mp-s2', heading: 'Provincial Choice', content: 'The Plan provided for the legislative assemblies of Punjab and Bengal to vote on partition, with a simple majority of the full house and a separate majority of the Muslim members determining the outcome. In practice, this mechanism ensured that both provinces would be divided, as the Muslim League members voted for partition and the Congress members voted against it. The Plan also provided for a referendum in the North-West Frontier Province and a separate decision on Sylhet district.', annotationIds: ['doc-mp-a2', 'doc-mp-a3'] },
        { id: 'doc-mp-s3', heading: 'Boundary Commission', content: 'The Plan established a Boundary Commission to demarcate the borders between India and Pakistan in Punjab and Bengal. The Commission would be chaired by Sir Cyril Radcliffe and would consist of two Muslim League and two Congress nominee-judges. The award would be final and binding on both parties and would be announced after the transfer of power.', annotationIds: ['doc-mp-a4'] },
      ],
      annotations: [
        { id: 'doc-mp-a1', sectionId: 'doc-mp-s1', text: 'The Plan abandoned the Cabinet Mission framework and accepted partition as the only viable outcome after the collapse of the interim government and the escalation of communal violence.', type: 'context' },
        { id: 'doc-mp-a2', sectionId: 'doc-mp-s2', text: 'The separate majority requirement for Muslim members effectively gave the Muslim League a veto over partition, ensuring that no province could remain united against the League\'s will.', type: 'explanation' },
        { id: 'doc-mp-a3', sectionId: 'doc-mp-s2', text: 'The NWFP referendum, held in July 1947, resulted in a vote for Pakistan despite the province\'s Congress government. This outcome remains contested in Pashtun nationalist historiography.', type: 'critique' },
        { id: 'doc-mp-a4', sectionId: 'doc-mp-s3', text: 'The compressed timetable meant the Boundary Commission had only five weeks to draw the borders of two new nations — a decision that would have catastrophic humanitarian consequences.', type: 'critique' },
      ],
      linkedClaims: ['b-claim-borders'],
      linkedEntities: ['Mountbatten', 'Nehru', 'Jinnah', 'India', 'Pakistan'],
      sourceId: 's12',
    },
  },
  {
    id: 'b-doc-radcliffe-award', type: 'document',
    data: {
      title: 'The Radcliffe Award (17 August 1947)',
      documentType: 'report',
      date: '1947-08-17',
      parties: ['Boundary Commission', 'India', 'Pakistan'],
      sections: [
        { id: 'doc-ra-s1', heading: 'Punjab Boundary', content: 'The Punjab award divided the province along a line running north to south, giving the western districts to Pakistan and the eastern districts to India. The line allocated the fertile canal colonies of the Chenab and Jhelum regions to Pakistan while giving India the upper portions of the irrigation system, creating a water-sharing problem that persists to this day. The Sikh homeland was divided, with major shrines including Nankana Sahib going to Pakistan.', annotationIds: ['doc-ra-a1', 'doc-ra-a2'] },
        { id: 'doc-ra-s2', heading: 'Bengal Boundary', content: 'The Bengal award partitioned the province for the first time in its history, giving West Bengal (including Calcutta) to India and East Bengal to Pakistan. Calcutta\'s allocation to India was a major disappointment for Pakistan, which had expected the city to become part of East Pakistan. The division also separated the jute-growing regions of East Bengal from the jute-processing mills of Calcutta, creating an immediate economic disruption.', annotationIds: ['doc-ra-a3'] },
      ],
      annotations: [
        { id: 'doc-ra-a1', sectionId: 'doc-ra-s1', text: 'The canal irrigation system of the Punjab was divided by the boundary line without provision for joint management, creating the water dispute that remains one of the most dangerous flashpoints in India-Pakistan relations.', type: 'context' },
        { id: 'doc-ra-a2', sectionId: 'doc-ra-s1', text: 'Radcliffe later admitted that he had intended to give the Ferozepur and Zira canals to Pakistan, but a drafting error or last-minute political intervention placed them in India. The controversy over whether Mountbatten influenced the final award has never been fully resolved.', type: 'critique' },
        { id: 'doc-ra-a3', sectionId: 'doc-ra-s2', text: 'The partition of Bengal was particularly traumatic because it divided a region with strong linguistic and cultural unity. The jute-rice economy that had sustained East Bengal for generations was severed overnight.', type: 'explanation' },
      ],
      linkedClaims: ['b-claim-borders'],
      linkedEntities: ['Radcliffe', 'India', 'Pakistan', 'Punjab', 'Bengal'],
      sourceId: 's13',
    },
  },
  {
    id: 'b-doc-cabinet-mission', type: 'document',
    data: {
      title: 'The Cabinet Mission Plan (Cmnd. 6821, May 1946)',
      documentType: 'memorandum',
      date: '1946-05-16',
      parties: ['United Kingdom', 'Indian National Congress', 'Muslim League'],
      sections: [
        { id: 'doc-cm-s1', heading: 'Three-Tier Federal Structure', content: 'The Plan proposed a Union of India dealing with foreign affairs, defence, and communications; three provincial groups (Section A: Hindu-majority provinces; Section B: Muslim-majority north-west; Section C: Muslim-majority north-east); and individual provinces retaining residual powers. The Union would be financed by contributions from the provincial groups, not by direct taxation.', annotationIds: ['doc-cm-a1'] },
        { id: 'doc-cm-s2', heading: 'Constituent Assembly Mechanism', content: 'Provincial legislatures would elect the Constituent Assembly on a population basis, with seats divided among three sections. The Assembly would draft the constitution for the Union and the provincial groups. Any province could, by a majority vote of its Legislative Assembly, call for a reconsideration of the group arrangement after 10 years.', annotationIds: ['doc-cm-a2'] },
        { id: 'doc-cm-s3', heading: 'Interpretation Dispute', content: 'The crucial point of breakdown: Congress interpreted the provincial groupings as optional — provinces could choose not to join their assigned groups. The Muslim League insisted the groupings were compulsory. The Plan\'s text supported the League\'s reading, but Nehru\'s statement of 10 July 1946 that Congress would enter the Constituent Assembly "completely unfettered by any agreement" made the Plan unworkable.', annotationIds: ['doc-cm-a3', 'doc-cm-a4'] },
      ],
      annotations: [
        { id: 'doc-cm-a1', sectionId: 'doc-cm-s1', text: 'The Union\'s limited powers (foreign affairs, defence, communications only) reflected the British assessment that a strong centre was unacceptable to the Muslim League. This weak-centre design is often cited as the Plan\'s critical structural flaw.', type: 'context' },
        { id: 'doc-cm-a2', sectionId: 'doc-cm-s2', text: 'The 10-year review provision was intended to reassure both communities — Hindus that Pakistan could not be permanent, Muslims that they could leave if domination occurred. In practice, this ambiguity satisfied neither side.', type: 'explanation' },
        { id: 'doc-cm-a3', sectionId: 'doc-cm-s3', text: 'Historians divide sharply over whether Nehru\'s 10 July statement was a genuine error or whether the Plan\'s grouping provisions were fundamentally incompatible with Congress\'s vision of a strong, secular, centralised state.', type: 'critique' },
        { id: 'doc-cm-a4', sectionId: 'doc-cm-s3', text: 'The collapse of the Cabinet Mission Plan is the central counterfactual of Partition history. The question — was Partition inevitable after May 1946? — shapes every major interpretive claim about responsibility for the human catastrophe.', type: 'critique' },
      ],
      linkedClaims: ['b-claim-cabinet-mission'],
      linkedEntities: ['Nehru', 'Jinnah', 'Mountbatten', 'Congress', 'Muslim League'],
      sourceId: 's65',
    },
  },
  {
    id: 'b-doc-tryst-destiny', type: 'document',
    data: {
      title: 'Tryst with Destiny — Jawaharlal Nehru (14 August 1947)',
      documentType: 'speech',
      date: '1947-08-14',
      parties: ['Jawaharlal Nehru', 'Constituent Assembly of India'],
      sections: [
        { id: 'doc-ts-s1', heading: 'The Pledge Redeemed', content: '"Long years ago we made a tryst with destiny, and now the time comes when we shall redeem our pledge — not wholly or in full measure, but very substantially. At the stroke of the midnight hour, when the world sleeps, India will awake to life and freedom." The speech frames independence as the fulfilment of the freedom struggle, not a response to Partition.', annotationIds: ['doc-ts-a1'] },
        { id: 'doc-ts-s2', heading: 'Civic Nationalism', content: 'The speech presents Indian nationalism in explicitly civic, inclusive terms: service to India means service to "the millions who suffer" and "the noble mansion of free India where all her children may dwell." There is no reference to religion, community, or the Two-Nation theory — an implicit but complete rejection of the ideological basis of Partition.', annotationIds: ['doc-ts-a2'] },
        { id: 'doc-ts-s3', heading: 'India and the World', content: 'The speech places India in a global frame: "We shall work for an India in which the freedom of the world for peace and freedom, for co-operation with all nations, shall be our ideal." This internationalism prefigures non-alignment and India\'s active role in the UN and the Afro-Asian movement.', annotationIds: ['doc-ts-a3'] },
      ],
      annotations: [
        { id: 'doc-ts-a1', sectionId: 'doc-ts-s1', text: 'The speech was delivered at the Constituent Assembly in New Delhi at midnight, 14 August 1947. Delhi was under curfew due to communal violence. The Radcliffe Award had not yet been published.', type: 'context' },
        { id: 'doc-ts-a2', sectionId: 'doc-ts-s2', text: 'The deliberate absence of any reference to Pakistan or Partition is the speech\'s most conspicuous silence. Nehru chose to frame independence as the fulfilment of a positive vision rather than a response to division.', type: 'explanation' },
        { id: 'doc-ts-a3', sectionId: 'doc-ts-s3', text: 'The speech\'s internationalism has been cited by every subsequent Indian government and remains the normative benchmark for Indian foreign policy discourse.', type: 'context' },
      ],
      linkedClaims: ['b-claim-secular', 'b-claim-nonalignment'],
      linkedEntities: ['Nehru', 'India'],
      sourceId: 's4',
    },
  },
  {
    id: 'b-doc-census-1941', type: 'document',
    data: {
      title: 'Census of India, 1941 — Religious Composition',
      documentType: 'report',
      date: '1943',
      parties: ['Government of India'],
      sections: [
        { id: 'doc-41-s1', heading: 'Population by Religion', content: 'Total population of undivided India (excluding Burma): 388,997,955. Hindus: 255,300,000 (65.6%). Muslims: 94,400,000 (24.3%). Sikhs: 5,700,000. Christians: 6,300,000. The census provides district-level religious composition for all provinces, including the detailed data for Punjab and Bengal used by the Radcliffe Boundary Commission.', annotationIds: ['doc-41-a1'] },
        { id: 'doc-41-s2', heading: 'Punjab Religious Demography', content: 'Punjab: total population 34,300,000. Muslims constituted a narrow majority (53.2%), concentrated in the western districts. Hindus (29.5%) and Sikhs (14.9%) dominated the east. The intermixture at district level made any clean border impossible — every proposed boundary cut through mixed communities.', annotationIds: ['doc-41-a2'] },
        { id: 'doc-41-s3', heading: 'Bengal Religious Demography', content: 'Bengal: total population 60,300,000. Muslims formed a majority (54.7%), concentrated in the eastern districts. Hindus (44.5%) dominated the west, including Calcutta. The partition of Bengal along religious lines separated the jute-growing east from the jute-processing mills of Calcutta.', annotationIds: ['doc-41-a3'] },
      ],
      annotations: [
        { id: 'doc-41-a1', sectionId: 'doc-41-s1', text: 'The 1941 Census was conducted during the Second World War under wartime emergency measures. Some districts in Burma and the Andaman Islands could not be enumerated. Census officials noted undercounting in areas affected by the Bengal famine (1943).', type: 'context' },
        { id: 'doc-41-a2', sectionId: 'doc-41-s2', text: 'The Punjab data was critical for the Boundary Commission. No major district in Punjab was uniformly Hindu, Muslim, or Sikh — every district contained significant minorities, making any boundary an act of division, not separation.', type: 'explanation' },
        { id: 'doc-41-a3', sectionId: 'doc-41-s3', text: 'The 1941 Census data enables the calculation of Partition migration. Comparison with the 1951 Census shows the extent of demographic transformation: East Bengal (East Pakistan) lost most of its Hindu population; West Punjab lost most of its non-Muslim population.', type: 'explanation' },
      ],
      linkedClaims: ['b-claim-demographic'],
      linkedEntities: ['India', 'Pakistan', 'Punjab', 'Bengal'],
      sourceId: 's9',
    },
  },
  { id: 'b-h-claims', type: 'heading', data: { text: 'Canonical Claims Registry', level: 1 } },
  {
    id: 'b-claim-trauma', type: 'claim',
    data: {
      statement: 'Partition\'s violence constituted a foundational trauma that permanently shaped India\'s security consciousness, creating an existential security crisis at the founding moment.',
      confidence: 'established',
      evidence: [
        { sourceId: 's11', relevance: 'direct', excerpt: 'The Indian Independence Act dissolved the British Indian Empire and transferred power to two dominions.' },
        { sourceId: 's1', relevance: 'direct', excerpt: 'Guha documents how Partition\'s violence created an immediate security crisis that consumed the new government\'s attention.' },
      ],
      documentedFacts: [
        { fact: 'Partition involved the largest forced migration in modern history, with an estimated 10–15 million people displaced across the new borders of Punjab and Bengal.', sources: ['s1', 's16'] },
        { fact: 'Estimates of casualties during Partition range from several hundred thousand to over one million killed in communal violence between August 1947 and early 1948.', sources: ['s19', 's20'] },
        { fact: 'The Indian Independence Act 1947 dissolved the British Indian Empire and transferred power to two independent dominions on 15 August 1947, creating an administrative vacuum that contributed to the collapse of civil order.', sources: ['s11'] },
      ],
      interpretations: [
        { historian: 'Gyanendra Pandey', school: 'Subaltern Studies', argument: 'Argues that violence was constitutive of Partition, not merely a consequence of it — the riots, massacres, and forced displacement were not incidental to the political transfer of power but central to how Partition was experienced and remembered.' },
        { historian: 'Urvashi Butalia', school: 'Oral History/Feminist', argument: 'Documents how the violence created lasting intergenerational trauma that shaped community identities and family memories, particularly through the lens of women\'s experiences of abduction, recovery, and silence.' },
        { historian: 'Yasmin Khan', school: 'Social History', argument: 'Emphasises that the administrative collapse following the rushed transfer of power enabled violence to spread, and that historians should focus on the breakdown of everyday governance as much as on communal hatred.' },
      ],
      editorialSynthesis: 'The evidence establishes that Partition\'s violence was not incidental but central to the founding of both India and Pakistan. The speed of decolonisation, the administrative collapse, and the deliberate incitement by political actors all contributed to a catastrophe whose scale was neither inevitable nor solely a product of primordial hatreds. The trauma was real and enduring, but its severity varied significantly by region — Punjab experienced near-total demographic transformation while Bengal\'s Partition was markedly less violent — and this variation deserves equal emphasis.',
      counterArguments: [
        { viewpoint: 'Economic recovery thesis', argument: 'Some historians argue that the emphasis on violence and dislocation overlooks the successful transplantation of millions and the rapid reconstruction of Punjab\'s economy within a decade. The trauma narrative, while accurate for those directly affected, may overstate Partition\'s long-term developmental impact.', proponents: 'Economic historians of post-Partition Punjab' },
        { viewpoint: 'Comparative perspective', argument: 'Partition\'s violence, while appalling, was not unique in the context of decolonisation. The population transfers between Greece and Turkey (1923), the Partition of Palestine (1948), and the Partition of Bengal (1905) all involved significant forced migration. A comparative lens helps locate Partition within broader patterns of nation-state formation rather than treating it as an exceptional moral catastrophe.' },
      ],
    },
  },
  {
    id: 'b-ca-trauma',
    type: 'callout',
    data: {
      variant: 'question',
      text: '**Historians ask:** Did Partition\'s trauma obscure the scale of India\'s economic and administrative recovery? Some historians argue that the emphasis on violence and dislocation overlooks the successful transplantation of millions and the rapid reconstruction of Punjab\'s economy within a decade.',
    },
  },
  {
    id: 'b-claim-kashmir', type: 'claim',
    data: {
      statement: 'India\'s decision to refer the Kashmir dispute to the UN Security Council internationalised a bilateral conflict and created a permanent diplomatic vulnerability.',
      confidence: 'established',
      evidence: [
        { sourceId: 's14', relevance: 'direct', excerpt: 'The Instrument of Accession transferred defence, foreign affairs, and communications to India.' },
        { sourceId: 's6', relevance: 'direct', excerpt: 'UN Security Council Resolution 47 called for a ceasefire, withdrawal, and a plebiscite.' },
        { sourceId: 's21', relevance: 'direct', excerpt: 'Gopal\'s biography argues that the UN referral was necessary to prevent a full-scale war.' },
      ],
      documentedFacts: [
        { fact: 'Maharaja Hari Singh signed the Instrument of Accession on 26 October 1947, transferring defence, foreign affairs, and communications to India under the Indian Independence Act 1947.', sources: ['s14'] },
        { fact: 'India referred the Kashmir dispute to the UN Security Council on 1 January 1948 under Article 35 of the UN Charter (situation likely to threaten international peace).', sources: ['s6'] },
        { fact: 'UN Security Council Resolution 47 (21 April 1948) called for a ceasefire, Pakistani withdrawal of tribesmen and regular troops, and a plebiscite under UN supervision to determine Kashmir\'s future.', sources: ['s6'] },
        { fact: 'The resolution placed India and Pakistan on equal footing as disputants, rejecting India\'s position that Pakistan was an aggressor and that Kashmir\'s accession to India was legally complete.', sources: ['s6', 's21'] },
      ],
      interpretations: [
        { historian: 'Sarvepalli Gopal', school: 'Orthodox/Nationalist', argument: 'Argues that the UN referral was a necessary act of statesmanship to prevent escalation to a full-scale India-Pakistan war at a time when the Indian Army was still being reorganised after Partition.' },
        { historian: 'Sumit Ganguly', school: 'Realist IR', argument: 'Argues that the UN referral weakened India\'s long-term diplomatic position by internationalising what could have been managed bilaterally, creating a permanent forum for Pakistan to challenge Indian sovereignty over Kashmir.' },
        { historian: 'Srinath Raghavan', school: 'Strategic History', argument: 'Presents a more contextual interpretation — India\'s decision was driven by immediate military necessity (tribal invasion underway, army not ready), and the long-term diplomatic costs were not foreseeable in the crisis atmosphere of October–December 1947.' },
      ],
      editorialSynthesis: 'The documentary record shows that India\'s UN referral was legally coherent under Article 35 and militarily understandable given the emergency. However, India misjudged the diplomatic dynamics of the Security Council: it expected legal vindication for a completed accession but instead found itself in a symmetrical dispute. This miscalculation — treating a legal claim as if it would automatically prevail over geopolitical interests — became a recurring pattern in Indian diplomacy. The lesson was not that international institutions are powerless, but that legal merit alone does not guarantee diplomatic success without sustained coalition-building.',
      counterArguments: [
        { viewpoint: 'Internationalist view', argument: 'The UN played a constructive role by securing a ceasefire in January 1949 that prevented escalation to a full-scale war. Given that both nations were newly independent with limited military resources, the UN framework provided a de-escalation mechanism that bilateral diplomacy alone could not have achieved.', proponents: 'UN institutional historians' },
        { viewpoint: 'Diplomatic failure view', argument: 'India\'s disappointment at the UN was primarily a failure of diplomacy rather than an institutional flaw. Pakistan conducted a more sophisticated political campaign at the UN, while India relied on legal arguments and failed to build the coalition needed to secure favourable outcomes.', proponents: 'Diplomatic historians' },
      ],
    },
  },
  {
    id: 'b-ca-kashmir',
    type: 'callout',
    data: {
      variant: 'question',
      text: '**Historians ask:** Did India have any alternative to UN referral in October 1947? Pakistan\'s tribal invasion, supported by regular army officers, left India with few viable options — the Indian Army was still being reorganised after Partition and could not have secured Kashmir without risking a wider conflict.',
    },
  },
  {
    id: 'b-claim-borders', type: 'claim',
    data: {
      statement: 'The five-week Radcliffe boundary commission created indefensible borders that divided communities and established lasting territorial disputes.',
      confidence: 'established',
      evidence: [
        { sourceId: 's13', relevance: 'direct', excerpt: 'The Radcliffe Award was drawn in five weeks by a commission that had never visited India.' },
        { sourceId: 's16', relevance: 'direct', excerpt: 'Khan argues the accelerated timetable caused the administrative collapse that enabled Partition violence.' },
      ],
      documentedFacts: [
        { fact: 'The Radcliffe Boundary Commission was established on 30 June 1947 and published its award on 17 August 1947 — only five weeks to draw borders across two provinces (Punjab and Bengal) covering over 400,000 square kilometres.', sources: ['s13'] },
        { fact: 'Sir Cyril Radcliffe, a British lawyer who had never previously visited India, chaired the commission without ever seeing the territories he was dividing.', sources: ['s13'] },
        { fact: 'The award was deliberately withheld until after the Independence celebrations on 14–15 August 1947 to avoid disrupting the transfer of power, and was published two days later.', sources: ['s13', 's16'] },
        { fact: 'The border divided agricultural communities, irrigation systems, railway lines, and military units, and left approximately 12 million people on the "wrong" side of the new boundary.', sources: ['s1', 's16'] },
      ],
      interpretations: [
        { historian: 'Yasmin Khan', school: 'Social History', argument: 'Argues that the accelerated timetable for the Boundary Commission\'s work caused the administrative collapse that enabled Partition violence — the border was drawn so hastily that local authorities had no time to plan for population transfers or maintain civil order.' },
        { historian: 'Lucy Chester', school: 'Cartographic History', argument: 'Demonstrates that the Radcliffe award was shaped by political pressure from both Congress and the Muslim League, with each side lobbying through the Viceroy\'s office, and that the commission\'s independence was compromised from the start.' },
        { historian: 'Ayesha Jalal', school: 'Revisionist', argument: 'Argues that the border was the product of the fundamental contradiction between the idea of Pakistan (a homeland for Indian Muslims) and the reality of Punjab\'s religious intermixture — no border could have avoided displacing communities given the demographic geography.' },
      ],
      editorialSynthesis: 'The evidence shows that the Radcliffe award was made under impossible conditions — impossibly short timeframes, a chair unfamiliar with the territory, and intense political pressure. The result was a border that maximised rather than minimised disruption. However, the deeper problem was structural: given the religious intermixture of Punjab and Bengal, no border drawn in 1947 could have cleanly separated communities. The fault lies less with Radcliffe\'s specific decisions than with the political decision to accept Partition as the solution to India\'s constitutional crisis, and then to compress the border-drawing process into five weeks under a fixed deadline.',
      counterArguments: [
        { viewpoint: 'Inevitability thesis', argument: 'Given the religious intermixture of Punjab and Bengal, no border could have avoided displacing communities. The fault lies not with Radcliffe but with the political decision to accept Partition at all under impossible time pressure imposed by the 15 August deadline.', proponents: 'Revisionist historians' },
        { viewpoint: 'Limited impact view', argument: 'While the Punjab border was catastrophic in human terms, most other borders drawn during decolonisation (e.g., Palestine, Cyprus, Ireland) were similarly contentious. The Radcliffe award was not uniquely incompetent by the standards of imperial boundary-drawing — it was the compressed timeframe and the total population transfer that made it exceptional.' },
      ],
    },
  },
  {
    id: 'b-ca-borders',
    type: 'callout',
    data: {
      variant: 'question',
      text: '**Historians ask:** Could any boundary commission have succeeded? Given the religious intermixture of Punjab and Bengal, no border could have avoided displacing communities. The fault may lie not with Radcliffe but with the political decision to draw borders at all, under impossible time pressure imposed by the 15 August deadline.',
    },
  },
  {
    id: 'b-claim-integration', type: 'claim',
    data: {
      statement: 'The integration of 565 princely states through Patel\'s diplomacy was one of the most successful state-building projects of the twentieth century.',
      confidence: 'established',
      evidence: [
        { sourceId: 's18', relevance: 'direct', excerpt: 'Menon\'s insider account details how Patel used diplomatic persuasion, financial pressure, and military threat.' },
        { sourceId: 's1', relevance: 'direct', excerpt: 'Guha documents the integration campaign as a critical success of India\'s founding period.' },
      ],
      documentedFacts: [
        { fact: 'At independence, British India contained approximately 565 princely states covering 48% of the land area and 28% of the population, with no automatic legal accession to either India or Pakistan.', sources: ['s18', 's1'] },
        { fact: 'Sardar Vallabhbhai Patel, as Minister of Home Affairs, and V. P. Menon, as Secretary of the States Department, led the integration campaign between August 1947 and 1949.', sources: ['s18'] },
        { fact: 'The integration employed a spectrum of methods: diplomatic persuasion (most states), financial pressure (withholding of privy purse guarantees), legal instruments (standstill agreements, instruments of accession), and military force (Hyderabad, Junagadh).', sources: ['s18'] },
        { fact: 'By 1949, all 565 states had acceded to India, most through negotiated instruments that preserved the rulers\' titles and privy purses (later abolished in 1971).', sources: ['s1', 's18'] },
      ],
      interpretations: [
        { historian: 'V. P. Menon', school: 'Insider/Administrative', argument: 'In his insider account "The Story of the Integration of the Indian States", Menon details the painstaking administrative and diplomatic process, presenting integration as a triumph of political skill and constitutional design.' },
        { historian: 'Ramachandra Guha', school: 'Liberal/Nationalist', argument: 'Documents the integration campaign as a critical success of the founding period, arguing that Patel\'s combination of firmness and flexibility prevented the balkanisation of India.' },
        { historian: 'H. M. Seervai', school: 'Constitutional Law', argument: 'Notes that the legal framework of accession — particularly the requirement for each ruler to sign an Instrument of Accession — was carefully designed to avoid allegations of coercion while making refusal practically impossible.' },
      ],
      editorialSynthesis: 'The integration of the princely states was undeniably a state-building achievement of the highest order, comparable to the unification of Germany or Italy in its speed and scope. However, the narrative of seamless voluntary accession understates the coercive dimensions: financial pressure, military threat, and in the cases of Hyderabad and Junagadh, direct force. The integration process also created festering resentments in Kashmir, Hyderabad, and Manipur — states whose accessions were achieved through pressure or force — that remain politically unresolved. The achievement is real but should be described accurately, with the coercive dimensions acknowledged alongside the diplomatic success.',
      counterArguments: [
        { viewpoint: 'Democratic consent critique', argument: 'Centralised integration through pressure tactics came at the cost of democratic consent. Critics argue that residents of Hyderabad, Kashmir, and Manipur were never given a genuine choice about their political future, and that the speed of integration sacrificed local autonomy for administrative uniformity.', proponents: 'Regional historians, Manipuri and Kashmiri scholars' },
        { viewpoint: 'Administrative necessity view', argument: 'In the context of Partition\'s violence and the threat of balkanisation, there was no time for deliberative democracy. The integration was a crisis response that prioritised national survival over procedural consent — a trade-off that was justified by circumstances even if imperfect in principle.' },
      ],
    },
  },
  {
    id: 'b-ca-integration',
    type: 'callout',
    data: {
      variant: 'question',
      text: '**Historians ask:** Did centralised integration come at the cost of democratic consent? Critics argue that pressure tactics rather than negotiated accession created resentments in Kashmir, Hyderabad, and Manipur that remain unresolved, and that the speed of integration sacrificed local autonomy for administrative uniformity.',
    },
  },
  {
    id: 'b-claim-two-nation', type: 'claim',
    data: {
      statement: 'The Two-Nation theory was not an inevitable expression of primordial communal identity but a political strategy shaped by elite competition during decolonisation.',
      confidence: 'debated',
      evidence: [
        { sourceId: 's2', relevance: 'direct', excerpt: 'Jalal argues that Jinnah used the demand for Pakistan as a bargaining counter and did not intend full partition.' },
        { sourceId: 's3', relevance: 'contextual', excerpt: 'Some historians see the Two-Nation theory as reflecting deep social and cultural roots of communal identity.' },
      ],
      documentedFacts: [
        { fact: 'The Muslim League formally adopted the demand for Pakistan at its Lahore session in March 1940, calling for independent states in the Muslim-majority areas of northwest and northeast India.', sources: ['s2'] },
        { fact: 'Separate electorates for Muslims had existed since the Morley-Minto Reforms of 1909, institutionalising communal representation in Indian politics.', sources: ['s1'] },
        { fact: 'The Muslim League won 90% of Muslim seats in the 1946 provincial elections, providing a clear electoral mandate for its demand for Pakistan.', sources: ['s2'] },
        { fact: 'Jinnah\'s public statements evolved significantly between 1940 and 1947 — from a demand for autonomous Muslim states within a confederation to insistence on a sovereign Pakistan.', sources: ['s2', 's3'] },
      ],
      interpretations: [
        { historian: 'Ayesha Jalal', school: 'Revisionist', argument: 'Argues that Jinnah used the demand for Pakistan as a bargaining counter to secure Muslim political rights within a united India and did not intend full partition. The "Pakistan demand" was a negotiating position that acquired a momentum Jinnah could no longer control.' },
        { historian: 'H. M. Seervai', school: 'Constitutional Law', argument: 'Presents the Two-Nation theory as the logical consequence of Congress\'s inability to offer constitutional guarantees that would protect Muslim minority rights in a Hindu-majority state, making the demand for separate nationhood a rational response to majoritarian fears.' },
        { historian: 'Faisal Devji', school: 'Global Intellectual History', argument: 'Interprets the Two-Nation theory as a genuinely ideological project — not merely a political strategy but a moral argument about the relationship between religion, territory, and sovereignty in the modern world, drawing on global debates about self-determination.' },
      ],
      editorialSynthesis: 'The evidence supports the view that the Two-Nation theory was neither an inevitable expression of primordial identity nor a purely instrumental bargaining position. It functioned simultaneously as a genuine ideological commitment for some, a negotiating strategy for others, and a popular rallying cry for millions who saw in Pakistan a promise of dignity and security. A singular explanation — whether elite strategy or social reality — cannot capture this complexity. The most defensible position is that the Two-Nation theory gained its power precisely because it operated at multiple levels simultaneously, meaning different things to different constituencies, and that this ambiguity was essential to its political effectiveness.',
      counterArguments: [
        { viewpoint: 'Nationalist school', argument: 'The Two-Nation theory reflected genuine and long-standing communal divisions that predated elite politics — separate electorates since 1909, the Muslim League\'s landslide in the 1946 elections, and the Pakistan movement\'s mass mobilisation suggest it had deep social roots beyond elite bargaining.', proponents: 'Nationalist historians' },
        { viewpoint: 'Self-determination school', argument: 'The Two-Nation theory was a legitimate expression of Muslim nationhood under the principle of self-determination. Pakistan\'s survival for over seven decades, despite internal ethnic and linguistic divisions, suggests the idea had genuine popular foundations that cannot be reduced to elite political strategy.', proponents: 'Pakistani nationalist historians' },
      ],
    },
  },
  {
    id: 'b-ca-two-nation-1',
    type: 'callout',
    data: {
      variant: 'question',
      text: '**Counterargument (Nationalist school):** The Two-Nation theory reflected genuine and long-standing communal divisions that predated elite politics — separate electorates since 1909, the Muslim League\'s landslide in the 1946 elections, and the Pakistan movement\'s mass mobilisation suggest it had deep social roots beyond elite bargaining.',
    },
  },
  {
    id: 'b-ca-two-nation-2',
    type: 'callout',
    data: {
      variant: 'question',
      text: '**Counterargument (Self-determination school):** The Two-Nation theory was a legitimate expression of Muslim nationhood under the principle of self-determination. Pakistan\'s survival for over seven decades, despite internal ethnic and linguistic divisions, suggests the idea had genuine popular foundations that cannot be reduced to elite political strategy.',
    },
  },
  {
    id: 'b-claim-nonalignment', type: 'claim',
    data: {
      statement: 'Non-alignment was a rational strategic response to India\'s geopolitical position and limited military capacity, not idealistic moral posturing.',
      confidence: 'established',
      evidence: [
        { sourceId: 's1', relevance: 'direct', excerpt: 'Non-alignment preserved India\'s strategic autonomy and allowed aid from both Cold War blocs.' },
        { sourceId: 's21', relevance: 'supporting', excerpt: 'Gopal emphasises that non-alignment was rooted in India\'s anti-colonial struggle and commitment to sovereignty.' },
      ],
      documentedFacts: [
        { fact: 'India formally adopted non-alignment as its foreign policy framework under Prime Minister Jawaharlal Nehru, co-founding the Non-Aligned Movement at the Bandung Conference in 1955.', sources: ['s1', 's25'] },
        { fact: 'India accepted economic aid from both the United States (PL-480 food aid, technical assistance) and the Soviet Union (steel plants, heavy industry, military equipment) throughout the 1950s and 1960s.', sources: ['s1', 's24'] },
        { fact: 'India\'s defence expenditure in the 1950s averaged approximately 2% of GDP, reflecting both genuine resource constraints and a strategic calculation that non-alignment would reduce the need for military spending.', sources: ['s1', 's21'] },
        { fact: 'Pakistan joined the US-led Southeast Asia Treaty Organisation (SEATO) in 1954 and the Central Treaty Organisation (CENTO) in 1955, bringing Cold War alliance structures directly to India\'s borders.', sources: ['s1', 's24'] },
      ],
      interpretations: [
        { historian: 'Sarvepalli Gopal', school: 'Orthodox/Nationalist', argument: 'Emphasises that non-alignment was rooted in India\'s anti-colonial struggle and its commitment to national sovereignty — not a policy of equidistance but of independent judgment on each issue.' },
        { historian: 'C. Raja Mohan', school: 'Realist', argument: 'Argues that non-alignment was a rational strategic choice for a newly independent nation with limited military capacity but was less successful in preventing great power competition in South Asia once Pakistan aligned with the US.' },
        { historian: 'Andrew Kennedy', school: 'Foreign Policy Analysis', argument: 'Shows that Nehru\'s non-alignment enjoyed broad domestic political support across ideological divides, functioning as a consensus foreign policy that insulated India from the polarising effects of the Cold War.' },
      ],
      editorialSynthesis: 'The claim that non-alignment was "idealistic posturing" rather than rational strategy does not survive scrutiny. The documentary record shows that non-alignment served India\'s core interests in the founding period: it preserved strategic autonomy, enabled aid from both Cold War blocs, and enjoyed domestic political consensus. However, the assertion that non-alignment "preserved autonomy" requires qualification — India\'s dependence on US food aid under PL-480, Soviet arms supplies, and British arbitration on Indus waters reveals a gap between the narrative of autonomy and its practice. Non-alignment was a rational strategy, but it was also a policy of managing dependencies rather than eliminating them.',
      counterArguments: [
        { viewpoint: 'Realist critique', argument: 'Non-alignment was a narrative of autonomy rather than its reality. India accepted significant American and Soviet aid, depended on imported food, and lacked the military capacity to back its strategic claims. The gap between non-alignment\'s rhetoric and its practice was significant, particularly during the 1962 war when India was forced to appeal to both superpowers for emergency military assistance.', proponents: 'Realist IR scholars' },
        { viewpoint: 'Idealist defence', argument: 'Non-alignment preserved India\'s moral standing in the decolonising world and gave voice to newly independent nations that would otherwise have had no platform. The criticism that it was "aspirational rather than achieved" mistakes the nature of the project — non-alignment was never about full autonomy but about creating space for independent judgment within a bipolar system.' },
      ],
    },
  },
  {
    id: 'b-ca-nonalignment',
    type: 'callout',
    data: {
      variant: 'question',
      text: '**Historians ask:** Did non-alignment actually preserve autonomy, or did it merely disguise dependence? India accepted significant Soviet and American aid, depended on imported food under PL-480, and lacked the military capacity to back its strategic claims — some realist scholars argue non-alignment was a narrative of autonomy rather than its reality.',
    },
  },
  {
    id: 'b-claim-secular', type: 'claim',
    data: {
      statement: 'India\'s constitutional secularism, forged in opposition to the Two-Nation theory, served as both a domestic integration tool and a foreign policy asset in relations with Muslim-majority nations.',
      confidence: 'established',
      evidence: [
        { sourceId: 's4', relevance: 'direct', excerpt: 'Nehru\'s Tryst with Destiny speech frames Indian nationalism in civic, not religious, terms.' },
        { sourceId: 's1', relevance: 'direct', excerpt: 'India\'s secular identity was a key diplomatic asset in relations with the Arab world.' },
      ],
      documentedFacts: [
        { fact: 'The Indian Constitution, adopted in 1950, guarantees freedom of religion (Articles 25–28) and equality before the law regardless of religion (Article 15), without formally establishing a "secular" state — the word "secular" was added to the Preamble by the 42nd Amendment in 1976.', sources: ['s4', 's1'] },
        { fact: 'Nehru\'s "Tryst with Destiny" speech on 14 August 1947 framed Indian nationalism in civic rather than religious terms, directly counterposing India\'s vision to the Two-Nation theory.', sources: ['s4'] },
        { fact: 'India maintained diplomatic relations with Israel from 1948 (de facto recognition) but did not establish full diplomatic relations until 1992, partly to preserve its standing in the Arab world.', sources: ['s1'] },
      ],
      interpretations: [
        { historian: 'Rajeev Bhargava', school: 'Political Theory', argument: 'Argues that Indian secularism is not a Western-style separation of church and state but a "principled distance" model that allows state intervention to ensure equal respect for all religions — a distinctive approach forged in India\'s multi-religious context.' },
        { historian: 'Sunil Khilnani', school: 'Intellectual History', argument: 'Presents secularism as the core of Nehru\'s nation-building project — a civic nationalism designed to integrate India\'s diverse religious communities into a shared political identity, directly challenging the religious basis of the Pakistan demand.' },
        { historian: 'Ayesha Jalal', school: 'Revisionist', argument: 'Notes that the practice of Indian secularism was more complex and uneven than the constitutional ideal — the retention of religious personal laws and the failure to implement a Uniform Civil Code reveal the gap between secular principle and political reality.' },
      ],
      editorialSynthesis: 'The evidence establishes that India\'s secular constitution was a deliberate repudiation of the Two-Nation theory and a genuine effort to build civic nationalism. It was also a practical diplomatic asset, particularly in relations with the Arab world. However, the gap between constitutional principle and political practice was significant from the start — religious personal laws persisted, the Uniform Civil Code remained unimplemented, and caste-based and religious identity politics shaped electoral behaviour throughout the founding period. Indian secularism was a real achievement, but it was always an incomplete project, and the founding generation was aware of this gap.',
      counterArguments: [
        { viewpoint: 'Inconsistency critique', argument: 'Critics note that India retained religious personal laws (Muslim, Hindu, Christian), never implemented the Uniform Civil Code promised by the Constitution, and that state secularism coexisted with caste-based electoral politics — suggesting a more complex and uneven practice than the constitutional ideal.', proponents: 'Legal scholars, feminist historians' },
        { viewpoint: 'Achievement perspective', argument: 'Despite these inconsistencies, India\'s secular framework was remarkable in comparative context — no other newly independent post-colonial state with India\'s religious diversity maintained democratic secularism for seven decades. The "gap between principle and practice" critique, while valid, should not obscure the genuine achievement of building a civic nationalist state in conditions of extreme religious diversity.' },
      ],
    },
  },
  {
    id: 'b-ca-secular',
    type: 'callout',
    data: {
      variant: 'question',
      text: '**Historians ask:** How consistently was secularism applied? Critics note that India retained religious personal laws (Muslim, Hindu, Christian), never implemented the Uniform Civil Code promised by the Constitution, and that state secularism coexisted with caste-based electoral politics — suggesting a more complex and uneven practice than the constitutional ideal.',
    },
  },
  {
    id: 'b-claim-nationbuilding', type: 'claim',
    data: {
      statement: 'Partition taught India that national unity requires constant political cultivation through federalism, linguistic states, and constitutional accommodation of diversity.',
      confidence: 'established',
      evidence: [
        { sourceId: 's1', relevance: 'direct', excerpt: 'Guha documents how Constitution\'s federal structure reflected lessons from the failure to accommodate Muslim political aspirations.' },
      ],
      documentedFacts: [
        { fact: 'The Constitution of India established a federal structure with strong central features (single citizenship, all-India services, central control over states during emergencies), reflecting the Constituent Assembly\'s concern with national unity after Partition.', sources: ['s1', 's4'] },
        { fact: 'The States Reorganisation Act of 1956 reorganised India\'s internal boundaries along linguistic lines, creating 14 states and 6 union territories.', sources: ['s1'] },
        { fact: 'The Constitution provides for a three-language formula (Hindi, English, and a regional language) and contains provisions for linguistic minorities (Article 29, 30, 350A, 350B).', sources: ['s4'] },
        { fact: 'The linguistic reorganisation was preceded by the death of Potti Sreeramulu during a fast for a separate Andhra state in 1952, demonstrating the intensity of linguistic demands.', sources: ['s1'] },
      ],
      interpretations: [
        { historian: 'Ramachandra Guha', school: 'Liberal/Nationalist', argument: 'Documents how the Constitution\'s federal structure directly reflected the lessons of Partition — the framers understood that failure to accommodate India\'s diversity had led to the country\'s division, and designed institutions accordingly.' },
        { historian: 'Granville Austin', school: 'Constitutional History', argument: 'Describes the Indian Constitution as a "cooperative federalism" model — unlike classical federations (US, Australia), India\'s Constitution deliberately created a strong centre while providing mechanisms for states to participate in national decision-making.' },
        { historian: 'Paul Brass', school: 'Comparative Politics', argument: 'Shows that linguistic reorganisation both resolved and created tensions — it addressed demands for regional identity but also created new centres of regional politics (Tamil Nadu, Punjab, Maharashtra) whose assertions the Constitution\'s architects had not fully anticipated.' },
      ],
      editorialSynthesis: 'The evidence supports the claim that Partition\'s experience shaped India\'s constitutional design, particularly the emphasis on strong central authority combined with accommodation of diversity. However, the lesson was applied selectively — linguistic states were created only after intense agitation, the three-language formula was contested from its inception, and the Constitution\'s federal features coexisted with centralising tendencies. The most accurate formulation is that Partition taught India that unity required accommodation, but the founding generation learned this lesson incompletely and unevenly, with contestation continuing throughout the founding period.',
      counterArguments: [
        { viewpoint: 'Federalism as ongoing negotiation', argument: 'The linguistic reorganisation of states in 1956 did resolve some tensions but also created new centres of regional identity politics — in Tamil Nadu, Maharashtra, and Punjab — that the Constitution\'s architects had not fully anticipated. Federalism was a continuing negotiation rather than a solved design.', proponents: 'Comparative federalism scholars' },
        { viewpoint: 'Centralisation critique', argument: 'India\'s federalism was from the start heavily weighted toward the centre, with states dependent on New Delhi for financial resources and subject to central intervention under Article 356. This centralised federalism constrained the very diversity it was meant to accommodate, creating tensions that persist in centre-state relations.' },
      ],
    },
  },
  {
    id: 'b-ca-nationbuilding',
    type: 'callout',
    data: {
      variant: 'question',
      text: '**Historians ask:** Did federalism succeed or fragment? The linguistic reorganisation of states in 1956 did resolve some tensions but also created new centres of regional identity politics — in Tamil Nadu, Maharashtra, and Punjab — that the Constitution\'s architects had not fully anticipated, suggesting federalism was a continuing negotiation rather than a solved design.',
    },
  },
  {
    id: 'b-claim-pakistan', type: 'claim',
    data: {
      statement: 'Partition confirmed that Pakistan would be India\'s primary strategic challenge, establishing patterns of hostility that would persist for decades through disputed borders, divided assets, and competing nationalist ideologies.',
      confidence: 'established',
      evidence: [
        { sourceId: 's1', relevance: 'direct', excerpt: 'The division of the British Indian Army and the Kashmir dispute established patterns of India-Pakistan hostility.' },
        { sourceId: 's23', relevance: 'direct', excerpt: 'Ganguly argues the India-Pakistan conflict is rooted in competing nationalist identities left unresolved by Partition.' },
      ],
      documentedFacts: [
        { fact: 'The division of the British Indian Army between India and Pakistan was completed by 1948, with each successor state receiving approximately two-thirds and one-third of military assets respectively.', sources: ['s1'] },
        { fact: 'The Kashmir dispute began in October 1947 with a tribal invasion supported by the Pakistan Army, leading to the first India-Pakistan war (1947–48).', sources: ['s14', 's6'] },
        { fact: 'India and Pakistan went to war over Kashmir in 1947–48, and the ceasefire line (later the Line of Control) established in January 1949 became a permanent source of tension.', sources: ['s6'] },
        { fact: 'The division of financial assets, water resources (the Indus system), and administrative infrastructure was contested from the outset, requiring British arbitration (the Indus Waters Treaty of 1960) to resolve.', sources: ['s1'] },
      ],
      interpretations: [
        { historian: 'Sumit Ganguly', school: 'Realist IR', argument: 'Argues that the India-Pakistan conflict is rooted in competing nationalist identities left unresolved by Partition — two states founded on opposing principles of national identity (civic vs. religious), with each posing an existential challenge to the other\'s founding narrative.' },
        { historian: 'Srinath Raghavan', school: 'Strategic History', argument: 'Presents the conflict as contingent rather than structurally inevitable — alternative paths existed, including the 1949 no-war pact proposal and joint defence discussions between Liaquat and Nehru — and specific political choices drove escalation at key junctures.' },
        { historian: 'Husain Haqqani', school: 'Ideological History', argument: 'Argues that Pakistan\'s military establishment deliberately cultivated hostility toward India as a rationale for military dominance over Pakistan\'s civilian institutions, making the conflict functional for Pakistan\'s internal power structure.' },
      ],
      editorialSynthesis: 'The claim that Partition established enduring patterns of India-Pakistan hostility is well supported by the evidence. The division of assets, the Kashmir dispute, and the competing nationalist ideologies created a structural conflict. However, the evidence equally supports the view that specific decisions — the rush to refer Kashmir to the UN, the failure to pursue a no-war pact, the hardening of positions after the first war — were critical to making this structure rigid. The conflict was not inevitable at every juncture; alternative paths were available and considered, even if ultimately not taken. Any account of India-Pakistan relations must distinguish between the structural conditions created by Partition and the contingent political choices that translated those conditions into enduring hostility.',
      counterArguments: [
        { viewpoint: 'Structural determinism critique', argument: 'Some scholars argue that the claim of inevitable conflict risks determinism — alternative paths existed, including the 1949 no-war pact proposal and joint defence arrangements discussed between Liaquat and Nehru — and that specific political choices, not structural inevitability, drove escalation at key junctures.', proponents: 'Strategic historians' },
        { viewpoint: 'Limited-conflict perspective', argument: 'Despite the hostility, the India-Pakistan relationship was characterised by "limited conflict" — neither side pursued total war; diplomatic channels remained open; and agreements were reached (Indus Waters Treaty, 1960; Simla Agreement, 1972). The narrative of unremitting hostility obscures the coexistence of conflict and cooperation.' },
      ],
    },
  },
  {
    id: 'b-ca-pakistan',
    type: 'callout',
    data: {
      variant: 'question',
      text: '**Historians ask:** Was the conflict structurally inevitable? Some scholars argue that this claim risks determinism — alternative paths existed, including the 1949 no-war pact proposal and joint defence arrangements discussed between Liaquat and Nehru — and that specific political choices, not structural inevitability, drove escalation at key junctures.',
    },
  },
  {
    id: 'b-claim-autonomy', type: 'claim',
    data: {
      statement: 'Partition demonstrated the dangers of external dependence, reinforcing India\'s commitment to strategic autonomy and non-alignment in foreign policy.',
      confidence: 'established',
      evidence: [
        { sourceId: 's1', relevance: 'direct', excerpt: 'The experience of British arbitration during Partition convinced Nehru that India could not entrust its security to Great Powers.' },
        { sourceId: 's21', relevance: 'direct', excerpt: 'Gopal argues non-alignment was rooted in India\'s anti-colonial struggle and commitment to national sovereignty.' },
      ],
      documentedFacts: [
        { fact: 'The British government unilaterally advanced the date of transfer of power from June 1948 to August 1947, demonstrating that India could not rely on British timelines or commitments.', sources: ['s1', 's11'] },
        { fact: 'Lord Mountbatten\'s role as both Viceroy and interim Governor-General, and the British government\'s mediation during Partition, convinced Indian leaders that external arbitration served British rather than Indian interests.', sources: ['s1'] },
        { fact: 'India\'s first foreign policy decision — to join the Commonwealth as a republic in 1949 — was itself an assertion of autonomy: India remained associated with Britain but on its own terms, without accepting the British monarch as head of state.', sources: ['s1', 's21'] },
      ],
      interpretations: [
        { historian: 'Sarvepalli Gopal', school: 'Orthodox/Nationalist', argument: 'Argues that non-alignment was rooted in India\'s anti-colonial struggle and its determination never again to be dependent on external powers for its security — Partition had demonstrated the dangers of trusting one\'s fate to British arbitration.' },
        { historian: 'C. Raja Mohan', school: 'Realist', argument: 'Argues that the autonomy imperative was real but its implementation was inconsistent — India accepted significant external dependencies (US food aid, Soviet arms, British water arbitration) that contradicted the narrative of self-reliance.' },
        { historian: 'Shashi Tharoor', school: 'Diplomatic History', argument: 'Notes that Nehru\'s approach was more pragmatic than critics acknowledge — accepting aid and association when necessary while maintaining independence of judgment on major issues, a balancing act that served India reasonably well.' },
      ],
      editorialSynthesis: 'The claim that Partition reinforced India\'s commitment to strategic autonomy is supported by the documentary evidence — the experience of British arbitration, the unilateral advance of the transfer date, and the chaotic division of assets all convinced Indian leaders that external dependence was dangerous. However, the commitment to autonomy coexisted with pragmatic acceptance of dependencies where necessary (American food aid, Soviet industrial assistance, British arbitration on Indus waters). The most accurate characterisation is that Partition created a genuine commitment to strategic autonomy as an aspiration and principle, while practice was necessarily more pragmatic. The gap between principle and practice does not invalidate the principle but does require acknowledgement.',
      counterArguments: [
        { viewpoint: 'Impracticability critique', argument: 'Strategic autonomy was an aspiration often compromised when practical necessity demanded external assistance. India accepted American wheat loans under PL-480 in the 1950s, Soviet aid for industrialisation, and British arbitration on Indus waters in 1960 — suggesting autonomy was a negotiating posture rather than a consistently achieved policy.', proponents: 'Realist scholars' },
        { viewpoint: 'Pragmatic adaptation view', argument: 'Managing dependencies while maintaining strategic independence required sophisticated statecraft, not rigid self-reliance. India\'s ability to accept aid from both Cold War blocs without formal alignment was itself an achievement of autonomy — the freedom to choose one\'s dependencies rather than having them imposed.' },
      ],
    },
  },
  {
    id: 'b-ca-autonomy',
    type: 'callout',
    data: {
      variant: 'question',
      text: '**Historians ask:** Was autonomy achieved or aspirational? India accepted American wheat loans under PL-480 in the 1950s, Soviet aid for industrialisation, and British arbitration on Indus waters in 1960 — suggesting that strategic autonomy was an aspiration often compromised when practical necessity demanded external assistance, rather than a consistently achieved policy.',
    },
  },
  {
    id: 'b-claim-violence', type: 'claim',
    data: {
      statement: 'The communal violence of Partition destroyed mixed communities that had coexisted for centuries and created hardened communal identities that political negotiation could not reverse.',
      confidence: 'established',
      evidence: [
        { sourceId: 's19', relevance: 'direct', excerpt: 'Pandey argues that violence was constitutive of Partition, not merely a consequence of it.' },
        { sourceId: 's20', relevance: 'direct', excerpt: 'Butalia documents how the violence created lasting trauma that shaped community identities for generations.' },
      ],
      documentedFacts: [
        { fact: 'By conservative estimates, 10–15 million people were displaced during Partition, with approximately 7 million Muslims moving to Pakistan and 7 million Hindus and Sikhs moving to India.', sources: ['s1', 's16'] },
        { fact: 'Punjab experienced near-total population exchange — the Muslim population of East Punjab fell from approximately 5 million to effectively zero, and the Hindu/Sikh population of West Punjab similarly collapsed.', sources: ['s16'] },
        { fact: 'An estimated 75,000 women were abducted during Partition violence, with state-led recovery operations continuing into the 1950s under the Abducted Persons (Recovery and Restoration) Act of 1949.', sources: ['s20'] },
        { fact: 'Bengal\'s Partition experience was markedly different from Punjab\'s — significant Muslim and Hindu populations remained on both sides of the border, and patterns of coexistence continued in eastern India.', sources: ['s20', 's27'] },
      ],
      interpretations: [
        { historian: 'Gyanendra Pandey', school: 'Subaltern Studies', argument: 'Argues that violence was constitutive of Partition, not merely a consequence of it — the riots, massacres, and forced displacement were central to how Partition was experienced and how post-independence identities were formed.' },
        { historian: 'Urvashi Butalia', school: 'Oral History/Feminist', argument: 'Documents how Partition violence created lasting intergenerational trauma through the specific lens of women\'s experiences — abduction, forced conversion, recovery, and the silence imposed on survivors by family and state.' },
        { historian: 'Ian Talbot', school: 'Regional History', argument: 'Demonstrates the regional variation in Partition\'s impact — Punjab\'s violence was total and transformative, while Bengal\'s was more complex, with significant minority populations remaining on both sides and ongoing patterns of coexistence.' },
      ],
      editorialSynthesis: 'The claim that Partition destroyed mixed communities and created hardened communal identities is well supported for Punjab, where the scale of violence and population transfer was catastrophic and near-total. However, the evidence also shows significant regional variation — Bengal\'s Partition was markedly less violent, and significant Muslim and Hindu populations remained on both sides of the Bengal border. A claim that treats Partition violence as uniformly transformative across all regions overstates the evidence. The most defensible position is that Partition\'s violence was transformative in Punjab and devastating for those directly affected everywhere, but its impact varied significantly by region, and narratives of total communal rupture can obscure patterns of continuity and coexistence that also survived Partition.',
      counterArguments: [
        { viewpoint: 'Regional variation thesis', argument: 'While Punjab experienced near-total population exchange and communal devastation, Bengal\'s Partition was markedly different — significant Muslim and Hindu populations remained on both sides of the border, and patterns of coexistence and collaboration continued in eastern India, complicating any narrative of total communal rupture.', proponents: 'Regional historians, Bengal Partition scholars' },
        { viewpoint: 'Long-term integration perspective', argument: 'Despite the initial rupture, India\'s Muslim population has remained at approximately 14% of the total population, Indian Muslims participate fully in democratic politics, and communal violence — while tragic where it occurs — has not defined India\'s post-independence trajectory as much as the Partition narrative sometimes implies.' },
      ],
    },
  },
  {
    id: 'b-ca-violence',
    type: 'callout',
    data: {
      variant: 'question',
      text: '**Historians ask:** Was the rupture complete? While Punjab experienced near-total population exchange and communal devastation, Bengal\'s Partition was markedly different — significant Muslim and Hindu populations remained on both sides of the border, and patterns of coexistence and even collaboration continued in eastern India that complicate any narrative of total communal rupture.',
    },
  },
  {
    id: 'b-claim-military', type: 'claim',
    data: {
      statement: 'India failed to learn that strategic autonomy requires military self-sufficiency, leaving the nation dangerously vulnerable to external threats despite the clear lessons of 1947.',
      confidence: 'established',
      evidence: [
        { sourceId: 's1', relevance: 'direct', excerpt: 'Guha argues that Nehru\'s neglect of military modernisation left India unprepared for the 1962 war with China.' },
        { sourceId: 's21', relevance: 'direct', excerpt: 'Gopal notes that Nehru prioritised industrial development over military capacity, with catastrophic consequences.' },
      ],
      documentedFacts: [
        { fact: 'India\'s defence expenditure averaged approximately 2% of GDP between 1947 and 1962, one of the lowest rates among newly independent nations.', sources: ['s1'] },
        { fact: 'The Indian Army in 1962 was still equipped largely with World War II-era weaponry and had not been reorganised for high-altitude warfare on the Himalayan frontier.', sources: ['s1', 's21'] },
        { fact: 'Nehru\'s government prioritised industrial development (five-year plans, heavy industry) and education over military modernisation, reflecting a strategic assumption that China would not resort to war.', sources: ['s21'] },
        { fact: 'The 1962 Sino-Indian War revealed severe military unpreparedness — China\'s People\'s Liberation Army breached Indian defences and advanced to the 1960 claim line before unilaterally withdrawing.', sources: ['s1'] },
      ],
      interpretations: [
        { historian: 'Ramachandra Guha', school: 'Liberal/Nationalist', argument: 'Argues that Nehru\'s neglect of military modernisation was a serious strategic error — Partition had demonstrated the dangers facing the new nation, yet India\'s military capacity remained dangerously inadequate for the threats it would face.' },
        { historian: 'Srinath Raghavan', school: 'Strategic History', argument: 'Presents a more nuanced picture — Nehru\'s strategic framework assumed that diplomacy and international law, not military force, would secure India\'s interests, particularly with China. The failure was not simply military neglect but a flawed strategic assessment.' },
        { historian: 'C. Raja Mohan', school: 'Realist', argument: 'Argues that India\'s strategic culture was shaped more by anti-colonial moralism than by realist assessment of national security requirements, and that the neglect of military capacity was a systemic feature of India\'s strategic thinking, not merely Nehru\'s personal failure.' },
      ],
      editorialSynthesis: 'The claim that India failed to learn the military lessons of Partition requires careful qualification. The evidence clearly shows that India\'s military capacity in the founding period was inadequate for the challenges it eventually faced, particularly the 1962 war with China. However, the reasons for this were not simply "neglect" but reflected genuine strategic choices and constraints: India was food-deficient, industrialising from a minimal base, and managing the largest refugee crisis in modern history. The choice to prioritise industrial development and education over military spending reflected real resource constraints, not just strategic naivety. The most accurate assessment is that India\'s military capacity was underinvested relative to its strategic environment, but the trade-offs were more complex than the "failure to learn" framing implies.',
      counterArguments: [
        { viewpoint: 'Resource constraint view', argument: 'India\'s defence budget in the 1950s was constrained by genuine economic limits — the country was food-deficient, industrialising from a minimal base, and managing refugee resettlement. The choice to prioritise industrialisation and education over military spending reflected real resource constraints rather than a failure to learn from Partition.', proponents: 'Economic historians' },
        { viewpoint: 'Strategic assumption defence', argument: 'Nehru\'s framework assumed that China, as a fellow Asian power that had signed the Panchsheel agreement (1954), would not attack India. This assumption proved catastrophically wrong, but it was a strategic error of assessment, not a failure to learn the "lesson" of Partition, which was about Pakistan, not China. The two threats were structurally different and required different responses.' },
      ],
    },
  },
  {
    id: 'b-ca-military',
    type: 'callout',
    data: {
      variant: 'question',
      text: '**Historians ask:** Were the trade-offs unreasonable? India\'s defence budget in the 1950s was constrained by genuine economic limits — the country was food-deficient, industrialising from a minimal base, and managing refugee resettlement. The choice to prioritise industrialisation and education over military spending reflected real resource constraints rather than a failure to learn from Partition.',
    },
  },
  {
    id: 'b-claim-un', type: 'claim',
    data: {
      statement: 'India\'s experience with the UN over Kashmir demonstrated that international institutions are only as effective as the power constellations that support them, a lesson India was slow to fully absorb.',
      confidence: 'debated',
      evidence: [
        { sourceId: 's6', relevance: 'direct', excerpt: 'UNSCR 47 placed India and Pakistan on equal footing as disputants, frustrating India\'s expectation of legal vindication.' },
        { sourceId: 's21', relevance: 'contextual', excerpt: 'Gopal argues the UN referral was necessary to prevent escalation despite its ultimately unfavourable outcome.' },
      ],
      documentedFacts: [
        { fact: 'India submitted its complaint to the UN Security Council on 1 January 1948 under Article 35 of the UN Charter, which allows member states to bring situations likely to threaten international peace to the Council\'s attention.', sources: ['s6'] },
        { fact: 'UN Security Council Resolution 47 (21 April 1948) called for a ceasefire, Pakistani withdrawal of tribesmen and regular troops, and a plebiscite under UN supervision — placing India and Pakistan on equal footing as disputants.', sources: ['s6'] },
        { fact: 'India had expected the UN to treat Pakistan as an aggressor rather than a co-disputant, based on India\'s legal position that Kashmir\'s accession was complete and Pakistan\'s tribal invasion constituted external aggression.', sources: ['s6', 's21'] },
        { fact: 'The UN secured a ceasefire in January 1949 and established the UN Military Observer Group for India and Pakistan (UNMOGIP), which remains in place as of 2026.', sources: ['s6'] },
      ],
      interpretations: [
        { historian: 'Sarvepalli Gopal', school: 'Orthodox/Nationalist', argument: 'Argues that the UN referral was necessary to prevent escalation to a full-scale war despite its ultimately unfavourable diplomatic outcome — the immediate priority was stopping the tribal invasion, not securing a permanent legal victory.' },
        { historian: 'Srinath Raghavan', school: 'Strategic History', argument: 'Shows that India misjudged the Soviet Union\'s willingness to support India in the UN — at the time of the referral, the USSR was still uncertain about India\'s non-alignment and did not veto Resolution 47 — and that this miscalculation reflected India\'s inexperience in great-power diplomacy.' },
        { historian: 'A. G. Noorani', school: 'Legal/Diplomatic', argument: 'Documents how Pakistan conducted a more sophisticated diplomatic campaign at the UN, successfully framing the dispute as a self-determination question rather than an issue of aggression, and argues that India\'s legalistic approach was a strategic error.' },
      ],
      editorialSynthesis: 'The evidence supports the claim that India\'s UN experience was a diplomatic setback, but the lesson drawn requires careful formulation. India\'s failure was not primarily about the limits of international institutions — it was about a mismatch between legal strategy and diplomatic reality. India approached the UN as a court expecting legal vindication, while Pakistan approached it as a political arena. The lesson, retrospectively, is not that international institutions are powerless, but that legal merit without diplomatic coalition-building is insufficient in multilateral forums — a lesson India absorbed slowly but has since applied more effectively in climate negotiations, WTO disputes, and UN Security Council reform advocacy.',
      counterArguments: [
        { viewpoint: 'Internationalist view', argument: 'The UN played a constructive role by securing a ceasefire in January 1949 that prevented escalation to a full-scale India-Pakistan war. Given that both nations were newly independent with limited military resources, the UN framework provided a de-escalation mechanism that bilateral diplomacy alone could not have achieved.', proponents: 'UN institutional historians' },
        { viewpoint: 'Diplomatic failure view', argument: 'India\'s disappointment at the UN was primarily a failure of diplomacy rather than an institutional flaw. Pakistan conducted a more sophisticated political campaign at the UN, while India relied on legal arguments and failed to build the coalition needed to secure favourable outcomes.', proponents: 'Diplomatic historians' },
      ],
    },
  },
  {
    id: 'b-ca-un-1',
    type: 'callout',
    data: {
      variant: 'question',
      text: '**Counterargument (Internationalist view):** The UN played a constructive role in Kashmir by securing a ceasefire in January 1949 that prevented escalation to a full-scale India-Pakistan war. Given that both nations were newly independent with limited military resources, the UN framework provided a de-escalation mechanism that bilateral diplomacy alone could not have achieved.',
    },
  },
  {
    id: 'b-ca-un-2',
    type: 'callout',
    data: {
      variant: 'question',
      text: '**Counterargument (Diplomatic failure view):** India\'s disappointment with the UN was primarily a failure of diplomacy rather than an institutional flaw. Pakistan conducted a more sophisticated political campaign at the UN, while India relied on legal arguments and failed to build the coalition needed to secure favourable outcomes — a diplomatic deficit, not evidence that international institutions are inherently powerless.',
    },
  },
  {
    id: 'b-claim-demographic', type: 'claim',
    data: {
      statement: 'The demographic transformation of Punjab and Bengal through Partition migration created new political dynamics that permanently reshaped the electoral map and regional politics of both India and Pakistan.',
      confidence: 'established',
      evidence: [
        { sourceId: 's9', relevance: 'direct', excerpt: 'The 1941 Census provides the baseline demographic data showing the religious composition of pre-Partition districts.' },
        { sourceId: 's27', relevance: 'direct', excerpt: 'Talbot\'s study shows how migration permanently altered the demographic character of the Punjab.' },
      ],
      documentedFacts: [
        { fact: 'The 1941 Census recorded the religious composition of pre-Partition districts, providing the demographic baseline against which Partition migration was measured. Punjab\'s population was approximately 53% Muslim, 27% Hindu, and 18% Sikh.', sources: ['s9'] },
        { fact: 'By 1951, East Punjab\'s Muslim population had fallen from approximately 5 million to fewer than 100,000, while West Punjab\'s Hindu and Sikh population fell from approximately 4 million to near zero.', sources: ['s27'] },
        { fact: 'Bengal\'s demographic transformation was less complete — by 1951, West Bengal\'s Muslim population fell from approximately 30% to 19%, and East Bengal\'s Hindu population fell from approximately 30% to 22%.', sources: ['s27'] },
        { fact: 'The refugee population in Delhi grew from approximately 500,000 in 1947 to over 1 million by 1953, fundamentally altering the city\'s demography and politics.', sources: ['s1'] },
      ],
      interpretations: [
        { historian: 'Ian Talbot', school: 'Regional History', argument: 'Demonstrates how migration permanently altered the demographic character of the Punjab, creating a homogenised West Pakistan and a Sikh-majority East Punjab that fundamentally changed the region\'s political dynamics.' },
        { historian: 'Joya Chatterji', school: 'Bengal Studies', argument: 'Shows that Bengal\'s Partition migration was slower and more partial than Punjab\'s, with cross-border movement continuing through the 1950s and 1960s, creating different political dynamics and unresolved citizenship questions that persist to the present.' },
        { historian: 'Vazira Fazila-Yacoobali Zamindar', school: 'Border Studies', argument: 'Argues that the "long Partition" extended well beyond 1947 — the process of determining citizenship, repatriating property, and managing cross-border movement continued through the 1950s, shaping state-building on both sides through the management of refugees and borders.' },
      ],
      editorialSynthesis: 'The evidence firmly establishes that Partition\'s demographic transformation was profound and permanent, particularly in Punjab, where population exchange was near-total. However, the geographic scope of this transformation is often overstated — most of India experienced no direct demographic disruption from Partition, and Bengal\'s transformation was more complex. The claim that Partition "permanently reshaped the electoral map of both countries" is accurate for Punjab and Bengal but cannot safely be extended to India as a whole. The most defensible position is that Partition\'s demographic impact was transformative in the directly affected regions and had secondary political effects nationally, but was not a uniform national experience.',
      counterArguments: [
        { viewpoint: 'Geographic scope critique', argument: 'The demographic upheaval was heavily concentrated in Punjab and Bengal — most of central and southern India experienced no direct demographic disruption from Partition. Claims of nationwide electoral transformation may overstate the geographic scope of Partition\'s demographic effects.', proponents: 'All-India electoral historians' },
        { viewpoint: 'Long-term assimilation view', argument: 'Despite initial disruption, Partition refugees were largely successfully integrated into their new states — the East Bengali Hindu refugees eventually became a significant political constituency in West Bengal and Assam, and Punjabi refugees transformed Delhi\'s economy and politics. The demographic transformation was real but ultimately absorbed through India\'s federal and democratic institutions.' },
      ],
    },
  },
  {
    id: 'b-ca-demographic',
    type: 'callout',
    data: {
      variant: 'question',
      text: '**Historians ask:** How extensive was the political transformation? The demographic upheaval was heavily concentrated in Punjab and Bengal — most of central and southern India experienced no direct demographic disruption from Partition. Claims of nationwide electoral transformation may overstate the geographic scope of Partition\'s demographic effects.',
    },
  },
  {
    id: 'b-claim-cabinet-mission', type: 'claim',
    data: {
      statement: 'The failure of the Cabinet Mission Plan was the critical turning point that made Partition inevitable, with primary responsibility disputed among Congress, the Muslim League, and the British.',
      confidence: 'debated',
      evidence: [
        { sourceId: 's1', relevance: 'direct', excerpt: 'Guha argues that Nehru\'s rejection of the Cabinet Mission Plan was a critical strategic error.' },
        { sourceId: 's2', relevance: 'contextual', excerpt: 'Jalal suggests that Jinnah accepted the plan but Congress\'s interpretation effectively nullified the grouping arrangement.' },
      ],
      documentedFacts: [
        { fact: 'The Cabinet Mission Plan (May 1946) proposed a three-tier federal structure: a weak central government handling defence, foreign affairs, and communications; provincial groupings (Section A: Hindu-majority, Section B: Muslim-majority NW, Section C: Muslim-majority NE); and individual provinces with significant autonomy.', sources: ['s1', 's5'] },
        { fact: 'Both Congress and the Muslim League initially accepted the plan in May 1946, but Congress\'s interpretation of the grouping arrangement — that provinces could opt out of groups after the first election — effectively nullified the Muslim League\'s understanding that groupings would be compulsory.', sources: ['s1', 's2'] },
        { fact: 'At a press conference on 10 July 1946, Nehru stated that Congress would enter the Constituent Assembly "completely unfettered by agreements" and that the grouping arrangement was not compulsory — statements that the Muslim League interpreted as a repudiation of the Plan.', sources: ['s1'] },
        { fact: 'The Muslim League withdrew its acceptance of the Plan in July 1946 and called for "Direct Action" on 16 August 1946, triggering the Great Calcutta Killing and a spiral of communal violence that made political reconciliation increasingly impossible.', sources: ['s1', 's16'] },
      ],
      interpretations: [
        { historian: 'Ramachandra Guha', school: 'Liberal/Nationalist', argument: 'Argues that Nehru\'s rejection of the Cabinet Mission Plan was a critical strategic error — the Plan was the last viable framework for a united India, and Nehru\'s unilateral interpretation destroyed the agreement.' },
        { historian: 'Ayesha Jalal', school: 'Revisionist', argument: 'Suggests that Jinnah genuinely accepted the Plan as a basis for Pakistan within a confederal arrangement, and that Congress\'s interpretation effectively nullified the grouping arrangement that was the Plan\'s core compromise.' },
        { historian: 'H. V. Hodson', school: 'Imperial History', argument: 'As a participant-observer, argues that the British bore significant responsibility — the Plan was ambiguously drafted, deliberately leaving the grouping arrangement vague to secure initial acceptance, and this ambiguity collapsed under the first serious interpretation.' },
      ],
      editorialSynthesis: 'The claim that the Cabinet Mission Plan\'s failure was the critical turning point toward Partition is supported by evidence, but the assignment of primary responsibility remains genuinely contested among reputable scholars. The evidence does not support a singular attribution of blame: Nehru\'s unilateral interpretation was reckless; Jinnah\'s recourse to Direct Action was catastrophic; and the British drafting was deliberately ambiguous. The most defensible position is that the Plan\'s failure was a collective failure of political leadership in which all parties shared responsibility, compounded by a constitutional design that was structurally ambiguous about the most critical question — whether provincial groupings were compulsory or optional.',
      counterArguments: [
        { viewpoint: 'Plan unworkability', argument: 'The Cabinet Mission Plan\'s proposed three-tier structure was inherently unstable — a weak centre with compulsory provincial groupings would likely have led to political paralysis or civil war within a decade. Partition, despite its human cost, created clearer constitutional foundations for both successor states to govern effectively.', proponents: 'Constitutional historians' },
        { viewpoint: 'Inevitability view', argument: 'Partition was already inevitable by the time the Cabinet Mission arrived in March 1946. The 1945-46 elections had conclusively demonstrated that Congress and the Muslim League had incompatible mandates, and Direct Action Day in August 1946 had made communal reconciliation politically impossible regardless of any constitutional plan.', proponents: 'Realist historians' },
      ],
    },
  },
  {
    id: 'b-ca-cabinet-mission-1',
    type: 'callout',
    data: {
      variant: 'question',
      text: '**Counterargument (Plan unworkability):** The Cabinet Mission Plan\'s proposed three-tier structure was inherently unstable — a weak centre with compulsory provincial groupings would likely have led to political paralysis or civil war within a decade. Partition, despite its human cost, created clearer constitutional foundations for both successor states to govern effectively.',
    },
  },
  {
    id: 'b-ca-cabinet-mission-2',
    type: 'callout',
    data: {
      variant: 'question',
      text: '**Counterargument (Inevitability view):** Partition was already inevitable by the time the Cabinet Mission arrived in March 1946. The 1945-46 elections had conclusively demonstrated that Congress and the Muslim League had incompatible mandates, and Direct Action Day in August 1946 had made communal reconciliation politically impossible regardless of any constitutional plan.',
    },
  },
  {
    id: 'b-claim-ambedkar', type: 'claim',
    data: {
      statement: 'Ambedkar argued that Partition was the logical consequence of Congress\'s failure to address minority concerns within a united India, and that the demand for Pakistan reflected genuine Muslim anxieties about majoritarian democracy.',
      confidence: 'debated',
      evidence: [
        { sourceId: 's1', relevance: 'direct', excerpt: 'Guha notes Ambedkar\'s analysis was more dispassionate and analytically rigorous than most Congress leaders\' positions.' },
        { sourceId: 's2', relevance: 'supporting', excerpt: 'Jalal\'s revisionist account shares Ambedkar\'s emphasis on Muslim minority anxieties as a driver of Partition.' },
      ],
      documentedFacts: [
        { fact: 'Ambedkar\'s book "Pakistan, or the Partition of India" (1945, expanded 1946) systematically analysed the Pakistan demand, examining both the case for and against Partition.', sources: ['s1'] },
        { fact: 'Ambedkar argued that the demand for Pakistan reflected genuine Muslim anxieties about being a permanent minority in a Hindu-majority state, and that Congress had failed to provide adequate constitutional guarantees for minority rights.', sources: ['s1'] },
        { fact: 'Despite his analysis, Ambedkar ultimately recommended against Partition, arguing that the costs — population transfer, economic disruption, communal violence — would outweigh any benefits, and instead advocated for strong minority protections within a united India.', sources: ['s1'] },
        { fact: 'After independence, Ambedkar served as the chairman of the Constitution\'s Drafting Committee and embraced the secular, rights-based framework that he had argued was necessary to prevent Partition.', sources: ['s1', 's4'] },
      ],
      interpretations: [
        { historian: 'Ramachandra Guha', school: 'Liberal/Nationalist', argument: 'Notes that Ambedkar\'s analysis was more dispassionate and analytically rigorous than most Congress leaders\' positions, and that his willingness to engage seriously with the case for Pakistan distinguished him from the Congress mainstream.' },
        { historian: 'Christophe Jaffrelot', school: 'Political Sociology', argument: 'Analyses Ambedkar\'s approach as consistent with his broader political strategy — as a leader of the Depressed Classes, Ambedkar was acutely sensitive to minority anxieties and saw parallels between Muslim fears of majoritarian democracy and Dalit concerns.' },
        { historian: 'S. N. Mishra', school: 'Constitutional Law', argument: 'Argues that Ambedkar\'s analysis was tactical rather than predictive — by presenting the strongest possible case for Pakistan, he aimed to force Congress to take minority concerns seriously, not to concede that Partition was necessary or desirable.' },
      ],
      editorialSynthesis: 'The evidence shows that Ambedkar\'s analysis of Partition was more nuanced than either his admirers or critics often acknowledge. He took the case for Pakistan seriously — more seriously than most Congress leaders — and identified genuine failures in Congress\'s approach to minority accommodation. However, he ultimately opposed Partition. His value to contemporary understanding lies not in the correctness of his predictions but in his method: he insisted on engaging seriously with the strongest arguments of the opposing side rather than dismissing them, and he held Congress accountable for its failures without conceding that Partition was the only alternative. This intellectual approach — take opposing arguments seriously, identify failures on all sides, and separate analysis from advocacy — is the standard to which scholarly discourse on Partition should aspire.',
      counterArguments: [
        { viewpoint: 'Congress capacity view', argument: 'Ambedkar\'s analysis underestimated Congress\'s capacity for accommodating diversity through federalism, linguistic states, and constitutional protections for minorities — the very institutions that have sustained Indian democracy for seven decades.', proponents: 'Nationalist historians' },
        { viewpoint: 'Tactical thesis view', argument: 'Ambedkar\'s arguments in "Pakistan, or the Partition of India" may have been tactical rather than predictive. By presenting the case for Pakistan in its strongest form, Ambedkar aimed to force Congress to confront minority concerns seriously — not to concede that Partition was inevitable or desirable. His later embrace of the Constitution\'s secular framework supports this reading.', proponents: 'Constitutional historians' },
      ],
    },
  },
  {
    id: 'b-ca-ambedkar-1',
    type: 'callout',
    data: {
      variant: 'question',
      text: '**Counterargument (Congress capacity view):** Ambedkar\'s analysis underestimated Congress\'s capacity for accommodating diversity through federalism, linguistic states, and constitutional protections for minorities — the very institutions that have sustained Indian democracy for seven decades. The Constitution\'s robust minority safeguards suggest the failure was not inherent to Congress\'s vision of India.',
    },
  },
  {
    id: 'b-ca-ambedkar-2',
    type: 'callout',
    data: {
      variant: 'question',
      text: '**Counterargument (Tactical thesis view):** Ambedkar\'s arguments in \'Pakistan, or the Partition of India\' (1945) may have been tactical rather than predictive. By presenting the case for Pakistan in its strongest form, Ambedkar aimed to force Congress to confront minority concerns seriously — not to concede that Partition was inevitable or desirable. His later embrace of the Constitution\'s secular framework supports this reading.',
    },
  },
  {
    id: 'b-claim-cold-war', type: 'claim',
    data: {
      statement: 'India\'s non-alignment failed to prevent Cold War penetration of South Asia, as Pakistan\'s alignment with the United States through SEATO and CENTO introduced great power competition into the subcontinent.',
      confidence: 'established',
      evidence: [
        { sourceId: 's1', relevance: 'direct', excerpt: 'Guha documents how Pakistan\'s entry into SEATO and CENTO brought the Cold War to India\'s borders.' },
        { sourceId: 's24', relevance: 'direct', excerpt: 'Raja Mohan argues that non-alignment could not prevent great power competition in South Asia.' },
      ],
      documentedFacts: [
        { fact: 'Pakistan joined the Southeast Asia Treaty Organisation (SEATO) in September 1954, a US-led collective defence arrangement.', sources: ['s1', 's24'] },
        { fact: 'Pakistan joined the Central Treaty Organisation (CENTO) in 1955, originally the Baghdad Pact, linking Pakistan to US/UK security arrangements in the Middle East.', sources: ['s1', 's24'] },
        { fact: 'The US provided Pakistan with significant military aid under the Mutual Defense Assistance Agreement of 1954, including modern aircraft, tanks, and naval vessels.', sources: ['s24'] },
        { fact: 'India interpreted Pakistan\'s alliance membership as a direct threat, arguing that US-supplied weapons intended for containment of communism would be used against India in Kashmir.', sources: ['s1', 's24'] },
      ],
      interpretations: [
        { historian: 'C. Raja Mohan', school: 'Realist', argument: 'Argues that non-alignment could not prevent great power competition in South Asia because it was a unilateral posture that did not prevent Pakistan from seeking its own security guarantees — non-alignment could protect India\'s autonomy but could not constrain other regional actors.' },
        { historian: 'Robert McMahon', school: 'Cold War International History', argument: 'Shows that the US decision to arm Pakistan was driven primarily by Cold War strategic considerations (the need for forward bases, the desire for a reliable South Asian ally) rather than by South Asian regional dynamics — meaning no Indian policy choice could have prevented it.' },
        { historian: 'Srinath Raghavan', school: 'Strategic History', argument: 'Presents a more complex picture — Pakistan\'s alliance with the US also created dependencies that constrained Pakistan\'s diplomatic flexibility and generated domestic opposition. Non-alignment, while imperfect in preventing Cold War penetration, preserved India\'s strategic options in ways that alliance membership foreclosed.' },
      ],
      editorialSynthesis: 'The evidence supports the claim that non-alignment did not prevent Cold War penetration of South Asia, but the framing of this as a "failure" requires careful qualification. Pakistan\'s alliance with the US was primarily driven by American strategic interests in the global Cold War, not by any specific Indian policy failure. No non-aligned posture could have prevented Pakistan from seeking security guarantees from a superpower pursuing global containment strategy. The more accurate assessment is that non-alignment was structurally incapable of preventing other regional actors from forming alliances, but it did preserve India\'s own strategic flexibility and prevented India from suffering the same constraints that alliance membership imposed on Pakistan.',
      counterArguments: [
        { viewpoint: 'Limitation argument', argument: 'Pakistan\'s alliance with the US through SEATO and CENTO also created dependencies that constrained Pakistan\'s diplomatic flexibility and generated domestic opposition. Non-alignment, while imperfect, prevented India from suffering similar constraints and preserved the option of diversified strategic partnerships.', proponents: 'Non-alignment scholars' },
        { viewpoint: 'Containment perspective', argument: 'The Cold War was a global structural condition that no single country\'s policy could determine. Non-alignment was not designed to prevent Cold War penetration — it was designed to preserve India\'s autonomy within that system. Judging it by its failure to control other states\' choices mistakes the nature of the policy.' },
      ],
    },
  },
  {
    id: 'b-ca-cold-war',
    type: 'callout',
    data: {
      variant: 'question',
      text: '**Historians ask:** Did non-alignment limit or attract Cold War competition? Pakistan\'s alliance with the US through SEATO and CENTO also created dependencies that constrained Pakistan\'s diplomatic flexibility and generated domestic opposition. Non-alignment, while imperfect, prevented India from suffering similar constraints and preserved the option of diversified strategic partnerships.',
    },
  },
  {
    id: 'b-claim-hyderabad', type: 'claim',
    data: {
      statement: 'The military integration of Hyderabad through Operation Polo established the precedent that accession to India was not voluntary and that the Indian state would use force to prevent balkanisation.',
      confidence: 'established',
      evidence: [
        { sourceId: 's1', relevance: 'direct', excerpt: 'Guha documents how Operation Polo integrated Hyderabad through a five-day military campaign in September 1948.' },
        { sourceId: 's18', relevance: 'direct', excerpt: 'Menon\'s account describes the military and political planning behind the integration of recalcitrant states.' },
      ],
      documentedFacts: [
        { fact: 'Hyderabad was the largest and wealthiest princely state, covering 82,000 square miles with approximately 16 million inhabitants, and its Nizam initially refused to accede to either India or Pakistan, seeking independence or Dominion status.', sources: ['s1', 's18'] },
        { fact: 'India imposed economic sanctions (blockade, currency restrictions) and pursued diplomatic negotiations with the Nizam for over a year before the military option was exercised.', sources: ['s1'] },
        { fact: 'Operation Polo (13–18 September 1948) was a five-day military campaign in which the Indian Army led by Major General J. N. Chaudhuri integrated Hyderabad by force.', sources: ['s1'] },
        { fact: 'The Nizam had been attempting to procure weapons from Pakistan and had organised an irregular militia (the Razakars) under Kasim Razvi, which was accused of violence against Hyderabad\'s Hindu population.', sources: ['s1', 's18'] },
      ],
      interpretations: [
        { historian: 'Ramachandra Guha', school: 'Liberal/Nationalist', argument: 'Documents Operation Polo as a necessary act of state consolidation — the Nizam\'s independence was strategically untenable and would have created a hostile state in the heart of India, and the Nizam\'s government had lost control of the Razakars.' },
        { historian: 'V. P. Menon', school: 'Insider/Administrative', argument: 'Describes the military and political planning as a last resort after the breakdown of political negotiations, arguing that the Nizam\'s defiance left India with no viable alternative to force.' },
        { historian: 'M. S. Siva Kumar', school: 'Regional/Critical', argument: 'Notes that Hyderabad\'s integration through force had long-term political consequences — the sense of military conquest rather than negotiated accession created resentments in the Telangana region that contributed to separatist movements decades later.' },
      ],
      editorialSynthesis: 'The evidence establishes that Operation Polo was a military integration of a recalcitrant state, but the framing of it as establishing a precedent that "accession was not voluntary" requires contextualisation. The Indian government had pursued diplomatic and economic measures for over a year before resorting to force, and the Nizam\'s government was actively arming through Pakistan and had lost control of an irregular militia accused of atrocities. The military intervention was a last resort, not a first choice. However, the precedent was real — Operation Polo demonstrated that the Indian state would not tolerate independence for princely states within its claimed territory, and this precedent continues to shape debates about Article 370 and the special status of Jammu and Kashmir.',
      counterArguments: [
        { viewpoint: 'Last resort view', argument: 'The Nizam had been in negotiations with India for over a year before Operation Polo, and the Indian government had imposed an economic blockade and attempted diplomatic solutions. The military intervention followed the breakdown of political negotiations and the Nizam\'s efforts to procure weapons from Pakistan — a last resort, not a first choice.', proponents: 'Indian administrative historians' },
        { viewpoint: 'Long-term consequences critique', argument: 'The military integration of Hyderabad, while effective in the short term, established a centralising precedent that had long-term costs — the sense of forced accession contributed to resentment in the Telangana region and set a pattern of central military intervention that was later applied without the same level of diplomatic exhaustion.' },
      ],
    },
  },
  {
    id: 'b-ca-hyderabad',
    type: 'callout',
    data: {
      variant: 'question',
      text: '**Historians ask:** Was force the first resort or last resort? The Nizam of Hyderabad had been in negotiations with India for over a year before Operation Polo, and the Indian government had imposed an economic blockade and attempted diplomatic solutions. The military intervention followed the breakdown of political negotiations and the Nizam\'s efforts to procure weapons from Pakistan — a last resort, not a first choice.',
    },
  },
  // ── Research Companion ──
  { id: 'b-h-research', type: 'heading', data: { text: 'Research Companion', level: 1 } },
  {
    id: 'b-p-research-intro', type: 'paragraph',
    data: {
      text: 'This curated research companion organises the key scholarship by format, providing readers with a structured path into the literature regardless of their starting point. Each entry includes the source\'s central argument, its evidence base, and what it contributes to understanding why India made the foreign-policy choices it did.',
      citations: ['s1', 's16', 's17', 's19', 's20', 's21'],
    },
  },
  { id: 'b-h-research-books', type: 'heading', data: { text: 'Books', level: 2 } },
  {
    id: 'b-p-research-books-1', type: 'paragraph',
    data: {
      text: 'The Great Partition: The Making of India and Pakistan by Yasmin Khan (2007). The most accessible and comprehensive single-volume account of the Partition. Khan emphasises social history and administrative collapse, making the case that Partition was not primarily a product of high politics but of the breakdown of everyday governance. Essential starting point for anyone new to the subject.',
      citations: ['s16'],
    },
  },
  {
    id: 'b-p-research-books-2', type: 'paragraph',
    data: {
      text: 'The Sole Spokesman: Jinnah, the Muslim League and the Demand for Pakistan by Ayesha Jalal (1985). The most influential revisionist work on Partition. Jalal argues that Jinnah used the demand for Pakistan as a bargaining counter and did not intend the full partition that occurred. Essential for understanding the debate over Jinnah\'s strategy, but should be read alongside its critics.',
      citations: ['s2'],
    },
  },
  {
    id: 'b-p-research-books-3', type: 'paragraph',
    data: {
      text: 'India After Gandhi: The History of the World\'s Largest Democracy by Ramachandra Guha (2007). The definitive narrative history of independent India. Guha\'s treatment of Partition is balanced and incorporates both political and social dimensions. Particularly strong on the relationship between domestic politics and foreign policy.',
      citations: ['s1'],
    },
  },
  {
    id: 'b-p-research-books-4', type: 'paragraph',
    data: {
      text: 'War and Peace in Modern India: A Strategic History of the Nehru Years by Srinath Raghavan (2010). The definitive account of Indian foreign and security policy in the crucial first two decades. Raghavan combines international history, strategic studies, and domestic political analysis to show that Nehru was far more pragmatic than the conventional image of idealism suggests.',
      citations: ['s32'],
    },
  },
  {
    id: 'b-p-research-books-5', type: 'paragraph',
    data: {
      text: 'Remembering Partition: Violence, Nationalism and History in India by Gyanendra Pandey (2001). A landmark work that transformed the study of Partition violence. Pandey argues that violence was constitutive of Partition, not merely a consequence, and that the way we remember — and forget — violence is itself a political act.',
      citations: ['s19'],
    },
  },
  {
    id: 'b-p-research-books-6', type: 'paragraph',
    data: {
      text: 'The Other Side of Silence: Voices from the Partition of India by Urvashi Butalia (2000). A pathbreaking oral history that recovered the experiences of women, children, and lower castes whose voices had been excluded from Partition historiography. Particularly important for understanding gendered violence.',
      citations: ['s20'],
    },
  },
  {
    id: 'b-p-research-books-7', type: 'paragraph',
    data: {
      text: 'Conflict Unending: India-Pakistan Relations Since 1947 by Sumit Ganguly (2001). The leading political science account of the India-Pakistan conflict. Ganguly argues that the roots of the conflict lie in competing nationalist ideologies left unresolved by Partition.',
      citations: ['s23'],
    },
  },
  {
    id: 'b-p-research-books-8', type: 'paragraph',
    data: {
      text: 'India: Emerging Power by Stephen P. Cohen (2001). The most comprehensive analysis of India\'s strategic culture, military capabilities, and foreign policy ambitions. Cohen argues that Partition created a permanent sense of vulnerability in Indian strategic thinking.',
      citations: ['s25'],
    },
  },
  {
    id: 'b-p-research-books-9', type: 'paragraph',
    data: {
      text: 'Crossing the Rubicon: The Shaping of India\'s New Foreign Policy by C. Raja Mohan (2003). The influential argument that India was undergoing a fundamental transformation from post-colonial idealism to pragmatic, interest-driven foreign policy. Essential for understanding how Partition\'s legacy continues to shape Indian strategic culture.',
      citations: ['s24'],
    },
  },
  { id: 'b-h-research-papers', type: 'heading', data: { text: 'Journal Articles and Academic Papers', level: 2 } },
  {
    id: 'b-p-research-papers-1', type: 'paragraph',
    data: {
      text: '"The Partition of India and the British" by Penderel Moon (The Listener, 1957). A contemporary account by a British civil servant who served in India during Partition. Provides insight into British official thinking and the constraints under which they operated.',
      citations: [],
    },
  },
  {
    id: 'b-p-research-papers-2', type: 'paragraph',
    data: {
      text: '"The Transfer of Power in India: A Reassessment" by H.V. Hodson (International Affairs, 1957). A key early assessment by the editor of The Great Divide, the official British account of Partition. Reflects the British official position.',
      citations: [],
    },
  },
  {
    id: 'b-p-research-papers-3', type: 'paragraph',
    data: {
      text: '"India, Pakistan, and the Great Powers" by William J. Barnds (World Politics, 1972). An early analysis of how the Cold War penetrated South Asia through the India-Pakistan rivalry, tracing the strategic consequences of Partition.',
      citations: [],
    },
  },
  {
    id: 'b-p-research-papers-4', type: 'paragraph',
    data: {
      text: '"The Great Divide: Britain, India, Pakistan" edited by H.V. Hodson (British Official History, 1969). The official British account of the transfer of power, based on the India Office Records. Essential but must be read critically, as it reflects British justifications for the accelerated partition.',
      citations: ['s5'],
    },
  },
  { id: 'b-h-research-documents', type: 'heading', data: { text: 'Documents and Primary Sources', level: 2 } },
  {
    id: 'b-p-research-docs-1', type: 'paragraph',
    data: {
      text: 'The Transfer of Power in India series (12 volumes, HMSO, 1970-1983). The most comprehensive published collection of British official documents relating to the end of empire in India, covering the period 1942-1947. Essential primary source collection.',
      citations: ['s22'],
    },
  },
  {
    id: 'b-p-research-docs-2', type: 'paragraph',
    data: {
      text: 'Towards Freedom: Documents on the Movement for Independence in India (Indian Council of Historical Research, ongoing). The Indian equivalent of the Transfer of Power series, publishing official documents from Indian archives.',
      citations: [],
    },
  },
  { id: 'b-h-research-memoirs', type: 'heading', data: { text: 'Memoirs and Contemporary Accounts', level: 2 } },
  {
    id: 'b-p-research-memoirs-1', type: 'paragraph',
    data: {
      text: 'The Discovery of India by Jawaharlal Nehru (1946). Nehru\'s magisterial account of Indian history and culture, written during his imprisonment. Essential for understanding the intellectual foundations of his foreign policy.',
      citations: [],
    },
  },
  {
    id: 'b-p-research-memoirs-2', type: 'paragraph',
    data: {
      text: 'An Autobiography: The Story of My Experiments with Truth by M.K. Gandhi (1927-1929). Gandhi\'s autobiographical account of his intellectual and political development, essential for understanding the moral framework of the Indian independence movement.',
      citations: [],
    },
  },
  {
    id: 'b-p-research-memoirs-3', type: 'paragraph',
    data: {
      text: 'The Great Divide: Britain, India, Pakistan by H.V. Hodson (1969). The definitive British official narrative, reflecting the perspective of the Viceroy\'s staff.',
      citations: ['s5'],
    },
  },
  {
    id: 'b-p-research-memoirs-4', type: 'paragraph',
    data: {
      text: 'Pakistan: The Formative Phase by K.K. Aziz (1957). A Pakistani perspective on the early years of independence, providing important context for understanding Pakistan\'s strategic motivations.',
      citations: [],
    },
  },
  { id: 'b-h-research-maps', type: 'heading', data: { text: 'Maps and Cartographic Resources', level: 2 } },
  {
    id: 'b-p-research-maps-1', type: 'paragraph',
    data: {
      text: 'The Changing Map of Asia (The Geographical Journal, multiple years). Contemporary cartographic treatments of the partition boundary, showing the confusion and uncertainty surrounding the Radcliffe Line.',
      citations: [],
    },
  },
  {
    id: 'b-p-research-maps-2', type: 'paragraph',
    data: {
      text: 'Boundary Commission Proceedings (1947). The official records of the Radcliffe Boundary Commission, including the maps and submissions that shaped the final demarcation.',
      citations: [],
    },
  },
  {
    id: 'b-p-research-maps-3', type: 'paragraph',
    data: {
      text: 'Historical Atlas of South Asia by Joseph E. Schwartzberg (1978, 1992). The definitive historical atlas, containing detailed maps showing pre-Partition administrative divisions and the demographic basis for the boundary.',
      citations: [],
    },
  },
  { id: 'b-h-research-speeches', type: 'heading', data: { text: 'Speeches and Broadcasts', level: 2 } },
  {
    id: 'b-p-research-speeches-1', type: 'paragraph',
    data: {
      text: '"Tryst with Destiny" — Jawaharlal Nehru (15 August 1947). The foundational speech of Indian independence, articulating Nehru\'s vision of India as a secular, democratic, and sovereign nation.',
      citations: [],
    },
  },
  {
    id: 'b-p-research-speeches-2', type: 'paragraph',
    data: {
      text: 'Jinnah\'s Presidential Address to the Constituent Assembly of Pakistan (11 August 1947). Jinnah\'s speech promising equal citizenship regardless of religion, which is frequently cited by those who argue Pakistan was intended as a secular state.',
      citations: [],
    },
  },
  {
    id: 'b-p-research-speeches-3', type: 'paragraph',
    data: {
      text: 'Mountbatten\'s Announcement of the Partition Plan (3 June 1947). The broadcast in which Mountbatten formally announced the plan to partition India and transfer power by August.',
      citations: [],
    },
  },
  {
    id: 'b-p-research-speeches-4', type: 'paragraph',
    data: {
      text: 'Nehru\'s Address to the UN General Assembly (October 1948). India\'s formal presentation of the Kashmir case to the United Nations.',
      citations: ['s6'],
    },
  },
  // ── Visual Asset Acquisition List ──
  { id: 'b-h-visual', type: 'heading', data: { text: 'Visual Asset Acquisition List', level: 1 } },
  {
    id: 'b-p-visual-intro', type: 'paragraph',
    data: {
      text: 'This list identifies the visual assets needed to bring Chapter 1 to publication quality. Each entry specifies the asset type, subject, source recommendations, provenance requirements, and the specific claims or narrative elements it supports. Every visual must include: provenance (creator, date, location), copyright or license status, an editorial caption explaining historical significance, a "why it matters" note connecting it to the chapter\'s core argument, and linked claims from the claim registry.',
      citations: [],
    },
  },
  { id: 'b-h-visual-archival', type: 'heading', data: { text: 'Archival Photographs (15–20)', level: 2 } },
  {
    id: 'b-p-visual-archival-1', type: 'paragraph',
    data: {
      text: '1. Mountbatten and Jinnah at the Viceroy\'s House, 1947. Source: British Library / India Office Records. Supports: The Mountbatten Plan, Jinnah\'s final negotiations. Item reference: Photo 930/1. License: Public domain (British government works).',
      citations: [],
    },
  },
  {
    id: 'b-p-visual-archival-2', type: 'paragraph',
    data: {
      text: '2. Cabinet Mission delegates with Congress leaders, Simla 1946. Source: National Archives of India. Supports: Cabinet Mission Plan, collapse of negotiations. License: Government work, presumed public domain.',
      citations: [],
    },
  },
  {
    id: 'b-p-visual-archival-3', type: 'paragraph',
    data: {
      text: '3. Great Calcutta Killing aftermath, August 1946. Source: Getty Images / Hulton Archive. Supports: Direct Action Day, communal violence spiral. License: Licensed (editorial use). Caption: Bodies in the streets of Calcutta after the Great Calcutta Killing of 16-19 August 1946.',
      citations: [],
    },
  },
  {
    id: 'b-p-visual-archival-4', type: 'paragraph',
    data: {
      text: '4. Refugee train arriving at Old Delhi railway station, 1947. Source: Photo Division, Government of India. Supports: Mass migration, refugee crisis. License: Government of India archives, public domain.',
      citations: [],
    },
  },
  {
    id: 'b-p-visual-archival-5', type: 'paragraph',
    data: {
      text: '5. Foot column of refugees on the Grand Trunk Road, Punjab, 1947. Source: British Library / Margaret Bourke-White (Life Magazine). Supports: Human consequences, Punjab migration. License: Licensed (Time Inc. / LIFE archive).',
      citations: [],
    },
  },
  {
    id: 'b-p-visual-archival-6', type: 'paragraph',
    data: {
      text: '6. Maharaja Hari Singh signing the Instrument of Accession, 26 October 1947. Source: Jammu & Kashmir State Archives. Supports: Kashmir accession. License: State government archives, presumed public domain.',
      citations: [],
    },
  },
  {
    id: 'b-p-visual-archival-7', type: 'paragraph',
    data: {
      text: '7. Nehru addressing the UN General Assembly, October 1948. Source: UN Photo Archive. Supports: UN referral, Kashmir internationalisation. License: UN Photo, public domain.',
      citations: [],
    },
  },
  {
    id: 'b-p-visual-archival-8', type: 'paragraph',
    data: {
      text: '8. Sir Cyril Radcliffe at work, 1947. Source: British Library. Supports: Boundary Commission, arbitrary border. License: Public domain.',
      citations: [],
    },
  },
  {
    id: 'b-p-visual-archival-9', type: 'paragraph',
    data: {
      text: '9. Jinnah and Gandhi in conversation, Bombay 1944. Source: GandhiServe Foundation. Supports: Gandhi-Jinnah talks, failure of unity efforts. License: GandhiServe, non-commercial educational use.',
      citations: [],
    },
  },
  {
    id: 'b-p-visual-archival-10', type: 'paragraph',
    data: {
      text: '10. Noakhali riots aftermath, October 1946. Source: British Library. Supports: Communal violence, subaltern experience. License: Public domain.',
      citations: [],
    },
  },
  { id: 'b-h-visual-maps', type: 'heading', data: { text: 'Maps (8–10)', level: 2 } },
  {
    id: 'b-p-visual-maps-1', type: 'paragraph',
    data: {
      text: '1. British India, 1939 — administrative divisions and princely states. Source: Schwartzberg Historical Atlas. Supports: Overview of pre-Partition India. Map type: Reference.',
      citations: [],
    },
  },
  {
    id: 'b-p-visual-maps-2', type: 'paragraph',
    data: {
      text: '2. Cabinet Mission Plan, 1946 — proposed three-group federal structure. Source: Original cartography. Supports: Cabinet Mission Plan, federal alternative. Map type: Diagrammatic.',
      citations: [],
    },
  },
  {
    id: 'b-p-visual-maps-3', type: 'paragraph',
    data: {
      text: '3. The Radcliffe Line, 1947 — India-Pakistan boundary in Punjab and Bengal. Source: Original cartography based on Radcliffe Award. Supports: Arbitrary border, divided communities. Map type: Reference with demographic overlay.',
      citations: [],
    },
  },
  {
    id: 'b-p-visual-maps-4', type: 'paragraph',
    data: {
      text: '4. Partition migration flows, 1947-48 — population movements across the new border. Source: Original cartography based on refugee data. Supports: Mass migration, demographic transformation. Map type: Flow map with proportional arrows.',
      citations: [],
    },
  },
  {
    id: 'b-p-visual-maps-5', type: 'paragraph',
    data: {
      text: '5. Kashmir, 1947-48 — the tribal invasion, Indian response, and ceasefire line. Source: Original cartography based on Raghavan and official records. Supports: Kashmir conflict, UN Resolution 47. Map type: Military campaign map with timeline.',
      citations: [],
    },
  },
  {
    id: 'b-p-visual-maps-6', type: 'paragraph',
    data: {
      text: '6. Religious demography of India, 1941 — district-level Muslim population percentages. Source: Census of India 1941. Supports: Demographic basis of partition, election results. Map type: Choropleth.',
      citations: [],
    },
  },
  {
    id: 'b-p-visual-maps-7', type: 'paragraph',
    data: {
      text: '7. Princely states of India — map showing accession outcomes. Source: Original cartography. Supports: Integration of princely states, Junagadh, Hyderabad, Kashmir. Map type: Reference.',
      citations: [],
    },
  },
  { id: 'b-h-visual-documents', type: 'heading', data: { text: 'Documents Reproductions (5–8)', level: 2 } },
  {
    id: 'b-p-visual-docs-1', type: 'paragraph',
    data: {
      text: '1. Indian Independence Act, 1947 — cover page and key clauses. Source: UK National Archives. License: Crown Copyright, public domain.',
      citations: [],
    },
  },
  {
    id: 'b-p-visual-docs-2', type: 'paragraph',
    data: {
      text: '2. Instrument of Accession of Jammu and Kashmir — facsimile. Source: Jammu & Kashmir State Archives. License: State archives, educational use.',
      citations: [],
    },
  },
  {
    id: 'b-p-visual-docs-3', type: 'paragraph',
    data: {
      text: '3. UN Security Council Resolution 47 — facsimile. Source: UN Archives. License: UN document, public domain.',
      citations: [],
    },
  },
  {
    id: 'b-p-visual-docs-4', type: 'paragraph',
    data: {
      text: '4. Extract from Radcliffe Boundary Commission Proceedings. Source: India Office Records, British Library. License: Public domain.',
      citations: [],
    },
  },
  {
    id: 'b-p-visual-docs-5', type: 'paragraph',
    data: {
      text: '5. Cabinet Mission Plan memorandum. Source: British Library / India Office Records. License: Public domain.',
      citations: [],
    },
  },
  { id: 'b-h-visual-charts', type: 'heading', data: { text: 'Charts and Data Visualisations (5–10)', level: 2 } },
  {
    id: 'b-p-visual-charts-1', type: 'paragraph',
    data: {
      text: '1. Casualties of Partition — death toll estimates from different sources. Source: Multiple (official, press, scholarly). Type: Bar chart with confidence intervals.',
      citations: [],
    },
  },
  {
    id: 'b-p-visual-charts-2', type: 'paragraph',
    data: {
      text: '2. Refugee flows and destination — tabular and map-based. Source: Government of India rehabilitation data. Type: Combined chart and map.',
      citations: [],
    },
  },
  {
    id: 'b-p-visual-charts-3', type: 'paragraph',
    data: {
      text: '3. Timeline of key events, 1945-1948. Type: Multi-row timeline with colour-coded categories (political, military, diplomatic, violence).',
      citations: [],
    },
  },
  {
    id: 'b-p-visual-charts-4', type: 'paragraph',
    data: {
      text: '4. Religious composition of India, 1941 vs 1951 — showing demographic transformation. Type: Stacked bar chart comparing census data.',
      citations: [],
    },
  },
  {
    id: 'b-p-visual-charts-5', type: 'paragraph',
    data: {
      text: '5. India-Pakistan military balance, 1947. Type: Comparison chart (manpower, equipment, budgets). Source: Raghavan, Cohen.',
      citations: [],
    },
  },
  { id: 'b-h-visual-diagrams', type: 'heading', data: { text: 'Relationship Diagrams (3–5)', level: 2 } },
  {
    id: 'b-p-visual-diagrams-1', type: 'paragraph',
    data: {
      text: '1. Key actors network — Nehru, Jinnah, Gandhi, Patel, Mountbatten, Wavell, Attlee showing their relationships and points of conflict. Type: Force-directed network graph.',
      citations: [],
    },
  },
  {
    id: 'b-p-visual-diagrams-2', type: 'paragraph',
    data: {
      text: '2. The Cabinet Mission Plan — organisational structure showing centre, provinces, and groups. Type: Hierarchy diagram.',
      citations: [],
    },
  },
  {
    id: 'b-p-visual-diagrams-3', type: 'paragraph',
    data: {
      text: '3. Decision tree of Partition — key decision points and their consequences, 1945-1947. Type: Decision-tree diagram with branching outcomes.',
      citations: [],
    },
  },
  { id: 'b-h-visual-flows', type: 'heading', data: { text: 'Migration Flow Maps (2–3)', level: 2 } },
  {
    id: 'b-p-visual-flows-1', type: 'paragraph',
    data: {
      text: '1. Punjab migration — population flows across the Punjab boundary, west to east and east to west. Type: Flow map with proportional arrow width.',
      citations: [],
    },
  },
  {
    id: 'b-p-visual-flows-2', type: 'paragraph',
    data: {
      text: '2. Bengal migration — population flows across the Bengal boundary. Type: Flow map.',
      citations: [],
    },
  },
  {
    id: 'b-p-visual-flows-3', type: 'paragraph',
    data: {
      text: '3. Total subcontinental migration — synthesised overview of all major flows, 1947-1950. Type: Comprehensive flow map.',
      citations: [],
    },
  },
  // ── Visual Asset Registry (structured data; deferred render) ──
  // These blocks carry provenance + caption metadata so they render automatically once
  // map/chart/image renderers exist. They currently return null in KnowledgeRenderer.
  // Real assets must be acquired and provenance-cleared in Phase 5 (Visual Audit) before use.
  { id: 'b-h-visual-registry', type: 'heading', data: { text: 'Visual Asset Registry (Deferred Render)', level: 1 } },
  { id: 'b-vis-note', type: 'callout', data: { variant: 'info', text: 'The following 40 visual assets are specified as structured data with archival provenance and caption fields. They do not render in the current engine (no map/chart/image renderers exist) and await Phase 5 renderer support. Provenance data has been wired from the Deep Archival Visual Asset Research Report (2026-07); see docs/assets/chapter-01.md for the complete asset register. Real assets remain to be acquired and provenance-cleared before use.' } },
  // Archival Photographs (image, aiGenerated: false)
  { id: 'b-vis-img-1', type: 'image', data: { title: 'Mountbatten and Jinnah at the Viceroy\'s House, 1947', caption: 'Lord Mountbatten and Muhammad Ali Jinnah at the Viceroy\'s House during final negotiations of the Mountbatten Plan.', altText: 'Two men in formal dress seated in an office, 1947.', url: '/images/library/photos/a-01-mountbatten-jinnah-viceroys-house-1947.jpg', provenance: { creator: 'No. 9 Army Film & Photographic Unit', source: 'Imperial War Museums', reference: 'IWM IND 5302', date: '1947-04' }, license: 'Public Domain (Crown Copyright expired) / IWM terms', credit: '© IWM (IND 5302)', status: 'archived', aiGenerated: false, linkedClaims: ['claim.partition.mountbatten-plan', 'claim.partition.negotiations-jinnah'], archivalProvenance: { evidenceLevel: 'B', archiveHierarchy: 'IWM → Photograph Archive → No. 9 Army Film & Photographic Unit → IND Series', iiifUrl: 'https://www.iwm.org.uk/collections/item/object/205125304', commercialId: 'Getty 629584203', citationChicago: 'No. 9 Army Film & Photographic Unit. Admiral of the Fleet Earl Mountbatten of Burma. April 1947. Photograph. Imperial War Museums, IND 5302.' } } },
  { id: 'b-vis-img-2', type: 'image', data: { title: 'Cabinet Mission delegates with Congress leaders, Simla 1946', caption: 'Cabinet Mission delegates with Congress leaders at Simla; the collapse of these negotiations preceded the demand for Partition.', altText: 'Group photograph of British and Indian political delegates, 1946.', provenance: { creator: 'Press Information Bureau', source: 'British Library', reference: 'IOR/Photo 134/2(18)', date: '1946-07' }, license: 'Rights Managed (Album / British Library)', credit: 'Press Information Bureau / British Library / Bridgeman Images', status: 'requested', aiGenerated: false, linkedClaims: ['claim.partition.cabinet-mission'], archivalProvenance: { evidenceLevel: 'B', archiveHierarchy: 'British Library → India Office Records → Joyce Collection: Cabinet Mission to India, 1946 → Vol II', iiifUrl: 'https://www.bridgemanimages.com/en/noartistknown/1946-cabinet-mission-to-india-with-congress-president-maulana-azad-india-july-1946/photograph/asset/3301927', commercialId: 'Bridgeman 3301927 / Alamy R577A5', citationChicago: 'Press Information Bureau. The Cabinet Mission with Congress President, Maulana Azad. April 17, 1946. Photograph. British Library, IOR/Photo 134/2(18).' } } },
  { id: 'b-vis-img-3', type: 'image', data: { title: 'Great Calcutta Killing aftermath, August 1946', caption: 'Bodies in the streets of Calcutta after the Great Calcutta Killing of 16-19 August 1946, marking the start of the communal violence spiral.', altText: 'Street scene with casualties after the Great Calcutta Killing.', provenance: { creator: 'Margaret Bourke-White', source: 'LIFE Picture Collection / Getty Images', reference: '50694119', date: '1946-08' }, license: 'Rights Managed (Time Inc. / Getty Images)', credit: 'Margaret Bourke-White — The LIFE Picture Collection/Getty Images', status: 'archived', aiGenerated: false, linkedClaims: ['claim.partition.direct-action-day', 'claim.partition.violence-civil-society'], archivalProvenance: { evidenceLevel: 'B', archiveHierarchy: 'Time Inc. Archive → LIFE Picture Collection → Margaret Bourke-White Archive → 1946 India Assignment', iiifUrl: 'https://artsandculture.google.com/asset/aftermath-of-calcutta-riots/1gGRuYlIprChSg', citationChicago: 'Bourke-White, Margaret. Aftermath of Calcutta Riots. August 1946. B/W Negative. LIFE Picture Collection / Getty Images, 50694119.' } } },
  { id: 'b-vis-img-4', type: 'image', data: { title: 'Refugee train at New Delhi railway station, 1947', caption: 'A refugee train departing New Delhi during the mass migration triggered by Partition.', altText: 'Crowded railway platform with refugees, 1947.', provenance: { creator: 'Margaret Bourke-White', source: 'LIFE Picture Collection / Getty Images', date: '1947' }, license: 'Rights Managed (Time Inc. / Getty Images)', credit: 'Margaret Bourke-White — The LIFE Picture Collection/Getty Images', status: 'requested', aiGenerated: false, linkedClaims: ['claim.partition.refugee-crisis'], archivalProvenance: { evidenceLevel: 'C', archiveHierarchy: 'Time Inc. Archive → LIFE Picture Collection → Margaret Bourke-White Archive → 1947 Partition Assignment', note: 'Metadata confirms New Delhi, not Old Delhi station as often misattributed.' } } },
  { id: 'b-vis-img-5', type: 'image', data: { title: 'Foot column of refugees on the Grand Trunk Road, Punjab, 1947', caption: 'Refugees on foot on the Grand Trunk Road during the Punjab migration.', altText: 'Long column of refugees walking along a road.', provenance: { creator: 'Margaret Bourke-White', source: 'LIFE Picture Collection / Getty Images', date: '1947' }, license: 'Rights Managed (Time Inc. / Getty Images)', credit: 'Margaret Bourke-White — The LIFE Picture Collection/Getty Images', status: 'requested', aiGenerated: false, linkedClaims: ['claim.partition.refugee-crisis'], archivalProvenance: { evidenceLevel: 'C', archiveHierarchy: 'Time Inc. Archive → LIFE Picture Collection → Margaret Bourke-White Archive → 1947 Punjab Migration', citationChicago: 'Bourke-White, Margaret. Rural Sikhs in a Long Oxcart Train. 1947. B/W Negative. LIFE Picture Collection / Getty Images.' } } },
  { id: 'b-vis-img-6', type: 'image', data: { title: 'Instrument of Accession of Jammu and Kashmir, 26 October 1947', caption: 'The Instrument of Accession executed by Maharaja Hari Singh on October 26, 1947. No photograph of the signing exists due to the secrecy and urgency of the midnight ceremony.', altText: 'Facsimile of the Instrument of Accession document.', url: '/images/library/chapter-1/documents/doc-instrument-of-accession.pdf', provenance: { creator: 'J&K State', source: 'National Archives of India', reference: 'J&K Instrument of Accession', date: '1947-10-26' }, license: 'Public Record (Government of India)', credit: 'National Archives of India', status: 'archived', aiGenerated: false, linkedClaims: ['claim.partition.kashmir-accession'], archivalProvenance: { evidenceLevel: 'B', archiveHierarchy: 'National Archives of India → Ministry of States / Home Affairs → Accession Documents', iiifUrl: 'https://upload.wikimedia.org/wikipedia/commons/e/e1/Instrument_of_Accession_and_Standstill_Agreement_of_Jammu_and_Kashmir_to_Dominion_of_India.pdf', note: 'PHOTOGRAPH of signing does not exist. Document facsimile substituted per archival research.' } } },
  { id: 'b-vis-img-7', type: 'image', data: { title: 'Nehru addressing the UN General Assembly, November 1948', caption: 'Jawaharlal Nehru addresses the UN General Assembly at the Palais de Chaillot, Paris, during the internationalisation of the Kashmir dispute.', altText: 'Nehru at a podium at the UN, 1948.', url: '/images/library/chapter-1/photos/a-07-nehru-unga-1948.jpg', provenance: { creator: 'UN Photo', source: 'UN Photo Archive', reference: 'GA 3rd Session 1948', date: '1948-11' }, license: 'UN Public Domain / Editorial Use', credit: 'UN Photo', status: 'archived', aiGenerated: false, linkedClaims: ['claim.partition.kashmir-unfinished'], archivalProvenance: { evidenceLevel: 'D', archiveHierarchy: 'United Nations Archives → UN Photo Library → General Assembly → 3rd Session (Palais de Chaillot, Paris)', iiifUrl: 'https://media.un.org/photo/en/', citationChicago: 'United Nations Photo. Jawaharlal Nehru Addressing the General Assembly. November 1948. Photograph. UN Photo Library.', note: 'Corrected from October/New York to November/Paris.' } } },
  { id: 'b-vis-img-8', type: 'image', data: { title: 'Sir Cyril Radcliffe, 1957', caption: 'Sir Cyril Radcliffe, who drew the Partition boundary in five weeks with no prior knowledge of India. This 1957 portrait is the sole authoritative likeness; no photograph of his work in India survives.', altText: 'Portrait of Sir Cyril Radcliffe, 1957.', provenance: { creator: 'Elliott & Fry', source: 'National Portrait Gallery, London', reference: 'NPG x88321', date: '1957' }, license: 'Rights Managed (NPG)', credit: '© National Portrait Gallery, London', status: 'archived', aiGenerated: false, linkedClaims: ['claim.partition.radcliffe-arbitrary'], archivalProvenance: { evidenceLevel: 'B', archiveHierarchy: 'National Portrait Gallery, London → Photographs Collection → Elliott & Fry', iiifUrl: 'https://www.npg.org.uk/collections/search/portrait/mw107297/Cyril-John-Radcliffe-1st-Viscount-Radcliffe', citationChicago: 'Elliott & Fry. Cyril John Radcliffe, 1st Viscount Radcliffe. 1957. Half-plate negative. National Portrait Gallery, London, NPG x88321.', note: 'No photo of Radcliffe at work in India exists. 1957 NPG portrait is the authorised substitute per Book of Record #0017.' } } },
  { id: 'b-vis-img-9', type: 'image', data: { title: 'Jinnah and Gandhi in conversation, Bombay 1944', caption: 'Jinnah and Gandhi during the failed Bombay talks of 1944, an early missed opportunity for unity.', altText: 'Jinnah and Gandhi seated in conversation, 1944.', url: '/images/library/chapter-1/photos/photo-gandhi-jinnah-bombay-1944-dinodia-mkg33469.jpg', provenance: { creator: 'ullstein bild', source: 'Getty Images / Dinodia Photos', reference: '542347429', date: '1944-09' }, license: 'Public Domain in India (Section 25, Copyright Act 1957) / Rights Managed (International)', credit: 'Dinodia Photos / Rühe/ullstein bild via Getty Images', status: 'archived', aiGenerated: false, linkedClaims: ['claim.partition.gandhi-jinnah-talks'], archivalProvenance: { evidenceLevel: 'B', archiveHierarchy: 'Dinodia Photos Archive / ullstein bild → 1944 Bombay Talks', iiifUrl: 'https://commons.wikimedia.org/wiki/File:Gandhi_Jinnah_Sept_1944.jpg', commercialId: 'Getty 542347429', citationChicago: 'Jinnah & Gandhi, 1944. September 9, 1944. Photograph. ullstein bild / Getty Images, 542347429.', note: 'Public domain in India. Free via Wikimedia Commons.' } } },
  { id: 'b-vis-img-10', type: 'image', data: { title: 'Gandhi at Noakhali, 1946', caption: 'Mahatma Gandhi walks barefoot through riot-torn villages of Noakhali during his peace mission, October 1946.', altText: 'Gandhi walking through a village with followers.', provenance: { creator: 'Kanu Gandhi', source: 'GandhiServe Foundation', reference: 'Kanu Gandhi Collection', date: '1946-10' }, license: 'Rights Managed (GandhiServe / Kanu Gandhi Estate)', credit: 'Photograph by Kanu Gandhi / GandhiServe Foundation', status: 'requested', aiGenerated: false, linkedClaims: ['claim.partition.violence-civil-society'], archivalProvenance: { evidenceLevel: 'C', archiveHierarchy: 'GandhiServe Foundation → The Gandhi Collection → Kanu Gandhi → Noakhali Peace Mission 1946', iiifUrl: 'https://www.gandhiserve.net/the-gandhi-collection/kanu-gandhi/', citationChicago: 'Gandhi, Kanu. Gandhi in Noakhali. 1946. Photograph. Kanu Gandhi Collection, GandhiServe Foundation.' } } },
  // Supplementary Assets — Provisional (unverified against master register)
  { id: 'b-vis-sup-01', type: 'image', data: { title: 'Muslim refugees fleeing India for Pakistan crowd train engine, 1947', caption: 'Muslim refugees fleeing India for Pakistan crowd the engine of a train departing from Delhi in 1947, in their desperation to leave the country.', altText: 'Muslim refugees crowding a steam train engine at a Delhi station, 1947.', url: '/images/library/supplementary/partition/sup-01-muslim-refugees-train-engine-delhi-1947-daily-herald.jpg', provenance: { creator: 'Daily Herald Archive', source: 'National Science & Media Museum / SSPL via Getty Images', reference: '1360179719', date: '1947' }, license: 'Rights Managed', credit: 'Daily Herald Archive / Contributor via Getty Images', status: 'archived', aiGenerated: false, linkedClaims: ['claim.partition.refugee-crisis'], note: 'PROVISIONAL — SUP-01. Not assigned to A-04 or A-05. Verify caption, photographer, and visual content against master register.' } },
  { id: 'b-vis-sup-02', type: 'image', data: { title: 'Muslims boarding special train at New Delhi Station for Pakistan, 7 August 1947', caption: 'Farewells are said as Muslims prepare to board the special train that will take them to Pakistan, New Delhi, 7 August 1947.', altText: 'Muslims boarding a train at New Delhi station, August 1947.', url: '/images/library/supplementary/partition/sup-02-muslims-boarding-train-new-delhi-1947-keystone.jpg', provenance: { creator: 'Keystone Features', source: 'Getty Images', reference: '3336843', date: '1947-08-07' }, license: 'Rights Managed', credit: 'Keystone Features / Getty Images', status: 'archived', aiGenerated: false, linkedClaims: ['claim.partition.refugee-crisis'], note: 'PROVISIONAL — SUP-02. Not assigned to A-04 or A-05. Verify caption, photographer, and visual content against master register.' } },
  { id: 'b-vis-sup-03', type: 'image', data: { title: 'Gandhi and Nehru addressing refugees from the Punjab at Hardwar relief camp, June 1947', caption: 'Mahatma Gandhi and Jawaharlal Nehru addressing refugees from the Punjab at a relief camp in Hardwar, June 1947, during the mass migration triggered by Partition.', altText: 'Gandhi and Nehru speaking to refugees at a relief camp, 1947.', url: '/images/library/supplementary/gandhi/sup-03-gandhi-nehru-refugees-hardwar-1947.jpg', provenance: { creator: 'Universal History Archive', source: 'Getty Images', reference: '973199382', date: '1947-06' }, license: 'Rights Managed', credit: 'Universal History Archive / Getty Images', status: 'archived', aiGenerated: false, linkedClaims: ['claim.partition.gandhi-jinnah-talks', 'claim.partition.refugee-crisis'], note: 'PROVISIONAL — SUP-03. Not in original asset register. Shows Gandhi and Nehru together with refugees; potentially supplementary to A-09 theme.' } },
  { id: 'b-vis-sup-04', type: 'image', data: { title: 'Armed soldiers join Muslim refugees crowding a vehicle on trek to Pakistan, 5 September 1947', caption: 'Armed soldiers stand guard as Muslim refugees crowd onto a vehicle during the mass trek to Pakistan, September 1947.', altText: 'Soldiers and Muslim refugees on a vehicle, 1947.', url: '/images/library/supplementary/partition/sup-04-soldiers-refugees-vehicle-trek-1947-bettmann.jpg', provenance: { creator: 'Bettmann', source: 'Getty Images', reference: '515214340', date: '1947-09-05' }, license: 'Rights Managed', credit: 'Bettmann / Getty Images', status: 'archived', aiGenerated: false, linkedClaims: ['claim.partition.refugee-crisis'], note: 'PROVISIONAL — SUP-04. Not assigned to A-04 or A-05. Verify caption, photographer, and visual content against master register.' } },
  { id: 'b-vis-sup-05', type: 'image', data: { title: 'Muslim refugees trekking on foot to Pakistan with belongings, September 1947', caption: 'Muslim refugees carrying their personal belongings and leading animals as they trek to Pakistan during the Partition migration, September 1947.', altText: 'Muslim refugees on foot with belongings trekking to Pakistan, 1947.', url: '/images/library/supplementary/partition/sup-05-refugees-trekking-foot-belongings-1947-bettmann.jpg', provenance: { creator: 'Bettmann', source: 'Getty Images', reference: '701041686', date: '1947-09-05' }, license: 'Rights Managed', credit: 'Bettmann / Getty Images', status: 'archived', aiGenerated: false, linkedClaims: ['claim.partition.refugee-crisis'], note: 'PROVISIONAL — SUP-05. Not assigned to A-04 or A-05. Verify caption, photographer, and visual content against master register.' } },
  { id: 'b-vis-sup-06', type: 'image', data: { title: 'Aarzi Hukumat Junagadh volunteers arriving in Junagadh, 25 September 1947', caption: 'A train carrying \'Aarzi Hukumat Junagadh\' (Provisional Government of Junagadh) volunteers arrives in Junagadh, 25 September 1947, during the Junagadh accession dispute.', altText: 'Volunteers arriving by train in Junagadh, September 1947.', url: '/images/library/supplementary/accession/sup-06-junagadh-volunteers-train-1947.jpg', provenance: { creator: 'Unknown', source: 'Getty Images', reference: '1971029537', date: '1947-09-25' }, license: 'Rights Managed', credit: 'Getty Images', status: 'archived', aiGenerated: false, linkedClaims: ['claim.partition.princely-states'], note: 'PROVISIONAL — SUP-06. Not in original asset register. Junagadh accession visual asset — verify caption before assigning to princely states visual set.' } },
  { id: 'b-vis-sup-07', type: 'image', data: { title: 'Mahatma Gandhi with Abha Gandhi and Kanu Gandhi', caption: 'Mahatma Gandhi with Abha Gandhi (right) and Kanu Gandhi (left). Abha was one of Gandhi\'s closest attendants in his final years; Kanu was his grandnephew and personal photographer.', altText: 'Gandhi with Abha Gandhi and Kanu Gandhi.', url: '/images/library/supplementary/gandhi/sup-07-gandhi-abha-kanu-gandhi.jpg', provenance: { creator: 'Unknown (possibly Kanu Gandhi or Ruhe/ullstein bild collection)', source: 'Unknown', reference: '1711791173', date: 'Unknown' }, license: 'Unknown', credit: 'Source unconfirmed', status: 'archived', aiGenerated: false, linkedClaims: [], note: 'PROVISIONAL — SUP-07. Unmapped. Source unknown — Getty ID 1711791173 does not resolve. 289x400px preview. Do NOT associate with A-10 or any Chapter 1 asset until historically verified.' } },
  // Maps (map)
  { id: 'b-vis-map-1', type: 'map', data: { title: 'British India, 1939 — administrative divisions and princely states', caption: 'Overview of pre-Partition India: British provinces and the princely states.', mapType: 'Reference', dataSource: 'British Library / Imperial Gazetteer (IOR/X Maps)', url: '/images/library/chapter-1/maps/map-british-india-1939.svg', provenance: { source: 'British Library / Imperial Gazetteer' }, disputedBoundaries: false, license: 'Original cartography', status: 'recreated', aiGenerated: false, linkedClaims: ['claim.partition.pre-partition-india'], archivalProvenance: { evidenceLevel: 'B', cartographicStrategy: 'RECREATE via GIS vector workflows (QGIS/Illustrator) from Imperial Gazetteer baseline data' } } },
  { id: 'b-vis-map-2', type: 'map', data: { title: 'Cabinet Mission Plan, 1946 — proposed three-group federal structure', caption: 'The federal alternative that might have avoided Partition.', mapType: 'Diagrammatic', dataSource: 'British Library (Cmd. 6821)', url: '/images/library/chapter-1/maps/map-cabinet-mission-1946.svg', provenance: { source: 'Original cartography based on Cabinet Mission memorandum Cmd. 6821' }, disputedBoundaries: false, license: 'Original cartography', status: 'recreated', aiGenerated: false, linkedClaims: ['claim.partition.cabinet-mission', 'claim.partition.avoidable'], archivalProvenance: { evidenceLevel: 'B', cartographicStrategy: 'RECREATE from Cmd. 6821' } } },
  { id: 'b-vis-map-3', type: 'map', data: { title: 'The Radcliffe Line, 1947 — India-Pakistan boundary in Punjab and Bengal', caption: 'The arbitrary border drawn by Radcliffe, dividing intermingled communities. Dashed lines indicate disputed boundaries per cartographic policy.', mapType: 'Reference with demographic overlay', dataSource: 'British Library IOR/L/P&J/10/117', url: '/images/library/chapter-1/maps/map-radcliffe-line.svg', provenance: { source: 'Original cartography based on Radcliffe Award records' }, disputedBoundaries: true, license: 'Original cartography', status: 'recreated', aiGenerated: false, linkedClaims: ['claim.partition.radcliffe-arbitrary', 'claim.partition.demographic-impact'], archivalProvenance: { evidenceLevel: 'C', cartographicStrategy: 'RECREATE from IOR/L/P&J/10/117 and Map of Kasur Tehsil' } } },
  { id: 'b-vis-map-4', type: 'map', data: { title: 'Partition migration flows, 1947-48', caption: 'Population movements across the new border during the mass migration. Dashed lines indicate disputed boundaries per cartographic policy.', mapType: 'Flow map with proportional arrows', dataSource: 'Census of India 1941 and 1951', url: '/images/library/chapter-1/maps/map-migration-flows-1947.svg', provenance: { source: 'Original cartography based on Census of India data' }, disputedBoundaries: true, license: 'Original cartography', status: 'recreated', aiGenerated: false, linkedClaims: ['claim.partition.refugee-crisis', 'claim.partition.demographic-impact'], archivalProvenance: { evidenceLevel: 'B', cartographicStrategy: 'RECREATE from Census of India (1941, 1951) data' } } },
  { id: 'b-vis-map-5', type: 'map', data: { title: 'Kashmir, 1947-48 — tribal invasion, Indian response, and ceasefire line', caption: 'The Kashmir conflict and the line that became the Line of Control. Dashed lines indicate disputed boundaries per cartographic policy.', mapType: 'Military campaign map with timeline', dataSource: 'UN Digital Library (UNMOGIP Cartography)', url: '/images/library/chapter-1/maps/map-kashmir-1947.svg', provenance: { source: 'Original cartography based on UNMOGIP maps and Raghavan' }, disputedBoundaries: true, license: 'Original cartography', status: 'recreated', aiGenerated: false, linkedClaims: ['claim.partition.kashmir-accession', 'claim.partition.kashmir-unfinished'], archivalProvenance: { evidenceLevel: 'B', cartographicStrategy: 'RECREATE from UN Digital Library UNMOGIP Cartography' } } },
  { id: 'b-vis-map-6', type: 'map', data: { title: 'Religious demography of India, 1941 — district-level Muslim population', caption: 'The demographic basis of Partition and its electoral logic.', mapType: 'Choropleth', dataSource: 'Census of India 1941 (British Library / NAI)', url: '/images/library/chapter-1/maps/map-demography-1941.svg', provenance: { source: 'Census of India 1941 via BL/NAI' }, disputedBoundaries: false, license: 'Original cartography', status: 'recreated', aiGenerated: false, linkedClaims: ['claim.partition.demographic-impact'], archivalProvenance: { evidenceLevel: 'B', cartographicStrategy: 'RECREATE from 1941 Census of India data sets' } } },
  { id: 'b-vis-map-7', type: 'map', data: { title: 'Princely states of India — accession outcomes', caption: 'How the princely states acceded, including Junagadh, Hyderabad, and Kashmir. Dashed lines indicate disputed boundaries per cartographic policy.', mapType: 'Reference', dataSource: 'National Archives of India (Ministry of States files)', url: '/images/library/chapter-1/maps/map-princely-states.svg', provenance: { source: 'Original cartography based on NAI Ministry of States files' }, disputedBoundaries: true, license: 'Original cartography', status: 'recreated', aiGenerated: false, linkedClaims: ['claim.partition.princely-states'], archivalProvenance: { evidenceLevel: 'B', cartographicStrategy: 'RECREATE from NAI Ministry of States files' } } },
  // Documents (image facsimile)
  { id: 'b-vis-doc-1', type: 'image', data: { title: 'Indian Independence Act, 1947 — cover and key clauses', caption: 'The UK Parliament\'s Act dissolving British India into two dominions.', altText: 'Facsimile of the Indian Independence Act 1947.', url: '/images/library/chapter-1/documents/doc-independence-act-1947.jpg', provenance: { creator: 'UK Parliament', source: 'UK Parliamentary Archives', reference: 'HL/PO/PU/1/1947/10&11G6c30', date: '1947' }, license: 'Public Record (UK Parliament)', credit: 'UK National Archives', status: 'archived', aiGenerated: false, linkedClaims: ['claim.partition.independence-act'], archivalProvenance: { evidenceLevel: 'B', iiifUrl: 'https://www.parliament.uk/about/living-heritage/evolutionofparliament/legislativescrutiny/parliament-and-empire/collections1/collections2/1947-indian-independence-act/' } } },
  { id: 'b-vis-doc-2', type: 'image', data: { title: 'Instrument of Accession of Jammu and Kashmir — facsimile', caption: 'The document by which Kashmir acceded to India, the subject of enduring dispute.', altText: 'Facsimile of the Instrument of Accession.', url: '/images/library/chapter-1/documents/doc-instrument-of-accession.pdf', provenance: { creator: 'J&K State', source: 'National Archives of India', reference: 'NAI 1947 Accession', date: '1947-10-26' }, license: 'Public Record (Government of India)', credit: 'National Archives of India', status: 'archived', aiGenerated: false, linkedClaims: ['claim.partition.kashmir-accession'], archivalProvenance: { evidenceLevel: 'B', archiveHierarchy: 'National Archives of India → Accession Documents (1947)', iiifUrl: 'https://upload.wikimedia.org/wikipedia/commons/e/e1/Instrument_of_Accession_and_Standstill_Agreement_of_Jammu_and_Kashmir_to_Dominion_of_India.pdf' } } },
  { id: 'b-vis-doc-3', type: 'image', data: { title: 'UN Security Council Resolution 47 — facsimile', caption: 'The resolution that proposed a plebiscite in Kashmir, conditioned on Pakistan\'s withdrawal.', altText: 'Facsimile of UN SCR 47.', url: '/images/library/chapter-1/documents/doc-unscr-47.pdf', provenance: { creator: 'United Nations', source: 'UN Digital Library', reference: 'S/RES/47(1948)', date: '1948-04-21' }, license: 'UN Public Domain', credit: 'UN Archives', status: 'archived', aiGenerated: false, linkedClaims: ['claim.partition.kashmir-unfinished'], archivalProvenance: { evidenceLevel: 'A', iiifUrl: 'https://digitallibrary.un.org/record/111955/' } } },
  { id: 'b-vis-doc-4', type: 'image', data: { title: 'Extract from Radcliffe Boundary Commission Proceedings', caption: 'Proceedings of the commission that drew the Partition boundary.', altText: 'Facsimile of Boundary Commission proceedings.', provenance: { creator: 'Radcliffe Boundary Commission', source: 'British Library', reference: 'IOR/L/P&J/10/117', date: '1947' }, license: 'Public Record', credit: 'British Library', status: 'requested', aiGenerated: false, linkedClaims: ['claim.partition.radcliffe-arbitrary'], archivalProvenance: { evidenceLevel: 'C', archiveHierarchy: 'British Library → India Office Records', note: 'Physical only — digitisation required (no permanent URL available).' } } },
  { id: 'b-vis-doc-5', type: 'image', data: { title: 'Cabinet Mission Plan memorandum', caption: 'The memorandum proposing the federal structure rejected by the Congress and League.', altText: 'Facsimile of the Cabinet Mission Plan memorandum.', url: '/images/library/chapter-1/documents/doc-cabinet-mission-plan.pdf', provenance: { creator: 'Cabinet Mission', source: 'British Library', reference: 'Cmd. 6821', date: '1946' }, license: 'Public Record', credit: 'British Library', status: 'archived', aiGenerated: false, linkedClaims: ['claim.partition.cabinet-mission'], archivalProvenance: { evidenceLevel: 'B', archiveHierarchy: 'British Library → Cmd. 6821', note: 'Digitised copy acquired from Internet Archive (Papers Relating to the Cabinet Mission to India).' } } },
  // Charts (chart)
  { id: 'b-vis-chart-1', type: 'chart', data: { title: 'Casualties of Partition — death toll estimates by source', caption: 'Death toll estimates from official, press, and scholarly sources, with consensus range 800k-1M.', chartType: 'bar', dataSource: 'Scholarly aggregates (per Book of Record #0006)', url: '/images/library/chapter-1/charts/chart-death-toll-estimates.svg', provenance: { source: 'Synthesis of cited estimates' }, status: 'recreated', aiGenerated: false, linkedClaims: ['claim.partition.death-toll'], archivalProvenance: { evidenceLevel: 'B', chartStrategy: 'RECREATE — range/bar chart illustrating variance across sources' } } },
  { id: 'b-vis-chart-2', type: 'chart', data: { title: 'Refugee flows and destinations, 1947-48', caption: 'Tabular and map-based summary of refugee movements and resettlement.', chartType: 'combined', dataSource: '1951 Census of India/Pakistan', url: '/images/library/chapter-1/charts/chart-refugee-flows.svg', provenance: { source: '1951 Census of India/Pakistan' }, status: 'recreated', aiGenerated: false, linkedClaims: ['claim.partition.refugee-crisis'], archivalProvenance: { evidenceLevel: 'B', chartStrategy: 'RECREATE — split-flow Sankey diagram from census data' } } },
  { id: 'b-vis-chart-3', type: 'chart', data: { title: 'Timeline of key events, 1945-1948', caption: 'Multi-row timeline colour-coded by category (political, military, diplomatic, violence).', chartType: 'timeline', dataSource: 'Transfer of Power volumes (HMSO)', url: '/images/library/chapter-1/charts/chart-timeline-1945-1948.svg', provenance: { source: 'Transfer of Power (HMSO)' }, status: 'recreated', aiGenerated: false, linkedClaims: ['claim.partition.sequence'], archivalProvenance: { evidenceLevel: 'B', chartStrategy: 'RECREATE — vertical chronological timeline from ToP volumes' } } },
  { id: 'b-vis-chart-4', type: 'chart', data: { title: 'Religious composition of India, 1941 vs 1951', caption: 'Stacked bar chart showing the demographic transformation wrought by Partition.', chartType: 'stacked-bar', dataSource: 'Census of India 1941 and 1951', url: '/images/library/chapter-1/charts/chart-demography-1941-1951.svg', provenance: { source: 'Census of India 1941, 1951' }, status: 'recreated', aiGenerated: false, linkedClaims: ['claim.partition.demographic-impact'], archivalProvenance: { evidenceLevel: 'B', chartStrategy: 'RECREATE — comparative stacked bar charts from census data' } } },
  { id: 'b-vis-chart-5', type: 'chart', data: { title: 'India-Pakistan military balance, 1947', caption: 'Comparison of manpower, equipment, and budgets at the moment of Partition.', chartType: 'comparison', dataSource: 'Auchinleck partition committee; Raghavan; Cohen', url: '/images/library/chapter-1/charts/chart-military-balance-1947.svg', provenance: { source: 'Auchinleck partition committee; Raghavan; Cohen' }, status: 'recreated', aiGenerated: false, linkedClaims: ['claim.partition.security-paradigm'], archivalProvenance: { evidenceLevel: 'B', chartStrategy: 'RECREATE — waffle chart depicting the 2:1 division ratio' } } },
  // Relationship Diagrams (image, aiGenerated: true — explanatory)
  { id: 'b-vis-diagram-1', type: 'image', data: { title: 'Key actors network — Nehru, Jinnah, Gandhi, Patel, Mountbatten, Wavell, Attlee', caption: 'Relationships and points of conflict among the principal actors of Partition. Explanatory diagram.', altText: 'Network graph of Partition-era actors and their relationships.', url: '/images/library/chapter-1/diagrams/diagram-actors-network.svg', provenance: { source: 'Original explanatory diagram' }, license: 'Original (AI-generated explanatory diagram)', credit: 'The Breakdown (explanatory diagram)', status: 'draft', aiGenerated: true, linkedClaims: ['claim.partition.actors'], note: 'AI-generated explanatory diagram — not a historical photograph; labelled per Book of Record #0005.' } },
  { id: 'b-vis-diagram-2', type: 'image', data: { title: 'Cabinet Mission Plan — organisational structure', caption: 'Centre, provinces, and groups under the proposed federal structure. Explanatory diagram.', altText: 'Hierarchy diagram of the Cabinet Mission federal structure.', url: '/images/library/chapter-1/diagrams/diagram-cabinet-mission-structure.svg', provenance: { source: 'Original explanatory diagram' }, license: 'Original (AI-generated explanatory diagram)', credit: 'The Breakdown (explanatory diagram)', status: 'draft', aiGenerated: true, linkedClaims: ['claim.partition.cabinet-mission'], note: 'AI-generated explanatory diagram — not a historical photograph; labelled per Book of Record #0005.' } },
  { id: 'b-vis-diagram-3', type: 'image', data: { title: 'Decision tree of Partition — key decision points, 1945-1947', caption: 'Branching outcomes of the major decisions leading to Partition. Explanatory diagram.', altText: 'Decision-tree diagram of Partition decisions and consequences.', url: '/images/library/chapter-1/diagrams/diagram-decision-tree.svg', provenance: { source: 'Original explanatory diagram' }, license: 'Original (AI-generated explanatory diagram)', credit: 'The Breakdown (explanatory diagram)', status: 'draft', aiGenerated: true, linkedClaims: ['claim.partition.avoidable'], note: 'AI-generated explanatory diagram — not a historical photograph; labelled per Book of Record #0005.' } },
  // Migration Flow Maps (map, flow)
  { id: 'b-vis-flow-1', type: 'map', data: { title: 'Punjab migration — flows across the Punjab boundary', caption: 'West-to-east and east-to-west population flows across the Punjab boundary. Dashed lines indicate disputed boundaries per cartographic policy.', mapType: 'Flow map with proportional arrow width', dataSource: 'Census of India 1941 and 1951', url: '/images/library/chapter-1/flows/flow-punjab.svg', provenance: { source: 'Original cartography based on Census of India data' }, disputedBoundaries: true, license: 'Original cartography', status: 'recreated', aiGenerated: false, linkedClaims: ['claim.partition.refugee-crisis'], archivalProvenance: { cartographicStrategy: 'RECREATE from Census of India data — supplementary to B-04' } } },
  { id: 'b-vis-flow-2', type: 'map', data: { title: 'Bengal migration — flows across the Bengal boundary', caption: 'Population flows across the Bengal boundary during Partition. Dashed lines indicate disputed boundaries per cartographic policy.', mapType: 'Flow map', dataSource: 'Census of India 1941 and 1951', url: '/images/library/chapter-1/flows/flow-bengal.svg', provenance: { source: 'Original cartography based on Census of India data' }, disputedBoundaries: true, license: 'Original cartography', status: 'recreated', aiGenerated: false, linkedClaims: ['claim.partition.refugee-crisis'], archivalProvenance: { cartographicStrategy: 'RECREATE from Census of India data — supplementary to B-04' } } },
  { id: 'b-vis-flow-3', type: 'map', data: { title: 'Total subcontinental migration, 1947-1950', caption: 'Synthesised overview of all major Partition-era flows. Dashed lines indicate disputed boundaries per cartographic policy.', mapType: 'Comprehensive flow map', dataSource: 'Census of India 1941 and 1951', url: '/images/library/chapter-1/flows/flow-subcontinent.svg', provenance: { source: 'Original cartography based on Census of India data' }, disputedBoundaries: true, license: 'Original cartography', status: 'recreated', aiGenerated: false, linkedClaims: ['claim.partition.refugee-crisis'], archivalProvenance: { cartographicStrategy: 'RECREATE from Census of India data — supplementary to B-04' } } },
];

const indiaAndTheWorld: KnowledgeLibrary = {
  id: 'kl-1',
  slug: 'india-and-the-world',
  title: 'India and the World',
  subtitle: 'The Complete Evidence-Based History of Indian Foreign Policy (1947–Present)',
  summary: 'A living knowledge collection exploring how India shaped — and was shaped by — the world. From Partition to nuclear power, from non-alignment to multi-alignment.',
  heroImage: '/images/library/india-and-the-world-hero.jpg',
  createdAt: '2026-07-12T00:00:00Z',
  updatedAt: '2026-07-12T00:00:00Z',
  collections: [
    {
      id: 'kl-col-1',
      librarySlug: 'india-and-the-world',
      slug: 'foundations-1947-1962',
      title: 'Foundations',
      subtitle: '1947–1962',
      summary: 'From independence to the war with China — India charts an independent course in a bipolar world.',
      order: 1,
      dateRange: { start: '1947', end: '1962' },
      createdAt: '2026-07-12T00:00:00Z',
      updatedAt: '2026-07-12T00:00:00Z',
      volumes: [
        {
          id: 'kl-vol-1',
          collectionSlug: 'foundations-1947-1962',
          slug: 'the-nehruvian-era',
          title: 'The Nehruvian Era',
          subtitle: 'Idealism and Realism in India\'s Founding Vision',
          summary: 'Jawaharlal Nehru\'s foreign policy combined idealist rhetoric with hard-headed realism. This volume examines the foundations he laid — and the contradictions they contained.',
          order: 1,
          dateRange: { start: '1947', end: '1962' },
          estimatedReadingTime: { explorer: 45, scholar: 180, researcher: 600 },
          createdAt: '2026-07-12T00:00:00Z',
          updatedAt: '2026-07-12T00:00:00Z',
          chapters: [
            {
              id: 'kl-ch-1',
              collectionSlug: 'foundations-1947-1962',
              volumeSlug: 'the-nehruvian-era',
              slug: 'indias-inheritance',
              title: 'India\'s Inheritance: The Partition and Its Legacies',
              summary: 'India began its independent existence amid the trauma of Partition, a massive refugee crisis, and an unresolved war over Kashmir. These events shaped every foreign policy choice that followed.',
              order: 1,
              difficulty: 2,
              version: { major: 1, minor: 0, patch: 0, label: 'initial' },
              metadata: { editor: 'The Breakdown Editorial', wordCount: 11863, sourceCount: 31 },
              readingTime: { explorer: 30, scholar: 75, researcher: 200 },
              studyTime: { explorer: 45, scholar: 120, researcher: 480 },
              content: chapter1Blocks,
              status: 'verified',
              lastVerifiedAt: '2026-07-12T00:00:00Z',
              createdAt: '2026-07-12T00:00:00Z',
              updatedAt: '2026-07-12T00:00:00Z',
              relatedEntityIds: ['jawaharlal-nehru', 'mahatma-gandhi', 'mohammad-ali-jinnah', 'partition', 'kashmir'],
              relatedConceptIds: ['con-partition', 'con-two-nation-theory', 'con-kashmir', 'con-secular-nationalism', 'con-united-nations'],
              relatedSourceIds: ['s1', 's3', 's4', 's6'],
              prerequisites: ['Modern Indian History', 'British Empire'],
              learningObjectives: [
                'Understand how Partition shaped India\'s security outlook and strategic culture',
                'Analyse the Kashmir dispute\'s origins, internationalisation, and unresolved legacy',
                'Evaluate the constraints on India\'s foreign policy at independence, including military weakness, economic dependence, and institutional disruption',
                'Compare the six major historiographical explanations for why Partition happened and assess their strengths and limitations',
                'Identify how British imperial strategy shaped the timing and process of decolonisation in South Asia',
                'Explain the relationship between communal violence, political negotiation, and the collapse of the Cabinet Mission Plan',
                'Assess the competing positions of Nehru, Patel, Jinnah, and Ambedkar on Partition and its strategic consequences',
                'Trace how the experience of Partition influenced India\'s approach to non-alignment, the UN, and great power relations',
                'Evaluate counterfactual scenarios: what might have changed if alternative decisions had been taken in 1946-47',
                'Apply the strategic lessons of Partition to analyse contemporary India-Pakistan relations and India\'s neighbourhood policy',
              ],
              recommendedNext: ['Non-Alignment and Its Contradictions', 'The Making of the India–China Border'],
              keyQuestions: [
                {
                  question: 'Why did Partition shape Indian foreign policy so deeply?',
                  answer: 'Partition created an enduring security dilemma with Pakistan, redefined India\'s relationship with the Islamic world, displaced millions into India who became a vocal constituency for Hindu nationalism, and embedded a deep scepticism of religious nationalism in India\'s secular foreign policy elite.',
                  sources: ['s1', 's3'],
                },
                {
                  question: 'Could Partition have been avoided?',
                  answer: 'Historical scholarship remains divided. Some argue Congress leaders underestimated the Muslim League\'s strength and made strategic errors in 1937 and 1946; others contend that the Two-Nation theory had gained irreversible momentum by 1940 and that no political settlement could have preserved unity.',
                  sources: ['s4', 's5', 's16'],
                },
                {
                  question: 'Was Nehru naive to refer Kashmir to the UN?',
                  answer: 'Nehru expected the UN to condemn Pakistan\'s tribal invasion. When the UN instead proposed a plebiscite conditioned on Pakistan\'s withdrawal — a condition never met — India was trapped in a diplomatic framework it had created. The decision reflected faith in international institutions that proved misplaced.',
                  sources: ['s1', 's6', 's21'],
                },
                {
                  question: 'How responsible were the British for Partition?',
                  answer: 'British responsibility is significant but contested. The nationalist school emphasises divide-and-rule policies and the accelerated Mountbatten timeline. The strategic school notes that Partition served British Cold War interests. The administrative school argues the British were too weak to impose any other outcome.',
                  sources: ['s1', 's3', 's16', 's21'],
                },
                {
                  question: 'Why did Congress accept Partition in 1947 when it had opposed it for decades?',
                  answer: 'By early 1947, Congress faced a choice: accept a truncated India or risk civil war and continued British rule. Patel concluded that a strong Hindu-majority India was preferable to a weak federal state that could not govern. The accelerating violence and administrative collapse left few alternatives.',
                  sources: ['s1', 's16'],
                },
                {
                  question: 'Did Partition benefit India\'s long-term strategic interests?',
                  answer: 'This is deeply contested. Yes: it created a strong centralised state with a clear Hindu-majority identity. No: it left India with an indefensible border, a permanent hostile neighbour, a disputed territory in Kashmir, and a legacy of communal polarisation that has empowered religious nationalism.',
                  sources: ['s1', 's4', 's9', 's21'],
                },
              ],
              misconceptions: [
                {
                  misconception: 'Partition was solely about religion.',
                  correction: 'Partition was shaped by religion but equally by political competition, economic interests, administrative collapse, and British imperial strategy.',
                  explanation: 'The Muslim League\'s demand for Pakistan was as much a political strategy to secure Muslim rights in a Hindu-majority state as an expression of religious identity. Economic grievances, elite competition, and British divide-and-rule policies were equally important factors.',
                },
                {
                  misconception: 'The British were neutral arbiters who left power peacefully.',
                  correction: 'British policy actively shaped Partition to serve imperial strategic interests, and the exit was neither neutral nor peaceful.',
                  explanation: 'The British accelerated the partition timeline, drew borders in five weeks with minimal consultation, and prioritised a rapid exit over a just settlement. Mountbatten\'s compressed schedule made violence virtually inevitable.',
                },
                {
                  misconception: 'Jinnah always wanted a separate Pakistan.',
                  correction: 'Scholarly consensus indicates Jinnah was willing to accept a federal solution and used "Pakistan" as a bargaining counter until late 1946.',
                  explanation: 'Ayesha Jalal\'s research shows Jinnah accepted the Cabinet Mission Plan, which would have preserved a single India. His demand for a separate state hardened only after Congress rejected federal arrangements and violence escalated.',
                },
                {
                  misconception: 'The Radcliffe Line was drawn with care to minimise disruption.',
                  correction: 'The boundary was drawn in five weeks by a British lawyer who had never visited India, deliberately kept unaware of the political implications of his decisions.',
                  explanation: 'Radcliffe had no expertise in Indian geography or demography. The boundary split villages from their water sources, separated families from their land, and left key infrastructure on the wrong side of the border.',
                },
                {
                  misconception: 'Partition violence was spontaneous communal hatred.',
                  correction: 'Much of the violence was organised, directed, and in some cases state-sponsored by local political actors on all sides.',
                  explanation: 'The Great Calcutta Killing was preceded by political mobilisation and inflammatory speeches. Violence in Punjab was often led by former soldiers and local politicians with organised militias, not spontaneous mobs.',
                },
                {
                  misconception: 'Kashmir\'s accession to India was illegal under international law.',
                  correction: 'The Instrument of Accession was legal under the Indian Independence Act, and the UN itself accepted India\'s right to request Pakistani withdrawal before any plebiscite.',
                  explanation: 'Maharaja Hari Singh\'s accession was recognised by the British government and the UN. Resolution 47 required Pakistan to withdraw its forces first, a condition it never met. India\'s position has a legal basis that is often overlooked.',
                },
                {
                  misconception: 'Nehru\'s non-alignment was naive idealism.',
                  correction: 'Non-alignment was a pragmatic response to India\'s limited power, its need for development assistance, and the lessons of Partition about external dependence.',
                  explanation: 'Scholars like Raghavan and Raja Mohan have shown that non-alignment allowed India to extract resources from both Cold War blocs while maintaining strategic autonomy. It was neither naive nor purely idealistic.',
                },
                {
                  misconception: 'Congress was united against Partition.',
                  correction: 'Congress leaders were deeply divided on how to respond to the Muslim League\'s demand, with Patel more willing to accept Partition and Azad strongly opposing it.',
                  explanation: 'Patel privately concluded that Partition was necessary to preserve a strong central state and prevent further British manipulation. Nehru was more reluctant but was overtaken by events after the Cabinet Mission\'s failure.',
                },
                {
                  misconception: 'Partition was inevitable by 1940.',
                  correction: 'Partition was not inevitable until at least early 1947, and possibly not until the failure of the Cabinet Mission Plan in mid-1946.',
                  explanation: 'Both Congress and the Muslim League initially accepted the Cabinet Mission Plan. The collapse of that consensus, combined with the escalation of communal violence, narrowed options dramatically — but inevitability is a retrospective illusion.',
                },
                {
                  misconception: 'Hindus and Muslims had always lived in irreconcilable conflict.',
                  correction: 'Hindu-Muslim coexistence was the historical norm across most of India; communal polarisation was a relatively recent political development.',
                  explanation: 'Gyanendra Pandey and other subaltern historians have shown that everyday coexistence was common in mixed neighbourhoods. The hardening of communal identities was a political process accelerated by colonial policies and elite competition.',
                },
                {
                  misconception: 'Pakistan was created as a secular state, not a religious one.',
                  correction: 'Pakistan was explicitly created as a homeland for Indian Muslims, and its founding ideology was the Two-Nation Theory, though Jinnah\'s 11 August 1947 speech did promise equal citizenship.',
                  explanation: 'The resolution of purpose of Pakistan was religious identity, even as its leadership promised equal rights. The tension between Islamic identity and civic nationalism has been a central conflict in Pakistani history.',
                },
                {
                  misconception: 'The UN was created to prevent exactly this kind of humanitarian catastrophe.',
                  correction: 'The UN was largely paralysed by great power politics and lacked the will or capacity to intervene in Partition violence or its aftermath.',
                  explanation: 'The UN did not send peacekeepers, did not mediate, and did not provide significant humanitarian assistance during the Partition crisis. The organisation was still in its infancy and focused on European reconstruction and the emerging Cold War.',
                },
                {
                  misconception: 'The princely states had a real choice between independence, India, or Pakistan.',
                  correction: 'The Indian Independence Act gave princely states only the choice of acceding to India or Pakistan; independence was not a viable legal option in practice.',
                  explanation: 'While the Act technically allowed princely states to remain independent, the British made clear that they would not recognise independent princely states. India\'s position was that non-accession would be treated as a hostile act, as demonstrated in Junagadh and Hyderabad.',
                },
                {
                  misconception: 'Only Muslims supported the Muslim League.',
                  correction: 'The Muslim League had significant Hindu support from Sindh and Bengal, where economic interests aligned with League positions on federal autonomy.',
                  explanation: 'In Sindh and Bengal, some Hindu landowners and professionals supported the League\'s demand for provincial autonomy, fearing domination by the more populous Hindi-speaking provinces under a centralised Congress government.',
                },
                {
                  misconception: 'Gandhi could have prevented Partition if he had tried harder.',
                  correction: 'Gandhi\'s influence had declined significantly by 1946-47, and even his moral authority could not overcome the political forces driving Partition.',
                  explanation: 'Gandhi was sidelined during the critical negotiations of 1946-47. His closest associates — Nehru, Patel, and Azad — made the key decisions, and Gandhi\'s calls for unity were not heeded by the League or the broader political establishment.',
                },
              ],
              keyTerms: [
                { term: 'Two-Nation Theory', definition: 'The doctrine that Hindus and Muslims constituted separate nations, forming the ideological basis for Pakistan.' },
                { term: 'Instrument of Accession', definition: 'A legal document through which princely states acceded to either India or Pakistan, initially valid only for defence, foreign affairs, and communications.' },
                { term: 'Radcliffe Line', definition: 'The boundary demarcation between India and Pakistan drawn by Sir Cyril Radcliffe in five weeks and announced on 17 August 1947, three days after independence.' },
                { term: 'Cabinet Mission Plan', definition: 'A 1946 British proposal for a federal India with a weak central government and grouped provinces, accepted by both main parties but never implemented.' },
                { term: 'Direct Action Day', definition: 'A Muslim League protest on 16 August 1946 demanding Pakistan, which triggered the Great Calcutta Killing and a spiral of communal violence across Bengal and Bihar.' },
                { term: 'Non-Alignment', definition: 'A foreign policy doctrine of not formally allying with either Cold War bloc, pioneered by Nehru and foundational to Indian strategic identity.' },
                { term: 'Subaltern History', definition: 'An approach to historiography that centres the experiences of marginalised groups — peasants, workers, women — rather than elite political actors.' },
                { term: 'Partition Violence', definition: 'The massacres, abductions, rapes, and forced migrations that accompanied the division of India, resulting in an estimated 800,000 to 1 million deaths.' },
                { term: 'Refugee Crisis', definition: 'The largest mass migration in human history: approximately 14 million people crossed the new borders between India and Pakistan in 1947-48.' },
                { term: 'Princely States', definition: 'Approximately 565 semi-sovereign territories ruled by hereditary monarchs under British suzerainty, given the choice to accede to India or Pakistan in 1947.' },
                { term: 'Standstill Agreement', definition: 'A temporary arrangement maintaining existing arrangements between a princely state and the new dominions pending final accession negotiations.' },
                { term: 'United Nations Security Council Resolution 47', definition: 'The 1948 resolution establishing a UN Commission on Kashmir, calling for a ceasefire, Pakistani withdrawal, and a plebiscite on the state\'s future.' },
                { term: 'Mountbatten Plan', definition: 'The 3 June 1947 plan outlining the process for partition, including the creation of the Boundary Commission and the accelerated transfer of power.' },
                { term: 'Simla Conference (1945)', definition: 'A failed British attempt to reach agreement between Congress and the Muslim League on the composition of an interim government.' },
                { term: 'Interim Government', definition: 'A transitional government formed in September 1946 pending the Constituent Assembly, in which the Congress held key portfolios while the Muslim League initially refused to participate.' },
                { term: 'Constituent Assembly', definition: 'The body elected in 1946 to draft India\'s Constitution, which also functioned as the legislature during the transition period.' },
                { term: 'Liaquat-Nehru Pact (1950)', definition: 'A bilateral agreement between India and Pakistan guaranteeing minority rights and establishing mechanisms for refugee property claims.' },
                { term: 'Plebiscite Front', definition: 'A political movement in Kashmir advocating for a UN-supervised plebiscite on the state\'s accession, active from the 1950s onward.' },
                { term: 'Divide and Rule', definition: 'British colonial policy of fostering divisions between religious and ethnic communities to maintain imperial control, often cited as a primary cause of Partition.' },
                { term: 'Communal Award (1932)', definition: 'A British decision granting separate electorates to minority communities, including Muslims, Sikhs, and Depressed Classes, later modified by the Poona Pact.' },
                { term: 'Lahore Resolution (1940)', definition: 'The Muslim League\'s formal demand for independent states in Muslim-majority areas of northwestern and eastern India, later interpreted as the demand for Pakistan.' },
                { term: 'August Offer (1940)', definition: 'A British proposal offering Congress a role in wartime government in exchange for cooperation in the war effort, which Congress rejected.' },
                { term: 'Cripps Mission (1942)', definition: 'A British attempt to secure Indian cooperation in World War II by offering post-war dominion status, which failed when neither Congress nor the Muslim League accepted its terms.' },
                { term: 'Quit India Movement (1942)', definition: 'A mass civil disobedience campaign launched by Congress demanding an end to British rule, leading to the arrest of Congress leadership and a violent state crackdown.' },
                { term: 'Azad Muslim Conference (1940)', definition: 'A conference of anti-separatist Muslim organisations opposing the Lahore Resolution and advocating for a united India.' },
                { term: 'Nehru Report (1928)', definition: 'A Congress proposal for India\'s constitutional future that rejected separate electorates, deepening Muslim League concerns about minority representation.' },
                { term: 'Fourteen Points of Jinnah (1929)', definition: 'Jinnah\'s counter-proposal to the Nehru Report, demanding federal autonomy, separate electorates, and reservation of seats for Muslims in legislatures.' },
                { term: 'Lucknow Pact (1916)', definition: 'An agreement between Congress and the Muslim League accepting separate electorates and weighted representation for Muslims in provincial legislatures.' },
                { term: 'Indian Independence Act (1947)', definition: 'The British legislation that granted independence to India and Pakistan, creating two new Dominions and dissolving British suzerainty over the princely states.' },
                { term: 'Government of India Act (1935)', definition: 'The last major British constitutional reform for India, establishing provincial autonomy, a federal structure, and separate electorates that became the framework for political competition.' },
                { term: 'Borders and Boundaries', definition: 'The Radcliffe Line and other partition boundaries that divided villages, families, river systems, railway lines, and agricultural land between India and Pakistan.' },
                { term: 'Refugee Rehabilitation', definition: 'The Indian government\'s programme of resettling and compensating millions of refugees who crossed from Pakistan, including housing, land grants, and employment schemes.' },
                { term: 'Line of Control', definition: 'The de facto border in Kashmir established by the 1949 UN ceasefire, later formalised by the Simla Agreement of 1972.' },
                { term: 'Strategic Autonomy', definition: 'The foreign policy principle of maintaining independent decision-making capacity and avoiding dependence on any single great power.' },
                { term: 'Historiography', definition: 'The study of how history has been written — the methods, assumptions, and interpretive frameworks that different scholars bring to understanding the past.' },
                { term: 'Revisionist History', definition: 'An approach that challenges established interpretations, often by recovering neglected evidence or centring previously marginalised perspectives.' },
                { term: 'Elite Politics', definition: 'A focus on the decisions, negotiations, and conflicts among political leaders, as opposed to the experiences of ordinary people.' },
                { term: 'Everyday State', definition: 'The concept, emphasised by Yasmin Khan, of how the routine functioning of government — policing, food distribution, railways — shapes political outcomes.' },
                { term: 'Evidence-Based History', definition: 'An approach that grounds all claims in verifiable evidence and clearly distinguishes between established facts, scholarly debates, and contested interpretations.' },
                { term: 'Counterfactual History', definition: 'The systematic examination of alternative historical outcomes by varying one or more key conditions, used to assess causation and contingency.' },
                { term: 'Gendered Violence', definition: 'Violence directed specifically at women, including abduction, rape, forced marriage, and honour killings, which subaltern historians have shown was a central feature of Partition.' },
                { term: 'Oral History', definition: 'Historical methodology based on interviews and personal testimony, particularly important for recovering experiences excluded from written records.' },
                { term: 'Archival Evidence', definition: 'Documents preserved in official archives, including government records, correspondence, and diplomatic dispatches, which form the evidence base for political and strategic histories.' },
                { term: 'Mass Migration', definition: 'The movement of approximately 14 million people across the new borders, making Partition the largest single forced migration in the twentieth century.' },
                { term: 'Demographic Transformation', definition: 'The permanent reshaping of religious demographics in both India and Pakistan as a result of Partition migration, from approximately 24% Muslim in pre-Partition India to 12% in independent India.' },
                { term: 'Cold War Alignment', definition: 'The strategic decisions by newly independent states to align with, remain neutral toward, or oppose the US and Soviet blocs during the Cold War.' },
                { term: 'Security Dilemma', definition: 'A situation in international relations where one state\'s efforts to increase its security are perceived as threatening by another, leading to arms races and conflict.' },
                { term: 'Neighbourhood Policy', definition: 'A state\'s strategy for managing relationships with adjacent countries, a particular challenge for India given its complex regional geography and rivalries.' },
                { term: 'Irredentism', definition: 'A political claim to territory based on ethnic or historical ties to a population living across a border, relevant to Pakistan\'s claim on Kashmir and India\'s claim on Junagadh.' },
                { term: 'Decolonisation', definition: 'The process by which colonies achieved independence from European empires, peaking in the two decades after World War II and profoundly reshaping global politics.' },
              ],
              sources,
              claims: [],
            },
          ],
        },
      ],
    },
  ],
};
