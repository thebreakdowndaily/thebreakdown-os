import { ValidationError } from "./types";

export class CompilerContext {
  public readonly schemaVersion = "1.0";
  public readonly compilerVersion = "1.0";
  private _diagnostics: ValidationError[] = [];

  public get diagnostics(): readonly ValidationError[] {
    return this._diagnostics;
  }

  public addDiagnostic(diagnostic: ValidationError): void {
    this._diagnostics.push(diagnostic);
  }
}
