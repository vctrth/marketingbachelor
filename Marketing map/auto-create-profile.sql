-- ============================================================================
-- AUTO CREATE PROFILE FOR NEW USERS
-- ============================================================================
-- This trigger automatically creates a profile when a new user signs up
-- ============================================================================

-- Ensure PostGIS extension is enabled (required for geography type)
CREATE EXTENSION IF NOT EXISTS postgis;

-- Function to create profile for new user
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert a new profile for the user
  INSERT INTO public.profiles (
    id,
    email,
    full_name,
    current_lat,
    current_lng,
    city,
    country,
    max_distance_km,
    preferred_categories,
    preferred_tags
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    50.8798, -- Default to Leuven, Belgium
    4.7005,
    'Leuven',
    'Belgium',
    10, -- Default 10 km radius
    ARRAY['garden', 'tools', 'electronics', 'furniture'], -- Default categories
    ARRAY[]::text[] -- Empty tags initially
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to run the function when a new user is created
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON public.profiles TO postgres, authenticated, service_role;
