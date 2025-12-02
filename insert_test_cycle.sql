-- Run this in your Supabase SQL Editor to create a test cycle
-- Go to: https://supabase.com/dashboard/project/lrkjdoqwkbqwqtgolavi/sql/new

-- First, deactivate any existing active cycles
UPDATE cycles
SET is_active = false
WHERE is_active = true;

-- Insert a new active cycle
-- opt_in_deadline is set to 1 hour from now
-- date_time (the actual dinner/match time) is set to 2 hours from now
INSERT INTO cycles (
  prompt,
  is_active,
  opt_in_deadline,
  date_time
) VALUES (
  'If you could have dinner with any historical figure, who would it be and why?',
  true,
  NOW() + INTERVAL '1 hour',
  NOW() + INTERVAL '2 hours'
);

-- Verify the cycle was created
SELECT * FROM cycles WHERE is_active = true;
