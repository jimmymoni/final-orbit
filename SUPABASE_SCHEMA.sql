-- FinalApps Orbit - Complete Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- USERS TABLE
-- =============================================
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'runner')),
  active BOOLEAN DEFAULT true,
  total_score INTEGER DEFAULT 0,
  avg_reply_time INTEGER DEFAULT 0, -- in minutes
  total_missed INTEGER DEFAULT 0,
  total_replied INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- INQUIRIES TABLE
-- =============================================
CREATE TABLE inquiries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT,
  link TEXT NOT NULL,
  assigned_to UUID REFERENCES users(id),
  bandwidth_minutes INTEGER DEFAULT 240, -- 4 hours default
  deadline_at TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'assigned' CHECK (status IN ('assigned', 'replied', 'escalated', 'missed')),
  escalation_count INTEGER DEFAULT 0,
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- REPLIES TABLE
-- =============================================
CREATE TABLE replies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  inquiry_id UUID REFERENCES inquiries(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  reply_text TEXT NOT NULL,
  score_speed INTEGER DEFAULT 0,
  score_quality INTEGER DEFAULT 0,
  score_outcome INTEGER DEFAULT 0,
  score_total INTEGER DEFAULT 0,
  replied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- APPS TABLE
-- =============================================
CREATE TABLE apps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  logo_url TEXT,
  shopify_url TEXT,
  pricing TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'updating', 'deprecated')),
  features JSONB DEFAULT '[]'::jsonb,
  competitors JSONB DEFAULT '[]'::jsonb,
  reply_templates JSONB DEFAULT '[]'::jsonb,
  use_cases JSONB DEFAULT '[]'::jsonb,
  screenshots JSONB DEFAULT '[]'::jsonb,
  known_issues TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- KNOWLEDGE BASE TABLE
-- =============================================
CREATE TABLE knowledge_base (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  markdown_content TEXT,
  tags JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- ACTIVITY LOG TABLE
-- =============================================
CREATE TABLE activity_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  inquiry_id UUID REFERENCES inquiries(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  type TEXT NOT NULL CHECK (type IN ('assigned', 'replied', 'escalated', 'reassigned', 'status_changed')),
  message TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================
CREATE INDEX idx_inquiries_assigned_to ON inquiries(assigned_to);
CREATE INDEX idx_inquiries_status ON inquiries(status);
CREATE INDEX idx_inquiries_created_at ON inquiries(created_at DESC);
CREATE INDEX idx_replies_inquiry_id ON replies(inquiry_id);
CREATE INDEX idx_replies_user_id ON replies(user_id);
CREATE INDEX idx_activity_log_inquiry_id ON activity_log(inquiry_id);
CREATE INDEX idx_activity_log_user_id ON activity_log(user_id);
CREATE INDEX idx_users_active ON users(active);

-- =============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE apps ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_base ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view all users" ON users FOR SELECT USING (true);
CREATE POLICY "Admins can manage users" ON users FOR ALL USING (
  EXISTS (
    SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin'
  )
);

-- Inquiries policies
CREATE POLICY "Users can view all inquiries" ON inquiries FOR SELECT USING (true);
CREATE POLICY "Users can update assigned inquiries" ON inquiries FOR UPDATE USING (
  assigned_to = auth.uid() OR EXISTS (
    SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin'
  )
);

-- Replies policies
CREATE POLICY "Users can view all replies" ON replies FOR SELECT USING (true);
CREATE POLICY "Users can create their own replies" ON replies FOR INSERT WITH CHECK (user_id = auth.uid());

-- Apps policies
CREATE POLICY "Anyone can view apps" ON apps FOR SELECT USING (true);
CREATE POLICY "Admins can manage apps" ON apps FOR ALL USING (
  EXISTS (
    SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin'
  )
);

-- Knowledge base policies
CREATE POLICY "Anyone can view knowledge base" ON knowledge_base FOR SELECT USING (true);
CREATE POLICY "Admins can manage knowledge base" ON knowledge_base FOR ALL USING (
  EXISTS (
    SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin'
  )
);

-- Activity log policies
CREATE POLICY "Users can view all activity" ON activity_log FOR SELECT USING (true);
CREATE POLICY "System can insert activity" ON activity_log FOR INSERT WITH CHECK (true);

-- =============================================
-- FUNCTIONS
-- =============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_inquiries_updated_at BEFORE UPDATE ON inquiries FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_apps_updated_at BEFORE UPDATE ON apps FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_knowledge_base_updated_at BEFORE UPDATE ON knowledge_base FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to calculate deadline when inquiry is created
CREATE OR REPLACE FUNCTION set_inquiry_deadline()
RETURNS TRIGGER AS $$
BEGIN
  NEW.deadline_at = NEW.created_at + (NEW.bandwidth_minutes || ' minutes')::INTERVAL;
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER set_deadline_on_inquiry_create
BEFORE INSERT ON inquiries
FOR EACH ROW EXECUTE FUNCTION set_inquiry_deadline();

-- =============================================
-- ROUND-ROBIN ASSIGNMENT FUNCTION
-- =============================================
CREATE OR REPLACE FUNCTION assign_next_runner()
RETURNS UUID AS $$
DECLARE
  next_user_id UUID;
BEGIN
  -- Get the active user who has been assigned the least recently
  SELECT id INTO next_user_id
  FROM users
  WHERE active = true AND role = 'runner'
  ORDER BY (
    SELECT MAX(created_at)
    FROM inquiries
    WHERE inquiries.assigned_to = users.id
  ) ASC NULLS FIRST
  LIMIT 1;

  RETURN next_user_id;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- CALCULATE REPLY SCORE FUNCTION
-- =============================================
CREATE OR REPLACE FUNCTION calculate_reply_score(
  p_inquiry_id UUID,
  p_reply_id UUID
)
RETURNS INTEGER AS $$
DECLARE
  v_speed_score INTEGER := 0;
  v_quality_score INTEGER := 5; -- Default quality score
  v_outcome_score INTEGER := 0;
  v_total_score INTEGER := 0;
  v_minutes_taken INTEGER;
BEGIN
  -- Calculate speed score based on reply time
  SELECT EXTRACT(EPOCH FROM (r.replied_at - i.created_at))/60 INTO v_minutes_taken
  FROM replies r
  JOIN inquiries i ON r.inquiry_id = i.id
  WHERE r.id = p_reply_id;

  -- Speed scoring
  IF v_minutes_taken <= 15 THEN
    v_speed_score := 10;
  ELSIF v_minutes_taken <= 60 THEN
    v_speed_score := 8;
  ELSIF v_minutes_taken <= 240 THEN
    v_speed_score := 6;
  ELSIF v_minutes_taken <= 720 THEN
    v_speed_score := 4;
  ELSIF v_minutes_taken <= 1440 THEN
    v_speed_score := 2;
  ELSE
    v_speed_score := 0;
  END IF;

  v_total_score := v_speed_score + v_quality_score + v_outcome_score;

  -- Update the reply scores
  UPDATE replies
  SET score_speed = v_speed_score,
      score_quality = v_quality_score,
      score_outcome = v_outcome_score,
      score_total = v_total_score
  WHERE id = p_reply_id;

  RETURN v_total_score;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- UPDATE USER STATS FUNCTION
-- =============================================
CREATE OR REPLACE FUNCTION update_user_stats(p_user_id UUID)
RETURNS VOID AS $$
DECLARE
  v_total_score INTEGER;
  v_avg_reply_time INTEGER;
  v_total_replied INTEGER;
  v_total_missed INTEGER;
BEGIN
  -- Calculate total score
  SELECT COALESCE(SUM(score_total), 0) INTO v_total_score
  FROM replies
  WHERE user_id = p_user_id;

  -- Calculate average reply time in minutes
  SELECT COALESCE(AVG(EXTRACT(EPOCH FROM (r.replied_at - i.created_at))/60)::INTEGER, 0)
  INTO v_avg_reply_time
  FROM replies r
  JOIN inquiries i ON r.inquiry_id = i.id
  WHERE r.user_id = p_user_id;

  -- Count total replied
  SELECT COUNT(*) INTO v_total_replied
  FROM replies
  WHERE user_id = p_user_id;

  -- Count total missed (escalated inquiries)
  SELECT COUNT(*) INTO v_total_missed
  FROM inquiries
  WHERE assigned_to = p_user_id AND status = 'escalated';

  -- Update user stats
  UPDATE users
  SET total_score = v_total_score,
      avg_reply_time = v_avg_reply_time,
      total_replied = v_total_replied,
      total_missed = v_total_missed
  WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- ESCALATE INQUIRY FUNCTION
-- =============================================
CREATE OR REPLACE FUNCTION escalate_inquiry(p_inquiry_id UUID)
RETURNS VOID AS $$
DECLARE
  v_old_user_id UUID;
  v_new_user_id UUID;
BEGIN
  -- Get current assigned user
  SELECT assigned_to INTO v_old_user_id
  FROM inquiries
  WHERE id = p_inquiry_id;

  -- Get next user
  v_new_user_id := assign_next_runner();

  -- Update inquiry
  UPDATE inquiries
  SET assigned_to = v_new_user_id,
      status = 'escalated',
      escalation_count = escalation_count + 1,
      deadline_at = NOW() + (bandwidth_minutes || ' minutes')::INTERVAL
  WHERE id = p_inquiry_id;

  -- Log activity
  INSERT INTO activity_log (inquiry_id, user_id, type, message)
  VALUES (
    p_inquiry_id,
    v_old_user_id,
    'escalated',
    'Inquiry escalated due to missed deadline. Reassigned to next runner.'
  );

  -- Update old user stats
  PERFORM update_user_stats(v_old_user_id);
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- SEED DATA (OPTIONAL - FOR TESTING)
-- =============================================

-- Insert sample admin user (password should be set via Supabase Auth)
-- INSERT INTO users (email, name, role) VALUES
-- ('admin@finalapps.com', 'Admin User', 'admin'),
-- ('runner1@finalapps.com', 'Runner One', 'runner'),
-- ('runner2@finalapps.com', 'Runner Two', 'runner');

-- Insert sample app
-- INSERT INTO apps (name, description, pricing, status) VALUES
-- ('FinalApps Sample App', 'This is a sample Shopify app', 'Free', 'active');
