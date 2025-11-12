/**
 * Database Migration Script
 * Run with: npx tsx scripts/migrate.ts
 */

import { Pool } from 'pg';
import * as fs from 'fs';
import * as path from 'path';

async function runMigration() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    console.log('🚀 Starting database migration...\n');

    // Read migration file
    const migrationPath = path.join(__dirname, '../migrations/001_initial_schema.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    // Execute migration
    await pool.query(migrationSQL);

    console.log('✅ Migration completed successfully!\n');
    console.log('📊 Database schema created:');
    console.log('   - users');
    console.log('   - exams');
    console.log('   - questions');
    console.log('   - answer_options');
    console.log('   - exam_assignments');
    console.log('   - exam_submissions');
    console.log('   - student_answers');
    console.log('   - exam_attempts');
    console.log('\n🔐 Default users created:');
    console.log('   - teacher / teacher123');
    console.log('   - student / student123');
    console.log('   - student2 / student123');
    console.log('\n⚠️  Note: You need to hash the passwords with bcrypt');
    console.log('   Run: npx tsx scripts/hash-passwords.ts');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigration();
