-- Fix the posts table to match the code expectations
-- Run this in your Supabase SQL Editor

-- First, let's check what columns exist
SELECT column_name, column_default, is_nullable, data_type
FROM information_schema.columns
WHERE table_name = 'posts'
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Drop columns that shouldn't be there
ALTER TABLE public.posts DROP COLUMN IF EXISTS cycle_id;
ALTER TABLE public.posts DROP COLUMN IF EXISTS is_featured;
ALTER TABLE public.posts DROP COLUMN IF EXISTS updated_at;

-- Verify the posts table structure now matches what Feed.tsx expects
SELECT column_name, column_default, is_nullable, data_type
FROM information_schema.columns
WHERE table_name = 'posts'
AND table_schema = 'public'
ORDER BY ordinal_position;
