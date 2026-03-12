-- ============================================================================
-- SIMPLE TEST USER CREATION (Profile + Listings Only)
-- ============================================================================
-- Use this if the full auth.users insert doesn't work
-- This creates a profile with a random UUID (won't be able to login)
-- ============================================================================

-- 1. Create profile for test user
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
  'b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e', -- Test user ID
  'marie.dubois@example.com',
  'Marie Dubois',
  50.8720, -- East of Leuven center
  4.7080,
  'Leuven',
  'Belgium',
  15,
  ARRAY['garden', 'tools', 'furniture', 'electronics'],
  ARRAY['organic', 'eco-friendly', 'beginner-friendly'],
  4.8,
  12,
  10,
  TRUE,
  TRUE
) ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name,
  current_lat = EXCLUDED.current_lat,
  current_lng = EXCLUDED.current_lng,
  city = EXCLUDED.city;

-- 2. Add diverse listings for this user
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
  -- Garden offer
  (
    'b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e',
    'Herb Garden & Compost',
    'Small herb garden with fresh basil, rosemary and thyme. Including compost bin.',
    'offer',
    'garden',
    ARRAY['herbs', 'organic', 'beginner-friendly'],
    50.8725,
    4.7090,
    'Leuven',
    'Mechelsestraat 34, Leuven',
    NOW(),
    NOW() + INTERVAL '8 months',
    15.00,
    'month',
    TRUE
  ),
  -- Tool rental
  (
    'b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e',
    'Gardening Tool Set',
    'Complete set of gardening tools: spades, rakes, hoes, pruning shears.',
    'rental',
    'tools',
    ARRAY['gardening', 'beginner-friendly', 'maintenance'],
    50.8710,
    4.7070,
    'Leuven',
    'Diestsestraat 67, Leuven',
    NOW(),
    NOW() + INTERVAL '1 year',
    8.00,
    'day',
    TRUE
  ),
  -- Electronics request
  (
    'b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e',
    'Looking for Old Laptop',
    'Need an old laptop for learning programming. Any working laptop welcome!',
    'request',
    'electronics',
    ARRAY['laptop', 'programming', 'student'],
    50.8730,
    4.7100,
    'Leuven',
    'Oude Markt 15, Leuven',
    NOW(),
    NOW() + INTERVAL '2 months',
    NULL,
    NULL,
    TRUE
  ),
  -- Furniture offer
  (
    'b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e',
    'Vintage Garden Furniture',
    'Beautiful restored garden table and 4 chairs. Perfect for outdoor dining.',
    'offer',
    'furniture',
    ARRAY['vintage', 'outdoor', 'restored'],
    50.8715,
    4.7085,
    'Leuven',
    'Vesaliusstraat 12, Leuven',
    NOW(),
    NOW() + INTERVAL '4 months',
    120.00,
    'once',
    TRUE
  ),
  -- Garden service
  (
    'b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e',
    'Garden Design Consultation',
    'Professional garden designer offering consultations. Specializing in sustainable gardens.',
    'service',
    'garden',
    ARRAY['professional', 'sustainable', 'design'],
    50.8735,
    4.7095,
    'Leuven',
    'Sint-Jacobsplein 8, Leuven',
    NOW(),
    NOW() + INTERVAL '1 year',
    40.00,
    'hour',
    TRUE
  );

-- Success message
SELECT 
  'Test user "Marie Dubois" created successfully!' AS status,
  'User ID: b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e' AS user_id,
  'Email: marie.dubois@example.com' AS email,
  'Location: East Leuven (50.8720, 4.7080)' AS location,
  '5 diverse listings created' AS listings,
  'Types: 2 offers, 1 rental, 1 request, 1 service' AS listing_types;
