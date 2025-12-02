-- Correct SQL for your actual database schema
-- Run this in Supabase SQL Editor

-- Deactivate any existing active cycles
UPDATE cycles SET is_active = false WHERE is_active = true;

-- Insert a new active cycle with the correct column names
INSERT INTO cycles (title, prompt, event_date, is_active)
VALUES (
  'Historical Dinner',
  'If you could have dinner with any historical figure, who would it be and why?',
  NOW() + INTERVAL '2 hours',
  true
);

-- Verify the cycle was created
SELECT * FROM cycles WHERE is_active = true;
