// Test the /api/risks endpoint directly
import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

async function testAPI() {
  console.log('🧪 Testing /api/risks endpoint...\n');

  try {
    // First, login to get a token
    console.log('1. Logging in as admin...');
    const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@awashbank.com',
        password: 'admin123' // You might need to change this
      })
    });

    if (!loginResponse.ok) {
      console.log('❌ Login failed. Status:', loginResponse.status);
      const error = await loginResponse.text();
      console.log('Error:', error);
      console.log('\n💡 Try with correct password or use another admin account.');
      return;
    }

    const loginData = await loginResponse.json();
    console.log('✅ Login successful');
    console.log(`   User: ${loginData.user.name} (${loginData.user.role})`);
    console.log(`   Department: ${loginData.user.department}`);
    console.log('');

    // Now fetch risks
    console.log('2. Fetching risks...');
    const risksResponse = await fetch('http://localhost:5000/api/risks', {
      headers: {
        'Authorization': `Bearer ${loginData.token}`
      }
    });

    if (!risksResponse.ok) {
      console.log('❌ Failed to fetch risks. Status:', risksResponse.status);
      const error = await risksResponse.text();
      console.log('Error:', error);
      return;
    }

    const risks = await risksResponse.json();
    console.log(`✅ Fetched ${risks.length} risks\n`);

    if (risks.length === 0) {
      console.log('⚠️  No risks returned from API!');
      console.log('   This is why the list is empty.');
      console.log('');
      console.log('💡 Possible causes:');
      console.log('   1. All risks are soft-deleted (is_deleted = true)');
      console.log('   2. Department filtering is hiding them');
      console.log('   3. Database query is failing silently');
    } else {
      console.log('📊 Risks returned:');
      risks.forEach((risk, index) => {
        console.log(`\n   Risk ${index + 1}:`);
        console.log(`   ID: ${risk.id}`);
        console.log(`   Risk ID: ${risk.riskId || 'NULL'}`);
        console.log(`   Title: ${risk.riskTitle || risk.description || 'NULL'}`);
        console.log(`   Type: ${risk.riskType}`);
        console.log(`   Department: ${risk.department}`);
        console.log(`   Is Deleted: ${risk.isDeleted}`);
      });
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('\n💡 Make sure the server is running: npm run dev');
  }
}

testAPI();
