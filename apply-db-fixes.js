#!/usr/bin/env node

/**
 * FinalApps Orbit - Database Fix Helper
 *
 * This script helps you apply the database fixes by:
 * 1. Opening the Supabase SQL Editor in your browser
 * 2. Copying the SQL to your clipboard (if possible)
 * 3. Providing instructions
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { exec } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('\n🔧 FinalApps Orbit - Database Fix Helper');
console.log('==========================================\n');

// Read the SQL fix file
const sqlFile = join(__dirname, 'FIX_DATABASE_ISSUES.sql');
const sqlContent = readFileSync(sqlFile, 'utf-8');

console.log('✅ Loaded FIX_DATABASE_ISSUES.sql\n');

// Display what will be fixed
console.log('📋 This will fix the following issues:');
console.log('   1. ❌ RLS infinite recursion (users table policies)');
console.log('   2. ❌ Auto-assignment trigger for new inquiries');
console.log('   3. ❌ Unassigned existing inquiries\n');

// Instructions
console.log('📝 INSTRUCTIONS:');
console.log('   1. Opening Supabase SQL Editor in your browser...');
console.log('   2. Copy the SQL from FIX_DATABASE_ISSUES.sql');
console.log('   3. Paste it into the SQL Editor');
console.log('   4. Click "Run" or press Cmd+Enter\n');

// Try to copy to clipboard
console.log('📋 Attempting to copy SQL to clipboard...');
const pbcopyProcess = exec('pbcopy');
pbcopyProcess.stdin.write(sqlContent);
pbcopyProcess.stdin.end();

pbcopyProcess.on('exit', (code) => {
  if (code === 0) {
    console.log('✅ SQL copied to clipboard!\n');
  } else {
    console.log('⚠️  Could not copy to clipboard automatically\n');
  }

  // Open Supabase dashboard
  const dashboardUrl = 'https://supabase.com/dashboard/project/hojodntyhijvsjrfplxz/sql/new';
  console.log(`🌐 Opening: ${dashboardUrl}\n`);

  exec(`open "${dashboardUrl}"`, (error) => {
    if (error) {
      console.log('⚠️  Could not open browser automatically');
      console.log(`   Please visit: ${dashboardUrl}\n`);
    } else {
      console.log('✅ Browser opened!\n');
    }

    // Display the SQL for reference
    console.log('═══════════════════════════════════════════════════════════');
    console.log('SQL TO EXECUTE (also copied to clipboard):');
    console.log('═══════════════════════════════════════════════════════════\n');
    console.log(sqlContent);
    console.log('\n═══════════════════════════════════════════════════════════');
    console.log('After running the SQL, come back here and run:');
    console.log('   npm run dev');
    console.log('to verify the fixes in the dashboard.');
    console.log('═══════════════════════════════════════════════════════════\n');
  });
});
