// Permanently delete soft-deleted risks from the database
import pg from 'pg';
import dotenv from 'dotenv';
import readline from 'readline';

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function permanentlyDeleteRisks() {
  console.log('🗑️  Permanent Risk Deletion Tool\n');

  try {
    // Check soft-deleted risks
    const deletedRisks = await pool.query(
      'SELECT id, risk_id, risk_title, department FROM risk_records WHERE is_deleted = true ORDER BY id;'
    );
    
    if (deletedRisks.rows.length === 0) {
      console.log('✅ No soft-deleted risks found. Database is clean!');
      return;
    }

    console.log(`Found ${deletedRisks.rows.length} soft-deleted risks:\n`);
    deletedRisks.rows.forEach(row => {
      console.log(`   ID: ${row.id}, Risk ID: ${row.risk_id || 'NULL'}, Title: ${row.risk_title || 'NULL'}, Dept: ${row.department}`);
    });
    console.log('');

    const answer = await question('⚠️  Do you want to PERMANENTLY delete these risks? (yes/no): ');
    
    if (answer.toLowerCase() === 'yes') {
      // Delete permanently
      const result = await pool.query('DELETE FROM risk_records WHERE is_deleted = true;');
      console.log(`\n✅ Permanently deleted ${result.rowCount} risks from the database.`);
      console.log('These risks cannot be recovered.\n');
    } else {
      console.log('\n❌ Deletion cancelled. Risks remain in database (soft-deleted).\n');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    rl.close();
    await pool.end();
  }
}

permanentlyDeleteRisks();
