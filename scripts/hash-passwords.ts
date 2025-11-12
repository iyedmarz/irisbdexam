/**
 * Password Hashing Script
 * Hashes default user passwords and updates the database
 * Run with: npx tsx scripts/hash-passwords.ts
 */

import { Pool } from 'pg';
import bcrypt from 'bcryptjs';

async function hashPasswords() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    console.log('🔐 Hashing passwords...\n');

    const users = [
      { username: 'teacher', password: 'teacher123' },
      { username: 'student', password: 'student123' },
      { username: 'student2', password: 'student123' },
    ];

    for (const user of users) {
      const hash = await bcrypt.hash(user.password, 10);
      
      await pool.query(
        'UPDATE users SET password_hash = $1 WHERE username = $2',
        [hash, user.username]
      );

      console.log(`✅ Hashed password for: ${user.username}`);
    }

    console.log('\n✅ All passwords hashed successfully!');
    console.log('\n📝 Login credentials:');
    console.log('   Teacher: teacher / teacher123');
    console.log('   Student 1: student / student123');
    console.log('   Student 2: student2 / student123');

  } catch (error) {
    console.error('❌ Password hashing failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

hashPasswords();
