import { CompilerContext } from "./context";
import { KnowledgeManifest, ValidationResult } from "./types";

export class Validator {
  public validate(manifest: KnowledgeManifest, context: CompilerContext): ValidationResult {
    // Check if there are any error severity diagnostics already registered in context
    const hasError = context.diagnostics.some((d) => d.severity === "error");

    if (hasError) {
      return {
        valid: false,
        diagnostics: [...context.diagnostics],
      };
    }

    // Additional post-build structural validations
    
    // Example limit validation: no more than 100 relationships per node
    if (manifest.relationships.length > 100) {
      context.addDiagnostic({
        code: "VALIDATION-102",
        message: "Relationship count exceeds maximum allowed limit (100)",
        severity: "warning",
        category: "relationship",
        field: "relationships",
      });
    }

    // Validate that title is reasonable length
    if (manifest.metadata.title.length > 255) {
      context.addDiagnostic({
        code: "VALIDATION-103",
        message: "Title exceeds maximum length (255 characters)",
        severity: "error",
        category: "schema",
        field: "metadata.title",
      });
    }
    
    const valid = !context.diagnostics.some((d) => d.severity === "error");

    return {
      valid,
      diagnostics: [...context.diagnostics],
    };
  }
}
