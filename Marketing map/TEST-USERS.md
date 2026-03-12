# Test Users Overview

## Available Test Users

### 1. Arthur (Original User) ✅
- **User ID**: `3bedb492-d4a4-41c4-ad80-18f3ca8f7ecd`
- **Email**: `arthur.deklerck@gmail.com`
- **Location**: Leuven Center (50.8798, 4.7005)
- **Status**: Already exists (created earlier)
- **Listings**: 3 listings (garden plots and tools)

---

### 2. Marie Dubois 🆕
- **User ID**: `b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e`
- **Email**: `marie.dubois@example.com`
- **Location**: East Leuven (50.8720, 4.7080)
- **Distance from Arthur**: ~0.8 km
- **SQL File**: `create-test-user-simple.sql` ⭐ RECOMMENDED
- **Listings**: 5 diverse listings
  - Herb Garden (offer)
  - Gardening Tools (rental)
  - Old Laptop Request
  - Vintage Garden Furniture (offer)
  - Garden Design Service

---

### 3. Jan Peeters 🆕
- **User ID**: `c3d4e5f6-a7b8-4c9d-0e1f-2a3b4c5d6e7f`
- **Email**: `jan.peeters@example.com`
- **Location**: Heverlee (50.8650, 4.6920)
- **Distance from Arthur**: ~1.5 km
- **SQL File**: `create-test-user-3.sql`
- **Listings**: 4 tech/maker listings
  - Arduino & Raspberry Pi (rental)
  - 3D Printer Access (service)
  - Garden Plot Request
  - Woodworking Tools (offer)

---

## How to Create Test Users

### Quick Start (Recommended)

1. **Open Supabase Dashboard** → SQL Editor
2. **Run this file**: `create-test-user-simple.sql` (creates Marie)
3. **Optionally run**: `create-test-user-3.sql` (creates Jan)

These create profiles and listings that will be visible on your map!

### Test Matching

Once created, you can test:
- **Distance-based matching**: Users at different locations
- **Category overlap**: Garden, tools, electronics
- **Different listing types**: offers, rentals, requests, services
- **Match scoring**: See how distance affects match scores

---

## Switch Active User in App

To test from different user perspectives, change the `DEV_USER_ID` in `src/SearchMap.tsx`:

```typescript
// Line 19-20 in SearchMap.tsx
const DEV_USER_ID = '3bedb492-d4a4-41c4-ad80-18f3ca8f7ecd'; // Arthur
// Change to:
const DEV_USER_ID = 'b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e'; // Marie
// or:
const DEV_USER_ID = 'c3d4e5f6-a7b8-4c9d-0e1f-2a3b4c5d6e7f'; // Jan
```

Save and the app will reload showing that user's perspective!

---

## Map View

After creating these users, your map will show:
- 📍 **Purple markers**: All listings from all users
- 💘 **Pink markers**: Matches for the active user
- 🗺️ **Spread**: Listings across Leuven area (center, east, south-west)

---

## Troubleshooting

### If listings don't appear:
```sql
-- Check if users were created
SELECT id, email, full_name, city FROM profiles;

-- Check if listings exist
SELECT id, user_id, title, category FROM listings;

-- Check specific user's listings
SELECT * FROM listings WHERE user_id = 'b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e';
```

### Create a match manually:
```sql
SELECT create_match(
  'INITIATOR_USER_ID',
  'RECEIVER_USER_ID', 
  'LISTING_ID',
  'INITIATOR_USER_ID',
  85.5,  -- match score
  1.2,   -- distance in km
  '{"distance_score": 45, "tag_overlap_score": 30, "recency_score": 5, "reputation_score": 5.5}'::jsonb
);
```

---

## What's Next?

1. ✅ Create test users with SQL
2. 🗺️ See all listings on map
3. 🔄 Switch between user IDs to see different perspectives
4. 💘 Send match requests between users
5. 🧪 Test the matching algorithm with different distances and categories
