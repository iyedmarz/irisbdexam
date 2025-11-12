/**
 * Test Database Connection
 * Run with: npx tsx scripts/test-connection.ts
 */

import { Pool } from 'pg';

async function testConnection() {
  console.log('🔍 Testing PostgreSQL connection...\n');
  
  const connectionString = process.env.DATABASE_URL;
  
  if (!connectionString) {
    console.error('❌ DATABASE_URL not found in environment variables');
    console.log('💡 Make sure you have created .env.local file');
    process.exit(1);
  }

  console.log('📝 Connection string:', connectionString.replace(/:[^:@]*@/, ':****@'), '\n');

  const pool = new Pool({
    connectionString: connectionString,
  });

  try {
    // Test connection
    const client = await pool.connect();
    console.log('✅ Successfully connected to PostgreSQL!\n');

    // Check if tables exist
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);

    if (tablesResult.rows.length === 0) {
      console.log('⚠️  No tables found in database');
      console.log('💡 Run: npm run db:migrate\n');
    } else {
      console.log('📊 Tables found:');
      tablesResult.rows.forEach((row: any) => {
        console.log(`   ✓ ${row.table_name}`);
      });
      console.log('');
    }

    // Check users
    const usersResult = await client.query('SELECT COUNT(*) as count FROM users');
    const userCount = usersResult.rows[0].count;
    
    console.log(`👥 Users in database: ${userCount}`);
    
    if (userCount === 0) {
      console.log('⚠️  No users found');
      console.log('💡 Run: npm run db:seed\n');
    } else {
      const users = await client.query('SELECT username, role, name FROM users ORDER BY role, username');
      console.log('\n📋 Existing users:');
      users.rows.forEach((user: any) => {
        console.log(`   - ${user.username} (${user.role}): ${user.name}`);
      });
    }

    client.release();
    console.log('\n✅ Database is ready to use!');
    console.log('🚀 Run: npm run dev');

  } catch (error: any) {
    console.error('❌ Connection failed:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('   1. Check if PostgreSQL is running');
    console.log('   2. Verify DATABASE_URL in .env.local');
    console.log('   3. Make sure database "iris_exam_db" exists');
    console.log('   4. Check username and password');
    process.exit(1);
  } finally {
    await pool.end();
  }
}

testConnection();
