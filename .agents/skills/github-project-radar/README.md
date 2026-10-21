# GitHub Project Radar — Antigravity skill

This workspace skill discovers and evaluates GitHub repositories against The Breakdown OS's actual needs. It uses the Agent Skills layout supported by Antigravity.

## Run in Antigravity

Open the workspace for `thebreakdowndaily/thebreakdown-os` and invoke:

    /github-project-radar

Or ask: "Use GitHub Project Radar to identify the highest-value open-source improvements for the current repository. Read our actual instructions, task ledger, tests and architecture first. Produce evidence-backed recommendations only. Do not install dependencies or alter runtime code."

You can state a specific gap, such as RLS regression coverage, government PDF table extraction, or LLM claim-grounding evaluation.

## Included files

- `SKILL.md`: research workflow and safety/change-control rules.
- `references/scorecard.md`: ranking criteria and hard gates.
- `references/project-profile-template.md`: repeatable context template.
- `scripts/crawl_github.py`: bounded GitHub repository metadata and README crawler; emits Markdown and JSON reports.
- `LICENSE`: skill package license.

## Optional metadata crawl

Run from the repository root with Python 3.10+ and outbound access to GitHub:

    python .agents/skills/github-project-radar/scripts/crawl_github.py --project-repo thebreakdowndaily/thebreakdown-os --query "PostgreSQL RLS migration testing PGlite" --query "LLM claim grounding evaluation regression tests" --query "government PDF table extraction India" --query "Next.js security CI regression testing" --top 15

Set `GITHUB_TOKEN` or `GH_TOKEN` in the environment if available. Never paste a token into a command, URL, or report.

The script gathers repository metadata and README excerpts; it is not a source/security audit. The full skill requires deeper inspection of code, tests, licenses, releases, advisories and integration constraints before recommendation. It does not automatically install, integrate, merge or deploy third-party code.
