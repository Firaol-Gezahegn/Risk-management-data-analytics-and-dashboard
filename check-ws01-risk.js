// Check the WS-01 risk and why it's not showing
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function checkRisk() {
  console.log('🔍 Checking WS-01 risk...\n');

  try {
    // Find WS-01 risk
    const ws01 = await pool.query(`
      SELECT id, risk_id, risk_title, risk_type, department, 
             is_deleted, created_at, owner_id
      FROM risk_records 
      WHERE risk_id = 'WS-01' OR id = 23;
    `);
    
    if (ws01.rows.length === 0) {
      console.log('❌ WS-01 risk not found in database!');
      return;
    }

    const risk = ws01.rows[0];
    console.log('✅ Found WS-01 risk:');
    console.log(`   ID: ${risk.id}`);
    console.log(`   Risk ID: ${risk.risk_id}`);
    console.log(`   Title: ${risk.risk_title}`);
    console.log(`   Type: ${risk.risk_type}`);
    console.log(`   Department: ${risk.department}`);
    console.log(`   Is Deleted: ${risk.is_deleted}`);
    console.log(`   Owner ID: ${risk.owner_id}`);
    console.log(`   Created: ${risk.created_at}`);
    console.log('');

    // Check if it should be visible
    if (risk.is_deleted) {
      console.log('⚠️  Risk is SOFT-DELETED (is_deleted = true)');
      console.log('   This is why it\'s not showing in the list!');
      console.log('');
      console.log('💡 To restore it, run:');
      console.log(`   UPDATE risk_records SET is_deleted = false WHERE id = ${risk.id};`);
    } else {
      console.log('✅ Risk is ACTIVE (is_deleted = false)');
      console.log('   It should be visible in the list.');
      console.log('');
      
      // Check all active risks
      const activeRisks = await pool.query(`
        SELECT id, risk_id, risk_title, department 
        FROM risk_records 
        WHERE is_deleted = false 
        ORDER BY id;
      `);
      
      console.log(`📊 All active risks (${activeRisks.rows.length}):`);
      activeRisks.rows.forEach(r => {
        console.log(`   ID: ${r.id}, Risk ID: ${r.risk_id || 'NULL'}, Title: ${r.risk_title || 'NULL'}, Dept: ${r.department}`);
      });
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkRisk();
