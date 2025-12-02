-- Add missing columns to the posts table
-- Run this in your Supabase SQL Editor

-- Add image_url column (nullable)
ALTER TABLE public.posts
ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Verify the columns now
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'posts'
AND table_schema = 'public'
ORDER BY ordinal_position;
