-- Fix the INSERT policy to allow authenticated users to create cycles

-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Authenticated users can insert cycles" ON public.cycles;

-- Create a proper INSERT policy
CREATE POLICY "Authenticated users can insert cycles"
  ON public.cycles FOR INSERT
  WITH CHECK (true);  -- Allow any authenticated user to insert

-- Verify
SELECT policyname, cmd, with_check
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'cycles' AND cmd = 'INSERT';
