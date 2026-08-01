require('dotenv').config({ path: '.env.test' });
const { Client } = require('pg');

(async () => {
  console.log('=== Testing Supabase Connection ===');
  console.log('Project URL:', process.env.SUPABASE_URL);
  console.log('Database URL:', process.env.TEST_DATABASE_URL ? 'HIDDEN' : 'MISSING');
  console.log('Project Ref:', process.env.EXPECTED_PROJECT_REF);
  
  try {
    const c = new Client({ 
      connectionString: process.env.TEST_DATABASE_URL, 
      ssl: { rejectUnauthorized: false } 
    });
    await c.connect();
    console.log('✅ Connected to Supabase successfully');
    
    const result = await c.query('SELECT version()');
    console.log('✅ Connection working - PostgreSQL version:', result.rows[0].version.substring(0, 50));
    
    // Check if our expected tables exist
    const tables = await c.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
        AND table_name IN ('research_constituencies', 'research_claims', 'research_sources')
      ORDER BY table_name
    `);
    
    console.log('\n=== Available Tables ===');
    tables.rows.forEach(r => console.log('✅ ', r.table_name));
    
    if (tables.rows.length > 0) {
      console.log('\n=== Table Counts ===');
      for (const table of tables.rows.map(r => r.table_name)) {
        const countResult = await c.query(`SELECT COUNT(*) as count FROM ${table}`);
        console.log(`📊 ${table}: ${countResult.rows[0].count} rows`);
      }
    }
    
    await c.end();
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('\n=== Troubleshooting ===');
    console.error('1. Verify your .env.test file exists and has correct values');
    console.error('2. Check if Supabase project is active (some free projects may hibernate)');
    console.error('3. Ensure your internet connection allows access to Supabase');
    console.log('\n=== Alternative Access ===');
    console.log('You can also access the data directly through:');
    console.log('• Supabase dashboard: https://app.supabase.com');
    console.log('• Search for project: swektehukscmsgxdzymw');
  }
})().catch(e => { console.error('Fatal error:', e.message); process.exit(1); });