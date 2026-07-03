# THE BREAKDOWN OS
## Agent Orchestrator — Memory v1.0

### Purpose

After every workflow completes, Memory updates the OS's persistent knowledge:

1. **Knowledge Graph** — Add entities, relationships, and facts discovered during the workflow.
2. **Entity Pages** — Create or update entity pages with new information.
3. **Story Index** — Register the completed story in the story index.
4. **Related Stories** — Link new story to existing related stories.
5. **Homepage** — Update homepage with new story.

This is what turns a collection of agents into a true operating system. Every story makes the system smarter.

---

### What Memory Updates

```
Workflow Complete
  │
  ├── 1. Knowledge Graph
  │     ├── Add new entities (people, organizations, laws, schemes)
  │     ├── Add new relationships (entity A → entity B)
  │     ├── Update confidence scores on existing relationships
  │     └── Link story to entities
  │
  ├── 2. Entity Pages
  │     ├── Create page for new entities
  │     ├── Update existing entity pages
  │     │     ├── Add new story reference
  │     │     ├── Update timeline
  │     │     └── Update key facts
  │     └── Generate entity summary
  │
  ├── 3. Story Index
  │     ├── Register story with ID, title, date, type
  │     ├── Index by topic, entity, and keyword
  │     └── Record workflow metadata (duration, revisions, agents used)
  │
  ├── 4. Related Stories
  │     ├── Find stories that share entities
  │     ├── Find stories that share topics
  │     ├── Find stories that share timeline events
  │     └── Link bidirectionally
  │
  └── 5. Homepage
        ├── If breaking: promote to top
        ├── If explainer: add to featured
        ├── If investigation: add to spotlight
        └── Update RSS feed
```

### Memory Data Sources

Memory reads from all completed stage outputs:

| Stage | Data Used |
|-------|-----------|
| entity | Entities, relationships, knowledge graph |
| timeline | Events, dates, causal links |
| knowledge | Verified facts, synthesized knowledge |
| story-architecture | Story structure, entities referenced |
| writer | Story content, citations |
| editorial-review | Quality scores, verdict |

### Update Rules

#### Knowledge Graph

```
For each entity in entity-agent output:
  │
  ├── Entity exists in graph?
  │     ├── Yes → Update:
  │     │        ├── Add new aliases
  │     │        ├── Add new relationships
  │     │        ├── Update confidence (weighted average)
  │     │        └── Add story reference
  │     │
  │     └── No → Create:
  │              ├── Entity ID: {type}-{canonical-slug}
  │              ├── Type, name, description
  │              ├── Initial relationships
  │              ├── Initial confidence
  │              └── Story reference
  │
  └── Add bidirectional relationships between co-mentioned entities
```

#### Entity Pages

```
For each entity that has a story reference:
  │
  ├── Entity page exists?
  │     ├── Yes → Append story to "Related Coverage" section
  │     │        → Update key facts if newer information exists
  │     │        → Update timeline with new events
  │     │
  │     └── No → Create entity page:
  │              ├── Hero: entity name + type
  │              ├── Summary: generated from knowledge base
  │              ├── Key Facts: from entity agent
  │              ├── Timeline: from timeline agent
  │              ├── Related Coverage: this story
  │              └── Relationships: from entity agent
```

#### Story Index

```
Register story:
  │
  Story ID: auto-generated or from writer output
  Title: from writer or editorial thinking
  Type: from editorial thinking (storyType)
  URL: from website agent
  Published: timestamp
  Entities: list of entity IDs
  Topics: from editorial thinking
  Quality Scores: from editorial review
  Agents Used: all stages that ran
  Revision Count: from memory
  Total Duration: from scheduler
```

#### Related Stories

```
For each entity in the new story:
  │
  ├── Find all existing stories referencing this entity
  │     ├── Link new story → existing story
  │     └── Link existing story → new story
  │
  └── Score relatedness:
        ├── Shared entities: +3 per shared entity
        ├── Shared topics: +2 per shared topic
        ├── Same story type: +1
        └── Same timeline event: +2
```

Stories with a relatedness score ≥ 5 are displayed as "Related Stories."

#### Homepage

```
Update homepage based on story type:
  │
  ├── breaking → Add to "Breaking News" section (top of page)
  │              → Push previous breaking down to "Latest"
  │
  ├── explainer → Add to "Explained" section
  │              → If high quality (score > 90): feature in hero
  │
  ├── investigation → Add to "Investigations" section
  │                   → Always feature in spotlight
  │
  ├── policy → Add to "Policy Watch" section
  │
  ├── data → Add to "Data Stories" section
  │
  └── fix → Add to "The Fix" section
```

### Memory Storage

```
.opencode/
  memory/
    knowledge-graph.json       ← Entity nodes + relationship edges
    entity-pages/              ← Individual entity page data
      person-narendra-modi.json
      scheme-mgnrega.json
      ...
    story-index.json           ← All published stories
    related-stories.json       ← Relationship map between stories
    homepage.json              ← Current homepage structure
```

### Memory on Revision

When a story is in revision, Memory does NOT update:

```
Revision loop active:
  │
  ├── Knowledge Graph → NOT updated (story not final)
  ├── Entity Pages → NOT updated (story not final)
  ├── Story Index → NOT updated (story not published)
  ├── Related Stories → NOT updated (story not published)
  └── Homepage → NOT updated (story not published)
```

Memory only updates when the workflow reaches a terminal `approved` state.

### Memory on Rejection

When a story is rejected, Memory still captures what was learned:

```
Story rejected:
  │
  ├── Knowledge Graph → Updated with entities (knowledge is still knowledge)
  ├── Entity Pages → NOT created/updated (no published story to link)
  ├── Story Index → NOT updated
  ├── Related Stories → NOT updated
  └── Homepage → NOT updated
```

Research and entity extraction are never wasted — they enrich the knowledge graph even if the story doesn't publish.
