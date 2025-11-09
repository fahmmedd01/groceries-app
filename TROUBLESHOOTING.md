# Troubleshooting Guide

## 🚨 Getting 500 Errors on `/api/items/add` and `/api/stores`?

### Root Cause
The database schema hasn't been updated yet. The new code expects columns and tables that don't exist in your Supabase database.

---

## ✅ Solution: Update Supabase Database

### Step 1: Open Supabase SQL Editor

1. Go to https://supabase.com/dashboard
2. Select your project: `zodkbsocxbkpqsjetrms`
3. Click **"SQL Editor"** in the left sidebar
4. Click **"New Query"** button

### Step 2: Copy the Schema

Open the `supabase-schema.sql` file in your project and **copy the entire contents**.

### Step 3: Run the Schema

1. Paste the SQL into the Supabase SQL Editor
2. Click **"Run"** or press `Ctrl/Cmd + Enter`
3. Wait for success message

### Step 4: Verify Changes

Go to **Table Editor** and verify:

#### ✅ `list_items` table should have:
- `retailer` (TEXT, NOT NULL, DEFAULT 'other')
- `purchased` (BOOLEAN, NOT NULL, DEFAULT false)
- `purchased_retailer` (TEXT, nullable)
- `purchased_at` (TIMESTAMP, nullable)

#### ✅ `grocery_lists` table should have:
- `is_active` (BOOLEAN, NOT NULL, DEFAULT true)
- `status` (TEXT, NOT NULL, DEFAULT 'active')
- ❌ NO `zip_code` column (should be removed)

#### ✅ New tables should exist:
- `stores` (with columns: id, user_id, name, retailer, address, created_at)
- `shopping_sessions` (with columns: id, user_id, list_id, started_at, completed_at, notes)

### Step 5: Check RLS Policies

Verify in **Authentication → Policies** that these tables have policies:
- `users`: "Public user access"
- `grocery_lists`: "Public grocery lists access"
- `list_items`: "Public list items access"
- `stores`: "Public stores access"
- `shopping_sessions`: "Public shopping sessions access"

---

## 🔍 If Still Getting Errors

### Check Vercel Logs

1. Go to https://vercel.com/dashboard
2. Open your project: `groceries-app`
3. Click on the latest deployment
4. Go to **"Functions"** tab
5. Click on a failed function (e.g., `/api/items/add`)
6. Look for error details with:
   - `code`: Database error code (e.g., "42703" = column doesn't exist)
   - `details`: Specific error message
   - `hint`: Suggestion for fixing

### Common Error Codes

| Error Code | Meaning | Solution |
|------------|---------|----------|
| 42703 | Column does not exist | Run the SQL schema migrations |
| 42P01 | Table does not exist | Create the missing table |
| 23503 | Foreign key violation | Ensure referenced tables exist |
| 42501 | Insufficient privilege | Check RLS policies |

---

## 🧪 Test the Fix

After updating the database:

1. **Clear browser cache** (or open incognito)
2. Go to https://groceries-app-three.vercel.app/
3. Click **"Sign In"**
4. Enter your name and email
5. Try adding items:
   ```
   2 gallons of milk, 1 dozen eggs, bananas
   ```
6. Select a retailer (e.g., Walmart)
7. Click **"Add Items to List"**

You should see:
- ✅ Success message
- ✅ Redirect to list view
- ✅ Items displayed grouped by retailer

---

## 📊 Monitoring

With the latest deployment, detailed error logs are now available in:

1. **Browser Console** (F12 → Console tab)
   - Look for red error messages
   - Check Network tab for API response details

2. **Vercel Logs**
   - Real-time function logs
   - Error stack traces
   - Database error details

---

## 🆘 Still Stuck?

If you're still experiencing issues after running the SQL schema:

1. **Share the error details** from Vercel logs (code, details, hint)
2. **Check browser console** for any client-side errors
3. **Verify environment variables** are set in Vercel:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `ANTHROPIC_API_KEY`

4. **Try a hard refresh**: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)

---

## 📝 Quick Reference: SQL to Run

The key migrations in `supabase-schema.sql`:

```sql
-- Add retailer column to list_items
ALTER TABLE public.list_items 
ADD COLUMN retailer TEXT NOT NULL DEFAULT 'other';

-- Add purchased tracking columns
ALTER TABLE public.list_items 
ADD COLUMN purchased BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN purchased_retailer TEXT,
ADD COLUMN purchased_at TIMESTAMP WITH TIME ZONE;

-- Add list management columns
ALTER TABLE public.grocery_lists 
ADD COLUMN is_active BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN status TEXT NOT NULL DEFAULT 'active';

-- Remove zip_code (if exists)
ALTER TABLE public.grocery_lists 
DROP COLUMN IF EXISTS zip_code;

-- Create stores table
CREATE TABLE IF NOT EXISTS public.stores (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  retailer TEXT NOT NULL,
  address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
```

Run the **full schema file** for complete setup with RLS policies!



