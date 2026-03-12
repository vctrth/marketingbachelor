-- ============================================================================
-- MATCHING ALGORITHM - SQL Queries
-- Geographic + Preference-based matching with scoring
-- ============================================================================

-- ============================================================================
-- 1. FIND CANDIDATE MATCHES (Core Query)
-- ============================================================================

-- This query finds potential matches within radius with scoring
-- Parameters:
--   $1: user_id (UUID)
--   $2: listing_id (UUID, optional)
--   $3: max_distance_km (INTEGER)
--   $4: user_location (GEOGRAPHY point)
--   $5: preferred_categories (TEXT[])
--   $6: preferred_tags (TEXT[])

CREATE OR REPLACE FUNCTION find_candidate_matches(
  p_user_id UUID,
  p_listing_id UUID DEFAULT NULL,
  p_max_distance_km INTEGER DEFAULT 10,
  p_user_lat DOUBLE PRECISION DEFAULT NULL,
  p_user_lng DOUBLE PRECISION DEFAULT NULL,
  p_preferred_categories TEXT[] DEFAULT '{}',
  p_preferred_tags TEXT[] DEFAULT '{}'
)
RETURNS TABLE (
  listing_id UUID,
  owner_id UUID,
  title TEXT,
  category TEXT,
  tags TEXT[],
  distance_km DECIMAL,
  match_score DECIMAL,
  score_breakdown JSONB,
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION
) AS $$
DECLARE
  v_user_location GEOGRAPHY;
BEGIN
  -- Create geography point from lat/lng
  IF p_user_lat IS NOT NULL AND p_user_lng IS NOT NULL THEN
    v_user_location := ST_SetSRID(ST_MakePoint(p_user_lng, p_user_lat), 4326)::geography;
  END IF;

  RETURN QUERY
  WITH candidate_listings AS (
    -- Step 1: Hard filters
    SELECT 
      l.id,
      l.user_id,
      l.title,
      l.category,
      l.tags,
      l.lat,
      l.lng,
      l.location,
      l.created_at,
      l.price,
      -- Calculate distance
      ROUND(
        ST_Distance(v_user_location, l.location)::numeric / 1000, 
        2
      ) AS distance_km,
      p.rating,
      p.is_verified,
      p.successful_matches,
      p.total_matches
    FROM listings l
    INNER JOIN profiles p ON l.user_id = p.id
    WHERE
      -- Active listings only
      l.is_active = true AND l.is_archived = false
      -- Not own listings
      AND l.user_id != p_user_id
      -- Within distance radius
      AND ST_DWithin(v_user_location, l.location, p_max_distance_km * 1000)
      -- Category filter (if provided)
      AND (
        cardinality(p_preferred_categories) = 0 OR
        l.category = ANY(p_preferred_categories)
      )
      -- Not blocked
      AND NOT is_user_blocked(p_user_id, l.user_id)
      -- No existing active match
      AND NOT EXISTS (
        SELECT 1 FROM matches m
        WHERE (
          (m.user_a_id = p_user_id AND m.user_b_id = l.user_id) OR
          (m.user_a_id = l.user_id AND m.user_b_id = p_user_id)
        )
        AND m.listing_id = l.id
        AND m.status IN ('pending', 'accepted')
      )
  ),
  scored_matches AS (
    -- Step 2: Calculate scores
    SELECT
      c.*,
      -- Distance score (50 points max): closer = better
      GREATEST(0, 50 - (c.distance_km * 5))::DECIMAL(5,2) AS distance_score,
      
      -- Tag overlap score (30 points max): more matching tags = better
      CASE 
        WHEN cardinality(p_preferred_tags) > 0 THEN
          (
            (SELECT COUNT(*) FROM unnest(c.tags) tag WHERE tag = ANY(p_preferred_tags))::DECIMAL 
            / GREATEST(cardinality(p_preferred_tags), 1)
          ) * 30
        ELSE 15 -- neutral score if no tag preferences
      END AS tag_overlap_score,
      
      -- Recency score (10 points max): newer = slightly better
      GREATEST(0, 10 - (EXTRACT(EPOCH FROM (NOW() - c.created_at)) / 86400))::DECIMAL(5,2) AS recency_score,
      
      -- Reputation score (10 points max): verified + rating + success rate
      (
        (CASE WHEN c.is_verified THEN 3 ELSE 0 END) +
        (c.rating * 2) +
        (CASE 
          WHEN c.total_matches > 0 THEN
            (c.successful_matches::DECIMAL / c.total_matches) * 5
          ELSE 2.5  -- Neutral for new users
        END)
      )::DECIMAL(5,2) AS reputation_score
    FROM candidate_listings c
  )
  SELECT
    s.id AS listing_id,
    s.user_id AS owner_id,
    s.title,
    s.category,
    s.tags,
    s.distance_km,
    -- Total score (0-100)
    (s.distance_score + s.tag_overlap_score + s.recency_score + s.reputation_score)::DECIMAL(5,2) AS match_score,
    -- Score breakdown for debugging/display
    jsonb_build_object(
      'distance_score', s.distance_score,
      'tag_overlap_score', s.tag_overlap_score,
      'recency_score', s.recency_score,
      'reputation_score', s.reputation_score
    ) AS score_breakdown,
    s.lat,
    s.lng
  FROM scored_matches s
  -- Only return good matches (score > 20)
  WHERE (s.distance_score + s.tag_overlap_score + s.recency_score + s.reputation_score) > 20
  -- Order by score
  ORDER BY match_score DESC
  LIMIT 50;
END;
$$ LANGUAGE plpgsql STABLE;

-- ============================================================================
-- 2. CREATE MATCH
-- ============================================================================

CREATE OR REPLACE FUNCTION create_match(
  p_user_a_id UUID,
  p_user_b_id UUID,
  p_listing_id UUID,
  p_initiator_id UUID,
  p_match_score DECIMAL DEFAULT 0,
  p_distance_km DECIMAL DEFAULT 0,
  p_score_breakdown JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID AS $$
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

-- ============================================================================
-- 3. ACCEPT/REJECT MATCH
-- ============================================================================

CREATE OR REPLACE FUNCTION respond_to_match(
  p_match_id UUID,
  p_user_id UUID,
  p_response TEXT  -- 'accept' or 'reject'
)
RETURNS BOOLEAN AS $$
DECLARE
  v_match RECORD;
  v_other_user_id UUID;
  v_both_accepted BOOLEAN;
BEGIN
  -- Get match details
  SELECT * INTO v_match FROM matches WHERE id = p_match_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Match not found';
  END IF;

  -- Determine which user is responding
  IF p_user_id = v_match.user_a_id THEN
    UPDATE matches
    SET 
      user_a_status = p_response || 'ed',
      responded_at = NOW(),
      status = CASE 
        WHEN p_response = 'reject' THEN 'rejected'
        WHEN p_response = 'accept' AND user_b_status = 'accepted' THEN 'accepted'
        ELSE status
      END
    WHERE id = p_match_id;
    
    v_other_user_id := v_match.user_b_id;
    v_both_accepted := (p_response = 'accept' AND v_match.user_b_status = 'accepted');
    
  ELSIF p_user_id = v_match.user_b_id THEN
    UPDATE matches
    SET 
      user_b_status = p_response || 'ed',
      responded_at = NOW(),
      status = CASE 
        WHEN p_response = 'reject' THEN 'rejected'
        WHEN p_response = 'accept' AND user_a_status = 'accepted' THEN 'accepted'
        ELSE status
      END
    WHERE id = p_match_id;
    
    v_other_user_id := v_match.user_a_id;
    v_both_accepted := (p_response = 'accept' AND v_match.user_a_status = 'accepted');
    
  ELSE
    RAISE EXCEPTION 'User is not part of this match';
  END IF;

  -- If both accepted, create conversation
  IF v_both_accepted THEN
    INSERT INTO conversations (
      match_id,
      participant_a_id,
      participant_b_id
    ) VALUES (
      p_match_id,
      v_match.user_a_id,
      v_match.user_b_id
    );

    -- Update match counts
    UPDATE profiles
    SET total_matches = total_matches + 1
    WHERE id IN (v_match.user_a_id, v_match.user_b_id);

    -- Notify both users
    INSERT INTO notifications (user_id, type, title, message, match_id)
    VALUES 
      (v_match.user_a_id, 'match_accepted', 'Match Accepted!', 'You can now chat', p_match_id),
      (v_match.user_b_id, 'match_accepted', 'Match Accepted!', 'You can now chat', p_match_id);
  END IF;

  -- If rejected, notify initiator
  IF p_response = 'reject' THEN
    INSERT INTO notifications (user_id, type, title, message, match_id)
    VALUES (
      v_other_user_id,
      'match_rejected',
      'Match Declined',
      'Your match request was declined',
      p_match_id
    );
  END IF;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 4. GET MATCHES FOR USER (for Map Display)
-- ============================================================================

CREATE OR REPLACE FUNCTION get_user_matches_for_map(
  p_user_id UUID,
  p_status TEXT DEFAULT 'all'  -- 'all', 'pending', 'accepted'
)
RETURNS TABLE (
  match_id UUID,
  listing_id UUID,
  other_user_id UUID,
  other_user_name TEXT,
  listing_title TEXT,
  listing_lat DOUBLE PRECISION,
  listing_lng DOUBLE PRECISION,
  distance_km DECIMAL,
  match_score DECIMAL,
  status TEXT,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    m.id AS match_id,
    m.listing_id,
    CASE 
      WHEN m.user_a_id = p_user_id THEN m.user_b_id
      ELSE m.user_a_id
    END AS other_user_id,
    CASE 
      WHEN m.user_a_id = p_user_id THEN pb.full_name
      ELSE pa.full_name
    END AS other_user_name,
    l.title AS listing_title,
    l.lat AS listing_lat,
    l.lng AS listing_lng,
    m.distance_km,
    m.match_score,
    m.status,
    m.created_at
  FROM matches m
  INNER JOIN profiles pa ON m.user_a_id = pa.id
  INNER JOIN profiles pb ON m.user_b_id = pb.id
  LEFT JOIN listings l ON m.listing_id = l.id
  WHERE
    (m.user_a_id = p_user_id OR m.user_b_id = p_user_id)
    AND (
      p_status = 'all' OR
      m.status = p_status
    )
  ORDER BY m.match_score DESC, m.created_at DESC;
END;
$$ LANGUAGE plpgsql STABLE;

-- ============================================================================
-- 5. EXPIRE OLD MATCHES (Scheduled Job)
-- ============================================================================

CREATE OR REPLACE FUNCTION expire_old_matches()
RETURNS INTEGER AS $$
DECLARE
  v_expired_count INTEGER;
BEGIN
  UPDATE matches
  SET status = 'expired'
  WHERE 
    status = 'pending'
    AND expires_at < NOW();
    
  GET DIAGNOSTICS v_expired_count = ROW_COUNT;
  
  -- Create notifications for expired matches
  INSERT INTO notifications (user_id, type, title, message, match_id)
  SELECT 
    UNNEST(ARRAY[user_a_id, user_b_id]) AS user_id,
    'listing_expired',
    'Match Expired',
    'A match request has expired',
    id
  FROM matches
  WHERE status = 'expired' AND updated_at >= NOW() - INTERVAL '1 minute';
  
  RETURN v_expired_count;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 6. EXAMPLE QUERIES FOR APPLICATION USE
-- ============================================================================

-- Example 1: Find matches for a user who just created a listing
/*
SELECT * FROM find_candidate_matches(
  p_user_id := 'user-uuid-here',
  p_listing_id := 'listing-uuid-here',
  p_max_distance_km := 15,
  p_user_lat := 50.8798,
  p_user_lng := 4.7005,
  p_preferred_categories := ARRAY['garden', 'tools'],
  p_preferred_tags := ARRAY['organic', 'beginner-friendly']
);
*/

-- Example 2: Create a match from user A to user B's listing
/*
SELECT create_match(
  p_user_a_id := 'user-a-uuid',
  p_user_b_id := 'user-b-uuid',
  p_listing_id := 'listing-uuid',
  p_initiator_id := 'user-a-uuid',
  p_match_score := 75.50,
  p_distance_km := 3.2,
  p_score_breakdown := '{"distance_score": 45, "tag_overlap_score": 20, "recency_score": 8, "reputation_score": 7}'::jsonb
);
*/

-- Example 3: Accept a match
/*
SELECT respond_to_match(
  p_match_id := 'match-uuid',
  p_user_id := 'user-uuid',
  p_response := 'accept'
);
*/

-- Example 4: Get matches for map display
/*
SELECT * FROM get_user_matches_for_map(
  p_user_id := 'user-uuid',
  p_status := 'accepted'
);
*/

-- ============================================================================
-- 7. INDEXES FOR PERFORMANCE
-- ============================================================================

-- Already created in schema, but listed here for reference:
-- CREATE INDEX idx_listings_location ON listings USING GIST(location);
-- CREATE INDEX idx_matches_user_a ON matches(user_a_id, status);
-- CREATE INDEX idx_matches_user_b ON matches(user_b_id, status);
