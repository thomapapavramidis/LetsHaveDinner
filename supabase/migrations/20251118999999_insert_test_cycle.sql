-- Insert a test active cycle for testing the in-cycle UI
-- This creates an active cycle with a prompt and deadline

-- First, deactivate any existing active cycles
UPDATE public.cycles
SET is_active = false
WHERE is_active = true;

-- Insert a new active cycle
-- opt_in_deadline is set to 1 hour from now
-- date_time (the actual dinner/match time) is set to 2 hours from now
INSERT INTO public.cycles (
  prompt,
  is_active,
  opt_in_deadline,
  date_time,
  created_at
) VALUES (
  'If you could have dinner with any historical figure, who would it be and why?',
  true,
  NOW() + INTERVAL '1 hour',
  NOW() + INTERVAL '2 hours',
  NOW()
);
