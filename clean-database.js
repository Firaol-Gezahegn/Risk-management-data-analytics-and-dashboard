// Quick script to clean all soft-deleted data
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function cleanDatabase() {
  console.log('🧹 Cleaning database...\n');

  try {
    // Delete soft-deleted risks
    const risksResult = await pool.query('DELETE FROM risk_records WHERE is_deleted = true;');
    console.log(`✅ Deleted ${risksResult.rowCount} soft-deleted risks`);

    // Check remaining risks
    const remainingRisks = await pool.query('SELECT COUNT(*) FROM risk_records WHERE is_deleted = false;');
    console.log(`✅ Active risks remaining: ${remainingRisks.rows[0].count}`);
    
    console.log('\n🎉 Database cleaned successfully!');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

cleanDatabase();
