const { Client } = require('pg');
const c = new Client({ connectionString: 'postgresql://postgres:Ntn%40supabase403@db.swektehukscmsgxdzymw.supabase.co:5432/postgres' });
c.connect().then(() => {
  return c.query('SELECT current_database(), current_user, version()');
}).then(r => {
  console.log('DB CONNECT: OK');
  console.log('Database:', r.rows[0].current_database);
  console.log('User:', r.rows[0].current_user);
  console.log('Version:', r.rows[0].version.split(',')[0]);
  return c.query("SELECT tablename FROM pg_tables WHERE schemaname = 'public'");
}).then(r => {
  console.log('Public tables:', r.rows.length === 0 ? 'NONE (pristine)' : r.rows.map(x=>x.tablename).join(', '));
  console.log('Public table count:', r.rows.length);
  return c.query("SELECT typname FROM pg_type t JOIN pg_namespace n ON t.typnamespace = n.oid WHERE n.nspname = 'public' AND t.typtype = 'e'");
}).then(r => {
  console.log('Custom enums:', r.rows.length === 0 ? 'NONE' : r.rows.map(x=>x.typname).join(', '));
  return c.query("SELECT schema_name FROM information_schema.schemata WHERE schema_name NOT IN ('pg_catalog','information_schema','extensions','public')");
}).then(r => {
  console.log('Non-default schemas:', r.rows.length === 0 ? 'NONE' : r.rows.map(x=>x.schema_name).join(', '));
  return c.end();
}).catch(e => { console.error('DB CONNECT FAILED:', e.message); process.exit(1); });
