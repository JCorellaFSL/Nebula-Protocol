/**
 * Test Central Knowledge Graph PostgreSQL connection
 */
import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
  host: 'localhost',
  port: 5432, // Internal Docker port
  database: 'nebula_central_kg',
  user: 'nebula',
  password: 'nebula_secure_password',
  // Connection timeout
  connectionTimeoutMillis: 5000,
});

async function testConnection() {
  try {
    console.log('🔌 Testing Central KG connection...\n');

    // Test connection
    const client = await pool.connect();
    console.log('✅ Connected to PostgreSQL\n');

    // Check tables
    const tables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);

    console.log(`📊 Found ${tables.rows.length} tables:`);
    tables.rows.forEach(row => console.log(`   - ${row.table_name}`));
    console.log('');

    // Check if any data exists
    const errorCount = await client.query('SELECT COUNT(*) FROM error_patterns');
    const solutionCount = await client.query('SELECT COUNT(*) FROM solutions');
    const instanceCount = await client.query('SELECT COUNT(*) FROM instances');

    console.log('📈 Current data:');
    console.log(`   - Error patterns: ${errorCount.rows[0].count}`);
    console.log(`   - Solutions: ${solutionCount.rows[0].count}`);
    console.log(`   - Instances: ${instanceCount.rows[0].count}`);
    console.log('');

    client.release();

    console.log('✅ Central Knowledge Graph is ready!');
    console.log('🚀 Ready to sync errors from Projects 1-3 and continue with 4-10\n');

    pool.end();
    return true;
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    console.error('\nTroubleshooting:');
    console.error('1. Check docker containers: docker ps');
    console.error('2. Check PostgreSQL logs: docker logs nebula-postgres');
    console.error('3. Verify port mapping: docker port nebula-postgres\n');
    pool.end();
    return false;
  }
}

testConnection();

