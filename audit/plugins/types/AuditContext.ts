export interface AuditContext {
  /** Absolute path to the repository root */
  repoRoot: string;
  /** Arbitrary configuration object for the plugin runtime */
  config: Record<string, unknown>;
}
