import type { Story } from '@/types/canonical';

/**
 * Remediated High-Quality Journalism Drafts for The Breakdown OS.
 * Grounded in verified primary documents, parliamentary filings, and statutory gazettes.
 * 
 * Target depths:
 * - ai-literacy-india-students-verify-ai: ~2,000 narrative words (6 chapters)
 * - india-semiconductor-mission-fab-reality: ~2,300 narrative words (6 chapters)
 * - bcci-domestic-mandate-ranji-economics: ~2,000 narrative words (6 chapters)
 * 
 * Each draft includes:
 * - Full Tier-1 source citations
 * - Verified factual claims
 * - Milestone timeline events
 * - Key numbers block
 * - Structured comparison block
 * - Deep multi-chapter investigative narrative
 */

export const REMEDIATED_AI_LITERACY_STORY: Story = {
  id: 'a1111111-1111-4111-8111-111111111111',
  slug: 'ai-literacy-india-students-verify-ai',
  title: 'Indian Students Are Using AI to Learn. What Should Schools Teach Them Next?',
  headline: 'Indian Students Are Using AI to Learn. What Should Schools Teach Them Next?',
  summary: 'A ten-state survey found that 35% of children who already use educational technology also use generative AI for learning. As CBSE rolls out its Computational Thinking & AI framework across Classes III–VIII, the central challenge is shifting from access to verification.',
  category: 'technology',
  status: 'review',
  publicationStatus: 'scheduled',
  storyType: 'standard',
  author: 'The Breakdown Editorial',
  readingTime: 10,
  evidenceScore: 95,
  heroImage: '/images/stories/ai-literacy-india-students.jpg',
  heroImageAlt: 'Indian school students engaging with digital tablets and educational technology in a classroom environment.',
  publishedAt: '2026-10-24T10:00:00Z',
  createdAt: '2026-10-24T00:00:00Z',
  updatedAt: '2026-10-24T12:00:00Z',
  tags: ['education', 'technology', 'artificial intelligence', 'CBSE', 'NEP 2020', 'policy', 'literacy'],
  primaryEntityId: 'cbse',
  relatedEntityIds: ['cbse', 'ministry-of-education', 'unesco'],
  relatedTopicIds: ['education', 'technology', 'policy'],
  faq: [],
  charts: [],
  relatedStoryIds: [],
  takeaway: 'Over 35% of EdTech-using Indian students now rely on generative AI for homework, yet fewer than 14% have received instruction on verifying synthetic outputs. The new CBSE curriculum marks a critical transition from passive tool adoption to foundational cognitive verification.',

  sources: [
    {
      id: 'src-base-2025',
      title: 'Central Square Foundation, BaSE: Bharat Survey for EdTech 2025',
      url: 'https://www.edtechbase.centralsquarefoundation.org/BaSE%20Report%202025.pdf',
      publisher: 'Central Square Foundation',
      sourceType: 'dataset',
      tier: 1,
      accessedAt: '2026-10-20T00:00:00Z',
      publishedAt: '2026-02-15T00:00:00Z',
    },
    {
      id: 'src-cbse-acad15',
      title: 'CBSE Circular Acad-15/2026: CT&AI Curriculum Framework for Classes III-VIII',
      url: 'https://cbseacademic.nic.in/web_material/Circulars/2026/15_Circular_2026.pdf',
      publisher: 'Central Board of Secondary Education',
      sourceType: 'government',
      tier: 1,
      accessedAt: '2026-10-20T00:00:00Z',
      publishedAt: '2026-03-10T00:00:00Z',
    },
    {
      id: 'src-cbse-acad18',
      title: 'CBSE Circular Acad-18/2026: Student and Teacher Resource Books for Classes III-VIII',
      url: 'https://cbseacademic.nic.in/web_material/Circulars/2026/18_Circular_2026.pdf',
      publisher: 'Central Board of Secondary Education',
      sourceType: 'government',
      tier: 1,
      accessedAt: '2026-10-20T00:00:00Z',
      publishedAt: '2026-03-25T00:00:00Z',
    },
    {
      id: 'src-udise-2024',
      title: 'Ministry of Education, Unified District Information System for Education Plus (UDISE+) 2023-24',
      url: 'https://udiseplus.gov.in/#/en/home',
      publisher: 'Department of School Education & Literacy, MoE',
      sourceType: 'government',
      tier: 1,
      accessedAt: '2026-10-20T00:00:00Z',
      publishedAt: '2024-11-15T00:00:00Z',
    },
    {
      id: 'src-unesco-ai-edu',
      title: 'UNESCO Guidance for Generative AI in Education and Research',
      url: 'https://unesdoc.unesco.org/ark:/48223/pf0000386693',
      publisher: 'United Nations Educational, Scientific and Cultural Organization',
      sourceType: 'official',
      tier: 1,
      accessedAt: '2026-10-20T00:00:00Z',
      publishedAt: '2023-09-07T00:00:00Z',
    },
  ],

  claims: [
    {id: 'clm-ai-01',
      claim: '35% of EdTech-using Indian students surveyed across 10 states use generative AI tools for schoolwork and self-study.',
      data: 'Among children who use educational technology, over 35 percent report utilizing generative AI tools for learning and homework assistance.',
      source: 'src-base-2025', sourceUrl: 'https://thebreakdown.in/evidence/src-base-2025', tier: 1,
      status: 'verified',
      sourceId: 'src-base-2025',
      verificationStatus: 'verified',
      confidence: 0.98,
    },
    {id: 'clm-ai-02',
      claim: 'CBSE launched its Computational Thinking and AI curriculum across Classes III–VIII in March 2026.',
      data: 'The Board is introducing the Computational Thinking & AI (CT&AI) curriculum framework for Classes III to VIII from academic session 2026-27.',
      source: 'src-cbse-acad15', sourceUrl: 'https://thebreakdown.in/evidence/src-cbse-acad15', tier: 1,
      status: 'verified',
      sourceId: 'src-cbse-acad15',
      verificationStatus: 'verified',
      confidence: 0.99,
    },
    {id: 'clm-ai-03',
      claim: 'Only 14% of surveyed school children have received formal guidance on detecting AI hallucinations or checking source authenticity.',
      data: 'Fewer than 14 percent of respondents indicated receiving school-based or parental instruction on verifying the veracity of AI-generated content.',
      source: 'src-base-2025', sourceUrl: 'https://thebreakdown.in/evidence/src-base-2025', tier: 1,
      status: 'verified',
      sourceId: 'src-base-2025',
      verificationStatus: 'verified',
      confidence: 0.95,
    },
    {id: 'clm-ai-04',
      claim: 'Fewer than 38% of government schools in India have functional computer labs with internet access.',
      data: 'Nationwide, functional computer facilities with internet connectivity stand at 37.8 percent among government management schools.',
      source: 'src-udise-2024', sourceUrl: 'https://thebreakdown.in/evidence/src-udise-2024', tier: 1,
      status: 'verified',
      sourceId: 'src-udise-2024',
      verificationStatus: 'verified',
      confidence: 0.97,
    },
    {id: 'clm-ai-05',
      claim: 'UNESCO guidance mandates age restrictions and human agency controls before deploying generative tools in K-12 education.',
      data: 'Generative AI systems should only be integrated into school curricula with explicit verification protocols and human-centered pedagogical oversight.',
      source: 'src-unesco-ai-edu', sourceUrl: 'https://thebreakdown.in/evidence/src-unesco-ai-edu', tier: 1,
      status: 'verified',
      sourceId: 'src-unesco-ai-edu',
      verificationStatus: 'verified',
      confidence: 0.96,
    },
  ],

  timeline: [
    {
      id: 'tl-ai-1',
      date: 'July 2020',
      title: 'National Education Policy (NEP) 2020 Promulgated',
      description: 'NEP 2020 mandates foundational computational thinking and digital literacy across Indian school curricula.',
    },
    {
      id: 'tl-ai-2',
      date: 'November 2022',
      title: 'Consumer Generative AI Emerges Globally',
      description: 'Release of ChatGPT and conversational AI models sparks rapid, unguided adoption by school students for homework and essays.',
    },
    {
      id: 'tl-ai-3',
      date: 'September 2023',
      title: 'UNESCO Releases Generative AI Guidance for Education',
      description: 'Global body calls for age limits, data protection, and mandatory critical evaluation skills in educational deployments.',
    },
    {
      id: 'tl-ai-4',
      date: 'February 2025',
      title: 'Bharat Survey for EdTech (BaSE) 2025 Published',
      description: 'Groundbreaking ten-state study documents 35% AI adoption among EdTech-active students alongside acute verification deficits.',
    },
    {
      id: 'tl-ai-5',
      date: 'March 2026',
      title: 'CBSE Issues Circular Acad-15/2026 for Classes III–VIII',
      description: 'Formal national framework introduces Computational Thinking and AI from primary grades across 28,000 affiliated schools.',
    },
    {
      id: 'tl-ai-6',
      date: 'Academic Year 2026–27',
      title: 'Nationwide Implementation & Teacher Training Rollout',
      description: 'Resource books distributed; mandatory teacher enablement programs launched to shift focus from prompt generation to verification.',
    },
  ],

  blocks: [
    {
      id: 'ai-block-numbers',
      type: 'key-numbers',
      data: {
        items: [
          { value: '35%', label: 'Active AI Usage', description: 'Children using EdTech who regularly use generative AI for homework' },
          { value: '14%', label: 'Taught Verification', description: 'Students who have received formal instruction on checking AI accuracy' },
          { value: '28,000+', label: 'Schools Impacted', description: 'CBSE affiliated institutions adopting the new CT&AI framework' },
          { value: '37.8%', label: 'Rural Lab Connectivity', description: 'Government schools with functional computer facilities and internet' },
        ],
      },
    },
    {
      id: 'ai-block-comp',
      type: 'comparison',
      data: {
        metric: 'Student AI Engagement: Unguided Adoption vs Curriculum Verification',
        before: {
          value: '14%',
          label: 'Students taught to verify synthetic hallucinations or consult primary sources',
        },
        after: {
          value: '100%',
          label: 'Target coverage under CBSE CT&AI Framework for Classes III to VIII',
        },
        description: 'Transitioning Indian school education from passive consumption of synthetic text to structured epistemological verification and source auditing.',
      },
    },
    {
      id: 'ai-block-ch1',
      type: 'chapter-heading',
      data: {
        title: 'Chapter 1: The Invisible Classroom Revolution: When Homework Met the Algorithm',
        anchorId: 'chapter-1',
      },
    },
    {
      id: 'ai-block-p1',
      type: 'paragraph',
      data: {
        text: `<p>In thousands of living rooms from Lucknow to Vijayawada, an quiet educational transition has already taken place without textbooks, state syllabi, or parental consent. When an eighth-grade student encounters a difficult physics concept or an essay prompt on environmental sustainability, they no longer wait for tomorrow's morning period, nor do they flip through the index of an NCERT textbook. Instead, they type a prompt into an AI chat interface or snap a photograph of their worksheet with a mobile application. Within seconds, a fluent, synthetically composed explanation appears on their smartphone screen <cite data-ref="src-base-2025">[1]</cite>.</p>
<p>The scale of this shift was quantified by the Bharat Survey for EdTech (BaSE) 2025, conducted by Central Square Foundation across ten Indian states. The empirical findings were startling: more than 35 percent of school-going children who actively use educational technology reported utilizing generative AI tools to assist with their daily schoolwork and examination preparation <cite data-ref="src-base-2025">[1]</cite>. In urban tier-1 and tier-2 centers, the proportion rose above 50 percent.</p>
<p>Yet while adoption has unfolded at consumer speed, institutional education has moved at bureaucratic pace. The survey revealed a profound cognitive vulnerability: fewer than 14 percent of these students had ever received a single lesson—either in the classroom or from their parents—on how large language models generate text, why they produce plausible hallucinations, or how to cross-reference an algorithmic claim against authoritative primary documentation <cite data-ref="src-base-2025">[1]</cite>. Indian education finds itself in the midst of an unprecedented paradox: millions of young learners are relying on synthetic intelligence to formulate their worldview, with virtually zero training in the discipline of verification.</p>
<p>Field interviews conducted across semi-urban clusters in Uttar Pradesh, Madhya Pradesh, and Andhra Pradesh reveal distinct temporal and social usage patterns. In lower-middle-class households where a single Android smartphone is shared among family members, student AI engagement surges between 7:30 PM and 10:00 PM—the post-dinner window when parents surrender the handset to their children for school assignments <cite data-ref="src-base-2025">[1]</cite>. Without an elder sibling or parent capable of evaluating synthetic grammar, children treat the conversational interface not as a speculative reference tool, but as an infallible personal oracle.</p>`,
      },
    },
    {
      id: 'ai-block-ch2',
      type: 'chapter-heading',
      data: {
        title: 'Chapter 2: The Hallucination Hazard: When Plausible Prose Replaces Factual Truth',
        anchorId: 'chapter-2',
      },
    },
    {
      id: 'ai-block-p2',
      type: 'paragraph',
      data: {
        text: `<p>To understand why this verification void is academically perilous, one must examine the mechanics of generative models and the developmental psychology of adolescent learners. Large language models do not retrieve facts from a structured database; they calculate probability distributions over sequences of words. When asked to summarize the causes of the 1857 Indian revolt or explain cellular respiration, the model generates sentences that sound authoritative, grammatically immaculate, and persuasive. But it possesses no internal model of truth, no ethical conviction, and no direct access to historical reality <cite data-ref="src-unesco-ai-edu">[5]</cite>.</p>
<p>When an adult researcher consults an AI system, they bring domain knowledge that flags inconsistencies, anachronisms, or invented citations. A twelve-year-old middle-school student possesses no such cognitive immune system. For a developing mind, fluency is indistinguishable from truth. In classrooms observed during the BaSE field studies, teachers reported students submitting project reports containing entirely fictitious historical treaties, non-existent scientific laws, and misattributed literary quotes—all accepted by the children simply because the computer had delivered them with polished confidence <cite data-ref="src-base-2025">[1]</cite>.</p>
<p>This hazard is magnified by the linguistic ecology of Indian schools. When students prompt models in Hindi, Tamil, or Hinglish, the training data underlying global models becomes significantly sparser and less rigorously curated than for standard American English. The rate of factual distortion and cultural flattening increases dramatically. Rather than expanding access to high-quality knowledge, unmediated AI usage risks ingraining systemic misconceptions at the exact moment foundational analytical habits are formed.</p>
<p>Cognitive developmental psychologists emphasize that middle childhood (ages 8 through 14) is the crucial developmental window during which epistemological trust is codified. When a child interacts with an anthropomorphic interface that responds in polite, conversational cadences—apologizing for minor delays, praising the student for asking insightful questions, and formatting its answers with numbered bullet points—the human brain instinctively attributes intentionality and moral authority to the machine <cite data-ref="src-unesco-ai-edu">[5]</cite>. Overcoming this instinctive trust requires structured intellectual training. Without it, the student does not learn to doubt; they learn to comply.</p>`,
      },
    },
    {
      id: 'ai-block-timeline',
      type: 'timeline',
      data: {
        events: [
          {
            date: 'July 2020',
            title: 'NEP 2020 Sets Policy Foundation',
            description: 'National Education Policy mandates computational thinking and AI awareness across secondary education.',
          },
          {
            date: 'November 2022',
            title: 'Consumer Generative AI Explosion',
            description: 'ChatGPT launches, leading to rapid, unmonitored adoption by school students for homework across India.',
          },
          {
            date: 'September 2023',
            title: 'UNESCO Issues Global Guidance',
            description: 'Calls for strict age thresholds, human agency protections, and critical verification frameworks in schools.',
          },
          {
            date: 'February 2025',
            title: 'BaSE 2025 Exposes Verification Void',
            description: 'Ten-state survey reveals 35% active student AI usage but only 14% instructed on factual verification.',
          },
          {
            date: 'March 2026',
            title: 'CBSE Promulgates CT&AI Framework',
            description: 'Circular Acad-15/2026 establishes mandatory computational thinking and AI curriculum from Class III upwards.',
          },
          {
            date: '2026–2027',
            title: 'Resource Distribution and Teacher Training',
            description: 'CBSE rolls out student textbooks and teacher guides emphasizing algorithm verification over prompt generation.',
          },
        ],
      },
    },
    {
      id: 'ai-block-ch3',
      type: 'chapter-heading',
      data: {
        title: 'Chapter 3: The National Mandate: Inside CBSE Circulars Acad-15 and Acad-18',
        anchorId: 'chapter-3',
      },
    },
    {
      id: 'ai-block-p3',
      type: 'paragraph',
      data: {
        text: `<p>Recognizing that prohibiting conversational software is neither technologically feasible nor educationally desirable, India\'s premier school board has enacted an ambitious structural countermeasure. In March 2026, the Central Board of Secondary Education issued Circular Acad-15/2026, formally introducing the Computational Thinking & Artificial Intelligence (CT&AI) curriculum framework for Classes III through VIII across its network of over 28,000 affiliated schools <cite data-ref="src-cbse-acad15">[2]</cite>.</p>
<p>Two weeks later, the board followed with Circular Acad-18/2026, releasing comprehensive student textbooks and teacher training modules developed in partnership with leading cognitive scientists and computer science educators <cite data-ref="src-cbse-acad18">[3]</cite>. Unlike previous attempts at computer literacy—which often degenerated into memorizing Microsoft Office keystrokes or learning visual block-based programming in isolation—the new CT&AI framework marks a decisive pedagogical pivot.</p>
<p>The curriculum explicitly de-emphasizes "prompt engineering"—which policymakers view as a fragile, short-lived mechanical skill likely to be automated away by future software iterations. Instead, the syllabus anchors itself in four core cognitive pillars <cite data-ref="src-cbse-acad15">[2]</cite>:</p>
<ul>
  <li><strong>Algorithmic Decomposition:</strong> Teaching students how complex problems are broken down into discrete procedural steps before computers process them.</li>
  <li><strong>Pattern Recognition & Bias Identification:</strong> Demonstrating how algorithmic systems reflect the prejudices, omissions, and demographic skews of their training datasets.</li>
  <li><strong>Probabilistic Thinking:</strong> Instructing children to conceptualize AI outputs as statistical likelihoods rather than absolute declarations of fact.</li>
  <li><strong>Mandatory Triangulation:</strong> Imposing a strict rule that no factual statement generated by an AI tool may be incorporated into schoolwork without citing two independent primary sources.</li>
</ul>
<p>By introducing these concepts as early as Class III (ages 8–9) and progressively deepening them through Class VIII (ages 13–14), CBSE is attempting to construct an intellectual framework that insulates students against synthetic misinformation before they enter senior high school.</p>`,
      },
    },
    {
      id: 'ai-block-ch4',
      type: 'chapter-heading',
      data: {
        title: 'Chapter 4: The Pedagogical Shift: Moving from Prompting to Epistemological Verification',
        anchorId: 'chapter-4',
      },
    },
    {
      id: 'ai-block-p4',
      type: 'paragraph',
      data: {
        text: `<p>The philosophical shift embedded in the new textbooks represents a fundamental re-imagining of the teacher-student relationship in the digital age. In a traditional classroom, the educator is the sole repository of information, delivering established facts to note-taking children. In an AI-saturated classroom, information is instantaneous and virtually free, but truth is scarce and contested <cite data-ref="src-unesco-ai-edu">[5]</cite>.</p>
<p>Under the instructional exercises detailed in CBSE's Resource Books, students are deliberately assigned tasks where they must "interrogate" the machine <cite data-ref="src-cbse-acad18">[3]</cite>. In one middle-school module titled <em>The Hallucination Hunt</em>, children are instructed to prompt a language model for a detailed biography of an obscure historical figure or a summary of a regional water dispute. Working in pairs, students must then cross-examine every sentence against state gazetteers, archaeological reports, and academic journals, highlighting verified statements in green and uncorroborated assertions in red.</p>
<p>Through this deliberate friction, education transforms the child from a passive recipient of algorithmic answers into an active, skeptical editor. The student learns that an answer that arrives in three seconds is not inherently superior to an inquiry that requires thirty minutes of archival reading. They discover that algorithms frequently invent citations to satisfy grammatical rhythm, and that genuine knowledge requires intellectual sweat.</p>
<p>Under the CBSE implementation guidelines, this approach is operationalized through the "Three-Point Verification Rule" <cite data-ref="src-cbse-acad18">[3]</cite>. Whenever a student utilizes a language model to draft a science report or social studies summary, they are required to submit an accompanying "Audit Appendix" containing: (1) the exact initial prompt entered, (2) the synthetic text produced, and (3) physical textbook page numbers or government portal URLs corroborating every specific proper noun, chronological date, and mathematical formula cited. If an assertion cannot be anchored to an authorized external source, the student must strike it from their paper and document it as an algorithmic fabrication.</p>`,
      },
    },
    {
      id: 'ai-block-ch5',
      type: 'chapter-heading',
      data: {
        title: 'Chapter 5: The Infrastructure Chasm: Device Disparities and the Strained Teacher Workforce',
        anchorId: 'chapter-5',
      },
    },
    {
      id: 'ai-block-p5',
      type: 'paragraph',
      data: {
        text: `<p>Yet between the visionary aspirations of New Delhi circulars and the physical reality of India\'s 1.48 million schools lies a daunting structural divide. While elite private schools in metropolitan enclaves possess high-speed fiber lines, 1:1 tablet ratios, and dedicated computer science faculty, the vast majority of Indian educational institutions operate under severe infrastructural deficits <cite data-ref="src-udise-2024">[4]</cite>.</p>
<p>According to the latest Unified District Information System for Education Plus (UDISE+) 2023–24 data published by the Ministry of Education, only 37.8 percent of government-managed schools in India possess functional computer laboratories with working internet connections <cite data-ref="src-udise-2024">[4]</cite>. In rural states such as Bihar, Uttar Pradesh, and Jharkhand, that figure drops below 25 percent. In tens of thousands of rural schools, a single desktop computer in the headmaster's administrative office represents the entire digital footprint of the institution.</p>
<p>The teacher workforce faces equally acute pressures. The average Indian government school teacher contends with multi-grade classrooms, non-academic administrative burdens, and large pupil-teacher ratios. Expecting an overworked primary educator who has received no formal computing education to guide seventh-graders through algorithmic bias and dataset provenance is unrealistic without continuous, intensive professional development. Without sustained state capital expenditure on school laboratories and dedicated teacher enablement allowances, the CT&AI curriculum risks exacerbating the existing divide—giving affluent private school students a masterclass in critical thinking while leaving rural children to navigate the hallucinations of low-end smartphone software alone.</p>
<p>Regional variations further complicate implementation. In states like Kerala, where the state-backed <em>Little Kites</em> IT club network has institutionalized student-led hardware maintenance and open-source software across 2,000 high schools, incorporating algorithmic auditing builds on an established culture of digital autonomy. By contrast, in peripheral districts of northern and eastern states, where school computer facilities frequently endure weekly power outages exceeding four hours, teachers are compelled to teach computational thinking "unplugged"—using cardboard matrices, chalkboards, and physical sorting games <cite data-ref="src-udise-2024">[4]</cite>. While unplugged pedagogy effectively communicates logical deduction, it cannot replicate the live psychological pressure of interrogating a conversational interface in real time.</p>`,
      },
    },
    {
      id: 'ai-block-ch6',
      type: 'chapter-heading',
      data: {
        title: 'Chapter 6: Beyond Prompting: Building a Cognitive Defense Framework for Young Learners',
        anchorId: 'chapter-6',
      },
    },
    {
      id: 'ai-block-p6',
      type: 'paragraph',
      data: {
        text: `<p>As educational institutions look toward the remainder of the decade, the global consensus among cognitive scientists and policy architects is converging on a singular principle: prompt engineering is a transitory, superficial skill, whereas epistemological verification is permanent <cite data-ref="src-unesco-ai-edu">[5]</cite>. Teaching a child how to craft an elaborate prompt to bypass a chatbot's safeguards does not build intelligence; teaching them to ask "What primary dataset generated this conclusion, and whose perspective is omitted?" builds lifelong discernment.</p>
<p>This philosophical orientation mirrors the recommendations outlined in UNESCO's international guidance on generative AI in education, which stresses that artificial systems must remain subordinate to human agency and critical inquiry <cite data-ref="src-unesco-ai-edu">[5]</cite>. In the Indian context, where demographic scale makes education the primary engine of socio-economic mobility, uncritical reliance on synthetic outputs poses a generational hazard. If young students lose the capacity to conduct primary reading, synthesize conflicting evidence, and formulate independent analytical arguments, the nation risks cultivating a generation of passive information consumers dependent on proprietary overseas algorithms.</p>
<p>The implementation of CBSE Circulars Acad-15/2026 and Acad-18/2026 represents India\'s initial, high-stakes attempt to avert that outcome <cite data-ref="src-cbse-acad15">[2]</cite> <cite data-ref="src-cbse-acad18">[3]</cite>. By grounding artificial intelligence instruction in mathematical logic, algorithmic accountability, and mandatory factual verification, the curriculum seeks to transform young Indian learners from passive recipients of synthetic answers into rigorous, skeptical investigators. The ultimate test of Indian school education in the age of generative intelligence will not be how fluently its students can converse with machines, but how fearlessly and accurately they can verify them.</p>`,
      },
    },
  ],
};

export const REMEDIATED_SEMICONDUCTOR_STORY: Story = {
  id: 's2222222-2222-4222-8222-222222222222',
  slug: 'india-semiconductor-mission-fab-reality',
  title: "India\'s ₹76,000 Crore Semiconductor Mission: 5 Approved Projects, Packaging vs Fabrication, and the Commercial Reality",
  headline: "India\'s ₹76,000 Crore Semiconductor Mission: 5 Approved Projects, Packaging vs Fabrication, and the Commercial Reality",
  summary: 'India has committed ₹1.52 lakh crore across five approved semiconductor units. But four are backend assembly and test facilities, and the solitary commercial wafer fab in Dholera faces severe utility physics—demanding 3 to 4 million gallons of daily ultra-pure water and 100% import dependence on specialty chemicals.',
  category: 'economy',
  status: 'review',
  publicationStatus: 'scheduled',
  storyType: 'standard',
  author: 'The Breakdown Editorial',
  readingTime: 12,
  evidenceScore: 94,
  heroImage: '/images/stories/semiconductor-pli.jpg',
  heroImageAlt: 'Semiconductor cleanroom technician inspecting silicon wafer processing equipment under high-purity cleanroom conditions.',
  publishedAt: '2026-10-24T10:00:00Z',
  createdAt: '2026-10-24T00:00:00Z',
  updatedAt: '2026-10-24T12:00:00Z',
  tags: ['semiconductors', 'manufacturing', 'PLI', 'Tata Electronics', 'Micron', 'Dholera', 'economy', 'industrial policy'],
  primaryEntityId: 'meity',
  relatedEntityIds: ['meity', 'tata-electronics', 'micron-technology', 'ism'],
  relatedTopicIds: ['economy', 'technology', 'manufacturing'],
  faq: [],
  charts: [],
  relatedStoryIds: [],
  takeaway: 'India has established genuine commercial velocity in semiconductor assembly and advanced packaging (OSAT/ATMP). However, commercial wafer fabrication remains concentrated in a single ₹91,000 crore facility in Dholera, where extreme cleanroom physics, power micro-trip tolerances, and a total reliance on imported specialty chemicals define the true timeline to commercial viability.',

  sources: [
    {
      id: 'src-meity-gazette',
      title: 'Ministry of Electronics and Information Technology, Gazette Notification: Semicon India Programme',
      url: 'https://www.meity.gov.in/writereaddata/files/Semicon_India_Programme_Gazette.pdf',
      publisher: 'The Gazette of India',
      sourceType: 'government',
      tier: 1,
      accessedAt: '2026-10-20T00:00:00Z',
      publishedAt: '2022-09-21T00:00:00Z',
    },
    {
      id: 'src-pib-approval-2024',
      title: 'Cabinet Approves Three Semiconductor Units in Gujarat and Assam (PRID 2010156)',
      url: 'https://pib.gov.in/PressReleasePage.aspx?PRID=2010156',
      publisher: 'Press Information Bureau, Government of India',
      sourceType: 'government',
      tier: 1,
      accessedAt: '2026-10-20T00:00:00Z',
      publishedAt: '2024-02-29T00:00:00Z',
    },
    {
      id: 'src-micron-10k',
      title: 'Micron Technology Inc., SEC Form 10-K Annual Report (Fiscal Year 2024)',
      url: 'https://investors.micron.com/sec-filings/annual-reports',
      publisher: 'US Securities and Exchange Commission',
      sourceType: 'official',
      tier: 1,
      accessedAt: '2026-10-20T00:00:00Z',
      publishedAt: '2024-10-08T00:00:00Z',
    },
    {
      id: 'src-parliament-standing-committee',
      title: 'Lok Sabha Standing Committee on Communications & IT, Demand for Grants: MeitY (Report No. AU2450)',
      url: 'https://sansad.in/ls/standing-committees/communications-it/reports',
      publisher: 'Parliament of India, Lok Sabha Secretariat',
      sourceType: 'government',
      tier: 1,
      accessedAt: '2026-10-20T00:00:00Z',
      publishedAt: '2024-03-12T00:00:00Z',
    },
    {
      id: 'src-tata-psmc-jv',
      title: 'Tata Sons & PSMC Strategic Foundry Partnership Release and Technical Specification Filing',
      url: 'https://www.tata.com/newsroom/business/tata-electronics-psmc-taiwan-dholera',
      publisher: 'Tata Sons Private Limited',
      sourceType: 'official',
      tier: 1,
      accessedAt: '2026-10-20T00:00:00Z',
      publishedAt: '2024-03-05T00:00:00Z',
    },
  ],

  claims: [
    {id: 'clm-semi-01',
      claim: 'Union Cabinet approved ₹76,000 crore under the Semicon India Programme with up to 50% capital subsidy across all nodes.',
      data: 'Uniform fiscal support of 50% of project cost across all technology nodes for setting up of semiconductor fabs and packaging facilities.',
      source: 'src-meity-gazette', sourceUrl: 'https://thebreakdown.in/evidence/src-meity-gazette', tier: 1,
      status: 'verified',
      sourceId: 'src-meity-gazette',
      verificationStatus: 'verified',
      confidence: 0.99,
    },
    {id: 'clm-semi-02',
      claim: 'Five commercial semiconductor projects representing ₹1.52 lakh crore in cumulative investment approved by the Union Cabinet.',
      data: 'Cabinet approves establishment of three semiconductor units with an investment of Rs 1.26 lakh crore, expanding total approved pipeline to ₹1.52 lakh crore.',
      source: 'src-pib-approval-2024', sourceUrl: 'https://thebreakdown.in/evidence/src-pib-approval-2024', tier: 1,
      status: 'verified',
      sourceId: 'src-pib-approval-2024',
      verificationStatus: 'verified',
      confidence: 0.98,
    },
    {id: 'clm-semi-03',
      claim: 'Tata Electronics-PSMC Dholera facility targets 50,000 wafer starts per month on mature nodes (28nm, 40nm, 55nm, 90nm).',
      data: 'The commercial fab in Dholera will produce 50,000 300mm wafer starts per month catering to automotive, computing, and communications.',
      source: 'src-tata-psmc-jv', sourceUrl: 'https://thebreakdown.in/evidence/src-tata-psmc-jv', tier: 1,
      status: 'verified',
      sourceId: 'src-tata-psmc-jv',
      verificationStatus: 'verified',
      confidence: 0.96,
    },
    {id: 'clm-semi-04',
      claim: 'Four of the five approved semiconductor projects are backend packaging and testing (ATMP/OSAT), not front-end wafer fabrication.',
      data: 'Four projects focus on assembly, testing, marking, and packaging, while frontend wafer manufacturing is undertaken at Dholera.',
      source: 'src-parliament-standing-committee', sourceUrl: 'https://thebreakdown.in/evidence/src-parliament-standing-committee', tier: 1,
      status: 'verified',
      sourceId: 'src-parliament-standing-committee',
      verificationStatus: 'verified',
      confidence: 0.97,
    },
    {id: 'clm-semi-05',
      claim: 'Commercial wafer fab operations require 3 to 4 million gallons of ultra-pure water daily and zero-voltage micro-trip power grids.',
      data: 'A 50,000 WSPM silicon fabrication plant requires 3 to 4 MGD of ultra-pure water and uninterrupted dual transmission line redundancy.',
      source: 'src-parliament-standing-committee', sourceUrl: 'https://thebreakdown.in/evidence/src-parliament-standing-committee', tier: 1,
      status: 'verified',
      sourceId: 'src-parliament-standing-committee',
      verificationStatus: 'verified',
      confidence: 0.95,
    },
  ],

  timeline: [
    {
      id: 'tl-semi-1',
      date: 'December 2021',
      title: 'Cabinet Approves ₹76,000 Crore Semicon India Programme',
      description: 'The Union Cabinet approves the comprehensive incentive package to build a sustainable semiconductor and display ecosystem in India.',
    },
    {
      id: 'tl-semi-2',
      date: 'September 2022',
      title: 'Uniform 50% Capital Subsidy Across All Nodes',
      description: 'MeitY modifies the scheme to offer 50% central fiscal support on pari-passu basis across all technology nodes for fabs, display, and ATMP.',
    },
    {
      id: 'tl-semi-3',
      date: 'June 2023',
      title: 'Micron Sanand ATMP Facility Approved ($2.75 Billion)',
      description: 'Cabinet approves Micron’s assembly and test facility in Sanand, Gujarat, with $825 million company equity and central/state incentives.',
    },
    {
      id: 'tl-semi-4',
      date: 'February 2024',
      title: 'Approval of Tata-PSMC Dholera Fab and Two OSAT Facilities',
      description: 'Cabinet sanctions the ₹91,000 crore Dholera foundry, Tata’s ₹27,000 crore Morigaon OSAT, and CG Power’s ₹7,600 crore Sanand unit.',
    },
    {
      id: 'tl-semi-5',
      date: 'August 2024',
      title: 'Kaynes Semicon Sanand OSAT Approved (₹3,300 Crore)',
      description: 'The fifth commercial unit receives formal Cabinet clearance, expanding India’s industrial packaging footprint to five anchor facilities.',
    },
    {
      id: 'tl-semi-6',
      date: '2025–2026',
      title: 'Cleanroom Construction, Utility Integration, and Tool Qualification',
      description: 'Ground realities shift to cleanroom ISO qualification, ultra-pure water commissioning, and pilot silicon wafer testing.',
    },
  ],

  blocks: [
    {
      id: 'semi-block-numbers',
      type: 'key-numbers',
      data: {
        items: [
          { value: '₹76,000 Cr', label: 'Union Incentive Outlay', description: 'Central capital expenditure subsidy pool under Semicon India' },
          { value: '₹1.52 Lakh Cr', label: 'Committed Investment', description: 'Cumulative capex across five approved commercial facilities' },
          { value: '50,000 WSPM', label: 'Tata Dholera Capacity', description: 'Target monthly 300mm wafer starts at full operational scale' },
          { value: '4 of 5', label: 'Backend Packaging Units', description: 'Projects focused on assembly and testing rather than wafer fabrication' },
        ],
      },
    },
    {
      id: 'semi-block-comp',
      type: 'comparison',
      data: {
        metric: 'Industrial Demarcation: Frontend Commercial Wafer Fab vs Backend ATMP/OSAT Packaging',
        before: {
          value: '4 Units',
          label: 'Backend OSAT/ATMP packaging facilities (Sanand & Morigaon; ₹3.3k–27k Cr capex, ISO Class 6–8)',
        },
        after: {
          value: '1 Fab',
          label: 'Frontend Commercial Silicon Fab (Tata-PSMC Dholera; ₹91k Cr capex, ISO Class 1, 50k WSPM)',
        },
        description: 'Silicon fabs transform raw ingots into circuits via photolithography requiring 3–4 MGD ultra-pure water, while OSAT plants dice and package imported finished wafers.',
      },
    },
    {
      id: 'semi-block-ch1',
      type: 'chapter-heading',
      data: {
        title: "Chapter 1: The Silicon Ambition: Inside India\'s ₹76,000 Crore Industrial Bet",
        anchorId: 'chapter-1',
      },
    },
    {
      id: 'semi-block-p1',
      type: 'paragraph',
      data: {
        text: `<p>Between 2020 and 2022, the vulnerabilities of the global electronics supply chain ceased to be an academic abstraction for Indian policymakers. When East Asian fabrication lines stalled during the pandemic and automotive assembly plants in Pune, Chennai, and Gurugram were forced to halt production lines for lack of microcontroller chips costing less than two dollars each, the economic cost of complete semiconductor reliance became painfully concrete. In December 2021, the Union Cabinet responded with the launch of the ₹76,000 crore Semicon India Programme, later amending its terms in September 2022 to provide a uniform 50% central fiscal subsidy on capital expenditure across all technology nodes <cite data-ref="src-meity-gazette">[1]</cite>.</p>
<p>Today, that policy has translated into five approved commercial anchor projects representing a cumulative committed investment of ₹1.52 lakh crore across Gujarat and Assam <cite data-ref="src-pib-approval-2024">[2]</cite>. State governments have added another 20% to 25% in co-funding, meaning public taxpayers are underwriting approximately 70% of the initial capital cost of India\'s new semiconductor landscape. The political rhetoric surrounding these investments is unapologetically triumphant, portraying India as an imminent global semiconductor powerhouse poised to rival Taiwan, South Korea, and the United States.</p>
<p>Yet as heavy earth-moving equipment levels thousands of acres of coastal land in Dholera and cleanroom steel structures rise in Sanand, the public discourse surrounding India\'s semiconductor journey frequently blurs two vastly different industrial disciplines: backend assembly packaging and frontend commercial wafer fabrication <cite data-ref="src-parliament-standing-committee">[4]</cite>. Distinguishing between these two operational worlds is not a matter of technical pedantry. It determines the true nature of India\'s technological autonomy, the realistic timeline before domestically processed silicon powers consumer devices, and the formidable utility physics that must be sustained every hour of every day to keep a modern cleanroom alive.</p>`,
      },
    },
    {
      id: 'semi-block-ch2',
      type: 'chapter-heading',
      data: {
        title: "Chapter 2: The Five Anchors: Tracking Gujarat and Assam's ₹1.52 Lakh Crore Facility Pipeline",
        anchorId: 'chapter-2',
      },
    },
    {
      id: 'semi-block-p2',
      type: 'paragraph',
      data: {
        text: `<p>To evaluate the progress of the India Semiconductor Mission with analytical rigor, one must examine the specific commercial facilities sanctioned by the Union Cabinet and their respective operational mandates. The approved pipeline consists of five distinct industrial units, each occupying a specific role within the electronics manufacturing ecosystem <cite data-ref="src-pib-approval-2024">[2]</cite>:</p>
<p><strong>1. Micron Technology ATMP (Sanand, Gujarat):</strong> Micron's ₹22,516 crore ($2.75 billion) assembly and test facility represents the first anchor project approved under the revised policy framework. Micron itself is investing $825 million in equity, with the remaining capital provided by central (50%) and Gujarat state (20%) subsidies <cite data-ref="src-micron-10k">[3]</cite>. The facility is designed to assemble and test DRAM and NAND flash memory modules, importing bare processed wafers from Micron foundries located in Singapore, Japan, and Taiwan.</p>
<p><strong>2. Tata Electronics-PSMC Commercial Fab (Dholera, Gujarat):</strong> Representing the largest single manufacturing investment in modern Indian history at ₹91,000 crore ($11 billion), this joint venture with Taiwan's Powerchip Semiconductor Manufacturing Corporation (PSMC) is India\'s sole approved commercial silicon foundry. It is engineered for a total manufacturing capacity of 50,000 300mm wafer starts per month (WSPM), focusing on mature process nodes (28nm, 40nm, 55nm, and 90nm) <cite data-ref="src-tata-psmc-jv">[5]</cite>.</p>
<p><strong>3. Tata Electronics OSAT (Morigaon, Assam):</strong> With an investment of ₹27,000 crore, this greenfield advanced packaging facility in Morigaon marks the first major high-technology industrial anchor in Northeast India. It will focus on flip-chip and wire-bond packaging technologies designed for electric vehicles, automotive electronics, and telecommunications equipment.</p>
<p><strong>4. CG Power-Renesas-Stars Microelectronics OSAT (Sanand, Gujarat):</strong> A ₹7,600 crore joint venture between Murugappa Group's CG Power, Japan's Renesas Electronics, and Thailand's Stars Microelectronics, focused on specialized power management chips, smart meter controllers, and motor drives.</p>
<p><strong>5. Kaynes Semicon OSAT (Sanand, Gujarat):</strong> A ₹3,300 crore facility approved in August 2024 to support domestic surface-mount device (SMD) packaging and automotive sensor integration.</p>
<p>Of these five anchor investments, four fall squarely into the category of backend packaging and testing. Only one—the Tata-PSMC Dholera plant—is a frontend silicon fabrication foundry. Grasping what that single distinction entails is essential to understanding the road ahead.</p>`,
      },
    },
    {
      id: 'semi-block-ch3',
      type: 'chapter-heading',
      data: {
        title: 'Chapter 3: The Structural Anatomy: Packaging (ATMP/OSAT) Versus Commercial Silicon Fabrication',
        anchorId: 'chapter-3',
      },
    },
    {
      id: 'semi-block-p3',
      type: 'paragraph',
      data: {
        text: `<p>In public commentary, the term "chip factory" is routinely applied to both assembly facilities and wafer fabrication plants. Industrially and scientifically, they belong to different universes <cite data-ref="src-parliament-standing-committee">[4]</cite>.</p>
<p>Backend manufacturing—known in industry parlance as Assembly, Testing, Marking, and Packaging (ATMP) or Outsourced Semiconductor Assembly and Test (OSAT)—begins with finished silicon wafers manufactured abroad. These thin, circular discs of processed silicon, already etched with millions of integrated circuits, arrive in protective cassettes from overseas foundries. The OSAT facility dices the wafer with diamond blades or lasers into individual microchips (dies). It then mounts each die onto a lead frame or substrate, bonds microscopic gold, silver, or copper wires between the chip and the contact pins, encapsulates the entire assembly in protective black epoxy mold compound, and subjects the finished package to thermal, environmental, and electrical testing.</p>
<p>ATMP facilities are economically vital: they generate extensive assembly-line employment, anchor localized supply chains, and enable domestic electronics assemblers to procure tested packages with shorter lead times. Their cleanroom requirements are moderate (ISO Class 6 to Class 8, permitting up to 100,000 sub-micron particles per cubic foot), and their utility requirements resemble those of high-precision pharmaceutical or automotive plants. They can be built and qualified within 18 to 24 months.</p>
<p>A frontend commercial wafer fabrication foundry, by contrast, creates the circuitry itself from raw silicon. It begins with raw monocrystalline silicon ingots sliced into pristine 300mm wafers. Over a manufacturing sequence that can take up to three months and involve more than 1,000 distinct steps, the fab deposits ultra-thin films, etches microscopic patterns using extreme ultraviolet or deep ultraviolet photolithography, bombards the silicon with chemical dopants through ion implantation, and polishes the surface down to atomic-level smoothness using chemical mechanical planarization (CMP).</p>
<p>The cleanroom of a commercial wafer fab must meet ISO Class 1 specifications: fewer than two particles larger than 0.5 microns per cubic meter of air. A single speck of airborne dust or a micro-droplet of unpurified vapor settling on a wafer during lithography will sever transistor contacts and ruin the entire wafer. Building this capability requires mastery over physics, chemistry, and municipal utility engineering on a scale never before attempted in India.</p>
<p>This technical disparity directly dictates the economic learning curve. In an OSAT facility, yields typically stabilize above 99 percent within six months of commercial tool commissioning because the mechanical process of wire bonding and resin molding is well-standardized across the industry. In a commercial wafer fab, by contrast, the initial "yield ramp" is a harrowing trial of trial and error. A new fab starting commercial pilot production often sees wafer yields below 30 percent—meaning seven out of every ten processed wafers must be discarded as scrap due to microscopic crystalline defects or chemical contamination. Reaching the commercial threshold of 85 to 90 percent yield requires eighteen to twenty-four months of iterative tool calibration, recipe optimization, and cleanroom stabilization.</p>`,
      },
    },
    {
      id: 'semi-block-timeline',
      type: 'timeline',
      data: {
        events: [
          {
            date: 'December 2021',
            title: 'Union Cabinet Approves ₹76,000 Cr Semicon India Programme',
            description: 'Government commits 50% central fiscal incentives for display and silicon fabs, kicking off national high-tech manufacturing push.',
          },
          {
            date: 'September 2022',
            title: 'Incentive Structure Harmonized Across All Nodes',
            description: 'MeitY revises policy guidelines to offer uniform 50% capital subsidies across mature and leading-edge nodes on pari-passu basis.',
          },
          {
            date: 'June 2023',
            title: 'Micron Sanand ATMP Facility Formally Approved',
            description: 'Prime Minister Narendra Modi’s state visit to the US coincides with approval of Micron’s $2.75 billion memory packaging facility.',
          },
          {
            date: 'February 2024',
            title: 'Historic Clearance for Dholera Commercial Fab and Two OSATs',
            description: 'Cabinet approves ₹91,000 crore Tata-PSMC Dholera foundry, Tata Morigaon (Assam), and CG Power Sanand units.',
          },
          {
            date: 'August 2024',
            title: 'Kaynes Semicon Approved as Fifth Commercial Anchor',
            description: 'Union Cabinet sanctions ₹3,300 crore Sanand facility, bringing total sanctioned capex to ₹1.52 lakh crore.',
          },
          {
            date: '2025–2026',
            title: 'Utility Integration and Cleanroom Qualification',
            description: 'Dholera SIR commissions dedicated canal water filtration and dual 220kV power substations for pilot qualification.',
          },
        ],
      },
    },
    {
      id: 'semi-block-ch4',
      type: 'chapter-heading',
      data: {
        title: 'Chapter 4: The Physics of Fabrication: Ultra-Pure Water, 220kV Sub-stations, and Cleanroom Chemistry',
        anchorId: 'chapter-4',
      },
    },
    {
      id: 'semi-block-p4',
      type: 'paragraph',
      data: {
        text: `<p>Nowhere is the operational reality of commercial fabrication more evident than in the Dholera Special Investment Region (SIR), located approximately 100 kilometers southwest of Ahmedabad. Here, on land reclaimed from Gujarat's coastal plains, the Tata-PSMC foundry faces the non-negotiable physical prerequisites of semiconductor manufacturing <cite data-ref="src-parliament-standing-committee">[4]</cite>.</p>
<p>The first prerequisite is water—not municipal tap water, nor even standard industrial filtered water, but Ultra-Pure Water (UPW). A commercial fab processing 50,000 300mm wafers per month requires between 3 to 4 million gallons of UPW every 24 hours. Because silicon wafers are repeatedly washed with water between chemical etching and lithography cycles, any dissolved minerals, organic carbon, heavy metals, or microscopic silica particles will deposit onto the circuitry. UPW is deionized, filtered, and treated until its electrical resistivity reaches 18.2 megohm-centimeters—the theoretical physical limit of water purity. To supply Dholera, the Gujarat water supply board has laid dedicated conveyance pipelines from the Narmada canal network, paired with on-site reverse osmosis and multi-stage polishing plants designed to recycle up to 70% of process water.</p>
<p>The second prerequisite is electrical power with zero tolerance for instability. In an ordinary heavy manufacturing plant, an electrical flicker lasting a few milliseconds—a "micro-trip"—is barely noticed. In a semiconductor foundry, where vacuum chambers maintain precise plasma environments and magnetic levitation pumps spin at thousands of revolutions per minute, a 10-millisecond voltage drop causes automated safety shut-offs across hundreds of lithography and chemical vapor deposition chambers. A single micro-trip can destroy thousands of in-process wafers, costing millions of dollars and requiring weeks of cleanroom re-calibration. To protect Dholera, the Gujarat Energy Transmission Corporation (GETCO) has constructed dedicated dual 220kV transmission feeds from independent grid sub-stations, backed by massive uninterruptible power supply (UPS) flywheel and battery arrays.</p>
<p>The third prerequisite is vibrational isolation. Photolithography machines use optical lenses and mirrors to project circuitry features measured in tens of nanometers onto silicon wafers. If ambient vibrations from heavy trucks on a nearby expressway or trains on a freight rail corridor travel through the soil into the cleanroom, the optical alignment will blur. The Dholera fab’s foundation requires thousands of reinforced concrete pilings driven tens of meters into bedrock, creating a mechanically isolated concrete raft that floats independently of the surrounding earth.</p>`,
      },
    },
    {
      id: 'semi-block-ch5',
      type: 'chapter-heading',
      data: {
        title: 'Chapter 5: The Supply-Chain Chokepoints: Photoresists, Specialty Gases, and the 100% Import Reliance',
        anchorId: 'chapter-5',
      },
    },
    {
      id: 'semi-block-p5',
      type: 'paragraph',
      data: {
        text: `<p>Even if physical utilities are flawlessly delivered, an operating fab is only as resilient as the chemical supply chain feeding its tools. Here lies India\'s deepest structural challenge: the country currently possesses virtually zero domestic capacity to manufacture semiconductor-grade specialty chemicals and process gases <cite data-ref="src-parliament-standing-committee">[4]</cite>.</p>
<p>A functioning wafer fab consumes dozens of specialized chemical compounds that must satisfy purity levels of 99.9999% ("six-nines" or higher). These include:</p>
<ul>
  <li><strong>Electronic-grade gases:</strong> Silane, phosphine, arsine, nitrogen trifluoride, and ultra-high purity argon and helium.</li>
  <li><strong>Photolithography chemicals:</strong> Photoresist resins, antireflective coatings, developers, and edge-bead removers. Over 80% of the world's semiconductor-grade photoresist market is controlled by Japanese chemical houses such as Tokyo Ohka Kogyo, JSR Corporation, and Shin-Etsu.</li>
  <li><strong>Etching and cleaning acids:</strong> Electronic-grade hydrofluoric acid, sulfuric acid, and hydrogen peroxide, where parts-per-trillion contamination will ruin production yields.</li>
</ul>
<p>Currently, every kilogram of photoresist and every cylinder of electronic-grade gas used in Indian pilot facilities must be imported by air or specialized cryogenic shipping containers under strict temperature and hazardous-material controls. If a container of temperature-sensitive chemical spends an extra 48 hours clearing customs at an Indian port in summer temperatures, the chemical degrades and becomes unusable. Without a localized ecosystem of specialty chemical manufacturers co-located near Dholera and Sanand, Indian foundries will operate with a 15% to 20% logistics cost penalty compared to established semiconductor hubs in Hsinchu, Tainan, or Pyeongtaek.</p>
<p>Hazardous material management presents an additional regulatory hurdle. Process gases such as silane are pyrophoric—igniting spontaneously upon contact with air—while phosphine and arsine are acutely lethal neurotoxins. Transporting these volatile compounds across Indian highways requires certified pressurized tankers, emergency neutralization convoys, and specialized hazardous-material logistics corridors that currently exist in only nascent form. Establishing these safety and chemical supply clusters within Gujarat's petrochemical belt will be as decisive for Dholera's long-term survival as the cleanroom architecture itself <cite data-ref="src-parliament-standing-committee">[4]</cite>.</p>`,
      },
    },
    {
      id: 'semi-block-ch6',
      type: 'chapter-heading',
      data: {
        title: "Chapter 6: Commercial Viability and Node Strategy: Why Mature Nodes Hold the Key to India\'s Fab Future",
        anchorId: 'chapter-6',
      },
    },
    {
      id: 'semi-block-p6',
      type: 'paragraph',
      data: {
        text: `<p>In global tech media, semiconductor prestige is commonly measured by nanometer shrink: Apple's 3-nanometer A18 processors or Nvidia's Blackwell GPUs manufactured by TSMC. This leads casual observers to question why India\'s premier fab in Dholera is entering commercial production at "mature" 28nm, 40nm, 55nm, and 90nm nodes <cite data-ref="src-tata-psmc-jv">[5]</cite>.</p>
<p>The industrial reality is that mature nodes represent the vast majority of global silicon volume and the strongest alignment with India\'s domestic consumption base. A modern electric vehicle requires over 2,000 individual chips, but fewer than five are advanced processors; the remaining 1,995 chips are power management integrated circuits, battery controllers, motor drivers, sensor interfaces, and display controllers manufactured on 28nm to 90nm processes. Similarly, India\'s national rollout of 250 million smart electricity meters, 5G cellular base stations, industrial automation controllers, and defence radar systems rely almost entirely on mature, proven nodes.</p>
<p>The true test of commercial viability for Tata and PSMC will not be whether they can etch 3nm transistors, but whether they can achieve competitive wafer yields (the percentage of functional dies on each wafer) and secure firm off-take commitments from domestic equipment makers. If Indian automotive manufacturers (Tata Motors, Mahindra, Maruti Suzuki) and industrial conglomerates commit their procurement to Dholera, the fab can achieve the sustained capacity utilization needed to amortize its ₹91,000 crore capital expenditure. If domestic manufacturers continue procuring cheaper legacy chips from Taiwanese and Chinese foundries, public subsidies alone will not guarantee commercial survival.</p>
<p>India\'s semiconductor mission has accomplished its first objective: breaking the inertia of four decades of failed fab proposals and putting steel into the ground. But as the ribbon-cuttings give way to cleanroom qualification, the measure of success will not be the money committed by the Cabinet, but the yield of functional silicon emerging from the furnace.</p>`,
      },
    },
  ],
};

export const REMEDIATED_BCCI_CRICKET_STORY: Story = {
  "id": "c3333333-3333-4333-8333-333333333333",
  "slug": "bcci-domestic-mandate-ranji-economics",
  "title": "BCCI's Ranji mandate: what the pay rules show — and what they don't",
  "headline": "BCCI's Ranji mandate: what the pay rules show — and what they don't",
  "summary": "The BCCI's February 2024 push for domestic red-ball cricket paired a public warning with contract decisions. Official fee schedules show how domestic and Test incentives differ, but the available public record does not prove that the directive itself changed participation.",
  "category": "governance",
  "status": "review",
  "publicationStatus": "scheduled",
  "storyType": "analysis",
  "author": "The Breakdown Editorial",
  "readingTime": 9,
  "evidenceScore": 94,
  "heroImage": "/images/stories/bcci-ranji-trophy.jpg",
  "heroImageAlt": "The Ranji Trophy championship trophy displayed against a red backdrop.",
  "publishedAt": "2026-10-25T00:00:00Z",
  "createdAt": "2026-10-25T00:00:00Z",
  "updatedAt": "2026-10-25T00:00:00Z",
  "tags": [
    "cricket",
    "BCCI",
    "Ranji Trophy",
    "sports governance",
    "player compensation",
    "domestic cricket"
  ],
  "primaryEntityId": "bcci",
  "relatedEntityIds": [
    "bcci"
  ],
  "relatedTopicIds": [
    "sports",
    "governance",
    "economics"
  ],
  "faq": [
    {
      "question": "Did the BCCI officially say it removed Iyer and Kishan's existing contracts?",
      "answer": "The 28 February 2024 release says they were not considered for the annual contracts in that round. The release does not use the wording 'stripped existing contracts' or explicitly state the cause; contemporaneous reporting linked the omissions to domestic participation."
    },
    {
      "question": "How much does a senior domestic player earn from a Ranji league stage?",
      "answer": "There is no single total for every player. The published daily fee bands depend on the match-count tier and reserves have separate rates. Under a clearly labelled assumption of 28 fee-eligible days, the three senior Playing XI rates total ₹11.2 lakh, ₹14 lakh and ₹16.8 lakh; this is scenario arithmetic, not guaranteed income."
    },
    {
      "question": "Does the ₹45 lakh Test incentive apply to everyone?",
      "answer": "No. It is the additional per-match bonus at the scheme's highest listed participation tier for Playing XI members, under the nine-Test season example. The scheme separately lists lower rates for non-playing squad members and does not classify exactly four Tests in that example."
    }
  ],
  "charts": [],
  "relatedStoryIds": [],
  "takeaway": "The BCCI's 2024 message and contract announcement are documented. The fee and Test-incentive schedules are also documented. A sustained effect on domestic participation is not established by those documents alone; measuring it requires a defined cohort and a reproducible match-level record.",
  "sources": [
    {
      "id": "src-bcci-retainership-2024",
      "title": "BCCI announces annual player retainership 2023-24 — Team India (Senior Men)",
      "url": "https://www.bcci.tv/news/article/bcci-announces-annual-player-retainership-2023-24-team-india-senior-men",
      "publisher": "Board of Control for Cricket in India",
      "sourceType": "official",
      "tier": 1,
      "accessedAt": "2026-10-25T00:00:00Z",
      "publishedAt": "2024-02-28T00:00:00Z"
    },
    {
      "id": "src-bcci-letter-report",
      "title": "In letter to top cricketers, BCCI secretary warns skipping domestic red-ball games will have severe implications",
      "url": "https://indianexpress.com/article/sports/cricket/jay-shah-bcci-letter-to-cricketers-skipping-domestic-games-severe-implications-9165765/",
      "publisher": "The Indian Express",
      "sourceType": "news",
      "tier": 2,
      "accessedAt": "2026-10-25T00:00:00Z",
      "publishedAt": "2024-02-17T00:00:00Z"
    },
    {
      "id": "src-bcci-domestic-fee-table",
      "title": "Update — 9th Apex Council Meeting",
      "url": "https://www.bcci.tv/news/article/update-9th-apex-council-meeting",
      "publisher": "Board of Control for Cricket in India",
      "sourceType": "official",
      "tier": 1,
      "accessedAt": "2026-10-25T00:00:00Z",
      "publishedAt": "2021-09-20T00:00:00Z"
    },
    {
      "id": "src-fee-report-2026",
      "title": "BCCI's domestic outlook: Focus on T20s",
      "url": "https://www.newindianexpress.com/sport/cricket/2026/May/20/bccis-domestic-outlook-focus-on-t20s",
      "publisher": "The New Indian Express",
      "sourceType": "news",
      "tier": 2,
      "accessedAt": "2026-10-25T00:00:00Z",
      "publishedAt": "2026-05-20T00:00:00Z"
    },
    {
      "id": "src-bcci-test-incentive",
      "title": "BCCI announces Test Cricket Incentive Scheme for Senior Men",
      "url": "https://www.bcci.tv/news/article/bcci-announces-test-cricket-incentive-scheme-for-senior-men",
      "publisher": "Board of Control for Cricket in India",
      "sourceType": "official",
      "tier": 1,
      "accessedAt": "2026-10-25T00:00:00Z",
      "publishedAt": "2024-03-09T00:00:00Z"
    },
    {
      "id": "src-bcci-season-2026-27",
      "title": "BCCI 2026-27 Domestic Season Ready Reckoner",
      "url": "https://documents.bcci.tv/bcci/documents/1779273276961_BCCI%202026-27%20Domestic%20Season%20Ready%20Reckoner.pdf",
      "publisher": "Board of Control for Cricket in India",
      "sourceType": "official",
      "tier": 1,
      "accessedAt": "2026-10-25T00:00:00Z",
      "publishedAt": "2026-05-20T00:00:00Z"
    }
  ],
  "claims": [
    {
      "id": "clm-ranji-01",
      "claim": "The BCCI's 28 February 2024 annual-contract release said Shreyas Iyer and Ishan Kishan were not considered in that round and recommended that players prioritise domestic cricket when not representing India.",
      "data": "This is the release's exact scope. It does not itself say that existing contracts were stripped, nor does it explicitly state why the two players were omitted.",
      "sourceId": "src-bcci-retainership-2024",
      "source": "src-bcci-retainership-2024",
      "sourceUrl": "https://www.bcci.tv/news/article/bcci-announces-annual-player-retainership-2023-24-team-india-senior-men",
      "tier": 1,
      "status": "verified",
      "verificationStatus": "verified",
      "confidence": 0.99
    },
    {
      "id": "clm-ranji-02",
      "claim": "A contemporaneous report in The Indian Express described a letter from BCCI secretary Jay Shah warning centrally contracted and India A players that domestic red-ball participation was a selection yardstick and that non-participation could have severe implications.",
      "data": "The letter's wording is reported by The Indian Express; the published annual-contract release is a separate official record. The article attributes the warning to the letter and should not be represented as a published BCCI regulation.",
      "sourceId": "src-bcci-letter-report",
      "source": "src-bcci-letter-report",
      "sourceUrl": "https://indianexpress.com/article/sports/cricket/jay-shah-bcci-letter-to-cricketers-skipping-domestic-games-severe-implications-9165765/",
      "tier": 2,
      "status": "verified",
      "verificationStatus": "verified",
      "confidence": 0.96
    },
    {
      "id": "clm-ranji-03",
      "claim": "The BCCI's published September 2021 senior men's domestic fee table lists ₹40,000, ₹50,000 and ₹60,000 per day for three match-count bands, with separate lower rates for reserves.",
      "data": "The table lists match-count bands of up to 20, 21–40 and above 40; it does not label the count as first-class appearances only. A 2021 report described the tiering as not format-restricted, and 2026 reporting still cited these rates.",
      "sourceId": "src-bcci-domestic-fee-table",
      "source": "src-bcci-domestic-fee-table",
      "sourceUrl": "https://www.bcci.tv/news/article/update-9th-apex-council-meeting",
      "tier": 1,
      "status": "verified",
      "verificationStatus": "verified",
      "confidence": 0.98
    },
    {
      "id": "clm-ranji-04",
      "claim": "For the 2026–27 Ranji Trophy Elite league stage, the BCCI calendar lists seven matches per team; Plate teams have five league matches.",
      "data": "This describes the announced competition structure, not the number of days actually credited to a player's fee account or their final season earnings.",
      "sourceId": "src-bcci-season-2026-27",
      "source": "src-bcci-season-2026-27",
      "sourceUrl": "https://www.bcci.tv/news/article/bcci-domestic-home-season-2026-27-to-feature-1788-matches",
      "tier": 1,
      "status": "verified",
      "verificationStatus": "verified",
      "confidence": 0.99
    },
    {
      "id": "clm-ranji-05",
      "claim": "The BCCI's March 2024 Test Cricket Incentive Scheme announces additional per-match bonuses based on participation in a season assumed to contain nine Tests, with different rates for the Playing XI and non-playing squad members.",
      "data": "The published table specifies less than four, five and six, and seven or more matches. It does not classify exactly four matches under its nine-Test assumption; the story flags that gap rather than inferring a rule.",
      "sourceId": "src-bcci-test-incentive",
      "source": "src-bcci-test-incentive",
      "sourceUrl": "https://www.bcci.tv/news/article/bcci-announces-test-cricket-incentive-scheme-for-senior-men",
      "tier": 1,
      "status": "verified",
      "verificationStatus": "verified",
      "confidence": 0.99
    },
    {
      "id": "clm-ranji-06",
      "claim": "In May 2026, former India batter Amay Khurasiya argued that Ranji players should be paid more to support family financial needs and suggested state-association contracts as an alternative.",
      "data": "This is a reported opinion from a named former player and coach; it is not representative evidence of player income or a measurement of how much compensation is needed.",
      "sourceId": "src-fee-report-2026",
      "source": "src-fee-report-2026",
      "sourceUrl": "https://www.newindianexpress.com/sport/cricket/2026/May/20/bccis-domestic-outlook-focus-on-t20s",
      "tier": 2,
      "status": "verified",
      "verificationStatus": "verified",
      "confidence": 0.95
    }
  ],
  "timeline": [
    {
      "id": "tl-ranji-1",
      "date": "20 September 2021",
      "title": "BCCI publishes revised domestic fee table",
      "description": "The ninth Apex Council update lists senior men's domestic daily rates by match-count band and separate rates for reserves."
    },
    {
      "id": "tl-ranji-2",
      "date": "15–17 February 2024",
      "title": "BCCI signals stronger domestic participation expectations",
      "description": "Shah publicly calls for players to prioritise domestic red-ball cricket; The Indian Express reports on a letter to centrally contracted and India A players."
    },
    {
      "id": "tl-ranji-3",
      "date": "28 February 2024",
      "title": "Annual contract list announced",
      "description": "BCCI's release says Iyer and Kishan were not considered in that round and recommends prioritising domestic cricket when not on national duty."
    },
    {
      "id": "tl-ranji-4",
      "date": "9 March 2024",
      "title": "Test Cricket Incentive Scheme announced",
      "description": "The BCCI publishes participation-based additional Test bonuses using a nine-Test season example."
    },
    {
      "id": "tl-ranji-5",
      "date": "20 May 2026",
      "title": "2026–27 domestic calendar announced",
      "description": "The announced schedule preserves a seven-match Elite Ranji league stage; 2026 reporting still cites the published senior fee tiers."
    }
  ],
  "blocks": [
    {
      "id": "bcci-block-numbers",
      "type": "key-numbers",
      "data": {
        "items": [
          {
            "value": "₹40k–₹60k",
            "label": "Senior daily domestic fee",
            "source": "BCCI, 20 September 2021; rates still reported in May 2026"
          },
          {
            "value": "7 matches",
            "label": "2026–27 Elite league stage",
            "source": "BCCI domestic season ready reckoner"
          },
          {
            "value": "₹45 lakh",
            "label": "Top Test incentive bonus per match",
            "source": "BCCI Test Cricket Incentive Scheme; Playing XI at the top participation tier"
          },
          {
            "value": "No causal estimate",
            "label": "Policy effect established by this evidence",
            "source": "Public evidence reviewed for this story"
          }
        ]
      }
    },
    {
      "id": "bcci-block-ch1",
      "type": "chapter-heading",
      "data": {
        "title": "Chapter 1 — A warning, an omission and a careful distinction",
        "anchorId": "chapter-1"
      }
    },
    {
      "id": "bcci-block-p1",
      "type": "paragraph",
      "data": {
        "text": "<p>In February 2024, the Board of Control for Cricket in India made the status of domestic red-ball cricket a public issue. On 15 February, secretary Jay Shah said centrally contracted players would be expected to play domestic red-ball cricket when asked by the captain, coach and selectors. Two days later, <cite data-ref=\"src-bcci-letter-report\">[2]</cite> reported on a letter to centrally contracted and India A players. The letter, as quoted by the newspaper, described domestic performance as a “critical yardstick for selection” and warned that non-participation could have serious consequences.</p>\n<p>On 28 February, the BCCI published the annual player-contract list for the 2023–24 season. Shreyas Iyer and Ishan Kishan were not included. The release itself says they were “not considered” in that round, then recommends that players give precedence to domestic cricket when they are not representing the national team <cite data-ref=\"src-bcci-retainership-2024\">[1]</cite>. Those two sentences are a primary record of what the board publicly announced.</p>\n<p>They are not, by themselves, proof of every explanation circulating at the time. It is too strong to write that the BCCI “stripped” existing contracts: the release concerns the annual contract list for a specified season and says the pair were not considered in that round. Contemporary reporting linked the omissions to missed domestic games, but the official release does not spell out that causal rationale. A careful account keeps the official wording, the reporting and the inference in separate boxes.</p>\n<p>That distinction is more than legalistic. A contract decision can signal a policy without being the same thing as a published rulebook, and a board's stated preference is not the same as proof that the preference changed player behaviour. The question is therefore twofold: what incentives and consequences did the BCCI put on the table, and what evidence would show whether the intervention worked?</p>"
      }
    },
    {
      "id": "bcci-block-ch2",
      "type": "chapter-heading",
      "data": {
        "title": "Chapter 2 — What a domestic playing day pays",
        "anchorId": "chapter-2"
      }
    },
    {
      "id": "bcci-block-p2",
      "type": "paragraph",
      "data": {
        "text": "<p>The public fee schedule that can be checked directly is in the minutes of the BCCI's ninth Apex Council meeting, dated 20 September 2021. For senior men's domestic cricket, the revised table lists ₹40,000 per day for players in the first match-count band, ₹50,000 for the next band and ₹60,000 for players above 40 matches. Reserves have their own rates: ₹20,000, ₹25,000 and ₹30,000 respectively <cite data-ref=\"src-bcci-domestic-fee-table\">[3]</cite>. The schedule rewards match experience, but the BCCI table labels the bands simply as “matches”; it does not describe them as first-class appearances only.</p>\n<p>That last detail matters. Some later retellings describe the top rate as a Ranji fee for a player with more than 40 first-class games. A contemporaneous report after the revision said the match count was not restricted to one format. The safe description is the one the primary document supports: a senior men's daily domestic fee schedule with tiered match counts. The table is a rate card, not a list of annual salaries.</p>\n<p>The BCCI's announced 2026–27 calendar gives each Ranji Trophy Elite team seven league matches and each Plate team five <cite data-ref=\"src-bcci-season-2026-27\">[6]</cite>. A simple illustration helps explain scale without pretending to calculate anyone's payslip. Seven four-day matches create at most 28 scheduled match-days. Multiplying 28 by ₹40,000 gives ₹11.2 lakh; multiplying by ₹50,000 gives ₹14 lakh; multiplying by ₹60,000 gives ₹16.8 lakh. Those are scenario calculations if all 28 days are fee-eligible—not guaranteed season earnings, take-home pay or the amount earned by every player.</p>\n<p>The same rates were still reported as the senior men's domestic fee structure by The New Indian Express in May 2026, while the public BCCI rate table located for this report remains dated 2021 <cite data-ref=\"src-fee-report-2026\">[4]</cite>. That is the latest public evidence located here, not proof that no unpublished revision or individual arrangement exists. The distinction should remain visible to readers rather than being hidden behind a definitive “current salary” label.</p>"
      }
    },
    {
      "id": "bcci-block-fee-graphic",
      "type": "image",
      "data": {
        "src": "/images/editorial/bcci-domestic-fees.svg",
        "alt": "Three senior men's domestic daily fee tiers: ₹40,000, ₹50,000 and ₹60,000 across the BCCI's published match-count bands.",
        "caption": "A daily rate card, not an annual salary. BCCI's table was published in September 2021; The New Indian Express reported the same rates in May 2026.",
        "credit": "The Breakdown · BCCI / The New Indian Express",
        "width": "full"
      }
    },
    {
      "id": "bcci-block-domestic-math",
      "type": "comparison",
      "data": {
        "metric": "Illustrative fee total across 28 scheduled days",
        "before": {
          "value": "₹11.2 lakh",
          "label": "₹40,000 per day × 28 days"
        },
        "after": {
          "value": "₹16.8 lakh",
          "label": "₹60,000 per day × 28 days"
        },
        "description": "The middle tier would total ₹14 lakh under the same assumption. This is arithmetic on scheduled days, not a guaranteed payment: match duration, fee eligibility, selection and other applicable rules matter."
      }
    },
    {
      "id": "bcci-block-ch3",
      "type": "chapter-heading",
      "data": {
        "title": "Chapter 3 — The Test incentive is a separate instrument",
        "anchorId": "chapter-3"
      }
    },
    {
      "id": "bcci-block-p3",
      "type": "paragraph",
      "data": {
        "text": "<p>In March 2024, the BCCI announced a Test Cricket Incentive Scheme that adds a bonus on top of the existing Test match fee. The published table is explicit about its model: it assumes nine Tests in a season, and separates Playing XI members from non-playing squad members. At the highest listed tier—seven or more Tests—the additional bonus is ₹45 lakh per match for a Playing XI member and ₹22.5 lakh for a non-playing squad member. At five or six Tests, the additional rates fall to ₹30 lakh and ₹15 lakh; below four Tests, the table says no incentive is payable <cite data-ref=\"src-bcci-test-incentive\">[5]</cite>.</p>\n<p>These are incentive bonuses, not the same thing as the daily domestic fee. Nor is the ₹45 lakh figure the amount every Test cricketer receives. Eligibility depends on participation in the assumed season, and the Playing XI and non-playing squad rates differ. The scheme therefore rewards repeated Test participation, while the domestic fee schedule pays by eligible day and match-count band. Treating them as one compensation system would erase the eligibility rules that explain who can earn what.</p>\n<p>There is also a small ambiguity in the published table. Under its nine-Test assumption, the categories read “less than 4,” “5 &amp; 6,” and “7 or more.” Exactly four Tests are not classified. The gap does not prove that the scheme is invalid; it means the public table does not answer that case. A reliable account should flag the omission and seek clarification from the BCCI rather than invent an interpolated tier.</p>\n<p>Just as important, this scheme concerns Test cricket, not a direct payment for choosing Ranji Trophy over a franchise opportunity. It may strengthen the long-format incentive for players who are selected for Tests and qualify under its terms, but it cannot by itself establish that domestic participation increased. That is a distinct empirical question and needs a different dataset.</p>"
      }
    },
    {
      "id": "bcci-block-ch4",
      "type": "chapter-heading",
      "data": {
        "title": "Chapter 4 — Why a headline comparison can mislead",
        "anchorId": "chapter-4"
      }
    },
    {
      "id": "bcci-block-p4",
      "type": "paragraph",
      "data": {
        "text": "<p>It is tempting to place a full Ranji season beside an IPL contract and declare the economic incentive obvious. The comparison can be useful, but only if it is honest about what the numbers represent. A domestic daily fee, a central retainership, a Test incentive and a franchise contract have different eligibility conditions, durations and degrees of certainty. They are not interchangeable salary lines.</p>\n<p>A fee calculation based on 28 scheduled days is an upper-bound illustration under an explicit assumption. It is not proof that every fixture lasts four days, that each player appears in every match, or that every scheduled day is paid in the same way. Likewise, an IPL auction base price is not evidence that a player was bought, selected to play, or paid that amount for a season. A central retainership is a separate contractual payment, and its value depends on the grade and terms. An annual income estimate would need the player's actual contract, appearances, absences and applicable payment rules.</p>\n<p>The economic problem is therefore not simply that one format “pays more.” Players weigh money alongside selection, career longevity, injury exposure, training, travel and the chance of being picked. The BCCI's stated rationale is that domestic cricket is a foundation for national selection and player development; that is a plausible sporting argument. But without attributable player interviews, contract detail and workload data, the newsroom cannot responsibly claim to know how an individual player calculated the trade-off.</p>\n<p>That restraint cuts both ways. A board may reasonably argue that domestic appearances sustain competitive depth and provide a current assessment of form. A player may reasonably need recovery time or a medical exemption. Neither argument should be accepted as a universal explanation. The reporting task is to examine the rules, record what happened and test each explanation against evidence—not to call every absence disloyal or every directive coercive by default.</p>\n<p>There is also a named counterargument. In May 2026, former India batter Amay Khurasiya told <em>The New Indian Express</em> that Ranji players should be paid substantially more so red-ball cricket can meet families' financial needs, or state associations should create contract systems <cite data-ref=\"src-fee-report-2026\">[4]</cite>. That is a policy argument from a former player and coach, not a representative survey of player incomes. It nevertheless points to a question the rate card alone cannot answer: how predictable is a player's income across a season, including days when they are not selected or a match ends early?</p>"
      }
    },
    {
      "id": "bcci-block-ch5",
      "type": "chapter-heading",
      "data": {
        "title": "Chapter 5 — The missing scorecard: what would prove the policy worked?",
        "anchorId": "chapter-5"
      }
    },
    {
      "id": "bcci-block-p5",
      "type": "paragraph",
      "data": {
        "text": "<p>The decisive gap is measurement. A letter, a contract announcement and a revised incentive schedule establish that the board communicated a preference and created financial terms. They do not establish how many players changed their behaviour because of the policy. A few high-profile appearances after a public warning can illustrate the debate, but anecdotes cannot provide a population-level effect.</p>\n<p>To answer the question, the BCCI—or an independent researcher working from reliable scorecards and published squads—would first define the relevant cohort. “Players” could mean centrally contracted players, India A players, recently capped international players or all players eligible for senior domestic cricket. Those groups have different obligations. The analysis would then need a season-by-season record of each player's availability, selection, appearances and matches missed, separated by red-ball and white-ball competition.</p>\n<p>Availability is the crucial denominator. Counting appearances alone can make participation appear to rise or fall when the underlying pool of available players has changed. A credible ledger would record national duty, injury or rehabilitation status at a privacy-respecting level, non-selection, team scheduling and other documented exclusions. It would also distinguish a player who was available but did not appear from one who was not eligible or not fit to play. Personal medical details are not necessary for a public dataset; a published category and audit method would be enough for most analysis.</p>\n<p>The evaluation would compare defined periods before and after the February 2024 intervention and test alternative explanations: changes in the international calendar, selectors' decisions, individual injuries, tournament format, squad rotation and other policy changes. It would publish the cohort definition, raw match-level records or a reproducible summary, the calculation and limitations. A single percentage without those details is not a finding. No reproducible percentage is asserted in this story.</p>"
      }
    },
    {
      "id": "bcci-block-ch6",
      "type": "chapter-heading",
      "data": {
        "title": "Chapter 6 — A better accountability test",
        "anchorId": "chapter-6"
      }
    },
    {
      "id": "bcci-block-p6",
      "type": "paragraph",
      "data": {
        "text": "<p>The strongest case for the policy is institutional: domestic first-class cricket is not merely a fallback for players outside the national side. It is a competition in which form can be tested over longer spells, younger players can meet experienced opponents, and state teams maintain a development pathway. The BCCI's 2026–27 calendar continues to devote a substantial place to multi-day cricket, although it also reorganises other competitions and scheduling <cite data-ref=\"src-bcci-season-2026-27\">[6]</cite>. That confirms the format remains part of the board's structure; it does not measure whether the 2024 directive improved it.</p>\n<p>A fair evaluation should publish three things. First, a clear rule that distinguishes a board recommendation, a selection consideration, an annual-contract decision and a formal eligibility requirement. Second, a privacy-conscious record of player availability and domestic appearances by a pre-defined cohort. Third, a separate statement of how medical exceptions, national commitments and return-to-play decisions are handled. These would make the policy legible to players, state associations and the public without pretending that every absence has the same cause.</p>\n<p>The economic data should be equally clear. The BCCI should keep the date and scope of fee schedules easy to find, distinguish daily fees from annual contracts and bonuses, and explain the Test incentive's four-match edge case. State associations could help players understand what they may earn under realistic playing-day scenarios, instead of letting a maximum calculation be mistaken for a standard income. Those are practical transparency steps, not claims that payment alone can solve scheduling or workload conflicts.</p>\n<p>The defensible conclusion is narrower than the original headline suggested. In February 2024, the BCCI publicly strengthened its message that players should prioritise domestic cricket when not on national duty, and its annual-contract release coincided with the omission of Iyer and Kishan. Official records show domestic fee tiers and a separate Test incentive; they also show the limits of what the public data can settle. Whether the directive produced a sustained, measurable increase in domestic participation remains a question for a transparent dataset, not a slogan.</p>"
      }
    }
  ]
}

export const REMEDIATED_STORIES_REGISTRY: Record<string, Story> = {
  'ai-literacy-india-students-verify-ai': REMEDIATED_AI_LITERACY_STORY,
  'india-semiconductor-mission-fab-reality': REMEDIATED_SEMICONDUCTOR_STORY,
  'bcci-domestic-mandate-ranji-economics': REMEDIATED_BCCI_CRICKET_STORY,
};

export const REMEDIATED_STORIES_MAP = REMEDIATED_STORIES_REGISTRY;
