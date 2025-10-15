-- MIGRATION SCRIPT: Update existing database to new schema
-- Run this if you already have tables created
-- Safe to run multiple times (checks if columns exist before adding)

-- 1. Add retailer column to list_items (if not exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'list_items' 
    AND column_name = 'retailer'
  ) THEN
    ALTER TABLE public.list_items 
    ADD COLUMN retailer TEXT NOT NULL DEFAULT 'other';
    RAISE NOTICE 'Added retailer column to list_items';
  ELSE
    RAISE NOTICE 'retailer column already exists in list_items';
  END IF;
END $$;

-- 2. Add purchased tracking columns to list_items (if not exist)
DO $$
BEGIN
  -- Add purchased column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'list_items' 
    AND column_name = 'purchased'
  ) THEN
    ALTER TABLE public.list_items 
    ADD COLUMN purchased BOOLEAN NOT NULL DEFAULT false;
    RAISE NOTICE 'Added purchased column to list_items';
  ELSE
    RAISE NOTICE 'purchased column already exists in list_items';
  END IF;
  
  -- Add purchased_retailer column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'list_items' 
    AND column_name = 'purchased_retailer'
  ) THEN
    ALTER TABLE public.list_items 
    ADD COLUMN purchased_retailer TEXT;
    RAISE NOTICE 'Added purchased_retailer column to list_items';
  ELSE
    RAISE NOTICE 'purchased_retailer column already exists in list_items';
  END IF;
  
  -- Add purchased_at column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'list_items' 
    AND column_name = 'purchased_at'
  ) THEN
    ALTER TABLE public.list_items 
    ADD COLUMN purchased_at TIMESTAMP WITH TIME ZONE;
    RAISE NOTICE 'Added purchased_at column to list_items';
  ELSE
    RAISE NOTICE 'purchased_at column already exists in list_items';
  END IF;
END $$;

-- 3. Add is_active and status columns to grocery_lists (if not exist)
DO $$
BEGIN
  -- Add is_active column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'grocery_lists' 
    AND column_name = 'is_active'
  ) THEN
    ALTER TABLE public.grocery_lists 
    ADD COLUMN is_active BOOLEAN NOT NULL DEFAULT true;
    RAISE NOTICE 'Added is_active column to grocery_lists';
  ELSE
    RAISE NOTICE 'is_active column already exists in grocery_lists';
  END IF;
  
  -- Add status column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'grocery_lists' 
    AND column_name = 'status'
  ) THEN
    ALTER TABLE public.grocery_lists 
    ADD COLUMN status TEXT NOT NULL DEFAULT 'active';
    RAISE NOTICE 'Added status column to grocery_lists';
  ELSE
    RAISE NOTICE 'status column already exists in grocery_lists';
  END IF;
END $$;

-- 4. Remove zip_code from grocery_lists (if exists)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'grocery_lists' 
    AND column_name = 'zip_code'
  ) THEN
    ALTER TABLE public.grocery_lists 
    DROP COLUMN zip_code;
    RAISE NOTICE 'Removed zip_code column from grocery_lists';
  ELSE
    RAISE NOTICE 'zip_code column does not exist in grocery_lists';
  END IF;
END $$;

-- 5. Create stores table (if not exists)
CREATE TABLE IF NOT EXISTS public.stores (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  retailer TEXT NOT NULL,
  address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Enable RLS on stores table
ALTER TABLE public.stores ENABLE ROW LEVEL SECURITY;

-- 7. Drop old RLS policy if exists and create new one for stores
DO $$
BEGIN
  DROP POLICY IF EXISTS "Public stores access" ON public.stores;
  CREATE POLICY "Public stores access" ON public.stores
    FOR ALL USING (true) WITH CHECK (true);
  RAISE NOTICE 'Created RLS policy for stores table';
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Policy creation skipped or failed: %', SQLERRM;
END $$;

-- 8. Create shopping_sessions table (if not exists)
CREATE TABLE IF NOT EXISTS public.shopping_sessions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  list_id UUID REFERENCES public.grocery_lists(id) ON DELETE CASCADE NOT NULL,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE,
  notes TEXT
);

-- 9. Enable RLS on shopping_sessions table
ALTER TABLE public.shopping_sessions ENABLE ROW LEVEL SECURITY;

-- 10. Drop old RLS policy if exists and create new one for shopping_sessions
DO $$
BEGIN
  DROP POLICY IF EXISTS "Public shopping sessions access" ON public.shopping_sessions;
  CREATE POLICY "Public shopping sessions access" ON public.shopping_sessions
    FOR ALL USING (true) WITH CHECK (true);
  RAISE NOTICE 'Created RLS policy for shopping_sessions table';
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Policy creation skipped or failed: %', SQLERRM;
END $$;

-- 11. Create index for retailer column on list_items (if not exists)
CREATE INDEX IF NOT EXISTS idx_list_items_retailer ON public.list_items(retailer);

-- 12. Create indexes for stores table (if not exist)
CREATE INDEX IF NOT EXISTS idx_stores_user_id ON public.stores(user_id);

-- 13. Create indexes for shopping_sessions table (if not exist)
CREATE INDEX IF NOT EXISTS idx_shopping_sessions_user_id ON public.shopping_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_shopping_sessions_list_id ON public.shopping_sessions(list_id);

-- 14. Update existing RLS policies for grocery_lists to be more permissive
DO $$
BEGIN
  -- Drop old policies
  DROP POLICY IF EXISTS "Users can view own lists or guest lists" ON public.grocery_lists;
  DROP POLICY IF EXISTS "Users can update own lists" ON public.grocery_lists;
  DROP POLICY IF EXISTS "Users can delete own lists" ON public.grocery_lists;
  DROP POLICY IF EXISTS "Anyone can create lists" ON public.grocery_lists;
  
  -- Create simplified policy
  DROP POLICY IF EXISTS "Public grocery lists access" ON public.grocery_lists;
  CREATE POLICY "Public grocery lists access" ON public.grocery_lists
    FOR ALL USING (true) WITH CHECK (true);
  
  RAISE NOTICE 'Updated RLS policies for grocery_lists';
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Policy update skipped or failed: %', SQLERRM;
END $$;

-- 15. Update existing RLS policies for list_items to be more permissive
DO $$
BEGIN
  -- Drop old policies
  DROP POLICY IF EXISTS "Anyone can view list items" ON public.list_items;
  DROP POLICY IF EXISTS "Users can update own list items" ON public.list_items;
  DROP POLICY IF EXISTS "Users can delete own list items" ON public.list_items;
  DROP POLICY IF EXISTS "Anyone can create list items" ON public.list_items;
  
  -- Create simplified policy
  DROP POLICY IF EXISTS "Public list items access" ON public.list_items;
  CREATE POLICY "Public list items access" ON public.list_items
    FOR ALL USING (true) WITH CHECK (true);
  
  RAISE NOTICE 'Updated RLS policies for list_items';
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Policy update skipped or failed: %', SQLERRM;
END $$;

-- 16. Update users table RLS policies
DO $$
BEGIN
  -- Drop old policies
  DROP POLICY IF EXISTS "Users can view own data" ON public.users;
  DROP POLICY IF EXISTS "Users can update own data" ON public.users;
  
  -- Create simplified policy
  DROP POLICY IF EXISTS "Public user access" ON public.users;
  CREATE POLICY "Public user access" ON public.users
    FOR ALL USING (true) WITH CHECK (true);
  
  RAISE NOTICE 'Updated RLS policies for users';
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Policy update skipped or failed: %', SQLERRM;
END $$;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Migration completed successfully!';
  RAISE NOTICE 'All necessary columns and tables have been added.';
  RAISE NOTICE 'You can now use the updated app.';
END $$;

