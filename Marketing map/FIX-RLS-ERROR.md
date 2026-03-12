# Fix RLS Error for Match Creation 🔧

## Problem
When trying to create a match without authentication, you get:
```
401 Unauthorized: new row violates row-level security policy for table "matches"
```

This happens because:
1. Auth is disabled (development mode)
2. RLS (Row Level Security) still checks permissions
3. The `create_match` function doesn't have elevated permissions

---

## 🎯 Solutions (Choose ONE)

### ✅ Solution 1: Fix create_match Function (RECOMMENDED)

**File**: `fix-create-match-security.sql`

This adds `SECURITY DEFINER` to the `create_match` function, allowing it to run with elevated permissions and bypass RLS checks.

**Pros**:
- ✅ Most secure
- ✅ Works with or without auth
- ✅ Production-ready

**How to apply**:
1. Open Supabase Dashboard → SQL Editor
2. Run `fix-create-match-security.sql`
3. Test creating a match in your app

---

### 🔓 Solution 2: Disable RLS (Quick & Dirty)

**File**: `disable-rls-dev.sql`

This completely disables RLS on the matches table.

**Pros**:
- ✅ Easiest to implement
- ✅ Works immediately

**Cons**:
- ❌ Removes ALL security
- ❌ Must remember to re-enable for production
- ❌ Not recommended

**How to apply**:
1. Open Supabase Dashboard → SQL Editor
2. Run `disable-rls-dev.sql`
3. Test creating a match

**To re-enable RLS later**:
```sql
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
```

---

### 🛡️ Solution 3: Add INSERT Policy

**File**: `add-match-insert-policy.sql`

This adds an RLS policy that allows inserts from service role/postgres.

**Pros**:
- ✅ More secure than disabling RLS
- ✅ Keeps other RLS policies active

**Cons**:
- ❌ May not work if function isn't SECURITY DEFINER
- ❌ Less flexible than Solution 1

**How to apply**:
1. Open Supabase Dashboard → SQL Editor
2. Run `add-match-insert-policy.sql`
3. Test creating a match

---

## 🎯 Which One Should I Use?

### For Development + Production:
→ **Use Solution 1** (`fix-create-match-security.sql`)

This is the cleanest solution that will work in both development and production. It properly elevates the function's permissions.

### For Quick Testing Only:
→ **Use Solution 2** (`disable-rls-dev.sql`)

Only if you need something working RIGHT NOW and will fix it properly later.

---

## 🧪 Testing

After applying a solution, test it:

1. **In your app**: Try to create a match by clicking a listing and hitting "Request Match"
2. **In SQL Editor**: Run this to verify:
```sql
-- Check if match was created
SELECT * FROM matches ORDER BY created_at DESC LIMIT 5;

-- Check function permissions
SELECT routine_name, security_type 
FROM information_schema.routines 
WHERE routine_name = 'create_match';
-- Should show 'DEFINER' if Solution 1 was applied
```

---

## 🔍 What Changed?

### Before (Broken):
```sql
CREATE OR REPLACE FUNCTION create_match(...)
RETURNS UUID AS $$
-- Function runs with caller's permissions (anonymous = no permission)
```

### After (Fixed):
```sql
CREATE OR REPLACE FUNCTION create_match(...)
RETURNS UUID 
SECURITY DEFINER  -- Runs with function owner's permissions (postgres)
SET search_path = public  -- Security best practice
AS $$
-- Function can now insert into matches table
```

---

## 🚨 Important Notes

1. **SECURITY DEFINER functions should be carefully written** - they bypass RLS, so make sure they don't allow unauthorized access
2. **Always set search_path** when using SECURITY DEFINER for security
3. **Grant EXECUTE** to the roles that need to call the function (`authenticated`, `anon`)

---

## 🎉 After Fixing

You should now be able to:
- ✅ Create matches without authentication
- ✅ See pink markers (matches) on the map
- ✅ Test matching between different users
- ✅ Use the dev user switching feature

---

## Related Files

- `rls-policies.sql` - Original RLS policies
- `matching-algorithm.sql` - Original create_match function
- `SearchMap.tsx` - Frontend code that calls create_match
