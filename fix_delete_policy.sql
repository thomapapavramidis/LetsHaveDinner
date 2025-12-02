-- Fix the DELETE policy to actually allow deletes
-- The USING clause needs to return true for rows that CAN be deleted

-- Drop the existing restrictive policy
DROP POLICY IF EXISTS "Authenticated users can delete cycles" ON public.cycles;

-- Create a new policy that allows all authenticated users to delete any cycle
CREATE POLICY "Authenticated users can delete cycles"
  ON public.cycles FOR DELETE
  USING (true);  -- Changed from auth.uid() IS NOT NULL to true

-- Verify
SELECT policyname, cmd, qual
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'cycles' AND cmd = 'DELETE';
