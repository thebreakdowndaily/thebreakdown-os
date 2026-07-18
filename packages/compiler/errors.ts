export class CompilerError extends Error {
  constructor(public readonly code: string, message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class ParseError extends CompilerError {
  constructor(message: string, code: string = "KCOMP-001") {
    super(code, message);
  }
}

export class ManifestValidationError extends CompilerError {
  constructor(message: string, code: string = "VALIDATION-101") {
    super(code, message);
  }
}

export class CapabilityInferenceError extends CompilerError {
  constructor(message: string, code: string = "CAP-301") {
    super(code, message);
  }
}

export class RelationshipResolutionError extends CompilerError {
  constructor(message: string, code: string = "REL-201") {
    super(code, message);
  }
}

export class VersionCompatibilityError extends CompilerError {
  constructor(message: string, code: string = "KCOMP-002") {
    super(code, message);
  }
}
