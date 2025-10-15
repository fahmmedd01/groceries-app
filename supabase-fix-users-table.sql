-- Fix: Remove foreign key constraint from users table
-- This allows us to use simple localStorage-based auth without Supabase auth

-- Step 1: Drop the foreign key constraint
ALTER TABLE public.users 
DROP CONSTRAINT IF EXISTS users_id_fkey;

-- Step 2: Verify the users table structure
-- Should have: id (UUID PRIMARY KEY), email, full_name, created_at
-- Should NOT reference auth.users

-- Step 3: Remove default_zip_code column if it exists
ALTER TABLE public.users 
DROP COLUMN IF EXISTS default_zip_code;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Foreign key constraint removed from users table!';
  RAISE NOTICE 'Users table is now independent and ready for localStorage auth.';
END $$;

