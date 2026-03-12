-- ============================================================================
-- CREATE TEST USER (without authentication)
-- ============================================================================
-- This creates a test user directly in the database for development
-- Use this to test matching between different users
-- ============================================================================

-- 1. Insert test user into auth.users (bypassing normal signup)
-- Note: This user won't be able to login, but will exist in the database
INSERT INTO auth.users (
  id,
  instance_id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  invited_at,
  confirmation_token,
  confirmation_sent_at,
  recovery_token,
  recovery_sent_at,
  email_change_token_new,
  email_change,
  email_change_sent_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  created_at,
  updated_at,
  phone,
  phone_confirmed_at,
  phone_change,
  phone_change_token,
  phone_change_sent_at,
  email_change_token_current,
  email_change_confirm_status,
  banned_until,
  reauthentication_token,
  reauthentication_sent_at,
  is_sso_user,
  deleted_at
) VALUES (
  'b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e', -- New test user ID
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'test.user2@example.com',
  crypt('password123', gen_salt('bf')), -- Hashed password
  NOW(),
  NULL,
  '',
  NULL,
  '',
  NULL,
  '',
  '',
  NULL,
  NULL,
  '{"provider":"email","providers":["email"]}',
  '{"full_name":"Test User 2"}',
  FALSE,
  NOW(),
  NOW(),
  NULL,
  NULL,
  '',
  '',
  NULL,
  '',
  0,
  NULL,
  '',
  NULL,
  FALSE,
  NULL
) ON CONFLICT (id) DO NOTHING;

-- 2. Create profile for test user
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
  preferred_tags,
  rating,
  total_matches,
  successful_matches,
  is_verified,
  is_active
) VALUES (
  'b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e',
  'test.user2@example.com',
  'Test User 2',
  50.8750, -- Slightly south of Leuven center
  4.6980,  -- Slightly west of Leuven center
  'Leuven',
  'Belgium',
  15,
  ARRAY['garden', 'tools', 'furniture'],
  ARRAY['organic', 'sustainable'],
  4.5,
  5,
  4,
  TRUE,
  TRUE
) ON CONFLICT (id) DO NOTHING;

-- 3. Add test listings for this user
INSERT INTO public.listings (
  user_id,
  title,
  description,
  type,
  category,
  tags,
  lat,
  lng,
  city,
  address,
  available_from,
  available_until,
  price,
  price_unit,
  is_active
) VALUES 
  (
    'b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e',
    'Organic Vegetable Garden',
    'Beautiful organic garden plot with fresh vegetables. Perfect for gardening enthusiasts!',
    'offer',
    'garden',
    ARRAY['organic', 'vegetables', 'sustainable'],
    50.8760,
    4.6990,
    'Leuven',
    'Tiensestraat 145, Leuven',
    NOW(),
    NOW() + INTERVAL '6 months',
    20.00,
    'month',
    TRUE
  ),
  (
    'b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e',
    'Power Tools Set',
    'Complete set of professional power tools. Drill, saw, sander and more.',
    'rental',
    'tools',
    ARRAY['power-tools', 'professional'],
    50.8740,
    4.6970,
    'Leuven',
    'Naamsestraat 80, Leuven',
    NOW(),
    NOW() + INTERVAL '1 year',
    15.00,
    'day',
    TRUE
  ),
  (
    'b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e',
    'Vintage Furniture Collection',
    'Restored vintage furniture pieces. Unique and sustainable.',
    'offer',
    'furniture',
    ARRAY['vintage', 'sustainable', 'restored'],
    50.8730,
    4.6960,
    'Leuven',
    'Bondgenotenlaan 20, Leuven',
    NOW(),
    NOW() + INTERVAL '3 months',
    50.00,
    'once',
    TRUE
  ),
  (
    'b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e',
    'Community Workshop Space',
    'Shared workshop space with tools. Great for DIY projects!',
    'service',
    'tools',
    ARRAY['workshop', 'community', 'DIY'],
    50.8755,
    4.6985,
    'Leuven',
    'Parkstraat 5, Leuven',
    NOW(),
    NOW() + INTERVAL '1 year',
    10.00,
    'hour',
    TRUE
  );

-- Success message
SELECT 'Test user created successfully!' AS message,
       'Email: test.user2@example.com' AS email,
       'User ID: b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e' AS user_id,
       'Location: Leuven (slightly SW of center)' AS location,
       '4 test listings added' AS listings;
