#!/usr/bin/env node
import * as fs from 'fs';
import * as path from 'path';

function run() {
  const repoRoot = process.cwd();
  const pluginsDir = path.join(repoRoot, 'audit/plugins');
  const registryPath = path.join(repoRoot, 'audit/registry.json');
  
  if (!fs.existsSync(pluginsDir)) {
    console.error('Plugins directory not found');
    process.exit(1);
  }

  const entries = fs.readdirSync(pluginsDir, { withFileTypes: true });
  const plugins = [];
  const seenIds = new Set<string>();

  for (const entry of entries) {
    if (entry.isDirectory()) {
      const manifestPath = path.join(pluginsDir, entry.name, 'manifest.json');
      if (fs.existsSync(manifestPath)) {
        try {
          const rawManifest = fs.readFileSync(manifestPath, 'utf8');
          const manifest = JSON.parse(rawManifest);
          
          // Validate required fields
          const required = ['name', 'version', 'sdkVersion', 'description', 'capabilities'];
          for (const req of required) {
            if (!manifest[req]) {
              throw new Error(`Missing ${req}`);
            }
          }
          
          const id = manifest.name;
          if (seenIds.has(id)) {
            throw new Error(`Duplicate plugin ID detected: ${id}`);
          }
          seenIds.add(id);

          // Get Policy Version if policy.json exists
          let policyVersion = '1.0';
          const policyPath = path.join(pluginsDir, entry.name, 'policy.json');
          if (fs.existsSync(policyPath)) {
            const rawPolicy = fs.readFileSync(policyPath, 'utf8');
            const policy = JSON.parse(rawPolicy);
            if (policy.policyVersion) {
              policyVersion = policy.policyVersion;
            }
          }

          plugins.push({
            id: id,
            name: id.replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()),
            version: manifest.version,
            sdkVersion: manifest.sdkVersion,
            schemaVersion: "2.0",
            policyVersion: policyVersion,
            capabilities: manifest.capabilities || [],
            dependsOn: manifest.dependsOn || [],
            description: manifest.description,
            entryPoint: `audit/plugins/${entry.name}/index.ts`,
            enabled: true
          });
        } catch (e) {
          console.error(`Failed to process manifest for ${entry.name}: ${(e as Error).message}`);
          process.exit(1);
        }
      }
    }
  }

  plugins.sort((a, b) => a.id.localeCompare(b.id));

  const registry = {
    registryVersion: "1.0",
    generatedAt: new Date().toISOString(),
    pluginCount: plugins.length,
    plugins
  };

  fs.writeFileSync(registryPath, JSON.stringify(registry, null, 2));
  console.log(`Successfully generated registry with ${plugins.length} plugins at ${registryPath}`);
}

run();
