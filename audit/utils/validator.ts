// audit/utils/validator.ts
import Ajv, { ValidateFunction } from "ajv";
import * as path from "path";
import * as fs from "fs";

/** Load a JSON schema from the `schema` directory */
export function loadSchema(schemaFile: string): object {
  const schemaPath = path.resolve(__dirname, "../schema", schemaFile);
  const raw = fs.readFileSync(schemaPath, "utf-8");
  return JSON.parse(raw);
}

/** Create a compiled validator for a given schema name */
export function compileValidator(schemaFile: string): ValidateFunction {
  const ajv = new Ajv({ allErrors: true, strict: false });
  const schema = loadSchema(schemaFile);
  return ajv.compile(schema);
}

/** Validate a data object against a schema; throws on error */
export function assertValid<T>(validator: ValidateFunction, data: T, context: string): void {
  const valid = validator(data);
  if (!valid) {
    const errors = validator.errors?.map((e) => `${e.instancePath} ${e.message}`).join("; ");
    throw new Error(`${context} validation failed: ${errors}`);
  }
}
