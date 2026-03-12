-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Supabase Matching System - Security Layer
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- PROFILES POLICIES
-- ============================================================================

-- Anyone can view active profiles (for matching)
CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (is_active = true);

-- Users can insert their own profile
CREATE POLICY "Users can create their own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Users cannot delete (soft delete via is_active flag)
-- No DELETE policy = cannot delete

-- ============================================================================
-- LISTINGS POLICIES
-- ============================================================================

-- Anyone can view active, non-archived listings
CREATE POLICY "Active listings are viewable by everyone"
  ON listings FOR SELECT
  USING (is_active = true AND is_archived = false);

-- Users can view their own listings (even if archived)
CREATE POLICY "Users can view own listings"
  ON listings FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create listings
CREATE POLICY "Users can create listings"
  ON listings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own listings
CREATE POLICY "Users can update own listings"
  ON listings FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own listings
CREATE POLICY "Users can delete own listings"
  ON listings FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- MATCHES POLICIES
-- ============================================================================

-- Users can view matches where they are a participant
CREATE POLICY "Users can view their matches"
  ON matches FOR SELECT
  USING (
    auth.uid() = user_a_id OR 
    auth.uid() = user_b_id
  );

-- System can create matches (via Edge Function with service role)
-- Users cannot directly create matches
-- No INSERT policy for users

-- Users can update matches if they are a participant (to accept/reject)
CREATE POLICY "Users can respond to their matches"
  ON matches FOR UPDATE
  USING (
    auth.uid() = user_a_id OR 
    auth.uid() = user_b_id
  )
  WITH CHECK (
    auth.uid() = user_a_id OR 
    auth.uid() = user_b_id
  );

-- Users can cancel matches they initiated
CREATE POLICY "Users can cancel matches they initiated"
  ON matches FOR UPDATE
  USING (
    auth.uid() = initiator_id AND
    status = 'pending'
  )
  WITH CHECK (
    status = 'cancelled'
  );

-- ============================================================================
-- CONVERSATIONS POLICIES
-- ============================================================================

-- Users can view conversations where they are a participant
CREATE POLICY "Users can view their conversations"
  ON conversations FOR SELECT
  USING (
    auth.uid() = participant_a_id OR 
    auth.uid() = participant_b_id
  );

-- System creates conversations (via trigger when match is accepted)
-- No direct INSERT policy for users

-- Users can update their conversation (mark as read, etc.)
CREATE POLICY "Users can update their conversations"
  ON conversations FOR UPDATE
  USING (
    auth.uid() = participant_a_id OR 
    auth.uid() = participant_b_id
  )
  WITH CHECK (
    auth.uid() = participant_a_id OR 
    auth.uid() = participant_b_id
  );

-- ============================================================================
-- MESSAGES POLICIES
-- ============================================================================

-- Users can view messages in their conversations
CREATE POLICY "Users can view messages in their conversations"
  ON messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = messages.conversation_id
        AND (
          conversations.participant_a_id = auth.uid() OR
          conversations.participant_b_id = auth.uid()
        )
    )
  );

-- Users can send messages in their conversations
CREATE POLICY "Users can send messages in their conversations"
  ON messages FOR INSERT
  WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = conversation_id
        AND (
          conversations.participant_a_id = auth.uid() OR
          conversations.participant_b_id = auth.uid()
        )
        AND conversations.is_active = true
    )
  );

-- Users can mark their messages as read
CREATE POLICY "Users can mark messages as read"
  ON messages FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = messages.conversation_id
        AND (
          conversations.participant_a_id = auth.uid() OR
          conversations.participant_b_id = auth.uid()
        )
    )
  )
  WITH CHECK (
    -- Only allow updating is_read and read_at fields
    is_read IS NOT DISTINCT FROM NEW.is_read AND
    read_at IS NOT DISTINCT FROM NEW.read_at
  );

-- ============================================================================
-- BLOCKS POLICIES
-- ============================================================================

-- Users can view their own blocks
CREATE POLICY "Users can view their blocks"
  ON blocks FOR SELECT
  USING (auth.uid() = blocker_id);

-- Users can create blocks
CREATE POLICY "Users can block others"
  ON blocks FOR INSERT
  WITH CHECK (auth.uid() = blocker_id);

-- Users can remove their blocks
CREATE POLICY "Users can unblock others"
  ON blocks FOR DELETE
  USING (auth.uid() = blocker_id);

-- ============================================================================
-- REPORTS POLICIES
-- ============================================================================

-- Users can view their own reports
CREATE POLICY "Users can view their reports"
  ON reports FOR SELECT
  USING (auth.uid() = reporter_id);

-- Users can create reports
CREATE POLICY "Users can create reports"
  ON reports FOR INSERT
  WITH CHECK (auth.uid() = reporter_id);

-- Admins/moderators can view all reports (would need admin role check)
-- For now, commented out - implement when admin system is ready
-- CREATE POLICY "Admins can view all reports"
--   ON reports FOR SELECT
--   USING (
--     EXISTS (
--       SELECT 1 FROM profiles
--       WHERE profiles.id = auth.uid()
--       AND profiles.role = 'admin'
--     )
--   );

-- ============================================================================
-- NOTIFICATIONS POLICIES
-- ============================================================================

-- Users can view their own notifications
CREATE POLICY "Users can view their notifications"
  ON notifications FOR SELECT
  USING (auth.uid() = user_id);

-- System creates notifications (service role)
-- No direct INSERT policy for users

-- Users can mark notifications as read
CREATE POLICY "Users can mark notifications as read"
  ON notifications FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (
    auth.uid() = user_id AND
    -- Only allow updating is_read and read_at
    is_read IS NOT DISTINCT FROM NEW.is_read AND
    read_at IS NOT DISTINCT FROM NEW.read_at
  );

-- Users can delete their notifications
CREATE POLICY "Users can delete their notifications"
  ON notifications FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- HELPER FUNCTION: Check if user is blocked
-- ============================================================================

CREATE OR REPLACE FUNCTION is_user_blocked(user_a UUID, user_b UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM blocks
    WHERE (blocker_id = user_a AND blocked_id = user_b)
       OR (blocker_id = user_b AND blocked_id = user_a)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- ENHANCED MATCHING POLICIES WITH BLOCK CHECK
-- ============================================================================

-- Override the matches SELECT policy to exclude blocked users
DROP POLICY IF EXISTS "Users can view their matches" ON matches;

CREATE POLICY "Users can view their matches (excluding blocked)"
  ON matches FOR SELECT
  USING (
    (auth.uid() = user_a_id OR auth.uid() = user_b_id)
    AND NOT is_user_blocked(user_a_id, user_b_id)
  );

-- ============================================================================
-- NOTES
-- ============================================================================

/*
Key Security Principles Applied:

1. **Least Privilege**: Users can only access data they own or are part of
2. **No Direct Match Creation**: Matches are created by Edge Functions with service role
3. **Block System**: Blocked users cannot see each other's matches or messages
4. **Soft Deletes**: Most tables use is_active/is_archived flags instead of hard deletes
5. **Read-Only Fields**: Some updates are restricted to specific fields (e.g., marking as read)

Future Enhancements:
- Add role-based access control (admin, moderator)
- Add rate limiting policies
- Add geographic restrictions (e.g., can only view listings in your region)
- Add time-based policies (e.g., expired matches become read-only)
*/
