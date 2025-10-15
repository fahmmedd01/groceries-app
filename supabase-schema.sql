-- Voice Grocery Assistant Database Schema
-- Run this SQL in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (simplified - no auth dependency)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on users table
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Anyone can create, read, update users (simplified auth)
CREATE POLICY "Public user access" ON public.users
  FOR ALL USING (true) WITH CHECK (true);

-- Grocery lists table
CREATE TABLE IF NOT EXISTS public.grocery_lists (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  status TEXT NOT NULL DEFAULT 'active'
);

-- Enable RLS on grocery_lists table
ALTER TABLE public.grocery_lists ENABLE ROW LEVEL SECURITY;

-- Public access for simplified auth
CREATE POLICY "Public grocery lists access" ON public.grocery_lists
  FOR ALL USING (true) WITH CHECK (true);

-- List items table
CREATE TABLE IF NOT EXISTS public.list_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  list_id UUID REFERENCES public.grocery_lists(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  brand TEXT,
  quantity INTEGER NOT NULL DEFAULT 1,
  size TEXT,
  notes TEXT,
  retailer TEXT NOT NULL DEFAULT 'other',
  order_index INTEGER NOT NULL DEFAULT 0,
  purchased BOOLEAN NOT NULL DEFAULT false,
  purchased_retailer TEXT,
  purchased_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS on list_items table
ALTER TABLE public.list_items ENABLE ROW LEVEL SECURITY;

-- Public access for simplified auth
CREATE POLICY "Public list items access" ON public.list_items
  FOR ALL USING (true) WITH CHECK (true);

-- Stores table
CREATE TABLE IF NOT EXISTS public.stores (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  retailer TEXT NOT NULL,
  address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on stores table
ALTER TABLE public.stores ENABLE ROW LEVEL SECURITY;

-- Public access for simplified auth
CREATE POLICY "Public stores access" ON public.stores
  FOR ALL USING (true) WITH CHECK (true);

-- Shopping sessions table (optional for future use)
CREATE TABLE IF NOT EXISTS public.shopping_sessions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  list_id UUID REFERENCES public.grocery_lists(id) ON DELETE CASCADE NOT NULL,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE,
  notes TEXT
);

-- Enable RLS on shopping_sessions table
ALTER TABLE public.shopping_sessions ENABLE ROW LEVEL SECURITY;

-- Public access for simplified auth
CREATE POLICY "Public shopping sessions access" ON public.shopping_sessions
  FOR ALL USING (true) WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_grocery_lists_user_id ON public.grocery_lists(user_id);
CREATE INDEX IF NOT EXISTS idx_grocery_lists_created_at ON public.grocery_lists(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_list_items_list_id ON public.list_items(list_id);
CREATE INDEX IF NOT EXISTS idx_list_items_order_index ON public.list_items(order_index);
CREATE INDEX IF NOT EXISTS idx_list_items_retailer ON public.list_items(retailer);
CREATE INDEX IF NOT EXISTS idx_stores_user_id ON public.stores(user_id);
CREATE INDEX IF NOT EXISTS idx_shopping_sessions_user_id ON public.shopping_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_shopping_sessions_list_id ON public.shopping_sessions(list_id);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at on grocery_lists
CREATE TRIGGER on_grocery_lists_updated
  BEFORE UPDATE ON public.grocery_lists
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Migration: Add purchased columns to list_items table (if not exists)
-- Run this if you're updating an existing database
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'list_items' 
    AND column_name = 'purchased'
  ) THEN
    ALTER TABLE public.list_items 
    ADD COLUMN purchased BOOLEAN NOT NULL DEFAULT false;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'list_items' 
    AND column_name = 'purchased_retailer'
  ) THEN
    ALTER TABLE public.list_items 
    ADD COLUMN purchased_retailer TEXT;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'list_items' 
    AND column_name = 'purchased_at'
  ) THEN
    ALTER TABLE public.list_items 
    ADD COLUMN purchased_at TIMESTAMP WITH TIME ZONE;
  END IF;
END $$;

-- Migration: Add is_active and status columns to grocery_lists table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'grocery_lists' 
    AND column_name = 'is_active'
  ) THEN
    ALTER TABLE public.grocery_lists 
    ADD COLUMN is_active BOOLEAN NOT NULL DEFAULT true;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'grocery_lists' 
    AND column_name = 'status'
  ) THEN
    ALTER TABLE public.grocery_lists 
    ADD COLUMN status TEXT NOT NULL DEFAULT 'active';
  END IF;
END $$;

-- Migration: Add retailer column to list_items table
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
  END IF;
END $$;

-- Migration: Remove zip_code from grocery_lists if exists
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
  END IF;
END $$;

-- Note: retailer_matches table is deprecated and can be dropped manually if needed
-- DROP TABLE IF EXISTS public.retailer_matches CASCADE;
