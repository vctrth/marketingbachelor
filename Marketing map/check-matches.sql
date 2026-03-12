-- Check matches for Marie (current DEV_USER_ID)
SELECT 
  m.id,
  m.listing_id,
  m.user_a_id,
  m.user_b_id,
  m.status,
  l.title as listing_title
FROM matches m
LEFT JOIN listings l ON m.listing_id = l.id
WHERE m.user_a_id = 'b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e' 
   OR m.user_b_id = 'b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e';

-- Check matches for Arthur (if you were using this ID before)
SELECT 
  m.id,
  m.listing_id,
  m.user_a_id,
  m.user_b_id,
  m.status,
  l.title as listing_title
FROM matches m
LEFT JOIN listings l ON m.listing_id = l.id
WHERE m.user_a_id = '3bedb492-d4a4-41c4-ad80-18f3ca8f7ecd' 
   OR m.user_b_id = '3bedb492-d4a4-41c4-ad80-18f3ca8f7ecd';
