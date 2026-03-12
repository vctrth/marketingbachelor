# ⚡ Quick Start Guide

Get your matching system running in 15 minutes!

## Step 1: Supabase Setup (5 min)

1. **Create project** at [supabase.com](https://supabase.com)

2. **Disable email confirmation** (for development):
   - Go to Authentication → Providers → Email
   - Turn OFF "Confirm email"
   - Save changes
   
3. **Copy credentials** from Settings → API:
   - Project URL
   - Anon/public key

4. **Run SQL migrations** in SQL Editor (copy-paste each file in order):
   ```
   1. supabase-schema.sql
   2. rls-policies.sql  
   3. matching-algorithm.sql
   4. auto-create-profile.sql  (NEW! Auto-creates profiles for new users)
   ```

## Step 2: Environment Setup (2 min)

Create `.env.local`:

```env
REACT_APP_SUPABASE_URL=https://xxxxx.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJxxx...
```

## Step 3: Install & Run (3 min)

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

## Step 4: Create Test Account & Add Data (5 min)

1. **Sign up in the app** at http://localhost:5173
   - Enter email and password
   - Click "Sign Up"
   - Your profile is created automatically! 🎉

2. **Get your User ID** from Supabase Dashboard:
   - Go to Authentication → Users
   - Copy your user UUID (example: 3bedb492-d4a4-41c4-ad80-18f3ca8f7ecd)

3. **Add test listings** in Supabase SQL Editor (replace USER_ID with your actual ID):

```sql
-- Add test listings (different locations in Leuven)
INSERT INTO listings (user_id, title, description, type, category, tags, lat, lng, city)
VALUES 
  (
    'YOUR_USER_ID_HERE',  -- Replace with your actual user ID!
    'Beautiful Garden for Rent',
    'Sunny garden with vegetables',
    'offer',
    'garden',
    ARRAY['organic', 'vegetables'],
    50.8810,
    4.7015,
    'Leuven'
  ),
  (
    'YOUR_USER_ID_HERE',  -- Replace with your actual user ID!
    'Garden Tools Available',
    'Various gardening tools',
    'offer',
    'tools',
    ARRAY['tools', 'beginner-friendly'],
    50.8750,
    4.6980,
    'Leuven'
  ),
  (
    'YOUR_USER_ID_HERE',  -- Replace with your actual user ID!
    'Community Garden Spot',
    'Join our community garden',
    'rental',
    'garden',
    ARRAY['community', 'organic'],
    50.8830,
    4.7050,
    'Leuven'
  );
```

**Note:** You don't need to manually insert a profile anymore - the `auto-create-profile.sql` trigger does this automatically!

## Step 5: Test Matching

```sql
-- Find matches for your user
SELECT * FROM find_candidate_matches(
  p_user_id := 'your-user-id',
  p_max_distance_km := 15,
  p_user_lat := 50.8798,
  p_user_lng := 4.7005,
  p_preferred_categories := ARRAY['garden', 'tools'],
  p_preferred_tags := ARRAY['organic']
);
```

You should see the test listings with match scores!

## 🎉 Success!

You should now see:
- ✅ Map centered on Leuven
- ✅ Purple markers for listings
- ✅ Your location as green marker
- ✅ Click markers to see details
- ✅ Match scores displayed

## 🐛 Troubleshooting

### Map not loading?
- Check browser console for errors
- Verify MapLibre CSS is imported
- Try different OpenStreetMap tile server

### No matches found?
- Verify test data inserted correctly
- Check distance filters (increase max_distance_km)
- Look for SQL errors in Supabase logs

### Realtime not working?
- Enable Realtime in Supabase Dashboard → Database → Replication
- Check that RLS policies allow reads

### Auth errors?
- **400 Bad Request on login?** → Check if email confirmation is DISABLED in Supabase (see Step 1.2)
- Verify .env.local has correct credentials (use VITE_ prefix, not REACT_APP_)
- Check Supabase dashboard for auth settings
- Enable email auth provider
- If you already created accounts before disabling email confirmation, you need to:
  1. Go to Supabase → Authentication → Users
  2. Click on the user → "Confirm email" to manually verify them
  OR delete the user and create a new account

## 📚 Next Steps

1. **Add more features**: See README.md roadmap
2. **Customize design**: Edit Tailwind classes in components
3. **Deploy**: Use [Vercel](https://vercel.com) or [Netlify](https://netlify.com)
4. **Scale**: Add Edge Function for automated matching

## 💡 Pro Tips

- Use Supabase Studio (local) for development: `npm run supabase:start`
- Check Supabase logs for debugging: Dashboard → Logs
- Test SQL functions directly in SQL Editor before using in app
- Use PostgREST auto-generated API docs: Dashboard → API Docs

---

**Need help?** Check [README.md](./README.md) for detailed documentation
