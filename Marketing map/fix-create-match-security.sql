-- ============================================================================
-- FIX create_match FUNCTION - Add SECURITY DEFINER
-- ============================================================================
-- This fixes the RLS issue by making create_match run with elevated permissions
-- ============================================================================

-- Update create_match to use SECURITY DEFINER
CREATE OR REPLACE FUNCTION create_match(
  p_user_a_id UUID,
  p_user_b_id UUID,
  p_listing_id UUID,
  p_initiator_id UUID,
  p_match_score DECIMAL DEFAULT 0,
  p_distance_km DECIMAL DEFAULT 0,
  p_score_breakdown JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID 
SECURITY DEFINER -- This is the key change!
SET search_path = public
AS $$
DECLARE
  v_match_id UUID;
BEGIN
  -- Insert match
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
    p_user_a_id,
    p_user_b_id,
    p_listing_id,
    p_initiator_id,
    p_match_score,
    p_distance_km,
    p_score_breakdown,
    'pending',
    CASE WHEN p_initiator_id = p_user_a_id THEN 'accepted' ELSE 'pending' END,
    CASE WHEN p_initiator_id = p_user_b_id THEN 'accepted' ELSE 'pending' END
  )
  RETURNING id INTO v_match_id;

  -- Create notification for the other user
  INSERT INTO notifications (
    user_id,
    type,
    title,
    message,
    match_id,
    listing_id
  ) VALUES (
    CASE WHEN p_initiator_id = p_user_a_id THEN p_user_b_id ELSE p_user_a_id END,
    'new_match',
    'New Match!',
    'Someone is interested in your listing',
    v_match_id,
    p_listing_id
  );

  RETURN v_match_id;
END;
$$ LANGUAGE plpgsql;

-- Grant execute permission to authenticated and anon users
GRANT EXECUTE ON FUNCTION create_match(UUID, UUID, UUID, UUID, DECIMAL, DECIMAL, JSONB) TO authenticated, anon;

-- Update respond_to_match function as well
CREATE OR REPLACE FUNCTION respond_to_match(
  p_match_id UUID,
  p_user_id UUID,
  p_response TEXT -- 'accept' or 'reject'
)
RETURNS BOOLEAN
SECURITY DEFINER -- Add this here too
SET search_path = public
AS $$
DECLARE
  v_match RECORD;
  v_conversation_id UUID;
BEGIN
  -- Get match details
  SELECT * INTO v_match FROM matches WHERE id = p_match_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Match not found';
  END IF;

  -- Verify user is part of this match
  IF v_match.user_a_id != p_user_id AND v_match.user_b_id != p_user_id THEN
    RAISE EXCEPTION 'User not part of this match';
  END IF;

  -- Update user status
  IF v_match.user_a_id = p_user_id THEN
    UPDATE matches 
    SET user_a_status = p_response
    WHERE id = p_match_id;
  ELSE
    UPDATE matches 
    SET user_b_status = p_response
    WHERE id = p_match_id;
  END IF;

  -- If both accepted, update overall status and create conversation
  IF p_response = 'accepted' THEN
    SELECT user_a_status, user_b_status INTO v_match FROM matches WHERE id = p_match_id;
    
    IF v_match.user_a_status = 'accepted' AND v_match.user_b_status = 'accepted' THEN
      UPDATE matches SET status = 'accepted' WHERE id = p_match_id;
      
      -- Create conversation
      INSERT INTO conversations (participant_a_id, participant_b_id, match_id)
      VALUES (v_match.user_a_id, v_match.user_b_id, p_match_id)
      RETURNING id INTO v_conversation_id;
      
      -- Notify both users
      INSERT INTO notifications (user_id, type, title, message, match_id)
      VALUES 
        (v_match.user_a_id, 'match_accepted', 'Match Accepted!', 'Your match was accepted', p_match_id),
        (v_match.user_b_id, 'match_accepted', 'Match Accepted!', 'Your match was accepted', p_match_id);
    END IF;
  ELSE
    -- Rejected
    UPDATE matches SET status = 'rejected' WHERE id = p_match_id;
  END IF;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

GRANT EXECUTE ON FUNCTION respond_to_match(UUID, UUID, TEXT) TO authenticated, anon;

SELECT 'Functions updated with SECURITY DEFINER' AS status;
SELECT 'create_match should now work without auth!' AS message;
