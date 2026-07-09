# Architecture

The Breakdown OS follows a modular AI architecture.

Each module has ONE responsibility.

Modules communicate using structured JSON.

No module writes directly to the website.

---

```mermaid
graph TD
    Input[Input] --> Discovery
    Discovery --> Research
    Research --> Verification
    Verification --> EntityExt[Entity Extraction]
    EntityExt --> Timeline
    Timeline --> EdThinking[Editorial Thinking]
    EdThinking --> StoryArch[Story Architecture]
    StoryArch --> Writing
    Writing --> Editing
    Editing --> SEO
    SEO --> VisPlan[Visual Planning]
    VisPlan --> WebBuilder[Website Builder]
    WebBuilder --> Publishing
    Publishing --> KG[Knowledge Graph Service]
    KG --> Monitoring
```

---

## Principles

One Responsibility

↓

Loose Coupling

↓

Structured Data

↓

Reusable Components

↓

Human Review

↓

Scalable Design

---

Every module:

Receives JSON

↓

Processes

↓

Returns JSON
