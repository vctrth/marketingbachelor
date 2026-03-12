-- ============================================================================
-- CREATE TEST MATCH FOR TESTING
-- ============================================================================
-- This creates a test match between two users to test the "already matched" feature
-- Run this AFTER you have created test users with create-test-user-simple.sql
-- ============================================================================

-- Create a pending match between Arthur and Marie's listing
-- Replace these IDs with actual listing IDs from your database if needed

-- First, check what listings are available
SELECT 
    id as listing_id,
    user_id,
    title,
    category,
    city
FROM listings
WHERE user_id != '3bedb492-d4a4-41c4-ad80-18f3ca8f7ecd' -- Not Arthur's listings
ORDER BY created_at DESC
LIMIT 5;

-- Now create a test match (adjust the listing_id if needed)
-- This assumes Marie (user b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e) has a listing

-- Get Marie's first listing ID
DO $$
DECLARE
  v_listing_id UUID;
BEGIN
  -- Get Marie's first listing
  SELECT id INTO v_listing_id
  FROM listings
  WHERE user_id = 'b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e'
  LIMIT 1;
  
  IF v_listing_id IS NOT NULL THEN
    -- Create a pending match
    INSERT INTO matches (
      user_a_id,
      user_b_id,
      listing_id,
      initiator_id,
      match_score,
      distance_km,
      score_breakdown,
      status,
      user_a_status,
      user_b_status
    ) VALUES (
      '3bedb492-d4a4-41c4-ad80-18f3ca8f7ecd', -- Arthur
      'b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e', -- Marie
      v_listing_id,
      '3bedb492-d4a4-41c4-ad80-18f3ca8f7ecd', -- Arthur initiated
      85.5,
      0.8,
      '{"distance_score": 45, "tag_overlap_score": 30, "recency_score": 5, "reputation_score": 5.5}'::jsonb,
      'pending',
      'accepted',
      'pending'
    ) ON CONFLICT DO NOTHING;
    
    RAISE NOTICE 'Test match created with listing ID: %', v_listing_id;
  ELSE
    RAISE NOTICE 'No listing found for Marie. Run create-test-user-simple.sql first!';
  END IF;
END $$;

-- Verify the match was created
SELECT 
  m.id as match_id,
  m.listing_id,
  l.title as listing_title,
  m.status,
  m.user_a_status,
  m.user_b_status,
  m.match_score,
  m.distance_km
FROM matches m
JOIN listings l ON m.listing_id = l.id
WHERE m.user_a_id = '3bedb492-d4a4-41c4-ad80-18f3ca8f7ecd'
   OR m.user_b_id = '3bedb492-d4a4-41c4-ad80-18f3ca8f7ecd'
ORDER BY m.created_at DESC
LIMIT 5;

-- Success message
SELECT 
  '✅ Test match created!' as status,
  'Now click on that listing in the app - you should see "⏳ Pending" badge' as next_step,
  'The "Request Match" button should be hidden!' as expected_behavior;
