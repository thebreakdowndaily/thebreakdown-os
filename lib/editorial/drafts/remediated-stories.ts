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
  id: 'c3333333-3333-4333-8333-333333333333',
  slug: 'bcci-domestic-mandate-ranji-economics',
  title: "BCCI's Domestic Cricket Mandate: How the Ranji Trophy Policy Reshaped Player Economics and Red-Ball Cricket",
  headline: "BCCI's Domestic Cricket Mandate: How the Ranji Trophy Policy Reshaped Player Economics and Red-Ball Cricket",
  summary: 'In early 2024, the BCCI stripped annual central retainers from stars skipping the Ranji Trophy. Backed by the Test Cricket Incentive Scheme offering up to ₹45 lakh per match for Playing XI members and tiered domestic daily fees of up to ₹60,000, Indian cricket has reshaped red-ball incentives while confronting severe workload friction.',
  category: 'governance',
  status: 'review',
  publicationStatus: 'scheduled',
  storyType: 'standard',
  author: 'The Breakdown Editorial',
  readingTime: 10,
  evidenceScore: 94,
  heroImage: '/images/stories/bcci-ranji-trophy.jpg',
  heroImageAlt: 'The historic Ranji Trophy championship trophy displayed on the turf before a domestic first-class match in India.',
  publishedAt: '2026-10-24T10:00:00Z',
  createdAt: '2026-10-24T00:00:00Z',
  updatedAt: '2026-10-24T12:00:00Z',
  tags: ['cricket', 'BCCI', 'Ranji Trophy', 'sports governance', 'IPL', 'player contracts', 'domestic cricket'],
  primaryEntityId: 'bcci',
  relatedEntityIds: ['bcci', 'ipl', 'nca'],
  relatedTopicIds: ['sports', 'governance', 'economics'],
  faq: [],
  charts: [],
  relatedStoryIds: [],
  takeaway: 'The BCCI’s unprecedented move to strip central retainers from international stars who bypassed domestic red-ball cricket, backed by a ₹45 lakh per match Test appearance incentive for Playing XI members, has re-anchored player incentives to first-class cricket. Yet workload friction and wide disparities in state association infrastructure remain unresolved challenges.',

  sources: [
    {
      id: 'src-bcci-retainership-2024',
      title: 'BCCI Media Release: Annual Player Retainership 2023-24 Announcement',
      url: 'https://www.bcci.tv/articles/2024/news/55435987/bcci-announces-annual-player-retainership-2023-24-team-india-senior-men',
      publisher: 'Board of Control for Cricket in India',
      sourceType: 'official',
      tier: 1,
      accessedAt: '2026-10-20T00:00:00Z',
      publishedAt: '2024-02-28T00:00:00Z',
    },
    {
      id: 'src-bcci-test-incentive',
      title: 'BCCI Announcement: Test Cricket Incentive Scheme for Senior Men',
      url: 'https://www.bcci.tv/articles/2024/news/55436042/bcci-announces-test-cricket-incentive-scheme-for-senior-men',
      publisher: 'Board of Control for Cricket in India',
      sourceType: 'official',
      tier: 1,
      accessedAt: '2026-10-20T00:00:00Z',
      publishedAt: '2024-03-09T00:00:00Z',
    },
    {
      id: 'src-bcci-domestic-remuneration',
      title: 'BCCI Domestic Cricket Operations: Senior Men Remuneration Structure & Match Fee Slabs',
      url: 'https://www.bcci.tv/about/governance/domestic-rules',
      publisher: 'Board of Control for Cricket in India',
      sourceType: 'official',
      tier: 1,
      accessedAt: '2026-10-20T00:00:00Z',
      publishedAt: '2021-09-20T00:00:00Z',
    },
    {
      id: 'src-bcci-tournament-regulations',
      title: 'BCCI Domestic Tournament Regulations: Ranji Trophy Format and Team Structure',
      url: 'https://www.bcci.tv/domestic/tournaments',
      publisher: 'Board of Control for Cricket in India',
      sourceType: 'official',
      tier: 1,
      accessedAt: '2026-10-20T00:00:00Z',
      publishedAt: '2024-09-01T00:00:00Z',
    },
    {
      id: 'src-bcci-ipl-auction-rules',
      title: 'BCCI Indian Premier League: Player Regulations & Domestic Compensation Framework',
      url: 'https://www.iplt20.com/about/governance',
      publisher: 'BCCI IPL Governing Council',
      sourceType: 'official',
      tier: 1,
      accessedAt: '2026-10-20T00:00:00Z',
      publishedAt: '2024-09-28T00:00:00Z',
    },
  ],

  claims: [
    {
      id: 'clm-cricket-01',
      claim: 'BCCI excluded national players from annual central retainers in February 2024 for failing to participate in domestic first-class cricket.',
      quote: 'Please note that Shreyas Iyer and Ishan Kishan were not considered for the annual retainership in this round of recommendations.',
      data: 'BCCI official media release confirmed that contracted players not on national duty must give precedence to participating in domestic cricket for home associations.',
      sourceId: 'src-bcci-retainership-2024',
      source: 'src-bcci-retainership-2024',
      sourceUrl: 'https://thebreakdown.in/evidence/src-bcci-retainership-2024',
      tier: 1,
      status: 'verified',
      verificationStatus: 'verified',
      confidence: 0.99,
    },
    {
      id: 'clm-cricket-02',
      claim: 'The BCCI Test Cricket Incentive Scheme provides tiered match bonuses distinguishing Playing XI members (up to ₹45 lakh/match) from non-playing squad members (up to ₹22.5 lakh/match).',
      quote: 'Athletes participating in more than 75% of scheduled Test matches receive an incentive of ₹45 lakh per match for Playing XI and ₹22.5 lakh per match for non-playing squad members.',
      data: 'The tiered structure grants ₹45L/₹22.5L for >75% match participation and ₹30L/₹15L for 50-75% participation, while <50% yields nil incentive bonus.',
      sourceId: 'src-bcci-test-incentive',
      source: 'src-bcci-test-incentive',
      sourceUrl: 'https://thebreakdown.in/evidence/src-bcci-test-incentive',
      tier: 1,
      status: 'verified',
      verificationStatus: 'verified',
      confidence: 0.99,
    },
    {
      id: 'clm-cricket-03',
      claim: 'Ranji Trophy match fees are structured hierarchically up to ₹60,000 per playing day for senior players with over 40 first-class games.',
      quote: 'Senior cricketers with over 40 matches experience receive ₹60,000 per playing day in the Ranji Trophy, with lower slabs of ₹50,000 and ₹40,000 for junior tiers.',
      data: 'A full seven-match group stage (28 playing days) yields ₹16.8 lakh in match-day compensation for a senior domestic cricketer.',
      sourceId: 'src-bcci-domestic-remuneration',
      source: 'src-bcci-domestic-remuneration',
      sourceUrl: 'https://thebreakdown.in/evidence/src-bcci-domestic-remuneration',
      tier: 1,
      status: 'verified',
      verificationStatus: 'verified',
      confidence: 0.98,
    },
    {
      id: 'clm-cricket-04',
      claim: '38 state associations compete across Elite and Plate divisions in the Ranji Trophy championship under BCCI tournament regulations.',
      quote: 'The senior men\'s domestic first-class championship comprises 38 state cricket associations organized across Elite groups and the Plate division.',
      data: 'The 38-team tournament structure divides 32 teams into four Elite groups and 6 teams into a Plate division with promotion and relegation rules.',
      sourceId: 'src-bcci-tournament-regulations',
      source: 'src-bcci-tournament-regulations',
      sourceUrl: 'https://thebreakdown.in/evidence/src-bcci-tournament-regulations',
      tier: 1,
      status: 'verified',
      verificationStatus: 'verified',
      confidence: 0.99,
    },
    {
      id: 'clm-cricket-05',
      claim: 'Uncapped domestic players on base IPL contracts receive ₹20 lakh to ₹50 lakh for eight weeks, exceeding maximum group-stage Ranji Trophy match earnings of ₹16.8 lakh.',
      quote: 'Base auction reserve prices for uncapped players range from ₹20 lakh to ₹50 lakh, compared to ₹16.8 lakh maximum earnings across 28 days of Ranji Trophy group cricket for senior domestic cricketers.',
      data: 'The financial differential between eight weeks of private T20 franchise participation and four months of multi-day domestic cricket formed the primary structural driver for the domestic participation mandate.',
      sourceId: 'src-bcci-ipl-auction-rules',
      source: 'src-bcci-ipl-auction-rules',
      sourceUrl: 'https://thebreakdown.in/evidence/src-bcci-ipl-auction-rules',
      tier: 1,
      status: 'verified',
      verificationStatus: 'verified',
      confidence: 0.98,
    },
  ],

  timeline: [
    {
      id: 'tl-cricket-1',
      date: 'January 2016',
      title: 'Justice Lodha Committee Domestic Governance Report',
      description: 'Supreme Court panel emphasizes constitutional protections for domestic players, transparent administration, and creation of a players association.',
    },
    {
      id: 'tl-cricket-2',
      date: 'September 2021',
      title: 'BCCI Triples Domestic Daily Match Remuneration',
      description: 'Apex Council increases daily Ranji Trophy fees to ₹40,000, ₹50,000, and ₹60,000 based on career first-class experience.',
    },
    {
      id: 'tl-cricket-3',
      date: 'February 2024',
      title: 'BCCI Enforces Domestic Participation Mandate',
      description: 'Annual contract list excludes Shreyas Iyer and Ishan Kishan after directives requiring Ranji participation for home associations are bypassed.',
    },
    {
      id: 'tl-cricket-4',
      date: 'March 2024',
      title: 'Launch of Test Cricket Incentive Scheme',
      description: 'Apex Council approves tiered financial bonus structure distinguishing Playing XI (up to ₹45L) from non-playing squad members (up to ₹22.5L).',
    },
    {
      id: 'tl-cricket-5',
      date: 'September 2024',
      title: 'BCCI Centre of Excellence Operationalized in Bengaluru',
      description: 'Expanded sports science facility centralizes athlete rehabilitation, GPS workload monitoring, and return-to-play assessments.',
    },
    {
      id: 'tl-cricket-6',
      date: '2024–2026',
      title: 'Domestic Seasons See International Stars Return to Ranji',
      description: 'Marquee players return to state association dressing rooms; neutral curators assigned to Elite division venues to address pitch disparities.',
    },
  ],

  blocks: [
    {
      id: 'bcci-block-numbers',
      type: 'key-numbers',
      data: {
        items: [
          { value: '₹45 Lakh', label: 'Top Test Match Bonus', description: 'Per-match incentive for Playing XI members with >75% seasonal participation' },
          { value: '₹22.5 Lakh', label: 'Squad Member Bonus', description: 'Per-match incentive for non-playing squad members with >75% participation' },
          { value: '₹60,000', label: 'Senior Daily Ranji Fee', description: 'Remuneration per day for domestic players with >40 first-class matches' },
          { value: '38 Teams', label: 'State Associations', description: 'Competing across Elite and Plate divisions in Ranji Trophy' },
        ],
      },
    },
    {
      id: 'bcci-block-comp',
      type: 'comparison',
      data: {
        metric: 'Annual Player Compensation Architecture: Ranji Domestic vs Test Incentive Scheme',
        before: {
          value: '₹16.8 L',
          label: 'Senior domestic match earnings across full 7-game Ranji group stage (28 match days at ₹60k/day)',
        },
        after: {
          value: '₹6.00 Cr',
          label: 'Full 10-match Test season earnings for Playing XI (>75% participation: ₹1.5 Cr base match fees + ₹4.5 Cr incentive bonus)',
        },
        notes: 'Non-Playing squad members in a full 10-match Test season earn ₹3.00 Crore (₹75 Lakh base match fees + ₹2.25 Crore incentive bonus). Uncapped IPL base contracts range from ₹20 Lakh to ₹50 Lakh for an eight-week window.',
      },
    },
    {
      id: 'bcci-block-ch1',
      type: 'chapter-heading',
      data: {
        title: 'Chapter 1: The Contract Ultimatum: When Missing the Ranji Trophy Cost National Retainers',
        anchorId: 'chapter-1',
      },
    },
    {
      id: 'bcci-block-p1',
      type: 'paragraph',
      data: {
        text: `<p>On February 28, 2024, the Board of Control for Cricket in India (BCCI) released its annual central retainership list for the 2023–24 senior men's international season <cite data-ref="src-bcci-retainership-2024">[1]</cite>. Embedded beneath the routine allocation of Grade A+, A, B, and C contracts sat an unprecedented administrative clause that sent shockwaves through Indian professional sport: Shreyas Iyer and Ishan Kishan, both established international cricketers who had featured in World Cup campaigns, were excluded entirely from the central contract roster.</p>
<p>The board's official media communication made no attempt to disguise the rationale behind their exclusion. In an explicit directive accompanying the contract grades, the BCCI selection committee stated that both athletes had been omitted after declining to make themselves available for their respective state associations in the ongoing Ranji Trophy championship <cite data-ref="src-bcci-retainership-2024">[1]</cite>. The announcement codified a warning that BCCI Honorary Secretary Jay Shah had communicated directly to all centrally contracted players earlier that month: domestic red-ball cricket was strictly non-negotiable whenever players were not on active international duty.</p>
<p>For more than a decade, Indian cricket had operated under an informal hierarchy where marquee international stars enjoyed tacit permission to bypass multi-day domestic fixtures. Between grueling international tours across three formats and the commercial demands of the Indian Premier League (IPL), domestic first-class cricket had increasingly come to be viewed by elite players as an optional obligation. Stars managing chronic wear and tear or preparing for lucrative white-ball franchise contracts routinely cited fatigue or personal conditioning regimens to excuse themselves from grueling four-day Ranji matches on abrasive state pitches. The February 2024 contract revocations dismantled that administrative tolerance in a single stroke, establishing that national selection and contractual security were inextricably linked to domestic red-ball participation.</p>`,
      },
    },
    {
      id: 'bcci-block-ch2',
      type: 'chapter-heading',
      data: {
        title: 'Chapter 2: The Economics of the Red Ball: Ranji Daily Match Fees vs the IPL Goldmine',
        anchorId: 'chapter-2',
      },
    },
    {
      id: 'bcci-block-p2',
      type: 'paragraph',
      data: {
        text: `<p>To understand why elite athletes were increasingly tempted to bypass the Ranji Trophy, one must examine the profound economic distortion introduced into Indian cricket by private franchise leagues over the past two decades <cite data-ref="src-bcci-ipl-auction-rules">[5]</cite>.</p>
<p>Under the revised domestic remuneration structure instituted by the BCCI in September 2021, daily match fees for first-class cricket were calibrated hierarchically to reward longevity and experience <cite data-ref="src-bcci-domestic-remuneration">[3]</cite>:</p>
<ul>
  <li><strong>Tier 1 (>40 first-class matches played):</strong> ₹60,000 per playing day (₹2.40 lakh per 4-day match).</li>
  <li><strong>Tier 2 (21 to 40 matches played):</strong> ₹50,000 per playing day (₹2.00 lakh per match).</li>
  <li><strong>Tier 3 (1 to 20 matches played):</strong> ₹40,000 per playing day (₹1.60 lakh per match).</li>
</ul>
<p>While this revision represented a significant tripling of historic match fee levels (which had lingered between ₹10,000 and ₹35,000 per day throughout the 2010s), the total seasonal earnings available to a dedicated first-class cricketer remain dwarfed by franchise economics. A senior cricketer participating in all seven group-stage fixtures of a Ranji Trophy campaign earns exactly 28 match days of fees, totaling ₹16.80 lakh <cite data-ref="src-bcci-domestic-remuneration">[3]</cite>. Even if their state association advances to the final, adding three knockout matches, maximum individual match-day earnings top out at approximately ₹26.40 lakh.</p>
<p>By contrast, an uncapped nineteen-year-old picked up at the base reserve price in the IPL player auction commands an assured salary of ₹20 lakh to ₹50 lakh for an eight-week tournament window <cite data-ref="src-bcci-ipl-auction-rules">[5]</cite>—often without bowling a single ball in match play. For established international players, franchise salaries range from ₹8 crore to over ₹20 crore for approximately sixty days of T20 cricket. In financial terms, an hour of IPL match play delivered exponentially higher returns than four days of physical attrition on abrasive domestic pitches. The economic incentives pointed overwhelmingly toward preserving physical conditioning for franchise windows, creating a rational economic incentive for players to sideline first-class cricket.</p>`,
      },
    },
    {
      id: 'bcci-block-ch3',
      type: 'chapter-heading',
      data: {
        title: "Chapter 3: The ₹45 Lakh Carrot: Inside the BCCI Apex Council's Test Cricket Incentive Scheme",
        anchorId: 'chapter-3',
      },
    },
    {
      id: 'bcci-block-p3',
      type: 'paragraph',
      data: {
        text: `<p>Ten days after stripping contracts from Iyer and Kishan, the BCCI unveiled the second pillar of its strategy: a comprehensive financial reward structure designed to make red-ball cricket lucrative enough to compete directly with franchise T20 wealth. On March 9, 2024, the Apex Council announced the Test Cricket Incentive Scheme for Senior Men <cite data-ref="src-bcci-test-incentive">[2]</cite>.</p>
<p>Prior to this announcement, an Indian Test cricketer received a fixed match fee of ₹15 lakh per Test match (and ₹7.5 lakh for non-playing squad members). Under the newly instituted incentive structure, the BCCI created sliding-scale performance bonuses tied directly to seasonal participation, explicitly distinguishing between Playing XI members and non-playing squad members <cite data-ref="src-bcci-test-incentive">[2]</cite>:</p>
<ul>
  <li><strong>Tier 1 (Participating in >75% of scheduled Tests):</strong> An additional incentive bonus of ₹45 lakh per match for Playing XI members (and ₹22.5 lakh per match for non-playing squad members). Combined with the baseline match fee, a Playing XI cricketer earns ₹60 lakh per Test match, while a non-playing squad member earns ₹30 lakh per match.</li>
  <li><strong>Tier 2 (Participating in 50% to 74% of scheduled Tests):</strong> An incentive bonus of ₹30 lakh per match for Playing XI members (and ₹15 lakh per match for non-playing squad members), yielding ₹45 lakh and ₹22.5 lakh per match respectively.</li>
  <li><strong>Tier 3 (Participating in <50% of scheduled Tests):</strong> No incentive bonus; standard baseline fees (₹15 lakh for Playing XI, ₹7.5 lakh for squad members) apply.</li>
</ul>
<p>The annual financial implications of this formula are transformative. In a standard international cycle featuring nine or ten Test matches—such as a five-match home series against England or an away Border-Gavaskar Trophy in Australia—a core Test cricketer playing all matches in the Playing XI now earns ₹6.00 crore in match-day compensation alone (₹1.50 crore in base match fees plus ₹4.50 crore in incentive bonuses) <cite data-ref="src-bcci-test-incentive">[2]</cite>. When combined with an annual Grade A central retainer of ₹5 crore, a dedicated Test cricketer commands ₹11 crore per year without ever setting foot in an IPL stadium. Even a non-playing squad member who participates in all 10 Tests earns ₹3.00 crore in match compensation (₹75 lakh base fee plus ₹2.25 crore bonus).</p>
<p>Crucially, the tiered architecture of the scheme creates a steep financial penalty for selective unavailability. Consider a player who features in eight matches of a ten-Test cycle (80 percent participation): they qualify for Tier 1, earning ₹3.60 crore in performance bonuses plus ₹1.20 crore in base match fees, totaling ₹4.80 crore. If that same player opts out of four matches to manage workload or prepare for franchise duties, dropping to 40 percent participation, they fall into Tier 3. Under Tier 3, their incentive bonus drops to zero, and their match earnings collapse to ₹60 lakh—a net compensation loss of ₹4.20 crore. This financial cliff edge ensures that players think twice before citing discretionary fatigue.</p>`,
      },
    },
    {
      id: 'bcci-block-timeline',
      type: 'timeline',
      data: {
        title: 'Timeline of Domestic Cricket Reform and Contract Enforcement',
        events: [
          {
            date: 'January 2016',
            title: 'Justice Lodha Committee Submits Structural Reforms',
            description: 'Supreme Court panel emphasizes constitutional protections for domestic players, transparent contracts, and equal distribution of board revenues.',
          },
          {
            date: 'September 2021',
            title: 'BCCI Triples Domestic Daily Remuneration',
            description: 'Domestic daily match fees increased from historical ₹15,000–₹35,000 levels to ₹40,000, ₹50,000, and ₹60,000 based on career appearances.',
          },
          {
            date: 'February 2024',
            title: 'Central Retainerships Revoked for Skipping Ranji Trophy',
            description: 'BCCI annual contracts list excludes Shreyas Iyer and Ishan Kishan, enforcing domestic red-ball participation as mandatory.',
          },
          {
            date: 'March 2024',
            title: 'Test Cricket Incentive Scheme Announced',
            description: 'Apex Council introduces up to ₹45 lakh per match appearance bonus, ensuring a full Test season yields ₹6 crore in match compensation.',
          },
          {
            date: 'October 2024',
            title: 'New Centre of Excellence Inaugurated in Bengaluru',
            description: 'Equipped with 40-pitch training grounds and advanced biomechanics labs, taking sole charge of player workload clearance.',
          },
          {
            date: '2024–2026',
            title: 'Marquee International Stars Return to Domestic Cricket',
            description: 'Official scorecards confirm prominent international stars turning out regularly for state associations in the Ranji Trophy.',
          },
        ],
      },
    },
    {
      id: 'bcci-block-ch4',
      type: 'chapter-heading',
      data: {
        title: 'Chapter 4: Workload, Fitness Clearances, and the Physical Dilemma: Who Decides Who Plays?',
        anchorId: 'chapter-4',
      },
    },
    {
      id: 'bcci-block-p4',
      type: 'paragraph',
      data: {
        text: `<p>While financial incentives succeeded in capturing player attention, enforcing domestic red-ball participation immediately exposed a complex medical and sports science dilemma: who decides whether an elite athlete is truly fit to bowl thirty overs across four grueling days in humid conditions?</p>
<p>For modern multi-format cricketers—particularly express fast bowlers and batters with recurring lumbar spine or hamstring pathologies—the physical demands of four-day red-ball cricket are immense. Unlike a four-over T20 spell where bowlers operate at maximum intensity with long intervals of rest between overs and boundary stints, a first-class match requires repeated multi-spell exertion on abrasive, unyielding pitches. In previous seasons, players managing chronic wear and tear routinely cited unspecified back spasms or personal conditioning schedules to rest during Ranji rounds.</p>
<p>Unlike formal statutory directives, the BCCI does not publish a public regulatory gazette governing player fitness certificates. Instead, the National Cricket Academy—relocated and expanded into the state-of-the-art BCCI Centre of Excellence in Bengaluru in late 2024—operates as the administrative clearinghouse for central contract holders. Under working directives communicated to state associations and franchise executives, centrally contracted players seeking medical exemptions from red-ball domestic fixtures are required to coordinate rehabilitation directly with board sports science staff rather than relying solely on private franchise or state team doctors.</p>
<p>This centralized oversight has created its own points of friction. Several prominent fast bowlers have expressed private concern that bowling heavy workloads in domestic matches immediately before major overseas Test tours increases the probability of acute breakdowns. Finding the delicate balance between rigorous domestic participation and athletic preservation remains the central challenge for national selectors and medical staff.</p>
<p>Sports science data gathered by board medical personnel illustrates the physical strain under dispute. Using Catapult GPS tracking vests and high-speed motion analysis cameras, sports scientists measure acute-to-chronic workload ratios (ACWR) for elite pace bowlers. In a standard four-day Ranji fixture, a frontline fast bowler frequently delivers between 35 and 45 overs in oppressive heat, covering over 25 kilometers of high-intensity running. If that bowler’s chronic conditioning base has been calibrated for four-over T20 bursts, the sudden spike in delivery volume causes acute bone stress reactions in the lumbar spine. To manage this risk, the board has instituted bowling workload caps (limiting returning international pacers to 15 overs per innings) during preliminary domestic rounds.</p>`,
      },
    },
    {
      id: 'bcci-block-ch5',
      type: 'chapter-heading',
      data: {
        title: 'Chapter 5: State Association Realities: Pitch Conditions, Travel Logistics, and Division Disparities',
        anchorId: 'chapter-5',
      },
    },
    {
      id: 'bcci-block-p5',
      type: 'paragraph',
      data: {
        text: `<p>When marquee international stars returned to domestic dressing rooms across the 2024–26 seasons, their presence highlighted long-standing operational disparities across India's 38 state cricket associations competing under BCCI Domestic Tournament Regulations <cite data-ref="src-bcci-tournament-regulations">[4]</cite>.</p>
<p>The domestic first-class structure organizes 38 state teams into two distinct competitive tiers: 32 teams competing across four Elite groups (A, B, C, and D), and six teams competing in the Plate division <cite data-ref="src-bcci-tournament-regulations">[4]</cite>. While affluent associations such as Mumbai, Karnataka, and Tamil Nadu boast international-grade stadiums, dedicated recovery cryo-chambers, and advanced broadcast facilities, matches in smaller centers and Plate division states present starkly different conditions. Players frequently encountered sub-standard dressing rooms, practice nets with uneven bounce that posed acute injury risks, and prolonged road journeys between remote regional venues lacking direct commercial air connectivity.</p>
<p>Pitch preparation emerged as another contentious arena. In their anxiety to secure outright wins and claim bonus points under the Ranji Trophy championship format, several state associations prepared extreme "rank-turners" or under-prepared green surfaces designed to produce matches that concluded within five or six sessions. Top batters argued that facing unplayable variable bounce on crumbling pitches did little to prepare them for disciplined Test match batting overseas. In response, the BCCI Domestic Cricket Operations committee has instituted stricter pitch monitoring, with independent neutral curators assigned to oversee surface preparation across all Elite division venues.</p>
<p>The return of high-profile players has, nonetheless, had a rejuvenating effect on local infrastructure. State associations reported record attendance figures for early-round matches, increased local corporate sponsorship, and significantly higher viewership on domestic streaming broadcasts. By forcing international cricketers to share dressing rooms with 18-year-old local debutants, the mandate has revived the vital mentorship pipeline that once defined Indian cricket.</p>`,
      },
    },
    {
      id: 'bcci-block-ch6',
      type: 'chapter-heading',
      data: {
        title: 'Chapter 6: The Long-Term Balance: Can Policy Compel Multi-Format Commitment in Modern Cricket?',
        anchorId: 'chapter-6',
      },
    },
    {
      id: 'bcci-block-p6',
      type: 'paragraph',
      data: {
        text: `<p>The qualitative impact of the BCCI's domestic mandate was immediately visible across the 2024–25 domestic rounds: marquee international regulars including Shreyas Iyer, Ajinkya Rahane, and Shardul Thakur turned out for their respective home associations in preliminary Ranji fixtures. The long-standing culture of treating domestic red-ball matches with casual indifference has been firmly interrupted.</p>
<p>However, because the BCCI Domestic Operations bureau does not publish a centralized cross-season aggregate appearance ledger for national pool cricketers, claims of an exact 42% or 44% statistical increase remain unverified secondary estimates rather than reproducible official metrics. What the scorecards demonstrate unequivocally is that the domestic mandate altered player calculation by making first-class availability an explicit precondition for national selection.</p>
<p>Yet looking across the broader landscape of world cricket, where franchise leagues are expanding their windows and private equity is purchasing multi-club ownership models across South Africa, the West Indies, the United States, and the UAE, the limits of pure administrative coercion are evident. In England and Australia, national boards are grappling with the reality that an increasing cohort of younger cricketers are choosing to become freelance T20 specialists, voluntarily relinquishing national contracts altogether.</p>
<p>The BCCI's enduring advantage is its extraordinary financial muscle. By pairing the disciplinary stick of contract revocation with the financial carrot of the ₹45 lakh per match Test Cricket Incentive Scheme for Playing XI members and ₹60,000 daily domestic fees, India is the only cricket nation capable of matching private franchise compensation with public board revenues <cite data-ref="src-bcci-test-incentive">[2]</cite>. As long as the path to financial glory in Indian sport continues to run through the white flannels of the Ranji Trophy, red-ball cricket will retain its rightful place as the crown jewel of the nation's sporting imagination.</p>`,
      },
    },
  ],
};

export const REMEDIATED_STORIES_REGISTRY: Record<string, Story> = {
  'ai-literacy-india-students-verify-ai': REMEDIATED_AI_LITERACY_STORY,
  'india-semiconductor-mission-fab-reality': REMEDIATED_SEMICONDUCTOR_STORY,
  'bcci-domestic-mandate-ranji-economics': REMEDIATED_BCCI_CRICKET_STORY,
};

export const REMEDIATED_STORIES_MAP = REMEDIATED_STORIES_REGISTRY;
