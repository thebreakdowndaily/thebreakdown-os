/**
 * THE BREAKDOWN — Flagship Investigative Story
 *
 * Title: Accountability in India
 * Headline: When Something Goes Wrong, Who Actually Answers?
 *
 * Source of Truth: FORENSIC_REWRITE_V2_FINAL.md
 * Audited: 27 September 2026
 */

import type { APIStory } from './types';
import type { StoryBlock } from '@/types/canonical';

export const accountabilityStoryBlocks: StoryBlock[] = [
  // ── ACT I ─────────────────────────────────────────────────────────────
  {
    id: 'ch-act-1',
    type: 'chapter-heading',
    region: 'main',
    data: { title: 'Act I — The Document' },
  },
  {
    id: 'text-act-1-1',
    type: 'text',
    region: 'main',
    data: {
      content: `
        <p>On 22 July 2026, a blue-and-white bound volume was tabled in the Madhya Pradesh Legislative Assembly. It was Comptroller and Auditor General of India Report No. 4 of 2026, and it recorded one of the more difficult numbers in recent Indian governance: ₹1,217.05 crore.</p>
        <p>That was the total pending liability of the Government of Madhya Pradesh for unpaid wages and material costs under the Mahatma Gandhi National Rural Employment Guarantee Act, outstanding as of 31 March 2024. The liability consisted of ₹564.76 crore owed in wages to rural workers and ₹652.29 crore owed for construction materials.</p>
        <p>The performance audit covered five financial years, from 2019–20 through 2023–24. The auditors examined eight of the state's fifty-two districts, sixteen Janpad Panchayats, sixty-four Gram Panchayats, and thousands of muster rolls, bank records, and electronic payment logs.</p>
        <p>What the auditors found was not a collapsed administration. It was something harder to narrate: a system that functioned in disconnected pieces.</p>
        <p>Across the state, ₹54.79 crore — spread across 4,69,489 individual wage transactions — had failed to reach workers because their bank accounts were not mapped to the Aadhaar-Based Payment System operated by the National Payments Corporation of India. The transactions sat rejected or pending bank clearance. The state knew the money had not arrived. The workers knew. The local employment assistants knew. But the payment gateway rejected the accounts, and no manual administrative intervention existed to push them through on time.</p>
        <p>On duplicate, fake, and incorrect job cards, the audit found ₹1.46 crore in irregular wage disbursements across 2,426 cards in the test-checked units. It found that of ₹35.13 lakh in statutory compensation calculated for delayed wages under Section 3(3) of the Act, ₹9.07 lakh had simply never been paid.</p>
        <p>And in the audit's most telling metric, only around two per cent of working rural households managed to secure the statutory guarantee of one hundred days of wage employment in 2023–24. Over the five-year audit period, the proportion completing one hundred days ranged from 1.95 per cent to a COVID-era peak of 5.83 per cent, while between 31 and 46 per cent of households received less than forty days of work.</p>
        <p>The report was not a leak. It was official, public, and tabled before elected legislators. It had been prepared by an institution that draws its constitutional authority from Articles 148 to 151. It would be referred to the Public Accounts Committee.</p>
        <p>The question that the report itself could not answer was simpler than any of its tables:</p>
        <p class="text-xl font-serif font-bold text-white my-4">Who was supposed to fix this? And what happened when they did not?</p>
      `,
    },
  },
  {
    id: 'doc-cag-extract',
    type: 'documentary-evidence',
    region: 'main',
    data: {
      source: 'Comptroller and Auditor General of India',
      date: 'Tabled 22 July 2026',
      documentType: 'Official Audit Report',
      title: 'CAG Report No. 4 of 2026 (Government of Madhya Pradesh)',
      extract: 'Further, the GoMP has a liability of ₹1217.05 crore towards unpaid wages and material costs as of 31 March 2024. The amount includes a liability of ₹54.79 crore (4.7 lakh transactions) towards wages, which was attributable to the non-mapping of beneficiary accounts with Aadhaar... Only around two per cent of households have been provided the full 100 days employment...',
      significance: 'Documents that pending liabilities were officially recorded in state financial registers, while statutory delay compensation was systematically omitted.',
      url: 'https://cag.gov.in/en/audit-report/details/125602',
    },
  },

  // ── ACT II ────────────────────────────────────────────────────────────
  {
    id: 'ch-act-2',
    type: 'chapter-heading',
    region: 'main',
    data: { title: 'Act II — Follow the File' },
  },
  {
    id: 'text-act-2-1',
    type: 'text',
    region: 'main',
    data: {
      content: `
        <p>The MGNREGA is the largest public employment guarantee in the world. Enacted by Parliament in 2005, it operates through every tier of India's administrative hierarchy.</p>
        <p>If a worker's wage does not arrive within fifteen days of muster roll closure, the responsibility chain is mapped by statute and operational guidelines. The Gram Rozgar Sahayak and Panchayat Secretary must record the delay. The Janpad Panchayat's Programme Officer is required to flag the technical failure. The District Programme Coordinator — an Indian Administrative Service officer serving as District Collector — holds statutory authority to coordinate with lead district banks and reconcile accounts. Above the district sits the State Employment Guarantee Council, chaired by the Chief Minister. Above the state sits the Union Ministry of Rural Development, which controls the electronic fund pipeline.</p>
        <p>There is no shortage of oversight. Madhya Pradesh maintains an independent Social Audit Directorate. Between 2019 and 2024, social audit teams examined Gram Panchayats across the state and generated 89,066 distinct audit observations, spanning process violations, financial deviations, and misappropriations.</p>
        <p>What happened to those observations?</p>
        <p>The CAG's findings reveal something more interesting than simple failure.</p>
        <p>In cases involving financial misappropriation that were formally decided for recovery, the administrative follow-through was actually high: 4,450 of 4,521 decided cases resulted in actual recovery. An amount of ₹2.91 crore was recovered, while seventy-one cases, totalling ₹33.37 lakh, remained pending.</p>
        <p>When the duty was specific, the sum quantified, and the recovery process formally initiated, the recovery rate exceeded ninety-eight per cent.</p>
        <p>Yet the broader institutional picture told a completely different story. The CAG examined sixteen major systemic deficiencies that it had flagged in earlier audit cycles. It found that the department had fully resolved exactly none of them. It had partially addressed seven. The remaining nine — including recurring shortfalls in the one hundred days guarantee and unexecuted social audit follow-ups — were carried forward into the next audit cycle.</p>
        <p>The mechanism had worked and stopped short, simultaneously.</p>
        <p>The social audit had detected the problem. The CAG had documented it. The report had been tabled. The legislature had received it. But at no point between the village and the state capital did an audit observation, by itself, impose a consequence on the official who had failed to resolve the systemic payment backlog. The file moved. The Action Taken Reports were drafted. The compliance memos were signed.</p>
      `,
    },
  },
  {
    id: 'quote-failure-responsibility',
    type: 'quote',
    region: 'main',
    data: {
      text: 'Finding a failure is not the same as fixing responsibility.',
      attribution: 'The Breakdown Analytical Core',
    },
  },
  {
    id: 'viz-mgnrega-ledger',
    type: 'mgnrega-ledger',
    region: 'main',
    data: {
      reportingPeriod: '2019–20 to 2023–24 (Five Financial Years)',
      source: 'CAG Report No. 4 of 2026, Government of Madhya Pradesh',
      totalLiability: 1217.05,
      wageLiability: 564.76,
      materialLiability: 652.29,
      stalledTransactionsAmount: 54.79,
      stalledTransactionCount: 469489,
      unpaidDelayCompensation: 9.07,
      calculatedDelayCompensation: 35.13,
      socialAuditObservations: 89066,
      recoveryDecidedCases: 4521,
      recoveryCompletedCases: 4450,
      recoveryPendingCases: 71,
      recoveryPendingAmount: 33.37,
      hundredDaysPct: 1.95,
    },
  },
  {
    id: 'interactive-accountability-chain',
    type: 'accountability-chain',
    region: 'main',
    data: {
      title: 'The Accountability Chain: From Power to Consequence',
      description: 'Ten distinct institutional stages required to translate public power into democratic responsibility.',
    },
  },

  // ── ACT III ───────────────────────────────────────────────────────────
  {
    id: 'ch-act-3',
    type: 'chapter-heading',
    region: 'main',
    data: { title: 'Act III — Accountability Is Not Criminal Guilt' },
  },
  {
    id: 'text-act-3-1',
    type: 'text',
    region: 'main',
    data: {
      content: `
        <p>At this point, a reader might reach the standard, cynical conclusion: no one in Indian government ever answers for anything.</p>
        <p>That conclusion is historically inaccurate. More importantly, it prevents us from understanding how accountability has actually worked.</p>
        <p>On 2 September 1956, two passenger coaches of a train plunged into a river between Jadcherla and Mahbubnagar in what was then Hyderabad State, following a bridge collapse triggered by torrential rains. At least 112 passengers died.</p>
        <p>The Union Railway Minister was Lal Bahadur Shastri. He had not designed the bridge. He had not inspected the track. Yet Shastri immediately tendered his resignation to Prime Minister Jawaharlal Nehru, accepting moral responsibility for the disaster. Nehru declined the offer and persuaded Shastri to withdraw his resignation, arguing that immediate administrative continuity was required.</p>
        <p>Shastri stayed. But three months later, the system failed again.</p>
        <p>On 23 November 1956, the Madras–Tuticorin Express approached Bridge No. 252 over the Marudaiyaru river near Ariyalur, in what is now Tamil Nadu. Flash floods had scoured the foundation beneath a masonry culvert. The bridge gave way. The locomotive and several coaches plunged into the flooded river. More than a hundred passengers died; historical estimates range between 144 and 154 fatalities.</p>
        <p>This time, Shastri refused to be persuaded. On 25 November 1956, he submitted his formal written resignation to Nehru, writing: <em>"It will be good for me and the Government as a whole, if I quietly quit the office I hold."</em></p>
        <p>On 26 November, Nehru announced the resignation in the Lok Sabha. In early December, Nehru wrote to Shastri indicating that he supported the decision, noting in his public remarks that Shastri was in no way personally culpable or technically negligent for the bridge failure. Formal Presidential acceptance was gazetted on 7 December 1956.</p>
        <p>Nehru explained that accepting the resignation was necessary to establish a "healthy democratic convention." The purpose was not to punish Shastri for an act he did not commit. It was to establish that when a catastrophic failure occurs on a national service, the minister leading that service assumes institutional ownership.</p>
        <p>Shastri did not resign because he was convicted of an offence. He resigned because he understood that <strong>political accountability</strong> — the constitutional duty to stand before the public and accept responsibility for an institution — is fundamentally different from <strong>criminal liability</strong>, which requires proof that an individual committed an illegal act with criminal intent.</p>
        <p>That distinction is the key to understanding modern Indian accountability. And it is the distinction that modern Indian public debate has almost entirely forgotten.</p>
      `,
    },
  },
  {
    id: 'doc-nehru-letter',
    type: 'documentary-evidence',
    region: 'main',
    data: {
      source: 'Selected Works of Jawaharlal Nehru, Second Series, Vol. 36, pp. 209–210',
      date: '5 December 1956',
      documentType: 'Official Archival Correspondence',
      title: 'Prime Minister Jawaharlal Nehru to Lal Bahadur Shastri',
      extract: 'I need not tell you how deeply I regret your leaving Government... In accepting your resignation, I do so because I feel that this will set a healthy democratic convention, which is very necessary in the circumstances of our country today.',
      significance: 'Establishes the foundational Indian precedent that high ministerial resignation is an act of institutional stewardship, not an admission of personal criminal guilt.',
      url: 'https://nehruarchive.in/documents/to-lal-bahadur-shastri-5-december-1956-5jp3q',
    },
  },

  // ── ACT IV ────────────────────────────────────────────────────────────
  {
    id: 'ch-act-4',
    type: 'chapter-heading',
    region: 'main',
    data: { title: 'Act IV — Different Courts, Different Consequences' },
  },
  {
    id: 'text-act-4-1',
    type: 'text',
    region: 'main',
    data: {
      content: `
        <p>Once you separate political stewardship, administrative discipline, and criminal liability, the apparent contradictions of modern Indian scandals become legible.</p>
        <h3 class="text-xl font-bold text-white mt-8 mb-4">The 2G Spectrum Allocation: Policy Invalidation Without Criminal Culpability</h3>
        <p>In November 2010, the CAG published Report No. 19 of 2010, examining the allocation of 122 mobile service licences issued by the Department of Telecommunications in 2008. The audit documented that the first-come-first-served policy had been procedurally manipulated: cut-off dates were advanced without public notice, and spectrum had been allocated at entry fees benchmarked to 2001 prices.</p>
        <p>The CAG presented a presumptive loss estimate that reached ₹1.76 lakh crore under one of its valuation approaches, benchmarked against 3G auction prices. That was not a finding that the government had lost ₹1.76 lakh crore in physical cash. It was an estimate of foregone revenue under a specific comparative model.</p>
        <p>On 2 February 2012, the Supreme Court delivered its judgment in <em>Centre for Public Interest Litigation v. Union of India</em>. A bench of Justices G.S. Singhvi and A.K. Ganguly quashed all 122 licences. The Court held that the state's natural resources belong to the public and that the allocation process had been arbitrary, discriminatory, and unconstitutional under Article 14.</p>
        <p>To the public, the matter seemed straightforward: the policy was unconstitutional, and the men who signed the files must be criminals.</p>
        <p>Then came the criminal trial.</p>
        <p>For six years, Special CBI Judge O.P. Saini heard hundreds of witnesses and examined thousands of exhibits. On 21 December 2017, the court acquitted former Telecom Minister A. Raja and sixteen other corporate and bureaucratic co-accused. The judge noted that the prosecution had failed to produce legally admissible evidence establishing a criminal conspiracy or an illicit financial quid pro quo beyond reasonable doubt.</p>
        <p>That trial verdict was not the final word.</p>
        <p>The CBI challenged the acquittal in the Delhi High Court. For six years, the case remained at the "leave to appeal" stage across successive benches. Then, on 22 March 2024, Justice Dinesh Kumar Sharma formally admitted the CBI's appeal, observing that the trial court's judgment contained "some contradictions" warranting "deeper examination." As of September 2026, the appeal is actively before the High Court at the final hearing stage.</p>
        <p>The lesson is not that the courts contradicted each other. The Supreme Court was examining whether an administrative allocation conformed to the constitutional mandate of fairness under Article 14. The trial court was examining whether specific individuals intentionally conspired to commit fraud under the Indian Penal Code and Prevention of Corruption Act.</p>
        <p>An administrative act can be profoundly arbitrary, unlawful, and void without individual decision-makers meeting the high penal threshold for criminal fraud. Conflating the two allowed the public debate to conclude that because criminal guilt was not proved in 2017, nothing unlawful had happened in 2008.</p>
      `,
    },
  },
  {
    id: 'card-evidence-2g',
    type: 'case-evidence',
    region: 'main',
    data: {
      caseId: 'case-2g',
      title: '2G Spectrum Allocation (2008–2026)',
      citation: '(2012) 3 SCC 1 / Crl. L.P. 185/2018',
      event: 'Allocation of 122 UAS unified access service telecom licences in 2008 at 2001 prices using advanced cut-off dates.',
      whatRecordShows: 'Procedural manipulation of first-come-first-served policy; entry fees benchmarked to outdated 2001 rates; presumptive revenue loss calculated by CAG.',
      accountabilityMechanism: 'Constitutional writ litigation under Article 32 (Supreme Court) and penal prosecution under IPC/PCA (Special CBI Court and Delhi High Court).',
      legalStatus: '122 licences quashed by SC in 2012 under Article 14; 2017 trial court acquitted accused; CBI appeal formally admitted by Delhi HC on 22 March 2024, actively sub judice at final hearing stage in 2026.',
      whatItDoesNotEstablish: 'The 2012 civil invalidation did not establish criminal conspiracy; the 2017 acquittal did not establish that the administrative policy was lawful; the pending HC appeal has not determined guilt.',
      sources: [
        { name: 'CAG Report No. 19 of 2010', date: 'Nov 2010', type: 'audit' },
        { name: 'CPIL v. Union of India, (2012) 3 SCC 1', date: '2 Feb 2012', type: 'judgment' },
        { name: 'Special CBI Court Judgment (Judge O.P. Saini)', date: '21 Dec 2017', type: 'judgment' },
        { name: 'Delhi High Court Appeal Admission Order', date: '22 Mar 2024', type: 'court_order' },
      ],
    },
  },
  {
    id: 'text-act-4-2',
    type: 'text',
    region: 'main',
    data: {
      content: `
        <h3 class="text-xl font-bold text-white mt-10 mb-4">Rajkot: The Geography of Blame</h3>
        <p>On 25 May 2024, fire swept through the TRP Game Zone in Rajkot, Gujarat — an entertainment facility fabricated from corrugated tin sheets and steel trusses, housing go-karts, trampolines, and hundreds of litres of fuel. Twenty-seven people died. Nine of them were children.</p>
        <p>Within forty-eight hours, five junior municipal and police personnel — town planning assistants and fire sub-officers — were suspended and arrested.</p>
        <p>Then the Gujarat High Court initiated a <em>suo motu</em> public interest litigation (<em>PIL No. 71 of 2024</em>). Examining municipal records, the division bench discovered that the facility had operated for over three years without a Fire Safety NOC, town planning Building Use (BU) permission, or structural stability certificate. A demolition notice issued a year earlier had sat unexecuted.</p>
        <p>During the hearing on 12 July 2024, the bench asked a question that exposed the administrative allocation of responsibility: why had the municipal commissioners who held statutory authority under the Gujarat Provincial Municipal Corporations Act 1949 not faced the same immediate action as the junior personnel who lacked the legal power to order a demolition?</p>
        <p>That was a judicial question from the bench, not a final finding of guilt against senior officers. But it documented a recognisable administrative pattern: in the immediate aftermath of a public tragedy, blame moves rapidly to the personnel closest to the physical event, while the officers who held statutory decision-making authority are transferred to other departments.</p>
        <p>As of September 2026, the criminal prosecution remains pending. The Special Investigation Team chargesheeted fifteen accused persons — including private partners and municipal officials — under Section 304 Part II of the Indian Penal Code (culpable homicide not amounting to murder). In July 2025, all fifteen pleaded not guilty. Discharge pleas filed by civic officials were rejected by the Sessions Court, the High Court, and the Supreme Court. All accused have secured bail, and the trial is proceeding in the Rajkot Sessions Court.</p>
        <p>The criminal trial will eventually determine whether those fifteen individuals committed an offence. What the court's questioning had already revealed was something different: the formal chain of statutory power did not match the immediate distribution of blame.</p>
      `,
    },
  },
  {
    id: 'card-evidence-rajkot',
    type: 'case-evidence',
    region: 'main',
    data: {
      caseId: 'case-rajkot',
      title: 'Rajkot TRP Game Zone Fire (2024–2026)',
      citation: 'FIR No. 11208055240316/2024 / Gujarat HC PIL 71/2024',
      event: 'Fire at TRP Game Zone in Rajkot on 25 May 2024, resulting in 27 deaths (including 9 children).',
      whatRecordShows: 'Facility operated for over 3 years without Fire Safety NOC, Building Use (BU) permission, or structural certificates; June 2023 demolition notice left unexecuted; unapproved petrol storage.',
      accountabilityMechanism: 'Suo motu judicial review by High Court; SIT criminal investigation under IPC 304 Part II; departmental suspensions under Gujarat Civil Services rules.',
      legalStatus: '15 accused chargesheeted under IPC 304-II; pleaded not guilty in July 2025; discharge pleas dismissed up to Supreme Court; all on bail; trial pending in Rajkot Sessions Court as of September 2026.',
      whatItDoesNotEstablish: 'High Court bench remarks regarding municipal commissioners were judicial questions and oral observations, not a final verdict of guilt or criminal conspiracy against commissioners.',
      sources: [
        { name: 'FIR Rajkot Taluka PS', date: '25 May 2024', type: 'fir' },
        { name: 'Gujarat High Court Order Sheets in PIL 71/2024', date: 'June–July 2024', type: 'court_order' },
        { name: 'SIT Preliminary & Comprehensive Reports', date: '2024', type: 'investigation_report' },
        { name: 'Supreme Court Discharge Dismissal Order', date: 'Late 2025', type: 'court_order' },
      ],
    },
  },
  {
    id: 'text-act-4-3',
    type: 'text',
    region: 'main',
    data: {
      content: `
        <h3 class="text-xl font-bold text-white mt-10 mb-4">Nilabati Behera: The Constitutional Remedy</h3>
        <p>Can the state be forced to answer when its agents take a citizen's life?</p>
        <p>On 1 December 1987, police in Sundergarh district, Odisha, arrested twenty-two-year-old Suman Behera on suspicion of theft. They took him to the Jharposu police outpost. The next morning, his body was found lying across the nearby railway tracks. The police claimed he had escaped custody and been struck by a train.</p>
        <p>Medical evidence contradicted the claim: Suman's body bore multiple lacerations from blunt weapons, inflicted before death.</p>
        <p>His mother, Nilabati Behera, sent a letter to the Supreme Court. The Court converted the letter into a writ petition under Article 32 and ordered an independent inquiry by the District Judge of Sambalpur.</p>
        <p>On 24 March 1993, in <em>Nilabati Behera v. State of Orissa</em>, the Supreme Court delivered a landmark judgment. Justices J.S. Verma and Dr. A.S. Anand held that when the state violates the fundamental right to life under Article 21, the defence of sovereign immunity has no application in public law. The Court awarded ₹1,50,000 in constitutional compensation.</p>
        <p>The significance of <em>Nilabati Behera</em> was not that it convicted the police officers — that remained the task of a separate criminal trial. Its importance was that it established <strong>strict state liability in public law</strong>: the state as an institution owes an immediate financial and constitutional debt to the citizen whenever its agents abuse public power, regardless of how long individual criminal proceedings take to resolve.</p>
      `,
    },
  },
  {
    id: 'card-evidence-nilabati',
    type: 'case-evidence',
    region: 'main',
    data: {
      caseId: 'case-nilabati',
      title: 'Custodial Death of Suman Behera (1987–1993)',
      citation: 'Nilabati Behera v. State of Orissa, 1993 2 SCC 746',
      event: 'Custodial death of 22-year-old Suman Behera at Jharposu police outpost, Odisha, in December 1987.',
      whatRecordShows: 'Police claimed escape and train accident; medical evidence proved multiple pre-mortem lacerations inflicted with blunt weapons while in police custody.',
      accountabilityMechanism: 'Article 32 letter-petition converted into writ; judicial inquiry by District Judge; constitutional tort compensation awarded by Supreme Court.',
      legalStatus: 'Supreme Court awarded ₹1,50,000 compensation on 24 March 1993; ruled sovereign immunity cannot shield the state against Article 21 violations.',
      whatItDoesNotEstablish: 'The constitutional compensation ruling under Article 32 was a public law remedy against the state, not a final criminal conviction of the individual police officers, which required a separate trial.',
      sources: [
        { name: 'Nilabati Behera v. State of Orissa, 1993 2 SCC 746', date: '24 Mar 1993', type: 'judgment' },
        { name: 'Inquiry Report of District Judge, Sambalpur', date: '1990', type: 'inquiry_report' },
      ],
    },
  },

  // ── ACT V ─────────────────────────────────────────────────────────────
  {
    id: 'ch-act-5',
    type: 'chapter-heading',
    region: 'main',
    data: { title: 'Act V — Where the Chain Breaks' },
  },
  {
    id: 'text-act-5-1',
    type: 'text',
    region: 'main',
    data: {
      content: `
        <p>When you compare these cases, certain recurring vulnerabilities emerge. They are not universal laws of Indian administration. They are patterns documented in the evidence.</p>
        <p><strong>Fragmented authority.</strong> In Rajkot, the Fire Department, the Town Planning office, the local police, and the electricity discom each held a piece of regulatory oversight. Each produced files showing it had written a letter to another department. No single department padlocked the doors.</p>
        <p>In the MGNREGA system, when an electronic payment fails, the problem sits between the local panchayat, the district administration, the state council, the commercial bank, and the National Payments Corporation of India. Each handles a step; none owns the final delivery of the wage.</p>
        <p><strong>The gap between interim action and final consequence.</strong> Under civil service conduct rules, suspension is an interim administrative measure, not a disciplinary penalty. An officer placed under suspension continues to receive a subsistence allowance while an inquiry proceeds. Whether suspensions routinely convert into formal disciplinary penalties or routinely lapse once public attention shifts is an empirical question that the cases examined here cannot universally answer. What the record does show is that public debate treats suspension as the end of accountability, while service law treats it as the start of a multi-year administrative process.</p>
        <p><strong>Different legal standards for the same event.</strong> The 2G proceedings demonstrate this split. An administrative allocation can be held unconstitutional under Article 14 because it was arbitrary, while the individuals who administered the policy are acquitted in a criminal trial because the prosecution cannot prove criminal intent beyond reasonable doubt. These are not contradictory results; they are different legal standards applied to different questions.</p>
        <p><strong>Retrospective oversight.</strong> The most powerful accountability bodies in India are primarily retrospective. The CAG's 2026 audit examined expenditures incurred between 2019 and 2024. By the time the report was tabled, the district officials who oversaw those accounts had moved to other postings. An audit can document an irregularity with precision; it cannot, by itself, impose a consequence on the decision-maker.</p>
      `,
    },
  },

  // ── ACT VI ────────────────────────────────────────────────────────────
  {
    id: 'ch-act-6',
    type: 'chapter-heading',
    region: 'main',
    data: { title: 'Act VI — Who Pays?' },
  },
  {
    id: 'text-act-6-1',
    type: 'text',
    region: 'main',
    data: {
      content: `
        <p>When responsibility is not fixed on the person who held the power, the cost of the failure does not disappear. It is absorbed by the person who had no power to prevent it.</p>
        <p>In Madhya Pradesh, a delayed MGNREGA wage is not an abstract accounting problem. The Act was designed to provide a legal guarantee of livelihood security to rural households with no financial cushion. When ₹54.79 crore in wages is stalled because of electronic mapping failures, the workers carry the financial cost of that administrative gap until the state resolves the issue. The ₹1,217.05 crore in total pending liabilities represents physical labour completed and materials supplied for which payment remained outstanding on the state's audited balance sheet.</p>
        <p>In Rajkot, the cost was borne by the twenty-seven people who entered an entertainment facility that had operated for three years without statutory clearances. Their families spent the night of 25 May 2024 outside a civil hospital mortuary, providing DNA samples for identification.</p>
        <p>In Sundergarh, the cost was borne by Nilabati Behera, who lost her twenty-two-year-old son in police custody and waited more than five years for the Supreme Court to establish state liability.</p>
        <p>The cost of a public failure is never zero. It is simply shifted from the institution that made the decision to the citizen who had no way to avoid it.</p>
      `,
    },
  },

  // ── ACT VII ───────────────────────────────────────────────────────────
  {
    id: 'ch-act-7',
    type: 'chapter-heading',
    region: 'main',
    data: { title: 'Act VII — When Accountability Works' },
  },
  {
    id: 'text-act-7-1',
    type: 'text',
    region: 'main',
    data: {
      content: `
        <p>The evidence does not support the conclusion that accountability mechanisms in India never work. Several of the cases examined here demonstrate the opposite.</p>
        <p>Shastri's resignation in 1956 remains the clearest historical example of political accountability operating as it was designed to operate. The minister accepted institutional ownership of the disaster. The consequence was swift — twelve days from the event to formal acceptance. It did not require an FIR, a chargesheet, or a judicial order. It required a political culture that recognized that high office carries public responsibility for departmental failure.</p>
        <p>In the MGNREGA social audit system, the recovery record in decided financial misappropriation cases is a documented institutional success. Between 2019 and 2024, of 4,521 financial cases decided for recovery in Madhya Pradesh, 4,450 resulted in actual recovery. When the issue was financial, the amount quantified, and the recovery process formally completed, the mechanism worked.</p>
        <p>In Andhra Pradesh, the institutionalization of social audits through the Society for Social Audit, Accountability and Transparency (SSAAT) demonstrated that audits can produce operational results when linked to mandatory public hearings. By conducting audits through independent village youth and requiring officials to answer publicly at mandal-level hearings, the system documented irregularities and recovered tens of crores of rupees.</p>
        <p>In <em>Nilabati Behera</em>, the Supreme Court showed that constitutional remedies can bypass the procedural delays of civil litigation. An ordinary tort suit against the state for custodial death takes decades in a district court. Under Article 32, the Court established strict state liability and awarded compensation within five years.</p>
        <p>In the 2G case, the Supreme Court's 2012 ruling permanently changed how public resources are distributed. By establishing that discretionary ministerial allocation of scarce public assets violates Article 14, the Court compelled subsequent governments to use open, electronic auctions for commercial spectrum and natural resources.</p>
        <p class="font-bold text-white text-base sm:text-lg my-4">The common factor across these successes:</p>
        <p class="text-base text-neutral-200 border-l-2 border-emerald-500 pl-4 py-2 bg-emerald-950/20 rounded-r-lg">
          <strong>Accountability produces a result when the statutory duty is explicit, the forum is external to the department under scrutiny, and the remedy does not depend on proving personal criminal intent.</strong>
        </p>
      `,
    },
  },

  // ── ACT VIII ──────────────────────────────────────────────────────────
  {
    id: 'ch-act-8',
    type: 'chapter-heading',
    region: 'main',
    data: { title: 'Act VIII — What the Evidence Actually Establishes' },
  },
  {
    id: 'callout-evidentiary-box',
    type: 'callout',
    region: 'main',
    data: {
      variant: 'why-it-matters',
      title: 'Evidentiary Audit Standard: Three Distinctions',
      content: '1. Established Fact: India possesses extensive formal oversight bodies; CAG Report 4/2026 establishes ₹1,217.05 cr pending liability and ₹54.79 cr blocked transactions; SC quashed 122 2G licences under Art 14; Nilabati established strict state liability. 2. Strong Evidence: Detection functions better than follow-through; immediate action targets junior personnel while senior officers are transferred. 3. Not Established: "Nobody is ever held accountable" (refuted by recoveries and rulings); "Audit observations equal proven crime" (audits flag deviations, not mens rea).',
    },
  },
  {
    id: 'text-act-8-1',
    type: 'text',
    region: 'main',
    data: {
      content: `
        <p>The evidence does not support the assertion that Indian governance lacks oversight mechanisms. The country has created an elaborate apparatus of audits, inquiries, and judicial review.</p>
        <p>What the evidence does establish is that this apparatus operates with uneven traction.</p>
        <p>Public debate routinely confuses political stewardship with criminal guilt. Because senior officials are rarely convicted in criminal trials, institutions frequently assert that no administrative or political responsibility exists at all. At the same time, departmental inquiries are governed by service rules whose procedural safeguards convert immediate administrative failures into years of paper exchange.</p>
        <p>The result is an administrative environment that penalises action more than inaction. An official who makes a discretionary decision risks multiple investigative inquiries, while an official who defers action, signs routine memos, and allows an unapproved establishment to operate risks little more than an administrative transfer to another desk.</p>
      `,
    },
  },

  // ── ACT IX ────────────────────────────────────────────────────────────
  {
    id: 'ch-act-9',
    type: 'chapter-heading',
    region: 'main',
    data: { title: 'Act IX — Return to the Opening Question' },
  },
  {
    id: 'text-act-9-1',
    type: 'text',
    region: 'main',
    data: {
      content: `
        <p>Comptroller and Auditor General Report No. 4 of 2026 is a public document. It rests in the legislative library in Bhopal. It has been referred to the Public Accounts Committee. The tables are printed, verified, and available for any citizen to inspect.</p>
        <p>The state knows the wages were delayed. It knows the Aadhaar accounts were not mapped. It knows the statutory compensation was not paid. It has published dozens of pages documenting how the administrative machinery stalled.</p>
        <p class="font-bold text-white text-lg my-2">Did anyone answer for it?</p>
        <p>Not in the way that matters most. The social audit detected the failure. The CAG documented it. The legislature received the report. But the systemic deficiencies documented in earlier audit cycles remain unresolved in the next. The Action Taken Reports are prepared. The compliance memos are signed.</p>
        <p>A democracy does not prove its strength by the number of oversight bodies it creates, or by the volume of audit reports it produces after a failure occurs.</p>
        <p>It proves its strength by whether an ordinary citizen, having performed their duty under the law, can find someone who is obliged to answer when the state fails in its duty to them.</p>
        <p class="text-neutral-300 font-serif text-lg leading-relaxed mt-6">Until the chain from power to duty to consequence is unbroken, the file will keep moving from desk to desk — meticulously initialled, endlessly audited, and entirely unaccountable.</p>
      `,
    },
  },

  // ── SOURCES & METHODOLOGY BLOCK ───────────────────────────────────────
  {
    id: 'block-sources-methodology',
    type: 'sources-methodology',
    region: 'main',
    data: {
      cases: [
        {
          caseTitle: 'MGNREGA Implementation & Liabilities in Madhya Pradesh',
          primarySource: 'Comptroller and Auditor General of India, Report No. 4 of 2026',
          secondarySource: 'NREGASoft Public Portal & Social Audit Unit (SAU) Bhopal Ledgers',
          date: 'Tabled 22 July 2026',
          category: 'AUDIT FINDING',
          whatSourceEstablishes: 'Establishes ₹1,217.05 cr pending liabilities (₹564.76 cr wages, ₹652.29 cr materials); ₹54.79 cr / 4.7 lakh blocked transactions; 89,066 social audit paras; 4,450 of 4,521 financial recovery cases completed; and 1.95% reaching 100 days work.',
          url: 'https://cag.gov.in/en/audit-report/details/125602',
        },
        {
          caseTitle: 'Lal Bahadur Shastri Resignation (Ariyalur & Mahbubnagar)',
          primarySource: 'Selected Works of Jawaharlal Nehru, Second Series, Vol. 36, pp. 209–210; Lok Sabha Debates',
          secondarySource: 'Justice Himansu Bose Commission of Inquiry Report (1957)',
          date: 'Sept–Dec 1956',
          category: 'FACT',
          whatSourceEstablishes: 'Establishes that Shastri offered resignation after Mahbubnagar (2 Sept 1956) which Nehru declined; and insisted on resignation after Ariyalur (tendered 25 Nov 1956), which Nehru accepted on 5 Dec 1956 to establish a "healthy democratic convention" without personal criminal guilt.',
          url: 'https://nehruarchive.in/documents/to-lal-bahadur-shastri-5-december-1956-5jp3q',
        },
        {
          caseTitle: '2G Spectrum Allocation & Licences Quashing',
          primarySource: 'Centre for Public Interest Litigation v. Union of India, (2012) 3 SCC 1',
          secondarySource: 'CAG Report No. 19 of 2010 (Union Performance Audit, Civil)',
          date: '2 February 2012',
          category: 'FACT',
          whatSourceEstablishes: 'Establishes that the Supreme Court quashed 122 licences as arbitrary, discriminatory, and unconstitutional under Article 14, establishing strict non-arbitrariness in public resource distribution.',
          url: 'https://sci.gov.in',
        },
        {
          caseTitle: '2G Criminal Trial Acquittal & Delhi High Court Appeal',
          primarySource: 'CBI v. A. Raja & Ors., CC No. 01/2011; Delhi HC Crl. L.P. 185/2018',
          secondarySource: 'Delhi High Court Daily Cause Lists 2025–2026',
          date: '21 Dec 2017 & 22 Mar 2024',
          category: 'FACT',
          whatSourceEstablishes: 'Establishes that Special CBI Court acquitted all 17 accused in 2017 for lack of proved conspiracy, and Delhi High Court formally admitted the CBI appeal on 22 March 2024, with final hearings ongoing in 2026.',
          url: 'https://delhihighcourt.nic.in',
        },
        {
          caseTitle: 'Rajkot TRP Game Zone Fire & Judicial Questioning',
          primarySource: 'Gujarat High Court Order Sheets in Suo Motu PIL No. 71 of 2024',
          secondarySource: 'FIR No. 11208055240316/2024 & SIT Reports',
          date: 'May 2024 – Sept 2026',
          category: 'COURT OBSERVATION',
          whatSourceEstablishes: 'Establishes that Gujarat HC bench questioned why Municipal Commissioners were not suspended like junior officers. Confirms 15 accused chargesheeted under IPC 304 Part II, pleaded not guilty, on bail with trial pending.',
        },
        {
          caseTitle: 'Strict State Liability for Custodial Death',
          primarySource: 'Nilabati Behera v. State of Orissa, 1993 2 SCC 746',
          secondarySource: 'Report of District Judge, Sambalpur',
          date: '24 March 1993',
          category: 'FACT',
          whatSourceEstablishes: 'Establishes that sovereign immunity does not apply in public law remedies for Article 21 violations; Supreme Court awarded ₹1,50,000 compensation for custodial death.',
          url: 'https://api.sci.gov.in/jonew/judis/12126.pdf',
        },
        {
          caseTitle: 'Administrative Asymmetry of Inaction',
          primarySource: 'Analysis of Civil Service Conduct Rules & Case Records',
          date: 'September 2026',
          category: 'REPORTER ANALYSIS',
          whatSourceEstablishes: 'Deduction from case records that service rules and anti-corruption standards create higher personal risk for discretionary action than for administrative delay or inaction.',
        },
      ],
    },
  },
];

export const accountabilityStory: APIStory = {
  id: 'accountability-in-india',
  slug: 'accountability-in-india',
  headline: 'When Something Goes Wrong, Who Actually Answers?',
  summary: 'India has created one of the most layered oversight systems in any democracy — auditors, writ courts, vigilance commissions, social audits, and parliamentary panels. Yet between the moment a public system fails and the moment a consequence lands on someone\'s desk, responsibility can dissolve. We followed the trail from an audited ledger in Madhya Pradesh to the Supreme Court to discover where the chain holds and where it stops.',
  heroImage: '/images/placeholders/governance-placeholder.svg',
  publishedAt: '2026-09-27T10:00:00Z',
  updatedAt: '2026-09-27T10:00:00Z',
  readingTime: 14,
  wordCount: 3220,
  author: {
    name: 'The Breakdown Investigative Bureau',
    bio: 'Independent digital investigations into public power, institutions, and state accountability.',
  },
  evidenceScore: 96,
  category: 'governance',
  storyType: 'explainer',
  status: 'verified',
  publicationStatus: 'published',
  tags: [
    'Accountability',
    'CAG',
    'MGNREGA',
    'Supreme Court',
    '2G Spectrum',
    'Rajkot',
    'Lal Bahadur Shastri',
    'Nilabati Behera',
    'Article 21',
    'Governance',
  ],
  primaryEntityId: 'comptroller-and-auditor-general',
  relatedTopicIds: ['governance', 'policy', 'economy', 'judiciary'],
  keyPoints: [
    'CAG Report No. 4 of 2026 recorded ₹1,217.05 crore in pending liabilities under MGNREGA in Madhya Pradesh, with ₹54.79 crore blocked across 4.7 lakh transactions due to Aadhaar non-mapping.',
    'Social audits generated 89,066 observations across MP, achieving 98.4% recovery in decided financial cases (4,450 of 4,521 cases), but zero of sixteen prior systemic deficiencies were fully resolved.',
    'Political accountability (Lal Bahadur Shastri resigning after the 1956 Ariyalur rail disaster) is constitutionally distinct from criminal liability (proof beyond reasonable doubt in penal trials).',
    'The 2012 Supreme Court quashing of 122 2G licences under Article 14 and the 2017 CBI Special Court acquittal demonstrate that administrative illegality and criminal conspiracy are separate legal standards; the CBI appeal remains actively pending in the Delhi High Court in 2026.',
    'Nilabati Behera (1993) established strict state liability in public law under Article 21, piercing sovereign immunity for custodial deaths.',
  ],
  timeline: [
    {
      date: '1956-09-02',
      title: 'Mahbubnagar Rail Accident',
      description: 'Bridge collapse in torrential rains causes 112+ deaths; Railway Minister Lal Bahadur Shastri tenders resignation, but PM Nehru declines.',
      source: 'Lok Sabha Debates',
    },
    {
      date: '1956-11-23',
      title: 'Ariyalur Disaster',
      description: 'Marudaiyaru river bridge collapse claims over 100 lives; Shastri tenders written resignation on 25 Nov, accepted by Nehru on 5 Dec to establish a healthy democratic convention.',
      source: 'Selected Works of Jawaharlal Nehru, Vol. 36',
    },
    {
      date: '1993-03-24',
      title: 'Nilabati Behera Ruling',
      description: 'Supreme Court awards ₹1.5 lakh compensation for custodial death of Suman Behera, ruling sovereign immunity does not apply in Article 21 public law violations.',
      source: '1993 2 SCC 746',
    },
    {
      date: '2010-11-16',
      title: 'CAG 2G Spectrum Audit',
      description: 'CAG Report No. 19 of 2010 tables presumptive revenue loss estimate of up to ₹1.76 lakh crore under 3G auction valuation.',
      source: 'CAG Report 19/2010',
    },
    {
      date: '2012-02-02',
      title: 'Supreme Court Quashes 122 Licences',
      description: 'Supreme Court holds 2008 first-come-first-served 2G allocations arbitrary and unconstitutional under Article 14, mandating open public auctions.',
      source: '(2012) 3 SCC 1',
    },
    {
      date: '2017-12-21',
      title: 'Special CBI Court 2G Acquittal',
      description: 'Trial court acquits all 17 accused for lack of legally proved criminal conspiracy or financial quid pro quo beyond reasonable doubt.',
      source: 'CC No. 01/2011',
    },
    {
      date: '2024-03-22',
      title: 'Delhi High Court Admits 2G Appeal',
      description: 'Justice Dinesh Kumar Sharma formally admits CBI appeal against 2G acquittals, citing contradictions warranting deeper examination; hearings ongoing in 2026.',
      source: 'Crl. L.P. 185/2018',
    },
    {
      date: '2024-05-25',
      title: 'Rajkot TRP Game Zone Fire',
      description: 'Fire claims 27 lives; structure operated for 3+ years without Fire NOC or Building Use permission; 15 accused face trial under IPC 304 Part II.',
      source: 'FIR No. 11208055240316/2024 / PIL 71/2024',
    },
    {
      date: '2026-07-22',
      title: 'CAG Report No. 4 of 2026 Tabled',
      description: 'Performance audit of MGNREGA in MP documents ₹1,217.05 cr pending liabilities and 89,066 social audit observations.',
      source: 'MP Vidhan Sabha Tabled Papers',
    },
  ],
  facts: [
    { label: 'Total Pending MGNREGA Liability (MP)', value: '₹1,217.05 Crore', source: 'CAG Report No. 4 of 2026' },
    { label: 'Unpaid Wages to Rural Workers', value: '₹564.76 Crore', source: 'CAG Report No. 4 of 2026' },
    { label: 'Unpaid Material Costs', value: '₹652.29 Crore', source: 'CAG Report No. 4 of 2026' },
    { label: 'Stalled Aadhaar Transactions', value: '₹54.79 Crore (4.7 Lakh Tx)', source: 'CAG Report No. 4 of 2026' },
    { label: 'Social Audit Recovery Rate (Decided)', value: '98.4% (4,450 / 4,521)', source: 'CAG Report No. 4 of 2026' },
    { label: 'Households Completing 100 Days (2023-24)', value: '1.95%', source: 'CAG Report No. 4 of 2026' },
  ],
  claims: [
    {
      claim: 'Finding a failure in Indian administration automatically results in fixing responsibility on senior officials.',
      source: 'Common Public Assumption',
      verification: 'false',
      explanation: 'Audit reports and court inquiries routinely document structural failures without imposing administrative or penal consequences on decision-makers, as seen in the 16 unresolved MGNREGA audit paras and the initial distribution of blame in Rajkot.',
      confidence: 0.95,
    },
    {
      claim: 'Lal Bahadur Shastri resigned in 1956 because he was legally or criminally culpable for the Ariyalur train disaster.',
      source: 'Popular Historical Misconception',
      verification: 'false',
      explanation: 'Shastri resigned on political principle to set a "healthy democratic convention" of institutional ownership, with Nehru explicitly stating that Shastri was not personally negligent or culpable.',
      confidence: 0.98,
    },
    {
      claim: 'The 2017 trial court acquittal in the 2G case proved that the 2008 spectrum allocation policy was constitutional.',
      source: 'Post-Trial Political Narrative',
      verification: 'misleading',
      explanation: 'The Supreme Court in 2012 had already declared the 2008 allocation arbitrary and unconstitutional under Article 14. The 2017 trial verdict solely determined that the prosecution failed to prove criminal conspiracy beyond reasonable doubt under penal statutes; the CBI appeal against those acquittals was admitted by the Delhi High Court in March 2024 and remains actively sub judice in 2026.',
      confidence: 0.95,
    },
  ],
  sources: [
    { name: 'CAG Report No. 4 of 2026: Performance Audit of MGNREGA in Madhya Pradesh', url: 'https://cag.gov.in/en/audit-report/details/125602', type: 'government', tier: 1 },
    { name: 'Selected Works of Jawaharlal Nehru, Second Series, Vol. 36 (Ariyalur Resignation)', url: 'https://nehruarchive.in/documents/to-lal-bahadur-shastri-5-december-1956-5jp3q', type: 'historical', tier: 1 },
    { name: 'Centre for Public Interest Litigation v. Union of India, (2012) 3 SCC 1', url: 'https://sci.gov.in', type: 'court_order', tier: 1 },
    { name: 'Delhi High Court Order in Crl. L.P. 185/2018 (22 March 2024)', url: 'https://delhihighcourt.nic.in', type: 'court_order', tier: 1 },
    { name: 'Nilabati Behera v. State of Orissa, 1993 2 SCC 746', url: 'https://api.sci.gov.in/jonew/judis/12126.pdf', type: 'court_order', tier: 1 },
    { name: 'Gujarat High Court Suo Motu PIL No. 71 of 2024 (Rajkot Game Zone Fire)', url: 'https://gujarathighcourt.nic.in', type: 'court_order', tier: 1 },
  ],
  charts: [],
  faq: [
    {
      question: 'What is the difference between political accountability and criminal liability?',
      answer: 'Political accountability is the constitutional duty of an elected minister or senior administrator to accept public responsibility for an institution\'s failure, exemplified by Lal Bahadur Shastri\'s 1956 resignation. Criminal liability requires investigating agencies to prove specific criminal intent (mens rea) and illegal acts beyond reasonable doubt in a trial court.',
    },
    {
      question: 'Does suspension of an official mean they have been punished?',
      answer: 'No. Under civil service conduct rules, suspension is an interim administrative measure to facilitate an inquiry, during which the officer continues to receive a subsistence allowance. It is not a formal disciplinary penalty.',
    },
    {
      question: 'Did the CAG find that ₹1.76 lakh crore was stolen in the 2G case?',
      answer: 'No. The CAG Report No. 19 of 2010 calculated a presumptive revenue loss estimate benchmarked against 3G auction prices, representing foregone revenue under a specific comparative model, not physical cash missing from the exchequer.',
    },
  ],
  relatedStories: [
    {
      slug: 'mgnrega-reform',
      headline: 'MGNREGA 2026: The 125-Day Rural Employment Guarantee Explained',
      summary: 'Two decades of India\'s flagship rural employment guarantee scheme and the new legislative framework.',
      publishedAt: '2026-07-23T10:00:00Z',
      readingTime: 14,
      evidenceScore: 94,
      category: 'economy',
    },
    {
      slug: 'fix-judicial-pendency',
      headline: 'Fixing Judicial Pendency in India',
      summary: 'Why millions of cases remain stuck in district and high courts, and how procedural reforms can accelerate justice.',
      publishedAt: '2026-07-10T10:00:00Z',
      readingTime: 12,
      evidenceScore: 92,
      category: 'governance',
    },
  ],
  relatedEntities: [
    { id: 'comptroller-and-auditor-general', slug: 'comptroller-and-auditor-general', name: 'Comptroller and Auditor General of India', type: 'organization' },
    { id: 'supreme-court-of-india', slug: 'supreme-court-of-india', name: 'Supreme Court of India', type: 'organization' },
    { id: 'ministry-of-rural-development', slug: 'ministry-of-rural-development', name: 'Ministry of Rural Development', type: 'organization' },
  ],
  blocks: accountabilityStoryBlocks,
};
