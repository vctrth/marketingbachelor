-- ============================================================================
-- ADD INSERT POLICY FOR MATCHES (Alternative to disabling RLS)
-- ============================================================================
-- This adds an INSERT policy that allows the create_match function to work
-- More secure than disabling RLS completely
-- ============================================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Service role can create matches" ON matches;
DROP POLICY IF EXISTS "Allow create_match function to insert" ON matches;

-- Create policy that allows inserts from the create_match function
-- The function runs as SECURITY DEFINER (with owner permissions)
-- So we allow inserts when current_user is the function owner
CREATE POLICY "Service role can create matches"
  ON matches FOR INSERT
  WITH CHECK (
    -- Allow inserts from postgres/service role (function owner)
    current_user IN ('postgres', 'service_role', 'authenticator')
  );

-- Alternative: Allow ANY insert (less secure, but works for development)
-- Uncomment this if the above doesn't work:
-- DROP POLICY IF EXISTS "Service role can create matches" ON matches;
-- CREATE POLICY "Allow create_match function to insert"
--   ON matches FOR INSERT
--   WITH CHECK (true);

SELECT 'INSERT policy added for matches table' AS status;
SELECT 'create_match function should now work!' AS message;
