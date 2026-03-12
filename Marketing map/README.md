# Garden Matching System - Implementation Guide

A complete location-based matching system built with **Supabase**, **MapLibre GL**, and **React**. Combines the beautiful Figma design with a powerful matching algorithm backend.

## 🎯 Features

- **Geographic Matching**: PostGIS-powered location queries with distance filtering
- **Smart Scoring**: Multi-factor matching algorithm (distance, tags, recency, reputation)
- **Real-time Updates**: Live match notifications and map updates via Supabase Realtime
- **Beautiful UI**: Glassmorphism design from Figma with smooth animations
- **Secure**: Row-Level Security (RLS) policies protect all user data
- **Scalable**: Optimized queries with spatial indexes and clustering

## 📁 Project Structure

```
/Users/arthurdeklerck/dev/Bchelor/
├── supabase-schema.sql           # Database tables & triggers
├── rls-policies.sql              # Row-level security policies
├── matching-algorithm.sql        # Matching queries & functions
├── supabase/
│   └── functions/
│       └── auto-match/
│           └── index.ts          # Edge function for automated matching
├── src/
│   ├── types.ts                  # TypeScript type definitions
│   ├── SearchMap.tsx             # Main map component
│   ├── components/
│   │   ├── ui.tsx                # UI components (Topnav, Botnav, etc.)
│   │   └── Map.tsx               # MapLibre integration
│   └── hooks/
│       └── useSupabase.ts        # Supabase client & hooks
└── prompt.md                     # System prompt & requirements
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn
- Supabase account ([supabase.com](https://supabase.com))
- Basic knowledge of React and SQL

### 1. Set Up Supabase

#### Create a new Supabase project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for the database to initialize

#### Run the SQL migrations

In your Supabase SQL Editor, run these files in order:

```bash
# 1. Create tables and triggers
Run: supabase-schema.sql

# 2. Set up security policies
Run: rls-policies.sql

# 3. Create matching functions
Run: matching-algorithm.sql
```

#### Set up environment variables

Create a `.env.local` file:

```env
REACT_APP_SUPABASE_URL=https://your-project.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-anon-key
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
```

Required packages:

```bash
npm install @supabase/supabase-js maplibre-gl react react-dom
npm install -D @types/react @types/maplibre-gl typescript
```

### 3. Deploy Edge Function (Optional)

For automated matching:

```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Link your project
supabase link --project-ref your-project-ref

# Deploy function
supabase functions deploy auto-match
```

### 4. Run the App

```bash
npm start
# or
yarn start
```

## 📊 Database Schema Overview

### Core Tables

- **profiles**: User data, location, preferences, reputation
- **listings**: Items/services to be matched (with PostGIS location)
- **matches**: Match records with scoring and status workflow
- **conversations**: Chat threads between matched users
- **messages**: Individual messages
- **blocks**: User blocking for safety
- **reports**: Content reporting system
- **notifications**: In-app notifications

### Key Features

- **PostGIS Integration**: `GEOGRAPHY(Point, 4326)` for accurate distance queries
- **Spatial Indexes**: GIST indexes for fast location searches
- **Auto-sync Triggers**: Automatically sync lat/lng with geography column
- **Soft Deletes**: `is_active` and `is_archived` flags instead of hard deletes

## 🎯 Matching Algorithm

### Flow

1. **Trigger Event**: User creates listing or updates preferences
2. **Find Candidates**: Query listings within radius with hard filters
3. **Score Candidates**: Calculate match score (0-100) based on:
   - **Distance** (50 points): Closer = better
   - **Tag Overlap** (30 points): More matching tags = better
   - **Recency** (10 points): Newer listings = slightly better
   - **Reputation** (10 points): Verified + high rating = better
4. **Create Matches**: Auto-create matches for top candidates (score > 50)
5. **Send Notifications**: Notify both users

### SQL Function Usage

```sql
-- Find matches for a user
SELECT * FROM find_candidate_matches(
  p_user_id := 'user-uuid',
  p_max_distance_km := 15,
  p_user_lat := 50.8798,
  p_user_lng := 4.7005,
  p_preferred_categories := ARRAY['garden', 'tools'],
  p_preferred_tags := ARRAY['organic', 'beginner-friendly']
);

-- Create a match
SELECT create_match(
  p_user_a_id := 'user-a-uuid',
  p_user_b_id := 'user-b-uuid',
  p_listing_id := 'listing-uuid',
  p_initiator_id := 'user-a-uuid',
  p_match_score := 75.50,
  p_distance_km := 3.2,
  p_score_breakdown := '{"distance_score": 45, "tag_overlap_score": 20}'::jsonb
);

-- Accept/reject a match
SELECT respond_to_match(
  p_match_id := 'match-uuid',
  p_user_id := 'user-uuid',
  p_response := 'accept'
);
```

## 🔒 Security

### RLS Policies

- **Profiles**: Public read, own profile write
- **Listings**: Public read active listings, own listings full access
- **Matches**: Only participants can view/update
- **Messages**: Only conversation participants can read/write
- **Blocks**: Users can block/unblock others
- **Notifications**: Users can only see their own

### Block System

Users who block each other:
- Cannot see each other's listings
- Cannot be matched together
- Cannot message each other

## 🎨 UI Components

### From Figma Design

- **Topnav**: Location selector + filter button
- **Botnav**: 5-tab navigation (home, favorites, add, messages, profile)
- **Map Markers**: Custom SVG markers with color coding
- **Listing Cards**: Bottom sheet cards with match details
- **Glassmorphism**: White/40 backdrop blur styling

### Styling

The components use Tailwind CSS with custom colors:

```css
/* Main colors */
--neutral-green-500: #36392b  /* Text color */
bg-white/40                   /* Glass effect */
backdrop-blur-md              /* Blur background */
border-gray-300/40            /* Glass border */
```

## 🌐 MapLibre Integration

### Features

- **OpenStreetMap tiles** (free, no API key needed)
- **Custom markers** for listings, matches, and user location
- **Popups** on marker click
- **Clustering** for many markers
- **Bounds tracking** for realtime updates

### Usage

```tsx
<MapLibreMap
  center={{ lat: 50.8798, lng: 4.7005 }}
  zoom={13}
  listings={listings}
  matches={matches}
  onMarkerClick={handleClick}
  onMapMove={handleMapMove}
/>
```

## 🔄 Realtime Subscriptions

### Automatic Updates

- **Matches**: New matches appear instantly on map
- **Listings**: New listings show up in real-time
- **Notifications**: Badge updates immediately
- **Messages**: Live chat updates

### Implementation

```tsx
const { matches } = useRealtimeMatches(userId);
const { listings } = useRealtimeListings(mapBounds);
const { notifications, unreadCount } = useRealtimeNotifications(userId);
```

## 🎛️ Configuration

### Matching Parameters

Adjust in `matching-algorithm.sql`:

```sql
-- Score weights
GREATEST(0, 50 - (distance_km * 5))  -- Distance: 50 points max
(tag_overlap_count / tag_count) * 30 -- Tags: 30 points max
GREATEST(0, 10 - (days_old))         -- Recency: 10 points max
(verification + rating + success) * ? -- Reputation: 10 points max

-- Thresholds
MATCH_THRESHOLD = 50  -- Minimum score to create match
MAX_MATCHES = 10      -- Max auto-matches per trigger
```

### Map Settings

Adjust in `SearchMap.tsx`:

```tsx
const DEFAULT_CENTER = { lat: 50.8798, lng: 4.7005 }; // Leuven
const DEFAULT_ZOOM = 13;
const DEFAULT_RADIUS = 10; // km
```

## 🧪 Testing

### Test Data

Insert test data after running migrations:

```sql
-- Insert test profile
INSERT INTO profiles (id, email, full_name, current_lat, current_lng, city)
VALUES (
  auth.uid(),
  'test@example.com',
  'Test User',
  50.8798,
  4.7005,
  'Leuven'
);

-- Insert test listing
INSERT INTO listings (user_id, title, category, lat, lng)
VALUES (
  auth.uid(),
  'Beautiful Garden Space',
  'garden',
  50.8810,
  4.7015
);
```

### Test Matching

```sql
-- Find matches for test user
SELECT * FROM find_candidate_matches(
  p_user_id := auth.uid(),
  p_max_distance_km := 10,
  p_user_lat := 50.8798,
  p_user_lng := 4.7005
);
```

## 🚧 Roadmap

- [ ] Add radius filter UI
- [ ] Implement category tags system
- [ ] Add chat interface
- [ ] Build profile editing
- [ ] Add image upload for listings
- [ ] Implement rating system after completed matches
- [ ] Add push notifications (via Supabase)
- [ ] Build admin dashboard for reports

## 📝 License

MIT

## 🙏 Credits

- Design: Figma - Bachelorproef project
- Maps: [MapLibre GL](https://maplibre.org/) + [OpenStreetMap](https://www.openstreetmap.org/)
- Backend: [Supabase](https://supabase.com)
- Icons: Custom SVG from Figma design

---

**Questions?** Check the [Supabase docs](https://supabase.com/docs) or [MapLibre docs](https://maplibre.org/maplibre-gl-js-docs/)
