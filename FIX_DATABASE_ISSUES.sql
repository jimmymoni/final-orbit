-- ==========================================
-- FIX #1: Remove Infinite Recursion in RLS
-- ==========================================

-- Drop the problematic policy that's causing infinite recursion
DROP POLICY IF EXISTS "Admins can manage users" ON users;
DROP POLICY IF EXISTS "Users can view all users" ON users;

-- Create simpler RLS policies that don't cause recursion
-- Everyone can view users (needed for dropdowns, assignments, etc.)
CREATE POLICY "Anyone can view users"
ON users FOR SELECT
USING (true);

-- Users can only update their own record
CREATE POLICY "Users can update themselves"
ON users FOR UPDATE
USING (auth.uid() = id);

-- Only allow inserts through SQL or service role (not through app)
CREATE POLICY "Service role can insert users"
ON users FOR INSERT
WITH CHECK (false);

-- Only allow deletes through SQL or service role (not through app)
CREATE POLICY "Service role can delete users"
ON users FOR DELETE
USING (false);

-- ==========================================
-- FIX #2: Ensure Auto-Assignment Trigger Exists
-- ==========================================

-- Create or replace the auto-assignment function
CREATE OR REPLACE FUNCTION auto_assign_inquiry()
RETURNS TRIGGER AS $$
BEGIN
  -- Only assign if not already assigned
  IF NEW.assigned_to IS NULL THEN
    NEW.assigned_to := assign_next_runner();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS auto_assign_on_insert ON inquiries;

-- Create the trigger
CREATE TRIGGER auto_assign_on_insert
BEFORE INSERT ON inquiries
FOR EACH ROW
EXECUTE FUNCTION auto_assign_inquiry();

-- ==========================================
-- FIX #3: Manually Assign Existing Inquiry
-- ==========================================

-- Find the unassigned inquiry and assign it
UPDATE inquiries
SET assigned_to = assign_next_runner()
WHERE assigned_to IS NULL;

-- ==========================================
-- VERIFICATION QUERIES
-- ==========================================

-- Check if trigger was created
SELECT
  trigger_name,
  event_manipulation,
  action_timing
FROM information_schema.triggers
WHERE trigger_name = 'auto_assign_on_insert';

-- Check all inquiries are now assigned
SELECT
  id,
  title,
  assigned_to,
  status,
  created_at
FROM inquiries
ORDER BY created_at DESC;

-- Verify RLS policies
SELECT
  schemaname,
  tablename,
  policyname,
  cmd
FROM pg_policies
WHERE tablename = 'users';
