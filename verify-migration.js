// Quick script to verify migration completed
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function verifyMigration() {
  console.log('🔍 Verifying migration...\n');

  try {
    // Check new columns in risk_records
    const columnsResult = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'risk_records' 
        AND column_name IN ('risk_id', 'risk_title', 'objectives', 'level_of_impact', 'is_deleted')
      ORDER BY column_name;
    `);

    console.log('✅ New columns in risk_records:');
    columnsResult.rows.forEach(row => console.log(`   - ${row.column_name}`));
    console.log('');

    // Check new tables
    const tablesResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
        AND table_name IN ('risk_collaborators', 'rcsa_assessments', 'risk_response_progress', 'department_codes')
      ORDER BY table_name;
    `);

    console.log('✅ New tables created:');
    tablesResult.rows.forEach(row => console.log(`   - ${row.table_name}`));
    console.log('');

    // Check department codes
    const deptResult = await pool.query('SELECT code, department_name FROM department_codes ORDER BY code;');
    
    console.log('✅ Department codes inserted:');
    deptResult.rows.forEach(row => console.log(`   ${row.code} = ${row.department_name}`));
    console.log('');

    // Check indexes
    const indexResult = await pool.query(`
      SELECT indexname 
      FROM pg_indexes 
      WHERE tablename IN ('risk_records', 'risk_collaborators', 'rcsa_assessments', 'risk_response_progress')
        AND indexname LIKE 'idx_%'
      ORDER BY indexname;
    `);

    console.log('✅ Indexes created:');
    indexResult.rows.forEach(row => console.log(`   - ${row.indexname}`));
    console.log('');

    console.log('🎉 Migration verification complete!');
    console.log('');
    console.log('You can now:');
    console.log('1. Start the server: npm run dev');
    console.log('2. Go to http://localhost:5000');
    console.log('3. Create a new risk and see the auto-generated ID!');

  } catch (error) {
    console.error('❌ Error verifying migration:', error.message);
  } finally {
    await pool.end();
  }
}

verifyMigration();
