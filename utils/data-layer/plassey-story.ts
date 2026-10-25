/**
 * THE BREAKDOWN — Flagship Historical Investigation Pilot
 *
 * Series: Before the Battle
 * Case: Battle of Plassey (1757)
 * Slug: before-the-battle-plassey-1757
 *
 * Source of Truth: docs/editorial/investigations/before-the-battle-plassey-evidence-ledger.md
 * Causal Architecture: docs/editorial/investigations/before-the-battle-plassey-causal-model.md
 * Status: DRAFT (Unpublished / Internal Review)
 */

import type { APIStory } from './types';
import type { StoryBlock } from '@/types/canonical';

export const plasseyStoryBlocks: StoryBlock[] = [
  // â”€â”€ ACT I â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  {
    id: 'plassey-act-1',
    type: 'chapter-heading',
    region: 'main',
    data: { title: 'Act I — The Sovereign Crisis & The Illicit Passes' },
  },
  {
    id: 'plassey-text-1-1',
    type: 'text',
    region: 'main',
    data: {
      content: `
        <p>In April 1756, an ailing Alivardi Khan—the formidable military ruler who had held the rich Mughal province of Bengal through a decade of devastating Maratha invasions—died in his palace at Murshidabad. He was succeeded by his twenty-three-year-old grandson, Mirza Muhammad Siraj ud-Daulah.</p>
        <p>Within weeks of taking the throne, the young Nawab confronted an administrative defiance that struck directly at the sovereignty and exchequer of his realm. For decades, the servants of the British East India Company had operated under the imperial <em>Farman</em> of 1717 granted by the Mughal Emperor Farrukhsiyar. The imperial firman exempted the Company's corporate import and export merchandise from customs duties upon production of a written pass, known as a <em>dastak</em>.</p>
        <p>In practice, Company factors and private English merchants had corrupted the privilege into a vast, shadow trading network. English employees routinely sold these tax-exempt passes to private Indian and Armenian merchants, and applied them to their own illicit private fortunes in high-margin inland staples: salt, betel nut, and tobacco. Asian merchants who paid the customary state ad valorem duties were ruined by unequal competition, and the Murshidabad treasury lost hundreds of thousands of silver rupees annually.</p>
        <p>When Siraj ud-Daulah learned that the British at Calcutta and the French at Chandernagore had begun strengthening their fortifications without imperial sanction—anticipating the outbreak of the Seven Years' War in Europe—he issued immediate, identical fiats to both settlements: demolish the unauthorized redoubts, fill the trenches, and trade strictly according to ancient customs.</p>
        <p>The French Cossimbazar agent, Jean Law, replied prudently and temporized. The British Governor at Fort William, Roger Drake, treated the young Nawab's emissary with open insolence and refused to dismantle the works, while simultaneously granting asylum inside Calcutta to Krishna Das, the son of the Diwan of Dhaka (Rajballabh), who had fled with a reported fifty lakh rupees in disputed provincial revenue.</p>
        <p class="text-xl font-serif font-bold text-white my-4">To Siraj ud-Daulah, this was not a commercial dispute. It was a direct armed rebellion by a foreign tenant against the sovereign of Bengal.</p>
      `,
    },
  },
  {
    id: 'plassey-doc-1',
    type: 'documentary-evidence',
    region: 'main',
    data: {
      source: 'Indian Records Series (ed. S.C. Hill, 1905)',
      date: 'Letter dated 1 June 1756',
      documentType: 'Sovereign Ultimatum',
      title: 'Nawab Siraj ud-Daulah to Governor Roger Drake (Fort William)',
      extract: 'I have neither forbidden nor wish to obstruct the trade of your Company, provided you carry it on as in former times... but you have fortified Calcutta without my permission, mounted great guns, and given shelter to the servants of the Government who owe huge balances to the exchequer. If you do not pull down the fortifications and deliver up the runaways, I will march upon your town and expel you from the country.',
      significance: 'Contemporary primary record proving Siraj ud-Daulah acted on administrative sovereignty, fiscal defense, and border control, refuting colonial claims of arbitrary anti-European aggression.',
      url: 'https://archive.org/details/bengalin17565701hilluoft',
    },
  },

  // â”€â”€ ACT II â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  {
    id: 'plassey-act-2',
    type: 'chapter-heading',
    region: 'main',
    data: { title: 'Act II — The Bankers\' Dilemma: The House of Jagat Seth' },
  },
  {
    id: 'plassey-text-2-1',
    type: 'text',
    region: 'main',
    data: {
      content: `
        <p>On 20 June 1756, Siraj ud-Daulah's army stormed Calcutta. Governor Drake and the senior military commanders abandoned the garrison and escaped downriver on ships. Fort William surrendered, and the tragic suffocation of British prisoners in the garrison's lock-up—later propagandized and numerically exaggerated by J.Z. Holwell into the notorious "Black Hole" myth—provided the moral pretext for British retribution.</p>
        <p>Yet the true center of gravity of the Bengal Subah did not reside in the British counting houses of Calcutta, nor in the military camps of the Nawab. It resided in the counting houses of Mahimapur, across the river from Murshidabad: the palatial estate of the <strong>House of Jagat Seth</strong>.</p>
        <p>Descendants of an Oswal Jain mercantile family from Nagaur in Marwar, the heads of the family—Seth Mahtab Rai and his cousin Maharaja Swarup Chand—wielded financial power unmatched in eighteenth-century Asia. In 1723, Mughal Emperor Muhammad Shah had bestowed upon them the hereditary title of <em>Jagat Seth</em>: "Banker of the World."</p>
        <p>The Jagat Seths were not mere moneylenders. They held the imperial monopoly on minting the silver sicca rupee across Bengal, Bihar, and Orissa. They collected the entire agricultural land revenue of the province from regional zamindars, discounted it into bills of exchange (<em>hundis</em>), and transmitted the annual imperial tribute of over one crore rupees directly to Delhi. Every European company—English, French, Dutch—survived on vast, rotating credit lines extended by the Seths.</p>
        <p>Under Alivardi Khan, a delicate equilibrium had prevailed: the state guaranteed protection of the bankers' property and minting privileges, and the bankers guaranteed liquidity to the state. Siraj ud-Daulah shattered that equilibrium.</p>
        <p>Volatile, distrustful, and desperate for funds to pay his mutinous northern cavalry, Siraj demanded staggering forced contributions from the Seths—reportedly demanding three crore rupees. According to the contemporary aristocratic chronicler Ghulam Husain Tabatabai in the <em>Siyar-ul-Mutakhkherin</em>, Siraj went so far as to publicly insult Seth Mahtab Rai in open durbar, striking him in the face and threatening the family with imprisonment and execution.</p>
        <p class="text-xl font-serif font-bold text-white my-4">For the greatest banking house on earth, the young Nawab was no longer merely difficult. He was an existential threat to their capital, their monopoly, and their lives.</p>
      `,
    },
  },
  {
    id: 'plassey-callout-1',
    type: 'callout',
    region: 'main',
    data: {
      variant: 'context',
      title: 'The Economic Engine: The Jagat Seth Revenue Monopoly',
      content: 'Historian J.H. Little estimated the capital of the Jagat Seth house in the 1750s at over ten million pounds sterling—vastly exceeding the entire share capital of the Bank of England. By controlling currency reminting and bullion imports, the Seths effectively set the monetary policy of eastern India. No Nawab could govern without their credit.',
    },
  },

  // â”€â”€ ACT III â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  {
    id: 'plassey-act-3',
    type: 'chapter-heading',
    region: 'main',
    data: { title: 'Act III — The Paper Treason: Clive, Mir Jafar & The Red Treaty' },
  },
  {
    id: 'plassey-text-3-1',
    type: 'text',
    region: 'main',
    data: {
      content: `
        <p>In December 1756, an expeditionary force under Lieutenant-Colonel Robert Clive and Admiral Charles Watson arrived in the Hooghly river from Madras. By January 1757, they had recaptured Calcutta; by February, Clive had surprised the Nawab's camp in a dense morning fog, compelling Siraj to sign the <strong>Treaty of Alinagar</strong> (9 February 1757). The treaty conceded all Company demands: the return of Calcutta, the right to fortify it, and the right to mint coins.</p>
        <p>Had this been a conventional imperial war, the conflict would have ended there. But Clive and the Calcutta Council immediately pressed their advantage. In March 1757, against the Nawab's direct written prohibition, Clive besieged and captured the French base at Chandernagore, capturing 500 French prisoners and expelling the only European rival capable of assisting Siraj.</p>
        <p>Meanwhile, inside the Murshidabad court, a shadow coalition had formed. Seth Mahtab Rai and Maharaja Swarup Chand met secretly with Rai Durlabh, the provincial finance minister, and <strong>Mir Jafar Ali Khan</strong>, the brother-in-law of the late Alivardi Khan and the <em>Mir Bakshi</em> (Supreme Military Paymaster) of the Bengal army. Siraj had recently dismissed Mir Jafar from supreme command following military disputes, replacing him with the loyal officer Mir Madan.</p>
        <p>The conspirators needed an armed instrument to depose the Nawab, but they could not rely on internal palace guards alone without risking a bloody civil war. They turned to the Company. William Watts, the EIC chief at Cossimbazar, acted as the clandestine intermediary in Murshidabad, disguised in a covered palanquin used by purdah women to enter Mir Jafar's residence.</p>
        <p>When the Calcutta merchant Omichund (Amir Chand), who held the threads of communication between the conspirators, threatened to blow the entire conspiracy to the Nawab unless guaranteed five per cent of Siraj's entire treasury (amounting to thirty lakh rupees), Clive executed one of the most brazen frauds in modern history.</p>
        <p>Clive drew up two distinct treaties: a genuine agreement on white paper that omitted Omichund entirely, and a counterfeit agreement on red paper that promised the merchant his extortionate sum. When Admiral Watson refused on honor to sign the counterfeit treaty, Clive ordered his secretary, Henry Lushington, to forge Watson's signature on the red document.</p>
        <p>On 4 June 1757, Mir Jafar swore upon the Quran to execute the Secret Treaty. The terms were staggering: the Company was promised one crore rupees (ten million) in reparations for Calcutta; European, Indian, and Armenian merchants were promised seventy-seven lakh rupees; and the Company was granted the sovereign territorial revenue (zamindari) of the entire 24 Parganas district south of Calcutta.</p>
        <p>Privately, Clive was pledged Â£234,000 (over twenty lakh rupees) in personal cash—equivalent to over Â£35 million today—while members of his council were promised between Â£50,000 and Â£80,000 each.</p>
        <p class="text-xl font-serif font-bold text-white my-4">Before Clive's small army marched northward from Chandernagore, the state of Bengal had already been sold on paper.</p>
      `,
    },
  },
  {
    id: 'plassey-doc-2',
    type: 'documentary-evidence',
    region: 'main',
    data: {
      source: 'House of Commons Select Committee Report (1772)',
      date: 'Testimony delivered May 1772',
      documentType: 'Parliamentary Inquest Evidence',
      title: 'Robert Clive on the Forged Red Treaty and the Murshidabad Treasury',
      extract: 'Omichund was a villain... I thought it warrantable in such a case of life and death to deceive him. The fictitious treaty was written on red paper and Mr. Lushington signed Admiral Watson\'s name to it... When I entered the treasury at Murshidabad, with gold and silver and jewels piled on either hand, by God, Mr. Chairman, at this moment I stand astonished at my own moderation!',
      significance: 'Sworn parliamentary testimony where Clive openly admits forgery and describes the colossal scale of wealth extracted from the Bengal state.',
      url: 'https://parliament.uk',
    },
  },

  // â”€â”€ ACT IV â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  {
    id: 'plassey-act-4',
    type: 'chapter-heading',
    region: 'main',
    data: { title: 'Act IV — The Noon Monsoon & The Paralyzed Army (23 June 1757)' },
  },
  {
    id: 'plassey-text-4-1',
    type: 'text',
    region: 'main',
    data: {
      content: `
        <p>At daybreak on 23 June 1757, Robert Clive climbed to the roof of the Plassey hunting lodge on the banks of the Bhagirathi river and looked across the plain. What he saw was terrifying.</p>
        <p>Surrounding the British position on three sides was the grand army of the Nawab: approximately 50,000 men. Over 15,000 elite Afghan and Rajput cavalry and 35,000 infantry marched in disciplined semicircles, flanked by fifty-three heavy pieces of ordnance. Each massive gun was mounted on a timber platform raised six feet from the ground, drawn by forty to fifty white oxen and pushed from behind by war elephants.</p>
        <p>Against this host, Clive commanded approximately 3,000 men: 750 European infantry of the 39th Foot and Company troops, 100 Royal Navy gunners, 2,100 Indian sepoys, and eight light brass six-pounders. Realizing that his force would be annihilated in the open plain, Clive immediately pulled his men back inside the <strong>Lakshmipur Mango Grove</strong>—a 800-yard orchard enclosed by brick-lined mud banks that served as a natural fortification.</p>
        <p>From 8:00 AM until 11:00 AM, a continuous long-range cannonade echoed across the river. The Nawab's artillery, directed in part by forty French gunners under Monsieur St. Frais stationed at a brick-kiln water tank, inflicted steady casualties on the grove. Clive's ammunition was limited; his eight light field pieces could do little against the heavy iron guns of the Nawab.</p>
        <p>Then, at noon, nature intervened with decisive violence.</p>
        <p>The sky darkened, and a torrential monsoon storm broke over Palashi, drenching the battlefield in rain for forty-five minutes. As the clouds opened, Clive's gunners sprang into disciplined action: they immediately pulled out heavy waxed tarpaulins and secured their gunpowder, cartridges, and fuses.</p>
        <p>The Nawab's gunners took no such precaution. Their open powder barrels and paper charges were thoroughly soaked. Within thirty minutes, the artillery of Bengal was completely silenced.</p>
        <p>Seeing the cannons cease fire, the Nawab's heroic vanguard commander, <strong>Mir Madan</strong>, made a catastrophic tactical assumption: he believed the British guns were equally ruined by the rain. Gathering his cavalry and infantry, Mir Madan launched a furious counter-charge across the sodden ground toward the mango grove.</p>
        <p>Clive waited until the charging horsemen were within short grape-shot range, then ordered his batteries to unmask. The British guns, firing dry, lethal canister shot, tore through the charging ranks. A cannonball shattered Mir Madan's leg. Carried back to the Nawab's tent, the loyal general died in Siraj's arms, gasping his final words: <em>"Nawab, do not trust the counsel of Mir Jafar. Fight on yourself."</em></p>
        <p>The death of Mir Madan shattered the young Nawab's remaining courage. In despair, Siraj summoned Mir Jafar to his tent, cast his imperial turban at his commander's feet, and wept: <em>"Mir Jafar, it is to your honor that Alivardi Khan committed me. Save Bengal today."</em></p>
        <p>Mir Jafar placed his hand upon the Quran and gave treacherous counsel: <em>"The sun is sinking, and the day is spent. Order the army to cease fighting and recall the vanguard to camp. Tomorrow, I swear upon the Holy Book, I shall lead the attack and crush the English."</em></p>
        <p>The moment Siraj ud-Daulah issued the fatal order to cease fire and retreat, Mir Jafar sent a rider galloping to Clive's lines with a secret message: <em>"The Nawab has ordered a retreat. Advance now with all speed; the field is yours."</em></p>
        <p>Major Eyre Coote and Clive surged forward out of the grove, storming the French redoubt at the water tank. As Siraj's loyal vanguard attempted to disengage under orders, the British assault turned the withdrawal into a stampede.</p>
        <p>And throughout this entire crisis, what did the rest of the Bengal army do?</p>
        <p class="text-xl font-serif font-bold text-white my-4">Thirty-five thousand soldiers—the divisions of Mir Jafar, Rai Durlabh, and Yar Latif—stood entirely motionless on the left flank, watching their comrade Mir Madan die and Clive advance, without unholstering a single sword or firing a single musket.</p>
      `,
    },
  },

  // â”€â”€ ACT V â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  {
    id: 'plassey-act-5',
    type: 'chapter-heading',
    region: 'main',
    data: { title: 'Act V — The Balance Sheet of Empire' },
  },
  {
    id: 'plassey-text-5-1',
    type: 'text',
    region: 'main',
    data: {
      content: `
        <p>By 5:00 PM on 23 June 1757, the Battle of Plassey was over. Clive's casualty return recorded twenty-two soldiers killed (four Europeans, eighteen Indian sepoys) and fifty wounded. The Nawab's army lost roughly 500 men, mostly in the artillery rout.</p>
        <p>Siraj ud-Daulah fled the field on a swift camel, reached Murshidabad at midnight, and discovered that not a single nobleman, guard, or family member would lift a hand to protect him. Disguised in peasant clothes, he escaped up the river with his favorite wife, Lutfunnisa, hoping to join Jean Law's French detachment in Bihar. On 2 July, he was recognized near Rajmahal, captured, and brought in chains to Murshidabad. That night, inside a secluded chamber of the palace, he was stabbed to death on the orders of Mir Jafar's son, Miran.</p>
        <p>On 29 June 1757, Robert Clive entered Murshidabad and personally led Mir Jafar by the hand to the <em>masnad</em> (throne) of Bengal. But the real settlement took place the following afternoon at the palace of the Jagat Seths.</p>
        <p>When Clive and Mir Jafar opened the state treasury, they discovered that Siraj's legendary riches did not exist: instead of forty crore rupees, the treasury held less than one and a half crore. With Company soldiers demanding immediate payment, Seth Mahtab Rai mediated the compromise: half the promised reparations would be paid immediately in cash, gold, and jewels, and the remainder assigned from provincial land revenues over three years.</p>
        <p>A flotilla of over one hundred barges, loaded with gold, silver bullion, and coined sicca rupees worth millions of pounds sterling, sailed down the river from Murshidabad to Fort William under the Company flag. It was the largest single extraction of liquid capital from Asia to Europe in history.</p>
        <p>For the conspirators, the triumph was short-lived. Mir Jafar was soon bankrupt, derided by his own subjects as <em>"Clive's Donkey"</em> (<em>Kalaram GadhÄ</em>). When he proved unable to pay further extortions, the Company deposed him in 1760 in favor of his son-in-law, Mir Qasim. When Mir Qasim tried to assert fiscal independence, he was deposed in turn, leading directly to the <strong>Battle of Buxar (1764)</strong>.</p>
        <p>And what became of the great House of Jagat Seth, who had financed the coup to safeguard their wealth? In 1763, during the war with Mir Qasim, Seth Mahtab Rai and Maharaja Swarup Chand were seized at Monghyr and hurled from the ramparts of the fort into the Ganges. Within a decade, Warren Hastings moved the treasury from Murshidabad to Calcutta, stripped the family of their minting monopoly, and left the greatest banking house of Asia a hollow ruin.</p>
        <p class="text-xl font-serif font-bold text-white my-4">The historical lesson of Plassey is not that Europe was invincible. It is that an empire was bought from the inside, financed by Indian capital, and settled before a single soldier stepped onto the battlefield.</p>
      `,
    },
  },
];

export const plasseyStory: APIStory = {
  id: 'before-the-battle-plassey-1757',
  slug: 'before-the-battle-plassey-1757',
  headline: 'Before the Battle: How Bengal Was Bought Before Plassey Was Fought',
  summary: 'The 1757 confrontation at Plassey was not decided by superior British arms in the mango grove of Palashi, but by a financier-backed coup d\'Ã©tat months in the making. How the House of Jagat Seth, Robert Clive, and a disaffected Mughal nobility bought an empire before a single cannon fired.',
  heroImage: '/images/stories/battle-of-plassey-1757.svg',
  heroImageAlt: 'Tactical map of the Battle of Plassey showing Lakshmipur mango grove, River Bhagirathi, and motionless conspirator divisions',
  heroImageIsDecorative: false,
  publishedAt: '2026-10-20T12:00:00Z',
  updatedAt: '2026-10-20T12:00:00Z',
  readingTime: 16,
  wordCount: 4800,
  author: {
    name: 'The Breakdown Historical Investigations Desk',
    bio: 'Historical forensics, political economy, and causal research unit.',
  },
  evidenceScore: 96,
  category: 'history',
  storyType: 'investigation_chapter',
  tags: [
    'Before the Battle',
    'Battle of Plassey 1757',
    'Bengal Subah',
    'East India Company',
    'House of Jagat Seth',
    'Robert Clive',
    'Mir Jafar',
    'Siraj ud-Daulah',
    'Financial History',
    'Colonialism',
  ],
  status: 'developing',
  publicationStatus: 'draft', // FAIL-CLOSED: Strictly unpublished until authorized editorial sign-off
  primaryEntityId: 'east-india-company',
  relatedTopicIds: ['geopolitics', 'policy', 'governance', 'economy'],
  relatedEntityIds: ['east-india-company', 'robert-clive', 'siraj-ud-daulah', 'mir-jafar', 'jagat-seth'],
  whyItMatters: 'Plassey is widely misremembered as a heroic military victory that founded British rule in India. Examining the actual banking transactions, trade disputes, and pre-arranged treachery reveals how fiscal subversion and domestic financial alienation enabled corporate colonization.',
  keyPoints: [
    'The conflict originated in East India Company abuse of imperial trade passes (dastaks) for private, untaxed inland commerce in salt and betel nut.',
    'The conspiracy against Siraj ud-Daulah was initiated and funded not by Clive, but by the House of Jagat Seth—the subcontinent\'s premier banking house.',
    'Clive executed a double-treaty fraud against intermediary Omichund, forging Admiral Watson\'s signature on a fake red-paper agreement.',
    'Under the Secret Treaty of 4 June 1757, Mir Jafar committed 2.2 crore rupees (Â£2.25 million) in reparations and bribes to secure the throne.',
    'On 23 June 1757, a midday rainstorm soaked the Nawab\'s gunpowder while British tarpaulins kept Company ammunition dry, leading to Mir Madan\'s death.',
    'Over 70% of the Nawab\'s army (35,000 troops under Mir Jafar, Rai Durlabh, and Yar Latif) stood motionless throughout the battle without firing a shot.',
  ],
  timeline: [
    {
      date: '1717-01-01',
      title: 'Farrukhsiyar\'s Farman',
      description: 'Mughal Emperor grants EIC duty-free trade passes (dastaks) for sea trade, later abused for illicit private domestic commerce.',
      source: 'Mughal Imperial Archives',
    },
    {
      date: '1756-04-09',
      title: 'Siraj ud-Daulah Accedes to Masnad',
      description: 'Siraj succeeds grandfather Alivardi Khan and demands the British demolish unauthorized fortifications at Fort William.',
      source: 'Riyaz-us-Salatin',
    },
    {
      date: '1756-06-20',
      title: 'Siraj Captures Calcutta',
      description: 'Nawab forces storm Fort William; British garrison captured; Holwell fabricates exaggerated "Black Hole" death counts.',
      source: 'Bengal in 1756-1757',
    },
    {
      date: '1757-02-09',
      title: 'Treaty of Alinagar Signed',
      description: 'Clive and Watson recapture Calcutta; Siraj signs peace treaty restoring privileges and permitting British coinage.',
      source: 'Aitchison Treaties Vol. II',
    },
    {
      date: '1757-03-23',
      title: 'Clive Seizes French Chandernagore',
      description: 'British attack French settlement against Nawab\'s orders, neutralizing Siraj\'s potential European ally.',
      source: 'Jean Law MÃ©moires',
    },
    {
      date: '1757-05-01',
      title: 'Murshidabad Conspiracy Formed',
      description: 'Jagat Seths, Mir Jafar, and Rai Durlabh enlist Clive; Clive creates forged Red Treaty to deceive Omichund.',
      source: 'House of Commons Select Committee 1772',
    },
    {
      date: '1757-06-04',
      title: 'Secret Treaty of Plassey Executed',
      description: 'Mir Jafar signs agreement pledging Â£2.25 million in reparations and vast private rewards to Clive and council.',
      source: 'Third Report Committee of Secrecy 1773',
    },
    {
      date: '1757-06-23',
      title: 'Battle of Plassey (Palashi)',
      description: 'Monsoon rain at noon ruins Nawab\'s powder; Mir Madan dies; 35,000 conspirator troops stand idle; Siraj routs.',
      source: 'Orme Military Transactions Vol. 2',
    },
    {
      date: '1757-07-02',
      title: 'Assassination of Siraj ud-Daulah',
      description: 'Captured Nawab is executed in Murshidabad on orders of Miran; Mir Jafar installed as puppet ruler.',
      source: 'Siyar-ul-Mutakhkherin',
    },
  ],
  facts: [
    { label: 'EIC Force at Plassey', value: '3,000 men (750 European, 2,100 Sepoy)', source: 'Robert Orme (1778)' },
    { label: 'Nawab\'s Total Army', value: '50,000 men (35,000 Foot, 15,000 Horse, 53 Guns)', source: 'S.C. Hill (1905)' },
    { label: 'Troops Under Conspirators (Idle)', value: '35,000 men (~70% of army)', source: 'Clive Dispatch, 26 July 1757' },
    { label: 'Clive Combat Casualties', value: '22 killed, 50 wounded', source: 'British Library IOR/H/193' },
    { label: 'Total Secret Treaty Indemnity', value: 'â‚¹2.2 Crore (Â£2,250,000)', source: 'Secret Treaty, 4 June 1757' },
    { label: 'Clive\'s Personal Bounty', value: 'Â£234,000 (Approx â‚¹21 Lakh)', source: 'Parliamentary Report 1773' },
  ],
  claims: [
    {
      id: 'CLM-PLASSEY-001',
      isLegacy: true,
      claim: 'EIC factors systematically abused the 1717 imperial dastak for duty-free private inland trade in salt, betel nut, and tobacco, defrauding the Bengal treasury of customs revenue.',
      source: 'Sushil Chaudhury (2000), pp. 24–42; P.J. Marshall (1976), pp. 106–114',
      verification: 'true',
      explanation: 'The English company servants extended duty-free passes granted solely for sea trade to private inland commerce, ruining Asian merchants and directly depriving Murshidabad of silver customs revenue.',
      confidence: 0.98,
    },
    {
      id: 'CLM-PLASSEY-002',
      isLegacy: true,
      claim: 'Upon accession in April 1756, Nawab Siraj ud-Daulah demanded the EIC demolish unauthorized fortifications at Fort William, stop abusing dastaks, and extradite fugitive tax evader Krishna Das.',
      source: 'Brijen K. Gupta (1962), pp. 41–55; S.C. Hill (1905), Vol. 1, pp. liv–lvi',
      verification: 'true',
      explanation: 'Siraj ud-Daulah acted on sovereign administrative defense and revenue protection, issuing identical fiats to both the British and French; Governor Drake insolently refused.',
      confidence: 0.96,
    },
    {
      id: 'CLM-PLASSEY-003',
      isLegacy: true,
      claim: 'The casualty figure of 123 deaths out of 146 prisoners in the "Black Hole" popularized by J.Z. Holwell was propagandistically inflated; modern consensus estimates 43 to 64 casualties from confinement heat asphyxiation.',
      source: 'Brijen K. Gupta (1962), pp. 70–82; J.H. Little (1915); P.J. Marshall (1987), p. 71',
      verification: 'true',
      explanation: 'Contemporary colonial accounts fabricated higher prisoner counts to mobilize war indignation; modern archival census audits confirm roughly 64 prisoners confined and ~43 casualties from heat and suffocation.',
      confidence: 0.94,
    },
    {
      id: 'CLM-PLASSEY-004',
      isLegacy: true,
      claim: 'Robert Clive and Admiral Charles Watson recaptured Calcutta in January 1757 and forced Siraj to sign the Treaty of Alinagar (9 February 1757), restoring EIC trade privileges, fortification rights, and minting.',
      source: 'C.U. Aitchison, Treaties, Vol. II, pp. 18–22; William Dalrymple, The Anarchy, pp. 102–106',
      verification: 'true',
      explanation: 'The Treaty of Alinagar conceded all Company commercial demands under naval bombardment; however, Clive immediately prepared further regime destabilization.',
      confidence: 0.99,
    },
    {
      id: 'CLM-PLASSEY-005',
      isLegacy: true,
      claim: 'In March 1757, Clive attacked and captured French Chandernagore against Siraj\'s explicit orders, neutralizing French military assistance and isolating the Nawab internationally.',
      source: 'S.C. Hill, Bengal in 1756–1757, Vol. 2, pp. 289–310; Jean Law Mémoires (1913), pp. 48–62',
      verification: 'true',
      explanation: 'Seven Years\' War spillover into Bengal allowed Clive to besiege and take Chandernagore, expelling Siraj\'s only viable European ally and taking 500 French prisoners.',
      confidence: 0.97,
    },
    {
      id: 'CLM-PLASSEY-006',
      isLegacy: true,
      claim: 'The House of Jagat Seth held the imperial minting monopoly, collected and remitted the entire revenue of Bengal to Delhi, and was the primary creditor of European companies and Bengal nobility alike.',
      source: 'J.H. Little (1967), pp. 32–78; C.A. Bayly (1983), pp. 162–165; Kumkum Chatterjee (1996)',
      verification: 'true',
      explanation: 'The Jagat Seths were the pivot of eastern India\'s banking and currency system; they controlled silver reminting, discounted zamindar revenues into hundis, and underwrote provincial liquidity.',
      confidence: 0.96,
    },
    {
      id: 'CLM-PLASSEY-007',
      isLegacy: true,
      claim: 'Siraj ud-Daulah deeply alienated the Jagat Seths by extorting large sums, threatening physical violence, and insulting Seth Mahtab Rai in open durbar, convincing the Seths their lives and property were insecure.',
      source: 'Sayyid Ghulam Husain Tabatabai, Siyar-ul-Mutakhkherin, Vol. 2, pp. 185–192; Sushil Chaudhury, pp. 68–74',
      verification: 'true',
      explanation: 'Siraj demanded 3 crore rupees in forced contributions and threatened execution; chronicler Tabatabai records a public slap in open court, creating mortal hostility between the throne and the bankers.',
      confidence: 0.93,
    },
    {
      id: 'CLM-PLASSEY-008',
      isLegacy: true,
      claim: 'The conspiracy against Siraj ud-Daulah was initiated and organized by the Murshidabad court and banking elite (Jagat Seth, Mir Jafar, Rai Durlabh), who approached the EIC to act as their military executioner.',
      source: 'P.J. Marshall (1987), pp. 74–77; Sushil Chaudhury (2000), pp. 85–104; Rajat Kanta Ray',
      verification: 'true',
      explanation: 'The initiative for the revolution of 1757 came from Murshidabad grandees seeking an armed instrument to replace an unpredictable ruler; the British Company was hired as the mercenary arm.',
      confidence: 0.96,
    },
    {
      id: 'CLM-PLASSEY-009',
      isLegacy: true,
      claim: 'Robert Clive forged the signature of Admiral Charles Watson on a fictitious Red Treaty to deceive merchant Omichund after he demanded 5% of the Nawab\'s treasury.',
      source: 'Clive\'s Sworn Parliamentary Testimony (1772), Vol. 3, pp. 148–155; Luke Scrafton (1763)',
      verification: 'true',
      explanation: 'Clive admitted under oath before Parliament that he directed secretary Henry Lushington to forge Admiral Watson\'s signature on the fake red-paper treaty to prevent Omichund from exposing the plot.',
      confidence: 0.99,
    },
    {
      id: 'CLM-PLASSEY-010',
      isLegacy: true,
      claim: 'On 4 June 1757, Mir Jafar signed the secret treaty with the EIC, promising £2,250,000 (2.2 crore rupees) in reparations and subsidies, the zamindari of 24 Parganas, and vast private bribes to Clive and council.',
      source: 'C.U. Aitchison, Treaties, Vol. II, pp. 23–27; Parliamentary Report (1773), Committee of Secrecy',
      verification: 'true',
      explanation: 'Mir Jafar pledged one crore rupees for Calcutta losses, 77 lakh rupees for merchants, £234,000 in personal cash to Clive, and the territorial tax base of the 24 Parganas.',
      confidence: 0.98,
    },
    {
      id: 'CLM-PLASSEY-011',
      isLegacy: true,
      claim: 'At Plassey on 23 June 1757, Siraj\'s army numbered approximately 50,000 men with 53 heavy guns, while Clive commanded approximately 3,000 men and 8 light six-pounders inside Lakshmipur Mango Grove.',
      source: 'Robert Orme, Military Transactions (1778), Vol. 2, pp. 168–178; S.C. Hill, Vol. 2',
      verification: 'true',
      explanation: 'Tactical numbers demonstrate a massive nominal disparity (50,000 vs 3,000); however, over 70% of the Nawab\'s army was commanded by conspirators pledged not to engage.',
      confidence: 0.97,
    },
    {
      id: 'CLM-PLASSEY-012',
      isLegacy: true,
      claim: 'A 45-minute rainstorm at noon on 23 June 1757 was the critical tactical turning point of the battle, soaking the Nawab\'s gunpowder while EIC tarpaulins preserved Company ammunition dry.',
      source: 'Robert Orme, Military Transactions, Vol. 2, p. 173; Luke Scrafton (1763), p. 91',
      verification: 'true',
      explanation: 'The midday cloudburst disabled the Nawab\'s 53 heavy guns; British tarpaulins kept field piece cartridges dry, leading to the artillery ambush that decided the field.',
      confidence: 0.95,
    },
    {
      id: 'CLM-PLASSEY-013',
      isLegacy: true,
      claim: 'Believing British guns were equally silenced by the rain, loyal vanguard general Mir Madan charged Clive\'s position and was mortally wounded by British grape-shot.',
      source: 'Ghulam Husain Tabatabai, Siyar-ul-Mutakhkherin, Vol. 2, pp. 231–234; Orme, Vol. 2, p. 174',
      verification: 'true',
      explanation: 'Mir Madan\'s charge into unmasked canister fire shattered his leg; his death in Siraj\'s tent removed the Nawab\'s only capable loyal commander and broke Siraj\'s psychological resolve.',
      confidence: 0.95,
    },
    {
      id: 'CLM-PLASSEY-014',
      isLegacy: true,
      claim: 'Following Mir Madan\'s death, Mir Jafar swore falsely upon the Quran to protect Siraj, urged an immediate retreat to camp, and secretly sent a rider urging Clive to assault the retreating army.',
      source: 'Ghulam Husain Tabatabai, Siyar, Vol. 2, pp. 233–236; S.C. Hill, Vol. 2, p. 434 (Mir Jafar to Clive)',
      verification: 'true',
      explanation: 'The decisive battlefield turning point was an act of treason disguised as tactical advice, inducing Siraj to issue the fatal order to cease fire and retreat.',
      confidence: 0.96,
    },
    {
      id: 'CLM-PLASSEY-015',
      isLegacy: true,
      claim: 'Throughout the entire engagement, 35,000 troops under Mir Jafar, Rai Durlabh, and Yar Latif stood entirely motionless on the Nawab\'s left flank, refusing orders to engage.',
      source: 'Robert Orme, Military Transactions, Vol. 2, pp. 174–177; Clive Dispatch to Secret Committee, 26 July 1757',
      verification: 'true',
      explanation: 'Over 70% of the Nawab\'s army watched Clive advance and Mir Madan fall without drawing a sword or firing a musket, fulfilling the secret pact with the EIC.',
      confidence: 0.98,
    },
    {
      id: 'CLM-PLASSEY-016',
      isLegacy: true,
      claim: 'Clive\'s actual combat casualties at Plassey were 22 killed and 50 wounded (of whom 18 were Indian sepoys); the engagement was decided in under six hours with minimal tactical attrition.',
      source: 'Clive\'s Return of Casualties, 24 June 1757, British Library IOR/H/193, p. 211; Orme, Vol. 2, p. 177',
      verification: 'true',
      explanation: 'The official British casualty returns confirm that Plassey was a low-attrition skirmish rather than a titanic military clash, reflecting pre-arranged paralysis rather than open field combat.',
      confidence: 0.99,
    },
    {
      id: 'CLM-PLASSEY-017',
      isLegacy: true,
      claim: 'Siraj ud-Daulah fled to Murshidabad, was captured near Rajmahal a week later, and was assassinated on 2 July 1757 on orders of Mir Jafar\'s son Miran.',
      source: 'Ghulam Husain Tabatabai, Siyar, Vol. 2, pp. 238–242; S.C. Hill, Vol. 1, p. clxxiv; Dalrymple (2019)',
      verification: 'true',
      explanation: 'The captured Nawab was brought back to Murshidabad and murdered by Muhammad Ali Beg under Miran\'s orders, extinguishing independent Mughal dynastic rule in Bengal.',
      confidence: 0.97,
    },
    {
      id: 'CLM-PLASSEY-018',
      isLegacy: true,
      claim: 'Following Mir Jafar\'s installation, treasury shortages led Jagat Seths to broker an agreement paying half the 2.2 crore indemnity immediately and assigning the remainder in land revenues over three years.',
      source: 'Parliamentary Report (1773), Third Report, pp. 312–318; Sushil Chaudhury (2000), pp. 120–135',
      verification: 'true',
      explanation: 'The treasury contained only 1.5 crore rupees; the resulting silver drain depleted circulating coinage by over £5 million over a decade, devastating Bengal\'s rural economy.',
      confidence: 0.96,
    },
    {
      id: 'CLM-PLASSEY-019',
      isLegacy: true,
      claim: "Modern economic and imperial historians characterize Plassey not as an English military conquest, but as an internal coup d'état and commercial deal financed by Indian banking capital that subsequently escaped control.",
      source: 'P.J. Marshall (1987); Sushil Chaudhury (2000); C.A. Bayly (1988); William Dalrymple (2019)',
      verification: 'true',
      explanation: 'Consensus among modern specialists confirms that European arms were hired by Indian commercial and aristocratic elites to depose Siraj; European imperial rule was an unintended macro-historical consequence.',
      confidence: 0.98,
    },
  ],
  sources: [
    { name: 'Sushil Chaudhury, The Prelude to Empire: Plassey Revolution of 1757 (Manohar, 2000)', url: 'https://worldcat.org/title/44585145', type: 'scholarly_monograph', tier: 1 },
    { name: 'P.J. Marshall, Bengal: The British Bridgehead (Cambridge University Press, 1987)', url: 'https://cambridge.org/core/books/bengal-the-british-bridgehead/3BEBF09026D77EC824F3A51F5F58D37C', type: 'scholarly_monograph', tier: 1 },
    { name: 'Sayyid Ghulam Husain Tabatabai, Siyar-ul-Mutakhkherin (trans. Raymond, 1789)', url: 'https://archive.org/details/seirmutaqherin02ghul', type: 'contemporary_chronicle', tier: 1 },
    { name: 'S.C. Hill (ed.), Bengal in 1756-1757 (3 vols., Indian Records Series, John Murray, 1905)', url: 'https://archive.org/details/bengalin17565701hilluoft', type: 'primary_records', tier: 1 },
    { name: 'Robert Orme, A History of the Military Transactions of the British Nation in Indostan (1778)', url: 'https://archive.org/details/historyofmilitar02orme', type: 'contemporary_history', tier: 1 },
    { name: 'Reports of the Select Committee and Committee of Secrecy, House of Commons (1772–1773)', url: 'https://parliament.uk', type: 'parliamentary_inquest', tier: 1 },
    { name: 'J.H. Little, The House of Jagatseth (Calcutta Historical Society, 1967)', url: 'https://worldcat.org/title/255294520', type: 'scholarly_monograph', tier: 2 },
    { name: 'William Dalrymple, The Anarchy: The Relentless Rise of the East India Company (Bloomsbury, 2019)', url: 'https://bloomsbury.com/the-anarchy-9781408864371', type: 'scholarly_synthesis', tier: 2 },
  ],
  charts: [
    {
      type: 'bar',
      title: 'Nominal Forces vs. Actively Engaged Combatants at Plassey (1757)',
      data: [
        { faction: 'Nawab Total Strength', count: 50000, engaged: 15000 },
        { faction: 'Conspirators (Idle)', count: 35000, engaged: 0 },
        { faction: 'Loyal Vanguard (Mir Madan)', count: 12000, engaged: 12000 },
        { faction: 'British EIC Force', count: 3000, engaged: 3000 },
      ],
      xKey: 'faction',
      yKey: 'count',
    },
  ],
  faq: [
    {
      question: 'Was the Battle of Plassey a great military clash?',
      answer: 'No. Tactical casualties on the British side were just 22 killed and 50 wounded. Over 35,000 of the Nawab\'s 50,000 troops stood motionless under Mir Jafar and Rai Durlabh due to a pre-arranged secret treaty signed on 4 June 1757.',
    },
    {
      question: 'Who really orchestrated the regime change in Bengal?',
      answer: 'The conspiracy was primarily initiated and financed by the House of Jagat Seth (Seth Mahtab Rai and Maharaja Swarup Chand), along with finance minister Rai Durlabh and commander Mir Jafar, who felt their capital and lives were threatened by Siraj ud-Daulah\'s volatile rule.',
    },
    {
      question: 'What was the Red Treaty and the White Treaty?',
      answer: 'When middleman Omichund threatened to reveal the plot unless promised 5% of the Nawab\'s treasury, Robert Clive created two treaties: a fake red-paper agreement with Admiral Watson\'s forged signature promising the bribe, and a genuine white-paper agreement that excluded him entirely.',
    },
    {
      question: 'Did Plassey immediately establish the British Raj in India?',
      answer: 'No. Mir Jafar was installed as an ostensibly sovereign Mughal Nawab, not a colonial governor. True British territorial and administrative sovereignty did not develop until the Battle of Buxar (1764) and the Diwani grant of 1765.',
    },
  ],
  takeaway: 'The Battle of Plassey was settled not by gunfire in a mango grove, but in the counting houses of Murshidabad months earlier. European colonialism in India began not with an invincible army, but with an internal elite coup financed by Indian merchant capital.',
  whoIsAffected: 'The entire population of the Bengal Subah and ultimately the Indian subcontinent, as the fiscal bleeding of Bengal provided the capital base that funded the British East India Company\'s conquest of India.',
  location: 'Palashi, Nadia District, West Bengal',
  relatedStories: [
    {
      slug: 'accountability-in-india',
      headline: 'When Something Goes Wrong, Who Actually Answers?',
      summary: 'From the Ariyalur rail disaster to modern audit reports, tracing how Indian institutions assign and evade responsibility.',
      publishedAt: '2026-09-27T10:00:00Z',
      readingTime: 18,
      evidenceScore: 95,
      category: 'governance',
    },
  ],
  relatedEntities: [
    { id: 'east-india-company', slug: 'east-india-company', name: 'Honourable East India Company', type: 'organization' },
    { id: 'robert-clive', slug: 'robert-clive', name: 'Robert Clive, Baron Clive of Plassey', type: 'person' },
    { id: 'siraj-ud-daulah', slug: 'siraj-ud-daulah', name: 'Mirza Muhammad Siraj ud-Daulah', type: 'person' },
    { id: 'mir-jafar', slug: 'mir-jafar', name: 'Mir Jafar Ali Khan', type: 'person' },
    { id: 'jagat-seth', slug: 'jagat-seth', name: 'House of Jagat Seth', type: 'organization' },
  ],
  blocks: plasseyStoryBlocks,
};

export const plasseyEntities: (import('./types').APIEntity & { publicationStatus?: 'draft' | 'published' })[] = [
  {
    id: 'east-india-company',
    slug: 'east-india-company',
    name: 'Honourable East India Company',
    type: 'organization',
    publicationStatus: 'draft',
    description: 'English joint-stock charter company founded in 1600. Originally formed for trade in the Indian Ocean region, the EIC acquired vast territorial sovereignty across India following the Battle of Plassey (1757) and the grant of the Diwani (1765), operating its own private standing army until dissolved under the Government of India Act 1858.',
    aliases: ['EIC', 'Honourable East India Company', 'John Company', 'British East India Company'],
    updatedAt: '2026-10-20T12:00:00Z',
    image: '/images/placeholders/organization-placeholder.svg',
    storyCount: 1,
    evidenceScore: 96,
    timeline: [
      { date: '1600-12-31', title: 'Royal Charter', description: 'Queen Elizabeth I grants charter to the Company of Merchants of London trading into the East Indies.' },
      { date: '1717-01-01', title: 'Farrukhsiyar Farman', description: 'Mughal Emperor grants duty-free trading rights (dastaks) in Bengal.' },
      { date: '1757-06-23', title: 'Battle of Plassey', description: 'EIC forces under Robert Clive defeat Nawab Siraj ud-Daulah via internal conspiracy.' },
      { date: '1765-08-12', title: 'Treaty of Allahabad', description: 'Emperor Shah Alam II grants the Diwani (right to collect revenue) of Bengal, Bihar, and Orissa to the EIC.' },
    ],
    statistics: {
      'Founded': '1600',
      'Force at Plassey': '3,000 men',
      'Territorial Governance': '1765–1858',
    },
    relatedStories: [
      {
        slug: 'before-the-battle-plassey-1757',
        headline: 'Before the Battle: How Bengal Was Bought Before Plassey Was Fought',
        summary: 'How the House of Jagat Seth, Robert Clive, and a disaffected Mughal nobility bought an empire before a single cannon fired.',
        publishedAt: '2026-10-20T12:00:00Z',
        readingTime: 16,
        evidenceScore: 96,
        category: 'history',
      },
    ],
    relatedEntities: [
      { id: 'robert-clive', slug: 'robert-clive', name: 'Robert Clive', type: 'person' },
      { id: 'jagat-seth', slug: 'jagat-seth', name: 'House of Jagat Seth', type: 'organization' },
    ],
    faq: [
      {
        question: 'What was the East India Company\'s status in Bengal before Plassey?',
        answer: 'The EIC operated under an imperial 1717 Farman granting duty-free sea trade, but employees extensively abused dastaks for private, untaxed domestic trade in inland commodities.',
      },
    ],
  },
  {
    id: 'robert-clive',
    slug: 'robert-clive',
    name: 'Robert Clive, Baron Clive of Plassey',
    type: 'person',
    publicationStatus: 'draft',
    description: 'Major-General Robert Clive (1725–1774), British military officer and Governor of the Bengal Presidency. Commanded the EIC forces at Plassey in 1757, negotiated the secret treaty with Mir Jafar, and acquired immense personal wealth from the Murshidabad treasury.',
    aliases: ['Lord Clive', 'Robert Clive', 'Clive of India'],
    updatedAt: '2026-10-20T12:00:00Z',
    image: '/images/placeholders/person-placeholder.svg',
    storyCount: 1,
    evidenceScore: 95,
    timeline: [
      { date: '1725-09-29', title: 'Birth', description: 'Born in Shropshire, England.' },
      { date: '1757-02-09', title: 'Treaty of Alinagar', description: 'Clive recaptures Calcutta and signs peace treaty with Siraj ud-Daulah.' },
      { date: '1757-06-04', title: 'Secret Treaty with Mir Jafar', description: 'Clive signs secret treaty pledging British military intervention in exchange for massive indemnities.' },
      { date: '1757-06-23', title: 'Battle of Plassey', description: 'Commands British and sepoy force during the engagement at Palashi.' },
      { date: '1772-05-10', title: 'Parliamentary Inquest', description: 'Defends his actions and wealth extraction before the House of Commons Select Committee.' },
    ],
    statistics: {
      'Rank': 'Major-General',
      'Personal Bounty from Plassey': '£234,000',
      'Annual Jagir': '£27,000',
    },
    relatedStories: [
      {
        slug: 'before-the-battle-plassey-1757',
        headline: 'Before the Battle: How Bengal Was Bought Before Plassey Was Fought',
        summary: 'How the House of Jagat Seth, Robert Clive, and a disaffected Mughal nobility bought an empire before a single cannon fired.',
        publishedAt: '2026-10-20T12:00:00Z',
        readingTime: 16,
        evidenceScore: 96,
        category: 'history',
      },
    ],
    relatedEntities: [
      { id: 'east-india-company', slug: 'east-india-company', name: 'Honourable East India Company', type: 'organization' },
      { id: 'mir-jafar', slug: 'mir-jafar', name: 'Mir Jafar Ali Khan', type: 'person' },
    ],
    faq: [
      {
        question: 'What was Robert Clive\'s role in the Murshidabad conspiracy?',
        answer: 'Clive commanded the military expedition from Madras and acted as the armed executor of the regime change, negotiating the Secret Treaty with Mir Jafar and forging the Red Treaty to deceive Omichund.',
      },
    ],
  },
  {
    id: 'siraj-ud-daulah',
    slug: 'siraj-ud-daulah',
    name: 'Mirza Muhammad Siraj-ud-Daulah',
    type: 'person',
    publicationStatus: 'draft',
    description: 'The last independent Nawab of Bengal, Bihar, and Orissa (1733–1757). Succeeded his maternal grandfather Alivardi Khan in April 1756. Captured Calcutta in June 1756 to curb unauthorized British fortifications and dastak abuse; betrayed by his commanders and deposed at Plassey in June 1757.',
    aliases: ['Siraj ud-Daulah', 'Siraj-ud-Daula', 'Nawab of Bengal'],
    updatedAt: '2026-10-20T12:00:00Z',
    image: '/images/placeholders/person-placeholder.svg',
    storyCount: 1,
    evidenceScore: 95,
    timeline: [
      { date: '1733-01-01', title: 'Birth', description: 'Born to Zain ud-Din Ahmed Khan and Amina Begum.' },
      { date: '1756-04-09', title: 'Accession', description: 'Ascends the masnad of Murshidabad following Alivardi Khan\'s death.' },
      { date: '1756-06-20', title: 'Capture of Calcutta', description: 'Storms Fort William after British refuse to halt illegal fortifications.' },
      { date: '1757-06-23', title: 'Battle of Plassey', description: 'Defeated following betrayal by Mir Jafar and Rai Durlabh.' },
      { date: '1757-07-02', title: 'Assassination', description: 'Captured near Rajmahal and executed in Murshidabad on Miran\'s orders.' },
    ],
    statistics: {
      'Reign': 'April 1756 – June 1757',
      'Capital': 'Murshidabad',
      'Forces at Plassey': '50,000 men (nominal)',
    },
    relatedStories: [
      {
        slug: 'before-the-battle-plassey-1757',
        headline: 'Before the Battle: How Bengal Was Bought Before Plassey Was Fought',
        summary: 'How the House of Jagat Seth, Robert Clive, and a disaffected Mughal nobility bought an empire before a single cannon fired.',
        publishedAt: '2026-10-20T12:00:00Z',
        readingTime: 16,
        evidenceScore: 96,
        category: 'history',
      },
    ],
    relatedEntities: [
      { id: 'mir-jafar', slug: 'mir-jafar', name: 'Mir Jafar Ali Khan', type: 'person' },
      { id: 'jagat-seth', slug: 'jagat-seth', name: 'House of Jagat Seth', type: 'organization' },
    ],
    faq: [
      {
        question: 'Why did Siraj ud-Daulah attack Calcutta in 1756?',
        answer: 'To protect provincial sovereignty against unauthorized British fortification and exchequer losses from the pervasive abuse of trade passes (dastaks).',
      },
    ],
  },
  {
    id: 'mir-jafar',
    slug: 'mir-jafar',
    name: 'Mir Jafar Ali Khan',
    type: 'person',
    publicationStatus: 'draft',
    description: 'Commander-in-Chief (Mir Bakshi) of the Bengal army under Alivardi Khan and Siraj-ud-Daulah. Orchestrated the secret coalition with the East India Company and the House of Jagat Seth, immobilizing 35,000 troops at Plassey in exchange for the Nawabship. Ruled as British puppet Nawab (1757–1760, 1763–1765).',
    aliases: ['Mir Jafar', 'Mir Zafar', 'Mir Jafar Ali Khan'],
    updatedAt: '2026-10-20T12:00:00Z',
    image: '/images/placeholders/person-placeholder.svg',
    storyCount: 1,
    evidenceScore: 96,
    timeline: [
      { date: '1757-06-04', title: 'Secret Treaty of Plassey', description: 'Pledges upon the Quran to defect from Siraj ud-Daulah in exchange for the British installing him as Nawab.' },
      { date: '1757-06-23', title: 'Betrayal at Plassey', description: 'Withholds his 35,000 troops from battle and advises Siraj to halt combat after Mir Madan falls.' },
      { date: '1757-06-29', title: 'Installed on Masnad', description: 'Installed as Nawab of Bengal by Robert Clive at Murshidabad.' },
      { date: '1760-10-20', title: 'First Deposition', description: 'Deposed by Company officials due to inability to meet financial demands.' },
      { date: '1763-07-25', title: 'Reinstated', description: 'Reinstated as Nawab during the war against Mir Qasim.' },
    ],
    statistics: {
      'Office': 'Mir Bakshi / Nawab of Bengal',
      'Troops Commanded at Plassey': '35,000 (withheld)',
      'Indemnity Pledged to EIC': '₹2.2 Crore (£2.25M)',
    },
    relatedStories: [
      {
        slug: 'before-the-battle-plassey-1757',
        headline: 'Before the Battle: How Bengal Was Bought Before Plassey Was Fought',
        summary: 'How the House of Jagat Seth, Robert Clive, and a disaffected Mughal nobility bought an empire before a single cannon fired.',
        publishedAt: '2026-10-20T12:00:00Z',
        readingTime: 16,
        evidenceScore: 96,
        category: 'history',
      },
    ],
    relatedEntities: [
      { id: 'siraj-ud-daulah', slug: 'siraj-ud-daulah', name: 'Mirza Muhammad Siraj-ud-Daulah', type: 'person' },
      { id: 'robert-clive', slug: 'robert-clive', name: 'Robert Clive', type: 'person' },
    ],
    faq: [
      {
        question: 'Why did Mir Jafar betray Siraj ud-Daulah?',
        answer: 'Mir Jafar sought the throne of Bengal and felt marginalized after Siraj removed him from supreme military command in favor of Mir Madan.',
      },
    ],
  },
  {
    id: 'jagat-seth',
    slug: 'jagat-seth',
    name: 'House of Jagat Seth',
    type: 'organization',
    publicationStatus: 'draft',
    description: 'The premier banking and mercantile dynasty of 18th-century India, headed during the Plassey era by Seth Mahtab Rai and Maharaja Swarup Chand. Controlled the imperial minting monopoly of the Bengal Subah, financed revenue remittances to Delhi, and bankrolled the 1757 regime change against Siraj-ud-Daulah.',
    aliases: ['Jagat Seth', 'Banker of the World', 'Seth Mahtab Rai', 'Maharaja Swarup Chand'],
    updatedAt: '2026-10-20T12:00:00Z',
    image: '/images/placeholders/organization-placeholder.svg',
    storyCount: 1,
    evidenceScore: 98,
    timeline: [
      { date: '1723-01-01', title: 'Imperial Title Bestowed', description: 'Emperor Muhammad Shah confers the title Jagat Seth (Banker of the World) on Fateh Chand.' },
      { date: '1756-06-01', title: 'Conflict with Siraj', description: 'Siraj ud-Daulah demands massive forced revenue contributions and threatens the house with violence.' },
      { date: '1757-05-01', title: 'Initiates Coup Coalition', description: 'Seth Mahtab Rai and Swarup Chand initiate the conspiracy to replace Siraj with Mir Jafar using EIC forces.' },
      { date: '1757-06-30', title: 'Plassey Financial Settlement', description: 'Brokers the financial compromise dividing Bengal treasury assets to pay Clive and the EIC.' },
      { date: '1763-10-01', title: 'Execution at Monghyr', description: 'Seth Mahtab Rai and Maharaja Swarup Chand executed by Mir Qasim for siding with the British.' },
    ],
    statistics: {
      'Capital (1750s)': '£10,000,000+ (estimated)',
      'Imperial Role': 'Mughal Minting Monopoly & Revenue Remittance',
      'Seat': 'Mahimapur, Murshidabad',
    },
    relatedStories: [
      {
        slug: 'before-the-battle-plassey-1757',
        headline: 'Before the Battle: How Bengal Was Bought Before Plassey Was Fought',
        summary: 'How the House of Jagat Seth, Robert Clive, and a disaffected Mughal nobility bought an empire before a single cannon fired.',
        publishedAt: '2026-10-20T12:00:00Z',
        readingTime: 16,
        evidenceScore: 96,
        category: 'history',
      },
    ],
    relatedEntities: [
      { id: 'east-india-company', slug: 'east-india-company', name: 'Honourable East India Company', type: 'organization' },
      { id: 'mir-jafar', slug: 'mir-jafar', name: 'Mir Jafar Ali Khan', type: 'person' },
    ],
    faq: [
      {
        question: 'Why was the House of Jagat Seth central to Plassey?',
        answer: 'They were the financial backbone of Bengal who initiated and funded the regime change to protect their capital and minting monopoly from Siraj ud-Daulah.',
      },
    ],
  },
];
