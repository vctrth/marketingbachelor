-- ============================================================================
-- DISABLE RLS FOR DEVELOPMENT MODE
-- ============================================================================
-- This temporarily disables Row Level Security for testing without auth
-- WARNING: Only use this in development! Never in production!
-- ============================================================================

-- Disable RLS on matches table (allows creating matches without auth)
ALTER TABLE matches DISABLE ROW LEVEL SECURITY;

-- Optional: Also disable RLS on other tables if needed
-- ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE listings DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE conversations DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE messages DISABLE ROW LEVEL SECURITY;

-- To re-enable RLS later, run:
-- ALTER TABLE matches ENABLE ROW LEVEL SECURITY;

SELECT 'RLS disabled for matches table - development mode active!' AS status;
SELECT 'WARNING: Re-enable RLS before going to production!' AS warning;
