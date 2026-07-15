# Documentation

Central knowledge hub for The Breakdown OS.

## Structure

| Directory | Purpose |
|-----------|---------|
| [`blueprints/`](./blueprints/) | High-level system and product blueprints |
| [`architecture/`](./architecture/) | Technical architecture decisions and diagrams |
| [`engineering/`](./engineering/) | Developer guides, onboarding, and runbooks |
| [`editorial/`](./editorial/) | Editorial standards, style guides, and playbooks |
| [`operations/`](./operations/) | Deployment, monitoring, and incident response |
| [`innovation/`](./innovation/) | Research spikes, experiments, and future thinking |
| [`vxs/`](./vxs/) | Visual Experience System — turns visuals from decoration into knowledge objects |
| [`rxs/`](./rxs/) | Reader Experience System — how readers move from curiosity to understanding |

---

## Conventions

- Use Markdown for all documents.
- Prefer short filenames with hyphens: `story-publishing-guide.md`
- Link related documents across directories using relative paths.
- Add a YAML frontmatter block at the top of each doc:

```yaml
---
title: Document Title
status: draft | review | approved | deprecated
owner: team or person
last_updated: YYYY-MM-DD
---
```
