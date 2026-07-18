# Audit Framework

## Project Status
| Phase | Description |
|------|--------------|
| **Phase 1** | Core framework and directory layout |
| **Phase 2** | Implement core plugins (architecture, security, performance, accessibility, SEO) |
| **Phase 3** | Extend to platform‑specific plugins (knowledge‑graph, operations, editorial) |
| **Phase 4** | Editorial intelligence and advanced reporting |

## Purpose
The **Audit‑as‑Code** system provides a deterministic, **read‑only** verification pipeline for The Breakdown platform. It ensures that engineering, security, performance, accessibility, SEO, knowledge‑graph, and operational health meet the standards defined in the platform’s governance documents.

## Architecture Principles
- **Read‑only audits** – CI never modifies source code.
- **Plugin‑based architecture** – each domain is an isolated, versioned plugin.
- **Capability‑first evaluation** – audits focus on measurable outcomes.
- **Vendor neutrality** – tools are interchangeable and version‑pinned.
- **Deterministic execution** – same input produces identical results.
- **Reproducible results** – all dependencies are declared.
- **Environment‑aware policies** – thresholds differ per env (dev/staging/prod).
- **Version compatibility** – manifests declare required Node, audit‑schema, and plugin API versions.

## Directory Structure
```
audit/
│   README.md               # Entry point (this file)
│   CONTRIBUTING.md         # Contribution guidelines
│   ARCHITECTURE.md         # High‑level design of the audit system
│   SCORING.md              # Scoring model definitions (EQS‑E, CQS, etc.)
│   GATES.md                # Launch‑gate thresholds
│   GOVERNANCE.md           # Process for changing thresholds, reviews, ownership
│   manifest.json           # Version of the audit‑as‑code package
│   CHANGELOG.md            # Change history
│   config/                 # Tool versions, timeouts, sampling, paths
│   thresholds/             # Policy thresholds (environment‑aware)
│   reports/                # Templates and generated report index
│   shared/                 # Utility library used by plugins
│   plugins/                # Individual audit plugins
│       architecture/
│           manifest.json
│           specification.md
│           run.ts
│       security/
│           manifest.json
│           specification.md
│           run.ts
│       performance/
│           manifest.json
│           specification.md
│           run.ts
│       accessibility/
│           manifest.json
│           specification.md
│           run.ts
│       seo/
│           manifest.json
│           specification.md
│           run.ts
│       editorial/
│           manifest.json
│           specification.md
│           run.ts
│       knowledge-graph/
│           manifest.json
│           specification.md
│           run.ts
│       operations/
│           manifest.json
│           specification.md
│           run.ts
remediation/               # Optional remediation scripts (not run in CI)
```

## Prerequisites
- **Node.js ≥ 20** (runtime for all plugins)
- **Git** (repository access)
- **npm** (dependency management)
- **Audit tools** – versions are pinned in `config/tool-versions.json` and installed by the CI setup step:
  - `semgrep`
  - `trivy`
  - `@axe-core/cli`
  - `lighthouse`
  - `syft` (SBOM generation)
  - `gitleaks` (secrets scan)

## Running Audits Locally
```bash
# Install project dependencies (including devDependencies for audit tools)
npm ci

# Optional: install audit tools locally via npm scripts (defined in package.json)
npm run audit:setup   # installs pinned tool versions into node_modules/.bin

# Execute all plugins – defaults to development thresholds
npm run audit          # equivalent to: node audit/plugins/loader.js --env development
```
The command generates JSON, Markdown, HTML, SARIF, and JUnit artifacts under `audit/reports/` and stores a baseline copy in `audit-history/<date>/`.

## Repository Scripts (package.json)
```json
"scripts": {
  "audit:setup": "node scripts/install-audit-tools.js",
  "audit": "node audit/plugins/loader.js --env development",
  "audit:dev": "node audit/plugins/loader.js --env development",
  "audit:staging": "node audit/plugins/loader.js --env staging",
  "audit:prod": "node audit/plugins/loader.js --env production"
}
```
These scripts abstract away the loader path and environment selection for contributors.

## Plugin Architecture
Each audit domain lives in `audit/plugins/<name>/` and implements the common `AuditPlugin` interface:
```ts
export interface AuditPlugin {
  name: string;
  version: string;
  run(config: PluginConfig): Promise<AuditResult>;
  thresholds(): Thresholds;
}
```
### Plugin Loader Flow
```
Plugin Loader
   ↓
Discover plugins (read manifest.json files)
   ↓
Validate manifests (required fields, version compatibility)
   ↓
Execute plugins (run())
   ↓
Normalize results (common schema)
   ↓
Aggregate scores
   ↓
Generate reports (JSON, MD, HTML, SARIF, JUnit)
```
### Common Result Schema
All plugins must emit JSON adhering to the following structure (see `ARCHITECTURE.md` for full definition):
```json
{
  "plugin": "security",
  "pluginVersion": "1.0.0",
  "auditSchemaVersion": "2.0",
  "status": "PASS",
  "score": 94,
  "metrics": { "criticalFindings": 0, "highFindings": 2 },
  "findings": [
    { "id": "CSP001", "severity": "high", "description": "Missing CSP header" }
  ],
  "recommendations": [ "Add CSP header with default‑src 'self'" ]
}
```
The schema ensures consistent aggregation and scoring across plugins.

## Report Outputs
| Format | Audience | Description |
|--------|----------|-------------|
| `report.json` | Automation | Machine‑readable results for downstream tooling |
| `report.md`   | Pull requests | Human‑friendly summary displayed in PR comments |
| `report.html` | Engineering review | Full‑featured HTML report with interactive charts |
| `report.sarif`| GitHub Security | Security findings imported into the GitHub Security tab |
| `report.junit.xml` | CI dashboards | Test‑style results for CI visualisation |
All reports are emitted under `audit/reports/` and archived in `audit-history/<date>/` for trend analysis.

## CI Workflow (GitHub Actions)
The workflow defined in `.github/workflows/audit.yml` performs:
1. **Setup** – checkout, install Node, `npm ci`
2. **Install Audit Tools** – reads `config/tool-versions.json` and installs pinned versions globally
3. **Secrets Scan** (`gitleaks`)
4. **SBOM Generation** (`syft`)
5. **Supply‑Chain Verification** (SLSA compliance)
6. **Run Plugins** – via the loader script
7. **Threshold Enforcement** – compares results against `thresholds/<env>.json`
8. **Report Generation** – merges outputs, uploads artifacts, posts PR comment
9. **Baseline Storage** – archives the run under `audit-history/`

## Contributing
Please see `audit/CONTRIBUTING.md` for the standard contribution process (fork, branch, PR). All CI checks must pass, and any new thresholds or plugin version changes must be reviewed according to the governance process.

## Governance
Threshold changes, plugin version bumps, and architectural decisions are governed by `audit/GOVERNANCE.md`. It defines:
- How thresholds are proposed, reviewed, and approved
- Review cadence (quarterly)
- Ownership of each plugin domain
- Versioning policy (semantic versioning for plugins, audit‑schema versioning)

## Version Compatibility
| Component | Minimum Version |
|-----------|-----------------|
| Node.js   | 20.x |
| Audit schema | 2.0 |
| Plugin API | 1.0 |
All plugins must declare compatibility in their `manifest.json` and will be validated by the loader.

## Related Documentation
- [SCORING.md](SCORING.md) – Scoring model definitions
- [GATES.md](GATES.md) – Launch gate thresholds
- [GOVERNANCE.md](GOVERNANCE.md) – Governance process
- [ARCHITECTURE.md](ARCHITECTURE.md) – Detailed design of the audit framework
