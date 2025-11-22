-- =====================================================
-- Fix Replies Table Column Names Migration
-- =====================================================
-- This migration renames columns in the replies table to match
-- frontend expectations and updates the calculate_reply_score function
-- Date: November 22, 2024
-- =====================================================

-- Step 1: Rename columns in replies table
ALTER TABLE replies RENAME COLUMN score_speed TO speed_score;
ALTER TABLE replies RENAME COLUMN score_quality TO quality_score;
ALTER TABLE replies RENAME COLUMN score_outcome TO outcome_score;
ALTER TABLE replies RENAME COLUMN score_total TO total_score;

-- Step 2: Drop and recreate the calculate_reply_score function with updated column names
DROP FUNCTION IF EXISTS calculate_reply_score(UUID, UUID);

CREATE OR REPLACE FUNCTION calculate_reply_score(
  p_inquiry_id UUID,
  p_reply_id UUID
) RETURNS INTEGER AS $$
DECLARE
  v_time_diff INTERVAL;
  v_speed_score INTEGER := 0;
  v_quality_score INTEGER := 5; -- Default quality score
  v_outcome_score INTEGER := 0;
  v_total_score INTEGER := 0;
  v_replied_at TIMESTAMP;
  v_created_at TIMESTAMP;
BEGIN
  -- Get timestamps
  SELECT r.replied_at, i.created_at
  INTO v_replied_at, v_created_at
  FROM replies r
  JOIN inquiries i ON i.id = r.inquiry_id
  WHERE r.id = p_reply_id AND i.id = p_inquiry_id;

  -- Calculate time difference
  v_time_diff := v_replied_at - v_created_at;

  -- Calculate speed score based on response time
  IF v_time_diff <= INTERVAL '15 minutes' THEN
    v_speed_score := 10;
  ELSIF v_time_diff <= INTERVAL '1 hour' THEN
    v_speed_score := 8;
  ELSIF v_time_diff <= INTERVAL '4 hours' THEN
    v_speed_score := 6;
  ELSIF v_time_diff <= INTERVAL '12 hours' THEN
    v_speed_score := 4;
  ELSIF v_time_diff <= INTERVAL '24 hours' THEN
    v_speed_score := 2;
  ELSE
    v_speed_score := 0;
  END IF;

  -- Calculate total score
  v_total_score := v_speed_score + v_quality_score + v_outcome_score;

  -- Update reply with scores (UPDATED COLUMN NAMES)
  UPDATE replies
  SET
    speed_score = v_speed_score,
    quality_score = v_quality_score,
    outcome_score = v_outcome_score,
    total_score = v_total_score
  WHERE id = p_reply_id;

  RETURN v_total_score;
END;
$$ LANGUAGE plpgsql;

-- Step 3: Verify the changes
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'replies'
  AND column_name LIKE '%score%'
ORDER BY column_name;

-- Expected output:
-- outcome_score | integer
-- quality_score | integer
-- speed_score   | integer
-- total_score   | integer
