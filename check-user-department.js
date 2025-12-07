// Check current users and their departments
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function checkUsers() {
  console.log('👥 Checking users...\n');

  try {
    const users = await pool.query(`
      SELECT id, email, name, role, department, is_active 
      FROM users 
      ORDER BY created_at;
    `);
    
    console.log(`Total users: ${users.rows.length}\n`);
    
    users.rows.forEach((user, index) => {
      console.log(`User ${index + 1}:`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Name: ${user.name}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Department: ${user.department}`);
      console.log(`   Active: ${user.is_active}`);
      console.log('');
    });

    // Check WS-01 risk department
    const ws01 = await pool.query(`
      SELECT department FROM risk_records WHERE risk_id = 'WS-01';
    `);
    
    if (ws01.rows.length > 0) {
      console.log(`📊 WS-01 Risk Department: ${ws01.rows[0].department}`);
      console.log('');
      
      // Check if any user matches this department
      const matchingUsers = users.rows.filter(u => u.department === ws01.rows[0].department);
      
      if (matchingUsers.length > 0) {
        console.log('✅ Users who can see WS-01:');
        matchingUsers.forEach(u => console.log(`   - ${u.email} (${u.role})`));
      } else {
        console.log('⚠️  No users in "Wholesale Banking" department!');
        console.log('   Only superadmin and auditor roles can see all risks.');
      }
      console.log('');
      
      // Check superadmins
      const superadmins = users.rows.filter(u => u.role === 'superadmin' || u.role === 'auditor');
      if (superadmins.length > 0) {
        console.log('✅ Users who can see ALL risks (superadmin/auditor):');
        superadmins.forEach(u => console.log(`   - ${u.email} (${u.role})`));
      }
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkUsers();
