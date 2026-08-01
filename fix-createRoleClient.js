const fs = require('fs');
const p = 'C:\\newsjack-content\\thebreakdown-os\\scripts\\test-005-migration.js';
let c = fs.readFileSync(p, 'utf8');

c = c.replace(
  /if \(role\) \{\s*await client\.query\(`SET LOCAL role = \$\{role\}`\);\s*const claims = JSON\.stringify\(\{ app_metadata: \{ research_role: role \} \}\);\s*await client\.query\(`SET LOCAL request\.jwt\.claims = '\$\{claims\}'`\);\s*\}/,
  `if (role) {
        const pgRole = role === 'anon' ? 'anon' : 'authenticated';
        await client.query(\`SET LOCAL role = \${pgRole}\`);
        const claims = JSON.stringify({ app_metadata: { research_role: role } });
        await client.query(\`SET LOCAL request.jwt.claims = '\${claims}'\`);
      }`
);

// Remove the setupRoles block
c = c.replace(/IF NOT EXISTS \(SELECT FROM pg_catalog\.pg_roles[\s\S]*?console\.log\('Migrations applied successfully\.'\);\s*/, "console.log('Migrations applied successfully.');\n");
c = c.replace(/GRANT automated_ingestion_agent TO CURRENT_USER;[\s\S]*?GRANT anon TO CURRENT_USER;/, "");

fs.writeFileSync(p, c);
console.log("Updated test-005-migration.js to use authenticated pgRole");
