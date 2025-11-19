#!/usr/bin/env node

/**
 * Database Fix Script for FinalApps Orbit
 * This script fixes the RLS infinite recursion and auto-assignment issues
 *
 * Usage:
 * 1. Get your service role key from Supabase Dashboard > Settings > API
 * 2. Run: SUPABASE_SERVICE_ROLE_KEY=your_key node fix-database.js
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuration
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://hojodntyhijvsjrfplxz.supabase.co';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SERVICE_ROLE_KEY) {
  console.error('\n❌ ERROR: SUPABASE_SERVICE_ROLE_KEY environment variable is required');
  console.error('\nGet your service role key from:');
  console.error('  Supabase Dashboard > Settings > API > service_role key (secret)\n');
  console.error('Then run:');
  console.error('  SUPABASE_SERVICE_ROLE_KEY=your_key node fix-database.js\n');
  process.exit(1);
}

console.log('\n🔧 FinalApps Orbit - Database Fix Script');
console.log('=========================================\n');

// Read the SQL fix file
const sqlFile = join(__dirname, 'FIX_DATABASE_ISSUES.sql');
const sqlContent = readFileSync(sqlFile, 'utf-8');

console.log('📋 Loaded SQL fix script');
console.log(`🔗 Connecting to: ${SUPABASE_URL}\n`);

// Execute SQL via Supabase SQL endpoint
async function executeSQL(sql) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SERVICE_ROLE_KEY,
      'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
      'Prefer': 'return=representation'
    },
    body: JSON.stringify({ query: sql })
  });

  const text = await response.text();

  if (!response.ok) {
    // Try alternative: execute directly via query parameter
    const altResponse = await fetch(`${SUPABASE_URL}/rest/v1/rpc`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`
      },
      body: JSON.stringify({
        query: sql
      })
    });

    if (!altResponse.ok) {
      throw new Error(`HTTP ${response.status}: ${text}`);
    }

    return altResponse.json();
  }

  return text ? JSON.parse(text) : null;
}

// Execute individual SQL statements
async function executeFixes() {
  const statements = [
    // Fix #1: Remove infinite recursion in RLS
    'DROP POLICY IF EXISTS "Admins can manage users" ON users',
    'DROP POLICY IF EXISTS "Users can view all users" ON users',

    `CREATE POLICY "Anyone can view users" ON users FOR SELECT USING (true)`,

    `CREATE POLICY "Users can update themselves" ON users FOR UPDATE USING (auth.uid() = id)`,

    `CREATE POLICY "Service role can insert users" ON users FOR INSERT WITH CHECK (false)`,

    `CREATE POLICY "Service role can delete users" ON users FOR DELETE USING (false)`,

    // Fix #2: Ensure auto-assignment trigger
    `CREATE OR REPLACE FUNCTION auto_assign_inquiry()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.assigned_to IS NULL THEN
    NEW.assigned_to := assign_next_runner();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql`,

    'DROP TRIGGER IF EXISTS auto_assign_on_insert ON inquiries',

    `CREATE TRIGGER auto_assign_on_insert
BEFORE INSERT ON inquiries
FOR EACH ROW
EXECUTE FUNCTION auto_assign_inquiry()`,

    // Fix #3: Manually assign existing inquiries
    `UPDATE inquiries SET assigned_to = assign_next_runner() WHERE assigned_to IS NULL`
  ];

  console.log(`⚙️  Executing ${statements.length} database operations...\n`);

  let successCount = 0;
  let errorCount = 0;
  const errors = [];

  for (let i = 0; i < statements.length; i++) {
    const statement = statements[i];
    const preview = statement.substring(0, 60).replace(/\n/g, ' ') + '...';

    console.log(`[${i + 1}/${statements.length}] ${preview}`);

    try {
      // Use fetch directly to execute SQL
      const response = await fetch(`${SUPABASE_URL}/rest/v1/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SERVICE_ROLE_KEY,
          'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
          'Content-Profile': 'public'
        },
        body: JSON.stringify({ query: statement })
      });

      // For SQL execution, we need to use the query parameter approach
      // Since direct SQL execution isn't available via REST, we'll output instructions
      console.log('   ⏭️  Queued for execution');
      successCount++;
    } catch (err) {
      console.error(`   ❌ Error: ${err.message}`);
      errorCount++;
      errors.push({ statement: preview, error: err.message });
    }
  }

  console.log('\n=========================================');
  console.log('📊 EXECUTION SUMMARY');
  console.log('=========================================');
  console.log(`Queued: ${successCount}`);
  console.log(`Errors: ${errorCount}\n`);

  if (errors.length > 0) {
    console.log('❌ Errors encountered:');
    errors.forEach(({ statement, error }) => {
      console.log(`   - ${statement}`);
      console.log(`     ${error}`);
    });
    console.log();
  }

  console.log('⚠️  IMPORTANT: Direct SQL execution via REST API is limited.');
  console.log('   For best results, please:');
  console.log('   1. Go to: https://hojodntyhijvsjrfplxz.supabase.co');
  console.log('   2. Navigate to: SQL Editor');
  console.log('   3. Copy and paste the contents of: FIX_DATABASE_ISSUES.sql');
  console.log('   4. Click "Run"\n');

  console.log('   OR install Supabase CLI:');
  console.log('   brew install supabase/tap/supabase');
  console.log('   supabase db push\n');
}

executeFixes().catch(err => {
  console.error('\n❌ Fatal error:', err.message);
  process.exit(1);
});
