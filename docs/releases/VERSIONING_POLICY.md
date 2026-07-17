# Semantic Versioning Policy

The Breakdown follows Semantic Versioning 2.0.0 (SemVer) to ensure consistent dependency, API, and schema updates.

Given a version number **MAJOR.MINOR.PATCH** (e.g., `v1.2.3`), increment the:

1. **MAJOR version** when you make incompatible API changes or database migrations that break backward compatibility for existing datasets.
2. **MINOR version** when you add functionality in a backward compatible manner (such as adding a new knowledge engine visualizer, or introducing new non-breaking API parameters).
3. **PATCH version** when you make backward compatible bug fixes, editorial copy updates, or performance patches.

## Release Candidate Naming
- For pre-releases, append `-rc.[number]` to the version (e.g., `v1.0.0-rc.1`).
- Once verified, drop the suffix for the final release tag (e.g. `v1.0.0`).
