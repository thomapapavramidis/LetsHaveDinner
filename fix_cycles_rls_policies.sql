-- Add RLS policies for cycles table to allow admin operations
-- Run this in your Supabase SQL Editor

-- First, check if RLS is enabled
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public' AND tablename = 'cycles';

-- Drop existing restrictive policies if they exist
DROP POLICY IF EXISTS "Anyone can view cycles" ON public.cycles;

-- Create comprehensive policies
CREATE POLICY "Anyone can view cycles"
  ON public.cycles FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert cycles"
  ON public.cycles FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update cycles"
  ON public.cycles FOR UPDATE
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete cycles"
  ON public.cycles FOR DELETE
  USING (auth.uid() IS NOT NULL);

-- Verify policies were created
SELECT schemaname, tablename, policyname, cmd
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'cycles';
