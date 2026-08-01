const fs = require('fs');
const p = 'C:\\newsjack-content\\thebreakdown-os\\scripts\\test-005-migration.js';
let c = fs.readFileSync(p, 'utf8');

const setupRoles = `
    // Create roles for testing
    await serviceClient.query(\`
      DO $do$ BEGIN
        IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'anon') THEN CREATE ROLE anon; END IF;
        IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'researcher') THEN CREATE ROLE researcher; END IF;
        IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'editor') THEN CREATE ROLE editor; END IF;
        IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'reviewer') THEN CREATE ROLE reviewer; END IF;
        IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'administrator') THEN CREATE ROLE administrator; END IF;
        IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'automated_ingestion_agent') THEN CREATE ROLE automated_ingestion_agent; END IF;
      END $do$;
      
      GRANT USAGE ON SCHEMA public TO anon, researcher, editor, reviewer, administrator, automated_ingestion_agent;
      GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, researcher, editor, reviewer, administrator, automated_ingestion_agent;
      GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, researcher, editor, reviewer, administrator, automated_ingestion_agent;
    \`);
`;

c = c.replace(/console\.log\('Migrations applied successfully\.'\);/, "console.log('Migrations applied successfully.');\n" + setupRoles);

fs.writeFileSync(p, c);
console.log("Updated test-005-migration.js with role creation");
