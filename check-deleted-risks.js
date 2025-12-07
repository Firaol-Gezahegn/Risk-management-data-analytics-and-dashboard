// Check for soft-deleted risks in the database
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function checkDeletedRisks() {
  console.log('🔍 Checking risk records...\n');

  try {
    // Check all risks
    const allRisks = await pool.query('SELECT id, risk_id, risk_title, department, is_deleted FROM risk_records ORDER BY id;');
    
    console.log(`Total risks in database: ${allRisks.rows.length}`);
    console.log('');

    // Check active risks
    const activeRisks = await pool.query('SELECT id, risk_id, risk_title, department FROM risk_records WHERE is_deleted = false ORDER BY id;');
    
    console.log(`✅ Active risks (is_deleted = false): ${activeRisks.rows.length}`);
    if (activeRisks.rows.length > 0) {
      activeRisks.rows.forEach(row => {
        console.log(`   ID: ${row.id}, Risk ID: ${row.risk_id || 'NULL'}, Title: ${row.risk_title || 'NULL'}, Dept: ${row.department}`);
      });
    }
    console.log('');

    // Check deleted risks
    const deletedRisks = await pool.query('SELECT id, risk_id, risk_title, department FROM risk_records WHERE is_deleted = true ORDER BY id;');
    
    console.log(`🗑️  Soft-deleted risks (is_deleted = true): ${deletedRisks.rows.length}`);
    if (deletedRisks.rows.length > 0) {
      deletedRisks.rows.forEach(row => {
        console.log(`   ID: ${row.id}, Risk ID: ${row.risk_id || 'NULL'}, Title: ${row.risk_title || 'NULL'}, Dept: ${row.department}`);
      });
    }
    console.log('');

    // Check risks with NULL is_deleted
    const nullDeleted = await pool.query('SELECT id, risk_id, risk_title, department FROM risk_records WHERE is_deleted IS NULL ORDER BY id;');
    
    if (nullDeleted.rows.length > 0) {
      console.log(`⚠️  Risks with NULL is_deleted: ${nullDeleted.rows.length}`);
      nullDeleted.rows.forEach(row => {
        console.log(`   ID: ${row.id}, Risk ID: ${row.risk_id || 'NULL'}, Title: ${row.risk_title || 'NULL'}, Dept: ${row.department}`);
      });
      console.log('');
    }

    console.log('📊 Summary:');
    console.log(`   Total: ${allRisks.rows.length}`);
    console.log(`   Active: ${activeRisks.rows.length}`);
    console.log(`   Deleted: ${deletedRisks.rows.length}`);
    console.log(`   NULL: ${nullDeleted.rows.length}`);
    console.log('');

    if (deletedRisks.rows.length > 0) {
      console.log('💡 To permanently delete soft-deleted risks, run:');
      console.log('   node permanently-delete-risks.js');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkDeletedRisks();
