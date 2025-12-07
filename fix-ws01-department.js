// Change WS-01 risk department to match a user
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function fixDepartment() {
  console.log('🔧 Fixing WS-01 department...\n');

  try {
    // Update WS-01 to "Risk" department (matches your superadmin users)
    const result = await pool.query(`
      UPDATE risk_records 
      SET department = 'Risk' 
      WHERE risk_id = 'WS-01'
      RETURNING id, risk_id, risk_title, department;
    `);
    
    if (result.rows.length > 0) {
      const risk = result.rows[0];
      console.log('✅ Updated WS-01 risk:');
      console.log(`   Risk ID: ${risk.risk_id}`);
      console.log(`   Title: ${risk.risk_title}`);
      console.log(`   New Department: ${risk.department}`);
      console.log('');
      console.log('Now users in "Risk" department can see it!');
      console.log('');
      console.log('🔄 Refresh your browser to see the change.');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

fixDepartment();
