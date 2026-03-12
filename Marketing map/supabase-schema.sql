-- ============================================================================
-- MATCHING SYSTEM DATABASE SCHEMA
-- Supabase + PostGIS for location-based matching
-- ============================================================================

-- Enable PostGIS extension for geographical queries
CREATE EXTENSION IF NOT EXISTS postgis;

-- ============================================================================
-- 1. PROFILES TABLE
-- ============================================================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  username TEXT UNIQUE,
  avatar_url TEXT,
  bio TEXT,
  phone TEXT,
  
  -- Location data
  current_lat DOUBLE PRECISION,
  current_lng DOUBLE PRECISION,
  current_location GEOGRAPHY(Point, 4326),
  address TEXT,
  city TEXT DEFAULT 'Leuven',
  country TEXT DEFAULT 'BE',
  
  -- Preferences
  max_distance_km INTEGER DEFAULT 10,
  preferred_categories TEXT[] DEFAULT '{}',
  preferred_tags TEXT[] DEFAULT '{}',
  availability JSONB,
  
  -- Trust & reputation
  rating DECIMAL(3,2) DEFAULT 0.00,
  total_matches INTEGER DEFAULT 0,
  successful_matches INTEGER DEFAULT 0,
  is_verified BOOLEAN DEFAULT false,
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  last_active_at TIMESTAMPTZ DEFAULT NOW(),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Spatial index for location queries
CREATE INDEX idx_profiles_location ON profiles USING GIST(current_location);
-- Index for active users
CREATE INDEX idx_profiles_active ON profiles(is_active, last_active_at) WHERE is_active = true;

-- ============================================================================
-- 2. LISTINGS TABLE
-- ============================================================================
CREATE TABLE listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Listing details
  title TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('offer', 'request', 'rental', 'service')),
  category TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  
  -- Location
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  location GEOGRAPHY(Point, 4326) NOT NULL,
  address TEXT,
  city TEXT,
  
  -- Availability
  available_from TIMESTAMPTZ,
  available_until TIMESTAMPTZ,
  availability_schedule JSONB,
  
  -- Pricing (optional)
  price DECIMAL(10,2),
  price_unit TEXT CHECK (price_unit IN ('hour', 'day', 'week', 'month', 'once')),
  
  -- Images
  images TEXT[] DEFAULT '{}',
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  is_archived BOOLEAN DEFAULT false,
  views_count INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Spatial index for listings
CREATE INDEX idx_listings_location ON listings USING GIST(location);
-- Index for active listings
CREATE INDEX idx_listings_active ON listings(is_active, is_archived) WHERE is_active = true AND is_archived = false;
-- Index for category searches
CREATE INDEX idx_listings_category ON listings(category);
-- GIN index for tag searches
CREATE INDEX idx_listings_tags ON listings USING GIN(tags);

-- ============================================================================
-- 3. MATCHES TABLE
-- ============================================================================
CREATE TABLE matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Match participants
  user_a_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  user_b_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  listing_id UUID REFERENCES listings(id) ON DELETE SET NULL,
  
  -- Match metadata
  initiator_id UUID NOT NULL REFERENCES profiles(id),
  match_score DECIMAL(5,2) DEFAULT 0.00, -- Score 0-100
  distance_km DECIMAL(10,2),
  
  -- Scoring components
  score_breakdown JSONB DEFAULT '{
    "distance_score": 0,
    "tag_overlap_score": 0,
    "recency_score": 0,
    "reputation_score": 0
  }'::jsonb,
  
  -- Status workflow
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'expired', 'cancelled', 'completed')),
  
  -- User responses
  user_a_status TEXT CHECK (user_a_status IN ('pending', 'accepted', 'rejected')),
  user_b_status TEXT CHECK (user_b_status IN ('pending', 'accepted', 'rejected')),
  
  -- Timestamps
  matched_at TIMESTAMPTZ DEFAULT NOW(),
  responded_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '7 days'),
  completed_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT different_users CHECK (user_a_id != user_b_id),
  CONSTRAINT valid_initiator CHECK (initiator_id IN (user_a_id, user_b_id))
);

-- Indexes for match queries
CREATE INDEX idx_matches_user_a ON matches(user_a_id, status);
CREATE INDEX idx_matches_user_b ON matches(user_b_id, status);
CREATE INDEX idx_matches_listing ON matches(listing_id);
CREATE INDEX idx_matches_status ON matches(status);
CREATE INDEX idx_matches_score ON matches(match_score DESC);

-- Unique constraint to prevent duplicate matches
CREATE UNIQUE INDEX idx_unique_match ON matches(
  LEAST(user_a_id, user_b_id),
  GREATEST(user_a_id, user_b_id),
  listing_id
) WHERE status NOT IN ('rejected', 'expired', 'cancelled');

-- ============================================================================
-- 4. CONVERSATIONS TABLE
-- ============================================================================
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  
  participant_a_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  participant_b_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  last_message_at TIMESTAMPTZ DEFAULT NOW(),
  last_message_preview TEXT,
  
  -- Unread counts
  unread_count_a INTEGER DEFAULT 0,
  unread_count_b INTEGER DEFAULT 0,
  
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_conversations_match ON conversations(match_id);
CREATE INDEX idx_conversations_participant_a ON conversations(participant_a_id, last_message_at DESC);
CREATE INDEX idx_conversations_participant_b ON conversations(participant_b_id, last_message_at DESC);

-- ============================================================================
-- 5. MESSAGES TABLE
-- ============================================================================
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  content TEXT NOT NULL,
  message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'system')),
  
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_messages_conversation ON messages(conversation_id, created_at DESC);
CREATE INDEX idx_messages_sender ON messages(sender_id);

-- ============================================================================
-- 6. BLOCKS TABLE (Safety)
-- ============================================================================
CREATE TABLE blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  blocker_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  blocked_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  reason TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT different_users CHECK (blocker_id != blocked_id),
  UNIQUE(blocker_id, blocked_id)
);

CREATE INDEX idx_blocks_blocker ON blocks(blocker_id);
CREATE INDEX idx_blocks_blocked ON blocks(blocked_id);

-- ============================================================================
-- 7. REPORTS TABLE (Safety)
-- ============================================================================
CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  reported_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  listing_id UUID REFERENCES listings(id) ON DELETE SET NULL,
  
  reason TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed')),
  
  reviewed_by UUID REFERENCES profiles(id),
  reviewed_at TIMESTAMPTZ,
  resolution_notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_reports_status ON reports(status);
CREATE INDEX idx_reports_reported ON reports(reported_id);

-- ============================================================================
-- 8. NOTIFICATIONS TABLE
-- ============================================================================
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  type TEXT NOT NULL CHECK (type IN (
    'new_match',
    'match_accepted',
    'match_rejected',
    'new_message',
    'listing_expired',
    'match_expiring_soon'
  )),
  
  title TEXT NOT NULL,
  message TEXT,
  
  -- Related entities
  match_id UUID REFERENCES matches(id) ON DELETE SET NULL,
  listing_id UUID REFERENCES listings(id) ON DELETE SET NULL,
  
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON notifications(user_id, created_at DESC);
CREATE INDEX idx_notifications_unread ON notifications(user_id, is_read) WHERE is_read = false;

-- ============================================================================
-- TRIGGERS FOR AUTOMATIC UPDATES
-- ============================================================================

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER listings_updated_at BEFORE UPDATE ON listings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER matches_updated_at BEFORE UPDATE ON matches
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Sync geography column with lat/lng
CREATE OR REPLACE FUNCTION sync_profile_location()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.current_lat IS NOT NULL AND NEW.current_lng IS NOT NULL THEN
    NEW.current_location = ST_SetSRID(ST_MakePoint(NEW.current_lng, NEW.current_lat), 4326)::geography;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_sync_location BEFORE INSERT OR UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION sync_profile_location();

CREATE OR REPLACE FUNCTION sync_listing_location()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.lat IS NOT NULL AND NEW.lng IS NOT NULL THEN
    NEW.location = ST_SetSRID(ST_MakePoint(NEW.lng, NEW.lat), 4326)::geography;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER listings_sync_location BEFORE INSERT OR UPDATE ON listings
  FOR EACH ROW EXECUTE FUNCTION sync_listing_location();
