-- Simple test cycle insert - try this first
-- Run in Supabase SQL Editor

-- Deactivate any existing active cycles
UPDATE cycles SET is_active = false WHERE is_active = true;

-- Try to insert with just the basic fields
-- Adjust the column names based on what actually exists in your database
INSERT INTO cycles (prompt, is_active, date_time)
VALUES (
  'If you could have dinner with any historical figure, who would it be and why?',
  true,
  NOW() + INTERVAL '2 hours'
);

-- Verify
SELECT * FROM cycles WHERE is_active = true;
