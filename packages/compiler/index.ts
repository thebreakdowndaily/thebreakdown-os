import { CompilerContext } from "./context";
import { Parser } from "./parser";
import { Validator } from "./validator";
import { KnowledgeManifest, ValidationResult } from "./types";
import { CompilerError } from "./errors";

export interface CompileResult {
  manifest: KnowledgeManifest | null;
  validation: ValidationResult;
}

/**
 * Compiles a raw knowledge node into an immutable, validated KnowledgeManifest.
 *
 * @param content The raw node content to compile
 * @returns A CompileResult containing the generated manifest and validation diagnostics.
 */
export function compile(content: any): CompileResult {
  const context = new CompilerContext();
  const parser = new Parser();
  const validator = new Validator();

  try {
    const manifest = parser.parse(content, context);
    const validation = validator.validate(manifest, context);

    return {
      manifest: validation.valid ? manifest : null,
      validation,
    };
  } catch (error) {
    if (error instanceof CompilerError) {
      context.addDiagnostic({
        code: error.code,
        message: error.message,
        severity: "error",
        category: "schema",
      });
    } else {
      context.addDiagnostic({
        code: "KCOMP-999",
        message: `Unexpected compilation error: ${(error as Error).message}`,
        severity: "error",
        category: "schema",
      });
    }

    return {
      manifest: null,
      validation: {
        valid: false,
        diagnostics: [...context.diagnostics],
      },
    };
  }
}

// Export public APIs and Types
export { CompilerContext } from "./context";
export { Parser } from "./parser";
export { Validator } from "./validator";
export { extractMetadata } from "./metadata";
export { inferCapabilities, CapabilityRulesRegistry } from "./inference";
export { extractRelationships } from "./relationships";
export { ManifestBuilder } from "./manifest-builder";
export * from "./types";
export * from "./errors";
