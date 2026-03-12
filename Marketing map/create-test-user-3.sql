-- ============================================================================
-- CREATE THIRD TEST USER - For matching variety
-- ============================================================================
-- Another test user at a different location to test distance-based matching
-- ============================================================================

-- Create profile
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
  'c3d4e5f6-a7b8-4c9d-0e1f-2a3b4c5d6e7f', -- Third test user ID
  'jan.peeters@example.com',
  'Jan Peeters',
  50.8650, -- South-west of Leuven
  4.6920,
  'Heverlee',
  'Belgium',
  20,
  ARRAY['tools', 'electronics', 'garden'],
  ARRAY['DIY', 'tech', 'community'],
  4.3,
  8,
  7,
  TRUE,
  TRUE
) ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name,
  current_lat = EXCLUDED.current_lat,
  current_lng = EXCLUDED.current_lng;

-- Add listings
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
    'c3d4e5f6-a7b8-4c9d-0e1f-2a3b4c5d6e7f',
    'Arduino & Raspberry Pi Set',
    'Electronics starter kit with Arduino Uno and Raspberry Pi 4. Includes sensors and cables.',
    'rental',
    'electronics',
    ARRAY['arduino', 'raspberry-pi', 'maker', 'tech'],
    50.8655,
    4.6930,
    'Heverlee',
    'Celestijnenlaan 200D, Heverlee',
    NOW(),
    NOW() + INTERVAL '1 year',
    12.00,
    'week',
    TRUE
  ),
  (
    'c3d4e5f6-a7b8-4c9d-0e1f-2a3b4c5d6e7f',
    '3D Printer Access',
    'Access to Prusa i3 MK3S 3D printer. Great for prototyping and DIY projects.',
    'service',
    'electronics',
    ARRAY['3D-printing', 'maker', 'prototyping', 'DIY'],
    50.8660,
    4.6940,
    'Heverlee',
    'Kapeldreef 75, Heverlee',
    NOW(),
    NOW() + INTERVAL '1 year',
    5.00,
    'hour',
    TRUE
  ),
  (
    'c3d4e5f6-a7b8-4c9d-0e1f-2a3b4c5d6e7f',
    'Looking for Garden Plot',
    'Searching for small garden plot or allotment space in Heverlee area.',
    'request',
    'garden',
    ARRAY['gardening', 'vegetables', 'allotment'],
    50.8645,
    4.6915,
    'Heverlee',
    'Naamsesteenweg 355, Heverlee',
    NOW(),
    NOW() + INTERVAL '6 months',
    NULL,
    NULL,
    TRUE
  ),
  (
    'c3d4e5f6-a7b8-4c9d-0e1f-2a3b4c5d6e7f',
    'Woodworking Tools',
    'Hand tools and electric saw for woodworking. Perfect condition.',
    'offer',
    'tools',
    ARRAY['woodworking', 'carpentry', 'hand-tools'],
    50.8670,
    4.6950,
    'Heverlee',
    'Arenbergpark 10, Heverlee',
    NOW(),
    NOW() + INTERVAL '1 year',
    10.00,
    'day',
    TRUE
  );

SELECT 
  'Test user "Jan Peeters" created!' AS status,
  'User ID: c3d4e5f6-a7b8-4c9d-0e1f-2a3b4c5d6e7f' AS user_id,
  'Email: jan.peeters@example.com' AS email,
  'Location: Heverlee (50.8650, 4.6920)' AS location,
  '4 listings: electronics, tools, garden request' AS listings;
