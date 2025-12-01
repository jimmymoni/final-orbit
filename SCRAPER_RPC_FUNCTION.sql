-- =============================================
-- SCRAPER RPC FUNCTION
-- Run this SQL in your Supabase SQL Editor
-- =============================================

-- This function allows the scraper to insert inquiries
-- bypassing RLS policies (runs with SECURITY DEFINER)

CREATE OR REPLACE FUNCTION public.scraper_import_inquiry(
  p_title TEXT,
  p_content TEXT,
  p_category TEXT,
  p_link TEXT,
  p_bandwidth_minutes INTEGER DEFAULT 240,
  p_priority TEXT DEFAULT 'normal'
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER  -- This runs with elevated privileges
AS $$
DECLARE
  v_inquiry_id UUID;
  v_assigned_to UUID;
  v_result jsonb;
BEGIN
  -- Check if inquiry already exists
  SELECT id INTO v_inquiry_id
  FROM inquiries
  WHERE link = p_link;

  IF v_inquiry_id IS NOT NULL THEN
    -- Return duplicate status
    RETURN jsonb_build_object(
      'success', false,
      'duplicate', true,
      'message', 'Inquiry already exists',
      'inquiry_id', v_inquiry_id
    );
  END IF;

  -- Get next runner for assignment
  v_assigned_to := assign_next_runner();

  -- Insert inquiry
  INSERT INTO inquiries (
    title,
    content,
    category,
    link,
    assigned_to,
    bandwidth_minutes,
    priority,
    status
  ) VALUES (
    p_title,
    p_content,
    p_category,
    p_link,
    v_assigned_to,
    p_bandwidth_minutes,
    p_priority,
    'assigned'
  )
  RETURNING id INTO v_inquiry_id;

  -- Log activity
  INSERT INTO activity_log (
    inquiry_id,
    user_id,
    type,
    message
  ) VALUES (
    v_inquiry_id,
    v_assigned_to,
    'assigned',
    'Inquiry auto-imported and assigned'
  );

  -- Return success
  RETURN jsonb_build_object(
    'success', true,
    'duplicate', false,
    'inquiry_id', v_inquiry_id,
    'assigned_to', v_assigned_to
  );

EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$;

-- Grant execute permission to anon and authenticated users
GRANT EXECUTE ON FUNCTION public.scraper_import_inquiry TO anon;
GRANT EXECUTE ON FUNCTION public.scraper_import_inquiry TO authenticated;

-- Test the function
-- SELECT scraper_import_inquiry(
--   'Test Inquiry',
--   'This is a test inquiry content',
--   'Apps',
--   'https://community.shopify.com/test/123',
--   240,
--   'normal'
-- );
