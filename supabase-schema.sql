-- Voice Grocery Assistant Database Schema
-- Run this SQL in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  default_zip_code TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on users table
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Users can only read their own data
CREATE POLICY "Users can view own data" ON public.users
  FOR SELECT USING (auth.uid() = id);

-- Users can update their own data
CREATE POLICY "Users can update own data" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- Grocery lists table
CREATE TABLE IF NOT EXISTS public.grocery_lists (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  zip_code TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  status TEXT NOT NULL DEFAULT 'active'
);

-- Enable RLS on grocery_lists table
ALTER TABLE public.grocery_lists ENABLE ROW LEVEL SECURITY;

-- Anyone can create a list (guests included)
CREATE POLICY "Anyone can create lists" ON public.grocery_lists
  FOR INSERT WITH CHECK (true);

-- Users can view their own lists, and anyone can view guest lists
CREATE POLICY "Users can view own lists or guest lists" ON public.grocery_lists
  FOR SELECT USING (
    auth.uid() = user_id OR user_id IS NULL
  );

-- Users can update their own lists
CREATE POLICY "Users can update own lists" ON public.grocery_lists
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own lists
CREATE POLICY "Users can delete own lists" ON public.grocery_lists
  FOR DELETE USING (auth.uid() = user_id);

-- List items table
CREATE TABLE IF NOT EXISTS public.list_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  list_id UUID REFERENCES public.grocery_lists(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  brand TEXT,
  quantity INTEGER NOT NULL DEFAULT 1,
  size TEXT,
  notes TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  purchased BOOLEAN NOT NULL DEFAULT false,
  purchased_retailer TEXT,
  purchased_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS on list_items table
ALTER TABLE public.list_items ENABLE ROW LEVEL SECURITY;

-- Anyone can insert items (for guest lists)
CREATE POLICY "Anyone can create list items" ON public.list_items
  FOR INSERT WITH CHECK (true);

-- Anyone can view items for their lists or guest lists
CREATE POLICY "Anyone can view list items" ON public.list_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.grocery_lists
      WHERE grocery_lists.id = list_items.list_id
      AND (grocery_lists.user_id = auth.uid() OR grocery_lists.user_id IS NULL)
    )
  );

-- Users can update items in their lists
CREATE POLICY "Users can update own list items" ON public.list_items
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.grocery_lists
      WHERE grocery_lists.id = list_items.list_id
      AND grocery_lists.user_id = auth.uid()
    )
  );

-- Users can delete items from their lists
CREATE POLICY "Users can delete own list items" ON public.list_items
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.grocery_lists
      WHERE grocery_lists.id = list_items.list_id
      AND grocery_lists.user_id = auth.uid()
    )
  );

-- Retailer matches table
CREATE TABLE IF NOT EXISTS public.retailer_matches (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  list_item_id UUID REFERENCES public.list_items(id) ON DELETE CASCADE NOT NULL,
  retailer TEXT NOT NULL,
  title TEXT NOT NULL,
  brand TEXT NOT NULL,
  size TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  stock_status TEXT NOT NULL,
  product_url TEXT NOT NULL,
  image_url TEXT NOT NULL
);

-- Enable RLS on retailer_matches table
ALTER TABLE public.retailer_matches ENABLE ROW LEVEL SECURITY;

-- Anyone can insert retailer matches
CREATE POLICY "Anyone can create retailer matches" ON public.retailer_matches
  FOR INSERT WITH CHECK (true);

-- Anyone can view retailer matches for accessible lists
CREATE POLICY "Anyone can view retailer matches" ON public.retailer_matches
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.list_items
      JOIN public.grocery_lists ON grocery_lists.id = list_items.list_id
      WHERE list_items.id = retailer_matches.list_item_id
      AND (grocery_lists.user_id = auth.uid() OR grocery_lists.user_id IS NULL)
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_grocery_lists_user_id ON public.grocery_lists(user_id);
CREATE INDEX IF NOT EXISTS idx_grocery_lists_created_at ON public.grocery_lists(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_list_items_list_id ON public.list_items(list_id);
CREATE INDEX IF NOT EXISTS idx_list_items_order_index ON public.list_items(order_index);
CREATE INDEX IF NOT EXISTS idx_retailer_matches_list_item_id ON public.retailer_matches(list_item_id);
CREATE INDEX IF NOT EXISTS idx_retailer_matches_retailer ON public.retailer_matches(retailer);

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

-- Function to create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create user profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

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
