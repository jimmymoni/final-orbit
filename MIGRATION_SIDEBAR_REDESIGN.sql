-- =============================================
-- MIGRATION: Sidebar Redesign Schema Updates
-- Date: 2025-11-22
-- Description: Schema changes for sidebar redesign including:
--   - Enhanced apps table with KB sections and categories
--   - Enhanced users table with profile fields
--   - New tables for app favorites and usage tracking
-- =============================================

-- =============================================
-- 1. UPDATE APPS TABLE
-- =============================================

-- Add new columns to apps table
ALTER TABLE apps
ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'General'
  CHECK (category IN ('Sales', 'Marketing', 'Support', 'Dev', 'Analytics', 'General')),
ADD COLUMN IF NOT EXISTS status_badge TEXT DEFAULT 'Active'
  CHECK (status_badge IN ('Active', 'Deprecated', 'In Development', 'Beta')),
ADD COLUMN IF NOT EXISTS kb_sections JSONB DEFAULT '[]'::jsonb;

-- Add comment explaining kb_sections structure
COMMENT ON COLUMN apps.kb_sections IS 'Knowledge base sections: [{"id": "how-it-works", "title": "How It Works", "content": "markdown content"}, ...]';

-- Update existing apps to have default category
UPDATE apps SET category = 'General' WHERE category IS NULL;

-- =============================================
-- 2. UPDATE USERS TABLE
-- =============================================

-- Add new profile fields to users table
ALTER TABLE users
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS cover_image TEXT,
ADD COLUMN IF NOT EXISTS profile_photo TEXT,
ADD COLUMN IF NOT EXISTS skill_tags JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS social_links JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS department TEXT DEFAULT 'General';

-- Add comment explaining social_links structure
COMMENT ON COLUMN users.social_links IS 'Social media links: {"twitter": "url", "linkedin": "url", "github": "url"}';

-- =============================================
-- 3. CREATE USER_APP_FAVORITES TABLE
-- =============================================

CREATE TABLE IF NOT EXISTS user_app_favorites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  app_id UUID NOT NULL REFERENCES apps(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Ensure unique favorites per user/app combination
  UNIQUE(user_id, app_id)
);

-- Create index for fast lookup
CREATE INDEX IF NOT EXISTS idx_user_app_favorites_user_id ON user_app_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_user_app_favorites_app_id ON user_app_favorites(app_id);

-- Add RLS policies
ALTER TABLE user_app_favorites ENABLE ROW LEVEL SECURITY;

-- Users can view their own favorites
CREATE POLICY "Users can view their own favorites" ON user_app_favorites
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own favorites
CREATE POLICY "Users can add their own favorites" ON user_app_favorites
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can delete their own favorites
CREATE POLICY "Users can remove their own favorites" ON user_app_favorites
  FOR DELETE USING (auth.uid() = user_id);

-- =============================================
-- 4. CREATE APP_USAGE_TRACKING TABLE
-- =============================================

CREATE TABLE IF NOT EXISTS app_usage_tracking (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  app_id UUID NOT NULL REFERENCES apps(id) ON DELETE CASCADE,
  accessed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Optional: track what action was performed
  action TEXT DEFAULT 'view' CHECK (action IN ('view', 'documentation', 'link_clicked'))
);

-- Create indexes for analytics queries
CREATE INDEX IF NOT EXISTS idx_app_usage_user_id ON app_usage_tracking(user_id);
CREATE INDEX IF NOT EXISTS idx_app_usage_app_id ON app_usage_tracking(app_id);
CREATE INDEX IF NOT EXISTS idx_app_usage_accessed_at ON app_usage_tracking(accessed_at DESC);

-- Add RLS policies
ALTER TABLE app_usage_tracking ENABLE ROW LEVEL SECURITY;

-- Users can view their own usage
CREATE POLICY "Users can view their own usage" ON app_usage_tracking
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own usage logs
CREATE POLICY "Users can log their own usage" ON app_usage_tracking
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Admins can view all usage (analytics)
CREATE POLICY "Admins can view all usage" ON app_usage_tracking
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

-- =============================================
-- 5. HELPER FUNCTIONS
-- =============================================

-- Function to get user's favorite apps count
CREATE OR REPLACE FUNCTION get_user_favorites_count(p_user_id UUID)
RETURNS INTEGER AS $$
  SELECT COUNT(*)::INTEGER FROM user_app_favorites WHERE user_id = p_user_id;
$$ LANGUAGE SQL STABLE;

-- Function to get app's total usage count
CREATE OR REPLACE FUNCTION get_app_usage_count(p_app_id UUID)
RETURNS INTEGER AS $$
  SELECT COUNT(*)::INTEGER FROM app_usage_tracking WHERE app_id = p_app_id;
$$ LANGUAGE SQL STABLE;

-- Function to get user's most used apps (top 5)
CREATE OR REPLACE FUNCTION get_user_top_apps(p_user_id UUID, p_limit INTEGER DEFAULT 5)
RETURNS TABLE (
  app_id UUID,
  app_name TEXT,
  usage_count BIGINT
) AS $$
  SELECT
    a.id AS app_id,
    a.name AS app_name,
    COUNT(*) AS usage_count
  FROM app_usage_tracking aut
  JOIN apps a ON aut.app_id = a.id
  WHERE aut.user_id = p_user_id
  GROUP BY a.id, a.name
  ORDER BY usage_count DESC
  LIMIT p_limit;
$$ LANGUAGE SQL STABLE;

-- =============================================
-- 6. UPDATE EXISTING RLS POLICIES FOR APPS
-- =============================================

-- Allow users to view all active apps (already exists, but ensuring consistency)
DROP POLICY IF EXISTS "Users can view all apps" ON apps;
CREATE POLICY "Users can view all apps" ON apps
  FOR SELECT USING (true); -- All authenticated users can view apps

-- Only admins can modify apps
DROP POLICY IF EXISTS "Only admins can insert apps" ON apps;
CREATE POLICY "Only admins can insert apps" ON apps
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

DROP POLICY IF EXISTS "Only admins can update apps" ON apps;
CREATE POLICY "Only admins can update apps" ON apps
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

DROP POLICY IF EXISTS "Only admins can delete apps" ON apps;
CREATE POLICY "Only admins can delete apps" ON apps
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

-- =============================================
-- 7. SAMPLE DATA (Optional - for testing)
-- =============================================

-- Add sample KB sections to an existing app (if any apps exist)
-- UPDATE apps
-- SET kb_sections = '[
--   {
--     "id": "how-it-works",
--     "title": "How It Works",
--     "content": "# Overview\n\nThis app helps you..."
--   },
--   {
--     "id": "troubleshooting",
--     "title": "Troubleshooting",
--     "content": "# Common Issues\n\n1. Issue 1..."
--   },
--   {
--     "id": "sops",
--     "title": "Standard Operating Procedures",
--     "content": "# SOPs\n\n## Setup..."
--   }
-- ]'::jsonb
-- WHERE id = (SELECT id FROM apps LIMIT 1);

-- =============================================
-- MIGRATION COMPLETE
-- =============================================

-- Verify migration
SELECT 'Migration completed successfully!' AS status;

-- Show updated schema info
SELECT
  'apps' AS table_name,
  COUNT(*) FILTER (WHERE column_name = 'category') AS has_category,
  COUNT(*) FILTER (WHERE column_name = 'status_badge') AS has_status_badge,
  COUNT(*) FILTER (WHERE column_name = 'kb_sections') AS has_kb_sections
FROM information_schema.columns
WHERE table_name = 'apps'
UNION ALL
SELECT
  'users' AS table_name,
  COUNT(*) FILTER (WHERE column_name = 'bio') AS has_bio,
  COUNT(*) FILTER (WHERE column_name = 'department') AS has_department,
  COUNT(*) FILTER (WHERE column_name = 'skill_tags') AS has_skill_tags
FROM information_schema.columns
WHERE table_name = 'users';
