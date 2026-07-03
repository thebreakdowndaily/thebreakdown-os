# THE BREAKDOWN
## Writer Agent — Test Specification v1.0

### Section 1: Schema Conformance
- [ ] Output conforms to `writer.schema.json`
- [ ] Every section in the architecture has a corresponding section in the output
- [ ] No additional sections beyond what the architecture specified
- [ ] Each section's `id` matches the architecture's `id`
- [ ] Each section's `question` matches the architecture's `question`
- [ ] Each section's `module` matches the architecture's `module`
- [ ] `totalWordCount` is the sum of all section word counts
- [ ] `wordCount` is within ±10% of the architecture's target

### Section 2: Evidence Usage
- [ ] Every factual claim has an inline source citation
- [ ] Every evidence reference from the architecture appears in the output
- [ ] Evidence is used in the correct section (no cross-section borrowing)
- [ ] No evidence is used that wasn't in the knowledge base
- [ ] Conflicting evidence is presented neutrally
- [ ] Tier 5 sources are labelled as such
- [ ] Unverified claims are flagged

### Section 3: Structural Compliance
- [ ] Section order matches the architecture exactly
- [ ] Every section begins with its assigned question
- [ ] Headings match the architecture exactly
- [ ] Visual placeholders are marked with `[VISUAL: ...]`
- [ ] Narrative flow follows the 8-stage sequence from the architecture
- [ ] Reader journey questions are answered in order

### Section 4: Tone & Style
- [ ] Each section uses its assigned tone
- [ ] No tone switching within sections
- [ ] Active voice used throughout (≥ 80% of sentences)
- [ ] Average sentence length 15–22 words
- [ ] No rhetorical questions, editorial language, or speculation
- [ ] No humor/sarcasm/irony in analytical or urgent sections
- [ ] Number formatting follows style guide (₹, Cr, commas, etc.)
- [ ] Acronyms defined on first use

### Section 5: Audience Adaptation
- [ ] Language level matches audience's assumed knowledge
- [ ] Jargon is defined or avoided based on audience
- [ ] Term definitions appear on first mention for general public audience
- [ ] Depth of analysis matches story depth from architecture

### Section 6: Citation Integrity
- [ ] Every inline citation has a matching entry in the Sources section
- [ ] Direct quotes are attributed to named speakers
- [ ] Quote format: "quote" - **Speaker**, Title (Source, Date)
- [ ] Citation format: [Source Name, Year] or [Source Name, Page]
- [ ] No unattributed claims (excluding common knowledge)

### Section 7: Zero Tolerance Check
- [ ] No fabricated facts
- [ ] No unattributed claims
- [ ] No editorializing ("clearly," "obviously," "importantly")
- [ ] No speculation ("could lead to," "remains to be seen")
- [ ] No rhetoric (rhetorical questions, appeals to emotion)
- [ ] No opinion (unless Opinion story type)
- [ ] No plagiarism (direct quotes quoted and attributed)
- [ ] No section deviation (order, content, questions)

### Section 8: Quality Gate
- [ ] All zero tolerance rules pass
- [ ] All sections within ±10% word count
- [ ] Every section begins with its question
- [ ] Every factual claim has a source
- [ ] Evidence references match the architecture
- [ ] Tone is correct for every section
- [ ] Audience is correctly addressed
- [ ] Citations are complete and consistent
- [ ] Visual placeholders are present where specified
- [ ] No sections added, removed, or reordered

---

## Results

| Section | Pass | Fail | N/A |
|---------|------|------|-----|
| 1. Schema Conformance | ☐ | ☐ | ☐ |
| 2. Evidence Usage | ☐ | ☐ | ☐ |
| 3. Structural Compliance | ☐ | ☐ | ☐ |
| 4. Tone & Style | ☐ | ☐ | ☐ |
| 5. Audience Adaptation | ☐ | ☐ | ☐ |
| 6. Citation Integrity | ☐ | ☐ | ☐ |
| 7. Zero Tolerance | ☐ | ☐ | ☐ |
| 8. Quality Gate | ☐ | ☐ | ☐ |
| **Overall** | **☐** | **☐** | **☐** |
