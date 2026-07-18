// audit/tests/manifest-validation.test.ts
import Ajv from "ajv";
import * as fs from "fs";
import * as path from "path";

describe("Plugin manifest schema validation", () => {
  const schemaPath = path.resolve(__dirname, "../schema/plugin-manifest.schema.json");
  const schema = JSON.parse(fs.readFileSync(schemaPath, "utf-8"));
  const ajv = new Ajv({ allErrors: true, strict: false });
  const validate = ajv.compile(schema);

  test("valid manifest passes validation", () => {
    const manifestPath = path.resolve(__dirname, "../plugins/hello-world/manifest.json");
    const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));
    const valid = validate(manifest);
    expect(valid).toBe(true);
  });

  test("manifest missing required fields fails", () => {
    const invalidManifest = {
      name: "bad-plugin",
      // version omitted
      description: "Missing version",
      sdkVersion: "1.0.0",
      schemaVersion: "2.0"
    };
    const valid = validate(invalidManifest);
    expect(valid).toBe(false);
    // Ensure error mentions missing required property
    expect(validate.errors?.some(e => e.message?.includes("required"))).toBe(true);
  });
});
